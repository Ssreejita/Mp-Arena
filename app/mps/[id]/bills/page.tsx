'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  Search,
  Calendar
} from 'lucide-react';

import { db, MPBill } from '@/lib/supabase';

export default function MpBillsPage() {
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState<MPBill[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadBills() {
      setLoading(true);

      try {
        const data = await db.getMpBills(id);
        setBills(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadBills();
  }, [id]);

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const value = search.toLowerCase();

      return (
        bill.title.toLowerCase().includes(value) ||
       bill.description?.toLowerCase().includes(value) ||
        bill.status.toLowerCase().includes(value)
      );
    });
  }, [bills, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

      <Link
        href={`/mps/${id}`}
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-indigo-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to MP Dashboard
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-zinc-100">
          Bills Sponsored
        </h1>

        <p className="text-zinc-400 mt-1">
          {bills.length} Bills
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />

        <input
          placeholder="Search bills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="space-y-4">

        {filteredBills.length === 0 && (
          <div className="text-center py-20 text-zinc-500">
            No bills found.
          </div>
        )}

        {filteredBills.map((bill) => (

          <Link
            key={bill.id}
            href={`/mps/${id}/bills/${bill.id}`}
            className="block rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 hover:border-indigo-500 hover:bg-zinc-900/60 transition"
          >

            <div className="flex items-start gap-4">

              <div className="p-3 rounded-lg bg-amber-500/10">
                <FileText className="h-5 w-5 text-amber-400" />
              </div>

              <div className="flex-1">

                <h2 className="text-lg font-semibold text-zinc-100">
                  {bill.title}
                </h2>

                <p className="text-sm text-zinc-400 mt-2 line-clamp-3">
                  {bill.description}
                </p>

                <div className="flex flex-wrap gap-3 mt-4">

                  <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
                    {bill.status}
                  </span>

                  <span className="flex items-center gap-1 text-xs text-zinc-500">
                    <Calendar className="h-3 w-3" />
                    {bill.date_introduced}
                  </span>

                </div>

              </div>

            </div>

          </Link>

        ))}

      </div>

    </div>
  );
}