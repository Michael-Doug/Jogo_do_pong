var tela = document.querySelector("canvas"); //código pra puxar o canvas do HTML
var pincel = tela.getContext("2d"); // código pra puxar um pincel pra tela

//variaveis da bolinha do jogo
var xBolinha = 300;
var yBolinha = 200;
var raio = 10;
var velocidadeX = 10;
var velocidadeY = 10;

//variavel da minha raquete
var minhaRaqueteX = 10;
var minhaRaqueteY = 200;

// São iguais pra minha raquete e a do oponente
var raqueteLargura = 5;
var raqueteAltura = 70;

//variavel da raquete do oponente
var raqueteOponenteX = 585;
var raqueteOponenteY = 200;

//numeros que representam as teclas no javascript
var cima = 38;
var baixo = 40;
var w = 87;
var s = 83;

//variavel dos efeitos de som
var sound_hit = new Audio();
sound_hit.src = './efeitos/sound_hit.wav'
var sound_score = new Audio();
sound_score.src = './efeitos/sound_score.wav'
var sound_game = new Audio();
sound_game.src = './efeitos/sound_game.mp3'


//taxa de velocidade - indica quantidade que anda no eixo y
var velocidadeOponente;

var meusPontos = 0;
var pontosOponente = 0;

function desenhaTela() {
  pincel.fillStyle = "MidnightBlue";
  pincel.fillRect(0, 0, 600, 400);
}

function limpaTela() {
  pincel.clearRect(0, 0, 600, 400);
}

function desenhaCirculo(x, y, raio, cor) {
  pincel.fillStyle = "white";
  pincel.beginPath();
  pincel.arc(x, y, raio, 0, 2 * Math.PI);
  pincel.fill();
}

function desenhaRetangulo(x, y, largura, altura) {
  pincel.fillStyle = "white";
  pincel.fillRect(x, y, largura, altura);
}

function mostraRaquete(x, y, largura, altura) {
  desenhaRetangulo(x, y, largura, altura);
}

function movimentaRaquetes(evento) {
  if (evento.keyCode == w) {
    minhaRaqueteY = minhaRaqueteY - 25;
  } else if (evento.keyCode == s) {
    minhaRaqueteY = minhaRaqueteY + 25;
  } else if (evento.keyCode == cima) {
    raqueteOponenteY = raqueteOponenteY - 25;
  } else if (evento.keyCode == baixo) {
    raqueteOponenteY = raqueteOponenteY + 25;
  }
}

function colisaoMinhaRaquete() {
  if (
    xBolinha - raio < minhaRaqueteX + raqueteLargura &&
    yBolinha + raio > minhaRaqueteY - raqueteAltura / 2 &&
    yBolinha - raio < minhaRaqueteY + raqueteAltura / 2
    // Abaixo feito com Y começando no inicio e não no centro da raquete
    //yBolinha - raio < minhaRaqueteY + minhaRaqueteAltura &&
    //yBolinha + raio > minhaRaqueteY
  ) {
    velocidadeX = 10;
    sound_hit.play();
  }
}

function colisaoRaqueteOponente() {
  if (
    xBolinha + raio > raqueteOponenteX - raqueteLargura &&
    yBolinha - raio < raqueteOponenteY + raqueteAltura / 2 &&
    yBolinha + raio > raqueteOponenteY - raqueteAltura / 2
  ) {
    velocidadeX = -10;
    sound_hit.play();
  }
}

function movimentaRaqueteOponenteAuto() {
  velocidadeOponente = yBolinha - (raqueteOponenteY + raqueteAltura / 2 - 70);
  raqueteOponenteY += velocidadeOponente;
}

function movimentaBolinha() {
  xBolinha += velocidadeX;
  yBolinha += velocidadeY;
}

function verificaColisao() {
  if (xBolinha - raio < 0) {
    velocidadeX = 10;
  } else if (xBolinha + raio > 600) {
    velocidadeX = -10;
  } else if (yBolinha - raio < 0) {
    velocidadeY = 10;
  } else if (yBolinha + raio > 400) {
    velocidadeY = -10;
  }
}

function desenhaTexto(texto, x, y) {
  pincel.font = "20px Georgia";
  pincel.fillStyle = "white";
  pincel.fillText(texto, x, y);
}

function incluiCaixaPlacar(x, y, altura, largura) {
  pincel.strokeStyle = "white";
  pincel.strokeRect(x, y, altura, largura);
  pincel.fillStyle = "OrangeRed";
  pincel.fillRect(x, y, altura, largura);
}

function incluiPlacar() {
  desenhaTexto(meusPontos, 145, 25);
  desenhaTexto(pontosOponente, 445, 25);
}

function marcaPontos() {
  if (xBolinha - raio < 0) {
    pontosOponente += 1;
    sound_score.play();
  } else if (xBolinha + raio > 600) {
    meusPontos += 1;
    sound_score.play();
  }
}

function mudaTela() {
  sound_game.play();
  desenhaTela();
  desenhaRetangulo(298, 0, 4, 400);
  desenhaCirculo(xBolinha, yBolinha, raio);
  incluiCaixaPlacar(135, 5, 35.5, 29.5);
  incluiCaixaPlacar(435, 5, 35.5, 29.5);
  incluiPlacar();
  verificaColisao();
  movimentaBolinha();
  mostraRaquete(
    minhaRaqueteX,
    minhaRaqueteY - raqueteAltura / 2,
    raqueteLargura,
    raqueteAltura
  );
  mostraRaquete(
    raqueteOponenteX,
    raqueteOponenteY - raqueteAltura / 2,
    raqueteLargura,
    raqueteAltura
  );
  colisaoMinhaRaquete();
  colisaoRaqueteOponente();
  //usar função abaixo caso queira mover a raquete do oponente no automático
  //movimentaRaqueteOponenteAuto();
  marcaPontos();
}

function dispara(evento) {
  var x = evento.pageX - tela.offsetLeft;
  var y = evento.pageY - tela.offsetTop;
  console.log(x + "," + y);
}

setInterval(mudaTela, 50);
tela.addEventListener("click", dispara);
document.addEventListener("keydown", movimentaRaquetes);
