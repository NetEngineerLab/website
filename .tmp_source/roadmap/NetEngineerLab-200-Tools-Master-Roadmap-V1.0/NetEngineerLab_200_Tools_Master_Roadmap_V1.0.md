# NetEngineerLab 200 Tools Master Roadmap V1.0

**Status:** DRAFT FOR AUDIT / NOT FROZEN  
**Strategic Target:** ≈200 high-quality tools  
**Capacity Ceiling:** 250  
**Current site state:** existing tools must be reconciled before new development  

## 1. Roadmap Principle

本 Roadmap 基于已冻结的《Global Technology Radar & Tool Boundary V1.1》。

核心规则：

- 200 是战略目标，不是强制配额。
- 现有约40个工具先映射到 canonical_problem_id；命中同一问题的不得重复开发。
- 每个工具只有1个 Primary Domain。
- Reserved / Emerging 工具严格受控，不得为了“未来感”挤占 Core/Growth 工具。
- 新工具进入开发前仍需通过 Tool Admission Gate。
- 本文件建立 Roadmap，不代表自动开放全部200个工具开发。

## 2. Domain Allocation

| Code | Domain Group | Primary Domain | Planned Tools |
|---|---|---|---:|
| A1 | Core Networking | Ethernet / Switching | 16 |
| A2 | Core Networking | IP / Routing / MPLS / SRv6 | 18 |
| A3 | Core Networking | WAN / SD-WAN / SASE | 10 |
| A4 | Core Networking | Internet / DNS / CDN / Interconnection | 9 |
| B1 | Access & Transport | PON / FTTx / Access | 13 |
| B2 | Access & Transport | Optical & Transport | 13 |
| B3 | Access & Transport | Wireless / RAN | 12 |
| B4 | Access & Transport | Edge / IoT | 8 |
| C1 | Data Center & Cloud | Data Center Networking | 12 |
| C2 | Data Center & Cloud | AI / GPU / HPC Networking | 11 |
| C3 | Data Center & Cloud | Cloud Networking | 9 |
| C4 | Data Center & Cloud | Cloud-Native Networking | 9 |
| D1 | Automation & Operations | Network Automation / Programmability | 12 |
| D2 | Automation & Operations | Observability / Telemetry / AIOps | 11 |
| E1 | Security & Infrastructure | Network Security | 13 |
| E2 | Security & Infrastructure | Power / Cooling / Facility Infrastructure | 10 |
| F1 | Future Networks | Quantum Networking | 3 |
| R18 | Reserved Primary Domains | Telecom Core & Platforms | 3 |
| R19 | Reserved Primary Domains | Space / Satellite / NTN Communications | 4 |
| R20 | Reserved Primary Domains | 6G / IMT-2030 Future Networks | 4 |
|  | **Total** |  | **200** |

## 3. Phase Model

### Phase 0 — Reconcile Existing Tools
不新增工具。把现有约40个工具映射到本 Roadmap：
- canonical_problem_id
- existing tool ID
- primary_domain
- duplicate/merge decision
- current Gate

只有 Phase 0 完成后，Roadmap 中未实现的工具才能进入开发队列。

### Phase A — Foundation / Highest Value
优先补齐核心计算、容量、规划、可靠性、网络基础能力。

### Phase B — Engineering Expansion
扩展设计、规划、工程、自动化、云、数据中心与运维能力。

### Phase C — Advanced / Workflow Depth
进入高级场景、故障条件、趋势预测、跨域规划和工程工作流。

### Phase D — Controlled Growth / Emerging
受控进入 AI Fabric、PQC、Quantum、Telecom Core、Space/NTN、6G 等增长或新兴领域。

Phase D 不得因 Roadmap 已列出就自动开发，仍需成熟度与 Gate 复核。

## 4. Tool Admission Before Development

### Mandatory Gates — all required
1. 不重复
2. 工程问题明确
3. 输入/输出明确
4. 核心逻辑可定义
5. Source / Method / Validation 可验证
6. 与 NetEngineerLab 站点边界一致

### Value Gates — at least 2
- 明确用户需求
- 高工程价值
- SEO价值
- Tutorial/Case/Diagram联动
- 用户复访价值
- 商业化潜力

## 5. Existing Tool Reconciliation Rule

Roadmap 中所有条目当前 `existing_mapping=RECONCILE`。

Phase 0 对现有工具逐项判断：
- EXACT_MATCH → 标记 EXISTING
- PARTIAL_MATCH → 评估 UPGRADE/MERGE
- DUPLICATE → 不新增
- NOT_PRESENT → 保持 PLANNED

禁止因 Roadmap ID 与现有 Tool ID 不同而重复开发。

## 6. Reserved / Emerging Guard

- R18 Telecom Core：仅受控候选，未自动激活为 Active Domain。
- R19 Space / Satellite / NTN：LEO/NTN/D2D 属 Growth；深空/月球仍 Reserved。
- R20 6G：仅 IMT-2030 特有工程问题；普通 RF/覆盖/MIMO 仍归 Wireless/RAN。
- Quantum：只保留少量真实工程工具，不扩大为概念工具族。

## 7. 200-Tool Canonical Roadmap

| ID | Tool | Primary Domain | Maturity | Phase | Priority | Lifecycle |
|---|---|---|---|---|---|---|
| TOOL-001 | Ethernet Frame Overhead Calculator | Ethernet / Switching | CORE | A | P1 | CALCULATE |
| TOOL-002 | Switch Port Capacity Calculator | Ethernet / Switching | CORE | A | P1 | CALCULATE,OPTIMIZE |
| TOOL-003 | Switch Oversubscription Ratio Calculator | Ethernet / Switching | CORE | A | P1 | CALCULATE |
| TOOL-004 | Access Switch Uplink Bandwidth Planner | Ethernet / Switching | CORE | A | P1 | PLAN |
| TOOL-005 | N-1 Uplink Oversubscription Calculator | Ethernet / Switching | CORE | A | P1 | CALCULATE |
| TOOL-006 | Link Aggregation Capacity Calculator | Ethernet / Switching | CORE | B | P2 | CALCULATE,OPTIMIZE |
| TOOL-007 | LACP Member Failure Capacity Planner | Ethernet / Switching | CORE | B | P2 | PLAN,OPTIMIZE |
| TOOL-008 | VLAN Capacity Planner | Ethernet / Switching | CORE | B | P2 | PLAN,OPTIMIZE |
| TOOL-009 | STP Path Cost Calculator | Ethernet / Switching | CORE | B | P2 | CALCULATE,OPTIMIZE |
| TOOL-010 | RSTP Convergence Estimator | Ethernet / Switching | CORE | C | P3 | CALCULATE |
| TOOL-011 | MAC Address Table Capacity Planner | Ethernet / Switching | CORE | C | P3 | PLAN,OPTIMIZE |
| TOOL-012 | Broadcast Domain Size Planner | Ethernet / Switching | CORE | C | P3 | PLAN |
| TOOL-013 | MTU / Jumbo Frame Planner | Ethernet / Switching | CORE | C | P3 | PLAN |
| TOOL-014 | Ethernet Serialization Delay Calculator | Ethernet / Switching | CORE | D | P4 | CALCULATE |
| TOOL-015 | QoS Queue Bandwidth Allocator | Ethernet / Switching | CORE | D | P4 | CALCULATE |
| TOOL-016 | 800G / 1.6T Ethernet Lane Planner | Ethernet / Switching | GROWTH | D | P4 | PLAN |
| TOOL-017 | IPv4 Subnet Calculator | IP / Routing / MPLS / SRv6 | CORE | A | P1 | CALCULATE |
| TOOL-018 | IPv6 Prefix Planner | IP / Routing / MPLS / SRv6 | CORE | A | P1 | PLAN |
| TOOL-019 | VLSM Address Planner | IP / Routing / MPLS / SRv6 | CORE | A | P1 | PLAN |
| TOOL-020 | IP Address Utilization Calculator | IP / Routing / MPLS / SRv6 | CORE | A | P1 | CALCULATE,OPTIMIZE |
| TOOL-021 | OSPF Cost Calculator | IP / Routing / MPLS / SRv6 | CORE | A | P1 | CALCULATE,OPTIMIZE |
| TOOL-022 | OSPF Area Capacity Planner | IP / Routing / MPLS / SRv6 | CORE | B | P2 | PLAN,OPTIMIZE |
| TOOL-023 | IS-IS Metric Planner | IP / Routing / MPLS / SRv6 | CORE | B | P2 | PLAN |
| TOOL-024 | BGP Best-Path Decision Explorer | IP / Routing / MPLS / SRv6 | CORE | B | P2 | CALCULATE |
| TOOL-025 | BGP Session Scale Planner | IP / Routing / MPLS / SRv6 | CORE | B | P2 | PLAN |
| TOOL-026 | BGP Route Table Capacity Estimator | IP / Routing / MPLS / SRv6 | CORE | B | P2 | CALCULATE,OPTIMIZE |
| TOOL-027 | BGP Community Policy Builder | IP / Routing / MPLS / SRv6 | CORE | C | P3 | PLAN |
| TOOL-028 | MPLS Label Stack Overhead Calculator | IP / Routing / MPLS / SRv6 | CORE | C | P3 | CALCULATE |
| TOOL-029 | MPLS LSP Capacity Planner | IP / Routing / MPLS / SRv6 | CORE | C | P3 | PLAN,OPTIMIZE |
| TOOL-030 | Traffic Engineering Path Calculator | IP / Routing / MPLS / SRv6 | CORE | C | P3 | CALCULATE |
| TOOL-031 | ECMP Path Capacity Planner | IP / Routing / MPLS / SRv6 | CORE | D | P4 | PLAN,OPTIMIZE |
| TOOL-032 | SR-MPLS SID Stack Calculator | IP / Routing / MPLS / SRv6 | CORE | D | P4 | CALCULATE |
| TOOL-033 | SRv6 SID Planner | IP / Routing / MPLS / SRv6 | CORE | D | P4 | PLAN |
| TOOL-034 | SRv6 Header Overhead Calculator | IP / Routing / MPLS / SRv6 | CORE | D | P4 | CALCULATE |
| TOOL-035 | WAN Bandwidth Sizing Calculator | WAN / SD-WAN / SASE | CORE | A | P1 | CALCULATE |
| TOOL-036 | Branch WAN Capacity Planner | WAN / SD-WAN / SASE | CORE | A | P1 | PLAN,OPTIMIZE |
| TOOL-037 | Dual-WAN Load Sharing Calculator | WAN / SD-WAN / SASE | CORE | A | P1 | CALCULATE |
| TOOL-038 | WAN Failover Capacity Planner | WAN / SD-WAN / SASE | CORE | B | P2 | PLAN,OPTIMIZE |
| TOOL-039 | SD-WAN SLA Policy Planner | WAN / SD-WAN / SASE | CORE | B | P2 | PLAN,OPTIMIZE |
| TOOL-040 | Application-Aware Path Selector | WAN / SD-WAN / SASE | CORE | B | P2 | PLAN |
| TOOL-041 | WAN Latency Budget Calculator | WAN / SD-WAN / SASE | CORE | C | P3 | CALCULATE |
| TOOL-042 | WAN Packet Loss Impact Estimator | WAN / SD-WAN / SASE | CORE | C | P3 | CALCULATE |
| TOOL-043 | SASE Edge Placement Planner | WAN / SD-WAN / SASE | CORE | D | P4 | PLAN,DESIGN |
| TOOL-044 | WAN Circuit Cost Comparator | WAN / SD-WAN / SASE | CORE | D | P4 | OPTIMIZE |
| TOOL-045 | DNS TTL Planner | Internet / DNS / CDN / Interconnection | CORE | A | P1 | PLAN |
| TOOL-046 | DNS Query Capacity Estimator | Internet / DNS / CDN / Interconnection | CORE | A | P1 | CALCULATE,OPTIMIZE |
| TOOL-047 | DHCP Scope Capacity Calculator | Internet / DNS / CDN / Interconnection | CORE | B | P2 | CALCULATE,OPTIMIZE |
| TOOL-048 | IPAM Utilization Planner | Internet / DNS / CDN / Interconnection | CORE | B | P2 | PLAN,OPTIMIZE |
| TOOL-049 | Anycast Node Placement Estimator | Internet / DNS / CDN / Interconnection | CORE | B | P2 | CALCULATE,DESIGN |
| TOOL-050 | CDN Cache Offload Calculator | Internet / DNS / CDN / Interconnection | CORE | C | P3 | CALCULATE |
| TOOL-051 | CDN Origin Bandwidth Estimator | Internet / DNS / CDN / Interconnection | CORE | C | P3 | CALCULATE |
| TOOL-052 | IX / Peering Port Capacity Planner | Internet / DNS / CDN / Interconnection | CORE | D | P4 | PLAN,OPTIMIZE |
| TOOL-053 | Transit vs Peering Cost Calculator | Internet / DNS / CDN / Interconnection | CORE | D | P4 | CALCULATE,OPTIMIZE |
| TOOL-054 | GPON Optical Power Budget Calculator | PON / FTTx / Access | CORE | A | P1 | CALCULATE |
| TOOL-055 | XGS-PON Optical Power Budget Calculator | PON / FTTx / Access | CORE | A | P1 | CALCULATE |
| TOOL-056 | PON Splitter Loss Calculator | PON / FTTx / Access | CORE | A | P1 | CALCULATE |
| TOOL-057 | PON Split Ratio Planner | PON / FTTx / Access | CORE | A | P1 | PLAN |
| TOOL-058 | OLT PON Port Capacity Planner | PON / FTTx / Access | CORE | B | P2 | PLAN,OPTIMIZE |
| TOOL-059 | OLT Subscriber Capacity Planner | PON / FTTx / Access | CORE | B | P2 | PLAN,OPTIMIZE |
| TOOL-060 | OLT Uplink Bandwidth Planner | PON / FTTx / Access | CORE | B | P2 | PLAN |
| TOOL-061 | OLT Dual-Uplink Redundancy Planner | PON / FTTx / Access | CORE | C | P3 | PLAN |
| TOOL-062 | ODN Loss Budget Planner | PON / FTTx / Access | CORE | C | P3 | PLAN |
| TOOL-063 | ONU Receive Power Checker | PON / FTTx / Access | CORE | C | P3 | CALCULATE |
| TOOL-064 | PON Distance Margin Calculator | PON / FTTx / Access | CORE | D | P4 | CALCULATE |
| TOOL-065 | PON Expansion Capacity Planner | PON / FTTx / Access | CORE | D | P4 | PLAN,OPTIMIZE |
| TOOL-066 | FTTx Take-Rate Capacity Forecast | PON / FTTx / Access | CORE | D | P4 | OPTIMIZE |
| TOOL-067 | Fiber Link Loss Calculator | Optical & Transport | CORE | A | P1 | CALCULATE |
| TOOL-068 | Connector / Splice Loss Budget Calculator | Optical & Transport | CORE | A | P1 | CALCULATE |
| TOOL-069 | Optical Margin Calculator | Optical & Transport | CORE | A | P1 | CALCULATE |
| TOOL-070 | OSNR Budget Calculator | Optical & Transport | CORE | A | P1 | CALCULATE |
| TOOL-071 | Chromatic Dispersion Calculator | Optical & Transport | CORE | B | P2 | CALCULATE |
| TOOL-072 | PMD Budget Calculator | Optical & Transport | CORE | B | P2 | CALCULATE |
| TOOL-073 | DWDM Channel Capacity Planner | Optical & Transport | CORE | B | P2 | PLAN,OPTIMIZE |
| TOOL-074 | DWDM Wavelength Assignment Planner | Optical & Transport | CORE | C | P3 | PLAN |
| TOOL-075 | OTN Payload Mapping Calculator | Optical & Transport | CORE | C | P3 | CALCULATE |
| TOOL-076 | OTN Link Capacity Planner | Optical & Transport | CORE | C | P3 | PLAN,OPTIMIZE |
| TOOL-077 | Transport Ring Capacity Planner | Optical & Transport | CORE | D | P4 | PLAN,OPTIMIZE |
| TOOL-078 | Protection Switching Capacity Planner | Optical & Transport | CORE | D | P4 | PLAN,OPTIMIZE |
| TOOL-079 | CPO vs Pluggable Optical Power Estimator | Optical & Transport | GROWTH | D | P4 | CALCULATE |
| TOOL-080 | RF Free-Space Path Loss Calculator | Wireless / RAN | CORE | A | P1 | CALCULATE |
| TOOL-081 | Cellular Link Budget Calculator | Wireless / RAN | CORE | A | P1 | CALCULATE |
| TOOL-082 | Cell Coverage Radius Estimator | Wireless / RAN | CORE | A | P1 | CALCULATE |
| TOOL-083 | Cell Capacity Calculator | Wireless / RAN | CORE | B | P2 | CALCULATE,OPTIMIZE |
| TOOL-084 | Spectrum Efficiency Calculator | Wireless / RAN | CORE | B | P2 | CALCULATE |
| TOOL-085 | MIMO Throughput Estimator | Wireless / RAN | CORE | B | P2 | CALCULATE |
| TOOL-086 | Massive MIMO Capacity Planner | Wireless / RAN | GROWTH | B | P2 | PLAN,OPTIMIZE |
| TOOL-087 | RAN Fronthaul Bandwidth Calculator | Wireless / RAN | CORE | C | P3 | CALCULATE |
| TOOL-088 | O-RU / O-DU Capacity Planner | Wireless / RAN | GROWTH | C | P3 | PLAN,OPTIMIZE |
| TOOL-089 | Fronthaul Latency Budget Calculator | Wireless / RAN | CORE | D | P4 | CALCULATE |
| TOOL-090 | Cell Load Balancing Estimator | Wireless / RAN | CORE | D | P4 | CALCULATE |
| TOOL-091 | RAN Energy Efficiency Calculator | Wireless / RAN | CORE | D | P4 | CALCULATE |
| TOOL-092 | Edge Node Placement Planner | Edge / IoT | CORE | A | P1 | PLAN,DESIGN |
| TOOL-093 | Edge Latency Budget Calculator | Edge / IoT | CORE | A | P1 | CALCULATE |
| TOOL-094 | MEC Capacity Planner | Edge / IoT | CORE | B | P2 | PLAN,OPTIMIZE |
| TOOL-095 | IoT Device Density Calculator | Edge / IoT | CORE | B | P2 | CALCULATE |
| TOOL-096 | IoT Message Bandwidth Calculator | Edge / IoT | CORE | C | P3 | CALCULATE |
| TOOL-097 | LPWAN Battery-Life Network Estimator | Edge / IoT | CORE | C | P3 | CALCULATE |
| TOOL-098 | Edge Backhaul Capacity Planner | Edge / IoT | CORE | D | P4 | PLAN,OPTIMIZE |
| TOOL-099 | Multi-Edge Service Placement Planner | Edge / IoT | CORE | D | P4 | PLAN,DESIGN |
| TOOL-100 | Leaf-Spine Port Capacity Planner | Data Center Networking | CORE | A | P1 | PLAN,OPTIMIZE |
| TOOL-101 | Leaf-Spine Oversubscription Calculator | Data Center Networking | CORE | A | P1 | CALCULATE |
| TOOL-102 | Spine Count Calculator | Data Center Networking | CORE | A | P1 | CALCULATE |
| TOOL-103 | Spine Failure Capacity Planner | Data Center Networking | CORE | B | P2 | PLAN,OPTIMIZE |
| TOOL-104 | Data Center Bisection Bandwidth Calculator | Data Center Networking | CORE | B | P2 | CALCULATE |
| TOOL-105 | TOR Uplink Capacity Planner | Data Center Networking | CORE | B | P2 | PLAN,OPTIMIZE |
| TOOL-106 | ECMP Fabric Capacity Calculator | Data Center Networking | CORE | B | P2 | CALCULATE,DESIGN,OPTIMIZE |
| TOOL-107 | East-West Traffic Capacity Estimator | Data Center Networking | CORE | C | P3 | CALCULATE,OPTIMIZE |
| TOOL-108 | VXLAN VNI Capacity Planner | Data Center Networking | CORE | C | P3 | PLAN,OPTIMIZE |
| TOOL-109 | EVPN Route Scale Estimator | Data Center Networking | CORE | D | P4 | CALCULATE |
| TOOL-110 | Data Center Interconnect Bandwidth Planner | Data Center Networking | CORE | D | P4 | PLAN |
| TOOL-111 | Fabric Growth Capacity Forecaster | Data Center Networking | CORE | D | P4 | DESIGN,OPTIMIZE |
| TOOL-112 | GPU Cluster Network Bandwidth Calculator | AI / GPU / HPC Networking | GROWTH | A | P1 | CALCULATE |
| TOOL-113 | All-Reduce Traffic Estimator | AI / GPU / HPC Networking | CORE | A | P1 | CALCULATE |
| TOOL-114 | AI Training Fabric Capacity Planner | AI / GPU / HPC Networking | GROWTH | A | P1 | PLAN,DESIGN,OPTIMIZE |
| TOOL-115 | AI Inference Network Capacity Planner | AI / GPU / HPC Networking | GROWTH | B | P2 | PLAN,OPTIMIZE |
| TOOL-116 | RoCE Bandwidth Planner | AI / GPU / HPC Networking | GROWTH | B | P2 | PLAN |
| TOOL-117 | RoCE PFC Headroom Estimator | AI / GPU / HPC Networking | GROWTH | B | P2 | CALCULATE |
| TOOL-118 | ECN / Congestion Threshold Planner | AI / GPU / HPC Networking | CORE | C | P3 | PLAN |
| TOOL-119 | InfiniBand Fabric Capacity Planner | AI / GPU / HPC Networking | GROWTH | C | P3 | PLAN,DESIGN,OPTIMIZE |
| TOOL-120 | GPU Bisection Bandwidth Calculator | AI / GPU / HPC Networking | GROWTH | C | P3 | CALCULATE |
| TOOL-121 | DPU Offload Capacity Estimator | AI / GPU / HPC Networking | GROWTH | D | P4 | CALCULATE,OPTIMIZE |
| TOOL-122 | AI Fabric Failure Scenario Simulator | AI / GPU / HPC Networking | GROWTH | D | P4 | DESIGN |
| TOOL-123 | VPC CIDR Planner | Cloud Networking | CORE | A | P1 | PLAN |
| TOOL-124 | Multi-VPC CIDR Conflict Checker | Cloud Networking | CORE | A | P1 | CALCULATE,TROUBLESHOOT |
| TOOL-125 | Transit Gateway Capacity Planner | Cloud Networking | CORE | B | P2 | PLAN,OPTIMIZE |
| TOOL-126 | Cloud NAT Port Capacity Calculator | Cloud Networking | CORE | B | P2 | CALCULATE,OPTIMIZE |
| TOOL-127 | Cloud Interconnect Bandwidth Planner | Cloud Networking | CORE | B | P2 | PLAN |
| TOOL-128 | Hybrid Cloud Latency Budget | Cloud Networking | CORE | C | P3 | CALCULATE |
| TOOL-129 | Multi-Cloud Connectivity Planner | Cloud Networking | CORE | C | P3 | PLAN |
| TOOL-130 | Cloud Egress Cost Estimator | Cloud Networking | CORE | D | P4 | CALCULATE,OPTIMIZE |
| TOOL-131 | Cloud Network Growth Planner | Cloud Networking | CORE | D | P4 | PLAN,OPTIMIZE |
| TOOL-132 | Kubernetes Pod CIDR Planner | Cloud-Native Networking | GROWTH | A | P1 | PLAN |
| TOOL-133 | Kubernetes Service CIDR Planner | Cloud-Native Networking | GROWTH | A | P1 | PLAN |
| TOOL-134 | CNI MTU Calculator | Cloud-Native Networking | CORE | B | P2 | CALCULATE |
| TOOL-135 | VXLAN / Geneve Overhead Calculator | Cloud-Native Networking | CORE | B | P2 | CALCULATE |
| TOOL-136 | Kubernetes Network Policy Builder | Cloud-Native Networking | GROWTH | B | P2 | PLAN |
| TOOL-137 | Multi-Cluster CIDR Conflict Checker | Cloud-Native Networking | CORE | C | P3 | CALCULATE,TROUBLESHOOT |
| TOOL-138 | Service Mesh Latency Overhead Estimator | Cloud-Native Networking | CORE | C | P3 | CALCULATE |
| TOOL-139 | Gateway API Capacity Planner | Cloud-Native Networking | CORE | D | P4 | PLAN,OPTIMIZE |
| TOOL-140 | eBPF Flow Capacity Estimator | Cloud-Native Networking | GROWTH | D | P4 | CALCULATE,OPTIMIZE |
| TOOL-141 | NETCONF RPC Builder | Network Automation / Programmability | CORE | A | P1 | PLAN |
| TOOL-142 | RESTCONF Request Builder | Network Automation / Programmability | CORE | A | P1 | PLAN |
| TOOL-143 | YANG Path Explorer | Network Automation / Programmability | CORE | A | P1 | CALCULATE |
| TOOL-144 | YANG Model Dependency Checker | Network Automation / Programmability | CORE | B | P2 | CALCULATE |
| TOOL-145 | Network Config Diff Analyzer | Network Automation / Programmability | CORE | B | P2 | TROUBLESHOOT |
| TOOL-146 | VLAN Config Generator | Network Automation / Programmability | CORE | B | P2 | PLAN |
| TOOL-147 | Interface Config Generator | Network Automation / Programmability | CORE | B | P2 | PLAN |
| TOOL-148 | BGP Policy Generator | Network Automation / Programmability | CORE | C | P3 | PLAN |
| TOOL-149 | ACL Config Generator | Network Automation / Programmability | CORE | C | P3 | PLAN |
| TOOL-150 | SRv6 Config Planner | Network Automation / Programmability | CORE | D | P4 | PLAN |
| TOOL-151 | Intent-to-Config Planner | Network Automation / Programmability | CORE | D | P4 | PLAN |
| TOOL-152 | Network Change Precheck Builder | Network Automation / Programmability | CORE | D | P4 | PLAN,TROUBLESHOOT |
| TOOL-153 | SNMP Polling Capacity Calculator | Observability / Telemetry / AIOps | CORE | A | P1 | CALCULATE,OPTIMIZE |
| TOOL-154 | Streaming Telemetry Bandwidth Estimator | Observability / Telemetry / AIOps | CORE | A | P1 | CALCULATE |
| TOOL-155 | NetFlow / IPFIX Storage Calculator | Observability / Telemetry / AIOps | CORE | A | P1 | CALCULATE |
| TOOL-156 | Syslog EPS Capacity Calculator | Observability / Telemetry / AIOps | CORE | B | P2 | CALCULATE,OPTIMIZE |
| TOOL-157 | Alarm Storm Analyzer | Observability / Telemetry / AIOps | CORE | B | P2 | TROUBLESHOOT |
| TOOL-158 | Network Baseline Deviation Analyzer | Observability / Telemetry / AIOps | CORE | B | P2 | TROUBLESHOOT |
| TOOL-159 | SLA Violation Analyzer | Observability / Telemetry / AIOps | CORE | C | P3 | TROUBLESHOOT,OPTIMIZE |
| TOOL-160 | MTTR Calculator | Observability / Telemetry / AIOps | CORE | C | P3 | CALCULATE |
| TOOL-161 | Incident Timeline Builder | Observability / Telemetry / AIOps | CORE | C | P3 | PLAN,TROUBLESHOOT |
| TOOL-162 | Capacity Trend Forecaster | Observability / Telemetry / AIOps | CORE | D | P4 | OPTIMIZE |
| TOOL-163 | Network RCA Evidence Organizer | Observability / Telemetry / AIOps | CORE | D | P4 | TROUBLESHOOT |
| TOOL-164 | ACL Rule Conflict Checker | Network Security | CORE | A | P1 | CALCULATE,TROUBLESHOOT |
| TOOL-165 | Firewall Rule Capacity Planner | Network Security | CORE | A | P1 | PLAN,OPTIMIZE |
| TOOL-166 | Firewall Throughput Sizing Calculator | Network Security | CORE | A | P1 | CALCULATE |
| TOOL-167 | VPN Encryption Overhead Calculator | Network Security | CORE | A | P1 | CALCULATE |
| TOOL-168 | IPsec MTU / MSS Calculator | Network Security | CORE | B | P2 | CALCULATE |
| TOOL-169 | DDoS Scrubbing Capacity Planner | Network Security | CORE | B | P2 | PLAN,OPTIMIZE |
| TOOL-170 | Network Segmentation Planner | Network Security | CORE | B | P2 | PLAN |
| TOOL-171 | Zero Trust Zone Planner | Network Security | CORE | C | P3 | PLAN,DESIGN |
| TOOL-172 | RPKI Route Origin Validator | Network Security | CORE | C | P3 | CALCULATE |
| TOOL-173 | PKI Certificate Capacity Estimator | Network Security | CORE | C | P3 | CALCULATE,OPTIMIZE |
| TOOL-174 | SASE Security Path Latency Estimator | Network Security | CORE | D | P4 | CALCULATE |
| TOOL-175 | Attack Surface Exposure Mapper | Network Security | CORE | D | P4 | CALCULATE |
| TOOL-176 | Quantum-Safe VPN Overhead Estimator | Network Security | GROWTH | D | P4 | CALCULATE |
| TOOL-177 | Data Center PUE Calculator | Power / Cooling / Facility Infrastructure | CORE | A | P1 | CALCULATE,OPTIMIZE |
| TOOL-178 | Network Room PUE Estimator | Power / Cooling / Facility Infrastructure | CORE | A | P1 | CALCULATE,OPTIMIZE |
| TOOL-179 | Telecom UPS Capacity Calculator | Power / Cooling / Facility Infrastructure | CORE | A | P1 | CALCULATE,OPTIMIZE |
| TOOL-180 | UPS Runtime Calculator | Power / Cooling / Facility Infrastructure | CORE | B | P2 | CALCULATE,OPTIMIZE |
| TOOL-181 | Battery Backup Runtime Calculator | Power / Cooling / Facility Infrastructure | CORE | B | P2 | CALCULATE,OPTIMIZE |
| TOOL-182 | Telecom DC Power Capacity Planner | Power / Cooling / Facility Infrastructure | CORE | B | P2 | PLAN,OPTIMIZE |
| TOOL-183 | N+1 / 2N Power Redundancy Planner | Power / Cooling / Facility Infrastructure | CORE | C | P3 | PLAN |
| TOOL-184 | Generator Runtime Calculator | Power / Cooling / Facility Infrastructure | CORE | C | P3 | CALCULATE,PLAN,OPTIMIZE |
| TOOL-185 | Network Room Cooling Load Estimator | Power / Cooling / Facility Infrastructure | CORE | D | P4 | CALCULATE |
| TOOL-186 | Rack Power Density Calculator | Power / Cooling / Facility Infrastructure | CORE | D | P4 | CALCULATE |
| TOOL-187 | QKD Link Loss Calculator | Quantum Networking | EMERGING | D | P4 | CALCULATE |
| TOOL-188 | QKD Trusted-Node Distance Planner | Quantum Networking | EMERGING | D | P4 | PLAN |
| TOOL-189 | Quantum Key Rate Estimator | Quantum Networking | EMERGING | D | P4 | CALCULATE |
| TOOL-190 | 5G UPF Capacity Planner | Telecom Core & Platforms | GROWTH | D | P4 | PLAN,OPTIMIZE |
| TOOL-191 | Network Slice SLA Planner | Telecom Core & Platforms | GROWTH | D | P4 | PLAN,OPTIMIZE |
| TOOL-192 | IMS Session Capacity Estimator | Telecom Core & Platforms | GROWTH | D | P4 | CALCULATE,OPTIMIZE |
| TOOL-193 | Satellite Link Budget Calculator | Space / Satellite / NTN Communications | GROWTH | D | P4 | CALCULATE |
| TOOL-194 | LEO / GEO Propagation Delay Calculator | Space / Satellite / NTN Communications | GROWTH | D | P4 | CALCULATE |
| TOOL-195 | Satellite Doppler Shift Calculator | Space / Satellite / NTN Communications | GROWTH | D | P4 | CALCULATE |
| TOOL-196 | NTN Gateway Capacity Planner | Space / Satellite / NTN Communications | GROWTH | D | P4 | PLAN,OPTIMIZE |
| TOOL-197 | Sub-THz Path Loss Explorer | 6G / IMT-2030 Future Networks | EMERGING | D | P4 | CALCULATE |
| TOOL-198 | 6G Latency Budget Explorer | 6G / IMT-2030 Future Networks | EMERGING | D | P4 | CALCULATE |
| TOOL-199 | ISAC Communication-Sensing Trade-off Explorer | 6G / IMT-2030 Future Networks | EMERGING | D | P4 | CALCULATE |
| TOOL-200 | 6G Terrestrial-NTN Scenario Planner | 6G / IMT-2030 Future Networks | EMERGING | D | P4 | PLAN |

## 8. Gate Sequence

每个新增工具默认执行：

Scope / Contract → Engine → Tests / Golden Fixtures → Registry → Unified UI → Evidence → Product Audit → Technical Review → Freeze

已冻结/PASS/CLOSED内容不重复审计，除非公共架构或安全边界发生变化。

## 9. Quality System

正式工具不仅要求“能运行”，还要逐步建立：
- 工具深度
- 工程可信度
- Tutorial
- Diagram
- Engineering Case
- Topic Hub
- SEO
- I18N
- Retention
- Monetization path

但这些质量维度按 Gate 分阶段实施，不能把每个 Tool 首次开发都膨胀成全量内容项目。

## 10. Roadmap Stop Rules

以下情况自动 HOLD：
- Roadmap / AI_PROJECT_CONTEXT / Gate 状态冲突
- 找不到唯一 Primary Domain
- 与现有工具语义重复
- Mandatory Gate 失败
- Reserved 技术成熟度不足
- 与 DevEngineerLab / PowerEngineerLab / DataFileLab / PrivacyFileLab / AIMarkTool 边界冲突

## 11. Next Step

本 V1.0 只是 Master Roadmap 草案。

下一步必须：
> 2号对《NetEngineerLab 200 Tools Master Roadmap V1.0》做专项产品/工程审计。

重点审：
- 是否有重复工具
- 是否存在低价值拆分
- 200个工具是否分配失衡
- Phase排序是否合理
- Reserved/6G/Quantum/Space比例是否过大
- 与现有约40工具是否可能重复
- 跨站边界是否清晰
- Tool Admission Gate 是否足够严格