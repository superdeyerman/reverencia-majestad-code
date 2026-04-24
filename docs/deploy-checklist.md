# Checklist de Deploy (Vercel + Neon)

## Variables de entorno

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `MERCADOPAGO_ACCESS_TOKEN`
- `MERCADOPAGO_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`

## Pre-deploy

1. `npm run lint`
2. `npx tsc --noEmit`
3. `npm run build`
4. `npx prisma migrate deploy`
5. `npm run db:seed`

## Webhook Mercado Pago

- URL: `https://<dominio>/api/payments/webhooks/mercadopago`
- Método: `POST`
- Firma: Header `x-signature`
- Evento objetivo: `payment`

## Post deploy

- Probar checkout en ambiente real.
- Validar transición de `PAYMENT_PENDING` a `CONFIRMED`.
- Verificar registro en `Payment`, `PaymentEvent` y actualización de `Booking`.
