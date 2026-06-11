import { Link } from "react-router-dom";
import {
  BedDouble,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  ChevronDown,
  Mail,
  Phone,
  Sparkles,
  MapPin,
  Receipt,
  Shield,
} from "lucide-react";
import { useState } from "react";
import useAuth from "../../../hooks/useAuth";
import { getHomePath } from "../../../lib/roles";

const IMAGES = {
  hero: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80&auto=format&fit=crop",
  dorm: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80&auto=format&fit=crop",
  study: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&q=80&auto=format&fit=crop",
  payment: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=900&q=80&auto=format&fit=crop",
  campus: "https://images.unsplash.com/photo-1562774053-701939374585?w=900&q=80&auto=format&fit=crop",
  friends: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80&auto=format&fit=crop",
  building: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&q=80&auto=format&fit=crop",
};

const studentFeatures = [
  {
    icon: MapPin,
    title: "Your Bed & Room",
    description: "See exactly where you stay — branch, building, floor, room, and bed number in one place.",
    image: IMAGES.dorm,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    overlay: "from-emerald-900/30",
  },
  {
    icon: CreditCard,
    title: "Rent & Due Amount",
    description: "Check monthly hostel fee, total paid, and how much is still due — all in ৳ BDT.",
    image: IMAGES.payment,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    overlay: "from-indigo-900/30",
  },
  {
    icon: Receipt,
    title: "Payment History",
    description: "View every payment you made with date and amount. No need to ask the office every time.",
    image: IMAGES.campus,
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    overlay: "from-sky-900/30",
  },
];

const steps = [
  {
    step: "01",
    title: "Added by Hostel",
    desc: "Your hostel admin or manager adds your name and email in the system.",
    image: IMAGES.building,
  },
  {
    step: "02",
    title: "Create Account",
    desc: "Register at Student Portal using the same email your hostel registered for you.",
    image: IMAGES.friends,
  },
  {
    step: "03",
    title: "Access Portal",
    desc: "Log in anytime to see your bed, rent, dues, and payment history.",
    image: IMAGES.dorm,
  },
];

const faqs = [
  {
    q: "How do I get a student account?",
    a: "Your hostel must add you first in their dashboard. After that, go to Student Register and sign up with the same email they used.",
  },
  {
    q: "What can I see in the student portal?",
    a: "Your assigned bed (branch, room, bed number), monthly rent, total paid, amount due, and full payment history.",
  },
  {
    q: "I can't register — what should I do?",
    a: "Make sure your hostel has added your email in the system. Contact your warden or hostel office if the email doesn't match.",
  },
  {
    q: "Is this for hostel owners too?",
    a: "Yes. Hostel admins and managers use a separate dashboard. Students only see their own information — nothing else.",
  },
];

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition"
      >
        <span className="text-sm font-semibold text-slate-800 pr-4">{q}</span>
        <ChevronDown size={18} className={`text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">{a}</div>
      )}
    </div>
  );
};

const Home = () => {
  const { user, userRole } = useAuth();

  return (
    <div className="bg-white">
      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <img
          src={IMAGES.hero}
          alt="Students at university hostel"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/85 to-emerald-900/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-28 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold mb-6">
                <Sparkles size={14} className="text-amber-300" />
                Student Portal · Hostel MS
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
                Your Hostel,
                <span className="block text-emerald-300">One Click Away</span>
              </h1>
              <p className="text-lg text-emerald-100/90 mb-8 leading-relaxed max-w-xl">
                Check your bed assignment, monthly rent, and payment history anytime — no need to visit the office.
              </p>

              {user ? (
                <Link
                  to={getHomePath(userRole)}
                  className="inline-flex items-center gap-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl px-8 py-4 font-semibold text-sm transition-all shadow-xl"
                >
                  {userRole === "student" ? "Open My Portal" : "Go to Dashboard"}
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl px-8 py-4 font-semibold text-sm transition-all shadow-xl"
                  >
                    Student Login
                    <ArrowRight size={18} />
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 bg-emerald-600/30 hover:bg-emerald-600/40 backdrop-blur-sm text-white border border-white/25 rounded-xl px-6 py-4 font-medium text-sm transition-all"
                  >
                    Create Account
                  </Link>
                </div>
              )}

              <div className="flex flex-wrap gap-5 mt-10 text-sm text-emerald-200/80">
                {["Bed info", "Rent & dues", "Payment history", "24/7 access"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-emerald-400" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Hero preview card */}
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl">
                <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
                  <img src={IMAGES.dorm} alt="Hostel room" className="w-full h-44 object-cover" />
                  <div className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <GraduationCap size={20} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">Student Portal</p>
                        <p className="text-xs text-slate-500">Your hostel at a glance</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Rent", value: "৳4,500" },
                        { label: "Paid", value: "৳3,000" },
                        { label: "Due", value: "৳1,500" },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                          <p className="text-[10px] text-slate-400 uppercase">{label}</p>
                          <p className="text-sm font-bold text-slate-800 mt-0.5">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5">
                      <BedDouble size={16} className="text-emerald-600 shrink-0" />
                      <p className="text-xs text-emerald-800">Room 204 · Bed B · Floor 2</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STUDENT FEATURES ── */}
      <section id="features" className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-emerald-600 text-sm font-semibold uppercase tracking-wider mb-3">For Students</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Everything You Need in One Place</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              No more calling the warden or checking notice boards. Your hostel info is always available on your phone or laptop.
            </p>
          </div>

          <div className="space-y-16">
            {studentFeatures.map(({ icon: Icon, title, description, image, iconBg, iconColor, overlay }, i) => (
              <div
                key={title}
                className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center"
              >
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center mb-4`}>
                    <Icon size={22} className={iconColor} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
                  <p className="text-slate-600 leading-relaxed text-base">{description}</p>
                </div>
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200">
                    <img src={image} alt={title} className="w-full object-cover aspect-[4/3]" />
                    <div className={`absolute inset-0 bg-gradient-to-t ${overlay} to-transparent`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="about" className="py-20 lg:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-emerald-600 text-sm font-semibold uppercase tracking-wider mb-3">Getting Started</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">How to Access Your Portal</h2>
            <p className="text-slate-600 max-w-xl mx-auto">Three simple steps — takes less than 2 minutes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(({ step, title, desc, image }) => (
              <div key={step} className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold shadow-lg">
                    {step}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {!user && (
            <div className="text-center mt-12">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 py-3.5 font-semibold text-sm transition shadow-lg shadow-emerald-200"
              >
                Register as Student <ArrowRight size={16} />
              </Link>
              <p className="text-xs text-slate-500 mt-3">Already registered? <Link to="/login" className="text-emerald-600 font-medium hover:underline">Log in here</Link></p>
            </div>
          )}
        </div>
      </section>

      {/* ── IMAGE BANNER ── */}
      <section id="services" className="relative py-24 overflow-hidden">
        <img src={IMAGES.friends} alt="Students together" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-emerald-900/88" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Stay Informed, Stay Relaxed</h2>
              <p className="text-emerald-100 text-lg leading-relaxed mb-8">
                Focus on your studies — let Hostel MS handle the paperwork. Know your dues before the deadline and never miss a payment update.
              </p>
              <ul className="space-y-3">
                {[
                  "Real-time bed assignment status",
                  "Monthly rent breakdown in ৳ BDT",
                  "Full payment history with dates",
                  "Secure login — only your data",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-emerald-100">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[IMAGES.dorm, IMAGES.payment, IMAGES.campus, IMAGES.friends].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className={`rounded-2xl object-cover shadow-xl border-2 border-white/20 ${i % 2 === 0 ? "mt-6" : ""}`}
                  style={{ height: i % 2 === 0 ? "180px" : "140px" }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Student FAQ</h2>
            <p className="text-slate-600">Common questions about the student portal</p>
          </div>
          <div className="space-y-3">
            {faqs.map(({ q, a }) => (
              <FaqItem key={q} q={q} a={a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── STAFF ACCESS (secondary) ── */}
      <section className="py-16 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-slate-900 rounded-3xl overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <img src={IMAGES.building} alt="Hostel building" className="w-full h-full object-cover min-h-[220px] hidden sm:block" />
              <div className="p-8 sm:p-10 flex flex-col justify-center">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">For Staff Only</p>
                <h3 className="text-2xl font-bold text-white mb-3">Hostel Admin & Manager?</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  If you manage the hostel — not a student — use the admin or manager portal to control students, beds, and payments.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-5 py-2.5 text-sm font-medium transition"
                  >
                    <Shield size={16} /> Staff Sign In
                  </Link>
                </div>
                <p className="text-slate-500 text-xs mt-4">
                  New admin or manager? Ask the hostel admin to create your account from the dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <img
              src={IMAGES.study}
              alt="Student studying"
              className="rounded-2xl shadow-xl border border-slate-200 w-full object-cover aspect-[4/3] hidden sm:block"
            />
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Need Help?</h2>
              <p className="text-slate-600 mb-8">
                Can&apos;t log in or your bed info looks wrong? Contact your hostel office first, or reach us directly.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Mail size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Email</p>
                    <p className="text-sm font-medium text-slate-800">support@hostelms.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Phone size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Phone</p>
                    <p className="text-sm font-medium text-slate-800">+880 1XXX-XXXXXX</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto relative rounded-3xl overflow-hidden">
          <img src={IMAGES.hero} alt="" className="absolute inset-0 w-full h-full object-cover" aria-hidden />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/95 to-emerald-800/90" />
          <div className="relative px-8 py-14 sm:px-16 sm:py-16 text-center text-white">
            <GraduationCap size={40} className="mx-auto mb-4 text-emerald-300" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Check Your Hostel Info?</h2>
            <p className="text-emerald-200 mb-8 max-w-lg mx-auto">
              Log in to see your bed, rent, and payments — or create your account if your hostel already added you.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to={user ? getHomePath(userRole) : "/login"}
                className="inline-flex items-center gap-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl px-8 py-3.5 font-semibold text-sm transition shadow-lg"
              >
                {user ? "Open Portal" : "Student Login"}
                <ArrowRight size={16} />
              </Link>
              {!user && (
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 border border-white/30 text-white hover:bg-white/10 rounded-xl px-6 py-3.5 text-sm font-medium transition"
                >
                  Create Account
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
