export type Banco = {
  id: string;
  nome: string;
  logo: string;
};

/** Bancos e financeiras usados na simulação/análise e na faixa da home. */
export const BANCOS: Banco[] = [
  { id: "itau", nome: "Itaú", logo: "/bancos/itau.png" },
  { id: "bradesco", nome: "Bradesco", logo: "/bancos/bradesco.png" },
  { id: "santander", nome: "Santander", logo: "/bancos/santander.png" },
  { id: "pan", nome: "Banco PAN", logo: "/bancos/pan.png" },
  { id: "bv", nome: "BV", logo: "/bancos/bv.png" },
  { id: "mercantil", nome: "Mercantil do Brasil", logo: "/bancos/mercantil.png" },
];

/** Tempo de cada consulta na tela de análise. */
export const MS_POR_BANCO = 950;
