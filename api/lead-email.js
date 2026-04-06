import { Resend } from "resend";
import { getCampaign } from "./_lib/dripCampaigns.js";

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

const brand = {
  bg: "#f4f1e8",
  surface: "#fffdf8",
  panel: "#f8f5ec",
  border: "#d8d0bd",
  text: "#18261c",
  muted: "#5f6c63",
  accent: "#2f6b3f",
  accentDark: "#214c2c",
  highlight: "#caa95d",
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

function detailRow(label, value) {
  return `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid ${brand.border}; color: ${brand.muted}; font-size: 13px; width: 42%;">
        ${escapeHtml(label)}
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid ${brand.border}; color: ${brand.text}; font-size: 14px; font-weight: 600;">
        ${escapeHtml(formatValue(value))}
      </td>
    </tr>
  `;
}

function infoCard(title, rows) {
  return `
    <div style="margin: 24px 0; padding: 20px; background: ${brand.panel}; border: 1px solid ${brand.border}; border-radius: 18px;">
      <div style="font-size: 12px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: ${brand.accent}; margin-bottom: 14px;">
        ${escapeHtml(title)}
      </div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
        ${rows.join("")}
      </table>
    </div>
  `;
}

function section(title, body) {
  return `
    <div style="margin: 0 0 24px;">
      <h3 style="margin: 0 0 10px; font-size: 18px; line-height: 1.3; color: ${brand.text};">
        ${escapeHtml(title)}
      </h3>
      <div style="color: ${brand.muted}; font-size: 15px; line-height: 1.7;">
        ${body}
      </div>
    </div>
  `;
}

function bulletList(items) {
  return `
    <ul style="margin: 0; padding-left: 18px; color: ${brand.muted};">
      ${items
        .map(
          (item) =>
            `<li style="margin: 0 0 10px; line-height: 1.6;">${escapeHtml(item)}</li>`,
        )
        .join("")}
    </ul>
  `;
}

function renderEmailShell({ eyebrow, title, intro, sections, footer }) {
  return `
    <div style="margin: 0; padding: 32px 16px; background: ${brand.bg}; font-family: Arial, Helvetica, sans-serif;">
      <div style="max-width: 640px; margin: 0 auto; background: ${brand.surface}; border: 1px solid ${brand.border}; border-radius: 28px; overflow: hidden; box-shadow: 0 18px 60px rgba(24, 38, 28, 0.08);">
        <div style="padding: 28px 28px 22px; background: linear-gradient(135deg, ${brand.accentDark} 0%, ${brand.accent} 72%, ${brand.highlight} 100%); color: white;">
          <div style="font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.86; margin-bottom: 14px;">
            ${escapeHtml(eyebrow)}
          </div>
          <div style="font-size: 30px; line-height: 1.2; font-weight: 700; max-width: 520px;">
            ${escapeHtml(title)}
          </div>
          <div style="margin-top: 14px; max-width: 520px; font-size: 15px; line-height: 1.7; color: rgba(255, 255, 255, 0.92);">
            ${escapeHtml(intro)}
          </div>
        </div>
        <div style="padding: 28px;">
          ${sections.join("")}
          <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid ${brand.border}; color: ${brand.muted}; font-size: 13px; line-height: 1.7;">
            ${footer}
          </div>
        </div>
      </div>
    </div>
  `;
}

function buildGrowerConfirmation(payload) {
  const fullName = [payload.firstName, payload.lastName].filter(Boolean).join(" ");

  return {
    subject: "Your Harvest Drone acreage request is in review",
    html: renderEmailShell({
      eyebrow: "Harvest Drone | Grower Intake",
      title: `Thanks${fullName ? `, ${fullName}` : ""}. Your acreage request is in motion.`,
      intro:
        "Your request is in review. We are looking at acreage fit, timing, and where Harvest Drone can create the clearest upside in profitability, simplicity, and confidence.",
      sections: [
        section(
          "What happens next",
          bulletList([
            "We review your acreage profile, crop mix, and operating priorities.",
            "We assess where spraying support, acreage review, or partner-backed recommendations may create the most value.",
            "If there is a strong fit, we follow up with a practical next step rather than a generic sales sequence.",
          ]),
        ),
        section(
          "What we are evaluating",
          bulletList([
            "Acres where speed, access, or responsiveness can improve outcomes.",
            "Situations where a clearer agronomic or economic decision would help move faster.",
            "Partnership opportunities where service, Sound Ag upside, and future tools can work together.",
          ]),
        ),
        infoCard("Submitted farm details", [
          detailRow("Farm", payload.farmName),
          detailRow("State", payload.state),
          detailRow("County", payload.county),
          detailRow("Crop type", payload.cropType),
          detailRow("Estimated acres", payload.acres),
          detailRow("Main interest", payload.interestType),
        ]),
      ],
      footer:
        "Harvest Drone is building a more effective acre-by-acre operating model across direct service, operator fulfillment, and ag input partnerships.",
    }),
  };
}

function buildGrowerTimingFollowUp(payload) {
  return {
    subject: "Where drone timing can change the economics",
    html: renderEmailShell({
      eyebrow: "Harvest Drone | Grower Follow-Up",
      title: "Timing is often where the real value shows up.",
      intro:
        "When windows tighten, labor gets stretched, or field access becomes harder, drone application can become more than a convenience. It can become a speed advantage.",
      sections: [
        section(
          "Why this matters",
          bulletList([
            "Drone crews can move quickly when timing is critical across scattered acres.",
            "Application windows that are hard to hit with traditional equipment can become more manageable.",
            "Faster response can help protect yield, maintain schedules, and reduce operational friction.",
          ]),
        ),
        infoCard("Your submitted profile", [
          detailRow("Farm", payload.farmName),
          detailRow("State", payload.state),
          detailRow("Crop type", payload.cropType),
          detailRow("Estimated acres", payload.acres),
        ]),
      ],
      footer:
        "Harvest Drone reviews each request with acreage fit, timing needs, and operator coverage in mind.",
    }),
  };
}

function buildGrowerFitFollowUp(payload) {
  return {
    subject: "Where drone spraying tends to be the best fit",
    html: renderEmailShell({
      eyebrow: "Harvest Drone | Grower Follow-Up",
      title: "Not every acre needs the same application approach.",
      intro:
        "Some operations see the biggest upside when drone spraying is used selectively, where timing, access, or precision creates a clear advantage.",
      sections: [
        section(
          "Common fit signals",
          bulletList([
            "Fields where access is difficult or conventional timing is hard to maintain.",
            "Acres where responsiveness matters more than broad-volume throughput.",
            "Operations looking to layer application decisions into a wider per-acre strategy.",
          ]),
        ),
        section(
          "What Harvest Drone looks for",
          bulletList([
            "Acreage that can justify premium responsiveness.",
            "Use cases where drone execution supports speed, flexibility, or field conditions.",
            "Opportunities to connect service delivery with agronomic partnership value.",
          ]),
        ),
      ],
      footer:
        "If your acres fit that profile, the follow-up conversation becomes much more actionable.",
    }),
  };
}

function buildGrowerAcreageReviewFollowUp(payload) {
  return {
    subject: "Want a quick acreage review from Harvest Drone?",
    html: renderEmailShell({
      eyebrow: "Harvest Drone | Grower Follow-Up",
      title: "A quick acreage review can clarify where this is worth using.",
      intro:
        "If there is a fit, the fastest next step is a focused acreage review that looks at timing pressure, access constraints, and where drone application can create leverage.",
      sections: [
        section(
          "A review can help surface",
          bulletList([
            "Which acres may be the best candidates for drone spraying.",
            "Where faster response may change the economics or decision quality.",
            "Whether operator coverage and partner-backed recommendations are worth exploring next.",
          ]),
        ),
        infoCard("Current request snapshot", [
          detailRow("Farm", payload.farmName),
          detailRow("State", payload.state),
          detailRow("Estimated acres", payload.acres),
          detailRow("Current spraying method", payload.sprayingMethod),
        ]),
      ],
      footer:
        "Reply to the Harvest Drone team when you are ready to review where this may fit best.",
    }),
  };
}

function buildGrowerFinalFollowUp(payload) {
  return {
    subject: "Final check-in on your Harvest Drone request",
    html: renderEmailShell({
      eyebrow: "Harvest Drone | Grower Follow-Up",
      title: "One last check-in before we close the loop.",
      intro:
        "We wanted to send a final note in case drone spraying, acreage review, or partner-backed recommendations are still worth exploring for your operation.",
      sections: [
        section(
          "If this is still relevant",
          bulletList([
            "We can look at where timing and field access create the strongest fit.",
            "We can assess whether acreage review is worth a closer conversation.",
            "We can keep the discussion focused on practical next steps instead of theory.",
          ]),
        ),
        infoCard("Submitted request", [
          detailRow("Farm", payload.farmName),
          detailRow("State", payload.state),
          detailRow("Crop type", payload.cropType),
        ]),
      ],
      footer:
        "If priorities have shifted, no problem. Harvest Drone will pause outreach unless you re-engage later.",
    }),
  };
}

function buildOperatorConfirmation(payload) {
  const fullName = [payload.firstName, payload.lastName].filter(Boolean).join(" ");

  return {
    subject: "Your Harvest Drone operator profile is in review",
    html: renderEmailShell({
      eyebrow: "Harvest Drone | Operator Network",
      title: `Thanks${fullName ? `, ${fullName}` : ""}. Your operator profile is in motion.`,
      intro:
        "Your submission is in review. We are evaluating geography, acreage capacity, compliance, and business fit to see where your operation can plug into the Harvest Drone network.",
      sections: [
        section(
          "What happens next",
          bulletList([
            "We review your territory, equipment profile, and acreage capacity.",
            "We assess where Harvest Drone may be able to open up routed acreage, stronger utilization, or territory expansion.",
            "If aligned, we follow up with a practical network-growth conversation, not a generic application process.",
          ]),
        ),
        section(
          "What we are evaluating",
          bulletList([
            "Operators, dealers, and ag businesses with real territory coverage and usable capacity.",
            "Partners who can support fulfillment quality as routed grower demand scales.",
            "Businesses that can turn existing acres, territory, or relationships into recurring opportunity.",
          ]),
        ),
        infoCard("Submitted operator details", [
          detailRow("Company", payload.companyName),
          detailRow("State", payload.state),
          detailRow("Counties served", payload.countiesServed),
          detailRow("Equipment details", payload.equipmentDetails),
          detailRow("Licensing / compliance", payload.complianceStatus),
          detailRow("Acreage capacity", payload.weeklyCapacity),
        ]),
      ],
      footer:
        "Harvest Drone is building a modern operator network designed to unlock recurring acreage revenue, stronger utilization, and durable regional growth.",
    }),
  };
}

function buildOperatorFitFollowUp(payload) {
  return {
    subject: "What Harvest Drone looks for in operators",
    html: renderEmailShell({
      eyebrow: "Harvest Drone | Operator Follow-Up",
      title: "Readiness matters more than simply being on a list.",
      intro:
        "Harvest Drone reviews operator profiles with an eye toward real fulfillment quality, regional strength, and whether the operation is positioned to support demand as it builds.",
      sections: [
        section(
          "What stands out",
          bulletList([
            "Strong territory coverage and clear service radius.",
            "Application readiness, licensing, and dependable execution capacity.",
            "A profile that can support routing quality as grower demand comes in.",
          ]),
        ),
        infoCard("Your submitted profile", [
          detailRow("Company", payload.companyName),
          detailRow("State", payload.state),
          detailRow("Service radius", payload.serviceRadius),
          detailRow("Acres capacity per week", payload.weeklyCapacity),
        ]),
      ],
      footer:
        "The strongest operator profiles combine readiness, territory quality, and the ability to scale with demand.",
    }),
  };
}

function buildOperatorCapacityFollowUp(payload) {
  return {
    subject: "Equipment, readiness, and capacity matter",
    html: renderEmailShell({
      eyebrow: "Harvest Drone | Operator Follow-Up",
      title: "Capacity becomes more valuable when the market is matched well.",
      intro:
        "Operators do best in the Harvest Drone model when equipment, coverage, and readiness line up with where grower demand is likely to materialize.",
      sections: [
        section(
          "What we continue to evaluate",
          bulletList([
            "Whether your current fleet and readiness support seasonal demand efficiently.",
            "How your service radius and coverage fit priority markets.",
            "Whether your operation may be better positioned for routing, expansion, or equipment conversations.",
          ]),
        ),
        infoCard("Operator snapshot", [
          detailRow("Company", payload.companyName),
          detailRow("Drone model", payload.droneModel),
          detailRow("Owns spray drone", payload.ownsDrone),
          detailRow("Acres capacity per week", payload.weeklyCapacity),
        ]),
      ],
      footer:
        "The right match is about profitable fit, not just being available.",
    }),
  };
}

function buildOperatorRoutingFollowUp(payload) {
  return {
    subject: "Position your operation for routing opportunities",
    html: renderEmailShell({
      eyebrow: "Harvest Drone | Operator Follow-Up",
      title: "Operators who are easy to place tend to win more opportunities.",
      intro:
        "The more clearly your operation shows coverage, readiness, and usable capacity, the easier it becomes to route work into your market.",
      sections: [
        section(
          "Why this matters",
          bulletList([
            "Routing quality improves when territory and capacity are clearly defined.",
            "Strong profiles are easier to align with grower needs as jobs emerge.",
            "Clear readiness also helps surface the right equipment or expansion conversations.",
          ]),
        ),
        infoCard("Current profile", [
          detailRow("Company", payload.companyName),
          detailRow("State", payload.state),
          detailRow("Service radius", payload.serviceRadius),
          detailRow("Interested in buying a drone", payload.buyingInterest),
        ]),
      ],
      footer:
        "Harvest Drone is building toward a tighter operator network, not just a larger one.",
    }),
  };
}

function buildOperatorFinalFollowUp(payload) {
  return {
    subject: "Final check-in on your Harvest Drone profile",
    html: renderEmailShell({
      eyebrow: "Harvest Drone | Operator Follow-Up",
      title: "One last check-in before we close the loop.",
      intro:
        "We wanted to send a final note in case you still want to be considered for routing opportunities, territory expansion, or a spray-drone equipment conversation.",
      sections: [
        section(
          "If this is still relevant",
          bulletList([
            "We can continue reviewing your profile for market fit and fulfillment quality.",
            "We can evaluate whether your operation is positioned for routing opportunities.",
            "We can also steer the conversation toward equipment if that is the better path.",
          ]),
        ),
        infoCard("Submitted profile", [
          detailRow("Company", payload.companyName),
          detailRow("State", payload.state),
          detailRow("Service radius", payload.serviceRadius),
        ]),
      ],
      footer:
        "If priorities have shifted, no problem. Harvest Drone will pause outreach unless you re-engage later.",
    }),
  };
}

function buildHylioConfirmation(payload) {
  return {
    subject: "Your Hylio opportunity request is in review",
    html: renderEmailShell({
      eyebrow: "Harvest Drone | Hylio Opportunity",
      title: "Your Hylio opportunity request is in review.",
      intro:
        "We are reviewing your territory, acreage access, experience level, and budget range to see whether this is a strong fit for a Hylio drone conversation.",
      sections: [
        section(
          "What happens next",
          bulletList([
            "We review your area and the revenue potential tied to acreage in your market.",
            "We look at whether a Hylio drone fits your business model, not just whether you like the equipment.",
            "If the fit is strong, we follow up to walk through the opportunity directly.",
          ]),
        ),
        infoCard("Submitted opportunity details", [
          detailRow("Name", payload.name || payload.fullName),
          detailRow("State", payload.state),
          detailRow("Counties", payload.countiesServed),
          detailRow("Acreage access", payload.acreageAccess),
          detailRow("Experience level", payload.experienceLevel),
          detailRow("Budget range", payload.budgetRange),
        ]),
      ],
      footer:
        "Harvest Drone positions Hylio as a revenue-producing asset for operators, ag service businesses, and entrepreneurs who want to build recurring acreage income.",
    }),
  };
}

function buildHylioBusinessModelFollowUp(payload) {
  return {
    subject: "Why the Hylio model is built around recurring acreage revenue",
    html: renderEmailShell({
      eyebrow: "Harvest Drone | Hylio Follow-Up",
      title: "The Hylio opportunity is about recurring acreage revenue.",
      intro:
        "The real value is not owning a drone. The value is using the drone to generate repeatable income tied to acres, application, and input opportunity.",
      sections: [
        section(
          "What changes with the right model",
          bulletList([
            "You can build income around repeat acreage instead of one-off jobs.",
            "The drone becomes part of a revenue engine, not just a tool purchase.",
            "Territory, access, and recurring demand matter more than product specs.",
          ]),
        ),
        infoCard("Your request", [
          detailRow("State", payload.state),
          detailRow("Counties", payload.countiesServed),
          detailRow("Acreage access", payload.acreageAccess),
        ]),
      ],
      footer:
        "Harvest Drone uses Hylio conversations to qualify whether the revenue model fits the territory.",
    }),
  };
}

function buildHylioRoiFollowUp(payload) {
  return {
    subject: "How operators think about Hylio ROI",
    html: renderEmailShell({
      eyebrow: "Harvest Drone | Hylio Follow-Up",
      title: "The ROI conversation should stay simple.",
      intro:
        "A Hylio drone can make sense when it opens up recurring acreage revenue, application income, and input upside across the same territory.",
      sections: [
        section(
          "The simple lens",
          bulletList([
            "Revenue can come from spraying acres consistently, not just selling equipment.",
            "Inputs can create additional upside when the model is built correctly.",
            "The drone investment gets stronger when it plugs into a repeatable operating model.",
          ]),
        ),
        infoCard("Opportunity profile", [
          detailRow("Experience level", payload.experienceLevel),
          detailRow("Budget range", payload.budgetRange),
          detailRow("Equipment details", payload.equipmentDetails),
        ]),
      ],
      footer:
        "This is why Harvest Drone frames Hylio as a business opportunity first.",
    }),
  };
}

function buildHylioTerritoryFollowUp(payload) {
  return {
    subject: "Should we review your territory in more detail?",
    html: renderEmailShell({
      eyebrow: "Harvest Drone | Hylio Follow-Up",
      title: "The next step is a real territory review.",
      intro:
        "If your area has enough acreage access and the economics make sense, the conversation becomes about where a Hylio drone can create a durable revenue stream.",
      sections: [
        section(
          "A territory review can clarify",
          bulletList([
            "Whether your area has enough acreage to support the model.",
            "How spraying and inputs can work together to increase total opportunity.",
            "Whether now is the right time to move toward a purchase conversation.",
          ]),
        ),
        infoCard("Current request snapshot", [
          detailRow("State", payload.state),
          detailRow("Counties", payload.countiesServed),
          detailRow("Acreage access", payload.acreageAccess),
        ]),
      ],
      footer:
        "If the fit is strong, Harvest Drone will walk through the opportunity directly with you.",
    }),
  };
}

function buildHylioFinalFollowUp(payload) {
  return {
    subject: "Final check-in on your Hylio opportunity request",
    html: renderEmailShell({
      eyebrow: "Harvest Drone | Hylio Follow-Up",
      title: "One last check-in before we close the loop.",
      intro:
        "We wanted to send one final note in case you still want to explore whether a Hylio drone fits your territory and business model.",
      sections: [
        section(
          "If this is still relevant",
          bulletList([
            "We can review whether your area supports a high-revenue acreage model.",
            "We can talk through how operators think about Hylio ROI without overcomplicating it.",
            "We can help determine whether the timing is right to move forward.",
          ]),
        ),
        infoCard("Request summary", [
          detailRow("State", payload.state),
          detailRow("Acreage access", payload.acreageAccess),
          detailRow("Budget range", payload.budgetRange),
        ]),
      ],
      footer:
        "If priorities have shifted, no problem. Harvest Drone will pause outreach unless you re-engage later.",
    }),
  };
}

function buildInternalAlert(type, payload) {
  const title =
    type === "grower"
      ? "New grower lead submitted"
      : type === "hylio"
        ? "New Hylio lead submitted"
        : "New operator lead submitted";
  const account =
    type === "grower"
      ? payload.farmName || "-"
      : payload.companyName || payload.name || "-";

  const details = Object.entries(payload).map(([key, value]) =>
    detailRow(
      key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (letter) => letter.toUpperCase()),
      value,
    ),
  );

  return {
    subject: title,
    html: renderEmailShell({
      eyebrow: "Harvest Drone | Internal Alert",
      title,
      intro:
        "A new lead entered the funnel and is ready for review, routing, and follow-up.",
      sections: [
        infoCard("Lead summary", [
          detailRow("Lead type", type),
          detailRow("Account", account),
          detailRow("Email", payload.email),
          detailRow("Mobile", payload.mobile),
          detailRow("State", payload.state),
        ]),
        infoCard("Submission details", details),
        section(
          "Suggested next actions",
          bulletList([
            "Review fit and confirm territory coverage.",
            "Route the lead to sales, fulfillment, or partnership follow-up.",
            "Update status in the dashboard after first contact.",
          ]),
        ),
      ],
      footer:
        "Future hook: this is the right place to trigger CRM sync, SMS alerts, and job-routing automations.",
    }),
  };
}

function createResendClient() {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!resendApiKey || !fromEmail || !adminEmail) {
    throw new Error(
      "Email environment variables are missing. Set RESEND_API_KEY, FROM_EMAIL, and ADMIN_EMAIL.",
    );
  }

  return {
    resend: new Resend(resendApiKey),
    fromEmail,
    adminEmail,
  };
}

function createSmsClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return null;
  }

  return { accountSid, authToken, fromNumber };
}

function getSmsMessage(type, payload) {
  const growerMessage = `Hi ${payload.firstName || ""}, this is Harvest Drone. We received your acre plan request and are reviewing your acres now.`.trim();
  const operatorMessage = `Hi ${payload.firstName || ""}, this is Harvest Drone. We received your area qualification request and are reviewing your territory now.`.trim();
  const hylioMessage = `Hi ${payload.name || payload.firstName || ""}, this is Harvest Drone. We received your Hylio opportunity request and are reviewing your area now.`.trim();

  if (type === "grower") {
    return growerMessage;
  }

  if (type === "hylio") {
    return hylioMessage;
  }

  return operatorMessage;
}

function buildFollowUpEmail(type, sequenceState, payload) {
  const followUps = {
    grower_day_1_timing_speed: buildGrowerTimingFollowUp,
    grower_day_3_fit_use_cases: buildGrowerFitFollowUp,
    grower_day_5_acreage_review_cta: buildGrowerAcreageReviewFollowUp,
    grower_day_10_final_check_in: buildGrowerFinalFollowUp,
    operator_day_1_operator_fit: buildOperatorFitFollowUp,
    operator_day_3_capacity_follow_up: buildOperatorCapacityFollowUp,
    operator_day_5_routing_cta: buildOperatorRoutingFollowUp,
    operator_day_10_final_check_in: buildOperatorFinalFollowUp,
    hylio_day_1_business_model: buildHylioBusinessModelFollowUp,
    hylio_day_3_roi_follow_up: buildHylioRoiFollowUp,
    hylio_day_5_territory_cta: buildHylioTerritoryFollowUp,
    hylio_day_10_final_check_in: buildHylioFinalFollowUp,
  };

  const builder = followUps[sequenceState];

  if (!builder) {
    throw new Error(`No follow-up email template found for ${type}:${sequenceState}.`);
  }

  const email = builder(payload);

  return {
    ...email,
    templateKey: sequenceState,
  };
}

export async function sendLeadEmails({ type, payload }) {
  if (!payload?.email) {
    throw new Error("Lead email is required.");
  }

  if (!["grower", "operator", "hylio"].includes(type)) {
    throw new Error("Invalid lead type.");
  }

  const { resend, fromEmail, adminEmail } = createResendClient();
  const internalAlert = buildInternalAlert(type, payload);
  const confirmation =
    type === "grower"
      ? buildGrowerConfirmation(payload)
      : type === "hylio"
        ? buildHylioConfirmation(payload)
        : buildOperatorConfirmation(payload);

  const [confirmationResult, internalAlertResult] = await Promise.all([
    resend.emails.send({
      from: fromEmail,
      to: payload.email,
      subject: confirmation.subject,
      html: confirmation.html,
    }),
    resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: internalAlert.subject,
      html: internalAlert.html,
    }),
  ]);

  return {
    success: true,
    confirmationTemplateKey: getCampaign(type)?.steps[0]?.key ?? null,
    confirmationSubject: confirmation.subject,
    internalAlertTemplateKey: `${type}_internal_alert`,
    internalAlertSubject: internalAlert.subject,
    confirmationId: confirmationResult.data?.id ?? null,
    internalAlertId: internalAlertResult.data?.id ?? null,
  };
}

export async function sendLeadSmsFollowUp({ type, payload }) {
  if (!payload?.mobile) {
    return null;
  }

  const smsClient = createSmsClient();

  if (!smsClient) {
    return {
      success: false,
      status: "skipped",
      error: "SMS credentials are not configured.",
      messagePreview: getSmsMessage(type, payload),
    };
  }

  const body = getSmsMessage(type, payload);
  const auth = Buffer.from(`${smsClient.accountSid}:${smsClient.authToken}`).toString("base64");
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${smsClient.accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: payload.mobile,
        From: smsClient.fromNumber,
        Body: body,
      }),
    },
  );

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || "SMS send failed.");
  }

  return {
    success: true,
    status: "sent",
    messageId: result?.sid ?? null,
    messagePreview: body,
  };
}

export async function sendHighTicketReminder({ payload }) {
  const { resend, fromEmail, adminEmail } = createResendClient();
  const subject = `Hylio follow-up due: ${payload.name || payload.companyName || payload.email}`;
  const html = renderEmailShell({
    eyebrow: "Harvest Drone | High-Ticket Reminder",
    title: "A Hylio follow-up is due.",
    intro:
      "This reminder was triggered because the next action date is due for a Hylio lead in the high-ticket pipeline.",
    sections: [
      infoCard("Lead details", [
        detailRow("Name", payload.name || payload.fullName),
        detailRow("Email", payload.email),
        detailRow("Phone", payload.mobile),
        detailRow("State", payload.state),
        detailRow("Counties", payload.countiesServed),
        detailRow("Budget range", payload.budgetRange),
        detailRow("Next action date", payload.nextActionDate),
      ]),
      section(
        "Suggested next move",
        bulletList([
          "Review the latest call notes.",
          "Confirm whether the lead should move to contacted, qualified, or call scheduled.",
          "Set the next action date again after the follow-up is complete.",
        ]),
      ),
    ],
    footer:
      "This reminder is part of the Harvest Drone Hylio high-ticket follow-up system.",
  });

  const result = await resend.emails.send({
    from: fromEmail,
    to: adminEmail,
    subject,
    html,
  });

  return {
    success: true,
    templateKey: "hylio_follow_up_reminder",
    subject,
    messageId: result.data?.id ?? null,
  };
}

export async function sendFollowUpEmail({ type, sequenceState, payload }) {
  if (!payload?.email) {
    throw new Error("Lead email is required.");
  }

  const { resend, fromEmail } = createResendClient();
  const followUp = buildFollowUpEmail(type, sequenceState, payload);

  const result = await resend.emails.send({
    from: fromEmail,
    to: payload.email,
    subject: followUp.subject,
    html: followUp.html,
  });

  return {
    success: true,
    templateKey: followUp.templateKey,
    subject: followUp.subject,
    messageId: result.data?.id ?? null,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, payload } = req.body ?? {};

  if (!type || !payload) {
    return badRequest(res, "Missing type or payload.");
  }

  if (!payload.email) {
    return badRequest(res, "Lead email is required.");
  }

  try {
    // Future automation hook:
    // trigger internal workflow routing, CRM sync, customer confirmations, or SMS notifications here.
    const result = await sendLeadEmails({ type, payload });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Email send failed.",
    });
  }
}
