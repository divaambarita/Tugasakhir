// Event system untuk trigger auto refresh
export const triggerDataRefresh = (type = "general") => {
  // Trigger custom event untuk memberitahu komponen bahwa data perlu di-refresh
  const event = new CustomEvent("dataUpdate", {
    detail: { type, timestamp: Date.now() },
  });
  window.dispatchEvent(event);

  // Juga simpan di localStorage sebagai backup
  localStorage.setItem(
    "lastDataUpdate",
    JSON.stringify({ type, timestamp: Date.now() })
  );
};
