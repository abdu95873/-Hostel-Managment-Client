import { Link } from "react-router-dom";
import { Building2, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
                <Building2 size={18} className="text-white" />
              </div>
              <span className="font-bold text-white text-lg">Hostel MS</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Your personal hostel portal — check bed assignment, monthly rent, and payment history anytime.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Student</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/#features" className="hover:text-white transition">Features</a></li>
              <li><a href="/#about" className="hover:text-white transition">How It Works</a></li>
              <li><a href="/#faq" className="hover:text-white transition">FAQ</a></li>
              <li><Link to="/login" className="hover:text-white transition">Login</Link></li>
              <li><Link to="/register" className="hover:text-white transition">Register</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Portal Features</h4>
            <ul className="space-y-2 text-sm">
              <li>Bed Assignment</li>
              <li>Rent & Due Amount</li>
              <li>Payment History</li>
              <li>Monthly Fee in ৳ BDT</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-emerald-400 shrink-0" />
                <span>support@hostelms.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-emerald-400 shrink-0" />
                <span>+880 1XXX-XXXXXX</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Dhaka, Bangladesh</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Hostel MS. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/login" className="hover:text-slate-300 transition">Login</Link>
            <Link to="/register" className="hover:text-slate-300 transition">Register</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
