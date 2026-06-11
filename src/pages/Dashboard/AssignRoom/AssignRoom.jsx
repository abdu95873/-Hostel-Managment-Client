import { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import { BedDouble, UserMinus } from "lucide-react";
import useAxios from "../../../hooks/useAxios";
import PageHeader from "../../../components/ui/PageHeader";
import SearchInput from "../../../components/ui/SearchInput";
import StatusBadge from "../../../components/ui/StatusBadge";
import EmptyState from "../../../components/ui/EmptyState";
import ButtonSpinner from "../../../components/ui/ButtonSpinner";
import { btnPrimary, btnDanger } from "../../../lib/utils";
import toast from "react-hot-toast";

const selectStyles = {
  control: (base) => ({
    ...base,
    borderColor: "#e2e8f0",
    borderRadius: "0.5rem",
    minHeight: "42px",
    fontSize: "14px",
    boxShadow: "none",
    "&:hover": { borderColor: "#6366f1" },
  }),
  menu: (base) => ({ ...base, fontSize: "14px", zIndex: 20 }),
};

export default function AssignRoom() {
  const axios = useAxios();
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [selected, setSelected] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null);
  const [unassigning, setUnassigning] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, branchesRes, buildingsRes, floorsRes, roomsRes, bedsRes] = await Promise.all([
        axios.get("/users"),
        axios.get("/branches"),
        axios.get("/buildings/all"),
        axios.get("/floors/all"),
        axios.get("/rooms/all"),
        axios.get("/beds/all"),
      ]);
      setUsers(usersRes.data);
      setBranches(branchesRes.data);
      setBuildings(buildingsRes.data);
      setFloors(floorsRes.data);
      setRooms(roomsRes.data);
      setBeds(bedsRes.data);
    } catch {
      toast.error("Failed to load assignment data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [axios]);

  const handleSelect = (userId, field, value) => {
    setSelected((prev) => {
      const prevUser = prev[userId] || {};
      const updated = { ...prevUser, [field]: value };
      if (field === "branch") {
        delete updated.building;
        delete updated.floor;
        delete updated.room;
        delete updated.bed;
      }
      if (field === "building") {
        delete updated.floor;
        delete updated.room;
        delete updated.bed;
      }
      if (field === "floor") {
        delete updated.room;
        delete updated.bed;
      }
      if (field === "room") delete updated.bed;
      return { ...prev, [userId]: updated };
    });
  };

  const handleAssign = async (userId) => {
    const data = selected[userId];
    if (!data?.bed) {
      toast.error("Please select a bed first");
      return;
    }
    setAssigning(userId);
    try {
      await axios.post("/assign-bed", { user_id: userId, bed_id: data.bed });
      setBeds((prev) => prev.map((b) => (b._id === data.bed ? { ...b, occupant: userId } : b)));
      toast.success("Bed assigned successfully");
      setSelected((prev) => ({ ...prev, [userId]: {} }));
    } catch {
      toast.error("Assignment failed");
    } finally {
      setAssigning(null);
    }
  };

  const handleUnassign = async (bedId) => {
    setUnassigning(bedId);
    try {
      await axios.patch(`/unassign-bed/${bedId}`);
      setBeds((prev) => prev.map((b) => (b._id === bedId ? { ...b, occupant: null } : b)));
      toast.success("Bed unassigned successfully");
    } catch {
      toast.error("Unassign failed");
    } finally {
      setUnassigning(null);
    }
  };

  const getUserBed = (userId) => beds.find((b) => b.occupant === userId);

  const getLocationPath = (bed) => {
    const room = rooms.find((r) => r._id === bed.room_id);
    const floor = room ? floors.find((f) => f._id === room.floor_id) : null;
    const building = floor ? buildings.find((b) => b._id === floor.building_id) : null;
    const branch = building ? branches.find((br) => br._id === building.branch_id) : null;
    return [
      branch?.name,
      building?.name,
      floor ? `Floor ${floor.floor_number}` : null,
      room ? `Room ${room.room_number}` : null,
      `Bed ${bed.bed_number}`,
    ].filter(Boolean).join(" › ");
  };

  const filteredStudents = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(q) ||
        user.phone?.includes(q) ||
        user.email?.toLowerCase().includes(q)
    );
  }, [users, searchTerm]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Bed Assignment" subtitle="Loading..." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Bed Assignment"
        subtitle={`${filteredStudents.length} student${filteredStudents.length !== 1 ? "s" : ""}`}
      />

      <div className="mb-6 max-w-md">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, email, or phone..."
        />
      </div>

      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <EmptyState message="No students found" icon={BedDouble} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredStudents.map((user) => {
            const assignedBed = getUserBed(user._id);
            return (
              <div key={user._id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{user.name}</h3>
                    <p className="text-xs text-slate-500">{user.phone}</p>
                  </div>
                  <div className="ml-auto">
                    <StatusBadge
                      status={assignedBed ? "assigned" : "unassigned"}
                      label={assignedBed ? "Assigned" : "Unassigned"}
                    />
                  </div>
                </div>

                {assignedBed ? (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                      {getLocationPath(assignedBed)}
                    </p>
                    <button
                      onClick={() => handleUnassign(assignedBed._id)}
                      disabled={unassigning === assignedBed._id}
                      className={`${btnDanger} w-full sm:w-auto`}
                    >
                      {unassigning === assignedBed._id ? (
                        <ButtonSpinner />
                      ) : (
                        <>
                          <UserMinus size={16} />
                          Unassign
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Select
                      placeholder="Branch"
                      styles={selectStyles}
                      options={branches.map((b) => ({ value: b._id, label: b.name }))}
                      onChange={(v) => handleSelect(user._id, "branch", v?.value)}
                      isClearable
                    />
                    {selected[user._id]?.branch && (
                      <Select
                        placeholder="Building"
                        styles={selectStyles}
                        options={buildings
                          .filter((b) => b.branch_id === selected[user._id].branch)
                          .map((b) => ({ value: b._id, label: b.name }))}
                        onChange={(v) => handleSelect(user._id, "building", v?.value)}
                        isClearable
                      />
                    )}
                    {selected[user._id]?.building && (
                      <Select
                        placeholder="Floor"
                        styles={selectStyles}
                        options={floors
                          .filter((f) => f.building_id === selected[user._id].building)
                          .map((f) => ({ value: f._id, label: `Floor ${f.floor_number}` }))}
                        onChange={(v) => handleSelect(user._id, "floor", v?.value)}
                        isClearable
                      />
                    )}
                    {selected[user._id]?.floor && (
                      <Select
                        placeholder="Room"
                        styles={selectStyles}
                        options={rooms
                          .filter((r) => r.floor_id === selected[user._id].floor)
                          .map((r) => ({ value: r._id, label: `Room ${r.room_number}` }))}
                        onChange={(v) => handleSelect(user._id, "room", v?.value)}
                        isClearable
                      />
                    )}
                    {selected[user._id]?.room && (
                      <Select
                        placeholder="Bed"
                        styles={selectStyles}
                        options={beds
                          .filter((b) => b.room_id === selected[user._id].room && !b.occupant)
                          .map((b) => ({ value: b._id, label: `Bed ${b.bed_number}` }))}
                        onChange={(v) => handleSelect(user._id, "bed", v?.value)}
                        isClearable
                      />
                    )}
                    <button
                      onClick={() => handleAssign(user._id)}
                      disabled={assigning === user._id}
                      className={`${btnPrimary} w-full sm:w-auto`}
                    >
                      {assigning === user._id ? <ButtonSpinner /> : "Assign Bed"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
