import { FIELD } from './config.js';

const LEFT_KEYS = { up: ['KeyW'], down: ['KeyS'] };
const RIGHT_KEYS = { up: ['ArrowUp'], down: ['ArrowDown'] };

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.pressed = new Set();
    this.pointers = new Map();
    this.onAction = () => {};
    this.bind();
  }

  bind() {
    window.addEventListener('keydown', (event) => {
      if (event.repeat) return;
      this.pressed.add(event.code);
      if (['ArrowUp', 'ArrowDown', 'Space'].includes(event.code)) event.preventDefault();
      this.onAction(event.code);
    });

    window.addEventListener('keyup', (event) => this.pressed.delete(event.code));
    window.addEventListener('blur', () => this.pressed.clear());

    const track = (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * FIELD.width;
      const y = ((event.clientY - rect.top) / rect.height) * FIELD.height;
      this.pointers.set(event.pointerId, { x, y });
    };

    this.canvas.addEventListener('pointerdown', (event) => {
      this.canvas.setPointerCapture(event.pointerId);
      track(event);
    });
    this.canvas.addEventListener('pointermove', (event) => {
      if (this.pointers.has(event.pointerId)) track(event);
    });
    const release = (event) => this.pointers.delete(event.pointerId);
    this.canvas.addEventListener('pointerup', release);
    this.canvas.addEventListener('pointercancel', release);
  }

  axis(side) {
    const keys = side === 'left' ? LEFT_KEYS : RIGHT_KEYS;
    const up = keys.up.some((code) => this.pressed.has(code));
    const down = keys.down.some((code) => this.pressed.has(code));
    return Number(down) - Number(up);
  }

  // A pointer steers the paddle on its own half; in single player it steers from anywhere.
  pointerTarget(side, singlePlayer) {
    for (const point of this.pointers.values()) {
      if (singlePlayer) return point.y;
      const onLeftHalf = point.x < FIELD.width / 2;
      if (onLeftHalf === (side === 'left')) return point.y;
    }
    return null;
  }

  clear() {
    this.pressed.clear();
    this.pointers.clear();
  }
}
