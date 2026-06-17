import { Resend } from "resend";
import { EMAIL_FROM, EMAIL_REPLY_TO } from "./config";

type DispatchedOrder = {
  customer_email?: string;
  public_order_id?: string;
  tracking_number?: string;
};

export async function sendOrderDispatchedEmail(order: DispatchedOrder) {
  // 🛑 Local dev / Resend not configured
  if (!process.env.RESEND_API_KEY) {
    console.log(
      "📧 [DEV MODE] Dispatch email skipped for order:",
      order.public_order_id
    );
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  if (!order?.customer_email) {
    throw new Error("Missing customer email");
  }

  await resend.emails.send({
    from: EMAIL_FROM,
    to: order.customer_email,
    replyTo: EMAIL_REPLY_TO,
    subject: `Your order ${order.public_order_id} has been dispatched`,
    html: `
      <h2>Your order is on the way 🚚</h2>
      <p>Order ID: <strong>${order.public_order_id}</strong></p>
      ${
        order.tracking_number
          ? `<p>Tracking Number: <strong>${order.tracking_number}</strong></p>`
          : ""
      }
      <p>Thank you for shopping with Bellos Tiles.</p>
    `,
  });
}
