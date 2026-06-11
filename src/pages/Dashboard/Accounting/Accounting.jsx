import { useEffect, useState, useMemo } from "react";
import { FileText } from "lucide-react";
import useAxios from "../../../hooks/useAxios";
import PageHeader from "../../../components/ui/PageHeader";
import Modal from "../../../components/ui/Modal";
import StatusBadge from "../../../components/ui/StatusBadge";
import TableSkeleton from "../../../components/ui/TableSkeleton";
import EmptyState from "../../../components/ui/EmptyState";
import { formatCurrency, btnSecondary } from "../../../lib/utils";
import toast from "react-hot-toast";

export default function Accounting() {
  const axios = useAxios();
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersRes, paymentsRes] = await Promise.all([
          axios.get("/users"),
          axios.get("/payments"),
        ]);
        setUsers(usersRes.data);
        setPayments(paymentsRes.data);
      } catch {
        toast.error("Failed to load accounting data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [axios]);

  const getUserPayments = (userId) => payments.filter((p) => p.user_id === userId);

  const getTotalAmount = (userId) => getUserPayments(userId).reduce((sum, p) => sum + (p.amount || 0), 0);
  const getTotalDiscount = (userId) => getUserPayments(userId).reduce((sum, p) => sum + (p.discount || 0), 0);
  const getTotalPayable = (userId) => getUserPayments(userId).reduce((sum, p) => sum + ((p.amount || 0) - (p.discount || 0)), 0);
  const getTotalPaid = (userId) => getUserPayments(userId).reduce((sum, p) => sum + (p.paid || 0), 0);
  const getTotalDue = (userId) => getUserPayments(userId).reduce((sum, p) => sum + ((p.amount || 0) - (p.discount || 0) - (p.paid || 0)), 0);

  const totals = useMemo(() => ({
    amount: users.reduce((s, u) => s + getTotalAmount(u._id), 0),
    discount: users.reduce((s, u) => s + getTotalDiscount(u._id), 0),
    payable: users.reduce((s, u) => s + getTotalPayable(u._id), 0),
    paid: users.reduce((s, u) => s + getTotalPaid(u._id), 0),
    due: users.reduce((s, u) => s + getTotalDue(u._id), 0),
  }), [users, payments]);

  const calculateStatus = (p) => {
    const payable = (p.amount || 0) - (p.discount || 0);
    const paid = p.paid || 0;
    const due = payable - paid;
    if (paid <= 0) return "pending";
    if (due > 0) return "partial";
    return "paid";
  };

  return (
    <div>
      <PageHeader title="Accounting" subtitle="Student payment summary" />

      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["Student", "Total Amount", "Discount", "Payable", "Paid", "Due"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={5} cols={6} />
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState message="No students found" icon={FileText} />
                  </td>
                </tr>
              ) : (
                <>
                  {users.map((user, index) => {
                    const due = getTotalDue(user._id);
                    return (
                      <tr key={user._id} className={`hover:bg-slate-50 transition-colors border-b border-slate-100 ${index === users.length - 1 ? "border-b-0" : ""}`}>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-sm font-medium text-emerald-600 hover:text-emerald-800 hover:underline cursor-pointer"
                          >
                            {user.name}
                          </button>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-slate-700">{formatCurrency(getTotalAmount(user._id))}</td>
                        <td className="px-4 py-3.5 text-sm text-slate-700">{formatCurrency(getTotalDiscount(user._id))}</td>
                        <td className="px-4 py-3.5 text-sm text-slate-700">{formatCurrency(getTotalPayable(user._id))}</td>
                        <td className="px-4 py-3.5 text-sm text-slate-700">{formatCurrency(getTotalPaid(user._id))}</td>
                        <td className={`px-4 py-3.5 text-sm font-bold ${due > 0 ? "text-red-600" : "text-slate-700"}`}>
                          {formatCurrency(due)}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-slate-50 border-t-2 border-slate-200">
                    <td className="px-4 py-3.5 text-sm font-bold text-slate-900">Total</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-slate-900">{formatCurrency(totals.amount)}</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-slate-900">{formatCurrency(totals.discount)}</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-slate-900">{formatCurrency(totals.payable)}</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-slate-900">{formatCurrency(totals.paid)}</td>
                    <td className={`px-4 py-3.5 text-sm font-bold ${totals.due > 0 ? "text-red-600" : "text-slate-900"}`}>
                      {formatCurrency(totals.due)}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={`${selectedUser?.name || ""} — Payment History`}
        size="xl"
        footer={
          <button onClick={() => setSelectedUser(null)} className={btnSecondary}>Close</button>
        }
      >
        {selectedUser && (
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
                {getUserPayments(selectedUser._id).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">No payments yet</td>
                  </tr>
                ) : (
                  getUserPayments(selectedUser._id).map((p, index, arr) => {
                    const payable = (p.amount || 0) - (p.discount || 0);
                    const paid = p.paid || 0;
                    const due = payable - paid;
                    const status = calculateStatus(p);
                    return (
                      <tr key={p._id} className={`border-b border-slate-100 ${index === arr.length - 1 ? "border-b-0" : ""}`}>
                        <td className="px-4 py-3 text-sm text-slate-700">{p.month}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{formatCurrency(p.amount)}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{formatCurrency(p.discount || 0)}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{formatCurrency(payable)}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{formatCurrency(paid)}</td>
                        <td className={`px-4 py-3 text-sm font-medium ${due > 0 ? "text-red-600" : "text-slate-700"}`}>{formatCurrency(due)}</td>
                        <td className="px-4 py-3"><StatusBadge status={status} /></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
}
