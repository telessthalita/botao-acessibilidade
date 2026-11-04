/*!
 * Botão de acessibilidade · v1.0.0
 * Um arquivo só, sem dependências. Funciona em qualquer site (HTML, WordPress, etc.).
 *
 * Uso:
 *   <script src="acessibilidade.js" defer
 *     data-cor="#1449c7"        (cor do botão e das opções ligadas)
 *     data-lado="direita"       (direita | esquerda)
 *     data-libras="sim"         (sim | nao: mostra a opção de Libras pelo VLibras, do governo federal)
 *   ></script>
 *
 * Opções: tamanho do texto, ouvir a página, alto contraste, tons de cinza, destacar links,
 * fonte legível, espaçamento entre linhas, parar animações, cursor grande, guia de leitura e Libras.
 * As escolhas ficam salvas no aparelho de quem visita (localStorage).
 */
(function () {
  'use strict';
  if (window.__botaoAcessibilidade) return; // não monta duas vezes
  window.__botaoAcessibilidade = true;

  var script = document.currentScript || document.querySelector('script[src*="acessibilidade"]');
  var cfg = {
    cor: (script && /^#[0-9a-f]{3,8}$/i.test(script.dataset.cor || '')) ? script.dataset.cor : '#1449c7',
    lado: script && script.dataset.lado === 'esquerda' ? 'esquerda' : 'direita',
    libras: !(script && script.dataset.libras === 'nao'),
  };
  var CHAVE = 'botao-acessibilidade';
  var TAMANHOS = [90, 100, 115, 130, 150];
  var raiz = document.documentElement;
  var prefs = ler();

  function ler() { try { return JSON.parse(localStorage.getItem(CHAVE) || '{}') || {}; } catch (e) { return {}; } }
  function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(prefs)); } catch (e) {} }

  // ---------- estilos (todos com prefixo ba11y- para não brigar com o site)
  var lado = cfg.lado === 'esquerda' ? 'left' : 'right';
  var css = [
    '.ba11y-botao{position:fixed;' + lado + ':0;top:calc(50% - 74px);transform:translateY(-50%);z-index:2147483000;display:grid;place-items:center;width:46px;height:52px;border:0;border-radius:' + (lado === 'right' ? '14px 0 0 14px' : '0 14px 14px 0') + ';cursor:pointer;background:' + cfg.cor + ';color:#fff;box-shadow:0 6px 20px rgba(0,0,0,.25);transition:width .2s;padding:0}',
    '.ba11y-botao:hover,.ba11y-botao:focus-visible{width:54px}',
    '.ba11y-painel{position:fixed;' + lado + ':12px;top:50%;transform:translateY(-50%);z-index:2147483001;width:min(360px,calc(100vw - 24px));max-height:calc(100vh - 24px);overflow:auto;background:#fff;color:#1b1f2a;border-radius:18px;padding:18px;box-shadow:0 20px 60px rgba(0,0,0,.35);font:16px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;box-sizing:border-box;text-align:left}',
    '.ba11y-painel *{box-sizing:border-box;font-family:inherit;letter-spacing:normal;word-spacing:normal}',
    '.ba11y-painel[hidden],.ba11y-guia[hidden]{display:none!important}',
    '.ba11y-topo{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}',
    '.ba11y-topo h2{margin:0;font-size:1.15rem;font-weight:700;color:#1b1f2a}',
    '.ba11y-fechar{border:0;background:#eef1f6;border-radius:10px;width:36px;height:36px;cursor:pointer;font-size:1rem;color:#1b1f2a}',
    '.ba11y-caixa{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 10px;padding:10px 12px;border-radius:12px;background:#eef1f6;margin-bottom:12px;font-weight:600}',
    '.ba11y-caixa .ba11y-linha{display:flex;align-items:center;gap:6px}',
    '.ba11y-caixa button{border:0;background:' + cfg.cor + ';color:#fff;border-radius:10px;min-width:44px;height:38px;padding:0 12px;font-weight:700;font-size:.95rem;cursor:pointer}',
    '.ba11y-caixa output{min-width:48px;text-align:center;font-weight:700}',
    '.ba11y-ouvir{display:grid}.ba11y-ouvir .ba11y-linha button:first-child{flex:1}',
    '.ba11y-ouvir small{font-weight:400;color:#4d5363;font-size:.82rem}',
    '.ba11y-grade{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
    '.ba11y-opcao{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:84px;padding:10px 8px;border:2px solid #dfe4ec;border-radius:12px;background:#fff;color:#1b1f2a;font-weight:600;font-size:.88rem;line-height:1.2;cursor:pointer;text-align:center}',
    '.ba11y-opcao:hover{border-color:' + cfg.cor + '}',
    '.ba11y-opcao[aria-pressed="true"]{background:' + cfg.cor + ';border-color:' + cfg.cor + ';color:#fff}',
    '.ba11y-restaurar{width:100%;margin-top:12px;border:2px solid #dfe4ec;background:#fff;border-radius:12px;padding:10px;font-weight:700;font-size:.95rem;cursor:pointer;color:#1b1f2a}',
    '.ba11y-botao:focus-visible,.ba11y-painel button:focus-visible{outline:3px solid #ffbf00;outline-offset:2px}',
    '.ba11y-guia{position:fixed;left:0;right:0;top:0;z-index:2147482999;height:44px;pointer-events:none;background:rgba(255,214,0,.18);border-top:2px solid rgba(0,0,0,.55);border-bottom:2px solid rgba(0,0,0,.55)}',
    // modos
    'html.ba11y-contraste body *:not(img):not(video):not(iframe):not(svg):not(svg *):not(.ba11y-painel):not(.ba11y-painel *):not(.ba11y-botao):not(.ba11y-botao *){background-color:#000!important;background-image:none!important;color:#fff!important;border-color:#fff!important;box-shadow:none!important;text-shadow:none!important}',
    'html.ba11y-contraste body{background:#000!important;color:#fff!important}',
    'html.ba11y-contraste body a:not(.ba11y-painel *),html.ba11y-contraste body a:not(.ba11y-painel *) *{color:#ffd400!important;text-decoration:underline!important}',
    'html.ba11y-cinza{filter:grayscale(1)}',
    'html.ba11y-links a:not(.ba11y-painel *){text-decoration:underline!important;text-decoration-thickness:2px!important;text-underline-offset:.2em!important;background-color:rgba(255,214,0,.28)!important;outline:1px solid currentColor}',
    'html.ba11y-legivel body *:not(.ba11y-painel):not(.ba11y-painel *){font-family:Verdana,Tahoma,Arial,sans-serif!important;letter-spacing:.04em!important;word-spacing:.14em!important}',
    'html.ba11y-espaco body p,html.ba11y-espaco body li,html.ba11y-espaco body blockquote,html.ba11y-espaco body dd{line-height:2!important}',
    'html.ba11y-espaco body p{margin-bottom:1.4em!important}',
    'html.ba11y-parado *,html.ba11y-parado *::before,html.ba11y-parado *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}',
    'html.ba11y-cursor,html.ba11y-cursor *{cursor:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'48\' height=\'48\' viewBox=\'0 0 24 24\'%3E%3Cpath d=\'M4 2l15 9-6.5 1.5L10 19z\' fill=\'%23000\' stroke=\'%23fff\' stroke-width=\'1.5\' stroke-linejoin=\'round\'/%3E%3C/svg%3E") 6 3,auto!important}',
    '@media print{.ba11y-botao,.ba11y-painel,.ba11y-guia{display:none!important}}',
  ].join('\n');

  // ---------- montagem
  var OPCOES = [
    ['contraste', 'Alto contraste', 'M12 3a9 9 0 1 0 0 18zM12 3a9 9 0 0 1 0 18'],
    ['cinza', 'Tons de cinza', 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18'],
    ['links', 'Destacar links', 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1'],
    ['legivel', 'Fonte mais legível', 'M5 19 11 5l6 14M7.5 14h7'],
    ['espaco', 'Mais espaço entre linhas', 'M4 6h16M4 12h16M4 18h16'],
    ['parado', 'Parar animações', 'M8 5v14M16 5v14'],
    ['cursor', 'Cursor grande', 'M5 3l14 7-6 2-2 6z'],
    ['guia', 'Guia de leitura', 'M3 10h18v4H3z'],
  ];
  var SVG = 'http://www.w3.org/2000/svg';
  function icone(d, tam) {
    var s = document.createElementNS(SVG, 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', tam || 22); s.setAttribute('height', tam || 22); s.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS(SVG, 'path'); p.setAttribute('d', d); p.setAttribute('fill', 'none'); p.setAttribute('stroke', 'currentColor'); p.setAttribute('stroke-width', '1.8'); p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round');
    s.appendChild(p); return s;
  }
  function el(tag, attrs, filhos) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) { if (k === 'texto') e.textContent = attrs[k]; else if (k === 'classe') e.className = attrs[k]; else e.setAttribute(k, attrs[k]); }
    (filhos || []).forEach(function (f) { if (f) e.appendChild(typeof f === 'string' ? document.createTextNode(f) : f); });
    return e;
  }

  function montar() {
    var estilo = el('style', { id: 'ba11y-estilos' }); estilo.textContent = css; document.head.appendChild(estilo);

    var botao = el('button', { type: 'button', classe: 'ba11y-botao', 'aria-label': 'Acessibilidade', 'aria-expanded': 'false', 'aria-controls': 'ba11y-painel' });
    botao.appendChild(icone('M12 2.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM4 8.5c2.6.8 5.3 1.2 8 1.2s5.4-.4 8-1.2M12 9.7V15m0 0-3 6m3-6 3 6', 26));

    var tamanho = el('output', { 'aria-live': 'polite', texto: '100%' });
    var menos = el('button', { type: 'button', 'aria-label': 'Diminuir o texto', texto: 'A−' });
    var mais = el('button', { type: 'button', 'aria-label': 'Aumentar o texto', texto: 'A+' });
    var fechar = el('button', { type: 'button', classe: 'ba11y-fechar', 'aria-label': 'Fechar', texto: '✕' });
    var falar = el('button', { type: 'button', texto: '▶ Ouvir' });
    var parar = el('button', { type: 'button', 'aria-label': 'Parar a leitura', texto: '■' });
    var ouvir = el('div', { classe: 'ba11y-caixa ba11y-ouvir', role: 'group', 'aria-label': 'Ouvir o texto' }, [
      el('span', { texto: 'Ouvir o texto da página' }), el('div', { classe: 'ba11y-linha' }, [falar, parar]),
      el('small', { texto: 'Dica: selecione um trecho antes para ouvir só ele.' })]);
    if (!('speechSynthesis' in window)) ouvir.hidden = true;

    var grade = el('div', { classe: 'ba11y-grade' });
    OPCOES.forEach(function (o) {
      var b = el('button', { type: 'button', classe: 'ba11y-opcao', 'aria-pressed': 'false', 'data-opcao': o[0] }, [icone(o[2]), el('span', { texto: o[1] })]);
      b.addEventListener('click', function () { prefs[o[0]] = !prefs[o[0]]; salvar(); aplicar(); });
      grade.appendChild(b);
    });
    var libras = null;
    if (cfg.libras) {
      libras = el('button', { type: 'button', classe: 'ba11y-opcao', 'aria-pressed': 'false' }, [icone('M7 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1V4.5a1.5 1.5 0 0 1 3 0V10m0-.5V6a1.5 1.5 0 0 1 3 0v7c0 4-2.5 7-6 7s-5-1.6-6.5-4.5L2.8 12.4a1.5 1.5 0 0 1 2.6-1.4L7 13'), el('span', { texto: 'Libras (VLibras)' })]);
      libras.addEventListener('click', function () { prefs.libras = !prefs.libras; salvar(); aplicar(); if (prefs.libras) carregarLibras(); else location.reload(); });
      grade.appendChild(libras);
    }
    var restaurar = el('button', { type: 'button', classe: 'ba11y-restaurar', texto: 'Restaurar o padrão' });

    var painel = el('div', { id: 'ba11y-painel', classe: 'ba11y-painel', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'ba11y-titulo', hidden: '' }, [
      el('div', { classe: 'ba11y-topo' }, [el('h2', { id: 'ba11y-titulo', texto: 'Acessibilidade' }), fechar]),
      el('div', { classe: 'ba11y-caixa', role: 'group', 'aria-label': 'Tamanho do texto' }, [el('span', { texto: 'Tamanho do texto' }), el('div', { classe: 'ba11y-linha' }, [menos, tamanho, mais])]),
      ouvir, grade, restaurar]);
    var guia = el('div', { classe: 'ba11y-guia', 'aria-hidden': 'true', hidden: '' });
    document.body.appendChild(botao); document.body.appendChild(painel); document.body.appendChild(guia);

    function aplicar() {
      var nivel = typeof prefs.fonte === 'number' ? prefs.fonte : 1;
      raiz.style.fontSize = nivel === 1 ? '' : TAMANHOS[nivel] + '%';
      tamanho.textContent = TAMANHOS[nivel] + '%';
      OPCOES.forEach(function (o) {
        raiz.classList.toggle('ba11y-' + o[0], !!prefs[o[0]]);
        grade.querySelector('[data-opcao="' + o[0] + '"]').setAttribute('aria-pressed', String(!!prefs[o[0]]));
      });
      if (libras) libras.setAttribute('aria-pressed', String(!!prefs.libras));
      guia.hidden = !prefs.guia;
    }
    window.__ba11yAplicar = aplicar;

    function abrir(sim) { painel.hidden = !sim; botao.setAttribute('aria-expanded', String(sim)); if (sim) fechar.focus(); }
    botao.addEventListener('click', function () { abrir(painel.hidden); });
    fechar.addEventListener('click', function () { abrir(false); botao.focus(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !painel.hidden) { abrir(false); botao.focus(); } });
    document.addEventListener('click', function (e) { if (!painel.hidden && !painel.contains(e.target) && !botao.contains(e.target)) abrir(false); });
    function mudarFonte(d) { var a = typeof prefs.fonte === 'number' ? prefs.fonte : 1; prefs.fonte = Math.min(TAMANHOS.length - 1, Math.max(0, a + d)); salvar(); aplicar(); }
    menos.addEventListener('click', function () { mudarFonte(-1); });
    mais.addEventListener('click', function () { mudarFonte(1); });
    restaurar.addEventListener('click', function () { var t = prefs.libras; prefs = {}; salvar(); aplicar(); if (t) location.reload(); });
    addEventListener('pointermove', function (e) { if (prefs.guia) guia.style.transform = 'translateY(' + (e.clientY - 22) + 'px)'; }, { passive: true });

    // ouvir: leitura em voz alta pelo próprio navegador, em português
    if ('speechSynthesis' in window) {
      var marcar = function (lendo, pausado) { falar.textContent = lendo && !pausado ? '❚❚ Pausar' : pausado ? '▶ Continuar' : '▶ Ouvir'; };
      var voz = function () { var v = speechSynthesis.getVoices(); return v.filter(function (x) { return /^pt(-|_)BR/i.test(x.lang); })[0] || v.filter(function (x) { return /^pt/i.test(x.lang); })[0]; };
      var texto = function () {
        var sel = String(window.getSelection() || '').trim(); if (sel) return sel;
        var area = document.querySelector('main, [role="main"], article, #content, .entry-content') || document.body;
        var copia = area.cloneNode(true);
        Array.prototype.forEach.call(copia.querySelectorAll('script, style, noscript, nav, .ba11y-painel, .ba11y-botao'), function (n) { n.remove(); });
        return (copia.innerText || copia.textContent || '').trim();
      };
      falar.addEventListener('click', function () {
        if (speechSynthesis.speaking && !speechSynthesis.paused) { speechSynthesis.pause(); marcar(true, true); return; }
        if (speechSynthesis.paused) { speechSynthesis.resume(); marcar(true); return; }
        var partes = texto().match(/[^.!?\n]+[.!?]*\s*/g) || [];
        partes.forEach(function (p, i) {
          var f = new SpeechSynthesisUtterance(p.trim()); f.lang = 'pt-BR'; var v = voz(); if (v) f.voice = v;
          if (i === partes.length - 1) f.onend = function () { marcar(false); };
          speechSynthesis.speak(f);
        });
        marcar(true);
      });
      parar.addEventListener('click', function () { speechSynthesis.cancel(); marcar(false); });
      addEventListener('pagehide', function () { speechSynthesis.cancel(); });
    }

    aplicar();
    if (cfg.libras && prefs.libras) carregarLibras();
  }

  // Libras: widget oficial do governo federal (VLibras), carregado só quando a pessoa liga a opção
  function carregarLibras() {
    if (document.querySelector('[vw]')) return;
    var caixa = el('div', { vw: '', classe: 'enabled' }, [el('div', { 'vw-access-button': '', classe: 'active' }), el('div', { 'vw-plugin-wrapper': '' }, [el('div', { classe: 'vw-plugin-top-wrapper' })])]);
    document.body.appendChild(caixa);
    var s = document.createElement('script');
    s.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    s.onload = function () { if (window.VLibras) { new window.VLibras.Widget('https://vlibras.gov.br/app'); window.dispatchEvent(new Event('load')); } };
    document.body.appendChild(s);
  }

  // aplica as classes já salvas o quanto antes (evita piscar), e monta o botão quando a página estiver pronta
  ['contraste', 'cinza', 'links', 'legivel', 'espaco', 'parado', 'cursor'].forEach(function (k) { if (prefs[k]) raiz.classList.add('ba11y-' + k); });
  if (typeof prefs.fonte === 'number' && prefs.fonte !== 1) raiz.style.fontSize = TAMANHOS[prefs.fonte] + '%';
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar); else montar();
})();
