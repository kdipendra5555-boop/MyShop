import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import InvoiceItemModal, {
  type InvoiceItemForm,
} from "../../Template/Components/InvoiceItemModal";

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

interface Props {
  items?: InvoiceItem[];
  onChange: (items: InvoiceItem[]) => void;
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function InvoiceItemsSettings({
  items = [],
  onChange,
}: Props) {

  const invoiceItems = Array.isArray(items) ? items : [];

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] =
    useState<InvoiceItem | null>(null);

  // ========================================
  // CURRENCY FORMAT
  // ========================================

  const formatCurrency = (amount: number) =>
    `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // ========================================
  // ADD ITEM
  // ========================================

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  // ========================================
  // EDIT ITEM
  // ========================================

  const handleEdit = (item: InvoiceItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // ========================================
  // CLOSE MODAL
  // ========================================

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // ========================================
  // SAVE / UPDATE ITEM
  // ========================================

  const handleSave = (form: InvoiceItemForm) => {

    if (editingItem) {

      const updatedItems = invoiceItems.map((item) =>
        item.id === editingItem.id
          ? { ...item, ...form }
          : item
      );

      onChange(updatedItems);

    } else {

      const newItem: InvoiceItem = {
        id: Date.now(),
        ...form,
      };

      onChange([...invoiceItems, newItem]);
    }

    handleClose();
  };

  // ========================================
  // DELETE ITEM
  // ========================================

  const handleDelete = (id: number) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this item?"
    );

    if (!confirmed) return;

    onChange(
      invoiceItems.filter((item) => item.id !== id)
    );
  };

  // ========================================
  // SUBTOTAL
  // ========================================

  const subtotal = invoiceItems.reduce(
    (total, item) =>
      total +
      (Number(item.quantity) || 0) *
      (Number(item.rate) || 0),
    0
  );

  // ========================================
  // JSX
  // ========================================

  return (
    <section>

      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between">

        <div>
          <h3 className="text-sm font-bold">
            Invoice Items
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            Manage products and services
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 bg-black px-3 py-2 text-xs text-white hover:bg-gray-800"
        >
          <Plus size={15} />
          Add Item
        </button>

      </div>

      {/* ITEM LIST */}
      <div className="space-y-3">

        {invoiceItems.map((item, index) => (

          <div
            key={item.id}
            className="border p-4 transition hover:border-gray-400"
          >

            <div className="flex justify-between gap-3">

              {/* ITEM INFORMATION */}
              <div className="min-w-0">

                <p className="text-xs text-gray-400">
                  ITEM {index + 1}
                </p>

                <h4 className="mt-1 text-sm font-semibold">
                  {item.name}
                </h4>

                {item.description && (
                  <p className="mt-1 text-xs text-gray-500">
                    {item.description}
                  </p>
                )}

                <p className="mt-2 text-xs">
                  {item.quantity} × {formatCurrency(item.rate)}
                </p>

                <p className="mt-2 text-sm font-bold">
                  {formatCurrency(
                    item.quantity * item.rate
                  )}
                </p>

              </div>

              {/* ACTION BUTTONS */}
              <div className="flex shrink-0 gap-2">

                <button
                  type="button"
                  onClick={() => handleEdit(item)}
                  title="Edit Item"
                  className="flex h-8 w-8 items-center justify-center border hover:bg-gray-100"
                >
                  <Pencil size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  title="Delete Item"
                  className="flex h-8 w-8 items-center justify-center border text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </button>

              </div>

            </div>

          </div>

        ))}

        {/* EMPTY STATE */}
        {invoiceItems.length === 0 && (

          <div className="border border-dashed p-8 text-center">

            <p className="text-sm text-gray-500">
              No invoice items added.
            </p>

            <button
              type="button"
              onClick={handleAdd}
              className="mt-2 text-sm underline"
            >
              Add your first item
            </button>

          </div>

        )}

      </div>

      {/* SUBTOTAL */}
      <div className="mt-4 flex justify-between border-t pt-4 text-sm font-bold">

        <span>Subtotal</span>

        <span>
          {formatCurrency(subtotal)}
        </span>

      </div>

      {/* ITEM MODAL */}
      <InvoiceItemModal
        isOpen={isModalOpen}
        item={editingItem}
        onClose={handleClose}
        onSave={handleSave}
      />

    </section>
  );
}