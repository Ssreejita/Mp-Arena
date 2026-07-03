'use client';
import React, { useState, useEffect } from 'react';
import { useTheme } from "next-themes";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import IndiaMap from '@/components/IndiaMap';
import { toSlug } from "@/lib/stateSlug";
import {
  TrendingUp, Award, Clock, MessageSquare, FileText,
  ArrowRight, Users, BarChart2, ChevronRight, Sparkles,
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
    <div className="bg-zinc-900/30 border border-border rounded-xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
        <div className={cn('p-2 rounded-lg bg-zinc-900', iconColor)}>{icon}</div>
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
  const pct = Math.round((count / max) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-foreground truncate max-w-40">{name}</span>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-muted-foreground">{count} MPs</span>
          <span className="font-bold text-indigo-400">{avgScore} avg</span>
        </div>
      </div>
      <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-linear-to-r from-indigo-600 to-indigo-400 transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// Top MP 
function TopMpCard({ mp, rank }: { mp: MP; rank: number }) {
  const medals = ['🥇', '🥈', '🥉'];
  return (
    <Link href={`/mps/${mp.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-border hover:border-zinc-700 hover:bg-zinc-900/40 transition-all group">
      <span className="text-lg shrink-0">{medals[rank] ?? `#${rank + 1}`}</span>
      <img src={mp.image_url} alt={mp.name} className="w-8 h-8 rounded-full object-cover border border-border shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-foreground truncate group-hover:text-indigo-400 transition-colors">{mp.name}</p>
        <p className="text-[10px] text-muted-foreground truncate">{mp.constituency} · {mp.state}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-black text-indigo-400">{mp.overall_score}</p>
        <p className="text-[9px] text-muted-foreground">pts</p>
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
      <span className={cn('text-xs font-black text-right', winnerA ? 'text-blue-400' : 'text-zinc-400')}>{aVal}</span>
      <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden flex justify-end">
        <div className="h-full rounded-full bg-blue-500 transition-all duration-700" style={{ width: `${pctA}%` }} />
      </div>
      <span className="text-[9px] text-muted-foreground font-semibold text-center uppercase tracking-wide">{label}</span>
      <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-rose-500 transition-all duration-700" style={{ width: `${pctB}%` }} />
      </div>
      <span className={cn('text-xs font-black', !winnerA ? 'text-rose-400' : 'text-zinc-400')}>{bVal}</span>
    </div>
  );
}

// ── Performance donut ─────────────────────────────────────────────────────────
function PerfDonut({ total }: { total: number }) {
  const segments = [
    { label: 'Excellent (80–100)', pct: 18, color: '#22c55e' },
    { label: 'Good (60–80)', pct: 42, color: '#3b82f6' },
    { label: 'Average (40–60)', pct: 28, color: '#f59e0b' },
    { label: 'Needs Improvement', pct: 12, color: '#ef4444' },
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
          <span className="text-[8px] text-muted-foreground font-bold">Total MPs</span>
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
        <span className="mt-3 text-xs text-muted-foreground font-medium">Loading Parliament Session Data...</span>
      </div>
    );
  }

  const topParties = [...(insights?.partyStats ?? [])].sort((a, b) => b.count - a.count).slice(0, 6);
  const maxPartyCount = topParties[0]?.count ?? 1;
  const mpA = topMps[0];
  const mpB = topMps[1];

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
              <span>18th Lok Sabha · Data as of 2024</span>
            </div>
           <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-tight">
               LokLens. <span className="text-emerald-400"></span>
           </h1>
            <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
              Explore quantitative assessments of legislative activity, attendance, debates, and bill sponsorships across all 544 Members of the 18th Lok Sabha.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/mps" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors">
                Explore Directory <ChevronRight className="h-4 w-4" />
              </Link>
              <Link href="/compare" className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-zinc-900/60 hover:border-zinc-600 text-foreground text-sm font-bold transition-colors">
                Compare MPs
              </Link>
              <Link href="/arena" className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-bold transition-colors">
                ⚔️ MP Arena
              </Link>
            </div>
      </div>
 <div className="shrink-0 flex flex-col items-center gap-2">
 <img
  src="/Emblem.webp.webp"
  alt="Emblem of India"
  className="w-48 h-48 object-contain opacity-90"
  style={{
    filter:
      resolvedTheme === "dark"
        ? "brightness(0) invert(1)"
        : "brightness(0) opacity(0.18)",
  }}
/>
</div>
        </div>
      </div>

      {/*  KPI CARDS  */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={<Users className="h-4 w-4" />} label="Total MPs" value={topMps.length > 0 ? '544' : '—'} sub="18th Lok Sabha" iconColor="text-indigo-400" />
        <KpiCard icon={<Clock className="h-4 w-4" />} label="Avg Voting Attendance" value={insights ? `${insights.avgAttendance}%` : '—'} sub="Excellent democracy engagement" iconColor="text-emerald-400" trend="up" />
        <KpiCard icon={<MessageSquare className="h-4 w-4" />} label="Total Questions Asked" value={insights?.totalQuestions.toLocaleString() ?? '—'} sub="Oral & written submissions" iconColor="text-violet-400" />
        <KpiCard icon={<FileText className="h-4 w-4" />} label="Bills Sponsored" value={insights?.totalBills ?? '—'} sub="Private member bills filed" iconColor="text-amber-400" />
      </div>

      {/*  BATTLE ARENA */}
      {mpA && mpB && (
        <div className="rounded-xl border border-border bg-linear-to-br from-zinc-950 via-zinc-900/40 to-zinc-950 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Swords className="h-5 w-5 text-indigo-400" />
              <div>
                <p className="text-sm font-black text-foreground tracking-wide">MP BATTLE ARENA</p>
                <p className="text-[10px] text-muted-foreground">See how top performers stack up against each other</p>
              </div>
            </div>
            <Link href="/compare" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-zinc-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-colors">
              Full Battle <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* VS */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 px-6 py-5">
            {/* MP A */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <img src={mpA.image_url} alt={mpA.name} className="w-12 h-12 rounded-full border-2 border-blue-500/40 object-cover shrink-0" />
                <div>
                  <p className="text-sm font-black text-foreground">{mpA.name}</p>
                  <p className="text-[10px] text-indigo-400 font-bold">{mpA.party}</p>
                  <p className="text-[9px] text-muted-foreground">{mpA.state}</p>
                </div>
              </div>
              <div className="text-3xl font-black text-blue-400">{mpA.overall_score} <span className="text-sm text-muted-foreground font-normal">/100</span></div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">MP Score</p>
            </div>

            {/* VS badge */}
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0" style={{ background: 'linear-gradient(135deg,#4f46e5,#dc2626)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
              VS
            </div>

            {/* MP B */}
            <div className="space-y-2 items-end flex flex-col text-right">
              <div className="flex items-center gap-3 flex-row-reverse">
                <img src={mpB.image_url} alt={mpB.name} className="w-12 h-12 rounded-full border-2 border-rose-500/40 object-cover shrink-0" />
                <div>
                  <p className="text-sm font-black text-foreground">{mpB.name}</p>
                  <p className="text-[10px] text-rose-400 font-bold">{mpB.party}</p>
                  <p className="text-[9px] text-muted-foreground">{mpB.state}</p>
                </div>
              </div>
              <div className="text-3xl font-black text-rose-400">{mpB.overall_score} <span className="text-sm text-muted-foreground font-normal">/100</span></div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">MP Score</p>
            </div>
          </div>

          {/* Stat bars */}
          <div className="px-6 pb-5 space-y-3">
            <BattleBar label="Attendance" aVal={`${mpA.attendance_rate}%`} bVal={`${mpB.attendance_rate}%`} aNum={mpA.attendance_rate} bNum={mpB.attendance_rate} />
            <BattleBar label="Questions" aVal={`${mpA.questions_count}`} bVal={`${mpB.questions_count}`} aNum={mpA.questions_count} bNum={mpB.questions_count} />
            <BattleBar label="Debates" aVal={`${mpA.debates_count}`} bVal={`${mpB.debates_count}`} aNum={mpA.debates_count} bNum={mpB.debates_count} />
            <BattleBar label="Bills" aVal={`${mpA.bills_sponsored}`} bVal={`${mpB.bills_sponsored}`} aNum={mpA.bills_sponsored} bNum={mpB.bills_sponsored} />
          </div>

          {/* MP of the Week */}
          <div className="mx-4 mb-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center shrink-0">
              <Trophy className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">MP of the Week</p>
              <p className="text-sm font-black text-foreground">{mpA.name}</p>
            </div>
            <p className="ml-auto text-xs text-muted-foreground italic">Top performer this week 🏆</p>
          </div>
        </div>
      )}

      {/*  TOP PERFORMERS  */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top MPs */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
              <h2 className="text-sm font-black text-foreground">Top Performers This Week</h2>
            </div>
            <Link href="/rankings" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded border border-indigo-500/20 transition-colors">
              View All
            </Link>
          </div>
          {/* Table header */}
          <div className="grid grid-cols-[32px_1fr_60px_48px] gap-2 px-1 text-[9px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border pb-2">
            <span>Rank</span><span>MP Name</span><span>Party</span><span className="text-right">Score</span>
          </div>
          <div className="space-y-1">
            {topMps.map((mp, i) => {
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <Link key={mp.id} href={`/mps/${mp.id}`} className="grid grid-cols-[32px_1fr_60px_48px] gap-2 items-center px-1 py-2 rounded-lg hover:bg-zinc-900/60 transition-colors group">
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
            <h2 className="text-sm font-black text-foreground">Performance Distribution</h2>
          </div>
          <PerfDonut total={544} />
          <div className="border-t border-border pt-4 space-y-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Party Representation</p>
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
          <Link key={card.label} href={card.href} className={cn('flex flex-col gap-3 p-4 rounded-xl border border-border bg-card transition-all hover:bg-zinc-900/40', card.border)}>
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-900 border border-border', card.color)}>{card.icon}</div>
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
  <Link href="/methodology" className="text-indigo-400 hover:text-indigo-300 underline">How we calculate scores →</Link>
</p>
        <p className="text-[10px] text-muted-foreground sm:text-right leading-relaxed shrink-0">
          Data Source: PRS India | Lok Sabha<br />18th Parliament Session · 2024–Present
        </p>
      </div>

    </div>
  );
}
