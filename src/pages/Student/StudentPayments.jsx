import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import StatusBadge from "../../components/ui/StatusBadge";
import TableSkeleton from "../../components/ui/TableSkeleton";
import { formatCurrency } from "../../lib/utils";
import toast from "react-hot-toast";

export default function StudentPayments() {
  const { user } = useAuth();
  const axios = useAxios();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    axios
      .get(`/student/portal/${encodeURIComponent(user.email)}`)
      .then((res) => setPayments(res.data.payments || []))
      .catch(() => toast.error("Failed to load payments"))
      .finally(() => setLoading(false));
  }, [user, axios]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Payments</h1>
      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["Month", "Amount", "Discount", "Payable", "Paid", "Due", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={4} cols={7} />
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">No payments yet</td>
                </tr>
              ) : (
                payments.map((p, i) => {
                  const payable = (p.amount || 0) - (p.discount || 0);
                  const due = payable - (p.paid || 0);
                  return (
                    <tr key={p._id} className={`border-b border-slate-100 hover:bg-slate-50 ${i === payments.length - 1 ? "border-b-0" : ""}`}>
                      <td className="px-4 py-3.5 text-sm text-slate-800">{p.month}</td>
                      <td className="px-4 py-3.5 text-sm">{formatCurrency(p.amount)}</td>
                      <td className="px-4 py-3.5 text-sm">{formatCurrency(p.discount || 0)}</td>
                      <td className="px-4 py-3.5 text-sm">{formatCurrency(payable)}</td>
                      <td className="px-4 py-3.5 text-sm">{formatCurrency(p.paid || 0)}</td>
                      <td className={`px-4 py-3.5 text-sm font-medium ${due > 0 ? "text-red-600" : ""}`}>{formatCurrency(due)}</td>
                      <td className="px-4 py-3.5"><StatusBadge status={p.status} /></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
