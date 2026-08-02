import {
  Navigate,
  useLocation,
} from "react-router-dom";

import useAuth from "../hooks/useAuth";

import getDashboardPath, {
  normalizeRole,
} from "../utils/getDashboardPath";

/* =====================================
   Safely read stored user
===================================== */

const getStoredUser = () => {
  const storedValue =
    localStorage.getItem(
      "user"
    ) ||
    sessionStorage.getItem(
      "user"
    );

  if (!storedValue) {
    return null;
  }

  try {
    const parsedUser =
      JSON.parse(
        storedValue
      );

    if (
      !parsedUser ||
      typeof parsedUser !==
        "object"
    ) {
      return null;
    }

    return {
      ...parsedUser,

      role:
        normalizeRole(
          parsedUser.role
        ),
    };
  } catch (error) {
    console.error(
      "Unable to read stored user:",
      error
    );

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    sessionStorage.removeItem(
      "token"
    );

    sessionStorage.removeItem(
      "user"
    );

    return null;
  }
};

/* =====================================
   Read stored token
===================================== */

const getStoredToken = () => {
  return (
    localStorage.getItem(
      "token"
    ) ||
    sessionStorage.getItem(
      "token"
    )
  );
};

/* =====================================
   Role-protected route
===================================== */

function RoleRoute({
  children,
  allowedRoles = [],
}) {
  const location =
    useLocation();

  const authContext =
    useAuth();

  const contextUser =
    authContext?.user ||
    null;

  const contextToken =
    authContext?.token ||
    null;

  const authLoading =
    authContext?.authLoading ===
    true;

  /*
   * AuthContext state updates asynchronously.
   * Login writes authentication to storage
   * synchronously, so storage is used as a
   * temporary fallback during navigation.
   */

  const token =
    contextToken ||
    getStoredToken();

  const user =
    contextUser ||
    getStoredUser();

  if (
    authLoading &&
    !token
  ) {
    return (
      <main className="route-loading">
        Loading...
      </main>
    );
  }

  if (
    !token ||
    !user
  ) {
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
    normalizeRole(
      user.role
    );

  const normalizedAllowedRoles =
    allowedRoles.map(
      (role) => {
        return normalizeRole(
          role
        );
      }
    );

  if (
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