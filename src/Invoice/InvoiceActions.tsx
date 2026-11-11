import { useState } from "react";

import {
  Printer,
  ImageDown,
  FileDown,
  Share2,
  FilePlus2,
} from "lucide-react";

import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

interface InvoiceActionsProps {
  invoiceNo: string;
  targetId?: string;
  onNewInvoice: () => void;
}

export default function InvoiceActions({
  invoiceNo,
  targetId = "invoice-print-area",
  onNewInvoice,
}: InvoiceActionsProps) {

  const [loading, setLoading] = useState(false);

  // CAPTURE INVOICE
  const captureInvoice = async () => {
    const element = document.getElementById(targetId);

    if (!element) {
      throw new Error("Invoice not found");
    }

    return await html2canvas(element, {
      scale: 3,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
    });
  };

  // FILE NAME
  const fileName = `Invoice-${invoiceNo.replace(/\//g, "-")}`;

  // PRINT
  const handlePrint = () => {
    window.print();
  };

  // DOWNLOAD JPG
  const handleJPG = async () => {
    try {
      setLoading(true);

      const canvas = await captureInvoice();

      const link = document.createElement("a");

      link.download = `${fileName}.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.95);

      link.click();

    } catch (error) {
      console.error(error);
      alert("JPG download failed");
    } finally {
      setLoading(false);
    }
  };

  // GENERATE PDF
  const generatePDF = async () => {
    const canvas = await captureInvoice();

    const image = canvas.toDataURL("image/jpeg", 0.95);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const margin = 5;
    const pageWidth = 210;
    const pageHeight = 297;

    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2;

    const ratio = Math.min(
      availableWidth / canvas.width,
      availableHeight / canvas.height
    );

    const width = canvas.width * ratio;
    const height = canvas.height * ratio;

    pdf.addImage(
      image,
      "JPEG",
      (pageWidth - width) / 2,
      margin,
      width,
      height
    );

    return pdf;
  };

  // DOWNLOAD PDF
  const handlePDF = async () => {
    try {
      setLoading(true);

      const pdf = await generatePDF();

      pdf.save(`${fileName}.pdf`);

    } catch (error) {
      console.error(error);
      alert("PDF download failed");
    } finally {
      setLoading(false);
    }
  };

  // SHARE
  const handleShare = async () => {
    try {
      setLoading(true);

      const pdf = await generatePDF();

      const blob = pdf.output("blob");

      const file = new File(
        [blob],
        `${fileName}.pdf`,
        { type: "application/pdf" }
      );

      if (
        navigator.share &&
        navigator.canShare?.({ files: [file] })
      ) {
        await navigator.share({
          title: `Invoice ${invoiceNo}`,
          text: "Dot Print - Shailendra Press",
          files: [file],
        });
      } else {
        pdf.save(`${fileName}.pdf`);
      }

    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error(error);
        alert("Sharing failed");
      }
    } finally {
      setLoading(false);
    }
  };

  // BUTTON STYLE
  const buttonStyle =
    "flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2.5 text-gray-700 transition hover:bg-gray-100 disabled:opacity-50";

  return (
    <div className="flex flex-wrap items-center gap-2">

      {/* NEW INVOICE */}
      <button
        type="button"
        onClick={onNewInvoice}
        disabled={loading}
        title="Create New Invoice"
        aria-label="Create New Invoice"
        className="flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
      >
        <FilePlus2 size={19} />
        <span>New Invoice</span>
      </button>

      {/* PRINT */}
      <button
        type="button"
        onClick={handlePrint}
        disabled={loading}
        title="Print Invoice"
        aria-label="Print Invoice"
        className={buttonStyle}
      >
        <Printer size={19} />
      </button>

      {/* JPG */}
      <button
        type="button"
        onClick={handleJPG}
        disabled={loading}
        title="Download JPG"
        aria-label="Download JPG"
        className={buttonStyle}
      >
        <ImageDown size={19} />
      </button>

      {/* PDF */}
      <button
        type="button"
        onClick={handlePDF}
        disabled={loading}
        title="Download PDF"
        aria-label="Download PDF"
        className={buttonStyle}
      >
        <FileDown size={19} />
      </button>

      {/* SHARE */}
      <button
        type="button"
        onClick={handleShare}
        disabled={loading}
        title="Share Invoice"
        aria-label="Share Invoice"
        className="flex items-center justify-center rounded-lg bg-black p-2.5 text-white transition hover:bg-gray-800 disabled:opacity-50"
      >
        <Share2 size={19} />
      </button>

    </div>
  );
}