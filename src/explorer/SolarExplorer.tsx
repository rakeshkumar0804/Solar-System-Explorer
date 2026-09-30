import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { ArrowDown, ArrowRight, Check, ChevronLeft, ChevronRight, CircleHelp, Expand, Layers3, Minus, Orbit, Pause, Play, Plus, RotateCcw, Settings2, SlidersHorizontal, Volume2, VolumeX, X } from 'lucide-react';
import { BODIES, PLANETS, PRESENTATION, TOUR, getBody } from './catalog';
import type { Quality, ViewMode } from './catalog';
import { About, Comparison, PlanetDetails } from './Dialogs';
import { getDiameterKm } from '../utils/comparison';
import { spaceAudio } from '../utils/audio';
import { supportsWebGL2 } from './webgl';

const SolarScene = lazy(() => import('./SolarScene'));
type Panel = 'compare' | 'details' | 'about' | null;
type RenderStatus = 'checking' | 'loading' | 'ready' | 'unsupported' | 'error';

function SolarExplorer({ active, onDeepSpace }: { active: boolean; onDeepSpace: () => void }) {
  const [selected, setSelected] = useState('earth');
  const [mode, setMode] = useState<ViewMode>('planet');
  const [quality, setQuality] = useState<Quality>('auto');
  const [paused, setPaused] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [speed, setSpeed] = useState(1);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [atmosphere, setAtmosphere] = useState(true);
  const [clouds, setClouds] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [tour, setTour] = useState(false);
  const [audio, setAudio] = useState(false);
  const [reset, setReset] = useState(0);
  const [zoom, setZoom] = useState({ sequence: 0, direction: 1 });
  const [renderStatus, setRenderStatus] = useState<RenderStatus>(() => supportsWebGL2() ? 'loading' : 'unsupported');
  const [fullscreen, setFullscreen] = useState(false);
  const [notice, setNotice] = useState('');
  const activeNav = useRef<HTMLButtonElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const settingsButton = useRef<HTMLButtonElement>(null);
  const deepSpaceButton = useRef<HTMLButtonElement>(null);
  const wasActive = useRef(active);
  useEffect(() => {
    if (active && !wasActive.current) deepSpaceButton.current?.focus({ preventScroll: true });
    wasActive.current = active;
  }, [active]);
  const body = getBody(selected);
  const info = PRESENTATION[selected];
  const isOverview = mode === 'overview';
  const noGraphics = renderStatus === 'unsupported' || renderStatus === 'error';

  const checkGraphics = useCallback(() => {
    setRenderStatus(supportsWebGL2() ? 'loading' : 'unsupported');
    setReset(value => value + 1);
  }, []);

  const onReady = useCallback(() => setRenderStatus('ready'), []);
  const onError = useCallback(() => setRenderStatus('error'), []);
  const selectWorld = useCallback((id: string) => {
    setSelected(id);
    setMode('planet');
    setTour(false);
    setSettingsOpen(false);
  }, []);
  const nextWorld = useCallback((direction: number) => {
    const index = BODIES.findIndex(item => item.id === selected);
    selectWorld(BODIES[(index + direction + BODIES.length) % BODIES.length].id);
  }, [selected, selectWorld]);
  const overview = useCallback(() => {
    setMode('overview');
    setTour(false);
    setReset(value => value + 1);
  }, []);

  useEffect(() => {
    activeNav.current?.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'nearest' });
  }, [selected]);

  useEffect(() => {
    if (!active || !tour || paused || panel || renderStatus !== 'ready') return;
    const timer = window.setTimeout(() => {
      setSelected(previous => TOUR[(TOUR.indexOf(previous) + 1) % TOUR.length]);
    }, 9000);
    return () => window.clearTimeout(timer);
  }, [active, tour, paused, panel, renderStatus, selected]);

  useEffect(() => {
    if (!settingsOpen) return;
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!settingsRef.current?.contains(target) && !settingsButton.current?.contains(target)) setSettingsOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [settingsOpen]);

  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (!active) return;
      const target = event.target as HTMLElement;
      if (event.key === 'Escape' && !panel) {
        setSettingsOpen(false);
        setTour(false);
        if (settingsOpen) settingsButton.current?.focus();
        return;
      }
      if (target.isContentEditable || /^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(target.tagName) || event.metaKey || event.ctrlKey || event.altKey) return;
      if (panel) return; // Native dialogs own Escape and keyboard focus.
      if (event.code === 'Space') { event.preventDefault(); setPaused(value => !value); }
      else if (event.code === 'ArrowRight') { event.preventDefault(); nextWorld(1); }
      else if (event.code === 'ArrowLeft') { event.preventDefault(); nextWorld(-1); }
      else if (event.key.toLowerCase() === 'c') setPanel('compare');
      else if (event.key.toLowerCase() === 'o') overview();
      else if (/^[0-9]$/.test(event.key)) selectWorld(BODIES[Number(event.key)].id);
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [active, nextWorld, panel, selectWorld, overview, settingsOpen]);

  useEffect(() => {
    const listener = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', listener);
    return () => document.removeEventListener('fullscreenchange', listener);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else setNotice('Fullscreen is not available in this browser.');
    } catch { setNotice('Fullscreen is not available in this browser.'); }
  };
  const toggleAudio = () => {
    try { setAudio(!spaceAudio.toggleMute()); }
    catch { setNotice('Audio is not available in this browser.'); }
  };
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 5000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  return <main hidden={!active} className={`explorer ${isOverview ? 'overview-mode' : ''}`} style={{ '--planet-accent': info.accent } as CSSProperties}>
    <a className="skip-link" href="#planet-navigation">Skip to planet navigation</a>
    <header className="site-header">
      <button className="brand" aria-label="Solar Explorer home — Earth" onClick={() => selectWorld('earth')}>
        <span className="brand-symbol"><Orbit size={29} strokeWidth={1.15} /></span><span>SOLAR<span className="brand-subtitle">SYSTEM EXPLORER</span></span>
      </button>
      <nav className="view-navigation" aria-label="View mode">
        <button className={!isOverview ? 'active' : ''} aria-pressed={!isOverview} onClick={() => { setMode('planet'); setTour(false); }}>Explore</button>
        <button className={isOverview ? 'active' : ''} aria-pressed={isOverview} onClick={overview}>System view</button>
        <button onClick={() => setPanel('compare')}>Compare</button>
        <button ref={deepSpaceButton} className="deep-space-entry" onClick={() => { setTour(false); setSettingsOpen(false); if (audio) { spaceAudio.toggleMute(true); setAudio(false); } onDeepSpace(); }}>Deep space <span aria-hidden="true">↗</span></button>
      </nav>
      <div className="header-actions"><button className="icon-button desktop-help" aria-label="About and keyboard controls" onClick={() => setPanel('about')}><CircleHelp size={19} /></button>
        <button className="icon-button" aria-label={audio ? 'Mute ambient audio' : 'Enable ambient audio'} onClick={toggleAudio}>{audio ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
        <button className="icon-button fullscreen-button" aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} onClick={toggleFullscreen}><Expand size={18} /></button>
        <button ref={settingsButton} className={`icon-button ${settingsOpen ? 'active' : ''}`} aria-label="Display settings" aria-expanded={settingsOpen} aria-controls="display-settings" onClick={() => setSettingsOpen(value => !value)}><Settings2 size={19} /></button>
      </div>
    </header>

    <div className="scene-stage" aria-label={isOverview ? '3D solar system overview' : `3D view of ${info.title}`}>
      {active && !noGraphics && renderStatus !== 'checking' && <Suspense fallback={null}><SolarScene selected={selected} mode={mode} quality={quality} paused={paused || !!panel} speed={speed}
        showOrbits={showOrbits} showLabels={showLabels} atmosphere={atmosphere} clouds={clouds} reset={reset} zoom={zoom} onSelect={selectWorld} onReady={onReady} onError={onError} /></Suspense>}
      {(renderStatus === 'loading' || renderStatus === 'checking') && <div className="scene-loading" role="status"><span className="loading-ring" />Loading planetary imagery…</div>}
      {noGraphics && <div className="static-preview"><span className={`static-globe planet-thumbnail planet-${selected}`} style={{ backgroundImage: `url(/textures/${selected}.jpg)` }} />
        <div className="graphics-notice"><span className="eyebrow">STATIC PREVIEW · 3D UNAVAILABLE</span><p>{renderStatus === 'error' ? 'The scene or its imagery could not be loaded.' : 'This browser could not start WebGL 2.'} Planet details and comparisons remain available.</p><button onClick={checkGraphics}>Retry 3D view <RotateCcw size={13} /></button></div></div>}
    </div>

    <section className="world-introduction" aria-live="polite" aria-atomic="true">
      <div className="section-marker"><span />{isOverview ? 'THE SOLAR SYSTEM' : info.eyebrow}</div>
      <h1>{isOverview ? <>One star.<br />Eight worlds.</> : info.title}</h1>
      <p className="world-subtitle">{isOverview ? 'A neighbourhood without limits.' : info.subtitle}</p>
      <p className="world-description">{isOverview ? 'Follow the paths of our planetary neighbours. Select a world to begin a closer exploration.' : info.description}</p>
      {!isOverview && <button className="details-link" onClick={() => setPanel('details')}>Discover {info.title} <ArrowRight size={16} /></button>}
      <div className="world-metrics">
        {isOverview ? <><div><span>OUR STAR</span><strong>The Sun</strong></div><div><span>MAJOR PLANETS</span><strong>8</strong></div><div><span>VIEW SCALE</span><strong>Compressed</strong></div></> : <>
          <div><span>DIAMETER</span><strong>{getDiameterKm(body).toLocaleString()} <small>km</small></strong></div>
          <div><span>DISTANCE FROM SUN</span><strong>{info.distance}</strong></div>
          <div><span>{selected === 'moon' ? 'ORBIT AROUND EARTH' : 'ORBITAL PERIOD'}</span><strong>{selected === 'moon' ? '27.3 days' : info.year}</strong></div>
        </>}
      </div>
    </section>

    <div className="scene-caption"><span className="status-dot" /><span>{isOverview ? 'SYSTEM OVERVIEW' : 'PLANETARY EXPLORATION'}</span><span className="caption-divider" />{noGraphics ? 'Static preview' : 'Interactive 3D'}</div>
    {!noGraphics && <div className="camera-toolbar" aria-label="Camera controls"><button className="icon-button" aria-label="Zoom in" onClick={() => setZoom(previous => ({ sequence: previous.sequence + 1, direction: 1 }))}><Plus size={18} /></button><span />
      <button className="icon-button" aria-label="Zoom out" onClick={() => setZoom(previous => ({ sequence: previous.sequence + 1, direction: -1 }))}><Minus size={18} /></button><span />
      <button className="icon-button" aria-label="Reset camera" onClick={() => setReset(value => value + 1)}><RotateCcw size={16} /></button></div>}

    <div className="scene-bottom"><span className="interaction-hint"><Orbit size={14} /> Drag to orbit <span>·</span> Scroll to zoom</span>
      <span className="scale-note">{isOverview ? 'Planet sizes & distances are compressed' : selected === 'earth' ? 'Earth–Moon distance is compressed' : selected === 'pluto' ? 'Grayscale mosaic · unmapped terrain is dark' : 'Illustrative lighting & rotation'}</span></div>

    <footer className="exploration-dock">
      <div className="dock-heading"><div className="dock-label"><span className="eyebrow">CHOOSE YOUR DESTINATION</span><ArrowDown size={13} /></div>
        <div className="playback-controls"><button className="playback-pause" aria-label={paused ? 'Resume animation' : 'Pause animation'} onClick={() => setPaused(value => !value)}>{paused ? <Play size={13} /> : <Pause size={13} />}<span>{paused ? 'Paused' : 'Playing'}</span></button>
          <label className="speed-control"><span>Speed</span><select aria-label="Animation speed" value={speed} onChange={event => setSpeed(Number(event.target.value))}>{[0.25, 0.5, 1, 2, 5, 10].map(value => <option key={value} value={value}>{value}×</option>)}</select></label>
          <button className={`tour-button ${tour ? 'active' : ''}`} disabled={noGraphics} onClick={() => { setTour(value => !value); setMode('planet'); setPaused(false); }}><Play size={12} />{tour ? 'End tour' : 'Guided tour'}</button>
        </div>
      </div>
      <nav id="planet-navigation" className="planet-navigation" aria-label="Choose a celestial body">
        {BODIES.map((item, index) => <button key={item.id} ref={selected === item.id ? activeNav : undefined} className={`destination ${selected === item.id && !isOverview ? 'selected' : ''}`} aria-label={`Explore ${PRESENTATION[item.id].title}`} aria-current={selected === item.id && !isOverview ? 'true' : undefined} onClick={() => selectWorld(item.id)}>
          <span className="destination-number">{item.type === 'moon' ? '☾' : index.toString().padStart(2, '0')}</span>
          <span className={`planet-thumbnail planet-${item.id}`} style={{ backgroundImage: `url(/textures/thumbs/${item.id}.webp)` }} />
          <span className="destination-name">{PRESENTATION[item.id].title}</span><span className="selection-indicator" />
        </button>)}
      </nav>
      <div className="dock-footer"><span>AN EXPLORATION BY <strong>RAKESH KUMAR</strong></span><button onClick={() => setPanel('about')}>Sources & about <ArrowRight size={11} /></button><div className="destination-arrows"><button aria-label="Previous world" onClick={() => nextWorld(-1)}><ChevronLeft size={15} /></button><button aria-label="Next world" onClick={() => nextWorld(1)}><ChevronRight size={15} /></button></div></div>
    </footer>

    {settingsOpen && <div className="settings-panel" id="display-settings" ref={settingsRef}>
      <div className="settings-heading"><span><SlidersHorizontal size={15} />Display settings</span><button className="icon-button" aria-label="Close settings" onClick={() => { setSettingsOpen(false); settingsButton.current?.focus(); }}><X size={16} /></button></div>
      <label className="quality-label">Graphics quality<select aria-label="Graphics quality" value={quality} onChange={event => setQuality(event.target.value as Quality)}><option value="auto">Balanced</option><option value="high">High</option><option value="low">Low · save power</option></select></label>
      {[{ label: 'Atmospheres', checked: atmosphere, change: setAtmosphere }, { label: 'Earth clouds', checked: clouds, change: setClouds }, { label: 'Labels', checked: showLabels, change: setShowLabels }, { label: 'Orbit paths in system view', checked: showOrbits, change: setShowOrbits }].map(setting => <label className="setting-toggle" key={setting.label}><span>{setting.label}</span><input type="checkbox" checked={setting.checked} onChange={event => setting.change(event.target.checked)} /><span className="toggle-track"><Check size={11} /></span></label>)}
      <p className="settings-note"><Layers3 size={13} />Low quality reduces geometry and disables atmospheric layers.</p>
      <button className="settings-about" onClick={() => { setSettingsOpen(false); setPanel('about'); }}>Sources, scale & keyboard controls <ArrowRight size={13} /></button>
    </div>}
    {panel === 'compare' && <Comparison selected={selected} onClose={() => setPanel(null)} />}
    {panel === 'details' && <PlanetDetails selected={selected} onClose={() => setPanel(null)} />}
    {panel === 'about' && <About onClose={() => setPanel(null)} />}
    {notice && <div className="toast" role="status">{notice}</div>}
    <span className="sr-only">Explore {PLANETS.length} planets, the Sun, Pluto, and the Moon.</span>
  </main>;
}

export default SolarExplorer;
