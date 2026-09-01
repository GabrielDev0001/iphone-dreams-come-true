# Fotos dos aparelhos

O site usa **uma foto por modelo**, mostrada em todas as cores daquele aparelho.
A ilustração vetorial não é mais usada na vitrine.

## Nome do arquivo

```
{id-do-modelo}.webp
```

O `id-do-modelo` é o campo `id` em `src/lib/iphones.ts`.

Exemplos:

```
17-pro-max.webp
16-pro.webp
14.webp
```

Salvou o arquivo com esse nome, o site troca sozinho — sem mexer no código.

## Cobertura atual

Os 15 modelos têm foto. Cada uma é da variante escura do aparelho:

| Modelo | Cor fotografada |
| --- | --- |
| 17 Pro Max, 17 Pro | Azul Profundo |
| 17 Air | Preto Espacial |
| 17 | Preto |
| 16 Pro Max, 16 Pro | Titânio Preto |
| 16 Plus, 16 | Preto |
| 15 Pro Max, 15 Pro | Titânio Preto |
| 15 | Preto |
| 14 Pro Max, 14 Pro | Preto-espacial |
| 14 Plus, 14 | Meia-noite |

Ou seja: quem escolhe Rosa ou Branco vê a mesma foto do aparelho escuro. O nome
da cor escolhida continua correto no card, no resumo e no pedido.

## Recomendações

- Fotografe o **seu** estoque, não use render de divulgação da Apple — as imagens
  oficiais são protegidas por direito autoral e o cliente precisa ver o aparelho
  que vai receber.
- Fundo neutro, aparelho centralizado, mesma distância em todas as fotos.
- Proporção quadrada (ex.: 1200×1200) e no máximo ~200 KB por arquivo, senão a
  vitrine fica lenta no celular.

### Origem das imagens atuais

Vieram de anúncios do Mercado Livre e são material promocional do fabricante,
não do estoque da loja. Substitua por fotos próprias assim que possível.

### Voltar a ter foto por cor

Em `src/lib/iphones.ts`, faça `photoFor` receber a cor de novo e montar
`{id-do-modelo}-{cor-em-slug}.webp` (ex.: `17-pro-max-azul-profundo.webp`). O
histórico do git tem essa versão.
