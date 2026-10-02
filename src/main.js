import { AudioManager } from './audio.js';
import { Game } from './game.js';
import { Input } from './input.js';
import { Renderer } from './renderer.js';
import { UI } from './ui.js';

const canvas = document.getElementById('canvas');
const renderer = new Renderer(canvas);
const input = new Input(canvas);
const audio = new AudioManager();

const ui = new UI({
  overlay: document.getElementById('overlay'),
  panel: document.getElementById('panel'),
  hint: document.getElementById('hint'),
  muteButton: document.getElementById('mute'),
});

const game = new Game({
  renderer,
  input,
  audio,
  onChange: (current) => ui.render(current),
});

ui.onStart = (mode, difficulty) => game.start(mode, difficulty);
ui.onResume = () => game.resume();
ui.onMenu = () => game.quitToMenu();

const toggleMute = () => ui.setMuted(audio.toggleMute());
ui.muteButton.addEventListener('click', toggleMute);
window.addEventListener('keydown', (event) => {
  if (event.code === 'KeyM') toggleMute();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && ['playing', 'serving'].includes(game.state)) game.pause();
});

ui.setMuted(audio.muted);
ui.render(game);
requestAnimationFrame((timestamp) => game.loop(timestamp));
