import ThemeToggle from "@/components/theme-toggle";
"use client";

import Link from "next/link";
import {
  Crown,
  Trophy,
  Flame,
  Swords,
  TrendingUp,
  Shield,
  Star,
  ArrowRight,
} from "lucide-react";

export default function ArenaHomepage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">

      {/* BACKGROUND */}

      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(234,179,8,0.12),transparent_30%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">

        {/* HERO */}

        <div className="relative overflow-hidden rounded-3xl border border-yellow-500/30 bg-gradient-to-br from-zinc-950 via-black to-indigo-950">

          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-indigo-500/10" />

          <div className="p-10 lg:p-14">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/40 bg-yellow-500/10 text-yellow-400 mb-6">
              <Crown size={18} />
              MP OF THE WEEK
            </div>

            <div className="grid lg:grid-cols-2 gap-10 items-center">

              <div>

                <h1 className="text-5xl md:text-7xl font-black leading-tight">
                  Shashi
                  <br />
                  Tharoor
                </h1>

                <p className="text-zinc-400 mt-4 text-lg">
                  Dominating Parliament this week with elite performance.
                </p>

                <div className="flex items-center gap-4 mt-8">

                  <div>
                    <div className="text-7xl font-black bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                      94
                    </div>

                    <div className="text-zinc-400">
                      Overall Score
                    </div>
                  </div>

                  <div className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30">

                    <div className="flex items-center gap-2 text-green-400 font-semibold">
                      <TrendingUp size={18} />
                      +5 Rank
                    </div>

                  </div>

                </div>

              </div>

              {/* PLAYER CARD */}

              <div className="flex justify-center">

                <div className="relative">

                  <div className="absolute -top-5 left-1/2 -translate-x-1/2">

                    <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center shadow-[0_0_40px_rgba(234,179,8,0.7)]">

                      <Crown className="text-black" />

                    </div>

                  </div>

                  <div className="w-[320px] h-[420px] rounded-3xl border-2 border-yellow-500 bg-gradient-to-b from-zinc-900 to-black p-6">

                    <div className="h-full rounded-2xl bg-gradient-to-b from-indigo-500/20 to-transparent flex flex-col items-center justify-center">

                      <div className="w-32 h-32 rounded-full bg-indigo-600 flex items-center justify-center text-5xl font-black">
                        ST
                      </div>

                      <h3 className="mt-6 text-3xl font-bold">
                        Shashi Tharoor
                      </h3>

                      <div className="mt-4 text-yellow-400 text-6xl font-black">
                        94
                      </div>

                      <div className="text-zinc-500">
                        LEVEL 94
                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* STATS */}

            <div className="grid md:grid-cols-4 gap-5 mt-12">

              <StatCard title="Attendance" value="97%" />
              <StatCard title="Questions" value="156" />
              <StatCard title="Debates" value="88" />
              <StatCard title="Bills" value="21" />

            </div>

          </div>

        </div>

        {/* PODIUM */}

        <section className="mt-20">

          <div className="flex items-center gap-3 mb-10">
            <Trophy className="text-yellow-400" />
            <h2 className="text-4xl font-bold">
              Weekly Podium
            </h2>
          </div>

          <div className="flex justify-center items-end gap-8">

            <PodiumCard
              rank={2}
              name="Nitin Gadkari"
              score={91}
              height="h-56"
              medal="🥈"
            />

            <PodiumCard
              rank={1}
              name="Shashi Tharoor"
              score={94}
              height="h-72"
              medal="🥇"
            />

            <PodiumCard
              rank={3}
              name="Supriya Sule"
              score={89}
              height="h-48"
              medal="🥉"
            />

          </div>

        </section>

        {/* ACHIEVEMENTS */}

        <section className="mt-24">

          <h2 className="text-4xl font-bold mb-8">
            MP Achievements
          </h2>

          <div className="grid md:grid-cols-4 gap-5">

            <BadgeCard
              icon={<Flame />}
              title="Debate King"
            />

            <BadgeCard
              icon={<Shield />}
              title="Attendance Titan"
            />

            <BadgeCard
              icon={<Star />}
              title="Question Master"
            />

            <BadgeCard
              icon={<Trophy />}
              title="Bill Architect"
            />

          </div>

        </section>

        {/* CTA */}

        <section className="mt-24">

          <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950 to-black p-10 text-center">

            <Swords
              className="mx-auto text-yellow-400"
              size={60}
            />

            <h2 className="text-5xl font-black mt-6">
              Battle Arena
            </h2>

            <p className="text-zinc-400 mt-4 max-w-2xl mx-auto">
              Compare MPs head-to-head and discover who truly dominates Parliament.
            </p>

            <Link
              href="/compare"
              className="inline-flex items-center gap-3 mt-8 px-8 py-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-yellow-300 text-black font-bold text-lg hover:scale-105 transition"
            >
              Enter Battle Arena
              <ArrowRight />
            </Link>

          </div>

        </section>

      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="text-3xl font-bold">
        {value}
      </div>
      <div className="text-zinc-400 mt-1">
        {title}
      </div>
    </div>
  );
}

function PodiumCard({
  rank,
  name,
  score,
  height,
  medal,
}: any) {
  return (
    <div className="group">

      <div className="text-center text-5xl mb-3">
        {medal}
      </div>

      <div
        className={`${height}
        w-52
        rounded-t-3xl
        bg-gradient-to-b
        from-indigo-600
        to-indigo-950
        border
        border-indigo-400/30
        flex
        flex-col
        justify-center
        items-center
        transition-all
        duration-500
        hover:-translate-y-4
        hover:shadow-[0_0_40px_rgba(99,102,241,0.5)]
      `}
      >
        <h3 className="font-bold text-xl">
          {name}
        </h3>

        <div className="text-yellow-400 text-4xl font-black mt-2">
          {score}
        </div>
      </div>

      <div className="bg-zinc-900 py-3 text-center rounded-b-2xl">
        Rank #{rank}
      </div>
    </div>
  );
}

function BadgeCard({
  icon,
  title,
}: any) {
  return (
    <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-8 hover:border-yellow-500 transition">

      <div className="text-yellow-400">
        {icon}
      </div>

      <h3 className="font-bold text-xl mt-4">
        {title}
      </h3>

    </div>
  );
}