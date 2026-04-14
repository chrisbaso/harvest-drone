import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const GrowerPage = lazy(() => import("./pages/GrowerPage"));
const OperatorPage = lazy(() => import("./pages/OperatorPage"));
const HylioPage = lazy(() => import("./pages/HylioPage"));
const SourcePage = lazy(() => import("./pages/SourcePage"));
const CrmPage = lazy(() => import("./pages/CrmPage"));
const AgentPage = lazy(() => import("./pages/AgentPage"));
const DashboardOverviewPage = lazy(() => import("./pages/DashboardOverviewPage"));
const LeadDetailPage = lazy(() => import("./pages/LeadDetailPage"));
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage"));

function App() {
  return (
    <Suspense fallback={<div className="route-loading">Loading...</div>}>
      <Routes>
        <Route path="/" element={<Navigate to="/growers" replace />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/growers" element={<GrowerPage />} />
        <Route path="/operators" element={<OperatorPage />} />
        <Route path="/hylio" element={<HylioPage />} />
        <Route path="/source" element={<SourcePage />} />
        <Route path="/crm" element={<CrmPage />} />
        <Route path="/agent" element={<AgentPage />} />
        <Route path="/dashboard" element={<DashboardOverviewPage />} />
        <Route path="/dashboard/leads/:leadType/:leadId" element={<LeadDetailPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
