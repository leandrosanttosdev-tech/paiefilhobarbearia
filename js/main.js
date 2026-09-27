/* =========================================================
   PAI E FILHO BARBEARIA — interações
   Sem dependências. Tudo funciona também sem JS.
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---------- Cabeçalho ---------- */
  const header = $('[data-header]');
  const burger = $('[data-burger]');
  const menu = $('[data-menu]');

  const setMenu = open => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.hidden = !open;
    header.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); }
  });
  matchMedia('(min-width: 1024px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  /* ---------- Barra fixa de agendamento (celular) ---------- */
  const dock = $('[data-dock]');
  const final = $('[data-final]');
  let pastHero = false;
  let atEnd = false;
  const updateDock = () => {
    const show = pastHero && !atEnd;
    dock.classList.toggle('is-visible', show);
    dock.setAttribute('aria-hidden', String(!show));
    $$('a', dock).forEach(a => { a.tabIndex = show ? 0 : -1; });
  };

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; updateDock(); }, { rootMargin: '-40% 0px 0px 0px' }).observe($('.hero__actions'));
    new IntersectionObserver(([e]) => { atEnd = e.isIntersecting; updateDock(); }).observe(final);

    /* ---------- Entrada suave das seções ---------- */
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    $$('.reveal').forEach(el => {
      // pequeno escalonamento entre irmãos (cards, galeria)
      const sibs = $$(':scope > .reveal', el.parentElement);
      const i = sibs.indexOf(el);
      if (i > 0) el.style.transitionDelay = Math.min(i, 5) * 70 + 'ms';
      io.observe(el);
    });
  } else {
    $$('.reveal').forEach(el => el.classList.add('is-in'));
  }

  /* ---------- Vídeo ---------- */
  const videoWrap = $('[data-video]');
  if (videoWrap) {
    const video = $('video', videoWrap);
    $('[data-video-play]', videoWrap).addEventListener('click', () => {
      video.controls = true;
      videoWrap.classList.add('is-playing');
      video.play().catch(() => {});
    });
    video.addEventListener('ended', () => {
      video.controls = false;
      videoWrap.classList.remove('is-playing');
      video.load(); // volta à capa
    });
  }

  /* ---------- Cards da equipe: inclinação 3D sutil (mouse) ---------- */
  if (finePointer && !reduceMotion) {
    const MAX = 6; // graus
    $$('[data-tilt]').forEach(item => {
      const card = $('.barber__card', item);
      let raf = 0;
      item.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5;
        const py = (e.clientY - r.top) / r.height - .5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transition = 'transform .12s linear, box-shadow .5s';
          card.style.transform = `rotateX(${(-py * MAX).toFixed(2)}deg) rotateY(${(px * MAX).toFixed(2)}deg) translateZ(0)`;
        });
      });
      item.addEventListener('pointerleave', () => {
        cancelAnimationFrame(raf);
        card.style.transition = '';
        card.style.transform = '';
      });
    });
  }

  /* ---------- Serviços: acordeão no celular, tudo aberto a partir do tablet ---------- */
  const acc = $('[data-accordion]');
  if (acc) {
    const panels = $$('details', acc);
    const wide = matchMedia('(min-width: 768px)');
    const sync = () => panels.forEach((d, i) => { d.open = wide.matches || i === 0; });
    sync();
    wide.addEventListener('change', sync);
    panels.forEach(d => {
      $('summary', d).addEventListener('click', e => { if (wide.matches) e.preventDefault(); });
      d.addEventListener('toggle', () => {
        if (wide.matches || !d.open) return;
        panels.forEach(o => { if (o !== d) o.open = false; });
      });
    });
  }

  /* ---------- Serviços: escolher o profissional antes de ir ao WhatsApp ---------- */
  const picker = $('[data-picker]');
  if (picker && typeof picker.showModal === 'function') {
    const WA = 'https://wa.me/5579999100181?text=';
    const list = $('[data-picker-list]', picker);
    const title = $('[data-picker-service]', picker);
    // a lista vem da seção Equipe: incluir/remover um card lá atualiza a escolha aqui
    const team = $$('.barber').map(b => {
      const role = $('.barber__role', b).textContent.trim();
      return {
        name: $('.barber__name', b).textContent.trim(),
        role,
        art: /a$/i.test(role) ? 'a' : 'o',
        img: $('img', b).getAttribute('src'),
      };
    });
    let lastTrigger = null;

    const option = (href, avatar, name, sub) => {
      const li = document.createElement('li');
      li.innerHTML = `<a class="picker__opt" href="${href}" target="_blank" rel="noopener">${avatar}<span class="picker__who"><b></b><small></small></span><svg class="icon" aria-hidden="true"><use href="#i-arrow" /></svg></a>`;
      $('b', li).textContent = name;
      $('small', li).textContent = sub;
      $('a', li).addEventListener('click', () => picker.close());
      return li;
    };

    // service = null → agendamento geral (botões "Agendar horário")
    const open = (service, trigger) => {
      lastTrigger = trigger;
      title.textContent = service || 'Agendar horário';
      const what = service ? `agendar: ${service}` : 'agendar um horário';
      list.replaceChildren(
        ...team.map(p => option(
          WA + encodeURIComponent(service
            ? `Olá! Gostaria de ${what}, com ${p.art} ${p.name}.`
            : `Olá! Gostaria de ${what} com ${p.art} ${p.name}.`),
          `<img class="picker__avatar" src="${p.img}" alt="" width="52" height="52" />`,
          p.name, p.role)),
        option(
          WA + encodeURIComponent(`Olá! Gostaria de ${what}. Pode ser com qualquer profissional disponível.`),
          '<span class="picker__avatar picker__avatar--any"><svg class="icon" aria-hidden="true"><use href="#i-whats" /></svg></span>',
          'Sem preferência', 'Primeiro profissional disponível'),
      );
      picker.showModal();
      document.body.style.overflow = 'hidden';
    };

    // sem JS, todos esses links continuam indo direto ao WhatsApp
    $$('[data-book]').forEach(el => el.addEventListener('click', e => {
      e.preventDefault();
      open(el.dataset.book || $('span', el).textContent.trim(), el);
    }));
    $$('[data-book-general]').forEach(el => el.addEventListener('click', e => {
      e.preventDefault();
      open(null, el);
    }));
    $('[data-picker-close]', picker).addEventListener('click', () => picker.close());
    picker.addEventListener('click', e => {
      if (e.target !== picker) return;
      const r = picker.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) picker.close(); // clique no fundo escurecido
    });
    picker.addEventListener('close', () => {
      document.body.style.overflow = '';
      lastTrigger?.focus();
    });
  }

  /* ---------- Avaliações em movimento contínuo ---------- */
  const reviewsTrack = $('.reviews__track');
  if (reviewsTrack && !reduceMotion) {
    const originals = $$('.review', reviewsTrack);
    originals.forEach(r => { r.classList.remove('reveal'); r.style.transitionDelay = ''; });

    const viewport = document.createElement('div');
    viewport.className = 'reviews__viewport';
    reviewsTrack.before(viewport);
    viewport.append(reviewsTrack);
    reviewsTrack.classList.add('is-marquee');

    const addClone = card => {
      const c = card.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      c.dataset.clone = '';
      $$('a, button', c).forEach(el => { el.tabIndex = -1; });
      reviewsTrack.append(c);
    };
    // cada metade da faixa precisa ser mais larga que a tela; a 2ª metade é cópia da 1ª (loop sem emenda)
    const build = () => {
      $$('[data-clone]', reviewsTrack).forEach(n => n.remove());
      const gap = parseFloat(getComputedStyle(reviewsTrack).columnGap) || 20;
      const setW = originals.reduce((s, o) => s + o.getBoundingClientRect().width + gap, 0);
      const reps = Math.max(1, Math.ceil((window.innerWidth + 200) / setW));
      for (let i = 1; i < reps; i++) originals.forEach(addClone);
      for (let i = 0; i < reps; i++) originals.forEach(addClone);
      reviewsTrack.style.setProperty('--dur', (setW * reps / 32).toFixed(1) + 's'); // ~32px por segundo
    };
    build();
    let lastW = window.innerWidth;
    let t = 0;
    window.addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(() => { if (window.innerWidth !== lastW) { lastW = window.innerWidth; build(); } }, 200);
    });

    // tocar e segurar pausa para ler
    viewport.addEventListener('touchstart', () => viewport.classList.add('is-paused'), { passive: true });
    ['touchend', 'touchcancel'].forEach(ev => viewport.addEventListener(ev, () => viewport.classList.remove('is-paused')));

    // fora da tela, a animação para (economia de bateria)
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        reviewsTrack.style.animationPlayState = e.isIntersecting ? '' : 'paused';
      }).observe(viewport);
    }
  }

  /* ---------- Galeria + lightbox ---------- */
  const lb = $('[data-lightbox]');
  const items = $$('[data-gallery] .gallery__item');
  if (lb && items.length && typeof lb.showModal === 'function') {
    const img = $('.lightbox__img', lb);
    const count = $('[data-lb-count]', lb);
    let idx = 0;
    let lastFocus = null;

    const show = i => {
      idx = (i + items.length) % items.length;
      const item = items[idx];
      img.src = item.dataset.full;
      img.alt = $('img', item).alt;
      count.textContent = `${idx + 1} / ${items.length}`;
    };
    const close = () => lb.close();

    items.forEach((item, i) => item.addEventListener('click', () => {
      lastFocus = item;
      show(i);
      lb.showModal();
      document.body.style.overflow = 'hidden';
    }));
    lb.addEventListener('close', () => {
      document.body.style.overflow = '';
      lastFocus?.focus();
    });
    $('[data-lb-close]', lb).addEventListener('click', close);
    $('[data-lb-prev]', lb).addEventListener('click', () => show(idx - 1));
    $('[data-lb-next]', lb).addEventListener('click', () => show(idx + 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    lb.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });

    // deslizar no celular
    let x0 = null;
    lb.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  } else {
    // sem <dialog>: abre a imagem em nova aba
    items.forEach(item => item.addEventListener('click', () => window.open(item.dataset.full, '_blank', 'noopener')));
  }
})();
