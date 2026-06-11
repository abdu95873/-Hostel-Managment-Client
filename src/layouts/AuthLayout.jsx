import { Link, Outlet } from "react-router-dom";
import { Building2 } from "lucide-react";

const AUTH_IMAGE =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=80&auto=format&fit=crop";

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="px-6 py-4 border-b border-slate-200 bg-white">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Building2 size={16} className="text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900">Hostel MS</span>
            <span className="hidden sm:inline text-xs text-emerald-600 font-medium ml-2">Student Portal</span>
          </div>
        </Link>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        <div className="flex items-center justify-center p-6 sm:p-10">
          <Outlet />
        </div>

        <div className="hidden lg:block relative overflow-hidden">
          <img src={AUTH_IMAGE} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/95 via-emerald-900/90 to-emerald-800/85" />
          <div className="relative h-full flex items-center justify-center p-12">
            <div className="max-w-md text-white">
              <h2 className="text-3xl font-bold mb-4">Welcome to Hostel MS</h2>
              <p className="text-emerald-100 leading-relaxed mb-8">
                Students check bed and rent info. Admins and managers run the hostel from one dashboard.
              </p>
              <ul className="space-y-3 text-sm text-emerald-100">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-300 text-xs">✓</span>
                  One login for all roles
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-300 text-xs">✓</span>
                  Bed assignment & payment tracking
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-300 text-xs">✓</span>
                  Secure Firebase authentication
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
