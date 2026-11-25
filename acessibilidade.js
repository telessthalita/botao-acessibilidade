/*!
 * Botão de acessibilidade · v1.1.0
 * Um arquivo só, sem dependências. Funciona em qualquer site (HTML, WordPress, etc.).
 *
 * Uso:
 *   <script src="acessibilidade.js" defer
 *     data-cor="#1449c7"        (cor do botão e das opções ligadas)
 *     data-lado="direita"       (direita | esquerda)
 *     data-libras="sim"         (sim | nao: mostra a opção de Libras pelo VLibras, do governo federal)
 *     data-altura="meio"        (topo | meio | baixo: onde o botão fica na lateral)
 *     data-tamanho="medio"      (pequeno | medio | grande)
 *     data-textos='{"titulo":"Acessibilidade"}'  (opcional: troca qualquer rótulo, veja TEXTOS abaixo)
 *   ></script>
 *
 * Opções: tamanho do texto, ouvir a página, contraste escuro e claro, tons de cinza, destacar links,
 * fonte legível, espaçamento entre linhas, parar animações, cursor grande, guia de leitura e Libras.
 * As escolhas ficam salvas no aparelho de quem visita (localStorage).
 *
 * CSP: os estilos entram por uma folha construída (adoptedStyleSheets), que não depende de
 * 'unsafe-inline'. Em navegador antigo, cai para <style> com o mesmo nonce do <script>.
 */
(function () {
  'use strict';
  if (window.__botaoAcessibilidade) return; // não monta duas vezes
  window.__botaoAcessibilidade = true;

  var script = document.currentScript || document.querySelector('script[src*="acessibilidade"]');
  var ds = (script && script.dataset) || {};
  var cfg = {
    cor: /^#[0-9a-f]{3,8}$/i.test(ds.cor || '') ? ds.cor : '#1449c7',
    lado: ds.lado === 'esquerda' ? 'esquerda' : 'direita',
    libras: ds.libras !== 'nao',
    altura: /^(topo|baixo)$/.test(ds.altura || '') ? ds.altura : 'meio',
    tamanho: /^(pequeno|grande)$/.test(ds.tamanho || '') ? ds.tamanho : 'medio',
  };
  var nonce = script ? (script.nonce || script.getAttribute('nonce') || '') : '';

  // rótulos: dá para trocar qualquer um com data-textos='{"chave":"texto"}'
  var TEXTOS = {
    botao: 'Acessibilidade', titulo: 'Acessibilidade', fechar: 'Fechar',
    tamanho: 'Tamanho do texto', diminuir: 'Diminuir o texto', aumentar: 'Aumentar o texto',
    ouvirTitulo: 'Ouvir o texto da página', ouvir: '▶ Ouvir', pausar: '❚❚ Pausar', continuar: '▶ Continuar',
    devagar: 'Ler mais devagar', rapido: 'Ler mais rápido', velocidade: 'Velocidade da leitura',
    dica: 'Dica: selecione um trecho antes para ouvir só ele.',
    contrasteEscuro: 'Contraste escuro', contrasteClaro: 'Contraste claro', cinza: 'Tons de cinza',
    links: 'Destacar links', legivel: 'Fonte mais legível', espaco: 'Mais espaço entre linhas',
    parado: 'Parar animações', cursor: 'Cursor grande', guia: 'Guia de leitura',
    libras: 'Libras (VLibras)', restaurar: 'Restaurar o padrão',
  };
  try {
    var extra = JSON.parse(ds.textos || '{}');
    Object.keys(extra || {}).forEach(function (k) { if (k in TEXTOS && typeof extra[k] === 'string' && extra[k].trim()) TEXTOS[k] = extra[k]; });
  } catch (e) {}

  var CHAVE = 'botao-acessibilidade';
  var TAMANHOS = [90, 100, 115, 130, 150];
  var VELOCIDADES = [0.5, 0.75, 1, 1.25, 1.5, 2]; // velocidade da leitura em voz alta (1 = normal)
  function nivelVelocidade() { return typeof prefs.velocidade === 'number' && VELOCIDADES[prefs.velocidade] ? prefs.velocidade : 2; }
  function nivelFonte() { return typeof prefs.fonte === 'number' && TAMANHOS[prefs.fonte] ? prefs.fonte : 1; }
  var raiz = document.documentElement;
  var prefs = ler();
  var aplicar = function () {}; // definida em montar()

  function ler() { try { return JSON.parse(localStorage.getItem(CHAVE) || '{}') || {}; } catch (e) { return {}; } }
  function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(prefs)); } catch (e) {} }

  // "Parar animações" segue o sistema (prefers-reduced-motion) até a pessoa escolher no painel
  var menosMovimento = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  function parado() { return typeof prefs.parado === 'boolean' ? prefs.parado : !!menosMovimento.matches; }
  // contraste: 'escuro', 'claro' ou desligado (true, de versões antigas, vira 'escuro')
  function modoContraste() { return prefs.contraste === true ? 'escuro' : (prefs.contraste === 'escuro' || prefs.contraste === 'claro') ? prefs.contraste : false; }

  // [chave, texto, ícone, modo de contraste]
  var OPCOES = [
    ['contraste-escuro', 'contrasteEscuro', 'M12 3a9 9 0 1 0 0 18zM12 3a9 9 0 0 1 0 18', 'escuro'],
    ['contraste-claro', 'contrasteClaro', 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4', 'claro'],
    ['cinza', 'cinza', 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18'],
    ['links', 'links', 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1'],
    ['legivel', 'legivel', 'M5 19 11 5l6 14M7.5 14h7'],
    ['espaco', 'espaco', 'M4 6h16M4 12h16M4 18h16'],
    ['parado', 'parado', 'M8 5v14M16 5v14'],
    ['cursor', 'cursor', 'M5 3l14 7-6 2-2 6z'],
    ['guia', 'guia', 'M3 10h18v4H3z'],
  ];
  function ligado(o) { return o[3] ? modoContraste() === o[3] : o[0] === 'parado' ? parado() : !!prefs[o[0]]; }
  function aplicarClasses() { OPCOES.forEach(function (o) { raiz.classList.toggle('ba11y-' + o[0], ligado(o)); }); }

  // o que é do próprio botão (e do VLibras) nunca é alterado pelos modos
  var FORA = ['.ba11y-painel', '.ba11y-botao', '.ba11y-guia-faixa', '[vw]'];
  var FORA_SEL = FORA.join(',');
  var naoWidget = FORA.map(function (s) { return ':not(' + s + '):not(' + s + ' *)'; }).join('');

  // ---------- estilos (todos com prefixo ba11y- para não brigar com o site)
  var lado = cfg.lado === 'esquerda' ? 'left' : 'right';
  // tamanho: [largura, altura, largura no hover, ícone] (no mínimo 44 px, alvo de toque recomendado)
  var medida = { pequeno: [44, 48, 50, 22], medio: [48, 54, 56, 26], grande: [56, 64, 64, 32] }[cfg.tamanho];
  var posicao = {
    topo: 'top:96px;transform:none',
    meio: 'top:calc(50% - 74px);transform:translateY(-50%)', // um pouco acima do meio, longe do VLibras
    baixo: 'top:auto;bottom:24px;transform:none',
  }[cfg.altura];

  function regrasContraste(modo, fundo, texto, link) {
    var h = 'html.ba11y-contraste-' + modo;
    var alvo = h + ' body *:not(img):not(video):not(iframe):not(canvas):not(picture):not(svg):not(svg *)' + naoWidget;
    var a = h + ' body a' + naoWidget;
    return [
      h + '{background-color:' + fundo + '!important}',
      h + ' body{background-color:' + fundo + '!important;color:' + texto + '!important}',
      // texto e bordas na cor do modo; os fundos são tratados por elemento em contrastar(), para preservar imagens
      alvo + ',' + alvo + '::before,' + alvo + '::after{color:' + texto + '!important;-webkit-text-fill-color:currentColor!important;border-color:' + texto + '!important;box-shadow:none!important;text-shadow:none!important}',
      alvo + '::placeholder{color:' + texto + '!important;opacity:.75!important}',
      a + ',' + a + ' *{color:' + link + '!important;text-decoration:underline!important}',
    ].join('\n');
  }

  var css = [
    '.ba11y-botao{position:fixed;' + lado + ':0;' + posicao + ';z-index:2147483000;display:grid;place-items:center;width:' + medida[0] + 'px;height:' + medida[1] + 'px;border:0;border-radius:' + (lado === 'right' ? '14px 0 0 14px' : '0 14px 14px 0') + ';cursor:pointer;background:' + cfg.cor + ';color:#fff;box-shadow:0 6px 20px rgba(0,0,0,.25);transition:width .2s;padding:0}',
    '.ba11y-botao:hover,.ba11y-botao:focus-visible{width:' + medida[2] + 'px}',
    '.ba11y-painel{position:fixed;' + lado + ':12px;top:50%;transform:translateY(-50%);z-index:2147483001;width:min(360px,calc(100vw - 24px));max-height:calc(100vh - 24px);overflow:auto;background:#fff;color:#1b1f2a;border-radius:18px;padding:18px;box-shadow:0 20px 60px rgba(0,0,0,.35);font:16px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;box-sizing:border-box;text-align:left}',
    '.ba11y-painel *{box-sizing:border-box;font-family:inherit;letter-spacing:normal;word-spacing:normal}',
    '.ba11y-painel[hidden],.ba11y-guia-faixa[hidden],.ba11y-painel [hidden]{display:none!important}',
    '.ba11y-topo{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}',
    '.ba11y-topo h2{margin:0;font-size:18px;font-weight:700;color:#1b1f2a}',
    '.ba11y-fechar{border:0;background:#eef1f6;border-radius:10px;width:44px;height:44px;cursor:pointer;font-size:16px;color:#1b1f2a}',
    '.ba11y-caixa{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 10px;padding:10px 12px;border-radius:12px;background:#eef1f6;margin-bottom:12px;font-weight:600}',
    '.ba11y-caixa .ba11y-linha{display:flex;align-items:center;gap:6px}',
    '.ba11y-caixa button{border:0;background:' + cfg.cor + ';color:#fff;border-radius:10px;min-width:44px;height:44px;padding:0 12px;font-weight:700;font-size:15px;cursor:pointer}',
    '.ba11y-caixa output{min-width:48px;text-align:center;font-weight:700}',
    '.ba11y-ouvir{display:grid}.ba11y-ouvir .ba11y-linha button:first-child{flex:1}',
    '.ba11y-ouvir small{font-weight:400;color:#4d5363;font-size:13px}',
    '.ba11y-grade{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
    '.ba11y-opcao{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:84px;padding:10px 8px;border:2px solid #dfe4ec;border-radius:12px;background:#fff;color:#1b1f2a;font-weight:600;font-size:14px;line-height:1.2;cursor:pointer;text-align:center}',
    '.ba11y-opcao:hover{border-color:' + cfg.cor + '}',
    '.ba11y-opcao[aria-pressed="true"]{background:' + cfg.cor + ';border-color:' + cfg.cor + ';color:#fff}',
    '.ba11y-restaurar{width:100%;min-height:44px;margin-top:12px;border:2px solid #dfe4ec;background:#fff;border-radius:12px;padding:10px;font-weight:700;font-size:15px;cursor:pointer;color:#1b1f2a}',
    '.ba11y-botao:focus-visible,.ba11y-painel button:focus-visible{outline:3px solid #ffbf00;outline-offset:2px}',
    '.ba11y-guia-faixa{position:fixed;left:0;right:0;top:0;z-index:2147482999;height:44px;pointer-events:none;background:rgba(255,214,0,.18);border-top:2px solid rgba(0,0,0,.55);border-bottom:2px solid rgba(0,0,0,.55)}',
    // modos
    regrasContraste('escuro', '#000', '#fff', '#ffd400'),
    regrasContraste('claro', '#fff', '#000', '#0645ad'),
    'html.ba11y-cinza{filter:grayscale(1)}',
    'html.ba11y-links a' + naoWidget + '{text-decoration:underline!important;text-decoration-thickness:2px!important;text-underline-offset:.2em!important;background-color:rgba(255,214,0,.28)!important;outline:1px solid currentColor}',
    'html.ba11y-legivel body *' + naoWidget + '{font-family:Verdana,Tahoma,Arial,sans-serif!important;letter-spacing:.04em!important;word-spacing:.14em!important}',
    'html.ba11y-espaco body p,html.ba11y-espaco body li,html.ba11y-espaco body blockquote,html.ba11y-espaco body dd{line-height:2!important}',
    'html.ba11y-espaco body p{margin-bottom:1.4em!important}',
    // animações vão direto para o estado final (em vez de sumir, o que deixaria elementos invisíveis)
    'html.ba11y-parado *,html.ba11y-parado *::before,html.ba11y-parado *::after{animation-duration:.001ms!important;animation-delay:0s!important;animation-iteration-count:1!important;transition-duration:.001ms!important;transition-delay:0s!important;scroll-behavior:auto!important}',
    'html.ba11y-cursor,html.ba11y-cursor *{cursor:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'48\' height=\'48\' viewBox=\'0 0 24 24\'%3E%3Cpath d=\'M4 2l15 9-6.5 1.5L10 19z\' fill=\'%23000\' stroke=\'%23fff\' stroke-width=\'1.5\' stroke-linejoin=\'round\'/%3E%3C/svg%3E") 6 3,auto!important}',
    // Alto contraste do Windows (forced-colors): o sistema troca as cores, então o estado ligado
    // precisa de marca própria, e os nossos modos de contraste ficam escondidos (seriam redundantes)
    '@media (forced-colors:active){' +
      '.ba11y-botao,.ba11y-painel,.ba11y-fechar,.ba11y-caixa button,.ba11y-restaurar{border:2px solid ButtonText}' +
      '.ba11y-opcao[aria-pressed="true"]{forced-color-adjust:none;background:Highlight;color:HighlightText;border-color:Highlight}' +
      '.ba11y-opcao[data-opcao^="contraste"]{display:none}' +
      '.ba11y-guia-faixa{forced-color-adjust:none;background:transparent;border-color:Highlight}' +
      '.ba11y-botao:focus-visible,.ba11y-painel button:focus-visible{outline-color:Highlight}' +
    '}',
    '@media print{.ba11y-botao,.ba11y-painel,.ba11y-guia-faixa{display:none!important}}',
  ].join('\n');

  function injetarEstilos() {
    try {
      if ('adoptedStyleSheets' in document && 'replaceSync' in CSSStyleSheet.prototype) {
        var folha = new CSSStyleSheet(); folha.replaceSync(css);
        document.adoptedStyleSheets = document.adoptedStyleSheets.concat(folha);
        return;
      }
    } catch (e) {}
    var estilo = document.createElement('style'); estilo.id = 'ba11y-estilos';
    if (nonce) estilo.nonce = nonce;
    estilo.textContent = css; (document.head || raiz).appendChild(estilo);
  }

  // ---------- estilos aplicados direto nos elementos, com como desfazer
  // Guarda o valor original de cada propriedade para devolver o site exatamente como estava.
  function Camada() { this.els = []; this.orig = new WeakMap(); }
  Camada.prototype.por = function (e, prop, valor) {
    var o = this.orig.get(e);
    if (!o) { o = {}; this.orig.set(e, o); this.els.push(e); }
    if (!(prop in o)) o[prop] = [e.style.getPropertyValue(prop), e.style.getPropertyPriority(prop)];
    e.style.setProperty(prop, valor, 'important');
  };
  Camada.prototype.limpar = function () {
    var self = this;
    this.els.forEach(function (e) {
      var o = self.orig.get(e);
      for (var p in o) { if (o[p][0]) e.style.setProperty(p, o[p][0], o[p][1]); else e.style.removeProperty(p); }
      self.orig.delete(e);
    });
    this.els = [];
  };
  var camadaEscala = new Camada(), camadaContraste = new Camada();
  var SEM_TEXTO = /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|IFRAME|VIDEO|AUDIO|CANVAS|IMG|PICTURE|SOURCE|OBJECT|EMBED)$/;
  function doSite(e) { return e instanceof HTMLElement && !SEM_TEXTO.test(e.tagName) && !e.closest(FORA_SEL); }

  // Tamanho do texto: mede o tamanho de cada elemento com texto e escala um por um.
  // Funciona com px, rem, em, Tailwind ou clamp(), sem depender do font-size da raiz.
  function alvosDeTexto() {
    var vistos = new Set(), alvos = [];
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: function (n) { return /\S/.test(n.nodeValue) ? 1 : 3; } });
    var n, p;
    while ((n = w.nextNode())) { p = n.parentElement; if (p && !vistos.has(p)) { vistos.add(p); alvos.push(p); } }
    Array.prototype.forEach.call(document.body.querySelectorAll('input,textarea,select,button'), function (e) { if (!vistos.has(e)) { vistos.add(e); alvos.push(e); } });
    return alvos.filter(doSite);
  }
  function escalar() {
    var fator = TAMANHOS[nivelFonte()] / 100;
    if (fator === 1) return;
    var alvos = alvosDeTexto();
    // primeiro lê tudo (sem nada escalado), depois escreve: um cálculo de layout só
    var medidas = alvos.map(function (e) { var cs = getComputedStyle(e); return [parseFloat(cs.fontSize), cs.lineHeight]; });
    alvos.forEach(function (e, i) {
      var fs = medidas[i][0], lh = medidas[i][1];
      if (!fs) return;
      camadaEscala.por(e, 'font-size', (fs * fator).toFixed(2) + 'px');
      if (lh !== 'normal' && parseFloat(lh)) camadaEscala.por(e, 'line-height', (parseFloat(lh) * fator).toFixed(2) + 'px');
    });
  }

  // Contraste: fundos com cor viram a cor do modo; imagens de fundo continuam, com um véu por cima
  // quando há texto sobre elas; formas pequenas (ícones, linhas do menu) ficam na cor do texto.
  function corVisivel(c) {
    if (!c || c === 'transparent') return false;
    var m = c.match(/rgba?\(([^)]*)\)/);
    if (!m) return true;
    var p = m[1].split(/[\s,\/]+/).filter(Boolean);
    return p.length < 4 || parseFloat(p[3]) > 0;
  }
  function contrastar() {
    var modo = modoContraste();
    if (!modo) return;
    var fundo = modo === 'escuro' ? '#000' : '#fff', texto = modo === 'escuro' ? '#fff' : '#000';
    var veu = modo === 'escuro' ? 'rgba(0,0,0,.78)' : 'rgba(255,255,255,.85)';
    var lista = [document.body].concat(Array.prototype.slice.call(document.body.querySelectorAll('*'))).filter(doSite);
    var leituras = [];
    lista.forEach(function (e) {
      var cs = getComputedStyle(e), img = cs.backgroundImage, temImg = !!img && img !== 'none', temCor = corVisivel(cs.backgroundColor);
      if (!temImg && !temCor) return;
      var vazio = !e.firstElementChild && !/\S/.test(e.textContent);
      leituras.push([e, temImg && /url\(/.test(img), temImg, temCor, vazio, vazio && temCor && !temImg ? e.getBoundingClientRect() : null]);
    });
    leituras.forEach(function (l) {
      var e = l[0], foto = l[1], temImg = l[2], temCor = l[3], vazio = l[4], r = l[5];
      if (foto) { if (!vazio) camadaContraste.por(e, 'box-shadow', 'inset 0 0 0 100vmax ' + veu); }
      else if (temImg) camadaContraste.por(e, 'background-image', 'none'); // degradê decorativo
      if (e === document.body || !temCor) return;
      if (vazio && !temImg) camadaContraste.por(e, 'background-color', r.width >= 120 && r.height >= 120 ? 'transparent' : texto);
      else camadaContraste.por(e, 'background-color', fundo);
    });
  }

  // Parar animações: além do CSS, pausa vídeos que tocam sozinhos (e volta a tocar ao desligar)
  var pausadosPorNos = [], estavaParado = false;
  function videoAutomatico(v) { return v.autoplay || (v.muted && v.loop); }
  function pausarVideos(sim) {
    if (sim) {
      Array.prototype.forEach.call(document.querySelectorAll('video'), function (v) {
        if (!v.paused && !v.closest(FORA_SEL)) { v.pause(); if (pausadosPorNos.indexOf(v) < 0) pausadosPorNos.push(v); }
      });
    } else {
      pausadosPorNos.forEach(function (v) { if (v.isConnected) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } });
      pausadosPorNos = [];
    }
  }
  // vídeo com autoplay que começa depois (carrossel, conteúdo carregado depois) também é pausado
  document.addEventListener('play', function (e) {
    var v = e.target;
    if (parado() && v && v.tagName === 'VIDEO' && videoAutomatico(v) && !v.closest(FORA_SEL)) {
      v.pause(); if (pausadosPorNos.indexOf(v) < 0) pausadosPorNos.push(v);
    }
  }, true);

  function reaplicar() {
    camadaEscala.limpar(); camadaContraste.limpar();
    if (!document.body) return;
    escalar(); contrastar();
    var p = parado(); if (p !== estavaParado) { estavaParado = p; pausarVideos(p); }
  }
  // conteúdo que entra depois (menus, carrosséis, AJAX) e mudança de largura da tela
  var espera = null;
  function agendar() { if (espera) return; espera = setTimeout(function () { espera = null; reaplicar(); }, 300); }
  function precisaReaplicar() { return nivelFonte() !== 1 || !!modoContraste(); }

  // ---------- montagem
  var SVG = 'http://www.w3.org/2000/svg';
  function icone(d, tam) {
    var s = document.createElementNS(SVG, 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', tam || 22); s.setAttribute('height', tam || 22); s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false');
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
    var botao = el('button', { type: 'button', classe: 'ba11y-botao', 'aria-label': TEXTOS.botao, 'aria-expanded': 'false', 'aria-controls': 'ba11y-painel' });
    botao.appendChild(icone('M12 2.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM4 8.5c2.6.8 5.3 1.2 8 1.2s5.4-.4 8-1.2M12 9.7V15m0 0-3 6m3-6 3 6', medida[3]));

    var tamanho = el('output', { 'aria-live': 'polite', texto: '100%' });
    var menos = el('button', { type: 'button', 'aria-label': TEXTOS.diminuir, texto: 'A−' });
    var mais = el('button', { type: 'button', 'aria-label': TEXTOS.aumentar, texto: 'A+' });
    var fechar = el('button', { type: 'button', classe: 'ba11y-fechar', 'aria-label': TEXTOS.fechar, texto: '✕' });
    var falar = el('button', { type: 'button', texto: TEXTOS.ouvir });
    var devagar = el('button', { type: 'button', 'aria-label': TEXTOS.devagar, texto: '−' });
    var velocidade = el('output', { 'aria-live': 'polite', 'aria-label': TEXTOS.velocidade, texto: '1x' });
    var rapido = el('button', { type: 'button', 'aria-label': TEXTOS.rapido, texto: '+' });
    var ouvir = el('div', { classe: 'ba11y-caixa ba11y-ouvir', role: 'group', 'aria-label': TEXTOS.ouvirTitulo }, [
      el('span', { texto: TEXTOS.ouvirTitulo }), el('div', { classe: 'ba11y-linha' }, [falar, devagar, velocidade, rapido]),
      el('small', { texto: TEXTOS.dica })]);
    if (!('speechSynthesis' in window)) ouvir.hidden = true;

    var grade = el('div', { classe: 'ba11y-grade' });
    OPCOES.forEach(function (o) {
      var b = el('button', { type: 'button', classe: 'ba11y-opcao', 'aria-pressed': 'false', 'data-opcao': o[0] }, [icone(o[2]), el('span', { texto: TEXTOS[o[1]] })]);
      b.addEventListener('click', function () {
        if (o[3]) prefs.contraste = modoContraste() === o[3] ? false : o[3]; // escuro e claro: um desliga o outro
        else prefs[o[0]] = !ligado(o);
        salvar(); aplicar();
      });
      grade.appendChild(b);
    });
    var libras = null;
    if (cfg.libras) {
      libras = el('button', { type: 'button', classe: 'ba11y-opcao', 'aria-pressed': 'false' }, [icone('M7 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1V4.5a1.5 1.5 0 0 1 3 0V10m0-.5V6a1.5 1.5 0 0 1 3 0v7c0 4-2.5 7-6 7s-5-1.6-6.5-4.5L2.8 12.4a1.5 1.5 0 0 1 2.6-1.4L7 13'), el('span', { texto: TEXTOS.libras })]);
      libras.addEventListener('click', function () { prefs.libras = !prefs.libras; salvar(); aplicar(); if (prefs.libras) { abrir(false); botao.focus(); carregarLibras(true); } else location.reload(); });
      grade.insertBefore(libras, grade.firstChild); // Libras vem primeiro na grade
    }
    var restaurar = el('button', { type: 'button', classe: 'ba11y-restaurar', texto: TEXTOS.restaurar });

    var painel = el('div', { id: 'ba11y-painel', classe: 'ba11y-painel', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'ba11y-titulo', hidden: '' }, [
      el('div', { classe: 'ba11y-topo' }, [el('h2', { id: 'ba11y-titulo', texto: TEXTOS.titulo }), fechar]),
      el('div', { classe: 'ba11y-caixa', role: 'group', 'aria-label': TEXTOS.tamanho }, [el('span', { texto: TEXTOS.tamanho }), el('div', { classe: 'ba11y-linha' }, [menos, tamanho, mais])]),
      ouvir, grade, restaurar]);
    // Classe própria da faixa: ba11y-guia no <html> indica apenas a preferência ativa.
    var guia = el('div', { classe: 'ba11y-guia-faixa', 'aria-hidden': 'true', hidden: '' });
    document.body.appendChild(botao); document.body.appendChild(painel); document.body.appendChild(guia);

    aplicar = function () {
      tamanho.textContent = TAMANHOS[nivelFonte()] + '%';
      velocidade.textContent = String(VELOCIDADES[nivelVelocidade()]).replace('.', ',') + 'x';
      aplicarClasses();
      OPCOES.forEach(function (o) { grade.querySelector('[data-opcao="' + o[0] + '"]').setAttribute('aria-pressed', String(ligado(o))); });
      if (libras) libras.setAttribute('aria-pressed', String(!!prefs.libras));
      guia.hidden = !prefs.guia;
      reaplicar();
    };
    window.__ba11yAplicar = function () { aplicar(); };

    function abrir(sim) { painel.hidden = !sim; botao.setAttribute('aria-expanded', String(sim)); if (sim) fechar.focus(); }
    botao.addEventListener('click', function () { abrir(painel.hidden); });
    fechar.addEventListener('click', function () { abrir(false); botao.focus(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !painel.hidden) { abrir(false); botao.focus(); } });
    document.addEventListener('click', function (e) { if (!painel.hidden && !painel.contains(e.target) && !botao.contains(e.target)) abrir(false); });
    function mudarFonte(d) { prefs.fonte = Math.min(TAMANHOS.length - 1, Math.max(0, nivelFonte() + d)); salvar(); aplicar(); }
    menos.addEventListener('click', function () { mudarFonte(-1); });
    mais.addEventListener('click', function () { mudarFonte(1); });
    restaurar.addEventListener('click', function () { var t = prefs.libras; prefs = {}; salvar(); aplicar(); if (t) location.reload(); });
    addEventListener('pointermove', function (e) { if (prefs.guia) guia.style.transform = 'translateY(' + (e.clientY - 22) + 'px)'; }, { passive: true });

    // ouvir: leitura em voz alta pelo próprio navegador, em português
    if ('speechSynthesis' in window) {
      var marcar = function (lendo, pausado) { falar.textContent = lendo && !pausado ? TEXTOS.pausar : pausado ? TEXTOS.continuar : TEXTOS.ouvir; };
      var voz = function () { var v = speechSynthesis.getVoices(); return v.filter(function (x) { return /^pt(-|_)BR/i.test(x.lang); })[0] || v.filter(function (x) { return /^pt/i.test(x.lang); })[0]; };
      var texto = function () {
        var sel = String(window.getSelection() || '').trim(); if (sel) return sel;
        var area = document.querySelector('main, [role="main"], article, #content, .entry-content') || document.body;
        var copia = area.cloneNode(true);
        Array.prototype.forEach.call(copia.querySelectorAll('script, style, noscript, nav, .ba11y-painel, .ba11y-botao'), function (n) { n.remove(); });
        return (copia.innerText || copia.textContent || '').trim();
      };
      // lê uma frase por vez, para poder recomeçar da frase atual quando a velocidade muda
      var partes = [], atual = 0, sessao = 0, pausado = false, mudouPausado = false;
      var lerFrase = function () {
        if (atual >= partes.length) { partes = []; marcar(false); return; }
        var s = sessao, feito = false;
        var f = new SpeechSynthesisUtterance(partes[atual]); f.lang = 'pt-BR'; var v = voz(); if (v) f.voice = v;
        f.rate = VELOCIDADES[nivelVelocidade()];
        f.onend = f.onerror = function () { if (feito || s !== sessao) return; feito = true; atual++; lerFrase(); };
        speechSynthesis.speak(f);
      };
      var recomecar = function () { sessao++; speechSynthesis.cancel(); lerFrase(); };
      falar.addEventListener('click', function () {
        if (partes.length && !pausado) { speechSynthesis.pause(); pausado = true; marcar(true, true); return; }
        if (partes.length && pausado) {
          speechSynthesis.resume(); pausado = false; marcar(true);
          if (mudouPausado) { mudouPausado = false; recomecar(); }
          return;
        }
        partes = (texto().match(/[^.!?\n]+[.!?]*\s*/g) || []).map(function (p) { return p.trim(); }).filter(Boolean);
        atual = 0; pausado = false; mudouPausado = false;
        if (!partes.length) return;
        recomecar(); marcar(true);
      });
      var mudarVelocidade = function (d) {
        prefs.velocidade = Math.min(VELOCIDADES.length - 1, Math.max(0, nivelVelocidade() + d)); salvar(); aplicar();
        if (partes.length) { if (pausado) mudouPausado = true; else recomecar(); }
      };
      devagar.addEventListener('click', function () { mudarVelocidade(-1); });
      rapido.addEventListener('click', function () { mudarVelocidade(1); });
      // "Restaurar o padrão" também para a leitura: o próximo "Ouvir" começa do início
      restaurar.addEventListener('click', function () {
        if (!partes.length) return;
        sessao++; partes = []; atual = 0; pausado = false; mudouPausado = false;
        speechSynthesis.resume(); speechSynthesis.cancel(); marcar(false);
      });
      addEventListener('pagehide', function () { sessao++; speechSynthesis.cancel(); });
    }

    // reaplica quando entra conteúdo novo ou a largura da tela muda (breakpoints, clamp, vw)
    if (window.MutationObserver) {
      new MutationObserver(function (lista) {
        if (!precisaReaplicar()) return;
        for (var i = 0; i < lista.length; i++) { if (!lista[i].target.closest || !lista[i].target.closest(FORA_SEL)) { agendar(); return; } }
      }).observe(document.body, { childList: true, subtree: true });
    }
    var largura = innerWidth;
    addEventListener('resize', function () { if (innerWidth !== largura) { largura = innerWidth; if (precisaReaplicar()) agendar(); } });
    addEventListener('load', function () { if (precisaReaplicar()) agendar(); });
    var aoMudarSistema = function () { if (typeof prefs.parado !== 'boolean') aplicar(); };
    if (menosMovimento.addEventListener) menosMovimento.addEventListener('change', aoMudarSistema);

    aplicar();
    if (cfg.libras && prefs.libras) carregarLibras();
  }

  // Libras: widget oficial do governo federal (VLibras), carregado só quando a pessoa liga a opção
  // abrirJa: quando a pessoa acabou de ligar a opção, já abre o avatar sem precisar de outro clique
  function carregarLibras(abrirJa) {
    if (abrirJa) abrirAvatar();
    if (document.querySelector('[vw]')) return;
    var caixa = el('div', { vw: '', classe: 'enabled' }, [el('div', { 'vw-access-button': '', classe: 'active' }), el('div', { 'vw-plugin-wrapper': '' }, [el('div', { classe: 'vw-plugin-top-wrapper' })])]);
    document.body.appendChild(caixa);
    var s = document.createElement('script');
    if (nonce) s.nonce = nonce;
    s.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    s.onload = function () { if (window.VLibras) { new window.VLibras.Widget('https://vlibras.gov.br/app'); window.dispatchEvent(new Event('load')); } };
    document.body.appendChild(s);
  }

  // espera o widget do VLibras montar o botão dele e clica nele (desiste depois de ~15s)
  function abrirAvatar() {
    var tentativas = 0;
    var t = setInterval(function () {
      // versão atual: botão dentro de um shadow root; versões antigas: dentro de [vw-access-button]
      var sombra = document.getElementById('vlibras-access-wrapper');
      var b = (sombra && sombra.shadowRoot && sombra.shadowRoot.getElementById('vlibras-button')) ||
        document.querySelector('[vw-access-button] > *');
      if (b) { clearInterval(t); b.click(); }
      else if (++tentativas > 60) clearInterval(t);
    }, 250);
  }

  // estilos e classes já salvas o quanto antes (evita piscar); o botão monta quando a página estiver pronta
  injetarEstilos();
  OPCOES.forEach(function (o) { if (o[0] !== 'guia' && ligado(o)) raiz.classList.add('ba11y-' + o[0]); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar); else montar();
})();
