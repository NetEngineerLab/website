# 新工具开发候选清单

共 **156 个待处理候选**。按准入审核后逐项开发；只有准入通过、测试通过及独立验收通过，才可移入完成记录。清单本身不授权开发或上线。

原始字段见 [CSV 清单](DEVELOPMENT_CANDIDATES.csv)；重复项见 [审计归档](REJECTED_DUPLICATES_ARCHIVE.md)；已验收项见 [完成记录](DEVELOPMENT_COMPLETED.md)。

## 6G / IMT-2030 Future Networks（4 项）

| 编号 | 工具名称 | 优先级 | 准入审核状态 |
| --- | --- | --- | --- |
| TOOL-197 | Sub-THz Path Loss Explorer | P4 | NOT_STARTED |
| TOOL-198 | 6G Latency Budget Explorer | P4 | NOT_STARTED |
| TOOL-199 | ISAC Communication-Sensing Trade-off Explorer | P4 | NOT_STARTED |
| TOOL-200 | 6G Terrestrial-NTN Scenario Planner | P4 | NOT_STARTED |

## AI / GPU / HPC Networking（11 项）

| 编号 | 工具名称 | 优先级 | 准入审核状态 |
| --- | --- | --- | --- |
| TOOL-112 | GPU Cluster Network Bandwidth Calculator | P1 | NOT_STARTED |
| TOOL-113 | All-Reduce Traffic Estimator | P1 | NOT_STARTED |
| TOOL-114 | AI Training Fabric Capacity Planner | P1 | NOT_STARTED |
| TOOL-115 | AI Inference Network Capacity Planner | P2 | NOT_STARTED |
| TOOL-116 | RoCE Bandwidth Planner | P2 | NOT_STARTED |
| TOOL-117 | RoCE PFC Headroom Estimator | P2 | NOT_STARTED |
| TOOL-118 | ECN / Congestion Threshold Planner | P3 | NOT_STARTED |
| TOOL-119 | InfiniBand Fabric Capacity Planner | P3 | NOT_STARTED |
| TOOL-120 | GPU Bisection Bandwidth Calculator | P3 | NOT_STARTED |
| TOOL-121 | DPU Offload Capacity Estimator | P4 | NOT_STARTED |
| TOOL-122 | AI Fabric Failure Scenario Simulator | P4 | NOT_STARTED |

## Cloud Networking（9 项）

| 编号 | 工具名称 | 优先级 | 准入审核状态 |
| --- | --- | --- | --- |
| TOOL-123 | VPC CIDR Planner | P1 | NOT_STARTED |
| TOOL-124 | Multi-VPC CIDR Conflict Checker | P1 | NOT_STARTED |
| TOOL-125 | Transit Gateway Capacity Planner | P2 | NOT_STARTED |
| TOOL-126 | Cloud NAT Port Capacity Calculator | P2 | NOT_STARTED |
| TOOL-127 | Cloud Interconnect Bandwidth Planner | P2 | NOT_STARTED |
| TOOL-128 | Hybrid Cloud Latency Budget | P3 | NOT_STARTED |
| TOOL-129 | Multi-Cloud Connectivity Planner | P3 | NOT_STARTED |
| TOOL-130 | Cloud Egress Cost Estimator | P4 | NOT_STARTED |
| TOOL-131 | Cloud Network Growth Planner | P4 | NOT_STARTED |

## Cloud-Native Networking（9 项）

| 编号 | 工具名称 | 优先级 | 准入审核状态 |
| --- | --- | --- | --- |
| TOOL-132 | Kubernetes Pod CIDR Planner | P1 | NOT_STARTED |
| TOOL-133 | Kubernetes Service CIDR Planner | P1 | NOT_STARTED |
| TOOL-134 | CNI MTU Calculator | P2 | NOT_STARTED |
| TOOL-135 | VXLAN / Geneve Overhead Calculator | P2 | NOT_STARTED |
| TOOL-136 | Kubernetes Network Policy Builder | P2 | NOT_STARTED |
| TOOL-137 | Multi-Cluster CIDR Conflict Checker | P3 | NOT_STARTED |
| TOOL-138 | Service Mesh Latency Overhead Estimator | P3 | NOT_STARTED |
| TOOL-139 | Gateway API Capacity Planner | P4 | NOT_STARTED |
| TOOL-140 | eBPF Flow Capacity Estimator | P4 | NOT_STARTED |

## Data Center Networking（8 项）

| 编号 | 工具名称 | 优先级 | 准入审核状态 |
| --- | --- | --- | --- |
| TOOL-103 | Spine Failure Capacity Planner | P2 | NOT_STARTED |
| TOOL-105 | TOR Uplink Capacity Planner | P2 | NOT_STARTED |
| TOOL-106 | ECMP Fabric Capacity Calculator | P2 | NOT_STARTED |
| TOOL-107 | East-West Traffic Capacity Estimator | P3 | NOT_STARTED |
| TOOL-108 | VXLAN VNI Capacity Planner | P3 | NOT_STARTED |
| TOOL-109 | EVPN Route Scale Estimator | P4 | NOT_STARTED |
| TOOL-110 | Data Center Interconnect Bandwidth Planner | P4 | NOT_STARTED |
| TOOL-111 | Fabric Growth Capacity Forecaster | P4 | NOT_STARTED |

## Edge / IoT（6 项）

| 编号 | 工具名称 | 优先级 | 准入审核状态 |
| --- | --- | --- | --- |
| TOOL-094 | MEC Capacity Planner | P2 | NOT_STARTED |
| TOOL-095 | IoT Device Density Calculator | P2 | NOT_STARTED |
| TOOL-096 | IoT Message Bandwidth Calculator | P3 | NOT_STARTED |
| TOOL-097 | LPWAN Battery-Life Network Estimator | P3 | NOT_STARTED |
| TOOL-098 | Edge Backhaul Capacity Planner | P4 | NOT_STARTED |
| TOOL-099 | Multi-Edge Service Placement Planner | P4 | NOT_STARTED |

## Ethernet / Switching（10 项）

| 编号 | 工具名称 | 优先级 | 准入审核状态 |
| --- | --- | --- | --- |
| TOOL-006 | Link Aggregation Capacity Calculator | P2 | NOT_STARTED |
| TOOL-007 | LACP Member Failure Capacity Planner | P2 | NOT_STARTED |
| TOOL-008 | VLAN Capacity Planner | P2 | NOT_STARTED |
| TOOL-009 | STP Path Cost Calculator | P2 | NOT_STARTED |
| TOOL-010 | RSTP Convergence Estimator | P3 | NOT_STARTED |
| TOOL-011 | MAC Address Table Capacity Planner | P3 | NOT_STARTED |
| TOOL-012 | Broadcast Domain Size Planner | P3 | NOT_STARTED |
| TOOL-014 | Ethernet Serialization Delay Calculator | P4 | NOT_STARTED |
| TOOL-015 | QoS Queue Bandwidth Allocator | P4 | NOT_STARTED |
| TOOL-016 | 800G / 1.6T Ethernet Lane Planner | P4 | NOT_STARTED |

## IP / Routing / MPLS / SRv6（13 项）

| 编号 | 工具名称 | 优先级 | 准入审核状态 |
| --- | --- | --- | --- |
| TOOL-022 | OSPF Area Capacity Planner | P2 | NOT_STARTED |
| TOOL-023 | IS-IS Metric Planner | P2 | NOT_STARTED |
| TOOL-024 | BGP Best-Path Decision Explorer | P2 | NOT_STARTED |
| TOOL-025 | BGP Session Scale Planner | P2 | NOT_STARTED |
| TOOL-026 | BGP Route Table Capacity Estimator | P2 | NOT_STARTED |
| TOOL-027 | BGP Community Policy Builder | P3 | NOT_STARTED |
| TOOL-028 | MPLS Label Stack Overhead Calculator | P3 | NOT_STARTED |
| TOOL-029 | MPLS LSP Capacity Planner | P3 | NOT_STARTED |
| TOOL-030 | Traffic Engineering Path Calculator | P3 | NOT_STARTED |
| TOOL-031 | ECMP Path Capacity Planner | P4 | NOT_STARTED |
| TOOL-032 | SR-MPLS SID Stack Calculator | P4 | NOT_STARTED |
| TOOL-033 | SRv6 SID Planner | P4 | NOT_STARTED |
| TOOL-034 | SRv6 Header Overhead Calculator | P4 | NOT_STARTED |

## Internet / DNS / CDN / Interconnection（7 项）

| 编号 | 工具名称 | 优先级 | 准入审核状态 |
| --- | --- | --- | --- |
| TOOL-047 | DHCP Scope Capacity Calculator | P2 | NOT_STARTED |
| TOOL-048 | IPAM Utilization Planner | P2 | NOT_STARTED |
| TOOL-049 | Anycast Node Placement Estimator | P2 | NOT_STARTED |
| TOOL-050 | CDN Cache Offload Calculator | P3 | NOT_STARTED |
| TOOL-051 | CDN Origin Bandwidth Estimator | P3 | NOT_STARTED |
| TOOL-052 | IX / Peering Port Capacity Planner | P4 | NOT_STARTED |
| TOOL-053 | Transit vs Peering Cost Calculator | P4 | NOT_STARTED |

## Network Automation / Programmability（12 项）

| 编号 | 工具名称 | 优先级 | 准入审核状态 |
| --- | --- | --- | --- |
| TOOL-141 | NETCONF RPC Builder | P1 | NOT_STARTED |
| TOOL-142 | RESTCONF Request Builder | P1 | NOT_STARTED |
| TOOL-143 | YANG Path Explorer | P1 | NOT_STARTED |
| TOOL-144 | YANG Model Dependency Checker | P2 | NOT_STARTED |
| TOOL-145 | Network Config Diff Analyzer | P2 | NOT_STARTED |
| TOOL-146 | VLAN Config Generator | P2 | NOT_STARTED |
| TOOL-147 | Interface Config Generator | P2 | NOT_STARTED |
| TOOL-148 | BGP Policy Generator | P3 | NOT_STARTED |
| TOOL-149 | ACL Config Generator | P3 | NOT_STARTED |
| TOOL-150 | SRv6 Config Planner | P4 | NOT_STARTED |
| TOOL-151 | Intent-to-Config Planner | P4 | NOT_STARTED |
| TOOL-152 | Network Change Precheck Builder | P4 | NOT_STARTED |

## Network Security（13 项）

| 编号 | 工具名称 | 优先级 | 准入审核状态 |
| --- | --- | --- | --- |
| TOOL-164 | ACL Rule Conflict Checker | P1 | NOT_STARTED |
| TOOL-165 | Firewall Rule Capacity Planner | P1 | NOT_STARTED |
| TOOL-166 | Firewall Throughput Sizing Calculator | P1 | NOT_STARTED |
| TOOL-167 | VPN Encryption Overhead Calculator | P1 | NOT_STARTED |
| TOOL-168 | IPsec MTU / MSS Calculator | P2 | NOT_STARTED |
| TOOL-169 | DDoS Scrubbing Capacity Planner | P2 | NOT_STARTED |
| TOOL-170 | Network Segmentation Planner | P2 | NOT_STARTED |
| TOOL-171 | Zero Trust Zone Planner | P3 | NOT_STARTED |
| TOOL-172 | RPKI Route Origin Validator | P3 | NOT_STARTED |
| TOOL-173 | PKI Certificate Capacity Estimator | P3 | NOT_STARTED |
| TOOL-174 | SASE Security Path Latency Estimator | P4 | NOT_STARTED |
| TOOL-175 | Attack Surface Exposure Mapper | P4 | NOT_STARTED |
| TOOL-176 | Quantum-Safe VPN Overhead Estimator | P4 | NOT_STARTED |

## Observability / Telemetry / AIOps（11 项）

| 编号 | 工具名称 | 优先级 | 准入审核状态 |
| --- | --- | --- | --- |
| TOOL-153 | SNMP Polling Capacity Calculator | P1 | NOT_STARTED |
| TOOL-154 | Streaming Telemetry Bandwidth Estimator | P1 | NOT_STARTED |
| TOOL-155 | NetFlow / IPFIX Storage Calculator | P1 | NOT_STARTED |
| TOOL-156 | Syslog EPS Capacity Calculator | P2 | NOT_STARTED |
| TOOL-157 | Alarm Storm Analyzer | P2 | NOT_STARTED |
| TOOL-158 | Network Baseline Deviation Analyzer | P2 | NOT_STARTED |
| TOOL-159 | SLA Violation Analyzer | P3 | NOT_STARTED |
| TOOL-160 | MTTR Calculator | P3 | NOT_STARTED |
| TOOL-161 | Incident Timeline Builder | P3 | NOT_STARTED |
| TOOL-162 | Capacity Trend Forecaster | P4 | NOT_STARTED |
| TOOL-163 | Network RCA Evidence Organizer | P4 | NOT_STARTED |

## Optical & Transport（9 项）

| 编号 | 工具名称 | 优先级 | 准入审核状态 |
| --- | --- | --- | --- |
| TOOL-071 | Chromatic Dispersion Calculator | P2 | NOT_STARTED |
| TOOL-072 | PMD Budget Calculator | P2 | NOT_STARTED |
| TOOL-073 | DWDM Channel Capacity Planner | P2 | NOT_STARTED |
| TOOL-074 | DWDM Wavelength Assignment Planner | P3 | NOT_STARTED |
| TOOL-075 | OTN Payload Mapping Calculator | P3 | NOT_STARTED |
| TOOL-076 | OTN Link Capacity Planner | P3 | NOT_STARTED |
| TOOL-077 | Transport Ring Capacity Planner | P4 | NOT_STARTED |
| TOOL-078 | Protection Switching Capacity Planner | P4 | NOT_STARTED |
| TOOL-079 | CPO vs Pluggable Optical Power Estimator | P4 | NOT_STARTED |

## PON / FTTx / Access（7 项）

| 编号 | 工具名称 | 优先级 | 准入审核状态 |
| --- | --- | --- | --- |
| TOOL-058 | OLT PON Port Capacity Planner | P2 | NOT_STARTED |
| TOOL-059 | OLT Subscriber Capacity Planner | P2 | NOT_STARTED |
| TOOL-060 | OLT Uplink Bandwidth Planner | P2 | NOT_STARTED |
| TOOL-061 | OLT Dual-Uplink Redundancy Planner | P3 | NOT_STARTED |
| TOOL-062 | ODN Loss Budget Planner | P3 | NOT_STARTED |
| TOOL-065 | PON Expansion Capacity Planner | P4 | NOT_STARTED |
| TOOL-066 | FTTx Take-Rate Capacity Forecast | P4 | NOT_STARTED |

## Power / Cooling / Facility Infrastructure（2 项）

| 编号 | 工具名称 | 优先级 | 准入审核状态 |
| --- | --- | --- | --- |
| TOOL-178 | Network Room PUE Estimator | P1 | NOT_STARTED |
| TOOL-183 | N+1 / 2N Power Redundancy Planner | P3 | NOT_STARTED |

## Quantum Networking（3 项）

| 编号 | 工具名称 | 优先级 | 准入审核状态 |
| --- | --- | --- | --- |
| TOOL-187 | QKD Link Loss Calculator | P4 | NOT_STARTED |
| TOOL-188 | QKD Trusted-Node Distance Planner | P4 | NOT_STARTED |
| TOOL-189 | Quantum Key Rate Estimator | P4 | NOT_STARTED |

## Space / Satellite / NTN Communications（4 项）

| 编号 | 工具名称 | 优先级 | 准入审核状态 |
| --- | --- | --- | --- |
| TOOL-193 | Satellite Link Budget Calculator | P4 | NOT_STARTED |
| TOOL-194 | LEO / GEO Propagation Delay Calculator | P4 | NOT_STARTED |
| TOOL-195 | Satellite Doppler Shift Calculator | P4 | NOT_STARTED |
| TOOL-196 | NTN Gateway Capacity Planner | P4 | NOT_STARTED |

## Telecom Core & Platforms（3 项）

| 编号 | 工具名称 | 优先级 | 准入审核状态 |
| --- | --- | --- | --- |
| TOOL-190 | 5G UPF Capacity Planner | P4 | NOT_STARTED |
| TOOL-191 | Network Slice SLA Planner | P4 | NOT_STARTED |
| TOOL-192 | IMS Session Capacity Estimator | P4 | NOT_STARTED |

## WAN / SD-WAN / SASE（7 项）

| 编号 | 工具名称 | 优先级 | 准入审核状态 |
| --- | --- | --- | --- |
| TOOL-038 | WAN Failover Capacity Planner | P2 | NOT_STARTED |
| TOOL-039 | SD-WAN SLA Policy Planner | P2 | NOT_STARTED |
| TOOL-040 | Application-Aware Path Selector | P2 | NOT_STARTED |
| TOOL-041 | WAN Latency Budget Calculator | P3 | NOT_STARTED |
| TOOL-042 | WAN Packet Loss Impact Estimator | P3 | NOT_STARTED |
| TOOL-043 | SASE Edge Placement Planner | P4 | NOT_STARTED |
| TOOL-044 | WAN Circuit Cost Comparator | P4 | NOT_STARTED |

## Wireless / RAN（8 项）

| 编号 | 工具名称 | 优先级 | 准入审核状态 |
| --- | --- | --- | --- |
| TOOL-084 | Spectrum Efficiency Calculator | P2 | NOT_STARTED |
| TOOL-085 | MIMO Throughput Estimator | P2 | NOT_STARTED |
| TOOL-086 | Massive MIMO Capacity Planner | P2 | NOT_STARTED |
| TOOL-087 | RAN Fronthaul Bandwidth Calculator | P3 | NOT_STARTED |
| TOOL-088 | O-RU / O-DU Capacity Planner | P3 | NOT_STARTED |
| TOOL-089 | Fronthaul Latency Budget Calculator | P4 | NOT_STARTED |
| TOOL-090 | Cell Load Balancing Estimator | P4 | NOT_STARTED |
| TOOL-091 | RAN Energy Efficiency Calculator | P4 | NOT_STARTED |
