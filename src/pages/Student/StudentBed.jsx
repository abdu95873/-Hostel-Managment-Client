import { useEffect, useState } from "react";
import { BedDouble, MapPin } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import { formatCurrency } from "../../lib/utils";
import toast from "react-hot-toast";

export default function StudentBed() {
  const { user } = useAuth();
  const axios = useAxios();
  const [location, setLocation] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    axios
      .get(`/student/portal/${encodeURIComponent(user.email)}`)
      .then((res) => {
        setLocation(res.data.location);
        setStudent(res.data.student);
      })
      .catch(() => toast.error("Failed to load bed info"))
      .finally(() => setLoading(false));
  }, [user, axios]);

  if (loading) {
    return <div className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse" />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Bed</h1>

      {!location ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm">
          <BedDouble size={40} className="text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">No bed assigned</p>
          <p className="text-sm text-slate-400 mt-2">Contact your hostel manager to get a bed assigned.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <BedDouble size={22} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">Bed {location.bed}</p>
              <p className="text-sm text-slate-500">{student?.name}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              ["Branch", location.branch],
              ["Building", location.building],
              ["Floor", location.floor],
              ["Room", location.room],
            ].map(([label, val]) => (
              <div key={label} className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-medium uppercase text-slate-400 mb-1">{label}</p>
                <p className="text-sm font-semibold text-slate-800">{val ?? "—"}</p>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2 bg-emerald-50 rounded-xl p-4">
            <MapPin size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-800">Full Location</p>
              <p className="text-sm text-slate-600 mt-1">
                {[location.branch, location.building, `Floor ${location.floor}`, `Room ${location.room}`, `Bed ${location.bed}`]
                  .filter(Boolean)
                  .join(" › ")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div>
              <p className="text-xs text-slate-400">Amount</p>
              <p className="text-sm font-bold text-slate-900">{formatCurrency(location.amount)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Discount</p>
              <p className="text-sm font-bold text-slate-900">{formatCurrency(location.discount || 0)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Payable</p>
              <p className="text-sm font-bold text-emerald-600">
                {formatCurrency((location.amount || 0) - (location.discount || 0))}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
