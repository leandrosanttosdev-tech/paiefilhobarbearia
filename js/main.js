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
  const cfg = window.AGENDAMENTO;
  if (picker && cfg && typeof picker.showModal === 'function') {
    const list = $('[data-picker-list]', picker);
    const title = $('[data-picker-service]', picker);
    // barbeiros, fotos, WhatsApp e horários vêm de js/agendamento.js
    const team = cfg.barbeiros.map(b => ({
      name: b.nome,
      role: b.funcao || '',
      img: b.foto,
      phone: b.whatsapp || cfg.whatsappGeral,
      hours: b.horarios || cfg.horarios,
    }));
    const stepWho = $('[data-picker-step="who"]', picker);
    const stepWhen = $('[data-picker-step="when"]', picker);
    const whoLabel = $('[data-picker-who]', picker);
    const daysBox = $('[data-picker-days]', picker);
    const timesBox = $('[data-picker-times]', picker);
    const send = $('[data-picker-send]', picker);
    const monthLabel = $('[data-cal-month]', picker);
    const prevBtn = $('[data-cal-prev]', picker);
    const nextBtn = $('[data-cal-next]', picker);
    const monthNotes = $('[data-cal-notes]', picker);
    const holidayNote = $('[data-picker-holiday]', picker);
    const customBox = $('[data-picker-custom]', picker);
    const timeInput = $('[data-picker-time-input]', picker);
    const timeError = $('[data-picker-time-error]', picker);

    const WEEK_FULL = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    const MONTH_FULL = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const pad = n => String(n).padStart(2, '0');

    let lastTrigger = null;
    let service = null;
    let pro = null;   // null = sem preferência
    let day = null;   // Date
    let time = null;  // "HH:MM"

    const option = (avatar, name, sub, onPick) => {
      const li = document.createElement('li');
      li.innerHTML = `<button class="picker__opt" type="button">${avatar}<span class="picker__who"><b></b><small></small></span><svg class="icon" aria-hidden="true"><use href="#i-arrow" /></svg></button>`;
      $('b', li).textContent = name;
      $('small', li).textContent = sub;
      $('button', li).addEventListener('click', onPick);
      return li;
    };

    const chip = (cls, html, label, pressed, onPick) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = cls;
      b.innerHTML = html;
      if (label) b.setAttribute('aria-label', label);
      b.setAttribute('aria-pressed', String(pressed));
      b.addEventListener('click', onPick);
      return b;
    };

    const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const TIPO = { nacional: 'Feriado nacional', regional: 'Feriado regional', facultativo: 'Ponto facultativo' };
    const holidays = new Map((cfg.feriados || []).map(f => [f.data, f]));

    // dia pode ser escolhido: não passou, não é dia fechado e ainda tem horário
    const canPick = d => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return d >= today && !cfg.diasFechados.includes(d.getDay()) && slotsFor(d).length > 0;
    };

    const firstFree = () => {
      const now = new Date();
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      while (d.getFullYear() <= cfg.ano) {
        if (d.getFullYear() === cfg.ano && canPick(d)) return new Date(d);
        d.setDate(d.getDate() + 1);
      }
      return null;
    };

    // "Sem preferência" usa a lista geral de horários
    const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    // hoje: só horários com pelo menos 30 min de antecedência
    const tooSoon = (d, t) => {
      const now = new Date();
      return d.toDateString() === now.toDateString() && toMin(t) <= now.getHours() * 60 + now.getMinutes() + 30;
    };
    const slotsFor = d => (pro ? pro.hours : cfg.horarios).filter(t => !tooSoon(d, t));

    const updateSend = () => {
      const ready = day && time;
      send.setAttribute('aria-disabled', String(!ready));
      if (!ready) { send.href = '#'; return; }
      const hol = holidays.get(iso(day));
      const date = `${pad(day.getDate())}/${pad(day.getMonth() + 1)}/${day.getFullYear()} (${WEEK_FULL[day.getDay()]})${hol ? ` — feriado: ${hol.nome}` : ''}`;
      const msg = [
        'Olá! Gostaria de consultar a disponibilidade de um horário.',
        '',
        `💈 Barbeiro: ${pro ? pro.name : 'Sem preferência'}`,
        ...(service ? [`✂️ Serviço: ${service}`] : []),
        `📅 Data: ${date}`,
        `⏰ Horário: ${time}`,
        '',
        'Esse horário está disponível?',
      ].join('\n');
      const phone = pro ? pro.phone : cfg.whatsappGeral;
      send.href = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    };

    // marca só o botão escolhido, sem recriar a lista (o foco do teclado fica onde está)
    const press = (box, btn) => $$('button', box).forEach(b => b.setAttribute('aria-pressed', String(b === btn)));

    // "Outro horário": o cliente digita um horário quebrado (ex.: 10:40)
    const range = cfg.horarioLivre || { de: cfg.horarios[0], ate: cfg.horarios[cfg.horarios.length - 1] };
    let custom = false;
    timeInput.min = range.de;
    timeInput.max = range.ate;

    const checkCustom = () => {
      const v = timeInput.value;
      let err = '';
      if (v && (toMin(v) < toMin(range.de) || toMin(v) > toMin(range.ate))) err = `Escolha um horário entre ${range.de} e ${range.ate}.`;
      else if (v && day && tooSoon(day, v)) err = 'Esse horário já está muito próximo. Escolha um mais tarde.';
      time = v && !err ? v : null;
      timeError.hidden = !err;
      timeError.textContent = err;
      timeInput.setAttribute('aria-invalid', String(!!err));
    };

    const setCustom = on => {
      custom = on;
      customBox.hidden = !on;
      if (!on) { timeError.hidden = true; timeInput.removeAttribute('aria-invalid'); }
    };

    const renderTimes = () => {
      const slots = (day ? slotsFor(day) : []).map(t =>
        chip('picker__time', t, null, !custom && t === time, e => {
          time = t; setCustom(false); press(timesBox, e.currentTarget); updateSend();
        }));
      const other = chip('picker__time picker__time--other', 'Outro horário', null, custom, e => {
        press(timesBox, e.currentTarget);
        setCustom(true);
        checkCustom(); updateSend();
        timeInput.focus();
      });
      timesBox.replaceChildren(...slots, other);
    };

    timeInput.addEventListener('input', () => { checkCustom(); updateSend(); });

    // observação do dia escolhido (feriado)
    const renderNote = () => {
      const hol = day && holidays.get(iso(day));
      holidayNote.hidden = !hol;
      if (hol) holidayNote.textContent = `${pad(day.getDate())}/${pad(day.getMonth() + 1)} é ${TIPO[hol.tipo] ? TIPO[hol.tipo].toLowerCase() : 'feriado'}: ${hol.nome}. A atendente confirma pelo WhatsApp se haverá atendimento.`;
    };

    // calendário do mês (month: 0 a 11 do ano configurado)
    let month = 0;
    const renderCal = () => {
      monthLabel.textContent = `${MONTH_FULL[month]} ${cfg.ano}`;
      prevBtn.disabled = month === 0;
      nextBtn.disabled = month === 11;
      const first = new Date(cfg.ano, month, 1);
      const total = new Date(cfg.ano, month + 1, 0).getDate();
      const cells = [];
      for (let i = 0; i < first.getDay(); i++) cells.push(document.createElement('span'));
      for (let n = 1; n <= total; n++) {
        const d = new Date(cfg.ano, month, n);
        const hol = holidays.get(iso(d));
        const free = canPick(d);
        const label = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) +
          (hol ? `, ${TIPO[hol.tipo] || 'Feriado'}: ${hol.nome}` : '') + (free ? '' : ', indisponível');
        const b = chip(`cal__day${hol ? ` is-holiday is-${hol.tipo}` : ''}`, `${n}${hol ? '<i aria-hidden="true"></i>' : ''}`, label,
          !!day && d.toDateString() === day.toDateString(),
          e => {
            day = d;
            press(daysBox, e.currentTarget);
            if (custom) checkCustom();
            else if (time && !slotsFor(d).includes(time)) time = null;
            renderTimes(); renderNote(); updateSend();
          });
        if (hol) b.title = `${TIPO[hol.tipo] || 'Feriado'}: ${hol.nome}`;
        b.disabled = !free;
        cells.push(b);
      }
      daysBox.replaceChildren(...cells);
      // feriados do mês, em observação abaixo do calendário
      const monthHolidays = (cfg.feriados || []).filter(f => +f.data.slice(5, 7) === month + 1);
      monthNotes.replaceChildren(...monthHolidays.map(f => {
        const li = document.createElement('li');
        li.className = `is-${f.tipo}`;
        li.innerHTML = '<b></b> <span></span>';
        $('b', li).textContent = `${f.data.slice(8, 10)}/${f.data.slice(5, 7)}`;
        $('span', li).textContent = `${f.nome} (${(TIPO[f.tipo] || 'Feriado').toLowerCase()})`;
        return li;
      }));
      monthNotes.hidden = !monthHolidays.length;
    };
    prevBtn.addEventListener('click', () => { if (month > 0) { month--; renderCal(); } });
    nextBtn.addEventListener('click', () => { if (month < 11) { month++; renderCal(); } });

    const showStep = when => {
      stepWho.hidden = when;
      stepWhen.hidden = !when;
      picker.scrollTop = 0;
    };

    const pickPro = p => {
      pro = p;
      whoLabel.textContent = p ? p.name : 'qualquer profissional';
      day = firstFree();
      time = null;
      timeInput.value = '';
      setCustom(false);
      const now = new Date();
      month = day ? day.getMonth() : (now.getFullYear() === cfg.ano ? now.getMonth() : 0);
      renderCal(); renderTimes(); renderNote(); updateSend();
      showStep(true);
      $('[aria-pressed="true"]', daysBox)?.focus();
    };

    // service = null → agendamento geral (botões "Agendar horário")
    const open = (svc, trigger) => {
      lastTrigger = trigger;
      service = svc;
      title.textContent = svc || 'Agendar horário';
      list.replaceChildren(
        ...team.map(p => option(
          `<img class="picker__avatar" src="${p.img}" alt="" width="52" height="52" />`,
          p.name, p.role, () => pickPro(p))),
        option(
          '<span class="picker__avatar picker__avatar--any"><svg class="icon" aria-hidden="true"><use href="#i-whats" /></svg></span>',
          'Sem preferência', 'Primeiro profissional disponível', () => pickPro(null)),
      );
      showStep(false);
      picker.showModal();
      document.body.style.overflow = 'hidden';
    };

    $('[data-picker-back]', picker).addEventListener('click', () => {
      showStep(false);
      $('.picker__opt', list)?.focus();
    });
    send.addEventListener('click', e => {
      if (send.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      picker.close();
    });

    // sem JS, todos esses links continuam indo direto ao WhatsApp
    $$('[data-book]').forEach(el => el.addEventListener('click', e => {
      e.preventDefault();
      open(el.dataset.book || $('span', el).textContent.trim(), el);
    }));
    $$('[data-book-general]').forEach(el => el.addEventListener('click', e => {
      e.preventDefault();
      open(null, el);
    }));
    // botões da seção Equipe: profissional já escolhido, vai direto para dia e horário
    $$('[data-book-pro]').forEach(el => el.addEventListener('click', e => {
      const p = team.find(t => t.name === el.dataset.bookPro);
      if (!p) return; // nome não bate com a equipe: segue o link do WhatsApp
      e.preventDefault();
      open(null, el);
      pickPro(p);
    }));
    // clicar em qualquer parte do card do barbeiro (foto, nome...) faz o mesmo que o botão
    $$('.barber').forEach(card => {
      const btn = $('[data-book-pro]', card);
      if (!btn) return;
      card.classList.add('is-bookable');
      card.addEventListener('click', e => {
        if (e.target.closest('a, button')) return;
        btn.click();
      });
    });
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
