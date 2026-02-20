import { useEffect, useState } from "react";
import useAxios from "../../../hooks/useAxios";
import { useForm } from "react-hook-form";

export default function Buildings() {
  const axios = useAxios();
  const [branches, setBranches] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    const fetchBranches = async () => {
      const res = await axios.get("/branches");
      setBranches(res.data);
    };
    fetchBranches();
  }, [axios]);

  const fetchBuildings = async (branchId) => {
    const res = await axios.get(`/buildings/${branchId}`);
    setBuildings(res.data);
  };

  const onSubmit = async (data) => {
    await axios.post("/buildings", data); // { name, branch_id }
    fetchBuildings(data.branch_id);
    reset();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded shadow">
        <h2 className="font-bold mb-3">Add Building</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <select {...register("branch_id", { required: true })} className="w-full border p-2 rounded">
            <option value="">Select Branch</option>
            {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>

          <input {...register("name", { required: true })} placeholder="Building Name" className="w-full border p-2 rounded"/>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Add Building</button>
        </form>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-bold mb-3">Buildings List</h2>
        {buildings.map(b => <div key={b._id}>{b.name}</div>)}
      </div>
    </div>
  );
}
