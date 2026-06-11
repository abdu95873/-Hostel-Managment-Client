import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  LogOut,
  LayoutDashboard,
  GraduationCap,
  Users,
  BedDouble,
  Building2,
  Layers,
  DoorOpen,
  CreditCard,
  FileText,
  Menu,
  X,
  Bell,
  Shield,
} from "lucide-react";
import { useState } from "react";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logOut, account, userRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logOut();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Failed to logout");
    } finally {
      setLoggingOut(false);
    }
  };

  const isActive = (path) =>
    path === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(path);

  const menuItems = [
    {
      category: "Dashboard",
      items: [{ path: "/dashboard", icon: LayoutDashboard, label: "Overview" }],
    },
    {
      category: "Students",
      items: [
        { path: "/dashboard/users", icon: Users, label: "Students" },
        { path: "/dashboard/assignRoom", icon: BedDouble, label: "Bed Assignment" },
      ],
    },
    {
      category: "Hostel",
      items: [
        { path: "/dashboard/branches", icon: GraduationCap, label: "Branches" },
        { path: "/dashboard/buildings", icon: Building2, label: "Buildings" },
        { path: "/dashboard/floors", icon: Layers, label: "Floors" },
        { path: "/dashboard/rooms", icon: DoorOpen, label: "Rooms" },
        { path: "/dashboard/beds", icon: BedDouble, label: "Beds" },
      ],
    },
    {
      category: "Accounts",
      items: [
        { path: "/dashboard/payments", icon: CreditCard, label: "Payments" },
        { path: "/dashboard/accounting", icon: FileText, label: "Accounting" },
        ...(userRole === "admin"
          ? [{ path: "/dashboard/staff", icon: Shield, label: "Staff Accounts" }]
          : []),
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 h-16">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-all"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Building2 size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">Hostel MS</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-all" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-semibold">
                {account?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div>
                <span className="text-sm font-medium text-slate-700">{account?.name || "Admin"}</span>
                <span className="block text-[10px] text-emerald-600 font-semibold uppercase">{userRole || "staff"}</span>
              </div>
            </div>
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 rounded-lg px-3 py-2 text-sm font-medium transition-all"
            >
              <Home size={15} />
              Home
            </Link>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 py-2 text-sm font-medium transition-all disabled:opacity-50 cursor-pointer"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">{loggingOut ? "..." : "Logout"}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={`fixed top-16 left-0 bottom-0 w-[280px] bg-white border-r border-slate-200 z-40 overflow-y-auto transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          <nav className="p-4 pb-20">
            {menuItems.map((section, idx) => (
              <div key={idx} className="mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
                  {section.category}
                </h3>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                            active
                              ? "bg-emerald-600 text-white"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <Icon size={18} />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 bg-white">
            <p className="text-xs text-slate-400 text-center">Hostel MS v1.0</p>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden top-16"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-[280px] p-4 sm:p-6 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
