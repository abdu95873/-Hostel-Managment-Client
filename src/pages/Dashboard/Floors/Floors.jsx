import { useEffect, useState } from "react";
import useAxios from "../../../hooks/useAxios";
import { useForm } from "react-hook-form";

export default function Floors() {
  const axios = useAxios();
  const [branches, setBranches] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const { register, handleSubmit, watch, reset } = useForm();

  const selectedBranch = watch("branch_id");

  useEffect(() => {
    const fetchBranches = async () => {
      const res = await axios.get("/branches");
      setBranches(res.data);
    };
    fetchBranches();
  }, [axios]);

  useEffect(() => {
    if (selectedBranch) {
      axios.get(`/buildings/${selectedBranch}`).then(res => setBuildings(res.data));
    } else {
      setBuildings([]);
    }
  }, [selectedBranch, axios]);

  const fetchFloors = async (buildingId) => {
    const res = await axios.get(`/floors/${buildingId}`);
    setFloors(res.data);
  };

  const onSubmit = async (data) => {
    await axios.post("/floors", data); // { floor_number, building_id }
    fetchFloors(data.building_id);
    reset();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded shadow">
        <h2 className="font-bold mb-3">Add Floor</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <select {...register("branch_id", { required: true })} className="w-full border p-2 rounded">
            <option value="">Select Branch</option>
            {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>

          <select {...register("building_id", { required: true })} className="w-full border p-2 rounded">
            <option value="">Select Building</option>
            {buildings.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>

          <input {...register("floor_number", { required: true })} placeholder="Floor Number" className="w-full border p-2 rounded"/>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Add Floor</button>
        </form>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-bold mb-3">Floors List</h2>
        {floors.map(f => <div key={f._id}>Floor {f.floor_number}</div>)}
      </div>
    </div>
  );
}
