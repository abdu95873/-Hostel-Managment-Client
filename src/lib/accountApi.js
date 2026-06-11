const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const parseJson = async (res) => {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    if (text.trimStart().startsWith("<!DOCTYPE") || text.trimStart().startsWith("<html")) {
      throw new Error(
        `API server returned HTML instead of JSON. Is the backend running at ${baseURL}? Restart it with: npm run dev`
      );
    }
    throw new Error(text || "Invalid response from server");
  }
};

export const fetchAccountByEmail = async (email) => {
  if (!email) return null;
  const res = await fetch(`${baseURL}/accounts/email/${encodeURIComponent(email.toLowerCase())}`);
  if (!res.ok) return null;
  return parseJson(res);
};

export const createAccount = async (payload) => {
  const res = await fetch(`${baseURL}/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || "Failed to create account");
  return data;
};

export const hasAdminAccount = async () => {
  const res = await fetch(`${baseURL}/accounts/has-admin`);
  if (!res.ok) return true;
  const data = await parseJson(res);
  return data.hasAdmin;
};

export const fetchStaffAccounts = async (adminEmail) => {
  const res = await fetch(
    `${baseURL}/accounts/staff?admin_email=${encodeURIComponent(adminEmail)}`
  );
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || "Failed to load staff");
  return data;
};

export const createStaffAccount = async (payload) => {
  const res = await fetch(`${baseURL}/accounts/staff`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || "Failed to create staff account");
  return data;
};

export const linkGoogleAccount = async ({ email, name, firebase_uid }) => {
  const res = await fetch(`${baseURL}/accounts/link-google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name, firebase_uid }),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || "Failed to link Google account");
  return data;
};
