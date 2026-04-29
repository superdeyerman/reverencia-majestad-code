'use client';

import { useState } from 'react';

type PaymentMethod =
  | 'TRANSFER'
  | 'WEBPAY'
  | 'MERCADOPAGO'
  | 'KHIPU'
  | 'APPLE_PAY'
  | 'GOOGLE_PAY';

type Props = {
  bookingId: string;
  amount: number;
};

export default function PaymentMethods({ bookingId, amount }: Props) {
  const [method, setMethod] = useState<PaymentMethod>('MERCADOPAGO');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const methods: {
    id: PaymentMethod;
    label: string;
    desc: string;
  }[] = [
    { id: 'TRANSFER', label: 'Transferencia', desc: 'Sin comisión' },
    { id: 'WEBPAY', label: 'WebPay Plus', desc: 'Crédito / Débito' },
    { id: 'MERCADOPAGO', label: 'Mercado Pago', desc: 'Instantáneo' },
    { id: 'KHIPU', label: 'Khipu', desc: 'Transferencia directa' },
    { id: 'APPLE_PAY', label: 'Apple Pay', desc: 'Touch ID' },
    { id: 'GOOGLE_PAY', label: 'Google Pay', desc: 'Un toque' },
  ];

  const handlePay = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/payments/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, method }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || 'Error al iniciar pago');
        return;
      }

      // 🔥 Redirección segura
      if (data?.init_point) {
        window.location.href = data.init_point;
      } else {
        setError('No se pudo generar el link de pago');
      }
    } catch (err) {
      console.error(err);
      setError('Error inesperado al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* MÉTODOS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {methods.map((m) => {
          const active = method === m.id;

          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={`rounded-2xl border p-4 text-left transition ${
                active
                  ? 'border-char bg-char/5 shadow-sm'
                  : 'border-stone-200 hover:border-char/40'
              }`}
            >
              <p className="font-medium text-char">{m.label}</p>
              <p className="text-xs text-gray">{m.desc}</p>
            </button>
          );
        })}
      </div>

      {/* ERROR */}
      {error && (
        <div className="text-sm text-red-600 text-center">
          {error}
        </div>
      )}

      {/* BOTÓN */}
      <button
        type="button"
        onClick={handlePay}
        disabled={loading}
        className="w-full bg-char text-white py-5 rounded-2xl font-medium transition hover:opacity-90 disabled:opacity-50"
      >
        {loading
          ? 'Procesando pago...'
          : `Pagar $${amount.toLocaleString()} y confirmar →`}
      </button>

      {/* SEGURIDAD */}
      <div className="text-xs text-gray text-center">
        Pago seguro · SSL · Soporte internacional
      </div>
    </div>
  );
}