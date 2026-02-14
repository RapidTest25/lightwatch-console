import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ServicesPage } from "./features/services";
import { LogsPage } from "./features/logs";
import { MetricsPage } from "./features/metrics";
import { SecurityPage } from "./features/security";
import { AlertsPage } from "./features/alerts";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<ServicesPage />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="metrics" element={<MetricsPage />} />
          <Route path="security" element={<SecurityPage />} />
          <Route path="alerts" element={<AlertsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
