import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useAxios from "../../../hooks/useAxios";

export default function Beds() {
  const axios = useAxios();

  const [branches, setBranches] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [allBuildings, setAllBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [allFloors, setAllFloors] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [allBeds, setAllBeds] = useState({});
  const [users, setUsers] = useState([]);
  const [editingBed, setEditingBed] = useState(null);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();

  const selectedBranch = watch("branch_id");
  const selectedBuilding = watch("building_id");
  const selectedFloor = watch("floor_id");

  // ---------------- Load Branches ----------------
  useEffect(() => {
    axios.get("/branches/").then(res => setBranches(res.data));
  }, [axios]);

  // ---------------- Load Buildings/Floors/Rooms ----------------
  useEffect(() => {
    if (selectedBranch) axios.get(`/buildings/${selectedBranch}`).then(res => setBuildings(res.data));
    else setBuildings([]);
  }, [selectedBranch, axios]);

  useEffect(() => {
    if (selectedBuilding) axios.get(`/floors/${selectedBuilding}`).then(res => setFloors(res.data));
    else setFloors([]);
  }, [selectedBuilding, axios]);

  useEffect(() => {
    if (selectedFloor) axios.get(`/rooms/floor/${selectedFloor}`).then(res => setRooms(res.data));
    else setRooms([]);
  }, [selectedFloor, axios]);

  // ---------------- Load All Users ----------------
  useEffect(() => {
    axios.get("/users").then(res => setUsers(res.data));
  }, [axios]);

  const getOccupantName = (userId) => {
    const user = users.find(u => u._id === userId);
    return user ? user.name : userId;
  };

  // ---------------- Fetch All Buildings ----------------
  useEffect(() => {
    const fetchAllBuildings = async () => {
      let arr = [];
      for (let branch of branches) {
        const res = await axios.get(`/buildings/${branch._id}`);
        arr.push(...res.data);
      }
      setAllBuildings(arr);
    };
    if(branches.length) fetchAllBuildings();
  }, [branches]);

  // ---------------- Load all floors and rooms ----------------
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

  // ---------------- Load All Beds ----------------
  const fetchAllBeds = async () => {
    const data = {};
    for (let branch of branches) {
      data[branch._id] = {};
      const buildingsRes = await axios.get(`/buildings/${branch._id}`);
      for (let building of buildingsRes.data) {
        data[branch._id][building._id] = {};
        const floorsRes = await axios.get(`/floors/${building._id}`);
        for (let floor of floorsRes.data) {
          data[branch._id][building._id][floor._id] = {};
          const roomsRes = await axios.get(`/rooms/floor/${floor._id}`);
          for (let room of roomsRes.data) {
            const bedsRes = await axios.get(`/beds/room/${room._id}`);
            data[branch._id][building._id][floor._id][room._id] = bedsRes.data;
          }
        }
      }
    }
    setAllBeds(data);
  };

  useEffect(() => {
    if (branches.length > 0) fetchAllBeds();
  }, [branches]);

  // ---------------- Add / Update Bed ----------------
  const onSubmit = async (data) => {
    if (!data.room_id || !data.bed_number || !data.amount)
      return alert("Fill all required fields");

    const existingBeds = allBeds[data.branch_id]?.[data.building_id]?.[data.floor_id]?.[data.room_id] || [];
    const isDuplicate = existingBeds.some(
      bed => bed.bed_number.toString() === data.bed_number.toString() && bed._id !== editingBed?._id
    );
    if (isDuplicate) return alert("A bed with this number already exists in this room!");

    try {
      if (editingBed) {
        await axios.put(`/beds/${editingBed._id}`, {
          room_id: data.room_id,
          bed_number: data.bed_number,
          amount: Number(data.amount),
          discount: Number(data.discount || 0),
          occupant: data.occupant || "",
        });
        setEditingBed(null);
        alert("Bed updated successfully!");
      } else {
        await axios.post("/beds", {
          room_id: data.room_id,
          bed_number: data.bed_number,
          amount: Number(data.amount),
          discount: Number(data.discount || 0),
          occupant: data.occupant || "",
        });
        alert("Bed added successfully!");
      }
      fetchAllBeds();
      reset();
    } catch (err) {
      console.error(err);
      alert("Failed to add/update bed");
    }
  };

  const handleEditBed = (bed, branchId, buildingId, floorId, roomId) => {
    setEditingBed({ ...bed, branchId, buildingId, floorId, roomId });
    const building = allBuildings.find(b => b._id === buildingId);

    reset({
      branch_id: branchId,
      building_id: building?._id || "",
      floor_id: floorId,
      room_id: roomId,
      bed_number: bed.bed_number,
      amount: bed.amount,
      discount: bed.discount || 0,
      occupant: bed.occupant
    });
  };

  return (
    <div className="bg-white p-5 rounded shadow space-y-6">
      <h2 className="font-bold text-lg">{editingBed ? "Update Bed" : "Add Bed"}</h2>

      {/* Add / Update Bed Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <select {...register("branch_id", { required: true })} className="w-full border p-2 rounded">
          <option value="">Select Branch</option>
          {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
        {errors.branch_id && <p className="text-red-500 text-sm">Branch required</p>}

        <select {...register("building_id", { required: true })} className="w-full border p-2 rounded">
          <option value="">Select Building</option>
          {buildings.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
        {errors.building_id && <p className="text-red-500 text-sm">Building required</p>}

        <select {...register("floor_id", { required: true })} className="w-full border p-2 rounded">
          <option value="">Select Floor</option>
          {floors.map(f => <option key={f._id} value={f._id}>{f.floor_number}</option>)}
        </select>
        {errors.floor_id && <p className="text-red-500 text-sm">Floor required</p>}

        <select {...register("room_id", { required: true })} className="w-full border p-2 rounded">
          <option value="">Select Room</option>
          {rooms.map(r => <option key={r._id} value={r._id}>{r.room_number}</option>)}
        </select>
        {errors.room_id && <p className="text-red-500 text-sm">Room required</p>}

        <input {...register("bed_number", { required: "Bed number required" })} placeholder="Bed Number" className="w-full border p-2 rounded" />
        {errors.bed_number && <p className="text-red-500 text-sm">{errors.bed_number.message}</p>}

        <input {...register("amount", { required: "Amount required" })} placeholder="Bed Amount" type="number" min={0} className="w-full border p-2 rounded" />
        {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}

        <input {...register("discount")} placeholder="Discount (Optional)" type="number" min={0} className="w-full border p-2 rounded" />

        <select {...register("occupant")} className="w-full border p-2 rounded">
          <option value="">Select Occupant</option>
          {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
        </select>

        <button className={`px-4 py-2 rounded ${editingBed ? "bg-blue-600 text-white" : "bg-red-600 text-white"}`}>
          {editingBed ? "Update Bed" : "Add Bed"}
        </button>
      </form>

      {/* All Beds Hierarchy */}
      <div>
        <h3 className="font-semibold mb-2">All Beds</h3>
        {branches.map(branch => (
          <div key={branch._id} className="mb-4 border p-3 rounded">
            <h4 className="font-bold text-blue-700">{branch.name}</h4>

            {Object.entries(allBeds[branch._id] || {}).map(([buildingId, floorsObj]) => {
              const buildingName = allBuildings.find(b => b._id === buildingId)?.name || buildingId;
              return (
                <div key={buildingId} className="ml-2 mt-2 border-l-2 pl-2">
                  <h5 className="font-semibold text-indigo-700">{buildingName}</h5>

                  {Object.entries(floorsObj || {}).map(([floorId, roomsObj]) => {
                    const floorNumber = allFloors.find(f => f._id === floorId)?.floor_number || floorId;
                    return (
                      <div key={floorId} className="ml-4 mt-2">
                        <h6 className="font-semibold text-green-700">Floor {floorNumber}</h6>

                        {Object.entries(roomsObj || {}).map(([roomId, bedsArr]) => {
                          const roomNumber = allRooms.find(r => r._id === roomId)?.room_number || roomId;
                          return (
                            <div key={roomId} className="ml-4 mt-1">
                              <h6 className="font-medium text-purple-700">Room {roomNumber}</h6>
                              {bedsArr.length === 0 && <p className="text-sm text-gray-500">No beds</p>}
                              {bedsArr.map(bed => (
                                <div key={bed._id} className="text-sm py-1 border-b flex justify-between">
                                  <span>
                                    Bed {bed.bed_number} — Amount: {bed.amount} {bed.discount ? `(Discount: ${bed.discount})` : ""} 
                                    {bed.occupant ? `— Occupant: ${getOccupantName(bed.occupant)}` : ""}
                                  </span>
                                  <button
                                    onClick={() => handleEditBed(bed, branch._id, buildingId, floorId, roomId)}
                                    className="text-blue-600 hover:underline text-sm"
                                  >
                                    Edit
                                  </button>
                                </div>
                              ))}
                            </div>
                          );
                        })}
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