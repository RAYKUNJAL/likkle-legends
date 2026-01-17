import { TANTY_CONFIG_VERSION } from "./tantyConfig";

/**
 * 🔊 ENHANCED VOICE CACHE SERVICE (IndexedDB + LRU + 50MB Limit)
 * Optimized for low-latency island wisdom.
 */

const DB_NAME = 'LikkleLegends_VoiceCache_v3';
const STORE_NAME = 'vocal_cache';
const META_STORE = 'cache_meta';
const MAX_CACHE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (typeof indexedDB === 'undefined') {
            reject(new Error("IndexedDB not supported"));
            return;
        }
        const request = indexedDB.open(DB_NAME, 3);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
            if (!db.objectStoreNames.contains(META_STORE)) db.createObjectStore(META_STORE);
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const getVoiceCacheKey = async (text: string, voice: string = 'Kore'): Promise<string> => {
    const msgUint8 = new TextEncoder().encode(`${voice}_${TANTY_CONFIG_VERSION}_${text.trim().toLowerCase()}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const getCachedAudio = async (text: string, voice: string = 'Kore'): Promise<ArrayBuffer | null> => {
    try {
        const db = await openDB();
        const key = await getVoiceCacheKey(text, voice);

        // Update Access Time for LRU
        const metaTx = db.transaction(META_STORE, 'readwrite');
        metaTx.objectStore(META_STORE).put(Date.now(), key);

        return new Promise((resolve) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const request = transaction.objectStore(STORE_NAME).get(key);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => resolve(null);
        });
    } catch (e) {
        return null;
    }
};

const evictOldest = async (db: IDBDatabase) => {
    const metaTx = db.transaction(META_STORE, 'readonly');
    const metaStore = metaTx.objectStore(META_STORE);
    const keys: { key: string, time: number }[] = [];

    return new Promise<void>((resolve) => {
        metaStore.openCursor().onsuccess = (e: any) => {
            const cursor = e.target.result;
            if (cursor) {
                keys.push({ key: cursor.key, time: cursor.value });
                cursor.continue();
            } else {
                keys.sort((a, b) => a.time - b.time);
                const toDelete = keys.slice(0, 5); // Evict 5 oldest at a time
                const delTx = db.transaction([STORE_NAME, META_STORE], 'readwrite');
                toDelete.forEach(item => {
                    delTx.objectStore(STORE_NAME).delete(item.key);
                    delTx.objectStore(META_STORE).delete(item.key);
                });
                resolve();
            }
        };
    });
};

export const setCachedAudio = async (text: string, buffer: ArrayBuffer, voice: string = 'Kore'): Promise<void> => {
    try {
        const db = await openDB();
        const key = await getVoiceCacheKey(text, voice);

        // Basic Size Management
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const countRequest = transaction.objectStore(STORE_NAME).count();

        countRequest.onsuccess = async () => {
            if (countRequest.result > 200) { // Rough heuristic for 50MB assuming ~250KB per audio
                await evictOldest(db);
            }

            const tx = db.transaction([STORE_NAME, META_STORE], 'readwrite');
            tx.objectStore(STORE_NAME).put(buffer, key);
            tx.objectStore(META_STORE).put(Date.now(), key);
        };
    } catch (e) {
        console.warn("[VOICE_CACHE] Failed to store audio", e);
    }
};

export const warmupVoiceCache = async (narrateFn: (text: string) => Promise<any>) => {
    const commonPhrases = [
        "Eh-eh, me sugar plum!",
        "Come in, me darlin'!",
        "Everything cook and curry!",
        "Mmm-hmmm!",
        "Lawd have mercy!",
        "Look at me star!",
        "Arite den!",
        "Doh study dat.",
        "Breathe deep wid Tanty.",
        "Stand tall like a coconut tree."
    ];

    for (const phrase of commonPhrases) {
        const cached = await getCachedAudio(phrase);
        if (!cached) {
            try { await narrateFn(phrase); } catch (e) { }
        }
    }
};
