import { useEffect, useState } from "react";
import Select from "react-select";
import { Plus, Pencil, Trash2, CreditCard } from "lucide-react";
import useAxios from "../../../hooks/useAxios";
import PageHeader from "../../../components/ui/PageHeader";
import Modal from "../../../components/ui/Modal";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import StatusBadge from "../../../components/ui/StatusBadge";
import TableSkeleton from "../../../components/ui/TableSkeleton";
import EmptyState from "../../../components/ui/EmptyState";
import ButtonSpinner from "../../../components/ui/ButtonSpinner";
import { inputClass, labelClass, selectClass, btnPrimary, btnSecondary, btnSuccess, btnIcon, formatCurrency } from "../../../lib/utils";
import toast from "react-hot-toast";

const selectStyles = {
  control: (base) => ({
    ...base,
    borderColor: "#e2e8f0",
    borderRadius: "0.5rem",
    minHeight: "42px",
    fontSize: "14px",
    boxShadow: "none",
  }),
  menu: (base) => ({ ...base, fontSize: "14px", zIndex: 20 }),
};

export default function Payments() {
  const axios = useAxios();
  const [branches, setBranches] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({ branch: "", building: "", floor: "", room: "", bed: "", user: "" });

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [discount, setDiscount] = useState("");
  const [method, setMethod] = useState("cash");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const [payTarget, setPayTarget] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [editTarget, setEditTarget] = useState(null);
  const [editPaid, setEditPaid] = useState("");
  const [editMethod, setEditMethod] = useState("cash");
  const [editMonth, setEditMonth] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [branchesRes, buildingsRes, floorsRes, roomsRes, bedsRes, usersRes, paymentsRes] = await Promise.all([
        axios.get("/branches"),
        axios.get("/buildings/all"),
        axios.get("/floors/all"),
        axios.get("/rooms/all"),
        axios.get("/beds/all"),
        axios.get("/users"),
        axios.get("/payments"),
      ]);
      setBranches(branchesRes.data);
      setBuildings(buildingsRes.data);
      setFloors(floorsRes.data);
      setRooms(roomsRes.data);
      setBeds(bedsRes.data);
      setUsers(usersRes.data);
      setPayments(paymentsRes.data);
    } catch {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [axios]);

  const formFilteredBuildings = selectedBranch ? buildings.filter((b) => b.branch_id === selectedBranch.value) : [];
  const formFilteredFloors = selectedBuilding ? floors.filter((f) => f.building_id === selectedBuilding.value) : [];
  const formFilteredRooms = selectedFloor ? rooms.filter((r) => r.floor_id === selectedFloor.value) : [];
  const formFilteredBeds = selectedRoom ? beds.filter((b) => b.room_id === selectedRoom.value) : [];
  const payableAmount = Number(amount || 0) - Number(discount || 0);

  const filteredBuildings = filters.branch ? buildings.filter((b) => b.branch_id === filters.branch) : buildings;
  const filteredFloors = filters.building ? floors.filter((f) => f.building_id === filters.building) : floors;
  const filteredRooms = filters.floor ? rooms.filter((r) => r.floor_id === filters.floor) : rooms;
  const filteredBeds = filters.room ? beds.filter((b) => b.room_id === filters.room) : beds;

  const filteredPayments = payments.filter((p) =>
    (!filters.branch || p.branch_id === filters.branch) &&
    (!filters.building || p.building_id === filters.building) &&
    (!filters.floor || p.floor_id === filters.floor) &&
    (!filters.room || p.room_id === filters.room) &&
    (!filters.bed || p.bed_id === filters.bed) &&
    (!filters.user || p.user_id === filters.user)
  );

  const handleFilterChange = (name, value) => {
    if (name === "branch") setFilters({ branch: value, building: "", floor: "", room: "", bed: "", user: filters.user });
    else if (name === "building") setFilters({ ...filters, building: value, floor: "", room: "", bed: "" });
    else if (name === "floor") setFilters({ ...filters, floor: value, room: "", bed: "" });
    else if (name === "room") setFilters({ ...filters, room: value, bed: "" });
    else setFilters({ ...filters, [name]: value });
  };

  const resetAddForm = () => {
    setSelectedBranch(null);
    setSelectedBuilding(null);
    setSelectedFloor(null);
    setSelectedRoom(null);
    setSelectedBed(null);
    setSelectedUser(null);
    setAmount("");
    setDiscount("");
    setMethod("cash");
    setMonth(new Date().toISOString().slice(0, 7));
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!selectedUser || !selectedBranch || !selectedBuilding) {
      toast.error("Select user, branch, and building");
      return;
    }
    const existing = payments.find((p) => p.user_id === selectedUser.value && p.month === month);
    if (existing) {
      toast.error(`Payment for ${selectedUser.label} in ${month} already exists`);
      return;
    }

    setSubmitting(true);
    const payload = {
      branch_id: selectedBranch.value,
      building_id: selectedBuilding.value,
      floor_id: selectedFloor?.value || null,
      room_id: selectedRoom?.value || null,
      bed_id: selectedBed?.value || null,
      user_id: selectedUser.value,
      amount: Number(amount),
      discount: Number(discount || 0),
      payable: payableAmount,
      paid: 0,
      due: payableAmount,
      method,
      date: new Date().toISOString().split("T")[0],
      month,
      status: "pending",
    };

    try {
      await axios.post("/payments", payload);
      await fetchData();
      toast.success("Payment added successfully");
      resetAddForm();
      setAddModalOpen(false);
    } catch {
      toast.error("Failed to add payment");
    } finally {
      setSubmitting(false);
    }
  };

  const openPayModal = (payment) => {
    const totalPayable = (payment.amount || 0) - (payment.discount || 0);
    const currentDue = totalPayable - (payment.paid || 0);
    setPayTarget(payment);
    setPayAmount(String(currentDue));
    setPayModalOpen(true);
  };

  const handleMakePaid = async (e) => {
    e.preventDefault();
    if (!payTarget) return;
    const totalPayable = (payTarget.amount || 0) - (payTarget.discount || 0);
    const currentPaid = payTarget.paid || 0;
    const currentDue = totalPayable - currentPaid;
    const added = Number(payAmount);
    if (!added || added <= 0 || added > currentDue) {
      toast.error(`Enter amount between 1 and ${currentDue}`);
      return;
    }

    setSubmitting(true);
    const newPaid = currentPaid + added;
    const newDue = totalPayable - newPaid;
    const newStatus = newDue <= 0 ? "paid" : "partial";

    try {
      await axios.put(`/payments/${payTarget._id}`, { paid: newPaid, due: newDue, status: newStatus });
      await fetchData();
      toast.success("Payment updated");
      setPayModalOpen(false);
      setPayTarget(null);
    } catch {
      toast.error("Failed to update payment");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (payment) => {
    setEditTarget(payment);
    setEditPaid(String(payment.paid || 0));
    setEditMethod(payment.method || "cash");
    setEditMonth(payment.month || "");
    setEditModalOpen(true);
  };

  const handleEditPayment = async (e) => {
    e.preventDefault();
    if (!editTarget) return;
    const totalPayable = (editTarget.amount || 0) - (editTarget.discount || 0);
    const newPaid = Number(editPaid);
    const newDue = totalPayable - newPaid;
    let newStatus = "pending";
    if (newPaid > 0 && newPaid < totalPayable) newStatus = "partial";
    else if (newPaid >= totalPayable) newStatus = "paid";

    setSubmitting(true);
    try {
      await axios.put(`/payments/${editTarget._id}`, {
        paid: newPaid,
        due: newDue,
        status: newStatus,
        method: editMethod,
        month: editMonth,
      });
      await fetchData();
      toast.success("Payment updated");
      setEditModalOpen(false);
      setEditTarget(null);
    } catch {
      toast.error("Failed to update payment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`/payments/${deleteTarget._id}`);
      await fetchData();
      toast.success("Payment deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete payment");
    } finally {
      setDeleting(false);
    }
  };

  const getLocation = (p) => {
    const branch = branches.find((b) => b._id === p.branch_id)?.name;
    const building = buildings.find((b) => b._id === p.building_id)?.name;
    const room = rooms.find((r) => r._id === p.room_id)?.room_number;
    const bed = beds.find((b) => b._id === p.bed_id)?.bed_number;
    return [branch, building, room ? `Room ${room}` : null, bed ? `Bed ${bed}` : null].filter(Boolean).join(" / ");
  };

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle={`${filteredPayments.length} payment${filteredPayments.length !== 1 ? "s" : ""}`}
        action={
          <button onClick={() => { resetAddForm(); setAddModalOpen(true); }} className={btnPrimary}>
            <Plus size={16} />
            Add Payment
          </button>
        }
      />

      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {[
            { name: "branch", label: "Branch", options: branches.map((b) => ({ id: b._id, name: b.name })), filtered: branches },
            { name: "building", label: "Building", options: filteredBuildings.map((b) => ({ id: b._id, name: b.name })), filtered: filteredBuildings },
            { name: "floor", label: "Floor", options: filteredFloors.map((f) => ({ id: f._id, name: f.floor_number })), filtered: filteredFloors },
            { name: "room", label: "Room", options: filteredRooms.map((r) => ({ id: r._id, name: r.room_number })), filtered: filteredRooms },
            { name: "bed", label: "Bed", options: filteredBeds.map((b) => ({ id: b._id, name: b.bed_number })), filtered: filteredBeds },
          ].map(({ name, label, options }) => (
            <div key={name}>
              <label className={labelClass}>{label}</label>
              <select value={filters[name]} onChange={(e) => handleFilterChange(name, e.target.value)} className={selectClass}>
                <option value="">All</option>
                {options.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
          ))}
          <div>
            <label className={labelClass}>Student</label>
            <select value={filters.user} onChange={(e) => handleFilterChange("user", e.target.value)} className={selectClass}>
              <option value="">All</option>
              {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => setFilters({ branch: "", building: "", floor: "", room: "", bed: "", user: "" })} className={`${btnSecondary} w-full`}>
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["Student", "Location", "Month", "Amount", "Discount", "Payable", "Paid", "Due", "Status", "Method", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={5} cols={11} />
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={11}>
                    <EmptyState message="No payments found" actionLabel="Add your first payment" onAction={() => setAddModalOpen(true)} icon={CreditCard} />
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p, index) => {
                  const user = users.find((u) => u._id === p.user_id);
                  const payable = (p.amount || 0) - (p.discount || 0);
                  const due = p.due ?? payable - (p.paid || 0);
                  return (
                    <tr key={p._id} className={`hover:bg-slate-50 transition-colors border-b border-slate-100 ${index === filteredPayments.length - 1 ? "border-b-0" : ""}`}>
                      <td className="px-4 py-3.5 text-sm font-medium text-slate-800">{user?.name || "—"}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-600 max-w-[180px] truncate">{getLocation(p)}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-700">{p.month}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-700">{formatCurrency(p.amount)}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-700">{formatCurrency(p.discount || 0)}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-700">{formatCurrency(payable)}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-700">{formatCurrency(p.paid || 0)}</td>
                      <td className={`px-4 py-3.5 text-sm font-medium ${due > 0 ? "text-red-600" : "text-slate-700"}`}>{formatCurrency(due)}</td>
                      <td className="px-4 py-3.5"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-3.5 text-sm text-slate-700 capitalize">{p.method}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          {due > 0 && (
                            <button onClick={() => openPayModal(p)} className={`${btnSuccess} !px-2 !py-1 text-xs`}>Pay</button>
                          )}
                          <button onClick={() => openEditModal(p)} className={btnIcon}><Pencil size={16} /></button>
                          <button onClick={() => setDeleteTarget(p)} className={`${btnIcon} hover:text-red-600`}><Trash2 size={16} /></button>
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

      {/* Add Payment Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Payment"
        size="lg"
        footer={
          <>
            <button onClick={() => setAddModalOpen(false)} className={btnSecondary}>Cancel</button>
            <button form="add-payment-form" type="submit" className={btnPrimary} disabled={submitting}>
              {submitting ? <ButtonSpinner /> : "Add Payment"}
            </button>
          </>
        }
      >
        <form id="add-payment-form" onSubmit={handleAddPayment} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>Branch</label><Select styles={selectStyles} options={branches.map((b) => ({ value: b._id, label: b.name }))} value={selectedBranch} onChange={setSelectedBranch} placeholder="Branch" /></div>
            <div><label className={labelClass}>Building</label><Select styles={selectStyles} options={formFilteredBuildings.map((b) => ({ value: b._id, label: b.name }))} value={selectedBuilding} onChange={setSelectedBuilding} placeholder="Building" /></div>
            <div><label className={labelClass}>Floor</label><Select styles={selectStyles} options={formFilteredFloors.map((f) => ({ value: f._id, label: `Floor ${f.floor_number}` }))} value={selectedFloor} onChange={setSelectedFloor} placeholder="Floor (optional)" isClearable /></div>
            <div><label className={labelClass}>Room</label><Select styles={selectStyles} options={formFilteredRooms.map((r) => ({ value: r._id, label: `Room ${r.room_number}` }))} value={selectedRoom} onChange={setSelectedRoom} placeholder="Room (optional)" isClearable /></div>
            <div><label className={labelClass}>Bed</label><Select styles={selectStyles} options={formFilteredBeds.map((b) => ({ value: b._id, label: `Bed ${b.bed_number}` }))} value={selectedBed} onChange={setSelectedBed} placeholder="Bed (optional)" isClearable /></div>
            <div><label className={labelClass}>Student</label><Select styles={selectStyles} options={users.map((u) => ({ value: u._id, label: u.name }))} value={selectedUser} onChange={setSelectedUser} placeholder="Student" /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={labelClass}>Month</label><input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Amount</label><input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Discount</label><input type="number" min={0} value={discount} onChange={(e) => setDiscount(e.target.value)} className={inputClass} /></div>
          </div>
          <div className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
            <span className="text-sm text-slate-600">Payable Amount</span>
            <span className="text-lg font-bold text-slate-900">{formatCurrency(payableAmount)}</span>
          </div>
          <div>
            <label className={labelClass}>Payment Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className={selectClass}>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="online">Online</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Pay Modal */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => { setPayModalOpen(false); setPayTarget(null); }}
        title={`Add Payment — ${users.find((u) => u._id === payTarget?.user_id)?.name || ""}`}
        footer={
          <>
            <button onClick={() => { setPayModalOpen(false); setPayTarget(null); }} className={btnSecondary}>Cancel</button>
            <button form="pay-form" type="submit" className={btnSuccess} disabled={submitting}>
              {submitting ? <ButtonSpinner /> : "Confirm Payment"}
            </button>
          </>
        }
      >
        {payTarget && (
          <form id="pay-form" onSubmit={handleMakePaid} className="space-y-4">
            <p className="text-sm text-slate-600">
              Due: <span className="font-semibold text-red-600">
                {formatCurrency((payTarget.amount || 0) - (payTarget.discount || 0) - (payTarget.paid || 0))}
              </span>
            </p>
            <div>
              <label className={labelClass}>Payment Amount</label>
              <input type="number" min={1} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className={inputClass} />
            </div>
          </form>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditTarget(null); }}
        title={`Edit Payment — ${users.find((u) => u._id === editTarget?.user_id)?.name || ""}`}
        footer={
          <>
            <button onClick={() => { setEditModalOpen(false); setEditTarget(null); }} className={btnSecondary}>Cancel</button>
            <button form="edit-payment-form" type="submit" className={btnPrimary} disabled={submitting}>
              {submitting ? <ButtonSpinner /> : "Save Changes"}
            </button>
          </>
        }
      >
        {editTarget && (
          <form id="edit-payment-form" onSubmit={handleEditPayment} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Amount</label><input type="number" value={editTarget.amount} disabled className={`${inputClass} bg-slate-50`} /></div>
              <div><label className={labelClass}>Discount</label><input type="number" value={editTarget.discount || 0} disabled className={`${inputClass} bg-slate-50`} /></div>
            </div>
            <div><label className={labelClass}>Paid Amount</label><input type="number" min={0} value={editPaid} onChange={(e) => setEditPaid(e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Method</label>
              <select value={editMethod} onChange={(e) => setEditMethod(e.target.value)} className={selectClass}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="online">Online</option>
              </select>
            </div>
            <div><label className={labelClass}>Month</label><input type="month" value={editMonth} onChange={(e) => setEditMonth(e.target.value)} className={inputClass} /></div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message="Delete this payment record? This cannot be undone."
        loading={deleting}
      />
    </div>
  );
}
