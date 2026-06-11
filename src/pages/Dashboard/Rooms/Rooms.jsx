import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Pencil, Trash2, DoorOpen } from "lucide-react";
import useAxios from "../../../hooks/useAxios";
import PageHeader from "../../../components/ui/PageHeader";
import Modal from "../../../components/ui/Modal";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import TableSkeleton from "../../../components/ui/TableSkeleton";
import EmptyState from "../../../components/ui/EmptyState";
import ButtonSpinner from "../../../components/ui/ButtonSpinner";
import { inputClass, labelClass, selectClass, btnPrimary, btnSecondary, btnIcon } from "../../../lib/utils";
import toast from "react-hot-toast";

export default function Rooms() {
  const axios = useAxios();
  const [branches, setBranches] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [filterBranch, setFilterBranch] = useState("");
  const [filterBuilding, setFilterBuilding] = useState("");
  const [filterFloor, setFilterFloor] = useState("");
  const [formBuildings, setFormBuildings] = useState([]);
  const [formFloors, setFormFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const formBranchId = watch("branch_id");
  const formBuildingId = watch("building_id");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [branchesRes, buildingsRes, floorsRes, roomsRes, bedsRes] = await Promise.all([
        axios.get("/branches"),
        axios.get("/buildings/all"),
        axios.get("/floors/all"),
        axios.get("/rooms/all"),
        axios.get("/beds/all"),
      ]);
      setBranches(branchesRes.data);
      setBuildings(buildingsRes.data);
      setFloors(floorsRes.data);
      setAllRooms(roomsRes.data);
      setBeds(bedsRes.data);
    } catch {
      toast.error("Failed to load rooms");
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

  const filterBuildings = filterBranch ? buildings.filter((b) => b.branch_id === filterBranch) : buildings;
  const filterFloors = filterBuilding ? floors.filter((f) => f.building_id === filterBuilding) : floors;

  const displayedRooms = allRooms.filter((r) => {
    if (filterFloor && r.floor_id !== filterFloor) return false;
    if (filterBuilding || filterBranch) {
      const floor = floors.find((f) => f._id === r.floor_id);
      if (!floor) return false;
      if (filterBuilding && floor.building_id !== filterBuilding) return false;
      if (filterBranch) {
        const building = buildings.find((b) => b._id === floor.building_id);
        if (!building || building.branch_id !== filterBranch) return false;
      }
    }
    return true;
  });

  const getFloorInfo = (floorId) => {
    const floor = floors.find((f) => f._id === floorId);
    if (!floor) return { floorNumber: "—", buildingName: "—" };
    const building = buildings.find((b) => b._id === floor.building_id);
    return { floorNumber: floor.floor_number, buildingName: building?.name || "—" };
  };

  const getBedCount = (roomId) => beds.filter((b) => b.room_id === roomId).length;

  const openAdd = () => {
    setEditingRoom(null);
    reset({
      branch_id: filterBranch || "",
      building_id: filterBuilding || "",
      floor_id: filterFloor || "",
      room_number: "",
      room_type: "Normal",
      capacity: 1,
    });
    setModalOpen(true);
  };

  const openEdit = (room) => {
    const floor = floors.find((f) => f._id === room.floor_id);
    const building = floor ? buildings.find((b) => b._id === floor.building_id) : null;
    setEditingRoom(room);
    reset({
      branch_id: building?.branch_id || "",
      building_id: floor?.building_id || "",
      floor_id: room.floor_id,
      room_number: room.room_number,
      room_type: room.room_type || "Normal",
      capacity: room.capacity || 1,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    const payload = {
      floor_id: data.floor_id,
      room_number: data.room_number,
      room_type: data.room_type || "Normal",
      capacity: Number(data.capacity) || 1,
    };
    try {
      if (editingRoom) {
        await axios.put(`/rooms/${editingRoom._id}`, payload);
        toast.success("Room updated successfully");
      } else {
        await axios.post("/rooms", payload);
        toast.success("Room added successfully");
      }
      await fetchData();
      setModalOpen(false);
      reset();
    } catch {
      toast.error(editingRoom ? "Failed to update room" : "Failed to add room");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`/rooms/${deleteTarget._id}`);
      toast.success("Room deleted successfully");
      await fetchData();
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete room");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Rooms"
        subtitle={`${displayedRooms.length} room${displayedRooms.length !== 1 ? "s" : ""}`}
        action={
          <button onClick={openAdd} className={btnPrimary}>
            <Plus size={16} />
            Add Room
          </button>
        }
      />

      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Branch</label>
          <select value={filterBranch} onChange={(e) => { setFilterBranch(e.target.value); setFilterBuilding(""); setFilterFloor(""); }} className={selectClass}>
            <option value="">All Branches</option>
            {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Building</label>
          <select value={filterBuilding} onChange={(e) => { setFilterBuilding(e.target.value); setFilterFloor(""); }} className={selectClass}>
            <option value="">All Buildings</option>
            {filterBuildings.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Floor</label>
          <select value={filterFloor} onChange={(e) => setFilterFloor(e.target.value)} className={selectClass}>
            <option value="">All Floors</option>
            {filterFloors.map((f) => <option key={f._id} value={f._id}>Floor {f.floor_number}</option>)}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["Room #", "Type", "Capacity", "Floor", "Building", "Beds", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={4} cols={7} />
              ) : displayedRooms.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState message="No rooms found" actionLabel="Add your first room" onAction={openAdd} icon={DoorOpen} />
                  </td>
                </tr>
              ) : (
                displayedRooms.map((room, index) => {
                  const { floorNumber, buildingName } = getFloorInfo(room.floor_id);
                  const bedCount = getBedCount(room._id);
                  return (
                    <tr key={room._id} className={`hover:bg-slate-50 transition-colors border-b border-slate-100 ${index === displayedRooms.length - 1 ? "border-b-0" : ""}`}>
                      <td className="px-4 py-3.5 text-sm font-medium text-slate-800">{room.room_number}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-700">{room.room_type || "Normal"}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-700">{room.capacity || 1}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-700">Floor {floorNumber}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-700">{buildingName}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-700">{bedCount} / {room.capacity || 1}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(room)} className={btnIcon}><Pencil size={16} /></button>
                          <button onClick={() => setDeleteTarget(room)} className={`${btnIcon} hover:text-red-600`}><Trash2 size={16} /></button>
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
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRoom ? "Edit Room" : "Add Room"}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className={btnSecondary}>Cancel</button>
            <button form="room-form" type="submit" className={btnPrimary} disabled={submitting}>
              {submitting ? <ButtonSpinner /> : editingRoom ? "Save Changes" : "Add Room"}
            </button>
          </>
        }
      >
        <form id="room-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <label className={labelClass}>Room Number</label>
            <input {...register("room_number", { required: "Required" })} className={inputClass} />
            {errors.room_number && <p className="text-red-500 text-xs mt-1">{errors.room_number.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Room Type</label>
              <input {...register("room_type")} placeholder="Normal" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Capacity</label>
              <input type="number" min={1} {...register("capacity")} className={inputClass} />
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message={`Delete room ${deleteTarget?.room_number}?`}
        loading={deleting}
      />
    </div>
  );
}
