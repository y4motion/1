/**
 * SonicTuner.jsx - Ambient Sound Controller
 * 
 * Features:
 * - Volume slider
 * - Preset selector (unlocked by level)
 * - Gamification: locked presets show required level
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Lock, ChevronDown } from 'lucide-react';
import { useGhostStore } from '../../stores/useGhostStore';
import { useAuth } from '../../contexts/AuthContext';

export const SonicTuner = ({ className = '' }) => {
  const { 
    soundEnabled, 
    soundVolume, 
    soundPreset,
    soundPresets,
    setSoundEnabled, 
    setSoundVolume, 
    setSoundPreset,
    isPresetUnlocked 
  } = useGhostStore();
  
  const { user } = useAuth();
  const userLevel = user?.level || 0;
  
  const [showMenu, setShowMenu] = useState(false);
  const [audioRef, setAudioRef] = useState(null);
  const menuRef = useRef(null);
  
  // Current preset info
  const currentPreset = soundPresets.find(p => p.id === soundPreset) || soundPresets[0];
  
  // Handle audio playback
  useEffect(() => {
    if (soundEnabled && currentPreset.file) {
      const audio = new Audio(currentPreset.file);
      audio.loop = true;
      audio.volume = soundVolume;
      audio.play().catch(() => {
        // Autoplay blocked, user needs to interact first
        setSoundEnabled(false);
      });
      setAudioRef(audio);
      
      return () => {
        audio.pause();
        audio.src = '';
      };
    }
  }, [soundEnabled, currentPreset.file, setSoundEnabled]);
  
  // Update volume
  useEffect(() => {
    if (audioRef) {
      audioRef.volume = soundVolume;
    }
  }, [soundVolume, audioRef]);
  
  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);
  
  const handlePresetSelect = (preset) => {
    if (isPresetUnlocked(preset.id, userLevel)) {
      setSoundPreset(preset.id);
      if (preset.file) {
        setSoundEnabled(true);
      } else {
        setSoundEnabled(false);
      }
      setShowMenu(false);
    }
  };
  
  const toggleSound = () => {
    if (currentPreset.file) {
      setSoundEnabled(!soundEnabled);
    }
  };

  return (
    <div className={`sonic-tuner ${className}`} ref={menuRef} data-testid="sonic-tuner">
      {/* Main Button */}
      <motion.button
        className={`sonic-main ${soundEnabled ? 'active' : ''}`}
        onClick={toggleSound}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </motion.button>
      
      {/* Volume Slider (visible when enabled) */}
      <AnimatePresence>
        {soundEnabled && (
          <motion.input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={soundVolume}
            onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
            className="sonic-slider"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 60, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
          />
        )}
      </AnimatePresence>
      
      {/* Preset Selector */}
      <motion.button
        className="sonic-preset-btn"
        onClick={() => setShowMenu(!showMenu)}
        whileHover={{ scale: 1.05 }}
      >
        <span className="preset-name">{currentPreset.name}</span>
        <ChevronDown size={12} />
      </motion.button>
      
      {/* Preset Menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            className="sonic-menu"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
          >
            {soundPresets.map((preset) => {
              const isUnlocked = isPresetUnlocked(preset.id, userLevel);
              const isActive = preset.id === soundPreset;
              
              return (
                <button
                  key={preset.id}
                  className={`sonic-option ${isActive ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`}
                  onClick={() => handlePresetSelect(preset)}
                  disabled={!isUnlocked}
                >
                  <span className="option-name">{preset.name}</span>
                  {!isUnlocked ? (
                    <span className="option-lock">
                      <Lock size={10} />
                      LVL {preset.level}
                    </span>
                  ) : isActive ? (
                    <span className="option-active">●</span>
                  ) : null}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SonicTuner;
