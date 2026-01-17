
/**
 * 📊 PARENT TRANSPARENCY DASHBOARD
 * Handles event logging for parental oversight and emotional tracking.
 */

export const logParentEvent = (childId: string, event: string, data: any) => {
    if (typeof window === 'undefined') return;
    // In production, this would sync to a secure backend or Firebase.
    // For MVP, we use localStorage with a parent-specific key.
    const key = `parent_logs_${childId}`;
    const logs = JSON.parse(localStorage.getItem(key) || "[]");
    logs.push({ timestamp: Date.now(), event, data });
    localStorage.setItem(key, JSON.stringify(logs.slice(-500))); // Keep last 500 events
};
