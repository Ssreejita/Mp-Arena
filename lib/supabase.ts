import { createClient } from '@supabase/supabase-js';

export interface MP {
  id: string;
  name: string;
  party: string;
  constituency: string;
  state: string;
  region: string;        // keep for compatibility (same as state)
  image_url: string;
  gender: string;
  age: number | null;
  education: string;
  is_minister: boolean;
  term: string;
  start_of_term: string;
  status: 'Active' | 'Inactive';
  overall_score: number;
  attendance_rate: number;
  questions_count: number;
  debates_count: number;
  bills_sponsored: number;
  bills_passed: number;
  active_term_years: string;
  ai_summary: string;
  prs_url: string;
  top_topics: string[];
  topic_scores: Record<string, number>;
}

export interface MPPerformanceHistory {
  id: string;
  mp_id: string;
  year: number;
  overall_score: number;
  attendance_rate: number;
  questions_count: number;
  debates_count: number;
  bills_sponsored: number;
}

export interface MPTopic {
  id: string;
  mp_id: string;
  topic_name: string;
  score: number; // 0 to 100
}

export interface MPBill {
  id: string;
  mp_id: string;
  title: string;
  status: 'Royal Assent' | 'First Reading' | 'Second Reading' | 'Committee Stage' | 'Report Stage' | 'Third Reading' | 'Failed';
  description: string;
  date_introduced: string;
}

export interface MPQuestion {
  id: string;
  mp_id: string;
  question_text: string;
  response_text: string;
  date: string;
  category: 'Oral' | 'Written';
}

export interface MPDebate {
  id: string;
  mp_id: string;
  title: string;
  contributions_count: number;
  date: string;
  speech_snippet: string;
}

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Live Supabase Client (only created if variables exist)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// ==========================================
// MOCK DATA SET (High-fidelity simulated DB)
// ==========================================

// ==========================================
// REAL DATA — 18th Lok Sabha (544 MPs)
// ==========================================

import mpDataRaw from './mp-data.json';

const MOCK_MPS: MP[] = (mpDataRaw as any[]).map(mp => ({
  ...mp,
  region: mp.state,                          // alias for compatibility
  status: 'Active' as const,
  bills_passed: 0,                           // not in source data
  active_term_years: `${mp.start_of_term?.slice(6) || '2024'} – Present`,
  ai_summary: `${mp.name} is an MP from ${mp.constituency}, ${mp.state}, representing ${mp.party}. `
    + `Their top focus areas are ${(mp.top_topics as string[]).join(', ') || 'general legislation'}. `
    + `Attendance: ${mp.attendance_rate}% | Questions: ${mp.questions_count} | Debates: ${mp.debates_count} | Bills: ${mp.bills_sponsored}.`,
}));

const MOCK_HISTORIES: MPPerformanceHistory[] = [];
const MOCK_TOPICS: MPTopic[] = [];
const MOCK_BILLS: MPBill[] = [];
const MOCK_QUESTIONS: MPQuestion[] = [];
const MOCK_DEBATES: MPDebate[] = [];

// Seed topics from real topic_scores data
MOCK_MPS.forEach(mp => {
  if (mp.topic_scores) {
    Object.entries(mp.topic_scores).forEach(([topic, score], tIdx) => {
      MOCK_TOPICS.push({
        id: `topic-${mp.id}-${tIdx}`,
        mp_id: mp.id,
        topic_name: topic,
        score: Math.min(100, Math.round((score as number / 10) * 10)), // normalize
      });
    });
  }
});
// ==========================================
// DATA ACCESS LAYER (Fallback Enabled)
// ==========================================

export const db = {
  /**
   * Get list of all MPs with search and filter options
   */
  async getMps(filters?: {
    search?: string;
    party?: string;
    region?: string;
    minScore?: number;
    maxScore?: number;
    status?: string;
    sortBy?: 'overall_score' | 'attendance_rate' | 'questions_count' | 'debates_count' | 'bills_sponsored';
    sortOrder?: 'asc' | 'desc';
  }) {
    if (supabase) {
      try {
        let query = supabase.from('mps').select('*');
        
        if (filters?.search) {
          query = query.or(`name.ilike.%${filters.search}%,constituency.ilike.%${filters.search}%`);
        }
       
        if (filters?.region && filters.region !== 'All') {
          query = query.eq('region', filters.region);
        }
        if (filters?.status && filters.status !== 'All') {
          query = query.eq('status', filters.status);
        }
        if (filters?.minScore !== undefined) {
          query = query.gte('overall_score', filters.minScore);
        }
        if (filters?.maxScore !== undefined) {
          query = query.lte('overall_score', filters.maxScore);
        }
        
        const sortBy = filters?.sortBy || 'overall_score';
        const sortOrder = filters?.sortOrder || 'desc';
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });

        const { data, error } = await query;
        if (!error && data) return data as MP[];
        console.error('Supabase getMps error, falling back to mock:', error);
      } catch (err) {
        console.error('Supabase query error, falling back to mock:', err);
      }
    }

    // Mock implementation
    let result = [...MOCK_MPS];

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        mp => 
          mp.name.toLowerCase().includes(searchLower) || 
          mp.constituency.toLowerCase().includes(searchLower) ||
          mp.region.toLowerCase().includes(searchLower)
      );
    }

    if (filters?.party && filters.party !== 'All') {
  result = result.filter(mp => mp.party.toLowerCase().includes(filters.party!.toLowerCase()));
}

    if (filters?.region && filters.region !== 'All') {
      result = result.filter(mp => mp.region === filters.region);
    }

    if (filters?.status && filters.status !== 'All') {
      result = result.filter(mp => mp.status === filters.status);
    }

    if (filters?.minScore !== undefined) {
      result = result.filter(mp => mp.overall_score >= filters.minScore!);
    }

    if (filters?.maxScore !== undefined) {
      result = result.filter(mp => mp.overall_score <= filters.maxScore!);
    }

    const sortBy = filters?.sortBy || 'overall_score';
    const sortOrder = filters?.sortOrder || 'desc';
    result.sort((a, b) => {
     const valA = a[sortBy] as string | number;
const valB = b[sortBy] as string | number;
if (typeof valA === 'string' && typeof valB === 'string') {
  return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
}
return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });

    return result;
  },

  /**
   * Get a single MP by ID
   */
  async getMpById(id: string) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('mps').select('*').eq('id', id).single();
        if (!error && data) return data as MP;
        console.error('Supabase getMpById error, falling back to mock:', error);
      } catch (err) {
        console.error('Supabase query error, falling back to mock:', err);
      }
    }

    return MOCK_MPS.find(mp => mp.id === id) || null;
  },

  /**
   * Get an MP's performance history
   */
  async getMpHistory(mpId: string) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('mp_performance_history').select('*').eq('mp_id', mpId).order('year', { ascending: true });
        if (!error && data) return data as MPPerformanceHistory[];
        console.error('Supabase getMpHistory error, falling back to mock:', error);
      } catch (err) {
        console.error('Supabase query error, falling back to mock:', err);
      }
    }

    return MOCK_HISTORIES.filter(h => h.mp_id === mpId).sort((a, b) => a.year - b.year);
  },

  /**
   * Get an MP's topic breakdown scores
   */
  async getMpTopics(mpId: string) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('mp_topics').select('*').eq('mp_id', mpId);
        if (!error && data) return data as MPTopic[];
        console.error('Supabase getMpTopics error, falling back to mock:', error);
      } catch (err) {
        console.error('Supabase query error, falling back to mock:', err);
      }
    }

    return MOCK_TOPICS.filter(t => t.mp_id === mpId);
  },

  /**
   * Get an MP's bills
   */
  async getMpBills(mpId: string) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('mp_bills').select('*').eq('mp_id', mpId).order('date_introduced', { ascending: false });
        if (!error && data) return data as MPBill[];
        console.error('Supabase getMpBills error, falling back to mock:', error);
      } catch (err) {
        console.error('Supabase query error, falling back to mock:', err);
      }
    }

    return MOCK_BILLS.filter(b => b.mp_id === mpId).sort((a, b) => b.date_introduced.localeCompare(a.date_introduced));
  },

  /**
   * Get an MP's questions
   */
  async getMpQuestions(mpId: string) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('mp_questions').select('*').eq('mp_id', mpId).order('date', { ascending: false });
        if (!error && data) return data as MPQuestion[];
        console.error('Supabase getMpQuestions error, falling back to mock:', error);
      } catch (err) {
        console.error('Supabase query error, falling back to mock:', err);
      }
    }

    return MOCK_QUESTIONS.filter(q => q.mp_id === mpId).sort((a, b) => b.date.localeCompare(a.date));
  },

  /**
   * Get an MP's debates
   */
  async getMpDebates(mpId: string) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('mp_debates').select('*').eq('mp_id', mpId).order('date', { ascending: false });
        if (!error && data) return data as MPDebate[];
        console.error('Supabase getMpDebates error, falling back to mock:', error);
      } catch (err) {
        console.error('Supabase query error, falling back to mock:', err);
      }
    }

    return MOCK_DEBATES.filter(d => d.mp_id === mpId).sort((a, b) => b.date.localeCompare(a.date));
  },

  /**
   * Get aggregated insights for home page
   */
  async getAggregatedInsights() {
    // If Supabase is connected, we could run complex SQL, but for ease and speed we will aggregate here
    const mps = await this.getMps();
    const activeMps = mps.filter(m => m.status === 'Active');
    
    const avgAttendance = activeMps.reduce((acc, curr) => acc + curr.attendance_rate, 0) / activeMps.length;
    const avgScore = activeMps.reduce((acc, curr) => acc + curr.overall_score, 0) / activeMps.length;
    const totalQuestions = mps.reduce((acc, curr) => acc + curr.questions_count, 0);
    const totalDebates = mps.reduce((acc, curr) => acc + curr.debates_count, 0);
    const totalBills = mps.reduce((acc, curr) => acc + curr.bills_sponsored, 0);
    const totalBillsPassed = mps.reduce((acc, curr) => acc + curr.bills_passed, 0);

    // Group by Party
    const partyStats: { [key: string]: { count: number; totalScore: number; avgScore: number } } = {};
    activeMps.forEach(mp => {
      if (!partyStats[mp.party]) {
        partyStats[mp.party] = { count: 0, totalScore: 0, avgScore: 0 };
      }
      partyStats[mp.party].count += 1;
      partyStats[mp.party].totalScore += mp.overall_score;
    });

    Object.keys(partyStats).forEach(party => {
      partyStats[party].avgScore = Number((partyStats[party].totalScore / partyStats[party].count).toFixed(1));
    });

    return {
      avgAttendance: Number(avgAttendance.toFixed(1)),
      avgScore: Number(avgScore.toFixed(1)),
      totalQuestions,
      totalDebates,
      totalBills,
      totalBillsPassed,
      partyStats: Object.keys(partyStats).map(name => ({
        name,
        count: partyStats[name].count,
        avgScore: partyStats[name].avgScore
      }))
    };
  }
};
