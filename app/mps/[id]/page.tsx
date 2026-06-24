'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  MapPin, 
  Mail, 
  Globe, 
  Calendar, 
  Clock, 
  FileText, 
  MessageSquare, 
  MessageCircle,
  Award,
  Sparkles,
  TrendingUp,
  Search,
  ExternalLink
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { db, MP, MPPerformanceHistory, MPTopic, MPBill, MPQuestion, MPDebate } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function MpDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [mp, setMp] = useState<MP | null>(null);
  const [history, setHistory] = useState<MPPerformanceHistory[]>([]);
  const [topics, setTopics] = useState<MPTopic[]>([]);
  const [bills, setBills] = useState<MPBill[]>([]);
  const [questions, setQuestions] = useState<MPQuestion[]>([]);
  const [debates, setDebates] = useState<MPDebate[]>([]);

  const [activeTab, setActiveTab] = useState<'bills' | 'questions' | 'debates'>('bills');
  const [tabSearch, setTabSearch] = useState('');

  useEffect(() => {
    async function loadMpData() {
      setLoading(true);
      try {
        const mpData = await db.getMpById(id);
        if (!mpData) {
          router.push('/mps');
          return;
        }
        setMp(mpData);

        const [histData, topicData, billData, qData, dData] = await Promise.all([
          db.getMpHistory(id),
          db.getMpTopics(id),
          db.getMpBills(id),
          db.getMpQuestions(id),
          db.getMpDebates(id)
        ]);

        setHistory(histData);
        setTopics(topicData);
        setBills(billData);
        setQuestions(qData);
        setDebates(dData);
      } catch (err) {
        console.error('Error loading MP details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMpData();
  }, [id, router]);

  const getPartyBg = (party: string) => {
    switch (party) {
      case 'BJP': return 'bg-orange-500/10 border-orange-500/20 text-orange-400';
      case 'INC': return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      case 'AAP': return 'bg-sky-500/10 border-sky-500/20 text-sky-400';
      case 'TMC': return 'bg-green-500/10 border-green-500/20 text-green-400';
      case 'SP': return 'bg-red-500/10 border-red-500/20 text-red-400';
      default: return 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400';
    }
  };

  if (loading || !mp) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-125">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-600/20 border-t-indigo-500 animate-spin" />
        <span className="mt-4 text-sm text-zinc-400 font-medium">Assembling Member Dashboard...</span>
      </div>
    );
  }

  const radarData = topics.map(t => ({
    subject: t.topic_name,
    Score: t.score
  }));

  const areaData = history.map(h => ({
    name: h.year.toString(),
    Score: h.overall_score,
    Attendance: h.attendance_rate
  }));

  const filteredBills = bills.filter(b =>
    b.title.toLowerCase().includes(tabSearch.toLowerCase()) ||
    b.description.toLowerCase().includes(tabSearch.toLowerCase())
  );
  const filteredQuestions = questions.filter(q =>
    q.question_text.toLowerCase().includes(tabSearch.toLowerCase()) ||
    (q.response_text?.toLowerCase() ?? '').includes(tabSearch.toLowerCase())
  );
  const filteredDebates = debates.filter(d =>
    d.title.toLowerCase().includes(tabSearch.toLowerCase()) ||
    (d.speech_snippet?.toLowerCase() ?? '').includes(tabSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      {/* Back Button */}
      <Link
        href="/mps"
        className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-indigo-400 text-xs font-semibold transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to MP Directory</span>
      </Link>

      {/* MP Profile Header */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-md">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-60 h-60 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile Photo */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-indigo-500/20 shrink-0 shadow-xl">
            <img src={mp.image_url} alt={mp.name} className="w-full h-full object-cover" />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 text-center md:text-left space-y-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">{mp.name}</h1>
                <span className={cn("text-[9px] px-2 py-0.5 rounded border font-semibold uppercase mt-0.5", getPartyBg(mp.party))}>
                  {mp.party}
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded border font-semibold uppercase mt-0.5 bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                  Active
                </span>
                {mp.is_minister && (
                  <span className="text-[9px] px-2 py-0.5 rounded border font-semibold uppercase mt-0.5 bg-amber-500/10 border-amber-500/20 text-amber-400">
                    Minister
                  </span>
                )}
              </div>
              <p className="text-zinc-400 text-sm flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                  {mp.constituency}, {mp.state}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                  Since: {mp.start_of_term ?? '2024'}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="flex items-center gap-1">
                  {mp.term ?? 'First Term'}
                </span>
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-zinc-500">
              {mp.prs_url && (
                <a
                  href={mp.prs_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>PRS India Profile</span>
                </a>
              )}
              {mp.gender && (
                <span className="flex items-center gap-1.5">
                  <span className="text-zinc-600">Gender:</span>
                  <span>{mp.gender}</span>
                </span>
              )}
              {mp.education && (
                <span className="flex items-center gap-1.5">
                  <span className="text-zinc-600">Education:</span>
                  <span>{mp.education}</span>
                </span>
              )}
              {mp.age && (
                <span className="flex items-center gap-1.5">
                  <span className="text-zinc-600">Age:</span>
                  <span>{mp.age}</span>
                </span>
              )}
            </div>

            {/* Top Topics */}
            {mp.top_topics && mp.top_topics.length > 0 && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                {mp.top_topics.map(topic => (
                  <span key={topic} className="text-[9px] px-2 py-0.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 font-semibold">
                    {topic}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glow-card bg-zinc-900/30 border border-zinc-900 p-5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Overall Score</span>
            <Award className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-zinc-100">{mp.overall_score}</h3>
            <p className="text-[10px] text-indigo-400 mt-1">Based on indexed activity</p>
          </div>
        </div>

        <div className="glow-card bg-zinc-900/30 border border-zinc-900 p-5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Attendance</span>
            <Clock className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-zinc-100">{mp.attendance_rate}%</h3>
            <p className="text-[10px] text-emerald-400 mt-1">Parliament sessions</p>
          </div>
        </div>

        <div className="glow-card bg-zinc-900/30 border border-zinc-900 p-5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Questions</span>
            <MessageSquare className="h-4 w-4 text-violet-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-zinc-100">{mp.questions_count}</h3>
            <p className="text-[10px] text-zinc-500 mt-1">Asked in Lok Sabha</p>
          </div>
        </div>

        <div className="glow-card bg-zinc-900/30 border border-zinc-900 p-5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Debates</span>
            <MessageCircle className="h-4 w-4 text-pink-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-zinc-100">{mp.debates_count}</h3>
            <p className="text-[10px] text-zinc-500 mt-1">Debate participations</p>
          </div>
        </div>

        <div className="glow-card bg-zinc-900/30 border border-zinc-900 p-5 rounded-xl flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Bills Sponsored</span>
            <FileText className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-zinc-100">{mp.bills_sponsored}</h3>
            <p className="text-[10px] text-amber-400 mt-1">Private member bills</p>
          </div>
        </div>
      </div>

      {/* AI Summary & Topic Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-zinc-900/20 border border-zinc-900 rounded-xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none" />
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <h2 className="text-lg font-bold text-zinc-200">MP Profile Summary</h2>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed font-normal">
              {mp.ai_summary}
            </p>
          </div>
          <div className="mt-6 border-t border-zinc-900/80 pt-4 flex items-center justify-between text-[10px] text-zinc-500">
            <span>Source: PRS Legislative Research</span>
            <span>18th Lok Sabha</span>
          </div>
        </div>
{/* activity history charts */}
        <div className="lg:col-span-2 bg-zinc-900/20 border border-zinc-900 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-200">Legislative Focus Area</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Questions by ministry group</p>
          </div>
          <div className="h-64 mt-6 w-full flex items-center justify-center">
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#1f2937" />
                  <PolarAngleAxis dataKey="subject" stroke="#888888" fontSize={9} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#374151" fontSize={8} />
                  <Radar
                    name={mp.name}
                    dataKey="Score"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.25}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#121214',
                      borderColor: '#27272a',
                      borderRadius: '8px',
                      color: '#f4f4f5'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-zinc-500">No focus metrics available</span>
            )}
          </div>
        </div>
      </div>

     {/* Legislative Activity Breakdown */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <div className="bg-zinc-900/20 border border-zinc-900 rounded-xl p-6">
    <h2 className="text-lg font-bold text-zinc-200 mb-4">
      Legislative Focus Areas
    </h2>

    <div className="space-y-4">
      {topics.map((topic) => (
        <div key={topic.id}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-zinc-300">{topic.topic_name}</span>
            <span className="text-indigo-400">{topic.score}%</span>
          </div>

          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-indigo-500"
              style={{ width: `${topic.score}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>

  <div className="bg-zinc-900/20 border border-zinc-900 rounded-xl p-6">
    <h2 className="text-lg font-bold text-zinc-200 mb-4">
      Parliamentary Activity Snapshot
    </h2>

    <div className="space-y-4">
      <div className="flex justify-between">
        <span className="text-zinc-400">Attendance</span>
        <span className="font-semibold text-emerald-400">
          {mp.attendance_rate}%
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-zinc-400">Questions Asked</span>
        <span className="font-semibold text-violet-400">
          {mp.questions_count}
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-zinc-400">Debates Participated</span>
        <span className="font-semibold text-pink-400">
          {mp.debates_count}
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-zinc-400">Bills Sponsored</span>
        <span className="font-semibold text-amber-400">
          {mp.bills_sponsored}
        </span>
      </div>

      <div className="border-t border-zinc-800 pt-4 mt-4">
        <div className="flex justify-between text-lg">
          <span className="font-semibold text-zinc-200">
            Overall Score
          </span>
          <span className="font-bold text-indigo-400">
            {mp.overall_score}/100
          </span>
        </div>
      </div>
    </div>
  </div>
</div>
   
    </div>
  );
}