export class Effects {
  constructor() {
    this.particles = [];
    this.shake = 0;
  }

  burst(x, y, color, count = 14, power = 260) {
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = power * (0.35 + Math.random() * 0.65);
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.45 + Math.random() * 0.35,
        age: 0,
        size: 1.5 + Math.random() * 2.5,
        color,
      });
    }
  }

  addShake(amount) {
    this.shake = Math.min(this.shake + amount, 16);
  }

  update(dt) {
    this.shake = Math.max(0, this.shake - dt * 42);
    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const particle = this.particles[i];
      particle.age += dt;
      if (particle.age >= particle.life) {
        this.particles.splice(i, 1);
        continue;
      }
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vx *= 1 - 2.4 * dt;
      particle.vy *= 1 - 2.4 * dt;
    }
  }

  get offset() {
    if (this.shake <= 0) return { x: 0, y: 0 };
    return {
      x: (Math.random() - 0.5) * this.shake,
      y: (Math.random() - 0.5) * this.shake,
    };
  }

  clear() {
    this.particles.length = 0;
    this.shake = 0;
  }
}
