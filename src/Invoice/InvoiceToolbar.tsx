import InvoiceSyncBar from "./InvoiceSyncBar";
import InvoiceActions from "./InvoiceActions";
import type { InvoiceItem } from "./Tools/Components/InvoiceItemsSettings";

interface InvoiceToolbarProps {
  invoice: Record<string, string>;
  items: InvoiceItem[];
  onNewInvoice: () => void;
}

export default function InvoiceToolbar({
  invoice,
  items,
  onNewInvoice,
}: InvoiceToolbarProps) {
  return (
    <div className="sticky top-0 z-40 w-full bg-gray-50 pb-2 pt-2">

      <div className="flex w-full flex-col items-stretch justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center">

        {/* LEFT: SYNC BAR */}
        <div className="w-full lg:flex-1">
          <InvoiceSyncBar
            invoice={invoice}
            items={items}
          />
        </div>

        {/* RIGHT: INVOICE ACTIONS */}
        <div className="flex w-full items-center justify-start lg:w-auto lg:justify-end">
          <InvoiceActions
            invoiceNo={invoice.invoiceNo}
            onNewInvoice={onNewInvoice}
          />
        </div>

      </div>

    </div>
  );
}