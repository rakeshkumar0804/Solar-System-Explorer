import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeftRight, ArrowUpRight, X } from 'lucide-react';
import { BODIES, COMPARISON_PRESETS, PRESENTATION, getBody } from './catalog';
import { getDiameterKm } from '../utils/comparison';
import { scaledDiameters } from './math';

export function Dialog({ title, label, children, onClose, wide = false }: { title: string; label: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    dialog?.showModal();
    return () => { dialog?.close(); previous?.focus(); };
  }, []);
  return <dialog ref={ref} className={`explorer-dialog ${wide ? 'wide' : ''}`} aria-label={title}
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => { if (event.target === ref.current) {
      const rect = ref.current.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    } }}>
    <div className="dialog-heading"><div><span className="eyebrow">{label}</span><h2>{title}</h2></div>
      <button className="icon-button" aria-label="Close dialog" onClick={onClose} autoFocus><X size={19} /></button></div>
    {children}
  </dialog>;
}

export function Comparison({ selected, onClose }: { selected: string; onClose: () => void }) {
  const [a, setA] = useState(selected);
  const [b, setB] = useState(selected === 'earth' ? 'moon' : 'earth');
  const first = getBody(a), second = getBody(b);
  const diameterA = getDiameterKm(first), diameterB = getDiameterKm(second);
  const scales = scaledDiameters(diameterA, diameterB, 142);
  const ratioLabel = scales.ratio === null ? '—' : scales.ratio < 0.01 ? scales.ratio.toPrecision(3) : scales.ratio.toFixed(2);
  const rows = [
    ['Diameter', `${diameterA.toLocaleString()} km`, `${diameterB.toLocaleString()} km`],
    ['Mass', first.stats.mass, second.stats.mass],
    ['Surface gravity', first.stats.gravity, second.stats.gravity],
    ['Distance from Sun', first.stats.distanceFromSun, second.stats.distanceFromSun],
    ['Rotation period', first.stats.rotationPeriod, second.stats.rotationPeriod],
    ['Orbital period', first.stats.orbitalPeriod, second.stats.orbitalPeriod],
    ['Temperature', first.stats.temperature, second.stats.temperature],
  ];
  return <Dialog title="A sense of scale." label="COMPARE WORLDS" onClose={onClose} wide>
    <p className="dialog-intro">See how two worlds measure up. Circle diameters preserve the actual size ratio.</p>
    <div className="comparison-presets">{COMPARISON_PRESETS.map(preset => <button key={preset.label} className={a === preset.a && b === preset.b ? 'active' : ''}
      onClick={() => { setA(preset.a); setB(preset.b); }}>{preset.label}</button>)}</div>
    <div className="compare-selectors"><label>FIRST WORLD<select value={a} onChange={event => setA(event.target.value)}>{BODIES.map(body => <option value={body.id} key={body.id}>{PRESENTATION[body.id].title}</option>)}</select></label>
      <button className="icon-button" aria-label="Swap compared worlds" onClick={() => { setA(b); setB(a); }}><ArrowLeftRight size={18} /></button>
      <label>SECOND WORLD<select value={b} onChange={event => setB(event.target.value)}>{BODIES.map(body => <option value={body.id} key={body.id}>{PRESENTATION[body.id].title}</option>)}</select></label></div>
    <div className="scale-comparison" aria-label={`Diameter ratio: ${PRESENTATION[a].title} to ${PRESENTATION[b].title} is ${ratioLabel} to 1`}>
      {[{ id: a, size: scales.a, diameter: diameterA }, { id: b, size: scales.b, diameter: diameterB }].map((item, index) => <div className="scale-world" key={index}>
        <div className="scale-orb-space"><span className={`planet-thumbnail planet-${item.id}`} style={{ width: item.size, height: item.size, backgroundImage: `url(/textures/thumbs/${item.id}.webp)` }} /></div>
        <strong>{PRESENTATION[item.id].title}</strong><span>{item.diameter.toLocaleString()} km</span>
      </div>)}
      <div className="scale-ratio"><strong>{ratioLabel}<span>×</span></strong><span>diameter ratio</span></div>
    </div>
    <p className="scale-caption">{a === b ? 'You’re comparing the same world.' : `${PRESENTATION[a].title} has ${ratioLabel} times the diameter of ${PRESENTATION[b].title}.`} {Math.min(scales.a, scales.b) < 10 && 'The smaller world is tiny at this true scale.'}</p>
    <div className="comparison-table-wrap"><table className="comparison-table"><thead><tr><th scope="col">PROPERTY</th><th scope="col">{PRESENTATION[a].title}</th><th scope="col">{PRESENTATION[b].title}</th></tr></thead><tbody>{rows.map(row => <tr key={row[0]}><th scope="row">{row[0]}</th><td>{row[1]}</td><td>{row[2]}</td></tr>)}</tbody></table></div>
    <p className="source-note">Rounded reference values. Temperature ranges and measurement conventions vary by body; these are not live measurements.</p>
  </Dialog>;
}

export function PlanetDetails({ selected, onClose }: { selected: string; onClose: () => void }) {
  const body = getBody(selected);
  const info = PRESENTATION[selected];
  return <Dialog title={info.title} label={info.eyebrow} onClose={onClose}>
    <p className="detail-lead">{info.subtitle}</p><p className="detail-description">{body.overview}</p>
    <div className="detail-stats"><div><span>DIAMETER</span><strong>{getDiameterKm(body).toLocaleString()} km</strong></div><div><span>GRAVITY</span><strong>{body.stats.gravity}</strong></div></div>
    <h3>Inside this world</h3><p className="detail-description">{body.geology}</p>
    <h3>Atmosphere</h3><ul className="detail-list">{body.stats.atmosphere.map(item => <li key={item}>{item}</li>)}</ul>
    <h3>A closer look</h3><ul className="detail-list">{body.funFacts.slice(0, 2).map(item => <li key={item}>{item}</li>)}</ul>
    {selected === 'pluto' && <p className="source-note">Pluto uses a grayscale New Horizons mosaic. Dark unmapped southern terrain represents missing image coverage.</p>}
    <a className="source-link" href="https://science.nasa.gov/solar-system/" target="_blank" rel="noreferrer">Explore NASA Solar System resources <ArrowUpRight size={15} /></a>
  </Dialog>;
}

export function About({ onClose }: { onClose: () => void }) {
  return <Dialog title="Made for the curious." label="ABOUT THIS EXPLORER" onClose={onClose}>
    <p className="detail-description">A visual journey through our solar system, created by Rakesh Kumar.</p>
    <h3>What you’re seeing</h3><p className="detail-description">Planet surfaces use imagery-based maps with simulated sunlight. The overview compresses both planet sizes and orbital distances. Earth–Moon separation is also compressed for readability. Animation speeds and positions are illustrative, not a prediction of the sky.</p>
    <h3>Imagery & credits</h3><p className="detail-description">Planet, Sun, Moon, cloud, night-light, normal, specular, and Saturn ring maps: Solar System Scope / INOVE, licensed under Creative Commons Attribution 4.0. Maps are based on NASA imagery, with adjusted colours and some reconstructed areas. Thumbnails are resized and compressed; Earth normal and specular files are converted from TIFF to JPEG.</p>
    <a className="source-link" href="https://www.solarsystemscope.com/textures/" target="_blank" rel="noreferrer">Solar System Scope textures <ArrowUpRight size={15} /></a>
    <a className="source-link" href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0 licence <ArrowUpRight size={15} /></a>
    <p className="detail-description">Pluto: NASA / JHUAPL / SwRI / Lunar and Planetary Institute, via USGS Astrogeology (public domain). Grayscale New Horizons global mosaic, July 2017.</p>
    <a className="source-link" href="https://www.usgs.gov/media/images/pluto-global-mosaic-new-horizons-july-2017" target="_blank" rel="noreferrer">Pluto mosaic source <ArrowUpRight size={15} /></a>
    <h3>Keyboard controls</h3><dl className="shortcuts"><div><dt>Space</dt><dd>Pause / resume animation</dd></div><div><dt>← →</dt><dd>Previous / next world</dd></div><div><dt>1–8</dt><dd>Mercury through Neptune</dd></div><div><dt>0 / 9</dt><dd>Sun / Pluto</dd></div><div><dt>C</dt><dd>Compare worlds</dd></div><div><dt>O</dt><dd>System overview</dd></div><div><dt>Esc</dt><dd>Close an open panel</dd></div></dl>
  </Dialog>;
}
