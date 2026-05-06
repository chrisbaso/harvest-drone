import { Suspense, lazy, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AppErrorBoundary from "./components/AppErrorBoundary";
import ChatWidget from "./components/ChatWidget";
import ProtectedRoute from "./components/ProtectedRoute";
import RouteLoading from "./components/RouteLoading";
import { initMetaPixel, registerMetaScheduleTracking, trackMetaPageView } from "./lib/metaPixel";

const GrowerPage = lazy(() => import("./pages/GrowerPage"));
const OperatorPage = lazy(() => import("./pages/OperatorPage"));
const HylioPage = lazy(() => import("./pages/HylioPage"));
const SourcePage = lazy(() => import("./pages/SourcePage"));
const SourceResultsPage = lazy(() => import("./pages/SourceResultsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const CrmPage = lazy(() => import("./pages/CrmPage"));
const AgentPage = lazy(() => import("./pages/AgentPage"));
const DashboardOverviewPage = lazy(() => import("./pages/DashboardOverviewPage"));
const LeadDetailPage = lazy(() => import("./pages/LeadDetailPage"));
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage"));
const HarvestAdminPage = lazy(() => import("./pages/HarvestAdminPage"));
const HarvestLeadDetailPage = lazy(() => import("./pages/HarvestLeadDetailPage"));
const TrainingDashboardPage = lazy(() => import("./pages/TrainingDashboardPage"));
const TrainingCoursePage = lazy(() => import("./pages/TrainingCoursePage"));
const TrainingLessonPage = lazy(() => import("./pages/TrainingLessonPage"));
const TrainingAssessmentPage = lazy(() => import("./pages/TrainingAssessmentPage"));
const ChecklistRunnerPage = lazy(() => import("./pages/ChecklistRunnerPage"));
const OperatorTrainingProfilePage = lazy(() => import("./pages/OperatorTrainingProfilePage"));
const ComplianceCredentialsPage = lazy(() => import("./pages/ComplianceCredentialsPage"));
const TrainingQualificationPage = lazy(() => import("./pages/TrainingQualificationPage"));
const AdminTrainingPage = lazy(() => import("./pages/AdminTrainingPage"));
const JobReadinessPage = lazy(() => import("./pages/JobReadinessPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const DealerDashboardPage = lazy(() => import("./pages/DealerDashboardPage"));
const NetworkDashboardPage = lazy(() => import("./pages/NetworkDashboardPage"));
const DealerOnboardingPage = lazy(() => import("./pages/DealerOnboardingPage"));
const DemoIndexPage = lazy(() => import("./pages/DemoIndexPage"));
const EnterprisePage = lazy(() => import("./pages/EnterprisePage"));
const FleetManagementPage = lazy(() => import("./pages/FleetManagementPage"));
const SchedulerPage = lazy(() => import("./pages/SchedulerPage"));
const RoiCalculatorPage = lazy(() => import("./pages/RoiCalculatorPage"));
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

function App() {
  const location = useLocation();

  return (
    <Suspense fallback={<RouteLoading />}>
      <MetaPixelManager />
      <AppErrorBoundary resetKey={location.pathname}>
        <Routes>
          <Route path="/" element={<HowItWorksPage />} />
          <Route path="/growers" element={<GrowerPage />} />
          <Route path="/operators" element={<OperatorPage />} />
          <Route path="/hylio" element={<HylioPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/source" element={<SourcePage />} />
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
          <Route path="/roi-calculator" element={<RoiCalculatorPage />} />
          <Route path="/enterprise/:orgId/division" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><EnterprisePage view="division" /></ProtectedRoute>} />
          <Route path="/enterprise/:orgId/blueprint" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><EnterprisePage view="blueprint" /></ProtectedRoute>} />
          <Route path="/enterprise/:orgId/spray-calendar" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><EnterprisePage view="spray-calendar" /></ProtectedRoute>} />
          <Route path="/enterprise/:orgId/operators" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><EnterprisePage view="operators" /></ProtectedRoute>} />
          <Route path="/enterprise/:orgId/fleet" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><EnterprisePage view="fleet" /></ProtectedRoute>} />
          <Route path="/enterprise/:orgId/readiness" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><EnterprisePage view="readiness" /></ProtectedRoute>} />
          <Route path="/enterprise/:orgId/application-records" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><EnterprisePage view="application-records" /></ProtectedRoute>} />
          <Route path="/enterprise/:orgId/support" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><EnterprisePage view="support" /></ProtectedRoute>} />
          <Route path="/enterprise/:orgId/performance" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><EnterprisePage view="performance" /></ProtectedRoute>} />
          <Route path="/crm" element={<ProtectedRoute allowedRoles={["admin"]}><CrmPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><DashboardOverviewPage /></ProtectedRoute>} />
          <Route path="/dashboard/leads/:leadType/:leadId" element={<ProtectedRoute allowedRoles={["admin"]}><LeadDetailPage /></ProtectedRoute>} />
          <Route path="/agent" element={<ProtectedRoute allowedRoles={["admin"]}><AgentPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><HarvestAdminPage /></ProtectedRoute>} />
          <Route path="/admin/leads/:leadId" element={<ProtectedRoute allowedRoles={["admin"]}><HarvestLeadDetailPage /></ProtectedRoute>} />
          <Route path="/admin/training" element={<ProtectedRoute allowedRoles={["admin"]}><AdminTrainingPage /></ProtectedRoute>} />
          <Route path="/network" element={<ProtectedRoute allowedRoles={["network_manager", "admin"]}><NetworkDashboardPage /></ProtectedRoute>} />
          <Route path="/dealer" element={<ProtectedRoute allowedRoles={["dealer", "admin"]}><DealerDashboardPage /></ProtectedRoute>} />
          <Route path="/fleet" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><FleetManagementPage /></ProtectedRoute>} />
          <Route path="/scheduler" element={<ProtectedRoute allowedRoles={["admin", "network_manager", "dealer"]}><SchedulerPage /></ProtectedRoute>} />
          <Route path="/training" element={<ProtectedRoute allowedRoles={["admin", "dealer", "operator"]}><TrainingDashboardPage /></ProtectedRoute>} />
          <Route path="/training/courses/:slug" element={<ProtectedRoute><TrainingCoursePage /></ProtectedRoute>} />
          <Route path="/training/lessons/:id" element={<ProtectedRoute><TrainingLessonPage /></ProtectedRoute>} />
          <Route path="/training/assessments/:id" element={<ProtectedRoute><TrainingAssessmentPage /></ProtectedRoute>} />
          <Route path="/training/checklists/:slug" element={<ProtectedRoute><ChecklistRunnerPage /></ProtectedRoute>} />
          <Route path="/training/qualification" element={<ProtectedRoute allowedRoles={["admin", "dealer", "operator"]}><TrainingQualificationPage /></ProtectedRoute>} />
          <Route path="/operators/:id/training" element={<ProtectedRoute><OperatorTrainingProfilePage /></ProtectedRoute>} />
          <Route path="/compliance/credentials" element={<ProtectedRoute><ComplianceCredentialsPage /></ProtectedRoute>} />
          <Route path="/jobs/:id/readiness" element={<ProtectedRoute><JobReadinessPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppErrorBoundary>
      <AppErrorBoundary resetKey="chat-widget">
        <ChatWidget />
      </AppErrorBoundary>
    </Suspense>
  );
}

export default App;
