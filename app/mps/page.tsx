'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  FileText, 
  MessageSquare, 
  ChevronRight,
  TrendingDown,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { db, MP } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function MpListingPage() {
  const [loading, setLoading] = useState(true);
  const [mps, setMps] = useState<MP[]>([]);
  
  // Filter States
  const [search, setSearch] = useState('');
  const [party, setParty] = useState('All');
  const [region, setRegion] = useState('All');
  const [status, setStatus] = useState('All');
  const [sortBy, setSortBy] = useState<'overall_score' | 'attendance_rate' | 'questions_count' | 'bills_sponsored'>('overall_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Unique Lists for Select inputs
  const [parties, setParties] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);

  useEffect(() => {
    // Fetch unique parties and regions for dropdowns
    async function loadFilterOptions() {
      const allData = await db.getMps();
      const uniqueParties = Array.from(new Set(allData.map(m => m.party)));
      const uniqueRegions = Array.from(new Set(allData.map(m => m.region)));
      setParties(uniqueParties);
      setRegions(uniqueRegions);
    }
    loadFilterOptions();
  }, []);

  useEffect(() => {
    async function fetchFilteredMps() {
      setLoading(true);
      try {
        const data = await db.getMps({
          search,
          party,
          region,
          status,
          sortBy,
          sortOrder
        });
        setMps(data);
      } catch (error) {
        console.error('Error fetching MPs:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchFilteredMps();
  }, [search, party, region, status, sortBy, sortOrder]);

  const clearFilters = () => {
    setSearch('');
    setParty('All');
    setRegion('All');
    setStatus('All');
    setSortBy('overall_score');
    setSortOrder('desc');
  };

  const getPartyBg = (partyName: string) => {
    switch (partyName) {
      case 'Labour': return 'bg-red-500/10 border-red-500/20 text-red-400';
      case 'Conservative': return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      case 'SNP': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
      case 'Liberal Democrat': return 'bg-orange-500/10 border-orange-500/20 text-orange-400';
      case 'Green': return 'bg-green-500/10 border-green-500/20 text-green-400';
      default: return 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Member Directory</h1>
        <p className="text-zinc-400 text-sm">
          Browse, filter, and compare the activity levels and scores of all sitting and former Members of Parliament.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-xl space-y-4 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
          <div className="flex items-center gap-2 text-zinc-300 font-semibold text-sm">
            <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
            <span>Search Filters</span>
          </div>
          <button 
            onClick={clearFilters}
            className="text-xs text-zinc-500 hover:text-indigo-400 font-medium transition-colors"
          >
            Clear Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Search Name/Seat</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Starmer, Richmond..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 pl-9 pr-4 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          {/* Party */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Party</label>
            <select
              value={party}
              onChange={(e) => setParty(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500/50"
            >
              <option value="All">All Parties</option>
              {parties.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Region */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500/50"
            >
              <option value="All">All Regions</option>
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Office Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500/50"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active MPs</option>
              <option value="Inactive">Former MPs</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Sort Metric</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 px-3 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500/50"
            >
              <option value="overall_score">Overall Score</option>
              <option value="attendance_rate">Attendance Rate</option>
              <option value="questions_count">Questions Asked</option>
              <option value="bills_sponsored">Bills Sponsored</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-600/20 border-t-indigo-500 animate-spin" />
          <span className="mt-3 text-xs text-zinc-500">Filtering database...</span>
        </div>
      ) : mps.length > 0 ? (
        /* MP Directory Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mps.map(mp => (
            <div 
              key={mp.id} 
              className="glow-card group bg-zinc-900/30 border border-zinc-900/80 rounded-xl overflow-hidden flex flex-col justify-between"
            >
              {/* Top Section */}
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  {/* Photo & Name */}
                  <div className="flex gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-800 shrink-0">
                      <img src={mp.image_url} alt={mp.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-zinc-200 group-hover:text-indigo-400 transition-colors truncate">
                        {mp.name}
                      </h3>
                      <div className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="h-3 w-3 text-zinc-600 shrink-0" />
                        <span>{mp.constituency}</span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Circle */}
                  <div className="text-center shrink-0">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Score</span>
                    <div className="mt-0.5 px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-sm font-bold text-indigo-400 group-hover:border-indigo-500/35 transition-all">
                      {mp.overall_score}
                    </div>
                  </div>
                </div>

                {/* Party & Office Status Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className={cn("text-[9px] px-2 py-0.5 rounded border font-semibold uppercase", getPartyBg(mp.party))}>
                    {mp.party}
                  </span>
                  <span className={cn(
                    "text-[9px] px-2 py-0.5 rounded border font-semibold uppercase",
                    mp.status === 'Active' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-zinc-500/10 border-zinc-550/20 text-zinc-400'
                  )}>
                    {mp.status}
                  </span>
                </div>

                {/* Substats Panel */}
                <div className="grid grid-cols-3 gap-2 bg-zinc-950/40 p-3 rounded-lg border border-zinc-900/60">
                  <div className="text-center">
                    <span className="text-[9px] text-zinc-500 block uppercase font-medium">Attendance</span>
                    <span className="text-xs font-bold text-zinc-300">{mp.attendance_rate}%</span>
                  </div>
                  <div className="text-center border-x border-zinc-900/80">
                    <span className="text-[9px] text-zinc-500 block uppercase font-medium">Questions</span>
                    <span className="text-xs font-bold text-zinc-300">{mp.questions_count}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] text-zinc-500 block uppercase font-medium">Bills Sp.</span>
                    <span className="text-xs font-bold text-zinc-300">{mp.bills_sponsored}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link 
                href={`/mps/${mp.id}`}
                className="w-full py-3 bg-zinc-950/40 border-t border-zinc-900 text-center text-xs font-bold text-zinc-400 group-hover:bg-indigo-600 group-hover:text-white hover:text-white transition-all flex items-center justify-center gap-1.5"
              >
                <span>Access Performance Profile</span>
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-20 border border-dashed border-zinc-900 rounded-xl text-center space-y-3">
          <p className="text-sm text-zinc-500 font-medium">No Members of Parliament found matching your filters.</p>
          <button 
            onClick={clearFilters}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-lg text-white transition-colors"
          >
            Clear Search Filters
          </button>
        </div>
      )}
    </div>
  );
}
