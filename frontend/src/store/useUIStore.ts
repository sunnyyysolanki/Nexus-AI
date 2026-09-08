import { create } from 'zustand';
import { Incident } from '../types/api';

export type ActiveTab = 'dashboard' | 'incidents' | 'alerts' | 'telemetry';

interface UIState {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  selectedIncident: Incident | null;
  setSelectedIncident: (incident: Incident | null) => void;
  isRcaDrawerOpen: boolean;
  setRcaDrawerOpen: (open: boolean) => void;

  editingIncident: Incident | null;
  isEditModalOpen: boolean;
  openEditModal: (incident: Incident) => void;
  closeEditModal: () => void;

  isAlertModalOpen: boolean;
  setAlertModalOpen: (open: boolean) => void;

  autoRefresh: boolean;
  toggleAutoRefresh: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),

  selectedIncident: null,
  setSelectedIncident: (incident) => set({ selectedIncident: incident }),
  isRcaDrawerOpen: false,
  setRcaDrawerOpen: (open) => set({ isRcaDrawerOpen: open }),

  editingIncident: null,
  isEditModalOpen: false,
  openEditModal: (incident) => set({ editingIncident: incident, isEditModalOpen: true }),
  closeEditModal: () => set({ editingIncident: null, isEditModalOpen: false }),

  isAlertModalOpen: false,
  setAlertModalOpen: (open) => set({ isAlertModalOpen: open }),

  autoRefresh: true,
  toggleAutoRefresh: () => set((state) => ({ autoRefresh: !state.autoRefresh })),
}));
