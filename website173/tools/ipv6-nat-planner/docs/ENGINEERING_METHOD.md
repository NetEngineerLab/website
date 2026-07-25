# IPv6 & NAT Planning Calculator — Engineering Method

## 1. IPv6 prefix planning

The engine parses IPv6 text into a 128-bit BigInt value.

```text
parent_network = address AND prefix_mask
child_count = 2^(child_prefix - parent_prefix)
addresses_per_child = 2^(128 - child_prefix)
child_network(index) = parent_network + index × 2^(128 - child_prefix)
```

Text output follows RFC 5952 compression rules. Prefix planning is generic and does not treat any one end-site size as a universal requirement.

## 2. NAT44 / PAT capacity

The calculator treats TCP and UDP as independent port namespaces.

```text
raw_ports = last_port - first_port + 1
usable_ports_per_protocol_per_IP =
  floor(raw_ports × (1 - reserve_ratio) × allocation_ratio)

mappings_per_public_IP =
  usable_ports_per_protocol_per_IP × enabled_protocol_pools

required_mappings =
  subscribers × peak_mappings_per_subscriber × (1 + safety_margin)

required_public_IPs =
  ceil(required_mappings / mappings_per_public_IP)
```

This is a port-space estimate. Actual capacity may be lower because of session-table limits, memory, CPU, timeout behavior, ALG behavior and platform implementation.

## 3. Deterministic CGNAT port blocks

```text
blocks_per_public_IP = floor(usable_ports / block_size)
supported_subscribers = public_IPs × blocks_per_public_IP
required_public_IPs = ceil(subscribers / blocks_per_public_IP)
```

The model assumes the same numeric block may exist independently in TCP and UDP. It also estimates logging volume from active subscribers, session creation rate, events per session, event size and retention period.

RFC 6598 reserves 100.64.0.0/10 as Shared Address Space for provider CGN deployments.

## 4. NAT64 / DNS64 address mapping

RFC 6052 supports prefix lengths:

```text
/32, /40, /48, /56, /64, /96
```

For prefixes shorter than /96, bits 64–71 are the zero-valued `u` octet. The engine was tested against all six address examples in RFC 6052 Table 1.

Presets include:

- RFC 6052 Well-Known Prefix: `64:ff9b::/96`
- RFC 8215 Local-Use Prefix: `64:ff9b:1::/48`
- editable Network-Specific Prefix

DNS64 synthesis uses the same IPv4-embedded IPv6 address format. The tool does not emulate DNSSEC processing or a stateful NAT64 platform.

## Sources

- RFC 4291 — IPv6 Addressing Architecture
- RFC 5952 — IPv6 Text Representation
- RFC 6177 — IPv6 Address Assignment to End Sites
- RFC 6598 — Shared Address Space
- RFC 6888 — Common CGN Requirements
- RFC 6052 — IPv4-Embedded IPv6 Address Format
- RFC 6147 — DNS64
- RFC 8215 — Local-Use Translation Prefix
