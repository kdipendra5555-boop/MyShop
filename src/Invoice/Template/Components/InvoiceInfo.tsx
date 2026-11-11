interface InvoiceItem {
  quantity: number;
  rate: number;
}

interface InvoiceInfoProps {
  invoice: {
    invoiceNo: string;
    date: string;
    paymentMode: string;
    advance: string;
  };
  items: InvoiceItem[];
  discount?: string;
}

export default function InvoiceInfo({
  invoice,
}: InvoiceInfoProps) {
 

 

  return (
    <div className="flex items-center justify-between gap-2 whitespace-nowrap text-[14px] py-0.5 px-1">

      <span>{invoice.invoiceNo}</span>

      <span>{invoice.date}</span>

      <span>{invoice.paymentMode}</span>


    </div>
  );
}