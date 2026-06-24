'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  GitCompare, 
  MapPin, 
  Clock, 
  FileText, 
  MessageSquare, 
  MessageCircle,
  Award,
  ChevronRight,
  ArrowRight,
  X
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Legend, 
  Tooltip 
} from 'recharts';
import { db, MP } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function ComparePage() {
  const [allMps, setAllMps] = useState<MP[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected MPs for comparison (IDs)
  const [selectedIds, setSelectedIds] = useState<string[]>(['mp-1', 'mp-2']); // Defaults to Keir Starmer and Rishi Sunak

  useEffect(() => {
    async function loadMps() {
      try {
        const data = await db.getMps();
        setAllMps(data);
      } catch (err) {
        console.error('Failed to load MPs for comparison:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMps();
  }, []);

  const selectedMps = selectedIds
    .map(id => allMps.find(m => m.id === id))
    .filter(Boolean) as MP[];

  const handleAddMp = (id: string) => {
    if (selectedIds.includes(id)) return;
    if (selectedIds.length >= 3) {
      // Limit to 3 max
      setSelectedIds([selectedIds[0], selectedIds[1], id]);
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleRemoveMp = (id: string) => {
    if (selectedIds.length <= 1) return; // Must keep at least one
    setSelectedIds(selectedIds.filter(x => x !== id));
  };

  const getPartyBg = (party: string) => {
    switch (party) {
      case 'Labour': return 'bg-red-500/10 border-red-500/20 text-red-400';
      case 'Conservative': return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      case 'SNP': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
      case 'Liberal Democrat': return 'bg-orange-500/10 border-orange-500/20 text-orange-400';
      case 'Green': return 'bg-green-500/10 border-green-500/20 text-green-400';
      default: return 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400';
    }
  };

  const getPartyColor = (party: string) => {
    switch (party) {
      case 'Labour': return '#ef4444';
      case 'Conservative': return '#3b82f6';
      case 'SNP': return '#eab308';
      case 'Liberal Democrat': return '#f97316';
      case 'Green': return '#22c55e';
      default: return '#71717a';
    }
  };

  // Compile Chart data comparing overall activities
  // Normalize stats relative to peak values for visually balanced Radar graph:
  // - Score: raw (max 100)
  // - Attendance: raw (max 100)
  // - Questions: (count / 320) * 100
  // - Debates: (count / 200) * 100
  // - Bills: (count / 25) * 100
  const chartData = [
    { subject: 'Overall Score', key: 'overall_score', max: 100, normalize: (v: number) => v },
    { subject: 'Voting Attendance', key: 'attendance_rate', max: 100, normalize: (v: number) => v },
    { subject: 'Questions asked (scaled)', key: 'questions_count', max: 320, normalize: (v: number) => (v / 320) * 100 },
    { subject: 'Debates count (scaled)', key: 'debates_count', max: 200, normalize: (v: number) => (v / 200) * 100 },
    { subject: 'Bills sponsored (scaled)', key: 'bills_sponsored', max: 25, normalize: (v: number) => (v / 25) * 100 },
  ].map(metric => {
    const row: any = { subject: metric.subject };
    selectedMps.forEach(mp => {
      const rawVal = mp[metric.key as keyof MP] as number;
      row[mp.name] = Number(metric.normalize(rawVal).toFixed(1));
    });
    return row;
  });

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-125">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-600/20 border-t-indigo-500 animate-spin" />
        <span className="mt-4 text-sm text-zinc-400 font-medium">Assembling Compare Workspace...</span>
      </div>
    );
  }

  // Available MPs list (not already selected)
  const availableMps = allMps.filter(m => !selectedIds.includes(m.id));

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Compare Members</h1>
        <p className="text-zinc-400 text-sm">
          Select up to three MPs to compare parliamentary metrics, voting records, and focus intensities side-by-side.
        </p>
      </div>

      {/* Selectors Panel */}
      <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-xl space-y-4 backdrop-blur-md">
        <div className="flex items-center gap-2 text-zinc-300 font-semibold text-sm">
          <GitCompare className="h-4 w-4 text-indigo-400" />
          <span>Active Comparison List ({selectedMps.length}/3)</span>
        </div>

        {/* Selected MP Cards in Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {selectedMps.map(mp => (
            <div 
              key={mp.id} 
              className="flex items-center justify-between p-3 bg-zinc-950/60 border border-zinc-850 rounded-lg group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-850 shrink-0">
                  <img src={mp.image_url} alt={mp.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-zinc-300 truncate">{mp.name}</h4>
                  <span className={cn("text-[9px] px-1.5 py-0.2 rounded border font-medium uppercase mt-0.5 inline-block", getPartyBg(mp.party))}>
                    {mp.party}
                  </span>
                </div>
              </div>
              {selectedIds.length > 1 && (
                <button
                  onClick={() => handleRemoveMp(mp.id)}
                  className="p-1 rounded-md text-zinc-500 hover:bg-zinc-900 hover:text-red-400 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}

          {/* Add MP Selector Dropdown if space permits */}
          {selectedIds.length < 3 && (
            <div className="flex items-center justify-center p-2 border border-dashed border-zinc-850 rounded-lg">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddMp(e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className="bg-transparent border-0 text-xs text-zinc-400 focus:outline-none w-full cursor-pointer py-1 px-2"
              >
                <option value="" disabled>+ Add MP to Compare</option>
                {availableMps.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.party})</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Radar Overlay Comparison Chart */}
        <div className="lg:col-span-2 bg-zinc-900/20 border border-zinc-900 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-200">Radar Performance Overlay</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Activities normalized relative to peak recorded values.</p>
          </div>
          <div className="h-72 mt-6 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                <PolarGrid stroke="#1f2937" />
                <PolarAngleAxis dataKey="subject" stroke="#888888" fontSize={9} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#374151" fontSize={8} />
                {selectedMps.map((mp) => (
                  <Radar
                    key={mp.id}
                    name={mp.name}
                    dataKey={mp.name}
                    stroke={getPartyColor(mp.party)}
                    fill={getPartyColor(mp.party)}
                    fillOpacity={0.15}
                  />
                ))}
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#121214', 
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    color: '#f4f4f5'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  align="center" 
                  iconSize={10} 
                  wrapperStyle={{ fontSize: '10px', color: '#a1a1aa', paddingTop: '10px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side by side comparison Sheet table */}
        <div className="lg:col-span-3 bg-zinc-900/20 border border-zinc-900 rounded-xl p-6 overflow-x-auto">
          <div>
            <h2 className="text-lg font-bold text-zinc-200">Specification Table</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Raw metric counts compared across profiles.</p>
          </div>

          <table className="w-full mt-6 text-left border-collapse min-w-125">
            <thead>
              <tr className="border-b border-zinc-850 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                <th className="py-3 pr-4">Metrics</th>
                {selectedMps.map(mp => (
                  <th key={mp.id} className="py-3 px-4">{mp.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-xs text-zinc-300 divide-y divide-zinc-900/60">
              {/* Party */}
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-zinc-400">Party</td>
                {selectedMps.map(mp => (
                  <td key={mp.id} className="py-3.5 px-4">
                    <span className={cn("text-[10px] px-2 py-0.5 rounded border font-semibold uppercase", getPartyBg(mp.party))}>
                      {mp.party}
                    </span>
                  </td>
                ))}
              </tr>
              {/* Seat */}
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-zinc-400">Constituency</td>
                {selectedMps.map(mp => (
                  <td key={mp.id} className="py-3.5 px-4 font-medium truncate max-w-37.5">{mp.constituency}</td>
                ))}
              </tr>
              {/* Region */}
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-zinc-400">Region</td>
                {selectedMps.map(mp => (
                  <td key={mp.id} className="py-3.5 px-4">{mp.region}</td>
                ))}
              </tr>
              {/* Score */}
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-zinc-400 flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Overall Score</span>
                </td>
                {selectedMps.map(mp => (
                  <td key={mp.id} className="py-3.5 px-4 font-bold text-zinc-100">{mp.overall_score}</td>
                ))}
              </tr>
              {/* Attendance */}
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-zinc-400 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Attendance</span>
                </td>
                {selectedMps.map(mp => (
                  <td key={mp.id} className="py-3.5 px-4 font-bold text-zinc-100">{mp.attendance_rate}%</td>
                ))}
              </tr>
              {/* Questions */}
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-zinc-400 flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5 text-violet-400" />
                  <span>Questions Asked</span>
                </td>
                {selectedMps.map(mp => (
                  <td key={mp.id} className="py-3.5 px-4">{mp.questions_count}</td>
                ))}
              </tr>
              {/* Debates */}
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-zinc-400 flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5 text-pink-400" />
                  <span>Debate Turns</span>
                </td>
                {selectedMps.map(mp => (
                  <td key={mp.id} className="py-3.5 px-4">{mp.debates_count}</td>
                ))}
              </tr>
              {/* Bills Sponsored */}
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-zinc-400 flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-amber-400" />
                  <span>Bills Sponsored</span>
                </td>
                {selectedMps.map(mp => (
                  <td key={mp.id} className="py-3.5 px-4">{mp.bills_sponsored}</td>
                ))}
              </tr>
              {/* Bills Passed */}
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-zinc-400">Bills Passed (Assent)</td>
                {selectedMps.map(mp => (
                  <td key={mp.id} className="py-3.5 px-4 font-bold text-emerald-400">{mp.bills_passed}</td>
                ))}
              </tr>
              {/* Action Button */}
              <tr className="border-t border-zinc-900">
                <td className="py-3.5 pr-4"></td>
                {selectedMps.map(mp => (
                  <td key={mp.id} className="py-3.5 px-4">
                    <Link 
                      href={`/mps/${mp.id}`}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
                    >
                      <span>View Profile</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}