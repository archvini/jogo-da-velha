const LINHAS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const placar = { X: 0, O: 0, empates: 0 };
const el = document.getElementById('tabuleiro');
const status = document.getElementById('status');
const cpu = document.getElementById('cpu');
const celulas = [];
let tab, vez, inicio = 'X', fim, linhaVencedora, timer;

for (let i = 0; i < 9; i++) {
  const b = document.createElement('button');
  b.className = 'celula';
  b.setAttribute('aria-label', 'Casa ' + (i + 1));
  b.addEventListener('click', () => { if (!vezDoCpu()) jogar(i); });
  el.appendChild(b);
  celulas.push(b);
}
document.getElementById('novo').addEventListener('click', novaPartida);
cpu.addEventListener('change', novaPartida);

const vezDoCpu = () => cpu.checked && vez === 'O';

// Minimax: O (computador) maximiza, X minimiza. O jogo é pequeno, então varre tudo.
function minimax(t, j) {
  const l = vencedor(t);
  if (l) return { p: t[l[0]] === 'O' ? 1 : -1 };
  if (t.every(Boolean)) return { p: 0 };
  let melhor = null;
  for (let i = 0; i < 9; i++) {
    if (t[i]) continue;
    t[i] = j;
    const p = minimax(t, j === 'O' ? 'X' : 'O').p;
    t[i] = '';
    if (!melhor || (j === 'O' ? p > melhor.p : p < melhor.p)) melhor = { p, i };
  }
  return melhor;
}

function jogadaCpu() {
  if (fim || !vezDoCpu()) return;
  const livres = tab.flatMap((c, i) => (c ? [] : [i]));
  // 20% das vezes joga em casa aleatória, para dar para ganhar dele
  const i = Math.random() < 0.2 ? livres[Math.floor(Math.random() * livres.length)] : minimax(tab, 'O').i;
  jogar(i);
}

function agendarCpu() {
  clearTimeout(timer);
  if (!fim && vezDoCpu()) timer = setTimeout(jogadaCpu, 400);
}

function vencedor(t) {
  return LINHAS.find(([a, b, c]) => t[a] && t[a] === t[b] && t[a] === t[c]) || null;
}

function novaPartida() {
  tab = Array(9).fill('');
  vez = inicio;
  inicio = inicio === 'X' ? 'O' : 'X'; // quem começa alterna a cada partida
  fim = false;
  linhaVencedora = null;
  desenhar();
  agendarCpu();
}

function jogar(i) {
  if (fim || tab[i]) return;
  tab[i] = vez;
  linhaVencedora = vencedor(tab);
  if (linhaVencedora) { fim = true; placar[vez]++; }
  else if (tab.every(Boolean)) { fim = true; placar.empates++; }
  else vez = vez === 'X' ? 'O' : 'X';
  desenhar();
  agendarCpu();
}

function desenhar() {
  celulas.forEach((b, i) => {
    b.textContent = tab[i];
    b.className = 'celula ' + tab[i] + (linhaVencedora && linhaVencedora.includes(i) ? ' venceu' : '');
    b.disabled = fim || !!tab[i];
  });
  document.getElementById('px').textContent = placar.X;
  document.getElementById('po').textContent = placar.O;
  document.getElementById('pe').textContent = placar.empates;
  status.textContent = linhaVencedora ? `${vez} venceu!` : fim ? 'Deu velha! Empate.' : `Vez de ${vez}`;
}

novaPartida();
