import { useEffect, useState } from "react";
import useAxios from "../../../hooks/useAxios";

export default function AccountsPage() {
  const axios = useAxios();
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, paymentsRes] = await Promise.all([
          axios.get("/users"),
          axios.get("/payments"),
        ]);
        setUsers(usersRes.data);
        setPayments(paymentsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [axios]);

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const closeModal = () => setSelectedUser(null);

  const getUserPayments = (userId) => payments.filter(p => p.user_id === userId);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Students Summary</h1>

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100 text-xs">
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Phone</th>
            <th className="border px-2 py-1">Total Paid</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => {
            const totalPaid = getUserPayments(u._id).reduce((sum, p) => sum + p.amount, 0);

            return (
              <tr key={u._id} className="text-sm">
                <td className="border px-2 py-1">
                  <button 
                    onClick={() => handleUserClick(u)}
                    className="text-blue-500 hover:underline"
                  >
                    {u.name}
                  </button>
                </td>
                <td className="border px-2 py-1">{u.email}</td>
                <td className="border px-2 py-1">{u.phone}</td>
                <td className="border px-2 py-1">{totalPaid}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Modal for selected user */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-10 z-50">
          <div className="bg-white p-6 rounded w-11/12 md:w-3/4 max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedUser.name} - Payments</h2>
              <button onClick={closeModal} className="text-red-500 font-bold">X</button>
            </div>
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-100 text-xs">
                  <th className="border px-2 py-1">Month</th>
                  <th className="border px-2 py-1">Amount</th>
                  <th className="border px-2 py-1">Discount</th>
                  <th className="border px-2 py-1">Payable</th>
                  <th className="border px-2 py-1">Status</th>
                </tr>
              </thead>
              <tbody>
                {getUserPayments(selectedUser._id).map(p => (
                  <tr key={p._id} className="text-sm">
                    <td className="border px-2 py-1">{p.month}</td>
                    <td className="border px-2 py-1">{p.amount}</td>
                    <td className="border px-2 py-1">{p.discount || 0}</td>
                    <td className="border px-2 py-1">{p.amount - (p.discount || 0)}</td>
                    <td className="border px-2 py-1">{p.status}</td>
                  </tr>
                ))}
                {getUserPayments(selectedUser._id).length === 0 && (
                  <tr>
                    <td colSpan="5" className="border px-2 py-1 text-center">No payments yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}