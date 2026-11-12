(function (window) {
  "use strict";

  window.NetEngineerLabSEO = Object.freeze({
    version: "1.9.0",
    siteName: "NetEngineerLab",
    origin: "https://netengineerlab.com",
    defaultLocale: "en",
    locales: Object.freeze({
      en: Object.freeze({ hreflang: "en", prefix: "" }),
      zh: Object.freeze({ hreflang: "zh-CN", prefix: "/zh" }),
      es: Object.freeze({ hreflang: "es", prefix: "/es" })
    }),
    defaults: Object.freeze({
      en: Object.freeze({
        title: "NetEngineerLab | Telecom and Network Engineering Tools",
        description: "Optical links, PoE, telecom power, data-center cooling, capacity planning and change checks, with the formula and the limit written on each page."
      }),
      zh: Object.freeze({
        title: "NetEngineerLab | 通信与网络工程工具",
        description: "光链路、PoE、通信电源、数据中心制冷、容量规划和变更校核工具，每页写明公式、单位和适用范围。"
      }),
      es: Object.freeze({
        title: "NetEngineerLab | Herramientas de telecomunicaciones e ingeniería de redes",
        description: "Herramientas profesionales para ingeniería óptica, PON, redes IP, PoE, energía, centro de datos y planificación inalámbrica."
      })
    }),
    socialImage: "/assets/images/og-netengineerlab.png",
    twitterCard: "summary_large_image",
    robots: "index,follow,max-image-preview:large,max-snippet:-1",
    enableCanonical: true,
    enableHreflang: true,
    enableOpenGraph: true,
    enableTwitter: true,
    enableWebPageSchema: true,
    debug: false
  });
})(window);
