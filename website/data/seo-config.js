(function (window) {
  "use strict";

  window.NetEngineerLabSEO = Object.freeze({
    version: "1.9.0",
    siteName: "NetEngineerLab",
    origin: "https://netengineerlab.com",
    defaultLocale: "en",
    locales: Object.freeze({
      en: Object.freeze({ hreflang: "en", prefix: "" }),
      zh: Object.freeze({ hreflang: "zh-CN", prefix: "/zh" })
    }),
    defaults: Object.freeze({
      en: Object.freeze({
        title: "NetEngineerLab | Telecom and Network Engineering Tools",
        description: "Professional tools for optical engineering, PON planning, OTDR analysis, MTU/MSS, IP subnet planning and bandwidth calculations."
      }),
      zh: Object.freeze({
        title: "NetEngineerLab | 通信与网络工程工具",
        description: "面向通信与网络工程师的光纤、PON、OTDR、MTU/MSS、IP地址规划和带宽计算工具。"
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
