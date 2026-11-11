// ==========================================
// TYPES
// ==========================================
interface CustomerDetailsSettingsProps {
  invoice: {
    customer: string;
    address: string;
    phone: string;
    whatsapp: string;
  };

  onChange: (key: string, value: string) => void;
}

// ==========================================
// CUSTOMER DETAILS SETTINGS
// ==========================================
export default function CustomerDetailsSettings({
  invoice,
  onChange,
}: CustomerDetailsSettingsProps) {
  return (
    <section>
      {/* SECTION TITLE */}
      <h3 className="font-bold text-sm mb-4">
        Customer Details
      </h3>

      <div className="space-y-4">

        {/* CUSTOMER NAME */}
        <div>
          <label className="text-xs font-medium">
            Customer Name
          </label>

          <input
            type="text"
            value={invoice.customer}
            onChange={(e) =>
              onChange("customer", e.target.value)
            }
            placeholder="Enter customer name"
            className="w-full border p-3 mt-1 text-sm outline-none focus:border-black"
          />
        </div>

        {/* CUSTOMER ADDRESS */}
        <div>
          <label className="text-xs font-medium">
            Customer Address
          </label>

          <textarea
            value={invoice.address}
            onChange={(e) =>
              onChange("address", e.target.value)
            }
            placeholder="Enter customer address"
            rows={3}
            className="w-full border p-3 mt-1 text-sm outline-none focus:border-black resize-none"
          />
        </div>

        {/* CONTACT NUMBER */}
        <div>
          <label className="text-xs font-medium">
            Contact Number
          </label>

          <input
            type="tel"
            value={invoice.phone}
            onChange={(e) =>
              onChange("phone", e.target.value)
            }
            placeholder="Enter contact number"
            className="w-full border p-3 mt-1 text-sm outline-none focus:border-black"
          />
        </div>

        {/* WHATSAPP NUMBER */}
        <div>
          <label className="text-xs font-medium">
            WhatsApp Number
          </label>

          <input
            type="tel"
            value={invoice.whatsapp}
            onChange={(e) =>
              onChange("whatsapp", e.target.value)
            }
            placeholder="Enter WhatsApp number"
            className="w-full border p-3 mt-1 text-sm outline-none focus:border-black"
          />
        </div>

      </div>
    </section>
  );
}