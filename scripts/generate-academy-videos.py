from pathlib import Path
import math
import textwrap

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont


OUT_DIR = Path("public/training-videos/academy/generated")
WIDTH = 1280
HEIGHT = 720
FPS = 12
DURATION_SECONDS = 8
FRAME_COUNT = FPS * DURATION_SECONDS
VIDEO_EXTENSION = "webm"
VIDEO_FOURCC = "VP80"

COLORS = {
    "bg": (12, 15, 10),
    "surface": (21, 26, 18),
    "panel": (26, 32, 21),
    "text": (232, 230, 225),
    "muted": (138, 144, 125),
    "green": (163, 217, 119),
    "amber": (251, 191, 36),
    "line": (58, 66, 48),
}

FONT_DIR = Path("C:/Windows/Fonts")
DISPLAY_FONT = FONT_DIR / "georgia.ttf"
BODY_FONT = FONT_DIR / "segoeui.ttf"
BODY_BOLD_FONT = FONT_DIR / "segoeuib.ttf"


LESSONS = [
    {
        "id": "academy-start-here-1",
        "category": "Harvest Drone OS Academy",
        "title": "How the Academy works",
        "outcome": "Training is tied to a named pilot record and becomes part of mission readiness.",
        "beats": [
            "Watch the briefing",
            "Review the written operating standard",
            "Pass verification before unlocking the next step",
        ],
    },
    {
        "id": "academy-start-here-2",
        "category": "Certification path",
        "title": "Your certification path",
        "outcome": "Move from Not Started to In Progress, Ready for Field Review, and Certified with evidence.",
        "beats": ["In Progress is not field-ready", "Field Review requires a human reviewer", "Certification never bypasses live mission gates"],
    },
    {
        "id": "academy-operator-foundations-1",
        "category": "Operator foundations",
        "title": "Harvest Drone operating model",
        "outcome": "Training is an operating control and every pilot has stop-work responsibility.",
        "beats": ["Complete assigned modules before field work", "Stop when conditions are unclear", "Document decisions in the platform"],
    },
    {
        "id": "academy-operator-foundations-2",
        "category": "Operator foundations",
        "title": "Compliance foundations",
        "outcome": "Aviation, pesticide, insurance, and evidence requirements must be checked before assignment.",
        "beats": ["Part 107 and pesticide credentials stay current", "Aircraft registration and Remote ID are visible", "Credential proof is reviewed before field work"],
    },
    {
        "id": "academy-operator-foundations-3",
        "category": "Operator foundations",
        "title": "Aircraft and GroundLink overview",
        "outcome": "The aircraft must be in a known safe state and the mission plan must match the field.",
        "beats": ["Inspect aircraft state", "Confirm GroundLink mission setup", "Use official Hylio references for hardware specifics"],
    },
    {
        "id": "academy-drone-safety-1",
        "category": "Drone safety",
        "title": "Commercial drone operating rules",
        "outcome": "Commercial agricultural UAS work requires current pilot, aircraft, and site controls.",
        "beats": ["Part 107 must be current", "Registration and Remote ID must be known", "Airspace, people, obstacles, and emergency areas are reviewed"],
    },
    {
        "id": "academy-drone-safety-2",
        "category": "Drone safety",
        "title": "Pre-flight checklist discipline",
        "outcome": "The pre-flight checklist is the mission-specific launch control.",
        "beats": ["Checklist must match this aircraft and field", "Failed items are corrected or escalated", "No complete pre-flight checklist means no launch"],
    },
    {
        "id": "academy-drone-safety-3",
        "category": "Drone safety",
        "title": "Emergency stop-work criteria",
        "outcome": "Know when to pause, land, isolate the area, and escalate.",
        "beats": ["Stop for people, weather, aircraft uncertainty, or product constraints", "Protect people and land safely when possible", "Preserve logs, photos, weather, and notes"],
    },
    {
        "id": "academy-field-ops-1",
        "category": "Field operations",
        "title": "Field mapping and boundaries",
        "outcome": "Field maps show where the drone should work and where it must not work.",
        "beats": ["Confirm acres, edges, and no-spray areas", "Mark obstacles, roads, water, people, and livestock", "Program buffers and sensitive areas"],
    },
    {
        "id": "academy-field-ops-2",
        "category": "Field operations",
        "title": "Weather and drift review",
        "outcome": "Weather and drift risk are evaluated before and during application.",
        "beats": ["Record wind, gusts, temperature, humidity, and precipitation", "Wind direction can make safe speeds unsafe", "Changing conditions can stop the mission mid-field"],
    },
    {
        "id": "academy-field-ops-3",
        "category": "Field operations",
        "title": "Application closeout",
        "outcome": "Closeout creates the flight, weather, product, anomaly, and inspection record.",
        "beats": ["Record acres, duration, product, rate, and timing", "Log skipped areas, runout, and mechanical issues", "Inspect the aircraft before it returns to available status"],
    },
    {
        "id": "academy-source-1",
        "category": "SOURCE education",
        "title": "SOURCE mode of action",
        "outcome": "Explain SOURCE field fit without making unsupported agronomy claims.",
        "beats": ["Understand field fit and timing", "Route technical agronomy questions to specialists", "Connect education to acre review and application planning"],
    },
    {
        "id": "academy-source-2",
        "category": "SOURCE education",
        "title": "Sample and acre review workflow",
        "outcome": "Acre reviews become clear next actions before field work.",
        "beats": ["Capture grower, acres, crop, timing, owner, and follow-up", "Route to educate, quote, schedule, apply, or follow up", "Ambiguous requests should not become missions"],
    },
    {
        "id": "academy-enterprise-1",
        "category": "Enterprise playbooks",
        "title": "Enterprise drone division operating model",
        "outcome": "Enterprise drone work requires visible fleet, pilot, mission, compliance, and support lanes.",
        "beats": ["Aircraft status and maintenance are visible", "Training and credentials are tied to operators", "Blocked work and exceptions are reportable"],
    },
    {
        "id": "academy-enterprise-2",
        "category": "Enterprise playbooks",
        "title": "RDO pilot rollout checklist",
        "outcome": "An enterprise pilot rollout should scale only after the workflow is repeatable.",
        "beats": ["Confirm pilots, aircraft, fields, product windows, and records", "Start small with daily review and logged blockers", "Expand after assignment, launch, closeout, and reporting work"],
    },
    {
        "id": "academy-sop-1",
        "category": "SOP library",
        "title": "Core SOP review",
        "outcome": "Operators should know which SOP controls each phase of field operations.",
        "beats": ["Pre-flight, weather, chemical, and battery SOPs apply before launch", "Drift, emergency, and communication standards apply during work", "Post-flight and compliance closeout apply after landing"],
    },
    {
        "id": "academy-certification-1",
        "category": "Certification",
        "title": "Certification readiness review",
        "outcome": "Certification requires training, credential, and field review evidence.",
        "beats": ["Required lessons and checks must be complete", "Licenses and approvals must be current", "Certification does not bypass aircraft, weather, or checklist gates"],
    },
]


def font(path, size):
    if path.exists():
        return ImageFont.truetype(str(path), size=size)
    return ImageFont.load_default()


FONTS = {
    "display": font(DISPLAY_FONT, 70),
    "display_small": font(DISPLAY_FONT, 56),
    "body": font(BODY_FONT, 30),
    "body_small": font(BODY_FONT, 24),
    "bold": font(BODY_BOLD_FONT, 28),
    "label": font(BODY_BOLD_FONT, 20),
}


def ease_out(t):
    return 1 - (1 - t) ** 3


def draw_wrapped(draw, text, xy, font_obj, fill, max_chars, line_gap=8):
    x, y = xy
    for line in textwrap.wrap(text, width=max_chars):
        draw.text((x, y), line, font=font_obj, fill=fill)
        bbox = draw.textbbox((x, y), line, font=font_obj)
        y += (bbox[3] - bbox[1]) + line_gap
    return y


def rounded_rect(draw, xy, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def make_frame(lesson, frame_index):
    progress = frame_index / max(FRAME_COUNT - 1, 1)
    appear = ease_out(min(progress / 0.18, 1))
    beat_progress = min(max((progress - 0.34) / 0.46, 0), 1)
    active_beats = min(3, int(math.floor(beat_progress * 3.2)))

    img = Image.new("RGB", (WIDTH, HEIGHT), COLORS["bg"])
    draw = ImageDraw.Draw(img, "RGBA")

    for radius, alpha, x, y in [(360, 38, 210, 140), (260, 28, 1010, 90), (420, 18, 850, 700)]:
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=(*COLORS["green"], alpha))

    draw.rectangle((0, 0, WIDTH, HEIGHT), fill=(12, 15, 10, 185))

    slide = int((1 - appear) * 34)
    draw.text((78, 70 + slide), lesson["category"].upper(), font=FONTS["label"], fill=(*COLORS["green"], int(255 * appear)))

    title_font = FONTS["display"] if len(lesson["title"]) < 34 else FONTS["display_small"]
    title_y = 122 + slide
    title_end = draw_wrapped(draw, lesson["title"], (76, title_y), title_font, (*COLORS["text"], int(255 * appear)), 20, 2)

    draw_wrapped(draw, lesson["outcome"], (80, title_end + 20), FONTS["body"], (*COLORS["text"], int(220 * appear)), 43, 10)

    panel_x = 736
    panel_y = 94
    panel_w = 466
    panel_h = 500
    rounded_rect(draw, (panel_x, panel_y, panel_x + panel_w, panel_y + panel_h), 22, (*COLORS["panel"], 238), (*COLORS["line"], 255), 2)
    draw.text((panel_x + 30, panel_y + 28), "Completion gate", font=FONTS["display_small"], fill=COLORS["text"])
    draw.text((panel_x + 32, panel_y + 98), "Watch. Read. Verify.", font=FONTS["body_small"], fill=COLORS["muted"])

    y = panel_y + 160
    for index, beat in enumerate(lesson["beats"]):
        is_active = index < active_beats
        fill = (*COLORS["surface"], 255) if not is_active else (*COLORS["green"], 35)
        outline = (*COLORS["green"], 120) if is_active else (*COLORS["line"], 255)
        rounded_rect(draw, (panel_x + 28, y, panel_x + panel_w - 28, y + 82), 14, fill, outline, 2)
        dot_color = COLORS["green"] if is_active else COLORS["line"]
        draw.ellipse((panel_x + 48, y + 30, panel_x + 68, y + 50), fill=dot_color)
        draw_wrapped(draw, beat, (panel_x + 86, y + 19), FONTS["body_small"], COLORS["text"], 34, 3)
        y += 98

    bar_x = 80
    bar_y = HEIGHT - 76
    bar_w = WIDTH - 160
    rounded_rect(draw, (bar_x, bar_y, bar_x + bar_w, bar_y + 12), 6, (255, 255, 255, 20))
    rounded_rect(draw, (bar_x, bar_y, bar_x + int(bar_w * progress), bar_y + 12), 6, COLORS["green"])
    draw.text((80, HEIGHT - 46), "Harvest Drone OS Academy", font=FONTS["label"], fill=COLORS["muted"])
    draw.text((WIDTH - 284, HEIGHT - 46), "Pilot training evidence", font=FONTS["label"], fill=COLORS["muted"])

    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)


def render_lesson(lesson):
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    output = OUT_DIR / f"{lesson['id']}.{VIDEO_EXTENSION}"
    writer = cv2.VideoWriter(str(output), cv2.VideoWriter_fourcc(*VIDEO_FOURCC), FPS, (WIDTH, HEIGHT))
    if not writer.isOpened():
        raise RuntimeError(f"Could not open video writer for {output}")

    for frame_index in range(FRAME_COUNT):
        writer.write(make_frame(lesson, frame_index))
    writer.release()
    print(output)


def main():
    for lesson in LESSONS:
        render_lesson(lesson)


if __name__ == "__main__":
    main()
