import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import type { InvoiceItem } from "../../Template/Components/InvoiceItems";

export type InvoiceItemForm = Omit<InvoiceItem, "id">;

interface InvoiceItemModalProps {
  isOpen: boolean;
  item: InvoiceItem | null;
  onClose: () => void;
  onSave: (form: InvoiceItemForm) => void;
}

const emptyForm: InvoiceItemForm = {
  name: "",
  description: "",
  quantity: 1,
  rate: 0,
};

export default function InvoiceItemModal({
  isOpen,
  item,
  onClose,
  onSave,
}: InvoiceItemModalProps) {
  const [form, setForm] = useState<InvoiceItemForm>(emptyForm);

  useEffect(() => {
    if (!isOpen) return;

    setForm(
      item
        ? {
            name: item.name ?? "",
            description: item.description ?? "",
            quantity: Number(item.quantity) || 1,
            rate: Number(item.rate) || 0,
          }
        : { ...emptyForm }
    );
  }, [isOpen, item]);

  if (!isOpen) return null;

  const quantity = Number(form.quantity);
  const rate = Number(form.rate);

  const isValid =
    form.name.trim().length > 0 &&
    Number.isFinite(quantity) &&
    quantity > 0 &&
    Number.isFinite(rate) &&
    rate >= 0;

  const updateField = <K extends keyof InvoiceItemForm>(
    key: K,
    value: InvoiceItemForm[K]
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValid) return;

    onSave({
      name: form.name.trim(),
      description: form.description.trim(),
      quantity,
      rate,
    });
  };

  const formatCurrency = (amount: number) =>
    `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md overflow-hidden bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h3 className="text-base font-bold">
              {item ? "Update Item" : "Add Invoice Item"}
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              Enter product or service details.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-black"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="space-y-4 p-5">

          {/* ITEM NAME */}
          <div>
            <label className="text-xs font-medium">
              Item Name *
            </label>

            <input
              autoFocus
              required
              type="text"
              value={form.name}
              onChange={(e) =>
                updateField("name", e.target.value)
              }
              placeholder="e.g. Visiting Card Printing"
              className="mt-2 w-full border p-3 text-sm outline-none focus:border-black"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-xs font-medium">
              Description
            </label>

            <textarea
              value={form.description}
              onChange={(e) =>
                updateField("description", e.target.value)
              }
              placeholder="Paper, GSM, size, etc."
              rows={2}
              className="mt-2 w-full resize-none border p-3 text-sm outline-none focus:border-black"
            />
          </div>

          {/* QUANTITY & RATE */}
          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="text-xs font-medium">
                Quantity *
              </label>

              <input
                required
                type="number"
                min="1"
                step="1"
                value={form.quantity}
                onChange={(e) =>
                  updateField(
                    "quantity",
                    e.target.value === ""
                      ? 0
                      : Number(e.target.value)
                  )
                }
                className="mt-2 w-full border p-3 text-sm outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="text-xs font-medium">
                Rate (₹) *
              </label>

              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.rate}
                onChange={(e) =>
                  updateField(
                    "rate",
                    e.target.value === ""
                      ? 0
                      : Number(e.target.value)
                  )
                }
                className="mt-2 w-full border p-3 text-sm outline-none focus:border-black"
              />
            </div>

          </div>

          {/* ITEM TOTAL */}
          <div className="flex justify-between bg-gray-50 p-4">
            <span className="text-sm text-gray-600">
              Item Total
            </span>

            <span className="font-bold">
              {formatCurrency(
                (Number.isFinite(quantity) ? quantity : 0) *
                  (Number.isFinite(rate) ? rate : 0)
              )}
            </span>
          </div>

        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 border-t p-5">

          <button
            type="button"
            onClick={onClose}
            className="border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!isValid}
            className="flex items-center gap-2 bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Check size={15} />

            {item ? "Update Item" : "Save Item"}
          </button>

        </div>
      </form>
    </div>
  );
}