/* =====================================
   Role dashboard routes
===================================== */

const dashboardPaths = {
  super_admin:
    "/super-admin",

  operations_manager:
    "/manager",

  property_admin:
    "/property-admin",

  booking_manager:
    "/booking-admin",

  finance_manager:
    "/finance",

  support:
    "/support",

  owner:
    "/owner",

  /*
   * Customers go to the homepage
   * after successful login.
   */

  customer:
    "/",
};

/* =====================================
   Normalize user role
===================================== */

const normalizeRole = (
  role
) => {
  if (
    typeof role !== "string" ||
    !role.trim()
  ) {
    return "customer";
  }

  return role
    .trim()
    .toLowerCase()
    .replaceAll(
      " ",
      "_"
    )
    .replaceAll(
      "-",
      "_"
    );
};

/* =====================================
   Get destination by role
===================================== */

const getDashboardPath = (
  role
) => {
  const normalizedRole =
    normalizeRole(role);

  return (
    dashboardPaths[
      normalizedRole
    ] || "/"
  );
};

/* =====================================
   Check supported role
===================================== */

const hasDashboardPath = (
  role
) => {
  const normalizedRole =
    normalizeRole(role);

  return Object.prototype.hasOwnProperty.call(
    dashboardPaths,
    normalizedRole
  );
};

export {
  dashboardPaths,
  normalizeRole,
  hasDashboardPath,
};

export default getDashboardPath;