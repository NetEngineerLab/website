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
        description: "PoE, telecom power, data-center cooling, capacity and change planning, plus optical checks, with the formula and limit on each page."
      }),
      zh: Object.freeze({
        title: "NetEngineerLab | 通信与网络工程工具",
        description: "PoE、通信电源、数据中心制冷、容量规划、变更规划与光链路校核工具，每页写明公式和适用范围。"
      }),
      es: Object.freeze({
        title: "NetEngineerLab | Herramientas de telecomunicaciones y redes",
        description: "PoE, energía, refrigeración de centros de datos, planificación de capacidad y cambios, y comprobaciones ópticas, con fórmula y límite en cada página."
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
