import { Resend } from "resend";
import { EMAIL_FROM, EMAIL_REPLY_TO } from "./config";

type OrderConfirmation = {
  order_ref: string;
  customer_name: string;
  customer_email: string;
  subtotal: number;
  vat: number;
  shipping_cost: number;
  total: number;
  items: { title: string; finish?: string; m2?: number; quantity?: number }[];
};

export async function sendOrderConfirmationEmail(order: OrderConfirmation) {
  if (!process.env.RESEND_API_KEY) {
    console.log("📧 [DEV MODE] Confirmation email skipped for:", order.order_ref);
    return;
  }

  if (!order.customer_email) {
    throw new Error("Missing customer email");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const itemRows = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #E8E5E0;font-size:14px;color:#1A1A1A;">
            ${item.title}${item.finish ? ` <span style="color:#9A7A5E;">(${item.finish})</span>` : ""}
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #E8E5E0;font-size:14px;color:#1A1A1A;text-align:right;">
            ${item.m2 ? `${item.m2} m&sup2;` : `Qty: ${item.quantity ?? 1}`}
          </td>
        </tr>`
    )
    .join("");

  const firstName = order.customer_name?.split(" ")[0] ?? "there";

  await resend.emails.send({
    from: EMAIL_FROM,
    to: order.customer_email,
    replyTo: EMAIL_REPLY_TO,
    subject: `Order Confirmed — ${order.order_ref}`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#1A1A1A;padding:24px 32px;">
          <h1 style="color:#fff;font-size:18px;font-weight:400;letter-spacing:0.1em;margin:0;">BELLOS TILES</h1>
        </div>

        <div style="padding:28px 32px;background:#FAFAF8;">
          <p style="font-size:16px;color:#1A1A1A;margin:0 0 6px;">Hi ${firstName},</p>
          <p style="font-size:14px;color:#6B6B6B;margin:0 0 24px;">Thank you for your order. We're getting everything ready for you.</p>

          <p style="font-size:13px;color:#9A7A5E;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 6px;">Order Reference</p>
          <p style="font-size:22px;font-weight:300;color:#1A1A1A;margin:0 0 24px;">${order.order_ref}</p>

          <p style="font-size:13px;color:#9A7A5E;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 12px;">Your Items</p>
          <table style="width:100%;border-collapse:collapse;">
            ${itemRows}
          </table>

          <div style="border-top:1px solid #E8E5E0;margin:20px 0;"></div>

          <table style="width:100%;">
            <tr>
              <td style="font-size:13px;color:#6B6B6B;padding:4px 0;">Subtotal</td>
              <td style="font-size:14px;color:#1A1A1A;text-align:right;">&pound;${order.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#6B6B6B;padding:4px 0;">VAT (20%)</td>
              <td style="font-size:14px;color:#1A1A1A;text-align:right;">&pound;${order.vat.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#6B6B6B;padding:4px 0;">Delivery</td>
              <td style="font-size:14px;color:#1A1A1A;text-align:right;">&pound;${order.shipping_cost.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="font-size:16px;font-weight:600;color:#1A1A1A;padding:12px 0 4px;">Total</td>
              <td style="font-size:16px;font-weight:600;color:#1A1A1A;text-align:right;padding:12px 0 4px;">&pound;${order.total.toFixed(2)}</td>
            </tr>
          </table>

          <div style="border-top:1px solid #E8E5E0;margin:24px 0;"></div>

          <p style="font-size:14px;color:#6B6B6B;margin:0 0 4px;">We'll send you another email when your order has been dispatched.</p>
          <p style="font-size:14px;color:#6B6B6B;margin:0;">If you have any questions, just reply to this email.</p>

          <div style="margin-top:32px;padding-top:20px;border-top:1px solid #E8E5E0;">
            <p style="font-size:12px;color:#C4BFB9;margin:0;">Bellos Tiles</p>
          </div>
        </div>
      </div>
    `,
  });
}
