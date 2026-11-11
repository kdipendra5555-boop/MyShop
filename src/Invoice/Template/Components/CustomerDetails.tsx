interface CustomerDetailsProps {
  customer: string;
  address: string;
  phone: string;
  whatsapp: string;
}

export default function CustomerDetails({
  customer,
  address,
  phone,
  whatsapp,
}: CustomerDetailsProps) {
  return (
    <div>
      {/* SECTION TITLE */}
      <h3 className="font-bold text-base mb-0.5">
        Bill To
      </h3>

      {/* CUSTOMER NAME */}
      <p className="font-bold text-[16px]">
        {customer || "Customer Name"}
      </p>

      {/* CUSTOMER ADDRESS */}
      <p className="text-base mt-0.1">
        {address || "Customer Address"}
      </p>

      {/* CONTACT NUMBER */}
      <p className="text-base mt-0.1">
        Contact: {phone || "—"}
      </p>

      {/* WHATSAPP NUMBER */}
      <p className="text-base mt-0.1">
        WhatsApp: {whatsapp || "—"}
      </p>
    </div>
  );
}