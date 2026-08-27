export type Condition = "lacrado" | "semi-novo";

export type PhoneColor = { name: string; hex: string };

/** Formato do módulo de câmera — usado pela arte do aparelho. */
export type PhoneShape = "pro" | "base" | "air";

export type Iphone = {
  id: string;
  name: string;
  storage: string;
  price: number;
  condition: Condition;
  colors: PhoneColor[];
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

export const IPHONES: Iphone[] = [
  { id: "17pm-512", name: "iPhone 17 Pro Max", storage: "512GB", price: 8350, condition: "lacrado", colors: PRO_17 },
  { id: "17pm-256", name: "iPhone 17 Pro Max", storage: "256GB", price: 7200, condition: "lacrado", colors: PRO_17 },
  { id: "17p-256", name: "iPhone 17 Pro", storage: "256GB", price: 6900, condition: "lacrado", colors: PRO_17 },
  { id: "17-256-a", name: "iPhone 17", storage: "256GB", price: 5100, condition: "lacrado", colors: BASE_17 },
  { id: "17-256-b", name: "iPhone 17", storage: "256GB", price: 4850, condition: "lacrado", colors: BASE_17 },
  { id: "17air-256", name: "iPhone 17 Air", storage: "256GB", price: 5390, condition: "lacrado", colors: AIR_17 },

  { id: "14-128", name: "iPhone 14", storage: "128GB", price: 2099, condition: "semi-novo", colors: BASE_14 },
  { id: "14-256", name: "iPhone 14", storage: "256GB", price: 2299, condition: "semi-novo", colors: BASE_14 },
  { id: "14plus-128", name: "iPhone 14 Plus", storage: "128GB", price: 2200, condition: "semi-novo", colors: BASE_14 },
  { id: "14pro-128", name: "iPhone 14 Pro", storage: "128GB", price: 2750, condition: "semi-novo", colors: PRO_14 },
  { id: "14pm-256", name: "iPhone 14 Pro Max", storage: "256GB", price: 3399, condition: "semi-novo", colors: PRO_14 },
  { id: "15-128", name: "iPhone 15", storage: "128GB", price: 2699, condition: "semi-novo", colors: BASE_15 },
  { id: "15pro-256", name: "iPhone 15 Pro", storage: "256GB", price: 3550, condition: "semi-novo", colors: PRO_15 },
  { id: "15pm-256", name: "iPhone 15 Pro Max", storage: "256GB", price: 4050, condition: "semi-novo", colors: PRO_15 },
  { id: "16-128", name: "iPhone 16", storage: "128GB", price: 3550, condition: "semi-novo", colors: BASE_16 },
  { id: "16plus-128", name: "iPhone 16 Plus", storage: "128GB", price: 3799, condition: "semi-novo", colors: BASE_16 },
  { id: "16pro-128", name: "iPhone 16 Pro", storage: "128GB", price: 4249, condition: "semi-novo", colors: PRO_16 },
  { id: "16pro-256", name: "iPhone 16 Pro", storage: "256GB", price: 4499, condition: "semi-novo", colors: PRO_16 },
  { id: "16pm-256", name: "iPhone 16 Pro Max", storage: "256GB", price: 5099, condition: "semi-novo", colors: PRO_16 },
];

export const FALLBACK_COLOR: PhoneColor = { name: "Preto", hex: "#2A2A2D" };

/** Acesso seguro à cor (o tsconfig usa noUncheckedIndexedAccess). */
export const colorAt = (phone: Iphone, index: number): PhoneColor =>
  phone.colors[index] ?? phone.colors[0] ?? FALLBACK_COLOR;

/** Do mais barato para o mais caro. */
export const byPriceAsc = (a: Iphone, b: Iphone) => a.price - b.price;

export function phoneShape(name: string): PhoneShape {
  if (name.includes("Air")) return "air";
  if (name.includes("Pro")) return "pro";
  return "base";
}

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

export const BRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const INSTALLMENT_OPTIONS = [6, 12, 18, 24, 36, 48];

/** Prazo mostrado por padrão na simulação. */
export const DEFAULT_INSTALLMENTS = 18;

export const ANALYSIS_FEE = 39.9;
