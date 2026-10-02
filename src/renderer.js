import { BALL, FIELD, PALETTE } from './config.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = FIELD.width * ratio;
    this.canvas.height = FIELD.height * ratio;
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  draw(game) {
    const { ctx } = this;
    const shake = game.effects.offset;

    ctx.save();
    ctx.translate(shake.x, shake.y);
    this.drawField();
    this.drawScore(game.score);
    this.drawTrail(game.ball);
    this.drawPaddle(game.leftPaddle);
    this.drawPaddle(game.rightPaddle);
    if (game.state !== 'menu') this.drawBall(game.ball);
    this.drawParticles(game.effects.particles);
    if (game.state === 'serving') this.drawCountdown(game.countdown);
    ctx.restore();
  }

  drawField() {
    const { ctx } = this;
    ctx.fillStyle = PALETTE.background;
    ctx.fillRect(-20, -20, FIELD.width + 40, FIELD.height + 40);

    const glow = ctx.createRadialGradient(
      FIELD.width / 2, FIELD.height / 2, 40,
      FIELD.width / 2, FIELD.height / 2, FIELD.width / 1.4,
    );
    glow.addColorStop(0, PALETTE.field);
    glow.addColorStop(1, PALETTE.background);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);

    ctx.strokeStyle = PALETTE.line;
    ctx.lineWidth = 3;
    ctx.setLineDash([14, 18]);
    ctx.beginPath();
    ctx.moveTo(FIELD.width / 2, 0);
    ctx.lineTo(FIELD.width / 2, FIELD.height);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(FIELD.width / 2, FIELD.height / 2, 70, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawScore(score) {
    const { ctx } = this;
    ctx.fillStyle = PALETTE.score;
    ctx.font = '700 118px "Space Mono", "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(score.left), FIELD.width / 2 - 110, 110);
    ctx.fillText(String(score.right), FIELD.width / 2 + 110, 110);
  }

  drawCountdown(value) {
    const { ctx } = this;
    ctx.fillStyle = PALETTE.ball;
    ctx.font = '700 72px "Space Mono", "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.75;
    ctx.fillText(String(value), FIELD.width / 2, FIELD.height / 2);
    ctx.globalAlpha = 1;
  }

  drawPaddle(paddle) {
    const { ctx } = this;
    ctx.save();
    ctx.shadowColor = paddle.color;
    ctx.shadowBlur = 24;
    ctx.fillStyle = paddle.color;
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.top, paddle.width, paddle.height, paddle.width / 2);
    ctx.fill();
    ctx.restore();
  }

  drawTrail(ball) {
    const { ctx } = this;
    ball.trail.forEach((point, index) => {
      const fade = 1 - index / ball.trail.length;
      ctx.globalAlpha = fade * 0.3;
      ctx.fillStyle = PALETTE.ball;
      ctx.beginPath();
      ctx.arc(point.x, point.y, BALL.radius * fade, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  drawBall(ball) {
    const { ctx } = this;
    ctx.save();
    ctx.shadowColor = PALETTE.ball;
    ctx.shadowBlur = 26;
    ctx.fillStyle = PALETTE.ball;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawParticles(particles) {
    const { ctx } = this;
    for (const particle of particles) {
      ctx.globalAlpha = 1 - particle.age / particle.life;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
