import { Resend } from "resend";
import { EMAIL_FROM, EMAIL_REPLY_TO, SITE_URL } from "./config";
import { tileBoxes } from "@/lib/pricing";

type OrderNotification = {
  id: string;
  order_ref: string;
  customer_name: string;
  customer_email: string;
  subtotal: number;
  vat: number;
  shipping_cost: number;
  total: number;
  items: {
    title: string;
    finish?: string;
    m2?: number;
    coverage?: number;
    quantity?: number;
  }[];
};

function itemQuantityLabel(item: OrderNotification["items"][number]): string {
  if (!item.m2) return `Qty: ${item.quantity ?? 1}`;
  const boxes = tileBoxes(item.m2, item.coverage);
  return boxes > 0
    ? `${boxes} box${boxes === 1 ? "" : "es"} (${item.m2} m&sup2;)`
    : `${item.m2} m&sup2;`;
}

export async function sendAdminOrderEmail(order: OrderNotification) {
  if (!process.env.RESEND_API_KEY) {
    console.log("📧 [DEV MODE] Admin order email skipped for:", order.order_ref);
    return;
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn("⚠️ ADMIN_EMAIL not set — skipping admin notification");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const siteUrl = SITE_URL;

  const itemRows = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #E8E5E0;font-size:14px;color:#1A1A1A;">
            ${item.title}${item.finish ? ` <span style="color:#9A7A5E;">(${item.finish})</span>` : ""}
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #E8E5E0;font-size:14px;color:#1A1A1A;text-align:right;">
            ${itemQuantityLabel(item)}
          </td>
        </tr>`
    )
    .join("");

  await resend.emails.send({
    from: EMAIL_FROM,
    to: adminEmail,
    replyTo: order.customer_email || EMAIL_REPLY_TO,
    subject: `New Order Received — ${order.order_ref}`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#1A1A1A;padding:24px 32px;">
          <h1 style="color:#fff;font-size:18px;font-weight:400;letter-spacing:0.1em;margin:0;">NEW ORDER RECEIVED</h1>
        </div>

        <div style="padding:28px 32px;background:#FAFAF8;">
          <p style="font-size:13px;color:#9A7A5E;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 6px;">Order Reference</p>
          <p style="font-size:22px;font-weight:300;color:#1A1A1A;margin:0 0 20px;">${order.order_ref}</p>

          <table style="width:100%;margin-bottom:16px;">
            <tr>
              <td style="font-size:13px;color:#6B6B6B;padding:4px 0;">Customer</td>
              <td style="font-size:14px;color:#1A1A1A;text-align:right;">${order.customer_name}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#6B6B6B;padding:4px 0;">Email</td>
              <td style="font-size:14px;color:#1A1A1A;text-align:right;">${order.customer_email}</td>
            </tr>
          </table>

          <div style="border-top:1px solid #E8E5E0;margin:20px 0;"></div>

          <p style="font-size:13px;color:#9A7A5E;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 12px;">Items</p>
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

          <div style="margin-top:28px;text-align:center;">
            <a href="${siteUrl}/admin/orders/${order.id}"
               style="display:inline-block;padding:14px 36px;background:#1A1A1A;color:#fff;text-decoration:none;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;">
              View Order
            </a>
          </div>
        </div>
      </div>
    `,
  });
}
