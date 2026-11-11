import {
  X,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
} from "lucide-react";

import type { StoredInvoice } from "../Services/invoiceStorage";

interface InvoiceDetailsModalProps {
  invoiceRecord: StoredInvoice;
  onClose: () => void;
  onBack: () => void;
  onDelete: () => void;
}

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

      if (Number.isFinite(number)) return number;
    }
  }

  return 0;
}

function getItemTotal(item: Record<string, unknown>) {
  const quantity = getAmount(item, ["quantity", "qty"]);
  const rate = getAmount(item, ["rate", "price", "unitPrice"]);

  const existingTotal = getAmount(item, [
    "total",
    "amount",
    "totalPrice",
  ]);

  if (
    item.total !== undefined ||
    item.amount !== undefined ||
    item.totalPrice !== undefined
  ) {
    return existingTotal;
  }

  return quantity * rate;
}

function formatDate(value: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN");
}

export default function InvoiceDetailsModal({
  invoiceRecord,
  onClose,
  onBack,
  onDelete,
}: InvoiceDetailsModalProps) {
  const invoice = invoiceRecord.invoice as Record<string, unknown>;

  const items = (invoiceRecord.items || []) as Record<
    string,
    unknown
  >[];

  const subtotal = items.reduce(
    (sum, item) => sum + getItemTotal(item),
    0
  );

  const discount = getAmount(invoice, ["discount"]);
  const advance = getAmount(invoice, ["advance"]);

  const grandTotal = Math.max(0, subtotal - discount);
  const due = Math.max(0, grandTotal - advance);

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete invoice ${invoiceRecord.invoiceNo}?`
    );

    if (confirmed) {
      onDelete();
    }
  };

  const getStatus = () => {
    switch (invoiceRecord.syncStatus) {
      case "synced":
        return (
          <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
            <CheckCircle2 size={14} />
            Synced
          </span>
        );

      case "failed":
        return (
          <span className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
            <AlertCircle size={14} />
            Failed
          </span>
        );

      default:
        return (
          <span className="flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
            <Clock size={14} />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3 sm:p-6">

      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b p-5">

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Invoice Details
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {invoiceRecord.invoiceNo}
            </p>
          </div>

          {/* HEADER ACTIONS */}
          <div className="flex items-center gap-2">

            {/* DELETE BUTTON */}
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
              title="Delete Invoice"
            >
              <Trash2 size={17} />
              <span className="hidden sm:inline">Delete</span>
            </button>

            {/* CLOSE BUTTON */}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-black"
              title="Close"
            >
              <X size={22} />
            </button>

          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5">

          {/* BACK BUTTON */}
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-gray-100"
          >
            <ArrowLeft size={16} />
            Back to Invoices
          </button>

          {/* CUSTOMER INFORMATION */}
          <div className="grid grid-cols-1 gap-4 rounded-xl border bg-gray-50 p-4 sm:grid-cols-2">

            <div>
              <p className="text-xs text-gray-500">Invoice Number</p>
              <p className="font-semibold">{invoiceRecord.invoiceNo}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Invoice Date</p>
              <p className="font-semibold">
                {getText(invoice, ["date"]) || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Customer</p>
              <p className="font-semibold">
                {getText(invoice, ["customer", "customerName"]) || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="font-semibold">
                {getText(invoice, ["phone"]) || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-semibold">
                {getText(invoice, ["email"]) || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Payment Mode</p>
              <p className="font-semibold">
                {getText(invoice, ["paymentMode"]) || "-"}
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-xs text-gray-500">Address</p>
              <p className="font-semibold">
                {getText(invoice, ["address"]) || "-"}
              </p>
            </div>

          </div>

          {/* ITEMS TABLE */}
          <div>
            <h3 className="mb-3 font-semibold text-gray-900">
              Invoice Items
            </h3>

            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[550px] text-sm">

                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Item</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Rate</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-t">

                      <td className="p-3">
                        <p className="font-medium">
                          {getText(item, [
                            "name",
                            "itemName",
                            "productName",
                            "title",
                          ]) || "-"}
                        </p>

                        <p className="text-xs text-gray-500">
                          {getText(item, ["description"])}
                        </p>
                      </td>

                      <td className="p-3 text-center">
                        {getAmount(item, ["quantity", "qty"])}
                      </td>

                      <td className="p-3 text-right">
                        ₹
                        {getAmount(item, [
                          "rate",
                          "price",
                          "unitPrice",
                        ]).toFixed(2)}
                      </td>

                      <td className="p-3 text-right font-semibold">
                        ₹{getItemTotal(item).toFixed(2)}
                      </td>

                    </tr>
                  ))}

                  {items.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-5 text-center text-gray-500"
                      >
                        No items found.
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>
          </div>

          {/* TOTALS */}
          <div className="ml-auto max-w-sm space-y-3 rounded-xl border p-4">

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Discount</span>
              <span>₹{discount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between border-t pt-3 font-bold">
              <span>Grand Total</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Advance</span>
              <span>₹{advance.toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-bold text-red-600">
              <span>Due</span>
              <span>₹{due.toFixed(2)}</span>
            </div>

          </div>

          {/* SYNC INFORMATION */}
          <div className="rounded-xl bg-gray-50 p-4">

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-gray-500">
                Sync Status
              </span>

              {getStatus()}
            </div>

            <p className="mt-3 text-xs text-gray-500">
              Created: {formatDate(invoiceRecord.createdAt)}
            </p>

            {invoiceRecord.syncedAt && (
              <p className="mt-1 text-xs text-gray-500">
                Synced: {formatDate(invoiceRecord.syncedAt)}
              </p>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}