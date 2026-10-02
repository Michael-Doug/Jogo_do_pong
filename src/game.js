import { DIFFICULTY, FIELD, MATCH, PALETTE } from './config.js';
import { Ball, Paddle } from './entities.js';
import { Opponent } from './ai.js';
import { Effects } from './effects.js';

const STEP = 1 / 120;
const MAX_FRAME = 0.25;

export class Game {
  constructor({ renderer, input, audio, onChange }) {
    this.renderer = renderer;
    this.input = input;
    this.audio = audio;
    this.onChange = onChange;

    this.leftPaddle = new Paddle('left', PALETTE.leftPaddle);
    this.rightPaddle = new Paddle('right', PALETTE.rightPaddle);
    this.ball = new Ball();
    this.effects = new Effects();

    this.state = 'menu';
    this.mode = 'single';
    this.difficultyKey = 'normal';
    this.score = { left: 0, right: 0 };
    this.serveTimer = 0;
    this.winner = null;
    this.accumulator = 0;
    this.lastTime = 0;

    this.input.onAction = (code) => this.handleAction(code);
  }

  start(mode, difficultyKey) {
    this.mode = mode;
    this.difficultyKey = difficultyKey;
    this.opponent = mode === 'single'
      ? new Opponent(this.rightPaddle, DIFFICULTY[difficultyKey])
      : null;

    this.score = { left: 0, right: 0 };
    this.winner = null;
    this.leftPaddle.reset();
    this.rightPaddle.reset();
    this.effects.clear();
    this.serve(Math.random() < 0.5 ? -1 : 1);
    this.audio.unlock();
  }

  serve(direction) {
    this.ball.reset(direction);
    this.serveTimer = MATCH.serveDelay;
    this.setState('serving');
  }

  setState(state) {
    this.state = state;
    this.onChange(this);
  }

  handleAction(code) {
    if (code !== 'Escape' && code !== 'KeyP') return;
    if (this.state === 'playing' || this.state === 'serving') this.pause();
    else if (this.state === 'paused') this.resume();
  }

  pause() {
    this.resumeState = this.state;
    this.audio.pauseMusic();
    this.setState('paused');
  }

  resume() {
    this.input.clear();
    this.audio.resumeMusic();
    this.setState(this.resumeState || 'playing');
  }

  quitToMenu() {
    this.audio.pauseMusic();
    this.ball.reset(1);
    this.effects.clear();
    this.setState('menu');
  }

  loop(timestamp) {
    const elapsed = this.lastTime ? (timestamp - this.lastTime) / 1000 : 0;
    this.lastTime = timestamp;
    this.accumulator += Math.min(elapsed, MAX_FRAME);

    while (this.accumulator >= STEP) {
      this.update(STEP);
      this.accumulator -= STEP;
    }

    this.renderer.draw(this);
    requestAnimationFrame((next) => this.loop(next));
  }

  update(dt) {
    this.effects.update(dt);
    if (this.state === 'paused' || this.state === 'over' || this.state === 'menu') return;

    this.updatePaddles(dt);

    if (this.state === 'serving') {
      this.serveTimer -= dt;
      if (this.serveTimer <= 0) {
        this.ball.serve();
        this.setState('playing');
      }
      return;
    }

    const previous = { x: this.ball.x, y: this.ball.y };
    this.ball.update(dt);
    this.bounceOffWalls();
    this.resolvePaddle(this.leftPaddle, previous);
    this.resolvePaddle(this.rightPaddle, previous);
    this.checkScoring();
  }

  updatePaddles(dt) {
    const singlePlayer = this.mode === 'single';
    this.steer(this.leftPaddle, dt, singlePlayer);

    if (this.opponent) this.opponent.update(this.ball, dt);
    else this.steer(this.rightPaddle, dt, false);
  }

  steer(paddle, dt, singlePlayer) {
    const pointerY = this.input.pointerTarget(paddle.side, singlePlayer);
    if (pointerY !== null) {
      paddle.moveTowards(pointerY, dt);
      return;
    }
    paddle.moveBy(this.input.axis(paddle.side), dt);
  }

  bounceOffWalls() {
    const { ball } = this;
    if (ball.y - ball.radius < 0 && ball.vy < 0) {
      ball.y = ball.radius;
      ball.vy = -ball.vy;
      this.effects.burst(ball.x, ball.y, PALETTE.ball, 6, 150);
    } else if (ball.y + ball.radius > FIELD.height && ball.vy > 0) {
      ball.y = FIELD.height - ball.radius;
      ball.vy = -ball.vy;
      this.effects.burst(ball.x, ball.y, PALETTE.ball, 6, 150);
    }
  }

  // Uses the previous position so a fast ball cannot tunnel through a paddle.
  resolvePaddle(paddle, previous) {
    const { ball } = this;
    const movingToward = paddle.side === 'left' ? ball.vx < 0 : ball.vx > 0;
    if (!movingToward) return;

    const plane = paddle.side === 'left' ? paddle.x + paddle.width : paddle.x;
    const edge = paddle.side === 'left' ? ball.x - ball.radius : ball.x + ball.radius;
    const previousEdge = paddle.side === 'left'
      ? previous.x - ball.radius
      : previous.x + ball.radius;

    const crossed = paddle.side === 'left'
      ? edge <= plane && previousEdge >= plane - paddle.width
      : edge >= plane && previousEdge <= plane + paddle.width;
    if (!crossed) return;

    const span = edge - previousEdge;
    const ratio = span === 0 ? 0 : (plane - previousEdge) / span;
    const progress = Math.min(Math.max(ratio, 0), 1);
    const contactY = previous.y + (ball.y - previous.y) * progress;
    if (contactY < paddle.top - ball.radius || contactY > paddle.bottom + ball.radius) return;

    ball.y = contactY;
    ball.deflect(paddle);
    this.effects.burst(ball.x, ball.y, paddle.color, 16, 300);
    this.effects.addShake(4);
    this.audio.play('hit');
  }

  checkScoring() {
    const { ball } = this;
    if (ball.x + ball.radius < 0) this.award('right');
    else if (ball.x - ball.radius > FIELD.width) this.award('left');
  }

  award(side) {
    this.score[side] += 1;
    this.effects.addShake(10);
    this.effects.burst(
      side === 'left' ? FIELD.width : 0,
      this.ball.y,
      side === 'left' ? PALETTE.leftPaddle : PALETTE.rightPaddle,
      30,
      420,
    );
    this.audio.play('score');

    if (this.score[side] >= MATCH.pointsToWin) {
      this.winner = side;
      this.ball.reset(1);
      this.setState('over');
      return;
    }
    this.serve(side === 'left' ? -1 : 1);
  }

  get countdown() {
    return Math.max(1, Math.ceil(this.serveTimer / (MATCH.serveDelay / MATCH.countdown)));
  }
}
