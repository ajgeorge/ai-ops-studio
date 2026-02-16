import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "./components/layout/AppShell";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { PlaceholderPage } from "./features/placeholders/PlaceholderPage";

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/requirements" element={<PlaceholderPage title="Requirements Engine" />} />
        <Route path="/ops" element={<PlaceholderPage title="Operations Copilot" />} />
        <Route path="/rag" element={<PlaceholderPage title="RAG Evaluation Lab" />} />
        <Route path="/ai-control-center" element={<PlaceholderPage title="AI Control Center" />} />
        <Route path="/audit-logs" element={<PlaceholderPage title="Audit Logs" />} />
        <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
