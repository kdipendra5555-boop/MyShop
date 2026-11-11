import InvoiceHeader from "./Components/InvoiceHeader";
import CustomerDetails from "./Components/CustomerDetails";
import InvoiceQR from "./Components/InvoiceQR";
import InvoiceItems, {
  type InvoiceItem,
} from "./Components/InvoiceItems";
import InvoiceFooter from "./Components/InvoiceFooter";
import InvoiceContactInfo from "./Components/InvoiceContactInfo";

interface InvoiceProps {
  invoice: {
    invoiceNo: string;
    date: string;
    paymentMode: string;
    advance: string;
    customer: string;
    address: string;
    phone: string;
    whatsapp: string;
    discount: string;
  };

  items?: InvoiceItem[];

  // QR CODE SETTINGS
  qrValue?: string;
  qrSize?: number;
  showQR?: boolean;
}

export default function Invoice({
  invoice,
  items = [],
  qrValue = "",
  qrSize = 150,
  showQR = true,
}: InvoiceProps) {
  const invoiceItems = Array.isArray(items) ? items : [];

  // SAFE QR SETTINGS
  const safeQRValue =
    typeof qrValue === "string" ? qrValue.trim() : "";

  const safeQRSize =
    Number.isFinite(Number(qrSize)) && Number(qrSize) > 0
      ? Number(qrSize)
      : 150;

  // SUBTOTAL
  const subtotal = invoiceItems.reduce(
    (sum, item) =>
      sum +
      (Number(item.quantity) || 0) *
        (Number(item.rate) || 0),
    0
  );

  // DISCOUNT
  const discount = Math.max(
    0,
    Number(invoice.discount) || 0
  );

  const finalDiscount = Math.min(discount, subtotal);

  // GRAND TOTAL
  const grandTotal = Math.max(0, subtotal - finalDiscount);

  // ADVANCE & DUE
  const advance = Math.max(
    0,
    Number(invoice.advance) || 0
  );

  const due = Math.max(0, grandTotal - advance);

  return (
    <div
      id="invoice-print-area"
      className="relative bg-white w-full max-w-[650px] min-h-[850px] border-2 border-black box-border shadow-md px-4 pt-2 pb-4"
    >
      {/* INVOICE HEADER + INVOICE INFO */}
      <div className="-mt-2">
        <InvoiceHeader
          invoice={invoice}
          items={invoiceItems}
          discount={String(finalDiscount)}
        />
      </div>

      {/* CONTACT INFORMATION */}
      <InvoiceContactInfo />

      {/* CUSTOMER DETAILS + QR CODE */}
      <div className="grid grid-cols-2 gap-4 py-5 border-b">
        <CustomerDetails
          customer={invoice.customer}
          address={invoice.address}
          phone={invoice.phone}
          whatsapp={invoice.whatsapp}
        />

        <InvoiceQR
          qrValue={safeQRValue}
          qrSize={safeQRSize}
          showQR={showQR}
        />
      </div>

      {/* INVOICE ITEMS + TOTALS */}
      <InvoiceItems
        items={invoiceItems}
        discount={finalDiscount}
      />

      {/* INVOICE FOOTER + DUE PAYMENT QR */}
      <InvoiceFooter
        advance={advance}
        due={due}
        invoiceNo={invoice.invoiceNo}
      />
    </div>
  );
}