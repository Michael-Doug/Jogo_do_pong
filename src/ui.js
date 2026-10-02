import { DIFFICULTY, MATCH } from './config.js';

const MODES = {
  single: 'Contra o computador',
  versus: '2 jogadores',
};

export class UI {
  constructor({ overlay, panel, hint, muteButton }) {
    this.overlay = overlay;
    this.panel = panel;
    this.hint = hint;
    this.muteButton = muteButton;
    this.mode = 'single';
    this.difficulty = 'normal';
    this.onStart = () => {};
    this.onResume = () => {};
    this.onMenu = () => {};
  }

  render(game) {
    if (game.state === 'playing' || game.state === 'serving') {
      this.overlay.hidden = true;
      this.hint.textContent = this.controlsHint(game.mode);
      return;
    }

    this.overlay.hidden = false;
    this.hint.textContent = '';
    if (game.state === 'menu') this.renderMenu();
    else if (game.state === 'paused') this.renderPaused();
    else if (game.state === 'over') this.renderGameOver(game);
  }

  controlsHint(mode) {
    if (mode === 'single') {
      return 'W / S ou arraste na tela · P pausa · M som';
    }
    return 'Esquerda: W / S · Direita: ↑ / ↓ · P pausa · M som';
  }

  renderMenu() {
    this.panel.innerHTML = `
      <h1>PONG</h1>
      <p>Primeiro a ${MATCH.pointsToWin} pontos vence. A bola acelera a cada rebatida.</p>
      <div class="field">
        <span>Modo</span>
        <div class="choices" data-group="mode"></div>
      </div>
      <div class="field" data-difficulty>
        <span>Dificuldade</span>
        <div class="choices" data-group="difficulty"></div>
      </div>
      <button class="primary" data-action="start">Jogar</button>
    `;

    this.renderChoices('mode', MODES, this.mode, (value) => {
      this.mode = value;
      this.renderMenu();
    });
    this.renderChoices(
      'difficulty',
      Object.fromEntries(Object.entries(DIFFICULTY).map(([key, item]) => [key, item.label])),
      this.difficulty,
      (value) => {
        this.difficulty = value;
        this.renderMenu();
      },
    );

    this.panel.querySelector('[data-difficulty]').hidden = this.mode !== 'single';
    this.panel.querySelector('[data-action="start"]')
      .addEventListener('click', () => this.onStart(this.mode, this.difficulty));
  }

  renderChoices(group, options, selected, onPick) {
    const container = this.panel.querySelector(`[data-group="${group}"]`);
    for (const [value, label] of Object.entries(options)) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.setAttribute('aria-pressed', String(value === selected));
      button.addEventListener('click', () => onPick(value));
      container.appendChild(button);
    }
  }

  renderPaused() {
    this.panel.innerHTML = `
      <h2>Pausado</h2>
      <p>Pressione P ou Esc para continuar.</p>
      <button class="primary" data-action="resume">Continuar</button>
      <button class="secondary" data-action="menu">Voltar ao menu</button>
    `;
    this.panel.querySelector('[data-action="resume"]').addEventListener('click', () => this.onResume());
    this.panel.querySelector('[data-action="menu"]').addEventListener('click', () => this.onMenu());
  }

  renderGameOver(game) {
    const playerWon = game.winner === 'left';
    const title = game.mode === 'single'
      ? (playerWon ? 'Você venceu!' : 'O computador venceu')
      : `Jogador ${playerWon ? '1' : '2'} venceu!`;

    this.panel.innerHTML = `
      <h2 class="${playerWon ? 'winner-left' : 'winner-right'}">${title}</h2>
      <p>Placar final: ${game.score.left} x ${game.score.right}</p>
      <button class="primary" data-action="again">Jogar de novo</button>
      <button class="secondary" data-action="menu">Voltar ao menu</button>
    `;
    this.panel.querySelector('[data-action="again"]')
      .addEventListener('click', () => this.onStart(game.mode, game.difficultyKey));
    this.panel.querySelector('[data-action="menu"]').addEventListener('click', () => this.onMenu());
  }

  setMuted(muted) {
    this.muteButton.setAttribute('aria-pressed', String(muted));
    this.muteButton.textContent = muted ? '🔇' : '♪';
  }
}
