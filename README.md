# Botão de Acessibilidade

Botão lateral de acessibilidade em **um único arquivo JavaScript**, sem dependências. Funciona em qualquer site e tem um plugin pronto para WordPress.

## O que tem

- **Tamanho do texto**, em 5 níveis (90% a 150%). Mede e escala cada elemento com texto, então funciona com `px`, `rem`, `em`, Tailwind e `clamp()`, e acompanha conteúdo que entra depois e mudança de largura da tela
- **Ouvir o texto da página**: leitura em voz alta pelo próprio navegador, em português. Um botão só para ouvir, pausar e continuar, e botões − e + para a velocidade da leitura (de 0,5x a 2x). "Restaurar o padrão" também para a leitura. Se a pessoa selecionar um trecho, só ele é lido.
- **Contraste escuro** (fundo preto, texto branco, links amarelos) e **contraste claro** (fundo branco, texto preto, links azuis). Fotos e imagens de fundo continuam aparecendo, com um véu por cima quando há texto sobre elas
- **Tons de cinza**
- **Destacar links**
- **Fonte mais legível** e espaçada (ajuda quem tem dislexia)
- **Mais espaço entre as linhas**
- **Parar animações**: zera animações e transições, pausa vídeos com autoplay (inclusive os que começam depois) e volta a tocá-los ao desligar. Já vem ligada para quem ativou "reduzir movimento" no sistema (`prefers-reduced-motion`)
- **Cursor grande**
- **Guia de leitura**: uma faixa que acompanha o ponteiro
- **Libras** pelo [VLibras](https://vlibras.gov.br), ferramenta gratuita do governo federal. Só carrega quando a pessoa liga a opção.
- **Restaurar o padrão**

As escolhas ficam salvas no aparelho de quem visita (localStorage). Nada é enviado para servidor nenhum.

## Em qualquer site (HTML)

Copie `acessibilidade.js` para o site e coloque antes de `</body>`:

```html
<script src="/acessibilidade.js" defer data-cor="#1449c7" data-lado="direita" data-libras="sim"></script>
```

| Atributo | Valores | Padrão |
|---|---|---|
| `data-cor` | cor em hexadecimal | `#1449c7` |
| `data-lado` | `direita` ou `esquerda` | `direita` |
| `data-libras` | `sim` ou `nao` | `sim` |
| `data-altura` | `topo`, `meio` ou `baixo` | `meio` |
| `data-tamanho` | `pequeno`, `medio` ou `grande` | `medio` |

Para testar no computador, abra `demo.html` no navegador.

### Trocar os rótulos

Qualquer texto do botão pode ser trocado com `data-textos`, em JSON. As chaves estão em `TEXTOS`, no começo de `acessibilidade.js`:

```html
<script src="/acessibilidade.js" defer data-textos='{"titulo":"Recursos de acessibilidade","botao":"Abrir acessibilidade"}'></script>
```

No WordPress, use o filtro `botao_acessibilidade_textos`.

### Detalhes técnicos

- **CSP**: os estilos entram por uma folha construída (`adoptedStyleSheets`), então não precisam de `'unsafe-inline'`. Em navegador antigo, o `<style>` recebe o mesmo `nonce` do `<script>`, e o script do VLibras também.
- **Alto contraste do Windows** (`forced-colors`): as opções ligadas ganham marca com as cores do sistema, e os modos de contraste próprios ficam escondidos, porque o sistema já faz isso.
- **Alvos de toque** de no mínimo 44 × 44 px em todos os botões, inclusive no tamanho pequeno.

## No WordPress

1. Rode `empacotar.ps1`. Ele copia o `acessibilidade.js` para dentro do plugin e gera o `botao-acessibilidade.zip`. Não use o "Download ZIP" do GitHub: ele traz o repositório inteiro e sem o JS dentro do plugin.
2. No WordPress, vá em **Plugins > Adicionar novo > Enviar plugin** e envie o `.zip`.
3. Ative o plugin. As opções ficam no item **Botão Acessibilidade** do menu lateral do painel: cor, lado da tela, altura, tamanho do botão e Libras. Ao lado tem uma pré-visualização que muda na hora; para valer no site, clique em Salvar.

## Como funciona

- **Um arquivo, sem dependências.** Todo o código fica numa função que roda na hora (IIFE), em JavaScript compatível com navegadores antigos e sem build. Uma trava global impede que o botão seja montado duas vezes.
- **Configuração pela tag `<script>`.** O script lê os próprios `data-*` (via `document.currentScript`) e valida cada valor. A cor só passa se for hexadecimal, e o resto só aceita as opções da lista. No WordPress, o PHP escreve esses atributos com os valores salvos no painel.
- **CSS gerado pelo JS.** O visual é montado com a cor, o lado, a altura e o tamanho escolhidos e injetado num `<style>`. Todas as classes começam com `ba11y-` para não brigar com o tema.
- **Cada recurso é uma classe no `<html>`.** Ligar o alto contraste, por exemplo, só adiciona `ba11y-contraste`, e o CSS cuida do resto. O tamanho do texto muda o `font-size` do `<html>` em porcentagem, e o guia de leitura é uma faixa fixa que segue o ponteiro.
- **Leitura em voz alta** com a Web Speech API do navegador, em pt-BR. O script lê o trecho selecionado ou a área principal da página, sem menus nem o próprio painel, e divide o texto em frases para contornar o corte de falas longas do Chrome.
- **Libras sob demanda.** O VLibras só é baixado quando a pessoa liga a opção, e o avatar abre sozinho nesse momento. Desligar recarrega a página, porque o widget não tem como ser desmontado.
- **Escolhas salvas no aparelho.** As preferências ficam em `localStorage`, com proteção para quando ele está bloqueado. As classes salvas são aplicadas antes de o botão aparecer, para a página não piscar.
- **Acessível por si só.** Usa `aria-expanded`, `aria-pressed` e `aria-live` para o leitor de tela, abre e fecha pelo teclado (Esc fecha e o foco volta ao botão) e mostra contorno de foco só para quem navega pelo teclado.

## Observações

- **Tamanho do texto:** funciona melhor em sites que usam `rem`/`em` nas fontes (a maioria dos temas modernos). Em temas que fixam tudo em `px`, o aumento é menor.
- **Sites com política de segurança (CSP):** para o Libras funcionar, libere `https://vlibras.gov.br` (script, estilo, imagem, fonte, conexão e **frame**, porque o avatar abre numa janela interna), `https://cdn.jsdelivr.net/gh/spbgovbr-vlibras/` e `https://cdn.jsdelivr.net/npm/posthog-js@1.404.0/` (estatísticas de uso do próprio VLibras; a versão pode mudar quando o governo atualizar o widget). Sem CSP, que é o caso da maioria dos sites WordPress, não precisa fazer nada.
- **Privacidade:** o VLibras é do governo federal e envia estatísticas de uso para o próprio governo. Ele só é carregado quando o visitante liga a opção de Libras.
- **Leitura em voz alta:** usa as vozes instaladas no aparelho. No celular e no Chrome, o português costuma vir pronto.

## Licença

MIT
