// ─── Profile Data for About Page ───────────────────────────────────────────

export interface Experience {
  period: string;
  title: string;
  company: string;
  description: string;
  technologies: string[];
}

export interface Skill {
  category: string;
  items: string[];
}

export interface Education {
  period: string;
  degree: string;
  school: string;
  description: string;
}

export interface ProfileData {
  name: string;
  title: string;
  location: string;
  email: string;
  github: string;
  bio: string[];
  experiences: Experience[];
  skills: Skill[];
  education: Education[];
}

export const profile: ProfileData = {
  name: "Phạm Khánh Minh Mẫn",
  title: "Backend Developer & E-commerce API Integration",
  location: "Danang City, Vietnam",
  email: "phamkhanhminhman97@gmail.com",
  github: "https://github.com/phamkhanhminhman97",
  bio: [
    "Kỹ sư phần mềm backend với hơn 5 năm kinh nghiệm trong lĩnh vực thương mại điện tử và tích hợp API đa sàn. Chuyên sâu về NestJS, TypeScript, và các hệ thống event-driven trên AWS.",
    "Tác giả của nhiều thư viện mã nguồn mở kết nối Shopee, TikTok Shop, Lazada Open API — được tổ chức trong monorepo với npm workspaces, Changesets, và CI/CD tự động.",
    "Kinh nghiệm làm việc với các hệ thống xử lý đơn hàng, đồng bộ tồn kho, tích hợp cổng thanh toán (Fundiin, Payoo, ZaloPay), vận chuyển (GHN, Ahamove, TikiNOW), và ERP (NaviWorld).",
  ],
  experiences: [
    {
      period: "07/2025 — 03/2026",
      title: "Backend Developer — Social App",
      company: "DiproTech",
      description:
        "Social platform with focus on newsfeed and content distribution (team size: 10). Led backend development direction for the newsfeed system. Designed and implemented newsfeed architecture using seed-based ranking. Established and standardized development and production environments. Guided and mentored team members on architecture decisions and coding practices. Designed and implemented CI/CD pipelines using GitHub Actions. Deployed and operated backend services on Amazon ECS.",
      technologies: [
        "Node.js",
        "TypeScript",
        "PostgreSQL",
        "Redis",
        "Docker",
        "AWS ECS",
        "GitHub Actions",
        "CI/CD",
      ],
    },
    {
      period: "01/2025 — 06/2025",
      title: "Backend Developer — PaymentShield",
      company: "Devtify Technologies",
      description:
        "Biweekly progress of the three-party auto loan service involving lenders, dealers, and customers (team size: 7). Initiated project with NestJS, Docker, PostgreSQL, GitLab, and layered design. Built an event-driven system using AWS Lambda and SQS: the NestJS webhook server publishes events to SQS, and Lambda functions process them asynchronously with retry and backoff via DLQ. Queue & Worker Management: Utilized BullMQ with Redis for efficient task handling, optimizing system performance and reducing response times.",
      technologies: [
        "NestJS",
        "TypeScript",
        "PostgreSQL",
        "Docker",
        "AWS Lambda",
        "AWS SQS",
        "BullMQ",
        "Redis",
        "GitLab",
      ],
    },
    {
      period: "01/2024 — 03/2025",
      title: "Backend Developer — ROUTINE",
      company: "Devtify Technologies",
      description:
        "Digital transformation including e-commerce platforms: Shopee, Lazada, TikTok Shop (team size: 10). Designed APIs for order flow, inventory sync, and refunds. Integrated multiple payment gateways: Fundiin, Payoo, ZaloPay. Implemented BullMQ with Redis reducing system response times, preventing bottlenecks, and optimizing overall system performance. Stored data and processing states in PostgreSQL and Elasticsearch to enable fast querying and analytics. Utilized Elasticsearch for log monitoring, event data querying, and generating analytical reports. Used long polling for real-time updates and notifications. Synchronized with ERP system (NaviWorld) for finance and stock tracking. Automated customer notifications via Zalo, SMS. Connected with e-commerce platforms: Shopee, Lazada, TikTok Shop. Integrated shipping APIs: GHN, Ahamove, TikiNOW. Built backend services using NestJS, PostgreSQL, Redis, deployed on AWS EC2/S3.",
      technologies: [
        "NestJS",
        "TypeScript",
        "PostgreSQL",
        "Redis",
        "Elasticsearch",
        "AWS EC2",
        "AWS S3",
        "BullMQ",
        "Docker",
        "Shopee API",
        "TikTok Shop API",
        "Lazada API",
        "GHN",
        "Ahamove",
        "Fundiin",
        "ZaloPay",
      ],
    },
    {
      period: "04/2022 — 11/2023",
      title: "Backend Developer — BEAUTYBOX / THEFACESHOP / REEBOK",
      company: "Devtify Technologies",
      description:
        "Digital transformation for HSVGroup, including e-commerce platforms: Shopee, Lazada (team size: 15). Analyzed, researched business requirements and designed database and REST API for backend system. Connected with e-commerce platforms: Shopee, Lazada, TikTok Shop for unified order processing. Collaborated closely with front-end developers to ensure integration of features. Built backend services using NestJS, PostgreSQL, Redis, deployed on AWS EC2/S3.",
      technologies: [
        "NestJS",
        "TypeScript",
        "PostgreSQL",
        "Redis",
        "AWS EC2",
        "AWS S3",
        "Docker",
        "Shopee API",
        "Lazada API",
        "TikTok Shop API",
      ],
    },
    {
      period: "01/2020 — 01/2022",
      title: "Military Service",
      company: "Nghĩa vụ Quân sự",
      description:
        "Hoàn thành nghĩa vụ quân sự theo quy định.",
      technologies: [],
    },
    {
      period: "03/2019 — 12/2019",
      title: "Backend Developer — SunWorld B2B Ticket",
      company: "D-SOFT JSC",
      description:
        "This system provides features for selecting tickets, making online payments, and storing electronic tickets (team size: 7). Designed and implemented RESTful API. Created clean, simple, and reusable code with design patterns and SOLID principles. Developed web application using PHP, Laravel, SQL Server.",
      technologies: ["PHP", "Laravel", "SQL Server", "REST API"],
    },
  ],
  skills: [
    {
      category: "Ngôn ngữ lập trình",
      items: ["TypeScript", "JavaScript", "PHP", "Python"],
    },
    {
      category: "Backend Framework",
      items: ["NestJS", "Node.js", "Express", "Laravel"],
    },
    {
      category: "Cơ sở dữ liệu & Search",
      items: ["PostgreSQL", "Redis", "Elasticsearch", "SQL Server"],
    },
    {
      category: "E-commerce Platforms",
      items: [
        "Shopee Open API v2",
        "TikTok Shop API v2",
        "Lazada Open Platform",
        "GHN / Ahamove / TikiNOW",
      ],
    },
    {
      category: "Cloud & DevOps",
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
      category: "Message Queue & Workers",
      items: ["BullMQ", "Redis Queue", "AWS SQS + DLQ"],
    },
    {
      category: "Payment Integrations",
      items: ["Fundiin", "Payoo", "ZaloPay"],
    },
  ],
  education: [
    {
      period: "2015 — 2019",
      degree: "Cử nhân Công nghệ Thông tin",
      school: "Trường Đại học Sư phạm — Đại học Đà Nẵng",
      description:
        "Chuyên ngành Công nghệ Thông tin.",
    },
  ],
};
