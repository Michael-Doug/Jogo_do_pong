import { Game } from '../src/game.js';

const noop = () => {};

export function createGame(mode = 'versus', difficulty = 'normal') {
  const input = {
    onAction: noop,
    axis: () => 0,
    pointerTarget: () => null,
    clear: noop,
  };

  const game = new Game({
    renderer: { draw: noop },
    input,
    audio: { unlock: noop, play: noop, pauseMusic: noop, resumeMusic: noop },
    onChange: noop,
  });

  game.start(mode, difficulty);
  return game;
}

export function advance(game, seconds, step = 1 / 120) {
  for (let elapsed = 0; elapsed < seconds; elapsed += step) {
    game.update(step);
  }
}
