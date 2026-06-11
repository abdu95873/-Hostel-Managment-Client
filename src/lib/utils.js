export const formatCurrency = (amount) => {
  const value = Number(amount) || 0;
  return `৳ ${value.toLocaleString()}`;
};

export const inputClass =
  "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent";

export const selectClass =
  "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent";

export const labelClass =
  "block text-xs font-medium uppercase tracking-wide text-slate-500 mb-1.5";

export const btnPrimary =
  "bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 font-medium text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2";

export const btnSecondary =
  "bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 rounded-lg px-4 py-2 font-medium text-sm transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-2";

export const btnDanger =
  "bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 font-medium text-sm transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-2";

export const btnSuccess =
  "bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-4 py-2 font-medium text-sm transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-2";

export const btnIcon =
  "p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-all duration-200 cursor-pointer";
