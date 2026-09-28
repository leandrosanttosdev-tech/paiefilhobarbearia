/* =========================================================
   ANIMAÇÃO DE ENTRADA — logo que acende
   Aparece só na primeira visita da sessão; toque ou tecla pula.
   Para ver de novo a qualquer momento: abra o site com ?intro no final do endereço.
   ========================================================= */
(() => {
  const html = document.documentElement;
  const screen = document.querySelector('[data-intro-screen]');
  if (!screen || !html.classList.contains('has-intro')) { screen?.remove(); return; }

  const TIME = 2100; // quanto tempo fica na tela antes de sair (ms)
  const name = [...'PAI E FILHO'].map((c, i) =>
    `<span style="--i:${i}">${c === ' ' ? '&nbsp;' : c}</span>`).join('');

  document.body.style.overflow = 'hidden';
  try { sessionStorage.setItem('pf-intro', '1'); } catch (e) {}

  let left = false;
  let timer = null;

  const leave = () => {
    if (left) return;
    left = true;
    screen.classList.add('is-leaving');
    html.classList.remove('has-intro'); // o topo do site começa a aparecer junto com a saída
    document.body.style.overflow = '';
    setTimeout(() => screen.remove(), 900);
  };

  // começa quando as fontes carregarem (no máximo 500 ms de tela escura)
  let started = false;
  const start = () => {
    if (started || left) return;
    started = true;
    screen.innerHTML = `<div class="intro__stage">
        <img class="intro__logo" src="assets/img/apple-touch-icon.png" alt="" width="120" height="120" />
        <span class="intro__name">${name}</span>
        <span class="intro__sub">Barbearia</span>
      </div>
      <span class="intro__skip">Toque para entrar</span>`;
    timer = setTimeout(leave, TIME);
  };
  document.fonts?.ready.then(start);
  setTimeout(start, 500);

  const skip = () => { clearTimeout(timer); leave(); };
  screen.addEventListener('click', skip);
  addEventListener('keydown', skip, { once: true });
})();
