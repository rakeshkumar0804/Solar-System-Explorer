import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, CircleHelp, Eye, Grid2X2, Minus, Orbit, Pause, Play, Plus, RotateCcw, Search, Sparkles } from 'lucide-react';
import { Dialog } from '../Dialogs';
import type { Quality } from '../catalog';
import { supportsWebGL2 } from '../webgl';
import { DESTINATIONS, getDestination } from './catalog';
import type { CameraPreset, DestinationId } from './catalog';
import { COLLECTIONS, DESTINATION_META, matchDestinations } from './expansionCatalog';
import type { Collection } from './expansionCatalog';
import './deep.css';

const DeepScene = lazy(() => import('./DeepScene'));
type Status = 'loading' | 'ready' | 'unsupported' | 'error';

export default function DeepSpaceExplorer({ onReturn }: { onReturn: () => void }) {
  const [selected, setSelected] = useState<DestinationId>('milky-way');
  const [quality, setQuality] = useState<Quality>('auto');
  const [paused, setPaused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [labels, setLabels] = useState(true);
  const [details, setDetails] = useState(false);
  const [help, setHelp] = useState(false);
  const [atlas, setAtlas] = useState(false);
  const [query, setQuery] = useState('');
  const [collection, setCollection] = useState<Collection | 'All'>('All');
  const [preset, setPreset] = useState<CameraPreset>('home');
  const [reset, setReset] = useState(0);
  const [zoom, setZoom] = useState({ sequence: 0, direction: 1 });
  const [status, setStatus] = useState<Status>(() => supportsWebGL2() ? 'loading' : 'unsupported');
  const heading = useRef<HTMLHeadingElement>(null);
  const navigation = useRef<HTMLElement>(null);
  const atlasTrigger = useRef<HTMLButtonElement>(null);
  const wasAtlasOpen = useRef(false);
  const destination = getDestination(selected);
  const metadata = DESTINATION_META[selected];
  const matches = matchDestinations(DESTINATIONS, query, collection);
  const currentIndex = DESTINATIONS.findIndex(item => item.id === selected);
  const unavailable = status === 'error' || status === 'unsupported';
  const onReady = useCallback(() => setStatus('ready'), []);
  const onError = useCallback(() => setStatus('error'), []);

  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);
  useEffect(() => {
    if (wasAtlasOpen.current && !atlas) atlasTrigger.current?.focus({ preventScroll: true });
    wasAtlasOpen.current = atlas;
  }, [atlas]);
  useEffect(() => {
    navigation.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
  }, [selected]);
  const choose = useCallback((id: DestinationId) => {
    setSelected(id); setPreset('home'); setReset(value => value + 1); setZoom({ sequence: 0, direction: 1 });
    setStatus(previous => previous === 'ready' && id !== selected ? 'loading' : previous);
  }, [selected]);
  const next = useCallback((direction: number) => {
    const index = DESTINATIONS.findIndex(item => item.id === selected);
    choose(DESTINATIONS[(index + direction + DESTINATIONS.length) % DESTINATIONS.length].id);
  }, [choose, selected]);
  const setCamera = (view: CameraPreset) => { setPreset(view); setReset(value => value + 1); };
  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      if (details || help || atlas || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement;
      if (target.isContentEditable || /^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(target.tagName)) return;
      if (event.code === 'Space') { event.preventDefault(); setPaused(value => !value); }
      else if (event.code === 'ArrowRight') { event.preventDefault(); next(1); }
      else if (event.code === 'ArrowLeft') { event.preventDefault(); next(-1); }
      else if (event.key.toLowerCase() === 'r') { setPreset('home'); setReset(value => value + 1); }
    };
    window.addEventListener('keydown', keyboard);
    return () => window.removeEventListener('keydown', keyboard);
  }, [details, help, atlas, next]);

  return <main className={`deep-space destination-${selected}`} style={{ '--deep-accent': destination.accent } as CSSProperties}>
    <a className="skip-link" href="#deep-destinations">Skip to Deep Space destinations</a>
    <header className="deep-header">
      <button className="return-solar" onClick={onReturn}><ArrowLeft size={16} /><span>Solar system</span></button>
      <div className="deep-brand"><Sparkles size={17} strokeWidth={1.2} /><span>DEEP SPACE<small>AN ATLAS OF THE COSMOS</small></span></div>
      <button className="deep-help icon-button" aria-label="Deep Space controls and model notes" onClick={() => setHelp(true)}><CircleHelp size={19} /></button>
    </header>

    <div className="deep-scene" aria-label={`Interactive model: ${destination.title}`}>
      {!unavailable && <Suspense fallback={null}><DeepScene selected={selected} quality={quality} paused={paused || details || help || atlas} labels={labels} preset={preset} reset={reset} zoom={zoom} onReady={onReady} onError={onError} /></Suspense>}
      {status === 'loading' && <div className="scene-loading" role="status"><span className="loading-ring" />Opening {destination.shortTitle}…</div>}
      {unavailable && <div className="deep-unavailable"><span className={`cosmic-art art-${selected}`} aria-hidden="true" /><span className="eyebrow">3D VIEW UNAVAILABLE</span><p>{status === 'unsupported' ? 'This browser could not start WebGL 2.' : 'The graphics scene could not be rendered.'} You can still read the field notes or return to the planets.</p><button onClick={() => { setStatus(supportsWebGL2() ? 'loading' : 'unsupported'); setReset(value => value + 1); }}>Retry 3D <RotateCcw size={13} /></button></div>}
    </div>

    <section className="deep-introduction" aria-live="polite">
      <div className="section-marker"><span />{destination.category}</div>
      <h1 ref={heading} tabIndex={-1}>{destination.title}</h1>
      <p className="deep-subtitle">{destination.subtitle}</p>
      <p className="deep-description">{destination.description}</p>
      <button className="deep-read" onClick={() => setDetails(true)}>Read the field notes <ArrowRight size={16} /></button>
      <dl className="deep-metrics">{destination.metrics.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    </section>

    <div className="deep-view-label"><span className="status-dot" />{selected === 'wormhole' ? 'THEORETICAL · NOT OBSERVED' : selected === 'black-hole' ? 'LIGHT-BENDING STUDY' : 'ILLUSTRATIVE 3D MODEL'}</div>
    {!unavailable && <div className="deep-camera camera-toolbar" aria-label="Deep Space camera controls">
      <button className="icon-button" aria-label="Zoom in" onClick={() => setZoom(value => ({ sequence: value.sequence + 1, direction: 1 }))}><Plus size={18} /></button><span />
      <button className="icon-button" aria-label="Zoom out" onClick={() => setZoom(value => ({ sequence: value.sequence + 1, direction: -1 }))}><Minus size={18} /></button><span />
      <button className="icon-button" aria-label="Reset Deep Space camera" onClick={() => setCamera('home')}><RotateCcw size={16} /></button>
    </div>}

    <div className="deep-scene-footer">
      <div className="deep-perspectives" aria-label="Camera perspectives"><Eye size={13} /><button aria-pressed={preset === 'home'} onClick={() => setCamera('home')}>Signature view</button><button aria-pressed={preset === 'above'} onClick={() => setCamera('above')}>From above</button><button aria-pressed={preset === 'edge'} onClick={() => setCamera('edge')}>Edge-on</button></div>
      <span className="deep-scale-note">{metadata.note}</span>
    </div>

    <footer className="deep-dock">
      <div className="deep-dock-top"><button ref={atlasTrigger} className="deep-browse" onClick={() => setAtlas(true)} aria-label={`Browse all ${DESTINATIONS.length} destinations`}><Grid2X2 size={13} /><span>All destinations</span><span className="deep-count">{DESTINATIONS.length}</span><ChevronRight size={12} /></button><div className="deep-playback">
        {selected === 'milky-way' && <label className="deep-label-toggle"><input type="checkbox" checked={labels} onChange={event => setLabels(event.target.checked)} />Home marker</label>}
        <label className="deep-quality"><span>Detail</span><select aria-label="Deep Space graphics quality" value={quality} onChange={event => setQuality(event.target.value as Quality)}><option value="auto">Balanced</option><option value="high">High</option><option value="low">Low</option></select></label>
        <button aria-label={paused ? 'Resume Deep Space motion' : 'Pause Deep Space motion'} onClick={() => setPaused(value => !value)}>{paused ? <Play size={13} /> : <Pause size={13} />}<span>{paused ? 'Paused' : 'Motion'}</span></button>
      </div></div>
      <nav ref={navigation} id="deep-destinations" className="deep-destinations" aria-label="Deep Space destinations">{DESTINATIONS.map((item, index) => <button key={item.id} className={`deep-destination ${selected === item.id ? 'selected' : ''}`} aria-current={selected === item.id ? 'true' : undefined} aria-label={`Explore ${item.shortTitle}`} onClick={() => choose(item.id)}>
        <span className={`cosmic-art art-${item.id}`} aria-hidden="true" /><span className="deep-destination-copy"><span className="deep-card-number">{String(index + 1).padStart(2, '0')} / {DESTINATION_META[item.id].label}</span><strong>{item.shortTitle}</strong></span><ArrowUpRight size={16} />
      </button>)}</nav>
      <div className="deep-dock-bottom"><span><Orbit size={12} />Drag to orbit · scroll or pinch to zoom</span><span>AN EXPLORATION BY RAKESH KUMAR</span><div><span aria-label={`Destination ${currentIndex + 1} of ${DESTINATIONS.length}`}>{String(currentIndex + 1).padStart(2, '0')} / {DESTINATIONS.length}</span><button aria-label="Previous Deep Space destination" onClick={() => next(-1)}><ChevronLeft size={16} /></button><button aria-label="Next Deep Space destination" onClick={() => next(1)}><ChevronRight size={16} /></button></div></div>
    </footer>

    {atlas && <Dialog title="Choose your next horizon." label={`COSMIC ATLAS / ${DESTINATIONS.length} DESTINATIONS`} onClose={() => setAtlas(false)} wide>
      <p className="dialog-intro">From our home galaxy to stellar nurseries, distant worlds, and the edge of theory.</p>
      <label className="atlas-search"><Search size={16} /><span className="sr-only">Search destinations</span><input type="search" aria-label="Search destinations" placeholder="Search the cosmos…" value={query} onChange={event => setQuery(event.target.value)} /></label>
      <div className="atlas-filters" aria-label="Destination collections">{(['All', ...COLLECTIONS] as const).map(group => <button key={group} aria-pressed={group === collection} onClick={() => setCollection(group)}>{group}</button>)}</div>
      <p className="atlas-results" role="status">{matches.length} {matches.length === 1 ? 'destination' : 'destinations'}{collection !== 'All' ? ` · ${collection}` : ''}</p>
      <div className="atlas-grid">{matches.map(item => <button key={item.id} className={`atlas-card ${item.id === selected ? 'selected' : ''}`} aria-label={`Open ${item.shortTitle}`} onClick={() => { choose(item.id); setAtlas(false); }}>
        <span className={`cosmic-art art-${item.id}`} aria-hidden="true" /><span className="atlas-card-copy"><small>{DESTINATION_META[item.id].label}</small><strong>{item.shortTitle}</strong><span>{item.subtitle}</span>{item.id === 'wormhole' && <em>Hypothetical · not observed</em>}</span><ArrowUpRight size={15} />
      </button>)}</div>
      {matches.length === 0 && <div className="atlas-empty"><p>No destinations match your search.</p><button onClick={() => { setQuery(''); setCollection('All'); }}>Show all destinations</button></div>}
    </Dialog>}
    {details && <Dialog title={destination.title} label="FIELD NOTES" onClose={() => setDetails(false)}>
      <p className="detail-lead">{destination.subtitle}</p>{destination.facts.map(fact => <section key={fact.title}><h3>{fact.title}</h3><p className="detail-description">{fact.text}</p></section>)}
      <h3>About this model</h3><p className="detail-description">{destination.modelNote}</p><a className="source-link" href={destination.source} target="_blank" rel="noreferrer">{destination.sourceLabel}<ArrowUpRight size={15} /></a>
    </Dialog>}
    {help && <Dialog title="A little farther from home." label="DEEP SPACE / EXPLORER’S GUIDE" onClose={() => setHelp(false)}>
      <p className="detail-description">Explore {DESTINATIONS.length} destinations across galaxies, the life of stars, planetary systems, and theory. Open All destinations to browse or search the collection. Each scene is an illustrative model; its field notes explain the science, assumptions, and source.</p>
      <h3>Make yourself at home</h3><p className="detail-description">Drag to orbit, scroll or pinch to zoom, or choose a camera perspective. Low detail reduces the graphics workload. Return to Solar system to continue from your previous planet and settings.</p>
      <dl className="shortcuts"><div><dt>Space</dt><dd>Pause / resume motion</dd></div><div><dt>← →</dt><dd>Previous / next destination</dd></div><div><dt>R</dt><dd>Reset camera</dd></div><div><dt>Esc</dt><dd>Close an open dialog</dd></div></dl>
      <p className="source-note">Reduced-motion preferences are respected on entry. Pulsar rotation is slowed for viewing. The wormhole is clearly labelled hypothetical. Galaxy and cluster points are generated illustrations, not catalog positions. No third-party deep-space image textures are used.</p>
    </Dialog>}
  </main>;
}
