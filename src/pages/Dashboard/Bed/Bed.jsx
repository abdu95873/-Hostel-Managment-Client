import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useAxios from "../../../hooks/useAxios";

export default function Beds() {
  const axios = useAxios();

  const [branches, setBranches] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [allBeds, setAllBeds] = useState({}); // { branchId: { floorId: { roomId: [beds] } } }

  const [allFloors, setAllFloors] = useState([]);
  const [allRooms, setAllRooms] = useState([]);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();

  const selectedBranch = watch("branch_id");
  const selectedBuilding = watch("building_id");
  const selectedFloor = watch("floor_id");
//   const selectedRoom = watch("room_id");

  // ---------------- Load Branches ----------------
  useEffect(() => {
    axios.get("/branches").then(res => setBranches(res.data));
  }, [axios]);

  // ---------------- Load Buildings for Selected Branch ----------------
  useEffect(() => {
    if (selectedBranch) {
      axios.get(`/buildings/${selectedBranch}`).then(res => setBuildings(res.data));
    } else {
      setBuildings([]);
    }
  }, [selectedBranch, axios]);

  // ---------------- Load Floors for Selected Building ----------------
  useEffect(() => {
    if (selectedBuilding) {
      axios.get(`/floors/${selectedBuilding}`).then(res => setFloors(res.data));
    } else {
      setFloors([]);
    }
  }, [selectedBuilding, axios]);

  // ---------------- Load Rooms for Selected Floor ----------------
  useEffect(() => {
    if (selectedFloor) {
      axios.get(`/rooms/floor/${selectedFloor}`).then(res => setRooms(res.data));
    } else {
      setRooms([]);
    }
  }, [selectedFloor, axios]);

  // ---------------- Load all floors and rooms for mapping numbers ----------------
  const fetchAllFloorsAndRooms = async () => {
    const floorsArr = [];
    const roomsArr = [];
    for (let branch of branches) {
      const buildingsRes = await axios.get(`/buildings/${branch._id}`);
      for (let building of buildingsRes.data) {
        const floorsRes = await axios.get(`/floors/${building._id}`);
        floorsArr.push(...floorsRes.data);
        for (let floor of floorsRes.data) {
          const roomsRes = await axios.get(`/rooms/floor/${floor._id}`);
          roomsArr.push(...roomsRes.data);
        }
      }
    }
    setAllFloors(floorsArr);
    setAllRooms(roomsArr);
  };

  useEffect(() => {
    if (branches.length > 0) fetchAllFloorsAndRooms();
  }, [branches]);

  // ---------------- Load All Beds Hierarchically ----------------
  const fetchAllBeds = async () => {
    const data = {};
    for (let branch of branches) {
      data[branch._id] = {};
      const buildingsRes = await axios.get(`/buildings/${branch._id}`);
      for (let building of buildingsRes.data) {
        const floorsRes = await axios.get(`/floors/${building._id}`);
        for (let floor of floorsRes.data) {
          const roomsRes = await axios.get(`/rooms/floor/${floor._id}`);
          data[branch._id][floor._id] = {};
          for (let room of roomsRes.data) {
            const bedsRes = await axios.get(`/beds/room/${room._id}`);
            data[branch._id][floor._id][room._id] = bedsRes.data;
          }
        }
      }
    }
    setAllBeds(data);
  };

  useEffect(() => {
    if (branches.length > 0) fetchAllBeds();
  }, [branches]);

  // ---------------- Add Bed ----------------
  const onSubmit = async (data) => {
    if (!data.room_id || !data.bed_number) return;

    try {
      await axios.post("/beds", {
        room_id: data.room_id,
        bed_number: data.bed_number,
        occupant: data.occupant || ""
      });

      // Refresh all beds
      fetchAllBeds();

      // Keep selections after adding
      reset({
        branch_id: data.branch_id,
        building_id: data.building_id,
        floor_id: data.floor_id,
        room_id: data.room_id
      });
    } catch (err) {
      console.error("Failed to add bed:", err);
    }
  };

  return (
    <div className="bg-white p-5 rounded shadow space-y-6">
      <h2 className="font-bold text-lg">Add Bed</h2>

      {/* ---------------- Add Bed Form ---------------- */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Branch */}
        <select {...register("branch_id", { required: true })} className="w-full border p-2 rounded">
          <option value="">Select Branch</option>
          {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
        {errors.branch_id && <p className="text-red-500 text-sm">Branch required</p>}

        {/* Building */}
        <select {...register("building_id", { required: true })} className="w-full border p-2 rounded">
          <option value="">Select Building</option>
          {buildings.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
        {errors.building_id && <p className="text-red-500 text-sm">Building required</p>}

        {/* Floor */}
        <select {...register("floor_id", { required: true })} className="w-full border p-2 rounded">
          <option value="">Select Floor</option>
          {floors.map(f => <option key={f._id} value={f._id}>{f.floor_number}</option>)}
        </select>
        {errors.floor_id && <p className="text-red-500 text-sm">Floor required</p>}

        {/* Room */}
        <select {...register("room_id", { required: true })} className="w-full border p-2 rounded">
          <option value="">Select Room</option>
          {rooms.map(r => <option key={r._id} value={r._id}>{r.room_number}</option>)}
        </select>
        {errors.room_id && <p className="text-red-500 text-sm">Room required</p>}

        {/* Bed Number */}
        <input
          {...register("bed_number", { required: "Bed number required" })}
          placeholder="Bed Number"
          className="w-full border p-2 rounded"
        />
        {errors.bed_number && <p className="text-red-500 text-sm">{errors.bed_number.message}</p>}

        {/* Occupant */}
        <input {...register("occupant")} placeholder="Occupant (Optional)" className="w-full border p-2 rounded" />

        <button className="bg-red-600 text-white px-4 py-2 rounded">Add Bed</button>
      </form>

      {/* ---------------- Hierarchical Beds List ---------------- */}
      <div>
        <h3 className="font-semibold mb-2">All Beds</h3>
        {branches.map(branch => (
          <div key={branch._id} className="mb-4 border p-3 rounded">
            <h4 className="font-bold text-blue-700">{branch.name}</h4>

            {allBeds[branch._id] &&
              Object.entries(allBeds[branch._id]).map(([floorId, roomsObj]) => {
                const floorNumber = allFloors.find(f => f._id === floorId)?.floor_number || floorId;

                return (
                  <div key={floorId} className="ml-4 mt-2">
                    <h5 className="font-semibold text-green-700">Floor {floorNumber}</h5>

                    {Object.entries(roomsObj).map(([roomId, bedsArr]) => {
                      const roomNumber = allRooms.find(r => r._id === roomId)?.room_number || roomId;
                      return (
                        <div key={roomId} className="ml-4 mt-1">
                          <h6 className="font-medium text-purple-700">Room {roomNumber}</h6>
                          {bedsArr.length === 0 && <p className="text-sm text-gray-500">No beds</p>}
                          {bedsArr.map(bed => (
                            <div key={bed._id} className="text-sm py-1 border-b">
                              Bed {bed.bed_number} {bed.occupant ? `— Occupant: ${bed.occupant}` : ""}
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
    </div>
  );
}
