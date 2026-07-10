import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export function useAccessibilitySettings() {
  const [settings, setSettings] = useLocalStorage('stadium-accessibility-settings', {
    highContrast: false,
    largerButtons: false,
    voiceResponses: true,
    autoReadResponses: false,
    reduceAnimations: false,
    screenReaderFriendly: false,
    wheelchairMode: false,
    textSize: 'medium', // 'small' | 'medium' | 'large' | 'extra-large'
  });

  // Apply visual settings to document element
  useEffect(() => {
    const root = document.documentElement;

    // 1. High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // 2. Text size classes
    root.classList.remove('text-size-small', 'text-size-medium', 'text-size-large', 'text-size-extra-large');
    root.classList.add(`text-size-${settings.textSize}`);

    // 3. Larger buttons class
    if (settings.largerButtons) {
      root.classList.add('large-buttons');
    } else {
      root.classList.remove('large-buttons');
    }

    // 4. Reduce animations class
    if (settings.reduceAnimations) {
      root.classList.add('reduce-animations');
    } else {
      root.classList.remove('reduce-animations');
    }
  }, [settings.highContrast, settings.textSize, settings.largerButtons, settings.reduceAnimations]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleSetting = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return {
    settings,
    updateSetting,
    toggleSetting,
  };
}
