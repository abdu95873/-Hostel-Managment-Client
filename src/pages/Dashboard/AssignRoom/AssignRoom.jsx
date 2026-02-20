import { useEffect, useState } from "react";
import Select from "react-select"; // ✅ Import React Select
import useAxiosSecure from "../../../hooks/useAxiosSecure";

export default function RoomsAndBedsPage() {
  const axios = useAxiosSecure();

  // Data
  const [branches, setBranches] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [users, setUsers] = useState([]); // renamed from students

  // Filters
  const [filters, setFilters] = useState({
    branch: "",
    floor: "",
    room: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchesRes, floorsRes, roomsRes, bedsRes, usersRes] =
          await Promise.all([
            axios.get("/branches"),
            axios.get("/floors/all"),
            axios.get("/rooms/all"),
            axios.get("/beds/all"),
            axios.get("/users"),
          ]);

        setBranches(branchesRes.data);
        setFloors(floorsRes.data);
        setRooms(roomsRes.data);
        setBeds(bedsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.error("AxiosError:", err);
      }
    };

    fetchData();
  }, [axios]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const resetFilters = () => setFilters({ branch: "", floor: "", room: "" });

  // Assign user to a bed
  const handleAssignUser = async (bedId, userId) => {
    if (!userId) return;

    try {
      await axios.post(`/beds/${bedId}/assign`, { user_id: userId });

      const userName = users.find((u) => u._id === userId)?.name;

      setBeds((prevBeds) =>
        prevBeds.map((bed) =>
          bed._id === bedId ? { ...bed, occupant: userName } : bed
        )
      );

      alert(`User ${userName} assigned successfully!`);
    } catch (err) {
      console.error(err);
      alert("Failed to assign user.");
    }
  };

// Remove user to a bed

const handleRemoveUser = async (bedId) => {
  try {
    await axios.patch(`/beds/${bedId}/unassign`);

    setBeds((prevBeds) =>
      prevBeds.map((bed) =>
        bed._id === bedId ? { ...bed, occupant: null } : bed
      )
    );

    alert("User removed from bed!");
  } catch (err) {
    console.error(err);
    alert("Failed to remove user");
  }
};



  const buildHierarchy = () => {
    const hierarchy = {};
    const filteredBeds = beds.filter((bed) => {
      const room = rooms.find((r) => r._id === bed.room_id);
      const floor = floors.find((f) => f._id === room?.floor_id);
      return (
        (!filters.branch || floor?.branch_id === filters.branch) &&
        (!filters.floor || floor?._id === filters.floor) &&
        (!filters.room || room?._id === filters.room)
      );
    });

    filteredBeds.forEach((bed) => {
      const room = rooms.find((r) => r._id === bed.room_id);
      const floor = floors.find((f) => f._id === room.floor_id);
      const branchId = floor.branch_id;

      if (!hierarchy[branchId]) hierarchy[branchId] = {};
      if (!hierarchy[branchId][floor._id]) hierarchy[branchId][floor._id] = {};
      if (!hierarchy[branchId][floor._id][room._id])
        hierarchy[branchId][floor._id][room._id] = [];

      hierarchy[branchId][floor._id][room._id].push(bed);
    });

    return hierarchy;
  };

  const hierarchy = buildHierarchy();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Rooms & Beds Overview</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <select
          name="branch"
          value={filters.branch}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        >
          <option value="">All Branches</option>
          {branches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          name="floor"
          value={filters.floor}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        >
          <option value="">All Floors</option>
          {floors.map((f) => (
            <option key={f._id} value={f._id}>
              {f.floor_number}
            </option>
          ))}
        </select>

        <select
          name="room"
          value={filters.room}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        >
          <option value="">All Rooms</option>
          {rooms.map((r) => (
            <option key={r._id} value={r._id}>
              {r.room_number}
            </option>
          ))}
        </select>

        <button
          onClick={resetFilters}
          className="bg-gray-200 px-3 rounded hover:bg-gray-300"
        >
          Reset Filters
        </button>
      </div>



      {/* Hierarchical Beds List */}
      {branches.map((branch) => (
        <div key={branch._id} className="mb-6 border p-4 rounded shadow-sm">
          <h3 className="font-bold text-blue-700 mb-2">{branch.name}</h3>

          {hierarchy[branch._id] &&
            Object.entries(hierarchy[branch._id]).map(([floorId, roomsObj]) => {
              const floorNumber =
                floors.find((f) => f._id === floorId)?.floor_number || floorId;

              return (
                <div key={floorId} className="ml-4 mt-2 ">
                  <h4 className="font-semibold text-green-700 mb-1">
                    Floor {floorNumber}
                  </h4>

                  {Object.entries(roomsObj).map(([roomId, bedsArr]) => {
                    const roomNumber =
                      rooms.find((r) => r._id === roomId)?.room_number || roomId;

                    return (
                      <div key={roomId} className="ml-4 mt-1">
                        <h5 className="font-medium text-purple-700 mb-1">
                          Room {roomNumber}
                        </h5>

                        {bedsArr.length === 0 && (
                          <p className="text-sm text-gray-500">No beds</p>
                        )}

                        {bedsArr.map((bed) => (
                          <div
                            key={bed._id}
                            className={`text-sm py-1 border-b flex justify-between items-center ${
                              bed.occupant ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            <span>
                              Bed {bed.bed_number}{" "}
                              {bed.occupant
                                ? `— Occupant: ${bed.occupant}`
                                : "(Free)"}
                            </span>

                            {!bed.occupant && (
                              <div className="w-60">
                                <Select
                                  options={users.map((u) => ({
                                    value: u._id,
                                    label: u.name,
                                  }))}
                                  placeholder="Assign User..."
                                  onChange={(selected) =>
                                    handleAssignUser(bed._id, selected.value)
                                  }
                                  isSearchable
                                />
                              </div>
                            )}
                            {bed.occupant && (
  <button
    onClick={() => handleRemoveUser(bed._id)}
    className="bg-red-500 text-white px-2 py-1 rounded text-xs"
  >
    Remove
  </button>
)}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
        </div>
      ))}
    </div>
  );
}
