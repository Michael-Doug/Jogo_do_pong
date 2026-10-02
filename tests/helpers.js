import { FIELD } from '../src/config.js';
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

function seededRandom(seed) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Joga a IA contra um adversário que devolve tudo, variando o ponto de contato.
// Os pontos do lado esquerdo são as bolas que a IA deixou passar. A semente fixa
// evita um teste estatístico instável.
export function measureOpponentMissRate(difficulty, matches = 8, seed = 20260202) {
  const realRandom = Math.random;
  Math.random = seededRandom(seed);

  let missed = 0;
  let faced = 0;

  try {
    for (let match = 0; match < matches; match += 1) {
      const game = createGame('single', difficulty);
      let target = FIELD.height / 2;
      let previousVx = 0;
      let guard = 0;

      while (game.state !== 'over' && guard < 2e6) {
        guard += 1;
        if (game.ball.vx < 0 && previousVx >= 0) {
          target = game.ball.y + (Math.random() - 0.5) * 70;
        }
        previousVx = game.ball.vx;
        game.leftPaddle.applyPosition(target, 1 / 120);
        game.update(1 / 120);
      }

      missed += game.score.left;
      faced += game.score.left + game.score.right;
    }
  } finally {
    Math.random = realRandom;
  }

  return missed / faced;
}
