import { BALL, FIELD, PADDLE } from './config.js';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export class Paddle {
  constructor(side, color) {
    this.side = side;
    this.color = color;
    this.width = PADDLE.width;
    this.height = PADDLE.height;
    this.x = side === 'left' ? PADDLE.margin : FIELD.width - PADDLE.margin - PADDLE.width;
    this.y = FIELD.height / 2;
    this.velocity = 0;
  }

  reset() {
    this.y = FIELD.height / 2;
    this.velocity = 0;
  }

  moveBy(direction, dt) {
    this.applyPosition(this.y + direction * PADDLE.speed * dt, dt);
  }

  moveTowards(targetY, dt, maxSpeed = PADDLE.speed) {
    const delta = clamp(targetY - this.y, -maxSpeed * dt, maxSpeed * dt);
    this.applyPosition(this.y + delta, dt);
  }

  applyPosition(nextY, dt) {
    const half = this.height / 2;
    const clamped = clamp(nextY, half, FIELD.height - half);
    this.velocity = dt > 0 ? (clamped - this.y) / dt : 0;
    this.y = clamped;
  }

  get top() {
    return this.y - this.height / 2;
  }

  get bottom() {
    return this.y + this.height / 2;
  }
}

export class Ball {
  constructor() {
    this.radius = BALL.radius;
    this.trail = [];
    this.reset(1);
  }

  reset(direction) {
    this.x = FIELD.width / 2;
    this.y = FIELD.height / 2;
    this.speed = BALL.initialSpeed;
    this.pendingDirection = direction;
    this.vx = 0;
    this.vy = 0;
    this.trail.length = 0;
  }

  serve() {
    const angle = (Math.random() - 0.5) * (Math.PI / 4);
    this.vx = Math.cos(angle) * this.speed * this.pendingDirection;
    this.vy = Math.sin(angle) * this.speed;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.trail.unshift({ x: this.x, y: this.y });
    if (this.trail.length > BALL.trailLength) this.trail.pop();
  }

  // Deflection angle comes from where the ball lands on the paddle, Breakout style.
  deflect(paddle) {
    const offset = clamp((this.y - paddle.y) / (paddle.height / 2), -1, 1);
    const angle = offset * BALL.maxBounceAngle;
    const direction = paddle.side === 'left' ? 1 : -1;

    this.speed = Math.min(this.speed + BALL.speedGain, BALL.maxSpeed);
    this.vx = Math.cos(angle) * this.speed * direction;
    this.vy = Math.sin(angle) * this.speed + paddle.velocity * BALL.spinTransfer;

    const edge = paddle.side === 'left'
      ? paddle.x + paddle.width + this.radius
      : paddle.x - this.radius;
    this.x = edge;
  }
}
