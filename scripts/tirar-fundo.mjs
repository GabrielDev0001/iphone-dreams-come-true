/**
 * Tira o fundo branco das fotos de `public/produtos/`, deixando só o aparelho.
 *
 * Como funciona: em vez de apagar todo pixel claro (o que furaria as telas
 * acesas e as laterais prateadas), o script faz um preenchimento a partir das
 * bordas da imagem. Só vira transparente o branco que está **ligado à borda**,
 * então o que estiver cercado pelo aparelho fica intacto.
 *
 * A faixa entre SOFT e DURO vira transparência parcial, o que come a sombra
 * suave do render e evita serrilhado branco na silhueta.
 *
 * Uso:
 *   npm install --no-save sharp
 *   node scripts/tirar-fundo.mjs [pasta-de-saida]
 */
import sharp from "sharp";
import { readdir, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ENTRADA = "public/produtos";
const SAIDA = process.argv[2] ?? "public/produtos";

/** Acima disso, e ligado à borda, é fundo puro. */
const DURO = 240;
/** Entre SOFT e DURO a transparência é proporcional (sombra e anti-serrilhado). */
const SOFT = 205;

async function tirarFundo(nome) {
  // Lê para um buffer antes de processar: assim dá para reescrever o próprio
  // arquivo, que o sharp não permite quando está lendo direto do caminho.
  const original = await readFile(path.join(ENTRADA, nome));
  const { data, info } = await sharp(original)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: L, height: A, channels: C } = info;
  const total = L * A;
  const alpha = new Uint8Array(total).fill(255);
  const visto = new Uint8Array(total);
  const fila = new Int32Array(total);
  let ini = 0;
  let fim = 0;

  /** Canal mais escuro do pixel — perto de 255 significa quase branco. */
  const claridade = (i) => {
    const o = i * C;
    return Math.min(data[o], data[o + 1], data[o + 2]);
  };

  const visitar = (i) => {
    if (visto[i]) return;
    const c = claridade(i);
    if (c >= DURO) {
      visto[i] = 1;
      alpha[i] = 0;
      fila[fim++] = i;
    } else if (c >= SOFT) {
      visto[i] = 1;
      alpha[i] = Math.round((255 * (DURO - c)) / (DURO - SOFT));
      fila[fim++] = i;
    }
  };

  // Semeia a fila com as quatro bordas da imagem.
  for (let x = 0; x < L; x++) {
    visitar(x);
    visitar((A - 1) * L + x);
  }
  for (let y = 0; y < A; y++) {
    visitar(y * L);
    visitar(y * L + L - 1);
  }

  while (ini < fim) {
    const i = fila[ini++];
    const x = i % L;
    const y = (i / L) | 0;
    if (x > 0) visitar(i - 1);
    if (x < L - 1) visitar(i + 1);
    if (y > 0) visitar(i - L);
    if (y < A - 1) visitar(i + L);
  }

  // Aplica o alpha calculado e descarta a moldura que ficou vazia.
  for (let i = 0; i < total; i++) data[i * C + 3] = alpha[i];

  const transparentes = alpha.reduce((n, a) => n + (a === 0 ? 1 : 0), 0);

  const saida = await sharp(data, { raw: { width: L, height: A, channels: C } })
    .trim({ threshold: 1 })
    .webp({ quality: 88, alphaQuality: 100 })
    .toBuffer({ resolveWithObject: true });

  await writeFile(path.join(SAIDA, nome), saida.data);

  return {
    nome,
    de: `${L}x${A}`,
    para: `${saida.info.width}x${saida.info.height}`,
    fundoRemovido: `${((transparentes / total) * 100).toFixed(0)}%`,
    kb: (saida.data.length / 1024).toFixed(1),
  };
}

const arquivos = (await readdir(ENTRADA)).filter((f) => f.endsWith(".webp")).sort();
if (SAIDA !== ENTRADA) await mkdir(SAIDA, { recursive: true });

for (const nome of arquivos) {
  const r = await tirarFundo(nome);
  console.log(
    `${r.nome.padEnd(18)} ${r.de.padStart(9)} -> ${r.para.padStart(9)}  ` +
      `fundo ${r.fundoRemovido.padStart(3)}  ${r.kb.padStart(6)} KB`,
  );
}
console.log(`\n${arquivos.length} imagens processadas.`);
