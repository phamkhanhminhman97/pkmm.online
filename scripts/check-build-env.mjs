/**
 * Cảnh báo TO khi build mà thiếu khoá Web3Forms.
 *
 * Vì sao cần: thiếu khoá thì trang vẫn build và deploy bình thường — phần liên hệ
 * lặng lẽ rơi về nút `mailto:`. Không có cảnh báo này thì rất dễ deploy nhầm một
 * bản không có form mà không ai nhận ra.
 *
 * NEXT_PUBLIC_* là biến LÚC BUILD: nó bị nhúng vào file JS khi chạy `next build`.
 * Biến runtime của Cloudflare KHÔNG dùng được cho nó.
 */
// Dùng CHÍNH loader của Next để đọc .env.local / .env — nếu tự đọc process.env
// thì script này luôn báo thiếu, thành báo động giả.
const env = await import("@next/env");
// @next/env là CJS: qua ESM import thì named export có thể nằm dưới .default
const loadEnvConfig = env.loadEnvConfig ?? env.default?.loadEnvConfig;
loadEnvConfig(process.cwd(), /* dev */ false, { info: () => {}, error: console.error });

const KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
const y = (s) => `\x1b[33m${s}\x1b[0m`;
const g = (s) => `\x1b[32m${s}\x1b[0m`;

if (!KEY) {
  console.log(
    [
      "",
      y("┌─────────────────────────────────────────────────────────────┐"),
      y("│  ⚠  NEXT_PUBLIC_WEB3FORMS_KEY chưa có khi build             │"),
      y("│                                                             │"),
      y("│  Form liên hệ sẽ rơi về nút mailto: — trang vẫn chạy,       │"),
      y("│  nhưng KHÔNG có form.                                       │"),
      y("│                                                             │"),
      y("│  Build ở máy  → tạo .env.local (xem .env.example)           │"),
      y("│  Cloudflare build → đặt ở Workers Builds > Build variables, │"),
      y("│                     KHÔNG phải Variables and secrets        │"),
      y("└─────────────────────────────────────────────────────────────┘"),
      "",
    ].join("\n"),
  );
} else {
  console.log(g(`✓ Web3Forms key có mặt (…${KEY.slice(-6)}) — form liên hệ sẽ hoạt động`));
}
