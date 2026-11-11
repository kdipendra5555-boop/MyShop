import { QRCodeSVG } from "qrcode.react";

interface DuePaymentQRProps {
  due: number;
  invoiceNo: string;
}

export default function DuePaymentQR({
  due,
  invoiceNo,
}: DuePaymentQRProps) {
  const UPI_ID = "spoorthikssagar-1@okhdfcbank";
  const PAYEE_NAME = "Dot Print";

  const dueAmount = Math.max(0, Number(due) || 0);

  if (dueAmount <= 0) return null;

  const upiUrl = new URL("upi://pay");

  upiUrl.searchParams.set("pa", UPI_ID);
  upiUrl.searchParams.set("pn", PAYEE_NAME);
  upiUrl.searchParams.set("am", dueAmount.toFixed(2));
  upiUrl.searchParams.set("cu", "INR");
  upiUrl.searchParams.set("tn", `Invoice ${invoiceNo}`);

  return (
    <QRCodeSVG
      value={upiUrl.toString()}
      size={120}
      level="H"
      includeMargin={false}
    />
  );
}