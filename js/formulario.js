/* formulario.js (v1) — validação acessível + envio por e-mail (mailto:).
   Não há servidor: ao enviar, o navegador abre o app de e-mail do visitante com a mensagem pronta.
   Sem JS, o formulário usa action="mailto:" (comportamento depende do app de e-mail) e a validação nativa. */
(function () {
  var f = document.querySelector('form[data-formulario]');
  if (!f) return;
  var sucesso = document.getElementById('sucesso');
  var destino = f.getAttribute('data-mailto') || '';
  var params = new URLSearchParams(location.search), pre = params.get('assunto'), sel = f.querySelector('select[name="assunto"]');
  if (pre && sel) { var o = sel.querySelector('option[value="' + pre.replace(/[^a-z-]/g, '') + '"]'); if (o) sel.value = o.value; }
  f.setAttribute('novalidate', '');
  function mensagem(c) {
    var v = c.validity;
    if (v.valueMissing) return 'preencha este campo.';
    if (v.typeMismatch) return 'o e-mail parece incompleto (exemplo: nome@dominio.com).';
    if (v.tooShort) return 'escreva pelo menos ' + c.minLength + ' caracteres.';
    return 'valor inválido.';
  }
  function checa(c) {
    var campo = c.closest('.campo'); var erro = campo && campo.querySelector('.campo__erro');
    if (c.checkValidity()) { c.removeAttribute('aria-invalid'); if (erro) erro.textContent = ''; return true; }
    c.setAttribute('aria-invalid', 'true'); if (erro) erro.textContent = mensagem(c); return false;
  }
  f.querySelectorAll('input, select, textarea').forEach(function (c) {
    c.addEventListener('blur', function () { if (c.value || c.hasAttribute('aria-invalid')) checa(c); });
    c.addEventListener('input', function () { if (c.hasAttribute('aria-invalid')) checa(c); });
  });
  f.addEventListener('submit', function (e) {
    var primeiro = null;
    f.querySelectorAll('input, select, textarea').forEach(function (c) { if (!checa(c) && !primeiro) primeiro = c; });
    e.preventDefault();
    if (primeiro) { primeiro.focus(); return; }
    var rot = sel ? sel.options[sel.selectedIndex].text : 'Contato';
    var assunto = 'Contato pelo site: ' + rot;
    var corpo = 'Nome: ' + f.nome.value + '\nE-mail para resposta: ' + f.email.value + '\nAssunto: ' + rot + '\n\n' + f.mensagem.value + '\n';
    if (!destino) { f.hidden = true; sucesso.hidden = false; sucesso.focus(); return; }   /* modo demonstração */
    f.hidden = true; sucesso.hidden = false; sucesso.focus();
    window.location.href = 'mailto:' + destino + '?subject=' + encodeURIComponent(assunto) + '&body=' + encodeURIComponent(corpo);
  });
  var novo = document.getElementById('novo');
  if (novo) novo.addEventListener('click', function () { f.hidden = false; sucesso.hidden = true; f.querySelector('input').focus(); });
})();
