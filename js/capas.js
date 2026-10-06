/* capas.js — v6 · capas dos casos: revelação ao rolar e parallax leve no hover. JS puro (~1 KB), sem biblioteca, sem laço contínuo.
   - Movimento reduzido ou sem IntersectionObserver: não faz nada (as capas ficam visíveis e paradas, como no HTML).
   - Só esconde capas que estão ABAIXO da dobra no carregamento (nada "pisca"); revelada, a classe sai.
   - Parallax: só com mouse (hover: hover e pointer: fine); desloca a imagem no máximo 6 px seguindo o ponteiro, via variáveis CSS. */
(function () {
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  if (mq.matches) return;
  var capas = [].slice.call(document.querySelectorAll('[data-capa]'));
  if ('IntersectionObserver' in window) {
    var altura = window.innerHeight || document.documentElement.clientHeight;
    var ocultas = capas.filter(function (c) { return c.getBoundingClientRect().top > altura * 0.92; });
    ocultas.forEach(function (c) { c.classList.add('capa--oculta'); });
    var io = new IntersectionObserver(function (itens) {
      itens.forEach(function (it) {
        if (!it.isIntersecting) return; var c = it.target; io.unobserve(c);
        c.classList.add('capa--revela'); requestAnimationFrame(function () { requestAnimationFrame(function () { c.classList.remove('capa--oculta'); }); });
        setTimeout(function () { c.classList.remove('capa--revela'); }, 1300);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
    ocultas.forEach(function (c) { io.observe(c); });
  }
  if (!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches)) return;
  capas.forEach(function (c) {
    var alvo = c.closest('.cartao-projeto') || c, img = c.querySelectorAll('.capa__img');
    alvo.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect(); if (!r.width) return;
      var x = ((e.clientX - r.left) / r.width - 0.5) * -12, y = ((e.clientY - r.top) / r.height - 0.5) * -12;
      x = Math.max(-6, Math.min(6, x)); y = Math.max(-6, Math.min(6, y));
      for (var i = 0; i < img.length; i++) { img[i].style.setProperty('--px', x.toFixed(1) + 'px'); img[i].style.setProperty('--py', y.toFixed(1) + 'px'); }
    });
    alvo.addEventListener('pointerleave', function () { for (var i = 0; i < img.length; i++) { img[i].style.removeProperty('--px'); img[i].style.removeProperty('--py'); } });
  });
})();
