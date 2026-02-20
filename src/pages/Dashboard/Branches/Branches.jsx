import { useEffect, useState } from "react";
import useAxios from "../../../hooks/useAxios";
import { useForm } from "react-hook-form";

export default function Branches() {
  const axios = useAxios();
  const [branches, setBranches] = useState([]);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    const fetchBranches = async () => {
      const res = await axios.get("/branches");
      setBranches(res.data);
    };
    fetchBranches();
  }, [axios]);

  const onSubmit = async (data) => {
    await axios.post("/branches", data);
    const res = await axios.get("/branches");
    setBranches(res.data);
    reset();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded shadow">
        <h2 className="font-bold mb-3">Add Branch</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <input {...register("name", { required: true })} placeholder="Branch Name" className="w-full border p-2 rounded"/>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Add Branch</button>
        </form>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-bold mb-3">Branches List</h2>
        {branches.map(b => <div key={b._id}>{b.name}</div>)}
      </div>
    </div>
  );
}
