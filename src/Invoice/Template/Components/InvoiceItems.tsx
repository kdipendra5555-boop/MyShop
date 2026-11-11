// ==========================================
// TYPES
// ==========================================

export interface InvoiceItem {
  id: number;
  name: string;
  description: string;
  quantity: number;
  rate: number;
}

interface InvoiceItemsProps {
  items?: InvoiceItem[];
  discount?: number;
}

// ==========================================
// INVOICE ITEMS + TOTALS COMPONENT
// ==========================================

export default function InvoiceItems({
  items = [],
  discount = 0,
}: InvoiceItemsProps) {

  // ========================================
  // SAFE ITEMS
  // ========================================

  const invoiceItems = Array.isArray(items) ? items : [];

  // ========================================
  // CALCULATIONS
  // ========================================

  const subtotal = invoiceItems.reduce(
    (total, item) =>
      total + (Number(item.quantity) || 0) * (Number(item.rate) || 0),
    0
  );

  // Discount cannot exceed subtotal
  const discountAmount = Math.min(
    subtotal,
    Math.max(0, Number(discount) || 0)
  );

  const grandTotal = subtotal - discountAmount;

  // ========================================
  // CURRENCY FORMAT
  // ========================================

  const formatCurrency = (amount: number) =>
    `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // ========================================
  // JSX
  // ========================================

  return (
    <div className="py-5">

      {/* =====================================
          1. INVOICE ITEMS TABLE
      ====================================== */}

      <table className="w-full text-xs border-collapse">

        {/* TABLE HEADER */}
        <thead>
          <tr className="border-y border-black">
            <th className="p-2 text-left">No</th>
            <th className="p-2 text-left">Description</th>
            <th className="p-2 text-center">Qty</th>
            <th className="p-2 text-right">Rate</th>
            <th className="p-2 text-right">Amount</th>
          </tr>
        </thead>

        {/* TABLE BODY */}
        <tbody>
          {invoiceItems.map((item, index) => {

            const quantity = Number(item.quantity) || 0;
            const rate = Number(item.rate) || 0;
            const amount = quantity * rate;

            return (
              <tr
                key={item.id ?? index}
                className="border-b border-gray-300"
              >
                <td className="p-2">
                  {index + 1}
                </td>

                <td className="p-2">
                  <b>{item.name}</b>

                  {item.description && (
                    <p className="text-gray-600 mt-1">
                      {item.description}
                    </p>
                  )}
                </td>

                <td className="p-2 text-center">
                  {quantity}
                </td>

                <td className="p-2 text-right">
                  {formatCurrency(rate)}
                </td>

                <td className="p-2 text-right">
                  {formatCurrency(amount)}
                </td>
              </tr>
            );
          })}

          {/* EMPTY STATE */}
          {invoiceItems.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="p-6 text-center text-gray-400"
              >
                No items added to this invoice.
              </td>
            </tr>
          )}
        </tbody>

      </table>

      {/* =====================================
          2. INVOICE TOTALS
      ====================================== */}

      <div className="flex justify-end py-5 border-b">

        <div className="w-1/2 text-sm space-y-2">

          {/* SUBTOTAL */}
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          {/* DISCOUNT */}
          <div className="flex justify-between">
            <span>Discount:</span>
            <span>-{formatCurrency(discountAmount)}</span>
          </div>

          {/* GRAND TOTAL */}
          <div className="flex justify-between font-bold border-t pt-2">
            <span>Grand Total:</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>

        </div>

      </div>

    </div>
  );
}