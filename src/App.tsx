import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import PulsePage from './modules/pulse/PulsePage';
import { ResolvePage } from './modules/resolve/ResolvePage';
import AssistPage from './modules/assist/AssistPage';

// Using placeholders for now since the pages have not yet been implemented according to prompts
const SettingsPage = () => <div>Settings View</div>;

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/pulse" replace />} />
          <Route path="/pulse" element={<PulsePage />} />
          <Route path="/resolve" element={<ResolvePage />} />
          <Route path="/assist" element={<AssistPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
