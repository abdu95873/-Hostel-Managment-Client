import { useEffect, useState } from "react";
import {
  Users,
  TrendingUp,
  Tag,
  CreditCard,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import useAxios from "../../../hooks/useAxios";
import PageHeader from "../../../components/ui/PageHeader";
import StatCard from "../../../components/ui/StatCard";
import { formatCurrency, selectClass } from "../../../lib/utils";
import toast from "react-hot-toast";

const DashboardHome = () => {
  const axios = useAxios();
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [availableMonths, setAvailableMonths] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAmount: 0,
    totalDiscount: 0,
    totalPayable: 0,
    totalPaid: 0,
    totalDue: 0,
  });

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    if (!selectedYear) {
      setAvailableMonths([]);
      return;
    }

    const fetchMonths = async () => {
      try {
        const res = await axios.get(`/dashboard/months?year=${selectedYear}`);
        setAvailableMonths(res.data.months || []);
      } catch {
        toast.error("Failed to load months");
      }
    };

    fetchMonths();
  }, [selectedYear, axios]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        let url = "/dashboard/stats";
        if (selectedMonth) {
          url = `/dashboard/stats?month=${selectedMonth}`;
        } else if (selectedYear) {
          url = `/dashboard/stats?year=${selectedYear}`;
        }
        const res = await axios.get(url);
        setStats(res.data);
      } catch {
        toast.error("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedYear, selectedMonth, axios]);

  const statCards = [
    {
      label: "Total Students",
      value: stats.totalStudents?.toLocaleString() ?? "0",
      icon: Users,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: "Total Amount",
      value: formatCurrency(stats.totalAmount),
      icon: TrendingUp,
      iconBg: "bg-sky-100",
      iconColor: "text-sky-500",
    },
    {
      label: "Total Discount",
      value: formatCurrency(stats.totalDiscount),
      icon: Tag,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-500",
    },
    {
      label: "Total Payable",
      value: formatCurrency(stats.totalPayable),
      icon: CreditCard,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: "Total Paid",
      value: formatCurrency(stats.totalPaid),
      icon: CheckCircle,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: "Total Due",
      value: formatCurrency(stats.totalDue),
      icon: AlertCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
      highlight: stats.totalDue > 0,
    },
  ];

  return (
    <div>
      <PageHeader title="Dashboard Overview" subtitle={today} />

      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-500 mb-1.5">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setSelectedMonth("");
              }}
              className={selectClass}
            >
              <option value="">All Years</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-500 mb-1.5">
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className={selectClass}
              disabled={!selectedYear}
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} loading={loading} />
        ))}
      </div>
    </div>
  );
};

export default DashboardHome;
