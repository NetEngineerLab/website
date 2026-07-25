(function () {
  const cfg = window.NETENGINEERLAB_CONFIG?.adsense;
  const validClient = /^ca-pub-\d{10,20}$/.test(cfg?.client || "");
  if (!cfg?.enabled || !validClient) return;

  function loadAds() {
    if (!document.querySelector('script[data-nel-adsense]')) {
      const script = document.createElement("script");
      script.async = true;
      script.crossOrigin = "anonymous";
      script.dataset.nelAdsense = "true";
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(cfg.client);
      document.head.appendChild(script);
    }

    document.querySelectorAll("[data-ad-key]").forEach((host) => {
      const slot = cfg.slots?.[host.dataset.adKey];
      if (!/^\d{6,20}$/.test(slot || "")) return;
      host.hidden = false;
      host.classList.add("is-enabled");
      const ins = document.createElement("ins");
      ins.className = "adsbygoogle";
      ins.style.display = "block";
      ins.dataset.adClient = cfg.client;
      ins.dataset.adSlot = slot;
      ins.dataset.adFormat = "auto";
      ins.dataset.fullWidthResponsive = "true";
      host.querySelector(".ad-body").appendChild(ins);
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch {}
    });
  }

  if ("requestIdleCallback" in window) {
    requestIdleCallback(loadAds, { timeout: 3000 });
  } else {
    window.addEventListener("load", () => setTimeout(loadAds, 1000), { once: true });
  }
})();
