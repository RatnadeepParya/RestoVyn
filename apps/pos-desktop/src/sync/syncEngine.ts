import { OrderType, PaymentMethod } from "@restovyn/types";

export interface OfflineAction {
  id: string; // Client UUID
  type: "CREATE_ORDER" | "ADD_ITEM" | "PROCESS_PAYMENT" | "CLOSE_ORDER";
  payload: any;
  timestamp: string;
  synced: boolean;
  retryCount: number;
}

const STORAGE_KEY = "restovyn_pos_offline_queue_v1";

class SyncEngine {
  private queue: OfflineAction[] = [];
  private isSyncing = false;
  private listeners: ((pendingCount: number, isSyncing: boolean) => void)[] =
    [];

  constructor() {
    this.loadQueue();
  }

  private loadQueue() {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (err) {
      console.error(
        "Failed to parse offline sync queue from localStorage",
        err,
      );
      this.queue = [];
    }
  }

  private saveQueue() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
      this.notifyListeners();
    } catch (err) {
      console.error("Failed to save offline sync queue to localStorage", err);
    }
  }

  public subscribe(
    listener: (pendingCount: number, isSyncing: boolean) => void,
  ) {
    this.listeners.push(listener);
    listener(this.getPendingCount(), this.isSyncing);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    const pending = this.getPendingCount();
    this.listeners.forEach((l) => l(pending, this.isSyncing));
  }

  public getPendingCount(): number {
    return this.queue.filter((a) => !a.synced).length;
  }

  public enqueueAction(
    type: OfflineAction["type"],
    payload: any,
  ): OfflineAction {
    const action: OfflineAction = {
      id:
        "sync_" +
        Math.random().toString(36).substring(2, 11) +
        "_" +
        Date.now(),
      type,
      payload,
      timestamp: new Date().toISOString(),
      synced: false,
      retryCount: 0,
    };
    this.queue.push(action);
    this.saveQueue();
    return action;
  }

  public async syncWithServer(
    serverApiUrl = "/api/v1",
  ): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing) return { synced: 0, failed: 0 };
    const pending = this.queue.filter((a) => !a.synced);
    if (pending.length === 0) return { synced: 0, failed: 0 };

    this.isSyncing = true;
    this.notifyListeners();

    let syncedCount = 0;
    let failedCount = 0;

    for (const action of pending) {
      try {
        // Send batch or single sync action to backend sync controller
        const response = await fetch(`${serverApiUrl}/sync/push`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientActions: [
              {
                id: action.id,
                actionType: action.type,
                entityName: "ORDER",
                entityId: action.payload?.orderId || action.id,
                clientTimestamp: action.timestamp,
                data: action.payload,
              },
            ],
          }),
        });

        if (response.ok) {
          action.synced = true;
          syncedCount++;
        } else {
          action.retryCount++;
          failedCount++;
        }
      } catch (err) {
        action.retryCount++;
        failedCount++;
      }
    }

    // Keep only unsynced or clean up synced actions older than 24 hours
    this.queue = this.queue.filter((a) => !a.synced);
    this.saveQueue();
    this.isSyncing = false;
    this.notifyListeners();

    return { synced: syncedCount, failed: failedCount };
  }
}

export const syncEngine = new SyncEngine();
