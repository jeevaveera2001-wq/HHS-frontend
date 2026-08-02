import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import useAuth from "../../hooks/useAuth";

import BrandLogo from "../BrandLogo/BrandLogo";

import "./Navbar.css";

const dashboardRoutes = {
  super_admin: "/super-admin",
  operations_manager: "/manager",
  property_admin: "/property-admin",
  booking_manager: "/booking-admin",
  finance_manager: "/finance",
  support: "/support",
  owner: "/owner",
  customer: "/dashboard",
};

function Navbar() {
  const navigate = useNavigate();

  const location = useLocation();

  const profileMenuRef =
    useRef(null);

  const {
    user,
    logout,
  } = useAuth();

  const [
    open,
    setOpen,
  ] = useState(false);

  const displayName =
    user?.fullName ||
    user?.displayName ||
    user?.email ||
    "My Account";

  const dashboardPath =
    dashboardRoutes[user?.role] ||
    "/dashboard";

  const canUseCustomerPages = [
    "customer",
    "owner",
  ].includes(user?.role);

  const isOwner =
    user?.role === "owner";

  const closeMenu = () => {
    setOpen(false);
  };

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (
      event
    ) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(
          event.target
        )
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (
      event
    ) => {
      if (
        event.key === "Escape"
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  const handleLogout = () => {
    closeMenu();

    logout();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <nav className="navbar">
      <BrandLogo
        to="/"
        variant="navbar"
        onClick={closeMenu}
      />

      <div className="nav-links">
        <Link to="/">
          Home
        </Link>

        <Link to="/explore">
          Explore
        </Link>

        <Link to="/about">
          About
        </Link>

        <Link to="/contact">
          Contact
        </Link>
      </div>

      <div className="nav-actions">
        {user ? (
          <div
            className="profile-menu"
            ref={profileMenuRef}
          >
            <button
              className="profile-btn"
              type="button"
              aria-haspopup="menu"
              aria-expanded={open}
              aria-label="Open account menu"
              onClick={() => {
                setOpen(
                  (previous) =>
                    !previous
                );
              }}
            >
              {displayName}
            </button>

            {open && (
              <div
                className="dropdown"
                role="menu"
              >
                <Link
                  to={dashboardPath}
                  role="menuitem"
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>

                <Link
                  to="/profile"
                  role="menuitem"
                  onClick={closeMenu}
                >
                  Profile
                </Link>

                {canUseCustomerPages && (
                  <Link
                    to="/bookings"
                    role="menuitem"
                    onClick={closeMenu}
                  >
                    My Bookings
                  </Link>
                )}

                {canUseCustomerPages && (
                  <Link
                    to="/saved-properties"
                    role="menuitem"
                    onClick={closeMenu}
                  >
                    Saved Properties
                  </Link>
                )}

                {canUseCustomerPages && (
                  <Link
                    to="/support-tickets"
                    role="menuitem"
                    onClick={closeMenu}
                  >
                    Support Tickets
                  </Link>
                )}

                {isOwner && (
                  <Link
                    to="/owner/properties"
                    role="menuitem"
                    onClick={closeMenu}
                  >
                    My Properties
                  </Link>
                )}

                {isOwner && (
                  <Link
                    to="/owner/bookings"
                    role="menuitem"
                    onClick={closeMenu}
                  >
                    Property Bookings
                  </Link>
                )}

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link
              className="login-btn"
              to="/login"
            >
              Login
            </Link>

            <Link
              className="register-btn"
              to="/register"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;