"use client";

import React, { useState, useEffect } from "react";
import { Download } from "lucide-react";

interface NpmStatsCardProps {
  npmName: string;
  defaultDownloads: number;
}

export default function NpmStatsCard({
  npmName,
  defaultDownloads,
}: NpmStatsCardProps) {
  const [downloads, setDownloads] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchStats = async () => {
      try {
        const res = await fetch(
          `https://api.npmjs.org/downloads/point/last-week/${npmName}`
        );
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data?.downloads) {
            setDownloads(data.downloads);
          }
        }
      } catch {
        // silent fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchStats();
    return () => {
      cancelled = true;
    };
  }, [npmName]);

  const displayCount = downloads ?? defaultDownloads;

  return (
    <section className="bg-[#fcfcfc] border border-zinc-200 p-4 rounded-lg">
      <h3 className="font-mono font-bold text-xs text-zinc-900 border-b border-zinc-200 pb-1 mb-3 uppercase">
        Download Stats
      </h3>
      <div className="flex items-center gap-3">
        <div className="bg-emerald-50 border border-emerald-200 rounded-full p-2">
          <Download className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <span className="block font-sans font-black text-2xl text-zinc-950">
            {loading ? (
              <span className="text-zinc-300 animate-pulse">---</span>
            ) : (
              displayCount.toLocaleString()
            )}
          </span>
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
            Downloads / Last Week
          </span>
        </div>
      </div>
      <div className="mt-3 font-mono text-[10px] text-zinc-400">
        Source: npm Registry API
      </div>
    </section>
  );
}
