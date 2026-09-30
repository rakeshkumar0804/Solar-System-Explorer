import { vi } from 'vitest';

Object.defineProperty(window, 'matchMedia', { writable: true, value: vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })) });
HTMLElement.prototype.scrollIntoView = vi.fn();
// jsdom does not implement the browser top-layer/focus-trap behavior. These shims
// support DOM integration checks only; real dialog focus still needs a browser.
HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
