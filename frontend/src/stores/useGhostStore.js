/**
 * useGhostStore.js - Global State for Ghost OS Dashboard
 * 
 * Manages:
 * - Zen Mode (hide noisy sections)
 * - Sound preferences
 * - User level for unlocks
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useGhostStore = create(
  persist(
    (set, get) => ({
      // === ZEN MODE ===
      isZenMode: false,
      toggleZenMode: () => set((state) => ({ isZenMode: !state.isZenMode })),
      
      // === SONIC TUNER ===
      soundEnabled: false,
      soundVolume: 0.3,
      soundPreset: 'silence',
      
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setSoundVolume: (volume) => set({ soundVolume: volume }),
      setSoundPreset: (preset) => set({ soundPreset: preset }),
      
      // Sound presets with unlock levels
      soundPresets: [
        { id: 'silence', name: 'Silence', level: 0, file: null },
        { id: 'white-noise', name: 'White Noise', level: 5, file: '/sounds/white-noise.mp3' },
        { id: 'rain', name: 'Cyber Rain', level: 10, file: '/sounds/rain-ambient.mp3' },
        { id: 'focus', name: 'Deep Focus', level: 15, file: '/sounds/deep-focus.mp3' },
        { id: 'void', name: 'Void Hum', level: 20, file: '/sounds/void-hum.mp3' },
        { id: 'neural', name: 'Neural Link', level: 30, file: '/sounds/neural-link.mp3' },
      ],
      
      // Check if preset is unlocked
      isPresetUnlocked: (presetId, userLevel) => {
        const presets = get().soundPresets;
        const preset = presets.find(p => p.id === presetId);
        return preset ? userLevel >= preset.level : false;
      },
      
      // === USER CONTEXT (from auth, but cached here) ===
      cachedUserLevel: 0,
      setCachedUserLevel: (level) => set({ cachedUserLevel: level }),
      
      // === TELEMETRY (cached stats) ===
      telemetry: {
        liveNodes: 0,
        totalProducts: 0,
        totalXP: 0,
        tradesToday: 0
      },
      setTelemetry: (data) => set((state) => ({ 
        telemetry: { ...state.telemetry, ...data } 
      })),
      
      // === EVENTS ===
      activeEvent: null, // { title, endDate, type }
      setActiveEvent: (event) => set({ activeEvent: event }),
    }),
    {
      name: 'ghost-dashboard-storage',
      partialize: (state) => ({
        isZenMode: state.isZenMode,
        soundEnabled: state.soundEnabled,
        soundVolume: state.soundVolume,
        soundPreset: state.soundPreset,
      }),
    }
  )
);

export default useGhostStore;
