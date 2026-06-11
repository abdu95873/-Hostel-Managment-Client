export const getFirebaseErrorMessage = (error) => {
  const code = error?.code || "";

  const messages = {
    "auth/invalid-email": "Invalid email address.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/popup-closed-by-user": "Google sign-in was cancelled.",
    "auth/account-exists-with-different-credential": "An account already exists with this email using a different sign-in method.",
    "auth/network-request-failed": "Network error. Check your internet connection.",
    "auth/configuration-not-found": "Firebase is not configured. Check your .env.local file.",
    "auth/operation-not-allowed": "This sign-in method is not enabled in Firebase Console.",
  };

  return messages[code] || error?.message || "Something went wrong. Please try again.";
};
