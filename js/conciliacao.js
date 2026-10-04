/* conciliacao.js — v2 · concilia a tabela origem × destino linha a linha ao entrar na viewport (IntersectionObserver),
   com controles "Reproduzir" e "Reiniciar". JS puro, sem biblioteca, sem loop.
   - O HTML vem no estado FINAL. Sem JS, ou com prefers-reduced-motion, nada se move e a tabela já está completa.
   - Com movimento reduzido, "Reproduzir" atualiza o estado na hora (sem animação) e "Reiniciar" volta ao estado "a conferir".
   - Estados do componente (data-estado): inicial · tocando · concluido. Estados da linha: pendente · conferindo · conferido · divergente.
   - Acessibilidade: botões nativos (Tab/Enter/Espaço), aria-disabled em vez de disabled (o foco não se perde),
     texto do estado em aria-live="polite" (atualizado só no início, na divergência e no fim, para não metralhar o leitor de tela). */
(function () {
  var raizes = document.querySelectorAll('[data-conciliacao]');
  if (!raizes.length) return;
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var PASSO = 480;   // ms entre linhas
  var VARRER = 400;  // ms até a linha mostrar o resultado (a varredura dura 380 ms)

  [].forEach.call(raizes, function (raiz) {
    var linhas = [].slice.call(raiz.querySelectorAll('tbody tr'));
    var total = linhas.length;
    var estado = raiz.querySelector('.od__estado');
    var andamento = raiz.querySelector('.od__linha');
    var bPlay = raiz.querySelector('[data-od="reproduzir"]');
    var bReset = raiz.querySelector('[data-od="reiniciar"]');
    var textoFim = estado.getAttribute('data-fim');
    var timers = [], observer = null, ativo = false;

    function fala(t) { estado.textContent = t; }
    function viva(sim) { estado.setAttribute('aria-live', sim ? 'polite' : 'off'); }
    function setComp(e) { raiz.setAttribute('data-estado', e); atualizaBotoes(); }
    function atualizaBotoes() {
      var e = raiz.getAttribute('data-estado');
      bPlay.setAttribute('aria-disabled', e === 'tocando' ? 'true' : 'false');
      bReset.setAttribute('aria-disabled', e === 'inicial' ? 'true' : 'false');
    }
    function limpa() { timers.forEach(clearTimeout); timers = []; }
    function agenda(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function todas(e) { linhas.forEach(function (l) { l.setAttribute('data-estado', e); }); }
    function finais() { linhas.forEach(function (l) { l.setAttribute('data-estado', l.getAttribute('data-final')); }); }
    function pendente() { limpa(); todas('pendente'); andamento.textContent = ''; setComp('inicial'); }

    function reiniciar() {
      limpa(); pendente();
      raiz.classList.remove('od--anima');
      viva(true);
      fala('Pronto para conferir as ' + total + ' linhas. Aperte Reproduzir.');
    }

    function reproduzir() {
      if (raiz.getAttribute('data-estado') === 'tocando') return;
      limpa();
      if (mq.matches) {                       // sem movimento: só atualiza o estado
        raiz.classList.remove('od--anima');
        todas('pendente'); finais(); andamento.textContent = ''; setComp('concluido'); viva(true); fala(textoFim);
        return;
      }
      raiz.classList.add('od--anima');
      todas('pendente'); andamento.textContent = ''; setComp('tocando');
      viva(true);
      fala('Conciliando as ' + total + ' linhas de exemplo.');
      var t0 = 350;                           // pausa curta para o "a conferir" ser visto (também no replay)
      linhas.forEach(function (l, i) {
        agenda(function () { l.setAttribute('data-estado', 'conferindo'); andamento.textContent = 'Linha ' + (i + 1) + ' de ' + total; }, t0 + i * PASSO);
        agenda(function () {
          var f = l.getAttribute('data-final');
          l.setAttribute('data-estado', f);
          if (f === 'divergente') fala('Linha ' + (i + 1) + ': origem ≠ destino. Marcada como divergente.');
        }, t0 + i * PASSO + VARRER);
      });
      agenda(function () { andamento.textContent = ''; setComp('concluido'); fala(textoFim); }, t0 + (total - 1) * PASSO + VARRER + 120);
    }

    function aperta(botao, fn) {
      botao.addEventListener('click', function () {
        if (botao.getAttribute('aria-disabled') === 'true') return;
        if (observer) { observer.disconnect(); observer = null; }   // o visitante assumiu o controle
        ativo = true; fn();
      });
    }
    aperta(bPlay, reproduzir);
    aperta(bReset, reiniciar);
    atualizaBotoes();

    // Movimento reduzido ou sem IntersectionObserver: fica no estado final do HTML.
    if (mq.matches || !('IntersectionObserver' in window)) return;

    // Começa "a conferir" e toca uma única vez quando a tabela aparece. Para tabelas altas (celular),
    // basta metade do que cabe na tela: não se exige a tabela inteira visível.
    // v5: reserva a altura do MAIOR texto de estado, para a frase trocar sem empurrar a página (layout shift = 0)
    var TEXTOS = [textoFim, 'A conferência começa quando esta tabela aparece na tela. Você também pode apertar Reproduzir.', 'Conciliando as ' + total + ' linhas de exemplo.',
      'Linha ' + total + ': origem ≠ destino. Marcada como divergente.', 'Pronto para conferir as ' + total + ' linhas. Aperte Reproduzir.'];
    function reserva() {   // mede num clone invisível (a região aria-live não é tocada, então nada é anunciado)
      var c = estado.cloneNode(false); c.removeAttribute('id'); c.removeAttribute('role'); c.removeAttribute('aria-live'); c.setAttribute('aria-hidden', 'true');
      c.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;min-height:0;width:' + estado.getBoundingClientRect().width + 'px';
      estado.parentNode.appendChild(c); var max = 0;
      TEXTOS.forEach(function (tx) { c.textContent = tx; max = Math.max(max, c.offsetHeight); });
      estado.parentNode.removeChild(c); estado.style.minHeight = max + 'px';
    }
    reserva(); var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(reserva, 120); });
    pendente(); raiz.classList.add('od--anima');
    viva(false);   // frase inicial é só para quem olha: não deve ser lida ao carregar a página
    fala('A conferência começa quando esta tabela aparece na tela. Você também pode apertar Reproduzir.');
    var alvo = raiz.querySelector('.od__tabela');
    var limiares = []; for (var k = 0; k <= 20; k++) limiares.push(k / 20);
    observer = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        var vis = en.intersectionRect.height, precisa = Math.min(en.boundingClientRect.height * 0.5, window.innerHeight * 0.4);
        if (en.isIntersecting && vis >= precisa - 1 && !ativo) {
          ativo = true; observer.disconnect(); observer = null; reproduzir();
        }
      });
    }, { threshold: limiares });
    observer.observe(alvo);
  });
})();
