import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Plus, Pencil, Trash2, Building2, Layers, DoorOpen, ChevronDown, ChevronUp } from "lucide-react";
import useAxios from "../../../hooks/useAxios";
import PageHeader from "../../../components/ui/PageHeader";
import Modal from "../../../components/ui/Modal";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import EmptyState from "../../../components/ui/EmptyState";
import ButtonSpinner from "../../../components/ui/ButtonSpinner";
import { inputClass, labelClass, selectClass, btnPrimary, btnSecondary, btnIcon } from "../../../lib/utils";
import toast from "react-hot-toast";

const defaultBuilding = (index) => ({
  name: `Building ${index + 1}`,
  floorCount: 1,
  roomsPerFloor: 1,
});

export default function Branches() {
  const axios = useAxios();
  const [branches, setBranches] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [setupStructure, setSetupStructure] = useState(false);
  const [buildingConfigs, setBuildingConfigs] = useState([defaultBuilding(0)]);
  const [expandedBuilding, setExpandedBuilding] = useState(0);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

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
      setFloors(floorsRes.data);
      setRooms(roomsRes.data);
    } catch {
      toast.error("Failed to load branches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [axios]);

  const branchStats = useMemo(() => {
    const stats = {};
    branches.forEach((branch) => {
      const branchBuildings = buildings.filter((b) => b.branch_id === branch._id);
      const buildingIds = branchBuildings.map((b) => b._id);
      const branchFloors = floors.filter((f) => buildingIds.includes(f.building_id));
      const floorIds = branchFloors.map((f) => f._id);
      const branchRooms = rooms.filter((r) => floorIds.includes(r.floor_id));
      stats[branch._id] = {
        buildings: branchBuildings.length,
        floors: branchFloors.length,
        rooms: branchRooms.length,
      };
    });
    return stats;
  }, [branches, buildings, floors, rooms]);

  const structurePreview = useMemo(() => {
    let totalFloors = 0;
    let totalRooms = 0;
    buildingConfigs.forEach((b) => {
      const floors = Number(b.floorCount) || 0;
      const rooms = Number(b.roomsPerFloor) || 0;
      totalFloors += floors;
      totalRooms += floors * rooms;
    });
    return { buildings: buildingConfigs.length, floors: totalFloors, rooms: totalRooms };
  }, [buildingConfigs]);

  const resetModalState = () => {
    reset({ name: "" });
    setSetupStructure(false);
    setBuildingConfigs([defaultBuilding(0)]);
    setExpandedBuilding(0);
  };

  const openAdd = () => {
    setEditingBranch(null);
    resetModalState();
    setModalOpen(true);
  };

  const openEdit = (branch) => {
    setEditingBranch(branch);
    reset({ name: branch.name });
    setSetupStructure(false);
    setModalOpen(true);
  };

  const setBuildingCount = (count) => {
    const n = Math.max(0, Math.min(20, Number(count) || 0));
    if (n === 0) {
      setBuildingConfigs([]);
      return;
    }
    setBuildingConfigs((prev) => {
      const next = [...prev];
      while (next.length < n) next.push(defaultBuilding(next.length));
      while (next.length > n) next.pop();
      return next;
    });
  };

  const updateBuildingConfig = (index, field, value) => {
    setBuildingConfigs((prev) =>
      prev.map((b, i) => (i === index ? { ...b, [field]: value } : b))
    );
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editingBranch) {
        await axios.put(`/branches/${editingBranch._id}`, { name: data.name });
        toast.success("Branch updated successfully");
      } else if (setupStructure && buildingConfigs.length > 0) {
        const payload = {
          name: data.name,
          buildings: buildingConfigs.map((b) => ({
            name: b.name,
            floorCount: Number(b.floorCount) || 0,
            roomsPerFloor: Number(b.roomsPerFloor) || 0,
          })),
        };
        const res = await axios.post("/branches/with-structure", payload);
        const { created } = res.data;
        toast.success(
          `Branch created with ${created.buildings} building(s), ${created.floors} floor(s), ${created.rooms} room(s)`
        );
      } else {
        await axios.post("/branches", { name: data.name });
        toast.success("Branch added successfully");
      }
      await fetchData();
      setModalOpen(false);
      resetModalState();
    } catch {
      toast.error(editingBranch ? "Failed to update branch" : "Failed to add branch");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`/branches/${deleteTarget._id}`);
      toast.success("Branch deleted successfully");
      await fetchData();
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete branch");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Branches"
        subtitle={`${branches.length} branch${branches.length !== 1 ? "es" : ""} total`}
        action={
          <button onClick={openAdd} className={btnPrimary}>
            <Plus size={16} />
            Add Branch
          </button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-2/3 mb-3" />
              <div className="h-4 bg-slate-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : branches.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <EmptyState message="No branches found" actionLabel="Add your first branch" onAction={openAdd} icon={Building2} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((branch) => {
            const stat = branchStats[branch._id] || { buildings: 0, floors: 0, rooms: 0 };
            return (
              <div key={branch._id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Building2 size={20} className="text-emerald-600" />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(branch)} className={btnIcon} title="Edit">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => setDeleteTarget(branch)} className={`${btnIcon} hover:text-red-600`} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 className="text-base font-semibold text-slate-800 mb-3">{branch.name}</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full px-2.5 py-1">
                    <Building2 size={12} /> {stat.buildings} buildings
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full px-2.5 py-1">
                    <Layers size={12} /> {stat.floors} floors
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full px-2.5 py-1">
                    <DoorOpen size={12} /> {stat.rooms} rooms
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); resetModalState(); }}
        title={editingBranch ? "Edit Branch" : "Add Branch"}
        size="lg"
        footer={
          <>
            <button onClick={() => { setModalOpen(false); resetModalState(); }} className={btnSecondary}>Cancel</button>
            <button form="branch-form" type="submit" className={btnPrimary} disabled={submitting}>
              {submitting ? <ButtonSpinner /> : editingBranch ? "Save Changes" : "Create Branch"}
            </button>
          </>
        }
      >
        <form id="branch-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className={labelClass}>Branch Name</label>
            <input
              {...register("name", { required: "Branch name is required" })}
              placeholder="e.g. Dhaka Branch"
              className={inputClass}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {!editingBranch && (
            <>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition">
                <input
                  type="checkbox"
                  checked={setupStructure}
                  onChange={(e) => {
                    setSetupStructure(e.target.checked);
                    if (e.target.checked && buildingConfigs.length === 0) {
                      setBuildingConfigs([defaultBuilding(0)]);
                    }
                  }}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <p className="text-sm font-medium text-slate-800">Setup buildings, floors & rooms now</p>
                  <p className="text-xs text-slate-500">Optional — add full hostel structure while creating the branch</p>
                </div>
              </label>

              {setupStructure && (
                <div className="space-y-4 border-t border-slate-100 pt-4">
                  <div>
                    <label className={labelClass}>How many buildings?</label>
                    <select
                      value={buildingConfigs.length}
                      onChange={(e) => setBuildingCount(e.target.value)}
                      className={selectClass}
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n}>{n === 0 ? "Select count" : `${n} building${n > 1 ? "s" : ""}`}</option>
                      ))}
                    </select>
                  </div>

                  {buildingConfigs.map((building, index) => (
                    <div key={index} className="border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setExpandedBuilding(expandedBuilding === index ? -1 : index)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition text-left"
                      >
                        <span className="text-sm font-semibold text-slate-800">
                          {building.name || `Building ${index + 1}`}
                        </span>
                        {expandedBuilding === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>

                      {expandedBuilding === index && (
                        <div className="p-4 space-y-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-3">
                            <label className={labelClass}>Building Name</label>
                            <input
                              value={building.name}
                              onChange={(e) => updateBuildingConfig(index, "name", e.target.value)}
                              placeholder={`Building ${index + 1}`}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Floors</label>
                            <input
                              type="number"
                              min={1}
                              max={50}
                              value={building.floorCount}
                              onChange={(e) => updateBuildingConfig(index, "floorCount", e.target.value)}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Rooms per floor</label>
                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={building.roomsPerFloor}
                              onChange={(e) => updateBuildingConfig(index, "roomsPerFloor", e.target.value)}
                              className={inputClass}
                            />
                          </div>
                          <div className="flex items-end">
                            <p className="text-xs text-slate-500 pb-2">
                              = {(Number(building.floorCount) || 0) * (Number(building.roomsPerFloor) || 0)} rooms
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {buildingConfigs.length > 0 && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-sm text-emerald-800">
                      <p className="font-semibold mb-1">Preview</p>
                      <p>
                        {structurePreview.buildings} building(s) · {structurePreview.floors} floor(s) · {structurePreview.rooms} room(s) will be created
                      </p>
                      <p className="text-xs text-emerald-600 mt-1">
                        Room numbers: 101, 102… on floor 1; 201, 202… on floor 2, etc.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message={`Delete branch "${deleteTarget?.name}"? This cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
