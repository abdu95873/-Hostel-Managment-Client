import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BedDouble, CreditCard, AlertCircle, CheckCircle, MapPin } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import StatCard from "../../components/ui/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatCurrency } from "../../lib/utils";
import toast from "react-hot-toast";

export default function StudentHome() {
  const { user, account } = useAuth();
  const axios = useAxios();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    const load = async () => {
      try {
        const res = await axios.get(`/student/portal/${encodeURIComponent(user.email)}`);
        setData(res.data);
      } catch {
        toast.error("Failed to load your portal");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, axios]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        ))}
      </div>
    );
  }

  const { student, location, summary, payments = [] } = data || {};
  const recentPayments = payments.slice(-5).reverse();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {account?.name || student?.name}!</h1>
        <p className="text-sm text-slate-500 mt-1">Your hostel portal overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={CreditCard} label="Total Payable" value={formatCurrency(summary?.totalPayable)} loading={false} iconBg="bg-emerald-100" iconColor="text-emerald-600" />
        <StatCard icon={CheckCircle} label="Total Paid" value={formatCurrency(summary?.totalPaid)} loading={false} iconBg="bg-emerald-100" iconColor="text-emerald-600" />
        <StatCard icon={AlertCircle} label="Total Due" value={formatCurrency(summary?.totalDue)} loading={false} iconBg="bg-red-100" iconColor="text-red-500" highlight={summary?.totalDue > 0} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={18} className="text-emerald-600" />
          <h2 className="text-base font-semibold text-slate-800">Bed Assignment</h2>
        </div>
        {location ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
            <p className="text-sm font-medium text-emerald-800 mb-2">You are assigned</p>
            <p className="text-sm text-slate-700">
              {[location.branch, location.building, `Floor ${location.floor}`, `Room ${location.room}`, `Bed ${location.bed}`]
                .filter(Boolean)
                .join(" › ")}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Monthly rent: {formatCurrency((location.amount || 0) - (location.discount || 0))}
            </p>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600">
            No bed assigned yet. Contact your hostel manager.
          </div>
        )}
        <Link to="/student/bed" className="inline-block mt-3 text-sm text-emerald-600 font-medium hover:underline">
          View bed details →
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">Recent Payments</h2>
          <Link to="/student/payments" className="text-sm text-emerald-600 font-medium">View all</Link>
        </div>
        {recentPayments.length === 0 ? (
          <p className="p-6 text-sm text-slate-500 text-center">No payments recorded yet</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentPayments.map((p) => (
              <div key={p._id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">{p.month}</p>
                  <p className="text-xs text-slate-500">Due: {formatCurrency((p.amount || 0) - (p.discount || 0) - (p.paid || 0))}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
