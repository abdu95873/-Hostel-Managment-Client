import { useEffect, useState } from "react";
import Select from "react-select";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

export default function AssignBedsPage() {
  const axios = useAxiosSecure();

  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);

  const [selected, setSelected] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          usersRes,
          branchesRes,
          buildingsRes,
          floorsRes,
          roomsRes,
          bedsRes,
        ] = await Promise.all([
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
      } catch (err) {
        console.error(err);
      }
    };

    loadData();
  }, [axios]);

  // Handle select with hierarchy reset
  const handleSelect = (userId, field, value) => {
    setSelected((prev) => {
      const prevUser = prev[userId] || {};
      let updated = { ...prevUser, [field]: value };

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

      if (field === "room") {
        delete updated.bed;
      }

      return {
        ...prev,
        [userId]: updated,
      };
    });
  };

  // Assign bed
  const handleAssign = async (userId) => {
    const data = selected[userId];

    if (!data?.bed) {
      alert("Select a bed first");
      return;
    }

    try {
      await axios.post(`/beds/${data.bed}/assign`, { user_id: userId });

      setBeds((prev) =>
        prev.map((b) =>
          b._id === data.bed ? { ...b, occupant: userId } : b
        )
      );

      alert("Bed assigned successfully!");
    } catch (err) {
      console.error(err);
      alert("Assignment failed");
    }
  };

  // Cancel bed
  const handleCancel = async (bedId) => {
    try {
      await axios.patch(`/beds/${bedId}/unassign`);

      setBeds((prev) =>
        prev.map((b) => (b._id === bedId ? { ...b, occupant: null } : b))
      );

      alert("Bed Canceled");
    } catch (err) {
      console.error(err);
      alert("Cancel failed");
    }
  };

  // Get assigned bed
  const getUserBed = (userId) => beds.find((b) => b.occupant === userId);

  // Search students
  const filteredStudents = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm)
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Student Bed Assignment</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name or phone..."
        className="border p-2 rounded w-64 mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {filteredStudents.map((user) => {
        const assignedBed = getUserBed(user._id);

        return (
          <div key={user._id} className="border p-4 rounded mb-4 shadow-sm">

            <h3 className="font-bold mb-2">
              {user.name} ({user.phone})
            </h3>

            {assignedBed ? (
              <div className="flex items-center gap-4">
                <span className="text-green-600">
                  Assigned → Floor{" "}
                  {
                    floors.find(
                      (f) =>
                        f._id ===
                        rooms.find((r) => r._id === assignedBed.room_id)
                          ?.floor_id
                    )?.floor_number
                  }{" "}
                  | Room{" "}
                  {
                    rooms.find((r) => r._id === assignedBed.room_id)
                      ?.room_number
                  }{" "}
                  | Bed {assignedBed.bed_number}
                </span>

                <button
  onClick={() => handleCancel(assignedBed._id)}
  className="ml-auto bg-red-500 text-white px-4 py-1 rounded"
>
  Cancel
</button>
              </div>
            ) : (
              <div className="flex gap-4 mt-3 flex-wrap">

                {/* Branch */}
                <div className="w-44">
                  <Select
                    placeholder="Select Branch"
                    options={branches.map((b) => ({
                      value: b._id,
                      label: b.name,
                    }))}
                    onChange={(v) =>
                      handleSelect(user._id, "branch", v.value)
                    }
                  />
                </div>

                {/* Building */}
                {selected[user._id]?.branch && (
                  <div className="w-44">
                    <Select
                      placeholder="Select Building"
                      options={buildings
                        .filter(
                          (b) =>
                            b.branch_id === selected[user._id].branch
                        )
                        .map((b) => ({
                          value: b._id,
                          label: b.name,
                        }))}
                      onChange={(v) =>
                        handleSelect(user._id, "building", v.value)
                      }
                    />
                  </div>
                )}

                {/* Floor */}
                {selected[user._id]?.building && (
                  <div className="w-40">
                    <Select
                      placeholder="Select Floor"
                      options={floors
                        .filter(
                          (f) =>
                            f.building_id ===
                            selected[user._id].building
                        )
                        .map((f) => ({
                          value: f._id,
                          label: `Floor ${f.floor_number}`,
                        }))}
                      onChange={(v) =>
                        handleSelect(user._id, "floor", v.value)
                      }
                    />
                  </div>
                )}

                {/* Room */}
                {selected[user._id]?.floor && (
                  <div className="w-40">
                    <Select
                      placeholder="Select Room"
                      options={rooms
                        .filter(
                          (r) =>
                            r.floor_id === selected[user._id].floor
                        )
                        .map((r) => ({
                          value: r._id,
                          label: `Room ${r.room_number}`,
                        }))}
                      onChange={(v) =>
                        handleSelect(user._id, "room", v.value)
                      }
                    />
                  </div>
                )}

                {/* Bed */}
                {selected[user._id]?.room && (
                  <div className="w-40">
                    <Select
                      placeholder="Select Bed"
                      options={beds
                        .filter(
                          (b) =>
                            b.room_id === selected[user._id].room &&
                            !b.occupant
                        )
                        .map((b) => ({
                          value: b._id,
                          label: `Bed ${b.bed_number}`,
                        }))}
                      onChange={(v) =>
                        handleSelect(user._id, "bed", v.value)
                      }
                    />
                  </div>
                )}

               <div className="ml-auto">
  <button
    onClick={() => handleAssign(user._id)}
    className="bg-blue-600 text-white px-4 py-1 rounded"
  >
    Assign
  </button>
</div>

              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}