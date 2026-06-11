import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Pencil, Trash2, Layers } from "lucide-react";
import useAxios from "../../../hooks/useAxios";
import PageHeader from "../../../components/ui/PageHeader";
import Modal from "../../../components/ui/Modal";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import TableSkeleton from "../../../components/ui/TableSkeleton";
import EmptyState from "../../../components/ui/EmptyState";
import ButtonSpinner from "../../../components/ui/ButtonSpinner";
import { inputClass, labelClass, selectClass, btnPrimary, btnSecondary, btnIcon } from "../../../lib/utils";
import toast from "react-hot-toast";

export default function Floors() {
  const axios = useAxios();
  const [branches, setBranches] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [allFloors, setAllFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [filterBranch, setFilterBranch] = useState("");
  const [filterBuilding, setFilterBuilding] = useState("");
  const [formBuildings, setFormBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFloor, setEditingFloor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const formBranchId = watch("branch_id");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [branchesRes, buildingsRes, floorsRes, roomsRes] = await Promise.all([
        axios.get("/branches"),
        axios.get("/buildings/all"),
        axios.get("/floors/all"),
        axios.get("/rooms/all"),
      ]);
      setBranches(branchesRes.data);
      setBuildings(buildingsRes.data);
      setAllFloors(floorsRes.data);
      setRooms(roomsRes.data);
    } catch {
      toast.error("Failed to load floors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [axios]);

  useEffect(() => {
    if (formBranchId) {
      setFormBuildings(buildings.filter((b) => b.branch_id === formBranchId));
    } else {
      setFormBuildings([]);
    }
  }, [formBranchId, buildings]);

  const filterBuildings = filterBranch
    ? buildings.filter((b) => b.branch_id === filterBranch)
    : buildings;

  const displayedFloors = allFloors.filter((f) => {
    if (filterBuilding && f.building_id !== filterBuilding) return false;
    if (filterBranch) {
      const building = buildings.find((b) => b._id === f.building_id);
      if (!building || building.branch_id !== filterBranch) return false;
    }
    return true;
  });

  const getBuildingName = (buildingId) =>
    buildings.find((b) => b._id === buildingId)?.name || "—";

  const getRoomCount = (floorId) =>
    rooms.filter((r) => r.floor_id === floorId).length;

  const openAdd = () => {
    setEditingFloor(null);
    reset({ branch_id: filterBranch || "", building_id: filterBuilding || "", floor_number: "" });
    setModalOpen(true);
  };

  const openEdit = (floor) => {
    const building = buildings.find((b) => b._id === floor.building_id);
    setEditingFloor(floor);
    reset({
      branch_id: building?.branch_id || "",
      building_id: floor.building_id,
      floor_number: floor.floor_number,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    const payload = { floor_number: data.floor_number, building_id: data.building_id };
    try {
      if (editingFloor) {
        await axios.put(`/floors/${editingFloor._id}`, payload);
        toast.success("Floor updated successfully");
      } else {
        await axios.post("/floors", payload);
        toast.success("Floor added successfully");
      }
      await fetchData();
      setModalOpen(false);
      reset();
    } catch {
      toast.error(editingFloor ? "Failed to update floor" : "Failed to add floor");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`/floors/${deleteTarget._id}`);
      toast.success("Floor deleted successfully");
      await fetchData();
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete floor");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Floors"
        subtitle={`${displayedFloors.length} floor${displayedFloors.length !== 1 ? "s" : ""}`}
        action={
          <button onClick={openAdd} className={btnPrimary}>
            <Plus size={16} />
            Add Floor
          </button>
        }
      />

      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Branch</label>
          <select
            value={filterBranch}
            onChange={(e) => { setFilterBranch(e.target.value); setFilterBuilding(""); }}
            className={selectClass}
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Building</label>
          <select value={filterBuilding} onChange={(e) => setFilterBuilding(e.target.value)} className={selectClass}>
            <option value="">All Buildings</option>
            {filterBuildings.map((b) => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["Floor Number", "Building", "Room Count", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={4} cols={4} />
              ) : displayedFloors.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <EmptyState message="No floors found" actionLabel="Add your first floor" onAction={openAdd} icon={Layers} />
                  </td>
                </tr>
              ) : (
                displayedFloors.map((floor, index) => (
                  <tr key={floor._id} className={`hover:bg-slate-50 transition-colors border-b border-slate-100 ${index === displayedFloors.length - 1 ? "border-b-0" : ""}`}>
                    <td className="px-4 py-3.5 text-sm font-medium text-slate-800">Floor {floor.floor_number}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-700">{getBuildingName(floor.building_id)}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-700">{getRoomCount(floor._id)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(floor)} className={btnIcon}><Pencil size={16} /></button>
                        <button onClick={() => setDeleteTarget(floor)} className={`${btnIcon} hover:text-red-600`}><Trash2 size={16} /></button>
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
        title={editingFloor ? "Edit Floor" : "Add Floor"}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className={btnSecondary}>Cancel</button>
            <button form="floor-form" type="submit" className={btnPrimary} disabled={submitting}>
              {submitting ? <ButtonSpinner /> : editingFloor ? "Save Changes" : "Add Floor"}
            </button>
          </>
        }
      >
        <form id="floor-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>Branch</label>
            <select {...register("branch_id", { required: "Branch is required" })} className={selectClass}>
              <option value="">Select Branch</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
            {errors.branch_id && <p className="text-red-500 text-xs mt-1">{errors.branch_id.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Building</label>
            <select {...register("building_id", { required: "Building is required" })} className={selectClass}>
              <option value="">Select Building</option>
              {formBuildings.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
            {errors.building_id && <p className="text-red-500 text-xs mt-1">{errors.building_id.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Floor Number</label>
            <input {...register("floor_number", { required: "Floor number is required" })} placeholder="e.g. 1" className={inputClass} />
            {errors.floor_number && <p className="text-red-500 text-xs mt-1">{errors.floor_number.message}</p>}
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message={`Delete floor ${deleteTarget?.floor_number}?`}
        loading={deleting}
      />
    </div>
  );
}
