import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto grid min-h-[75vh] max-w-7xl items-center px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
      <div className="space-y-6 pr-0 lg:pr-10">
        <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Admin · Profesional · Cliente</p>
        <h1 className="font-serif text-6xl leading-none text-stone-900">Acceso al sistema operativo de lujo.</h1>
        <p className="max-w-xl text-base leading-8 text-stone-600">
          El dashboard concentra reservas, CRM, comisiones, hoteles y exportación. Cada rol ve únicamente lo que necesita para operar o comprar mejor.
        </p>
      </div>
      <LoginForm />
    </main>
  );
}
