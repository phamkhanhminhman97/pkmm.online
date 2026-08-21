#!/usr/bin/env node
/**
 * Tối ưu ảnh trong public/assets: resize theo KÍCH THƯỚC HIỂN THỊ THẬT, rồi xuất WebP.
 *
 *   node tools/optimize-images.mjs
 *
 * Vì sao resize chứ không chỉ nén: logo hiển thị ở 24px (`w-6 h-6`) nhưng file gốc
 * 1280×1280 — thừa ~2.800 lần số pixel. Nén WebP không sửa được chuyện đó, phải resize.
 *
 * Quy tắc chọn `target`: kích thước CSS lớn nhất × 3 (đủ cho màn hình 3x), làm tròn lên.
 * Giữ PNG gốc làm fallback cho trình duyệt không đọc được WebP (<picture>).
 */
import { execFileSync } from "node:child_process";
import { statSync, existsSync } from "node:fs";

const ASSETS = "public/assets";

// [file, kích thước CSS lớn nhất, target = CSS × 3]
const PLAN = [
  ["hero.png",             700, 1024], // aspect-[4/3] trong cột 8 -> ~700px; giữ 1024
  ["avatar.png",           128,  384], // w-28 h-28 md:w-32 md:h-32
  ["shopee-logo.png",       24,   96], // w-6 h-6
  ["lazada-logo.png",       24,   96],
  ["tiktokshops-logo.png",  24,   96],
];

const kb = (p) => (statSync(p).size / 1024).toFixed(1);
let before = 0, after = 0;

for (const [file, css, target] of PLAN) {
  const src = `${ASSETS}/${file}`;
  if (!existsSync(src)) { console.log(`  ⚠️  bỏ qua (không có): ${file}`); continue; }

  const webp = src.replace(/\.png$/, ".webp");
  const b = Number(kb(src));

  // sips resize tại chỗ file tạm, rồi cwebp
  const tmp = `/tmp/opt-${file}`;
  execFileSync("sips", ["-Z", String(target), src, "--out", tmp], { stdio: "ignore" });
  execFileSync("cwebp", ["-q", "82", "-quiet", tmp, "-o", webp]);
  // PNG fallback cũng resize luôn — không lý do gì giữ bản 1280px
  execFileSync("sips", ["-Z", String(target), src, "--out", src], { stdio: "ignore" });

  const a = Number(kb(webp)), pngNow = Number(kb(src));
  before += b; after += a;
  console.log(
    `  ${file.padEnd(24)} ${String(b).padStart(7)} KB → webp ${String(a).padStart(6)} KB` +
    `  (png fallback ${pngNow} KB, ${target}px, hiển thị ${css}px)`
  );
}

console.log(`  ${"─".repeat(24)} ${"─".repeat(30)}`);
console.log(`  ${"TỔNG (đường WebP)".padEnd(24)} ${before.toFixed(1).padStart(7)} KB → ${after.toFixed(1).padStart(6)} KB  giảm ${(100 - after * 100 / before).toFixed(0)}%`);
