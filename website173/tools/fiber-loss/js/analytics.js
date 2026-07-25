(function () {
  const cfg = window.NETENGINEERLAB_CONFIG?.analytics;
  window.nelTrack = function (eventName, params = {}) {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params);
    }
  };
  if (!cfg?.enabled || !/^G-[A-Z0-9]+$/i.test(cfg.measurementId || "")) return;

  function loadAnalytics() {
    if (document.querySelector('script[data-nel-ga4]')) return;
    const script = document.createElement("script");
    script.async = true;
    script.dataset.nelGa4 = "true";
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.measurementId);
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", cfg.measurementId, { anonymize_ip: true });
  }

  if ("requestIdleCallback" in window) {
    requestIdleCallback(loadAnalytics, { timeout: 2500 });
  } else {
    window.addEventListener("load", () => setTimeout(loadAnalytics, 700), { once: true });
  }
})();
