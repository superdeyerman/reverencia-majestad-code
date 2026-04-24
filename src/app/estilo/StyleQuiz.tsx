'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Sparkles, RefreshCw, ChevronRight } from 'lucide-react';
import { formatCLP } from '@/lib/utils';
import type { StyleSuggestion } from '@/lib/ai';

/* ─── Types ─────────────────────────────────────────────────────────────────── */

type Step = 0 | 1 | 2 | 3 | 4;

type QuizAnswers = {
  hairType: 'STRAIGHT' | 'WAVY' | 'CURLY' | 'COILY' | null;
  skinTone: 'LIGHT' | 'MEDIUM' | 'OLIVE' | 'DARK' | null;
  faceShape: 'OVAL' | 'ROUND' | 'SQUARE' | 'HEART' | 'DIAMOND' | null;
  preferredStyle: 'ELEGANT' | 'URBAN' | 'EXECUTIVE' | 'CASUAL' | 'AVANT_GARDE' | null;
  age: number | null;
};

/* ─── Option configs ────────────────────────────────────────────────────────── */

const HAIR_OPTIONS = [
  { value: 'STRAIGHT' as const, label: 'Lacio',      emoji: '💈', desc: 'Cabello recto y liso' },
  { value: 'WAVY'    as const, label: 'Ondulado',    emoji: '🌊', desc: 'Ondas suaves o pronunciadas' },
  { value: 'CURLY'   as const, label: 'Rizado',      emoji: '🔁', desc: 'Rizos definidos' },
  { value: 'COILY'   as const, label: 'Muy rizado',  emoji: '🌀', desc: 'Rizos apretados o afro' },
];

const SKIN_OPTIONS = [
  { value: 'LIGHT'  as const, label: 'Clara',     emoji: '🌸', desc: 'Tonalidad clara o rosada' },
  { value: 'MEDIUM' as const, label: 'Media',     emoji: '🌼', desc: 'Tonalidad media o beige' },
  { value: 'OLIVE'  as const, label: 'Oliva',     emoji: '🍃', desc: 'Tonalidad olivácea' },
  { value: 'DARK'   as const, label: 'Oscura',    emoji: '🌿', desc: 'Tonalidad oscura o morena' },
];

const FACE_OPTIONS = [
  { value: 'OVAL'    as const, label: 'Oval',      emoji: '🥚', desc: 'Frente ligeramente más ancha que el mentón' },
  { value: 'ROUND'   as const, label: 'Redondo',   emoji: '⭕', desc: 'Anchura y longitud similares' },
  { value: 'SQUARE'  as const, label: 'Cuadrado',  emoji: '⬜', desc: 'Mandíbula y frente similares' },
  { value: 'HEART'   as const, label: 'Corazón',   emoji: '💝', desc: 'Frente ancha, mentón afilado' },
  { value: 'DIAMOND' as const, label: 'Diamante',  emoji: '💎', desc: 'Pómulos prominentes' },
];

const STYLE_OPTIONS = [
  { value: 'ELEGANT'     as const, label: 'Elegante',    emoji: '✨', desc: 'Sofisticado y atemporal' },
  { value: 'URBAN'       as const, label: 'Urbano',      emoji: '🏙️', desc: 'Contemporáneo con actitud' },
  { value: 'EXECUTIVE'   as const, label: 'Ejecutivo',   emoji: '💼', desc: 'Presencia profesional de alto impacto' },
  { value: 'CASUAL'      as const, label: 'Casual',      emoji: '🌿', desc: 'Natural y effortless' },
  { value: 'AVANT_GARDE' as const, label: 'Avant-garde', emoji: '🎨', desc: 'Experimental y vanguardista' },
];

/* ─── OptionCard ────────────────────────────────────────────────────────────── */

function OptionCard({
  value,
  label,
  emoji,
  desc,
  selected,
  onSelect,
}: {
  value: string;
  label: string;
  emoji: string;
  desc: string;
  selected: boolean;
  onSelect: (v: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={selected}
      className={`relative flex flex-col items-center gap-2 p-5 rounded-2xl border-2 text-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 ${
        selected
          ? 'border-gold bg-gold/8 shadow-sm'
          : 'border-stone-200 bg-white hover:border-gold/40 hover:shadow-xs'
      }`}
    >
      {selected && (
        <span className="absolute top-2.5 right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold">
          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
      <span className="text-3xl leading-none">{emoji}</span>
      <span className={`font-serif text-base font-medium ${selected ? 'text-gold-dark' : 'text-char'}`}>
        {label}
      </span>
      <span className="font-sans text-[11px] text-gray leading-snug">{desc}</span>
    </button>
  );
}

/* ─── ResultCard ────────────────────────────────────────────────────────────── */

function ResultsView({
  result,
  onReset,
}: {
  result: StyleSuggestion;
  onReset: () => void;
}) {
  const CATEGORY_ES: Record<string, string> = {
    BEAUTY: 'Hair & Beauty',
    WELLNESS: 'Wellness',
    SKINCARE: 'Skincare',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Style description */}
      <div className="rounded-3xl border border-gold/20 bg-white p-8 shadow-sm">
        <div className="flex items-start gap-4 mb-5">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-sm bg-gold/10">
            <Sparkles size={20} className="text-gold" />
          </div>
          <div>
            <p className="text-[10px] font-sans font-semibold uppercase tracking-widest text-gold mb-1">Tu perfil</p>
            <h2 className="font-serif text-2xl text-char">Análisis de Estilo</h2>
          </div>
        </div>
        <p className="font-sans text-sm text-gray leading-7 mb-6">{result.styleDescription}</p>
        <p className="font-sans text-sm text-char leading-7">{result.toneDescription}</p>
      </div>

      {/* Color palette */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gray mb-4">Paleta de color recomendada</p>
        <div className="flex gap-3">
          {result.colorPalette.map((hex) => (
            <div key={hex} className="group flex flex-col items-center gap-1.5">
              <div
                className="h-12 w-12 rounded-full border border-stone-200 shadow-xs transition-transform group-hover:scale-110"
                style={{ backgroundColor: hex }}
                title={hex}
              />
              <span className="font-mono text-[9px] text-gray">{hex}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended services */}
      <div>
        <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gray mb-4">Servicios recomendados para ti</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {result.recommendedServices.map((svc, i) => (
            <article
              key={svc.slug}
              className={`relative flex flex-col rounded-2xl border p-5 ${
                i === 0 ? 'border-gold/30 bg-white shadow-sm' : 'border-stone-200 bg-white'
              }`}
            >
              {i === 0 && (
                <span className="absolute -top-2.5 left-4 text-[10px] font-sans font-semibold px-2.5 py-0.5 bg-gold text-white rounded-sm">
                  Top pick
                </span>
              )}
              <span className="inline-block text-[10px] font-sans uppercase tracking-widest text-gold mb-2">
                {CATEGORY_ES[svc.category] ?? svc.category}
              </span>
              <h3 className="font-serif text-base text-char mb-2 leading-snug">{svc.name}</h3>
              <p className="font-sans text-xs text-gray leading-relaxed flex-1 mb-4">{svc.reasoning}</p>
              <div className="flex items-center justify-between">
                <span className="font-serif text-base text-char">{formatCLP(svc.basePrice)}</span>
                <Link
                  href={`/reservar?servicio=${svc.slug}`}
                  className="inline-flex items-center gap-1 font-sans text-xs font-medium text-gold hover:text-gold-dark transition-colors"
                  aria-label={`Reservar ${svc.name}`}
                >
                  Reservar <ArrowRight size={11} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Booking suggestion */}
      <div className="rounded-3xl bg-char p-8 text-white">
        <p className="text-[10px] font-sans font-semibold uppercase tracking-widest text-gold mb-3">Nota de tu diagnóstico</p>
        <p className="font-sans text-sm text-white/80 leading-7 mb-6">
          {result.bookingSuggestion.notes}
        </p>
        <Link
          href={`/reservar?servicio=${result.bookingSuggestion.serviceSlug}`}
          className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 font-sans text-sm font-medium text-white hover:bg-gold-dark transition-colors"
        >
          Reservar experiencia recomendada <ChevronRight size={16} />
        </Link>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-2 font-sans text-sm text-gray hover:text-char transition-colors"
      >
        <RefreshCw size={14} /> Reiniciar diagnóstico
      </button>
    </div>
  );
}

/* ─── Main Quiz Component ───────────────────────────────────────────────────── */

const TOTAL_STEPS = 5;

export default function StyleQuiz() {
  const [step, setStep] = useState<Step>(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    hairType: null,
    skinTone: null,
    faceShape: null,
    preferredStyle: null,
    age: null,
  });
  const [ageInput, setAgeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StyleSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stepTitles: Record<Step, { title: string; subtitle: string }> = {
    0: { title: 'Tipo de cabello', subtitle: '¿Cómo describirías tu cabello naturalmente?' },
    1: { title: 'Tonalidad de piel', subtitle: '¿Cuál es tu tonalidad de piel natural?' },
    2: { title: 'Forma del rostro', subtitle: '¿Cuál de estas formas representa mejor tu rostro?' },
    3: { title: 'Estilo preferido', subtitle: '¿Qué personalidad define mejor tu estilo?' },
    4: { title: 'Edad', subtitle: 'Para personalizar aún más tus recomendaciones' },
  };

  function set<K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function canProceed(): boolean {
    if (step === 0) return answers.hairType !== null;
    if (step === 1) return answers.skinTone !== null;
    if (step === 2) return answers.faceShape !== null;
    if (step === 3) return answers.preferredStyle !== null;
    if (step === 4) {
      const age = parseInt(ageInput, 10);
      return !isNaN(age) && age >= 16 && age <= 100;
    }
    return false;
  }

  async function handleNext() {
    if (step < 4) {
      setStep((s) => (s + 1) as Step);
      return;
    }

    // Final step — submit
    const age = parseInt(ageInput, 10);
    if (isNaN(age)) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/style-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hairType: answers.hairType,
          skinTone: answers.skinTone,
          faceShape: answers.faceShape,
          preferredStyle: answers.preferredStyle,
          age,
          serviceHistory: [],
        }),
      });

      if (!res.ok) throw new Error('suggestion_failed');
      const data = await res.json() as StyleSuggestion;
      setResult(data);
    } catch {
      setError('No fue posible generar tu diagnóstico. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setStep(0);
    setAnswers({ hairType: null, skinTone: null, faceShape: null, preferredStyle: null, age: null });
    setAgeInput('');
    setResult(null);
    setError(null);
  }

  const progress = result ? 100 : ((step) / TOTAL_STEPS) * 100;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:px-0">

      {/* Header */}
      <div className="mb-10 text-center">
        <span className="inline-flex items-center gap-2 text-xs font-sans font-medium tracking-widest text-gold uppercase mb-5">
          <span className="h-px w-8 bg-gold" />
          Diagnóstico de Estilo AI
          <span className="h-px w-8 bg-gold" />
        </span>
        <h1 className="font-serif text-5xl text-char mb-4">
          Descubre tu look ideal
        </h1>
        <p className="font-sans text-sm text-gray max-w-md mx-auto leading-relaxed">
          Responde 5 preguntas para recibir recomendaciones personalizadas de hair & beauty basadas en tu perfil único.
        </p>
      </div>

      {/* Progress bar */}
      {!result && (
        <div className="mb-10">
          <div className="flex items-center justify-between font-sans text-xs text-gray mb-2">
            <span>Paso {step + 1} de {TOTAL_STEPS}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1 w-full bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-[0_25px_80px_rgba(28,25,23,0.06)]">
        {result ? (
          <ResultsView result={result} onReset={handleReset} />
        ) : (
          <div>
            {/* Step title */}
            <div className="mb-8">
              <h2 className="font-serif text-3xl text-char mb-2">{stepTitles[step].title}</h2>
              <p className="font-sans text-sm text-gray">{stepTitles[step].subtitle}</p>
            </div>

            {/* Step 0: Hair type */}
            {step === 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {HAIR_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    {...opt}
                    selected={answers.hairType === opt.value}
                    onSelect={(v) => set('hairType', v as QuizAnswers['hairType'])}
                  />
                ))}
              </div>
            )}

            {/* Step 1: Skin tone */}
            {step === 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SKIN_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    {...opt}
                    selected={answers.skinTone === opt.value}
                    onSelect={(v) => set('skinTone', v as QuizAnswers['skinTone'])}
                  />
                ))}
              </div>
            )}

            {/* Step 2: Face shape */}
            {step === 2 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {FACE_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    {...opt}
                    selected={answers.faceShape === opt.value}
                    onSelect={(v) => set('faceShape', v as QuizAnswers['faceShape'])}
                  />
                ))}
              </div>
            )}

            {/* Step 3: Style */}
            {step === 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {STYLE_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    {...opt}
                    selected={answers.preferredStyle === opt.value}
                    onSelect={(v) => set('preferredStyle', v as QuizAnswers['preferredStyle'])}
                  />
                ))}
              </div>
            )}

            {/* Step 4: Age */}
            {step === 4 && (
              <div className="max-w-xs">
                <label htmlFor="quiz-age" className="block font-sans text-sm text-gray mb-3">
                  Tu edad
                </label>
                <input
                  id="quiz-age"
                  type="number"
                  min={16}
                  max={100}
                  value={ageInput}
                  onChange={(e) => setAgeInput(e.target.value)}
                  placeholder="Ej. 32"
                  className="w-full rounded-2xl border border-stone-200 px-5 py-3.5 font-sans text-base text-char outline-none focus:border-gold transition-colors"
                  aria-label="Ingresa tu edad"
                />
                <p className="mt-2 font-sans text-xs text-gray">Entre 16 y 100 años</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 font-sans text-sm text-rose-700">
                {error}
              </p>
            )}

            {/* Navigation */}
            <div className="mt-10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1) as Step)}
                disabled={step === 0}
                className="inline-flex items-center gap-2 font-sans text-sm text-gray hover:text-char transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={15} /> Anterior
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed() || loading}
                className="inline-flex items-center gap-2 rounded-xl bg-char px-6 py-3 font-sans text-sm font-medium text-white hover:bg-char/85 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Analizando…
                  </>
                ) : step === 4 ? (
                  <>
                    <Sparkles size={14} />
                    Ver mi diagnóstico
                  </>
                ) : (
                  <>
                    Siguiente <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Social proof */}
      {!result && (
        <p className="mt-6 text-center font-sans text-xs text-gray">
          Diagnóstico gratuito · Sin registro requerido · Resultados personalizados en segundos
        </p>
      )}
    </div>
  );
}
