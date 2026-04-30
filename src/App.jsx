import { Suspense, lazy, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import ChatWidget from "./components/ChatWidget";
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
const AdminTrainingPage = lazy(() => import("./pages/AdminTrainingPage"));
const JobReadinessPage = lazy(() => import("./pages/JobReadinessPage"));

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
  return (
    <Suspense fallback={<div className="route-loading">Loading...</div>}>
      <MetaPixelManager />
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
        <Route path="/crm" element={<CrmPage />} />
        <Route path="/dashboard" element={<DashboardOverviewPage />} />
        <Route path="/dashboard/leads/:leadType/:leadId" element={<LeadDetailPage />} />
        <Route path="/agent" element={<AgentPage />} />
        <Route path="/admin" element={<HarvestAdminPage />} />
        <Route path="/admin/leads/:leadId" element={<HarvestLeadDetailPage />} />
        <Route path="/training" element={<TrainingDashboardPage />} />
        <Route path="/training/courses/:slug" element={<TrainingCoursePage />} />
        <Route path="/training/lessons/:id" element={<TrainingLessonPage />} />
        <Route path="/training/assessments/:id" element={<TrainingAssessmentPage />} />
        <Route path="/training/checklists/:slug" element={<ChecklistRunnerPage />} />
        <Route path="/operators/:id/training" element={<OperatorTrainingProfilePage />} />
        <Route path="/compliance/credentials" element={<ComplianceCredentialsPage />} />
        <Route path="/admin/training" element={<AdminTrainingPage />} />
        <Route path="/jobs/:id/readiness" element={<JobReadinessPage />} />
      </Routes>
      <ChatWidget />
    </Suspense>
  );
}

export default App;
