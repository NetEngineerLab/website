# Content package: telecom generator runtime from one tank

## Editorial brief

- **Content type:** Tool-use tutorial + engineering problem solving.
- **Topic:** Estimate telecom generator runtime using usable tank fuel and a time-varying site-load profile.
- **Search intent:** Calculate / plan. The searcher wants an outage-autonomy estimate or refill trigger, not generic generator news.
- **Primary keyword:** telecom generator runtime calculator
- **Secondary keywords:** generator runtime from tank size; diesel generator fuel consumption by load; telecom generator fuel planning; generator fuel curve calculation; generator outage fuel requirement.
- **Search intent detail:** explain the calculation, supply a worked example, then let the reader test their own manufacturer curve and load schedule.
- **Target user:** telecom-site power engineer, NOC/facilities operator, backup-power planner.
- **Target market/language:** English, global; localized Chinese article and hub are included.
- **Difficulty judgment:** Medium. The generic term “generator runtime” is broad and competitive; the telecom + load-profile + manufacturer-curve long tail is more specific. No third-party keyword-volume or SERP-difficulty data was available, so this is a qualitative judgment.
- **Commercial intent:** Medium. The immediate job is engineering planning; tool use can support professional workflows but the article does not make a purchase claim.
- **Primary tool:** [Generator Fuel Consumption & Runtime Calculator](https://netengineerlab.com/tools/generator-fuel-runtime-calculator/)
- **Related tools:** [-48 V battery runtime](https://netengineerlab.com/tools/48v-battery-runtime/); [generator/UPS transfer ride-through planner](https://netengineerlab.com/tools/generator-ups-transfer-ride-through-planner/); [telecom solar and battery sizing](https://netengineerlab.com/tools/telecom-solar-battery-sizing-calculator/); [telecom rectifier sizing](https://netengineerlab.com/tools/telecom-rectifier-dc-power-sizing/).
- **Topic Hub:** [Telecom Power & Energy](https://netengineerlab.com/topics/telecom-power-energy/)
- **Related tutorial:** [Telecom rectifier sizing: recharge and N-1 checks](https://netengineerlab.com/guides/telecom-rectifier-dc-power-sizing/)
- **Index decision:** INDEX. The page contains a formula, original worked arithmetic, explicit assumptions and limits, tool interaction, and a hub path. Reassess if search-console data shows query mismatch or near-duplicate cannibalization.

## Website SEO fields

- **H1/title:** How Long Will a Telecom Generator Run on One Tank?
- **Meta description:** Estimate telecom generator runtime from a manufacturer fuel curve, time-varying site load and usable tank fuel. Includes a worked example and key limits.
- **Canonical:** `https://netengineerlab.com/guides/generator-fuel-runtime-planning/`
- **Specific CTA:** “Enter the generator’s fuel curve, site load segments, tank volume and reserve in the Generator Fuel Consumption & Runtime Calculator to estimate runtime, outage fuel and refills.”
- **Internal link graph:** Article → primary fuel calculator → battery / transfer / solar / rectifier tools → Telecom Power & Energy Hub → rectifier guide. The article is also linked from the Hub.

## Engineering facts and assumptions

- **Fact (tool method):** fuel rates between adjacent user-entered manufacturer load points are linearly interpolated; each segment’s L/h is multiplied by its duration and summed.
- **Fact (tool method):** usable tank fuel deducts percentage reserve and explicitly unusable fuel. The profile-weighted average is total profile fuel divided by profile hours.
- **Assumption in example:** 30 kW rating; curve points 0/25/50/75/100% = 1.5/2.5/4.2/5.8/7.4 L/h; tank 120 L; 10% reserve; zero additional unusable fuel; 18 kW for 12 h and 12 kW for 12 h.
- **Example result:** interpolated rates 4.84 and 3.52 L/h; profile uses 100.32 L per 24 h; 108 L usable fuel; estimated runtime about 25.8 h if the same profile repeats.
- **Limitations:** the curve is illustrative, not a vendor spec or universal standard. The calculation does not guarantee real runtime and must be validated for exact model, environmental derating, minimum loading, transients, tank drawdown, return plumbing, maintenance, refill logistics and local fuel-storage rules. Battery-energy assistance is not a discharge-curve simulation.

## GitHub Markdown version

# Estimating Telecom Generator Runtime from a Fuel Curve

Generator runtime is not `tank litres ÷ one generic L/h number`. For a telecom site, calculate the fuel consumed by each load interval from the exact generator model’s fuel curve, sum the intervals, and divide usable tank fuel by the profile-weighted rate.

For segment *i*, let `L_i` be site load in kW, `P_rated` generator rated kW, and `f(p)` the fuel curve in L/h at load percentage `p`:

```text
p_i = 100 × L_i / P_rated
fuel_i = interpolate(f, p_i) × hours_i
profile_fuel = Σ fuel_i
average_rate = profile_fuel / Σ hours_i
usable_fuel = tank_litres × (1 − reserve_fraction) − unusable_litres
runtime_hours ≈ usable_fuel / average_rate
```

Interpolation should be limited to adjacent supported curve points. Do not extrapolate beyond the manufacturer’s data without an explicit engineering basis. For an outage longer than the input profile, repeating the same profile is an assumption that must be stated.

### Worked example (illustrative values only)

Assume a 30 kW generator with entered curve points `(0%,1.5)`, `(25%,2.5)`, `(50%,4.2)`, `(75%,5.8)`, `(100%,7.4)` in L/h. Use 18 kW for 12 h and 12 kW for 12 h. Linear interpolation gives 4.84 L/h at 60% and 3.52 L/h at 40%:

```text
daily fuel = 4.84 × 12 + 3.52 × 12 = 100.32 L
usable fuel = 120 × (1 − 0.10) = 108 L
runtime = 108 / (100.32 / 24) ≈ 25.8 h
```

These inputs are demonstrations, not a manufacturer specification or standard consumption curve. The result leaves limited margin above a 24-hour outage. Real operation can differ due to load transients, ambient conditions, altitude, minimum loading, tank pickup limits and refuelling constraints.

Use the exact manufacturer curve and measured site load where possible. Keep operational reserve separate from unusable tank volume. Validate derating, fuel-return arrangement, maintenance limits and storage requirements with the supplier and local procedures.

If you need to test multiple load schedules and outage durations, the [Generator Fuel Consumption & Runtime Calculator](https://netengineerlab.com/tools/generator-fuel-runtime-calculator/) accepts curve points, load segments, reserve and tank inputs. This note is independently useful without the tool; the tool is for scenario iteration, not engineering approval.

## Reddit discussion version

**Proposed title:** How are you estimating telecom generator runtime when the site load changes through the day?

I would avoid dividing tank litres by one generic L/h figure. Start with the exact generator’s fuel table, estimate the site load by time segment, interpolate between the nearest published load points, and sum `L/h × hours`. Then divide usable fuel (after reserve and fuel the tank cannot draw) by the profile’s average fuel rate.

Example only: a 30 kW set, 120 L tank, 10% reserve, with a hypothetical curve giving 4.84 L/h at 60% load and 3.52 L/h at 40% load. Running each point for 12 hours uses 100.32 L/day. The 108 L usable quantity implies about 25.8 hours if that cycle repeats. Those curve values are illustrative; the actual model curve can change the answer materially.

The assumptions I would check first are minimum loading, altitude/temperature derating, tank pickup limits, fuel-return plumbing, starting transients and how quickly a refill can reach the site. How do you represent changing cooling or radio load in your outage plan?

*Optional only where subreddit rules allow:* “I wrote up the interpolation and assumptions here: [article link].” Do not lead with the link; answer follow-up questions with the calculation.

## LinkedIn version

A 120 L generator tank does not tell you how many hours a telecom site can ride through an outage.

Runtime depends on usable fuel and the load-weighted fuel rate. In an illustrative 30 kW example, a 12-hour 60% load period plus a 12-hour 40% period uses 100.32 L/day. With 10% held as reserve, 108 L usable fuel works out to roughly 25.8 hours—assuming the cycle repeats.

That final assumption is often the fragile part. Verify the exact manufacturer curve, site load profile, environmental derating, tank drawdown and refill interval before using the estimate operationally.

I documented the method and a worked example: https://netengineerlab.com/guides/generator-fuel-runtime-planning/

## X version

120 L in the tank ≠ 120 L available. In one illustrative telecom load cycle, 10% reserve leaves 108 L and about 25.8 h estimated runtime. The result depends on the exact generator fuel curve and load profile: https://netengineerlab.com/guides/generator-fuel-runtime-planning/

## 中文公众号 / 知乎版

### 通信油机一箱油能撑多久？不要只用“油箱升数 ÷ 固定油耗”

站点停电时，油机续航要看两项：真正可用的油量，以及站点分时负载对应的平均油耗。油机在不同负载点的油耗并不一定与功率成正比，因此应优先查具体机型的厂家油耗表。

计算时，把站点负载换算为油机额定功率百分比，在相邻厂家负载点之间插值得到 L/h，再按每段持续时间求和。可用油量则要扣掉运维预留和油箱结构导致的不可抽取油量。

**演示算例（非厂家参数）：**假设30 kW油机在60%负载时4.84 L/h、40%负载时3.52 L/h；分别运行12小时，24小时耗油100.32 L。120 L油箱预留10%后可用108 L，若每天负载周期重复，估算续航约25.8小时。

这个结果只在示例曲线、负载和周期重复假设下成立，不能当作续航保证。最终还应核对高温/高海拔降额、最低负载、启动冲击、油箱可用容积、回油布置和补油到场时间。

需要试算不同负载时段或停电时长时，可将厂家曲线录入[油机油耗与应急续航计算器](https://netengineerlab.com/tools/generator-fuel-runtime-calculator/zh/)。工具用于比较方案，工程结论仍需结合现场和厂家资料复核。

## Platform fit and publication plan

- **Publish first:** English website article and Hub link, then localized Chinese page. Publish Tuesday–Thursday, 09:00–11:00 in the target audience’s primary time zone; use UTC for global English if the audience mix is unknown.
- **GitHub:** add as a technical note under the topic documentation tree; formula and reproducible arithmetic first, one restrained tool link at the end.
- **Reddit:** wait for a relevant generator-runtime / telecom-power question; reply with the calculation first. Only include the article if it answers a follow-up or subreddit rules permit it.
- **LinkedIn:** publish the engineering insight and example; respond to technical comments with assumptions and source-data caveats.
- **X:** use the short runtime/reserve contrast and link; do not claim a universal runtime.
- **Chinese distribution:** adapt for Zhihu as a Q&A answer (“通信基站油机一箱油能撑多久？”); adapt for WeChat Official Account with a diagram and a conclusion-first intro. Do not cross-post identical wording.
- **Promotion channels:** owned Topic Hub, GitHub topic docs, LinkedIn, X, relevant Reddit/community threads, Chinese Zhihu and WeChat account.
- **Questions worth answering:** How much fuel is needed for a 24/48/72-hour outage? Does 50% load use half the full-load fuel? How should reserve fuel be treated? Does battery autonomy delay generator start? What changes at high altitude or high ambient temperature?
- **Repurpose:** one fuel-curve interpolation graphic; one load-profile table; a short clip showing how a 12 h day/night cycle changes the result; one FAQ card on usable versus nominal fuel.
- **7-day actions:** Day 0 publish and connect the Hub/tool links; Day 1 share the curve graphic on LinkedIn; Day 2 post the concise X version; Day 3 answer one relevant Reddit/community thread if an active question exists; Day 4 publish the Chinese Zhihu adaptation; Day 5 share the Chinese explainer on WeChat; Day 7 review impressions, clicks and tool CTA events and reply to comments.
- **30-day update:** compare Search Console queries/CTR and tool-click events; check indexation and crawl paths; add a FAQ only when real queries/comments justify it; revise title or opening if impressions show a different intent; replace demo curve with a sourced vendor-neutral example only if verifiable public manufacturer data and licensing permit it.

## Pre-publication quality gate

- Search intent/title/opening align: PASS.
- Original engineering calculation and worked example: PASS.
- Facts, example assumptions and limitations separated: PASS.
- Primary tool CTA and internal route through Hub/related tools/tutorial: PASS.
- Related case: none specific to generator runtime exists in the current registry; do not invent a case. Add a real, anonymized case later if one is available.
- Thin/duplicate risk: low based on repository route scan; exact external SERP and volume check not available in this run.
- Index recommendation: INDEX with ordinary Search Console monitoring.
