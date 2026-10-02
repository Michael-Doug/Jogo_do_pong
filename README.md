# Jogo do Pong

Pong em JavaScript puro e HTML Canvas, sem dependências nem build.

**Jogar:** https://michael-doug.github.io/Jogo_do_pong/

## Como jogar

Primeiro a 11 pontos vence. A bola acelera a cada rebatida, e o ângulo do rebote
depende de onde ela bate na raquete — rebater com a ponta joga a bola mais aberta.

| | Raquete esquerda | Raquete direita |
|---|---|---|
| Teclado | `W` / `S` | `↑` / `↓` |
| Toque / mouse | arrastar na metade esquerda | arrastar na metade direita |

No modo contra o computador você controla a raquete esquerda e pode arrastar em
qualquer ponto da tela. `P` ou `Esc` pausa, `M` liga e desliga o som.

Três níveis de dificuldade mudam a velocidade da raquete do computador, o tempo de
reação e a margem de erro da previsão — no fácil ele erra bastante, no difícil quase não.

## Rodando localmente

O jogo usa módulos ES, então precisa ser servido por HTTP (abrir o arquivo direto não funciona):

```bash
python3 -m http.server 4178
```

## Testes

```bash
npm test
```

Cobrem a física e as regras: contagem de pontos, saque, limites das raquetes, rebote,
colisão sem atravessar a raquete e bola presa na parede.

## Estrutura

```
index.html      markup e overlay do menu
styles.css      layout responsivo
src/config.js   constantes de jogo e dificuldade
src/game.js     máquina de estados, loop e colisões
src/entities.js bola e raquetes
src/ai.js       raquete do computador
src/renderer.js desenho no canvas
src/input.js    teclado, mouse e toque
src/ui.js       menu, pausa e fim de partida
src/audio.js    efeitos e música
```

O loop roda com `requestAnimationFrame` e passo fixo de 1/120s, então a velocidade do
jogo não muda conforme a máquina ou a taxa de atualização do monitor.

## Referências

Começou a partir do tutorial de Pong da Alura e foi reescrito desde então.
