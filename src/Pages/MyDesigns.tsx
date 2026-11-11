import { useEffect } from "react";
import { useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Download,
  FileText,
  Loader2,
  LogOut,
} from "lucide-react";

const API_URL =
  "https://script.google.com/macros/s/AKfycbyEC3eO1IUl7jVHcnhMzOEU-SSoKJZdwyqVSVr5xaC57D1WSEIPacr88Ucz84E016mq/exec";

interface Design {
  fileName: string;
  designLink: string;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  customerName?: string;
  designs?: Design[];
}

export default function MyDesigns() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [customer, setCustomer] = useState("");
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [error, setError] = useState("");

  // STEP 1
  const handleMobileSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!/^\d{10}$/.test(mobile)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    setStep(2);
  };

  // STEP 2
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          mobile: mobile.trim(),
          password: password.trim(),
        }),
      });

      const data: LoginResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Invalid credentials.");
      }

      setCustomer(data.customerName || "Customer");
      setDesigns(data.designs || []);
      setStep(3);

    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Connection failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // BACK
  const goBack = () => {
    setError("");
    setPassword("");
    setStep(1);
  };

  // LOGOUT
  const handleLogout = () => {
    setStep(1);
    setMobile("");
    setPassword("");
    setCustomer("");
    setDesigns([]);
    setError("");
  };

  // AUTO LOGOUT AFTER 1 HOUR
useEffect(() => {
  if (step !== 3) return;

  const logoutTimer = window.setTimeout(() => {
    setStep(1);
    setMobile("");
    setPassword("");
    setCustomer("");
    setDesigns([]);
    setError("");
  }, 60 * 1000);

  return () => {
    window.clearTimeout(logoutTimer);
  };
}, [step]);

  // DRIVE FILE ID
  const getDriveFileId = (link: string) => {
    const match =
      link.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
      link.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
      link.match(/[?&]id=([a-zA-Z0-9_-]+)/);

    return match?.[1] || null;
  };

  // DOWNLOAD
  const downloadDesign = (design: Design, index: number) => {
    setError("");

    const fileId = getDriveFileId(design.designLink);

    if (!fileId) {
      setError("Invalid Google Drive link.");
      return;
    }

    setDownloading(index);

    const anchor = document.createElement("a");

    anchor.href =
      `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`;

    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.download = design.fileName || "design";

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    setTimeout(() => setDownloading(null), 1500);
  };

  return (
    <main className="w-full bg-[#F5EFE8] px-3 sm:px-5 py-0 flex items-center justify-center">

      <div className="w-full max-w-3xl">

        {/* STEP 1: MOBILE */}

        {step === 1 && (
          <section>

            <form
              onSubmit={handleMobileSubmit}
              className="flex items-center bg-[#E5D8CE] rounded-full p-1.5 sm:p-2 gap-1.5 w-full"
            >

              <div className="w-[38%] min-h-[48px] sm:min-h-[60px] shrink-0 bg-[#8F1D32] rounded-full flex items-center justify-center px-2 sm:px-4">

                <span className="text-[11px] sm:text-sm font-medium text-white text-center whitespace-nowrap">
                  Download Design
                </span>

              </div>

              <div className="flex flex-1 items-center min-w-0 pl-2 sm:pl-4 pr-1">

                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                  required
                  value={mobile}
                  onChange={(e) =>
                    setMobile(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Enter mobile number"
                  className="w-full min-w-0 bg-transparent text-xs sm:text-sm text-[#292323] placeholder:text-[#766D68] outline-none"
                />

                <button
                  type="submit"
                  disabled={mobile.length !== 10}
                  aria-label="Continue"
                  className="shrink-0 p-1 text-[#292323] hover:text-[#8F1D32] transition disabled:opacity-30"
                >
                  <ArrowRight size={27} strokeWidth={1.8} />
                </button>

              </div>

            </form>

            {error && (
              <p className="text-xs text-[#8F1D32] mt-2">
                {error}
              </p>
            )}

          </section>
        )}

        {/* STEP 2: PASSWORD */}

        {step === 2 && (
          <section>

            <form
              onSubmit={handleLogin}
              className="flex items-center bg-[#E5D8CE] rounded-full p-1.5 sm:p-2 gap-1.5 w-full"
            >

              <div className="w-[38%] min-h-[48px] sm:min-h-[60px] shrink-0 bg-[#8F1D32] rounded-full flex items-center justify-center px-2 sm:px-4">

                <span className="text-[11px] sm:text-sm font-medium text-white text-center whitespace-nowrap">
                  Access Password
                </span>

              </div>

              <div className="flex flex-1 items-center min-w-0 pl-2 sm:pl-4 pr-1">

                <input
                  type="password"
                  autoFocus
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full min-w-0 bg-transparent text-xs sm:text-sm text-[#292323] placeholder:text-[#766D68] outline-none"
                />

                <button
                  type="submit"
                  disabled={loading || !password.trim()}
                  aria-label="Verify password"
                  className="shrink-0 p-1 text-[#292323] hover:text-[#8F1D32] transition disabled:opacity-30"
                >
                  {loading ? (
                    <Loader2 size={25} className="animate-spin" />
                  ) : (
                    <ArrowRight size={27} strokeWidth={1.8} />
                  )}
                </button>

              </div>

            </form>

            <div className="flex items-center justify-between mt-2">

              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1 text-[11px] text-[#766D68] hover:text-[#8F1D32]"
              >
                <ArrowLeft size={13} />
                Change number
              </button>

              <span className="text-[11px] text-[#766D68]">
                {mobile}
              </span>

            </div>

            {error && (
              <p className="text-xs text-[#8F1D32] mt-2">
                {error}
              </p>
            )}

          </section>
        )}

        {/* STEP 3: DESIGNS */}

        {step === 3 && (
  <section className="w-full max-w-2xl mx-auto">

    {/* MAIN CARD */}

    <div className="bg-white border border-[#E8DDD5] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_4px_25px_rgba(80,40,30,0.06)]">

      {/* HEADER */}

      <div className="bg-[#F5EFE8] px-4 sm:px-6 py-4 border-b border-[#E8DDD5]">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3 min-w-0">

            <div className="w-11 h-11 rounded-xl bg-[#8F1D32] flex items-center justify-center shrink-0">
              <FileText size={21} className="text-white" />
            </div>

            <div className="min-w-0">

              <p className="text-[10px] uppercase tracking-[2px] text-[#9A7770]">
                Do no share password.
              </p>

              <h2 className="text-base sm:text-lg font-semibold text-[#292323] truncate">
                Welcome, {customer}
              </h2>

            </div>

          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-9 h-9 shrink-0 rounded-full border border-[#E3CEC6] flex items-center justify-center text-[#8F1D32] hover:bg-[#8F1D32] hover:text-white transition"
            aria-label="Logout"
          >
            <LogOut size={16} />
          </button>

        </div>

      </div>

      {/* CONTENT */}

      <div className="p-4 sm:p-6">

        <div className="flex items-center justify-between mb-4">

          <div>
            <h3 className="text-sm sm:text-base font-semibold text-[#292323]">
              Your Designs
            </h3>

            <p className="text-[11px] text-[#9A8981] mt-1">
              Your personalized designs are ready.
            </p>
          </div>

          <span className="bg-[#F5EFE8] text-[#8F1D32] px-3 py-1.5 rounded-full text-[11px] font-semibold">
            {designs.length} Files
          </span>

        </div>

        {/* EMPTY STATE */}

        {designs.length === 0 ? (

          <div className="border border-dashed border-[#DDC9BF] rounded-xl py-10 text-center bg-[#FCFAF8]">

            <FileText
              size={30}
              className="mx-auto text-[#B99C91] mb-3"
            />

            <p className="text-sm font-medium text-[#292323]">
              No designs available
            </p>

            <p className="text-xs text-[#9A8981] mt-1">
              Your designs will appear here.
            </p>

          </div>

        ) : (

          /* DESIGN LIST */

          <div className="space-y-3">

            {designs.map((design, index) => (

              <div
                key={`${design.fileName}-${index}`}
                className="group flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border border-[#EAE0D9] bg-[#FFFEFD] hover:border-[#C99B9B] hover:bg-[#FCF8F5] transition-all duration-200"
              >

                {/* FILE INFO */}

                <div className="flex items-center gap-3 min-w-0">

                  <div className="w-11 h-11 shrink-0 rounded-xl bg-[#F5EFE8] flex items-center justify-center group-hover:bg-[#F0E2DF] transition">

                    <FileText
                      size={21}
                      className="text-[#8F1D32]"
                    />

                  </div>

                  <div className="min-w-0">

                    <h4 className="text-xs sm:text-sm font-semibold text-[#292323] truncate">
                      {design.fileName}
                    </h4>

                    <div className="flex items-center gap-1.5 mt-1">

                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />

                      <p className="text-[10px] sm:text-[11px] text-[#93847D]">
                        Ready to download
                      </p>

                    </div>

                  </div>

                </div>

                {/* DOWNLOAD BUTTON */}

                <button
                  type="button"
                  onClick={() => downloadDesign(design, index)}
                  disabled={downloading === index}
                  className="w-10 h-10 shrink-0 rounded-xl bg-[#8F1D32] text-white flex items-center justify-center hover:bg-[#711528] active:scale-95 transition disabled:opacity-50"
                  aria-label={`Download ${design.fileName}`}
                >

                  {downloading === index ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Download size={18} />
                  )}

                </button>

              </div>

            ))}

          </div>

        )}

        {/* ERROR */}

        {error && (
          <p className="text-xs text-[#8F1D32] bg-[#FDF0F0] rounded-lg p-3 mt-4">
            {error}
          </p>
        )}

      </div>

      {/* CARD FOOTER */}

      <div className="px-4 sm:px-6 py-3 bg-[#FCFAF8] border-t border-[#EEE5DF]">

        <p className="text-[10px] text-center text-[#9A8981]">
          Made with love by Dot Print.
        </p>

      </div>

    </div>

  </section>
)}

      </div>

    </main>
  );
}