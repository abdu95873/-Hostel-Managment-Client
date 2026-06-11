import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import { createAccount, hasAdminAccount } from "../../../lib/accountApi";
import { getFirebaseErrorMessage } from "../../../lib/firebaseErrors";
import { getHomePath } from "../../../lib/roles";
import { inputClass, labelClass } from "../../../lib/utils";
import ButtonSpinner from "../../../components/ui/ButtonSpinner";
import toast from "react-hot-toast";
import { GraduationCap, AlertCircle, Shield } from "lucide-react";
import SocialLogin from "../SocialLogin/SocialLogin";

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { registerUser, refreshAccount } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [adminExists, setAdminExists] = useState(true);
  const [bootstrapAdmin, setBootstrapAdmin] = useState(false);

  const password = watch("password");

  useEffect(() => {
    hasAdminAccount().then(setAdminExists).catch(() => setAdminExists(true));
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const role = bootstrapAdmin ? "admin" : "student";
      const result = await registerUser(data.email, data.password, data.name);
      await createAccount({
        email: data.email,
        name: data.name,
        role,
        firebase_uid: result.user.uid,
      });
      await refreshAccount(result.user);
      toast.success(bootstrapAdmin ? "Admin account created!" : "Student account created!");
      navigate(getHomePath(role), { replace: true });
    } catch (error) {
      toast.error(error.message || getFirebaseErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {!adminExists && !bootstrapAdmin && (
        <button
          type="button"
          onClick={() => setBootstrapAdmin(true)}
          className="w-full mb-4 flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 py-3 text-sm font-medium transition"
        >
          <Shield size={16} />
          First time? Set up Admin account
        </button>
      )}

      {bootstrapAdmin && (
        <button
          type="button"
          onClick={() => setBootstrapAdmin(false)}
          className="mb-4 text-xs text-emerald-600 font-medium hover:underline"
        >
          ← Back to student registration
        </button>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold mb-4">
          {bootstrapAdmin ? <Shield size={14} /> : <GraduationCap size={14} />}
          {bootstrapAdmin ? "Admin Setup" : "Student Registration"}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          {bootstrapAdmin ? "Create Admin Account" : "Register as Student"}
        </h1>
        <p className="text-sm text-slate-500 mb-4">
          {bootstrapAdmin
            ? "Hostel owner — full system access. Only for first-time setup."
            : "View your bed assignment and payment info."}
        </p>

        <div className="flex gap-2 bg-amber-50 border border-amber-100 rounded-lg p-3 mb-5 text-xs text-amber-800">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          {bootstrapAdmin
            ? "Use this only once to set up the system. Add more admins/managers from the dashboard later."
            : "Your email must already be added by the hostel admin before you can register."}
        </div>

        {!bootstrapAdmin && (
          <>
            <SocialLogin label="Register with Google" />
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-400">or register with email</span>
              </div>
            </div>
          </>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>Full Name</label>
            <input {...register("name", { required: "Name is required" })} className={`${inputClass} focus:ring-emerald-500`} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className={`${inputClass} focus:ring-emerald-500`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Password</label>
            <input
              type="password"
              {...register("password", {
                required: "Required",
                minLength: { value: 6, message: "Min 6 characters" },
              })}
              className={`${inputClass} focus:ring-emerald-500`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Confirm Password</label>
            <input
              type="password"
              {...register("confirmPassword", {
                required: "Required",
                validate: (v) => v === password || "Passwords do not match",
              })}
              className={`${inputClass} focus:ring-emerald-500`}
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2.5 font-medium text-sm transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {submitting ? <ButtonSpinner /> : bootstrapAdmin ? "Create Admin Account" : "Create Student Account"}
          </button>

          <p className="text-sm text-slate-500 text-center">
            Already registered?{" "}
            <Link to="/login" className="text-emerald-600 font-medium hover:text-emerald-800">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
