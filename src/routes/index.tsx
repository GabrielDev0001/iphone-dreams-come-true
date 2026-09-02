import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Copy,
  CreditCard,
  Instagram,
  Loader2,
  MapPin,
  Package,
  ShieldCheck,
  Smartphone,
  Truck,
  UserRound,
  Volume2,
} from "lucide-react";
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
import { ConsultaBancos } from "@/components/ConsultaBancos";
import { PhonePhoto } from "@/components/PhonePhoto";
import { PixCheckout } from "@/components/PixCheckout";
import { WhatsappIcon } from "@/components/WhatsappIcon";
import { ClientesMarquee } from "@/components/ClientesMarquee";
import { BancosMarquee } from "@/components/BancosMarquee";
import { CNPJ, ENDERECO, INSTAGRAM_HANDLE, INSTAGRAM_URL, WHATSAPP_URL } from "@/lib/contact";
import {
  ACCESSORY_COMBO,
  ANALYSIS_FEE,
  ANALYSIS_SLA,
  BRL,
  DEFAULT_INSTALLMENTS,
  INSTALLMENT_OPTIONS,
  MODELS,
  byPriceAsc,
  colorAt,
  installmentValue,
  monthlyRate,
  orderTotal,
  storageAt,
  totalValue,
  type PhoneColor,
  type PhoneModel,
  type Selection,
  type StorageOption,
} from "@/lib/iphones";
import { isValidCPF } from "@/lib/cpf";
import { linkWhatsapp } from "@/lib/whatsapp";
import { maskCEP, maskCPF, maskDate, maskPhone, maskedCPFTail } from "@/lib/format";
import { toast } from "sonner";

/** Vídeo de apresentação servido de public/. */
const HERO_VIDEO_SRC = "/apresentacao.mp4";
const HERO_VIDEO_POSTER = "/apresentacao-capa.jpg";

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

type Address = {
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
};
type Person = {
  nome: string;
  cpf: string;
  nascimento: string;
  telefone: string;
  email: string;
  carteiraAssinada: boolean | null;
};

/** Código curto para o cliente citar no WhatsApp: GP + data + sequência do dia. */
function novoProtocolo() {
  const d = new Date();
  const data = [
    String(d.getFullYear()).slice(2),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("");
  const seq = String(d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()).padStart(5, "0");
  return `GP${data}-${seq}`;
}

function Index() {
  const [step, setStep] = useState<Step>(0);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [combo, setCombo] = useState(false);
  const [installments, setInstallments] = useState(DEFAULT_INSTALLMENTS);
  const [protocolo, setProtocolo] = useState("");
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
    () => MODELS.filter((m) => m.condition === "lacrado").sort(byPriceAsc),
    [],
  );
  const semiNovos = useMemo(
    () => MODELS.filter((m) => m.condition === "semi-novo").sort(byPriceAsc),
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
          <ClientesMarquee />
          <BancosMarquee />
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
            onSelect={(sel) => {
              setSelection(sel);
              setStep(1);
            }}
          />
        )}

        {step === 1 && selection && (
          <AccessoriesStep
            selection={selection}
            combo={combo}
            onCombo={setCombo}
            installments={installments}
            onInstallments={setInstallments}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && selection && (
          <AddressStep
            selection={selection}
            combo={combo}
            installments={installments}
            address={address}
            onChange={setAddress}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && selection && (
          <PersonStep
            selection={selection}
            combo={combo}
            installments={installments}
            person={person}
            onChange={setPerson}
            onBack={() => setStep(2)}
            onSubmit={() => {
              setProtocolo(novoProtocolo());
              setStep(4);
            }}
          />
        )}

        {step === 4 && selection && (
          <CreditAnalysisStep
            selection={selection}
            combo={combo}
            installments={installments}
            person={person}
            address={address}
            protocolo={protocolo}
            affiliate={affiliate}
          />
        )}
      </section>

      {step === 0 && (
        <>
          <TrustStrip />
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
        <div className="flex items-center gap-4">
          <a href="/" className="shrink-0">
            {/* A logo é arte preta: precisa de fundo claro para aparecer no tema escuro. */}
            <span className="inline-flex rounded-2xl bg-white px-2.5 py-1.5 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.9)]">
              <img
                src={logoAsset.url}
                alt="Gorillaphone — logo"
                width={900}
                height={611}
                className="h-14 w-auto sm:h-18"
              />
            </span>
          </a>

          <div className="hidden border-l border-border pl-4 text-xs leading-snug text-muted-foreground md:block">
            <p className="flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0 text-primary" />
              <span className="font-medium text-foreground">{ENDERECO}</span>
            </p>
            <p className="mt-1 flex items-center gap-1.5">
              <Building2 className="size-3.5 shrink-0 text-primary" />
              CNPJ {CNPJ}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {affiliate && (
            <span className="hidden rounded-full bg-secondary px-2 py-1 text-xs text-muted-foreground sm:inline">
              ref: {affiliate}
            </span>
          )}
          <SocialLinks compact />
        </div>
      </div>

      {/* No celular não cabe ao lado da logo: vira uma linha discreta logo abaixo. */}
      <div className="border-t border-border/60 px-4 py-1.5 text-center text-[11px] text-muted-foreground md:hidden">
        <span className="font-medium text-foreground">{ENDERECO}</span> · CNPJ {CNPJ}
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

        <HeroVideo />
      </div>
    </section>
  );
}

/**
 * Toca sozinho no mudo (única forma que os navegadores permitem autoplay);
 * o botão de som só aparece enquanto está mudo.
 */
function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    if (v) v.muted = muted;
  }, [muted]);

  return (
    <div className="relative mx-auto w-full max-w-[260px] sm:max-w-xs lg:max-w-sm">
      <video
        ref={videoRef}
        src={HERO_VIDEO_SRC}
        poster={HERO_VIDEO_POSTER}
        autoPlay
        muted
        loop
        controls
        playsInline
        preload="auto"
        className="w-full rounded-3xl border border-border bg-secondary shadow-[var(--shadow-glow)]"
      >
        Seu navegador não consegue reproduzir este vídeo.
      </video>
      {muted && (
        <button
          type="button"
          onClick={() => {
            const v = videoRef.current;
            setMuted(false);
            if (v) {
              v.muted = false;
              void v.play();
            }
          }}
          className="absolute top-1/2 left-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-brand/85 px-5 py-3 text-sm font-semibold text-brand-foreground shadow-lg backdrop-blur transition-transform hover:scale-105 hover:bg-brand"
        >
          <Volume2 className="size-5" /> Ativar som
        </button>
      )}
    </div>
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

const STEP_LABELS = ["iPhone", "Acessórios", "Endereço", "Dados", "Análise"];

function Stepper({ step }: { step: Step }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-10 text-xs">
      {STEP_LABELS.map((label, i) => (
        <li key={label} className="flex items-center gap-2">
          <span
            className={`grid size-6 place-items-center rounded-full font-bold ${
              i <= step
                ? "bg-gradient-brand text-primary-foreground"
                : "bg-secondary text-muted-foreground"
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

function InstallmentPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
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
  model,
  installments,
  onSelect,
}: {
  model: PhoneModel;
  installments: number;
  onSelect: (sel: Selection) => void;
}) {
  const [colorIndex, setColorIndex] = useState(0);
  const [storageIndex, setStorageIndex] = useState(0);
  const color = colorAt(model, colorIndex);
  const storage = storageAt(model, storageIndex);
  const parcela = installmentValue(storage.price, installments);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1 hover:border-primary/50">
      <div className="relative bg-secondary/50 px-3 pt-3 pb-1">
        <span className="absolute top-2 left-2 rounded-md bg-brand px-2 py-1 text-[9px] font-bold tracking-wide text-brand-foreground uppercase">
          {model.condition === "lacrado" ? "Lacrado" : "Semi-novo"}
        </span>
        <PhonePhoto model={model} color={color} className="mx-auto h-36 w-auto sm:h-44" />
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h4 className="text-sm leading-snug font-semibold sm:text-base">{model.name}</h4>

        <p className="mt-3 text-[11px] text-muted-foreground">Armazenamento</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {model.storages.map((s, i) => (
            <button
              key={s.storage}
              type="button"
              aria-pressed={i === storageIndex}
              onClick={() => setStorageIndex(i)}
              className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
                i === storageIndex
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.storage}
            </button>
          ))}
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground">
          Cor: <span className="font-semibold text-foreground">{color.name}</span>
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {model.colors.map((c, i) => (
            <button
              key={c.name}
              type="button"
              title={c.name}
              aria-label={`Cor ${c.name}`}
              aria-pressed={i === colorIndex}
              onClick={() => setColorIndex(i)}
              style={{ backgroundColor: c.hex }}
              className={`size-5 rounded-full border border-white/20 transition-transform ${
                i === colorIndex
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-card"
                  : "hover:scale-110"
              }`}
            />
          ))}
        </div>

        <div className="mt-3">
          <p className="text-[11px] text-muted-foreground">à vista no Pix</p>
          <p className="text-lg font-extrabold sm:text-xl">{BRL(storage.price)}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            ou{" "}
            <span className="font-semibold text-foreground">
              {installments}x de {BRL(parcela)}
            </span>{" "}
            no boleto
          </p>
        </div>

        <Button
          variant="hero"
          className="mt-3 w-full"
          onClick={() => onSelect({ model, storage, color })}
        >
          Escolher
        </Button>
      </div>
    </article>
  );
}

function PhoneGrid({
  models,
  installments,
  onSelect,
}: {
  models: PhoneModel[];
  installments: number;
  onSelect: (sel: Selection) => void;
}) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {models.map((m) => (
        <PhoneCard key={m.id} model={m} installments={installments} onSelect={onSelect} />
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
  lacrados: PhoneModel[];
  semiNovos: PhoneModel[];
  installments: number;
  onInstallments: (n: number) => void;
  onSelect: (sel: Selection) => void;
}) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold sm:text-3xl">Selecione o seu iPhone</h2>
      <p className="mt-2 text-muted-foreground">
        Do mais barato ao mais caro. Escolha o armazenamento e a cor no próprio card e o número de
        parcelas para ver o valor — as taxas aumentam conforme o prazo.
      </p>
      <div className="mt-5">
        <InstallmentPicker value={installments} onChange={onInstallments} />
        <p className="mt-2 text-xs text-muted-foreground">
          Taxa aplicada: {(monthlyRate(installments) * 100).toFixed(2)}% a.m.
        </p>
      </div>

      <GrupoTitulo
        titulo="Aparelhos lacrados"
        subtitulo="Novos, na caixa, com garantia"
        total={lacrados.length}
      />
      <PhoneGrid models={lacrados} installments={installments} onSelect={onSelect} />

      <GrupoTitulo
        titulo="Semi-novos"
        subtitulo="Conferidos e testados antes do envio"
        total={semiNovos.length}
      />
      <PhoneGrid models={semiNovos} installments={installments} onSelect={onSelect} />
    </div>
  );
}

function GrupoTitulo({
  titulo,
  subtitulo,
  total,
}: {
  titulo: string;
  subtitulo: string;
  total: number;
}) {
  return (
    <div className="mt-12 flex items-end justify-between gap-4 border-b border-border pb-3">
      <div className="flex items-center gap-3">
        <span className="h-9 w-1 rounded-full bg-gradient-brand" />
        <div>
          <h3 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">
            {titulo}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitulo}</p>
        </div>
      </div>
      <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
        {total} modelos
      </span>
    </div>
  );
}

function Summary({
  selection,
  combo,
  installments,
  className,
}: {
  selection: Selection;
  combo: boolean;
  installments: number;
  className?: string | undefined;
}) {
  const total = orderTotal(selection, combo);
  const parcela = installmentValue(total, installments);
  return (
    <div className={`card-elevated h-fit p-5 ${className ?? ""}`}>
      <p className="text-xs tracking-wide text-muted-foreground uppercase">Seu pedido</p>
      <div className="mt-3 flex items-center gap-3">
        <PhonePhoto model={selection.model} color={selection.color} className="h-20 w-auto" />
        <div>
          <p className="font-display text-lg leading-tight font-bold">
            {selection.model.name} · {selection.storage.storage}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Cor: {selection.color.name}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {selection.model.condition === "lacrado" ? "Lacrado" : "Semi-novo"} • aparelho{" "}
        {BRL(selection.storage.price)}
      </p>
      {combo && (
        <p className="mt-1 text-sm text-muted-foreground">
          + {ACCESSORY_COMBO.label} {BRL(ACCESSORY_COMBO.price)}
        </p>
      )}
      <p className="mt-3 text-sm text-muted-foreground">à vista no Pix {BRL(total)}</p>
      <p className="mt-1 text-xl font-bold text-gradient-brand">
        {installments}x de {BRL(parcela)}
      </p>
      <p className="text-xs text-muted-foreground">
        Total parcelado {BRL(totalValue(total, installments))}
      </p>
    </div>
  );
}

function AccessoriesStep({
  selection,
  combo,
  onCombo,
  installments,
  onInstallments,
  onBack,
  onNext,
}: {
  selection: Selection;
  combo: boolean;
  onCombo: (v: boolean) => void;
  installments: number;
  onInstallments: (n: number) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const total = orderTotal(selection, combo);

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* No celular o resumo vem primeiro; no desktop volta para a coluna da direita. */}
      <div className="card-elevated order-2 p-6 sm:p-8 lg:order-1">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Package className="size-5 text-primary" /> Acessórios e parcelamento
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Proteja o aparelho e escolha em quantas vezes quer pagar. Você ainda pode voltar e trocar
          o modelo.
        </p>

        <button
          type="button"
          aria-pressed={combo}
          onClick={() => onCombo(!combo)}
          className={`mt-6 flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
            combo ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
          }`}
        >
          <span
            className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border ${
              combo ? "border-primary bg-primary text-primary-foreground" : "border-border"
            }`}
          >
            {combo && <BadgeCheck className="size-4" />}
          </span>
          <span className="flex-1">
            <span className="block font-semibold">{ACCESSORY_COMBO.label}</span>
            <span className="mt-0.5 block text-sm text-muted-foreground">
              {ACCESSORY_COMBO.description}
            </span>
            <span className="mt-1 block text-sm font-semibold">
              + {BRL(ACCESSORY_COMBO.price)} no total
            </span>
          </span>
        </button>

        <div className="mt-6">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <CreditCard className="size-4 text-primary" /> Em quantas vezes?
          </p>
          <div className="mt-3">
            <InstallmentPicker value={installments} onChange={onInstallments} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Taxa aplicada: {(monthlyRate(installments) * 100).toFixed(2)}% a.m. — {installments}x de{" "}
            {BRL(installmentValue(total, installments))}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft /> Voltar
          </Button>
          <Button variant="hero" size="lg" onClick={onNext}>
            Continuar
          </Button>
        </div>
      </div>
      <Summary
        selection={selection}
        combo={combo}
        installments={installments}
        className="order-1 lg:order-2"
      />
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
  selection,
  combo,
  installments,
  address,
  onChange,
  onBack,
  onNext,
}: {
  selection: Selection;
  combo: boolean;
  installments: number;
  address: Address;
  onChange: (a: Address) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [loadingCep, setLoadingCep] = useState(false);
  const valid =
    address.cep.replace(/\D/g, "").length === 8 && address.rua && address.numero && address.cidade;

  async function lookupCep(cep: string) {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = (await res.json()) as Record<string, string>;
      if (!data["erro"]) {
        onChange({
          ...address,
          cep: maskCEP(cep),
          rua: data["logradouro"] ?? "",
          bairro: data["bairro"] ?? "",
          cidade: data["localidade"] ?? "",
          uf: data["uf"] ?? "",
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
            <Field
              label="Rua"
              value={address.rua}
              onChange={(v) => onChange({ ...address, rua: v })}
            />
          </div>
          <Field
            label="Bairro"
            value={address.bairro}
            onChange={(v) => onChange({ ...address, bairro: v })}
          />
          <Field
            label="Cidade"
            value={address.cidade}
            onChange={(v) => onChange({ ...address, cidade: v })}
          />
          <Field
            label="Estado (UF)"
            value={address.uf}
            onChange={(v) => onChange({ ...address, uf: v.toUpperCase().slice(0, 2) })}
          />
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
      <Summary selection={selection} combo={combo} installments={installments} />
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
  selection,
  combo,
  installments,
  person,
  onChange,
  onBack,
  onSubmit,
}: {
  selection: Selection;
  combo: boolean;
  installments: number;
  person: Person;
  onChange: (p: Person) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const valid =
    person.nome.trim().split(" ").length >= 2 &&
    isValidCPF(person.cpf) &&
    person.nascimento.length === 10 &&
    person.telefone.replace(/\D/g, "").length >= 10 &&
    /\S+@\S+\.\S+/.test(person.email) &&
    person.carteiraAssinada !== null;

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="card-elevated p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <UserRound className="size-5 text-primary" /> Seus dados
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Usamos seus dados apenas para a análise de crédito e emissão dos boletos.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field
              label="Nome completo"
              value={person.nome}
              onChange={(v) => onChange({ ...person, nome: v })}
            />
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
          <Button variant="hero" size="lg" disabled={!valid} onClick={onSubmit}>
            Enviar pedido
          </Button>
        </div>
      </div>
      <Summary selection={selection} combo={combo} installments={installments} />
    </div>
  );
}

function InfoLinha({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-border py-2 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

/** Fases da última etapa: pagar a taxa, esperar e ver o retorno. */
type FaseAnalise = "pix" | "esperando" | "pre-aprovado";

/** Espera entre o cliente confirmar o Pix e a tela de retorno aparecer. */
const MS_ESPERA_RETORNO = 6000;

/**
 * Tela de espera entre a confirmação do pagamento e o retorno.
 *
 * O texto é deliberadamente neutro: nenhuma consulta acontece nesses segundos,
 * então a tela não diz que está consultando financeira nem que um atendente
 * está analisando o CPF agora.
 */
function EsperaRetorno({ nome }: { nome: string }) {
  return (
    <div className="card-elevated mt-8 p-8 text-center sm:p-12">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10">
        <Loader2 className="size-7 animate-spin text-primary" />
      </span>
      <h2 className="mt-5 text-2xl font-bold">Um instante{nome ? `, ${nome}` : ""}…</h2>
      <p className="mt-2 text-muted-foreground">Estamos preparando o retorno do seu pedido.</p>
      <div
        className="mx-auto mt-7 h-2 max-w-md overflow-hidden rounded-full bg-secondary"
        role="progressbar"
        aria-label="Preparando o retorno do pedido"
      >
        <div
          className="barra-espera h-full bg-gradient-brand"
          style={{ "--espera-retorno": `${MS_ESPERA_RETORNO}ms` } as CSSProperties}
        />
      </div>
    </div>
  );
}

/**
 * Mensagem que o cliente leva para o WhatsApp ao final da análise.
 *
 * O site não tem backend: essa conversa é o único caminho por onde os dados do
 * pedido chegam até a loja, então a mensagem vai completa e já no formato que a
 * equipe precisa para abrir a consulta.
 */
function mensagemDaAnalise({
  selection,
  combo,
  installments,
  person,
  address,
  protocolo,
  affiliate,
}: {
  selection: Selection;
  combo: boolean;
  installments: number;
  person: Person;
  address: Address;
  protocolo: string;
  affiliate: string | null;
}): string {
  const total = orderTotal(selection, combo);
  const parcela = installmentValue(total, installments);
  const complemento = address.bairro ? ` — ${address.bairro}` : "";

  return [
    `Olá! Fiz o pagamento da taxa de análise de ${BRL(ANALYSIS_FEE)} e quero seguir com o pedido.`,
    "",
    `*Protocolo:* ${protocolo}`,
    "",
    "*Aparelho*",
    `${selection.model.name} ${selection.storage.storage} — ${selection.color.name} (${
      selection.model.condition === "lacrado" ? "lacrado" : "semi-novo"
    })`,
    ...(combo ? [`Acessórios: ${ACCESSORY_COMBO.label}`] : []),
    `À vista no Pix: ${BRL(total)}`,
    `Parcelamento pretendido: ${installments}x de ${BRL(parcela)}`,
    "",
    "*Meus dados*",
    `Nome: ${person.nome}`,
    `CPF: ${person.cpf}`,
    `Nascimento: ${person.nascimento}`,
    `Telefone: ${person.telefone}`,
    `E-mail: ${person.email}`,
    `Carteira assinada: ${person.carteiraAssinada ? "sim" : "não"}`,
    "",
    "*Entrega*",
    `${address.rua}, ${address.numero}${complemento}`,
    `${address.cidade}/${address.uf} — CEP ${address.cep}`,
    ...(affiliate ? ["", `Indicação: ${affiliate}`] : []),
    "",
    "Segue o comprovante do Pix.",
  ].join("\n");
}

function CreditAnalysisStep({
  selection,
  combo,
  installments,
  person,
  address,
  protocolo,
  affiliate,
}: {
  selection: Selection;
  combo: boolean;
  installments: number;
  person: Person;
  address: Address;
  protocolo: string;
  affiliate: string | null;
}) {
  const [fase, setFase] = useState<FaseAnalise>("pix");
  const total = orderTotal(selection, combo);
  const parcela = installmentValue(total, installments);
  const cpf = useMemo(() => maskedCPFTail(person.cpf), [person.cpf]);
  const primeiroNome = person.nome.trim().split(" ")[0] ?? "";

  useEffect(() => {
    if (fase !== "esperando") return;
    const id = setTimeout(() => setFase("pre-aprovado"), MS_ESPERA_RETORNO);
    return () => clearTimeout(id);
  }, [fase]);

  async function copiarProtocolo() {
    try {
      await navigator.clipboard.writeText(protocolo);
      toast.success("Protocolo copiado");
    } catch {
      toast.error("Não foi possível copiar — anote o protocolo");
    }
  }

  if (fase === "esperando") return <EsperaRetorno nome={primeiroNome} />;

  const protocoloBox = (
    <div className="mt-6 rounded-2xl border border-primary/40 bg-primary/10 p-5">
      <p className="text-xs tracking-wide text-muted-foreground uppercase">Protocolo do pedido</p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <span className="font-display text-2xl font-extrabold tracking-tight">{protocolo}</span>
        <Button variant="outline" size="sm" onClick={() => void copiarProtocolo()}>
          <Copy className="size-4" /> Copiar
        </Button>
      </div>
    </div>
  );

  const conversa = linkWhatsapp(
    mensagemDaAnalise({
      selection,
      combo,
      installments,
      person,
      address,
      protocolo,
      affiliate,
    }),
  );

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="card-elevated p-6 sm:p-8">
        {fase === "pre-aprovado" ? (
          <>
            <CheckCircle2 className="size-10 text-[var(--success)]" />
            <h2 className="mt-4 text-2xl font-bold">
              Parabéns{primeiroNome ? `, ${primeiroNome}` : ""}! Seu pedido está{" "}
              <span className="text-gradient-brand">pré-aprovado</span>
            </h2>
            <p className="mt-2 text-muted-foreground">
              Pré-aprovação registrada para o CPF{" "}
              <span className="font-semibold text-foreground">{cpf}</span> — {selection.model.name}{" "}
              {selection.storage.storage} na cor {selection.color.name} em {installments}x de{" "}
              {BRL(parcela)}.
            </p>

            {protocoloBox}

            <div className="mt-6 rounded-2xl border border-border bg-secondary/40 p-5">
              <p className="text-sm leading-relaxed">
                Pré-aprovado quer dizer que{" "}
                <span className="font-semibold text-foreground">seu pedido entrou na fila</span> e o
                aparelho fica reservado. A consulta nas financeiras é feita por uma pessoa da nossa
                equipe — o retorno com as condições finais sai em {ANALYSIS_SLA}, pelo WhatsApp.
              </p>
              <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--warning,#eab308)]" />
                <span>
                  Enquanto a equipe não confirma, as parcelas acima continuam sendo simulação — o
                  valor final depende da financeira que aprovar.
                </span>
              </p>
            </div>

            <ol className="mt-5 space-y-3">
              {[
                `Envie o comprovante no WhatsApp citando o protocolo ${protocolo}.`,
                `Nossa equipe faz a consulta e responde em ${ANALYSIS_SLA}.`,
                "Confirmado, combinamos os boletos e a entrega.",
              ].map((texto, i) => (
                <li key={texto} className="flex gap-3 text-sm">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gradient-brand text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{texto}</span>
                </li>
              ))}
            </ol>

            <Button
              size="xl"
              className="mt-6 bg-[#25D366] text-white hover:bg-[#25D366]/90"
              asChild
            >
              <a href={conversa} target="_blank" rel="noopener noreferrer">
                <WhatsappIcon className="size-5" /> Enviar comprovante no WhatsApp
              </a>
            </Button>
          </>
        ) : (
          <>
            <CheckCircle2 className="size-10 text-[var(--success)]" />
            <h2 className="mt-4 text-2xl font-bold">
              Solicitação registrada{primeiroNome ? `, ${primeiroNome}` : ""}
            </h2>
            <p className="mt-2 text-muted-foreground">
              Guardamos seu pedido do {selection.model.name} {selection.storage.storage} na cor{" "}
              {selection.color.name}. O próximo passo é a análise de crédito.
            </p>

            {protocoloBox}

            <div className="mt-8 border-t border-border pt-6">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <Building2 className="size-5 text-primary" /> Como funciona a análise
              </h3>

              <div className="mt-4 rounded-2xl border border-border bg-secondary/40 p-5">
                <p className="text-sm leading-relaxed">
                  A análise de crédito é feita pela nossa equipe e tem um{" "}
                  <span className="font-semibold text-foreground">
                    custo de {BRL(ANALYSIS_FEE)}, pago antes da consulta
                  </span>
                  . O retorno sai em {ANALYSIS_SLA}.
                </p>
                <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--warning,#eab308)]" />
                  <span>
                    Seu crédito ainda não foi avaliado — nada foi consultado até aqui. A análise
                    pode ser{" "}
                    <span className="font-semibold text-foreground">aprovada ou recusada</span>, e a
                    taxa cobre o trabalho da consulta, não a aprovação.
                  </span>
                </p>
              </div>

              <ConsultaBancos />

              <ol className="mt-5 space-y-3">
                {[
                  `Pague a taxa de ${BRL(ANALYSIS_FEE)} no Pix abaixo.`,
                  `Envie o comprovante no WhatsApp citando o protocolo ${protocolo}.`,
                  `Nossa equipe faz a consulta e responde em ${ANALYSIS_SLA}.`,
                  "Aprovado, combinamos os boletos e a entrega. Recusado, avisamos o motivo.",
                ].map((texto, i) => (
                  <li key={texto} className="flex gap-3 text-sm">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gradient-brand text-xs font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{texto}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-6">
                <PixCheckout amount={ANALYSIS_FEE} reference={protocolo} affiliate={affiliate} />
              </div>

              <Button
                size="xl"
                className="mt-6 w-full bg-success font-semibold text-background hover:bg-success/90"
                onClick={() => setFase("esperando")}
              >
                <BadgeCheck className="size-5" /> Já fiz o pagamento
              </Button>
            </div>
          </>
        )}

        <div className="mt-8 border-t border-border pt-6">
          <h3 className="flex items-center gap-2 text-sm font-bold">
            <Smartphone className="size-4 text-primary" /> Resumo do pedido
          </h3>
          <div className="mt-2">
            <InfoLinha
              label="Aparelho"
              value={`${selection.model.name} ${selection.storage.storage} · ${selection.color.name}`}
            />
            <InfoLinha
              label="Condição"
              value={selection.model.condition === "lacrado" ? "Lacrado" : "Semi-novo"}
            />
            {combo && <InfoLinha label="Acessórios" value={ACCESSORY_COMBO.label} />}
            <InfoLinha label="À vista no Pix" value={BRL(total)} />
            <InfoLinha
              label="Parcelamento pretendido"
              value={`${installments}x de ${BRL(parcela)} (total ${BRL(totalValue(total, installments))})`}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Os valores de parcela são simulação — as condições finais dependem da análise.
          </p>
        </div>

        <div className="mt-6">
          <h3 className="flex items-center gap-2 text-sm font-bold">
            <Truck className="size-4 text-primary" /> Entrega e contato
          </h3>
          <div className="mt-2">
            <InfoLinha
              label="Endereço"
              value={`${address.rua}, ${address.numero}${address.bairro ? ` — ${address.bairro}` : ""}`}
            />
            <InfoLinha label="Cidade" value={`${address.cidade}/${address.uf} · ${address.cep}`} />
            <InfoLinha label="CPF" value={cpf} />
            <InfoLinha label="Telefone" value={person.telefone} />
            {affiliate && <InfoLinha label="Indicação" value={affiliate} />}
          </div>
        </div>
      </div>
      <Summary selection={selection} combo={combo} installments={installments} />
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
      <span className="mx-auto mb-4 inline-flex rounded-2xl bg-white px-4 py-3">
        <img
          src={logoAsset.url}
          alt="Gorillaphone"
          width={900}
          height={611}
          className="h-20 w-auto sm:h-24"
        />
      </span>
      <div className="flex justify-center">
        <SocialLinks />
      </div>
      <p className="mt-4">iPhones lacrados e semi-novos • Entrega em todo o Brasil 🇧🇷</p>
      <p className="mt-2 text-foreground">{ENDERECO}</p>
      <p className="mt-0.5">CNPJ {CNPJ}</p>
      <p className="mx-auto mt-3 max-w-2xl text-xs">
        Valores de parcelamento simulados com taxa média de mercado de{" "}
        {(monthlyRate(DEFAULT_INSTALLMENTS) * 100).toFixed(2)}% a.m. em {DEFAULT_INSTALLMENTS}x e{" "}
        {(monthlyRate(48) * 100).toFixed(2)}% a.m. em 48x. Sujeito à análise de crédito.
      </p>
    </footer>
  );
}
