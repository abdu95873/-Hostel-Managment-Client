import { useEffect, useState } from "react";
import Select from "react-select";
import useAxios from "../../../hooks/useAxios";

// ---------------- ADD PAYMENT FORM ----------------
function AddPaymentForm({ branches, buildings, floors, rooms, beds, users, payments, onSuccess }) {
  const axios = useAxios();

  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [amount, setAmount] = useState("");
  const [discount, setDiscount] = useState("");
  const [method, setMethod] = useState("cash");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  // ---------------- FILTER OPTIONS ----------------
  const filteredBuildings = selectedBranch
    ? buildings.filter(b => b.branch_id === selectedBranch.value)
    : [];

  const filteredFloors = selectedBuilding
    ? floors.filter(f => f.building_id === selectedBuilding.value)
    : [];

  const filteredRooms = selectedFloor
    ? rooms.filter(r => r.floor_id === selectedFloor.value)
    : [];

  const filteredBeds = selectedRoom
    ? beds.filter(b => b.room_id === selectedRoom.value)
    : [];

  // ---------------- SAFE RESET CHILD SELECTS ----------------
  useEffect(() => {
    const timer = setTimeout(() => {
      setSelectedBuilding(null);
      setSelectedFloor(null);
      setSelectedRoom(null);
      setSelectedBed(null);
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedBranch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSelectedFloor(null);
      setSelectedRoom(null);
      setSelectedBed(null);
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedBuilding]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSelectedRoom(null);
      setSelectedBed(null);
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedFloor]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSelectedBed(null);
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedRoom]);

  // ---------------- CALCULATE PAYABLE ----------------
  const payableAmount = Number(amount || 0) - Number(discount || 0);


  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser || !selectedBranch || !selectedBuilding)
      return alert("Select user, branch, and building");

    // Check duplicate payment for same month
    const existingPayment = payments.find(
      p => p.user_id === selectedUser.value && p.month === month
    );
    if (existingPayment) {
      return alert(`Payment for ${selectedUser.label} in ${month} already exists!`);
    }

    const payload = {
      branch_id: selectedBranch.value,
      building_id: selectedBuilding.value,
      floor_id: selectedFloor?.value || null,
      room_id: selectedRoom?.value || null,
      bed_id: selectedBed?.value || null,
      user_id: selectedUser.value,
      amount: Number(amount),
      discount: Number(discount),
      payable: payableAmount, // <-- NEW
      method,
      date,
      month,
      status: "pending",
    };

    try {
      await axios.post("/payments", payload);
      alert("Payment added successfully!");
      onSuccess();

      // reset form
      setSelectedBranch(null);
      setSelectedBuilding(null);
      setSelectedFloor(null);
      setSelectedRoom(null);
      setSelectedBed(null);
      setSelectedUser(null);
      setAmount("");
      setDiscount("");
      setMethod("cash");
    } catch (err) {
      console.error(err);
      alert("Failed to add payment");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded mb-6 flex flex-col gap-2">
      <Select
        options={branches.map(b => ({ value: b._id, label: b.name }))}
        placeholder="Branch"
        onChange={setSelectedBranch}
        value={selectedBranch}
      />
      <Select
        options={filteredBuildings.map(b => ({ value: b._id, label: b.name }))}
        placeholder="Building"
        onChange={setSelectedBuilding}
        value={selectedBuilding}
      />
      <Select
        options={filteredFloors.map(f => ({ value: f._id, label: `Floor ${f.floor_number}` }))}
        placeholder="Floor"
        onChange={setSelectedFloor}
        value={selectedFloor}
      />
      <Select
        options={filteredRooms.map(r => ({ value: r._id, label: `Room ${r.room_number}` }))}
        placeholder="Room"
        onChange={setSelectedRoom}
        value={selectedRoom}
      />
      <Select
        options={filteredBeds.map(b => ({ value: b._id, label: `Bed ${b.bed_number}` }))}
        placeholder="Bed"
        onChange={setSelectedBed}
        value={selectedBed}
      />
      <Select
        options={users.map(u => ({ value: u._id, label: u.name }))}
        placeholder="User"
        onChange={setSelectedUser}
        value={selectedUser}
      />

      <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="border p-1 rounded" />
      <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} className="border p-1 rounded" />
      <input type="number" placeholder="Discount" value={discount} onChange={e => setDiscount(e.target.value)} className="border p-1 rounded" />
        {/* ---------------- PAYABLE DISPLAY ---------------- */}
      <div className="border p-1 rounded bg-gray-100 font-semibold">
        Payable: {payableAmount}
      </div>
      <select value={method} onChange={e => setMethod(e.target.value)} className="border p-1 rounded">
        <option value="cash">Cash</option>
        <option value="card">Card</option>
        <option value="online">Online</option>
      </select>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border p-1 rounded hidden" />

      <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded mt-2">Add Payment</button>
    </form>
  );
}

// ---------------- PAYMENTS PAGE ----------------
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

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const resetFilters = () => setFilters({ branch: "", building: "", floor: "", room: "", bed: "", user: "" });

  const filteredPayments = payments.filter(p => {
    const user = users.find(u => u._id === p.user_id);
    const bed = beds.find(b => b._id === p.bed_id);
    const room = rooms.find(r => r._id === p.room_id);
    const floor = floors.find(f => f._id === p.floor_id);
    const branch = branches.find(b => b._id === p.branch_id);
    const building = buildings.find(b => b._id === p.building_id);

    return (
      (!filters.branch || branch?._id === filters.branch) &&
      (!filters.building || building?._id === filters.building) &&
      (!filters.floor || floor?._id === filters.floor) &&
      (!filters.room || room?._id === filters.room) &&
      (!filters.bed || bed?._id === filters.bed) &&
      (!filters.user || user?._id === filters.user)
    );
  });

  const handleMarkPaid = async (paymentId, issuerId) => {
  try {
    await axios.put(`/payments/${paymentId}`, { 
      status: "paid", 
      issuer: issuerId // <-- issuer pass
    });
    setPayments(prev => prev.map(p => 
      (p._id === paymentId ? { ...p, status: "paid", issuer: issuerId } : p)
    ));
  } catch (err) {
    console.error(err);
    alert("Failed to mark as paid");
  }
};

  const handleDeletePayment = async (paymentId) => {
    try {
      await axios.delete(`/payments/${paymentId}`);
      setPayments(prev => prev.filter(p => p._id !== paymentId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete payment");
    }
  };

  const handleEditPayment = async (paymentId) => {
    const newAmount = prompt("Enter new amount:");
    if (!newAmount) return;
    try {
      await axios.put(`/payments/${paymentId}`, { amount: Number(newAmount) });
      setPayments(prev => prev.map(p => (p._id === paymentId ? { ...p, amount: Number(newAmount) } : p)));
    } catch (err) {
      console.error(err);
      alert("Failed to edit payment");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Payments</h1>

      <AddPaymentForm
        branches={branches}
        buildings={buildings}
        floors={floors}
        rooms={rooms}
        beds={beds}
        users={users}
        payments={payments}
        onSuccess={() => axios.get("/payments").then(res => setPayments(res.data))}
      />

      {/* Filters */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <select name="branch" value={filters.branch} onChange={handleFilterChange} className="border p-2 rounded">
          <option value="">All Branches</option>
          {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>

        <select name="building" value={filters.building} onChange={handleFilterChange} className="border p-2 rounded">
          <option value="">All Buildings</option>
          {buildings.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>

        <select name="floor" value={filters.floor} onChange={handleFilterChange} className="border p-2 rounded">
          <option value="">All Floors</option>
          {floors.map(f => <option key={f._id} value={f._id}>{f.floor_number}</option>)}
        </select>

        <select name="room" value={filters.room} onChange={handleFilterChange} className="border p-2 rounded">
          <option value="">All Rooms</option>
          {rooms.map(r => <option key={r._id} value={r._id}>{r.room_number}</option>)}
        </select>

        <select name="bed" value={filters.bed} onChange={handleFilterChange} className="border p-2 rounded">
          <option value="">All Beds</option>
          {beds.map(b => <option key={b._id} value={b._id}>{b.bed_number}</option>)}
        </select>

        <select name="user" value={filters.user} onChange={handleFilterChange} className="border p-2 rounded">
          <option value="">All Users</option>
          {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
        </select>

        <button onClick={resetFilters} className="bg-gray-200 px-3 rounded hover:bg-gray-300">Reset</button>
      </div>

      {/* Payments Table */}
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
            <th className="border px-2 py-1">Payable </th>
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
              <tr key={p._id} className="text-sm">
                <td className="border px-2 py-1">{user?.name || "-"}</td>
                <td className="border px-2 py-1">{branch?.name || "-"}</td>
                <td className="border px-2 py-1">{building?.name || "-"}</td>
                <td className="border px-2 py-1">{floor?.floor_number || "-"}</td>
                <td className="border px-2 py-1">{room?.room_number || "-"}</td>
                <td className="border px-2 py-1">{bed?.bed_number || "-"}</td>
                <td className="border px-2 py-1">{p.amount}</td>
                <td className="border px-2 py-1">{p.discount || 0}</td>
                <td className="border px-2 py-1">{p.payable || p.amount}</td>
                <td className="border px-2 py-1">{p.date}</td>
                <td className="border px-2 py-1">{p.status}</td>
                <td className="border px-2 py-1">{p.method}</td>
                <td className="border px-2 py-1 flex gap-1">
                  {p.status !== "paid" && (
                    <button onClick={() => handleMarkPaid(p._id)} className="bg-green-500 text-white px-2 py-1 rounded text-xs">Mark Paid</button>
                  )}
                  <button onClick={() => handleEditPayment(p._id)} className="bg-blue-500 text-white px-2 py-1 rounded text-xs">Edit</button>
                  <button onClick={() => handleDeletePayment(p._id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs">Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}