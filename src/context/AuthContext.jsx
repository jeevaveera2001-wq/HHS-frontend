import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  logoutUser,
} from "../services/authService";

export const AuthContext =
  createContext(null);

/* =====================================
   Normalize user role
===================================== */

const normalizeRole = (
  role
) => {
  if (
    typeof role !==
      "string" ||
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
   Normalize user object
===================================== */

const normalizeUser = (
  userData
) => {
  if (
    !userData ||
    typeof userData !==
      "object"
  ) {
    return null;
  }

  return {
    ...userData,

    role:
      normalizeRole(
        userData.role
      ),
  };
};

/* =====================================
   Safe JSON parser
===================================== */

const parseStoredUser = (
  value
) => {
  if (!value) {
    return null;
  }

  try {
    const parsedUser =
      JSON.parse(value);

    return normalizeUser(
      parsedUser
    );
  } catch (error) {
    console.error(
      "Unable to parse stored user:",
      error
    );

    return null;
  }
};

/* =====================================
   Clear authentication storage
===================================== */

const clearAuthenticationStorage =
  () => {
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
  };

/* =====================================
   Get currently stored token
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
   Read initial authentication
===================================== */

const getInitialAuth = () => {
  const localToken =
    localStorage.getItem(
      "token"
    );

  const localUser =
    parseStoredUser(
      localStorage.getItem(
        "user"
      )
    );

  if (
    localToken &&
    localUser
  ) {
    return {
      token: localToken,

      user: localUser,

      rememberMe: true,
    };
  }

  const sessionToken =
    sessionStorage.getItem(
      "token"
    );

  const sessionUser =
    parseStoredUser(
      sessionStorage.getItem(
        "user"
      )
    );

  if (
    sessionToken &&
    sessionUser
  ) {
    return {
      token:
        sessionToken,

      user:
        sessionUser,

      rememberMe:
        false,
    };
  }

  if (
    localToken ||
    localUser ||
    sessionToken ||
    sessionUser
  ) {
    clearAuthenticationStorage();
  }

  return {
    token: null,
    user: null,
    rememberMe: false,
  };
};

/* =====================================
   Authentication provider
===================================== */

function AuthProvider({
  children,
}) {
  const [
    auth,
    setAuth,
  ] = useState(
    getInitialAuth
  );

  const {
    user,
    token,
    rememberMe,
  } = auth;

  /* =====================================
     Login
  ===================================== */

  const login = useCallback(
    (
      userData,
      jwtToken,
      shouldRemember = true
    ) => {
      if (
        !userData ||
        !jwtToken
      ) {
        throw new Error(
          "User data and token are required."
        );
      }

      const normalizedUser =
        normalizeUser(
          userData
        );

      clearAuthenticationStorage();

      const storage =
        shouldRemember
          ? localStorage
          : sessionStorage;

      storage.setItem(
        "token",
        jwtToken
      );

      storage.setItem(
        "user",
        JSON.stringify(
          normalizedUser
        )
      );

      setAuth({
        user:
          normalizedUser,

        token:
          jwtToken,

        rememberMe:
          Boolean(
            shouldRemember
          ),
      });
    },
    []
  );

  /* =====================================
     Replace rotated JWT token
  ===================================== */

  const updateToken =
    useCallback(
      (
        replacementToken
      ) => {
        if (
          !replacementToken ||
          typeof replacementToken !==
            "string"
        ) {
          throw new Error(
            "A valid replacement token is required."
          );
        }

        setAuth(
          (
            previousAuth
          ) => {
            if (
              !previousAuth.user ||
              !previousAuth.token
            ) {
              return previousAuth;
            }

            const storage =
              previousAuth
                .rememberMe
                ? localStorage
                : sessionStorage;

            storage.setItem(
              "token",
              replacementToken
            );

            return {
              ...previousAuth,

              token:
                replacementToken,
            };
          }
        );
      },
      []
    );

  /* =====================================
     Update stored user
  ===================================== */

  const updateUser =
    useCallback(
      (
        updatedUserData
      ) => {
        if (
          !updatedUserData ||
          typeof updatedUserData !==
            "object"
        ) {
          return;
        }

        setAuth(
          (
            previousAuth
          ) => {
            if (
              !previousAuth.user ||
              !previousAuth.token
            ) {
              return previousAuth;
            }

            const updatedUser =
              normalizeUser({
                ...previousAuth.user,

                ...updatedUserData,
              });

            const storage =
              previousAuth
                .rememberMe
                ? localStorage
                : sessionStorage;

            storage.setItem(
              "user",
              JSON.stringify(
                updatedUser
              )
            );

            return {
              ...previousAuth,

              user:
                updatedUser,
            };
          }
        );
      },
      []
    );

  /* =====================================
     Secure logout

     Local data is cleared immediately.
     The captured token is then sent to
     the backend for version rotation.
  ===================================== */

  const logout =
    useCallback(
      async () => {
        const activeToken =
          getStoredToken();

        clearAuthenticationStorage();

        setAuth({
          user: null,
          token: null,
          rememberMe: false,
        });

        if (!activeToken) {
          return {
            success: true,

            message:
              "Local logout completed.",
          };
        }

        try {
          return await logoutUser(
            activeToken
          );
        } catch (error) {
          /*
           * Local logout must never fail
           * because the backend is offline.
           */

          console.warn(
            "Backend logout could not be completed:",
            error?.message
          );

          return {
            success: true,

            message:
              "Local logout completed.",
          };
        }
      },
      []
    );

  /* =====================================
     Clear partial authentication
  ===================================== */

  useEffect(() => {
    const hasPartialAuthentication =
      (
        token &&
        !user
      ) ||
      (
        !token &&
        user
      );

    if (
      !hasPartialAuthentication
    ) {
      return;
    }

    logout();
  }, [
    token,
    user,
    logout,
  ]);

  /* =====================================
     Handle expired authentication
  ===================================== */

  useEffect(() => {
    const handleAuthenticationExpired =
      () => {
        logout();
      };

    window.addEventListener(
      "hhs:authentication-expired",
      handleAuthenticationExpired
    );

    return () => {
      window.removeEventListener(
        "hhs:authentication-expired",
        handleAuthenticationExpired
      );
    };
  }, [logout]);

  /* =====================================
     Synchronize authentication between tabs
  ===================================== */

  useEffect(() => {
    const handleStorageChange = (
      event
    ) => {
      if (
        event.key !==
          "token" &&
        event.key !==
          "user" &&
        event.key !== null
      ) {
        return;
      }

      setAuth(
        getInitialAuth()
      );
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  /* =====================================
     Context value
  ===================================== */

  const value = useMemo(
    () => ({
      user,
      token,
      rememberMe,

      isLoggedIn:
        Boolean(
          user &&
          token
        ),

      login,
      logout,
      updateUser,
      updateToken,
    }),

    [
      user,
      token,
      rememberMe,
      login,
      logout,
      updateUser,
      updateToken,
    ]
  );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;