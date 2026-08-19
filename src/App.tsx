import { useState, useEffect, useCallback } from 'react';
import { Scene } from './components/3d/Scene';
import { Navbar } from './components/ui/Navbar';
import { ControlPanel } from './components/ui/ControlPanel';
import { PlanetQuickNav } from './components/ui/PlanetQuickNav';
import { InfoPanel } from './components/ui/InfoPanel';
import { ControlsOverlay } from './components/ui/ControlsOverlay';
import { CompareModal } from './components/ui/CompareModal';
import { SUN_DATA, PLANETS_DATA, ALL_CELESTIAL_BODIES } from './data/planetsData';
import { DEEP_SPACE_OBJECTS } from './data/spaceObjectsData';
import { THEMES, THEME_KEYS } from './data/themes';
import type { ExplorerSettings } from './types/space';
import { spaceAudio } from './utils/audio';

function App() {
  const [settings, setSettings] = useState<ExplorerSettings>({
    timeSpeed: 1,
    isPaused: false,
    showOrbits: true,
    showLabels: true,
    showAsteroids: true,
    showDeepSpace: true,
    showAtmospheres: true,
    cosmicToggles: {
      milkyWayCore: true,
      starClusters: true,
      wormhole: true,
      blackHole: true,
      comets: true,
      nebulae: true,
      pulsar: true,
      shootingStars: true,
      distantGalaxies: true,
      asteroidBelt: true,
      atmospheres: true,
    },
    soundEnabled: false,
    activeThemeId: 'cosmic-purple',
    selectedBodyId: null,
    comparisonBodyId: null,
  });

  const activeTheme = THEMES[settings.activeThemeId] || THEMES['cosmic-purple'];

  const selectedItem = settings.selectedBodyId
    ? ALL_CELESTIAL_BODIES.find((b) => b.id === settings.selectedBodyId) ||
      DEEP_SPACE_OBJECTS.find((d) => d.id === settings.selectedBodyId) ||
      null
    : null;

  const handleSelectObject = useCallback((id: string | null) => {
    setSettings((prev) => ({ ...prev, selectedBodyId: id }));
    if (id) {
      spaceAudio.playSelectSound();
    }
  }, []);

  const handleToggleSound = useCallback(() => {
    const isMuted = spaceAudio.toggleMute();
    setSettings((prev) => ({ ...prev, soundEnabled: !isMuted }));
  }, []);

  const handleResetCamera = useCallback(() => {
    setSettings((prev) => ({ ...prev, selectedBodyId: null }));
    spaceAudio.playHoverSound();
  }, []);

  const handleNextPlanet = useCallback(() => {
    const list = ALL_CELESTIAL_BODIES;
    const currentIndex = list.findIndex((b) => b.id === settings.selectedBodyId);
    const nextIndex = (currentIndex + 1) % list.length;
    handleSelectObject(list[nextIndex].id);
  }, [settings.selectedBodyId, handleSelectObject]);

  // Keyboard Shortcuts Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          setSettings((prev) => ({
            ...prev,
            timeSpeed: prev.timeSpeed === 0 ? 1 : -prev.timeSpeed,
          }));
          break;

        case 'Escape':
          e.preventDefault();
          handleResetCamera();
          break;

        case 'Digit0':
          handleSelectObject('sun');
          break;
        case 'Digit1':
          handleSelectObject('mercury');
          break;
        case 'Digit2':
          handleSelectObject('venus');
          break;
        case 'Digit3':
          handleSelectObject('earth');
          break;
        case 'Digit4':
          handleSelectObject('mars');
          break;
        case 'Digit5':
          handleSelectObject('jupiter');
          break;
        case 'Digit6':
          handleSelectObject('saturn');
          break;
        case 'Digit7':
          handleSelectObject('uranus');
          break;
        case 'Digit8':
          handleSelectObject('neptune');
          break;
        case 'Digit9':
          handleSelectObject('pluto');
          break;

        case 'KeyO':
          setSettings((prev) => ({ ...prev, showOrbits: !prev.showOrbits }));
          break;

        case 'KeyL':
          setSettings((prev) => ({ ...prev, showLabels: !prev.showLabels }));
          break;

        case 'KeyM':
          handleToggleSound();
          break;

        case 'KeyT': {
          const currentIdx = THEME_KEYS.indexOf(settings.activeThemeId);
          const nextTheme = THEME_KEYS[(currentIdx + 1) % THEME_KEYS.length];
          setSettings((prev) => ({ ...prev, activeThemeId: nextTheme }));
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleResetCamera, handleSelectObject, handleToggleSound, settings.activeThemeId]);

  return (
    <main className="w-screen h-screen relative overflow-hidden bg-slate-950 text-slate-100 select-none">
      {/* 1. Primary 3D WebGL Canvas Scene */}
      <Scene
        sunData={SUN_DATA}
        planets={PLANETS_DATA}
        deepSpaceObjects={DEEP_SPACE_OBJECTS}
        theme={activeTheme}
        timeSpeed={settings.timeSpeed}
        showOrbits={settings.showOrbits}
        showLabels={settings.showLabels}
        cosmicToggles={settings.cosmicToggles}
        selectedId={settings.selectedBodyId}
        onSelect={handleSelectObject}
      />

      {/* 2. Top Navbar */}
      <Navbar
        planets={ALL_CELESTIAL_BODIES}
        deepSpaceObjects={DEEP_SPACE_OBJECTS}
        theme={activeTheme}
        soundEnabled={settings.soundEnabled}
        onToggleSound={handleToggleSound}
        onSelectObject={handleSelectObject}
      />

      {/* 3. Floating Control Dock with Cosmic Phenomena Menu */}
      <ControlPanel
        settings={settings}
        theme={activeTheme}
        onUpdateSettings={setSettings}
        onResetCamera={handleResetCamera}
      />

      {/* 4. Bottom Quick Nav Ribbon */}
      <PlanetQuickNav
        planets={ALL_CELESTIAL_BODIES}
        selectedId={settings.selectedBodyId}
        theme={activeTheme}
        onSelect={handleSelectObject}
      />

      {/* 5. Telemetry & Info Drawer */}
      <InfoPanel
        selectedItem={selectedItem}
        theme={activeTheme}
        onClose={() => handleSelectObject(null)}
        onCompareWithEarth={(id) =>
          setSettings((prev) => ({ ...prev, comparisonBodyId: id }))
        }
        onNextPlanet={handleNextPlanet}
      />

      {/* 6. Comparison Modal */}
      {settings.comparisonBodyId && (
        <CompareModal
          targetPlanetId={settings.comparisonBodyId}
          theme={activeTheme}
          onClose={() =>
            setSettings((prev) => ({ ...prev, comparisonBodyId: null }))
          }
        />
      )}

      {/* 7. Viewport Shortcuts HUD */}
      <ControlsOverlay theme={activeTheme} />
    </main>
  );
}

export default App;
