import type { Metadata } from 'next';
import StyleQuiz from './StyleQuiz';

export const metadata: Metadata = {
  title: 'Diagnóstico de Estilo AI | Reverencia Majestad',
  description:
    'Descubre tu look ideal con nuestro diagnóstico de estilo inteligente. Recomendaciones personalizadas de hair & beauty según tu perfil único.',
  openGraph: {
    title: 'Diagnóstico de Estilo AI · Reverencia Majestad',
    description: 'Recomendaciones premium de hair & beauty personalizadas con IA.',
    type: 'website',
  },
};

export default function EstiloPage() {
  return (
    <main className="min-h-screen bg-cream">
      <StyleQuiz />
    </main>
  );
}
