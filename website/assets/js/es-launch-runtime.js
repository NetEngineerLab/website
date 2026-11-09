(function(){"use strict";
if((document.documentElement.dataset.nelLocale||"")!=="es"&&document.documentElement.lang!=="es")return;
const exact=new Map(Object.entries({"reference bandwidth invalid":"ancho de banda de referencia no válido","interfaces required":"se requiere al menos una interfaz","input type invalid":"tipo de entrada no válido",
"✓ Healthy":"✓ Correcto","⚠ Caution":"⚠ Precaución","✕ Failed":"✕ No cumple","Excellent":"Excelente","Good":"Bueno","Marginal":"Marginal","Not viable":"No viable","Invalid input":"Entrada no válida","Pass":"Cumple","Review":"Revisar","Insufficient":"Insuficiente","PASS":"CUMPLE","FAIL":"NO CUMPLE",
"Result copied":"Resultado copiado","Record saved":"Registro guardado","CSV exported":"CSV exportado","Clear all saved records?":"¿Borrar todos los registros guardados?","Clear all saved history?":"¿Borrar todo el historial guardado?","No saved records yet. Calculate and click “Save record”.":"Todavía no hay registros guardados. Calcula y pulsa «Guardar registro».","No saved calculations yet. Calculate and click “Save record”.":"Todavía no hay cálculos guardados. Calcula y pulsa «Guardar registro».",
"Check the input values and units.":"Comprueba los valores y las unidades introducidas.","Invalid input. Check all fields.":"Entrada no válida. Comprueba todos los campos.","Verify against actual traffic peaks and redundancy requirements.":"Verifica el resultado frente a los picos reales de tráfico y los requisitos de redundancia.",
"The optical budget is sufficient and receive power remains above the threshold.":"El presupuesto óptico es suficiente y la potencia recibida permanece por encima del umbral.","The link is usable but has limited engineering margin. Review splitter stages, connector count and ageing allowance.":"El enlace es utilizable, pero el margen de ingeniería es limitado. Revisa etapas de división, conectores y reserva por envejecimiento.","Budget is exceeded or receive power is below the threshold. Check splitter cascade, connector contamination, bending loss, splice quality and distance.":"El presupuesto se supera o la potencia recibida queda por debajo del umbral. Revisa cascada de divisores, contaminación, curvaturas, empalmes y distancia.",
"The standard ODN budget is sufficient and the receive-power window for minimum/maximum transmit power meets both limits.":"El presupuesto ODN estándar es suficiente y la ventana de potencia recibida para Tx mínima/máxima cumple ambos límites.","The link is usable but engineering or receiver-window margin is limited. Verify the transmit-power range, splitter stages and ageing allowance.":"El enlace es utilizable, pero el margen de ingeniería o de la ventana del receptor es limitado. Verifica potencia Tx, divisores y envejecimiento.","The design exceeds the budget, or a worst-case receive power is below sensitivity / above overload. Check transceiver specifications, splitter cascade, distance, contamination and bending loss.":"El diseño supera el presupuesto o la potencia recibida de peor caso queda por debajo de sensibilidad o por encima de sobrecarga. Revisa transceptores, divisores, distancia, contaminación y curvaturas.",
"UPS capacity, autonomy and redundancy checks passed for the entered assumptions.":"Las comprobaciones de capacidad, autonomía y redundancia de la UPS cumplen con las hipótesis introducidas.","Warnings: ":"Advertencias: ",
"Fade margin is below the 10 dB screening level.":"El margen de desvanecimiento está por debajo del nivel de cribado de 10 dB.","Obstacle clearance is below 60% of the first Fresnel zone.":"El despeje del obstáculo es inferior al 60% de la primera zona de Fresnel.","Check the applicable local EIRP limit.":"Comprueba el límite EIRP aplicable en la jurisdicción.","60 GHz links have substantial atmospheric oxygen absorption; add it as extra loss.":"Los enlaces de 60 GHz presentan una absorción importante por oxígeno; añádela como pérdida adicional.",
"Enter finite values: distance and frequency must be positive; losses and clearance cannot be negative; obstacle position must be between 0% and 100%.":"Introduce valores finitos: distancia y frecuencia deben ser positivas; pérdidas y despeje no pueden ser negativos; la posición del obstáculo debe estar entre 0% y 100%.",
"Network":"Red","Host":"Host","Interface ID":"ID de interfaz","No subnet requirements yet.":"Todavía no hay requisitos de subred.","Subnet name":"Nombre de subred","Host requirement":"Necesidad de hosts","Reserved addresses":"Direcciones reservadas","Allocation failed":"No se pudo asignar",
"Project":"Proyecto","Physical loss":"Pérdida física","Design loss":"Pérdida de diseño","Budget remaining":"Presupuesto restante","Remaining budget":"Presupuesto restante","Remaining":"Restante","Estimated receive power":"Potencia recibida estimada","Receiver margin":"Margen del receptor","Status":"Estado","Standard ODN budget":"Presupuesto ODN estándar","Raw Tx/Rx window":"Ventana Tx/Rx bruta","Optical path penalty":"Penalización del trayecto óptico","Estimated receive-power range":"Rango estimado de potencia recibida","Estimated maximum distance":"Distancia máxima estimada","Ratio":"Relación","Total split ratio":"Relación total","Splitter loss":"Pérdida de divisores","Physical ODN loss":"Pérdida física ODN","Design ODN loss":"Pérdida de diseño ODN","Effective max distance":"Distancia máxima efectiva",
"Workflow start":"Inicio del flujo","Step":"Paso","Previous":"Anterior","Next":"Siguiente","Related tools":"Herramientas relacionadas","Also used in":"También se utiliza en","Total overhead":"Sobrecarga total","Recommended TCP MSS":"MSS TCP recomendado","Actual TCP data with options":"Datos TCP reales con opciones","Maximum UDP payload":"Carga UDP máxima","Encapsulation layer":"Capa de encapsulación","Bytes per layer":"Bytes por capa","Count":"Cantidad","Remove":"Eliminar","Physical link":"Enlace físico","Effective inner IP":"IP interna efectiva","Engineering gate":"Puerta de ingeniería","No additional encapsulation is configured.":"No se ha configurado encapsulación adicional.","No material risk was found with the current inputs.":"No se detectó riesgo material con las entradas actuales.","Total addresses":"Total de direcciones","Binary View":"Vista binaria","IPv6 prefix":"Prefijo IPv6","Total payload size":"Tamaño total de carga","Engineered per-user bitrate":"Velocidad diseñada por usuario","Effective inner MTU":"MTU interna efectiva","Recommended TCP MSS":"MSS TCP recomendado","Actual TCP data with options":"Datos TCP reales con opciones","Maximum UDP payload":"Carga UDP máxima","Physical link":"Enlace físico","Effective inner IP":"IP interna efectiva","Base underlay MTU":"MTU base subyacente","Strict VLAN deduction":"Deducción VLAN estricta","Total encapsulation overhead":"Sobrecarga total de encapsulación","Encapsulation layer":"Capa de encapsulación","Bytes per layer":"Bytes por capa","No additional encapsulation is configured.":"No hay encapsulación adicional configurada.","Check the input values and units.":"Comprueba los valores y las unidades introducidas.","Invalid input. Check all fields.":"Entrada no válida. Comprueba todos los campos.","Result copied":"Resultado copiado","Record saved":"Registro guardado","CSV exported":"CSV exportado","Configuration passes":"Configuración correcta","Review required":"Revisión necesaria","Invalid input":"Entrada no válida","Current workflow":"Flujo de trabajo actual",
"Build an optical link from physical loss assumptions through split planning, power budget and maximum reach verification.":"Construye un enlace óptico desde las hipótesis de pérdida física, pasando por divisores y presupuesto, hasta verificar el alcance máximo.","Plan multi-stage splitting and calculate total ratio, insertion loss and effective reach.":"Planifica división multietapa y calcula relación total, pérdida de inserción y alcance efectivo.","Verify an optical link using transmit power, receiver sensitivity, optical penalty and ODN loss.":"Verifica un enlace óptico con potencia de transmisión, sensibilidad del receptor, penalización óptica y pérdida ODN.","Analyze multiple events and dual wavelengths to identify splices, connectors, bends, breaks, ghosts and dead-zone effects.":"Analiza eventos y dos longitudes de onda para identificar empalmes, conectores, curvaturas, roturas, ecos y efectos de zona muerta.",
"Plan IPv6 prefixes, NAT44 capacity, deterministic CGNAT blocks, NAT64 and DNS64 addressing.":"Planifica prefijos IPv6, capacidad NAT44, bloques CGNAT deterministas y direccionamiento NAT64/DNS64.","Plan VLAN count, IPv4 prefix, address capacity and growth headroom.":"Planifica cantidad de VLAN, prefijo IPv4, capacidad de direcciones y margen de crecimiento.","Generate, convert and validate IPv4 ACLs for Cisco IOS, Huawei VRP, H3C Comware and Juniper Junos.":"Genera, convierte y valida ACL IPv4 para Cisco IOS, Huawei VRP, H3C Comware y Juniper Junos.",
"Estimate bidirectional RF coverage, AP count, user capacity, throughput and channel reuse.":"Estima cobertura RF bidireccional, cantidad de AP, capacidad de usuarios, rendimiento y reutilización de canales.","Size PoE switches by watts, ports, cable loss, headroom and IEEE 802.3af/at/bt device limits.":"Dimensiona switches PoE por vatios, puertos, pérdida de cable, margen y límites IEEE 802.3af/at/bt.","Calculate rack power, current, cooling load, energy and cost.":"Calcula potencia y corriente de rack, carga térmica, energía y coste.","Calculate telecom DC battery runtime, required Ah, parallel strings and constant-power current rise.":"Calcula autonomía de batería DC, Ah necesarios, cadenas en paralelo y aumento de corriente con carga de potencia constante.","Calculate data-center sensible heat, N+1 precision cooling capacity, BTU/h, refrigeration tons and airflow from IT and facility loads.":"Calcula calor sensible, capacidad N+1 de refrigeración de precisión, BTU/h, toneladas de refrigeración y caudal de aire.","Analyze PUE, non-IT overhead, annual energy cost, target-PUE savings, WUE/CUE and monthly trends.":"Analiza PUE, sobrecarga no IT, coste anual, ahorro por PUE objetivo, WUE/CUE y tendencias mensuales.",
"Optical Link Design Workflow":"Flujo de diseño de enlace óptico","Optical Fault Isolation Workflow":"Flujo de aislamiento de fallos ópticos","Enterprise LAN & IP Planning Workflow":"Flujo de planificación LAN e IP empresarial","Wireless Access Deployment Workflow":"Flujo de despliegue de acceso inalámbrico","Data Center Critical Power & Cooling Workflow":"Flujo de energía crítica y refrigeración de centro de datos","PoE & Rack Power Design Workflow":"Flujo de diseño PoE y potencia de rack",
"PON Splitter Loss Calculator":"Calculadora de pérdidas de divisores PON","Optical Power Budget Calculator":"Calculadora de presupuesto de potencia óptica","Fiber Loss Calculator":"Calculadora de pérdidas de fibra","PON Maximum Distance Calculator":"Calculadora de distancia máxima PON","ONU RX Power Diagnosis":"Diagnóstico de potencia RX de ONU","OTDR Event Analyzer":"Analizador de eventos OTDR","IPv6 & NAT Planning Calculator":"Calculadora de planificación IPv6 y NAT","VLAN & IP Subnet Capacity Planner":"Planificador de capacidad VLAN y subredes IP","IP Subnet Calculator":"Calculadora de subredes IP","PoE Power Budget Calculator":"Calculadora de presupuesto de potencia PoE","Wi-Fi Coverage & Capacity Planner":"Planificador de cobertura y capacidad Wi‑Fi","Bandwidth & Transfer Time Calculator":"Calculadora de ancho de banda y tiempo de transferencia","Network Rack Power & Cooling Calculator":"Calculadora de potencia y refrigeración de rack","Generator + UPS Transfer & Ride-Through Planner":"Planificador de transferencia y continuidad Generador + UPS","Data Center Cooling Load & Precision AC Capacity Calculator":"Calculadora de carga térmica y climatización de precisión","PUE & Data Center Energy Efficiency Analyzer":"Analizador de PUE y eficiencia energética del centro de datos"
}));
// Exact, evidence-backed dynamic UI terms from the domain tools.
for(const [key,value] of Object.entries({
  "2 V VRLA telecom cells": "Elementos VRLA de telecomunicaciones de 2 V",
  "2 V vented lead-acid cells": "Elementos abiertos de plomo-ácido de 2 V",
  "48 V-class LiFePO₄ module (15S reference)": "Módulo LiFePO₄ de clase 48 V (referencia 15S)",
  "Custom battery bank": "Banco de baterías personalizado",
  "Compact OLT / access shelf": "OLT compacta / bastidor de acceso",
  "OLT chassis": "Chasis OLT",
  "BBU / baseband unit": "BBU / unidad de banda base",
  "Optical transport shelf": "Bastidor de transporte óptico",
  "Core switch / router": "Switch / router de núcleo",
  "Environment monitoring and auxiliaries": "Monitorización ambiental y auxiliares",
  "Custom equipment": "Equipo personalizado",
  "Base DC load power (nominal-voltage conversion)": "Potencia base de carga CC (conversión a tensión nominal)",
  "Battery-side power": "Potencia del lado de la batería",
  "Average discharge voltage": "Tensión media de descarga",
  "Average current per string": "Corriente media por cadena",
  "Total nameplate capacity": "Capacidad nominal total",
  "Combined usable factor": "Factor útil combinado",
  "Peak rack load (kW)": "Carga pico por rack (kW)",
  "Growth scenario (%)": "Escenario de crecimiento (%)",
  "Conservative uplift (%)": "Incremento conservador (%)",
  "Containment closure (%)": "Cierre de contención (%)",
  "Row-end leakage (%)": "Fugas en extremos de fila (%)",
  "Floor delivery effectiveness (%)": "Eficacia de suministro por suelo (%)",
  "Require N+2 acceptance": "Exigir comprobación N+2",
  "No material warnings": "Sin advertencias importantes",
  "Download JSON report": "Descargar informe JSON",
  "Download CSV check": "Descargar comprobación CSV",
  "Download CSV check sheet": "Descargar hoja de comprobación CSV",
  "Print engineering report": "Imprimir informe de ingeniería",
  "UPS losses in room (kW)": "Pérdidas del UPS en la sala (kW)",
  "Engineering scenarios & environment": "Escenarios de ingeniería y entorno",
  "Peak IT load (kW)": "Carga TI pico (kW)",
  "Conservative-case IT load (kW)": "Carga TI del caso conservador (kW)",
  "Additional scenario sensible load (kW)": "Carga sensible adicional del escenario (kW)",
  "Relative humidity (%)": "Humedad relativa (%)",
  "1 unit failed": "1 unidad averiada",
  "Scenarios & plan": "Escenarios y plan",
  "Baseline and conservative-case comparison": "Comparación de referencia y caso conservador",
  "Healthy": "Correcto",
  "HEALTHY": "CORRECTO",
  "Low": "Bajo",
  "LOW": "BAJO",
  "Medium": "Medio",
  "MEDIUM": "MEDIO",
  "High": "Alto",
  "HIGH": "ALTO",
  "WARNING": "ADVERTENCIA",
  "CRITICAL": "CRÍTICO",
  "BALANCED": "EQUILIBRADO",
  "OVER": "SUPERA EL LÍMITE",
  "North-south egress": "Salida norte-sur",
  "Access / leaf fabric": "Fabric de acceso / leaf",
  "Upper / core layer": "Nivel superior / núcleo",
  "DC output": "Salida CC",
  "vs mean": "respecto a la media",
  "No history supplied; using manual growth.": "Sin observaciones históricas; se usa el crecimiento manual.",
  "Before status": "Estado antes",
  "After status": "Estado después",
  "After likelihood": "Probabilidad después",
  "After impact": "Impacto después",
  "No abnormal item. Unverified items still cannot be declared safe.": "No hay elementos anómalos. Los elementos sin verificar no pueden declararse seguros.",
  "AC feeder": "Alimentador CA",
  "Phase": "Fases",
  "Single phase": "Monofásica",
  "Three phase": "Trifásica",
  "Conversion efficiency (%)": "Eficiencia de conversión (%)",
  "Combined derating available (%)": "Capacidad disponible tras reducción conjunta (%)",
  "Load growth (%)": "Crecimiento de carga (%)",
  "Recharge peak uplift (%)": "Incremento pico de recarga (%)",
  "Extra conservative reserve (percentage points)": "Reserva conservadora adicional (puntos porcentuales)",
  "Ambient temperature (°C)": "Temperatura ambiente (°C)",
  "Altitude (m)": "Altitud (m)",
  "Derating per 10°C above 25°C (%)": "Reducción por cada 10 °C por encima de 25 °C (%)",
  "Derating per 1000 m above sea level (%)": "Reducción por cada 1000 m sobre el nivel del mar (%)",
  "Frame maximum modules (0 = unknown)": "Máximo de módulos del bastidor (0 = desconocido)",
  "Installed module slots (0 = unknown)": "Ranuras de módulo instaladas (0 = desconocido)",
  "Target utilization (%)": "Utilización objetivo (%)",
  "Modules used in checks": "Módulos usados en las comprobaciones",
  "Worst-case utilization": "Utilización del peor caso",
  "N-1 physical capacity": "Capacidad física N-1",
  "N-2 physical capacity": "Capacidad física N-2",
  "Worst-case operating AC power": "Potencia CA operativa del peor caso",
  "Worst-case operating AC current": "Corriente CA operativa del peor caso",
  "All selected-policy checks passed": "Se cumplen todas las comprobaciones de la política seleccionada",
  "Operating scenarios": "Escenarios operativos",
  "Scenario": "Escenario",
  "Required A": "Corriente requerida (A)",
  "Capacity A": "Capacidad (A)",
  "Utilization": "Utilización",
  "Target reserve": "Reserva objetivo",
  "Baseline": "Referencia",
  "Peak": "Pico",
  "Conservative": "Conservador",
  "baseline": "referencia",
  "peak": "pico",
  "conservative": "conservador",
  "Load growth": "Crecimiento de carga",
  "Recharge peak": "Pico de recarga",
  "Growth + recharge peak": "Crecimiento + pico de recarga",
  "Combined + conservative reserve": "Combinado + reserva conservadora",
  "Modules": "Módulos",
  "Recharge A": "Recarga (A)",
  "N-1 margin A": "Margen N-1 (A)",
  "N-2 margin A": "Margen N-2 (A)",
  "Installation": "Instalación",
  "Current / Before": "Actual / antes",
  "Recharge-limited adjustment": "Ajuste con recarga limitada",
  "Expansion / After": "Ampliación / después",
  "Within known limits": "Dentro de los límites conocidos",
  "Expansion planning checklist": "Lista de planificación de ampliación",
  "Report inputs": "Entradas del informe",
  "Download CSV checks": "Descargar comprobaciones CSV",
  "Download planning checklist": "Descargar lista de planificación",
  "Base system efficiency": "Eficiencia base del sistema",
  "Base backup autonomy": "Autonomía base de respaldo",
  "Allowed DOD": "Profundidad de descarga permitida",
  "4. Supply scenario & economics": "4. Escenario de suministro y economía",
  "Supply scenario": "Escenario de suministro",
  "Electricity tariff": "Tarifa eléctrica",
  "currency/kWh": "moneda/kWh",
  "PV CAPEX": "Inversión inicial FV",
  "currency/kWp": "moneda/kWp",
  "Generador yield": "Rendimiento del generador",
  "Net PV efficiency": "Eficiencia neta FV",
  "Stringing": "Configuración de cadenas",
  "Existing PV gap": "Déficit de FV existente",
  "Generation & supply balance": "Balance de generación y suministro",
  "Daily surplus / deficit": "Excedente / déficit diario",
  "Economics & emissions": "Economía y emisiones",
  "Annual energy saving value": "Valor anual del ahorro energético",
  "Simple payback": "Retorno simple de la inversión",
  "Equivalent diesel avoided": "Diésel equivalente evitado",
  "Ring model & traffic matrix": "Modelo de anillo y matriz de tráfico",
  "Ring nodes": "Nodos del anillo",
  "highBypass": "Bypass elevado",
  "highRecirculation": "Recirculación elevada",
  "endRowLeakage": "Fugas elevadas en extremos de fila",
  "lowContainmentClosure": "Cierre de contención insuficiente",
  "floorDeliveryLoss": "Eficacia de suministro por suelo insuficiente",
  "inletTemperature": "Temperatura de entrada fuera del límite",
  "n1Fail": "No se cumple N+1",
  "n2Fail": "No se cumple N+2",
  "airflowDeficit": "Caudal insuficiente",
  "coolingDeficit": "Capacidad sensible insuficiente"
}))exact.set(key,value);

// Calculator copy that the shared en/zh scripts render at runtime on Spanish pages.
for(const [en,es] of Object.entries({"Enter real engineering parameters to calculate the link loss.":"Introduzca parámetros reales de ingeniería para calcular la pérdida del enlace.","The splitter cascade remains within the current standard ODN budget, and the receive window for minimum/maximum transmit power meets the design margin.":"La cascada de divisores se mantiene dentro del presupuesto ODN estándar actual y la ventana de recepción para la potencia de transmisión mínima/máxima cumple el margen de diseño.","✓ Normal":"✓ Normal","⚠ Weak-light caution":"⚠ Precaución por señal débil","✕ Critical weak light":"✕ Señal críticamente débil","⚡ Optical overload":"⚡ Sobrecarga óptica","○ Possible no signal":"○ Posible ausencia de señal","Check inputs. Counts must be non-negative integers; attenuation must be positive; splitter loss must be supported; no-signal must be below sensitivity, and sensitivity below overload.":"Revise las entradas. Las cantidades deben ser enteros no negativos; la atenuación debe ser positiva; la pérdida del divisor debe estar admitida; el umbral sin señal debe estar por debajo de la sensibilidad y la sensibilidad por debajo de la sobrecarga.","No saved records yet.":"Todavía no hay registros guardados.","Measured receive power is inside the receiver window with adequate margin. If service is still abnormal, check ONU registration, errors, optics and service configuration.":"La potencia recibida medida está dentro de la ventana del receptor con margen suficiente. Si el servicio sigue fallando, revise el registro de la ONU, los errores, los ópticos y la configuración del servicio.","Measured power remains above sensitivity, but margin is limited. Schedule proactive maintenance and inspect connectors, bending, splitter cascade and splices.":"La potencia medida sigue por encima de la sensibilidad, pero el margen es limitado. Programe un mantenimiento preventivo e inspeccione conectores, curvaturas, cascada de divisores y empalmes.","Measured power is below receiver sensitivity and may cause drops, registration failure or errors. Locate excess loss or splitter design problems promptly.":"La potencia medida está por debajo de la sensibilidad del receptor y puede causar caídas, fallos de registro o errores. Localice cuanto antes la pérdida excesiva o los problemas de diseño de divisores.","Measured power exceeds the receiver overload threshold and may saturate the receiver. Verify optical class, short-reach direct links and attenuation requirements.":"La potencia medida supera el umbral de sobrecarga del receptor y puede saturarlo. Verifique la clase óptica, los enlaces directos de corto alcance y la necesidad de atenuación.","The measured value reaches the possible no-signal threshold. Check fiber breaks, disconnected connectors, wrong ports, OLT laser faults, severe bending or splitter failure.":"El valor medido alcanza el umbral de posible ausencia de señal. Revise roturas de fibra, conectores desconectados, puertos incorrectos, fallos del láser de la OLT, curvaturas severas o fallos del divisor.","Check ONU online and registration logs":"Revise el estado en línea y los registros de alta de la ONU","Check errors, packet loss and service settings":"Revise errores, pérdida de paquetes y configuración del servicio","Confirm that measured power is stable":"Confirme que la potencia medida es estable","Clean SC/APC connectors and adapters":"Limpie los conectores y adaptadores SC/APC","Inspect drop cable bending or crushing":"Inspeccione curvaturas o aplastamientos del cable de acometida","Review splitter cascade and ports":"Revise la cascada de divisores y sus puertos","Retest splices and patch cords":"Vuelva a medir empalmes y latiguillos","Use OTDR to locate excess loss or breaks":"Use el OTDR para localizar pérdidas excesivas o roturas","Inspect feeder, distribution and drop sections":"Inspeccione los tramos de alimentación, distribución y acometida","Verify split ratio against design":"Verifique la relación de división frente al diseño","Check OLT transmit power and ONU threshold":"Revise la potencia de transmisión de la OLT y el umbral de la ONU","Verify optical module class compatibility":"Verifique la compatibilidad de clase del módulo óptico","Avoid high-power short direct connections":"Evite conexiones directas cortas con ópticos de alta potencia","Add a suitable attenuator when required":"Añada un atenuador adecuado cuando sea necesario","Confirm measurement point and meter range":"Confirme el punto de medida y el rango del medidor","Confirm that the OLT port is transmitting":"Confirme que el puerto de la OLT está emitiendo","Verify patching and port mapping":"Verifique el parcheo y la correspondencia de puertos","Inspect breaks, disconnections and severe bends":"Inspeccione roturas, desconexiones y curvaturas severas","Use a VFL or OTDR for sectional testing":"Use un VFL o un OTDR para pruebas por tramos","✓ Design passes":"✓ El diseño cumple","⚠ Physical reach only":"⚠ Solo alcance físico","✕ Insufficient budget":"✕ Presupuesto insuficiente","◇ System reach limited":"◇ Alcance limitado por el sistema","Check inputs. Distances, attenuation and losses must be valid; counts must be non-negative integers, splitter loss must be supported, and sensitivity must be below overload.":"Revise las entradas. Las distancias, la atenuación y las pérdidas deben ser válidas; las cantidades deben ser enteros no negativos, la pérdida del divisor debe estar admitida y la sensibilidad debe estar por debajo de la sobrecarga.","Limiting factor: optical power budget. Passive losses and engineering margin determine the available reach.":"Factor limitante: presupuesto de potencia óptica. Las pérdidas pasivas y el margen de ingeniería determinan el alcance disponible.","Limiting factor: system/protocol reach. The optical budget permits a longer route, but effective reach is capped by system capability.":"Factor limitante: alcance del sistema/protocolo. El presupuesto óptico permite una ruta más larga, pero el alcance efectivo está limitado por la capacidad del sistema.","Optical-budget reach and system reach are approximately equal.":"El alcance por presupuesto óptico y el alcance del sistema son aproximadamente iguales.","The planned distance is within the effective maximum reach and retains the configured engineering margin.":"La distancia planificada está dentro del alcance máximo efectivo y conserva el margen de ingeniería configurado.","The planned link is physically within the equipment budget, but the full engineering margin is not retained. Reduce distance or passive loss.":"El enlace planificado está físicamente dentro del presupuesto del equipo, pero no conserva todo el margen de ingeniería. Reduzca la distancia o la pérdida pasiva.","Physical link loss at the planned distance exceeds the maximum channel budget, so receive power falls below sensitivity.":"La pérdida física del enlace a la distancia planificada supera el presupuesto máximo del canal, por lo que la potencia recibida cae por debajo de la sensibilidad.","The optical budget supports the planned route, but effective reach is controlled by the configured system/protocol limit.":"El presupuesto óptico admite la ruta planificada, pero el alcance efectivo lo controla el límite configurado del sistema/protocolo.","Confirm that the actual route matches the planned distance":"Confirme que la ruta real coincide con la distancia planificada","Retain margin for maintenance, ageing and temperature":"Conserve margen para mantenimiento, envejecimiento y temperatura","Verify with a power meter and OTDR after deployment":"Verifique con un medidor de potencia y un OTDR tras el despliegue","Reduce splitter cascade or use lower-loss components":"Reduzca la cascada de divisores o use componentes de menor pérdida","Optimize connector and splice count":"Optimice el número de conectores y empalmes","Increase budget or shorten the route":"Aumente el presupuesto o acorte la ruta","Reduce total split ratio or cascade stages":"Reduzca la relación de división total o las etapas en cascada","Shorten the route or use lower-attenuation fiber":"Acorte la ruta o use fibra de menor atenuación","Verify minimum transmit power and sensitivity":"Verifique la potencia mínima de transmisión y la sensibilidad","Review fixed-loss assumptions":"Revise las hipótesis de pérdidas fijas","Verify maximum logical/ranging capability":"Verifique la capacidad máxima lógica/de medición de distancia","Check OLT port and profile configuration":"Revise la configuración del puerto y del perfil de la OLT","Do not use optical budget as the only reach criterion":"No use el presupuesto óptico como único criterio de alcance","Attention":"Atención","Abnormal":"Anómalo","Critical":"Crítico","Auto detect":"Detección automática","Splice event":"Evento de empalme","Reflective connector":"Conector reflectivo","Mechanical / reflective fault":"Fallo mecánico / reflectivo","Possible bend":"Posible curvatura","Fiber end / possible break":"Fin de fibra / posible rotura","Possible ghost":"Posible fantasma","Unknown event":"Evento desconocido","Event type selected manually":"Tipo de evento seleccionado manualmente","Near the configured link end with high loss or strong reflection":"Cerca del extremo configurado del enlace, con pérdida alta o reflexión fuerte","Position is close to a multiple of an earlier strong reflection and event loss is small":"La posición se acerca a un múltiplo de una reflexión fuerte anterior y la pérdida del evento es pequeña","Secondary-wavelength loss is significantly higher than primary-wavelength loss":"La pérdida en la longitud de onda secundaria es bastante mayor que en la principal","Reflective event with elevated insertion loss":"Evento reflectivo con pérdida de inserción elevada","Reflective event detected":"Evento reflectivo detectado","Low-loss non-reflective event":"Evento no reflectivo de baja pérdida","Non-reflective event above the normal splice-loss default":"Evento no reflectivo por encima del valor normal de pérdida de empalme","Record and monitor; immediate action is normally unnecessary.":"Registre y vigile; normalmente no se requiere acción inmediata.","Retest the event and review splice quality and bidirectional differences.":"Vuelva a medir el evento y revise la calidad del empalme y las diferencias bidireccionales.","Schedule resplicing or field retest and inspect the closure and nearby bends.":"Programe un reempalme o una nueva medida en campo e inspeccione la caja de empalmes y las curvaturas cercanas.","Prioritize resplicing and verify with bidirectional OTDR; replace damaged fiber if required.":"Priorice el reempalme y verifique con OTDR bidireccional; sustituya la fibra dañada si es necesario.","Clean the connector and record reflectance.":"Limpie el conector y registre la reflectancia.","Clean the end face and inspect the adapter and ferrule match.":"Limpie la cara del conector e inspeccione el adaptador y el ajuste de la férula.","Inspect contamination, damage, UPC/APC mismatch and loose connection.":"Inspeccione contaminación, daños, mezcla UPC/APC y conexiones flojas.","Correct the strong reflection or excessive insertion loss immediately.":"Corrija de inmediato la reflexión fuerte o la pérdida de inserción excesiva.","Review and document the mechanical joint.":"Revise y documente el empalme mecánico.","Inspect the joint, index-matching material and connection stability.":"Inspeccione el empalme, el gel adaptador de índice y la estabilidad de la conexión.","Rebuild the joint or replace it with a fusion splice.":"Rehaga el empalme o sustitúyalo por un empalme por fusión.","Prioritize the high-loss reflective joint and retest adjacent events.":"Priorice el empalme reflectivo de alta pérdida y vuelva a medir los eventos adyacentes.","Review the cable route.":"Revise el trazado del cable.","Inspect bend radius, drop cable and patch-cord routing.":"Inspeccione el radio de curvatura, el cable de acometida y el recorrido de los latiguillos.","Release bending or compression and compare 1310/1550 nm results.":"Elimine la curvatura o la compresión y compare los resultados a 1310/1550 nm.","Correct the severe bend or compression point before the link deteriorates further.":"Corrija la curvatura severa o el punto de compresión antes de que el enlace empeore.","Confirm the planned link end.":"Confirme el extremo planificado del enlace.","Verify that the event is a normal end and review end reflection.":"Verifique que el evento es un final normal y revise la reflexión final.","Check for a break, disconnection, wrong port or end connector.":"Compruebe si hay rotura, desconexión, puerto incorrecto o conector final.","Perform sectional testing with a VFL, power meter and OTDR to locate the break.":"Realice pruebas por tramos con VFL, medidor de potencia y OTDR para localizar la rotura.","Reduce pulse width and retest.":"Reduzca el ancho de pulso y vuelva a medir.","Inspect the strong reflector and adjust range, pulse width and averaging.":"Inspeccione el reflector fuerte y ajuste rango, ancho de pulso y promediado.","Check whether the event moves with test settings before treating it as a real fault.":"Compruebe si el evento se desplaza con los ajustes de medida antes de tratarlo como un fallo real.","Correct the earlier strong reflection before interpreting remote events.":"Corrija la reflexión fuerte anterior antes de interpretar eventos lejanos.","Record the event.":"Registre el evento.","Adjust test settings and retest.":"Ajuste la configuración de medida y vuelva a medir.","Use the trace, bidirectional testing and route records to identify the event.":"Use la traza, las pruebas bidireccionales y los registros de ruta para identificar el evento.","Schedule field localization and verify the physical topology.":"Programe la localización en campo y verifique la topología física.","Spacing from the previous event is below the attenuation-dead-zone default; measured loss may be affected by event overlap.":"La separación con el evento anterior es inferior a la zona muerta de atenuación por defecto; la pérdida medida puede verse afectada por el solapamiento de eventos.","Spacing from the previous event is below the event-dead-zone default; reflective events may not be fully separated.":"La separación con el evento anterior es inferior a la zona muerta de evento por defecto; los eventos reflectivos pueden no separarse por completo.","Template exported":"Plantilla exportada","No saved records.":"No hay registros guardados.","CSV import complete":"Importación CSV completada","The CSV format is invalid or contains no valid events.":"El formato CSV no es válido o no contiene eventos válidos.","Clear all events?":"¿Borrar todos los eventos?","Add at least one valid event.":"Añada al menos un evento válido.","Enter parameters and calculate.":"Introduzca los parámetros y calcule.","Please check the highlighted input fields.":"Revise los campos de entrada resaltados.","hours":"horas","days":"días","Target met":"Objetivo cumplido","Target not met":"Objetivo no cumplido","Estimated runtime":"Autonomía estimada","Simplified Ah/energy model":"Modelo simplificado Ah/energía","Peukert-adjusted estimate":"Estimación corregida por Peukert","Result copied.":"Resultado copiado.","Record saved.":"Registro guardado.","History cleared.":"Historial borrado.","No saved project records.":"No hay registros de proyecto guardados.","Equipment":"Equipo","Qty":"Cant.","Unit current":"Corriente unitaria","Total current":"Corriente total","Remove":"Quitar","The per-string discharge rate is high. Manufacturer constant-power or constant-current discharge tables are essential.":"La tasa de descarga por cadena es alta. Las tablas de descarga del fabricante a potencia o corriente constante son imprescindibles.","The discharge rate is above a light standby rate; verify the selected battery's published discharge table.":"La tasa de descarga supera la de un respaldo ligero; verifique la tabla de descarga publicada de la batería seleccionada.","The estimated runtime is shorter than the target runtime.":"La autonomía estimada es inferior a la autonomía objetivo.","For a constant-power load, battery current rises materially as the bus approaches cutoff voltage.":"Con una carga de potencia constante, la corriente de la batería aumenta notablemente cuando el bus se acerca a la tensión de corte.","Five or more parallel strings require careful current sharing, protection, cabling and maintenance design.":"Cinco o más cadenas en paralelo requieren un diseño cuidadoso de reparto de corriente, protección, cableado y mantenimiento.","The remaining-capacity factor is below 70%; replacement risk should be reviewed.":"El factor de capacidad restante es inferior al 70 %; debe revisarse el riesgo de sustitución.","The temperature factor significantly reduces available capacity.":"El factor de temperatura reduce de forma significativa la capacidad disponible.","The selected usable depth exceeds 80% for a lead-acid preset. Confirm cycle life and end-voltage requirements.":"La profundidad útil seleccionada supera el 80 % para un preajuste de plomo-ácido. Confirme la vida en ciclos y los requisitos de tensión final.","For lithium systems, verify BMS cutoff, module parallel limits, current sharing and vendor runtime data.":"En sistemas de litio, verifique el corte del BMS, los límites de módulos en paralelo, el reparto de corriente y los datos de autonomía del fabricante.","Peukert correction is an engineering estimate. Constant-power ICT loads and real discharge curves may differ.":"La corrección de Peukert es una estimación de ingeniería. Las cargas TIC de potencia constante y las curvas reales de descarga pueden diferir.","Final sizing must be checked against manufacturer discharge data at the required end voltage and temperature.":"El dimensionamiento final debe comprobarse con los datos de descarga del fabricante a la tensión final y la temperatura requeridas.","A -48 V DC load has no AC power factor input. Use DC watts or DC amperes; path efficiency represents DC losses.":"Una carga de -48 V CC no tiene factor de potencia de CA. Use vatios o amperios de CC; la eficiencia del trayecto representa las pérdidas de CC.","Base DC load current":"Corriente base de la carga CC","Design current with margin":"Corriente de diseño con margen","Design power with margin":"Potencia de diseño con margen","The client-to-AP uplink is the coverage bottleneck. Client transmit power often limits the practical cell edge.":"El enlace ascendente del cliente al AP es el cuello de botella de cobertura. La potencia de transmisión del cliente suele limitar el borde práctico de la celda.","No saved results":"No hay resultados guardados","Required values are valid":"Los valores obligatorios son válidos","Not assessed (optional)":"No evaluado (opcional)","Optical budget passes; confirm vendor coding, firmware, FEC and DOM before deployment.":"El presupuesto óptico cumple; confirme la codificación del fabricante, el firmware, FEC y DOM antes del despliegue.","The design meets port-count, total-budget and per-port power requirements.":"El diseño cumple los requisitos de número de puertos, presupuesto total y potencia por puerto.","Validate DHCP, gateway HA, VRF and fault-domain assumptions before deployment.":"Valide las hipótesis de DHCP, alta disponibilidad de pasarela, VRF y dominios de fallo antes del despliegue.","A common planning target keeps continuous load at or below 80% of the breaker or PDU rating. Verify local code and equipment documentation.":"Un objetivo habitual de planificación mantiene la carga continua en el 80 % o menos de la capacidad del interruptor o la PDU. Verifique la normativa local y la documentación del equipo.","Compare baseline, growth and conservative scenarios from the current inputs, then export traceable engineering outputs.":"Compare los escenarios de referencia, crecimiento y conservador con las entradas actuales y exporte resultados de ingeniería trazables.","Recalculate baseline, growth and conservative scenarios from the current inputs, then export traceable results.":"Recalcule los escenarios de referencia, crecimiento y conservador con las entradas actuales y exporte resultados trazables.","Verify resolver policy, authoritative capacity and stale-data behavior before change.":"Verifique la política de los resolvedores, la capacidad autoritativa y el comportamiento con datos caducados antes del cambio.","Local-only: configuration and findings are not sent to AI or analytics.":"Solo local: la configuración y los hallazgos no se envían a IA ni a analítica.","Paste a supported ACL or build one from parameters. Processing stays in this browser.":"Pegue una ACL compatible o créela a partir de parámetros. El procesamiento se queda en este navegador.","No high-confidence findings matched. This is not proof that the ACL is safe or complete.":"No se encontraron hallazgos de alta confianza. Esto no demuestra que la ACL sea segura o completa.","This score is a deterministic screening aid, not proof of availability, security or compliance.":"Esta puntuación es una ayuda de cribado determinista, no una prueba de disponibilidad, seguridad o cumplimiento.","No current result — the latest input was rejected.":"No hay resultado actual: la última entrada fue rechazada.","Example loaded — review the highlighted inputs before building a plan.":"Ejemplo cargado: revise las entradas resaltadas antes de generar un plan.","Two C9200L stack members each contribute one uplink to Port-channel10. VLAN 100 is added while preserving the existing native VLAN.":"Dos miembros de la pila C9200L aportan cada uno un enlace ascendente a Port-channel10. Se añade la VLAN 100 conservando la VLAN nativa existente.","Two aggregate members selected":"Dos miembros del agregado seleccionados","Review risk, forward config and rollback first; then follow the runbook and paste post-check evidence.":"Revise primero el riesgo, la configuración de avance y la reversión; después siga el procedimiento y pegue la evidencia de la verificación posterior.","Expand the reasons below before approving the change.":"Despliegue los motivos siguientes antes de aprobar el cambio.","Extends Layer-2 reachability. Confirm the VLAN is intended and present end-to-end.":"Amplía el alcance de capa 2. Confirme que la VLAN es la prevista y que está presente de extremo a extremo.","The snapshot contains unmanaged lines. Review nearby configuration before execution.":"La instantánea contiene líneas no gestionadas. Revise la configuración cercana antes de ejecutar.","Risk is below the peer-review threshold, but normal change approval still applies.":"El riesgo está por debajo del umbral de revisión por pares, pero se sigue aplicando la aprobación normal de cambios.","Capture current aggregate/member state":"Capture el estado actual del agregado y sus miembros","Evidence before PASS":"Evidencia antes de CUMPLE","Scenarios and installation limits":"Escenarios y límites de instalación","Capacity and failure checks":"Comprobaciones de capacidad y fallo","Selected modules: installed count, or worst-case recommendation when installed = 0. Failure checks use physical environmental capacity; target reserve is a separate planning check.":"Módulos seleccionados: número instalado o la recomendación de peor caso cuando instalados = 0. Las comprobaciones de fallo usan la capacidad física ambiental; la reserva objetivo es una comprobación de planificación aparte.","Worst-case required current":"Corriente requerida en el peor caso","Additional load within target reserve":"Carga adicional dentro de la reserva objetivo","Before / After plan comparison":"Comparación del plan antes / después","Current plan uses installed modules or baseline sizing. Recharge-limited adjustment retains those modules and limits charging for the combined growth / conservative condition. Expansion retains full peak recharge.":"El plan actual usa los módulos instalados o el dimensionamiento de referencia. El ajuste con recarga limitada conserva esos módulos y limita la carga para la condición combinada de crecimiento / conservadora. La ampliación conserva la recarga pico completa.","Target reserve met; verify controller settings and battery recovery time.":"Reserva objetivo cumplida; verifique la configuración del controlador y el tiempo de recuperación de la batería.","Verify compatible module model, controller licensing, AC feeder, busbar and DC distribution ratings before procurement. A failed frame limit requires a larger frame; adding slots alone does not resolve it.":"Verifique el modelo de módulo compatible, las licencias del controlador, la acometida de CA, el embarrado y la capacidad de distribución de CC antes de comprar. Si se supera el límite del bastidor, hace falta un bastidor mayor; añadir ranuras no lo resuelve.","Add peak, conservative-case and site limits. Leave automatic fields blank to use the current IT load.":"Añada los límites de pico, de caso conservador y del emplazamiento. Deje en blanco los campos automáticos para usar la carga TI actual.","Leave blank to use the current IT load":"Déjelo en blanco para usar la carga TI actual","Leave blank to use the peak IT load":"Déjelo en blanco para usar la carga TI pico","Optional; leave blank when no extra sensible load applies":"Opcional; déjelo en blanco si no hay carga sensible adicional","Used for environmental risk checks":"Se usa en las comprobaciones de riesgo ambiental","Maximum cooling units allowed by the site":"Número máximo de unidades de refrigeración que admite el emplazamiento","Optional; leave blank for no unit-count limit":"Opcional; déjelo en blanco si no hay límite de unidades","Topology capacity and N-1 failure matrix updated.":"Capacidad de la topología y matriz de fallos N-1 actualizadas.","No major ring-capacity warning under the entered assumptions.":"Sin advertencias importantes de capacidad del anillo con las hipótesis introducidas.","Prioritize capacity expansion on the surviving bottleneck span in the worst failure scenario.":"Priorice la ampliación de capacidad en el vano cuello de botella superviviente del peor escenario de fallo.","Migrate or reroute traffic to reduce post-protection peak loading.":"Migre o redirija tráfico para reducir la carga pico tras la protección.","Dual-uplink, channel and MSE failure-state capacity updated.":"Capacidad en estado de fallo del doble enlace ascendente, del canal y de MSE actualizada.","No major capacity or common-mode failure warning under the entered assumptions.":"Sin advertencias importantes de capacidad ni de fallo de modo común con las hipótesis introducidas.","Normal, failure and growth scenarios are within the target threshold.":"Los escenarios normal, de fallo y de crecimiento están dentro del umbral objetivo.","Compare designs and review Before / After and N-1 impact.":"Compare diseños y revise el impacto antes / después y N-1.","N-1 remains within the target threshold.":"N-1 se mantiene dentro del umbral objetivo.","Normal":"Normal","Growth and recharge peaks are also tested together. Conservative reserve adds percentage points to engineering headroom. Environmental coefficients are editable planning assumptions; verify manufacturer curves, bus voltage and low AC input limits.":"Los picos de crecimiento y de recarga también se prueban juntos. La reserva conservadora suma puntos porcentuales al margen de ingeniería. Los coeficientes ambientales son hipótesis de planificación editables; verifique las curvas del fabricante, la tensión del bus y los límites de entrada de CA baja.","Recalculate baseline, growth and conservative paths while checking fragmentation, frame limits, redundancy and failure boundaries.":"Recalcule las rutas de referencia, crecimiento y conservadora comprobando fragmentación, límites de trama, redundancia y límites de fallo."}))if(!exact.has(en))exact.set(en,es);

// Independently observed remaining ES field labels.
for(const [key,value]of Object.entries({
  "Source": "Origen",
  "Destination": "Destino",
  "Port": "Puerto",
  "Remove rule": "Eliminar regla",
  "Authoritative propagation margin": "Margen de propagación autoritativa",
  "Download JSON": "Descargar JSON",
  "Download CSV": "Descargar CSV",
  "Assessment item name": "Nombre del elemento de evaluación",
  "Likelihood 1–5": "Probabilidad 1–5",
  "Operator cap / port": "Límite operativo por puerto",
  "Protection factor 1/2": "Factor de protección 1/2",
  "Failed uplinks (N-1)": "Uplinks averiados (N-1)",
  "After-growth scenario %": "Escenario tras el crecimiento (%)",
  "Wi-Fi generation": "Generación Wi-Fi",
  "Manual event type": "Tipo de evento manual",
  "Bend comparison": "Comparación de curvaturas",
  "History": "Historial",
  "Protection chain required": "Cadena de protección requerida",
  "Protection chain present": "Cadena de protección presente",
  "Dual uplink required": "Doble enlace ascendente requerido"
}))exact.set(key,value);
// Reviewed human-readable report labels.
for(const [key,value] of Object.entries({
  "Model": "Modelo",
  "Battery bank": "Banco de baterías",
  "Nominal voltage": "Tensión nominal",
  "Design load current": "Corriente de diseño de la carga",
  "Design load power": "Potencia de diseño de la carga",
  "Average current": "Corriente media",
  "Estimated runtime": "Autonomía estimada",
  "Delivered usable energy": "Energía útil entregada",
  "Target runtime": "Autonomía objetivo",
  "Required total capacity": "Capacidad total necesaria",
  "Required parallel strings": "Cadenas en paralelo necesarias",
  "Note": "Nota",
  "NetEngineerLab -48V Telecom Battery Runtime Calculator V1.1": "NetEngineerLab Calculadora de autonomía de batería de telecomunicaciones -48 V V1.1",
  "Data Center Fabric Plan": "Plan de fabric del centro de datos",
  "Total convergence": "Convergencia total",
  "Fabric utilization": "Utilización del fabric",
  "Network Hidden-Hazard Assessment Report": "Informe de evaluación de riesgos y peligros ocultos de red",
  "Website": "Sitio web",
  "Completion": "Finalización",
  "Abnormal": "Anómalos",
  "Unverified": "Sin verificar",
  "Critical": "Críticos",
  "Before/After risk": "Riesgo antes/después",
  "Risk reduction": "Reducción del riesgo",
  "Top risks": "Riesgos principales",
  "Boundary": "Límite",
  "Required switch budget": "Presupuesto necesario del switch",
  "PD load": "Carga de los dispositivos PD",
  "Budget utilization": "Utilización del presupuesto",
  "Maximum devices": "Número máximo de dispositivos",
  "NetEngineerLab PoE Power Budget Calculator": "NetEngineerLab Calculadora de presupuesto de potencia PoE",
  "Canonical IPv6": "IPv6 canónica",
  "Expanded IPv6": "IPv6 expandida",
  "Parent network": "Red principal",
  "Parent last": "Última dirección principal",
  "Child prefix count": "Cantidad de prefijos secundarios",
  "Addresses per child": "Direcciones por prefijo secundario",
  "Containing child": "Prefijo secundario contenedor",
  "Containing index": "Índice del prefijo contenedor",
  "Public IPv4": "IPv4 públicas",
  "Subscribers": "Abonados",
  "Raw ports/protocol": "Puertos brutos por protocolo",
  "Usable ports/protocol/IP": "Puertos utilizables por protocolo e IP",
  "Enabled protocol pools": "Grupos de protocolos habilitados",
  "Mappings/public IPv4": "Asignaciones por IPv4 pública",
  "Total mapping capacity": "Capacidad total de asignaciones",
  "Required mappings": "Asignaciones necesarias",
  "Required public IPv4": "IPv4 públicas necesarias",
  "Maximum subscribers": "Número máximo de abonados",
  "Sharing ratio": "Relación de compartición",
  "Capacity usage %": "Utilización de capacidad (%)",
  "Usable ports/IP": "Puertos utilizables por IP",
  "Port block size": "Tamaño del bloque de puertos",
  "Blocks/public IPv4": "Bloques por IPv4 pública",
  "Supported subscribers": "Abonados admitidos",
  "Spare subscribers": "Margen de abonados",
  "Subscriber capacity %": "Capacidad de abonados (%)",
  "TCP peak mappings/subscriber": "Asignaciones TCP pico por abonado",
  "UDP peak mappings/subscriber": "Asignaciones UDP pico por abonado",
  "Port block usage %": "Uso del bloque de puertos (%)",
  "Active mappings": "Asignaciones activas",
  "Daily log events": "Eventos de registro diarios",
  "Translation prefix": "Prefijo de traducción",
  "Prefix length": "Longitud del prefijo",
  "Synthesized IPv6": "IPv6 sintetizada",
  "WKP": "Prefijo conocido (WKP)",
  "Local-use prefix": "Prefijo de uso local",
  "Coverage AP count": "Número de AP por cobertura",
  "Design radius m": "Radio de diseño (m)",
  "RF radius m": "Radio RF (m)",
  "Downlink radius m": "Radio de enlace descendente (m)",
  "Uplink radius m": "Radio de enlace ascendente (m)",
  "AP EIRP dBm": "PIRE del AP (dBm)",
  "Client EIRP dBm": "PIRE del cliente (dBm)",
  "Obstacle loss dB": "Pérdida por obstáculos (dB)",
  "Effective area/AP m2": "Área efectiva por AP (m²)",
  "APs/floor": "AP por planta",
  "Capacity AP count": "Número de AP por capacidad",
  "Reference PHY Mbps": "Tasa PHY de referencia (Mbps)",
  "Effective throughput/AP Mbps": "Caudal efectivo por AP (Mbps)",
  "Total demand Mbps": "Demanda total (Mbps)",
  "Throughput AP count": "Número de AP por caudal",
  "Client-count AP count": "Número de AP por cantidad de clientes",
  "Associated users/AP": "Usuarios asociados por AP",
  "Active users/AP": "Usuarios activos por AP",
  "Throughput headroom %": "Margen de caudal (%)",
  "Final AP count": "Número final de AP",
  "Available 20 MHz channels": "Canales de 20 MHz disponibles",
  "Channel width MHz": "Ancho de canal (MHz)",
  "Reusable channel groups": "Grupos de canales reutilizables",
  "APs/channel group": "AP por grupo de canales",
  "Associated users/final AP": "Usuarios asociados por AP final",
  "Active users/final AP": "Usuarios activos por AP final",
  "Demand/final AP Mbps": "Demanda por AP final (Mbps)",
  "Throughput utilization %": "Utilización del caudal (%)",
  "Floor allocation": "Asignación por planta",
  "NetEngineerLab Wi-Fi Coverage & Capacity Planner": "NetEngineerLab Planificador de cobertura y capacidad Wi-Fi",
  "Results are engineering estimates. Final AP design requires a regulatory review, vendor data and an on-site predictive/active survey.": "Los resultados son estimaciones de ingeniería. El diseño final de AP requiere revisión normativa, datos del fabricante y un estudio predictivo/activo del emplazamiento.",
  "Network Change Method of Procedure": "Procedimiento de cambio de red",
  "Device": "Equipo",
  "Vendor": "Fabricante",
  "Logical aggregate": "Agregado lógico",
  "Plan status": "Estado del plan",
  "Change scope": "Alcance del cambio",
  "Members": "Miembros",
  "Allowed VLANs": "VLAN permitidas",
  "Description": "Descripción",
  "Semantic delta": "Diferencia semántica",
  "Members added": "Miembros añadidos",
  "Members removed": "Miembros eliminados",
  "VLANs added": "VLAN añadidas",
  "VLANs removed": "VLAN eliminadas",
  "Risk reasons": "Motivos del riesgo",
  "Execution runbook": "Guía de ejecución",
  "Change authorization": "Autorización del cambio",
  "Standard operator approval": "Aprobación estándar del operador",
  "Success criteria": "Criterios de éxito",
  "Rollback triggers": "Criterios de activación del rollback",
  "Apply minimal forward delta": "Aplicar el cambio mínimo",
  "Rollback gate": "Punto de decisión de rollback",
  "Rollback configuration": "Configuración de rollback",
  "Minimal forward configuration": "Configuración mínima de aplicación",
  "Post-change decision": "Decisión tras el cambio",
  "Decision": "Decisión",
  "Passed": "Cumplidas",
  "Failed": "Fallidas",
  "Inconclusive": "No concluyentes",
  "Extends Layer-2 reachability. Confirm the VLAN is intended and present end-to-end.": "Amplía la conectividad de capa 2. Confirme que la VLAN es necesaria y está presente de extremo a extremo.",
  "Documentation-only change with low forwarding impact.": "Cambio documental con impacto bajo en el reenvío.",
  "The snapshot contains unmanaged lines. Review nearby configuration before execution.": "La instantánea contiene líneas no gestionadas. Revise la configuración circundante antes de ejecutar.",
  "Generated locally by NetEngineerLab. Review against the applicable vendor guide and your organization's change process before production execution.": "Generado localmente por NetEngineerLab. Revise la guía del fabricante aplicable y el proceso de cambios de su organización antes de ejecutar en producción.",
  "Engineering Report": "Informe de ingeniería",
  "Method of Procedure (MOP)": "Procedimiento de trabajo (MOP)",
  "Engineering Review Checklist": "Lista de revisión de ingeniería",
  "Engineering Results Register": "Registro de resultados de ingeniería",
  "Included results": "Resultados incluidos",
  "Compiled from user-imported tool results. Verify inputs, sources and applicable standards before delivery or execution.": "Compilado a partir de resultados de herramientas importados por el usuario. Verifique entradas, fuentes y normas aplicables antes de entregar o ejecutar."
}))if(!exact.has(key))exact.set(key,value);
// Verified remaining report templates; free field values are preserved.
exact.set('Risk','Riesgo');exact.set('Capture trunk state','Capture el estado del enlace troncal');exact.set('Confirm target VLAN inventory','Confirme el inventario de VLAN de destino');exact.set('Target VLANs remain present','Las VLAN de destino siguen presentes');
// Same-tool MOP source literals reviewed against actual runtime; user fields and command blocks remain protected.
for(const [english,spanish]of [["Creates a new logical aggregate. Confirm the ID is unused and both ends are coordinated.","Crea un agregado lógico nuevo. Confirme que el ID no esté en uso y que ambos extremos estén coordinados."],["Adds physical members to the bundle. A wrong member can affect an existing uplink.","Añade miembros físicos al grupo. Un miembro incorrecto puede afectar a un enlace ascendente existente."],["Removes existing members and reduces available bundle capacity during the change.","Retira miembros existentes y reduce la capacidad disponible del grupo durante el cambio."],["Removes VLAN reachability from the trunk and may interrupt dependent services.","Elimina la conectividad de VLAN del troncal y puede interrumpir los servicios dependientes."],["Changes untagged/PVID behavior. Mismatch across the link can create traffic leakage or loss.","Cambia el comportamiento de tráfico sin etiqueta/PVID. Una discrepancia en el enlace puede provocar fugas o pérdida de tráfico."],["A blocking conflict was detected. Do not execute until it is resolved.","Se detectó un conflicto bloqueante. No ejecute el cambio hasta resolverlo."],["No incremental factors","Sin factores incrementales"],["Inputs changed. Rebuild the plan.","Las entradas han cambiado. Vuelva a generar el plan."],["Cisco stack uplink: add VLAN 100","Enlace ascendente de una pila Cisco: añadir VLAN 100"],["Huawei campus uplink: expand trunk","Enlace ascendente de campus Huawei: ampliar las VLAN del troncal"],["A dual-link S5735 uplink keeps Eth-Trunk10 and expands the allowed VLAN set with a minimal delta.","El enlace ascendente dual del S5735 conserva Eth-Trunk10 y amplía el conjunto de VLAN permitidas con un cambio mínimo."],["Juniper VC: ae10 trunk normalization","VC Juniper: normalizar el troncal ae10"],["Two EX3400 Virtual Chassis members form ae10. The plan reconciles trunk membership and description without rebuilding correct state.","Dos miembros EX3400 de Virtual Chassis forman ae10. El plan concilia las VLAN del troncal y la descripción sin reconstruir el estado correcto."],["Arista DC uplink: controlled VLAN expansion","Enlace ascendente de centro de datos Arista: ampliación controlada de VLAN"],["A 7050SX3 Port-Channel change demonstrates the same intent workflow on a data-center switching platform.","Un cambio en Port-Channel de un 7050SX3 muestra el mismo flujo basado en intención en una plataforma de conmutación de centro de datos."],["Running config pasted","Configuración en ejecución pegada"],["Allowed VLAN set defined","Se definió el conjunto de VLAN permitidas"],["Native/PVID is included in allowed VLANs","La VLAN nativa/PVID está incluida entre las VLAN permitidas"],["Risk score","Puntuación de riesgo"],["Current managed state already matches the desired intent.","El estado gestionado actual ya coincide con la intención deseada."],["Review this risk factor before execution.","Revise este factor de riesgo antes de ejecutar el cambio."],["No incremental risk factors were added.","No se añadieron factores de riesgo incrementales."],["The managed running state already matches the requested intent. No configuration commands are required.","El estado gestionado en ejecución ya coincide con la intención solicitada. No se requieren comandos de configuración."],["The plan is blocked by a conflict. Resolve the conflict before generating an execution window.","El plan está bloqueado por un conflicto. Resuélvalo antes de programar una ventana de ejecución."],["Risk threshold requires peer review and a controlled maintenance window.","El umbral de riesgo exige una revisión por pares y una ventana de mantenimiento controlada."],["No configuration changes required.","No se requieren cambios de configuración."],["No rollback configuration required.","No se requiere configuración de reversión."],["Success","Éxito"],["Paste the real device output for this command","Pegue la salida real del dispositivo para este comando"],["Stop:","Deténgase:"],["Resolve the blocking conflict before reviewing an execution runbook.","Resuelva el conflicto bloqueante antes de revisar el procedimiento de ejecución."],["No change required:","No se requiere ningún cambio:"],["The managed state already matches the desired intent.","El estado gestionado ya coincide con la intención deseada."],["Next:","Siguiente:"],["Fix the highlighted input or current-state conflict, then rebuild the plan.","Corrija la entrada resaltada o el conflicto del estado actual y vuelva a generar el plan."],["Verification decision:","Decisión de verificación:"],["Review rollback triggers before the next action.","Revise los desencadenantes de reversión antes de continuar."],["Vendor sample loaded. Adjust the desired intent, then build the plan.","Se cargó el ejemplo del fabricante. Ajuste la intención deseada y genere el plan."],["Obtain peer review/change approval","Obtener revisión por pares y aprobación del cambio"],["Resolve blocking conflicts before execution.","Resolver los conflictos bloqueantes antes de la ejecución."],["Change blocked","Cambio bloqueado"],["No change required","No se requiere ningún cambio"],["Current managed state already matches desired intent.","El estado gestionado actual ya coincide con la intención deseada."]])if(!exact.has(english))exact.set(english,spanish);
function tr(s){if(!s)return s;const t=s.trim();if(exact.has(t))return s.replace(t,exact.get(t));if(t.includes(' · ')){const parts=t.split(' · ');const mapped=parts.map(part=>tr(part));if(mapped.some((v,i)=>v!==parts[i]))return s.replace(t,mapped.join(' · '));}let out=s;
out=out.replace(/^Step (\d+) of (\d+)$/i,'Paso $1 de $2');
out=out.replace(/^Warnings:\s*/i,'Advertencias: ');
out=out.replace(/^Design loss:\s*/i,'Pérdida de diseño: ');
out=out.replace(/^Remaining:\s*/i,'Restante: ');
out=out.replace(/^Project:\s*/i,'Proyecto: ');
out=out.replace(/^Mode:\s*/i,'Modo: ');
out=out.replace(/^Environmental current per module:\s*/,'Corriente ambiental por módulo: ');
out=out.replace(/^Planning current at target utilization:\s*/,'Corriente de planificación con la utilización objetivo: ');
out=out.replace(/^Recharge-limited proposal:\s*/,'Propuesta con recarga limitada: ');
out=out.replace(/^Before\/After:\s*(.*?); Δ margin /,'Antes/después: $1; Δ margen ');
out=out.replace(/^Before\/After:\s*(.*?); airflow delta /,'Antes/después: $1; Δ caudal de aire ');
out=out.replace(/^The planner will change (\d+) member binding\(s\) and (\d+) VLAN membership item\(s\)\.$/,'El planificador cambiará $1 asignación(es) de miembros y $2 elemento(s) de pertenencia a VLAN.');
out=out.replace(/^(\d+) of (\d+) checks have evidence\.$/,'$1 de $2 comprobaciones tienen evidencia.');
out=out.replace(/^(\s*)(\S+) up with (\d+) intended members(\s*)$/,'$1$2 activo con $3 miembros previstos$4');
out=out.replace(/^(\s*)(\S+) operational\/up with no new errors(\s*)$/,'$1$2 operativo/activo sin errores nuevos$3');

// These anchored templates describe rendered human-readable result strings.
out=out.replace(/^([-+]?\d[\d.,]*) (hours|days)$/,(_,amount,unit)=>amount+' '+({hours:'horas',days:'días'}[unit]));
out=out.replace(/^Baseline (.*?) → Peak (.*?) → Conservative (.*)$/,'Referencia $1 → Pico $2 → Conservador $3');
out=out.replace(/^Baseline → Peak → Conservative; N-1: (.*)$/,'Referencia → Pico → Conservador; N-1: $1');
out=out.replace(/^Possible low-output modules: (.*)$/,'Posibles módulos con baja salida: $1');
out=out.replace(/^Overloaded modules: (.*)$/,'Módulos sobrecargados: $1');
out=out.replace(/^Risk: (low|medium|high|critical) · (.*)$/i,(_,risk,note)=>'Riesgo: '+({low:'bajo',medium:'medio',high:'alto',critical:'crítico'}[risk.toLowerCase()])+' · '+tr(note));
out=out.replace(/^Generator capacity: (PASS|FAIL)$/,(_,state)=>'Capacidad del generador: '+(state==='PASS'?'CUMPLE':'NO CUMPLE'));
out=out.replace(new RegExp('^PASS / (.*)$'),'CUMPLE / $1').replace(new RegExp('^FAIL / (.*)$'),'NO CUMPLE / $1');
out=out.replace(/^(Proposed total modules|Additional modules|Additional slots|Frame maximum|Installed slots|Generated|Language|Engine): (.*)$/,(_,label,value)=>({"Proposed total modules":"Total de módulos propuesto","Additional modules":"Módulos adicionales","Additional slots":"Ranuras adicionales","Frame maximum":"Máximo del bastidor","Installed slots":"Ranuras instaladas","Generated":"Generado","Language":"Idioma","Engine":"Motor"})[label]+': '+value);
out=out.replace(/^Capture (\S+) state$/,(_,name)=>'Capture el estado de '+name);
out=out.replace(/^Allowed VLANs (.*); native\/PVID (.*)$/,(_,vlans,native)=>'VLAN permitidas '+vlans+'; nativa/PVID '+native);
out=out.replace(/^Design ([-+\d.,]+ kW \| [-+\d.,]+ VA \| [-+\d.,]+ A \| [-+\d.,]+ BTU\/h \| [-+\d.,]+) kWh\/month$/,(_,values)=>'Diseño '+values+' kWh/mes');
out=out.replace(/^Allowed VLANs (.*)$/,(_,vlans)=>'VLAN permitidas '+vlans);
out=out.replace(/^native\/PVID (.*)$/,(_,value)=>'nativa/PVID '+value);
out=out.replace(/^Native\/PVID changes from (.*?) to (.*?); verify both ends of the link\.$/,(_,before,after)=>'La VLAN nativa/PVID cambia de '+(before==='none'?'ninguna':before)+' a '+(after==='none'?'ninguna':after)+'; verifique ambos extremos del enlace.');
return out;}
// Reviewed same-tool human UI labels only; never apply these phrases to reports or user values.
const uiLexicons={
  "dns-ttl-propagation-calculator": {
    "Peak/previous TTL": "TTL máximo/anterior",
    "Resolver population": "Población de resolutores",
    "Resolver growth": "Crecimiento de resolutores",
    "Stale-serve exposure": "Exposición a respuestas obsoletas"
  },
  "network-rack-power-cooling-calculator": {
    "Supply phases": "Fases de alimentación"
  },
  "network-risk-hidden-hazard-assessment-generator": {
    "Impact 1–5": "Impacto 1–5",
    "Exposure %": "Exposición %",
    "Control effectiveness %": "Eficacia del control %",
    "Assessment certainty %": "Certeza de la evaluación %",
    "Owner": "Responsable",
    "Due date": "Fecha límite",
    "Review date": "Fecha de revisión",
    "Remediation status": "Estado de corrección",
    "Open": "Abierto",
    "In progress": "En curso",
    "Closed": "Cerrado",
    "Critical rule ID (hard rules only)": "ID de regla crítica (solo reglas obligatorias)",
    "Visible trigger condition": "Condición de activación visible"
  },
  "odf-odn-resource-planner": {
    "Technical profile": "Perfil técnico",
    "Custom": "Personalizado",
    "Distance km": "Distancia km",
    "Down attenuation dB/km": "Atenuación descendente dB/km",
    "Up attenuation dB/km": "Atenuación ascendente dB/km",
    "Total splitter loss dB": "Pérdida total de divisores dB",
    "Splice count": "Número de empalmes",
    "Loss / splice dB": "Pérdida por empalme dB",
    "Connector count": "Número de conectores",
    "Loss / connector dB": "Pérdida por conector dB",
    "Other loss dB": "Otras pérdidas dB",
    "Aging allowance dB": "Reserva por envejecimiento dB",
    "Temperature allowance dB": "Reserva por temperatura dB",
    "Maintenance allowance dB": "Reserva de mantenimiento dB",
    "Repair allowance dB": "Reserva de reparación dB",
    "Path penalty dB": "Penalización del trayecto dB",
    "Maximum ODN loss dB": "Pérdida máxima de ODN dB",
    "System reach km": "Alcance del sistema km",
    "Down Tx min dBm": "Tx descendente mín. dBm",
    "Down Tx max dBm": "Tx descendente máx. dBm",
    "Down Rx sensitivity dBm": "Sensibilidad Rx descendente dBm",
    "Down Rx overload dBm": "Sobrecarga Rx descendente dBm",
    "Up Tx min dBm": "Tx ascendente mín. dBm",
    "Up Tx max dBm": "Tx ascendente máx. dBm",
    "Up Rx sensitivity dBm": "Sensibilidad Rx ascendente dBm",
    "Up Rx overload dBm": "Sobrecarga Rx ascendente dBm",
    "Splitter stages": "Etapas de división",
    "Level 1 ratio 1:": "Relación de nivel 1 1:",
    "Level 2 ratio 1:": "Relación de nivel 2 1:",
    "Level 3 ratio 1:": "Relación de nivel 3 1:",
    "Reserve rate %": "Tasa de reserva %",
    "Existing ODF ports": "Puertos ODF existentes"
  },
  "onu-rx-power": {
    "Receiver sensitivity": "Sensibilidad del receptor",
    "Attenuation": "Atenuación",
    "Recent diagnosis records": "Registros de diagnóstico recientes"
  },
  "otdr-event": {
    "Pulse width": "Ancho de pulso",
    "Group index / IOR": "Índice de grupo / IOR",
    "Primary attenuation": "Atenuación primaria",
    "Secondary attenuation": "Atenuación secundaria",
    "Strong reflection": "Reflexión fuerte",
    "Very strong reflection": "Reflexión muy fuerte",
    "Near-end tolerance": "Tolerancia del extremo cercano",
    "⇧ Import CSV": "⇧ Importar CSV",
    "CSV template": "Plantilla CSV",
    "Analyze events": "Analizar eventos",
    "Non-reflective events": "Eventos no reflectivos",
    "Reflective events": "Eventos reflectivos"
  },
  "pon-distance": {
    "Ageing reserve": "Reserva por envejecimiento",
    "Temperature reserve": "Reserva por temperatura",
    "Maintenance reserve": "Reserva de mantenimiento",
    "Dual uplink present": "Doble enlace ascendente presente"
  },
  "switch-uplink-oversubscription-calculator": {
    "Protocol / burst allowance": "Reserva de protocolo / ráfagas",
    "Peak active ports": "Puertos activos máximos",
    "Growth (%)": "Crecimiento (%)",
    "Burst allowance (%)": "Reserva de ráfagas (%)"
  },
  "vlan-ip-capacity-planner": {
    "Reserved IP %": "IP reservadas %",
    "Gateway reserve %": "Reserva de puerta de enlace %",
    "DHCP reservations": "Reservas DHCP",
    "Fault domains": "Dominios de fallo",
    "VRF count": "Número de VRF"
  },
  "wifi-coverage-capacity-planner": {
    "Channel width": "Ancho de canal"
  },
  "olt-dual-uplink-transport-mse-planner": {
    "OLT & Traffic": "OLT y tráfico",
    "Transport Channels": "Canales de transporte",
    "Path Diversity": "Diversidad de trayectos"
  }
};
const uiSlug=location.pathname.split('/').filter(Boolean)[1];
const uiLexicon=uiLexicons[uiSlug]||{};
// Project titles are user data, even when they equal a translated state word.
const nativeProjectHistorySlugs=new Set(['48v-battery-runtime','all-reduce-traffic-estimator','bandwidth-calculator','chromatic-dispersion-calculator','ethernet-serialization-delay-calculator','fiber-latency-calculator','fiber-loss','ipv6-nat-planner','mtu-calculator','onu-rx-power','otdr-event','pmd-budget-calculator','pon-distance','pon-splitter-loss','stp-path-cost-calculator','wifi-coverage-capacity-planner']);
function localeValueOwner(p){
 if(p.closest('[data-nel-locale-value]'))return true;
 if(nativeProjectHistorySlugs.has(uiSlug)){
  const entry=p.closest('#historyList article');
  const title=entry?.querySelector('h3,strong,b');
  if(title&&title.contains(p))return true;
 }
 if(uiSlug==='optical-power-budget'){
  const title=p.closest('#history-list .history-item > div > b');
  if(title)return true;
 }
 return false;
}
function historyHumanText(p,original){
 if(!nativeProjectHistorySlugs.has(uiSlug)||!p.closest('#historyList'))return null;
 const t=original.trim();
 if(uiSlug==='48v-battery-runtime'&&p.closest('button[data-history]')&&t==='Load')return original.replace(t,'Cargar');
 if(uiSlug==='wifi-coverage-capacity-planner'){
  if(p.closest('button[data-load]')&&t==='Load')return original.replace(t,'Cargar');
  if(p.closest('button[data-delete]')&&t==='Delete')return original.replace(t,'Eliminar');
  if(p.matches('.history-item > span')&&['coverage','capacity','combined','channel'].includes(t)){
   const tab=document.querySelector('[data-tab="'+t+'"]');
   if(tab)return original.replace(t,tab.textContent.trim());
  }
 }
 const prefixes={
  'onu-rx-power':[['Measured:','Potencia medida:'],['Sensitivity margin:','Margen de sensibilidad:']],
  'otdr-event':[['Events ','Eventos '],['Abnormal ','Anómalos '],['Critical ','Críticos '],['Estimated loss ','Pérdida estimada ']],
  'pon-distance':[['Effective max:','Máximo efectivo:'],['Planned:','Planificado:']],
  'pon-splitter-loss':[['Ratio:','Relación:']]
 };
 let result=original;
 for(const [from,to]of prefixes[uiSlug]||[])result=result.split(' · ').map(part=>part.trimStart().startsWith(from)?part.replace(from,to):part).join(' · ');
 return result!==original?result:null;
}
function translateTextNode(n){
 const p=n.parentElement;if(!p||p.closest('script,style,code,pre')||localeValueOwner(p))return;
 const original=n.nodeValue,t=original.trim();
 const ui=p.closest('label,option,h1,h2,h3,h4,button');
 let value=historyHumanText(p,original)??(ui&&Object.prototype.hasOwnProperty.call(uiLexicon,t)?original.replace(t,uiLexicon[t]):tr(original));
 if(value!==original){const option=p.closest('option');if(option&&!option.hasAttribute('value'))option.setAttribute('value',option.value);n.nodeValue=value;}
}
function walk(root){const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];while(w.nextNode())nodes.push(w.currentNode);for(const n of nodes)translateTextNode(n);for(const el of root.querySelectorAll?.('[aria-label],[title],[placeholder]')||[]){if(el.closest('script,style,code,pre,[data-nel-locale-value]'))continue;for(const a of ['aria-label','title','placeholder'])if(el.hasAttribute(a)){const old=el.getAttribute(a),t=old.trim();const v=Object.prototype.hasOwnProperty.call(uiLexicon,t)?old.replace(t,uiLexicon[t]):tr(old);if(v!==old)el.setAttribute(a,v);}}}
const obs=new MutationObserver(ms=>{for(const m of ms){for(const n of m.addedNodes){if(n.nodeType===Node.TEXT_NODE)translateTextNode(n);else if(n.nodeType===Node.ELEMENT_NODE)walk(n);}if(m.type==='characterData')translateTextNode(m.target);}});
function start(){document.documentElement.lang='es';walk(document.body);obs.observe(document.body,{childList:true,subtree:true,characterData:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
function translateHumanReport(value){
const source=String(value);if(/^[\s\uFEFF]*[\[{]/.test(source))return source;
const translatedValues=new Set(['Status','Design status','Risk','Risk level','Model','Mode','Note','Reason','Warning','Warnings','Recommendation','Recommendations','Acceptance','Result','Success criteria']);
const enums={healthy:'Correcto',warning:'Advertencia',failed:'No cumple',pass:'Cumple',fail:'No cumple',low:'bajo',medium:'medio',high:'alto',critical:'crítico'};
const reportValue=text=>Object.hasOwn(enums,text)?enums[text]:tr(text);
const translatedFieldLabels=new Set(exact.values());
const translateField=text=>{const field=text.match(/^([^:\r\n]+):\s*(.*)$/);if(field&&translatedFieldLabels.has(field[1].trim()))return text;return field&&exact.has(field[1].trim())?tr(field[1])+': '+(translatedValues.has(field[1].trim())?reportValue(field[2]):field[2]):tr(text);};
let fence='';return source.split(/(\r?\n)/).map(line=>{
if(/^\r?\n$/.test(line))return line;
const boundary=line.match(/^\s*(```|~~~)/);if(boundary){fence=fence?'':boundary[1];return line;}if(fence||/^\s{4}\S/.test(line))return line;
const match=line.match(/^(\s*(?:#{1,6}\s+|>\s*|[-*+]\s+)?(?:\d+[.)]\s+)?)(.*)$/),prefix=match[1],body=match[2];
const codeReason=body.match(/^([A-Z][A-Z0-9_]*)(:\s*[-+]?\d+(?:[.,]\d+)?\s+—\s+)(.*)$/);if(codeReason)return prefix+codeReason[1]+codeReason[2]+tr(codeReason[3]);
return prefix+body.split(/(;\s*)/).map(part=>/^;/.test(part)?part:translateField(part)).join('');
}).join('');}
window.NELToolLocale={text:tr,report:translateHumanReport};
const oldConfirm=window.confirm;window.confirm=function(msg){return oldConfirm.call(window,tr(String(msg)))};
try{const clip=navigator.clipboard;if(clip&&typeof clip.writeText==='function'){const old=clip.writeText.bind(clip);clip.writeText=(text)=>old(translateHumanReport(text));}}catch{}
})();

