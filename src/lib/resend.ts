import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendOrderConfirmation({
  to,
  orderNumber,
  storeName,
  total,
}: {
  to: string
  orderNumber: string
  storeName: string
  total: number
}) {
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: `Order ${orderNumber} confirmed — ${storeName}`,
    html: `
      <h1>Order Confirmed</h1>
      <p>Thank you for your order from <strong>${storeName}</strong>!</p>
      <p>Order number: <strong>${orderNumber}</strong></p>
      <p>Total: <strong>$${(total / 100).toFixed(2)}</strong></p>
    `,
  })
}
