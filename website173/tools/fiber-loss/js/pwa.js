(function(){
  if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
  window.addEventListener("load", () => {
    const base = document.querySelector('meta[name="app-base"]')?.content || "./";
    navigator.serviceWorker.register(base + "sw.js").catch(() => {});
  }, { once:true });
})();