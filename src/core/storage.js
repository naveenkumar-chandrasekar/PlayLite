export const storage = {
    get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch {
            return null;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {}
    },
    remove(key) {
        localStorage.removeItem(key);
    }
};

export function notifyScoreUpdate() {
    document.dispatchEvent(new CustomEvent('scoreUpdate'));
}
