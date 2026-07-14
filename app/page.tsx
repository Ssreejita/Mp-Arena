'use client';
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from "next-themes";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import IndiaMap from '@/components/IndiaMap';
import { toSlug } from "@/lib/stateSlug";
import {
  TrendingUp, Award, Clock, MessageSquare, FileText,
  ArrowRight, Users, BarChart2, ChevronRight,ChevronDown, Sparkles,
  Activity, Swords, Trophy, TrendingDown, Shield,
} from 'lucide-react';
import { db, MP } from '@/lib/supabase';
import { cn } from '@/lib/utils';


interface AggregatedInsights {
  avgAttendance: number;
  avgScore: number;
  totalQuestions: number;
  totalDebates: number;
  totalBills: number;
  totalBillsPassed: number;
  partyStats: { name: string; count: number; avgScore: number }[];
}


// KPI Card 
function KpiCard({ icon, label, value, sub, iconColor, trend }: {
  icon: React.ReactNode; label: string; value: string | number;
  sub: string; iconColor: string; trend?: string;
}) {
 return (
  <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between hover:border-foreground/30 transition-colors">
    <div className="flex items-center justify-between mb-4">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        {label}
      </span>
      <div className={cn("p-2 rounded-lg bg-background", iconColor)}>
        {icon}
      </div>
      </div>
      <div>
        <h3 className="text-3xl font-black text-foreground tracking-tight">{value}</h3>
        <p className={cn('text-[11px] mt-1 font-semibold', trend ? 'text-emerald-400' : 'text-muted-foreground')}>{sub}</p>
      </div>
    </div>
  );
}

//  Party bar
function PartyBar({ name, count, avgScore, max }: { name: string; count: number; avgScore: number; max: number }) {
  const { t } = useLanguage();
  const pct = Math.round((count / max) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-foreground truncate max-w-40">{name}</span>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-muted-foreground">{count} {t.mpsSuffix}</span>
          <span className="font-bold text-indigo-400">{avgScore} {t.avgSuffix}</span>
        </div>
      </div>
      <div className="h-1.5 bg-black rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-linear-to-r from-indigo-600 to-indigo-400 transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// Top MP 
function TopMpCard({ mp, rank }: { mp: MP; rank: number }) {
  const { t } = useLanguage();
  const medals = ['🥇', '🥈', '🥉'];
  return (
    <Link href={`/mps/${mp.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-border hover:border-primary/40 hover:bg-card transition-all group">
      <span className="text-lg shrink-0">{medals[rank] ?? `#${rank + 1}`}</span>
      <img src={mp.image_url} alt={mp.name} className="w-8 h-8 rounded-full object-cover border border-border shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-foreground truncate group-hover:text-indigo-400 transition-colors">{mp.name}</p>
        <p className="text-[10px] text-muted-foreground truncate">{mp.constituency} · {mp.state}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-black text-indigo-400">{mp.overall_score}</p>
        <p className="text-[9px] text-muted-foreground">{t.pts}</p>
      </div>
    </Link>
  );
}

//Battle
function BattleBar({ label, aVal, bVal, aNum, bNum }: {
  label: string; aVal: string; bVal: string; aNum: number; bNum: number;
}) {
  const max = Math.max(aNum, bNum, 1);
  const pctA = (aNum / max) * 100;
  const pctB = (bNum / max) * 100;
  const winnerA = aNum >= bNum;
  return (
    <div className="grid grid-cols-[56px_1fr_120px_1fr_56px] items-center gap-2">
      <span className={cn('text-xs font-black text-right', winnerA ? 'text-blue-400' : 'text-muted-foreground')}>{aVal}</span>
      <div className="h-1.5 bg-black rounded-full overflow-hidden flex justify-end">
        <div className="h-full rounded-full bg-blue-500 transition-all duration-700" style={{ width: `${pctA}%` }} />
      </div>
      <span className="text-[9px] text-muted-foreground font-semibold text-center uppercase tracking-wide">{label}</span>
      <div className="h-1.5 bg-black rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-rose-500 transition-all duration-700" style={{ width: `${pctB}%` }} />
      </div>
      <span className={cn('text-xs font-black', !winnerA ? 'text-rose-400' : 'text-muted-foreground')}>{bVal}</span>
    </div>
  );
}

// ── Performance donut ─────────────────────────────────────────────────────────
function PerfDonut({ total }: { total: number }) {
  const { t } = useLanguage();
  const segments = [
    { label: t.exc80100, pct: 18, color: '#22c55e' },
    { label: t.good6080, pct: 42, color: '#3b82f6' },
    { label: t.avg4060, pct: 28, color: '#f59e0b' },
    { label: t.needsImprovement, pct: 12, color: '#ef4444' },
  ];
  const r = 52, cx = 64, cy = 64, stroke = 18;
  const circumference = 2 * Math.PI * r;
  let cumulative = 0;
  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0">
        <svg width={128} height={128}>
          {segments.map((seg, i) => {
            const offset = circumference * (1 - cumulative / 100);
            const dash = circumference * (seg.pct / 100);
            cumulative += seg.pct;
            return (
              <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                stroke={seg.color} strokeWidth={stroke}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={offset}
                transform={`rotate(-90 ${cx} ${cy})`} />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-foreground">{total}</span>
          <span className="text-[8px] text-muted-foreground font-bold">{t.totalMps}</span>
        </div>
      </div>
      <div className="space-y-2">
        {segments.map(s => (
          <div key={s.label} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: s.color }} />
            <span className="text-[10px] text-muted-foreground flex-1">{s.label}</span>
            <span className="text-[10px] font-bold text-foreground">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { t } = useLanguage();
  const [insights, setInsights] = useState<AggregatedInsights | null>(null);
  const [topMps, setTopMps] = useState<MP[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { resolvedTheme } = useTheme();
const [selectedState, setSelectedState] = useState<string | null>(null);

const handleStateClick = (state: string) => {
  if (!state) {
    setSelectedState(null);
    return;
  }
  setSelectedState(state);
  setTimeout(() => {
    router.push(`/mps?region=${encodeURIComponent(state)}`);
  }, 600);
};
  
 
  
  useEffect(() => {
    async function load() {
      try {
        const [ins, mps] = await Promise.all([
          db.getAggregatedInsights(),
          db.getMps({ sortBy: 'overall_score', sortOrder: 'desc' }),
        ]);
        setInsights(ins);
        setTopMps(mps.filter(m => !m.is_minister).slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);


  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-125">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-600/20 border-t-indigo-500 animate-spin" />
        <span className="mt-3 text-xs text-muted-foreground font-medium">{t.loadingSession}</span>
      </div>
    );
  }

  const topParties = [...(insights?.partyStats ?? [])].sort((a, b) => b.count - a.count).slice(0, 6);
  const maxPartyCount = topParties[0]?.count ?? 1;
  

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden border border-border bg-card p-8 sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_70%_50%,rgba(99,102,241,0.08),transparent)]" />
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
              <Activity className="h-3.5 w-3.5" />
              <span>{t.session18th}</span>
            </div>
           <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-tight">
               LokLens. <span className="text-emerald-400"></span>
           </h1>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              Explore quantitative assessments of legislative activity, attendance, debates, and bill sponsorships across all 544 Members of the 18th Lok Sabha.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/mps" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors">
                {t.exploreDir} <ChevronRight className="h-4 w-4" />
              </Link>
              <Link href="/compare" className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card hover:border-zinc-600 text-foreground text-sm font-bold transition-colors">
                {t.compare}
              </Link>
             <Link href="/dashboard" className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-bold transition-colors">
                Open Dashboard
              </Link>
            </div>
      </div>
<div className="flex-1 flex justify-center items-center">
  <img
    src="/map.png"
    alt="Map of India"
    className="w-[600px] lg:w-[700px] h-auto object-contain opacity-90"
  />
</div>
        </div>
      </div>
    
           
      {/* ── EXPLORE DASHBOARD CTA ───────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden border border-border bg-card">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.12),transparent_60%)]" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 px-8 sm:px-10 py-12">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-5">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-indigo-400">
                Interactive Dashboard
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground leading-tight">
              Explore India's Parliamentary Landscape
            </h2>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Dive into the interactive dashboard to explore MPs state-wise, analyze attendance, questions, debates, bills, and discover parliamentary insights across all 544 Members of Parliament.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <div className="px-4 py-2 rounded-xl bg-background border border-border text-sm text-foreground">28 States</div>
              <div className="px-4 py-2 rounded-xl bg-background border border-border text-sm text-foreground">8 Union Territories</div>
              <div className="px-4 py-2 rounded-xl bg-background border border-border text-sm text-foreground">544 MPs</div>
              <div className="px-4 py-2 rounded-xl bg-background border border-border text-sm text-foreground">Live Parliamentary Data</div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 shrink-0">
            <div className="w-72 h-44 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-3">🗺️</div>
                <p className="text-indigo-400 font-bold text-sm">Interactive India Map</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#4f46e5,#6366f1)', boxShadow: '0 0 35px rgba(99,102,241,.45)' }}
            >
              Open Dashboard
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/*  KPI CARDS  */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={<Users className="h-4 w-4" />} label={t.totalMps} value={topMps.length > 0 ? '544' : '—'} sub={t.lokSabha18th} iconColor="text-indigo-400" />
        <KpiCard icon={<Clock className="h-4 w-4" />} label={t.avgAttendance} value={insights ? `${insights.avgAttendance}%` : '—'} sub={t.excDemocracy} iconColor="text-emerald-400" trend="up" />
        <KpiCard icon={<MessageSquare className="h-4 w-4" />} label={t.totalQuestions} value={insights?.totalQuestions.toLocaleString() ?? '—'} sub={t.oralWritten} iconColor="text-violet-400" />
        <KpiCard icon={<FileText className="h-4 w-4" />} label={t.billsSponsored} value={insights?.totalBills ?? '—'} sub={t.privateBills} iconColor="text-amber-400" />
      </div>


         


          
          
          

        

         
      

      {/*  TOP PERFORMERS  */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top MPs */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
              <h2 className="text-sm font-black text-foreground">{t.topPerformersThisWeek}</h2>
            </div>
            <Link href="/rankings" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded border border-indigo-500/20 transition-colors">
              View All
            </Link>
          </div>
          {/* Table header */}
          <div className="grid grid-cols-[32px_1fr_60px_48px] gap-2 px-1 text-[9px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border pb-2">
            <span>{t.rank}</span><span>{t.mpName}</span><span>{t.party}</span><span className="text-right">{t.score}</span>
          </div>
          <div className="space-y-1">
            {topMps.map((mp, i) => {
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <Link key={mp.id} href={`/mps/${mp.id}`} className="grid grid-cols-[32px_1fr_60px_48px] gap-2 items-center px-1 py-2 rounded-lg bg-card transition-colors group">
                  <span className="text-sm">{medals[i] ?? `${i + 1}`}</span>
                  <span className="text-xs font-bold text-foreground truncate group-hover:text-indigo-400 transition-colors">{mp.name}</span>
                  <span className="text-[9px] text-muted-foreground truncate">{mp.party}</span>
                  <span className="text-xs font-black text-emerald-400 text-right">{mp.overall_score}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Performance party bars */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-indigo-400" />
            <h2 className="text-sm font-black text-foreground">{t.perfDistribution}</h2>
          </div>
          <PerfDonut total={544} />
          <div className="border-t border-border pt-4 space-y-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t.partyRep}</p>
            {topParties.slice(0, 4).map(p => (
              <PartyBar key={p.name} name={p.name} count={p.count} avgScore={p.avgScore} max={maxPartyCount} />
            ))}
          </div>
        </div>
      </div>

      {/*  QUICK NAV  */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { href: '/mps', icon: <Clock className="h-5 w-5" />, label: 'Attendance Tracker', desc: 'Track daily attendance in Parliament', color: 'text-emerald-400', border: 'hover:border-emerald-500/30' },
          { href: '/mps', icon: <MessageSquare className="h-5 w-5" />, label: 'Questions Analysis', desc: 'Explore questions asked by MPs', color: 'text-violet-400', border: 'hover:border-violet-500/30' },
          { href: '/arena', icon: <Trophy className="h-5 w-5" />, label: 'Debate Insights', desc: 'See who speaks and what matters', color: 'text-amber-400', border: 'hover:border-amber-500/30' },
          { href: '/mps', icon: <Users className="h-5 w-5" />, label: 'Constituency Impact', desc: 'Track development work & MPLADS', color: 'text-sky-400', border: 'hover:border-sky-500/30' },
        ].map(card => (
          <Link key={card.label} href={card.href} className={cn('flex flex-col gap-3 p-4 rounded-xl border border-border bg-card transition-all hover:bg-card/40', card.border)}>
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center bg-card border border-border', card.color)}>{card.icon}</div>
            <div>
              <p className="text-xs font-black text-foreground">{card.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{card.desc}</p>
            </div>
            <ArrowRight className={cn('h-3.5 w-3.5 mt-auto', card.color)} />
          </Link>
        ))}
      </div>

      {/* DATA NOTE */}
      <div className="rounded-xl border border-border bg-background p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
  Note: Scores are calculated based on attendance, questions, debates, bills, and constituency performance.{' '}
  <Link href="/methodology" className="text-indigo-400 hover:text-indigo-300 underline">{t.howWeCalcScores}</Link>
</p>
        <p className="text-[10px] text-muted-foreground sm:text-right leading-relaxed shrink-0">
          {t.dataSourceLok}<br />{t.session18th}
        </p>
      </div>

    </div>
  );
}
