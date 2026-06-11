import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import useAxios from "../../../hooks/useAxios";
import PageHeader from "../../../components/ui/PageHeader";
import Modal from "../../../components/ui/Modal";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import TableSkeleton from "../../../components/ui/TableSkeleton";
import EmptyState from "../../../components/ui/EmptyState";
import ButtonSpinner from "../../../components/ui/ButtonSpinner";
import { inputClass, labelClass, selectClass, btnPrimary, btnSecondary, btnIcon } from "../../../lib/utils";
import toast from "react-hot-toast";

export default function Buildings() {
  const axios = useAxios();
  const [branches, setBranches] = useState([]);
  const [allBuildings, setAllBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [filterBranch, setFilterBranch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [branchesRes, buildingsRes, floorsRes] = await Promise.all([
        axios.get("/branches"),
        axios.get("/buildings/all"),
        axios.get("/floors/all"),
      ]);
      setBranches(branchesRes.data);
      setAllBuildings(buildingsRes.data);
      setFloors(floorsRes.data);
    } catch {
      toast.error("Failed to load buildings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [axios]);

  const displayedBuildings = filterBranch
    ? allBuildings.filter((b) => b.branch_id === filterBranch)
    : allBuildings;

  const getBranchName = (branchId) =>
    branches.find((b) => b._id === branchId)?.name || "—";

  const getFloorCount = (buildingId) =>
    floors.filter((f) => f.building_id === buildingId).length;

  const openAdd = () => {
    setEditingBuilding(null);
    reset({ name: "", branch_id: filterBranch || "" });
    setModalOpen(true);
  };

  const openEdit = (building) => {
    setEditingBuilding(building);
    reset({ name: building.name, branch_id: building.branch_id });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editingBuilding) {
        await axios.put(`/buildings/${editingBuilding._id}`, data);
        toast.success("Building updated successfully");
      } else {
        await axios.post("/buildings", data);
        toast.success("Building added successfully");
      }
      await fetchData();
      setModalOpen(false);
      reset();
    } catch {
      toast.error(editingBuilding ? "Failed to update building" : "Failed to add building");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`/buildings/${deleteTarget._id}`);
      toast.success("Building deleted successfully");
      await fetchData();
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete building");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Buildings"
        subtitle={`${displayedBuildings.length} building${displayedBuildings.length !== 1 ? "s" : ""}`}
        action={
          <button onClick={openAdd} className={btnPrimary}>
            <Plus size={16} />
            Add Building
          </button>
        }
      />

      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
        <label className={labelClass}>Filter by Branch</label>
        <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)} className={`${selectClass} max-w-xs`}>
          <option value="">All Branches</option>
          {branches.map((b) => (
            <option key={b._id} value={b._id}>{b.name}</option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["Building Name", "Branch", "Floor Count", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={4} cols={4} />
              ) : displayedBuildings.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <EmptyState message="No buildings found" actionLabel="Add your first building" onAction={openAdd} icon={Building2} />
                  </td>
                </tr>
              ) : (
                displayedBuildings.map((building, index) => (
                  <tr key={building._id} className={`hover:bg-slate-50 transition-colors border-b border-slate-100 ${index === displayedBuildings.length - 1 ? "border-b-0" : ""}`}>
                    <td className="px-4 py-3.5 text-sm font-medium text-slate-800">{building.name}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-700">{getBranchName(building.branch_id)}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-700">{getFloorCount(building._id)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(building)} className={btnIcon}><Pencil size={16} /></button>
                        <button onClick={() => setDeleteTarget(building)} className={`${btnIcon} hover:text-red-600`}><Trash2 size={16} /></button>
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
        title={editingBuilding ? "Edit Building" : "Add Building"}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className={btnSecondary}>Cancel</button>
            <button form="building-form" type="submit" className={btnPrimary} disabled={submitting}>
              {submitting ? <ButtonSpinner /> : editingBuilding ? "Save Changes" : "Add Building"}
            </button>
          </>
        }
      >
        <form id="building-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <label className={labelClass}>Building Name</label>
            <input {...register("name", { required: "Name is required" })} placeholder="Building name" className={inputClass} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message={`Delete building "${deleteTarget?.name}"?`}
        loading={deleting}
      />
    </div>
  );
}
