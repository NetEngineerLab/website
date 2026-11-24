(function(){"use strict";
if((document.documentElement.dataset.nelLocale||"")!=="pt-BR"&&document.documentElement.lang!=="pt-BR")return;
const exact=new Map(Object.entries({"reference bandwidth invalid":"largura de banda de referência inválida","interfaces required":"interfaces necessárias","input type invalid":"tipo de entrada inválido",
"✓ Healthy":"↔ Saudável","⚠ Caution":"□ Cuidado","✕ Failed":"□ Falhou","Excellent":"Excelente.","Good":"Bom","Marginal":"Marginal","Not viable":"Não viável","Invalid input":"Entrada inválida","Pass":"Aprovado","Review":"Revisar","Insufficient":"Insuficiente","PASS":"APROVADO","FAIL":"REPROVADO",
"Result copied":"Resultado copiado","Record saved":"Registro salvo","CSV exported":"CSV coisas exportadas","Clear all saved records?":"Limpar todos os registos salvos?","Clear all saved history?":"Limpar todo o histórico salvo?","No saved records yet. Calculate and click “Save record”.":"Ainda não há registos salvos. Calcule e clique em \"Salvar registro\".","No saved calculations yet. Calculate and click “Save record”.":"Nenhum cálculo salvo ainda. Calcule e clique em \"Salvar registro\".",
"Check the input values and units.":"Verifique os valores de entrada e unidades.","Invalid input. Check all fields.":"Entrada inválida. Verifiquem todos os campos.","Verify against actual traffic peaks and redundancy requirements.":"Verificar contra picos de tráfego reais e requisitos de redundância.",
"The optical budget is sufficient and receive power remains above the threshold.":"O orçamento óptico é suficiente e o poder de recepção permanece acima do limiar.","The link is usable but has limited engineering margin. Review splitter stages, connector count and ageing allowance.":"O link é utilizável, mas tem limitado margem de engenharia. Reveja estágios de divisor, contagem de conectores e subsídio de envelhecimento.","Budget is exceeded or receive power is below the threshold. Check splitter cascade, connector contamination, bending loss, splice quality and distance.":"O orçamento é excedido ou recebe poder está abaixo do limiar. Verifique cascata de divisor, contaminação do conector, perda de flexão, qualidade de splice e distância.",
"The standard ODN budget is sufficient and the receive-power window for minimum/maximum transmit power meets both limits.":"A norma ODN o orçamento é suficiente e a janela de potência de recepção para potência mínima/máxima de transmissão atende aos dois limites.","The link is usable but engineering or receiver-window margin is limited. Verify the transmit-power range, splitter stages and ageing allowance.":"O link é utilizável, mas a engenharia ou a margem de janela receptor é limitada. Verificar a gama de potência de transmissão, as fases do separador e o subsídio de envelhecimento.","The design exceeds the budget, or a worst-case receive power is below sensitivity / above overload. Check transceiver specifications, splitter cascade, distance, contamination and bending loss.":"O projeto excede o orçamento, ou um pior caso de receber energia está abaixo da sensibilidade / acima da sobrecarga. Verifique as especificações do transceptor, cascata do divisor, distância, contaminação e perda de flexão.",
"UPS capacity, autonomy and redundancy checks passed for the entered assumptions.":"As verificações de capacidade, autonomia e redundância da UPS foram aprovadas para os pressupostos inseridos.","Warnings: ":"Avisos: ",
"Fade margin is below the 10 dB screening level.":"A margem de fuga está abaixo do nível de rastreio de 10 dB.","Obstacle clearance is below 60% of the first Fresnel zone.":"A depuração dos obstáculos é inferior a 60% da primeira zona de Fresnel.","Check the applicable local EIRP limit.":"Verifique o limite EIRP local aplicável.","60 GHz links have substantial atmospheric oxygen absorption; add it as extra loss.":"60 GHz ligações têm absorção de oxigênio atmosférico substancial; adicioná-lo como perda extra.",
"Enter finite values: distance and frequency must be positive; losses and clearance cannot be negative; obstacle position must be between 0% and 100%.":"Introduza valores finitos: a distância e a frequência devem ser positivas; as perdas e clearance não podem ser negativas; a posição do obstáculo deve estar entre 0% e 100%.",
"Network":"Rede","Host":"Máquina","Interface ID":"ID da interface","No subnet requirements yet.":"Ainda não existem requisitos de sub-redes.","Subnet name":"Nome da sub- rede","Host requirement":"Requisitos da máquina","Reserved addresses":"Endereços reservados","Allocation failed":"Alocação falhou",
"Project":"Projeto","Physical loss":"Perda física","Design loss":"- Não, não, não.","Budget remaining":"Orçamento restante","Remaining budget":"exibir","Remaining":"Restante","Estimated receive power":"Potência de recepção estimada","Receiver margin":"Margem de recepção","Status":"Estado","Standard ODN budget":"Orçamento ODN padrão","Raw Tx/Rx window":"Janela Tx/Rx em bruto","Optical path penalty":"Pena de trajectória óptica","Estimated receive-power range":"Faixa de potência de recepção estimada","Estimated maximum distance":"Distância máxima estimada","Ratio":"Razão","Total split ratio":"Razão de divisão total","Splitter loss":"Perda do separador","Physical ODN loss":"Perda física de ODN","Design ODN loss":"Perda do projeto ODN","Effective max distance":"Distância máxima efetiva",
"Workflow start":"Início do fluxo de trabalho","Step":"Passo","Previous":"Voltar","Next":"Avançar","Related tools":"Ferramentas relacionadas","Also used in":"Também utilizado em","Total overhead":"Total das despesas gerais","Recommended TCP MSS":"TCP recomendado MSS","Actual TCP data with options":"Dados TCP reais com opções","Maximum UDP payload":"Carga útil máxima UDP","Encapsulation layer":"Camada de encapsulamento","Bytes per layer":"Bytes por camada","Count":"Contagem","Remove":"Remover","Physical link":"Ligação física","Effective inner IP":"IP interno eficaz","Engineering gate":"Porta de engenharia","No additional encapsulation is configured.":"Não está configurado nenhum encapsulamento adicional.","No material risk was found with the current inputs.":"Não foi encontrado nenhum risco material com as entradas atuais.","Total addresses":"Endereços totais","Binary View":"Visão binária","IPv6 prefix":"Prefixo IPv6","Total payload size":"Tamanho total da carga útil","Engineered per-user bitrate":"Taxa de bits projetada por usuário","Effective inner MTU":"Eficaz interior MTU","Recommended TCP MSS":"TCP recomendado MSS","Actual TCP data with options":"Dados TCP reais com opções","Maximum UDP payload":"Carga útil máxima UDP","Physical link":"Ligação física","Effective inner IP":"IP interno eficaz","Base underlay MTU":"Camada base MTU","Strict VLAN deduction":"Dedução estrita de VLAN","Total encapsulation overhead":"Despesas gerais de encapsulação total","Encapsulation layer":"Camada de encapsulamento","Bytes per layer":"Bytes por camada","No additional encapsulation is configured.":"Não está configurado nenhum encapsulamento adicional.","Check the input values and units.":"Verifique os valores de entrada e unidades.","Invalid input. Check all fields.":"Entrada inválida. Verifiquem todos os campos.","Result copied":"Resultado copiado","Record saved":"Registro salvo","CSV exported":"CSV coisas exportadas","Configuration passes":"Passos de configuração","Review required":"Revisão exigida","Invalid input":"Entrada inválida","Current workflow":"Fluxo de trabalho atual",
"Build an optical link from physical loss assumptions through split planning, power budget and maximum reach verification.":"Crie um link óptico a partir de pressupostos de perda física através de planejamento dividido, orçamento de energia e verificação de alcance máximo.","Plan multi-stage splitting and calculate total ratio, insertion loss and effective reach.":"Planeje a divisão em múltiplos estágios e calcule a relação total, a perda de inserção e o alcance efetivo.","Verify an optical link using transmit power, receiver sensitivity, optical penalty and ODN loss.":"Verifique uma ligação óptica usando a potência de transmissão, a sensibilidade do receptor, a penalidade óptica e a perda do ODN.","Analyze multiple events and dual wavelengths to identify splices, connectors, bends, breaks, ghosts and dead-zone effects.":"Analise múltiplos eventos e comprimentos de onda duplos para identificar splices, conectores, curvas, quebras, fantasmas e efeitos de zona morta.",
"Plan IPv6 prefixes, NAT44 capacity, deterministic CGNAT blocks, NAT64 and DNS64 addressing.":"Prefixos do plano IPv6, capacidade NAT44, blocos determinísticos CGNAT, endereço NAT64 e DNS64.","Plan VLAN count, IPv4 prefix, address capacity and growth headroom.":"Contagem do plano VLAN, prefixo IPv4, capacidade de endereço e sede de crescimento.","Generate, convert and validate IPv4 ACLs for Cisco IOS, Huawei VRP, H3C Comware and Juniper Junos.":"Gere, converta e valide travesseiros IPv4 para Cisco IOS, Huawei VRP, H3C Comware e Juniper Junos.",
"Estimate bidirectional RF coverage, AP count, user capacity, throughput and channel reuse.":"Estima equipes de cobertura de RF bidirecional, contagem de AP, capacidade do usuário, rendimento e reutilização do canal.","Size PoE switches by watts, ports, cable loss, headroom and IEEE 802.3af/at/bt device limits.":"Tamanho PoE interruptores por watts, portas, perda de cabo, headroom e IEEE 802.3af/at/bt dispositivos limites.","Calculate rack power, current, cooling load, energy and cost.":"Calcular a potência do rack, corrente, carga de refrigeração, energia e arredores.","Calculate telecom DC battery runtime, required Ah, parallel strings and constant-power current rise.":"Calcule o tempo de execução da bateria DC de telecomunicações, Ah necessário, cordas paralelas e aumento constante da corrente de energia.","Calculate data-center sensible heat, N+1 precision cooling capacity, BTU/h, refrigeration tons and airflow from IT and facility loads.":"Calcule calor sensível do data-center, capacidade de resfriamento de precisão N+1, BTU/h, toneladas de refrigeração e fluxo de ar de TI e cargas de instalação.","Calculate PUE as total data-center energy divided by IT equipment energy for the same period and boundary.":"Calcular PUE como energia total de data-center dividido pela energia de equipamento de TI para o mesmo período e limite.",
"Optical Link Design Workflow":"Fluxo de trabalho de design de ligação óptica","Optical Fault Isolation Workflow":"Fluxo de trabalho de isolamento óptico de falhas","Enterprise LAN & IP Planning Workflow":"Fluxo de trabalho de planejamento empresarial LAN & IP","Wireless Access Deployment Workflow":"Fluxo de trabalho de implantação de acesso sem fio","Data Center Critical Power & Cooling Workflow":"Data Center Critical Power & Cooling Workflow","PoE & Rack Power Design Workflow":"PoE & Rack Power Design Workflow",
"PON Splitter Loss Calculator":"Calculadora de perda de divisor PON","Optical Power Budget Calculator":"Calculadora de orçamento de potência óptica","Fiber Loss Calculator":"Calculadora de perda de fibra","PON Maximum Distance Calculator":"Calculadora de Distância Máxima PON","ONU RX Power Diagnosis":"Diagnóstico de Potência ONU RX","OTDR Event Analyzer":"Analisador de eventos OTDR","IPv6 & NAT Planning Calculator":"IPv6 Calculadora de Planejamento & NAT","VLAN & IP Subnet Capacity Planner":"VLAN Planner de Capacidade de Subnet & IP","IP Subnet Calculator":"Calculadora de sub-rede IP","PoE Power Budget Calculator":"Calculadora de orçamento de energia PoE","Wi-Fi Coverage & Capacity Planner":"Wi-Fi Planner de Cobertura e Capacidade","Bandwidth & Transfer Time Calculator":"Calculadora de largura de banda e tempo de transferência","Network Rack Power & Cooling Calculator":"Calculadora de energia e resfriamento de rack de rede","Generator + UPS Transfer & Ride-Through Planner":"Gerador + Transferência UPS & Ride-Through Planner","Data Center Cooling Load & Precision AC Capacity Calculator":"Calculadora de capacidade AC de refrigeração do centro de dados","PUE & Data Center Energy Efficiency Analyzer":"Analisador de eficiência energética PUE & Data Center"
}));
// Exact, evidence-backed dynamic UI terms from the domain tools.
for(const [key,value] of Object.entries({
  "2 V VRLA telecom cells":"2 V VRLA células de telecomunicações",
  "2 V vented lead-acid cells":"Células de chumbo-ácido ventiladas 2 V",
  "48 V-class LiFePO₄ module (15S reference)":"48 módulo LiFePO₄ classe V (15S referência)",
  "Custom battery bank":"Banco de bateria personalizado",
  "Compact OLT / access shelf":"Plataforma compacta OLT / acesso",
  "OLT chassis":"Quadro OLT",
  "BBU / baseband unit":"BBU / unidade de banda base",
  "Optical transport shelf":"Plataforma de transporte óptico",
  "Core switch / router":"Comutador / roteador do núcleo",
  "Environment monitoring and auxiliaries":"Monitorização do ambiente e auxiliares",
  "Custom equipment":"Equipamento personalizado",
  "Base DC load power (nominal-voltage conversion)":"Potência de carga de base DC (conversão nominal-tensão)",
  "Battery-side power":"Potência do lado da bateria",
  "Average discharge voltage":"Tensão média de descarga",
  "Average current per string":"Corrente média por texto",
  "Total nameplate capacity":"Capacidade total da placa de identificação",
  "Combined usable factor":"Fator utilizável combinado",
  "Peak rack load (kW)":"Carga máxima em rack (kW)",
  "Growth scenario (%)":"Cenário de crescimento (%)",
  "Conservative uplift (%)":"Aumento conservador (%)",
  "Containment closure (%)":"Encerramento do confinamento (%)",
  "Row-end leakage (%)":"Deprimento de uma parte de uma parte de uma parte de uma parte de uma parte de uma parte de uma parte de uma parte de uma parte transferring.",
  "Floor delivery effectiveness (%)":"Eficácia da entrega do piso (%)",
  "Require N+2 acceptance":"Requer aceitação N+2",
  "No material warnings":"Sem avisos materiais",
  "Download JSON report":"Baixar relatório JSON",
  "Download CSV check":"Baixar verificação CSV",
  "Download CSV check sheet":"Baixe a folha de verificação CSV",
  "Print engineering report":"Relatório de engenharia de impressão",
  "UPS losses in room (kW)":"Perdas de UPS na sala (kW)",
  "Engineering scenarios & environment":"Cenários de engenharia e ambiente",
  "Peak IT load (kW)":"Carga IT máxima (kW)",
  "Conservative-case IT load (kW)":"Carga TI do caso conservador (kW)",
  "Additional scenario sensible load (kW)":"Cenário adicional carga sensível (kW)",
  "Relative humidity (%)":"Humidade relativa (%)",
  "1 unit failed":"Falha de 1 unidade",
  "Scenarios & plan":"Cenários & plano",
  "Baseline and conservative-case comparison":"Comparação de base e caso conservador",
  "Healthy":"Saudável",
  "HEALTHY":"SAÚDE",
  "Low":"Baixo",
  "LOW":"BAIXO",
  "Medium":"Médio",
  "MEDIUM":"MÉDIO",
  "High":"Alta",
  "HIGH":"ALTO",
  "WARNING":"AVISO",
  "CRITICAL":"CRITÉRIO",
  "BALANCED":"EQUILÍBRIO",
  "OVER":"SOBRE",
  "North-south egress":"Egresso Norte-Sul",
  "Access / leaf fabric":"Acesso / tecido de folha",
  "Upper / core layer":"Camada superior / núcleo",
  "DC output":"Saída DC",
  "vs mean":"vs média",
  "No history supplied; using manual growth.":"Nenhum histórico fornecido; usando o crescimento manual.",
  "Before status":"Antes do status",
  "After status":"Após o estado",
  "After likelihood":"Após a probabilidade",
  "After impact":"Após o impacto",
  "No abnormal item. Unverified items still cannot be declared safe.":"Nenhum item anormal. Itens não verificados ainda não podem ser declarados seguros.",
  "AC feeder":"Alimentador AC",
  "Phase":"Fase",
  "Single phase":"Fase única",
  "Three phase":"Três fases",
  "Conversion efficiency (%)":"Eficiência de conversão contentores (%)",
  "Combined derating available (%)":"Discriminação combinada disponível (%)",
  "Load growth (%)":"Crescimento da carga (%)",
  "Recharge peak uplift (%)":"Recarregar pico de elevação (%)",
  "Extra conservative reserve (percentage points)":"Reserva extra conservadora (pontos percentuais)",
  "Ambient temperature (°C)":"Temperatura ambiente (°C)",
  "Altitude (m)":"Altitude (m)",
  "Derating per 10°C above 25°C (%)":"Deferimento por 10°C acima de 25°C (%)",
  "Derating per 1000 m above sea level (%)":"Medição por 1000 m acima do nível do mar (%)",
  "Frame maximum modules (0 = unknown)":"Módulos máximos de moldura (0 = desconhecido)",
  "Installed module slots (0 = unknown)":"Espaços instalados no módulo (0 = desconhecido)",
  "Target utilization (%)":"Utilização-alvo (%)",
  "Modules used in checks":"Módulos utilizados nas verificações",
  "Worst-case utilization":"Utilização do pior caso",
  "N-1 physical capacity":"Capacidade física N-1",
  "N-2 physical capacity":"Capacidade física N-2",
  "Worst-case operating AC power":"Potência CA de funcionamento no pior dos casos",
  "Worst-case operating AC current":"Corrente AC de operação pior caso",
  "All selected-policy checks passed":"Todas as verificações de políticas selecionadas foram aprovadas",
  "Operating scenarios":"Cenários operacionais",
  "Scenario":"Cenário",
  "Required A":"Necessário A",
  "Capacity A":"Capacidade A",
  "Utilization":"Utilização",
  "Target reserve":"Reserva-alvo",
  "Baseline":"Base",
  "Peak":"Pico",
  "Conservative":"Conservador",
  "baseline": "referencia",
  "peak": "pico",
  "conservative": "conservador",
  "Load growth":"Crescimento da carga",
  "Recharge peak":"pico de recarga",
  "Growth + recharge peak":"Crescimento + pico de recarga",
  "Combined + conservative reserve":"combinado + reserva conservadora",
  "Modules":"Módulos",
  "Recharge A":"Recarregar A",
  "N-1 margin A":"Margem N-1 A",
  "N-2 margin A":"Margem N-2 A",
  "Installation":"Instalação",
  "Current / Before":"Atual / Antes",
  "Recharge-limited adjustment":"Ajuste limitado por recarga",
  "Expansion / After":"Expansão / Depois",
  "Within known limits":"Dentro dos limites conhecidos",
  "Expansion planning checklist":"Lista de verificação do planeamento da expansão",
  "Report inputs":"Relatório de entradas",
  "Download CSV checks":"Baixar verificações CSV",
  "Download planning checklist":"Lista de verificação de planeamento da transferência",
  "Base system efficiency":"Eficiência do sistema de base",
  "Base backup autonomy":"Autonomia de backup base",
  "Allowed DOD":"Permitido DOD",
  "4. Supply scenario & economics":"4. Cenário de fornecimento & economia",
  "Supply scenario":"Cenário da oferta",
  "Electricity tariff":"Tarifa de electricidade",
  "currency/kWh":"moeda/kWh",
  "PV CAPEX":"CAPEX PV",
  "currency/kWp":"moeda/kWp",
  "Generador yield":"Rendimento do gerador",
  "Net PV efficiency":"Eficiência fotovoltaica líquida",
  "Stringing":"String",
  "Existing PV gap":"Gap PV existente",
  "Generation & supply balance":"Balanço de geração e fornecimento",
  "Daily surplus / deficit":"um excedente diário / défice",
  "Economics & emissions":"Economia e emissões",
  "Annual energy saving value":"Valor anual de poupança de energia",
  "Simple payback":"Vingança simples",
  "Equivalent diesel avoided":"Equivalente diesel evitado",
  "Ring model & traffic matrix":"Modelo de anel & matriz de tráfego",
  "Ring nodes":"Nós de anéis",
  "highBypass":"Bypass elevado",
  "highRecirculation":"AltaRecirculação",
  "endRowLeakage":"endRowLedecisão",
  "lowContainmentClosure":"BaixoConteúdoClosura",
  "floorDeliveryLoss":"pisoDeliveryLoss",
  "inletTemperature":"inletTemperatura",
  "n1Fail":"n1Falha",
  "n2Fail":"n2Falha",
  "airflowDeficit":"Défice de fluxo de ar",
  "coolingDeficit":"arrefecimento Défice"
}))exact.set(key,value);

// Calculator copy that the shared en/zh scripts render at runtime on Spanish pages.
for(const [en,es] of Object.entries({"Enter real engineering parameters to calculate the link loss.":"Digite parâmetros de engenharia reais para calcular a perda de prestadores de links.","The splitter cascade remains within the current standard ODN budget, and the receive window for minimum/maximum transmit power meets the design margin.":"A cascata do divisor permanece dentro do atual orçamento padrão ODN, e a janela de recepção para transmissão mínima/máxima atende à margem de projeto.","✓ Normal":"↔ Normal","⚠ Weak-light caution":"□ Cuidado fraco-leve","✕ Critical weak light":"□ Luz fraca crítica","⚡ Optical overload":"Sobrecarga óptica","○ Possible no signal":"□ Possível ausência de sinal","Check inputs. Counts must be non-negative integers; attenuation must be positive; splitter loss must be supported; no-signal must be below sensitivity, and sensitivity below overload.":"Verifiquem as entradas. As contagens devem ser inteiros não negativos; a atenuação deve ser positiva; a perda do divisor deve ser suportada; nenhum sinal deve estar abaixo da sensibilidade e sensibilidade abaixo da sobrecarga.","No saved records yet.":"Ainda não há registos salvos.","Measured receive power is inside the receiver window with adequate margin. If service is still abnormal, check ONU registration, errors, optics and service configuration.":"O poder de recepção medido está dentro da janela do receptor com margem adequada. Se o serviço ainda é anormal, verifique registro ONU, erros, óptica e configuração de serviço.","Measured power remains above sensitivity, but margin is limited. Schedule proactive maintenance and inspect connectors, bending, splitter cascade and splices.":"A potência medida permanece acima da sensibilidade, mas a margem é limitada. Programe a manutenção proativa e inspecione conectores, dobramento, cascata de divisor e emendas.","Measured power is below receiver sensitivity and may cause drops, registration failure or errors. Locate excess loss or splitter design problems promptly.":"A potência medida está abaixo da sensibilidade do receptor e pode causar quedas, falha de registro ou erros. Localize o excesso de perda ou problemas de projeto do divisor imediatamente.","Measured power exceeds the receiver overload threshold and may saturate the receiver. Verify optical class, short-reach direct links and attenuation requirements.":"A potência medida excede o limiar de sobrecarga do receptor e pode saturar o receptor. Verificar classe óptica, ligações diretas de curto alcance e requisitos de atenuação.","The measured value reaches the possible no-signal threshold. Check fiber breaks, disconnected connectors, wrong ports, OLT laser faults, severe bending or splitter failure.":"O valor medido atinge o possível limiar sem sinal. Verifique quebras de fibra, conectores desconectados, portas erradas, falhas de laser OLT, falha grave de dobra ou divisor.","Check ONU online and registration logs":"Verifique ONU online e registros de registro","Check errors, packet loss and service settings":"Verificar erros, perda de pacotes e configurações de serviço","Confirm that measured power is stable":"Confirmar que a potência medida é estável","Clean SC/APC connectors and adapters":"Conectores e adaptadores SC/APC limpos","Inspect drop cable bending or crushing":"Inspecione dobrando ou esmagando cabo gota","Review splitter cascade and ports":"Revisão da cascata de divisores e portas","Retest splices and patch cords":"Reteste de emendas e cordas de patch","Use OTDR to locate excess loss or breaks":"Use OTDR para localizar perda ou quebras excessivas","Inspect feeder, distribution and drop sections":"Inspecione as seções de alimentação, distribuição e gota","Verify split ratio against design":"Verificar a razão de divisão em relação ao projeto","Check OLT transmit power and ONU threshold":"Verificar a potência de transmissão OLT e o limiar ONU mobilisation","Verify optical module class compatibility":"Verificar a compatibilidade da classe do módulo óptico","Avoid high-power short direct connections":"Evite conexões diretas curtas de alta potência","Add a suitable attenuator when required":"Adicionar um atenuador adequado quando necessário","Confirm measurement point and meter range":"Confirmar o ponto de medição e a gama de Partes","Confirm that the OLT port is transmitting":"Confirme que a porta OLT está transmitindo","Verify patching and port mapping":"Verificar o mapeamento de patches e portas","Inspect breaks, disconnections and severe bends":"Inspecione quebras, desconexão e curvas severas","Use a VFL or OTDR for sectional testing":"Use uma VFL ou OTDR para testes seccionais","✓ Design passes":"⇩ Passes de design","⚠ Physical reach only":"a a a a a","✕ Insufficient budget":"□ Orçamento insuficiente","◇ System reach limited":"O alcance do sistema é limitado","Check inputs. Distances, attenuation and losses must be valid; counts must be non-negative integers, splitter loss must be supported, and sensitivity must be below overload.":"Verifiquem as entradas. Distâncias, atenuação e perdas devem ser válidas; as contagens devem ser inteiros não negativos, a perda do divisor deve ser suportada, e a sensibilidade deve estar abaixo da sobrecarga.","Limiting factor: optical power budget. Passive losses and engineering margin determine the available reach.":"Fator limitante: orçamento de potência óptica. Perdas passivas e margem de engenharia determinam o alcance disponível.","Limiting factor: system/protocol reach. The optical budget permits a longer route, but effective reach is capped by system capability.":"Fator limitante: alcance do sistema/protocolo. O orçamento óptico permite uma rota mais longa, mas o alcance efetivo é limitado pela capacidade do sistema.","Optical-budget reach and system reach are approximately equal.":"Alcance de orçamento óptico e alcance do sistema são aproximadamente iguais.","The planned distance is within the effective maximum reach and retains the configured engineering margin.":"A distância planejada está dentro do alcance máximo efetivo e mantém o margem de engenharia configurado.","The planned link is physically within the equipment budget, but the full engineering margin is not retained. Reduce distance or passive loss.":"O link planejado está fisicamente dentro do orçamento do equipamento, mas o margem de engenharia completo não é mantido. Reduzir a distância ou perda passiva.","Physical link loss at the planned distance exceeds the maximum channel budget, so receive power falls below sensitivity.":"A perda de ligação física na distância planejada excede o orçamento máximo do canal, então receber energia cai abaixo da sensibilidade.","The optical budget supports the planned route, but effective reach is controlled by the configured system/protocol limit.":"O orçamento óptico suporta a rota planejada, mas o alcance efetivo é controlado pelo limite de sistema/protocolo configurado.","Confirm that the actual route matches the planned distance":"Confirmar que a rota real corresponde à distância prevista","Retain margin for maintenance, ageing and temperature":"Manter margem para manutenção, envelhecimento e temperatura","Verify with a power meter and OTDR after deployment":"Verifique com um medidor de potência e OTDR após a implantação","Reduce splitter cascade or use lower-loss components":"Reduzir a cascata do divisor ou utilizar componentes de perda inferior","Optimize connector and splice count":"Otimize a contagem de conectores e splices","Increase budget or shorten the route":"Aumentar o orçamento ou encurtar a rota","Reduce total split ratio or cascade stages":"Reduzir a proporção total ou os estágios em cascata","Shorten the route or use lower-attenuation fiber":"Encurtar a rota ou usar fibra de atenuação inferior","Verify minimum transmit power and sensitivity":"Verificar a potência mínima de transmissão e a sensibilidade","Review fixed-loss assumptions":"Reexame dos pressupostos de perdas fixas","Verify maximum logical/ranging capability":"Verificar a capacidade lógica/variante máxima","Check OLT port and profile configuration":"ídico e configuração do perfil do OLT","Do not use optical budget as the only reach criterion":"Não utilizar o orçamento óptico como o único critério depackage","Attention":"Atenção","Abnormal":"Anormal","Critical":"Crítico","Auto detect":"De campeonatos de type","Splice event":"Evento de splice","Reflective connector":"Conector refletivo","Mechanical / reflective fault":"Falha mecânica/reflexiva","Possible bend":"Possível curva","Fiber end / possible break":"Fim da fibra / possível quebra","Possible ghost":"Possível fantasma","Unknown event":"Evento desconhecido","Event type selected manually":"Tipo de evento selecionado manualmente","Near the configured link end with high loss or strong reflection":"Perto do fim de ligação configurado com alta perda ou reflexão forte","Position is close to a multiple of an earlier strong reflection and event loss is small":"Posição está perto de um múltiplo de uma reflexão mais cedo forte e perda de evento é pequena","Secondary-wavelength loss is significantly higher than primary-wavelength loss":"A perda de comprimento de onda secundário é significativamente maior do que a perda de comprimento de onda primário","Reflective event with elevated insertion loss":"Evento refletivo com perda de inserção elevada","Reflective event detected":"Evento refletivo detectado","Low-loss non-reflective event":"Evento não-reflexivo de baixa perda","Non-reflective event above the normal splice-loss default":"Evento não refletivo acima do padrão normal de perda de splice","Record and monitor; immediate action is normally unnecessary.":"Gravar e monitorar; ação imediata normalmente é desnecessária.","Retest the event and review splice quality and bidirectional differences.":"Teste novamente o evento e reveja a qualidade da mistura e as diferenças bidirecionais.","Schedule resplicing or field retest and inspect the closure and nearby bends.":"Agendar replicação ou reteste de campo e inspecionar o fechamento e curvas próximas.","Prioritize resplicing and verify with bidirectional OTDR; replace damaged fiber if required.":"Priorize replicação e verifique com OTDR bidirecional; substituir fibra danificada, se necessário.","Clean the connector and record reflectance.":"Limpe o conector e grave a refletância.","Clean the end face and inspect the adapter and ferrule match.":"Limpe o rosto final e inspecione o adaptador e a combinação de ferrule.","Inspect contamination, damage, UPC/APC mismatch and loose connection.":"Inspecione contaminação, danos, incompatibilidade UPC/APC e conexão solta.","Correct the strong reflection or excessive insertion loss immediately.":"Corrija imediatamente a forte reflexão ou perda excessiva da inserção.","Review and document the mechanical joint.":"Rever e documentar a junta mecânica.","Inspect the joint, index-matching material and connection stability.":"Inspecione a estabilidade da articulação, do material de índice e da conexão.","Rebuild the joint or replace it with a fusion splice.":"Reconstruir a articulação ou substituí-la por uma mistura de fusão.","Prioritize the high-loss reflective joint and retest adjacent events.":"Priorize a articulação reflexiva de alta perda e reteste eventos adjacentes.","Review the cable route.":"Reveja a rota do cabo.","Inspect bend radius, drop cable and patch-cord routing.":"Inspecionar raio de dobra, soltar cabo e patch-cord roteamento.","Release bending or compression and compare 1310/1550 nm results.":"Liberte a flexão ou compressão e compare os resultados de 1310/1550 nm.","Correct the severe bend or compression point before the link deteriorates further.":"Corrija a curva grave ou o ponto de compressão antes que a ligação deteriore ainda mais.","Confirm the planned link end.":"Confirme o fim da ligação planeada.","Verify that the event is a normal end and review end reflection.":"Verifique se o evento é um fim normal e reveja a reflexão final.","Check for a break, disconnection, wrong port or end connector.":"Verifique se há uma pausa, desconexão, porta errada ou conector final.","Perform sectional testing with a VFL, power meter and OTDR to locate the break.":"Execute testes seccionais com VFL, medidor de potência e OTDR para localizar a ruptura.","Reduce pulse width and retest.":"Reduzir a largura do pulso e reteste.","Inspect the strong reflector and adjust range, pulse width and averaging.":"Inspecione o refletor forte e ajuste o alcance, a largura do pulso e a média.","Check whether the event moves with test settings before treating it as a real fault.":"Verifique se o evento se move com as configurações de teste antes de tratá-lo como uma falha real.","Correct the earlier strong reflection before interpreting remote events.":"Corrija a reflexão forte anterior antes de interpretar eventos remotos.","Record the event.":"Grave o evento.","Adjust test settings and retest.":"Ajuste as configurações do teste e reteste.","Use the trace, bidirectional testing and route records to identify the event.":"Use o rastreamento, testes bidirecionais e registros de rota para identificar o evento.","Schedule field localization and verify the physical topology.":"Programe a localização do campo e verifique a topologia física.","Spacing from the previous event is below the attenuation-dead-zone default; measured loss may be affected by event overlap.":"O espaço do evento anterior está abaixo do padrão da área morta de atenuação; a perda medida pode ser afetada pela sobreposição do evento.","Spacing from the previous event is below the event-dead-zone default; reflective events may not be fully separated.":"O espaço do evento anterior está abaixo do padrão da zona morta do evento; os eventos reflexivos podem não estar totalmente separados.","Template exported":"Modelo exportado","No saved records.":"Não há registos salvos.","CSV import complete":"Importação CSV completa","The CSV format is invalid or contains no valid events.":"O formato CSV é inválido ou não contém eventos válidos.","Clear all events?":"Limpar todos os eventos?","Add at least one valid event.":"Adicionar pelo menos um evento válido.","Enter parameters and calculate.":"Digite parâmetros e calcular.","Please check the highlighted input fields.":"Verifique por favor os campos de entrada destacados.","hours":"horas","days":"días","Target met":"Alvo atingido","Target not met":"éreo","Estimated runtime":"Tempo de execução estimado","Simplified Ah/energy model":"Modelo Ah/energia simplificado","Peukert-adjusted estimate":"Estimativa ajustada por Peukert","Result copied.":"Resultado copiado.","Record saved.":"Registro salvo.","History cleared.":"História limpa.","No saved project records.":"Não há registos de projecto salvos.","Equipment":"Equipamento","Qty":"Qty","Unit current":"Unidade atual","Total current":"Total actual","Remove":"Remover","The per-string discharge rate is high. Manufacturer constant-power or constant-current discharge tables are essential.":"A taxa de descarga por fio é alta. As tabelas de descarga constante ou constante-corrente do fabricante são essenciais.","The discharge rate is above a light standby rate; verify the selected battery's published discharge table.":"A taxa de descarga está acima de uma taxa de espera leve; verifique a tabela de descarga publicada da bateria selecionada.","The estimated runtime is shorter than the target runtime.":"O tempo de execução estimado é menor que o tempo de execução do alvo.","For a constant-power load, battery current rises materially as the bus approaches cutoff voltage.":"Para uma carga de potência constante, a corrente da bateria sobe materialmente à medida que o ônibus se aproxima da tensão de corte.","Five or more parallel strings require careful current sharing, protection, cabling and maintenance design.":"Cinco ou mais cordas paralelas requerem compartilhamento de corrente cuidadosa, proteção, cabeamento e design de manutenção.","The remaining-capacity factor is below 70%; replacement risk should be reviewed.":"O factor de capacidade restante é inferior a 70%; o risco de substituição deve ser revisto.","The temperature factor significantly reduces available capacity.":"O fator de temperatura reduz significativamente a capacidade disponível.","The selected usable depth exceeds 80% for a lead-acid preset. Confirm cycle life and end-voltage requirements.":"A profundidade utilizável selecionada excede 80% para uma predefinição de chumbo-ácido. Confirmar a vida útil do ciclo e os requisitos de tensão final.","For lithium systems, verify BMS cutoff, module parallel limits, current sharing and vendor runtime data.":"Para sistemas de lítio, verifique o corte BMS, os limites paralelos do módulo, o compartilhamento atual e os dados de execução do fornecedor.","Peukert correction is an engineering estimate. Constant-power ICT loads and real discharge curves may differ.":"A correção de Peukert é uma estimativa de engenharia. Cargas TIC de potência constante e curvas de descarga reais podem diferir.","Final sizing must be checked against manufacturer discharge data at the required end voltage and temperature.":"O dimensionamento final deve ser verificado gentismente com os dados de descarga do fabricante na tensão e temperatura finais requeridas.","A -48 V DC load has no AC power factor input. Use DC watts or DC amperes; path efficiency represents DC losses.":"A -48 Vcross não tem entrada de fator de alimentação AC. Utilizar watts de corrente contínua ou amperes de corrente contínua; a eficiência do caminho representa perdas de corrente contínua.","Base DC load current":"Corrente de carga DC base","Design current with margin":"Concepção atual com margem","Design power with margin":"Potência de projeto com margem","The client-to-AP uplink is the coverage bottleneck. Client transmit power often limits the practical cell edge.":"A ligação cliente-AP é o gargalo de cobertura. A potência de transmissão do cliente muitas vezes limita a borda da célula prática.","No saved results":"Sem resultados salvos","Required values are valid":"Os valores necessários são válidos","Not assessed (optional)":"Não avaliado (facultativo)","Optical budget passes; confirm vendor coding, firmware, FEC and DOM before deployment.":"O orçamento óptico passa; confirme o código do fornecedor, firmware, FEC e DOM antes da implantação.","The design meets port-count, total-budget and per-port power requirements.":"O projeto atende aos requisitos de contagem de portos, orçamento total e potência por porta.","Validate DHCP, gateway HA, VRF and fault-domain assumptions before deployment.":"Validar os pressupostos DHCP, gateway HA, VRF e domínio de falhas antes da implantação.","A common planning target keeps continuous load at or below 80% of the breaker or PDU rating. Verify local code and equipment documentation.":"Um alvo comum de planejamento mantém alas contínuas a 80% ou menos do disjuntor ou classificação PDU. Verificar código local e documentação do equipamento.","Compare baseline, growth and conservative scenarios from the current inputs, then export traceable engineering outputs.":"Compare a linha de base, o crescimento e cenários conservadores a partir das entradas atuais, em seguida, exportar saídas de engenharia rastreáveis.","Recalculate baseline, growth and conservative scenarios from the current inputs, then export traceable results.":"Recalcule os cenários de base, crescimento e conservador a partir dos insumos atuais, em seguida, exporte resultados rastreáveis.","Verify resolver policy, authoritative capacity and stale-data behavior before change.":"Verifique a política do solucionador, a capacidade autorizada e o comportamento de dados obsoletos antes da mudança.","Local-only: configuration and findings are not sent to AI or analytics.":"Somente local: a configuração e os achados não são enviados para IA ou análise.","Paste a supported ACL or build one from parameters. Processing stays in this browser.":"Colar um ACL suportado ou compilar um a partir de parâmetros. O processamento fica neste navegador.","No high-confidence findings matched. This is not proof that the ACL is safe or complete.":"Nenhum resultado de alta confiança correspondeu. Isto não é prova de que o ACL é seguro ou completo.","This score is a deterministic screening aid, not proof of availability, security or compliance.":"Esta pontuação é uma ajuda de rastreio determinística, não prova de disponibilidade, segurança ou conformidade.","No current result — the latest input was rejected.":"Nenhum resultado atual — o último dado foi rejeitado.","Example loaded — review the highlighted inputs before building a plan.":"Exemplo carregado — reveja as entradas destacadas antes de construir um plano.","Two C9200L stack members each contribute one uplink to Port-channel10. VLAN 100 is added while preserving the existing native VLAN.":"Dois membros da pilha C9200L contribuem com um link para o canal de Porto10. VLAN 100 é adicionado enquanto preserva o VLAN nativo existente.","Two aggregate members selected":"Dois membros agregados selecionados","Review risk, forward config and rollback first; then follow the runbook and paste post-check evidence.":"Reveja o risco, config forward e rollback primeiro; em seguida, siga o runbook e cole evidências pós-check.","Expand the reasons below before approving the change.":"Expanda as razões abaixo antes de aprovar a alteração.","Extends Layer-2 reachability. Confirm the VLAN is intended and present end-to-end.":"Estenda a capacidade de alcance da camada 2. Confirme que o VLAN se destina e está presente de ponta a ponta.","The snapshot contains unmanaged lines. Review nearby configuration before execution.":"O instantâneo contém linhas não gerenciadas. Reveja a configuração próxima antes da execução.","Risk is below the peer-review threshold, but normal change approval still applies.":"O risco está abaixo do limiar de revisão por pares, mas a aprovação de alterações normais ainda se aplica.","Capture current aggregate/member state":"Capturar o estado atual agregado/membro","Evidence before PASS":"Provas antes do PASS","Scenarios and installation limits":"Cenários e limites de instalação","Capacity and failure checks":"Controlos de capacidade e de falhas","Selected modules: installed count, or worst-case recommendation when installed = 0. Failure checks use physical environmental capacity; target reserve is a separate planning check.":"Módulofigurado: contagem instalada, ou pior recomendação quando instalado = 0. Os controlos de falhas utilizam a capacidade física ambiental; a reserva-alvo é uma verificação de planeamento separada.","Worst-case required current":"Corrente necessária para o pior caso","Additional load within target reserve":"Carga adicional dentro da reserva-alvo","Before / After plan comparison":"Antes / Após comparação do plano","Current plan uses installed modules or baseline sizing. Recharge-limited adjustment retains those modules and limits charging for the combined growth / conservative condition. Expansion retains full peak recharge.":"O plano atual usa módulos instalados ou dimensionamento de linha de base. O ajuste limitado por recarga mantém esses módulos e limita a cobrança para o crescimento combinado / condição conservadora. A expansão mantém a recarga máxima.","Target reserve met; verify controller settings and battery recovery time.":"Reserva do alvo cumprida; verificar configurações do controlador e tempo de recuperação da bateria.","Verify compatible module model, controller licensing, AC feeder, busbar and DC distribution ratings before procurement. A failed frame limit requires a larger frame; adding slots alone does not resolve it.":"Verificar modelo de módulo compatível, licenciamento do controlador, alimentador AC, barra de ônibus e classificações de distribuição DC antes da aquisição. Um limite de frame falhou requer um quadro maior; adicionar slots sozinho não resolve isso.","Add peak, conservative-case and site limits. Leave automatic fields blank to use the current IT load.":"Bolsas de pico, casos conservadores e locais. Bolsas automáticas em branco para usar a carga de TI atual.","Leave blank to use the current IT load":"Deixe em branco para usar a carga de TI atual","Leave blank to use the peak IT load":"Deixe em branco para usar o pico de carga de TI","Optional; leave blank when no extra sensible load applies":"Opcional; deixar em branco quando não se aplica nenhuma carga extra sensível","Used for environmental risk checks":"Utilizado para controlos de risco ambiental","Maximum cooling units allowed by the site":"Unidades de arrefecimento máximas permitidas pelo local","Optional; leave blank for no unit-count limit":"Opcional; deixar em branco sem limite de contagem unitária","Topology capacity and N-1 failure matrix updated.":"Capacidade de topo Disposições e matriz de falha N-1 atualizada.","No major ring-capacity warning under the entered assumptions.":"Nenhum aviso importante sobre a capacidade do anel ao abrigo dos pressupostos apresentados.","Prioritize capacity expansion on the surviving bottleneck span in the worst failure scenario.":"Priorize a expansão da capacidade no período de gargalo sobrevivente no pior cenário de falha.","Migrate or reroute traffic to reduce post-protection peak loading.":"Migrar ou redirecionar o tráfego para reduzir o pico de carga pós-proteção.","Dual-uplink, channel and MSE failure-state capacity updated.":"monia, canal e capacidade de estado de falha MSE atualizada.","No major capacity or common-mode failure warning under the entered assumptions.":"Nenhum aviso de falta de capacidade ou de modo comum nos termos dos pressupostos apresentados.","Normal, failure and growth scenarios are within the target threshold.":"Os cenários normais, de falha e de crescimento encontram-se dentro do limiar-alvo.","Compare designs and review Before / After and N-1 impact.":"Compare projetos e revisão Antes / Depois e N-1 impacto.","N-1 remains within the target threshold.":"N-1 permanece dentro do limite alvo.","Normal":"Normal","Growth and recharge peaks are also tested together. Conservative reserve adds percentage points to engineering headroom. Environmental coefficients are editable planning assumptions; verify manufacturer curves, bus voltage and low AC input limits.":"Os picos de crescimento e recarga também são testados em conjuntoTelecomunicações. Reserva conservadora acrescenta pontos percentuais à sala de engenharia. Os coeficientes ambientais são pressupostos de planejamento editáveis; verificar curvas do fabricante, tensão de barramento e baixos limites de entrada de CA.","Recalculate baseline, growth and conservative paths while checking fragmentation, frame limits, redundancy and failure boundaries.":"Recalcule os caminhos basais, de crescimento e conservadores ao verificar a fragmentação, limites de quadros, redundância e limites de falhas."}))if(!exact.has(en))exact.set(en,es);

// Independently observed remaining ES field labels.
for(const [key,value]of Object.entries({
  "Source":"Origem",
  "Destination":"Destino",
  "Port":"Porto",
  "Remove rule":"Remover regra",
  "Authoritative propagation margin":"Margem de propagação autorizada",
  "Download JSON":"Baixar JSON",
  "Download CSV":"Baixar CSV",
  "Assessment item name":"Nome do item de avaliação",
  "Likelihood 1–5":"Probabilidade 1–5",
  "Operator cap / port":"Tampa/porta do operador",
  "Protection factor 1/2":"Factor de protecção 1/2",
  "Failed uplinks (N-1)":"Ligação inicial falhada (N-1)",
  "After-growth scenario %":"Cenário pós-crescimento %",
  "Wi-Fi generation":"Geração Wi-Fi",
  "Manual event type":"Tipo de evento manual",
  "Bend comparison":"Comparação da curva",
  "History":"Histórico",
  "Protection chain required":"Cadeia de proteção necessária",
  "Protection chain present":"Cadeia de proteção presente",
  "Dual uplink required":"Ligação ascendente dupla necessária"
}))exact.set(key,value);
// Reviewed human-readable report labels.
for(const [key,value] of Object.entries({
  "Model":"Modelo",
  "Battery bank":"Banco de baterias",
  "Nominal voltage":"Tensão nominal",
  "Design load current":"Corrente de carga de projeto",
  "Design load power":"Potência de carga de projecto",
  "Average current":"Corrente média",
  "Estimated runtime":"Tempo de execução estimado",
  "Delivered usable energy":"Entregue energia utilizável",
  "Target runtime":"Tempo de execução do alvo",
  "Required total capacity":"Capacidade total exigida",
  "Required parallel strings":"Textos paralelos necessários",
  "Note":"Nota",
  "NetEngineerLab -48V Telecom Battery Runtime Calculator V1.1":"Calculadora de tempo de execução da bateria de Telecom NetEngineerLab -48V V1.1",
  "Data Center Fabric Plan":"Plano de tecido de data center",
  "Total convergence":"Convergência total",
  "Fabric utilization":"Utilização de tecidos",
  "Network Hidden-Hazard Assessment Report":"Relatório de Avaliação do Hidden-Hazard da Rede",
  "Website":"Sítio Web",
  "Completion":"Conclusão",
  "Abnormal":"Anormal",
  "Unverified":"Não verificado",
  "Critical":"Crítico",
  "Before/After risk":"Sumário",
  "Risk reduction":"Redução do risco",
  "Top risks":"Principais riscos",
  "Boundary":"Limite",
  "Required switch budget":"Orçamento de mudança necessário",
  "PD load":"Carga PD",
  "Budget utilization":"Utilização orçamental",
  "Maximum devices":"Dispositivos máximos",
  "NetEngineerLab PoE Power Budget Calculator":"Calculadora de orçamento de energia NetEngineerLab PoE",
  "Canonical IPv6":"Canonical IPv6",
  "Expanded IPv6":"IPv6 Expandido",
  "Parent network":"Rede-mãe",
  "Parent last":"Último pai",
  "Child prefix count":"Número de prefixos dos filhos",
  "Addresses per child":"Endereços por filho",
  "Containing child":"Que contenham crianças",
  "Containing index":"Contendo índice",
  "Public IPv4":"IPv4 público",
  "Subscribers":"Assinantes",
  "Raw ports/protocol":", em conformidade com o artigo 2.o, n.o 1, do Regulamento (UE) n.o2013,",
  "Usable ports/protocol/IP":"Portas/protocolo/IP utilizáveis",
  "Enabled protocol pools":"Grupos de protocolos habilitados",
  "Mappings/public IPv4":"Mapeamentos/IPv4 público",
  "Total mapping capacity":"Capacidade total de mapeamento",
  "Required mappings":"Mapeamentos necessários",
  "Required public IPv4":"Público necessário IPv4",
  "Maximum subscribers":"Número máximo de assinantes",
  "Sharing ratio":"Taxa de partilha",
  "Capacity usage %":"Utilização da capacidade %",
  "Usable ports/IP":"Portas utilizáveis/ IP",
  "Port block size":"Tamanho do bloco de porto",
  "Blocks/public IPv4":"Blocos/IPv4 público",
  "Supported subscribers":"Assinantes apoiados",
  "Spare subscribers":"Assinantes sobresselentes",
  "Subscriber capacity %":"Capacidade do assinante %",
  "TCP peak mappings/subscriber":"TCP pico de mapeamentos/subscritor",
  "UDP peak mappings/subscriber":"UDP pico de mapeamentos/subscritor",
  "Port block usage %":"Utilização do bloco de porto %",
  "Active mappings":"Mapas ativos",
  "Daily log events":"Eventos diários de registo",
  "Translation prefix":"Prefixo de tradução",
  "Prefix length":"Comprimento prefixo",
  "Synthesized IPv6":"IPv6 sintetizado",
  "WKP":"WKP",
  "Local-use prefix":"Prefixo de uso local",
  "Coverage AP count":"Contagem de cobertura AP",
  "Design radius m":"Raio de projecto m",
  "RF radius m":"pescadores com um peso não superior a 2 kg",
  "Downlink radius m":"Raio de ligação descendente m",
  "Uplink radius m":"Raio de ligação ascendente m",
  "AP EIRP dBm":"AP EIRP dBm",
  "Client EIRP dBm":"Cliente EIRP dBm",
  "Obstacle loss dB":"Perda de obstáculos dB",
  "Effective area/AP m2":"Área efetiva/AP m2",
  "APs/floor":"APs/andar",
  "Capacity AP count":"Capacidade Contagem AP",
  "Reference PHY Mbps":"Referência PHY Mbps",
  "Effective throughput/AP Mbps":"Produção eficaz/AP Mbps",
  "Total demand Mbps":"Total da procura Mbps",
  "Throughput AP count":"Contagem AP de rendimento",
  "Client-count AP count":"Contagem do cliente Contagem AP",
  "Associated users/AP":"Usuários associados/AP",
  "Active users/AP":"Usuários activos/AP",
  "Throughput headroom %":"Cabeçalho de entrada %",
  "Final AP count":"Número AP final",
  "Available 20 MHz channels":"Disponível 20 canais MHz",
  "Channel width MHz":"Largura do canal MHz",
  "Reusable channel groups":"Grupos de canais reutilizáveis",
  "APs/channel group":"APs/grupo de canais",
  "Associated users/final AP":"Usuários associados/PA final",
  "Active users/final AP":"Usuários activos/PA final",
  "Demand/final AP Mbps":"Demanda/final AP Mbps",
  "Throughput utilization %":"Utilização do rendimento %",
  "Floor allocation":"Dotação por piso",
  "NetEngineerLab Wi-Fi Coverage & Capacity Planner":"NetEngineerLab Wi-Fi",
  "Results are engineering estimates. Final AP design requires a regulatory review, vendor data and an on-site predictive/active survey.":"Os resultados são estimativas de engenharia. O projeto final da AP requer uma revisão regulatória, dados do fornecedor e uma pesquisa preditiva/ativa no local.",
  "Network Change Method of Procedure":"Método de Procedimento de Mudança de Rede",
  "Device":"Dispositivo",
  "Vendor":"Fabricante",
  "Logical aggregate":"Agregado lógico",
  "Plan status":"Estado do plano",
  "Change scope":"Alterar o âmbito de aplicação",
  "Members":"Membros",
  "Allowed VLANs":"VLANs permitidos",
  "Description":"Designação das mercadorias",
  "Semantic delta":"Delta semântico",
  "Members added":"Membros adicionados",
  "Members removed":"Membros removidos",
  "VLANs added":"VLANs adicionados",
  "VLANs removed":"VLANs removidos",
  "Risk reasons":"Motivos de risco",
  "Execution runbook":"Executar livro de execução",
  "Change authorization":"Alterar autorização",
  "Standard operator approval":"Aprovação normalizada do operador",
  "Success criteria":"Critérios de sucesso",
  "Rollback triggers":"Ativadores de retrocesso",
  "Apply minimal forward delta":"Aplicar o delta mínimo para a frente",
  "Rollback gate":"Porta de retrocesso",
  "Rollback configuration":"Configuração de retrocesso",
  "Minimal forward configuration":"Configuração mínima da frente",
  "Post-change decision":"Decisão pós-mudança",
  "Decision":"Decisão",
  "Passed":"Passado",
  "Failed":"Falha",
  "Inconclusive":"Inconclusivo",
  "Extends Layer-2 reachability. Confirm the VLAN is intended and present end-to-end.":"Estenda a capacidade de alcance da camada 2. Confirme que o VLAN se destina e está presente de ponta a ponta.",
  "Documentation-only change with low forwarding impact.":"Mudança de documentação apenas com baixo impacto de encaminhamento.",
  "The snapshot contains unmanaged lines. Review nearby configuration before execution.":"O instantâneo contém linhas não gerenciadas. Reveja a configuração próxima antes da execução.",
  "Generated locally by NetEngineerLab. Review against the applicable vendor guide and your organization's change process before production execution.":"Gerado localmente por NetEngineerLab. Consulte o guia de fornecedores aplicável e o processo de mudança da sua organização antes da execução da produção.",
  "Engineering Report":"Relatório de Engenharia",
  "Method of Procedure (MOP)":"Método de procedimento (MOP)",
  "Engineering Review Checklist":"Lista de Verificação de Revisão de Engenharia",
  "Engineering Results Register":"Registro de Resultados da Engenharia",
  "Included results":"Resultados incluídos",
  "Compiled from user-imported tool results. Verify inputs, sources and applicable standards before delivery or execution.":"Compilado a partir dos resultados da ferramenta importada pelo usuário. Verifique entradas, fontes e padrões aplicáveis antes da entrega ou execução."
}))if(!exact.has(key))exact.set(key,value);
// Verified remaining report templates; free field values are preserved.
exact.set("Risk","Risco");exact.set("Capture trunk state","Capturar o estado do tronco");exact.set("Confirm target VLAN inventory","Confirmar o inventário VLAN alvo");exact.set("Target VLANs remain present","Os VLANs-alvo permanecem presentes");
// Same-tool MOP source literals reviewed against actual runtime; user fields and command blocks remain protected.
for(const [english,spanish]of [["Creates a new logical aggregate. Confirm the ID is unused and both ends are coordinated.", "Cria um novo agregado lógico. Confirme que o ID não é utilizado e ambas as extremidades são coordenadas."],["Adds physical members to the bundle. A wrong member can affect an existing uplink.", "Adiciona membros físicos ao pacote. Um membro errado pode afetar um uplink existente."],["Removes existing members and reduces available bundle capacity during the change.", "Remove os membros existentes e reduz a capacidade do pacote disponível durante a mudança."],["Removes VLAN reachability from the trunk and may interrupt dependent services.", "Remove a acessibilidade VLAN do tronco e pode interromper serviços dependentes."],["Changes untagged/PVID behavior. Mismatch across the link can create traffic leakage or loss.", "Alterações de comportamento não marcadas/PVID. Mismatch através do link pode criar vazamento de tráfego ou perda."],["A blocking conflict was detected. Do not execute until it is resolved.", "Foi detectado um conflito de bloqueio. Não executar até que seja resolvido."],["No incremental factors", "Sem fatores incrementais"],["Inputs changed. Rebuild the plan.", "As entradas mudaram. Reconstruir o plano."],["Cisco stack uplink: add VLAN 100", "Cisco stack uplink: adicionar VLAN 100"],["Huawei campus uplink: expand trunk", "Huawei campus uplink: expandir tronco"],["A dual-link S5735 uplink keeps Eth-Trunk10 and expands the allowed VLAN set with a minimal delta.", "Um link S5735 de ligação dupla mantém Eth-Trunk10 e expande o conjunto VLAN permitido com um delta mínimo."],["Juniper VC: ae10 trunk normalization", "Juniper VC: normalização do tronco ae10"],["Two EX3400 Virtual Chassis members form ae10. The plan reconciles trunk membership and description without rebuilding correct state.", "Dois membros do chassi virtual EX3400 formam ae10. O plano reconcilia a adesão e descrição do tronco sem reconstruir o estado correto."],["Arista DC uplink: controlled VLAN expansion", "Arista DC uplink: expansão controlada VLAN"],["A 7050SX3 Port-Channel change demonstrates the same intent workflow on a data-center switching platform.", "Uma mudança de porto-canal 7050SX3 demonstra o mesmo fluxo de trabalho de intenção em uma plataforma de comutação de data-center."],["Running config pasted", "A executar a configuração foi colada"],["Allowed VLAN set defined", "Conjunto VLAN permitido definido"],["Native/PVID is included in allowed VLANs", "Nativo/PVID está incluído em VLANs permitidos"],["Risk score", "Pontuação de risco"],["Current managed state already matches the desired intent.", "O estado de gerenciamento atual já corresponde à intenção desejada."],["Review this risk factor before execution.", "Reveja este fator de risco antes da execução."],["No incremental risk factors were added.", "Não foram adicionados fatores de risco incrementais."],["The managed running state already matches the requested intent. No configuration commands are required.", "O estado de execução gerenciado já corresponde à intenção solicitada. Não são necessários comandos de configuração."],["The plan is blocked by a conflict. Resolve the conflict before generating an execution window.", "O plano está bloqueado por um conflito. Resolver o conflito antes de gerar uma janela de execução."],["Risk threshold requires peer review and a controlled maintenance window.", "O limiar de risco requer revisão por pares e uma janela de manutenção controlada."],["No configuration changes required.", "Não são necessárias alterações de configuração."],["No rollback configuration required.", "Nenhuma configuração de retrocesso necessária."],["Success", "Sucesso"],["Paste the real device output for this command", "Colar a saída real do dispositivo para este comando"],["Stop:", "Parar:"],["Resolve the blocking conflict before reviewing an execution runbook.", "Resolver o conflito de bloqueio antes de rever um runbook de execução."],["No change required:", "Nenhuma alteração necessária:"],["The managed state already matches the desired intent.", "O estado gerenciado já corresponde à intenção desejada."],["Next:", "Próximo:"],["Fix the highlighted input or current-state conflict, then rebuild the plan.", "Corrigir a entrada ou conflito de estado atual destacado, em seguida, reconstruir o plano."],["Verification decision:", "Decisão de verificação:"],["Review rollback triggers before the next action.", "Reveja os gatilhos de retro cape antes da próxima ação."],["Vendor sample loaded. Adjust the desired intent, then build the plan.", "Amostra de vendedor carregada. Ajuste a intenção desejada e, em seguida, construa o plano."],["Obtain peer review/change approval", "Obter a aprovação da revisão por pares/alteração"],["Resolve blocking conflicts before execution.", "Resolver os conflitos de bloqueio antes da execução."],["Change blocked", "Mudança bloqueada"],["No change required", "Nenhuma alteração necessária"],["Current managed state already matches desired intent.", "O estado gerenciado atual já corresponde à intenção desejada."]])if(!exact.has(english))exact.set(english,spanish);
function tr(s){if(!s)return s;const t=s.trim();if(exact.has(t))return s.replace(t,exact.get(t));if(t.includes(' · ')){const parts=t.split(' · ');const mapped=parts.map(part=>tr(part));if(mapped.some((v,i)=>v!==parts[i]))return s.replace(t,mapped.join(' · '));}let out=s;
out=out.replace(/^Step (\d+) of (\d+)$/i,'Etapa $1 de $2');
out=out.replace(/^Warnings:\s*/i,'Avisos: ');
out=out.replace(/^Design loss:\s*/i,'Perda de projeto: ');
out=out.replace(/^Remaining:\s*/i,'Restante: ');
out=out.replace(/^Project:\s*/i,'Projeto: ');
out=out.replace(/^Mode:\s*/i,'Modo: ');
out=out.replace(/^Environmental current per module:\s*/,'Corrente ambiente por módulo: ');
out=out.replace(/^Planning current at target utilization:\s*/,'Corrente de planejamento na utilização alvo: ');
out=out.replace(/^Recharge-limited proposal:\s*/,'Proposta com recarga limitada: ');
out=out.replace(/^Before\/After:\s*(.*?); Δ margin /,'Antes/depois: $1; Δ margem ');
out=out.replace(/^Before\/After:\s*(.*?); airflow delta /,'Antes/depois: $1; Δ vazão de ar ');
out=out.replace(/^The planner will change (\d+) member binding\(s\) and (\d+) VLAN membership item\(s\)\.$/,'O planejador vai alterar $1 vínculo(s) de membro e $2 item(ns) de associação de VLAN.');
out=out.replace(/^(\d+) of (\d+) checks have evidence\.$/,'$1 de $2 verificações têm evidência.');
out=out.replace(/^(\s*)(\S+) up with (\d+) intended members(\s*)$/,'$1$2 ativo com $3 membros previstos$4');
out=out.replace(/^(\s*)(\S+) operational\/up with no new errors(\s*)$/,'$1$2 operacional/ativo sem erros novos$3');

// These anchored templates describe rendered human-readable result strings.
out=out.replace(/^([-+]?\d[\d.,]*) (hours|days)$/,(_,amount,unit)=>amount+' '+({hours:'horas',days:'dias'}[unit]));
out=out.replace(/^Baseline (.*?) → Peak (.*?) → Conservative (.*)$/,'Base $1 → Pico $2 → Conservador $3');
out=out.replace(/^Baseline → Peak → Conservative; N-1: (.*)$/,'Base → Pico → Conservador; N-1: $1');
out=out.replace(/^Possible low-output modules: (.*)$/,'Possíveis módulos com baixa saída: $1');
out=out.replace(/^Overloaded modules: (.*)$/,'Módulos sobrecarregados: $1');
out=out.replace(/^Risk: (low|medium|high|critical) · (.*)$/i,(_,risk,note)=>'Risco: '+({low:'baixo',medium:'médio',high:'alto',critical:'crítico'}[risk.toLowerCase()])+' · '+tr(note));
out=out.replace(/^Generator capacity: (PASS|FAIL)$/,(_,state)=>'Capacidade do gerador: '+(state==='PASS'?'ATENDE':'NÃO ATENDE'));
out=out.replace(new RegExp('^PASS / (.*)$'),'ATENDE / $1').replace(new RegExp('^FAIL / (.*)$'),'NÃO ATENDE / $1');
out=out.replace(/^(Proposed total modules|Additional modules|Additional slots|Frame maximum|Installed slots|Generated|Language|Engine): (.*)$/,(_,label,value)=>({"Proposed total modules":"Total de módulos proposto","Additional modules":"Módulos adicionais","Additional slots":"Slots adicionais","Frame maximum":"Máximo do bastidor","Installed slots":"Slots instalados","Generated":"Gerado","Language":"Idioma","Engine":"Motor"})[label]+': '+value);
out=out.replace(/^Capture (\S+) state$/,(_,name)=>'Capture o estado de '+name);
out=out.replace(/^Allowed VLANs (.*); native\/PVID (.*)$/,(_,vlans,native)=>'VLANs permitidas '+vlans+'; nativa/PVID '+native);
out=out.replace(/^Design ([-+\d.,]+ kW \| [-+\d.,]+ VA \| [-+\d.,]+ A \| [-+\d.,]+ BTU\/h \| [-+\d.,]+) kWh\/month$/,(_,values)=>'Projeto '+values+' kWh/mês');
out=out.replace(/^Allowed VLANs (.*)$/,(_,vlans)=>'VLANs permitidas '+vlans);
out=out.replace(/^native\/PVID (.*)$/,(_,value)=>'nativa/PVID '+value);
out=out.replace(/^Native\/PVID changes from (.*?) to (.*?); verify both ends of the link\.$/,(_,before,after)=>'A VLAN nativa/PVID muda de '+(before==='none'?'nenhuma':before)+' para '+(after==='none'?'nenhuma':after)+'; verifique as duas pontas do enlace.');
return out;}
// Reviewed same-tool human UI labels only; never apply these phrases to reports or user values.
const uiLexicons={
  "dns-ttl-propagation-calculator": {
    "Peak/previous TTL": "TTL máximo/anterior",
    "Resolver population": "Población de resolutores",
    "Resolver growth": "Crecimiento de resolutores",
    "Stale-serve exposure": "Exposição a respostas desatualizadas"
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
// Project titles are user data, even when they equal para translated state word.
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
 if(uiSlug==='48v-battery-runtime'&&p.closest('button[data-history]')&&t==='Load')return original.replace(t,'Carregar');
 if(uiSlug==='wifi-coverage-capacity-planner'){
  if(p.closest('button[data-load]')&&t==='Load')return original.replace(t,'Carregar');
  if(p.closest('button[data-delete]')&&t==='Delete')return original.replace(t,'Excluir');
  if(p.matches('.history-item > span')&&['coverage','capacity','combined','channel'].includes(t)){
   const tab=document.querySelector('[data-tab="'+t+'"]');
   if(tab)return original.replace(t,tab.textContent.trim());
  }
 }
 const prefixes={
  'onu-rx-power':[['Measured:','Potência medida:'],['Sensitivity margin:','Margem de sensibilidade:']],
  'otdr-event':[['Events ','Eventos '],['Abnormal ','Anormais '],['Critical ','Críticos '],['Estimated loss ','Perda estimada ']],
  'pon-distance':[['Effective max:','Máximo efetivo:'],['Planned:','Planejado:']],
  'pon-splitter-loss':[['Ratio:','Relação:']]
 };
 let result=original;
 for(const [from,to]of prefixes[uiSlug]||[])result=result.split(' · ').map(part=>part.trimStart().startsWith(from)?part.replace(from,to):part).join(' · ');
 return result!==original?result:null;
}
function translateTextNode(n){
 const p=n.parentElement;if(!p||p.closest('script,style,code,pre,sup,.eq,[data-scenario-expected],[data-nel-technical]')||localeValueOwner(p))return;
 const original=n.nodeValue,t=original.trim();
 const ui=p.closest('label,option,h1,h2,h3,h4,button');
 let value=historyHumanText(p,original)??(ui&&Object.prototype.hasOwnProperty.call(uiLexicon,t)?original.replace(t,uiLexicon[t]):tr(original));
 if(value!==original){const option=p.closest('option');if(option&&!option.hasAttribute('value'))option.setAttribute('value',option.value);n.nodeValue=value;}
}
function walk(root){const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];while(w.nextNode())nodes.push(w.currentNode);for(const n of nodes)translateTextNode(n);for(const el of root.querySelectorAll?.('[aria-label],[title],[placeholder]')||[]){if(el.closest('script,style,code,pre,sup,[data-scenario-expected],[data-nel-technical],[data-nel-locale-value]'))continue;for(const a of ['aria-label','title','placeholder'])if(el.hasAttribute(a)){const old=el.getAttribute(a),t=old.trim();const v=Object.prototype.hasOwnProperty.call(uiLexicon,t)?old.replace(t,uiLexicon[t]):tr(old);if(v!==old)el.setAttribute(a,v);}}}
const obs=new MutationObserver(ms=>{for(const m of ms){for(const n of m.addedNodes){if(n.nodeType===Node.TEXT_NODE)translateTextNode(n);else if(n.nodeType===Node.ELEMENT_NODE)walk(n);}if(m.type==='characterData')translateTextNode(m.target);}});
function start(){document.documentElement.lang='pt-BR';walk(document.body);obs.observe(document.body,{childList:true,subtree:true,characterData:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
function translateHumanReport(value){
const source=String(value);if(/^[\s\uFEFF]*[\[{]/.test(source))return source;
const translatedValues=new Set(['Status','Design status','Risk','Risk level','Model','Mode','Note','Reason','Warning','Warnings','Recommendation','Recommendations','Acceptance','Result','Success criteria']);
const enums={healthy:'Saudável',warning:'Aviso',failed:'Não atende',pass:'Atende',fail:'Não atende',low:'baixo',medium:'médio',high:'alto',critical:'crítico'};
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

