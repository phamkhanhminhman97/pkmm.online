"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { blogPosts } from "@/data/blog";
import { npmPackages } from "@/data/projects";
import {
  Mail,
  MapPin,
  Clock,
  CloudSun,
  ExternalLink,
  BookOpen,
  Award,
  Download,
  Calendar,
  Layers,
  ChevronRight,
  Send,
} from "lucide-react";

// Custom GitHub SVG Icon to replace removed lucide brand icon
const GithubIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);


export default function Home() {
  // Dynamic clock state
  const [timeStr, setTimeStr] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");

  // Weather state
  const [weatherStr, setWeatherStr] = useState<string>("30.0 °C / 86.0 °F, Có mây");
  const [weatherIcon, setWeatherIcon] = useState<string>("⛅");

  // Npm download counts state
  const [downloads, setDownloads] = useState<Record<string, number>>({});

  // Clock updating effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      // Date format (English-style academic date)
      const optionsDate: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      setDateStr(now.toLocaleDateString('en-US', optionsDate));

      // Time format (Vietnam timezone representation)
      const optionsTime: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'Asia/Ho_Chi_Minh'
      };
      setTimeStr(now.toLocaleTimeString('en-US', optionsTime));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Weather Effect (Danang City, Vietnam: Lat 10.823, Lon 106.6296)
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=10.823&longitude=106.6296&current=temperature_2m,weather_code"
        );
        if (!res.ok) return;
        const data = await res.json();

        const tempC = data.current.temperature_2m;
        const tempF = (tempC * 9 / 5 + 32).toFixed(1);
        const code = data.current.weather_code;

        // Simple weather code mapping
        let desc = "Trong lành";
        let icon = "☀️";

        if (code === 0) {
          desc = "Trời quang";
          icon = "☀️";
        } else if ([1, 2, 3].includes(code)) {
          desc = "Ít mây / Nắng nhẹ";
          icon = "⛅";
        } else if ([45, 48].includes(code)) {
          desc = "Sương mù";
          icon = "🌫️";
        } else if ([51, 53, 55, 56, 57].includes(code)) {
          desc = "Mưa phùn";
          icon = "🌧️";
        } else if ([61, 63, 65, 66, 67].includes(code)) {
          desc = "Mưa rào";
          icon = "🌧️";
        } else if ([80, 81, 82].includes(code)) {
          desc = "Mưa giông nhẹ";
          icon = "🌦️";
        } else if ([95, 96, 99].includes(code)) {
          desc = "Có giông bão";
          icon = "⛈️";
        }

        setWeatherStr(`${tempC} °C / ${tempF} °F, ${desc}`);
        setWeatherIcon(icon);
      } catch (e) {
        console.error("Lỗi khi tải thời tiết:", e);
      }
    };

    fetchWeather();
    // Refresh weather every 15 minutes
    const weatherInterval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(weatherInterval);
  }, []);

  useEffect(() => {
    const fetchAllDownloads = async () => {
      const counts: Record<string, number> = {};
      for (const pkg of npmPackages) {
        try {
          const res = await fetch(`https://api.npmjs.org/downloads/point/last-week/${pkg.npmName}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.downloads) {
              counts[pkg.id] = data.downloads;
            } else {
              counts[pkg.id] = pkg.defaultDownloads;
            }
          } else {
            counts[pkg.id] = pkg.defaultDownloads;
          }
        } catch (e) {
          counts[pkg.id] = pkg.defaultDownloads;
        }
      }
      setDownloads(counts);
    };

    fetchAllDownloads();
  }, []);

  // Smooth scroll helper
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 font-sans selection:bg-zinc-200">

      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6">

        {/* LOGO */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="cursor-pointer border-2 border-black p-4 inline-flex flex-col items-center justify-center font-mono font-black tracking-widest text-xl leading-none bg-white hover:bg-black hover:text-white transition-colors duration-300"
        >
          <span>PKMM</span>
          <span className="mt-1.5 text-xs border-t border-black pt-1.5 w-full text-center hover:border-white">ONLINE</span>
        </div>

        {/* TIME & WEATHER WIDGET */}
        <div className="flex flex-col items-center md:items-end text-center md:text-right font-mono text-xs text-zinc-600">
          <div className="flex items-center gap-1.5 text-zinc-800 font-bold mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{dateStr || "Saturday, May 23, 2026"}</span>
          </div>

          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>I am @ Danang City, VN — </span>
            <span className="text-black font-semibold">{timeStr || "11:24:00 PM"}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-sm">{weatherIcon}</span>
            <span>{weatherStr}</span>
          </div>
        </div>
      </header>

      {/* DUAL LINE NAVIGATION */}
      <nav className="editorial-border-double py-2 mb-8">
        <ul className="flex flex-wrap items-center justify-center md:justify-start gap-x-8 gap-y-2 text-xs font-bold tracking-wider font-mono text-zinc-700">
          <li>
            <button
              onClick={() => scrollToSection("publications")}
              className="hover:text-black transition-colors py-1 cursor-pointer"
            >
              • PUBLICATIONS & SDKS
            </button>
          </li>
          <li>
            <Link
              href="/about"
              className="hover:text-black transition-colors py-1 block"
            >
              • ABOUT & EXPERIENCES
            </Link>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("blog")}
              className="hover:text-black transition-colors py-1 cursor-pointer"
            >
              • TECHNICAL BLOG
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("contact")}
              className="hover:text-black transition-colors py-1 cursor-pointer"
            >
              • CONTACT & LINKS
            </button>
          </li>
        </ul>
      </nav>

      {/* MAIN LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* LEFT COLUMN: HERO, BIO, PUBLICATIONS, BLOG (8 columns) */}
        <main className="lg:col-span-8 flex flex-col gap-10">

          {/* HERO ILLUSTRATION */}
          <section className="w-full border border-zinc-300 p-2 bg-white shadow-sm">
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-zinc-100">
              <img
                src="/assets/hero.png"
                alt="Workspace Pixel Art"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]"
              />
            </div>
            <div className="mt-2 text-center font-mono text-[10px] md:text-xs text-zinc-500 uppercase tracking-widest py-1 border-t border-zinc-200">
              API Integration • E-Commerce Automation • Open Source Client SDKs
            </div>
          </section>

          {/* BIO SECTION */}
          <section id="about" className="scroll-mt-6 pt-2">
            <div className="flex flex-col md:flex-row gap-6 items-start">

              {/* Profile Image Wrapper */}
              <div className="flex-shrink-0 mx-auto md:mx-0">
                <div className="border border-zinc-300 p-1.5 bg-white rounded-full">
                  <img
                    src="/assets/avatar.png"
                    alt="Phạm Khánh Minh Mẫn Avatar"
                    className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover"
                  />
                </div>
              </div>

              {/* Bio Paragraph */}
              <div className="flex-grow border-l-2 border-red-700 pl-5 font-serif-body text-[15px] leading-relaxed text-zinc-800 text-justify">
                <p className="mb-3">
                  Tôi là <strong>Phạm Khánh Minh Mẫn</strong> (Mẫn) — Kỹ sư phần mềm chuyên giải pháp tự động hóa và tích hợp E-commerce API. Tôi phát triển các thư viện mã nguồn mở chất lượng cao giúp lập trình viên Việt Nam dễ dàng tương tác với Open API của <strong>Shopee</strong>, <strong>TikTok Shop</strong> và <strong>Lazada</strong>.
                </p>
                <p>
                  Sản phẩm của tôi được tối ưu về bảo mật chữ ký số, refresh token tự động và Webhook thời gian thực — góp phần thúc đẩy sự phát triển của các doanh nghiệp bán lẻ trực tuyến hiện đại.
                </p>
              </div>
            </div>
          </section>

          {/* PUBLICATIONS & PACKAGES */}
          <section id="publications" className="scroll-mt-6 border-t border-zinc-300 pt-6">
            <div className="flex items-center justify-between mb-4 border-b border-black pb-1.5">
              <h2 className="font-mono font-black text-sm tracking-wider text-black">
                REPRESENTATIVE LIBRARIES & PACKAGES
              </h2>
              <span className="font-mono text-zinc-500 text-[10px]">
                [ Last week stats from npmjs.org ]
              </span>
            </div>

            {/* Package Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {npmPackages.map((pkg) => (
                <Link
                  key={pkg.id}
                  href={`/projects/${pkg.id}`}
                  className="group border border-zinc-300 rounded-lg p-4 bg-white shadow-2xs hover:border-zinc-600 hover:shadow-sm transition-all"
                >
                  {/* Header: Icon + Name + Tag */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-shrink-0 p-2 border border-zinc-200 rounded-lg bg-white group-hover:border-zinc-400 transition-colors">
                      {pkg.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-sans font-bold text-sm text-zinc-900 truncate group-hover:text-black">
                        {pkg.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[10px] text-zinc-500 bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">
                          {pkg.tag}
                        </span>
                        <span className="font-mono text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                          <Download className="w-2.5 h-2.5" />
                          {downloads[pkg.id] ? downloads[pkg.id].toLocaleString() : pkg.defaultDownloads.toLocaleString()}/tuần
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* npm install */}
                  <code className="block font-mono text-[10px] text-zinc-500 bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded w-fit mb-2">
                    npm i {pkg.npmName}
                  </code>

                  {/* Short description — truncated to one line on desktop */}
                  <p className="font-serif-body text-[13px] text-zinc-600 leading-relaxed line-clamp-2">
                    {pkg.description}
                  </p>

                  {/* Footer Links — use spans with onClick to avoid nested <a> */}
                  <div
                    className="flex items-center gap-3 mt-3 pt-3 border-t border-zinc-100 font-mono text-[10px] text-zinc-500"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span
                      onClick={() => window.open(pkg.githubUrl, "_blank", "noopener,noreferrer")}
                      className="cursor-pointer hover:text-black flex items-center gap-1 transition-colors"
                      role="link"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && window.open(pkg.githubUrl, "_blank", "noopener,noreferrer")}
                    >
                      <GithubIcon className="w-2.5 h-2.5" /> GitHub
                    </span>
                    <span
                      onClick={() => window.open(pkg.npmUrl, "_blank", "noopener,noreferrer")}
                      className="cursor-pointer hover:text-black flex items-center gap-1 transition-colors"
                      role="link"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && window.open(pkg.npmUrl, "_blank", "noopener,noreferrer")}
                    >
                      <ExternalLink className="w-2.5 h-2.5" /> npm
                    </span>
                    <span className="ml-auto text-zinc-800 group-hover:text-black font-semibold transition-colors">
                      Details →
                    </span>
                  </div>
                </Link>
              ))}

            </div>
          </section>

          {/* TECHNICAL BLOG */}
          <section id="blog" className="scroll-mt-6 border-t border-zinc-300 pt-6 mb-8">
            <div className="flex items-center justify-between mb-6 border-b border-black pb-1.5">
              <h2 className="font-mono font-black text-sm tracking-wider text-black">
                TECHNICAL ARTICLES & GUIDES
              </h2>
              <span className="font-mono text-zinc-500 text-xs">
                [ Chia sẻ kiến thức ]
              </span>
            </div>

            <div className="flex flex-col gap-6">
              {blogPosts.map((post, postIdx) => {
                const dateParts = post.date.split(" ");
                const day = dateParts[0] || "23";
                const month = dateParts.slice(1, 3).join(" ") || "Tháng 5";

                return (
                  <React.Fragment key={post.slug}>
                    {postIdx > 0 && <div className="editorial-border-thin my-2" />}
                    <article className="group">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 text-center font-mono text-zinc-400 border border-zinc-200 rounded p-2 bg-white min-w-[70px]">
                          <span className="block text-lg font-bold text-zinc-800 leading-none">{day}</span>
                          <span className="text-[10px] uppercase">{month}</span>
                        </div>
                        <div>
                          <h3 className="font-sans font-bold text-[15px] group-hover:text-red-700 transition-colors">
                            <Link href={`/blog/${post.slug}`} className="flex items-center gap-1">
                              {post.title}
                              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                          </h3>
                          <p className="font-serif-body text-[13.5px] text-zinc-600 mt-1 leading-relaxed">
                            {post.description}
                          </p>
                        </div>
                      </div>
                    </article>
                  </React.Fragment>
                );
              })}
            </div>
          </section>

        </main>

        {/* RIGHT COLUMN: SIDEBAR (4 columns) */}
        <aside className="lg:col-span-4 flex flex-col gap-8 lg:border-l lg:border-zinc-300 lg:pl-8">

          {/* PROFILE SUMMARY CARD */}
          <section className="bg-white border border-zinc-200 p-5 rounded-lg shadow-2xs">
            <h2 className="font-sans font-bold text-base text-zinc-950 mb-1">
              Phạm Khánh Minh Mẫn
            </h2>
            <p className="font-mono text-xs text-zinc-500 mb-4">
              E-commerce API Developer
            </p>

            <div className="editorial-border-thin my-3" />

            <ul className="flex flex-col gap-3 font-mono text-xs text-zinc-700">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-zinc-500 shrink-0" />
                <span>phamkhanhminhman97 [at] gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
                <span>Danang City, Vietnam</span>
              </li>
              <li className="flex items-center gap-2">
                <GithubIcon className="w-4 h-4 text-zinc-500 shrink-0" />
                <a
                  href="https://github.com/phamkhanhminhman97"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-black"
                >
                  github.com/phamkhanhminhman97
                </a>
              </li>
            </ul>
          </section>

          {/* CORE TECH STACK */}
          <section>
            <h3 className="font-mono font-bold text-xs tracking-wider text-black border-b border-zinc-400 pb-1 mb-3 uppercase flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" /> Core Tech Stack
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                "NestJS",
                "TypeScript",
                "PostgreSQL",
                "Redis",
                "Docker",
                "AWS",
                "BullMQ",
                "Elasticsearch",
              ].map((tech) => (
                <span
                  key={tech}
                  className="font-mono text-[10px] bg-white border border-zinc-200 px-2 py-1 rounded text-zinc-700"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>

          {/* OPEN SOURCE STATS */}
          <section>
            <h3 className="font-mono font-bold text-xs tracking-wider text-black border-b border-zinc-400 pb-1 mb-3 uppercase flex items-center gap-2">
              <Award className="w-3.5 h-3.5" /> Open Source Stats
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between border border-zinc-200 rounded-md px-3 py-2 bg-white shadow-2xs">
                <div className="flex items-center gap-2">
                  <GithubIcon className="w-3.5 h-3.5" />
                  <span className="font-mono text-[11px] text-zinc-700">GitHub Repos</span>
                </div>
                <a
                  href="https://github.com/phamkhanhminhman97"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] font-bold text-red-700 hover:underline"
                >
                  6 repos
                </a>
              </div>
              <div className="flex items-center justify-between border border-zinc-200 rounded-md px-3 py-2 bg-white shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 flex items-center justify-center font-bold text-zinc-500 text-[9px]">Σ</div>
                  <span className="font-mono text-[11px] text-zinc-700">npm Packages</span>
                </div>
                <span className="font-mono text-[10px] font-bold text-zinc-800">
                  {npmPackages.length} packages
                </span>
              </div>
              <div className="flex items-center justify-between border border-zinc-200 rounded-md px-3 py-2 bg-white shadow-2xs">
                <div className="flex items-center gap-2">
                  <Download className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="font-mono text-[11px] text-zinc-700">Weekly Downloads</span>
                </div>
                <span className="font-mono text-[10px] font-bold text-zinc-800">
                  ~{npmPackages.reduce((sum, p) => sum + p.defaultDownloads, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </section>

          {/* LATEST UPDATES */}
          <section>
            <h3 className="font-mono font-bold text-xs tracking-wider text-black border-b border-zinc-400 pb-1 mb-3 uppercase">
              Latest Updates
            </h3>
            <div className="flex flex-col gap-4 font-mono text-xs text-zinc-700">

              <div className="flex gap-2">
                <span className="text-[10px] font-bold text-red-700 shrink-0 mt-0.5">05/2026</span>
                <div>
                  <strong className="text-black block text-[11px]">RELEASED SHOPEE-API-CLIENT V2.1.2</strong>
                  <span className="text-zinc-500 text-[11px] block mt-0.5">Cập nhật đầy đủ typings cho API hoàn xu và đẩy vận đơn Shopee.</span>
                </div>
              </div>

              <div className="border-t border-zinc-100" />

              <div className="flex gap-2">
                <span className="text-[10px] font-bold text-zinc-500 shrink-0 mt-0.5">04/2026</span>
                <div>
                  <strong className="text-black block text-[11px]">RELEASED TIKTOK-API-CLIENT V1.3.0</strong>
                  <span className="text-zinc-500 text-[11px] block mt-0.5">Tích hợp thành công cơ chế mã hóa bảo mật webhook từ TikTok Shop API v2.</span>
                </div>
              </div>

              <div className="border-t border-zinc-100" />

              <div className="flex gap-2">
                <span className="text-[10px] font-bold text-zinc-500 shrink-0 mt-0.5">03/2026</span>
                <div>
                  <strong className="text-black block text-[11px]">SHARED BLOG POST ON MONOREPO</strong>
                  <span className="text-zinc-500 text-[11px] block mt-0.5">Bài hướng dẫn về Changesets được chia sẻ trên các group lập trình lớn.</span>
                </div>
              </div>

            </div>
          </section>

          {/* CONTACT BOX */}
          <section id="contact" className="scroll-mt-6 border-t border-zinc-300 pt-6">
            <h3 className="font-mono font-bold text-xs tracking-wider text-black mb-3 uppercase">
              Leave a Message
            </h3>

            {/* Direct Form Submit to Web3Forms (No backend required) */}
            <form
              action="https://api.web3forms.com/submit"
              method="POST"
              className="flex flex-col gap-3 font-mono text-xs"
            >
              {/* Web3Forms Access Key - placeholder for user to fill later or just use direct */}
              <input type="hidden" name="access_key" value="YOUR_ACCESS_KEY_HERE" />
              <input type="hidden" name="subject" value="New Contact from pkmm.online" />
              <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />

              <div>
                <label className="block text-zinc-600 mb-1">Your Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Nguyen Van A"
                  className="w-full bg-white border border-zinc-300 rounded px-2.5 py-1.5 focus:border-black focus:outline-none text-zinc-800 text-[13px] font-sans"
                />
              </div>

              <div>
                <label className="block text-zinc-600 mb-1">Your Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  className="w-full bg-white border border-zinc-300 rounded px-2.5 py-1.5 focus:border-black focus:outline-none text-zinc-800 text-[13px] font-sans"
                />
              </div>

              <div>
                <label className="block text-zinc-600 mb-1">Message</label>
                <textarea
                  name="message"
                  required
                  rows={3}
                  placeholder="Tôi muốn thảo luận về..."
                  className="w-full bg-white border border-zinc-300 rounded px-2.5 py-1.5 focus:border-black focus:outline-none text-zinc-800 text-[13px] font-sans resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white font-bold py-2 rounded flex items-center justify-center gap-1.5 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> Gửi liên hệ
              </button>
            </form>
          </section>

        </aside>

      </div>

      {/* FOOTER SECTION */}
      <footer className="editorial-border-double mt-12 py-6 text-center font-mono text-[10px] text-zinc-500">
        <div>
          &copy; {new Date().getFullYear()} PKMM.ONLINE. All rights reserved.
        </div>
        <div className="mt-1">
          Designed with editorial-academic style. Hosted on Cloudflare Pages.
        </div>
      </footer>

    </div>
  );
}
