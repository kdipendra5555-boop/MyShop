import { MapPin } from "lucide-react";
import InvoiceInfo from "./InvoiceInfo";

interface InvoiceHeaderProps {
  invoice: {
    invoiceNo: string;
    date: string;
    paymentMode: string;
    advance: string;
  };
  items: {
    quantity: number;
    rate: number;
  }[];
  discount?: string;
}

export default function InvoiceHeader({
  invoice,
  items,
  discount = "0",
}: InvoiceHeaderProps) {
  return (
    <div className="w-full bg-white">

      <div className="grid grid-cols-2 items-center gap-4 px-3 py-3">

        {/* LEFT - BRANDING */}
        <div className="flex items-center gap-3">
          <img
            src="/invoicelogo.png"
            alt="Dot Print Logo"
            className="w-[75px] h-[75px] object-contain shrink-0"
          />

          <div className="min-w-0">
            <h1 className="text-[30px] font-extrabold tracking-tight leading-none whitespace-nowrap">
              Dot Print
            </h1>

            <p className="text-[18px] mt-1 whitespace-nowrap">
              by Shailendra Press
            </p>
          </div>
        </div>

        {/* RIGHT - INVOICE INFO + BUSINESS DETAILS */}
        <div className="border-l border-black pl-4">

          {/* INVOICE INFORMATION */}
          <InvoiceInfo
            invoice={invoice}
            items={items}
            discount={discount}
          />

          {/* BUSINESS DETAILS */}
          <div>
            <h2 className="text-[19px] font-bold leading-tight mb-1.5">
              Dot Print - Shailendra Press
            </h2>

            <div className="text-[15px] font-semibold leading-tight">
              <div className="flex items-start gap-2">
                <MapPin size={20} className="shrink-0 mt-0.5" />

                <p>
                  Machinery Line Road, Yusufpur Bazar, Mohammadabad
                  <br />
                  Ghazipur (U.P.) - 233227
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="border-b border-black" />
    </div>
  );
}