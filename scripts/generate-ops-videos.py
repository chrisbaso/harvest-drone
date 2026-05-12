from pathlib import Path
import math
import textwrap

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont


OUT_DIR = Path("public/training-videos/ops/generated")
WIDTH = 1280
HEIGHT = 720
FPS = 12
DURATION_SECONDS = 10
FRAME_COUNT = FPS * DURATION_SECONDS
VIDEO_EXTENSION = "webm"
VIDEO_FOURCC = "VP80"

COLORS = {
    "bg": (12, 15, 10),
    "surface": (21, 26, 18),
    "panel": (26, 32, 21),
    "panel_alt": (32, 38, 27),
    "text": (232, 230, 225),
    "muted": (138, 144, 125),
    "green": (163, 217, 119),
    "blue": (105, 175, 255),
    "amber": (251, 191, 36),
    "line": (58, 66, 48),
}

FONT_DIR = Path("C:/Windows/Fonts")
DISPLAY_FONT = FONT_DIR / "georgia.ttf"
BODY_FONT = FONT_DIR / "segoeui.ttf"
BODY_BOLD_FONT = FONT_DIR / "segoeuib.ttf"


WORKFLOWS = [
    {
        "id": "ops-01-lead-to-job",
        "category": "Lead intake",
        "title": "Lead to Ops Job",
        "outcome": "Turn a qualified grower request into a clean job, field, and next action.",
        "path": "/ops/leads",
        "steps": [
            "Review contact, farm, acres, crop, timing, and SOURCE interest",
            "Create Ops Job only when the request is real field work",
            "Confirm client, farm, field, service, and notes",
            "Leave unscheduled until timing and product details are credible",
        ],
    },
    {
        "id": "ops-02-new-job-from-call",
        "category": "Fast job creation",
        "title": "New Job From A Call",
        "outcome": "Capture enough detail to make dispatch easy without slowing down the conversation.",
        "path": "/ops/jobs/new",
        "steps": [
            "Add or select the grower",
            "Capture farm, field, acres, crop, service, and requested timing",
            "Add staging, access, product, weather, and water details when known",
            "Create the job and finish scheduling from the job detail page",
        ],
    },
    {
        "id": "ops-03-schedule-and-assign",
        "category": "Dispatch",
        "title": "Schedule And Assign",
        "outcome": "Put work on the calendar, assign ownership, and catch readiness issues early.",
        "path": "/ops/schedule",
        "steps": [
            "Review Today, This Week, and Unscheduled jobs",
            "Pick a start time and assign an operator",
            "Use readiness warnings to catch missing details",
            "Confirm loadout and weather before the day is locked",
        ],
    },
    {
        "id": "ops-04-operator-field-work",
        "category": "Operator view",
        "title": "Run Work In The Field",
        "outcome": "Give operators the field context, checklist, and status controls they need.",
        "path": "/operator/jobs",
        "steps": [
            "Open My Jobs and choose today's assigned job",
            "Review grower contact, staging, access, product, weather, and loadout",
            "Complete checklist items before launch",
            "Update status and mark complete after closeout notes are captured",
        ],
    },
    {
        "id": "ops-05-billing-handoff",
        "category": "Closeout",
        "title": "Billing Handoff",
        "outcome": "Move completed work into Jobber or QuickBooks without building accounting here.",
        "path": "/ops/billing",
        "steps": [
            "Review completed and invoice-needed jobs",
            "Confirm acres, estimate, Jobber reference, and missing details",
            "Flag invoice needed when work is ready for external billing",
            "Close the job after Jobber or QuickBooks handoff is finished",
        ],
    },
    {
        "id": "ops-06-daily-agent",
        "category": "Daily review",
        "title": "Daily Ops Agent",
        "outcome": "Use the morning brief to find priority follow-ups before the day gets noisy.",
        "path": "/ops/daily-agent",
        "steps": [
            "Scan priority items and recommended moves",
            "Review Jobber loops, email follow-ups, SMS replies, and calendar items",
            "Open loops when follow-up needs tracking",
            "Regenerate the brief after integrations or open loops change",
        ],
    },
]


def font(path, size):
    if path.exists():
        return ImageFont.truetype(str(path), size=size)
    return ImageFont.load_default()


FONTS = {
    "display": font(DISPLAY_FONT, 66),
    "display_small": font(DISPLAY_FONT, 54),
    "body": font(BODY_FONT, 30),
    "body_small": font(BODY_FONT, 23),
    "bold": font(BODY_BOLD_FONT, 27),
    "label": font(BODY_BOLD_FONT, 20),
    "mono": font(BODY_BOLD_FONT, 18),
}


def ease_out(t):
    return 1 - (1 - t) ** 3


def ease_in_out(t):
    return 0.5 - 0.5 * math.cos(math.pi * max(0, min(1, t)))


def draw_wrapped(draw, text, xy, font_obj, fill, max_chars, line_gap=8):
    x, y = xy
    for line in textwrap.wrap(text, width=max_chars):
        draw.text((x, y), line, font=font_obj, fill=fill)
        bbox = draw.textbbox((x, y), line, font=font_obj)
        y += (bbox[3] - bbox[1]) + line_gap
    return y


def rounded_rect(draw, xy, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def scene_step_index(progress, step_count):
    step_progress = min(max((progress - 0.22) / 0.62, 0), 1)
    return min(step_count - 1, int(math.floor(step_progress * step_count)))


def draw_route_chip(draw, path, progress):
    chip_w = 270
    chip_h = 46
    x = WIDTH - chip_w - 76
    y = HEIGHT - 78
    alpha = int(255 * ease_out(min(max((progress - 0.08) / 0.18, 0), 1)))
    rounded_rect(draw, (x, y, x + chip_w, y + chip_h), 23, (*COLORS["surface"], alpha), (*COLORS["line"], alpha), 2)
    draw.text((x + 20, y + 13), path, font=FONTS["mono"], fill=(*COLORS["text"], alpha))


def make_frame(workflow, frame_index):
    progress = frame_index / max(FRAME_COUNT - 1, 1)
    appear = ease_out(min(progress / 0.18, 1))
    active_step = scene_step_index(progress, len(workflow["steps"]))

    img = Image.new("RGB", (WIDTH, HEIGHT), COLORS["bg"])
    draw = ImageDraw.Draw(img, "RGBA")

    for radius, alpha, x, y in [(380, 34, 210, 120), (260, 26, 1020, 120), (500, 14, 960, 720)]:
        pulse = 0.85 + 0.15 * math.sin((progress * math.pi * 2) + x / 200)
        r = int(radius * pulse)
        draw.ellipse((x - r, y - r, x + r, y + r), fill=(*COLORS["green"], alpha))

    draw.rectangle((0, 0, WIDTH, HEIGHT), fill=(12, 15, 10, 188))

    slide = int((1 - appear) * 36)
    draw.text((76, 60 + slide), "HARVEST DRONE OPS", font=FONTS["label"], fill=(*COLORS["green"], int(255 * appear)))
    draw.text((76, 91 + slide), workflow["category"].upper(), font=FONTS["mono"], fill=(*COLORS["muted"], int(255 * appear)))

    title_font = FONTS["display"] if len(workflow["title"]) <= 24 else FONTS["display_small"]
    title_end = draw_wrapped(draw, workflow["title"], (74, 138 + slide), title_font, (*COLORS["text"], int(255 * appear)), 20, 2)
    draw_wrapped(draw, workflow["outcome"], (80, title_end + 18), FONTS["body"], (*COLORS["text"], int(225 * appear)), 42, 10)

    panel_x = 690
    panel_y = 72
    panel_w = 510
    panel_h = 536
    rounded_rect(draw, (panel_x, panel_y, panel_x + panel_w, panel_y + panel_h), 24, (*COLORS["panel"], 242), (*COLORS["line"], 255), 2)
    draw.text((panel_x + 34, panel_y + 30), "Workflow steps", font=FONTS["display_small"], fill=COLORS["text"])
    draw.text((panel_x + 36, panel_y + 96), "Use this as the operating path.", font=FONTS["body_small"], fill=COLORS["muted"])

    y = panel_y + 146
    for index, step in enumerate(workflow["steps"]):
        is_active = index <= active_step
        local_start = 0.22 + (index / len(workflow["steps"])) * 0.62
        step_appear = ease_out(min(max((progress - local_start) / 0.12, 0), 1))
        offset = int((1 - step_appear) * 18)
        fill = (*COLORS["panel_alt"], 255) if not is_active else (*COLORS["green"], 34)
        outline = (*COLORS["green"], 132) if is_active else (*COLORS["line"], 255)
        rounded_rect(draw, (panel_x + 30 + offset, y, panel_x + panel_w - 30 + offset, y + 76), 15, fill, outline, 2)
        dot = COLORS["green"] if is_active else COLORS["line"]
        draw.ellipse((panel_x + 52 + offset, y + 28, panel_x + 72 + offset, y + 48), fill=dot)
        draw.text((panel_x + 84 + offset, y + 22), f"{index + 1}", font=FONTS["label"], fill=COLORS["bg"] if is_active else COLORS["muted"])
        draw_wrapped(draw, step, (panel_x + 122 + offset, y + 15), FONTS["body_small"], COLORS["text"], 37, 2)
        y += 88

    meter_x = 78
    meter_y = HEIGHT - 92
    meter_w = 510
    rounded_rect(draw, (meter_x, meter_y, meter_x + meter_w, meter_y + 12), 6, (255, 255, 255, 22))
    rounded_rect(draw, (meter_x, meter_y, meter_x + int(meter_w * progress), meter_y + 12), 6, COLORS["green"])
    draw.text((80, HEIGHT - 58), "Internal workflow video", font=FONTS["label"], fill=COLORS["muted"])

    draw_route_chip(draw, workflow["path"], progress)

    if progress > 0.84:
        outro = ease_in_out((progress - 0.84) / 0.16)
        draw.rectangle((0, 0, WIDTH, HEIGHT), fill=(12, 15, 10, int(165 * outro)))
        draw.text((80, 600), "Next step: open the route and run the workflow.", font=FONTS["bold"], fill=(*COLORS["text"], int(255 * outro)))

    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)


def render_workflow(workflow):
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    output = OUT_DIR / f"{workflow['id']}.{VIDEO_EXTENSION}"
    writer = cv2.VideoWriter(str(output), cv2.VideoWriter_fourcc(*VIDEO_FOURCC), FPS, (WIDTH, HEIGHT))
    if not writer.isOpened():
        raise RuntimeError(f"Could not open video writer for {output}")

    for frame_index in range(FRAME_COUNT):
        writer.write(make_frame(workflow, frame_index))
    writer.release()
    print(output)


def main():
    for workflow in WORKFLOWS:
        render_workflow(workflow)


if __name__ == "__main__":
    main()
