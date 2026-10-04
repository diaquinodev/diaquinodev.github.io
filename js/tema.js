/* tema.js — alternância claro/escuro. Sem JS o site segue prefers-color-scheme.
   Carregar no <head> (sem defer) para aplicar a escolha salva antes da primeira pintura. */
(function () {
  var raiz = document.documentElement, CHAVE = 'tema-diaquino';
  try { var salvo = localStorage.getItem(CHAVE); if (salvo === 'claro' || salvo === 'escuro') raiz.setAttribute('data-tema', salvo); } catch (e) {}
  function escuroAgora() {
    var t = raiz.getAttribute('data-tema');
    return t ? t === 'escuro' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.alternar-tema').forEach(function (b) {
      b.setAttribute('aria-pressed', String(escuroAgora()));
      b.addEventListener('click', function () {
        var novo = escuroAgora() ? 'claro' : 'escuro';
        raiz.setAttribute('data-tema', novo);
        try { localStorage.setItem(CHAVE, novo); } catch (e) {}
        document.querySelectorAll('.alternar-tema').forEach(function (x) { x.setAttribute('aria-pressed', String(novo === 'escuro')); });
      });
    });
  });
})();
