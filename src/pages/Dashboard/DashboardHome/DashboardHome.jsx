import { useEffect, useState } from "react";
import useAxios from "../../../hooks/useAxios";

const DashboardHome = () => {
  const axios = useAxios();

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [availableMonths, setAvailableMonths] = useState([]);

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAmount: 0,
    totalDiscount: 0,
    totalPayable: 0,
    totalPaid: 0,
    totalDue: 0,
  });

  // Year change হলে months load
  useEffect(() => {
    if (!selectedYear) {
      setAvailableMonths([]);
      return;
    }

    const fetchMonths = async () => {
      try {
        const res = await axios.get(`/dashboard/months?year=${selectedYear}`);
        setAvailableMonths(res.data.months || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMonths();
  }, [selectedYear]);

  // Stats fetch
  useEffect(() => {
    const fetchStats = async () => {
      try {
        let url = "/dashboard/stats";

        if (selectedMonth) {
          url = `/dashboard/stats?month=${selectedMonth}`;
        } else if (selectedYear) {
          url = `/dashboard/stats?year=${selectedYear}`;
        }

        const res = await axios.get(url);
        setStats(res.data);

      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, [selectedYear, selectedMonth]);

  return (
    <div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">

        {/* Year */}
        <div>
          <label className="font-medium mr-2">Select Year:</label>

          <select
            value={selectedYear}
           onChange={(e) => {
  setSelectedYear(e.target.value);
  setSelectedMonth(""); // year change হলে month reset
}}
            className="border p-2 rounded"
          >
            <option value="">All Years</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
        </div>

        {/* Month */}
        <div>
          <label className="font-medium mr-2">Select Month:</label>

          <select
  value={selectedMonth}
  onChange={(e) => setSelectedMonth(e.target.value)}
  className="border p-2 rounded"
  disabled={!selectedYear} // year select না করলে disabled
>
  <option value="">All Months</option>
  {availableMonths.map((m) => (
    <option key={m} value={m}>
      {m}
    </option>
  ))}
</select>
        </div>

      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-5">

        <div className="bg-white p-5 rounded shadow">
          <h2>Total Students</h2>
          <p className="text-2xl font-bold">{stats.totalStudents}</p>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <h2>Total Amount</h2>
          <p className="text-2xl font-bold">৳ {stats.totalAmount || 0}</p>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <h2>Total Discount</h2>
          <p className="text-2xl font-bold text-green-500">
            ৳ {stats.totalDiscount || 0}
          </p>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <h2>Total Payable</h2>
          <p className="text-2xl font-bold">৳ {stats.totalPayable || 0}</p>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <h2>Total Paid</h2>
          <p className="text-2xl font-bold text-blue-500">
            ৳ {stats.totalPaid || 0}
          </p>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <h2>Total Due</h2>
          <p className="text-2xl font-bold text-red-500">
            ৳ {stats.totalDue || 0}
          </p>
        </div>

      </div>

    </div>
  );
};

export default DashboardHome;