import type { Locale } from "./config";

export interface Dictionary {
  nav: {
    publications: string;
    research: string;
    about: string;
    blog: string;
    contact: string;
    backToHome: string;
    switchTo: string;
    switchLabel: string;
  };
  home: {
    metaTitle: string;
    metaDescription: string;
    kicker: string;
    heroAlt: string;
    avatarAlt: string;
    intro: string[];
    sectionPackages: string;
    sectionPackagesNote: string;
    sectionResearch: string;
    sectionResearchNote: string;
    sectionBlog: string;
    sectionBlogNote: string;
    fullMethod: string;
    perWeek: string;
    coreTechStack: string;
    openSourceStats: string;
    githubRepos: string;
    npmPackages: string;
    weeklyDownloads: string;
    repos: string;
    packages: string;
    latestUpdates: string;
    updates: { title: string; body: string }[];
    details: string;
  };
  about: {
    metaTitle: string;
    metaDescription: string;
    breadcrumb: string;
    sectionAbout: string;
    sectionResearch: string;
    sectionSystems: string;
    sectionExperience: string;
    sectionEducation: string;
    sectionSkills: string;
    systemsNote: string;
    cv: string;
    cvBody: string;
    cvButton: string;
    quickLinks: string;
    contactBlurb: string;
    workTogether: string;
    researchQuestion: string;
    researchMethod: string;
  };
  contact: {
    heading: string;
    name: string;
    email: string;
    message: string;
    messagePlaceholder: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    submit: string;
    subject: string;
    disabledNote: string;
    sendEmail: string;
    sending: string;
    sent: string;
    failed: string;
    orEmail: string;
  };
  notFound: { title: string; home: string; about: string };
  blog: { badge: string; readOriginal: string; langNote: string };
  footer: { rights: string; built: string };
  weather: Record<string, string> & { error: string };
}

const en: Dictionary = {
  nav: {
    publications: "PUBLICATIONS & SDKS",
    research: "RESEARCH",
    about: "ABOUT & EXPERIENCE",
    blog: "TECHNICAL BLOG",
    contact: "CONTACT & LINKS",
    backToHome: "Back to Home",
    switchTo: "Tiếng Việt",
    switchLabel: "Switch language",
  },
  home: {
    metaTitle:
      "Phạm Khánh Minh Mẫn — Backend Engineer & LLM-Agent Memory Research",
    metaDescription:
      "Backend engineer (NestJS, PostgreSQL, Redis, AWS) with 5+ years in e-commerce, author of the open-source Shopee / TikTok Shop / Lazada API clients. Graduate researcher on graph memory for LLM agents at Danang University of Science and Technology.",
    kicker: "API INTEGRATION • E-COMMERCE AUTOMATION • APPLIED AI RESEARCH",
    heroAlt: "Pixel-art illustration of a developer workspace",
    avatarAlt: "Portrait of Phạm Khánh Minh Mẫn",
    intro: [
      "Backend engineer, 5 years on e-commerce systems and multi-marketplace API integration.",
      "I write and maintain open-source clients for the Shopee, TikTok Shop and Lazada Open APIs — request signing, token refresh, webhooks.",
      "Currently at DiproTech on manufacturing simulation and content platforms for Japanese clients. Since 2026, a graduate student in Computer Science at Danang University of Science and Technology.",
    ],
    sectionPackages: "REPRESENTATIVE LIBRARIES & PACKAGES",
    sectionPackagesNote: "[ Last week stats from npmjs.org ]",
    sectionResearch: "RESEARCH — GRADUATE WORK",
    sectionResearchNote: "[ In progress ]",
    sectionBlog: "TECHNICAL ARTICLES & GUIDES",
    sectionBlogNote: "[ Written in Vietnamese ]",
    fullMethod: "Full method & status →",
    perWeek: "/week",
    coreTechStack: "Core Tech Stack",
    openSourceStats: "Open Source Stats",
    githubRepos: "GitHub Repos",
    npmPackages: "npm Packages",
    weeklyDownloads: "Weekly Downloads",
    repos: "repos",
    packages: "packages",
    latestUpdates: "Latest Updates",
    updates: [
      {
        title: "RELEASED SHOPEE-API-CLIENT V2.1.2",
        body: "Full typings for the Shopee refund and shipping-document APIs.",
      },
      {
        title: "RELEASED TIKTOK-API-CLIENT V1.3.0",
        body: "Webhook signature verification for TikTok Shop API v2.",
      },
      {
        title: "SHARED BLOG POST ON MONOREPO",
        body: "The Changesets guide picked up by several large developer groups.",
      },
    ],
    details: "Details →",
  },
  about: {
    metaTitle: "About & Research",
    metaDescription:
      "Curriculum vitae of Phạm Khánh Minh Mẫn — backend engineer (NestJS, PostgreSQL, Redis, AWS) and graduate researcher on graph memory for LLM agents.",
    breadcrumb: "pkmm.online / about",
    sectionAbout: "About",
    sectionResearch: "Research",
    sectionSystems: "Systems",
    sectionExperience: "Experience",
    sectionEducation: "Education",
    sectionSkills: "Skills",
    systemsNote:
      "Client names are withheld where the work is under contract; the public project links out.",
    cv: "Curriculum Vitae",
    cvBody:
      "A downloadable CV with the full work history and skill breakdown is coming.",
    cvButton: "Download CV (PDF) — coming soon",
    quickLinks: "Quick Links",
    contactBlurb:
      "Always happy to discuss e-commerce integration work, automation, or open-source collaboration.",
    workTogether: "Let's Work Together",
    researchQuestion: "Question",
    researchMethod: "Method",
  },
  contact: {
    heading: "Leave a Message",
    name: "Your Name",
    email: "Your Email",
    message: "Message",
    namePlaceholder: "Jane Doe",
    emailPlaceholder: "name@example.com",
    messagePlaceholder: "I would like to discuss…",
    submit: "Send message",
    subject: "New contact from pkmm.online",
    disabledNote: "The contact form is not configured yet. Email me directly:",
    sendEmail: "Email me",
    sending: "Sending…",
    sent: "Thanks — your message is on its way. I'll reply to the address you gave.",
    failed: "Could not send. Please email me directly:",
    orEmail: "or email directly",
  },
  notFound: {
    title: "Page not found",
    home: "Back to home",
    about: "About",
  },
  blog: {
    badge: "Vietnamese",
    readOriginal: "Read the article",
    langNote:
      "These guides are written in Vietnamese — they target developers integrating Vietnamese e-commerce platforms.",
  },
  footer: {
    rights: "All rights reserved.",
    built: "Editorial-academic design. Hosted on Cloudflare.",
  },
  weather: {
    error: "Failed to load weather:",
    clear: "Clear",
    fair: "Fair",
    cloudy: "Cloudy",
    fog: "Fog",
    drizzle: "Drizzle",
    rain: "Rain",
    showers: "Showers",
    thunder: "Thunderstorm",
  },
};

const vi: Dictionary = {
  nav: {
    publications: "THƯ VIỆN & SDK",
    research: "NGHIÊN CỨU",
    about: "GIỚI THIỆU & KINH NGHIỆM",
    blog: "BÀI VIẾT KỸ THUẬT",
    contact: "LIÊN HỆ",
    backToHome: "Về trang chủ",
    switchTo: "English",
    switchLabel: "Đổi ngôn ngữ",
  },
  home: {
    metaTitle:
      "Phạm Khánh Minh Mẫn — Kỹ sư Backend & Nghiên cứu bộ nhớ tác tử LLM",
    metaDescription:
      "Kỹ sư backend (NestJS, PostgreSQL, Redis, AWS) với 5+ năm kinh nghiệm thương mại điện tử, tác giả các thư viện mã nguồn mở Shopee / TikTok Shop / Lazada API. Học viên cao học nghiên cứu bộ nhớ đồ thị cho tác tử LLM tại ĐH Bách khoa Đà Nẵng.",
    kicker: "TÍCH HỢP API • TỰ ĐỘNG HOÁ E-COMMERCE • NGHIÊN CỨU AI ỨNG DỤNG",
    heroAlt: "Minh hoạ pixel-art góc làm việc của lập trình viên",
    avatarAlt: "Ảnh chân dung Phạm Khánh Minh Mẫn",
    intro: [
      "Kỹ sư backend, 5 năm làm hệ thống thương mại điện tử và tích hợp API đa sàn.",
      "Viết và duy trì các thư viện mã nguồn mở cho Open API của Shopee, TikTok Shop và Lazada — ký request, refresh token, webhook.",
      "Hiện làm tại DiproTech: mô phỏng sản xuất và nền tảng nội dung cho khách hàng Nhật. Từ 2026 học thạc sĩ Khoa học Máy tính tại Trường Đại học Bách khoa — Đại học Đà Nẵng.",
    ],
    sectionPackages: "THƯ VIỆN & GÓI TIÊU BIỂU",
    sectionPackagesNote: "[ Số liệu tuần trước từ npmjs.org ]",
    sectionResearch: "NGHIÊN CỨU — SAU ĐẠI HỌC",
    sectionResearchNote: "[ Đang thực hiện ]",
    sectionBlog: "BÀI VIẾT & HƯỚNG DẪN KỸ THUẬT",
    sectionBlogNote: "[ Chia sẻ kiến thức ]",
    fullMethod: "Phương pháp & trạng thái đầy đủ →",
    perWeek: "/tuần",
    coreTechStack: "Công nghệ chính",
    openSourceStats: "Thống kê mã nguồn mở",
    githubRepos: "Kho GitHub",
    npmPackages: "Gói npm",
    weeklyDownloads: "Lượt tải mỗi tuần",
    repos: "kho",
    packages: "gói",
    latestUpdates: "Cập nhật gần đây",
    updates: [
      {
        title: "PHÁT HÀNH SHOPEE-API-CLIENT V2.1.2",
        body: "Bổ sung đầy đủ typings cho API hoàn xu và đẩy vận đơn Shopee.",
      },
      {
        title: "PHÁT HÀNH TIKTOK-API-CLIENT V1.3.0",
        body: "Xác thực chữ ký webhook cho TikTok Shop API v2.",
      },
      {
        title: "CHIA SẺ BÀI VIẾT VỀ MONOREPO",
        body: "Bài hướng dẫn Changesets được chia sẻ trên nhiều group lập trình lớn.",
      },
    ],
    details: "Chi tiết →",
  },
  about: {
    metaTitle: "Giới thiệu & Nghiên cứu",
    metaDescription:
      "Hồ sơ năng lực của Phạm Khánh Minh Mẫn — kỹ sư backend (NestJS, PostgreSQL, Redis, AWS) và học viên cao học nghiên cứu bộ nhớ đồ thị cho tác tử LLM.",
    breadcrumb: "pkmm.online / giới thiệu",
    sectionAbout: "Giới thiệu",
    sectionResearch: "Nghiên cứu",
    sectionSystems: "Hệ thống",
    sectionExperience: "Kinh nghiệm",
    sectionEducation: "Học vấn",
    sectionSkills: "Kỹ năng",
    systemsNote:
      "Phần làm cho khách hàng thì không nêu tên; dự án công khai có link dẫn ra ngoài.",
    cv: "Hồ sơ năng lực",
    cvBody:
      "Bản CV đầy đủ về kinh nghiệm làm việc và kỹ năng chuyên môn sẽ sớm có.",
    cvButton: "Tải CV (PDF) — sắp có",
    quickLinks: "Liên kết nhanh",
    contactBlurb:
      "Tôi luôn sẵn sàng thảo luận về các dự án tích hợp thương mại điện tử, giải pháp tự động hoá, hoặc cơ hội hợp tác mã nguồn mở.",
    workTogether: "Cùng hợp tác",
    researchQuestion: "Câu hỏi",
    researchMethod: "Phương pháp",
  },
  contact: {
    heading: "Gửi tin nhắn",
    name: "Tên của bạn",
    email: "Email của bạn",
    message: "Nội dung",
    namePlaceholder: "Nguyễn Văn A",
    emailPlaceholder: "ten@example.com",
    messagePlaceholder: "Tôi muốn thảo luận về…",
    submit: "Gửi liên hệ",
    subject: "Liên hệ mới từ pkmm.online",
    disabledNote: "Form liên hệ chưa được kích hoạt. Gửi email trực tiếp:",
    sendEmail: "Gửi email",
    sending: "Đang gửi…",
    sent: "Đã gửi. Tôi sẽ trả lời vào địa chỉ bạn để lại.",
    failed: "Gửi không thành công. Bạn gửi email trực tiếp giúp tôi:",
    orEmail: "hoặc gửi email trực tiếp",
  },
  notFound: {
    title: "Trang không tìm thấy",
    home: "Về trang chủ",
    about: "Giới thiệu",
  },
  blog: {
    badge: "Tiếng Việt",
    readOriginal: "Đọc bài viết",
    langNote:
      "Các bài hướng dẫn này viết bằng tiếng Việt — dành cho lập trình viên tích hợp các sàn thương mại điện tử Việt Nam.",
  },
  footer: {
    rights: "Bảo lưu mọi quyền.",
    built: "Thiết kế theo phong cách báo chí học thuật. Chạy trên Cloudflare.",
  },
  weather: {
    error: "Lỗi khi tải thời tiết:",
    clear: "Trời quang",
    fair: "Trong lành",
    cloudy: "Có mây",
    fog: "Sương mù",
    drizzle: "Mưa phùn",
    rain: "Mưa",
    showers: "Mưa rào",
    thunder: "Có giông bão",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { en, vi };

export function getDictionary(lang: Locale): Dictionary {
  return dictionaries[lang];
}
