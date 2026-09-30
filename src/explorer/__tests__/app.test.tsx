import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { SceneProps } from '../SolarScene';
import App from '../../App';

const { support } = vi.hoisted(() => ({ support: vi.fn(() => true) }));
vi.mock('../webgl', () => ({ supportsWebGL2: support }));
// These are React DOM/state integration tests, not WebGL or browser layout tests.
vi.mock('../SolarScene', () => ({ default: function MockSolarScene(props: SceneProps) {
  const { onReady } = props;
  useEffect(() => { onReady(); }, [onReady]);
  return <div data-testid="scene-state" data-world={props.selected} data-mode={props.mode} data-paused={String(props.paused)}>
    <button onClick={props.onError}>Simulate context loss</button>
  </div>;
} }));

beforeEach(() => { support.mockReturnValue(true); });
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe('Explorer interactions', () => {
  it('opens directly on Earth without a boot screen and can select every world', async () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Earth');
    await screen.findByTestId('scene-state');
    for (const name of ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Moon', 'The Sun']) {
      await userEvent.click(screen.getByRole('button', { name: `Explore ${name}` }));
      expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(name);
    }
  });

  it('Earth–Moon preset updates both selectors, diagram, and data together', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Compare' }));
    const dialog = screen.getByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Earth & Mars' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Earth & Moon' }));
    const selects = within(dialog).getAllByRole('combobox') as HTMLSelectElement[];
    expect(selects.map(select => select.value)).toEqual(['earth', 'moon']);
    expect(within(dialog).getByLabelText(/Diameter ratio: Earth to Moon is 3.67 to 1/)).toBeTruthy();
    expect(within(dialog).getAllByText('3,474 km').length).toBe(2);
    expect(within(dialog).queryByText('6,779 km')).toBeNull();
  });

  it('swaps comparison values and handles comparing a world with itself', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Compare' }));
    await userEvent.click(screen.getByRole('button', { name: 'Swap compared worlds' }));
    const selects = within(screen.getByRole('dialog')).getAllByRole('combobox') as HTMLSelectElement[];
    expect(selects.map(select => select.value)).toEqual(['moon', 'earth']);
    await userEvent.selectOptions(selects[0], 'earth');
    expect(screen.getByText('You’re comparing the same world.')).toBeTruthy();
    expect(screen.getByLabelText(/Earth to Earth is 1.00 to 1/)).toBeTruthy();
  });

  it('does not round a small but real diameter ratio to zero', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Compare' }));
    const selects = within(screen.getByRole('dialog')).getAllByRole('combobox');
    await userEvent.selectOptions(selects[0], 'pluto');
    await userEvent.selectOptions(selects[1], 'sun');
    expect(screen.getByLabelText(/Pluto to The Sun is 0.00171 to 1/)).toBeTruthy();
    expect(screen.getByText(/Pluto has 0.00171 times the diameter of The Sun/)).toBeTruthy();
  });

  it('pause and resume reach the renderer without changing the chosen speed', async () => {
    render(<App />);
    const scene = await screen.findByTestId('scene-state');
    const speed = screen.getByRole('combobox', { name: 'Animation speed' }) as HTMLSelectElement;
    await userEvent.selectOptions(speed, '5');
    await userEvent.click(screen.getByRole('button', { name: 'Pause animation' }));
    expect(scene.getAttribute('data-paused')).toBe('true');
    expect(speed.value).toBe('5');
    await userEvent.click(screen.getByRole('button', { name: 'Resume animation' }));
    expect(scene.getAttribute('data-paused')).toBe('false');
    expect(speed.value).toBe('5');
  });

  it('uses Space for pause without hijacking focused form controls', async () => {
    render(<App />);
    const scene = await screen.findByTestId('scene-state');
    fireEvent.keyDown(document.body, { code: 'Space', key: ' ' });
    expect(scene.getAttribute('data-paused')).toBe('true');
    const speed = screen.getByRole('combobox', { name: 'Animation speed' });
    fireEvent.keyDown(speed, { code: 'Space', key: ' ' });
    expect(scene.getAttribute('data-paused')).toBe('true');
  });

  it('freezes the scene while a dialog is open and restores playback after close', async () => {
    render(<App />);
    const scene = await screen.findByTestId('scene-state');
    await userEvent.click(screen.getByRole('button', { name: 'Discover Earth' }));
    expect(scene.getAttribute('data-paused')).toBe('true');
    await userEvent.click(screen.getByRole('button', { name: 'Close dialog' }));
    expect(scene.getAttribute('data-paused')).toBe('false');
  });

  it('switches to the explicitly compressed overview and back to a selected planet', async () => {
    render(<App />);
    const scene = await screen.findByTestId('scene-state');
    await userEvent.click(screen.getByRole('button', { name: 'System view' }));
    expect(scene.getAttribute('data-mode')).toBe('overview');
    expect(screen.getByText('Planet sizes & distances are compressed')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Explore Saturn' }));
    expect(scene.getAttribute('data-mode')).toBe('planet');
    expect(scene.getAttribute('data-world')).toBe('saturn');
  });

  it('keeps comparisons and details usable when WebGL is unavailable', async () => {
    support.mockReturnValue(false);
    render(<App />);
    expect(screen.getByText('STATIC PREVIEW · 3D UNAVAILABLE')).toBeTruthy();
    expect(screen.queryByTestId('scene-state')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Compare' }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByLabelText(/Earth to Moon is 3.67/)).toBeTruthy();
  });

  it('recovers from a scene failure on an explicit retry', async () => {
    render(<App />);
    await userEvent.click(await screen.findByRole('button', { name: 'Simulate context loss' }));
    expect(screen.getByText('STATIC PREVIEW · 3D UNAVAILABLE')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Retry 3D view' }));
    expect(await screen.findByTestId('scene-state')).toBeTruthy();
  });

  it('opens and closes display settings and changes graphics quality', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Display settings' }));
    const select = screen.getByRole('combobox', { name: 'Graphics quality' }) as HTMLSelectElement;
    await userEvent.selectOptions(select, 'low');
    expect(select.value).toBe('low');
    await userEvent.click(screen.getByRole('button', { name: 'Close settings' }));
    expect(screen.queryByRole('combobox', { name: 'Graphics quality' })).toBeNull();
  });

  it('Escape closes display settings even while a control has focus', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Display settings' }));
    const quality = screen.getByRole('combobox', { name: 'Graphics quality' });
    quality.focus();
    fireEvent.keyDown(quality, { key: 'Escape' });
    expect(screen.queryByRole('combobox', { name: 'Graphics quality' })).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Display settings' }));
  });
});
