import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useAxios from "../../../hooks/useAxios";

export default function Users() {
  const axios = useAxios();
  const [users, setUsers] = useState([]);
  const [beds, setBeds] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Load users and beds
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, bedsRes] = await Promise.all([
          axios.get("/users"),
          axios.get("/beds/all"),
        ]);
        setUsers(usersRes.data);
        setBeds(bedsRes.data);
      } catch (err) {
        console.error("Failed to load data:", err);
      }
    };
    fetchData();
  }, [axios]);

  // Add User
  const onSubmit = async (data) => {
    try {
      await axios.post("/users", data);
      const usersRes = await axios.get("/users");
      setUsers(usersRes.data);
      reset();
    } catch (err) {
      console.error("Failed to add user:", err);
    }
  };

  return (
    <div className="space-y-6 p-6">

      {/* Add User Form */}
      <div className="bg-white p-5 rounded shadow">
        <h2 className="font-bold mb-3 text-xl">Add User</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {/* Name */}
          <div>
            <input
              {...register("name", { required: "Name is required" })}
              placeholder="Name"
              className="w-full border p-2 rounded"
            />
            {errors.name && (
              <p className="text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                  message: "Email is not valid",
                },
              })}
              placeholder="Email"
              className="w-full border p-2 rounded"
            />
            {errors.email && (
              <p className="text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <input
              {...register("phone", {
                required: "Phone number is required",
                pattern: {
                  value: /^[0-9]{11}$/,
                  message: "Phone number must be exactly 11 digits",
                },
              })}
              placeholder="Phone (11 digits)"
              className="w-full border p-2 rounded"
            />
            {errors.phone && (
              <p className="text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Add User
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white p-4 rounded shadow overflow-x-auto">
        <h2 className="font-bold mb-3 text-xl">Users List</h2>

        <table className="w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">#</th>
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Email</th>
              <th className="border p-2 text-left">Phone</th>
              <th className="border p-2 text-left">Bed Status</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user, index) => {
              const assignedBed = beds.find((b) => b.occupant === user._id);

              return (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2">{user.name}</td>
                  <td className="border p-2">{user.email}</td>
                  <td className="border p-2">{user.phone}</td>
                  <td className="border p-2">
                    {assignedBed ? (
                      <span className="text-green-600 font-semibold">
                        🟢 Assigned
                      </span>
                    ) : (
                      <span className="text-red-500 font-semibold">
                        🔴 Not Assigned
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}