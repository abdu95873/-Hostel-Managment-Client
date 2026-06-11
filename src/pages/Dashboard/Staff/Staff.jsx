import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Shield, UserCog } from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import { createStaffAccount, fetchStaffAccounts } from "../../../lib/accountApi";
import PageHeader from "../../../components/ui/PageHeader";
import Modal from "../../../components/ui/Modal";
import TableSkeleton from "../../../components/ui/TableSkeleton";
import EmptyState from "../../../components/ui/EmptyState";
import ButtonSpinner from "../../../components/ui/ButtonSpinner";
import { inputClass, labelClass, btnPrimary, btnSecondary, selectClass } from "../../../lib/utils";
import { ROLE_LABELS } from "../../../lib/roles";
import toast from "react-hot-toast";
import { Navigate } from "react-router-dom";

const roleBadge = {
  admin: "bg-emerald-100 text-emerald-700",
  manager: "bg-sky-100 text-sky-700",
};

export default function Staff() {
  const { user, userRole } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { role: "manager" },
  });

  if (userRole !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const loadStaff = async () => {
    setLoading(true);
    try {
      const data = await fetchStaffAccounts(user.email);
      setStaff(data);
    } catch (err) {
      toast.error(err.message || "Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) loadStaff();
  }, [user?.email]);

  const openAdd = () => {
    reset({ name: "", email: "", password: "", confirmPassword: "", role: "manager" });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      await createStaffAccount({
        name: data.name,
        email: data.email,
        role: data.role,
        password: data.password,
        admin_email: user.email,
      });
      toast.success(`${ROLE_LABELS[data.role]} account created`);
      setModalOpen(false);
      loadStaff();
    } catch (err) {
      toast.error(err.message || "Failed to create account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Staff Accounts"
        subtitle="Add admin or manager login accounts"
        action={
          <button onClick={openAdd} className={`${btnPrimary} gap-2`}>
            <Plus size={16} /> Add Staff
          </button>
        }
      />

      {loading ? (
        <TableSkeleton cols={4} />
      ) : staff.length === 0 ? (
        <EmptyState
          title="No staff accounts"
          description="Create admin or manager accounts so they can log in."
          actionLabel="Add Staff"
          onAction={openAdd}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">Name</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">Email</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">Role</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">Created</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-5 py-3.5 font-medium text-slate-800">{s.name}</td>
                    <td className="px-5 py-3.5 text-slate-600">{s.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadge[s.role] || "bg-slate-100 text-slate-600"}`}>
                        {s.role === "admin" ? <Shield size={12} /> : <UserCog size={12} />}
                        {ROLE_LABELS[s.role]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Staff Account">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>Full Name</label>
            <input {...register("name", { required: "Required" })} className={inputClass} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" {...register("email", { required: "Required" })} className={inputClass} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Role</label>
            <select {...register("role", { required: true })} className={selectClass}>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Password</label>
            <input
              type="password"
              {...register("password", { required: "Required", minLength: { value: 6, message: "Min 6 characters" } })}
              className={inputClass}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Confirm Password</label>
            <input type="password" {...register("confirmPassword", { required: "Required" })} className={inputClass} />
          </div>
          <p className="text-xs text-slate-500">
            This creates a Firebase login. Share the email and password with the staff member.
          </p>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className={`${btnSecondary} flex-1`}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className={`${btnPrimary} flex-1`}>
              {submitting ? <ButtonSpinner /> : "Create Account"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
