import {
  Navigate,
  useLocation,
} from "react-router-dom";

import useAuth from "../hooks/useAuth";

import getDashboardPath, {
  normalizeRole,
} from "../utils/getDashboardPath";

/* =====================================
   Read stored token
===================================== */

const getStoredToken = () => {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    ""
  );
};

/* =====================================
   Safely read stored user
===================================== */

const getStoredUser = () => {
  const storedValue =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user");

  if (!storedValue) {
    return null;
  }

  try {
    const parsedUser =
      JSON.parse(storedValue);

    if (
      !parsedUser ||
      typeof parsedUser !== "object"
    ) {
      return null;
    }

    return {
      ...parsedUser,
      role: normalizeRole(
        parsedUser.role
      ),
    };
  } catch (error) {
    console.error(
      "Unable to read stored user:",
      error
    );

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    return null;
  }
};

/* =====================================
   Loading screen
===================================== */

function AuthenticationLoading() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background:
          "linear-gradient(135deg, #f8fafc, #ecfeff)",
      }}
    >
      <section
        style={{
          display: "grid",
          justifyItems: "center",
          gap: "14px",
          color: "#0f172a",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            border:
              "4px solid #cffafe",
            borderTopColor: "#0891b2",
            borderRadius: "50%",
            animation:
              "role-route-spin 0.75s linear infinite",
          }}
        />

        <style>
          {`
            @keyframes role-route-spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>

        <p
          style={{
            margin: 0,
            color: "#475569",
            fontSize: "14px",
            fontWeight: 700,
          }}
        >
          Checking your account...
        </p>
      </section>
    </main>
  );
}

/* =====================================
   Role-protected route
===================================== */

function RoleRoute({
  children,
  allowedRoles = [],
}) {
  const location = useLocation();
  const authContext = useAuth();

  const authLoading =
    authContext?.authLoading === true;

  /*
   * Never redirect while AuthContext is
   * still restoring authentication.
   */
  if (authLoading) {
    return <AuthenticationLoading />;
  }

  const contextToken =
    authContext?.token || "";

  const contextUser =
    authContext?.user || null;

  /*
   * Storage fallback supports page refresh
   * and direct protected-route navigation.
   */
  const token =
    contextToken ||
    getStoredToken();

  const user =
    contextUser ||
    getStoredUser();

  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname +
            location.search,
        }}
      />
    );
  }

  const normalizedRole =
    normalizeRole(user.role);

  const normalizedAllowedRoles =
    allowedRoles
      .map((role) =>
        normalizeRole(role)
      )
      .filter(Boolean);

  if (
    normalizedAllowedRoles.length > 0 &&
    !normalizedAllowedRoles.includes(
      normalizedRole
    )
  ) {
    const destination =
      getDashboardPath(
        normalizedRole
      );

    return (
      <Navigate
        to={destination}
        replace
      />
    );
  }

  return children;
}

export default RoleRoute;