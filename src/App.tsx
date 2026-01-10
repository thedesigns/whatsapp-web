import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/Layout/DashboardLayout';
import AuthGuard from './components/Auth/AuthGuard';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Chat from './pages/Chat/Chat';
import ChatbotBuilder from './pages/Chatbot/ChatbotBuilder';
import Broadcasts from './pages/Broadcast/Broadcasts';
import Templates from './pages/Templates/Templates';
import Contacts from './pages/Contacts/Contacts';
import AgentManagement from './pages/Agents/AgentManagement';
import OrganizationManagement from './pages/Admin/OrganizationManagement';
import AdminDashboard from './pages/Admin/AdminDashboard';
import PlanManagement from './pages/Admin/PlanManagement';
import Settings from './pages/Settings/Settings';
import Integrations from './pages/Integrations/Integrations';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/" 
          element={
            <AuthGuard>
              <DashboardLayout />
            </AuthGuard>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="chat" element={<Chat />} />
          <Route path="chatbot" element={<ChatbotBuilder />} />
          <Route path="broadcasts" element={<Broadcasts />} />
          <Route path="templates" element={<Templates />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="agents" element={<AgentManagement />} />
          <Route path="integrations" element={<Integrations />} />
          <Route path="settings" element={<Settings />} />
          <Route path="admin">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="organizations" element={<OrganizationManagement />} />
            <Route path="plans" element={<PlanManagement />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
