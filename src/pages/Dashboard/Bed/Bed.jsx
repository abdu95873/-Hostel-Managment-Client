import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Plus, Pencil, Trash2, BedDouble } from "lucide-react";
import useAxios from "../../../hooks/useAxios";
import PageHeader from "../../../components/ui/PageHeader";
import Modal from "../../../components/ui/Modal";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import TableSkeleton from "../../../components/ui/TableSkeleton";
import EmptyState from "../../../components/ui/EmptyState";
import ButtonSpinner from "../../../components/ui/ButtonSpinner";
import { inputClass, labelClass, selectClass, btnPrimary, btnSecondary, btnIcon, formatCurrency } from "../../../lib/utils";
import toast from "react-hot-toast";

export default function Beds() {
  const axios = useAxios();
  const [branches, setBranches] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [users, setUsers] = useState([]);
  const [formBuildings, setFormBuildings] = useState([]);
  const [formFloors, setFormFloors] = useState([]);
  const [formRooms, setFormRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBed, setEditingBed] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const formBranchId = watch("branch_id");
  const formBuildingId = watch("building_id");
  const formFloorId = watch("floor_id");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [branchesRes, buildingsRes, floorsRes, roomsRes, bedsRes, usersRes] = await Promise.all([
        axios.get("/branches"),
        axios.get("/buildings/all"),
        axios.get("/floors/all"),
        axios.get("/rooms/all"),
        axios.get("/beds/all"),
        axios.get("/users"),
      ]);
      setBranches(branchesRes.data);
      setBuildings(buildingsRes.data);
      setFloors(floorsRes.data);
      setRooms(roomsRes.data);
      setBeds(bedsRes.data);
      setUsers(usersRes.data);
    } catch {
      toast.error("Failed to load beds");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [axios]);

  useEffect(() => {
    setFormBuildings(formBranchId ? buildings.filter((b) => b.branch_id === formBranchId) : []);
  }, [formBranchId, buildings]);

  useEffect(() => {
    setFormFloors(formBuildingId ? floors.filter((f) => f.building_id === formBuildingId) : []);
  }, [formBuildingId, floors]);

  useEffect(() => {
    setFormRooms(formFloorId ? rooms.filter((r) => r.floor_id === formFloorId) : []);
  }, [formFloorId, rooms]);

  const flatBeds = useMemo(() => {
    return beds.map((bed) => {
      const room = rooms.find((r) => r._id === bed.room_id);
      const floor = room ? floors.find((f) => f._id === room.floor_id) : null;
      const building = floor ? buildings.find((b) => b._id === floor.building_id) : null;
      const branch = building ? branches.find((br) => br._id === building.branch_id) : null;
      const occupant = users.find((u) => u._id === bed.occupant);
      return {
        ...bed,
        branchName: branch?.name || "—",
        buildingName: building?.name || "—",
        floorNumber: floor?.floor_number ?? "—",
        roomNumber: room?.room_number ?? "—",
        occupantName: occupant?.name || "—",
        branchId: branch?._id,
        buildingId: building?._id,
        floorId: floor?._id,
      };
    });
  }, [beds, rooms, floors, buildings, branches, users]);

  const openAdd = () => {
    setEditingBed(null);
    reset({ branch_id: "", building_id: "", floor_id: "", room_id: "", bed_number: "", amount: "", discount: 0, occupant: "" });
    setModalOpen(true);
  };

  const openEdit = (bed) => {
    setEditingBed(bed);
    reset({
      branch_id: bed.branchId || "",
      building_id: bed.buildingId || "",
      floor_id: bed.floorId || "",
      room_id: bed.room_id,
      bed_number: bed.bed_number,
      amount: bed.amount,
      discount: bed.discount || 0,
      occupant: bed.occupant || "",
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    const payload = {
      room_id: data.room_id,
      bed_number: data.bed_number,
      amount: Number(data.amount),
      discount: Number(data.discount || 0),
      occupant: data.occupant || null,
    };

    const duplicate = beds.some(
      (b) =>
        b.room_id === data.room_id &&
        String(b.bed_number) === String(data.bed_number) &&
        b._id !== editingBed?._id
    );
    if (duplicate) {
      toast.error("A bed with this number already exists in this room");
      setSubmitting(false);
      return;
    }

    try {
      if (editingBed) {
        await axios.put(`/beds/${editingBed._id}`, payload);
        toast.success("Bed updated successfully");
      } else {
        await axios.post("/beds", payload);
        toast.success("Bed added successfully");
      }
      await fetchData();
      setModalOpen(false);
      reset();
    } catch {
      toast.error(editingBed ? "Failed to update bed" : "Failed to add bed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`/beds/${deleteTarget._id}`);
      toast.success("Bed deleted successfully");
      await fetchData();
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete bed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Beds"
        subtitle={`${flatBeds.length} bed${flatBeds.length !== 1 ? "s" : ""} total`}
        action={
          <button onClick={openAdd} className={btnPrimary}>
            <Plus size={16} />
            Add Bed
          </button>
        }
      />

      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["Branch", "Building", "Floor", "Room", "Bed #", "Amount", "Discount", "Occupant", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={5} cols={9} />
              ) : flatBeds.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <EmptyState message="No beds found" actionLabel="Add your first bed" onAction={openAdd} icon={BedDouble} />
                  </td>
                </tr>
              ) : (
                flatBeds.map((bed, index) => (
                  <tr key={bed._id} className={`hover:bg-slate-50 transition-colors border-b border-slate-100 ${index === flatBeds.length - 1 ? "border-b-0" : ""}`}>
                    <td className="px-4 py-3.5 text-sm text-slate-700">{bed.branchName}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-700">{bed.buildingName}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-700">Floor {bed.floorNumber}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-700">Room {bed.roomNumber}</td>
                    <td className="px-4 py-3.5 text-sm font-medium text-slate-800">{bed.bed_number}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-700">{formatCurrency(bed.amount)}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-700">{formatCurrency(bed.discount || 0)}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-700">{bed.occupantName}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(bed)} className={btnIcon}><Pencil size={16} /></button>
                        <button onClick={() => setDeleteTarget(bed)} className={`${btnIcon} hover:text-red-600`}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBed ? "Edit Bed" : "Add Bed"}
        size="lg"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className={btnSecondary}>Cancel</button>
            <button form="bed-form" type="submit" className={btnPrimary} disabled={submitting}>
              {submitting ? <ButtonSpinner /> : editingBed ? "Save Changes" : "Add Bed"}
            </button>
          </>
        }
      >
        <form id="bed-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Branch</label>
            <select {...register("branch_id", { required: true })} className={selectClass}>
              <option value="">Select Branch</option>
              {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Building</label>
            <select {...register("building_id", { required: true })} className={selectClass}>
              <option value="">Select Building</option>
              {formBuildings.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Floor</label>
            <select {...register("floor_id", { required: true })} className={selectClass}>
              <option value="">Select Floor</option>
              {formFloors.map((f) => <option key={f._id} value={f._id}>Floor {f.floor_number}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Room</label>
            <select {...register("room_id", { required: true })} className={selectClass}>
              <option value="">Select Room</option>
              {formRooms.map((r) => <option key={r._id} value={r._id}>Room {r.room_number}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Bed Number</label>
            <input {...register("bed_number", { required: "Required" })} className={inputClass} />
            {errors.bed_number && <p className="text-red-500 text-xs mt-1">{errors.bed_number.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Amount</label>
            <input type="number" min={0} {...register("amount", { required: "Required" })} className={inputClass} />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Discount</label>
            <input type="number" min={0} {...register("discount")} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Occupant (optional)</label>
            <select {...register("occupant")} className={selectClass}>
              <option value="">None</option>
              {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message={`Delete bed ${deleteTarget?.bed_number}?`}
        loading={deleting}
      />
    </div>
  );
}
