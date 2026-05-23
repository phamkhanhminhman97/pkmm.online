# PKMM.ONLINE - Portfolio & Blog

Trang web cá nhân và tài liệu mã nguồn mở của **Phạm Khánh Minh Mẫn** — xây dựng bằng **Next.js 16.2.6 (App Router)**, **Tailwind CSS v4**, **TypeScript 5** và xuất bản dưới dạng **Static Export (HTML/CSS/JS)** lên **Cloudflare Pages**. Giao diện được thiết kế theo phong cách báo chí học thuật (academic-editorial) sang trọng tối giản.

🌐 **Website:** [https://pkmm.online](https://pkmm.online)

---

## Tính Năng Nổi Bật

- **📄 Project Detail Pages:** 4 trang chi tiết cho từng thư viện npm (Shopee, TikTok, Lazada, All-in-One) với code examples, số liệu thống kê downloads, và hướng dẫn cài đặt nhanh.
- **👤 About / CV Page:** Trang giới thiệu cá nhân với timeline kinh nghiệm làm việc, kỹ năng, học vấn.
- **📝 Blog:** 3 bài viết kỹ thuật (Shopee API, Webhook Security, Monorepo) với syntax highlighting và định dạng học thuật.
- **🔍 SEO Đầy Đủ:** `sitemap.xml` và `robots.txt` tự động, `generateMetadata` cho từng trang/blog/project.
- **🕒 Clock & Weather Widget:** Đồng hồ hệ thống tự động cập nhật và widget thời tiết thời gian thực tại TP. Hồ Chí Minh sử dụng Open-Meteo API.
- **📊 Thống kê npm:** Tự động kết nối npm Registry API để hiển thị số lượt tải các thư viện mỗi tuần.
- **🎨 Hình ảnh AI Độc quyền:** Ảnh minh họa bàn làm việc dạng pixel-art và avatar cá nhân phong cách 8-bit từ AI.
- **📬 Form liên hệ không Backend:** Tích hợp Web3Forms — gửi email trực tiếp không cần server.
- **⚡ Static Export siêu nhẹ:** Toàn bộ website là file tĩnh, lý tưởng cho Cloudflare Pages (tải trang siêu nhanh, 0% RAM server, bảo mật tuyệt đối).
- **🚫 Custom 404 Page:** Trang báo lỗi 404 được thiết kế riêng.

---

## Cấu Trúc Dự Án

```
src/
├── app/
│   ├── about/
│   │   └── page.tsx          # Trang giới thiệu / CV
│   ├── blog/
│   │   └── [slug]/
│   │       └── page.tsx      # Trang chi tiết bài viết
│   ├── projects/
│   │   └── [slug]/
│   │       └── page.tsx      # Trang chi tiết thư viện npm
│   ├── globals.css           # Tailwind v4 + custom styles
│   ├── layout.tsx            # Root layout (fonts, metadata)
│   ├── not-found.tsx         # Custom 404
│   ├── page.tsx              # Landing page chính
│   ├── robots.ts             # robots.txt generator
│   └── sitemap.ts            # sitemap.xml generator
├── components/
│   └── NpmStatsCard.tsx      # Client component: npm download stats
└── data/
    ├── blog.tsx              # Dữ liệu và nội dung blog
    ├── profile.tsx           # Dữ liệu profile/CV
    └── projects.tsx          # Dữ liệu các thư viện npm
```

---

## Phát triển ở Local

1. **Cài đặt thư viện:**
   ```bash
   npm install
   ```

2. **Chạy máy chủ phát triển:**
   ```bash
   npm run dev
   ```
   Mở trình duyệt truy cập: [http://localhost:3000](http://localhost:3000).

3. **Build biên dịch tĩnh:**
   ```bash
   npm run build
   ```
   Các file HTML tĩnh biên dịch thành công sẽ nằm ở thư mục `out/`.

---

## Tech Stack

| Công nghệ | Phiên bản |
|-----------|-----------|
| [Next.js](https://nextjs.org/) | 16.2.6 (App Router, Turbopack) |
| [React](https://react.dev/) | 19.2.4 |
| [TypeScript](https://www.typescriptlang.org/) | 5.x |
| [Tailwind CSS](https://tailwindcss.com/) | v4 |
| [Lucide React](https://lucide.dev/) | Icons |
| [Open-Meteo API](https://open-meteo.com/) | Weather data |
| [npm Registry API](https://api.npmjs.org/) | Download stats |
| [Web3Forms](https://web3forms.com/) | Contact form |

---

## Cấu Hình Cần Lưu Ý

### Web3Forms Access Key
Form liên hệ ở trang chủ sử dụng Web3Forms. Cần thay `YOUR_ACCESS_KEY_HERE` bằng access key thật trong file:
[`src/app/page.tsx`](src/app/page.tsx:585)

### Cập nhật thông tin cá nhân
Thông tin profile (kinh nghiệm, kỹ năng, học vấn) nằm ở:
[`src/data/profile.tsx`](src/data/profile.tsx)

### Danh sách thư viện npm
Dữ liệu các package (tên, mô tả, code examples) nằm ở:
[`src/data/projects.tsx`](src/data/projects.tsx)

---

## Hướng dẫn Triển khai lên Cloudflare Pages (Git Integration)

Khi bạn đẩy code lên GitHub, Cloudflare Pages sẽ tự động nhận diện thay đổi, build và deploy website của bạn lên mạng lưới CDN toàn cầu của họ.

### Bước 1: Đẩy mã nguồn lên GitHub

Nếu bạn chưa tạo repo trên GitHub, hãy tạo một repo trống tên `pkmm.online` và chạy lệnh sau ở thư mục local để push code:

```bash
git init
git add .
git commit -m "feat: init portfolio website"
git branch -M main
git remote add origin git@github.com:YOUR_GITHUB_USERNAME/pkmm.online.git
git push -u origin main
```
*(Thay thế `YOUR_GITHUB_USERNAME` bằng username GitHub của bạn).*

### Bước 2: Kết nối Cloudflare Pages với GitHub

1. Truy cập vào **Cloudflare Dashboard**.
2. Chọn **Workers & Pages** ở menu bên trái.
3. Nhấp vào nút **Create Application**, sau đó chọn tab **Pages**.
4. Chọn **Connect to Git** và liên kết với tài khoản GitHub của bạn.
5. Chọn repository `pkmm.online` mà bạn vừa push code lên.

### Bước 3: Cấu hình Build Settings trên Cloudflare

Tại trang cấu hình deploy, bạn điền các thông tin sau:
- **Project name:** `pkmm-online` (hoặc tùy bạn đặt).
- **Production branch:** `main`.
- **Framework preset:** Chọn **Next.js (Static HTML Export)**.
- **Build command:** `npm run build`.
- **Build output directory:** `out`.
- **Environment variables (Tùy chọn nếu build lỗi Node cũ):**
  - Thêm một biến: `NODE_VERSION` = `20` (hoặc cao hơn).

Nhấp vào **Save and Deploy**. Cloudflare sẽ mất khoảng 1-2 phút để build và cấp cho bạn một domain chạy thử miễn phí dạng `*.pages.dev`.

### Bước 4: Trỏ Custom Domain `pkmm.online` về Cloudflare Pages

1. Tại dashboard dự án Pages vừa tạo, chuyển sang tab **Custom Domains**.
2. Nhấp vào **Set up a custom domain**.
3. Nhập tên miền của bạn: `pkmm.online` và làm theo các bước tiếp theo.
4. Cloudflare sẽ tự động cập nhật các bản ghi DNS cần thiết (CNAME trỏ về Pages của bạn) và kích hoạt SSL (HTTPS) hoàn toàn miễn phí.

---

## Giấy phép

© 2026 PKMM.ONLINE. All rights reserved.
