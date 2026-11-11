import { QRCodeSVG } from "qrcode.react";

interface InvoiceQRProps {
  qrValue?: string;
  qrSize?: number;
  showQR?: boolean;
  qrLabel?: string;
}

export default function InvoiceQR({
  qrValue = "",
  qrSize = 150,
  showQR = true,
}: InvoiceQRProps) {
  const value = typeof qrValue === "string" ? qrValue.trim() : "";

  const size =
    Number.isFinite(Number(qrSize)) && Number(qrSize) > 0
      ? Number(qrSize)
      : 150;

  return (
    <div className="flex w-full items-center justify-start border-l border-black pl-2">
      
      {/* QR CODE LEFT */}
      <div className="shrink-0">
        {showQR && value ? (
          <QRCodeSVG
            value={value}
            size={size}
            level="H"
            includeMargin={false}
            className="block"
          />
        ) : (
          <div
            className="flex items-center justify-center border border-dashed border-gray-300 text-xs text-gray-400"
            style={{ width: size, height: size }}
          >
            {showQR ? "QR CODE" : "QR Hidden"}
          </div>
        )}
      </div>

      {/* TEXT RIGHT */}
      <div className="flex flex-1 flex-col justify-center pl-4 text-left">
        <p className="text-[20px] font-bold leading-5 text-black">
          Scan me!
        </p>

        <p className="mt-1 text-[13px] leading-4 text-gray-700">
          To get your digital card
        </p>

        <p className="mt-1 text-[12px] font-semibold text-black">
          or visit
        </p>

        <p className="text-[15px] font-bold text-black">
          dotprint.in
        </p>
      </div>

    </div>
  );
}