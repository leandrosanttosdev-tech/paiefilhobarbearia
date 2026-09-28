/* =========================================================
   ANIMAÇÃO DE ENTRADA
   Qual aparece: atributo data-intro="1" na tag <html> do index.html
     1 = Logo que acende      2 = Poste de barbearia
     3 = Corte da navalha     4 = 9 anos de legado
     5 = Pai e Filho
   Para testar qualquer uma: abra o site com ?intro=3 no final do endereço.
   Aparece só na primeira visita da sessão; toque ou tecla pula.
   ========================================================= */
(() => {
  const html = document.documentElement;
  const screen = document.querySelector('[data-intro-screen]');
  if (!screen || !html.classList.contains('has-intro')) { screen?.remove(); return; }

  const letters = (text, cls) =>
    `<span class="${cls}" aria-hidden="true">${[...text].map((c, i) =>
      `<span style="--i:${i}">${c === ' ' ? '&nbsp;' : c}</span>`).join('')}</span>`;
  const LOGO = '<img class="intro__logo" src="assets/img/apple-touch-icon.png" alt="" width="120" height="120" />';

  // cada animação: o que aparece na tela e quanto tempo fica (ms) antes de sair
  const VARIANTS = {
    1: {
      time: 2100,
      html: `<div class="intro__stage">${LOGO}${letters('PAI E FILHO', 'intro__name')}<span class="intro__sub">Barbearia</span></div>`,
    },
    2: {
      time: 2200,
      html: `<div class="intro__half intro__half--l"></div><div class="intro__half intro__half--r"></div>
        <div class="intro__stage"><div class="intro__pole"><i></i></div><span class="intro__sub">Pai e Filho Barbearia</span></div>`,
    },
    3: {
      time: 1700,
      html: `<div class="intro__half intro__half--t"></div><div class="intro__half intro__half--b"></div>
        <div class="intro__stage"><span class="intro__sub intro__sub--up">Pai e Filho</span><div class="intro__blade"></div><span class="intro__sub intro__sub--down">Barbearia</span></div>`,
    },
    4: {
      time: 2300,
      html: `<div class="intro__stage"><span class="intro__year" data-intro-year>2017</span><span class="intro__legacy">9 anos de legado</span><span class="intro__sub">Pai e Filho Barbearia</span></div>`,
    },
    5: {
      time: 2200,
      html: `<div class="intro__stage"><div class="intro__words"><span class="intro__pai">Pai</span><span class="intro__filho">e Filho</span></div><div class="intro__line"></div><span class="intro__sub">Barbearia · desde 2017</span></div>`,
    },
  };

  const n = VARIANTS[html.dataset.intro] ? html.dataset.intro : '1';
  const v = VARIANTS[n];
  document.body.style.overflow = 'hidden';
  try { sessionStorage.setItem('pf-intro', '1'); } catch (e) {}

  let left = false;
  let timer = null;

  // começa quando as fontes carregarem (no máximo 500 ms de tela escura)
  let started = false;
  const start = () => {
    if (started || left) return;
    started = true;
    screen.classList.add(`intro--${n}`);
    screen.innerHTML = v.html + '<span class="intro__skip">Toque para entrar</span>';

    // 4: contador de 2017 até o ano atual
    const year = screen.querySelector('[data-intro-year]');
    if (year) {
      // sobe ano a ano, desacelerando no final
      const to = Math.max(new Date().getFullYear(), 2018);
      let y = 2017, wait = 60;
      const tick = () => {
        year.textContent = ++y;
        wait += 14;
        if (y < to) setTimeout(tick, wait);
      };
      setTimeout(tick, 300);
    }
    timer = setTimeout(leave, v.time);
  };
  document.fonts?.ready.then(start);
  setTimeout(start, 500);

  const leave = () => {
    if (left) return;
    left = true;
    screen.classList.add('is-leaving');
    html.classList.remove('has-intro'); // o topo do site começa a aparecer junto com a saída
    document.body.style.overflow = '';
    setTimeout(() => screen.remove(), 900);
  };

  const skip = () => { clearTimeout(timer); leave(); };
  screen.addEventListener('click', skip);
  addEventListener('keydown', skip, { once: true });
})();
