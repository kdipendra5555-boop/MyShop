// ================= TYPES =================
interface InvoiceInfoSettingsProps {
  invoice: {
    invoiceNo: string;
    date: string;
    paymentMode: string;
    advance: string;
    due: string;
  };

  onChange: (key: string, value: string) => void;
}

// ================= MAIN COMPONENT =================
export default function InvoiceInfoSettings({
  invoice,
  onChange,
}: InvoiceInfoSettingsProps) {
  return (
    <section className="space-y-4">

      {/* ================= SECTION HEADER ================= */}
      <div>
        <h3 className="text-sm font-semibold">
          Invoice Information
        </h3>

        <p className="text-xs text-gray-500 mt-1">
          Manage invoice number, date and payment details.
        </p>
      </div>

      {/* ================= INVOICE NUMBER ================= */}
      <div>
        <label className="text-xs font-medium">
          Invoice Number
        </label>

        <input
          type="text"
          value={invoice.invoiceNo}
          onChange={(e) =>
            onChange("invoiceNo", e.target.value)
          }
          className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm outline-none focus:border-black"
          placeholder="DP/2026/0001"
        />
      </div>

      {/* ================= INVOICE DATE ================= */}
      <div>
        <label className="text-xs font-medium">
          Invoice Date
        </label>

        <input
          type="text"
          value={invoice.date}
          onChange={(e) =>
            onChange("date", e.target.value)
          }
          className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm outline-none focus:border-black"
          placeholder="09 Nov 2026"
        />
      </div>

      {/* ================= PAYMENT MODE ================= */}
      <div>
        <label className="text-xs font-medium">
          Payment Mode
        </label>

        <select
          value={invoice.paymentMode}
          onChange={(e) =>
            onChange("paymentMode", e.target.value)
          }
          className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm bg-white outline-none focus:border-black"
        >
          <option value="Prepaid">Prepaid</option>
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Credit">Credit</option>
        </select>
      </div>

      {/* ================= ADVANCE AMOUNT ================= */}
      <div>
        <label className="text-xs font-medium">
          Advance Amount (₹)
        </label>

        <input
          type="number"
          min="0"
          value={invoice.advance}
          onChange={(e) =>
            onChange("advance", e.target.value)
          }
          className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm outline-none focus:border-black"
          placeholder="0"
        />
      </div>

      {/* ================= DUE AMOUNT ================= */}
      <div>
        <label className="text-xs font-medium">
          Due Amount (₹)
        </label>

        <input
          type="number"
          min="0"
          value={invoice.due}
          onChange={(e) =>
            onChange("due", e.target.value)
          }
          className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm outline-none focus:border-black"
          placeholder="0"
        />
      </div>

    </section>
  );
}