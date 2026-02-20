import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useAxios from "../../../hooks/useAxios";


export default function Users() {
  const axios = useAxios();
  const [users, setUsers] = useState([]);

  // React Hook Form
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Load users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to load users:", err);
      }
    };
    fetchUsers();
  }, [axios]);

  // Add User Handler
  const onSubmit = async (data) => {
    try {
      await axios.post("/users", data);
      const res = await axios.get("/users");
      setUsers(res.data);
      reset(); // reset form
    } catch (err) {
      console.error("Failed to add user:", err);
    }
  };

  return (
    <div className="space-y-6">

      {/* Add User Form */}
      <div className="bg-white p-5 rounded shadow">
        <h2 className="font-bold mb-3">Add User</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <input
              {...register("name", { required: "Name is required" })}
              placeholder="Name"
              className="w-full border p-2 rounded"
            />
            {errors.name && <p className="text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                  message: "Email is not valid"
                }
              })}
              placeholder="Email"
              className="w-full border p-2 rounded"
            />
            {errors.email && <p className="text-red-500">{errors.email.message}</p>}
          </div>

          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Add User
          </button>
        </form>
      </div>

      {/* Users List */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-bold mb-3">Users List</h2>
        {users.map(user => (
          <div key={user._id} className="border-b py-2">
            {user.name} — {user.email}
          </div>
        ))}
      </div>

    </div>
  );
}
