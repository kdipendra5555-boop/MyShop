import {
  getPendingInvoices,
  updateSyncStatus,
} from "./invoiceStorage";

import { GOOGLE_SCRIPT_URL } from "./syncConfig";

import type { StoredInvoice } from "./invoiceStorage";

// ------------------------------------
// TYPES
// ------------------------------------

interface InvoiceProduct {
  [key: string]: unknown;
}

interface GoogleSheetsResponse {
  success?: boolean;
  message?: string;
  duplicate?: boolean;
}

interface SyncResult {
  total: number;
  synced: number;
  failed: number;
}

interface PreparedInvoice {
  invoiceNo: string;
  date: string;
  paymentMode: string;
  customer: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  items: string;
  discount: number;
  advance: number;
  due: number;
  subtotal: number;
  grandTotal: number;
}

// ------------------------------------
// HELPER: SAFE STRING
// ------------------------------------

function getValue(
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

// ------------------------------------
// HELPER: SAFE NUMBER
// ------------------------------------

function getNumber(
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
// CALCULATE ITEM TOTAL
// ------------------------------------

function calculateItemTotal(
  product: InvoiceProduct
): number {
  const quantity = getNumber(product, [
    "quantity",
    "qty",
  ]);

  const rate = getNumber(product, [
    "rate",
    "price",
    "unitPrice",
  ]);

  // If an explicit total exists, use it.
  const existingTotal = getNumber(product, [
    "total",
    "amount",
    "totalPrice",
  ]);

  if (
    product.total !== undefined ||
    product.amount !== undefined ||
    product.totalPrice !== undefined
  ) {
    return existingTotal;
  }

  // Otherwise calculate quantity × rate.
  return quantity * rate;
}

// ------------------------------------
// FORMAT INVOICE ITEMS
// ------------------------------------

function formatItems(items: unknown[]): string {
  return items.map((item) => {
    const product = item as InvoiceProduct;

    const name = getValue(product, [
      "name",
      "itemName",
      "productName",
      "title",
    ]);

    const description = getValue(product, [
      "description",
    ]);

    const quantity = getNumber(product, [
      "quantity",
      "qty",
    ]);

    const rate = getNumber(product, [
      "rate",
      "price",
      "unitPrice",
    ]);

    const total = calculateItemTotal(product);

    return [
      name,
      description ? `(${description})` : "",
      `${quantity} × ₹${rate} = ₹${total}`,
    ]
      .filter(Boolean)
      .join(" ");
  }).join(", ");
}

// ------------------------------------
// PREPARE INVOICE DATA
// ------------------------------------

function prepareInvoiceData(
  storedInvoice: StoredInvoice
): PreparedInvoice {
  const invoice = storedInvoice.invoice as Record<
    string,
    unknown
  >;

  const items = (storedInvoice.items || []) as unknown[];

  // Calculate subtotal from quantity × rate.
  const subtotal = items.reduce<number>(
    (sum, item) => {
      const product = item as InvoiceProduct;

      return sum + calculateItemTotal(product);
    },
    0
  );

  const discount = getNumber(invoice, [
    "discount",
  ]);

  const advance = getNumber(invoice, [
    "advance",
  ]);

  // Grand Total = Subtotal - Discount
  const grandTotal = Math.max(
    0,
    subtotal - discount
  );

  // Due = Grand Total - Advance
  const due = Math.max(
    0,
    grandTotal - advance
  );

  return {
    invoiceNo:
      getValue(invoice, ["invoiceNo"]) ||
      storedInvoice.invoiceNo,

    date: getValue(invoice, ["date"]),

    paymentMode: getValue(invoice, [
      "paymentMode",
    ]),

    customer: getValue(invoice, [
      "customer",
      "customerName",
    ]),

    phone: getValue(invoice, [
      "phone",
    ]),

    email: getValue(invoice, [
      "email",
    ]),

    whatsapp: getValue(invoice, [
      "whatsapp",
    ]),

    address: getValue(invoice, [
      "address",
    ]),

    items: formatItems(items),

    discount,
    advance,
    due,
    subtotal,
    grandTotal,
  };
}

// ------------------------------------
// SYNC SINGLE INVOICE
// ------------------------------------

async function syncSingleInvoice(
  storedInvoice: StoredInvoice
): Promise<boolean> {
  try {
    const invoiceData = prepareInvoiceData(storedInvoice);

    console.log(
      "Sending invoice to Google Sheets:",
      invoiceData
    );

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(invoiceData),
    });

    const responseText = await response.text();

    console.log(
      "Google Apps Script response:",
      responseText
    );

    if (!response.ok) {
      throw new Error(
        `HTTP Error ${response.status}: ${responseText}`
      );
    }

    let result: GoogleSheetsResponse;

    try {
      result = JSON.parse(responseText) as GoogleSheetsResponse;
    } catch {
      throw new Error(
        `Invalid JSON response: ${responseText.slice(0, 300)}`
      );
    }

    if (result.success !== true) {
      throw new Error(
        result.message || "Google Sheets rejected the invoice."
      );
    }

    await updateSyncStatus(
      storedInvoice.localId,
      "synced"
    );

    console.log(
      `Invoice ${storedInvoice.invoiceNo} synced successfully.`
    );

    return true;

  } catch (error) {
    console.error(
      `Invoice ${storedInvoice.invoiceNo} sync failed:`,
      error
    );

    try {
      await updateSyncStatus(
        storedInvoice.localId,
        "failed"
      );
    } catch (dbError) {
      console.error(
        "Failed to update local invoice status:",
        dbError
      );
    }

    return false;
  }
}

// ------------------------------------
// SYNC ALL PENDING INVOICES
// ------------------------------------

export async function syncPendingInvoices(): Promise<SyncResult> {
  if (!navigator.onLine) {
    throw new Error(
      "Internet connection is unavailable."
    );
  }

  const pendingInvoices = await getPendingInvoices();

  const result: SyncResult = {
    total: pendingInvoices.length,
    synced: 0,
    failed: 0,
  };

  for (const invoice of pendingInvoices) {
    const success = await syncSingleInvoice(invoice);

    if (success) {
      result.synced++;
    } else {
      result.failed++;
    }
  }

  return result;
}