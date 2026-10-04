/* copiar.js — botões "Copiar" para blocos de texto (textarea). Tenta execCommand (síncrono, dentro do gesto do clique) e cai para a Clipboard API. */
(function () {
  document.querySelectorAll('[data-copiar]').forEach(function (b) {
    var alvo = document.getElementById(b.getAttribute('data-copiar'));
    var estado = b.parentElement.querySelector('.copiar__estado');
    if (!alvo) return;
    b.addEventListener('click', function () {
      function ok() { if (estado) estado.textContent = 'Copiado. Preencha os campos entre colchetes antes de enviar.'; }
      function falha() { alvo.focus(); alvo.select(); if (estado) estado.textContent = 'Não consegui copiar sozinho: o texto está selecionado, use Ctrl+C.'; }
      alvo.focus(); alvo.select();
      var feito = false;
      try { feito = document.execCommand('copy'); } catch (e) {}
      if (feito) { ok(); return; }
      if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(alvo.value).then(ok, falha); return; }
      falha();
    });
  });
})();
