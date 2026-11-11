
import { Phone, MessageCircle, Mail, Globe } from "lucide-react";

export default function InvoiceContactInfo() {
  return (
    <div className="flex items-center justify-start gap-3 px-2 py-2 text-[15px] font-semibold border-b border-black">

      <div className="flex items-center gap-1 shrink-0">
        <Phone size={20} />
        <span>9984055341</span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <MessageCircle size={20} />
        <span>9452218231</span>
      </div>

      <div className="flex items-center gap-1 min-w-0">
        <Mail size={20} className="shrink-0" />
        <span className="truncate">shailendrapress@gmail.com</span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Globe size={20} />
        <span>dotprint.in</span>
      </div>

    </div>
  );
}
