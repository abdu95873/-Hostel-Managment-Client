import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Building2, LogOut, BedDouble, CreditCard, Home } from "lucide-react";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";

const StudentLayout = () => {
  const { account, logOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logOut();
    toast.success("Logged out");
    navigate("/login");
  };

  const navItems = [
    { to: "/student", icon: Home, label: "Overview", end: true },
    { to: "/student/payments", icon: CreditCard, label: "My Payments" },
    { to: "/student/bed", icon: BedDouble, label: "My Bed" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 h-16 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-full flex items-center justify-between">
          <Link to="/student" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Building2 size={16} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm">Hostel MS</span>
              <span className="block text-[10px] text-emerald-600 font-semibold uppercase">Student Portal</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-800">{account?.name}</p>
              <p className="text-xs text-slate-400">Student</p>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/student"}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  isActive
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
