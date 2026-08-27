import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  Instagram,
  MapPin,
  Package,
  PlayCircle,
  ShieldCheck,
  Smartphone,
  Truck,
  UserRound,
} from "lucide-react";
import heroImage from "@/assets/hero-iphones.jpg";
import logoAsset from "@/assets/gorillaphone-logo.png.asset.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PixCheckout } from "@/components/PixCheckout";
import { IphoneArt } from "@/components/IphoneArt";
import { WhatsappIcon } from "@/components/WhatsappIcon";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, WHATSAPP_URL } from "@/lib/contact";
import {
  ANALYSIS_FEE,
  BRL,
  DEFAULT_INSTALLMENTS,
  INSTALLMENT_OPTIONS,
  IPHONES,
  byPriceAsc,
  colorAt,
  installmentValue,
  monthlyRate,
  phoneShape,
  totalValue,
  type Iphone,
  type PhoneColor,
} from "@/lib/iphones";
import { maskCEP, maskCPF, maskDate, maskPhone, maskedCPFTail } from "@/lib/format";

const TITLE = "Gorillaphonebh — iPhone parcelado no boleto em até 48x";
const DESCRIPTION =
  "Parcele seu iPhone no boleto em até 48x, sem cartão de crédito e com entrega em todo o Brasil. iPhones lacrados e semi-novos com preço à vista e simulação de parcelas.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Step = 0 | 1 | 2 | 3 | 4;

type Address = { cep: string; rua: string; numero: string; bairro: string; cidade: string; uf: string };
type Person = {
  nome: string;
  cpf: string;
  nascimento: string;
  telefone: string;
  email: string;
  carteiraAssinada: boolean | null;
};

function Index() {
  const [step, setStep] = useState<Step>(0);
  const [selected, setSelected] = useState<Iphone | null>(null);
  const [color, setColor] = useState<PhoneColor | null>(null);
  const [installments, setInstallments] = useState(DEFAULT_INSTALLMENTS);
  const [address, setAddress] = useState<Address>({
    cep: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    uf: "",
  });
  const [person, setPerson] = useState<Person>({
    nome: "",
    cpf: "",
    nascimento: "",
    telefone: "",
    email: "",
    carteiraAssinada: null,
  });
  const [affiliate, setAffiliate] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setAffiliate(params.get("ref") ?? params.get("afiliado"));
  }, []);

  useEffect(() => {
    if (step > 0) {
      document.getElementById("fluxo")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [step]);

  const lacrados = useMemo(
    () => IPHONES.filter((p) => p.condition === "lacrado").sort(byPriceAsc),
    [],
  );
  const semiNovos = useMemo(
    () => IPHONES.filter((p) => p.condition === "semi-novo").sort(byPriceAsc),
    [],
  );

  const goToFlow = () => document.getElementById("fluxo")?.scrollIntoView({ behavior: "smooth" });

  return (
    <main className="min-h-screen bg-background">
      <Toaster />
      <TopBar />
      <Header affiliate={affiliate} />

      {step === 0 && (
        <>
          <Hero onStart={goToFlow} />
          <TrustStrip />
          <VideoSection />
        </>
      )}

      <section id="fluxo" className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-20">
        <Stepper step={step} />

        {step === 0 && (
          <SelectPhone
            lacrados={lacrados}
            semiNovos={semiNovos}
            installments={installments}
            onInstallments={setInstallments}
            onSelect={(p, c) => {
              setSelected(p);
              setColor(c);
              setStep(1);
            }}
          />
        )}

        {step === 1 && selected && (
          <AddressStep
            selected={selected}
            color={color}
            installments={installments}
            address={address}
            onChange={setAddress}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <PersonStep
            person={person}
            onChange={setPerson}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && selected && (
          <ApprovedStep
            selected={selected}
            color={color}
            installments={installments}
            person={person}
            onNext={() => setStep(4)}
          />
        )}

        {step === 4 && selected && (
          <div className="mt-8 space-y-6">
            <PixCheckout
              amount={ANALYSIS_FEE}
              seed={person.cpf || selected.id}
              affiliate={affiliate}
            />
            <button
              onClick={() => setStep(3)}
              className="mx-auto flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" /> Voltar
            </button>
          </div>
        )}
      </section>

      {step === 0 && (
        <>
          <Faq />
          <WhatsappBand />
        </>
      )}

      <Footer />
      <FloatingWhatsapp />
    </main>
  );
}

function TopBar() {
  return (
    <div className="bg-gradient-brand px-4 py-2 text-center text-[11px] font-medium text-primary-foreground sm:text-xs">
      Entrega para todo o Brasil 🇧🇷 · iPhones lacrados e semi-novos · Atendimento no WhatsApp
    </div>
  );
}

function SocialLinks({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold transition-colors hover:border-primary/50 hover:text-primary"
      >
        <Instagram className="size-4" />
        <span className={compact ? "hidden sm:inline" : ""}>{INSTAGRAM_HANDLE}</span>
      </a>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
      >
        <WhatsappIcon className="size-4" />
        <span className={compact ? "hidden sm:inline" : ""}>WhatsApp</span>
      </a>
    </div>
  );
}

function Header({ affiliate }: { affiliate: string | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <a href="/" className="flex items-center gap-3">
          <img
            src={logoAsset.url}
            alt="Gorillaphone — logo"
            width={900}
            height={611}
            className="h-14 w-auto sm:h-20"
          />
        </a>
        <div className="flex items-center gap-3">
          {affiliate && (
            <span className="hidden rounded-full bg-secondary px-2 py-1 text-xs text-muted-foreground sm:inline">
              ref: {affiliate}
            </span>
          )}
          <SocialLinks compact />
        </div>
      </div>
    </header>
  );
}

function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative overflow-hidden">
      <div className="glow-top pointer-events-none absolute inset-x-0 top-0 h-[420px]" />
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:py-20 lg:grid-cols-2">
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            <BadgeCheck className="size-3.5 text-primary" /> Sem cartão de crédito
          </span>
          <h1 className="mt-5 text-4xl leading-[1.05] font-extrabold sm:text-6xl">
            Parcele seu <span className="text-gradient-brand">iPhone no boleto</span> em até 48x
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">
            Escolha o modelo e a cor, simule as parcelas e receba em casa com entrega em todo o
            Brasil 🇧🇷
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="hero" size="xl" onClick={onStart}>
              <Smartphone /> Selecionar meu iPhone
            </Button>
            <Button size="xl" className="bg-[#25D366] text-white hover:bg-[#25D366]/90" asChild>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <WhatsappIcon className="size-5" /> Falar no WhatsApp
              </a>
            </Button>
          </div>
          <ul className="mt-8 grid grid-cols-3 gap-2 text-xs sm:gap-3 sm:text-sm">
            {[
              { icon: Truck, label: "Entrega nacional" },
              { icon: ShieldCheck, label: "Garantia inclusa" },
              { icon: CreditCard, label: "Boleto em até 48x" },
            ].map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card/70 px-2 py-3 text-center font-medium sm:flex-row sm:justify-center sm:gap-2 sm:text-left"
              >
                <Icon className="size-4 shrink-0 text-primary" />
                <span className="leading-tight">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <img
            src={heroImage}
            alt="iPhone premium em fundo escuro com iluminação de estúdio"
            width={1600}
            height={1008}
            className="rounded-3xl border border-border shadow-[var(--shadow-glow)]"
          />
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = [
    { icon: Package, title: "Lacrados e semi-novos", text: "Aparelhos conferidos antes do envio" },
    { icon: CreditCard, title: "Boleto em até 48x", text: "Sem precisar de cartão de crédito" },
    { icon: Truck, title: "Envio para todo o Brasil", text: "Rastreio enviado por WhatsApp" },
    { icon: ShieldCheck, title: "Garantia inclusa", text: "Suporte direto com a loja" },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 pb-12">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <div key={title} className="card-elevated p-4">
            <Icon className="size-5 text-primary" />
            <p className="mt-3 text-sm font-bold">{title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function VideoSection() {
  return (
    <section id="video" className="mx-auto max-w-4xl scroll-mt-20 px-4 pb-16">
      <h2 className="text-center text-2xl font-bold sm:text-3xl">Como funciona</h2>
      <p className="mt-2 text-center text-muted-foreground">
        Assista ao vídeo de apresentação e entenda o processo em 1 minuto.
      </p>
      <div className="card-elevated mt-6 grid aspect-video place-items-center overflow-hidden">
        <div className="text-center">
          <PlayCircle className="mx-auto size-14 text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">
            Espaço reservado para o vídeo apresentativo — envie o link/arquivo para publicarmos aqui.
          </p>
        </div>
      </div>
    </section>
  );
}

const STEP_LABELS = ["iPhone", "Endereço", "Dados", "Pré-aprovação", "Pagamento"];

function Stepper({ step }: { step: Step }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-10 text-xs">
      {STEP_LABELS.map((label, i) => (
        <li key={label} className="flex items-center gap-2">
          <span
            className={`grid size-6 place-items-center rounded-full font-bold ${
              i <= step ? "bg-gradient-brand text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            {i + 1}
          </span>
          <span className={i <= step ? "font-semibold" : "text-muted-foreground"}>{label}</span>
          {i < STEP_LABELS.length - 1 && <span className="text-muted-foreground">›</span>}
        </li>
      ))}
    </ol>
  );
}

function InstallmentPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {INSTALLMENT_OPTIONS.map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
            value === n
              ? "border-primary bg-primary/15 text-primary"
              : "border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          {n}x
        </button>
      ))}
    </div>
  );
}

function PhoneCard({
  phone,
  installments,
  onSelect,
}: {
  phone: Iphone;
  installments: number;
  onSelect: (color: PhoneColor) => void;
}) {
  const [colorIndex, setColorIndex] = useState(0);
  const color = colorAt(phone, colorIndex);
  const parcela = installmentValue(phone.price, installments);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1 hover:border-primary/50">
      <div className="relative bg-secondary/50 px-3 pt-3 pb-1">
        <span className="absolute top-2 left-2 rounded-md bg-brand px-2 py-1 text-[9px] font-bold tracking-wide text-brand-foreground uppercase">
          {phone.condition === "lacrado" ? "Lacrado" : "Semi-novo"}
        </span>
        <IphoneArt
          color={color.hex}
          shape={phoneShape(phone.name)}
          className="mx-auto h-36 w-auto sm:h-44"
        />
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h4 className="text-sm leading-snug font-semibold sm:text-base">
          {phone.name} <span className="text-muted-foreground">{phone.storage}</span>
        </h4>

        <p className="mt-2 text-[11px] text-muted-foreground">
          Cor: <span className="font-semibold text-foreground">{color.name}</span>
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {phone.colors.map((c, i) => (
            <button
              key={c.name}
              type="button"
              title={c.name}
              aria-label={`Cor ${c.name}`}
              aria-pressed={i === colorIndex}
              onClick={() => setColorIndex(i)}
              style={{ backgroundColor: c.hex }}
              className={`size-5 rounded-full border border-black/15 transition-transform ${
                i === colorIndex
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-card"
                  : "hover:scale-110"
              }`}
            />
          ))}
        </div>

        <div className="mt-3">
          <p className="text-[11px] text-muted-foreground">à vista no Pix</p>
          <p className="text-lg font-extrabold sm:text-xl">{BRL(phone.price)}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            ou{" "}
            <span className="font-semibold text-foreground">
              {installments}x de {BRL(parcela)}
            </span>{" "}
            no boleto
          </p>
        </div>

        <Button variant="hero" className="mt-3 w-full" onClick={() => onSelect(color)}>
          Escolher
        </Button>
      </div>
    </article>
  );
}

function PhoneGrid({
  phones,
  installments,
  onSelect,
}: {
  phones: Iphone[];
  installments: number;
  onSelect: (p: Iphone, c: PhoneColor) => void;
}) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {phones.map((p) => (
        <PhoneCard
          key={p.id}
          phone={p}
          installments={installments}
          onSelect={(c) => onSelect(p, c)}
        />
      ))}
    </div>
  );
}

function SelectPhone({
  lacrados,
  semiNovos,
  installments,
  onInstallments,
  onSelect,
}: {
  lacrados: Iphone[];
  semiNovos: Iphone[];
  installments: number;
  onInstallments: (n: number) => void;
  onSelect: (p: Iphone, c: PhoneColor) => void;
}) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold sm:text-3xl">Selecione o seu iPhone</h2>
      <p className="mt-2 text-muted-foreground">
        Do mais barato ao mais caro. Escolha a cor no próprio card e o número de parcelas para ver o
        valor — as taxas aumentam conforme o prazo.
      </p>
      <div className="mt-5">
        <InstallmentPicker value={installments} onChange={onInstallments} />
        <p className="mt-2 text-xs text-muted-foreground">
          Taxa aplicada: {(monthlyRate(installments) * 100).toFixed(2)}% a.m.
        </p>
      </div>

      <h3 className="mt-10 text-lg font-bold">📱 Aparelhos lacrados</h3>
      <PhoneGrid phones={lacrados} installments={installments} onSelect={onSelect} />

      <h3 className="mt-10 text-lg font-bold">📲 Semi-novos</h3>
      <PhoneGrid phones={semiNovos} installments={installments} onSelect={onSelect} />
    </div>
  );
}

function Summary({
  selected,
  color,
  installments,
}: {
  selected: Iphone;
  color: PhoneColor | null;
  installments: number;
}) {
  const parcela = installmentValue(selected.price, installments);
  return (
    <div className="card-elevated p-5">
      <p className="text-xs tracking-wide text-muted-foreground uppercase">Seu pedido</p>
      <div className="mt-3 flex items-center gap-3">
        <IphoneArt
          color={(color ?? colorAt(selected, 0)).hex}
          shape={phoneShape(selected.name)}
          className="h-20 w-auto"
        />
        <div>
          <p className="font-display text-lg leading-tight font-bold">
            {selected.name} · {selected.storage}
          </p>
          {color && <p className="mt-1 text-sm text-muted-foreground">Cor: {color.name}</p>}
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {selected.condition === "lacrado" ? "Lacrado" : "Semi-novo"} • à vista {BRL(selected.price)}
      </p>
      <p className="mt-3 text-xl font-bold text-gradient-brand">
        {installments}x de {BRL(parcela)}
      </p>
      <p className="text-xs text-muted-foreground">
        Total parcelado {BRL(totalValue(selected.price, installments))}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "numeric" | "email" | "tel";
}) {
  const id = label.toLowerCase().replace(/\W/g, "-");
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function AddressStep({
  selected,
  color,
  installments,
  address,
  onChange,
  onBack,
  onNext,
}: {
  selected: Iphone;
  color: PhoneColor | null;
  installments: number;
  address: Address;
  onChange: (a: Address) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [loadingCep, setLoadingCep] = useState(false);
  const valid = address.cep.replace(/\D/g, "").length === 8 && address.rua && address.numero && address.cidade;

  async function lookupCep(cep: string) {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = (await res.json()) as Record<string, string>;
      if (!data['erro']) {
        onChange({
          ...address,
          cep: maskCEP(cep),
          rua: data['logradouro'] ?? "",
          bairro: data['bairro'] ?? "",
          cidade: data['localidade'] ?? "",
          uf: data['uf'] ?? "",
        });
      }
    } catch {
      /* segue com preenchimento manual */
    } finally {
      setLoadingCep(false);
    }
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="card-elevated p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <MapPin className="size-5 text-primary" /> Endereço de entrega
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field
            label="CEP"
            inputMode="numeric"
            value={address.cep}
            placeholder="00000-000"
            onChange={(v) => {
              onChange({ ...address, cep: maskCEP(v) });
              void lookupCep(v);
            }}
          />
          <Field
            label="Número"
            inputMode="numeric"
            value={address.numero}
            onChange={(v) => onChange({ ...address, numero: v })}
          />
          <div className="sm:col-span-2">
            <Field label="Rua" value={address.rua} onChange={(v) => onChange({ ...address, rua: v })} />
          </div>
          <Field label="Bairro" value={address.bairro} onChange={(v) => onChange({ ...address, bairro: v })} />
          <Field label="Cidade" value={address.cidade} onChange={(v) => onChange({ ...address, cidade: v })} />
          <Field label="Estado (UF)" value={address.uf} onChange={(v) => onChange({ ...address, uf: v.toUpperCase().slice(0, 2) })} />
        </div>
        {loadingCep && <p className="mt-3 text-xs text-muted-foreground">Buscando endereço…</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft /> Voltar
          </Button>
          <Button variant="hero" size="lg" disabled={!valid} onClick={onNext}>
            Continuar
          </Button>
        </div>
      </div>
      <Summary selected={selected} color={color} installments={installments} />
    </div>
  );
}

function ChoiceButtons({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  const options = [
    { label: "Sim", value: true },
    { label: "Não", value: false },
  ];
  return (
    <div className="flex gap-2">
      {options.map((o) => (
        <button
          key={o.label}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
            value === o.value
              ? "border-primary bg-primary/15 text-primary"
              : "border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function PersonStep({
  person,
  onChange,
  onBack,
  onNext,
}: {
  person: Person;
  onChange: (p: Person) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const valid =
    person.nome.trim().split(" ").length >= 2 &&
    person.cpf.replace(/\D/g, "").length === 11 &&
    person.nascimento.length === 10 &&
    person.telefone.replace(/\D/g, "").length >= 10 &&
    /\S+@\S+\.\S+/.test(person.email) &&
    person.carteiraAssinada !== null;

  return (
    <div className="mt-8 card-elevated p-6">
      <h2 className="flex items-center gap-2 text-xl font-bold">
        <UserRound className="size-5 text-primary" /> Seus dados
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Usamos seus dados apenas para a análise de crédito e emissão dos boletos.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Nome completo" value={person.nome} onChange={(v) => onChange({ ...person, nome: v })} />
        </div>
        <Field
          label="CPF"
          inputMode="numeric"
          placeholder="000.000.000-00"
          value={person.cpf}
          onChange={(v) => onChange({ ...person, cpf: maskCPF(v) })}
        />
        <Field
          label="Data de nascimento"
          inputMode="numeric"
          placeholder="DD/MM/AAAA"
          value={person.nascimento}
          onChange={(v) => onChange({ ...person, nascimento: maskDate(v) })}
        />
        <Field
          label="Telefone"
          inputMode="tel"
          placeholder="(00) 00000-0000"
          value={person.telefone}
          onChange={(v) => onChange({ ...person, telefone: maskPhone(v) })}
        />
        <Field
          label="E-mail"
          type="email"
          inputMode="email"
          value={person.email}
          onChange={(v) => onChange({ ...person, email: v })}
        />
        <div className="space-y-2 sm:col-span-2">
          <Label>Você trabalha de carteira assinada?</Label>
          <ChoiceButtons
            value={person.carteiraAssinada}
            onChange={(v) => onChange({ ...person, carteiraAssinada: v })}
          />
          <p className="text-xs text-muted-foreground">
            Se você é autônomo, MEI ou informal, responda “Não” — isso não impede a análise.
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft /> Voltar
        </Button>
        <Button variant="hero" size="lg" disabled={!valid} onClick={onNext}>
          Analisar meu crédito
        </Button>
      </div>
    </div>
  );
}

function ApprovedStep({
  selected,
  color,
  installments,
  person,
  onNext,
}: {
  selected: Iphone;
  color: PhoneColor | null;
  installments: number;
  person: Person;
  onNext: () => void;
}) {
  const [analyzing, setAnalyzing] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setAnalyzing(false), 2200);
    return () => clearTimeout(t);
  }, []);

  const cpf = useMemo(() => maskedCPFTail(person.cpf), [person.cpf]);

  if (analyzing) {
    return (
      <div className="card-elevated mt-8 p-10 text-center">
        <div className="mx-auto size-10 animate-spin rounded-full border-2 border-border border-t-primary" />
        <p className="mt-4 font-semibold">Consultando seu CPF…</p>
        <p className="text-sm text-muted-foreground">Isso leva apenas alguns segundos.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="card-elevated p-6 sm:p-8">
        <CheckCircle2 className="size-10 text-[var(--success)]" />
        <h2 className="mt-4 text-2xl font-bold">
          Parabéns, {person.nome.split(" ")[0]}! Seu iPhone está{" "}
          <span className="text-gradient-brand">pré-aprovado</span>
        </h2>
        <p className="mt-2 text-muted-foreground">
          Pré-aprovação registrada para o CPF <span className="font-semibold text-foreground">{cpf}</span> —{" "}
          {selected.name} {selected.storage}
          {color ? ` na cor ${color.name}` : ""} em {installments}x de{" "}
          {BRL(installmentValue(selected.price, installments))}.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Vínculo informado:{" "}
          <span className="font-semibold text-foreground">
            {person.carteiraAssinada ? "carteira assinada" : "sem carteira assinada"}
          </span>
        </p>
        <div className="mt-6 rounded-2xl border border-primary/40 bg-primary/10 p-5">
          <p className="font-semibold">
            Para dar continuidade na análise, faça o pagamento do custo de análise
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Valor único de {BRL(ANALYSIS_FEE)} via Pix, usado para a consulta completa e reserva do
            aparelho.
          </p>
        </div>
        <Button variant="hero" size="xl" className="mt-6" onClick={onNext}>
          Gerar Pix da análise
        </Button>
      </div>
      <Summary selected={selected} color={color} installments={installments} />
    </div>
  );
}

const FAQ_ITEMS = [
  {
    q: "Como funciona o parcelamento no boleto?",
    a: "Você escolhe o iPhone, a cor e o número de parcelas, preenche seus dados e passa pela análise de crédito. Aprovado, os boletos são emitidos e enviados para você.",
  },
  {
    q: "Preciso de cartão de crédito?",
    a: "Não. O parcelamento é feito em boleto, então não ocupa o limite do seu cartão.",
  },
  {
    q: "Os aparelhos são originais?",
    a: "Sim. Trabalhamos com iPhones lacrados e semi-novos, conferidos antes do envio e com garantia inclusa.",
  },
  {
    q: "Vocês entregam na minha cidade?",
    a: "Entregamos em todo o Brasil. O código de rastreio é enviado por WhatsApp assim que o pedido é postado.",
  },
  {
    q: "Posso escolher a cor do aparelho?",
    a: "Pode. As cores disponíveis aparecem no card de cada modelo — a cor escolhida segue junto com o seu pedido.",
  },
];

function Faq() {
  return (
    <section className="mx-auto max-w-3xl px-4 pb-16">
      <h2 className="text-center text-2xl font-bold sm:text-3xl">Perguntas frequentes</h2>
      <Accordion type="single" collapsible className="mt-6">
        {FAQ_ITEMS.map((item) => (
          <AccordionItem key={item.q} value={item.q}>
            <AccordionTrigger className="text-left text-sm font-semibold sm:text-base">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function WhatsappBand() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <div className="card-elevated flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:justify-between sm:p-8 sm:text-left">
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">Ficou com dúvida no modelo ou na cor?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Chama a gente no WhatsApp ou acompanha as novidades no Instagram {INSTAGRAM_HANDLE}.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-center gap-3">
          <Button size="lg" className="bg-[#25D366] text-white hover:bg-[#25D366]/90" asChild>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <WhatsappIcon className="size-5" /> WhatsApp
            </a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
              <Instagram /> Instagram
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

function FloatingWhatsapp() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed right-4 bottom-4 z-40 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105"
    >
      <WhatsappIcon className="size-6" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border px-4 py-10 text-center text-sm text-muted-foreground">
      <img
        src={logoAsset.url}
        alt="Gorillaphone"
        width={900}
        height={611}
        className="mx-auto mb-4 h-20 w-auto sm:h-24"
      />
      <div className="flex justify-center">
        <SocialLinks />
      </div>
      <p className="mt-4">iPhones lacrados e semi-novos • Entrega em todo o Brasil 🇧🇷</p>
      <p className="mx-auto mt-3 max-w-2xl text-xs">
        Valores de parcelamento simulados com taxa média de mercado de{" "}
        {(monthlyRate(DEFAULT_INSTALLMENTS) * 100).toFixed(2)}% a.m. em {DEFAULT_INSTALLMENTS}x e{" "}
        {(monthlyRate(48) * 100).toFixed(2)}% a.m. em 48x. Sujeito à análise de crédito.
      </p>
    </footer>
  );
}
