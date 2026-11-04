# Botão de Acessibilidade

Botão lateral de acessibilidade em **um único arquivo JavaScript**, sem dependências. Funciona em qualquer site e tem um plugin pronto para WordPress.

## O que tem

- **Tamanho do texto**, em 5 níveis (90% a 150%)
- **Ouvir o texto da página**: leitura em voz alta pelo próprio navegador, em português. Pausa, continua e para. Se a pessoa selecionar um trecho, só ele é lido.
- **Alto contraste**: fundo preto, texto branco e links em amarelo
- **Tons de cinza**
- **Destacar links**
- **Fonte mais legível** e espaçada (ajuda quem tem dislexia)
- **Mais espaço entre as linhas**
- **Parar animações**
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

Para testar no computador, abra `demo.html` no navegador.

## No WordPress

1. Copie `acessibilidade.js` para dentro da pasta `wordpress/botao-acessibilidade/`, ou rode `empacotar.ps1`, que já gera o `.zip` pronto.
2. No WordPress, vá em **Plugins > Adicionar novo > Enviar plugin** e envie o `.zip`.
3. Ative o plugin. As opções ficam em **Configurações > Acessibilidade**: cor, lado da tela e Libras.

## Observações

- **Tamanho do texto:** funciona melhor em sites que usam `rem`/`em` nas fontes (a maioria dos temas modernos). Em temas que fixam tudo em `px`, o aumento é menor.
- **Sites com política de segurança (CSP):** para o Libras funcionar, libere `https://vlibras.gov.br` (script, estilo, imagem, fonte, conexão e **frame**, porque o avatar abre numa janela interna), `https://cdn.jsdelivr.net/gh/spbgovbr-vlibras/` e `https://cdn.jsdelivr.net/npm/posthog-js@1.404.0/` (estatísticas de uso do próprio VLibras; a versão pode mudar quando o governo atualizar o widget). Sem CSP, que é o caso da maioria dos sites WordPress, não precisa fazer nada.
- **Privacidade:** o VLibras é do governo federal e envia estatísticas de uso para o próprio governo. Ele só é carregado quando o visitante liga a opção de Libras.
- **Leitura em voz alta:** usa as vozes instaladas no aparelho. No celular e no Chrome, o português costuma vir pronto.

## Licença

MIT
