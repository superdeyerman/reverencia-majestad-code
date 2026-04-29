# TODO – Conversión index “maqueta visual” → sistema real de producción

## Fase 1 · Reskin `/reservas` al lenguaje visual del index
- [x] Rehacer hero de `src/app/reservas/page.tsx` con glow radial dorado, badges, floating cards
- [x] Mantener datos reales (`services.length`, `featuredCount`, modalidades)
- [x] Sección “Lo que mejora la decisión” con lenguaje del index

## Fase 2 · Reskin `BookingWizard` + conectar `forWhom` real
- [ ] Reskin de steps, cards de servicios, sidebar sticky
- [ ] Conectar `forWhom` a filtros reales sobre `services` (sin hardcode)

## Fase 3 · Home: eliminar datos falsos
- [ ] Reemplazar bloque “AI Style Engine” por datos reales (servicio destacado real)
- [ ] Crear `GET /api/testimonials` que lea `prisma.review`
- [ ] Consumir testimonials reales desde la home (fallback: ocultar sección)

## Fase 4 · Dashboard admin: conectar handlers fantasma
- [ ] `POST /api/bookings/[id]/remind` real
- [ ] `POST /api/bookings/[id]/review-request` real
- [ ] `onContact`, `onEdit`, `onEditProfile`, `onViewSchedule`, `onViewClients` reales

## Fase 5 · Rating real (no hardcode)
- [ ] Calcular rating en `/api/admin/dashboard` usando `prisma.review.aggregate`
- [ ] Calcular rating en `/api/professional/dashboard` igual

## Fase 6 · Portal cliente `/mis-reservas`
- [ ] `GET /api/customer/bookings` con sesión de CUSTOMER
- [ ] Página `/mis-reservas` con reskin del index
- [ ] Link condicional en `site-header.tsx`

## Fase 7 · Hotel Partner Form: estados reales
- [ ] Estados `loading`, `error`, `success` con reset y mensaje final

## Fase 8 · QA end-to-end
- [ ] `npm run build` sin errores
- [ ] Flujo: landing → wizard → pricing → bookings → MP → success → webhook → admin
