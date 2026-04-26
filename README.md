# Reverencia Majestad · Luxury Hair & Spa Mobile

Sistema full stack listo para operar la marca **Reverencia Majestad** en Santiago de Chile.

## Qué incluye

- Landing premium orientada a conversión
- Sistema de reservas inteligente
- Pricing dinámico por servicio, largo y abundancia capilar
- Recargo por distancia con geocodificación Mapbox
- Pago de abono con Mercado Pago Checkout Pro
- Dashboard por roles: admin, profesional, cliente
- CRM con historial, segmentación y notas internas
- Módulo B2B para hoteles + captación de leads
- Automatización de confirmaciones, recordatorios y post-servicio
- Base de datos PostgreSQL con Prisma

## Stack

- **Frontend:** Next.js 16 + React 19 + Tailwind CSS 4
- **Backend:** Route Handlers de Next.js
- **Base de datos:** PostgreSQL + Prisma ORM
- **Automatización:** Webhooks / jobs HTTP para follow-up
- **Pagos:** Mercado Pago Checkout Pro
- **Mensajería:** WhatsApp Cloud API + Resend

## Roles

- **Admin:** visión completa de reservas, CRM, profesionales y hoteles
- **Professional:** agenda asignada y comisión estimada
- **Client:** seguimiento de sus reservas y recompra

## Estructura principal

```bash
src/
  app/
    page.tsx                 # landing de ultra conversión
    reservas/page.tsx        # booking engine
    alianzas/page.tsx        # módulo B2B hoteles
    login/page.tsx           # acceso por rol
    dashboard/page.tsx       # panel operativo
    api/
      auth/login             # login con cookie JWT
      auth/logout            # cierre de sesión
      availability           # agenda disponible en tiempo real
      bookings               # creación de reservas
      checkout               # checkout de abono
      export/bookings        # exportación CSV
      hotel-leads            # captación B2B
      notes                  # notas internas CRM
      automation/follow-up   # confirmaciones / reminders / reseñas
      geocode                # distancia y recargo
      webhooks/mercadopago   # confirmación de pago
  components/
  lib/
prisma/
  schema.prisma
  seed.ts
```

## Variables de entorno

Copia `.env.example` a `.env.local` y completa:

- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `MAPBOX_ACCESS_TOKEN`
- `MERCADOPAGO_ACCESS_TOKEN` (backend, secreto)
- `MERCADOPAGO_PUBLIC_KEY` (pública)
- `MERCADOPAGO_CLIENT_ID`
- `MERCADOPAGO_CLIENT_SECRET` (secreto)
- `WHATSAPP_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `RESEND_API_KEY`
- `RESEND_FROM`

## Puesta en marcha

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

## Usuarios seed

```text
admin@reverenciamajestad.cl / Majestad2026!
stylist@reverenciamajestad.cl / Stylist2026!
therapist@reverenciamajestad.cl / Therapy2026!
```

## Flujo operativo

### 1. Captación
La landing dirige a reserva inmediata, WhatsApp concierge o formulario B2B.

### 2. Reserva
El cliente elige servicio, modalidad, fecha, hora, variables capilares y dirección. El sistema:
- calcula subtotal
- aplica recargo por distancia
- calcula abono mínimo
- asigna profesional disponible
- crea logs de automatización

### 3. Operación
El admin visualiza reservas, estados, ingresos, clientes VIP, hoteles y leads.

### 4. CRM
Cada cliente queda registrado automáticamente. El panel muestra visitas, acumulado, segmento y notas internas.

### 5. B2B hotelero
La página `/alianzas` explica el modelo sin fee fijo, capta leads y simula ingresos para el hotel.

## Producción recomendada

### Opción A · Vercel + PostgreSQL administrado
- Frontend y API: Vercel
- DB: Supabase / Neon / Railway Postgres
- Cron: Vercel Cron llamando `/api/automation/follow-up`

### Opción B · Node.js server o Docker
- Deploy en Render, Railway o VPS con Docker
- Reverse proxy Nginx
- PostgreSQL administrado externo

## Escalado multi-ciudad

1. Añadir tabla de ciudades con HQ, tarifa base y radio operativo
2. Configurar profesionales por ciudad
3. Separar pricing y comisiones por plaza
4. Añadir routing inteligente de disponibilidad por zona
5. Crear dashboards por city manager

## Hoja de ruta hacia app tipo Uber

- geolocalización del profesional en tiempo real
- matching avanzado por skill, distancia y SLA
- tracking live de llegada
- wallets y liquidaciones automáticas
- push notifications mobile
- app de profesional + app de cliente

## Verificación realizada en sandbox

- `npm run lint` ✅
- `npx tsc --noEmit` ✅
- `npm run db:push` ✅
- `npm run db:seed` ✅

> Nota: el `next build` fue limitado por memoria del sandbox, pero el proyecto quedó tipado, linted y probado contra PostgreSQL local con seed exitoso.
