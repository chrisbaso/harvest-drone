import { Suspense, lazy, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AppErrorBoundary from "./components/AppErrorBoundary";
import ChatWidget from "./components/ChatWidget";
import ProtectedRoute from "./components/ProtectedRoute";
import RouteLoading from "./components/RouteLoading";
import { useAuth } from "./context/AuthContext";
import { getRestrictedProfileRedirect, isEnterpriseDemoProfile } from "../shared/accessControl";
import { initMetaPixel, registerMetaScheduleTracking, trackMetaPageView } from "./lib/metaPixel";

const GrowerPage = lazy(() => import("./pages/GrowerPage"));
const OperatorPage = lazy(() => import("./pages/OperatorPage"));
const HylioPage = lazy(() => import("./pages/HylioPage"));
const SourcePage = lazy(() => import("./pages/SourcePage"));
const SourceResultsPage = lazy(() => import("./pages/SourceResultsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const AgentPage = lazy(() => import("./pages/AgentPage"));
const LeadDetailPage = lazy(() => import("./pages/LeadDetailPage"));
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage"));
const IntegrationAdminPage = lazy(() => import("./pages/IntegrationAdminPage"));
const IntegrationEventsPage = lazy(() => import("./pages/IntegrationEventsPage"));
const OpenLoopsPage = lazy(() => import("./pages/OpenLoopsPage"));
const GoogleIntegrationPage = lazy(() => import("./pages/GoogleIntegrationPage"));
const WeeklyBriefPage = lazy(() => import("./pages/WeeklyBriefPage"));
const ProfitCentersPage = lazy(() => import("./pages/ProfitCentersPage"));
const HarvestLeadDetailPage = lazy(() => import("./pages/HarvestLeadDetailPage"));
const AcademyPage = lazy(() => import("./pages/AcademyPage"));
const TrainingDashboardPage = lazy(() => import("./pages/TrainingDashboardPage"));
const TrainingCoursePage = lazy(() => import("./pages/TrainingCoursePage"));
const TrainingLessonPage = lazy(() => import("./pages/TrainingLessonPage"));
const TrainingAssessmentPage = lazy(() => import("./pages/TrainingAssessmentPage"));
const ChecklistRunnerPage = lazy(() => import("./pages/ChecklistRunnerPage"));
const OperatorTrainingProfilePage = lazy(() => import("./pages/OperatorTrainingProfilePage"));
const ComplianceCredentialsPage = lazy(() => import("./pages/ComplianceCredentialsPage"));
const ComplianceRecordsPage = lazy(() => import("./pages/ComplianceRecordsPage"));
const TrainingQualificationPage = lazy(() => import("./pages/TrainingQualificationPage"));
const AdminTrainingPage = lazy(() => import("./pages/AdminTrainingPage"));
const AdminAcademyPage = lazy(() => import("./pages/AdminAcademyPage"));
const JobReadinessPage = lazy(() => import("./pages/JobReadinessPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const DealerOnboardingPage = lazy(() => import("./pages/DealerOnboardingPage"));
const DemoIndexPage = lazy(() => import("./pages/DemoIndexPage"));
const EnterprisePage = lazy(() => import("./pages/EnterprisePage"));
const FleetManagementPage = lazy(() => import("./pages/FleetManagementPage"));
const FieldOpsPage = lazy(() => import("./pages/FieldOpsPage"));
const OperatorJobsPage = lazy(() => import("./pages/OperatorJobsPage"));
const RoiCalculatorPage = lazy(() => import("./pages/RoiCalculatorPage"));
const HssPartnerPricingPage = lazy(() => import("./pages/HssPartnerPricingPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function MetaPixelManager() {
  const location = useLocation();

  useEffect(() => {
    initMetaPixel();
    return registerMetaScheduleTracking();
  }, []);

  useEffect(() => {
    trackMetaPageView(`${location.pathname}${location.search}${location.hash}`);
  }, [location.hash, location.pathname, location.search]);

  return null;
}

function RestrictedProfileGate({ children }) {
  const location = useLocation();
  const { profile, isLoading } = useAuth();
  const redirect = isLoading ? null : getRestrictedProfileRedirect(profile, location.pathname);

  if (redirect) {
    return <Navigate to={redirect} replace />;
  }

  return children;
}

function App() {
  const location = useLocation();
  const { profile } = useAuth();
  const showChatWidget = !isEnterpriseDemoProfile(profile);

  return (
    <Suspense fallback={<RouteLoading />}>
      <MetaPixelManager />
      <AppErrorBoundary resetKey={location.pathname}>
        <RestrictedProfileGate>
          <Routes>
          <Route path="/" element={<HowItWorksPage />} />
          <Route path="/growers" element={<GrowerPage />} />
          <Route path="/operators" element={<OperatorPage />} />
          <Route path="/hylio" element={<HylioPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/source" element={<GrowerPage />} />
          <Route path="/source-acre-review" element={<SourcePage />} />
          <Route path="/source-review" element={<SourcePage />} />
          <Route path="/source-acre-review/results" element={<SourceResultsPage />} />
          <Route path="/source-acre-review/thank-you" element={<Navigate to="/source-acre-review/results" replace />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/join" element={<DealerOnboardingPage />} />
          <Route path="/join/:networkSlug" element={<DealerOnboardingPage />} />
          <Route path="/d/:dealerSlug" element={<SourcePage />} />
          <Route path="/d/:dealerSlug/growers" element={<GrowerPage />} />
          <Route path="/demo" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer", "operator"]}><DemoIndexPage /></ProtectedRoute>} />
          <Route path="/enterprise" element={<EnterprisePage view="landing" />} />
          <Route path="/enterprise/rdo" element={<Navigate to="/enterprise/rdo/division" replace />} />
          <Route path="/enterprise/rdo/division" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer", "enterprise_demo"]}><EnterprisePage view="division" /></ProtectedRoute>} />
          <Route path="/enterprise/rdo/training" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer", "enterprise_demo"]}><EnterprisePage view="training" /></ProtectedRoute>} />
          <Route path="/enterprise/rdo/blueprint" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer", "enterprise_demo"]}><EnterprisePage view="blueprint" /></ProtectedRoute>} />
          <Route path="/enterprise/rdo/spray-calendar" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer", "enterprise_demo"]}><EnterprisePage view="spray-calendar" /></ProtectedRoute>} />
          <Route path="/enterprise/rdo/operators" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer", "enterprise_demo"]}><EnterprisePage view="operators" /></ProtectedRoute>} />
          <Route path="/enterprise/rdo/fleet" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer", "enterprise_demo"]}><EnterprisePage view="fleet" /></ProtectedRoute>} />
          <Route path="/enterprise/rdo/readiness" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer", "enterprise_demo"]}><EnterprisePage view="readiness" /></ProtectedRoute>} />
          <Route path="/enterprise/rdo/application-records" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer", "enterprise_demo"]}><EnterprisePage view="application-records" /></ProtectedRoute>} />
          <Route path="/enterprise/rdo/support" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer", "enterprise_demo"]}><EnterprisePage view="support" /></ProtectedRoute>} />
          <Route path="/enterprise/rdo/performance" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer", "enterprise_demo"]}><EnterprisePage view="performance" /></ProtectedRoute>} />
          <Route path="/roi-calculator" element={<RoiCalculatorPage />} />
          <Route path="/hss-partner-pricing" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><HssPartnerPricingPage /></ProtectedRoute>} />
          <Route path="/enterprise/:orgId/division" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><EnterprisePage view="division" /></ProtectedRoute>} />
          <Route path="/enterprise/:orgId/training" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><EnterprisePage view="training" /></ProtectedRoute>} />
          <Route path="/enterprise/:orgId/blueprint" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><EnterprisePage view="blueprint" /></ProtectedRoute>} />
          <Route path="/enterprise/:orgId/spray-calendar" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><EnterprisePage view="spray-calendar" /></ProtectedRoute>} />
          <Route path="/enterprise/:orgId/operators" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><EnterprisePage view="operators" /></ProtectedRoute>} />
          <Route path="/enterprise/:orgId/fleet" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><EnterprisePage view="fleet" /></ProtectedRoute>} />
          <Route path="/enterprise/:orgId/readiness" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><EnterprisePage view="readiness" /></ProtectedRoute>} />
          <Route path="/enterprise/:orgId/application-records" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><EnterprisePage view="application-records" /></ProtectedRoute>} />
          <Route path="/enterprise/:orgId/support" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><EnterprisePage view="support" /></ProtectedRoute>} />
          <Route path="/enterprise/:orgId/performance" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><EnterprisePage view="performance" /></ProtectedRoute>} />
          <Route path="/crm" element={<ProtectedRoute allowedRoles={["admin"]}><Navigate to="/ops/leads" replace /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><Navigate to="/ops" replace /></ProtectedRoute>} />
          <Route path="/dashboard/leads/:leadType/:leadId" element={<ProtectedRoute allowedRoles={["admin"]}><LeadDetailPage /></ProtectedRoute>} />
          <Route path="/agent" element={<ProtectedRoute allowedRoles={["admin"]}><AgentPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><Navigate to="/ops/settings" replace /></ProtectedRoute>} />
          <Route path="/admin/integrations" element={<ProtectedRoute allowedRoles={["admin"]}><IntegrationAdminPage /></ProtectedRoute>} />
          <Route path="/admin/integration-events" element={<ProtectedRoute allowedRoles={["admin"]}><IntegrationEventsPage /></ProtectedRoute>} />
          <Route path="/admin/daily-ops" element={<ProtectedRoute allowedRoles={["admin"]}><Navigate to="/ops/daily-agent" replace /></ProtectedRoute>} />
          <Route path="/admin/open-loops" element={<ProtectedRoute allowedRoles={["admin"]}><OpenLoopsPage /></ProtectedRoute>} />
          <Route path="/admin/integrations/google" element={<ProtectedRoute allowedRoles={["admin"]}><GoogleIntegrationPage /></ProtectedRoute>} />
          <Route path="/admin/weekly-brief" element={<ProtectedRoute allowedRoles={["admin"]}><WeeklyBriefPage /></ProtectedRoute>} />
          <Route path="/admin/profit-centers" element={<ProtectedRoute allowedRoles={["admin"]}><ProfitCentersPage /></ProtectedRoute>} />
          <Route path="/admin/leads/:leadId" element={<ProtectedRoute allowedRoles={["admin"]}><HarvestLeadDetailPage /></ProtectedRoute>} />
          <Route path="/admin/training" element={<ProtectedRoute allowedRoles={["admin"]}><AdminTrainingPage /></ProtectedRoute>} />
          <Route path="/admin/academy" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAcademyPage /></ProtectedRoute>} />
          <Route path="/network" element={<ProtectedRoute allowedRoles={["network_manager", "admin"]}><Navigate to="/ops" replace /></ProtectedRoute>} />
          <Route path="/dealer" element={<ProtectedRoute allowedRoles={["dealer", "admin"]}><Navigate to="/ops" replace /></ProtectedRoute>} />
          <Route path="/fleet" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><FleetManagementPage /></ProtectedRoute>} />
          <Route path="/ops" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><FieldOpsPage view="dashboard" /></ProtectedRoute>} />
          <Route path="/ops/today" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><FieldOpsPage view="today" /></ProtectedRoute>} />
          <Route path="/ops/maps" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><FieldOpsPage view="maps" /></ProtectedRoute>} />
          <Route path="/ops/fleet-map" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><FieldOpsPage view="fleet-map" /></ProtectedRoute>} />
          <Route path="/ops/guide" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><FieldOpsPage view="guide" /></ProtectedRoute>} />
          <Route path="/ops/leads" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><FieldOpsPage view="leads" /></ProtectedRoute>} />
          <Route path="/ops/funnels" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><FieldOpsPage view="funnels" /></ProtectedRoute>} />
          <Route path="/ops/daily-agent" element={<ProtectedRoute allowedRoles={["admin"]}><FieldOpsPage view="daily-agent" /></ProtectedRoute>} />
          <Route path="/ops/jobs" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><FieldOpsPage view="jobs" /></ProtectedRoute>} />
          <Route path="/ops/jobs/new" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><FieldOpsPage view="new-job" /></ProtectedRoute>} />
          <Route path="/ops/jobs/:jobId" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><FieldOpsPage view="job-detail" /></ProtectedRoute>} />
          <Route path="/ops/clients" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><FieldOpsPage view="clients" /></ProtectedRoute>} />
          <Route path="/ops/clients/:clientId" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><FieldOpsPage view="client-detail" /></ProtectedRoute>} />
          <Route path="/ops/farms" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><FieldOpsPage view="farms" /></ProtectedRoute>} />
          <Route path="/ops/schedule" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><FieldOpsPage view="schedule" /></ProtectedRoute>} />
          <Route path="/ops/billing" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><FieldOpsPage view="billing" /></ProtectedRoute>} />
          <Route path="/ops/settings" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><FieldOpsPage view="settings" /></ProtectedRoute>} />
          <Route path="/operator/jobs" element={<ProtectedRoute allowedRoles={["admin", "operator"]}><OperatorJobsPage /></ProtectedRoute>} />
          <Route path="/operator/jobs/:jobId" element={<ProtectedRoute allowedRoles={["admin", "operator"]}><OperatorJobsPage /></ProtectedRoute>} />
          <Route path="/scheduler" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><Navigate to="/ops/schedule" replace /></ProtectedRoute>} />
          <Route path="/training" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer", "operator"]}><AcademyPage /></ProtectedRoute>} />
          <Route path="/training/classic" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer", "operator"]}><TrainingDashboardPage /></ProtectedRoute>} />
          <Route path="/training/courses/:slug" element={<ProtectedRoute><TrainingCoursePage /></ProtectedRoute>} />
          <Route path="/training/lessons/:id" element={<ProtectedRoute><TrainingLessonPage /></ProtectedRoute>} />
          <Route path="/training/assessments/:id" element={<ProtectedRoute><TrainingAssessmentPage /></ProtectedRoute>} />
          <Route path="/training/checklists/:slug" element={<ProtectedRoute><ChecklistRunnerPage /></ProtectedRoute>} />
          <Route path="/training/qualification" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer", "operator"]}><TrainingQualificationPage /></ProtectedRoute>} />
          <Route path="/operators/:id/training" element={<ProtectedRoute><OperatorTrainingProfilePage /></ProtectedRoute>} />
          <Route path="/compliance/credentials" element={<ProtectedRoute><ComplianceCredentialsPage /></ProtectedRoute>} />
          <Route path="/compliance/records" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><ComplianceRecordsPage /></ProtectedRoute>} />
          <Route path="/jobs/:id/readiness" element={<ProtectedRoute><JobReadinessPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </RestrictedProfileGate>
      </AppErrorBoundary>
      {showChatWidget ? (
        <AppErrorBoundary resetKey="chat-widget">
          <ChatWidget />
        </AppErrorBoundary>
      ) : null}
    </Suspense>
  );
}

export default App;
