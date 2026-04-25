# TODO · Reverencia Majestad Premium Migration

- [ ] Fase 1: Consolidar estructura y eliminar duplicados/sombras
  - [x] Revisar y unificar BookingWizard (src/components/booking/BookingWizard.tsx vs src/components/forms/BookingWizard.tsx)
  - [ ] Revisar carpetas vacías/placeholder (ej. src/components/sections/.gitkeep)
  - [ ] Confirmar estructura final en src/app, src/components, src/lib, src/app/api

- [ ] Fase 2: Migrar experiencia visual premium v4 a componentes Next.js sin degradar UI
  - [ ] Landing premium completa (hero, buscador, destacados, profesionales online, reputación, hoteles aliados, WhatsApp flotante, chat concierge)
  - [ ] Extras visuales (toasts, command palette, modales, confetti, gift cards, dark mode si aplica)

- [ ] Fase 3: Conexión real de datos/funciones
  - [ ] Marketplace desde Prisma Service + filtros + disponibilidad + selección múltiple + modal detalle
  - [ ] Reservas reales paso a paso con variables, modalidad, calendario, matching profesional, resumen, abono, confirmación
    - [ ] Bloque A (en progreso): BookingWizard premium multi-servicio + carrito lateral + descuentos 5/10/15 + selector "para quién" (sin romper contrato actual de API)
  - [ ] Admin real (dashboard, métricas, kanban, CRM, profesionales, hoteles, automatizaciones, expansión)
  - [ ] B2B hoteles (formulario y leads en /api/hotel-leads + panel admin hoteles)
  - [ ] Portal profesional (agenda, reservas, ganancias, disponibilidad)
  - [ ] IA estilo (/api/ai/style-suggestion) y sugerencias de servicios

- [ ] Fase 4: Pagos Mercado Pago producción
  - [ ] /api/bookings crea reserva
  - [ ] /api/payments/create-preference genera preferencia
  - [ ] Checkout + webhook confirma pago
  - [ ] Actualizar Booking a CONFIRMED
  - [ ] Persistir Payment y PaymentEvent

- [ ] Fase 5: Estabilización y entrega
  - [ ] npm run build
  - [ ] Corregir errores TypeScript
  - [ ] Dejar listo para Vercel
  - [ ] Preparar reporte final:
    - [ ] resumen de cambios
    - [ ] archivos modificados
    - [ ] rutas creadas
    - [ ] endpoints conectados
    - [ ] pruebas realizadas
    - [ ] pasos git add/commit/push
