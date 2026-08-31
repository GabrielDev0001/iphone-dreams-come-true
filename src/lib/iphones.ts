export type Condition = "lacrado" | "semi-novo";

export type PhoneColor = { name: string; hex: string };

/** Formato do módulo de câmera — usado pela arte do aparelho. */
export type PhoneShape = "pro" | "base" | "air";

/** Uma capacidade do mesmo aparelho: muda só o armazenamento e o preço. */
export type StorageOption = { storage: string; price: number };

/**
 * Um modelo agrupa todas as capacidades do mesmo aparelho, para o cliente
 * escolher 256 ou 512 sem trocar de card.
 */
export type PhoneModel = {
  id: string;
  name: string;
  condition: Condition;
  colors: PhoneColor[];
  storages: StorageOption[];
};

const PRO_17: PhoneColor[] = [
  { name: "Laranja Cósmico", hex: "#D2762F" },
  { name: "Azul Profundo", hex: "#2E3D5E" },
  { name: "Prata", hex: "#D7D9D6" },
];

const BASE_17: PhoneColor[] = [
  { name: "Lavanda", hex: "#C7BEDC" },
  { name: "Névoa", hex: "#CDD5C8" },
  { name: "Azul Neblina", hex: "#B6CADC" },
  { name: "Branco", hex: "#F1F1EF" },
  { name: "Preto", hex: "#1F1F21" },
];

const AIR_17: PhoneColor[] = [
  { name: "Azul Celeste", hex: "#AEC3D5" },
  { name: "Ouro Claro", hex: "#E3D6BB" },
  { name: "Branco Nuvem", hex: "#ECECE8" },
  { name: "Preto Espacial", hex: "#26262A" },
];

const PRO_16: PhoneColor[] = [
  { name: "Titânio Natural", hex: "#C1BBB1" },
  { name: "Titânio Deserto", hex: "#BEA38E" },
  { name: "Titânio Branco", hex: "#F1F0EC" },
  { name: "Titânio Preto", hex: "#3A3A3C" },
];

const BASE_16: PhoneColor[] = [
  { name: "Ultramarino", hex: "#9DAED7" },
  { name: "Verde-azulado", hex: "#B3C8BF" },
  { name: "Rosa", hex: "#EFC7CD" },
  { name: "Branco", hex: "#F4F4F2" },
  { name: "Preto", hex: "#2A2A2D" },
];

const PRO_15: PhoneColor[] = [
  { name: "Titânio Natural", hex: "#C5C1BA" },
  { name: "Titânio Azul", hex: "#5B6B81" },
  { name: "Titânio Branco", hex: "#F0F0EE" },
  { name: "Titânio Preto", hex: "#39393B" },
];

const BASE_15: PhoneColor[] = [
  { name: "Preto", hex: "#2B2B2D" },
  { name: "Azul", hex: "#C9D4D4" },
  { name: "Verde", hex: "#CAD2C5" },
  { name: "Amarelo", hex: "#E8E2C7" },
  { name: "Rosa", hex: "#EAD2D2" },
];

const PRO_14: PhoneColor[] = [
  { name: "Roxo-profundo", hex: "#5A536F" },
  { name: "Dourado", hex: "#E4D2B7" },
  { name: "Prateado", hex: "#E3E3E1" },
  { name: "Preto-espacial", hex: "#363639" },
];

const BASE_14: PhoneColor[] = [
  { name: "Meia-noite", hex: "#24282D" },
  { name: "Estelar", hex: "#ECE5DD" },
  { name: "Azul", hex: "#A6C0DC" },
  { name: "Roxo", hex: "#DCD8E6" },
  { name: "Amarelo", hex: "#F3E6A8" },
  { name: "Vermelho", hex: "#B2393E" },
];

export const MODELS: PhoneModel[] = [
  {
    id: "17-pro-max",
    name: "iPhone 17 Pro Max",
    condition: "lacrado",
    colors: PRO_17,
    storages: [
      { storage: "256GB", price: 7200 },
      { storage: "512GB", price: 8350 },
    ],
  },
  {
    id: "17-pro",
    name: "iPhone 17 Pro",
    condition: "lacrado",
    colors: PRO_17,
    storages: [{ storage: "256GB", price: 6900 }],
  },
  {
    id: "17-air",
    name: "iPhone 17 Air",
    condition: "lacrado",
    colors: AIR_17,
    storages: [{ storage: "256GB", price: 5390 }],
  },
  {
    id: "17",
    name: "iPhone 17",
    condition: "lacrado",
    colors: BASE_17,
    storages: [{ storage: "256GB", price: 4850 }],
  },

  {
    id: "16-pro-max",
    name: "iPhone 16 Pro Max",
    condition: "semi-novo",
    colors: PRO_16,
    storages: [{ storage: "256GB", price: 5099 }],
  },
  {
    id: "16-pro",
    name: "iPhone 16 Pro",
    condition: "semi-novo",
    colors: PRO_16,
    storages: [
      { storage: "128GB", price: 4249 },
      { storage: "256GB", price: 4499 },
    ],
  },
  {
    id: "16-plus",
    name: "iPhone 16 Plus",
    condition: "semi-novo",
    colors: BASE_16,
    storages: [{ storage: "128GB", price: 3799 }],
  },
  {
    id: "16",
    name: "iPhone 16",
    condition: "semi-novo",
    colors: BASE_16,
    storages: [{ storage: "128GB", price: 3550 }],
  },
  {
    id: "15-pro-max",
    name: "iPhone 15 Pro Max",
    condition: "semi-novo",
    colors: PRO_15,
    storages: [{ storage: "256GB", price: 4050 }],
  },
  {
    id: "15-pro",
    name: "iPhone 15 Pro",
    condition: "semi-novo",
    colors: PRO_15,
    storages: [{ storage: "256GB", price: 3550 }],
  },
  {
    id: "15",
    name: "iPhone 15",
    condition: "semi-novo",
    colors: BASE_15,
    storages: [{ storage: "128GB", price: 2699 }],
  },
  {
    id: "14-pro-max",
    name: "iPhone 14 Pro Max",
    condition: "semi-novo",
    colors: PRO_14,
    storages: [{ storage: "256GB", price: 3399 }],
  },
  {
    id: "14-pro",
    name: "iPhone 14 Pro",
    condition: "semi-novo",
    colors: PRO_14,
    storages: [{ storage: "128GB", price: 2750 }],
  },
  {
    id: "14-plus",
    name: "iPhone 14 Plus",
    condition: "semi-novo",
    colors: BASE_14,
    storages: [{ storage: "128GB", price: 2200 }],
  },
  {
    id: "14",
    name: "iPhone 14",
    condition: "semi-novo",
    colors: BASE_14,
    storages: [
      { storage: "128GB", price: 2099 },
      { storage: "256GB", price: 2299 },
    ],
  },
];

export const FALLBACK_COLOR: PhoneColor = { name: "Preto", hex: "#2A2A2D" };

/** Acesso seguro à cor (o tsconfig usa noUncheckedIndexedAccess). */
export const colorAt = (model: PhoneModel, index: number): PhoneColor =>
  model.colors[index] ?? model.colors[0] ?? FALLBACK_COLOR;

/** Acesso seguro à capacidade. */
export const storageAt = (model: PhoneModel, index: number): StorageOption =>
  model.storages[index] ?? model.storages[0] ?? { storage: "—", price: 0 };

/** Menor preço do modelo — usado para ordenar a vitrine. */
export const fromPrice = (model: PhoneModel) => Math.min(...model.storages.map((s) => s.price));

export const byPriceAsc = (a: PhoneModel, b: PhoneModel) => fromPrice(a) - fromPrice(b);

export function phoneShape(name: string): PhoneShape {
  if (name.includes("Air")) return "air";
  if (name.includes("Pro")) return "pro";
  return "base";
}

/** O que o cliente montou: aparelho + capacidade + cor. */
export type Selection = {
  model: PhoneModel;
  storage: StorageOption;
  color: PhoneColor;
};

/** Combo de acessórios opcional, somado ao valor financiado. */
export const ACCESSORY_COMBO = {
  id: "pelicula-capa",
  label: "Película + capa transparente",
  description: "Película de vidro aplicada e capa transparente antichoque, já instaladas no envio.",
  price: 39,
} as const;

/** Valor total do pedido: aparelho + combo (quando marcado). */
export const orderTotal = (selection: Selection, withCombo: boolean) =>
  selection.storage.price + (withCombo ? ACCESSORY_COMBO.price : 0);

/** Taxa cobrada para a equipe rodar a análise de crédito. */
export const ANALYSIS_FEE = 19.9;

/** Prazo informado ao cliente para o retorno da análise. */
export const ANALYSIS_SLA = "até 24 horas úteis";

/**
 * Taxas médias de maquininha / crediário (juros compostos ao mês).
 * Quanto maior o prazo, maior a taxa aplicada.
 */
export function monthlyRate(installments: number): number {
  if (installments <= 1) return 0;
  if (installments <= 6) return 0.0249;
  if (installments <= 12) return 0.0289;
  if (installments <= 18) return 0.0319;
  if (installments <= 24) return 0.0349;
  if (installments <= 36) return 0.0379;
  return 0.0399;
}

export function installmentValue(price: number, installments: number): number {
  const i = monthlyRate(installments);
  if (i === 0) return price;
  return (price * i) / (1 - Math.pow(1 + i, -installments));
}

export function totalValue(price: number, installments: number): number {
  return installmentValue(price, installments) * installments;
}

export const BRL = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const INSTALLMENT_OPTIONS = [6, 12, 18, 24, 36, 48];

/** Prazo mostrado por padrão na simulação. */
export const DEFAULT_INSTALLMENTS = 18;

const DIACRITICS = /[̀-ͯ]/g;

const slug = (v: string) =>
  v
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * Caminho da foto real do aparelho naquela cor. Basta salvar o arquivo em
 * `public/produtos/` com esse nome que ele passa a aparecer no lugar da
 * ilustração — ver `public/produtos/README.md`.
 */
export const photoFor = (model: PhoneModel, color: PhoneColor) =>
  `/produtos/${model.id}-${slug(color.name)}.jpg`;
