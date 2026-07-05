'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import IndiaMap from '@/components/IndiaMap';
import { LogOut, MapPin, Users, Clock, MessageSquare, FileText, ChevronRight } from 'lucide-react';
import { db, MP } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface CitizenData {
  name: string;
  age: string;
  state: string;
  gender: string;
  constituency: string;
  loggedIn: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [citizen, setCitizen] = useState<CitizenData | null>(null);
  const [stateMps, setStateMps] = useState<MP[]>([]);
  const [loading, setLoading] = useState(true);
 const [selectedState, setSelectedState] = useState<string | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('loklens_citizen');
    if (!stored) {
      router.push('/login');
      return;
    }
    const data = JSON.parse(stored) as CitizenData;
    if (!data.loggedIn) {
      router.push('/login');
      return;
    }
    setCitizen(data);
    setSelectedState(data.state);
  }, [router]);

  useEffect(() => {
    if (!selectedState) return;
    setLoading(true);
    db.getMps().then(all => {
      console.log('selectedState:', selectedState);
   console.log('sample mp.state values:', [...new Set(all.map(mp => mp.state))]);
      const filtered = all.filter(mp =>
       mp.state && mp.state.toLowerCase() === selectedState.toLowerCase()
      );
      setStateMps(filtered);
      setLoading(false);
    });
  }, [selectedState]);

  const handleLogout = () => {
    localStorage.removeItem('loklens_citizen');
    router.push('/login');
  };

  const avgAttendance = stateMps.length
    ? (stateMps.reduce((s, m) => s + m.attendance_rate, 0) / stateMps.length).toFixed(1)
    : '0';

  const totalQuestions = stateMps.reduce((s, m) => s + m.questions_count, 0);
  const totalBills = stateMps.reduce((s, m) => s + m.bills_sponsored, 0);
  const topMp = [...stateMps].sort((a, b) => b.overall_score - a.overall_score)[0];

  // Party breakdown
  const partyMap: Record<string, number> = {};
  stateMps.forEach(mp => {
    partyMap[mp.party] = (partyMap[mp.party] || 0) + 1;
  });
  const parties = Object.entries(partyMap).sort((a, b) => b[1] - a[1]);

  if (!citizen) return null;

  return (
    <div className="min-h-screen bg-background">

      {/* Top nav */}
      <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/Emblem.webp.webp" alt="LokLens" className="w-16 h-16 object-contain mx-auto"
  style={{ filter: 'brightness(0) invert(1)' }}></img>
          <span className="font-black text-lg text-foreground">Lok<span className="text-indigo-500">Lens</span></span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-foreground">{citizen.name}</p>
            <p className="text-[10px] text-muted-foreground">{citizen.state}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-rose-400 hover:border-rose-500/30 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Welcome */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mb-1">Welcome back</p>
          <h1 className="text-2xl font-black text-foreground">
            {citizen.name}, <span className="text-muted-foreground font-normal text-lg">here's your Parliament snapshot</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            Viewing: <span className="text-foreground font-bold ml-1">{selectedState}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — State selector + stats */}
          <div className="lg:col-span-1 space-y-4">

            {/* State selector */}
            {/* India Map */}
<div className="bg-card border border-border rounded-xl p-3 space-y-2">
  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Click your state</p>
  <IndiaMap
    selectedState={selectedState}
    onStateClick={(state) => {
      if (state) setSelectedState(state);
    }}
    className="!border-0 !bg-transparent !p-0"
  />
</div>

            {/* State KPIs */}
            {!loading && (
              <div className="space-y-3">
                {[
                  { icon: <Users className="h-4 w-4 text-indigo-400" />, label: 'Total MPs', value: stateMps.length },
                  { icon: <Clock className="h-4 w-4 text-emerald-400" />, label: 'Avg Attendance', value: `${avgAttendance}%` },
                  { icon: <MessageSquare className="h-4 w-4 text-violet-400" />, label: 'Total Questions', value: totalQuestions },
                  { icon: <FileText className="h-4 w-4 text-amber-400" />, label: 'Bills Sponsored', value: totalBills },
                ].map(stat => (
                  <div key={stat.label} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {stat.icon}
                      <span className="text-xs text-muted-foreground font-bold">{stat.label}</span>
                    </div>
                    <span className="text-lg font-black text-foreground">{stat.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Party breakdown */}
            {!loading && parties.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Party Breakdown</p>
                {parties.slice(0, 5).map(([party, count]) => (
                  <div key={party} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground font-semibold truncate max-w-[160px]">{party}</span>
                      <span className="text-muted-foreground shrink-0">{count} MPs</span>
                    </div>
                    <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                        style={{ width: `${(count / stateMps.length) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right — Top MP + MP list */}
          <div className="lg:col-span-2 space-y-4">

            {/* Top performer */}
            {!loading && topMp && (
              <Link href={`/mps/${topMp.id}`} className="block bg-card border border-indigo-500/20 rounded-xl p-5 hover:border-indigo-500/50 transition-colors">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3">🏆 Top Performer in {selectedState}</p>
                <div className="flex items-center gap-4">
                  <img src={topMp.image_url} alt={topMp.name} className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/30" />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-foreground text-lg">{topMp.name}</p>
                    <p className="text-sm text-muted-foreground">{topMp.party} · {topMp.constituency}</p>
                    <div className="flex gap-4 mt-2">
                      <span className="text-xs text-emerald-400 font-bold">Attendance: {topMp.attendance_rate}%</span>
                      <span className="text-xs text-violet-400 font-bold">Questions: {topMp.questions_count}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-3xl font-black text-indigo-400">{topMp.overall_score}</p>
                    <p className="text-[9px] text-muted-foreground">score</p>
                  </div>
                </div>
              </Link>
            )}

            {/* MP list */}
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 rounded-full border-4 border-indigo-600/20 border-t-indigo-500 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">All MPs from {selectedState}</p>
                  <Link
                    href={`/states/${selectedState?.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
                  >
                    View Full Page →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                  {stateMps.sort((a, b) => b.overall_score - a.overall_score).map(mp => (
                    <Link
                      key={mp.id}
                      href={`/mps/${mp.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border hover:border-indigo-500/30 hover:bg-zinc-900/40 transition-all group"
                    >
                      <img src={mp.image_url} alt={mp.name} className="w-10 h-10 rounded-full object-cover border border-border shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate group-hover:text-indigo-400 transition-colors">{mp.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{mp.party}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{mp.constituency}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-indigo-400">{mp.overall_score}</p>
                        <p className="text-[9px] text-emerald-400">{mp.attendance_rate}%</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Go to full app */}
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-bold transition-colors"
            >
              Explore Full Parliament Dashboard <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
