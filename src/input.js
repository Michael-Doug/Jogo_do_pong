import { FIELD } from './config.js';

const LEFT_KEYS = { up: ['KeyW'], down: ['KeyS'] };
const RIGHT_KEYS = { up: ['ArrowUp'], down: ['ArrowDown'] };

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.pressed = new Set();
    this.pointers = new Map();
    this.onAction = () => {};
    this.active = false;
    this.bind();
  }

  bind() {
    window.addEventListener('keydown', (event) => {
      if (event.repeat) return;
      this.pressed.add(event.code);
      // Fora da partida as setas e o espaço continuam sendo do navegador, senão
      // o teclado não ativa os botões nem rola o menu em tela baixa.
      if (this.active && ['ArrowUp', 'ArrowDown'].includes(event.code)) event.preventDefault();
      this.onAction(event.code);
    });

    window.addEventListener('keyup', (event) => this.pressed.delete(event.code));
    window.addEventListener('blur', () => this.pressed.clear());

    const toField = (event) => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) / rect.width) * FIELD.width,
        y: ((event.clientY - rect.top) / rect.height) * FIELD.height,
      };
    };

    this.canvas.addEventListener('pointerdown', (event) => {
      this.canvas.setPointerCapture(event.pointerId);
      const point = toField(event);
      // O lado é fixado no toque: arrastar além do meio não pode roubar a
      // raquete do outro jogador.
      point.side = point.x < FIELD.width / 2 ? 'left' : 'right';
      this.pointers.set(event.pointerId, point);
    });
    this.canvas.addEventListener('pointermove', (event) => {
      const tracked = this.pointers.get(event.pointerId);
      if (!tracked) return;
      Object.assign(tracked, toField(event));
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

  // O ponteiro comanda a raquete da sua metade; no modo solo, de qualquer ponto.
  pointerTarget(side, singlePlayer) {
    for (const point of this.pointers.values()) {
      if (singlePlayer || point.side === side) return point.y;
    }
    return null;
  }

  clear() {
    this.pressed.clear();
    this.pointers.clear();
  }
}
