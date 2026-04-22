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
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

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
          title: `Abono ${serviceName}`,
          quantity: 1,
          currency_id: "CLP",
          unit_price: depositAmount,
        },
      ],
      external_reference: bookingId,
      back_urls: {
        success: `${appUrl}/dashboard?payment=success&booking=${code}`,
        pending: `${appUrl}/dashboard?payment=pending&booking=${code}`,
        failure: `${appUrl}/dashboard?payment=failure&booking=${code}`,
      },
      auto_return: "approved",
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  return data.init_point as string;
}
