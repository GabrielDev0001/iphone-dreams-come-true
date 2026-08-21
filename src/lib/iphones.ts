export type Condition = "lacrado" | "semi-novo";

export type Iphone = {
  id: string;
  name: string;
  storage: string;
  price: number;
  condition: Condition;
};

export const IPHONES: Iphone[] = [
  { id: "17pm-512", name: "iPhone 17 Pro Max", storage: "512GB", price: 8350, condition: "lacrado" },
  { id: "17pm-256", name: "iPhone 17 Pro Max", storage: "256GB", price: 7200, condition: "lacrado" },
  { id: "17p-256", name: "iPhone 17 Pro", storage: "256GB", price: 6900, condition: "lacrado" },
  { id: "17-256-a", name: "iPhone 17", storage: "256GB", price: 5100, condition: "lacrado" },
  { id: "17-256-b", name: "iPhone 17", storage: "256GB", price: 4850, condition: "lacrado" },
  { id: "17air-256", name: "iPhone 17 Air", storage: "256GB", price: 5390, condition: "lacrado" },

  { id: "14-128", name: "iPhone 14", storage: "128GB", price: 2099, condition: "semi-novo" },
  { id: "14-256", name: "iPhone 14", storage: "256GB", price: 2299, condition: "semi-novo" },
  { id: "14plus-128", name: "iPhone 14 Plus", storage: "128GB", price: 2200, condition: "semi-novo" },
  { id: "14pro-128", name: "iPhone 14 Pro", storage: "128GB", price: 2750, condition: "semi-novo" },
  { id: "14pm-256", name: "iPhone 14 Pro Max", storage: "256GB", price: 3399, condition: "semi-novo" },
  { id: "15-128", name: "iPhone 15", storage: "128GB", price: 2699, condition: "semi-novo" },
  { id: "15pro-256", name: "iPhone 15 Pro", storage: "256GB", price: 3550, condition: "semi-novo" },
  { id: "15pm-256", name: "iPhone 15 Pro Max", storage: "256GB", price: 4050, condition: "semi-novo" },
  { id: "16-128", name: "iPhone 16", storage: "128GB", price: 3550, condition: "semi-novo" },
  { id: "16plus-128", name: "iPhone 16 Plus", storage: "128GB", price: 3799, condition: "semi-novo" },
  { id: "16pro-128", name: "iPhone 16 Pro", storage: "128GB", price: 4249, condition: "semi-novo" },
  { id: "16pro-256", name: "iPhone 16 Pro", storage: "256GB", price: 4499, condition: "semi-novo" },
  { id: "16pm-256", name: "iPhone 16 Pro Max", storage: "256GB", price: 5099, condition: "semi-novo" },
];

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

export const ANALYSIS_FEE = 39.9;
