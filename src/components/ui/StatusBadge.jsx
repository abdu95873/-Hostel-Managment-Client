const styles = {
  paid: "bg-emerald-100 text-emerald-700",
  partial: "bg-amber-100 text-amber-700",
  pending: "bg-slate-100 text-slate-600",
  assigned: "bg-emerald-100 text-emerald-700",
  unassigned: "bg-rose-100 text-rose-600",
};

export default function StatusBadge({ status, label }) {
  const normalized = (status || "pending").toLowerCase();
  const className = styles[normalized] || styles.pending;

  return (
    <span className={`${className} rounded-full px-3 py-1 text-xs font-semibold capitalize inline-block`}>
      {label || status}
    </span>
  );
}
