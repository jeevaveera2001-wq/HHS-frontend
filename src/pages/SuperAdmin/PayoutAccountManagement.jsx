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
  approvePayoutAccount,
  disablePayoutAccount,
  getAdminPayoutAccountById,
  getAdminPayoutAccounts,
  markPayoutAccountUnderReview,
  rejectPayoutAccount,
} from "../../services/payoutAccountService";

import "./PayoutAccountManagement.css";

const statusLabels = {
  not_submitted: "Not submitted",
  pending: "Pending",
  under_review: "Under review",
  verified: "Verified",
  rejected: "Rejected",
  disabled: "Disabled",
};

const initialPagination = {
  currentPage: 1,
   totalPages: 0,
  totalAccounts: 0,
  pageSize: 12,
  hasNextPage: false,
  hasPreviousPage: false,
};

const initialActionForm = {
  note: "",
  reason: "",
  verificationReference: "",
};

const getErrorStatus = (error) => {
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
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage
  );
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getAccountId = (account) => {
  return account?._id || account?.id || "";
};

const getOwnerName = (account) => {
  return (
    account?.owner?.fullName ||
    account?.bankDetails
      ?.accountHolderName ||
    "Property owner"
  );
};

const getAccountDescription = (
  account
) => {
  if (
    account?.payoutMethod === "upi"
  ) {
    return (
      account?.upiDetails?.maskedVpa ||
      "Masked UPI account"
    );
  }

  return (
    account?.maskedAccountNumber ||
    (account?.bankDetails
      ?.accountNumberLast4
      ? `••••••••${account.bankDetails.accountNumberLast4}`
      : "Masked bank account")
  );
};

function PayoutAccountManagement() {
  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const [
    accounts,
    setAccounts,
  ] = useState([]);

  const [
    filters,
    setFilters,
  ] = useState({
    status: "",
    method: "",
    search: "",
  });

  const [
    submittedFilters,
    setSubmittedFilters,
  ] = useState({
    status: "",
    method: "",
    search: "",
  });

  const [
    pagination,
    setPagination,
  ] = useState(
    initialPagination
  );

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    loadError,
    setLoadError,
  ] = useState("");

  const [
    selectedAccount,
    setSelectedAccount,
  ] = useState(null);

  const [
    detailsLoading,
    setDetailsLoading,
  ] = useState(false);

  const [
    actionType,
    setActionType,
  ] = useState("");

  const [
    actionForm,
    setActionForm,
  ] = useState(
    initialActionForm
  );

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const dashboardPath =
    user?.role === "super_admin"
      ? "/super-admin"
      : "/finance";

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

  const handleRequestError =
    useCallback(
      (
        error,
        fallbackMessage
      ) => {
        const status =
          getErrorStatus(error);

        if (status === 401) {
          handleUnauthorized();
          return true;
        }

        if (status === 403) {
          toast.error(
            "You do not have permission to manage payout accounts."
          );

          navigate(
            dashboardPath,
            {
              replace: true,
            }
          );

          return true;
        }

        toast.error(
          getErrorMessage(
            error,
            fallbackMessage
          )
        );

        return false;
      },
      [
        dashboardPath,
        handleUnauthorized,
        navigate,
      ]
    );

  const loadAccounts =
    useCallback(
      async (
        showInitialLoader = true
      ) => {
        try {
          if (showInitialLoader) {
            setLoading(true);
          } else {
            setRefreshing(true);
          }

          setLoadError("");

          const data =
            await getAdminPayoutAccounts({
              ...submittedFilters,
              page,
              limit: 12,
            });

          setAccounts(
            Array.isArray(
              data?.payoutAccounts
            )
              ? data.payoutAccounts
              : []
          );

          setPagination({
            ...initialPagination,
            ...(data?.pagination || {}),
          });
        } catch (error) {
          const handled =
            handleRequestError(
              error,
              "Unable to load owner payout accounts."
            );

          if (!handled) {
            setLoadError(
              getErrorMessage(
                error,
                "Unable to load owner payout accounts."
              )
            );
          }

          setAccounts([]);
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        handleRequestError,
        page,
        submittedFilters,
      ]
    );

  useEffect(() => {
    loadAccounts(true);
  }, [loadAccounts]);

  const pageStatistics =
    useMemo(() => {
      const result = {
        pending: 0,
        underReview: 0,
        verified: 0,
        attention: 0,
      };

      accounts.forEach(
        (account) => {
          const status =
            account.verificationStatus;

          if (status === "pending") {
            result.pending += 1;
          }

          if (
            status ===
            "under_review"
          ) {
            result.underReview +=
              1;
          }

          if (
            status === "verified"
          ) {
            result.verified += 1;
          }

          if (
            [
              "pending",
              "under_review",
              "rejected",
            ].includes(status)
          ) {
            result.attention += 1;
          }
        }
      );

      return result;
    }, [accounts]);

  const handleFilterChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleFilterSubmit = (
    event
  ) => {
    event.preventDefault();

    setPage(1);

    setSubmittedFilters({
      status: filters.status,
      method: filters.method,
      search:
        filters.search.trim(),
    });
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      status: "",
      method: "",
      search: "",
    };

    setFilters(emptyFilters);
    setSubmittedFilters(
      emptyFilters
    );

    setPage(1);
  };

  const openAccountDetails =
    async (account) => {
      const accountId =
        getAccountId(account);

      if (!accountId) {
        toast.error(
          "Invalid payout account ID."
        );

        return;
      }

      setSelectedAccount(account);
      setActionType("");

      setActionForm(
        initialActionForm
      );

      try {
        setDetailsLoading(true);

        const data =
          await getAdminPayoutAccountById(
            accountId
          );

        if (
          data?.payoutAccount
        ) {
          setSelectedAccount(
            data.payoutAccount
          );
        }
      } catch (error) {
        handleRequestError(
          error,
          "Unable to load payout account details."
        );
      } finally {
        setDetailsLoading(false);
      }
    };

  const closeAccountDetails = () => {
    if (actionLoading) {
      return;
    }

    setSelectedAccount(null);
    setActionType("");

    setActionForm(
      initialActionForm
    );
  };

  const beginAction = (type) => {
    setActionType(type);

    setActionForm(
      initialActionForm
    );
  };

  const handleActionChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setActionForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  const handleActionSubmit =
    async (event) => {
      event.preventDefault();

      const accountId =
        getAccountId(
          selectedAccount
        );

      if (
        !accountId ||
        !actionType
      ) {
        return;
      }

      const note =
        actionForm.note.trim();

      const reason =
        actionForm.reason.trim();

      if (
        actionType === "reject" &&
        !reason
      ) {
        toast.error(
          "Enter a reason for rejecting this payout account."
        );

        return;
      }

      if (
        actionType ===
          "disable" &&
        !note
      ) {
        toast.error(
          "Enter a reason for disabling this payout account."
        );

        return;
      }

      try {
        setActionLoading(true);

        let data;

        if (
          actionType === "review"
        ) {
          data =
            await markPayoutAccountUnderReview(
              accountId,
              note
            );
        }

        if (
          actionType ===
          "approve"
        ) {
          data =
            await approvePayoutAccount(
              accountId,
              {
                note,

                verificationReference:
                  actionForm
                    .verificationReference
                    .trim(),
              }
            );
        }

        if (
          actionType === "reject"
        ) {
          data =
            await rejectPayoutAccount(
              accountId,
              {
                reason,
                note,
              }
            );
        }

        if (
          actionType ===
          "disable"
        ) {
          data =
            await disablePayoutAccount(
              accountId,
              note
            );
        }

        toast.success(
          data?.message ||
            "Payout account updated successfully."
        );

        if (
          data?.payoutAccount
        ) {
          setSelectedAccount(
            data.payoutAccount
          );
        }

        setActionType("");

        setActionForm(
          initialActionForm
        );

        await loadAccounts(
          false
        );

        try {
          const details =
            await getAdminPayoutAccountById(
              accountId
            );

          if (
            details?.payoutAccount
          ) {
            setSelectedAccount(
              details.payoutAccount
            );
          }
        } catch {
          // Updated summary remains visible.
        }
      } catch (error) {
        handleRequestError(
          error,
          "Unable to update the payout account."
        );
      } finally {
        setActionLoading(false);
      }
    };

  const history = useMemo(() => {
    return [
      ...(
        selectedAccount
          ?.verificationHistory ||
        []
      ),
    ].sort((first, second) => {
      return (
        new Date(
          second.changedAt || 0
        ).getTime() -
        new Date(
          first.changedAt || 0
        ).getTime()
      );
    });
  }, [selectedAccount]);

  return (
    <main className="payout-management-page">
      <header className="payout-management-header">
        <div>
          <Link
            className="payout-management-back"
            to={dashboardPath}
          >
            ← Back to dashboard
          </Link>

          <span>
            HHS Finance Operations
          </span>

          <h1>
            Owner Payout Accounts
          </h1>

          <p>
            Review and verify the payout
            details used by property owners.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            loadAccounts(false)
          }
          disabled={
            loading ||
            refreshing
          }
        >
          {refreshing
            ? "Refreshing..."
            : "Refresh accounts"}
        </button>
      </header>

      <section className="payout-management-summary">
        <article>
          <span>Total results</span>

          <strong>
            {
              pagination.totalAccounts
            }
          </strong>

          <small>
            Matching current filters
          </small>
        </article>

        <article className="pending">
          <span>Pending</span>

          <strong>
            {
              pageStatistics.pending
            }
          </strong>

          <small>
            On this page
          </small>
        </article>

        <article className="review">
          <span>Under review</span>

          <strong>
            {
              pageStatistics.underReview
            }
          </strong>

          <small>
            On this page
          </small>
        </article>

        <article className="verified">
          <span>Verified</span>

          <strong>
            {
              pageStatistics.verified
            }
          </strong>

          <small>
            Ready for payouts
          </small>
        </article>
      </section>

      <section className="payout-management-panel">
        <form
          className="payout-management-filters"
          onSubmit={
            handleFilterSubmit
          }
        >
          <label>
            <span>
              Search accounts
            </span>

            <input
              name="search"
              value={filters.search}
              onChange={
                handleFilterChange
              }
              placeholder="Owner, bank, IFSC, last four digits..."
            />
          </label>

          <label>
            <span>Status</span>

            <select
              name="status"
              value={filters.status}
              onChange={
                handleFilterChange
              }
            >
              <option value="">
                All statuses
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="under_review">
                Under review
              </option>

              <option value="verified">
                Verified
              </option>

              <option value="rejected">
                Rejected
              </option>

              <option value="disabled">
                Disabled
              </option>
            </select>
          </label>

          <label>
            <span>
              Payout method
            </span>

            <select
              name="method"
              value={filters.method}
              onChange={
                handleFilterChange
              }
            >
              <option value="">
                All methods
              </option>

              <option value="bank_account">
                Bank account
              </option>

              <option value="upi">
                UPI
              </option>
            </select>
          </label>

          <div className="payout-filter-actions">
            <button type="submit">
              Apply filters
            </button>

            <button
              type="button"
              className="clear"
              onClick={
                handleClearFilters
              }
            >
              Clear
            </button>
          </div>
        </form>

        {loading ? (
          <div className="payout-management-state">
            <div className="payout-management-spinner" />

            <p>
              Loading payout accounts...
            </p>
          </div>
        ) : loadError ? (
          <div className="payout-management-state error">
            <span>!</span>

            <h2>
              Unable to load accounts
            </h2>

            <p>{loadError}</p>

            <button
              type="button"
              onClick={() =>
                loadAccounts(true)
              }
            >
              Try again
            </button>
          </div>
        ) : accounts.length ===
          0 ? (
          <div className="payout-management-state">
            <span>🏦</span>

            <h2>
              No payout accounts found
            </h2>

            <p>
              No owner payout accounts
              match the selected filters.
            </p>
          </div>
        ) : (
          <div className="payout-account-grid">
            {accounts.map(
              (account) => {
                const status =
                  account.verificationStatus ||
                  "not_submitted";

                return (
                  <article
                    className="managed-payout-account"
                    key={getAccountId(
                      account
                    )}
                  >
                    <div className="managed-payout-top">
                      <div className="managed-owner-avatar">
                        {getOwnerName(
                          account
                        )
                          .trim()
                          .charAt(0)
                          .toUpperCase() ||
                          "O"}
                      </div>

                      <div>
                        <strong>
                          {getOwnerName(
                            account
                          )}
                        </strong>

                        <span>
                          {account.owner
                            ?.email ||
                            "Owner email unavailable"}
                        </span>
                      </div>

                      <span
                        className={`managed-payout-status ${status}`}
                      >
                        {statusLabels[
                          status
                        ] || status}
                      </span>
                    </div>

                    <div className="managed-payout-details">
                      <div>
                        <span>
                          Method
                        </span>

                        <strong>
                          {account.payoutMethod ===
                          "upi"
                            ? "UPI"
                            : "Bank account"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Account
                        </span>

                        <strong>
                          {getAccountDescription(
                            account
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Provider
                        </span>

                        <strong>
                          {account
                            .razorpay
                            ?.providerStatus ||
                            "Not available"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Submitted
                        </span>

                        <strong>
                          {formatDate(
                            account.submittedAt
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className="managed-payout-footer">
                      <span>
                        {account.payoutsEnabled
                          ? "✓ Payouts enabled"
                          : "Payouts disabled"}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          openAccountDetails(
                            account
                          )
                        }
                      >
                        Review details
                      </button>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}

        {!loading &&
          pagination.totalPages >
            1 && (
          <div className="payout-management-pagination">
            <button
              type="button"
              onClick={() =>
                setPage(
                  (previous) =>
                    Math.max(
                      previous - 1,
                      1
                    )
                )
              }
              disabled={
                !pagination.hasPreviousPage ||
                refreshing
              }
            >
              Previous
            </button>

            <span>
              Page{" "}
              {
                pagination.currentPage
              }{" "}
              of{" "}
              {
                pagination.totalPages
              }
            </span>

            <button
              type="button"
              onClick={() =>
                setPage(
                  (previous) =>
                    Math.min(
                      previous + 1,
                      pagination.totalPages
                    )
                )
              }
              disabled={
                !pagination.hasNextPage ||
                refreshing
              }
            >
              Next
            </button>
          </div>
        )}
      </section>

      {selectedAccount && (
        <div
          className="payout-account-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeAccountDetails();
            }
          }}
        >
          <section
            className="payout-account-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Payout account details"
          >
            <header>
              <div>
                <span>
                  Owner payout review
                </span>

                <h2>
                  {getOwnerName(
                    selectedAccount
                  )}
                </h2>
              </div>

              <button
                type="button"
                className="payout-modal-close"
                onClick={
                  closeAccountDetails
                }
                disabled={
                  actionLoading
                }
                aria-label="Close payout account details"
              >
                ×
              </button>
            </header>

            {detailsLoading ? (
              <div className="payout-modal-loading">
                <div className="payout-management-spinner" />

                <p>
                  Loading account details...
                </p>
              </div>
            ) : (
              <div className="payout-modal-body">
                <div className="payout-modal-status-row">
                  <span
                    className={`managed-payout-status ${
                      selectedAccount.verificationStatus ||
                      "not_submitted"
                    }`}
                  >
                    {statusLabels[
                      selectedAccount
                        .verificationStatus
                    ] ||
                      selectedAccount
                        .verificationStatus}
                  </span>

                  <span>
                    {selectedAccount.payoutsEnabled
                      ? "✓ Payouts enabled"
                      : "Payouts disabled"}
                  </span>
                </div>

                <section className="payout-modal-section">
                  <h3>
                    Owner information
                  </h3>

                  <div className="payout-modal-information">
                    <div>
                      <span>Name</span>

                      <strong>
                        {getOwnerName(
                          selectedAccount
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Email</span>

                      <strong>
                        {selectedAccount
                          .owner
                          ?.email ||
                          "—"}
                      </strong>
                    </div>

                    <div>
                      <span>Phone</span>

                      <strong>
                        {selectedAccount
                          .owner
                          ?.phone ||
                          "—"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Owner status
                      </span>

                      <strong>
                        {selectedAccount
                          .owner
                          ?.isActive ===
                        false
                          ? "Inactive"
                          : "Active"}
                      </strong>
                    </div>
                  </div>
                </section>

                <section className="payout-modal-section">
                  <h3>
                    Payout information
                  </h3>

                  <div className="payout-modal-information">
                    <div>
                      <span>Method</span>

                      <strong>
                        {selectedAccount
                          .payoutMethod ===
                        "upi"
                          ? "UPI"
                          : "Bank account"}
                      </strong>
                    </div>

                    {selectedAccount.payoutMethod ===
                    "upi" ? (
                      <div>
                        <span>
                          UPI ID
                        </span>

                        <strong>
                          {selectedAccount
                            .upiDetails
                            ?.maskedVpa ||
                            "—"}
                        </strong>
                      </div>
                    ) : (
                      <>
                        <div>
                          <span>
                            Account holder
                          </span>

                          <strong>
                            {selectedAccount
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
                            {getAccountDescription(
                              selectedAccount
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>
                            IFSC
                          </span>

                          <strong>
                            {selectedAccount
                              .bankDetails
                              ?.ifsc ||
                              "—"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Bank
                          </span>

                          <strong>
                            {selectedAccount
                              .bankDetails
                              ?.bankName ||
                              "—"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Branch
                          </span>

                          <strong>
                            {selectedAccount
                              .bankDetails
                              ?.branchName ||
                              "—"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Account type
                          </span>

                          <strong>
                            {selectedAccount
                              .bankDetails
                              ?.accountType ||
                              "—"}
                          </strong>
                        </div>
                      </>
                    )}

                    <div>
                      <span>
                        Provider status
                      </span>

                      <strong>
                        {selectedAccount
                          .razorpay
                          ?.providerStatus ||
                          "—"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Verification reference
                      </span>

                      <strong>
                        {selectedAccount
                          .verificationReference ||
                          "—"}
                      </strong>
                    </div>
                  </div>
                </section>

                {selectedAccount.rejectionReason && (
                  <div className="payout-rejection-message">
                    <strong>
                      Rejection reason
                    </strong>

                    <p>
                      {
                        selectedAccount.rejectionReason
                      }
                    </p>
                  </div>
                )}

                <section className="payout-modal-section">
                  <h3>
                    Verification history
                  </h3>

                  {history.length ===
                  0 ? (
                    <p className="payout-history-empty">
                      No verification history
                      is available.
                    </p>
                  ) : (
                    <div className="payout-history-list">
                      {history.map(
                        (
                          item,
                          index
                        ) => (
                          <article
                            key={
                              item._id ||
                              item.id ||
                              `${item.action}-${index}`
                            }
                          >
                            <span
                              className={`history-marker ${item.status}`}
                            />

                            <div>
                              <strong>
                                {statusLabels[
                                  item
                                    .status
                                ] ||
                                  item.action}
                              </strong>

                              <p>
                                {item.note ||
                                  "Status updated."}
                              </p>

                              <small>
                                {formatDate(
                                  item.changedAt
                                )}

                                {item.changedBy
                                  ?.fullName
                                  ? ` · ${item.changedBy.fullName}`
                                  : ""}
                              </small>
                            </div>
                          </article>
                        )
                      )}
                    </div>
                  )}
                </section>

                {!actionType && (
                  <div className="payout-modal-actions">
                    {selectedAccount.verificationStatus ===
                      "pending" && (
                      <button
                        type="button"
                        className="review"
                        onClick={() =>
                          beginAction(
                            "review"
                          )
                        }
                      >
                        Start review
                      </button>
                    )}

                    {[
                      "pending",
                      "under_review",
                    ].includes(
                      selectedAccount.verificationStatus
                    ) && (
                      <button
                        type="button"
                        className="approve"
                        onClick={() =>
                          beginAction(
                            "approve"
                          )
                        }
                      >
                        Approve account
                      </button>
                    )}

                    {[
                      "pending",
                      "under_review",
                      "verified",
                    ].includes(
                      selectedAccount.verificationStatus
                    ) && (
                      <button
                        type="button"
                        className="reject"
                        onClick={() =>
                          beginAction(
                            "reject"
                          )
                        }
                      >
                        Reject account
                      </button>
                    )}

                    {selectedAccount.verificationStatus ===
                      "verified" && (
                      <button
                        type="button"
                        className="disable"
                        onClick={() =>
                          beginAction(
                            "disable"
                          )
                        }
                      >
                        Disable payouts
                      </button>
                    )}
                  </div>
                )}

                {actionType && (
                  <form
                    className={`payout-action-form ${actionType}`}
                    onSubmit={
                      handleActionSubmit
                    }
                  >
                    <div>
                      <strong>
                        {actionType ===
                          "review" &&
                          "Move account under review"}

                        {actionType ===
                          "approve" &&
                          "Approve payout account"}

                        {actionType ===
                          "reject" &&
                          "Reject payout account"}

                        {actionType ===
                          "disable" &&
                          "Disable payout account"}
                      </strong>

                      <p>
                        Confirm this action and
                        add the required review
                        details.
                      </p>
                    </div>

                    {actionType ===
                      "reject" && (
                      <label>
                        <span>
                          Rejection reason *
                        </span>

                        <textarea
                          name="reason"
                          value={
                            actionForm.reason
                          }
                          onChange={
                            handleActionChange
                          }
                          rows="3"
                          maxLength="1000"
                          placeholder="Explain what the owner needs to correct"
                          required
                        />
                      </label>
                    )}

                    {actionType ===
                      "approve" && (
                      <label>
                        <span>
                          Verification reference
                        </span>

                        <input
                          name="verificationReference"
                          value={
                            actionForm.verificationReference
                          }
                          onChange={
                            handleActionChange
                          }
                          maxLength="150"
                          placeholder="Example: HHS-VERIFY-001"
                        />
                      </label>
                    )}

                    <label>
                      <span>
                        {actionType ===
                        "disable"
                          ? "Disable reason *"
                          : "Administrative note"}
                      </span>

                      <textarea
                        name="note"
                        value={
                          actionForm.note
                        }
                        onChange={
                          handleActionChange
                        }
                        rows="3"
                        maxLength="1000"
                        placeholder="Add an internal verification note"
                        required={
                          actionType ===
                          "disable"
                        }
                      />
                    </label>

                    <div className="payout-action-buttons">
                      <button
                        type="button"
                        className="cancel"
                        onClick={() => {
                          setActionType(
                            ""
                          );

                          setActionForm(
                            initialActionForm
                          );
                        }}
                        disabled={
                          actionLoading
                        }
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className={
                          actionType
                        }
                        disabled={
                          actionLoading
                        }
                      >
                        {actionLoading
                          ? "Updating..."
                          : "Confirm action"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

export default PayoutAccountManagement;