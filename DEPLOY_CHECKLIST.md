# Reverencia Majestad · Deploy Checklist

## Variables de entorno

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require
DIRECT_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require
JWT_SECRET=replace-with-a-long-random-secret
NEXTAUTH_URL=https://reverencia-majestad.vercel.app
APP_URL=https://reverencia-majestad.vercel.app
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
MERCADOPAGO_PUBLIC_KEY=APP_USR-...
MERCADOPAGO_CLIENT_ID=...
MERCADOPAGO_CLIENT_SECRET=...
MERCADOPAGO_WEBHOOK_SECRET=...
RESEND_API_KEY=re_...
RESEND_FROM=Reverencia Majestad <no-reply@reverenciamajestad.cl>
WHATSAPP_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
NEXT_PUBLIC_WHATSAPP_NUMBER=569XXXXXXXX
HQ_LATITUDE=-33.4234
HQ_LONGITUDE=-70.6112
CRON_SECRET=replace-with-a-long-random-secret
```

## Orden de despliegue

1. `npm install`
2. `npx prisma generate`
3. `npx prisma migrate dev --name production-maximized` en desarrollo o `npx prisma migrate deploy` en producción
4. `npm run db:seed`
5. `npx tsc --noEmit`
6. `npm run build`
7. Deploy en Vercel

## Configuración de APIs

### Mercado Pago

1. Crear credenciales de producción y copiar `MERCADOPAGO_ACCESS_TOKEN`.
2. Si tu integración lo requiere, guardar también `MERCADOPAGO_PUBLIC_KEY`, `MERCADOPAGO_CLIENT_ID` y `MERCADOPAGO_CLIENT_SECRET` como variables de entorno (nunca hardcodear secretos en el repositorio).
3. Configurar webhook a:
   `https://reverencia-majestad.vercel.app/api/payments/webhooks/mercadopago`
4. Guardar el secreto en `MERCADOPAGO_WEBHOOK_SECRET`.
5. Validar retorno:
   `https://reverencia-majestad.vercel.app/checkout/success`
   `https://reverencia-majestad.vercel.app/checkout/failure`
   `https://reverencia-majestad.vercel.app/checkout/pending`

### Resend

1. Verificar dominio remitente.
2. Guardar `RESEND_API_KEY` y `RESEND_FROM`.
3. Probar envío desde una reserva confirmada o desde el cron de follow-up.

### WhatsApp Business

1. Guardar `WHATSAPP_TOKEN` y `WHATSAPP_PHONE_NUMBER_ID`.
2. Autorizar plantillas si vas a salir del sandbox.
3. Usar el número público en `NEXT_PUBLIC_WHATSAPP_NUMBER`.

### Neon / PostgreSQL

1. Verificar que `DATABASE_URL` y `DIRECT_URL` apunten al mismo proyecto.
2. Ejecutar migraciones antes de levantar tráfico.
3. Correr seed inicial para admin, servicios, profesionales, testimonios y hotel partner.

## Verificación final

- `GET /api/bookings` responde para admin.
- `POST /api/bookings` crea booking, payment y devuelve `init_point`.
- `POST /api/payments/create-preference` genera preferencia reutilizable.
- El webhook de Mercado Pago confirma la reserva y actualiza loyalty.
- `/reservas` conserva estado del wizard al refrescar.
- `/admin` muestra KPIs reales con Prisma.

## Nota importante

El código ya fue validado con `npx tsc --noEmit` y `npm run build`, pero la base conectada actualmente aún no tiene aplicadas las columnas nuevas del schema. Antes de probar en runtime debes ejecutar la migración Prisma.
