import type { Localized } from "@/i18n/types";

// ─── Profile Data for About Page ───────────────────────────────────────────

export interface Experience {
  period: string;
  title: string;
  company: string;
  /** MỘT câu: hệ thống đó là gì. Không kể lể. */
  summary: Localized<string>;
  /** 2-4 gạch đầu dòng: mình đã LÀM gì, ưu tiên thứ đo được. */
  highlights: Localized<string[]>;
  technologies: string[];
}

/** Hệ thống đang làm — mô tả kỹ thuật, KHÔNG nêu tên khách hàng. */
export interface SystemWork {
  name: Localized<string>;
  domain: Localized<string>;
  summary: Localized<string>;
  highlights: Localized<string[]>;
  technologies: string[];
}

export interface Skill {
  category: Localized<string>;
  items: string[];
}

export interface Education {
  period: Localized<string>;
  degree: Localized<string>;
  school: Localized<string>;
  description: Localized<string>;
}

export interface Research {
  period: Localized<string>;
  status: Localized<string>;
  /** Tiêu đề luôn hiện CẢ HAI — tên đề tài là danh từ riêng của công trình. */
  titleVi: string;
  titleEn: string;
  venue: Localized<string>;
  question: Localized<string>;
  method: Localized<string>;
  honestNote: Localized<string>;
  keywords: string[];
}

export interface ProfileData {
  name: string;
  title: Localized<string>;
  location: Localized<string>;
  email: string;
  github: string;
  bio: Localized<string[]>;
  experiences: Experience[];
  skills: Skill[];
  education: Education[];
  systems: SystemWork[];
  research: Research[];
}

export const profile: ProfileData = {
  name: "Phạm Khánh Minh Mẫn",
  title: {
    en: "Backend Engineer · E-commerce API Integration · LLM-Agent Memory Research",
    vi: "Kỹ sư Backend · Tích hợp API Thương mại điện tử · Nghiên cứu bộ nhớ tác tử LLM",
  },
  location: { en: "Da Nang, Vietnam", vi: "Đà Nẵng, Việt Nam" },
  email: "phamkhanhminhman97@gmail.com",
  github: "https://github.com/phamkhanhminhman97",
  bio: {
    en: [
      "Backend engineer with 5+ years in e-commerce and multi-marketplace API integration. Focused on NestJS, TypeScript, and event-driven systems on AWS.",
      "Author of several open-source libraries for the Shopee, TikTok Shop and Lazada Open APIs — organised as a monorepo with npm workspaces, Changesets and automated CI/CD.",
      "Hands-on with order processing, inventory sync, payment gateways (Fundiin, Payoo, ZaloPay), shipping providers (GHN, Ahamove, TikiNOW) and ERP (NaviWorld).",
      "Since 2026, a graduate student in Computer Science (research track) at Danang University of Science and Technology. Research interest: memory for LLM agents — specifically, separating what graph structure contributes from what the data representation contributes, using budget-matched controlled experiments and statistics at the correct unit of analysis.",
    ],
    vi: [
      "Kỹ sư phần mềm backend với hơn 5 năm kinh nghiệm trong lĩnh vực thương mại điện tử và tích hợp API đa sàn. Chuyên sâu về NestJS, TypeScript, và các hệ thống event-driven trên AWS.",
      "Tác giả của nhiều thư viện mã nguồn mở kết nối Shopee, TikTok Shop, Lazada Open API — được tổ chức trong monorepo với npm workspaces, Changesets, và CI/CD tự động.",
      "Kinh nghiệm làm việc với các hệ thống xử lý đơn hàng, đồng bộ tồn kho, tích hợp cổng thanh toán (Fundiin, Payoo, ZaloPay), vận chuyển (GHN, Ahamove, TikiNOW), và ERP (NaviWorld).",
      "Từ 2026 học thạc sĩ Khoa học Máy tính (định hướng nghiên cứu) tại Trường Đại học Bách khoa — Đại học Đà Nẵng. Hướng quan tâm: bộ nhớ cho tác tử LLM — cụ thể là tách bạch phần đóng góp của cấu trúc đồ thị khỏi phần đóng góp của cách biểu diễn dữ liệu, bằng thí nghiệm có đối chứng khớp ngân sách và thống kê đúng đơn vị phân tích.",
    ],
  },
  experiences: [
    {
      period: "2026 —",
      title: "Backend Developer",
      company: "DiproTech",
      summary: {
        en: "Manufacturing simulation, a publishing platform and a study app, for Japanese clients.",
        vi: "Mô phỏng sản xuất, nền tảng xuất bản và ứng dụng luyện thi, cho khách hàng Nhật.",
      },
      highlights: {
        en: ["Engineering detail in Systems above."],
        vi: ["Chi tiết kỹ thuật ở mục Hệ thống phía trên."],
      },
      technologies: ["Python", "Django", "FastAPI", "PostgreSQL", "Firestore", "OPC-UA"],
    },
    {
      period: "07/2025 — 03/2026",
      title: "Backend Developer — Social App",
      company: "DiproTech",
      summary: {
        en: "Newsfeed and content distribution, team of 10.",
        vi: "Newsfeed và phân phối nội dung, đội 10 người.",
      },
      highlights: {
        en: [
          "Owned the newsfeed backend; designed the seed-based ranking it runs on.",
          "Built the CI/CD and ECS deploy path the team ships through.",
        ],
        vi: [
          "Chịu trách nhiệm backend newsfeed; thiết kế cơ chế xếp hạng theo seed.",
          "Dựng đường CI/CD và deploy ECS mà cả đội dùng để ship.",
        ],
      },
      technologies: ["Node.js", "TypeScript", "PostgreSQL", "Redis", "AWS ECS", "GitHub Actions"],
    },
    {
      period: "01/2025 — 06/2025",
      title: "Backend Developer — PaymentShield",
      company: "Devtify Technologies",
      summary: {
        en: "Auto loan service between lenders, dealers and customers, team of 7.",
        vi: "Dịch vụ cho vay mua xe giữa bên cho vay, đại lý và khách hàng; đội 7 người.",
      },
      highlights: {
        en: [
          "Started the codebase: NestJS, Docker, PostgreSQL, layered by responsibility.",
          "Webhooks publish to SQS and Lambda consumes them, so a slow downstream cannot block the callback.",
          "Failed jobs retry with backoff and land in a DLQ instead of disappearing.",
        ],
        vi: [
          "Khởi tạo codebase: NestJS, Docker, PostgreSQL, phân lớp theo trách nhiệm.",
          "Webhook đẩy vào SQS, Lambda xử lý — downstream chậm không chặn được callback.",
          "Job lỗi retry có backoff rồi rơi vào DLQ, thay vì biến mất.",
        ],
      },
      technologies: ["NestJS", "TypeScript", "PostgreSQL", "AWS Lambda", "AWS SQS", "BullMQ", "Redis"],
    },
    {
      period: "01/2024 — 03/2025",
      title: "Backend Developer — ROUTINE",
      company: "Devtify Technologies",
      summary: {
        en: "Orders, inventory and refunds unified across Shopee, Lazada and TikTok Shop, team of 10.",
        vi: "Hợp nhất đơn hàng, tồn kho và hoàn tiền trên Shopee, Lazada và TikTok Shop; đội 10 người.",
      },
      highlights: {
        en: [
          "One order model over three marketplaces, each with its own API shape and failure modes.",
          "Kept stock and finance in step with the NaviWorld ERP.",
          "Integrated three payment gateways and three shipping providers.",
        ],
        vi: [
          "Một mô hình đơn hàng cho ba sàn, mỗi sàn một kiểu API và một kiểu hỏng riêng.",
          "Giữ tồn kho và tài chính khớp với ERP NaviWorld.",
          "Tích hợp ba cổng thanh toán và ba nhà vận chuyển.",
        ],
      },
      technologies: ["NestJS", "TypeScript", "PostgreSQL", "Redis", "Elasticsearch", "BullMQ", "Shopee API", "TikTok Shop API", "Lazada API"],
    },
    {
      period: "04/2022 — 11/2023",
      title: "Backend Developer — BEAUTYBOX / THEFACESHOP / REEBOK",
      company: "Devtify Technologies",
      summary: {
        en: "Retail digital transformation for HSVGroup, team of 15.",
        vi: "Chuyển đổi số bán lẻ cho HSVGroup, đội 15 người.",
      },
      highlights: {
        en: ["Designed the database and REST API; unified order processing across three marketplaces."],
        vi: ["Thiết kế cơ sở dữ liệu và REST API; hợp nhất xử lý đơn hàng từ ba sàn."],
      },
      technologies: ["NestJS", "TypeScript", "PostgreSQL", "Redis", "AWS EC2", "Docker"],
    },
    {
      period: "01/2020 — 01/2022",
      title: "Military Service",
      company: "Vietnam People's Army",
      summary: {
        en: "Completed compulsory military service.",
        vi: "Hoàn thành nghĩa vụ quân sự.",
      },
      highlights: { en: [], vi: [] },
      technologies: [],
    },
    {
      period: "03/2019 — 12/2019",
      title: "Backend Developer — SunWorld B2B Ticket",
      company: "D-SOFT JSC",
      summary: {
        en: "Ticket selection, online payment and e-ticket storage, team of 7.",
        vi: "Chọn vé, thanh toán trực tuyến và lưu vé điện tử; đội 7 người.",
      },
      highlights: {
        en: ["Designed and built the REST API on PHP / Laravel / SQL Server."],
        vi: ["Thiết kế và dựng REST API trên PHP / Laravel / SQL Server."],
      },
      technologies: ["PHP", "Laravel", "SQL Server"],
    },
  ],
  skills: [
    {
      category: { en: "Languages", vi: "Ngôn ngữ lập trình" },
      items: ["TypeScript", "JavaScript", "PHP", "Python"],
    },
    {
      category: { en: "Backend Frameworks", vi: "Backend Framework" },
      items: ["NestJS", "Node.js", "Express", "Laravel"],
    },
    {
      category: { en: "Databases & Search", vi: "Cơ sở dữ liệu & Search" },
      items: ["PostgreSQL", "Redis", "Elasticsearch", "SQL Server"],
    },
    {
      category: { en: "E-commerce Platforms", vi: "E-commerce Platforms" },
      items: [
        "Shopee Open API v2",
        "TikTok Shop API v2",
        "Lazada Open Platform",
        "GHN / Ahamove / TikiNOW",
      ],
    },
    {
      category: { en: "Cloud & DevOps", vi: "Cloud & DevOps" },
      items: [
        "AWS EC2 / S3 / ECS",
        "AWS Lambda / SQS",
        "Docker",
        "GitHub Actions",
        "GitLab CI",
        "Linux",
      ],
    },
    {
      category: { en: "Message Queues & Workers", vi: "Message Queue & Workers" },
      items: ["BullMQ", "Redis Queue", "AWS SQS + DLQ"],
    },
    {
      category: { en: "Payment Integrations", vi: "Payment Integrations" },
      items: ["Fundiin", "Payoo", "ZaloPay"],
    },
  ],
  systems: [
    {
      name: { en: "Multi-environment deploy pipeline", vi: "Luồng deploy nhiều môi trường" },
      domain: { en: "Backend infrastructure", vi: "Hạ tầng backend" },
      summary: {
        en: "Dev / staging / production deploy path for a four-service product, designed and built end to end.",
        vi: "Đường deploy dev / staging / production cho sản phẩm bốn service, tự thiết kế và dựng từ đầu.",
      },
      highlights: {
        en: [
          "One workflow per environment; production takes a service argument so you deploy one service, not all four.",
          "Images built with Buildx layer cache, tagged by commit SHA, pushed to ECR.",
          "Deploy registers a new ECS task definition, updates the service, and waits for it to stabilise.",
        ],
        vi: [
          "Mỗi môi trường một workflow; production nhận tham số service để deploy đúng một service, không phải cả bốn.",
          "Image build bằng Buildx có cache layer, gắn tag theo commit SHA, đẩy lên ECR.",
          "Deploy đăng ký task definition mới trên ECS, cập nhật service, rồi chờ tới khi ổn định.",
        ],
      },
      technologies: ["GitHub Actions", "Docker Buildx", "AWS ECR", "AWS ECS", "ALB", "Docker Compose"],
    },
    {
      name: { en: "Virtual factory / production scheduling", vi: "Nhà máy ảo / lập lịch sản xuất" },
      domain: { en: "Manufacturing simulation · client project", vi: "Mô phỏng sản xuất · dự án khách hàng" },
      summary: {
        en: "Django platform simulating a factory floor — scheduling, facility state, dispatching — bridged to real equipment over OPC-UA.",
        vi: "Nền tảng Django mô phỏng xưởng sản xuất — lập lịch, trạng thái thiết bị, điều phối — nối thiết bị thật qua OPC-UA.",
      },
      highlights: {
        en: [
          "Five services share one models package: any schema change ripples through all of them.",
          "Traced the DB → data-creator → environment path and reported where the schema had already drifted apart.",
        ],
        vi: [
          "Năm service dùng chung một package model: đổi schema là lan qua tất cả.",
          "Lần theo đường DB → data-creator → environment và chỉ ra chỗ schema đã lệch nhau từ trước.",
        ],
      },
      technologies: ["Python", "Django", "PostgreSQL", "Redis", "Docker Compose", "OPC-UA", "Java"],
    },
    {
      name: { en: "Publishing platform (portal + identity)", vi: "Nền tảng xuất bản (portal + định danh)" },
      domain: { en: "Content platform · client project", vi: "Nền tảng nội dung · dự án khách hàng" },
      summary: {
        en: "Four applications behind one account, sharing a single auth package.",
        vi: "Bốn ứng dụng dùng chung một tài khoản, chia sẻ một package auth.",
      },
      highlights: {
        en: [
          "Next.js and Nuxt apps hold the same auth contract — keeping that contract stable is the whole constraint.",
          "Single sign-on on Cognito, wrapped so no app talks to Cognito directly.",
        ],
        vi: [
          "App Next.js và Nuxt giữ chung một hợp đồng auth — giữ hợp đồng đó ổn định chính là ràng buộc lớn nhất.",
          "Đăng nhập một lần trên Cognito, bọc lại để không app nào gọi thẳng Cognito.",
        ],
      },
      technologies: ["Next.js", "Nuxt", "TypeScript", "AWS Cognito", "AWS SES", "Algolia", "Bugsnag"],
    },
    {
      name: { en: "Aptitude-test study app (backend)", vi: "Ứng dụng luyện thi (backend)" },
      domain: { en: "EdTech · client project", vi: "EdTech · dự án khách hàng" },
      summary: {
        en: "FastAPI service on Firestore: question bank, topic taxonomy, per-user progress.",
        vi: "Dịch vụ FastAPI trên Firestore: ngân hàng câu hỏi, phân loại chủ đề, tiến độ từng người dùng.",
      },
      highlights: {
        en: [
          "Rapid mark-difficult / mark-unlearned calls overwrote each other's stats — a write race, not a slow query.",
          "Fixed by updating counters incrementally instead of recomputing the category, which also dropped a full scan per request.",
        ],
        vi: [
          "Gọi liên tục mark-difficult / mark-unlearned làm ghi đè thống kê của nhau — lỗi tranh ghi, không phải query chậm.",
          "Sửa bằng cập nhật bộ đếm tăng dần thay vì tính lại cả danh mục, đồng thời bỏ luôn một lần quét toàn bộ mỗi request.",
        ],
      },
      technologies: ["Python", "FastAPI", "Firebase Firestore", "BigQuery", "Cloud Build"],
    },
  ],
  education: [
    {
      period: { en: "2026 — present", vi: "2026 — nay" },
      degree: {
        en: "M.Sc. in Computer Science",
        vi: "Thạc sĩ Khoa học Máy tính",
      },
      school: {
        en: "Danang University of Science and Technology (DUT) — The University of Danang",
        vi: "Trường Đại học Bách khoa — Đại học Đà Nẵng",
      },
      description: {
        en: "Research track. Coursework in progress; thesis topic not yet decided.",
        vi: "Định hướng nghiên cứu. Đang học học phần; chưa chốt đề tài luận văn.",
      },
    },
    {
      period: { en: "2015 — 2019", vi: "2015 — 2019" },
      degree: {
        en: "B.Sc. in Information Technology",
        vi: "Cử nhân Công nghệ Thông tin",
      },
      school: {
        en: "University of Science and Education — The University of Danang",
        vi: "Trường Đại học Sư phạm — Đại học Đà Nẵng",
      },
      description: {
        en: "Major in Information Technology.",
        vi: "Chuyên ngành Công nghệ Thông tin.",
      },
    },
  ],
  research: [
    {
      period: { en: "2026 — present", vi: "2026 — nay" },
      status: {
        en: "Exploratory — no published results",
        vi: "Đang tìm hiểu — chưa có kết quả công bố",
      },
      titleVi:
        "Khi nào bộ nhớ đồ thị giúp ích vượt quá biểu diễn quan hệ đã verbalize? Cô lập representation khỏi structure trong bộ nhớ tác tử LLM",
      titleEn:
        "When Does Graph Memory Help Beyond Verbalized Relations? Isolating Representation from Structure in LLM-Agent Memory",
      venue: {
        en: "Independent research — not committed as a thesis topic",
        vi: "Nghiên cứu độc lập — chưa chốt làm đề tài luận văn",
      },
      question: {
        en: "Graph memory is widely believed to help LLM agents remember better. But when graph memory is compared against flat memory, existing work changes TWO things at once: structure (the ability to traverse relations) and representation (information rewritten as typed relational sentences — unavoidable, because an LLM can only read text). So which of the two does the observed benefit belong to?",
        vi: "Bộ nhớ đồ thị được cho là giúp tác tử LLM ghi nhớ tốt hơn. Nhưng khi so đồ thị với bộ nhớ phẳng, các công trình hiện nay đổi ĐỒNG THỜI hai yếu tố: cấu trúc (đi được theo quan hệ) và biểu diễn (thông tin được viết lại thành câu quan hệ có kiểu — bắt buộc, vì LLM chỉ đọc được văn bản). Vậy lợi ích quan sát được thuộc về yếu tố nào?",
      },
      method: {
        en: "Verbalize-control: three token-budget-matched conditions drawing from the same candidate edge pool and differing only in the selector — graph traversal, cosine truncated to the budget, and dump-everything. Plus a degree-preserving shuffled-edge control to separate “these particular edges” from “merely having a graph”. The design is pre-registered, evaluated on an external non-circular benchmark, and specifies the negative branch in advance (TOST equivalence testing).",
        vi: "Verbalize-control: ba điều kiện khớp ngân sách theo TOKEN, dùng chung một kho cạnh ứng viên và chỉ khác bộ chọn — traversal, cosine cắt theo budget, và đổ toàn bộ. Thêm đối chứng cạnh-xáo giữ nguyên bậc để tách “chính các cạnh này” khỏi “chỉ cần có một đồ thị”. Thiết kế đăng ký trước, đánh giá trên benchmark ngoài không circular, và định trước cả nhánh kết luận âm (kiểm định tương đương TOST).",
      },
      honestNote: {
        en: "Status, stated plainly: this is something I work on outside of client work, not a committed thesis topic. A 30-question feasibility probe has been run; the quality gate fired and returned “inconclusive” rather than a result. No publishable numbers.",
        vi: "Nói thẳng trạng thái: đây là thứ tôi làm ngoài công việc, chưa phải đề tài đã chốt. Đã chạy thử nghiệm khả thi 30 câu; cổng chất lượng đã chặn và trả về “chưa kết luận được” thay vì một kết quả. Chưa có số liệu công bố."
      },
      keywords: [
        "LLM agent memory",
        "Knowledge graph",
        "Retrieval",
        "Ablation study",
        "Pre-registration",
        "Cluster-aware statistics",
      ],
    },
  ],
};
