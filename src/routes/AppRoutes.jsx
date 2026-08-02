import {
  lazy,
  Suspense,
} from "react";

import {
  Link,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

import BrandLogo from "../components/BrandLogo/BrandLogo";

/* =====================================
   Lazy-loaded layout
===================================== */

const MainLayout = lazy(() =>
  import("../layouts/MainLayout")
);

/* =====================================
   Public pages
===================================== */

const Home = lazy(() =>
  import("../pages/Home/Home")
);

const Explore = lazy(() =>
  import("../pages/Explore/Explore")
);

const PropertyDetails = lazy(() =>
  import(
    "../pages/PropertyDetails/PropertyDetails"
  )
);

const About = lazy(() =>
  import("../pages/About/About")
);

const Contact = lazy(() =>
  import("../pages/Contact/Contact")
);

const Login = lazy(() =>
  import("../pages/Login/Login")
);

const Register = lazy(() =>
  import("../pages/Register/Register")
);

const ForgotPassword = lazy(() =>
  import(
    "../pages/ForgotPassword/ForgotPassword"
  )
);

const ResetPassword = lazy(() =>
  import(
    "../pages/ResetPassword/ResetPassword"
  )
);

const VerifyEmail = lazy(() =>
  import(
    "../pages/VerifyEmail/VerifyEmail"
  )
);

/* =====================================
   Legal pages
===================================== */

const TermsAndConditions = lazy(() =>
  import(
    "../pages/TermsAndConditions/TermsAndConditions"
  )
);

const PrivacyPolicy = lazy(() =>
  import(
    "../pages/PrivacyPolicy/PrivacyPolicy"
  )
);

const CancellationRefundPolicy =
  lazy(() =>
    import(
      "../pages/CancellationRefundPolicy/CancellationRefundPolicy"
    )
  );

const ServiceDeliveryPolicy =
  lazy(() =>
    import(
      "../pages/ServiceDeliveryPolicy/ServiceDeliveryPolicy"
    )
  );

/* =====================================
   Customer pages
===================================== */

const Dashboard = lazy(() =>
  import("../pages/Dashboard/Dashboard")
);

const Profile = lazy(() =>
  import("../pages/Profile/Profile")
);

const MyBookings = lazy(() =>
  import(
    "../pages/MyBookings/MyBookings"
  )
);

const SavedProperties = lazy(() =>
  import(
    "../pages/SavedProperties/SavedProperties"
  )
);

const SupportTickets = lazy(() =>
  import(
    "../pages/SupportTickets/SupportTickets"
  )
);

const SupportTicketDetails = lazy(() =>
  import(
    "../pages/SupportTickets/SupportTicketDetails"
  )
);

/* =====================================
   Property pages
===================================== */

const AddProperty = lazy(() =>
  import(
    "../pages/AddProperty/AddProperty"
  )
);

/* =====================================
   Owner pages
===================================== */

const OwnerDashboard = lazy(() =>
  import(
    "../pages/Owner/OwnerDashboard"
  )
);

const OwnerProperties = lazy(() =>
  import(
    "../pages/Owner/OwnerProperties"
  )
);

const OwnerBookings = lazy(() =>
  import(
    "../pages/Owner/OwnerBookings"
  )
);

const OwnerPayoutSettings = lazy(() =>
  import(
    "../pages/Owner/OwnerPayoutSettings"
  )
);

/* =====================================
   Super Admin pages
===================================== */

const SuperAdminDashboard = lazy(() =>
  import(
    "../pages/SuperAdmin/SuperAdminDashboard"
  )
);

const StaffManagement = lazy(() =>
  import(
    "../pages/SuperAdmin/StaffManagement"
  )
);

const PropertyAdmin = lazy(() =>
  import(
    "../pages/SuperAdmin/PropertyAdmin"
  )
);

const UserManagement = lazy(() =>
  import(
    "../pages/SuperAdmin/UserManagement"
  )
);

const BookingManagement = lazy(() =>
  import(
    "../pages/SuperAdmin/BookingManagement"
  )
);

const FinanceDashboard = lazy(() =>
  import(
    "../pages/SuperAdmin/FinanceDashboard"
  )
);

const PayoutAccountManagement =
  lazy(() =>
    import(
      "../pages/SuperAdmin/PayoutAccountManagement"
    )
  );

/* =====================================
   Review and support management
===================================== */

const ReviewManagement = lazy(() =>
  import(
    "../pages/ReviewManagement/ReviewManagement"
  )
);

const SupportManagement = lazy(() =>
  import(
    "../pages/Support/SupportManagement"
  )
);

/* =====================================
   Route loading screen
===================================== */

function RouteLoading() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "25px",
        display: "grid",
        placeItems: "center",
        alignContent: "center",
        gap: "16px",
        color: "#102235",
        background:
          "linear-gradient(135deg, #f8fafc, #ecfeff)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          border:
            "4px solid #cffafe",
          borderTopColor:
            "#0891b2",
          borderRadius: "50%",
          animation:
            "hhs-route-spin 0.75s linear infinite",
        }}
      />

      <style>
        {`
          @keyframes hhs-route-spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>

      <p
        style={{
          margin: 0,
          color: "#64748b",
          fontSize: "13px",
          fontWeight: 700,
        }}
      >
        Loading Hogenakkal Home
        Stays...
      </p>
    </main>
  );
}

/* =====================================
   Protected route helpers
===================================== */

const createProtectedElement = (
  Component
) => {
  return (
    <ProtectedRoute>
      <Component />
    </ProtectedRoute>
  );
};

const createRoleElement = (
  Component,
  allowedRoles
) => {
  return (
    <RoleRoute
      allowedRoles={
        allowedRoles
      }
    >
      <Component />
    </RoleRoute>
  );
};

/* =====================================
   Not Found page
===================================== */

function NotFoundPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "25px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "14px",
        color: "#0f172a",
        textAlign: "center",
        background:
          "linear-gradient(135deg, #f8fafc, #cffafe)",
      }}
    >
      <BrandLogo
        to="/"
        className="not-found-logo"
      />

      <h1
        style={{
          margin: 0,
          fontSize: "72px",
          lineHeight: 1,
        }}
      >
        404
      </h1>

      <h2
        style={{
          margin: 0,
        }}
      >
        Page Not Found
      </h2>

      <p
        style={{
          maxWidth:
            "450px",
          margin: 0,
          color:
            "#64748b",
          lineHeight:
            1.7,
        }}
      >
        The page you are looking for
        does not exist, has been moved
        or you may not have permission
        to access it.
      </p>

      <Link
        to="/"
        style={{
          marginTop:
            "10px",
          padding:
            "13px 25px",
          borderRadius:
            "12px",
          color:
            "#ffffff",
          background:
            "linear-gradient(135deg, #0e7490, #06b6d4)",
          boxShadow:
            "0 10px 25px rgba(8, 145, 178, 0.25)",
          textDecoration:
            "none",
          fontWeight:
            800,
        }}
      >
        Return Home
      </Link>

      <style>
        {`
          .not-found-logo {
            width: 125px;
            display: inline-flex;
          }

          .not-found-logo img {
            width: 100%;
            height: auto;
            display: block;
            object-fit: contain;
          }
        `}
      </style>
    </main>
  );
}

/* =====================================
   Application routes
===================================== */

function AppRoutes() {
  return (
    <Suspense
      fallback={
        <RouteLoading />
      }
    >
      <Routes>
        {/* =================================
            Public website layout
        ================================= */}

        <Route
          element={
            <MainLayout />
          }
        >
          <Route
            path="/"
            element={
              <Home />
            }
          />

          <Route
            path="/explore"
            element={
              <Explore />
            }
          />

          <Route
            path="/property/:id"
            element={
              <PropertyDetails />
            }
          />

          <Route
            path="/about"
            element={
              <About />
            }
          />

          <Route
            path="/contact"
            element={
              <Contact />
            }
          />

          <Route
            path="/login"
            element={
              <Login />
            }
          />

          <Route
            path="/register"
            element={
              <Register />
            }
          />

          {/* Legal pages */}

          <Route
            path="/terms-and-conditions"
            element={
              <TermsAndConditions />
            }
          />

          <Route
            path="/privacy-policy"
            element={
              <PrivacyPolicy />
            }
          />

          <Route
            path="/cancellation-refund-policy"
            element={
              <CancellationRefundPolicy />
            }
          />

          <Route
            path="/service-delivery-policy"
            element={
              <ServiceDeliveryPolicy />
            }
          />

          {/* Legal aliases */}

          <Route
            path="/terms"
            element={
              <Navigate
                to="/terms-and-conditions"
                replace
              />
            }
          />

          <Route
            path="/privacy"
            element={
              <Navigate
                to="/privacy-policy"
                replace
              />
            }
          />

          <Route
            path="/refund-policy"
            element={
              <Navigate
                to="/cancellation-refund-policy"
                replace
              />
            }
          />

          <Route
            path="/cancellation-policy"
            element={
              <Navigate
                to="/cancellation-refund-policy"
                replace
              />
            }
          />

          <Route
            path="/shipping-policy"
            element={
              <Navigate
                to="/service-delivery-policy"
                replace
              />
            }
          />

          {/* Customer dashboard */}

          <Route
            path="/dashboard"
            element={
              createRoleElement(
                Dashboard,
                [
                  "customer",
                ]
              )
            }
          />

          {/* Profile */}

          <Route
            path="/profile"
            element={
              createProtectedElement(
                Profile
              )
            }
          />

          {/* Customer bookings */}

          <Route
            path="/bookings"
            element={
              createRoleElement(
                MyBookings,
                [
                  "customer",
                  "owner",
                ]
              )
            }
          />

          {/* Saved properties */}

          <Route
            path="/saved-properties"
            element={
              createRoleElement(
                SavedProperties,
                [
                  "customer",
                  "owner",
                ]
              )
            }
          />

          {/* Support tickets */}

          <Route
            path="/support-tickets"
            element={
              createRoleElement(
                SupportTickets,
                [
                  "customer",
                  "owner",
                ]
              )
            }
          />

          <Route
            path="/support-tickets/:ticketId"
            element={
              createRoleElement(
                SupportTicketDetails,
                [
                  "customer",
                  "owner",
                ]
              )
            }
          />

          {/* Add property */}

          <Route
            path="/add-property"
            element={
              createRoleElement(
                AddProperty,
                [
                  "owner",
                  "operations_manager",
                  "super_admin",
                ]
              )
            }
          />
        </Route>

        {/* =================================
            Account recovery routes
        ================================= */}

        <Route
          path="/forgot-password"
          element={
            <ForgotPassword />
          }
        />

        <Route
          path="/reset-password/:token"
          element={
            <ResetPassword />
          }
        />

        <Route
          path="/verify-email"
          element={
            <VerifyEmail />
          }
        />

        <Route
          path="/verify-email/:token"
          element={
            <VerifyEmail />
          }
        />

        {/* =================================
            Super Admin routes
        ================================= */}

        <Route
          path="/super-admin"
          element={
            createRoleElement(
              SuperAdminDashboard,
              [
                "super_admin",
              ]
            )
          }
        />

        <Route
          path="/super-admin/staff"
          element={
            createRoleElement(
              StaffManagement,
              [
                "super_admin",
              ]
            )
          }
        />

        <Route
          path="/super-admin/users"
          element={
            createRoleElement(
              UserManagement,
              [
                "super_admin",
                "operations_manager",
                "property_admin",
                "support",
              ]
            )
          }
        />

        <Route
          path="/super-admin/owners"
          element={
            createRoleElement(
              UserManagement,
              [
                "super_admin",
                "operations_manager",
                "property_admin",
                "support",
              ]
            )
          }
        />

        <Route
          path="/super-admin/properties"
          element={
            createRoleElement(
              PropertyAdmin,
              [
                "super_admin",
                "operations_manager",
                "property_admin",
              ]
            )
          }
        />

        <Route
          path="/super-admin/bookings"
          element={
            createRoleElement(
              BookingManagement,
              [
                "super_admin",
                "operations_manager",
                "booking_manager",
              ]
            )
          }
        />

        <Route
          path="/super-admin/reviews"
          element={
            createRoleElement(
              ReviewManagement,
              [
                "super_admin",
                "operations_manager",
              ]
            )
          }
        />

        <Route
          path="/super-admin/support"
          element={
            createRoleElement(
              SupportManagement,
              [
                "support",
                "operations_manager",
                "super_admin",
              ]
            )
          }
        />

        <Route
          path="/super-admin/finance"
          element={
            createRoleElement(
              FinanceDashboard,
              [
                "finance_manager",
                "operations_manager",
                "super_admin",
              ]
            )
          }
        />

        {/* =================================
            Staff routes
        ================================= */}

        <Route
          path="/support"
          element={
            createRoleElement(
              SupportManagement,
              [
                "support",
                "property_admin",
                "booking_manager",
                "finance_manager",
                "operations_manager",
                "super_admin",
              ]
            )
          }
        />

        <Route
          path="/manager"
          element={
            createRoleElement(
              Dashboard,
              [
                "operations_manager",
              ]
            )
          }
        />

        <Route
          path="/property-admin"
          element={
            createRoleElement(
              PropertyAdmin,
              [
                "super_admin",
                "operations_manager",
                "property_admin",
              ]
            )
          }
        />

        <Route
          path="/booking-admin"
          element={
            createRoleElement(
              BookingManagement,
              [
                "booking_manager",
              ]
            )
          }
        />

        {/* =================================
            Finance routes
        ================================= */}

        <Route
          path="/finance"
          element={
            createRoleElement(
              FinanceDashboard,
              [
                "finance_manager",
                "booking_manager",
                "operations_manager",
                "super_admin",
              ]
            )
          }
        />

        <Route
          path="/finance/payout-accounts"
          element={
            createRoleElement(
              PayoutAccountManagement,
              [
                "finance_manager",
                "super_admin",
              ]
            )
          }
        />

        {/* =================================
            Owner routes
        ================================= */}

        <Route
          path="/owner"
          element={
            createRoleElement(
              OwnerDashboard,
              [
                "owner",
              ]
            )
          }
        />

        <Route
          path="/owner/properties"
          element={
            createRoleElement(
              OwnerProperties,
              [
                "owner",
              ]
            )
          }
        />

        <Route
          path="/owner/bookings"
          element={
            createRoleElement(
              OwnerBookings,
              [
                "owner",
              ]
            )
          }
        />

        <Route
          path="/owner/reviews"
          element={
            createRoleElement(
              ReviewManagement,
              [
                "owner",
              ]
            )
          }
        />

        <Route
          path="/owner/payout-settings"
          element={
            createRoleElement(
              OwnerPayoutSettings,
              [
                "owner",
              ]
            )
          }
        />

        {/* =================================
            404
        ================================= */}

        <Route
          path="*"
          element={
            <NotFoundPage />
          }
        />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;