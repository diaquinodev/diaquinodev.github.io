/* movimento.js — v5 · revelações ao rolar e contadores discretos. JS puro (~1,5 KB), sem biblioteca, sem laço contínuo.
   - Movimento reduzido ou sem IntersectionObserver: não faz nada (a página fica como o HTML, completa e parada).
   - Só marca (.rev) blocos que estão ABAIXO da dobra no carregamento: o que já está na tela nunca "pisca". O hero nunca é marcado (ele tem a sua animação).
   - A revelação é só opacity + translateY(14px): nenhum layout shift. Depois de revelado, as classes saem (o hover do cartão fica livre). */
(function () {
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  if (mq.matches || !('IntersectionObserver' in window)) return;
  var ALVOS = 'main .cabeca-secao, main .grade > li, main .servico:not(.servico--compacto), main .passos > li, main .faixa-cta, main .caso, main .lista-notas .nota';
  var altura = window.innerHeight || document.documentElement.clientHeight;
  var rev = [].filter.call(document.querySelectorAll(ALVOS), function (el) {
    return !el.closest('.heroi') && !el.closest('.od') && !el.parentElement.closest('.rev') && el.getBoundingClientRect().top > altura * 0.92;
  });
  var ordem = new Map();
  rev.forEach(function (el) { var n = ordem.get(el.parentElement) || 0; ordem.set(el.parentElement, n + 1); el.style.setProperty('--i', Math.min(n, 4)); el.classList.add('rev'); });

  var conta = [].filter.call(document.querySelectorAll('[data-conta]'), function (el) { return el.getBoundingClientRect().top > altura; });
  conta.forEach(function (el) { el.style.minWidth = el.textContent.length + 'ch'; el.textContent = '0'; });
  function contar(el) {
    var fim = parseInt(el.getAttribute('data-conta'), 10), t0 = null, DUR = 700;
    function passo(t) {
      if (t0 === null) t0 = t; var k = Math.min(1, (t - t0) / DUR), e = 1 - Math.pow(1 - k, 3);
      el.textContent = String(Math.round(fim * e)); if (k < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }

  var io = new IntersectionObserver(function (itens) {
    itens.forEach(function (it) {
      if (!it.isIntersecting) return; var el = it.target; io.unobserve(el);
      if (el.classList.contains('rev')) { el.classList.add('rev--ok'); setTimeout(function () { el.classList.remove('rev', 'rev--ok'); el.style.removeProperty('--i'); }, 1100); }
      if (el.hasAttribute('data-conta')) setTimeout(function () { contar(el); }, 180);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  rev.forEach(function (el) { io.observe(el); });
  conta.forEach(function (el) { io.observe(el); });
})();
