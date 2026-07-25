# Wi-Fi Coverage & Capacity Planner — Engineering Method

## Scope

The planner estimates indoor WLAN coverage, AP quantity, user capacity and channel-reuse pressure. It is intended for preliminary design and option comparison, not as a replacement for a predictive survey, spectrum analysis or active validation survey.

## 1. Bidirectional RF coverage

Wi-Fi coverage must work in both directions.

```text
AP EIRP = AP transmit power + AP antenna gain - AP cable loss

Client EIRP =
  client transmit power + client antenna gain - client RF loss

Downlink maximum path loss =
  AP EIRP + client antenna gain - client RF loss
  - client target RSSI - fade margin - obstacle loss

Uplink maximum path loss =
  client EIRP + AP antenna gain - AP cable loss
  - AP target RSSI - fade margin - obstacle loss
```

The smaller of the uplink and downlink radii controls the cell.

## 2. Log-distance path-loss model

Free-space loss at 1 metre:

```text
PL(1 m) = 32.44 + 20 log10(f_MHz) + 20 log10(0.001 km)
```

Indoor distance:

```text
d_m = 10 ^ ((maximum_path_loss - PL(1 m)) / (10 n))
```

`n` is the editable path-loss exponent. Wall and floor losses are separately editable. The design radius is the lower of the RF-model radius and an editable design-radius cap.

## 3. Coverage AP count

```text
geometric_area = π × radius²

effective_area_per_AP =
  geometric_area × layout_efficiency × (1 - overlap_allowance)

APs_per_floor =
  ceil(area_per_floor / effective_area_per_AP)

coverage_AP_count = APs_per_floor × floor_count
```

This is a geometric planning estimate. Irregular walls, corridors, atriums, shafts, shelving and interference require survey correction.

## 4. Reference PHY rates

The built-in table uses editable reference maximum PHY rates per spatial stream for Wi-Fi 5, Wi-Fi 6/6E and Wi-Fi 7. Channel width and spatial streams determine the reference PHY rate.

Wi-Fi 7 includes a 320 MHz option only in the 6 GHz planning mode. The IEEE 802.11 Working Group reports IEEE Std 802.11be-2024 as completed and published. Actual client/AP capabilities may be lower than the reference table.

## 5. Effective throughput and capacity

```text
active_users = total_users × active_ratio

total_demand =
  active_users × Mbps_per_active_user

effective_throughput_per_AP =
  PHY_rate
  × protocol_efficiency
  × usable_airtime
  × client_capability_mix

throughput_AP_count =
  ceil(total_demand / effective_throughput_per_AP)

client_count_AP_count =
  ceil(total_users / associated_client_limit)

capacity_AP_count =
  max(throughput_AP_count,
      client_count_AP_count,
      minimum_AP_count)
```

All discount factors and user limits are engineering assumptions. Real throughput depends on contention, retries, PHY distribution, frame aggregation, QoS, interference, roaming and platform behavior.

## 6. Combined AP plan

```text
final_AP_count =
  max(coverage_AP_count, capacity_AP_count)
```

The tool then distributes APs across floors as evenly as possible.

## 7. Channel-reuse planning

The user enters the locally usable spectrum as a count of 20 MHz channel equivalents.

```text
width_units = channel_width / 20 MHz

reusable_channel_groups =
  floor(available_20_MHz_equivalents / width_units)

APs_per_channel_group =
  final_AP_count / reusable_channel_groups
```

The result uses generic channel groups rather than national channel numbers. The engineer must map groups to channels allowed by local regulation, indoor/outdoor power class, DFS requirements, equipment certification and AFC requirements where applicable.

## Primary references

- IEEE 802.11 Working Group overview
- Cisco access-point data-rate tables
- Cisco wireless mesh link-SNR guidance

## Final validation

Complete at least:

- floor-plan predictive survey
- regulatory domain and allowed-channel review
- AP/client capability review
- cable and PoE review
- interference/spectrum analysis
- active RSSI, SNR, roaming and throughput survey
