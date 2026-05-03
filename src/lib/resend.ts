import { Resend } from 'resend'
import type { ShippingAddress } from '@/types'

export const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendOrderConfirmation({
  to,
  orderNumber,
  storeName,
  total,
  shippingAddress,
}: {
  to: string
  orderNumber: string
  storeName: string
  total: number
  shippingAddress?: ShippingAddress
}) {
  const formattedTotal = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(total / 100)

  const addressHtml = shippingAddress
    ? `
      <tr>
        <td style="padding:8px 0;border-top:1px solid #eee;color:#555;vertical-align:top">Delivery to</td>
        <td style="padding:8px 0;border-top:1px solid #eee;text-align:right">
          ${shippingAddress.street}<br>
          ${shippingAddress.suburb} ${shippingAddress.state} ${shippingAddress.postcode}<br>
          ${shippingAddress.country}
        </td>
      </tr>`
    : ''

  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: `Order ${orderNumber} confirmed — ${storeName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111">
          <h1 style="font-size:24px;margin-bottom:8px">Order confirmed!</h1>
          <p style="color:#555;margin-top:0">Thanks for ordering from <strong>${storeName}</strong>. We&rsquo;ll be in touch when your order ships.</p>
          <table style="width:100%;border-collapse:collapse;margin-top:24px">
            <tr>
              <td style="padding:8px 0;border-top:1px solid #eee;color:#555">Order number</td>
              <td style="padding:8px 0;border-top:1px solid #eee;text-align:right;font-family:monospace">#${orderNumber}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-top:1px solid #eee;color:#555">Total</td>
              <td style="padding:8px 0;border-top:1px solid #eee;text-align:right;font-weight:bold">${formattedTotal}</td>
            </tr>
            ${addressHtml}
          </table>
          <p style="margin-top:32px;font-size:13px;color:#999">Estimated delivery: 3–7 business days.</p>
        </body>
      </html>
    `,
  })
}
