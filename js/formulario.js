/* formulario.js (v5) — validação acessível + envio AJAX pelo FormSubmit (https://formsubmit.co/ajax/<e-mail>), sem sair da página.
   - POST JSON com Accept: application/json; campos: nome, email, assunto, mensagem, _subject, _template=table, _captcha=false, _honey (honeypot).
   - Estados: "Enviando…" (aria-live) com o botão desabilitado (aria-disabled, o foco não se perde) → sucesso (o bloco "conferido" do design)
     ou erro (bloco "A mensagem não foi enviada", com e-mail e WhatsApp; o texto digitado continua no formulário).
   - Sem JS: o formulário faz um POST normal para o FormSubmit (página dele, com reCAPTCHA) e a validação nativa do navegador. */
(function () {
  var f = document.querySelector('form[data-formulario]');
  if (!f) return;
  var sucesso = document.getElementById('sucesso'), falha = document.getElementById('falha'), status = document.getElementById('status-form');
  var botao = f.querySelector('[data-enviar]'), rotuloBotao = botao.textContent, destino = f.getAttribute('data-envio');
  var params = new URLSearchParams(location.search), pre = params.get('assunto'), sel = f.querySelector('select[name="assunto"]');
  if (pre && sel) { var o = sel.querySelector('option[value="' + pre.replace(/[^a-z-]/g, '') + '"]'); if (o) sel.value = o.value; }
  f.setAttribute('novalidate', '');
  var campos = [].slice.call(f.querySelectorAll('input:not([type=hidden]):not([name=_honey]), select, textarea'));
  var enviando = false;
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
  campos.forEach(function (c) {
    c.addEventListener('blur', function () { if (c.value || c.hasAttribute('aria-invalid')) checa(c); });
    c.addEventListener('input', function () { if (c.hasAttribute('aria-invalid')) checa(c); });
  });
  function ocupado(sim) {
    enviando = sim; f.setAttribute('aria-busy', sim ? 'true' : 'false');
    botao.setAttribute('aria-disabled', sim ? 'true' : 'false'); botao.textContent = sim ? 'Enviando…' : rotuloBotao;
  }
  function mostraSucesso() { status.textContent = ''; falha.hidden = true; f.hidden = true; sucesso.hidden = false; sucesso.focus(); }
  function mostraFalha() { status.textContent = 'A mensagem não foi enviada. Use o e-mail ou o WhatsApp abaixo, ou tente de novo.'; falha.hidden = false; falha.focus(); }

  f.addEventListener('submit', function (e) {
    e.preventDefault();
    if (enviando) return;
    var primeiro = null;
    campos.forEach(function (c) { if (!checa(c) && !primeiro) primeiro = c; });
    if (primeiro) { primeiro.focus(); return; }
    falha.hidden = true;
    var rot = sel ? sel.options[sel.selectedIndex].text : 'Contato';
    var dados = {
      nome: f.nome.value.trim(), email: f.email.value.trim(), assunto: rot, mensagem: f.mensagem.value.trim(),
      _subject: 'Contato pelo site: ' + rot, _template: 'table', _captcha: 'false', _honey: f._honey.value
    };
    if (dados._honey) { f.reset(); mostraSucesso(); return; }   // honeypot preenchido = robô: finge sucesso e não envia nada
    ocupado(true); status.textContent = 'Enviando a mensagem…';
    var ctl = window.AbortController ? new AbortController() : null, limite = setTimeout(function () { if (ctl) ctl.abort(); }, 15000);
    fetch(destino, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(dados), signal: ctl ? ctl.signal : undefined })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        clearTimeout(limite); ocupado(false);
        if (res.ok && (res.j.success === true || res.j.success === 'true')) { f.reset(); campos.forEach(function (c) { c.removeAttribute('aria-invalid'); }); mostraSucesso(); }
        else mostraFalha();
      })
      .catch(function () { clearTimeout(limite); ocupado(false); mostraFalha(); });
  });
  var novo = document.getElementById('novo');
  if (novo) novo.addEventListener('click', function () { f.hidden = false; sucesso.hidden = true; status.textContent = ''; f.querySelector('#nome').focus(); });
})();
