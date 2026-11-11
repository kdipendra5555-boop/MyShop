import { useState } from "react";

import Invoice from "./Template/Invoice";
import InvoiceSettings from "./Tools/InvoiceSettings";
import InvoiceToolbar from "./InvoiceToolbar";

import type { InvoiceItem } from "./Tools/Components/InvoiceItemsSettings";

const INITIAL_INVOICE = {
  invoiceNo: "DP/2026/01567",
  date: "14 Mar 2026",
  paymentMode: "Prepaid",
  customer: "SHAIK NOOR",
  phone: "+91 94920 77215",
  email: "hello@dotprint.in",
  address: "",
  whatsapp: "",
  advance: "0",
  due: "0",
  discount: "0",
};

export default function InvoiceLayout() {
  const [invoice, setInvoice] = useState(INITIAL_INVOICE);

  const [items, setItems] = useState<InvoiceItem[]>([]);

  // QR CODE STATE
  const [qrValue, setQrValue] = useState("");
  const [qrSize, setQrSize] = useState(120);
  const [showQR, setShowQR] = useState(true);

  // ------------------------------------
  // INVOICE FIELD CHANGE
  // ------------------------------------

  const handleChange = (key: string, value: string) => {
    setInvoice((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ------------------------------------
  // INVOICE ITEMS CHANGE
  // ------------------------------------

  const handleItemsChange = (updatedItems: InvoiceItem[]) => {
    setItems(updatedItems);
  };

  // ------------------------------------
  // GENERATE NEXT INVOICE NUMBER
  // ------------------------------------

  const generateNextInvoiceNumber = () => {
    const currentInvoiceNo = invoice.invoiceNo.trim();

    // Format: DP/2026/01567
    const match = currentInvoiceNo.match(/^(.+\/)(\d+)$/);

    if (!match) {
      throw new Error(
        "Invalid invoice number. Example: DP/2026/01567"
      );
    }

    const prefix = match[1];
    const numberPart = match[2];

    const currentNumber = Number(numberPart);

    if (!Number.isSafeInteger(currentNumber)) {
      throw new Error("Invalid invoice number.");
    }

    // Increment from manually entered number
    const nextNumber = currentNumber + 1;

    // Save counter locally
    const storageKey = `dotprint_invoice_counter_${prefix}`;

    localStorage.setItem(
      storageKey,
      String(nextNumber)
    );

    // Preserve leading zeros
    return `${prefix}${String(nextNumber).padStart(
      numberPart.length,
      "0"
    )}`;
  };

  // ------------------------------------
  // NEW INVOICE
  // ------------------------------------

  const handleNewInvoice = () => {
    const confirmed = window.confirm(
      "Create a new invoice? Please save your current invoice before continuing."
    );

    if (!confirmed) return;

    try {
      // Generate number from current/manual invoice number
      const nextInvoiceNo = generateNextInvoiceNumber();

      const today = new Date().toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );

      // Reset invoice fields
      setInvoice({
        ...INITIAL_INVOICE,
        invoiceNo: nextInvoiceNo,
        date: today,
        customer: "",
        phone: "",
        email: "",
        address: "",
        whatsapp: "",
        advance: "0",
        due: "0",
        discount: "0",
      });

      // Reset invoice items
      setItems([]);

      // Reset QR settings
      setQrValue("");
      setQrSize(150);
      setShowQR(true);

    } catch (error) {
      console.error("New invoice creation failed:", error);

      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to create a new invoice."
      );
    }
  };

  // ------------------------------------
  // UI
  // ------------------------------------

  return (
    <div className="min-h-screen w-full bg-gray-100 p-4 sm:p-6">

      <div className="mx-auto w-full max-w-[1800px]">

        {/* INVOICE TOOLBAR */}

        <InvoiceToolbar
          invoice={invoice}
          items={items}
          onNewInvoice={handleNewInvoice}
        />

        {/* MAIN CONTENT: 50% + 50% */}

        <div className="grid w-full grid-cols-1 items-start gap-6 lg:grid-cols-2">

          {/* LEFT: INVOICE PREVIEW */}

          <div className="flex w-full min-w-0 justify-center">
            <div className="w-full min-w-0">

              <Invoice
                invoice={invoice}
                items={items}
                qrValue={qrValue}
                qrSize={qrSize}
                showQR={showQR}
              />

            </div>
          </div>

          {/* RIGHT: INVOICE SETTINGS */}

          <div className="w-full min-w-0">

            <InvoiceSettings
              invoice={invoice}
              onChange={handleChange}
              items={items}
              onItemsChange={handleItemsChange}
              qrValue={qrValue}
              onQRValueChange={setQrValue}
              qrSize={qrSize}
              onQRSizeChange={setQrSize}
              showQR={showQR}
              onShowQRChange={setShowQR}
            />

          </div>

        </div>

      </div>

    </div>
  );
}