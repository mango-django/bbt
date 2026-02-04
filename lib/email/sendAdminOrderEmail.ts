// lib/email/sendAdminOrderEmail.ts
import nodemailer from "nodemailer";

export async function sendAdminOrderEmail(order: {
  id: string;
  order_ref: string;
  total: number;
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Bellos Orders" <orders@yourdomain.com>`,
    to: process.env.ADMIN_EMAIL,
    subject: `🧾 New Order Received – ${order.order_ref}`,
    html: `
      <h2>New Order</h2>
      <p><strong>Order Ref:</strong> ${order.order_ref}</p>
      <p><strong>Total:</strong> £${order.total}</p>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders/${order.id}">
        View Order
      </a></p>
    `,
  });
}
