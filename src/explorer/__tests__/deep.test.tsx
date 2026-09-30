import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import type { SceneProps } from '../SolarScene';
import type { DeepSceneProps } from '../deep/DeepScene';
import { cameraPosition, graphicsDpr, DESTINATIONS, QUALITY_BUDGETS, CAMERA_LIMITS, EXPANDED_BUDGETS, VOLUME_DESTINATIONS } from '../deep/catalog';
import { clusterStars, galaxyStars } from '../deep/particles';
import { andromedaStars, beltBodies, fieldStars, noiseVolume, orbitPoint, remnantFilaments, TRAPPIST_PLANETS } from '../deep/expandedParticles';
import { cometNucleusGeometry, pulsarFieldGeometry, wormholeGeometry } from '../deep/expandedGeometry';
import { DESTINATION_META, matchDestinations } from '../deep/expansionCatalog';

const { support } = vi.hoisted(() => ({ support: vi.fn(() => true) }));
vi.mock('../webgl', () => ({ supportsWebGL2: support }));
// Deliberately mock both renderers: these verify navigation/state, not browser/WebGL rendering.
vi.mock('../SolarScene', () => ({ default: function MockSolar(props: SceneProps) {
  const { onReady } = props;
  useEffect(() => { onReady(); }, [onReady]);
  return <div data-testid="solar-scene" data-world={props.selected} data-quality={props.quality} data-paused={String(props.paused)} data-mode={props.mode} />;
} }));
vi.mock('../deep/DeepScene', () => ({ default: function MockDeep(props: DeepSceneProps) {
  const { onReady, selected } = props;
  useEffect(() => { onReady(); }, [onReady, selected]);
  return <div data-testid="deep-scene" data-world={selected} data-quality={props.quality} data-paused={String(props.paused)} data-preset={props.preset} data-reset={props.reset} data-zoom={props.zoom.sequence}>
    <button onClick={props.onError}>Simulate Deep Space failure</button>
  </div>;
} }));
beforeEach(() => { support.mockReturnValue(true); });
afterEach(() => { cleanup(); vi.clearAllMocks(); });
const enter = async () => { await userEvent.click(screen.getByRole('button', { name: 'Deep space' })); return screen.findByTestId('deep-scene'); };

describe('Deep Space chapter boundaries', () => {
  it('unmounts the solar renderer while preserving planet, speed, pause, and quality on return', async () => {
    render(<App />);
    await screen.findByTestId('solar-scene');
    await userEvent.click(screen.getByRole('button', { name: 'Explore Saturn' }));
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Animation speed' }), '5');
    await userEvent.click(screen.getByRole('button', { name: 'Pause animation' }));
    await userEvent.click(screen.getByRole('button', { name: 'Display settings' }));
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Graphics quality' }), 'low');
    const scene = await enter();
    expect(scene.getAttribute('data-world')).toBe('milky-way');
    expect(screen.queryByTestId('solar-scene')).toBeNull();
    fireEvent.keyDown(document.body, { key: '2', code: 'Digit2' });
    await userEvent.click(screen.getByRole('button', { name: 'Solar system' }));
    const solar = await screen.findByTestId('solar-scene');
    expect(solar.getAttribute('data-world')).toBe('saturn');
    expect(solar.getAttribute('data-paused')).toBe('true');
    expect(solar.getAttribute('data-quality')).toBe('low');
    expect((screen.getByRole('combobox', { name: 'Animation speed' }) as HTMLSelectElement).value).toBe('5');
    expect(screen.queryByTestId('deep-scene')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Deep space' }));
  });
  it('returns to system overview when that was the previous view', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'System view' }));
    await enter();
    await userEvent.click(screen.getByRole('button', { name: 'Solar system' }));
    expect((await screen.findByTestId('solar-scene')).getAttribute('data-mode')).toBe('overview');
  });
  it('switches every destination and updates heading, model, and field notes together', async () => {
    render(<App />);
    const scene = await enter();
    for (const destination of DESTINATIONS) {
      await userEvent.click(screen.getByRole('button', { name: `Explore ${destination.shortTitle}` }));
      expect(scene.getAttribute('data-world')).toBe(destination.id);
      expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(destination.title);
      await userEvent.click(screen.getByRole('button', { name: 'Read the field notes' }));
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByRole('link', { name: destination.sourceLabel }).getAttribute('href')).toBe(destination.source);
      expect(within(dialog).getByText(destination.modelNote)).toBeTruthy();
      await userEvent.click(within(dialog).getByRole('button', { name: 'Close dialog' }));
    }
  });
  it('scopes arrow shortcuts to the active chapter and wraps destination navigation', async () => {
    render(<App />);
    const scene = await enter();
    fireEvent.keyDown(document.body, { code: 'ArrowLeft', key: 'ArrowLeft' });
    expect(scene.getAttribute('data-world')).toBe('wormhole');
    fireEvent.keyDown(document.body, { code: 'ArrowRight', key: 'ArrowRight' });
    expect(scene.getAttribute('data-world')).toBe('milky-way');
    await userEvent.click(screen.getByRole('button', { name: 'Solar system' }));
    expect((await screen.findByTestId('solar-scene')).getAttribute('data-world')).toBe('earth');
  });
  it('pauses for field notes and restores the prior motion setting', async () => {
    render(<App />);
    const scene = await enter();
    await userEvent.click(screen.getByRole('button', { name: 'Read the field notes' }));
    expect(scene.getAttribute('data-paused')).toBe('true');
    await userEvent.click(screen.getByRole('button', { name: 'Close dialog' }));
    expect(scene.getAttribute('data-paused')).toBe('false');
    await userEvent.click(screen.getByRole('button', { name: 'Pause Deep Space motion' }));
    await userEvent.click(screen.getByRole('button', { name: 'Read the field notes' }));
    await userEvent.click(screen.getByRole('button', { name: 'Close dialog' }));
    expect(scene.getAttribute('data-paused')).toBe('true');
  });
  it('keeps form keyboard behavior and supports explicit perspective and quality controls', async () => {
    render(<App />);
    const scene = await enter();
    const quality = screen.getByRole('combobox', { name: 'Deep Space graphics quality' });
    await userEvent.selectOptions(quality, 'low');
    fireEvent.keyDown(quality, { code: 'Space', key: ' ' });
    expect(scene.getAttribute('data-paused')).toBe('false');
    expect(scene.getAttribute('data-quality')).toBe('low');
    await userEvent.click(screen.getByRole('button', { name: 'From above' }));
    expect(scene.getAttribute('data-preset')).toBe('above');
    await userEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(scene.getAttribute('data-zoom')).toBe('1');
    await userEvent.click(screen.getByRole('button', { name: 'Explore Black hole' }));
    expect(scene.getAttribute('data-preset')).toBe('home');
    expect(scene.getAttribute('data-zoom')).toBe('0');
  });
  it('keeps field notes and return navigation working without WebGL', async () => {
    support.mockReturnValue(false);
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Deep space' }));
    await screen.findByText('3D VIEW UNAVAILABLE');
    expect(screen.queryByTestId('deep-scene')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Explore Black hole' }));
    await userEvent.click(screen.getByRole('button', { name: 'Read the field notes' }));
    expect(screen.getByText('Black holes are not portals')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Close dialog' }));
    await userEvent.click(screen.getByRole('button', { name: 'Solar system' }));
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Earth');
  });
  it('can retry a failed scene without losing the selected destination', async () => {
    render(<App />);
    await enter();
    await userEvent.click(screen.getByRole('button', { name: 'Explore Black hole' }));
    await userEvent.click(screen.getByRole('button', { name: 'Simulate Deep Space failure' }));
    expect(screen.getByText('3D VIEW UNAVAILABLE')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Retry 3D' }));
    expect((await screen.findByTestId('deep-scene')).getAttribute('data-world')).toBe('black-hole');
  });
  it('filters and searches the atlas, then opens the chosen scene and restores motion', async () => {
    render(<App />);
    const scene = await enter();
    const browse = screen.getByRole('button', { name: 'Browse all 11 destinations' });
    await userEvent.click(browse);
    expect(scene.getAttribute('data-paused')).toBe('true');
    const dialog = screen.getByRole('dialog', { name: 'Choose your next horizon.' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Life of stars' }));
    expect(within(dialog).getAllByRole('button', { name: /^Open / })).toHaveLength(4);
    const search = within(dialog).getByRole('searchbox', { name: 'Search destinations' });
    await userEvent.type(search, 'neutron');
    expect(within(dialog).getAllByRole('button', { name: /^Open / })).toHaveLength(1);
    fireEvent.keyDown(search, { code: 'ArrowRight', key: 'ArrowRight' });
    expect(scene.getAttribute('data-world')).toBe('milky-way');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Open Pulsar' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(scene.getAttribute('data-world')).toBe('pulsar');
    expect(scene.getAttribute('data-paused')).toBe('false');
    expect(document.activeElement).toBe(browse);
  });
  it('recovers an empty atlas search and identifies theory before opening it', async () => {
    render(<App />); const scene = await enter();
    await userEvent.click(screen.getByRole('button', { name: 'Browse all 11 destinations' }));
    const dialog = screen.getByRole('dialog');
    await userEvent.type(within(dialog).getByRole('searchbox'), 'unlisted destination');
    expect(within(dialog).getByText('No destinations match your search.')).toBeTruthy();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Show all destinations' }));
    expect(within(dialog).getAllByRole('button', { name: /^Open / })).toHaveLength(11);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Theoretical' }));
    expect(within(dialog).getByText('Hypothetical · not observed')).toBeTruthy();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Open Wormhole' }));
    expect(scene.getAttribute('data-world')).toBe('wormhole');
    expect(screen.getByText('THEORETICAL · NOT OBSERVED')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Next Deep Space destination' }));
    expect(scene.getAttribute('data-world')).toBe('milky-way');
  });
  it('restores a manually paused scene after closing the atlas and keeps fallback navigation usable', async () => {
    render(<App />); const scene = await enter();
    await userEvent.click(screen.getByRole('button', { name: 'Pause Deep Space motion' }));
    await userEvent.click(screen.getByRole('button', { name: 'Browse all 11 destinations' }));
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { bubbles: false, cancelable: true }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(scene.getAttribute('data-paused')).toBe('true');
    await userEvent.click(screen.getByRole('button', { name: 'Explore Orion Nebula' }));
    await userEvent.click(screen.getByRole('button', { name: 'Simulate Deep Space failure' }));
    await userEvent.click(screen.getByRole('button', { name: 'Browse all 11 destinations' }));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Open Comet' }));
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('A passing comet');
    await userEvent.click(screen.getByRole('button', { name: 'Retry 3D' }));
    expect((await screen.findByTestId('deep-scene')).getAttribute('data-world')).toBe('comet');
  });
  it('returns to the approved planet and quality after exploring the entire expanded collection', async () => {
    render(<App />); await screen.findByTestId('solar-scene');
    await userEvent.click(screen.getByRole('button', { name: 'Explore Jupiter' }));
    await userEvent.click(screen.getByRole('button', { name: 'Display settings' }));
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Graphics quality' }), 'high');
    await enter();
    for (const destination of DESTINATIONS.slice(3)) await userEvent.click(screen.getByRole('button', { name: `Explore ${destination.shortTitle}` }));
    await userEvent.click(screen.getByRole('button', { name: 'Solar system' }));
    const solar = await screen.findByTestId('solar-scene');
    expect(solar.getAttribute('data-world')).toBe('jupiter');
    expect(solar.getAttribute('data-quality')).toBe('high');
    expect(screen.queryByTestId('deep-scene')).toBeNull();
  });
});

describe('Bounded illustrative models', () => {
  it('generates deterministic finite geometry within the declared point budget', () => {
    for (const generate of [galaxyStars, clusterStars]) {
      const first = generate(512), second = generate(512);
      expect(first).toEqual(second);
      expect(first.positions.length).toBe(512 * 3);
      for (const array of Object.values(first)) expect(Array.from(array).every(Number.isFinite)).toBe(true);
      expect(Math.max(...first.positions.map(Math.abs))).toBeLessThan(12);
    }
  });
  it('caps black-hole pixel work on high-resolution displays', () => {
    for (const [quality, cap] of [['low', 320000], ['auto', 650000], ['high', 1200000]] as const) {
      const dpr = graphicsDpr('black-hole', quality, 3840, 2160, 3);
      expect(3840 * 2160 * dpr * dpr).toBeLessThanOrEqual(cap + 0.01);
      expect(dpr).toBeGreaterThan(0);
    }
    expect(Number.isFinite(graphicsDpr('milky-way', 'auto', 0, 0, 1))).toBe(true);
  });
  it('keeps orbit cameras outside the objects and bounds the shader workload at every quality', () => {
    for (const destination of DESTINATIONS) for (const preset of ['home', 'above', 'edge'] as const) {
      const position = cameraPosition(destination.id, preset);
      expect(Math.hypot(...position)).toBeGreaterThan(12);
      expect(Math.hypot(...cameraPosition(destination.id, preset, true))).toBeGreaterThan(Math.hypot(...position));
      const [minimum, maximum] = CAMERA_LIMITS[destination.id];
      expect(Math.hypot(...position)).toBeGreaterThanOrEqual(minimum);
      expect(Math.hypot(...cameraPosition(destination.id, preset, true))).toBeLessThanOrEqual(maximum);
    }
    expect(QUALITY_BUDGETS.low.galaxyStars).toBeLessThan(QUALITY_BUDGETS.auto.galaxyStars);
    expect(QUALITY_BUDGETS.auto.galaxyStars).toBeLessThan(QUALITY_BUDGETS.high.galaxyStars);
    for (const budget of Object.values(QUALITY_BUDGETS)) {
      expect(budget.raySteps).toBeLessThanOrEqual(112);
      expect(budget.maxDpr).toBeLessThanOrEqual(1.5);
    }
  });
  it('caps every volume at a bounded pixel count and ray-step budget', () => {
    for (const id of VOLUME_DESTINATIONS) for (const [quality, cap] of [['low', 180000], ['auto', 350000], ['high', 700000]] as const) {
      const dpr = graphicsDpr(id, quality, 3840, 2160, 3);
      expect(3840 * 2160 * dpr * dpr).toBeLessThanOrEqual(cap + 0.01);
      expect(EXPANDED_BUDGETS[quality].volumeSteps).toBeLessThanOrEqual(88);
    }
  });
  it('generates finite, repeatable star and belt buffers without exceeding the requested budget', () => {
    for (const generate of [fieldStars, andromedaStars, beltBodies]) {
      const a = generate(128), b = generate(128);
      expect(a).toEqual(b);
      expect(a.positions.length).toBe(384);
      for (const value of Object.values(a)) expect(Array.from(value).every(Number.isFinite)).toBe(true);
    }
    const bodies = beltBodies(1000);
    for (let i = 0; i < bodies.positions.length; i += 3) {
      const radius = Math.hypot(bodies.positions[i], bodies.positions[i + 2]);
      expect(radius >= 3.799 && radius <= 5.101 || radius >= 9.399 && radius <= 12.401).toBe(true);
    }
    expect(noiseVolume()).toEqual(noiseVolume());
    expect(noiseVolume().length).toBe(32 ** 3);
    const filaments = remnantFilaments(10, 20);
    expect(filaments.positions.length).toBe(10 * 20 * 2 * 3);
    expect(Array.from(filaments.positions).every(Number.isFinite)).toBe(true);
  });
  it('keeps generated mesh normals and indices valid', () => {
    for (const geometry of [wormholeGeometry(), wormholeGeometry(true), cometNucleusGeometry(), pulsarFieldGeometry()]) {
      for (const attribute of Object.values(geometry.attributes)) expect(Array.from(attribute.array).every(Number.isFinite)).toBe(true);
      if (geometry.index) for (const index of geometry.index.array) expect(index).toBeLessThan(geometry.attributes.position.count);
      geometry.dispose();
    }
  });
  it('keeps seven exoplanets on separate bounded orbits and marks theoretical content', () => {
    expect(TRAPPIST_PLANETS.map(planet => planet.letter)).toEqual(['b', 'c', 'd', 'e', 'f', 'g', 'h']);
    for (const planet of TRAPPIST_PLANETS) for (const t of [0, 1, 600, 36000]) expect(Math.hypot(...orbitPoint(planet.radius, planet.phase, planet.period, t))).toBeCloseTo(planet.radius, 8);
    expect(new Set(DESTINATIONS.map(item => item.id)).size).toBe(11);
    expect(DESTINATION_META.wormhole.collection).toBe('Theoretical');
    expect(matchDestinations(DESTINATIONS, '  ASTEROID   kuiper  ', 'All').map(item => item.id)).toEqual(['solar-frontiers']);
    expect(matchDestinations(DESTINATIONS, 'pulsar', 'Theoretical')).toEqual([]);
  });
});
