import DuePaymentQR from "./DuePaymentQR";

interface InvoiceFooterProps {
  businessName?: string;
  advance: number;
  due: number;
  invoiceNo: string;
}

export default function InvoiceFooter({
  businessName = "Dot Print",
  advance,
  due,
  invoiceNo,
}: InvoiceFooterProps) {
  const advanceAmount = Math.max(0, Number(advance) || 0);
  const dueAmount = Math.max(0, Number(due) || 0);

  return (
    <div className="-mt-6 border-t border-gray-300 pt-3">

      <div className="grid grid-cols-3 items-center gap-5">

        {/* PAYMENT SUMMARY */}
        <div className="min-w-0">
          
          <h3 className="mb-1 text-[14px] font-semibold  tracking-wider text-gray-500">
            Scan the bottom Qr to pay
          </h3>
          <h3 className="mb-1 text-[14px] font-bold uppercase tracking-wider text-gray-500">
            Payment Summary
          </h3>

          <div >

            <div>
              <p className="text-[14px] text-gray-500">
                Advance Paid
              </p>
              <p className=" text-base font-semibold text-gray-900">
                ₹{advanceAmount.toFixed(2)}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-2">
              <p className="text-[14px] text-gray-500">
                Balance Due
              </p>
              <p className={` text-base font-bold ${
                dueAmount > 0 ? "text-red-600" : "text-green-600"
              }`}>
                ₹{dueAmount.toFixed(2)}
              </p>
            </div>

          </div>
        </div>

        {/* DUE PAYMENT QR */}
        <div className="flex flex-col items-center justify-center border-x border-gray-200 px-3">

          {dueAmount > 0 ? (
            <>
              

              <div className="rounded-lg border border-gray-200 bg-white p-2">
                <DuePaymentQR
                  due={dueAmount}
                  invoiceNo={invoiceNo}
                />
              </div>

              

              
            </>
          ) : (
            <>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-3xl font-bold text-green-600">
                ✓
              </div>

              <p className="mt-2 text-[10px] font-bold text-green-600">
                FULLY PAID
              </p>
            </>
          )}

        </div>

        {/* AUTHORIZED SIGNATORY */}
        <div className="flex flex-col items-center justify-center text-center">

          <p className="text-[10px] uppercase tracking-wider text-gray-500">
            Authorized By
          </p>

          <p className="mt-1 text-sm font-bold text-gray-900">
            {businessName}
          </p>

          <div className="mt-12 w-28 border-b border-gray-800" />

          <p className="mt-2 text-[10px] font-medium text-gray-600">
            Authorized Signatory
          </p>

        </div>

      </div>
    </div>
  );
}