import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { toast } from "react-toastify";

import useAuth from "../../hooks/useAuth";

import {
  getUsers,
  toggleUserStatus,
  toggleUserVerification,
  updateUserRole,
} from "../../services/userManagementService";

import "./UserManagement.css";

const initialSummary = {
  customers: 0,
  owners: 0,
  active: 0,
  verified: 0,
};

function UserManagement() {
  const navigate = useNavigate();

  const {
    user: loggedInUser,
    logout,
  } = useAuth();

  const [users, setUsers] = useState([]);
  const [summary, setSummary] =
    useState(initialSummary);

  const [loading, setLoading] =
    useState(true);

  const [actionId, setActionId] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [verifiedFilter, setVerifiedFilter] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [totalUsers, setTotalUsers] =
    useState(0);

  const canChangeRole =
    loggedInUser?.role === "super_admin";

  const canVerify = [
    "property_admin",
    "operations_manager",
    "super_admin",
  ].includes(loggedInUser?.role);

  const canSuspend = [
    "operations_manager",
    "super_admin",
  ].includes(loggedInUser?.role);

  const handleUnauthorized = useCallback(() => {
    logout();

    toast.error(
      "Your session has expired. Please log in again."
    );

    navigate("/login", {
      replace: true,
    });
  }, [logout, navigate]);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getUsers({
        search,
        role: roleFilter,
        status: statusFilter,
        verified: verifiedFilter,
        page: currentPage,
        limit: 12,
      });

      setUsers(data.users || []);
      setSummary(
        data.summary || initialSummary
      );

      setTotalUsers(data.totalUsers || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      if (error.status === 401) {
        handleUnauthorized();
        return;
      }

      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [
    search,
    roleFilter,
    statusFilter,
    verifiedFilter,
    currentPage,
    handleUnauthorized,
  ]);

  useEffect(() => {
    const delay = setTimeout(() => {
      loadUsers();
    }, 350);

    return () => clearTimeout(delay);
  }, [loadUsers]);

  const changeFilter = (
    setter,
    value
  ) => {
    setter(value);
    setCurrentPage(1);
  };

  const updateLocalUser = (
    updatedUser
  ) => {
    setUsers((previous) =>
      previous.map((user) =>
        user._id === updatedUser._id
          ? updatedUser
          : user
      )
    );
  };

  const handleRoleChange = async (
    selectedUser
  ) => {
    const nextRole =
      selectedUser.role === "customer"
        ? "owner"
        : "customer";

    const confirmed = window.confirm(
      `Change ${selectedUser.fullName} from ${selectedUser.role} to ${nextRole}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(selectedUser._id);

      const data = await updateUserRole(
        selectedUser._id,
        nextRole
      );

      updateLocalUser(data.user);
      toast.success(data.message);
      await loadUsers();
    } catch (error) {
      if (error.status === 401) {
        handleUnauthorized();
        return;
      }

      toast.error(error.message);
    } finally {
      setActionId(null);
    }
  };

  const handleVerification = async (
    selectedUser
  ) => {
    const action = selectedUser.isVerified
      ? "remove verification from"
      : "verify";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${selectedUser.fullName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(selectedUser._id);

      const data =
        await toggleUserVerification(
          selectedUser._id
        );

      updateLocalUser(data.user);
      toast.success(data.message);
      await loadUsers();
    } catch (error) {
      if (error.status === 401) {
        handleUnauthorized();
        return;
      }

      toast.error(error.message);
    } finally {
      setActionId(null);
    }
  };

  const handleStatus = async (
    selectedUser
  ) => {
    const action = selectedUser.isActive
      ? "suspend"
      : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${selectedUser.fullName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(selectedUser._id);

      const data =
        await toggleUserStatus(
          selectedUser._id
        );

      updateLocalUser(data.user);
      toast.success(data.message);
      await loadUsers();
    } catch (error) {
      if (error.status === 401) {
        handleUnauthorized();
        return;
      }

      toast.error(error.message);
    } finally {
      setActionId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "Never";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <main className="user-management-page">
      <header className="user-management-header">
        <div>
          <Link
            className="user-management-back"
            to="/super-admin"
          >
            ← Super Admin Dashboard
          </Link>

          <span>
            HHS Account Administration
          </span>

          <h1>Users and Owners</h1>

          <p>
            Search, verify and manage customer and
            property-owner accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={loadUsers}
          disabled={loading}
        >
          {loading
            ? "Refreshing..."
            : "Refresh users"}
        </button>
      </header>

      <section className="user-summary-grid">
        <article>
          <span>Total results</span>
          <strong>{totalUsers}</strong>
        </article>

        <article>
          <span>Customers</span>
          <strong>
            {summary.customers}
          </strong>
        </article>

        <article>
          <span>Property owners</span>
          <strong>{summary.owners}</strong>
        </article>

        <article>
          <span>Active accounts</span>
          <strong>{summary.active}</strong>
        </article>

        <article>
          <span>Verified accounts</span>
          <strong>{summary.verified}</strong>
        </article>
      </section>

      <section className="user-management-panel">
        <div className="user-filter-bar">
          <div className="user-search-field">
            <label htmlFor="user-search">
              Search
            </label>

            <input
              id="user-search"
              type="search"
              value={search}
              onChange={(event) =>
                changeFilter(
                  setSearch,
                  event.target.value
                )
              }
              placeholder="Name, email or phone"
            />
          </div>

          <div>
            <label htmlFor="user-role-filter">
              Role
            </label>

            <select
              id="user-role-filter"
              value={roleFilter}
              onChange={(event) =>
                changeFilter(
                  setRoleFilter,
                  event.target.value
                )
              }
            >
              <option value="">
                Customers and owners
              </option>

              <option value="customer">
                Customers
              </option>

              <option value="owner">
                Property owners
              </option>
            </select>
          </div>

          <div>
            <label htmlFor="user-status-filter">
              Status
            </label>

            <select
              id="user-status-filter"
              value={statusFilter}
              onChange={(event) =>
                changeFilter(
                  setStatusFilter,
                  event.target.value
                )
              }
            >
              <option value="">
                All statuses
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Suspended
              </option>
            </select>
          </div>

          <div>
            <label htmlFor="user-verified-filter">
              Verification
            </label>

            <select
              id="user-verified-filter"
              value={verifiedFilter}
              onChange={(event) =>
                changeFilter(
                  setVerifiedFilter,
                  event.target.value
                )
              }
            >
              <option value="">
                All accounts
              </option>

              <option value="true">
                Verified
              </option>

              <option value="false">
                Not verified
              </option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="users-loading">
            <div />
            <p>Loading user accounts...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="users-empty">
            <span>👥</span>
            <h2>No users found</h2>
            <p>
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Verification</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Last login</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((selectedUser) => {
                  const updating =
                    actionId ===
                    selectedUser._id;

                  return (
                    <tr key={selectedUser._id}>
                      <td>
                        <div className="managed-user">
                          <div className="managed-user-avatar">
                            {selectedUser.fullName
                              ?.charAt(0)
                              .toUpperCase() ||
                              "U"}
                          </div>

                          <div>
                            <strong>
                              {
                                selectedUser.fullName
                              }
                            </strong>

                            <span>
                              {selectedUser.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`managed-role ${selectedUser.role}`}
                        >
                          {selectedUser.role ===
                          "owner"
                            ? "Property Owner"
                            : "Customer"}
                        </span>
                      </td>

                      <td>
                        {selectedUser.phone}
                      </td>

                      <td>
                        <span
                          className={
                            selectedUser.isVerified
                              ? "managed-verification verified"
                              : "managed-verification unverified"
                          }
                        >
                          {selectedUser.isVerified
                            ? "Verified"
                            : "Not verified"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            selectedUser.isActive
                              ? "managed-status active"
                              : "managed-status suspended"
                          }
                        >
                          {selectedUser.isActive
                            ? "Active"
                            : "Suspended"}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          selectedUser.createdAt
                        )}
                      </td>

                      <td>
                        {formatDate(
                          selectedUser.lastLogin
                        )}
                      </td>

                      <td>
                        <div className="managed-user-actions">
                          {canChangeRole && (
                            <button
                              type="button"
                              className="role-action"
                              disabled={updating}
                              onClick={() =>
                                handleRoleChange(
                                  selectedUser
                                )
                              }
                            >
                              {selectedUser.role ===
                              "customer"
                                ? "Make owner"
                                : "Make customer"}
                            </button>
                          )}

                          {canVerify && (
                            <button
                              type="button"
                              className="verify-action"
                              disabled={updating}
                              onClick={() =>
                                handleVerification(
                                  selectedUser
                                )
                              }
                            >
                              {selectedUser.isVerified
                                ? "Unverify"
                                : "Verify"}
                            </button>
                          )}

                          {canSuspend && (
                            <button
                              type="button"
                              className={
                                selectedUser.isActive
                                  ? "suspend-action"
                                  : "activate-action"
                              }
                              disabled={updating}
                              onClick={() =>
                                handleStatus(
                                  selectedUser
                                )
                              }
                            >
                              {updating
                                ? "Updating..."
                                : selectedUser.isActive
                                  ? "Suspend"
                                  : "Activate"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="users-pagination">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage(
                  (page) => page - 1
                )
              }
            >
              Previous
            </button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={
                currentPage === totalPages
              }
              onClick={() =>
                setCurrentPage(
                  (page) => page + 1
                )
              }
            >
              Next
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default UserManagement;