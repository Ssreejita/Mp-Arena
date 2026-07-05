'use client';

import { use, useEffect, useMemo, useState } from 'react';

import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  Trophy,
  Clock,
  MessageSquare,
  MessageCircle,
  FileText,
  Search,
} from 'lucide-react';

import { db, MP } from '@/lib/supabase';

export default function StatePage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state } = use(params);

  const decodedState = decodeURIComponent(state)
  .replace(/-/g, ' ')
  .replace(/\b\w/g, c => c.toUpperCase());

  const [mps, setMps] = useState<MP[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const all = await db.getMps();
         console.log('decodedState:', decodedState);
    console.log('unique mp.state values:', [...new Set(all.map(mp => mp.state))].sort());


       const filtered = all.filter(
  (mp) =>
    mp.state &&
    (mp.state.toLowerCase().replace(/\s+/g, '-') === decodedState.toLowerCase() ||
     mp.state.toLowerCase() === decodedState.toLowerCase().replace(/-/g, ' '))
);

        setMps(filtered);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [decodedState]);

  const filteredMps = useMemo(() => {
    return mps.filter(
      (mp) =>
        mp.name.toLowerCase().includes(search.toLowerCase()) ||
        mp.party.toLowerCase().includes(search.toLowerCase()) ||
        mp.constituency.toLowerCase().includes(search.toLowerCase())
    );
  }, [mps, search]);

  const topMp = [...mps].sort(
    (a, b) => b.overall_score - a.overall_score
  )[0];

  const avgAttendance =
    mps.length === 0
      ? 0
      : (
          mps.reduce((s, m) => s + m.attendance_rate, 0) /
          mps.length
        ).toFixed(1);

  const totalQuestions = mps.reduce(
    (s, m) => s + m.questions_count,
    0
  );

  const totalDebates = mps.reduce(
    (s, m) => s + m.debates_count,
    0
  );

  const totalBills = mps.reduce(
    (s, m) => s + m.bills_sponsored,
    0
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm hover:text-indigo-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <div className="rounded-2xl border bg-card p-8">

        <h1 className="text-4xl font-black">
          {decodedState}
        </h1>

        <p className="text-muted-foreground mt-2">
          Members of Parliament from {decodedState}
        </p>

      </div>

      <div className="grid md:grid-cols-5 gap-4">

        <StatCard
          icon={<Users className="h-5 w-5" />}
          title="MPs"
          value={mps.length}
        />

        <StatCard
          icon={<Clock className="h-5 w-5" />}
          title="Attendance"
          value={`${avgAttendance}%`}
        />

        <StatCard
          icon={<MessageSquare className="h-5 w-5" />}
          title="Questions"
          value={totalQuestions}
        />

        <StatCard
          icon={<MessageCircle className="h-5 w-5" />}
          title="Debates"
          value={totalDebates}
        />

        <StatCard
          icon={<FileText className="h-5 w-5" />}
          title="Bills"
          value={totalBills}
        />

      </div>

      {topMp && (
        <div className="rounded-2xl border bg-card p-6">

          <div className="flex items-center gap-6">

            <img
              src={topMp.image_url}
              className="w-24 h-24 rounded-full object-cover"
              alt={topMp.name}
            />

            <div>

              <div className="flex items-center gap-2">
                <Trophy className="text-yellow-500 h-5 w-5" />
                <span className="text-xs uppercase">
                  Top Performer
                </span>
              </div>

              <h2 className="text-2xl font-black">
                {topMp.name}
              </h2>

              <p className="text-muted-foreground">
                {topMp.party}
              </p>

              <div className="mt-2 font-bold">
                Score: {topMp.overall_score}
              </div>

            </div>

          </div>

        </div>
      )}

      <div className="relative">

        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>

        <input
          placeholder="Search MPs..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          className="w-full rounded-xl border bg-background py-3 pl-10 pr-4"
        />

      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

        {filteredMps.map((mp)=>(
          <Link
            href={`/mps/${mp.id}`}
            key={mp.id}
            className="rounded-2xl border bg-card p-5 hover:shadow-lg transition"
          >

            <div className="flex gap-4">

              <img
                src={mp.image_url}
                className="w-20 h-20 rounded-full object-cover"
                alt={mp.name}
              />

              <div>

                <h3 className="font-bold">
                  {mp.name}
                </h3>

                <p className="text-sm text-muted-foreground">
                  {mp.party}
                </p>

                <p className="text-sm text-muted-foreground">
                  {mp.constituency}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2">
  <div className="text-xs text-muted-foreground">
    Score: <span className="font-black text-indigo-400">{mp.overall_score}</span>
  </div>
  <div className="text-xs text-muted-foreground">
    Attendance: <span className="font-black text-emerald-400">{mp.attendance_rate}%</span>
  </div>
  <div className="text-xs text-muted-foreground">
    Questions: <span className="font-black text-violet-400">{mp.questions_count}</span>
  </div>
  <div className="text-xs text-muted-foreground">
    Bills: <span className="font-black text-amber-400">{mp.bills_sponsored}</span>
  </div>
</div>

              </div>

            </div>

          </Link>
        ))}

      </div>

    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
}:{
  icon:React.ReactNode;
  title:string;
  value:string|number;
}){

  return(

    <div className="rounded-xl border bg-card p-5">

      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {title}
      </div>

      <div className="mt-3 text-3xl font-black">
        {value}
      </div>

    </div>

  );

}