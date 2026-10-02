import { BALL, FIELD } from './config.js';

// Predicts where the ball crosses the paddle plane, mirroring wall bounces.
function predictImpactY(ball, paddleX) {
  if (ball.vx === 0) return ball.y;
  const time = (paddleX - ball.x) / ball.vx;
  if (time < 0) return FIELD.height / 2;

  const span = FIELD.height - 2 * BALL.radius;
  const raw = ball.y - BALL.radius + ball.vy * time;
  const folded = Math.abs(raw % (2 * span));
  return BALL.radius + (folded > span ? 2 * span - folded : folded);
}

export class Opponent {
  constructor(paddle, difficulty) {
    this.paddle = paddle;
    this.difficulty = difficulty;
    this.targetY = paddle.y;
    this.timeSinceDecision = 0;
  }

  update(ball, dt) {
    this.timeSinceDecision += dt;
    if (this.timeSinceDecision >= this.difficulty.reaction) {
      this.timeSinceDecision = 0;
      this.decide(ball);
    }
    this.paddle.moveTowards(this.targetY, dt, this.difficulty.speed);
  }

  decide(ball) {
    const approaching = Math.sign(ball.vx) === Math.sign(this.paddle.x - FIELD.width / 2);
    if (!approaching) {
      this.targetY = FIELD.height / 2;
      return;
    }

    const predicted = predictImpactY(ball, this.paddle.x);
    const aimed = ball.y + (predicted - ball.y) * this.difficulty.anticipation;
    this.targetY = aimed + (Math.random() - 0.5) * 2 * this.difficulty.error;
  }
}
