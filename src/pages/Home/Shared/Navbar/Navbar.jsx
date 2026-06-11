import { Link, useLocation, useNavigate } from "react-router-dom";
import { Building2, Menu, X, GraduationCap, LogOut } from "lucide-react";
import { useState } from "react";
import useAuth from "../../../../hooks/useAuth";
import { getHomePath } from "../../../../lib/roles";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/#features", label: "Features" },
  { to: "/#about", label: "How It Works" },
  { to: "/#faq", label: "FAQ" },
  { to: "/#contact", label: "Contact" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logOut, user, userRole } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogOut = async () => {
    await logOut();
    navigate("/login");
  };

  const isActive = (to) => {
    if (to === "/") return location.pathname === "/" && !location.hash;
    if (to.startsWith("/#")) return location.hash === to.slice(1);
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
            <Building2 size={18} className="text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 leading-none">Hostel MS</span>
            <span className="hidden sm:block text-[10px] text-emerald-600 font-medium tracking-wide">Student Portal</span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5">
          {navLinks.map(({ to, label }) => (
            <a
              key={to}
              href={to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive(to) ? "text-emerald-700 bg-emerald-50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link
                to={getHomePath(userRole)}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all shadow-sm"
              >
                <GraduationCap size={16} />
                {userRole === "student" ? "My Portal" : "Dashboard"}
              </Link>
              <button
                onClick={handleLogOut}
                className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium cursor-pointer"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-emerald-700 hover:text-emerald-900 px-3 py-2 text-sm font-medium">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all shadow-sm"
              >
                Register
              </Link>
            </>
          )}
        </div>

        <button
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto">
          {navLinks.map(({ to, label }) => (
            <a
              key={to}
              href={to}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                isActive(to) ? "bg-emerald-50 text-emerald-700" : "text-slate-600"
              }`}
            >
              {label}
            </a>
          ))}
          <div className="pt-3 mt-2 flex flex-col gap-2 border-t border-slate-100">
            {user ? (
              <>
                <Link
                  to={getHomePath(userRole)}
                  onClick={() => setMobileOpen(false)}
                  className="bg-emerald-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium text-center"
                >
                  {userRole === "student" ? "My Portal" : "Dashboard"}
                </Link>
                <button onClick={handleLogOut} className="text-slate-600 py-2 text-sm font-medium">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-center">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="bg-emerald-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium text-center">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
