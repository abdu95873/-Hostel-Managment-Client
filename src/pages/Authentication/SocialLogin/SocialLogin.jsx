import { useState } from "react";
import useAuth from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { linkGoogleAccount } from "../../../lib/accountApi";
import { getFirebaseErrorMessage } from "../../../lib/firebaseErrors";
import { getHomePath, ROLE_LABELS } from "../../../lib/roles";
import toast from "react-hot-toast";

const SocialLogin = ({ label = "Continue with Google" }) => {
  const { signInGoogle, refreshAccount, logOut, setAccount } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInGoogle();
      const { user } = result;

      let profile = await refreshAccount(user);

      if (!profile) {
        profile = await linkGoogleAccount({
          email: user.email,
          name: user.displayName,
          firebase_uid: user.uid,
        });
        setAccount(profile);
      }

      toast.success(`Welcome, ${profile.name || ROLE_LABELS[profile.role]}!`);
      navigate(getHomePath(profile.role), { replace: true });
    } catch (error) {
      toast.error(error.message || getFirebaseErrorMessage(error));
      await logOut();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 rounded-lg px-4 py-2.5 font-medium text-sm transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
    >
      {loading ? "Signing in..." : (
        <>
          <svg aria-label="Google logo" width="16" height="16" viewBox="0 0 512 512">
            <path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57" />
            <path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341" />
            <path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73" />
            <path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
};

export default SocialLogin;
