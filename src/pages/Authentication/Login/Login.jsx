import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import { getFirebaseErrorMessage } from "../../../lib/firebaseErrors";
import { getHomePath, ROLE_LABELS } from "../../../lib/roles";
import { inputClass, labelClass } from "../../../lib/utils";
import ButtonSpinner from "../../../components/ui/ButtonSpinner";
import toast from "react-hot-toast";
import { GraduationCap, ArrowRight } from "lucide-react";
import SocialLogin from "../SocialLogin/SocialLogin";

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { signInUser, refreshAccount, logOut } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const result = await signInUser(data.email, data.password);
      const profile = await refreshAccount(result.user);

      if (!profile) {
        toast.error("Account not found. Please register first.");
        await logOut();
        return;
      }

      toast.success(`Welcome back, ${profile.name || ROLE_LABELS[profile.role]}!`);
      navigate(getHomePath(profile.role), { replace: true });
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold mb-4">
          <GraduationCap size={14} />
          Hostel MS
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Sign In</h1>
        <p className="text-sm text-slate-500 mb-6">
          One login for Admin, Manager, and Student — we&apos;ll take you to the right portal.
        </p>

        <SocialLogin />

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-slate-400">or sign in with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className={`${inputClass} focus:ring-emerald-500`}
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className={`${inputClass} focus:ring-emerald-500`}
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2.5 font-medium text-sm transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {submitting ? <ButtonSpinner /> : <>Sign In <ArrowRight size={16} /></>}
          </button>

          <p className="text-xs text-slate-400 text-center">
            Signed up with Google? Use the Google button above — no password needed.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
