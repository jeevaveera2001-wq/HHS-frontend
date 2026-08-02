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
  getFinanceSummary,
  getFinanceTransactions,
} from "../../services/financeService";

import {
  initiatePaymentRefund,
} from "../../services/paymentService";

import "./FinanceDashboard.css";

const PAGE_SIZE = 20;

const paymentStatusLabels = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refund_pending: "Refund Pending",
  partially_refunded:
    "Partially Refunded",
  refunded: "Refunded",
};

const dashboardRoutes = {
  super_admin: "/super-admin",
  operations_manager: "/manager",
  booking_manager:
    "/booking-admin",
  finance_manager: "/",
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

const formatCurrency = (amount) => {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(
    Number(amount) || 0
  );
};

const formatDate = (
  date,
  includeTime = false
) => {
  if (!date) {
    return "—";
  }

  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "—";
  }

  return parsedDate.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",

      ...(includeTime
        ? {
            hour: "2-digit",
            minute: "2-digit",
          }
        : {}),
    }
  );
};

const getCustomerName = (
  transaction
) => {
  return (
    transaction?.customer
      ?.fullName ||
    transaction?.primaryGuest
      ?.fullName ||
    "Guest"
  );
};

const getCustomerContact = (
  transaction
) => {
  return (
    transaction?.customer?.email ||
    transaction?.primaryGuest
      ?.email ||
    transaction?.primaryGuest
      ?.phone ||
    "—"
  );
};

const getPropertyName = (
  transaction
) => {
  return (
    transaction?.property?.title ||
    "Property unavailable"
  );
};

const getRefundableAmount = (
  transaction
) => {
  const amount = Number(
    transaction?.amount || 0
  );

  const processedRefundAmount =
    Number(
      transaction
        ?.processedRefundAmount ||
        0
    );

  const pendingRefundAmount =
    Number(
      transaction
        ?.pendingRefundAmount ||
        0
    );

  return Math.max(
    amount -
      processedRefundAmount -
      pendingRefundAmount,
    0
  );
};

const canRefundTransaction = (
  transaction
) => {
  const refundableAmount =
    getRefundableAmount(
      transaction
    );

  const hasPendingRefund = (
    transaction?.refunds || []
  ).some((refund) => {
    return refund.status === "pending";
  });

  return (
    refundableAmount > 0 &&
    !hasPendingRefund &&
    [
      "paid",
      "partially_refunded",
      "refund_pending",
    ].includes(
      transaction?.paymentStatus
    ) &&
    [
      "cancelled",
      "refund_pending",
    ].includes(
      transaction?.bookingStatus
    )
  );
};

const escapeCsvValue = (value) => {
  const text = String(
    value ?? ""
  );

  return `"${text.replaceAll(
    '"',
    '""'
  )}"`;
};

function FinanceDashboard() {
  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const [
    summary,
    setSummary,
  ] = useState(null);

  const [
    transactions,
    setTransactions,
  ] = useState([]);

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
    refundTransactionId,
    setRefundTransactionId,
  ] = useState(null);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    paymentStatus,
    setPaymentStatus,
  ] = useState("all");

  const [
    dateFrom,
    setDateFrom,
  ] = useState("");

  const [
    dateTo,
    setDateTo,
  ] = useState("");

  const [
    sort,
    setSort,
  ] = useState("newest");

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    totalPages,
    setTotalPages,
  ] = useState(1);

  const [
    totalTransactions,
    setTotalTransactions,
  ] = useState(0);

  const backPath =
    dashboardRoutes[user?.role] ||
    "/";

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

  const loadFinanceData =
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

          const [
            summaryData,
            transactionData,
          ] = await Promise.all([
            getFinanceSummary({
              dateFrom,
              dateTo,
            }),

            getFinanceTransactions({
              search: search.trim(),
              paymentStatus,
              dateFrom,
              dateTo,
              sort,
              page: currentPage,
              limit: PAGE_SIZE,
            }),
          ]);

          setSummary(
            summaryData?.summary ||
              null
          );

          const returnedTransactions =
            transactionData
              ?.transactions || [];

          setTransactions(
            Array.isArray(
              returnedTransactions
            )
              ? returnedTransactions
              : []
          );

          const pagination =
            transactionData?.pagination ||
            {};

          const normalizedTotalPages =
            Math.max(
              Number(
                pagination.totalPages
              ) || 1,
              1
            );

          setTotalPages(
            normalizedTotalPages
          );

          setTotalTransactions(
            Number(
              pagination.totalTransactions
            ) || 0
          );

          if (
            currentPage >
            normalizedTotalPages
          ) {
            setCurrentPage(
              normalizedTotalPages
            );
          }
        } catch (error) {
          if (
            getErrorStatus(error) ===
            401
          ) {
            handleUnauthorized();
            return;
          }

          const message =
            getErrorMessage(
              error,
              "Unable to load finance information."
            );

          setLoadError(message);
          toast.error(message);
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        search,
        paymentStatus,
        dateFrom,
        dateTo,
        sort,
        currentPage,
        handleUnauthorized,
      ]
    );

  useEffect(() => {
    const delay =
      window.setTimeout(() => {
        loadFinanceData(true);
      }, 350);

    return () =>
      window.clearTimeout(delay);
  }, [loadFinanceData]);

  const paymentCounts =
    summary?.paymentCounts || {};

  const refundCounts =
    summary?.refundCounts || {};

  const summaryCards =
    useMemo(() => {
      return [
        {
          label: "Gross Revenue",

          value: formatCurrency(
            summary?.grossRevenue
          ),

          description: `${
            summary?.capturedPayments ||
            0
          } captured payments`,

          type: "gross",
        },

        {
          label: "Net Revenue",

          value: formatCurrency(
            summary?.netRevenue
          ),

          description:
            "After processed refunds",

          type: "net",
        },

        {
          label: "Refunded",

          value: formatCurrency(
            summary?.refundedAmount
          ),

          description: `${
            refundCounts.processed ||
            0
          } processed refunds`,

          type: "refunded",
        },

        {
          label: "Pending Refunds",

          value: formatCurrency(
            summary?.pendingRefundAmount
          ),

          description: `${
            refundCounts.pending ||
            0
          } waiting for processing`,

          type: "pending-refund",
        },
      ];
    }, [
      summary,
      refundCounts.pending,
      refundCounts.processed,
    ]);

  const changeFilter = (
    setter,
    value
  ) => {
    setter(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setPaymentStatus("all");
    setDateFrom("");
    setDateTo("");
    setSort("newest");
    setCurrentPage(1);
  };

  const handleRefund = async (
    transaction
  ) => {
    const transactionId =
      transaction?._id ||
      transaction?.bookingId;

    const refundableAmount =
      getRefundableAmount(
        transaction
      );

    if (
      !transactionId ||
      refundableAmount <= 0
    ) {
      toast.error(
        "This transaction does not have a refundable amount."
      );

      return;
    }

    const amountInput =
      window.prompt(
        `Enter refund amount. Maximum refundable amount is ${formatCurrency(
          refundableAmount
        )}:`,

        String(
          refundableAmount
        )
      );

    if (amountInput === null) {
      return;
    }

    const refundAmount =
      Number(amountInput);

    if (
      !Number.isFinite(
        refundAmount
      ) ||
      refundAmount <= 0 ||
      refundAmount >
        refundableAmount
    ) {
      toast.error(
        "Please enter a valid refund amount."
      );

      return;
    }

    const reason = window.prompt(
      "Enter the reason for this refund:",
      "Booking cancellation refund"
    );

    if (reason === null) {
      return;
    }

    if (!reason.trim()) {
      toast.error(
        "Refund reason is required."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Initiate a ${formatCurrency(
          refundAmount
        )} refund for ${
          transaction.bookingReference ||
          "this booking"
        }?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setRefundTransactionId(
        transactionId
      );

      const data =
        await initiatePaymentRefund(
          transactionId,
          {
            amount: refundAmount,
            reason: reason.trim(),
          }
        );

      toast.success(
        data?.message ||
          "Refund initiated successfully."
      );

      await loadFinanceData(
        false
      );
    } catch (error) {
      if (
        getErrorStatus(error) ===
        401
      ) {
        handleUnauthorized();
        return;
      }

      toast.error(
        getErrorMessage(
          error,
          "Unable to initiate the refund."
        )
      );
    } finally {
      setRefundTransactionId(
        null
      );
    }
  };

  const exportCurrentPage = () => {
    if (
      transactions.length === 0
    ) {
      toast.info(
        "There are no transactions on this page to export."
      );

      return;
    }

    const rows = [
      [
        "Booking Reference",
        "Customer",
        "Property",
        "Amount",
        "Payment Status",
        "Booking Status",
        "Razorpay Order ID",
        "Razorpay Payment ID",
        "Paid At",
        "Processed Refund",
        "Pending Refund",
      ],

      ...transactions.map(
        (transaction) => [
          transaction.bookingReference,
          getCustomerName(
            transaction
          ),
          getPropertyName(
            transaction
          ),
          transaction.amount,

          paymentStatusLabels[
            transaction.paymentStatus
          ] ||
            transaction.paymentStatus,

          transaction.bookingStatus,
          transaction.orderId,
          transaction.paymentId,
          transaction.paidAt || "",

          transaction.processedRefundAmount ||
            0,

          transaction.pendingRefundAmount ||
            0,
        ]
      ),
    ];

    const csvContent = rows
      .map((row) => {
        return row
          .map(escapeCsvValue)
          .join(",");
      })
      .join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const downloadUrl =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = downloadUrl;

    link.download =
      `hhs-transactions-page-${currentPage}.csv`;

    document.body.appendChild(
      link
    );

    link.click();
    link.remove();

    URL.revokeObjectURL(
      downloadUrl
    );

    toast.success(
      "Transaction report downloaded."
    );
  };

  if (loading) {
    return (
      <main className="finance-dashboard-page">
        <section className="finance-dashboard-state">
          <div className="finance-dashboard-spinner" />

          <h2>
            Loading finance dashboard
          </h2>

          <p>
            Please wait while payment
            information is prepared.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="finance-dashboard-page">
      <header className="finance-dashboard-header">
        <div>
          <Link
            className="finance-dashboard-back"
            to={backPath}
          >
            ← Back to dashboard
          </Link>

          <span>
            HHS Payment Operations
          </span>

          <h1>
            Finance Dashboard
          </h1>

          <p>
            Monitor Razorpay collections,
            revenue, refunds and booking
            transactions.
          </p>
        </div>

        <div className="finance-header-actions">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/finance/payout-accounts"
              )
            }
          >
            Payout Accounts
          </button>

          <button
            type="button"
            onClick={
              exportCurrentPage
            }
          >
            Export CSV
          </button>

          <button
            className="primary"
            type="button"
            disabled={refreshing}
            onClick={() =>
              loadFinanceData(false)
            }
          >
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>
      </header>

      <section className="finance-summary-grid">
        {summaryCards.map(
          (card) => (
            <article
              className={card.type}
              key={card.label}
            >
              <span>
                {card.label}
              </span>

              <strong>
                {card.value}
              </strong>

              <small>
                {card.description}
              </small>
            </article>
          )
        )}
      </section>

      <section className="finance-status-grid">
        <article>
          <span>
            Pending Payments
          </span>

          <strong>
            {paymentCounts.pending ||
              0}
          </strong>
        </article>

        <article>
          <span>
            Paid Payments
          </span>

          <strong>
            {paymentCounts.paid ||
              0}
          </strong>
        </article>

        <article>
          <span>
            Failed Payments
          </span>

          <strong>
            {paymentCounts.failed ||
              0}
          </strong>
        </article>

        <article>
          <span>
            Refund Pending
          </span>

          <strong>
            {paymentCounts.refund_pending ||
              0}
          </strong>
        </article>

        <article>
          <span>
            Refunded Payments
          </span>

          <strong>
            {paymentCounts.refunded ||
              0}
          </strong>
        </article>
      </section>

      <section className="finance-transactions-panel">
        <div className="finance-transactions-heading">
          <div>
            <h2>
              Payment Transactions
            </h2>

            <p>
              {totalTransactions} matching
              transactions
            </p>
          </div>
        </div>

        <div className="finance-filters">
          <div className="finance-search-filter">
            <label htmlFor="finance-search">
              Search
            </label>

            <input
              id="finance-search"
              type="search"
              placeholder="Reference, customer, order or payment ID"
              value={search}
              onChange={(event) =>
                changeFilter(
                  setSearch,
                  event.target.value
                )
              }
            />
          </div>

          <div>
            <label htmlFor="finance-payment-status">
              Payment status
            </label>

            <select
              id="finance-payment-status"
              value={paymentStatus}
              onChange={(event) =>
                changeFilter(
                  setPaymentStatus,
                  event.target.value
                )
              }
            >
              <option value="all">
                All statuses
              </option>

              {Object.entries(
                paymentStatusLabels
              ).map(
                ([
                  value,
                  label,
                ]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label htmlFor="finance-date-from">
              From date
            </label>

            <input
              id="finance-date-from"
              type="date"
              value={dateFrom}
              max={
                dateTo ||
                undefined
              }
              onChange={(event) =>
                changeFilter(
                  setDateFrom,
                  event.target.value
                )
              }
            />
          </div>

          <div>
            <label htmlFor="finance-date-to">
              To date
            </label>

            <input
              id="finance-date-to"
              type="date"
              value={dateTo}
              min={
                dateFrom ||
                undefined
              }
              onChange={(event) =>
                changeFilter(
                  setDateTo,
                  event.target.value
                )
              }
            />
          </div>

          <div>
            <label htmlFor="finance-sort">
              Sort
            </label>

            <select
              id="finance-sort"
              value={sort}
              onChange={(event) =>
                changeFilter(
                  setSort,
                  event.target.value
                )
              }
            >
              <option value="newest">
                Newest first
              </option>

              <option value="oldest">
                Oldest first
              </option>

              <option value="amountHigh">
                Amount high to low
              </option>

              <option value="amountLow">
                Amount low to high
              </option>
            </select>
          </div>

          <button
            className="finance-clear-filters"
            type="button"
            onClick={
              clearFilters
            }
          >
            Clear
          </button>
        </div>

        {loadError ? (
          <section className="finance-dashboard-state compact">
            <span>⚠️</span>

            <h2>
              Unable to load transactions
            </h2>

            <p>{loadError}</p>

            <button
              type="button"
              onClick={() =>
                loadFinanceData(
                  false
                )
              }
            >
              Try Again
            </button>
          </section>
        ) : transactions.length ===
          0 ? (
          <section className="finance-dashboard-state compact">
            <span>💳</span>

            <h2>
              No transactions found
            </h2>

            <p>
              Payment transactions will
              appear here after a Razorpay
              order is created.
            </p>
          </section>
        ) : (
          <div className="finance-table-wrapper">
            <table className="finance-transactions-table">
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Customer</th>
                  <th>Property</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Razorpay</th>
                  <th>Date</th>
                  <th>Refund</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map(
                  (
                    transaction
                  ) => {
                    const transactionId =
                      transaction._id ||
                      transaction.bookingId;

                    const refunding =
                      refundTransactionId ===
                      transactionId;

                    return (
                      <tr
                        key={
                          transactionId
                        }
                      >
                        <td>
                          <div className="finance-reference-cell">
                            <strong>
                              {transaction.bookingReference ||
                                "—"}
                            </strong>

                            <span>
                              {transaction.bookingStatus ||
                                "pending"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="finance-person-cell">
                            <strong>
                              {getCustomerName(
                                transaction
                              )}
                            </strong>

                            <span>
                              {getCustomerContact(
                                transaction
                              )}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="finance-property-cell">
                            <strong>
                              {getPropertyName(
                                transaction
                              )}
                            </strong>

                            <span>
                              {transaction
                                .property
                                ?.location
                                ?.city ||
                                transaction
                                  .property
                                  ?.propertyType ||
                                "—"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <strong className="finance-amount">
                            {formatCurrency(
                              transaction.amount
                            )}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={`finance-payment-status ${
                              transaction.paymentStatus ||
                              "pending"
                            }`}
                          >
                            {paymentStatusLabels[
                              transaction
                                .paymentStatus
                            ] ||
                              transaction.paymentStatus ||
                              "Pending"}
                          </span>
                        </td>

                        <td>
                          <div className="finance-razorpay-cell">
                            <span
                              title={
                                transaction.orderId
                              }
                            >
                              Order:{" "}
                              {transaction.orderId ||
                                "—"}
                            </span>

                            <span
                              title={
                                transaction.paymentId
                              }
                            >
                              Payment:{" "}
                              {transaction.paymentId ||
                                "—"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="finance-date-cell">
                            <strong>
                              {formatDate(
                                transaction.paidAt ||
                                  transaction.createdAt
                              )}
                            </strong>

                            <span>
                              {transaction.paidAt
                                ? `Paid ${formatDate(
                                    transaction.paidAt,
                                    true
                                  )}`
                                : "Not paid"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="finance-refund-cell">
                            <span>
                              Processed:{" "}
                              {formatCurrency(
                                transaction.processedRefundAmount
                              )}
                            </span>

                            <span>
                              Pending:{" "}
                              {formatCurrency(
                                transaction.pendingRefundAmount
                              )}
                            </span>
                          </div>
                        </td>

                        <td>
                          {canRefundTransaction(
                            transaction
                          ) ? (
                            <button
                              className="finance-refund-button"
                              type="button"
                              disabled={
                                refunding
                              }
                              onClick={() =>
                                handleRefund(
                                  transaction
                                )
                              }
                            >
                              {refunding
                                ? "Processing..."
                                : "Refund"}
                            </button>
                          ) : (
                            <span className="finance-no-action">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalTransactions > 0 && (
          <div className="finance-pagination">
            <button
              type="button"
              disabled={
                currentPage <= 1 ||
                refreshing
              }
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.max(
                      page - 1,
                      1
                    )
                )
              }
            >
              Previous
            </button>

            <span>
              Page{" "}
              <strong>
                {currentPage}
              </strong>{" "}
              of{" "}
              <strong>
                {totalPages}
              </strong>
            </span>

            <button
              type="button"
              disabled={
                currentPage >=
                  totalPages ||
                refreshing
              }
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.min(
                      page + 1,
                      totalPages
                    )
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

export default FinanceDashboard;