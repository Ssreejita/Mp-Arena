'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Calendar, MapPin, ChevronRight, Shield } from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry'
];

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    age: '',
    state: '',
    gender: '',
    constituency: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.age || parseInt(form.age) < 18) e.age = 'Must be 18 or older';
    if (!form.state) e.state = 'Select your state';
    if (!form.gender) e.gender = 'Select gender';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    localStorage.setItem('loklens_citizen', JSON.stringify({
      ...form,
      loggedIn: true,
      loginTime: new Date().toISOString(),
    }));
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <img
            src="/Emblem.webp.webp"
            alt="Emblem of India"
            className="w-16 h-16 object-contain mx-auto"
  style={{ filter: 'brightness(0) invert(1)' }}
          />
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            Lok<span className="text-indigo-500">Lens</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your MP. Know your Parliament.
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6">

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {[1, 2].map(s => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= s ? 'bg-indigo-500' : 'bg-zinc-800'}`} />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Who are you?</p>

                {/* Name */}
                <div className="space-y-1.5 mb-3">
                  <label className="text-xs font-bold text-foreground">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Rahul Kumar"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  {errors.name && <p className="text-xs text-rose-400">{errors.name}</p>}
                </div>

                {/* Age */}
                <div className="space-y-1.5 mb-3">
                  <label className="text-xs font-bold text-foreground">Age</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="number"
                      placeholder="25"
                      min="18"
                      max="120"
                      value={form.age}
                      onChange={e => setForm({ ...form, age: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  {errors.age && <p className="text-xs text-rose-400">{errors.age}</p>}
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Gender</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Male', 'Female', 'Other'].map(g => (
                      <button
                        key={g}
                        onClick={() => setForm({ ...form, gender: g })}
                        className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                          form.gender === g
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-background border-border text-muted-foreground hover:border-indigo-500/50'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                  {errors.gender && <p className="text-xs text-rose-400">{errors.gender}</p>}
                </div>
              </div>

              <button
                onClick={() => {
                  const e: Record<string, string> = {};
                  if (!form.name.trim()) e.name = 'Name is required';
                  if (!form.age || parseInt(form.age) < 18) e.age = 'Must be 18 or older';
                  if (!form.gender) e.gender = 'Select gender';
                  setErrors(e);
                  if (Object.keys(e).length === 0) setStep(2);
                }}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Where are you from?</p>

                {/* State */}
               <div className="space-y-1.5 mb-3">
  <label className="text-xs font-bold text-foreground">
    Your State
  </label>

  <div className="relative">
    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />

    <select
      value={form.state}
      onChange={(e) => setForm({ ...form, state: e.target.value })}
      className="w-full appearance-none bg-background dark:bg-zinc-900 border border-border dark:border-zinc-700 rounded-xl py-2.5 pl-9 pr-10 text-sm text-foreground dark:text-white focus:outline-none focus:border-indigo-500 transition-colors dark:[color-scheme:dark]"
    >
      <option
        value=""
        className="bg-white text-black dark:bg-zinc-900 dark:text-white"
      >
        Select your state
      </option>

      {INDIAN_STATES.map((s) => (
        <option
          key={s}
          value={s}
          className="bg-white text-black dark:bg-zinc-900 dark:text-white"
        >
          {s}
        </option>
      ))}
    </select>

    {/* Dropdown Arrow */}
    <svg
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </div>

  {errors.state && (
    <p className="text-xs text-rose-400">
      {errors.state}
    </p>
  )}
</div>

                {/* Constituency */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Constituency <span className="text-muted-foreground font-normal">(optional)</span></label>
                  <input
                    type="text"
                    placeholder="e.g. New Delhi, Varanasi..."
                    value={form.constituency}
                    onChange={e => setForm({ ...form, constituency: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-border text-foreground font-bold rounded-xl text-sm hover:border-zinc-600 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  Enter LokLens <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Privacy note */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Shield className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <p className="text-[10px] text-muted-foreground">Your data stays on your device. We don't store any personal information.</p>
          </div>
        </div>

        <p className="text-center text-[10px] text-muted-foreground">
          Data source: PRS India · 18th Lok Sabha · 2024–Present
        </p>
      </div>
    </div>
  );
}
