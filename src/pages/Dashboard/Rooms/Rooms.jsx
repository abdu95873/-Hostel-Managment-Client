import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useAxios from "../../../hooks/useAxios";

export default function Rooms() {
  const axios = useAxios();
  const [branches, setBranches] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const selectedBranch = watch("branch_id");
  const selectedBuilding = watch("building_id");
  const selectedFloor = watch("floor_id");

  // Fetch branches
  useEffect(() => {
    axios.get("/branches").then(res => setBranches(res.data));
  }, [axios]);

  // Fetch buildings when branch changes
  useEffect(() => {
    if (selectedBranch) {
      axios.get(`/buildings/${selectedBranch}`).then(res => setBuildings(res.data));
    } else {
      setBuildings([]);
    }
  }, [selectedBranch, axios]);

  // Fetch floors when building changes
  useEffect(() => {
    if (selectedBuilding) {
      axios.get(`/floors/${selectedBuilding}`).then(res => setFloors(res.data));
    } else {
      setFloors([]);
    }
  }, [selectedBuilding, axios]);

  // Fetch rooms when floor changes
  useEffect(() => {
    if (selectedFloor) {
      axios.get(`/rooms/floor/${selectedFloor}`).then(res => setRooms(res.data));
    } else {
      setRooms([]);
    }
  }, [selectedFloor, axios]);

  // Add room
  const onSubmit = async (data) => {
    if (!data.floor_id || !data.room_number) return;

    await axios.post("/rooms", {
      floor_id: data.floor_id,
      room_number: data.room_number,
      room_type: data.room_type || "Normal",
      capacity: data.capacity || 1
    });

    // Refresh room list
    const res = await axios.get(`/rooms/floor/${data.floor_id}`);
    setRooms(res.data);

    // Keep floor selected after reset
    reset({ floor_id: data.floor_id, branch_id: data.branch_id, building_id: data.building_id });
  };

  return (
    <div className="bg-white p-5 rounded shadow space-y-6">
      <h2 className="font-bold text-lg">Add Room</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Branch */}
        <select {...register("branch_id", { required: true })} className="w-full border p-2 rounded">
          <option value="">Select Branch</option>
          {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
        {errors.branch_id && <p className="text-red-500 text-sm">Branch is required</p>}

        {/* Building */}
        <select {...register("building_id", { required: true })} className="w-full border p-2 rounded">
          <option value="">Select Building</option>
          {buildings.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
        {errors.building_id && <p className="text-red-500 text-sm">Building is required</p>}

        {/* Floor */}
        <select {...register("floor_id", { required: true })} className="w-full border p-2 rounded">
          <option value="">Select Floor</option>
          {floors.map(f => <option key={f._id} value={f._id}>{f.floor_number}</option>)}
        </select>
        {errors.floor_id && <p className="text-red-500 text-sm">Floor is required</p>}

        {/* Room Number */}
        <input
          {...register("room_number", { required: "Room number is required" })}
          placeholder="Room Number"
          className="w-full border p-2 rounded"
        />
        {errors.room_number && <p className="text-red-500 text-sm">{errors.room_number.message}</p>}

        {/* Optional fields */}
        <input {...register("room_type")} placeholder="Room Type (Optional)" className="w-full border p-2 rounded" />
        <input type="number" {...register("capacity")} placeholder="Capacity (Optional)" className="w-full border p-2 rounded" />

        <button className="bg-purple-600 text-white px-4 py-2 rounded">Add Room</button>
      </form>

      {/* Rooms List */}
      <div>
        <h3 className="font-semibold mb-2">Rooms List</h3>
        {rooms.length === 0 && <p className="text-sm text-gray-500">No rooms found</p>}
        {rooms.map(r => (
          <div key={r._id} className="text-sm py-1 border-b">
            Room {r.room_number} — Type: {r.room_type || "Normal"} — Capacity: {r.capacity || 1}
          </div>
        ))}
      </div>
    </div>
  );
}
