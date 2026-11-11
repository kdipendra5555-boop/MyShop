const DB_NAME = "DotPrintDB";
const DB_VERSION = 1;
const STORE_NAME = "invoices";

// ------------------------------------
// TYPES
// ------------------------------------

export interface StoredInvoice {
  localId: string;
  invoiceNo: string;
  invoice: Record<string, any>;
  items: any[];

  syncStatus: "pending" | "synced" | "failed";

  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;

// ------------------------------------
// GENERATE UNIQUE ID
// ------------------------------------

export const generateLocalId = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

// ------------------------------------
// CLONE DATA
// ------------------------------------

const cloneData = <T,>(data: T): T => {
  if (typeof structuredClone === "function") {
    return structuredClone(data);
  }

  return JSON.parse(JSON.stringify(data)) as T;
};

// ------------------------------------
// INITIALIZE DATABASE
// ------------------------------------

export const initDatabase = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "localId",
        });

        store.createIndex("invoiceNo", "invoiceNo", {
          unique: false,
        });

        store.createIndex("syncStatus", "syncStatus", {
          unique: false,
        });

        store.createIndex("createdAt", "createdAt", {
          unique: false,
        });
      }
    };

    request.onsuccess = () => {
      const db = request.result;

      db.onclose = () => {
        dbPromise = null;
      };

      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };

      resolve(db);
    };

    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };

    request.onblocked = () => {
      console.warn("Database upgrade blocked by another tab.");
    };
  });

  return dbPromise;
};

// ------------------------------------
// SAVE / UPDATE INVOICE
// ------------------------------------

export const saveLocalInvoice = async (
  invoice: Record<string, any>,
  items: any[]
): Promise<StoredInvoice> => {
  const db = await initDatabase();

  const now = new Date().toISOString();
  const invoiceNo = String(invoice.invoiceNo || "").trim();

  if (!invoiceNo) {
    throw new Error("Invoice number is required.");
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");

    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("invoiceNo");

    const request = index.getAll(invoiceNo);

    let savedRecord: StoredInvoice | null = null;

    request.onsuccess = () => {
      const existingRecords = request.result as StoredInvoice[];

      // Latest existing record ko preserve karo.
      existingRecords.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() -
          new Date(a.updatedAt).getTime()
      );

      const existing = existingRecords[0];

      const record: StoredInvoice = {
        localId: existing?.localId || generateLocalId(),

        invoiceNo,

        invoice: cloneData(invoice),
        items: cloneData(items),

        syncStatus: "pending",

        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };

      savedRecord = record;

      // Old duplicate records remove karo.
      existingRecords.slice(1).forEach((duplicate) => {
        store.delete(duplicate.localId);
      });

      // Existing record update ya new record insert.
      store.put(record);
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      if (savedRecord) {
        resolve(savedRecord);
      } else {
        reject(new Error("Invoice could not be saved."));
      }
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };

    transaction.onabort = () => {
      reject(
        transaction.error ||
          new Error("Invoice save transaction aborted.")
      );
    };
  });
};

// ------------------------------------
// GET ALL INVOICES
// ------------------------------------

export const getAllInvoices = async (): Promise<StoredInvoice[]> => {
  const db = await initDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");

    const request = transaction
      .objectStore(STORE_NAME)
      .getAll();

    request.onsuccess = () => {
      const records = request.result as StoredInvoice[];

      records.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

      resolve(records);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

// ------------------------------------
// GET PENDING + FAILED INVOICES
// ------------------------------------

export const getPendingInvoices = async (): Promise<StoredInvoice[]> => {
  const db = await initDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");

    const index = transaction
      .objectStore(STORE_NAME)
      .index("syncStatus");

    const pendingRequest = index.getAll("pending");
    const failedRequest = index.getAll("failed");

    let records: StoredInvoice[] = [];

    pendingRequest.onsuccess = () => {
      records = [
        ...records,
        ...(pendingRequest.result as StoredInvoice[]),
      ];
    };

    failedRequest.onsuccess = () => {
      records = [
        ...records,
        ...(failedRequest.result as StoredInvoice[]),
      ];
    };

    transaction.oncomplete = () => {
      records.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
      );

      resolve(records);
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
};

// ------------------------------------
// UPDATE SYNC STATUS
// ------------------------------------

export const updateSyncStatus = async (
  localId: string,
  status: StoredInvoice["syncStatus"]
): Promise<void> => {
  const db = await initDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");

    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(localId);

    request.onsuccess = () => {
      const record = request.result as StoredInvoice | undefined;

      if (!record) {
        transaction.abort();
        return;
      }

      record.syncStatus = status;
      record.updatedAt = new Date().toISOString();

      if (status === "synced") {
        record.syncedAt = new Date().toISOString();
      } else {
        delete record.syncedAt;
      }

      store.put(record);
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };

    transaction.onabort = () => {
      reject(
        transaction.error ||
          new Error("Invoice status update failed.")
      );
    };
  });
};

// ------------------------------------
// DELETE INVOICE
// ------------------------------------

export const deleteLocalInvoice = async (
  localId: string
): Promise<void> => {
  const db = await initDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");

    transaction.objectStore(STORE_NAME).delete(localId);

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
};