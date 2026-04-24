export async function createDepositCheckout({
  bookingId,
  code,
  serviceName,
  depositAmount,
}: {
  bookingId: string;
  code: string;
  serviceName: string;
  depositAmount: number;
}) {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  const appUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!accessToken) return null;

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          id: bookingId,
          title: `Abono ${serviceName}`,
          quantity: 1,
          currency_id: "CLP",
          unit_price: depositAmount,
        },
      ],
      external_reference: bookingId,
      metadata: {
        booking_id: bookingId,
        booking_code: code,
        source: "reverencia-majestad",
      },
      back_urls: {
        success: `${appUrl}/checkout/success?bookingId=${bookingId}`,
        pending: `${appUrl}/checkout/pending?bookingId=${bookingId}`,
        failure: `${appUrl}/checkout/failure?bookingId=${bookingId}`,
      },
      auto_return: "approved",
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
      statement_descriptor: "REVERENCIA SPA",
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  return data.init_point as string;
}
