const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateOrderRef(): string {
  let ref = "BL-";
  for (let i = 0; i < 10; i += 1) {
    ref += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return ref;
}
