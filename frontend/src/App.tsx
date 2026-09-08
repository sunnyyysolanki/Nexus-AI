import React from 'react';
import { useUIStore } from './store/useUIStore';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { IncidentTable } from './components/incidents/IncidentTable';
import { AlertHub } from './components/alerts/AlertHub';
import { TelemetryExplorer } from './components/telemetry/TelemetryExplorer';
import { AlertIngestionModal } from './components/alerts/AlertIngestionModal';
import { EditStatusModal } from './components/incidents/EditStatusModal';
import { RcaDrawer } from './components/rca/RcaDrawer';
import { ToastContainer } from './components/common/ToastContainer';

export const App: React.FC = () => {
  const activeTab = useUIStore((state) => state.activeTab);

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Dynamic Tab Content Area */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && <OverviewDashboard />}
          {activeTab === 'incidents' && <IncidentTable />}
          {activeTab === 'alerts' && <AlertHub />}
          {activeTab === 'telemetry' && <TelemetryExplorer />}
        </main>
      </div>

      {/* Global Modals & Slide-over Drawers */}
      <AlertIngestionModal />
      <EditStatusModal />
      <RcaDrawer />
      <ToastContainer />
    </div>
  );
};
