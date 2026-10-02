export const FIELD = { width: 960, height: 540 };

export const BALL = {
  radius: 9,
  initialSpeed: 390,
  maxSpeed: 1020,
  speedGain: 26,
  maxBounceAngle: Math.PI / 3.2,
  spinTransfer: 0.2,
  trailLength: 14,
};

export const PADDLE = {
  width: 14,
  height: 96,
  margin: 30,
  speed: 640,
  cornerRadius: 7,
};

export const MATCH = {
  pointsToWin: 11,
  serveDelay: 1.2,
  countdown: 3,
};

// `error` é o desvio máximo da mira, em px. Abaixo de meia raquete + raio da bola
// (57px) a IA nunca erra uma bola — foi assim que o normal ficou invencível.
export const DIFFICULTY = {
  easy: { label: 'Fácil', speed: 310, reaction: 0.3, error: 110, anticipation: 0.3 },
  normal: { label: 'Normal', speed: 470, reaction: 0.17, error: 76, anticipation: 0.6 },
  hard: { label: 'Difícil', speed: 660, reaction: 0.07, error: 63, anticipation: 0.9 },
};

export const PALETTE = {
  background: '#060b1f',
  field: '#0b1437',
  line: 'rgba(126, 169, 255, 0.28)',
  ball: '#f7fbff',
  leftPaddle: '#5de4ff',
  rightPaddle: '#ff7a9c',
  score: 'rgba(170, 198, 255, 0.55)',
};
