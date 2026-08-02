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
  createStaffMember,
  getStaffMembers,
  toggleStaffStatus,
} from "../../services/staffService";

import "./StaffManagement.css";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  role: "support",
};

const roleLabels = {
  super_admin: "Super Admin",
  operations_manager: "Operations Manager",
  property_admin: "Property Admin",
  booking_manager: "Booking Manager",
  finance_manager: "Finance Manager",
  support: "Customer Support",
};

function StaffManagement() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [staffMembers, setStaffMembers] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  const [statusUpdating, setStatusUpdating] =
    useState(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [totalStaff, setTotalStaff] =
    useState(0);

  const [formData, setFormData] =
    useState(initialForm);

  const handleUnauthorized = useCallback(() => {
    logout();

    toast.error(
      "Your session has expired. Please log in again."
    );

    navigate("/login", {
      replace: true,
    });
  }, [logout, navigate]);

  const loadStaff = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getStaffMembers({
        search,
        role: roleFilter,
        status: statusFilter,
        page: currentPage,
        limit: 10,
      });

      setStaffMembers(
        data.staffMembers || []
      );

      setTotalStaff(data.totalStaff || 0);
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
    currentPage,
    handleUnauthorized,
  ]);

  useEffect(() => {
    const delay = setTimeout(() => {
      loadStaff();
    }, 350);

    return () => clearTimeout(delay);
  }, [loadStaff]);

  const handleFilterChange = (
    setter,
    value
  ) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleFormChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const closeForm = () => {
    setShowForm(false);
    setFormData(initialForm);
  };

  const handleCreateStaff = async (
    event
  ) => {
    event.preventDefault();

    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.password
    ) {
      toast.error(
        "Complete all staff details."
      );

      return;
    }

    if (formData.password.length < 10) {
      toast.error(
        "Password must contain at least 10 characters."
      );

      return;
    }

    try {
      setSubmitting(true);

      const data =
        await createStaffMember({
          fullName:
            formData.fullName.trim(),

          email:
            formData.email
              .trim()
              .toLowerCase(),

          phone:
            formData.phone.trim(),

          password: formData.password,
          role: formData.role,
          customPermissions: [],
        });

      toast.success(data.message);

      closeForm();
      setCurrentPage(1);
      await loadStaff();
    } catch (error) {
      if (error.status === 401) {
        handleUnauthorized();
        return;
      }

      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusToggle = async (
    staffMember
  ) => {
    const action = staffMember.isActive
      ? "deactivate"
      : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${staffMember.fullName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setStatusUpdating(staffMember._id);

      const data =
        await toggleStaffStatus(
          staffMember._id
        );

      toast.success(data.message);

      setStaffMembers((previous) =>
        previous.map((member) =>
          member._id === staffMember._id
            ? data.staffMember
            : member
        )
      );
    } catch (error) {
      if (error.status === 401) {
        handleUnauthorized();
        return;
      }

      toast.error(error.message);
    } finally {
      setStatusUpdating(null);
    }
  };

  const getInitial = (name) => {
    return name?.charAt(0).toUpperCase() || "S";
  };

  return (
    <main className="staff-management-page">
      <header className="staff-page-header">
        <div>
          <Link
            className="staff-back-link"
            to="/super-admin"
          >
            ← Super Admin Dashboard
          </Link>

          <span>VeeraWebTech Staff Control</span>

          <h1>Staff Management</h1>

          <p>
            Create staff accounts, assign roles and
            control platform access.
          </p>
        </div>

        <button
          type="button"
          className="create-staff-button"
          onClick={() => setShowForm(true)}
        >
          + Create staff account
        </button>
      </header>

      <section className="staff-summary-grid">
        <article>
          <span>Total staff</span>
          <strong>{totalStaff}</strong>
        </article>

        <article>
          <span>Active on this page</span>
          <strong>
            {
              staffMembers.filter(
                (member) => member.isActive
              ).length
            }
          </strong>
        </article>

        <article>
          <span>Inactive on this page</span>
          <strong>
            {
              staffMembers.filter(
                (member) => !member.isActive
              ).length
            }
          </strong>
        </article>
      </section>

      <section className="staff-list-panel">
        <div className="staff-filter-bar">
          <div className="staff-search-field">
            <label htmlFor="staff-search">
              Search staff
            </label>

            <input
              id="staff-search"
              type="search"
              value={search}
              onChange={(event) =>
                handleFilterChange(
                  setSearch,
                  event.target.value
                )
              }
              placeholder="Name, email or phone"
            />
          </div>

          <div>
            <label htmlFor="staff-role">
              Role
            </label>

            <select
              id="staff-role"
              value={roleFilter}
              onChange={(event) =>
                handleFilterChange(
                  setRoleFilter,
                  event.target.value
                )
              }
            >
              <option value="">All roles</option>
              <option value="super_admin">
                Super Admin
              </option>
              <option value="operations_manager">
                Operations Manager
              </option>
              <option value="property_admin">
                Property Admin
              </option>
              <option value="booking_manager">
                Booking Manager
              </option>
              <option value="finance_manager">
                Finance Manager
              </option>
              <option value="support">
                Customer Support
              </option>
            </select>
          </div>

          <div>
            <label htmlFor="staff-status">
              Status
            </label>

            <select
              id="staff-status"
              value={statusFilter}
              onChange={(event) =>
                handleFilterChange(
                  setStatusFilter,
                  event.target.value
                )
              }
            >
              <option value="">All statuses</option>
              <option value="active">
                Active
              </option>
              <option value="inactive">
                Inactive
              </option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="staff-loading">
            <div />
            <p>Loading staff accounts...</p>
          </div>
        ) : staffMembers.length === 0 ? (
          <div className="staff-empty">
            <span>🧑‍💼</span>
            <h2>No staff members found</h2>
            <p>
              Create a staff account or change your
              filters.
            </p>
          </div>
        ) : (
          <div className="staff-table-wrapper">
            <table className="staff-table">
              <thead>
                <tr>
                  <th>Staff member</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {staffMembers.map(
                  (staffMember) => (
                    <tr key={staffMember._id}>
                      <td>
                        <div className="staff-identity">
                          <div className="staff-avatar">
                            {getInitial(
                              staffMember.fullName
                            )}
                          </div>

                          <div>
                            <strong>
                              {staffMember.fullName}
                            </strong>

                            <span>
                              {staffMember.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="staff-role-badge">
                          {roleLabels[
                            staffMember.role
                          ] || staffMember.role}
                        </span>
                      </td>

                      <td>{staffMember.phone}</td>

                      <td>
                        <span
                          className={
                            staffMember.isActive
                              ? "staff-status active"
                              : "staff-status inactive"
                          }
                        >
                          {staffMember.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td>
                        {new Date(
                          staffMember.createdAt
                        ).toLocaleDateString(
                          "en-IN"
                        )}
                      </td>

                      <td>
                        {staffMember.role ===
                        "super_admin" ? (
                          <span className="protected-account">
                            Protected
                          </span>
                        ) : (
                          <button
                            type="button"
                            className={
                              staffMember.isActive
                                ? "staff-status-button deactivate"
                                : "staff-status-button activate"
                            }
                            disabled={
                              statusUpdating ===
                              staffMember._id
                            }
                            onClick={() =>
                              handleStatusToggle(
                                staffMember
                              )
                            }
                          >
                            {statusUpdating ===
                            staffMember._id
                              ? "Updating..."
                              : staffMember.isActive
                                ? "Deactivate"
                                : "Activate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="staff-pagination">
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

      {showForm && (
        <div
          className="staff-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeForm();
            }
          }}
        >
          <form
            className="staff-modal"
            onSubmit={handleCreateStaff}
          >
            <div className="staff-modal-header">
              <div>
                <span>New VeeraWebTech Staff</span>
                <h2>Create staff account</h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <div className="staff-form-grid">
              <div className="staff-form-field full">
                <label htmlFor="staff-name">
                  Full name
                </label>

                <input
                  id="staff-name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleFormChange}
                  placeholder="Enter staff member name"
                  required
                />
              </div>

              <div className="staff-form-field">
                <label htmlFor="staff-email">
                  Email address
                </label>

                <input
                  id="staff-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="staff@veerawebtech.com"
                  required
                />
              </div>

              <div className="staff-form-field">
                <label htmlFor="staff-phone">
                  Phone number
                </label>

                <input
                  id="staff-phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleFormChange}
                  placeholder="10-digit phone number"
                  required
                />
              </div>

              <div className="staff-form-field">
                <label htmlFor="staff-role-input">
                  Staff role
                </label>

                <select
                  id="staff-role-input"
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                >
                  <option value="support">
                    Customer Support
                  </option>

                  <option value="property_admin">
                    Property Admin
                  </option>

                  <option value="booking_manager">
                    Booking Manager
                  </option>

                  <option value="finance_manager">
                    Finance Manager
                  </option>

                  <option value="operations_manager">
                    Operations Manager
                  </option>
                </select>
              </div>

              <div className="staff-form-field">
                <label htmlFor="staff-password">
                  Temporary password
                </label>

                <input
                  id="staff-password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  placeholder="Minimum 10 characters"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <div className="staff-modal-actions">
              <button
                type="button"
                className="staff-cancel-button"
                onClick={closeForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="staff-save-button"
                disabled={submitting}
              >
                {submitting
                  ? "Creating account..."
                  : "Create staff account"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

export default StaffManagement;