import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { toast } from "react-toastify";

import useAuth from "../../hooks/useAuth";

import {
  disableMyPayoutAccount,
  getMyPayoutAccount,
  submitPayoutAccount,
} from "../../services/payoutAccountService";

import "./OwnerPayoutSettings.css";

const initialFormData = {
  payoutMethod: "bank_account",
  accountHolderName: "",
  accountNumber: "",
  confirmAccountNumber: "",
  ifsc: "",
  bankName: "",
  branchName: "",
  accountType: "savings",
  vpa: "",
  replaceExisting: false,
};

const statusLabels = {
  not_submitted:
    "Not submitted",
  pending:
    "Pending verification",
  under_review:
    "Under review",
  verified:
    "Verified",
  rejected:
    "Rejected",
  disabled:
    "Disabled",
};

const statusDescriptions = {
  not_submitted:
    "Add a payout account to receive property earnings.",

  pending:
    "Your payout details were submitted and are waiting for review.",

  under_review:
    "The finance team is currently reviewing your payout details.",

  verified:
    "Your payout account is verified and ready to receive settlements.",

  rejected:
    "Your payout details require correction before they can be approved.",

  disabled:
    "This payout account is disabled and cannot receive settlements.",
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

const getErrorStatus = (
  error
) => {
  return (
    error?.status ||
    error?.response?.status ||
    0
  );
};

const getErrorMessage = (
  error,
  fallbackMessage
) => {
  return (
    error?.data?.message ||
    error?.response?.data
      ?.message ||
    error?.message ||
    fallbackMessage
  );
};

const createFormData = ({
  payoutAccount,
  user,
  replacing = false,
}) => {
  return {
    ...initialFormData,

    payoutMethod:
      payoutAccount
        ?.payoutMethod ||
      "bank_account",

    accountHolderName:
      payoutAccount
        ?.bankDetails
        ?.accountHolderName ||
      user?.fullName ||
      "",

    ifsc:
      payoutAccount
        ?.bankDetails
        ?.ifsc ||
      "",

    bankName:
      payoutAccount
        ?.bankDetails
        ?.bankName ||
      "",

    branchName:
      payoutAccount
        ?.bankDetails
        ?.branchName ||
      "",

    accountType:
      payoutAccount
        ?.bankDetails
        ?.accountType ||
      "savings",

    replaceExisting:
      replacing,
  };
};

function OwnerPayoutSettings() {
  const navigate =
    useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const [
    payoutAccount,
    setPayoutAccount,
  ] = useState(null);

  const [
    providerConfigured,
    setProviderConfigured,
  ] = useState(true);

  const [
    formData,
    setFormData,
  ] = useState(
    initialFormData
  );

  const [
    editing,
    setEditing,
  ] = useState(true);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    disabling,
    setDisabling,
  ] = useState(false);

  const [
    loadError,
    setLoadError,
  ] = useState("");

  const [
    showDisablePanel,
    setShowDisablePanel,
  ] = useState(false);

  const [
    disableNote,
    setDisableNote,
  ] = useState("");

  const [
    showAccountNumber,
    setShowAccountNumber,
  ] = useState(false);

  const handleUnauthorized =
    useCallback(() => {
      logout();

      toast.error(
        "Your session has expired. Please log in again."
      );

      navigate("/login", {
        replace: true,
      });
    }, [
      logout,
      navigate,
    ]);

  const loadPayoutAccount =
    useCallback(async () => {
      try {
        setLoading(true);
        setLoadError("");

        const data =
          await getMyPayoutAccount();

        const returnedAccount =
          data?.payoutAccount ||
          null;

        setProviderConfigured(
          data?.providerConfigured !==
            false
        );

        setPayoutAccount(
          returnedAccount
        );

        const accountStatus =
          returnedAccount
            ?.verificationStatus ||
          "not_submitted";

        const shouldEdit =
          !returnedAccount ||
          [
            "not_submitted",
            "rejected",
            "disabled",
          ].includes(
            accountStatus
          );

        setEditing(
          shouldEdit
        );

        setFormData(
          createFormData({
            payoutAccount:
              returnedAccount,

            user,
            replacing: false,
          })
        );
      } catch (error) {
        if (
          getErrorStatus(
            error
          ) === 401
        ) {
          handleUnauthorized();
          return;
        }

        if (
          getErrorStatus(
            error
          ) === 403
        ) {
          toast.error(
            "Only property owners can access payout settings."
          );

          navigate("/", {
            replace: true,
          });

          return;
        }

        const message =
          getErrorMessage(
            error,
            "Unable to load your payout settings."
          );

        setLoadError(message);

        toast.error(message);
      } finally {
        setLoading(false);
      }
    }, [
      handleUnauthorized,
      navigate,
      user,
    ]);

  useEffect(() => {
    loadPayoutAccount();
  }, [loadPayoutAccount]);

  const currentStatus =
    payoutAccount
      ?.verificationStatus ||
    "not_submitted";

  const history =
    useMemo(() => {
      return [
        ...(
          payoutAccount
            ?.verificationHistory ||
          []
        ),
      ].sort(
        (
          first,
          second
        ) => {
          return (
            new Date(
              second.changedAt ||
                0
            ).getTime() -
            new Date(
              first.changedAt ||
                0
            ).getTime()
          );
        }
      );
    }, [payoutAccount]);

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    let nextValue = value;

    if (
      [
        "accountNumber",
        "confirmAccountNumber",
      ].includes(name)
    ) {
      nextValue =
        value.replace(
          /\D/g,
          ""
        );
    }

    if (name === "ifsc") {
      nextValue = value
        .toUpperCase()
        .replace(/\s/g, "")
        .slice(0, 11);
    }

    if (name === "vpa") {
      nextValue = value
        .replace(/\s/g, "")
        .toLowerCase();
    }

    setFormData(
      (previous) => ({
        ...previous,
        [name]: nextValue,
      })
    );
  };

  const validateForm = () => {
    if (
      formData.payoutMethod ===
      "upi"
    ) {
      if (
        !/^[a-zA-Z0-9._-]{2,256}@[a-zA-Z0-9.-]{2,64}$/.test(
          formData.vpa.trim()
        )
      ) {
        return "Please provide a valid UPI ID.";
      }

      return "";
    }

    if (
      formData
        .accountHolderName
        .trim()
        .length < 2
    ) {
      return "Enter the account holder name exactly as shown by the bank.";
    }

    if (
      !/^\d{6,34}$/.test(
        formData.accountNumber
      )
    ) {
      return "Please provide a valid bank account number.";
    }

    if (
      formData.accountNumber !==
      formData
        .confirmAccountNumber
    ) {
      return "Bank account numbers do not match.";
    }

    if (
      !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(
        formData.ifsc
      )
    ) {
      return "Please provide a valid 11-character IFSC code.";
    }

    if (
      ![
        "savings",
        "current",
      ].includes(
        formData.accountType
      )
    ) {
      return "Select a valid bank account type.";
    }

    return "";
  };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      const validationError =
        validateForm();

      if (validationError) {
        toast.error(
          validationError
        );

        return;
      }

      try {
        setSubmitting(true);

        const payload =
          formData
            .payoutMethod ===
          "upi"
            ? {
                payoutMethod:
                  "upi",

                vpa:
                  formData.vpa
                    .trim(),

                replaceExisting:
                  formData
                    .replaceExisting,
              }
            : {
                payoutMethod:
                  "bank_account",

                accountHolderName:
                  formData
                    .accountHolderName
                    .trim(),

                accountNumber:
                  formData
                    .accountNumber,

                confirmAccountNumber:
                  formData
                    .confirmAccountNumber,

                ifsc:
                  formData.ifsc
                    .trim(),

                bankName:
                  formData
                    .bankName
                    .trim(),

                branchName:
                  formData
                    .branchName
                    .trim(),

                accountType:
                  formData
                    .accountType,

                replaceExisting:
                  formData
                    .replaceExisting,
              };

        const data =
          await submitPayoutAccount(
            payload
          );

        setPayoutAccount(
          data?.payoutAccount ||
            null
        );

        setEditing(false);

        setShowAccountNumber(
          false
        );

        setFormData(
          createFormData({
            payoutAccount:
              data?.payoutAccount,

            user,
            replacing: false,
          })
        );

        toast.success(
          data?.message ||
            "Payout account submitted successfully."
        );
      } catch (error) {
        if (
          getErrorStatus(
            error
          ) === 401
        ) {
          handleUnauthorized();
          return;
        }

        if (
          error?.data
            ?.requiresReplacementConfirmation
        ) {
          setFormData(
            (previous) => ({
              ...previous,

              replaceExisting:
                true,
            })
          );

          toast.info(
            "Confirm the replacement and submit the new payout details again."
          );

          return;
        }

        toast.error(
          getErrorMessage(
            error,
            "Unable to submit your payout account."
          )
        );
      } finally {
        setSubmitting(false);
      }
    };

  const handleStartReplacement =
    () => {
      setFormData(
        createFormData({
          payoutAccount,
          user,
          replacing: true,
        })
      );

      setEditing(true);

      setShowDisablePanel(
        false
      );

      toast.info(
        "Enter the new payout details and submit them for verification."
      );
    };

  const handleCancelEditing =
    () => {
      setEditing(false);

      setShowAccountNumber(
        false
      );

      setFormData(
        createFormData({
          payoutAccount,
          user,
          replacing: false,
        })
      );
    };

  const handleDisable =
    async () => {
      if (
        !disableNote.trim()
      ) {
        toast.error(
          "Please provide a reason for disabling payouts."
        );

        return;
      }

      try {
        setDisabling(true);

        const data =
          await disableMyPayoutAccount(
            disableNote.trim()
          );

        setPayoutAccount(
          data?.payoutAccount ||
            null
        );

        setShowDisablePanel(
          false
        );

        setDisableNote("");

        setEditing(true);

        toast.success(
          data?.message ||
            "Payout account disabled."
        );
      } catch (error) {
        if (
          getErrorStatus(
            error
          ) === 401
        ) {
          handleUnauthorized();
          return;
        }

        toast.error(
          getErrorMessage(
            error,
            "Unable to disable your payout account."
          )
        );
      } finally {
        setDisabling(false);
      }
    };

  if (loading) {
    return (
      <main className="owner-payout-state">
        <div className="owner-payout-spinner" />

        <p>
          Loading payout
          settings...
        </p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="owner-payout-state">
        <span>!</span>

        <h1>
          Unable to load payout
          settings
        </h1>

        <p>{loadError}</p>

        <button
          type="button"
          onClick={
            loadPayoutAccount
          }
        >
          Try again
        </button>
      </main>
    );
  }

  return (
    <main className="owner-payout-page">
      <header className="owner-payout-header">
        <div>
          <Link to="/owner">
            ← Back to Owner
            Centre
          </Link>

          <span>
            Owner settlements
          </span>

          <h1>
            Payout settings
          </h1>

          <p>
            Add and verify the
            account where your
            property earnings
            should be settled.
          </p>
        </div>

        <button
          type="button"
          onClick={
            loadPayoutAccount
          }
        >
          Refresh
        </button>
      </header>

      {!providerConfigured && (
        <section className="owner-payout-warning">
          <span>⚠</span>

          <div>
            <strong>
              Owner payouts are
              not configured
            </strong>

            <p>
              RazorpayX payout
              credentials must be
              configured before
              banking details can
              be submitted.
            </p>
          </div>
        </section>
      )}

      <div className="owner-payout-layout">
        <section className="owner-payout-main">
          <article
            className={`owner-payout-status-card ${currentStatus}`}
          >
            <div className="owner-payout-status-icon">
              {currentStatus ===
              "verified"
                ? "✓"
                : currentStatus ===
                    "rejected"
                  ? "!"
                  : currentStatus ===
                      "disabled"
                    ? "×"
                    : "⌛"}
            </div>

            <div>
              <span>
                Payout-account
                status
              </span>

              <h2>
                {statusLabels[
                  currentStatus
                ] ||
                  currentStatus}
              </h2>

              <p>
                {statusDescriptions[
                  currentStatus
                ] ||
                  "Your payout account status is being updated."}
              </p>
            </div>

            {payoutAccount
              ?.payoutsEnabled && (
              <strong className="owner-payout-enabled">
                Payouts enabled
              </strong>
            )}
          </article>

          {payoutAccount &&
            !editing && (
            <article className="owner-payout-account-card">
              <div className="owner-payout-card-heading">
                <div>
                  <span>
                    Current payout
                    method
                  </span>

                  <h2>
                    {payoutAccount
                      .payoutMethod ===
                    "upi"
                      ? "UPI account"
                      : "Bank account"}
                  </h2>
                </div>

                <span
                  className={`owner-payout-status-badge ${currentStatus}`}
                >
                  {statusLabels[
                    currentStatus
                  ] ||
                    currentStatus}
                </span>
              </div>

              {payoutAccount
                .payoutMethod ===
              "bank_account" ? (
                <div className="owner-payout-account-details">
                  <div>
                    <span>
                      Account holder
                    </span>

                    <strong>
                      {payoutAccount
                        .bankDetails
                        ?.accountHolderName ||
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Account number
                    </span>

                    <strong>
                      {payoutAccount
                        .maskedAccountNumber ||
                        `••••••••${
                          payoutAccount
                            .bankDetails
                            ?.accountNumberLast4 ||
                          ""
                        }`}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Bank
                    </span>

                    <strong>
                      {payoutAccount
                        .bankDetails
                        ?.bankName ||
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      IFSC
                    </span>

                    <strong>
                      {payoutAccount
                        .bankDetails
                        ?.ifsc ||
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Account type
                    </span>

                    <strong>
                      {payoutAccount
                        .bankDetails
                        ?.accountType ||
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Submitted
                    </span>

                    <strong>
                      {formatDate(
                        payoutAccount
                          .submittedAt
                      )}
                    </strong>
                  </div>
                </div>
              ) : (
                <div className="owner-payout-account-details upi">
                  <div>
                    <span>
                      UPI ID
                    </span>

                    <strong>
                      {payoutAccount
                        .upiDetails
                        ?.maskedVpa ||
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Submitted
                    </span>

                    <strong>
                      {formatDate(
                        payoutAccount
                          .submittedAt
                      )}
                    </strong>
                  </div>
                </div>
              )}

              {currentStatus ===
                "rejected" &&
                payoutAccount
                  .rejectionReason && (
                  <div className="owner-payout-rejection">
                    <strong>
                      Reason for
                      rejection
                    </strong>

                    <p>
                      {
                        payoutAccount
                          .rejectionReason
                      }
                    </p>
                  </div>
                )}

              <div className="owner-payout-account-actions">
                {![
                  "pending",
                  "under_review",
                ].includes(
                  currentStatus
                ) && (
                  <button
                    type="button"
                    onClick={
                      handleStartReplacement
                    }
                  >
                    Replace payout
                    details
                  </button>
                )}

                {currentStatus !==
                  "disabled" && (
                  <button
                    type="button"
                    className="danger"
                    onClick={() =>
                      setShowDisablePanel(
                        true
                      )
                    }
                  >
                    Disable payouts
                  </button>
                )}
              </div>
            </article>
          )}

          {showDisablePanel && (
            <article className="owner-payout-disable-panel">
              <h2>
                Disable payout
                account?
              </h2>

              <p>
                New owner
                settlements will
                remain on hold until
                replacement details
                are submitted and
                verified.
              </p>

              <label htmlFor="disableNote">
                Reason for disabling

                <textarea
                  id="disableNote"
                  value={
                    disableNote
                  }
                  onChange={(
                    event
                  ) =>
                    setDisableNote(
                      event.target
                        .value
                    )
                  }
                  rows="3"
                  maxLength="1000"
                  placeholder="Explain why you want to disable this payout account"
                />
              </label>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    setShowDisablePanel(
                      false
                    );

                    setDisableNote(
                      ""
                    );
                  }}
                  disabled={
                    disabling
                  }
                >
                  Keep account
                </button>

                <button
                  type="button"
                  className="danger"
                  onClick={
                    handleDisable
                  }
                  disabled={
                    disabling
                  }
                >
                  {disabling
                    ? "Disabling..."
                    : "Confirm disable"}
                </button>
              </div>
            </article>
          )}

          {editing && (
            <form
              className="owner-payout-form"
              onSubmit={
                handleSubmit
              }
            >
              <div className="owner-payout-form-heading">
                <div>
                  <span>
                    {formData
                      .replaceExisting
                      ? "Replacement details"
                      : "Settlement account"}
                  </span>

                  <h2>
                    {formData
                      .replaceExisting
                      ? "Replace payout account"
                      : "Add payout account"}
                  </h2>

                  <p>
                    Full banking
                    information is
                    transmitted
                    securely to
                    Razorpay and is
                    not stored by HHS.
                  </p>
                </div>

                {payoutAccount &&
                  formData
                    .replaceExisting && (
                    <button
                      type="button"
                      onClick={
                        handleCancelEditing
                      }
                    >
                      Cancel
                    </button>
                  )}
              </div>

              <fieldset className="owner-payout-methods">
                <legend>
                  Select payout
                  method
                </legend>

                <label
                  className={
                    formData
                      .payoutMethod ===
                    "bank_account"
                      ? "active"
                      : ""
                  }
                >
                  <input
                    type="radio"
                    name="payoutMethod"
                    value="bank_account"
                    checked={
                      formData
                        .payoutMethod ===
                      "bank_account"
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <span>🏦</span>

                  <div>
                    <strong>
                      Bank account
                    </strong>

                    <small>
                      Receive
                      settlements
                      using NEFT or
                      IMPS
                    </small>
                  </div>
                </label>

                <label
                  className={
                    formData
                      .payoutMethod ===
                    "upi"
                      ? "active"
                      : ""
                  }
                >
                  <input
                    type="radio"
                    name="payoutMethod"
                    value="upi"
                    checked={
                      formData
                        .payoutMethod ===
                      "upi"
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <span>₹</span>

                  <div>
                    <strong>
                      UPI ID
                    </strong>

                    <small>
                      Receive
                      settlements
                      through a
                      verified VPA
                    </small>
                  </div>
                </label>
              </fieldset>

              {formData
                .payoutMethod ===
              "bank_account" ? (
                <div className="owner-payout-fields">
                  <label
                    className="full"
                    htmlFor="accountHolderName"
                  >
                    <span>
                      Account holder
                      name
                    </span>

                    <input
                      id="accountHolderName"
                      name="accountHolderName"
                      value={
                        formData
                          .accountHolderName
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Name exactly as shown by the bank"
                      maxLength="120"
                      autoComplete="name"
                      required
                    />
                  </label>

                  <label htmlFor="accountNumber">
                    <span>
                      Account number
                    </span>

                    <div className="owner-payout-sensitive-input">
                      <input
                        id="accountNumber"
                        name="accountNumber"
                        type={
                          showAccountNumber
                            ? "text"
                            : "password"
                        }
                        inputMode="numeric"
                        value={
                          formData
                            .accountNumber
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Enter account number"
                        minLength="6"
                        maxLength="34"
                        autoComplete="off"
                        required
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowAccountNumber(
                            (
                              shown
                            ) =>
                              !shown
                          )
                        }
                      >
                        {showAccountNumber
                          ? "Hide"
                          : "Show"}
                      </button>
                    </div>
                  </label>

                  <label htmlFor="confirmAccountNumber">
                    <span>
                      Confirm account
                      number
                    </span>

                    <input
                      id="confirmAccountNumber"
                      name="confirmAccountNumber"
                      type={
                        showAccountNumber
                          ? "text"
                          : "password"
                      }
                      inputMode="numeric"
                      value={
                        formData
                          .confirmAccountNumber
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter the account number again"
                      minLength="6"
                      maxLength="34"
                      autoComplete="off"
                      required
                    />
                  </label>

                  <label htmlFor="ifsc">
                    <span>
                      IFSC code
                    </span>

                    <input
                      id="ifsc"
                      name="ifsc"
                      value={
                        formData.ifsc
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Example: HDFC0000053"
                      minLength="11"
                      maxLength="11"
                      autoCapitalize="characters"
                      required
                    />
                  </label>

                  <label htmlFor="accountType">
                    <span>
                      Account type
                    </span>

                    <select
                      id="accountType"
                      name="accountType"
                      value={
                        formData
                          .accountType
                      }
                      onChange={
                        handleChange
                      }
                    >
                      <option value="savings">
                        Savings
                        account
                      </option>

                      <option value="current">
                        Current
                        account
                      </option>
                    </select>
                  </label>

                  <label htmlFor="bankName">
                    <span>
                      Bank name
                    </span>

                    <input
                      id="bankName"
                      name="bankName"
                      value={
                        formData
                          .bankName
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Bank name"
                      maxLength="120"
                    />
                  </label>

                  <label htmlFor="branchName">
                    <span>
                      Branch name
                    </span>

                    <input
                      id="branchName"
                      name="branchName"
                      value={
                        formData
                          .branchName
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Branch name"
                      maxLength="150"
                    />
                  </label>
                </div>
              ) : (
                <div className="owner-payout-fields single">
                  <label
                    className="full"
                    htmlFor="vpa"
                  >
                    <span>
                      UPI ID
                    </span>

                    <input
                      id="vpa"
                      name="vpa"
                      value={
                        formData.vpa
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Example: owner@upi"
                      maxLength="320"
                      autoComplete="off"
                      required
                    />
                  </label>
                </div>
              )}

              {formData
                .replaceExisting && (
                <div className="owner-payout-replacement-note">
                  <span>!</span>

                  <p>
                    Your existing
                    payout account
                    will be disabled
                    while the new
                    details are
                    reviewed.
                  </p>
                </div>
              )}

              <button
                className="owner-payout-submit"
                type="submit"
                disabled={
                  submitting ||
                  !providerConfigured
                }
              >
                {submitting
                  ? "Submitting securely..."
                  : formData
                        .replaceExisting
                    ? "Submit replacement details"
                    : "Submit for verification"}
              </button>

              <small className="owner-payout-consent">
                By submitting, you
                confirm that the
                payout account
                belongs to you or
                your registered
                property business.
              </small>
            </form>
          )}
        </section>

        <aside className="owner-payout-sidebar">
          <article className="owner-payout-security-card">
            <span>🔒</span>

            <h2>
              Secure payout setup
            </h2>

            <p>
              HHS stores only
              masked banking
              information and
              Razorpay account
              references.
            </p>

            <ul>
              <li>
                Never share OTPs or
                UPI PINs
              </li>

              <li>
                Complete account
                numbers are not
                stored
              </li>

              <li>
                Changes require
                verification
              </li>

              <li>
                Payout activity is
                recorded
              </li>
            </ul>
          </article>

          {payoutAccount && (
            <article className="owner-payout-provider-card">
              <span>
                Payment provider
              </span>

              <h2>Razorpay</h2>

              <div>
                <span>
                  Provider status
                </span>

                <strong>
                  {payoutAccount
                    .razorpay
                    ?.providerStatus
                    ?.replaceAll(
                      "_",
                      " "
                    ) ||
                    "Not created"}
                </strong>
              </div>

              <div>
                <span>
                  Last synchronized
                </span>

                <strong>
                  {formatDate(
                    payoutAccount
                      .razorpay
                      ?.lastProviderSyncAt
                  )}
                </strong>
              </div>

              {payoutAccount
                .verificationReference && (
                <div>
                  <span>
                    Verification
                    reference
                  </span>

                  <strong>
                    {
                      payoutAccount
                        .verificationReference
                    }
                  </strong>
                </div>
              )}
            </article>
          )}

          {history.length > 0 && (
            <article className="owner-payout-history-card">
              <span>
                Verification
                activity
              </span>

              <h2>
                Account history
              </h2>

              <div className="owner-payout-history-list">
                {history.map(
                  (item) => (
                    <div
                      key={
                        item._id ||
                        item.id ||
                        item.changedAt
                      }
                    >
                      <span
                        className={`owner-payout-history-dot ${item.status}`}
                      />

                      <div>
                        <strong>
                          {item.action
                            ?.replaceAll(
                              "_",
                              " "
                            ) ||
                            "Updated"}
                        </strong>

                        <p>
                          {item.note ||
                            "Payout account updated."}
                        </p>

                        <small>
                          {formatDate(
                            item.changedAt
                          )}
                        </small>
                      </div>
                    </div>
                  )
                )}
              </div>
            </article>
          )}
        </aside>
      </div>
    </main>
  );
}

export default OwnerPayoutSettings;