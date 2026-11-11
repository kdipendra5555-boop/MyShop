import InvoiceInfoSettings from "./Components/InvoiceInfoSettings";
import CustomerDetailsSettings from "./Components/CustomerDetailsSettings";
import QRCodeSettings from "./Components/QRCodeSettings";

import InvoiceItemsSettings, {
  type InvoiceItem,
} from "./Components/InvoiceItemsSettings";

// ==========================================
// TYPES
// ==========================================

interface InvoiceSettingsProps {
  invoice: {
    invoiceNo: string;
    date: string;
    paymentMode: string;
    advance: string;
    due: string;
    discount: string;

    // Customer Details
    customer: string;
    address: string;
    phone: string;
    whatsapp: string;
    email: string;
  };

  onChange: (key: string, value: string) => void;

  items: InvoiceItem[];

  onItemsChange: (items: InvoiceItem[]) => void;

  // QR Code Settings
  qrValue: string;
  onQRValueChange: (value: string) => void;

  qrSize: number;
  onQRSizeChange: (size: number) => void;

  showQR: boolean;
  onShowQRChange: (show: boolean) => void;
}

// ==========================================
// MAIN SETTINGS COMPONENT
// ==========================================

export default function InvoiceSettings({
  invoice,
  onChange,
  items,
  onItemsChange,

  // QR Props
  qrValue,
  onQRValueChange,
  qrSize,
  onQRSizeChange,
  showQR,
  onShowQRChange,
}: InvoiceSettingsProps) {
  return (
    <div className="min-h-full bg-white">

      {/* SETTINGS HEADER */}
      <div className="sticky top-0 z-10 border-b bg-white px-6 py-4">
        <h2 className="text-lg font-bold">
          Invoice Settings
        </h2>

        <p className="text-xs text-gray-500">
          Customize your invoice
        </p>
      </div>

      <div className="space-y-7 p-6">

        {/* 1. INVOICE INFORMATION */}
        <InvoiceInfoSettings
          invoice={invoice}
          onChange={onChange}
        />

        <hr />

        {/* 2. CUSTOMER DETAILS */}
        <CustomerDetailsSettings
          invoice={{
            customer: invoice.customer,
            address: invoice.address,
            phone: invoice.phone,
            whatsapp: invoice.whatsapp,
          }}
          onChange={onChange}
        />

        <hr />

        {/* 3. INVOICE ITEMS */}
        <InvoiceItemsSettings
          items={items}
          onChange={onItemsChange}
        />

        <hr />

        {/* 4. DISCOUNT SETTINGS */}
        <section>
          <div className="mb-4">
            <h3 className="text-sm font-bold">
              Discount Settings
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              Apply a flat discount to your invoice.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium">
              Discount Amount (₹)
            </label>

            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                ₹
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={invoice.discount}
                onChange={(e) =>
                  onChange("discount", e.target.value)
                }
                placeholder="Enter discount amount"
                className="w-full border py-3 pl-8 pr-3 text-sm outline-none focus:border-black"
              />
            </div>

            <p className="mt-2 text-xs text-gray-400">
              Discount will be deducted from the invoice subtotal.
            </p>
          </div>
        </section>

        <hr />

        {/* 5. QR CODE SETTINGS */}
        <QRCodeSettings
          qrValue={qrValue}
          onQRValueChange={onQRValueChange}
          qrSize={qrSize}
          onQRSizeChange={onQRSizeChange}
          showQR={showQR}
          onShowQRChange={onShowQRChange}
        />

      </div>
    </div>
  );
}