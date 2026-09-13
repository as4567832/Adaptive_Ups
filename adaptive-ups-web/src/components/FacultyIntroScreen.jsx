import React from 'react';
import { ArrowRight, UserCheck } from 'lucide-react';

const students = [
  'Ayush Sachan',
  'Prakhar Srivastaav',
  'Praveen Kumar',
  'Prateek Khare',
  'Ayush Maurya',
];

export default function FacultyIntroScreen({ isDark, onContinue }) {
  return (
    <div
      className={`min-h-screen w-full relative flex items-center justify-center overflow-y-auto p-4 transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-[#050A12] via-[#0D1A2E] to-[#07111D] text-slate-100'
          : 'bg-gradient-to-br from-[#EAF4FF] via-[#F7FCFF] to-[#EEF7FF] text-slate-900'
      }`}
    >
      {/* Ambient glowing background circles */}
      <div className="absolute -top-24 -right-16 w-52 h-52 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-10 w-48 h-48 bg-emerald-500/18 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-[560px] py-6 z-10 flex flex-col gap-5">
        {/* Header */}
        <div className="text-center animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Adaptive UPS
          </h1>
          <p className={`mt-2 text-sm sm:text-base font-medium ${isDark ? 'text-slate-300/80' : 'text-slate-600'}`}>
            Smart Backup Power Management System
          </p>
        </div>

        {/* Faculty Mentor Card */}
        <div className="glass-panel rounded-3xl p-5 shadow-2xl animate-slide-up" style={{ animationDelay: '220ms' }}>
          <div className="flex flex-col items-center text-center">
            <div className="w-full aspect-[16/10] overflow-hidden rounded-2xl shadow-md border border-white/10 mb-4">
              <img
                src="/logo.jpeg"
                alt="Adaptive UPS Mentor"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 text-blue-500 font-bold text-xs uppercase tracking-wider mb-2">
              <UserCheck className="w-3.5 h-3.5" />
              Faculty Mentor
            </div>
            <h2 className="text-xl sm:text-2xl font-black">Dr Navdeep Singh</h2>
          </div>
        </div>

        {/* Group Students Card */}
        <div className="glass-panel rounded-3xl p-5 shadow-2xl animate-slide-up" style={{ animationDelay: '340ms' }}>
          <h3 className="text-base font-extrabold mb-3">Group Students</h3>
          <div className="flex flex-col gap-2.5">
            {students.map((student, idx) => (
              <div
                key={student}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  isDark
                    ? 'bg-emerald-500/12 text-slate-100 hover:bg-emerald-500/20'
                    : 'bg-emerald-500/10 text-slate-800 hover:bg-emerald-500/15'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-blue-500/25 flex items-center justify-center text-xs font-black text-blue-500">
                  {idx + 1}
                </div>
                <span className="font-semibold text-sm sm:text-base">{student}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <div className="animate-slide-up" style={{ animationDelay: '460ms' }}>
          <button
            onClick={onContinue}
            className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] cursor-pointer"
          >
            <span>Continue To Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
