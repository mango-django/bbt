// Central email configuration.
//
// The business uses a single mailbox — sales@bellosbespoketiles.co.uk — for
// both customer order confirmations and admin notifications.
//
// IMPORTANT: the `from` domain MUST be a domain you have verified in Resend
// (https://resend.com/domains). Until bellosbespoketiles.co.uk is verified,
// Resend will reject sends to anyone other than the account owner.
//
// Override per-environment with the EMAIL_FROM / EMAIL_REPLY_TO env vars so the
// address can change without a code deploy.

export const EMAIL_FROM =
  process.env.EMAIL_FROM ||
  "Bellos Bespoke Tiles <sales@bellosbespoketiles.co.uk>";

// Where customer replies should land (the business inbox).
export const EMAIL_REPLY_TO =
  process.env.EMAIL_REPLY_TO || "sales@bellosbespoketiles.co.uk";

// Used to build links in emails (admin order link, etc.).
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://bellosbespoketiles.co.uk";
