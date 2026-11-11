import { useCallback, useEffect, useState } from "react";

import {
  Save,
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle2,
  Clock,
  Eye,
} from "lucide-react";

import type { InvoiceItem } from "./Tools/Components/InvoiceItemsSettings";

import {
  saveLocalInvoice,
  getPendingInvoices,
} from "./Services/invoiceStorage";

import { syncPendingInvoices } from "./Services/invoiceSync";

import SavedInvoices from "./SavedInvoices";

// ------------------------------------
// PROPS
// ------------------------------------

interface InvoiceSyncBarProps {
  invoice: Record<string, string>;
  items: InvoiceItem[];
}

// ------------------------------------
// COMPONENT
// ------------------------------------

export default function InvoiceSyncBar({
  invoice,
  items,
}: InvoiceSyncBarProps) {

  const [isOnline, setIsOnline] = useState<boolean>(
    navigator.onLine
  );

  const [pendingCount, setPendingCount] = useState<number>(0);

  const [saving, setSaving] = useState<boolean>(false);

  const [syncing, setSyncing] = useState<boolean>(false);

  const [syncMessage, setSyncMessage] = useState<string>("");

  const [syncError, setSyncError] = useState<boolean>(false);

  const [showSavedInvoices, setShowSavedInvoices] =
    useState<boolean>(false);

  // ------------------------------------
  // UPDATE PENDING COUNT
  // ------------------------------------

  const updatePendingCount = useCallback(async () => {
    try {
      const pending = await getPendingInvoices();
      setPendingCount(pending.length);
    } catch (error) {
      console.error("Pending invoice check failed:", error);
    }
  }, []);

  // ------------------------------------
  // INTERNET STATUS
  // ------------------------------------

  useEffect(() => {

    const handleOnline = () => {
      setIsOnline(true);
      updatePendingCount();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    updatePendingCount();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };

  }, [updatePendingCount]);

  // ------------------------------------
  // VALIDATE ITEMS
  // ------------------------------------

  const validateInvoiceItems = (): boolean => {

    if (!items || items.length === 0) {
      setSyncMessage("Please add at least one item before saving.");
      setSyncError(true);
      return false;
    }

    const invalidItem = items.some((item) => {
      return (
        !item.name?.trim() ||
        Number(item.quantity) <= 0
      );
    });

    if (invalidItem) {
      setSyncMessage(
        "Please enter a valid item name and quantity."
      );
      setSyncError(true);
      return false;
    }

    return true;
  };

  // ------------------------------------
  // SAVE INVOICE LOCALLY
  // ------------------------------------

  const handleSave = async () => {

    if (saving) return;

    // VALIDATION: AT LEAST ONE ITEM REQUIRED
    if (!validateInvoiceItems()) {
      return;
    }

    try {

      setSaving(true);
      setSyncMessage("");
      setSyncError(false);

      // Save invoice to IndexedDB
      const savedInvoice = await saveLocalInvoice(
        invoice,
        items
      );

      console.log(
        "Invoice saved successfully:",
        savedInvoice
      );

      // Update pending count
      await updatePendingCount();

      // Success message
      setSyncMessage(
        "Invoice saved successfully in local storage."
      );

      // Open saved invoices list
      setShowSavedInvoices(true);

    } catch (error) {

      console.error("Invoice save failed:", error);

      setSyncMessage(
        error instanceof Error
          ? error.message
          : "Invoice could not be saved."
      );

      setSyncError(true);

    } finally {

      setSaving(false);

    }
  };

  // ------------------------------------
  // SYNC PENDING INVOICES
  // ------------------------------------

  const handleSync = async () => {

    if (!isOnline || syncing || pendingCount === 0) {
      return;
    }

    try {

      setSyncing(true);
      setSyncMessage("");
      setSyncError(false);

      const result = await syncPendingInvoices();

      await updatePendingCount();

      if (result.failed === 0) {

        setSyncMessage(
          `${result.synced} invoice(s) synced successfully!`
        );

      } else {

        setSyncMessage(
          `${result.synced} synced, ${result.failed} failed. Please retry.`
        );

        setSyncError(true);

      }

      // Refresh saved invoice list if open
      if (showSavedInvoices) {
        setShowSavedInvoices(false);

        setTimeout(() => {
          setShowSavedInvoices(true);
        }, 0);
      }

    } catch (error) {

      console.error("Invoice sync failed:", error);

      setSyncMessage(
        error instanceof Error
          ? error.message
          : "Synchronization failed."
      );

      setSyncError(true);

    } finally {

      setSyncing(false);

    }
  };

  // ------------------------------------
  // UI
  // ------------------------------------

  return (
    <>
      <div className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

        {/* STATUS */}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

          <div className="flex items-center gap-2">

            {isOnline ? (
              <>
                <Cloud size={19} className="text-green-600" />

                <span className="text-sm font-semibold text-green-700">
                  Internet Connected
                </span>
              </>
            ) : (
              <>
                <CloudOff size={19} className="text-orange-500" />

                <span className="text-sm font-semibold text-orange-600">
                  Offline Mode
                </span>
              </>
            )}

          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">

            <Clock size={16} />

            <span>{pendingCount} Pending</span>

          </div>

        </div>

        {/* ACTION BUTTONS */}

        <div className="flex flex-wrap items-center gap-3">

          {/* SAVE INVOICE */}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >

            <Save size={18} />

            {saving ? "Saving..." : "Save Invoice"}

          </button>

          {/* SYNC NOW */}

          <button
            type="button"
            onClick={handleSync}
            disabled={
              !isOnline ||
              syncing ||
              pendingCount === 0
            }
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
          >

            <RefreshCw
              size={17}
              className={syncing ? "animate-spin" : ""}
            />

            {syncing ? "Syncing..." : "Sync Now"}

          </button>

          {/* SAVED INVOICES */}

          <button
            type="button"
            onClick={() => setShowSavedInvoices(true)}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >

            <Eye size={17} />

            Saved Invoices

          </button>

        </div>

        {/* STATUS MESSAGE */}

        <div className="mt-3 flex items-center gap-2 text-xs">

          {syncMessage ? (

            <>
              {syncError ? (
                <Clock size={15} className="text-red-500" />
              ) : (
                <CheckCircle2 size={15} className="text-green-600" />
              )}

              <span
                className={
                  syncError
                    ? "text-red-600"
                    : "text-green-700"
                }
              >
                {syncMessage}
              </span>
            </>

          ) : pendingCount === 0 ? (

            <>
              <CheckCircle2 size={15} className="text-green-600" />

              <span className="text-gray-500">
                No pending invoices.
              </span>
            </>

          ) : (

            <>
              <Clock size={15} className="text-orange-500" />

              <span className="text-gray-500">
                {pendingCount} invoice(s) waiting for cloud sync.
              </span>
            </>

          )}

        </div>

      </div>

      {/* SAVED INVOICES MODAL */}

      {showSavedInvoices && (
        <SavedInvoices
          onClose={() => setShowSavedInvoices(false)}
        />
      )}

    </>
  );
}