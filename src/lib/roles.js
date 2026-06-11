export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  STUDENT: "student",
};

export const ROLE_LABELS = {
  admin: "Admin",
  manager: "Manager",
  student: "Student",
};

export const getHomePath = (role) => {
  if (role === ROLES.STUDENT) return "/student";
  if (role === ROLES.ADMIN || role === ROLES.MANAGER) return "/dashboard";
  return "/login";
};

export const canAccessDashboard = (role) =>
  role === ROLES.ADMIN || role === ROLES.MANAGER;

export const isAdmin = (role) => role === ROLES.ADMIN;
