import { useCallback, useEffect, useState } from "react";

import {
  X,
  Eye,
  RefreshCw,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import {
  getAllInvoices,
  deleteLocalInvoice,
} from "./Services/invoiceStorage";

import type {
  StoredInvoice,
} from "./Services/invoiceStorage";

import InvoiceDetailsModal from "./Components/InvoiceDetailsModal";

// ------------------------------------
// PROPS
// ------------------------------------

interface SavedInvoicesProps {
  onClose: () => void;
}

// ------------------------------------
// HELPERS
// ------------------------------------

function getText(
  object: Record<string, unknown>,
  keys: string[]
): string {
  for (const key of keys) {
    const value = object[key];

    if (value !== undefined && value !== null) {
      return String(value);
    }
  }

  return "";
}

function getAmount(
  object: Record<string, unknown>,
  keys: string[]
): number {
  for (const key of keys) {
    const value = object[key];

    if (value !== undefined && value !== null && value !== "") {
      const number = Number(value);

      if (Number.isFinite(number)) {
        return number;
      }
    }
  }

  return 0;
}

// ------------------------------------
// ITEM TOTAL
// ------------------------------------

function getItemTotal(
  item: Record<string, unknown>
): number {
  const totalKeys = ["total", "amount", "totalPrice"];

  for (const key of totalKeys) {
    const value = item[key];

    if (value !== undefined && value !== null && value !== "") {
      const number = Number(value);

      if (Number.isFinite(number)) {
        return number;
      }
    }
  }

  const quantity = getAmount(item, ["quantity", "qty"]);
  const rate = getAmount(item, ["rate", "price", "unitPrice"]);

  return quantity * rate;
}

// ------------------------------------
// DATE FORMAT
// ------------------------------------

function formatDate(value: string): string {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN");
}

// ------------------------------------
// STATUS BADGE
// ------------------------------------

function SyncStatus({
  status,
}: {
  status: StoredInvoice["syncStatus"];
}) {
  switch (status) {
    case "synced":
      return (
        <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
          <CheckCircle2 size={13} />
          Synced
        </span>
      );

    case "failed":
      return (
        <span className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
          <AlertCircle size={13} />
          Failed
        </span>
      );

    default:
      return (
        <span className="flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
          <Clock size={13} />
          Pending
        </span>
      );
  }
}

// ------------------------------------
// MAIN COMPONENT
// ------------------------------------

export default function SavedInvoices({
  onClose,
}: SavedInvoicesProps) {
  const [invoices, setInvoices] = useState<StoredInvoice[]>([]);

  const [selectedInvoice, setSelectedInvoice] =
    useState<StoredInvoice | null>(null);

  const [loading, setLoading] = useState(true);

  const [deleting, setDeleting] = useState(false);

  // ------------------------------------
  // LOAD INVOICES
  // ------------------------------------

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getAllInvoices();

      const sorted = [...data].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

      setInvoices(sorted);

    } catch (error) {
      console.error("Failed to load invoices:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ------------------------------------
  // INITIAL LOAD
  // ------------------------------------

  useEffect(() => {
    void loadInvoices();
  }, [loadInvoices]);

  // ------------------------------------
  // SELECT INVOICE
  // ------------------------------------

  const handleViewInvoice = (record: StoredInvoice) => {
    setSelectedInvoice(record);
  };

  // ------------------------------------
  // BACK TO LIST
  // ------------------------------------

  const handleBackToList = () => {
    setSelectedInvoice(null);
  };

  // ------------------------------------
  // DELETE INVOICE
  // ------------------------------------

  const handleDeleteInvoice = async (record: StoredInvoice) => {
    try {
      setDeleting(true);

      await deleteLocalInvoice(record.localId);

      // Remove deleted invoice from list
      setInvoices((previous) =>
        previous.filter(
          (invoice) => invoice.localId !== record.localId
        )
      );

      // Close details modal
      setSelectedInvoice(null);

    } catch (error) {
      console.error("Failed to delete invoice:", error);

      window.alert(
        "Unable to delete invoice. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  // ------------------------------------
  // SHOW DETAILS MODAL
  // ------------------------------------

  if (selectedInvoice) {
    return (
      <InvoiceDetailsModal
        invoiceRecord={selectedInvoice}
        onClose={onClose}
        onBack={handleBackToList}
        onDelete={() => {
          if (!deleting) {
            void handleDeleteInvoice(selectedInvoice);
          }
        }}
      />
    );
  }

  // ------------------------------------
  // MAIN UI
  // ------------------------------------

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >

        {/* HEADER */}
        <div className="flex items-center justify-between border-b p-5">

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Saved Invoices
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Locally stored invoice records
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            title="Close"
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-black"
          >
            <X size={22} />
          </button>

        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* LOADING */}
          {loading ? (

            <div className="flex justify-center py-16">
              <RefreshCw
                size={24}
                className="animate-spin text-gray-500"
              />
            </div>

          ) : invoices.length === 0 ? (

            /* EMPTY STATE */
            <div className="py-16 text-center">

              <FileText
                size={45}
                className="mx-auto mb-3 text-gray-300"
              />

              <h3 className="font-semibold text-gray-700">
                No Saved Invoices
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Your saved invoices will appear here.
              </p>

            </div>

          ) : (

            /* INVOICE LIST */
            <div className="space-y-3">

              {/* LIST HEADER */}
              <div className="mb-4 flex items-center justify-between">

                <p className="text-sm font-semibold text-gray-700">
                  Total Invoices: {invoices.length}
                </p>

                <button
                  type="button"
                  onClick={() => void loadInvoices()}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition hover:bg-gray-100 disabled:opacity-50"
                >
                  <RefreshCw
                    size={14}
                    className={loading ? "animate-spin" : ""}
                  />
                  Refresh
                </button>

              </div>

              {/* INVOICE CARDS */}
              {invoices.map((record) => {
                const invoice = record.invoice as Record<
                  string,
                  unknown
                >;

                const items = (record.items || []) as Record<
                  string,
                  unknown
                >[];

                const subtotal = items.reduce(
                  (sum, item) => sum + getItemTotal(item),
                  0
                );

                const discount = getAmount(invoice, ["discount"]);

                const grandTotal = Math.max(
                  0,
                  subtotal - discount
                );

                return (
                  <div
                    key={record.localId}
                    className="flex flex-col gap-4 rounded-xl border p-4 transition hover:border-gray-400 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                  >

                    {/* INVOICE INFORMATION */}
                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="font-bold text-gray-900">
                          {record.invoiceNo}
                        </h3>

                        <SyncStatus status={record.syncStatus} />

                      </div>

                      <p className="mt-1 text-sm text-gray-600">
                        {getText(invoice, [
                          "customer",
                          "customerName",
                        ]) || "Unknown Customer"}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {getText(invoice, ["date"]) || "-"} ·{" "}
                        {items.length} item(s)
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Created: {formatDate(record.createdAt)}
                      </p>

                    </div>

                    {/* AMOUNT + VIEW */}
                    <div className="flex items-center justify-between gap-4 sm:justify-end">

                      <p className="font-bold text-gray-900">
                        ₹{grandTotal.toFixed(2)}
                      </p>

                      <button
                        type="button"
                        onClick={() => handleViewInvoice(record)}
                        className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                      >
                        <Eye size={16} />
                        View
                      </button>

                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </div>

      </div>
    </div>
  );
}