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

  const handleUserClick = (user) => setSelectedUser(user);
  const closeModal = () => setSelectedUser(null);

  const getUserPayments = (userId) => payments.filter(p => p.user_id === userId);

  // calculate payment status dynamically
  const calculateStatus = (p) => {
    const payable = (p.amount || 0) - (p.discount || 0);
    const paid = p.paid || 0;
    const due = payable - paid;

    if (paid <= 0) return "pending";
    if (due > 0) return "partial";
    return "paid";
  };
const getTotalAmount = (userId) => getUserPayments(userId).reduce((sum, p) => sum + (p.amount || 0), 0);
const getTotalDiscount = (userId) => getUserPayments(userId).reduce((sum, p) => sum + (p.discount || 0), 0);
const getTotalPayable = (userId) => getUserPayments(userId).reduce((sum, p) => sum + ((p.amount || 0) - (p.discount || 0)), 0);
  const getTotalPaid = (userId) => getUserPayments(userId).reduce((sum, p) => sum + (p.paid || 0), 0);
  const getTotalDue = (userId) => getUserPayments(userId).reduce((sum, p) => sum + ((p.amount || 0) - (p.discount || 0) - (p.paid || 0)), 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Students Summary</h1>

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100 text-xs">
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Phone</th>
            <th className="border px-2 py-1">Total </th>
            <th className="border px-2 py-1">Total Discount</th>
            <th className="border px-2 py-1">Total Payable</th>
            <th className="border px-2 py-1">Total Paid</th>
              <th className="border px-2 py-1">Total Due</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id} className="text-sm">
              <td className="border px-2 py-1">
                <button 
                  onClick={() => handleUserClick(u)}
                  className="text-blue-500 hover:underline"
                >
                  {u.name}
                </button>
              </td>
              <td className="border px-2 py-1 ">{u.email}</td>
              <td className="border px-2 py-1">{u.phone}</td>
              <td className="border px-2 py-1 text-center">{getTotalAmount(u._id)}</td>
              <td className="border px-2 py-1 text-center">{getTotalDiscount(u._id)}</td>
              <td className="border px-2 py-1 text-center">{getTotalPayable(u._id)}</td>
              <td className="border px-2 py-1 text-center">{getTotalPaid(u._id)}</td>
             <td className={`border border-black font-bold px-2 py-1 text-center ${getTotalDue(u._id) > 0 ? "text-red-600" : "text-black"}`}>
  {getTotalDue(u._id)}
</td>
            </tr>
          ))}
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
                  <th className="border px-2 py-1">Paid</th>
                  <th className="border px-2 py-1">Due</th>
                  <th className="border px-2 py-1">Status</th>
                </tr>
              </thead>
              <tbody>
                {getUserPayments(selectedUser._id).map(p => {
                  const payable = (p.amount || 0) - (p.discount || 0);
                  const paid = p.paid || 0;
                  const due = payable - paid;
                  const status = calculateStatus(p);

                  return (
                    <tr key={p._id} className="text-sm">
                      <td className="border px-2 py-1">{p.month}</td>
                      <td className="border px-2 py-1">{p.amount}</td>
                      <td className="border px-2 py-1">{p.discount || 0}</td>
                      <td className="border px-2 py-1">{payable}</td>
                      <td className="border px-2 py-1">{paid}</td>
                      <td className="border px-2 py-1">{due}</td>
                      <td className="border px-2 py-1 capitalize">{status}</td>
                    </tr>
                  );
                })}
                {getUserPayments(selectedUser._id).length === 0 && (
                  <tr>
                    <td colSpan="7" className="border px-2 py-1 text-center">No payments yet</td>
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