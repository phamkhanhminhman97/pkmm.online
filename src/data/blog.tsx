import React from "react";

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  category: string;
  readTime: string;
  description: string;
  content: () => React.JSX.Element;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "shopee-api-integration",
    title: "Hướng dẫn chi tiết tích hợp Shopee API v2 bằng Node.js / TypeScript",
    date: "23 Tháng 5, 2026",
    category: "API Integration",
    readTime: "8 phút đọc",
    description: "Khám phá cách thiết lập kết nối, xử lý Seller Auth Flow, tự động quản lý Token và gọi API đơn hàng bằng thư viện shopee-api-client.",
    content: () => (
      <div className="font-serif-body text-[15px] text-zinc-800 leading-relaxed text-justify space-y-6">
        <p>
          Tích hợp cổng <strong>Shopee Open API v2</strong> luôn là một trong những thử thách lớn đối với lập trình viên thương mại điện tử do tính phức tạp của hệ thống quản lý Token (Oauth 2.0) và cơ chế mã hóa chữ ký số (Request Signature).
        </p>
        <p>
          Trong bài viết này, chúng ta sẽ cùng phân tích luồng vận hành chuẩn hóa để tích hợp Shopee API vào hệ thống quản lý đơn hàng bằng Node.js và TypeScript thông qua gói thư viện <code>shopee-api-client</code>.
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">1. Khởi tạo Mô-đun</h3>
        <p>
          Để bắt đầu gọi các endpoint của Shopee, trước hết chúng ta cần có thông tin <strong>Partner ID</strong> và <strong>Partner Key</strong> được cấp bởi Shopee Open Platform. Khởi tạo đối tượng quản lý như sau:
        </p>

        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`import { ShopeeModule } from "shopee-api-client";

const shopee = new ShopeeModule({
  partnerId: Number(process.env.SHOPEE_PARTNER_ID),
  partnerKey: process.env.SHOPEE_PARTNER_KEY!,
  shopId: process.env.SHOPEE_SHOP_ID,       // (Tùy chọn khi khởi tạo)
  accessToken: process.env.SHOPEE_ACCESS_TOKEN, // (Sẽ cập nhật sau khi auth)
  refreshToken: process.env.SHOPEE_REFRESH_TOKEN,
});`}
        </pre>

        <h3 className="font-sans font-bold text-lg text-black pt-4">2. Luồng Ủy quyền Seller (Seller Authorization Flow)</h3>
        <p>
          Đối với các dữ liệu bảo mật (đơn hàng, thông tin khách hàng, kho hàng), Shopee yêu cầu chủ cửa hàng (Seller) phải ủy quyền cho ứng dụng của bạn. Quy trình gồm 4 bước:
        </p>

        <div className="bg-white border border-zinc-200 p-5 rounded-lg shadow-2xs font-sans text-xs space-y-2">
          <p className="font-bold text-zinc-800">Quy trình Ủy Quyền Oauth 2.0:</p>
          <ol className="list-decimal pl-4 space-y-1.5 text-zinc-600">
            <li><strong>Tạo đường dẫn ủy quyền:</strong> Sử dụng phương thức sinh link có kèm redirect URL.</li>
            <li><strong>Redirect Seller:</strong> Đưa seller đến trang đăng nhập Shopee để bấm xác nhận.</li>
            <li><strong>Nhận Callback:</strong> Shopee trả về redirect URL kèm mã <code>code</code> và <code>shop_id</code>.</li>
            <li><strong>Đổi Token:</strong> Gửi request trao đổi mã <code>code</code> lấy cặp token truy cập.</li>
          </ol>
        </div>

        <p>
          Dưới đây là cách triển khai sinh link ủy quyền:
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`// Sinh liên kết ủy quyền chuyển hướng
const { url } = await shopee.generateAuthLink(
  "https://your-app.com/shopee/callback"
);
// Đưa seller truy cập vào url này để hoàn tất xác nhận.`}
        </pre>

        <p>
          Khi seller chấp thuận, họ sẽ được chuyển về route callback. Chúng ta tiến hành bắt lấy mã code và trao đổi lấy token:
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`app.get("/shopee/callback", async (req, res) => {
  const code = req.query.code as string;
  const shopId = req.query.shop_id as string;

  const client = new ShopeeModule({
    partnerId: Number(process.env.SHOPEE_PARTNER_ID),
    partnerKey: process.env.SHOPEE_PARTNER_KEY!,
    shopId,
  });

  // Gửi API đổi lấy access token và refresh token
  const tokenData = await client.fetchToken(code);
  
  // Lưu tokenData vào cơ sở dữ liệu để tái sử dụng
  // tokenData chứa: access_token, refresh_token, expire_in
  res.json(tokenData);
});`}
        </pre>

        <h3 className="font-sans font-bold text-lg text-black pt-4">3. Quản lý Vòng đời Token (Token Lifecycle Management)</h3>
        <blockquote className="border-l-4 border-red-700 pl-4 italic text-zinc-600 text-sm">
          Lưu ý quan trọng: Shopee Access Token chỉ có thời hạn 4 tiếng. Refresh Token có thời hạn 30 ngày. Mỗi khi sử dụng Refresh Token để đổi Access Token mới, Shopee cũng sẽ trả về một Refresh Token mới. Bạn phải ghi đè Refresh Token cũ bằng token mới này ngay lập tức!
        </blockquote>

        <p>
          Cơ chế refresh token được tự động hóa qua thư viện như sau:
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`const client = new ShopeeModule({
  partnerId: Number(process.env.SHOPEE_PARTNER_ID),
  partnerKey: process.env.SHOPEE_PARTNER_KEY!,
  shopId: "SHOPEE_SHOP_ID",
  refreshToken: "STORED_REFRESH_TOKEN",
});

// Lấy cặp token mới
const token = await client.refreshToken();
console.log(token.access_token, token.refresh_token);`}
        </pre>

        <h3 className="font-sans font-bold text-lg text-black pt-4">4. Lấy Danh sách Đơn hàng (Get Orders)</h3>
        <p>
          Khi token đã sẵn sàng, ta có thể dễ dàng lấy danh sách đơn hàng được tạo hoặc cập nhật trong thời gian gần đây:
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`// Shorthand: Lấy đơn hàng trong 60 phút qua
const recentOrders = await shopee.getOrders(60);

// Hoặc chi tiết bằng các bộ lọc:
const pendingOrders = await shopee.getOrders({
  beforeMinutes: 120,
  orderStatus: "READY_TO_SHIP",
  timeRangeField: "update_time",
  pageSize: 50,
});`}
        </pre>

        <h3 className="font-sans font-bold text-lg text-black pt-4">5. Kết luận</h3>
        <p>
          Việc đóng gói auth flow và các method gọi API trong thư viện <code>shopee-api-client</code> giúp chúng ta tiết kiệm hàng chục giờ code tay, giảm thiểu rủi ro tính toán sai timestamp hay ký sai thuật toán mã hóa SHA256 phức tạp của Shopee.
        </p>
      </div>
    ),
  },
  {
    slug: "safe-webhook-handling",
    title: "Xử lý Webhook Push từ Shopee và TikTok Shop một cách an toàn",
    date: "15 Tháng 4, 2026",
    category: "Security",
    readTime: "7 phút đọc",
    description: "Giải thích cơ chế chống giả mạo request, xác thực chữ ký signature HMAC-SHA256 và tối ưu hóa thời gian phản hồi webhook.",
    content: () => (
      <div className="font-serif-body text-[15px] text-zinc-800 leading-relaxed text-justify space-y-6">
        <p>
          Khi xây dựng hệ thống quản lý e-commerce, việc đồng bộ đơn hàng theo thời gian thực (real-time) là yếu tố sống còn. Cơ chế <strong>Push Mechanism (Webhook)</strong> được sử dụng để sàn đẩy thông báo về máy chủ của bạn mỗi khi đơn hàng thay đổi trạng thái.
        </p>
        <p>
          Tuy nhiên, việc mở một cổng API công khai để nhận dữ liệu từ Internet mang lại nhiều rủi ro bảo mật nghiêm trọng. Kẻ xấu có thể gửi payload giả để đánh dấu đơn hàng đã thanh toán hoặc đã hủy nhằm trục lợi.
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">1. Cơ chế Xác Thực Signature</h3>
        <p>
          Shopee gửi thông điệp webhook dưới dạng HTTP POST, kèm theo chữ ký mã hóa nằm trong header <code>Authorization</code>. Chữ ký này được tạo ra bằng thuật toán <strong>HMAC-SHA256</strong> sử dụng <code>partnerKey</code> để ký tên trên tổ hợp:
        </p>
        <div className="bg-zinc-100 p-4 rounded font-mono text-xs text-zinc-800 border border-zinc-200">
          signature = HMAC-SHA256(partnerKey, absolute_callback_url + raw_request_body)
        </div>

        <h3 className="font-sans font-bold text-lg text-black pt-4">2. Quy Tắc Vàng: Nhận Raw Body</h3>
        <blockquote className="border-l-4 border-red-700 pl-4 italic text-zinc-600 text-sm">
          Cảnh báo: Bạn phải đọc req.body dưới dạng buffer thô (Raw Body). Nếu sử dụng middleware express.json() làm định dạng mặc định trước khi kiểm tra chữ ký, các trường trong payload sẽ bị sắp xếp lại thứ tự khóa (key sorting) lúc parse JSON, khiến việc tính toán hash SHA256 bị sai lệch 100%!
        </blockquote>

        <p>
          Dưới đây là cách cấu hình route nhận webhook với Express thô:
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`import express from "express";
import { ShopeeModule } from "shopee-api-client";

const app = express();
const shopee = new ShopeeModule({
  partnerId: Number(process.env.SHOPEE_PARTNER_ID),
  partnerKey: process.env.SHOPEE_PARTNER_KEY!,
});

// Sử dụng express.raw để giữ nguyên chuỗi body thô gửi sang
app.post(
  "/shopee/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const callbackUrl = "https://your-app.com/shopee/webhook";
    const signature = req.header("authorization") ?? "";

    // Thực hiện verify chữ ký thô
    const isValid = shopee.verifyPushSignature(
      callbackUrl,
      req.body, // req.body ở đây là Buffer thô
      signature
    );

    if (!isValid) {
      console.warn("Cảnh báo: Webhook signature không hợp lệ!");
      return res.status(401).end();
    }

    // Sau khi verify thành công, parse JSON để xử lý dữ liệu
    const payload = shopee.parsePushPayload(req.body);
    console.log("Xử lý sự kiện code:", payload.code);

    return res.status(204).end();
  }
);`}
        </pre>

        <h3 className="font-sans font-bold text-lg text-black pt-4">3. Chiến thuật phản hồi nhanh: "Respond Fast, Fetch Later"</h3>
        <p>
          Shopee quy định thời gian timeout cho một request webhook là <strong>3 giây</strong>. Nếu server của bạn xử lý quá chậm (ví dụ: thực hiện ghi đè DB nhiều bảng, kiểm tra logic phức tạp), Shopee sẽ đánh giá request thất bại và liên tục gửi lại webhook (Retry theo chu kỳ 300 giây, 1800 giây, 10800 giây).
        </p>
        <p>
          Để giải quyết vấn đề này, hãy áp dụng mô hình kiến trúc bất đồng bộ:
        </p>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-zinc-700">
          <li><strong>Xác thực chữ ký lập tức:</strong> Thực hiện verify signature thô ngay khi nhận request.</li>
          <li><strong>Phản hồi HTTP 200/204:</strong> Trả về phản hồi thành công ngay lập tức để ngắt kết nối với Shopee.</li>
          <li><strong>Xử lý hàng đợi (Background Worker):</strong> Đẩy dữ liệu event vào một Message Queue (Redis, RabbitMQ) hoặc gọi hàm xử lý bất đồng bộ để Worker chạy ngầm, gọi ngược lên API Shopee lấy dữ liệu đơn hàng mới nhất và cập nhật vào DB.</li>
        </ol>

        <h3 className="font-sans font-bold text-lg text-black pt-4">4. Kết luận</h3>
        <p>
          Bằng cách kết hợp giữa việc kiểm tra <strong>Signature</strong> thô và thiết kế mô hình <strong>Bất đồng bộ</strong>, bạn sẽ xây dựng được một cổng tích hợp Webhook an toàn, chịu tải tốt, và không bao giờ bị nghẽn hay trùng lặp dữ liệu đơn hàng từ các sàn.
        </p>
      </div>
    ),
  },
  {
    slug: "ecommerce-sdk-monorepo",
    title: "Xây dựng Monorepo với npm workspaces cho các E-commerce SDKs",
    date: "28 Tháng 3, 2026",
    category: "Architecture",
    readTime: "6 phút đọc",
    description: "Cách thiết lập và quản lý dự án multi-package, tự động đồng bộ hóa phiên bản và tối ưu hóa quy trình release bằng Changesets.",
    content: () => (
      <div className="font-serif-body text-[15px] text-zinc-800 leading-relaxed text-justify space-y-6">
        <p>
          Khi phát triển các bộ công cụ kết nối API đa sàn (Shopee, TikTok Shop, Lazada), việc quản lý mã nguồn dưới dạng các repository riêng biệt thường dẫn đến việc trùng lặp code cấu hình, khó đồng bộ ESLint/TypeScript và khó kiểm thử liên hoàn.
        </p>
        <p>
          Giải pháp tối ưu nhất là gom tất cả các package này vào một kho lưu trữ duy nhất sử dụng mô hình <strong>Monorepo</strong>. Trong bài viết này, chúng ta sẽ xem xét cấu trúc thực tế của monorepo kết nối thương mại điện tử bằng <strong>npm workspaces</strong> và <strong>Changesets</strong>.
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">1. Khai báo Workspaces trong package.json</h3>
        <p>
          Tại file <code>package.json</code> ở gốc của dự án, chúng ta sử dụng trường <code>workspaces</code> để khai báo thư mục chứa các thư viện con:
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`{
  "name": "shopee-tiktok-lazada-monorepo",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "devDependencies": {
    "@changesets/cli": "^2.31.0"
  }
}`}
        </pre>
        <p>
          Cấu trúc cây thư mục của monorepo như sau:
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`shopee-tiktok-lazada-monorepo/
├── package.json
├── packages/
│   ├── shopee-api-client/       # SDK tương tác Shopee
│   ├── tiktokshops-api-client/  # SDK tương tác TikTok Shop
│   ├── lazada-api-client/       # SDK tương tác Lazada
│   └── shopee-tiktokshops-lazada-api/ # Package hợp nhất (All-in-One)
└── scripts/
    └── sync-all-in-one-deps.cjs # Tự động hóa đồng bộ dependency`}
        </pre>

        <h3 className="font-sans font-bold text-lg text-black pt-4">2. Đồng bộ hóa Dependency bằng Script tự động</h3>
        <p>
          Gói hợp nhất (All-in-One) thực chất là một wrapper phụ thuộc trực tiếp vào 3 package con còn lại. Để tránh lỗi quên cập nhật phiên bản của các package con trong file dependencies của package all-in-one, ta viết một script Node.js <code>scripts/sync-all-in-one-deps.cjs</code> thực hiện quét phiên bản mới nhất ở local và cập nhật tự động:
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`// node scripts/sync-all-in-one-deps.cjs
// Script đọc version của shopee-api-client, tiktokshops-api-client, lazada-api-client
// rồi chèn chính xác phiên bản đó vào dependencies của gói all-in-one.`}
        </pre>

        <h3 className="font-sans font-bold text-lg text-black pt-4">3. Quản lý Phiên bản và Phát hành với Changesets</h3>
        <p>
          <strong>Changesets</strong> là giải pháp quản lý phiên bản mã nguồn cực kỳ mạnh mẽ cho monorepo. Nó giải quyết triệt để bài toán: Khi package A thay đổi, làm sao để tạo changelog và phát hành tự động?
        </p>
        <div className="bg-white border border-zinc-200 p-5 rounded-lg shadow-2xs font-sans text-xs space-y-3">
          <p className="font-bold text-zinc-800">Quy trình làm việc với Changesets:</p>
          <ul className="list-disc pl-4 space-y-1 text-zinc-600">
            <li><strong>npx changeset:</strong> Chạy khi hoàn thành một tính năng. CLI sẽ hỏi package nào đổi, thuộc loại version bump nào (patch, minor, major) và yêu cầu viết tóm tắt thay đổi.</li>
            <li><strong>npx changeset version:</strong> Chạy trước khi release. Lệnh này đọc tất cả changeset tạm thời, tự động tăng phiên bản trong các file <code>package.json</code> con và sinh ra file <code>CHANGELOG.md</code> mới.</li>
            <li><strong>npm publish --workspaces:</strong> Phát hành toàn bộ package đã được tăng phiên bản lên npm registry.</li>
          </ul>
        </div>

        <h3 className="font-sans font-bold text-lg text-black pt-4">4. Tổng kết</h3>
        <p>
          Sử dụng <strong>npm workspaces</strong> kết hợp với <strong>Changesets</strong> giúp toàn bộ hệ thống SDK được tích hợp mượt mà, dễ dàng phát triển chéo và duy trì chuẩn hóa mã nguồn trên một kho Git duy nhất.
        </p>
      </div>
    ),
  },
];
