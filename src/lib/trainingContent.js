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
import academyOverview from "../../content/training/academy/00-academy-overview.mdx?raw";
import academyCertificationPath from "../../content/training/academy/01-certification-path.mdx?raw";
import academyCommercialDroneRules from "../../content/training/academy/02-commercial-drone-operating-rules.mdx?raw";
import academyPreflightDiscipline from "../../content/training/academy/03-preflight-discipline.mdx?raw";
import academyEmergencyStopWork from "../../content/training/academy/04-emergency-stop-work.mdx?raw";
import academyFieldMapping from "../../content/training/academy/05-field-mapping-boundaries.mdx?raw";
import academyWeatherDrift from "../../content/training/academy/06-weather-drift-review.mdx?raw";
import academyApplicationCloseout from "../../content/training/academy/07-application-closeout.mdx?raw";
import academySourceMode from "../../content/training/academy/08-source-mode-of-action.mdx?raw";
import academySourceAcreReview from "../../content/training/academy/09-source-acre-review-workflow.mdx?raw";
import academyEnterpriseModel from "../../content/training/academy/10-enterprise-drone-division-model.mdx?raw";
import academyRdoRollout from "../../content/training/academy/11-rdo-pilot-rollout-checklist.mdx?raw";
import academyCoreSop from "../../content/training/academy/12-core-sop-review.mdx?raw";
import academyCertificationReview from "../../content/training/academy/13-certification-readiness-review.mdx?raw";

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
  "content/training/academy/00-academy-overview.mdx": academyOverview,
  "content/training/academy/01-certification-path.mdx": academyCertificationPath,
  "content/training/academy/02-commercial-drone-operating-rules.mdx": academyCommercialDroneRules,
  "content/training/academy/03-preflight-discipline.mdx": academyPreflightDiscipline,
  "content/training/academy/04-emergency-stop-work.mdx": academyEmergencyStopWork,
  "content/training/academy/05-field-mapping-boundaries.mdx": academyFieldMapping,
  "content/training/academy/06-weather-drift-review.mdx": academyWeatherDrift,
  "content/training/academy/07-application-closeout.mdx": academyApplicationCloseout,
  "content/training/academy/08-source-mode-of-action.mdx": academySourceMode,
  "content/training/academy/09-source-acre-review-workflow.mdx": academySourceAcreReview,
  "content/training/academy/10-enterprise-drone-division-model.mdx": academyEnterpriseModel,
  "content/training/academy/11-rdo-pilot-rollout-checklist.mdx": academyRdoRollout,
  "content/training/academy/12-core-sop-review.mdx": academyCoreSop,
  "content/training/academy/13-certification-readiness-review.mdx": academyCertificationReview,
};

export function getLessonContent(lesson) {
  return contentByPath[lesson?.contentPath] || lesson?.content || "";
}
