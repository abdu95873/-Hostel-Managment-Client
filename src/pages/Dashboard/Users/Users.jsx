import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Plus, Pencil, Trash2, UserPlus } from "lucide-react";
import useAxios from "../../../hooks/useAxios";
import PageHeader from "../../../components/ui/PageHeader";
import Modal from "../../../components/ui/Modal";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import StatusBadge from "../../../components/ui/StatusBadge";
import TableSkeleton from "../../../components/ui/TableSkeleton";
import EmptyState from "../../../components/ui/EmptyState";
import SearchInput from "../../../components/ui/SearchInput";
import ButtonSpinner from "../../../components/ui/ButtonSpinner";
import { inputClass, labelClass, btnPrimary, btnSecondary, btnIcon } from "../../../lib/utils";
import toast from "react-hot-toast";

export default function Users() {
  const axios = useAxios();
  const [users, setUsers] = useState([]);
  const [beds, setBeds] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, bedsRes, roomsRes] = await Promise.all([
        axios.get("/users"),
        axios.get("/beds/all"),
        axios.get("/rooms/all"),
      ]);
      setUsers(usersRes.data);
      setBeds(bedsRes.data);
      setRooms(roomsRes.data);
    } catch {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [axios]);

  const getBedInfo = (userId) => {
    const bed = beds.find((b) => b.occupant === userId);
    if (!bed) return null;
    const room = rooms.find((r) => r._id === bed.room_id);
    return { bed, room };
  };

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q)
    );
  }, [users, search]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await axios.post("/users", data);
      toast.success("Student added successfully");
      await fetchData();
      reset();
      setAddModalOpen(false);
    } catch {
      toast.error("Failed to add student");
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (user) => {
    setEditingUser(user);
    resetEdit({ name: user.name, email: user.email, phone: user.phone });
    setEditModalOpen(true);
  };

  const onEditSubmit = async (data) => {
    setSubmitting(true);
    try {
      await axios.put(`/users/${editingUser._id}`, data);
      toast.success("Student updated successfully");
      await fetchData();
      setEditModalOpen(false);
      setEditingUser(null);
    } catch {
      toast.error("Failed to update student");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`/users/${deleteTarget._id}`);
      toast.success("Student deleted successfully");
      await fetchData();
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete student");
    } finally {
      setDeleting(false);
    }
  };

  const formFields = (reg, errs) => (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Name</label>
        <input {...reg("name", { required: "Name is required" })} placeholder="Full name" className={inputClass} />
        {errs.name && <p className="text-red-500 text-xs mt-1">{errs.name.message}</p>}
      </div>
      <div>
        <label className={labelClass}>Email</label>
        <input
          {...reg("email", {
            required: "Email is required",
            pattern: { value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/, message: "Invalid email" },
          })}
          placeholder="email@example.com"
          className={inputClass}
        />
        {errs.email && <p className="text-red-500 text-xs mt-1">{errs.email.message}</p>}
      </div>
      <div>
        <label className={labelClass}>Phone</label>
        <input
          {...reg("phone", {
            required: "Phone is required",
            pattern: { value: /^[0-9]{11}$/, message: "Must be 11 digits" },
          })}
          placeholder="01XXXXXXXXX"
          className={inputClass}
        />
        {errs.phone && <p className="text-red-500 text-xs mt-1">{errs.phone.message}</p>}
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle={`Showing ${filteredUsers.length} of ${users.length} students`}
        action={
          <button onClick={() => { reset(); setAddModalOpen(true); }} className={btnPrimary}>
            <Plus size={16} />
            Add Student
          </button>
        }
      />

      <div className="mb-4 max-w-md">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone..."
        />
      </div>

      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["Student", "Email", "Phone", "Bed Status", "Location", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={5} cols={6} />
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      message="No students found"
                      actionLabel="Add your first student"
                      onAction={() => setAddModalOpen(true)}
                      icon={UserPlus}
                    />
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => {
                  const bedInfo = getBedInfo(user._id);
                  return (
                    <tr key={user._id} className={`hover:bg-slate-50 transition-colors border-b border-slate-100 ${index === filteredUsers.length - 1 ? "border-b-0" : ""}`}>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-semibold">
                            {user.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <span className="text-sm font-medium text-slate-800">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-700">{user.email}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-700">{user.phone}</td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={bedInfo ? "assigned" : "unassigned"} label={bedInfo ? "Assigned" : "Unassigned"} />
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-600">
                        {bedInfo ? (
                          <span>Room {bedInfo.room?.room_number || "—"}, Bed {bedInfo.bed.bed_number}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(user)} className={btnIcon} title="Edit">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => setDeleteTarget(user)} className={`${btnIcon} hover:text-red-600`} title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Student"
        footer={
          <>
            <button onClick={() => setAddModalOpen(false)} className={btnSecondary}>Cancel</button>
            <button form="add-user-form" type="submit" className={btnPrimary} disabled={submitting}>
              {submitting ? <ButtonSpinner /> : "Add Student"}
            </button>
          </>
        }
      >
        <form id="add-user-form" onSubmit={handleSubmit(onSubmit)}>
          {formFields(register, errors)}
        </form>
      </Modal>

      <Modal
        isOpen={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditingUser(null); }}
        title="Edit Student"
        footer={
          <>
            <button onClick={() => { setEditModalOpen(false); setEditingUser(null); }} className={btnSecondary}>Cancel</button>
            <button form="edit-user-form" type="submit" className={btnPrimary} disabled={submitting}>
              {submitting ? <ButtonSpinner /> : "Save Changes"}
            </button>
          </>
        }
      >
        <form id="edit-user-form" onSubmit={handleEditSubmit(onEditSubmit)}>
          {formFields(registerEdit, editErrors)}
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
