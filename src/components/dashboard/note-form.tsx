"use client";

import { useState } from "react";

type CustomerOption = {
  id: string;
  label: string;
};

export function NoteForm({ customers }: { customers: CustomerOption[] }) {
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerProfileId: formData.get("customerProfileId"),
        body: formData.get("body"),
      }),
    });

    if (response.ok) {
      setMessage("Nota interna guardada.");
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4 rounded-[1.75rem] border border-stone-200 bg-white p-6">
      <div>
        <p className="text-sm font-medium text-stone-900">Nota interna CRM</p>
        <p className="text-sm text-stone-500">Registrar seguimiento, preferencias o contexto de experiencia.</p>
      </div>
      <select name="customerProfileId" className="w-full rounded-2xl border border-stone-200 px-4 py-3">
        {customers.map((customer) => (
          <option key={customer.id} value={customer.id}>
            {customer.label}
          </option>
        ))}
      </select>
      <textarea name="body" rows={4} required className="w-full rounded-3xl border border-stone-200 px-4 py-3" />
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      <button className="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white">Guardar nota</button>
    </form>
  );
}
