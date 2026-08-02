import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  toast,
} from "react-toastify";

import useAuth from "../../hooks/useAuth";

import {
  changePassword,
  getAuthErrorMessage,
  updateProfile,
} from "../../services/authService";

import "./Profile.css";

function Profile() {
  const navigate =
    useNavigate();

  const {
    user,
    updateUser,
    updateToken,
    logout,
  } = useAuth();

  const [
    profileForm,
    setProfileForm,
  ] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const [
    passwordForm,
    setPasswordForm,
  ] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [
    profileLoading,
    setProfileLoading,
  ] = useState(false);

  const [
    passwordLoading,
    setPasswordLoading,
  ] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setProfileForm({
      fullName:
        user.fullName ||
        "",

      email:
        user.email ||
        "",

      phone:
        user.phone ||
        "",
    });
  }, [user]);

  const handleUnauthorized =
    () => {
      logout();

      toast.error(
        "Your session has expired. Please log in again."
      );

      navigate(
        "/login",
        {
          replace: true,
        }
      );
    };

  const handleProfileChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setProfileForm(
      (previous) => ({
        ...previous,

        [name]:
          value,
      })
    );
  };

  const handlePasswordChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setPasswordForm(
      (previous) => ({
        ...previous,

        [name]:
          value,
      })
    );
  };

  const handleProfileSubmit =
    async (
      event
    ) => {
      event.preventDefault();

      const fullName =
        profileForm.fullName
          .trim()
          .replace(
            /\s+/g,
            " "
          );

      const phone =
        profileForm.phone
          .trim()
          .replace(
            /[\s()-]/g,
            ""
          );

      if (
        !fullName ||
        !phone
      ) {
        toast.error(
          "Full name and phone number are required."
        );

        return;
      }

      try {
        setProfileLoading(
          true
        );

        const data =
          await updateProfile({
            fullName,
            phone,
          });

        updateUser(
          data.user
        );

        toast.success(
          data.message ||
            "Profile updated successfully."
        );
      } catch (error) {
        const status =
          error.response
            ?.status ||
          error.status;

        if (
          status === 401
        ) {
          handleUnauthorized();

          return;
        }

        toast.error(
          getAuthErrorMessage(
            error
          )
        );
      } finally {
        setProfileLoading(
          false
        );
      }
    };

  const handlePasswordSubmit =
    async (
      event
    ) => {
      event.preventDefault();

      const {
        currentPassword,
        newPassword,
        confirmPassword,
      } = passwordForm;

      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {
        toast.error(
          "Complete all password fields."
        );

        return;
      }

      if (
        newPassword.length <
          8 ||
        newPassword.length >
          128
      ) {
        toast.error(
          "New password must contain between 8 and 128 characters."
        );

        return;
      }

      if (
        !/[A-Za-z]/.test(
          newPassword
        )
      ) {
        toast.error(
          "New password must contain at least one letter."
        );

        return;
      }

      if (
        !/[0-9]/.test(
          newPassword
        )
      ) {
        toast.error(
          "New password must contain at least one number."
        );

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        toast.error(
          "New passwords do not match."
        );

        return;
      }

      try {
        setPasswordLoading(
          true
        );

        const data =
          await changePassword({
            currentPassword,
            newPassword,
            confirmPassword,
          });

        if (!data?.token) {
          logout();

          toast.info(
            "Password changed. Please log in again."
          );

          navigate(
            "/login",
            {
              replace: true,
            }
          );

          return;
        }

        updateToken(
          data.token
        );

        if (data.user) {
          updateUser(
            data.user
          );
        }

        setPasswordForm({
          currentPassword:
            "",

          newPassword:
            "",

          confirmPassword:
            "",
        });

        toast.success(
          data.message ||
            "Password changed successfully."
        );
      } catch (error) {
        const status =
          error.response
            ?.status ||
          error.status;

        const message =
          getAuthErrorMessage(
            error
          );

        if (
          status === 401 &&
          !message
            .toLowerCase()
            .includes(
              "current password"
            )
        ) {
          handleUnauthorized();

          return;
        }

        toast.error(
          message
        );
      } finally {
        setPasswordLoading(
          false
        );
      }
    };

  return (
    <main className="profile-page">
      <div className="profile-container">
        <header className="profile-heading">
          <div className="profile-avatar">
            {user?.fullName
              ?.trim()
              .charAt(0)
              .toUpperCase() ||
              "U"}
          </div>

          <div>
            <h1>
              My Profile
            </h1>

            <p>
              Manage your HHS
              account information
              and password.
            </p>
          </div>
        </header>

        <div className="profile-grid">
          <section className="profile-card">
            <h2>
              Personal information
            </h2>

            <form
              onSubmit={
                handleProfileSubmit
              }
            >
              <div className="profile-field">
                <label htmlFor="fullName">
                  Full name
                </label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={
                    profileForm.fullName
                  }
                  onChange={
                    handleProfileChange
                  }
                  placeholder="Enter your full name"
                  minLength={3}
                  maxLength={100}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="email">
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={
                    profileForm.email
                  }
                  autoComplete="email"
                  disabled
                />

                <small>
                  Email cannot
                  currently be changed.
                </small>
              </div>

              <div className="profile-field">
                <label htmlFor="phone">
                  Phone number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={
                    profileForm.phone
                  }
                  onChange={
                    handleProfileChange
                  }
                  placeholder="Enter your phone number"
                  pattern="^\+?[0-9]{10,15}$"
                  autoComplete="tel"
                  required
                />
              </div>

              <button
                className="profile-submit"
                type="submit"
                disabled={
                  profileLoading
                }
              >
                {profileLoading
                  ? "Saving..."
                  : "Save changes"}
              </button>
            </form>
          </section>

          <section className="profile-card">
            <h2>
              Change password
            </h2>

            <form
              onSubmit={
                handlePasswordSubmit
              }
            >
              <div className="profile-field">
                <label htmlFor="currentPassword">
                  Current password
                </label>

                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={
                    passwordForm
                      .currentPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  placeholder="Enter current password"
                  maxLength={128}
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="newPassword">
                  New password
                </label>

                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={
                    passwordForm
                      .newPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  placeholder="At least 8 characters"
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  required
                />

                <small>
                  Use at least eight
                  characters with one
                  letter and one number.
                </small>
              </div>

              <div className="profile-field">
                <label htmlFor="confirmPassword">
                  Confirm new password
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={
                    passwordForm
                      .confirmPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  placeholder="Confirm new password"
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  required
                />
              </div>

              <button
                className="profile-submit password-button"
                type="submit"
                disabled={
                  passwordLoading
                }
              >
                {passwordLoading
                  ? "Updating..."
                  : "Update password"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Profile;