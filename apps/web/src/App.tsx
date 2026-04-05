import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "./components/layout/AppShell";
import { AIControlCenterPage } from "./features/ai-control-center/AIControlCenterPage";
import { AuditLogsPage } from "./features/audit-logs/AuditLogsPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { OperationsCopilotPage } from "./features/operations/OperationsCopilotPage";
import { PlaceholderPage } from "./features/placeholders/PlaceholderPage";
import { RagEvaluationLabPage } from "./features/rag/RagEvaluationLabPage";
import { RequirementsEnginePage } from "./features/requirements/RequirementsEnginePage";

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/requirements" element={<RequirementsEnginePage />} />
        <Route path="/ops" element={<OperationsCopilotPage />} />
        <Route path="/rag" element={<RagEvaluationLabPage />} />
        <Route path="/ai-control-center" element={<AIControlCenterPage />} />
        <Route path="/audit-logs" element={<AuditLogsPage />} />
        <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
