'use client';

import { useState } from 'react';
import { ProfessionalKind } from '@prisma/client';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function ProfessionalApplicationForm() {
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    kind: ProfessionalKind.STYLIST as ProfessionalKind,
    specialties: '',
    bio: '',
    experience: '',
  });

  function patch(field: Partial<typeof form>) {
    setForm((prev) => ({ ...prev, ...field }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormState('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/professionals/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          experience: form.experience ? Number(form.experience) : undefined,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setErrorMessage(payload.error ?? 'Ocurrió un error inesperado.');
        setFormState('error');
        return;
      }

      setFormState('success');
    } catch {
      setErrorMessage('Error de conexión. Intenta nuevamente.');
      setFormState('error');
    }
  }

  if (formState === 'success') {
    return (
      <div className="rounded-[2rem] border border-emerald-200 bg-white p-10 text-center shadow-[0_25px_80px_rgba(28,25,23,0.06)]">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="font-serif text-3xl text-stone-950">Solicitud enviada</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-stone-600">
          Recibimos tu postulación. Nuestro equipo la revisará y te contactará en los próximos días
          para continuar el proceso de incorporación.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-stone-700">Nombre completo *</span>
          <input
            required
            value={form.name}
            onChange={(e) => patch({ name: e.target.value })}
            placeholder="Tu nombre y apellido"
            className="rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-[#c9a96e]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium text-stone-700">Email *</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => patch({ email: e.target.value })}
            placeholder="tu@email.com"
            className="rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-[#c9a96e]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium text-stone-700">Teléfono *</span>
          <input
            required
            value={form.phone}
            onChange={(e) => patch({ phone: e.target.value })}
            placeholder="+56 9 XXXX XXXX"
            className="rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-[#c9a96e]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium text-stone-700">Tipo de profesional *</span>
          <select
            required
            value={form.kind}
            onChange={(e) => patch({ kind: e.target.value as ProfessionalKind })}
            className="rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-[#c9a96e]"
          >
            <option value={ProfessionalKind.STYLIST}>Estilista · Hair & Beauty</option>
            <option value={ProfessionalKind.THERAPIST}>Terapeuta · Wellness & Spa</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium text-stone-700">Especialidades *</span>
          <input
            required
            value={form.specialties}
            onChange={(e) => patch({ specialties: e.target.value })}
            placeholder="Balayage, Brushing, Masaje, Facial..."
            className="rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-[#c9a96e]"
          />
          <span className="text-xs text-stone-400">Separadas por coma</span>
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium text-stone-700">Años de experiencia</span>
          <input
            type="number"
            min={0}
            max={50}
            value={form.experience}
            onChange={(e) => patch({ experience: e.target.value })}
            placeholder="3"
            className="rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-[#c9a96e]"
          />
        </label>

        <label className="grid gap-2 text-sm md:col-span-2">
          <span className="font-medium text-stone-700">Bio profesional *</span>
          <textarea
            required
            rows={4}
            value={form.bio}
            onChange={(e) => patch({ bio: e.target.value })}
            placeholder="Cuéntanos sobre tu experiencia, estilo de trabajo y por qué quieres unirte a Reverencia Majestad..."
            className="rounded-3xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-[#c9a96e]"
          />
        </label>
      </div>

      {formState === 'error' && errorMessage && (
        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={formState === 'submitting'}
          className="inline-flex items-center gap-2 rounded-sm bg-stone-950 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {formState === 'submitting' ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Enviando...
            </>
          ) : (
            'Enviar postulación'
          )}
        </button>
        <p className="text-xs text-stone-400">
          Revisamos cada solicitud personalmente. Te contactaremos en 2-3 días hábiles.
        </p>
      </div>
    </form>
  );
}
