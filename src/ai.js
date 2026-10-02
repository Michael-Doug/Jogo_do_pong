import { BALL, FIELD } from './config.js';

// Prevê onde a bola cruza o plano da raquete, espelhando os quiques nas paredes.
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
    this.aimError = 0;
    this.incoming = false;
  }

  update(ball, dt) {
    const approaching = Math.sign(ball.vx) === Math.sign(this.paddle.x - FIELD.width / 2);

    // Erra a leitura uma vez por bola. Sorteando a cada decisão os desvios se
    // cancelavam na aproximação e a IA nunca deixava passar nenhuma.
    if (approaching && !this.incoming) {
      this.aimError = (Math.random() - 0.5) * 2 * this.difficulty.error;
    }
    this.incoming = approaching;

    this.timeSinceDecision += dt;
    if (this.timeSinceDecision >= this.difficulty.reaction) {
      this.timeSinceDecision = 0;
      this.decide(ball, approaching);
    }
    this.paddle.moveTowards(this.targetY, dt, this.difficulty.speed);
  }

  decide(ball, approaching) {
    if (!approaching) {
      this.targetY = FIELD.height / 2;
      return;
    }

    const predicted = predictImpactY(ball, this.paddle.x);
    const aimed = ball.y + (predicted - ball.y) * this.difficulty.anticipation;
    this.targetY = aimed + this.aimError;
  }
}
