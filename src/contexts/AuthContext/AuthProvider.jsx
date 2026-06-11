import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../../firebase/firebase.init";
import { fetchAccountByEmail } from "../../lib/accountApi";

const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  const userRole = account?.role || null;

  const loadAccount = async (firebaseUser) => {
    if (!firebaseUser?.email) {
      setAccount(null);
      return null;
    }
    const profile = await fetchAccountByEmail(firebaseUser.email);
    setAccount(profile);
    return profile;
  };

  const registerUser = async (email, password, displayName) => {
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      return result;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signInUser = async (email, password) => {
    setLoading(true);
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signInGoogle = () => {
    setLoading(true);
    return signInWithPopup(auth, googleProvider);
  };

  const logOut = () => {
    setLoading(true);
    setAccount(null);
    return signOut(auth);
  };

  const updateUserProfile = (profile) => updateProfile(auth.currentUser, profile);

  const refreshAccount = (firebaseUser) => {
    const u = firebaseUser || auth.currentUser || user;
    if (u) return loadAccount(u);
    return Promise.resolve(null);
  };

  useEffect(() => {
    const unSubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadAccount(currentUser);
      } else {
        setAccount(null);
      }
      setLoading(false);
    });
    return () => unSubscribe();
  }, []);

  const authInfo = {
    user,
    account,
    userRole,
    loading,
    registerUser,
    signInUser,
    signInGoogle,
    logOut,
    updateUserProfile,
    refreshAccount,
    setAccount,
  };

  return <AuthContext value={authInfo}>{children}</AuthContext>;
};

export default AuthProvider;
