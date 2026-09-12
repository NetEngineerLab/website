# NetEngineerLab Español V1.3 — Auditoría de preparación

**Fecha:** 2026-09-12  
**Base:** `NetEngineerLab_OLT_Dual_Uplink_UI_UX_V1.2_Full_Project.zip`  
**Estado de publicación:** candidato de revisión; `es` continúa en `planned` y `noindex`.

## Cambios completados en V1.3

- Se materializó la estructura española completa para todas las rutas públicas actuales: inicio, páginas institucionales, directorio y 35 herramientas.
- Se corrigieron `header-es.html` y `footer-es.html` para eliminar fugas básicas de inglés en la interfaz global.
- Se corrigió el generador multilingüe para usar `Empezar a calcular` y `Directorio de herramientas de NetEngineerLab` cuando el locale es `es`.
- Se añadieron rutas `es` explícitas a los 10 instrumentos de la primera ola.
- Inicio, directorio, About, Contact, Privacy y Terms recibieron contenido español estático de primera ronda.
- Los 10 instrumentos de la primera ola recibieron título, encabezado, campos clave, acciones y terminología principal en español y se marcaron `nel-translation-status=review`.
- Se añadió `scripts/es-v1.3-audit.js` para impedir que la primera ola se publique por accidente antes de superar la revisión.

## Primera ola (10)

1. `fiber-loss`
2. `optical-power-budget`
3. `pon-splitter-loss`
4. `bandwidth-calculator`
5. `subnet-calculator`
6. `vlan-ip-capacity-planner`
7. `poe-power-budget-calculator`
8. `pue-data-center-energy-efficiency`
9. `ups-capacity-battery-runtime-calculator`
10. `wireless-link-budget-calculator`

## Bloqueo de activación

V1.3 **no cambia todavía** `es` de `planned` a `active`. Aún hay texto largo en inglés dentro de metodología, FAQ, referencias y algunos mensajes generados por JavaScript de los 10 instrumentos. Publicar esas páginas ahora produciría una experiencia mixta y páginas SEO parcialmente traducidas.

La activación debe hacerse solamente después de que:

- no quede texto de interfaz en inglés salvo nombres propios, estándares, siglas, fórmulas y unidades;
- los mensajes dinámicos de cada motor también estén localizados;
- `searchIntent`, `primaryTopic`, `longTailQuestions`, title y description sean españoles;
- `npm run validate:i18n`, page registry, SEO/GEO, sitemap y pruebas de motor pasen con `es=active`.

## Resultado de auditoría V1.3

La auditoría estructural de V1.3 pasa con `es=planned`, todas las páginas españolas conservadas en `noindex` y la primera ola marcada para revisión lingüística final.
