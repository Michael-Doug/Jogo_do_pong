import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BALL, FIELD, MATCH, PADDLE } from '../src/config.js';
import { advance, createGame } from './helpers.js';

describe('pontuação', () => {
  it('conta um único ponto quando a bola sai pela esquerda', () => {
    const game = createGame();
    game.setState('playing');
    game.ball.x = 30;
    game.ball.y = FIELD.height / 2;
    game.ball.vx = -600;
    game.ball.vy = 0;
    game.leftPaddle.y = 20;

    advance(game, 0.5);

    assert.equal(game.score.right, 1);
    assert.equal(game.score.left, 0);
  });

  it('recoloca a bola no centro e reinicia a velocidade após o ponto', () => {
    const game = createGame();
    game.setState('playing');
    game.ball.x = 10;
    game.ball.vx = -900;
    game.ball.speed = BALL.maxSpeed;
    game.leftPaddle.y = 20;

    advance(game, 0.2);

    assert.equal(game.state, 'serving');
    assert.equal(game.ball.x, FIELD.width / 2);
    assert.equal(game.ball.y, FIELD.height / 2);
    assert.equal(game.ball.speed, BALL.initialSpeed);
  });

  it('serve para quem sofreu o ponto', () => {
    const game = createGame();
    game.award('left');
    assert.equal(game.ball.pendingDirection, -1);
  });

  it('encerra a partida ao atingir a pontuação de vitória', () => {
    const game = createGame();
    for (let i = 0; i < MATCH.pointsToWin; i += 1) game.award('left');

    assert.equal(game.state, 'over');
    assert.equal(game.winner, 'left');
    assert.equal(game.score.left, MATCH.pointsToWin);
  });
});

describe('raquetes', () => {
  it('não saem da tela por cima nem por baixo', () => {
    const game = createGame();
    advance(game, 0);

    for (let i = 0; i < 400; i += 1) game.leftPaddle.moveBy(-1, 1 / 60);
    assert.equal(game.leftPaddle.top, 0);

    for (let i = 0; i < 400; i += 1) game.leftPaddle.moveBy(1, 1 / 60);
    assert.equal(game.leftPaddle.bottom, FIELD.height);
  });

  it('seguem o ponteiro sem ultrapassar a velocidade máxima', () => {
    const game = createGame();
    const start = game.leftPaddle.y;
    game.leftPaddle.moveTowards(FIELD.height, 1 / 60);

    assert.ok(game.leftPaddle.y - start <= PADDLE.speed / 60 + 1e-9);
  });
});

describe('colisão com a raquete', () => {
  it('rebate a bola e aumenta a velocidade', () => {
    const game = createGame();
    game.setState('playing');
    game.ball.x = game.leftPaddle.x + PADDLE.width + BALL.radius + 2;
    game.ball.y = game.leftPaddle.y;
    game.ball.vx = -BALL.initialSpeed;
    game.ball.vy = 0;

    advance(game, 0.1);

    assert.ok(game.ball.vx > 0, 'a bola deveria voltar para a direita');
    assert.ok(game.ball.speed > BALL.initialSpeed);
    assert.equal(game.score.right, 0);
  });

  it('não deixa a bola atravessar a raquete em um passo longo', () => {
    const game = createGame();
    game.setState('playing');
    const step = 1 / 20;
    game.ball.speed = BALL.maxSpeed;
    game.ball.vx = -BALL.maxSpeed;
    game.ball.vy = 0;
    game.ball.y = game.leftPaddle.y;
    game.ball.x = game.leftPaddle.x + PADDLE.width + BALL.radius + BALL.maxSpeed * step * 0.5;

    assert.ok(
      BALL.maxSpeed * step > PADDLE.width,
      'o passo precisa ser maior que a raquete para exercitar a varredura',
    );

    game.update(step);

    assert.ok(game.ball.vx > 0, 'a bola atravessou a raquete');
    assert.equal(game.score.right, 0);
  });

  it('deixa passar quando a raquete está fora do alcance', () => {
    const game = createGame();
    game.setState('playing');
    game.ball.x = 300;
    game.ball.y = FIELD.height - 40;
    game.ball.vx = -BALL.initialSpeed;
    game.ball.vy = 0;
    game.leftPaddle.y = PADDLE.height / 2;

    advance(game, 2);

    assert.equal(game.score.right, 1);
  });

  it('direciona o rebote pelo ponto de contato na raquete', () => {
    const game = createGame();
    game.setState('playing');
    game.ball.x = game.leftPaddle.x + PADDLE.width + BALL.radius + 2;
    game.ball.y = game.leftPaddle.y - PADDLE.height / 2 + 4;
    game.ball.vx = -BALL.initialSpeed;
    game.ball.vy = 0;

    advance(game, 0.05);

    assert.ok(game.ball.vy < 0, 'bater no topo da raquete deveria mandar a bola para cima');
  });
});

describe('paredes', () => {
  it('tira a bola de dentro da parede em vez de deixá-la oscilando', () => {
    const game = createGame();
    game.setState('playing');
    game.ball.x = FIELD.width / 2;
    game.ball.y = BALL.radius - 6;
    game.ball.vx = 0;
    game.ball.vy = -400;

    advance(game, 0.5);

    assert.ok(game.ball.vy > 0, 'a bola deveria ter voltado para baixo');
    assert.ok(game.ball.y > BALL.radius, 'a bola ficou presa na borda de cima');
  });

  it('mantém a bola dentro do campo durante um rali longo', () => {
    const game = createGame();
    game.setState('playing');
    game.ball.serve();

    for (let i = 0; i < 20000; i += 1) {
      game.update(1 / 120);
      assert.ok(game.ball.y >= -1 && game.ball.y <= FIELD.height + 1, 'bola saiu do campo');
    }
  });
});

describe('pausa', () => {
  it('congela a bola e retoma o estado anterior', () => {
    const game = createGame();
    game.setState('playing');
    game.ball.serve();
    game.pause();

    const position = { x: game.ball.x, y: game.ball.y };
    advance(game, 1);

    assert.equal(game.ball.x, position.x);
    assert.equal(game.ball.y, position.y);

    game.resume();
    assert.equal(game.state, 'playing');
  });
});
