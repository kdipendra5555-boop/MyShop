import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeSettingsProps {
  qrValue: string;
  onQRValueChange: (value: string) => void;

  qrSize: number;
  onQRSizeChange: (size: number) => void;

  showQR: boolean;
  onShowQRChange: (show: boolean) => void;
}

export default function QRCodeSettings({
  qrValue,
  onQRValueChange,
  qrSize,
  onQRSizeChange,
  showQR,
  onShowQRChange,
}: QRCodeSettingsProps) {
  const [qrType, setQrType] = useState("website");

  const handleTypeChange = (type: string) => {
    setQrType(type);
    onQRValueChange("");
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4">

      <div>
        <h3 className="text-base font-semibold text-gray-800">
          QR Code Settings
        </h3>
        <p className="text-xs text-gray-500">
          Customize invoice QR code
        </p>
      </div>

      {/* SHOW / HIDE */}
      <label className="flex cursor-pointer items-center justify-between">
        <span className="text-sm font-medium">Show QR Code</span>

        <input
          type="checkbox"
          checked={showQR}
          onChange={(e) => onShowQRChange(e.target.checked)}
          className="h-4 w-4 accent-black"
        />
      </label>

      {/* QR TYPE */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          QR Type
        </label>

        <select
          value={qrType}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-black"
        >
          <option value="website">Website / URL</option>
          <option value="upi">UPI Payment</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="custom">Custom Text</option>
        </select>
      </div>

      {/* QR VALUE */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          {qrType === "upi"
            ? "UPI Payment Link"
            : qrType === "whatsapp"
            ? "WhatsApp Link"
            : qrType === "website"
            ? "Website URL"
            : "Custom QR Text"}
        </label>

        <input
          type="text"
          value={qrValue}
          onChange={(e) => onQRValueChange(e.target.value)}
          placeholder={
            qrType === "upi"
              ? "upi://pay?pa=yourupi@bank"
              : qrType === "whatsapp"
              ? "https://wa.me/91XXXXXXXXXX"
              : qrType === "website"
              ? "https://example.com"
              : "Enter QR content"
          }
          className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-black"
        />
      </div>

      {/* QR SIZE */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          QR Code Size
        </label>

        <select
          value={qrSize}
          onChange={(e) => onQRSizeChange(Number(e.target.value))}
          className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-black"
        >
          <option value={100}>Small</option>
          <option value={150}>Medium</option>
          <option value={200}>Large</option>
        </select>
      </div>

      {/* QR PREVIEW */}
      <div className="flex flex-col items-center rounded-lg bg-gray-50 p-4">
        <p className="mb-3 text-xs font-medium text-gray-500">
          QR PREVIEW
        </p>

        {showQR && qrValue.trim() ? (
          <QRCodeSVG
            value={qrValue.trim()}
            size={qrSize}
            level="H"
            includeMargin
          />
        ) : (
          <div className="flex h-[150px] w-[150px] items-center justify-center border border-dashed border-gray-300 text-xs text-gray-400">
            {showQR ? "Enter QR Content" : "QR Hidden"}
          </div>
        )}
      </div>

    </div>
  );
}