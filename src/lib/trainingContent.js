import orientation from "../../content/training/hylio/00-orientation.mdx?raw";
import complianceFoundations from "../../content/training/hylio/01-compliance-foundations.mdx?raw";
import hardwareGroundlink from "../../content/training/hylio/02-hylio-hardware-groundlink.mdx?raw";
import agrosolMissionPlanning from "../../content/training/hylio/03-agrosol-mission-planning.mdx?raw";
import fieldSafetySiteSurvey from "../../content/training/hylio/04-field-safety-site-survey.mdx?raw";
import chemicalHandlingApplication from "../../content/training/hylio/05-chemical-handling-application.mdx?raw";
import manualControlEmergency from "../../content/training/hylio/06-manual-control-emergency-procedures.mdx?raw";
import maintenanceBatteriesCalibration from "../../content/training/hylio/07-maintenance-batteries-calibration.mdx?raw";
import supervisedFieldPracticum from "../../content/training/hylio/08-supervised-field-practicum.mdx?raw";
import harvestJobWorkflow from "../../content/training/hylio/09-harvest-job-workflow.mdx?raw";
import recurrentTraining from "../../content/training/hylio/10-recurrent-training.mdx?raw";
import driftManagementSop from "../../content/sops/drift-management-sop.mdx?raw";

const contentByPath = {
  "content/training/hylio/00-orientation.mdx": orientation,
  "content/training/hylio/01-compliance-foundations.mdx": complianceFoundations,
  "content/training/hylio/02-hylio-hardware-groundlink.mdx": hardwareGroundlink,
  "content/training/hylio/03-agrosol-mission-planning.mdx": agrosolMissionPlanning,
  "content/training/hylio/04-field-safety-site-survey.mdx": fieldSafetySiteSurvey,
  "content/training/hylio/05-chemical-handling-application.mdx": chemicalHandlingApplication,
  "content/training/hylio/06-manual-control-emergency-procedures.mdx": manualControlEmergency,
  "content/training/hylio/07-maintenance-batteries-calibration.mdx": maintenanceBatteriesCalibration,
  "content/training/hylio/08-supervised-field-practicum.mdx": supervisedFieldPracticum,
  "content/training/hylio/09-harvest-job-workflow.mdx": harvestJobWorkflow,
  "content/training/hylio/10-recurrent-training.mdx": recurrentTraining,
  "content/sops/drift-management-sop.mdx": driftManagementSop,
};

export function getLessonContent(lesson) {
  return contentByPath[lesson?.contentPath] || lesson?.content || "";
}
