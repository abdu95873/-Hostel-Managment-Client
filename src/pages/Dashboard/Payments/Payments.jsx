import { useEffect, useState } from "react";
import Select from "react-select";
import useAxios from "../../../hooks/useAxios";
import Swal from "sweetalert2";

export default function PaymentsPage() {
  const axios = useAxios();

  const [branches, setBranches] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);

  const [filters, setFilters] = useState({ branch: "", building: "", floor: "", room: "", bed: "", user: "" });
  const [isFormOpen, setIsFormOpen] = useState(false);

  // ADD PAYMENT FORM STATES
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [amount, setAmount] = useState("");
  const [discount, setDiscount] = useState("");
  const [method, setMethod] = useState("cash");
  const [date] = useState(new Date().toISOString().split("T")[0]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchesRes, buildingsRes, floorsRes, roomsRes, bedsRes, usersRes, paymentsRes] =
          await Promise.all([
            axios.get("/branches"),
            axios.get("/buildings/all"),
            axios.get("/floors/all"),
            axios.get("/rooms/all"),
            axios.get("/beds/all"),
            axios.get("/users"),
            axios.get("/payments"),
          ]);

        setBranches(branchesRes.data);
        setBuildings(buildingsRes.data);
        setFloors(floorsRes.data);
        setRooms(roomsRes.data);
        setBeds(bedsRes.data);
        setUsers(usersRes.data);
        setPayments(paymentsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [axios]);

  // CASCADING FILTERS
  const formFilteredBuildings = selectedBranch ? buildings.filter(b => b.branch_id === selectedBranch.value) : [];
  const formFilteredFloors = selectedBuilding ? floors.filter(f => f.building_id === selectedBuilding.value) : [];
  const formFilteredRooms = selectedFloor ? rooms.filter(r => r.floor_id === selectedFloor.value) : [];
  const formFilteredBeds = selectedRoom ? beds.filter(b => b.room_id === selectedRoom.value) : [];

  const payableAmount = Number(amount || 0) - Number(discount || 0);

  // FILTERED PAYMENTS
  const filteredBuildings = filters.branch ? buildings.filter(b => b.branch_id === filters.branch) : buildings;
  const filteredFloors = filters.building ? floors.filter(f => f.building_id === filters.building) : floors;
  const filteredRooms = filters.floor ? rooms.filter(r => r.floor_id === filters.floor) : rooms;
  const filteredBeds = filters.room ? beds.filter(b => b.room_id === filters.room) : beds;
  const filteredPayments = payments.filter(p => {
    return (
      (!filters.branch || p.branch_id === filters.branch) &&
      (!filters.building || p.building_id === filters.building) &&
      (!filters.floor || p.floor_id === filters.floor) &&
      (!filters.room || p.room_id === filters.room) &&
      (!filters.bed || p.bed_id === filters.bed) &&
      (!filters.user || p.user_id === filters.user)
    );
  });

  const handleFilterChange = (name, value) => {
    if (name === "branch") setFilters({ branch: value, building: "", floor: "", room: "", bed: "", user: filters.user });
    else if (name === "building") setFilters({ ...filters, building: value, floor: "", room: "", bed: "" });
    else if (name === "floor") setFilters({ ...filters, floor: value, room: "", bed: "" });
    else if (name === "room") setFilters({ ...filters, room: value, bed: "" });
    else setFilters({ ...filters, [name]: value });
  };
  const resetFilters = () => setFilters({ branch: "", building: "", floor: "", room: "", bed: "", user: "" });

  // PAYMENT ACTIONS
 const handleMakePaid = async (payment) => {
  const totalPayable = (payment.amount || 0) - (payment.discount || 0);
  const currentPaid = payment.paid || 0;
  const currentDue = totalPayable - currentPaid;

  if (currentDue <= 0) return; // fully paid, button hide thakbe

  const { value: addedAmount } = await Swal.fire({
    title: `Add Payment for ${users.find(u => u._id === payment.user_id)?.name || "-"}`,
    input: "number",
    inputLabel: `Due: ${currentDue}`,
    inputAttributes: { min: 1, max: currentDue, step: 1 },
    inputValue: currentDue,
    showCancelButton: true,
    confirmButtonText: "Pay",
  });

  if (!addedAmount) return;

  const newPaid = currentPaid + Number(addedAmount);
  const newDue = totalPayable - newPaid;
  const newStatus = newDue <= 0 ? "paid" : "partial";

  try {
    await axios.put(`/payments/${payment._id}`, {
      paid: newPaid,
      due: newDue,
      status: newStatus,
    });

    setPayments(prev =>
      prev.map(p =>
        p._id === payment._id ? { ...p, paid: newPaid, due: newDue, status: newStatus } : p
      )
    );

    Swal.fire("Success", "Payment updated!", "success");
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "Failed to update payment", "error");
  }
};

const handleDeletePayment = async (paymentId) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "No, cancel",
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(`/payments/${paymentId}`);
      setPayments(prev => prev.filter(p => p._id !== paymentId));
      Swal.fire("Deleted!", "Payment has been deleted.", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to delete payment", "error");
    }
  } else if (result.dismiss === Swal.DismissReason.cancel) {
    Swal.fire("Cancelled", "Payment is safe :)", "info");
  }
};

  // EDIT PAYMENT (partial payment supported)
const handleEditPayment = async (payment) => {
  const totalPayable = (payment.amount || 0) - (payment.discount || 0);
  const currentPaid = payment.paid || 0;

  const { value: formValues } = await Swal.fire({
    title: `Edit Payment for ${users.find(u => u._id === payment.user_id)?.name || "-"}`,
    html: `
      <label>Amount</label>
      <input id="swal-amount" type="number" class="swal2-input" value="${payment.amount}" disabled>

      <label>Discount</label>
      <input id="swal-discount" type="number" class="swal2-input" value="${payment.discount || 0}" disabled>

      <label>Already Paid</label>
      <input id="swal-paid" type="number" class="swal2-input" value="${currentPaid}" min="0" max="${totalPayable}">

      <label>Payment Method</label>
      <select id="swal-method" class="swal2-input">
        <option value="cash" ${payment.method === "cash" ? "selected" : ""}>Cash</option>
        <option value="card" ${payment.method === "card" ? "selected" : ""}>Card</option>
        <option value="online" ${payment.method === "online" ? "selected" : ""}>Online</option>
      </select>

      <label>Month</label>
      <input id="swal-month" type="month" class="swal2-input" value="${payment.month}">
    `,
    focusConfirm: false,
    showCancelButton: true,
    preConfirm: () => {
      const addedPaid = Number(document.getElementById('swal-paid').value);
      return {
        paid: addedPaid,
        method: document.getElementById('swal-method').value,
        month: document.getElementById('swal-month').value,
      };
    },
  });

  if (!formValues) return;

  const newPaid = formValues.paid;
  const newDue = totalPayable - newPaid;

  let newStatus;
  if (newPaid <= 0) newStatus = "pending";
  else if (newPaid < totalPayable) newStatus = "partial";
  else newStatus = "paid";

  try {
    await axios.put(`/payments/${payment._id}`, {
      paid: newPaid,
      due: newDue,
      status: newStatus,
      method: formValues.method,
      month: formValues.month,
    });

    setPayments(prev =>
      prev.map(p => p._id === payment._id
        ? { ...p, paid: newPaid, due: newDue, status: newStatus, method: formValues.method, month: formValues.month }
        : p
      )
    );

    Swal.fire("Success", "Payment updated!", "success");
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "Failed to update payment", "error");
  }
};

  // ADD PAYMENT FORM
  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!selectedUser || !selectedBranch || !selectedBuilding) return alert("Select user, branch, building");

    const existingPayment = payments.find(p => p.user_id === selectedUser.value && p.month === month);
    if (existingPayment) return alert(`Payment for ${selectedUser.label} in ${month} already exists!`);

    const payload = {
      branch_id: selectedBranch.value,
      building_id: selectedBuilding.value,
      floor_id: selectedFloor?.value || null,
      room_id: selectedRoom?.value || null,
      bed_id: selectedBed?.value || null,
      user_id: selectedUser.value,
      amount: Number(amount),
      discount: Number(discount),
      payable: payableAmount,
      paid: 0,
      due: payableAmount,
      method,
      date,
      month,
      status: "pending",
    };

    try {
      await axios.post("/payments", payload);
      setPayments(prev => [...prev, payload]);
      setSelectedBranch(null);
      setSelectedBuilding(null);
      setSelectedFloor(null);
      setSelectedRoom(null);
      setSelectedBed(null);
      setSelectedUser(null);
      setAmount("");
      setDiscount("");
      setMethod("cash");
      setIsFormOpen(false);
      alert("Payment added successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to add payment");
    }
  };

  return (
    <div className="p-6 min-h-screen">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Payments</h1>
        <button onClick={() => setIsFormOpen(!isFormOpen)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm">
          {isFormOpen ? "Hide Form" : "Add Payment"}
        </button>
      </div>

      {/* ADD PAYMENT FORM */}
      {isFormOpen && (
        <form onSubmit={handleAddPayment} className="p-4 border rounded mb-6 flex flex-col gap-2">
          <Select options={branches.map(b => ({ value: b._id, label: b.name }))} placeholder="Branch" value={selectedBranch} onChange={setSelectedBranch} />
          <Select options={formFilteredBuildings.map(b => ({ value: b._id, label: b.name }))} placeholder="Building" value={selectedBuilding} onChange={setSelectedBuilding} />
          <Select options={formFilteredFloors.map(f => ({ value: f._id, label: `Floor ${f.floor_number}` }))} placeholder="Floor" value={selectedFloor} onChange={setSelectedFloor} />
          <Select options={formFilteredRooms.map(r => ({ value: r._id, label: `Room ${r.room_number}` }))} placeholder="Room" value={selectedRoom} onChange={setSelectedRoom} />
          <Select options={formFilteredBeds.map(b => ({ value: b._id, label: `Bed ${b.bed_number}` }))} placeholder="Bed" value={selectedBed} onChange={setSelectedBed} />
          <Select options={users.map(u => ({ value: u._id, label: u.name }))} placeholder="User" value={selectedUser} onChange={setSelectedUser} />
          <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="border p-1 rounded" />
          <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} className="border p-1 rounded" />
          <input type="number" placeholder="Discount" value={discount} onChange={e => setDiscount(e.target.value)} className="border p-1 rounded" />
          <div className="border p-1 rounded bg-gray-100 font-semibold">Payable: {payableAmount}</div>
          <select value={method} onChange={e => setMethod(e.target.value)} className="border p-1 rounded">
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="online">Online</option>
          </select>
          <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded mt-2">Add Payment</button>
        </form>
      )}

      {/* FILTERS */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <select value={filters.branch} onChange={e => handleFilterChange("branch", e.target.value)} className="border p-2 rounded">
          <option value="">All Branches</option>
          {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
        <select value={filters.building} onChange={e => handleFilterChange("building", e.target.value)} className="border p-2 rounded">
          <option value="">All Buildings</option>
          {filteredBuildings.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
        <select value={filters.floor} onChange={e => handleFilterChange("floor", e.target.value)} className="border p-2 rounded">
          <option value="">All Floors</option>
          {filteredFloors.map(f => <option key={f._id} value={f._id}>{f.floor_number}</option>)}
        </select>
        <select value={filters.room} onChange={e => handleFilterChange("room", e.target.value)} className="border p-2 rounded">
          <option value="">All Rooms</option>
          {filteredRooms.map(r => <option key={r._id} value={r._id}>{r.room_number}</option>)}
        </select>
        <select value={filters.bed} onChange={e => handleFilterChange("bed", e.target.value)} className="border p-2 rounded">
          <option value="">All Beds</option>
          {filteredBeds.map(b => <option key={b._id} value={b._id}>{b.bed_number}</option>)}
        </select>
        <select value={filters.user} onChange={e => handleFilterChange("user", e.target.value)} className="border p-2 rounded">
          <option value="">All Users</option>
          {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
        </select>
        <button onClick={resetFilters} className="bg-gray-200 px-3 rounded hover:bg-gray-300">Reset</button>
      </div>

      {/* PAYMENTS TABLE */}
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100 text-xs">
            <th className="border px-2 py-1">User</th>
            <th className="border px-2 py-1">Branch</th>
            <th className="border px-2 py-1">Building</th>
            <th className="border px-2 py-1">Floor</th>
            <th className="border px-2 py-1">Room</th>
            <th className="border px-2 py-1">Bed</th>
            <th className="border px-2 py-1">Amount</th>
            <th className="border px-2 py-1">Discount</th>
            <th className="border px-2 py-1">Paid</th>
            <th className="border px-2 py-1">Due</th>
            <th className="border px-2 py-1">Date</th>
            <th className="border px-2 py-1">Status</th>
            <th className="border px-2 py-1">Method</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPayments.map(p => {
            const user = users.find(u => u._id === p.user_id);
            const bed = beds.find(b => b._id === p.bed_id);
            const room = rooms.find(r => r._id === p.room_id);
            const floor = floors.find(f => f._id === p.floor_id);
            const branch = branches.find(b => b._id === p.branch_id);
            const building = buildings.find(b => b._id === p.building_id);

            return (
              <tr key={p._id} className="text-sm even:bg-gray-50 hover:bg-gray-100 transition-colors">
                <td className="border px-3 py-2 text-left">{user?.name || "-"}</td>
                <td className="border px-3 py-2 text-left">{branch?.name || "-"}</td>
                <td className="border px-3 py-2 text-left">{building?.name || "-"}</td>
                <td className="border px-3 py-2 text-center">{floor?.floor_number || "-"}</td>
                <td className="border px-3 py-2 text-center">{room?.room_number || "-"}</td>
                <td className="border px-3 py-2 text-center">{bed?.bed_number || "-"}</td>
                <td className="border px-3 py-2 text-right font-medium">{p.amount}</td>
                <td className="border px-3 py-2 text-right">{p.discount || 0}</td>
                <td className="border px-3 py-2 text-right">{p.paid || 0}</td>
                <td className="border px-3 py-2 text-right">{p.due || p.amount}</td>
                <td className="border px-3 py-2 text-center">{p.date}</td>
                <td className="border px-3 py-2 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    p.status === "paid" ? "bg-green-200 text-green-800" : p.status === "partial" ? "bg-orange-200 text-orange-800" : "bg-yellow-200 text-yellow-800"
                  }`}>{p.status}</span>
                </td>
                <td className="border px-3 py-2 text-center capitalize">{p.method}</td>
                <td className="border px-3 py-2">
                  <div className="flex gap-1 justify-center">
                    {p.due > 0 && (
  <button
    onClick={() => handleMakePaid(p)}
    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
  >
    Make Paid
  </button>
)}
                    <button onClick={() => handleEditPayment(p)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">Edit</button>
                    <button onClick={() => handleDeletePayment(p._id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">Delete</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}