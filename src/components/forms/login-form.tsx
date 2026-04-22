"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "No fue posible iniciar sesión.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="space-y-4 rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_25px_80px_rgba(28,25,23,0.08)]">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Acceso seguro</p>
        <h2 className="mt-2 font-serif text-4xl text-stone-900">Panel Reverencia</h2>
      </div>
      <label className="grid gap-2 text-sm text-stone-700">
        Email
        <input name="email" type="email" required className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-stone-900" />
      </label>
      <label className="grid gap-2 text-sm text-stone-700">
        Contraseña
        <input name="password" type="password" required className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-stone-900" />
      </label>
      {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
      <button disabled={loading} className="w-full rounded-full bg-stone-900 px-6 py-3 font-medium text-white transition hover:bg-stone-700 disabled:opacity-60">
        {loading ? "Ingresando..." : "Entrar al dashboard"}
      </button>
      <div className="rounded-2xl bg-[#faf7f2] p-4 text-sm leading-7 text-stone-600">
        <p className="font-medium text-stone-800">Credenciales seed</p>
        <p>admin@reverenciamajestad.cl / Majestad2026!</p>
        <p>stylist@reverenciamajestad.cl / Stylist2026!</p>
      </div>
    </form>
  );
}
