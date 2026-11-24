(function(){"use strict";
if((document.documentElement.dataset.nelLocale||"")!=="id"&&document.documentElement.lang!=="id")return;
const exact=new Map(Object.entries({"reference bandwidth invalid":"referensi bandwidth tidak valid","interfaces required":"antarmuka dibutuhkan","input type invalid":"tipe masukan tidak valid",
"✓ Healthy":"Sehat","⚠ Caution":"Perhatian","✕ Failed":"Gagal","Excellent":"Bagus","Good":"Baik","Marginal":"Marginal","Not viable":"Tidak layak","Invalid input":"Input tidak valid","Pass":"Lulus","Review":"Tinjau","Insufficient":"Tidak cukup","PASS":"LULUS","FAIL":"GAGAL",
"Result copied":"Hasil disalin","Record saved":"Rekaman disimpan","CSV exported":"CSV diekspor","Clear all saved records?":"Hapus semua catatan yang disimpan?","Clear all saved history?":"Hapus semua sejarah yang disimpan?","No saved records yet. Calculate and click “Save record”.":"Belum ada catatan yang tersimpan. Hitung dan klik \"Simpan rekaman\".","No saved calculations yet. Calculate and click “Save record”.":"Belum ada perhitungan. Hitung dan klik \"Simpan rekaman\".",
"Check the input values and units.":"Periksa nilai masukan dan unit.","Invalid input. Check all fields.":"Input tidak valid. Periksa semua bidang.","Verify against actual traffic peaks and redundancy requirements.":"Verifikasi terhadap puncak lalu lintas yang sebenarnya dan persyaratan redundansi.",
"The optical budget is sufficient and receive power remains above the threshold.":"Anggaran optik cukup dan menerima daya tetap di atas ambang batas.","The link is usable but has limited engineering margin. Review splitter stages, connector count and ageing allowance.":"Link ini dapat digunakan tetapi telah membatasi margin rekayasa. Review splitter stages, connector count dan penuaan tunjangan.","Budget is exceeded or receive power is below the threshold. Check splitter cascade, connector contamination, bending loss, splice quality and distance.":"Anggaran terlampaui atau menerima daya di bawah ambang batas. Periksa splitter cascade, kontaminasi konektor, kehilangan pengendalian, kualitas splice dan jarak.",
"The standard ODN budget is sufficient and the receive-power window for minimum/maximum transmit power meets both limits.":"Anggaran ODN standar cukup dan sumber daya minimum / maksimum mengirimkan daya memenuhi kedua batas.","The link is usable but engineering or receiver-window margin is limited. Verify the transmit-power range, splitter stages and ageing allowance.":"Taut ini dapat digunakan tetapi teknik atau marjin penerima terbatas. Verifikasi jangkauan transmit- daya, tahap splitter dan usia tunjangan.","The design exceeds the budget, or a worst-case receive power is below sensitivity / above overload. Check transceiver specifications, splitter cascade, distance, contamination and bending loss.":"Desain melebihi anggaran, atau kasus terburuk menerima daya di bawah sensitivitas / di atas kelebihan beban. Periksa spesifikasi transceiver, splitter cascade, jarak, kontaminasi dan pengendalian kerugian.",
"UPS capacity, autonomy and redundancy checks passed for the entered assumptions.":"Kapasitas UPS, otonomi dan pemeriksaan redundansi berlalu untuk asumsi yang masuk.","Warnings: ":"Warning: ",
"Fade margin is below the 10 dB screening level.":"Marjin fade berada di bawah tingkat penyaringan 10 dB.","Obstacle clearance is below 60% of the first Fresnel zone.":"Izin obstacle berada di bawah 60% dari zona Fresnel pertama.","Check the applicable local EIRP limit.":"Periksa batas EIRP lokal yang bisa diterapkan.","60 GHz links have substantial atmospheric oxygen absorption; add it as extra loss.":"60 link GHz memiliki substansial penyerapan oksigen atmosfer; menambahkannya sebagai kehilangan ekstra.",
"Enter finite values: distance and frequency must be positive; losses and clearance cannot be negative; obstacle position must be between 0% and 100%.":"Masukkan nilai terbatas: jarak dan frekuensi harus positif; kerugian dan izin tidak dapat negatif; posisi kendala harus antara 0% dan 100%.",
"Network":"Jaringan","Host":"Host","Interface ID":"ID Antarmuka","No subnet requirements yet.":"Belum ada persyaratan subnet.","Subnet name":"Nama subPapan","Host requirement":"Kebutuhan Host","Reserved addresses":"Alamat yang dipesan","Allocation failed":"Alokasi gagal",
"Project":"Projek","Physical loss":"Kehilangan fisik","Design loss":"Mendesain kerugian","Budget remaining":"Sisa anggaran","Remaining budget":"Anggaran tersisa","Remaining":"Sisa","Estimated receive power":"Perkiraan menerima kekuatan","Receiver margin":"Marjin penerima","Status":"Status","Standard ODN budget":"Anggaran ODN standar","Raw Tx/Rx window":"Jendela Tx / Rx mentah","Optical path penalty":"Penalti path optik","Estimated receive-power range":"Perkiraan penerimaan - jangkauan daya","Estimated maximum distance":"Perkiraan jarak maksimum","Ratio":"Rasio","Total split ratio":"Rasio split total","Splitter loss":"Kehilangan limpa","Physical ODN loss":"Kehilangan ODN Fisik","Design ODN loss":"Perancang kerugian ODN","Effective max distance":"Jarak maksimal efektif",
"Workflow start":"Awal aliran kerja","Step":"Tendang!","Previous":"Sebelumnya","Next":"Berikutnya","Related tools":"Perkakas terkait","Also used in":"Juga digunakan di","Total overhead":"Total overhead","Recommended TCP MSS":"Direkomendasikan TCP MSS","Actual TCP data with options":"Data TCP sebenarnya dengan opsi","Maximum UDP payload":"Muatan UDP maksimum","Encapsulation layer":"undo-type","Bytes per layer":"Bytes per lapis","Count":"Cacah","Remove":"Hapus","Physical link":"Tautan fisik","Effective inner IP":"IP dalam efektif","Engineering gate":"Pintu mesin","No additional encapsulation is configured.":"Tidak ada tambahan encapsulasi dikonfigurasi.","No material risk was found with the current inputs.":"Tidak ada resiko material ditemukan dengan masukan saat ini.","Total addresses":"Total alamat","Binary View":"Tampilan Biner","IPv6 prefix":"IPv6 awalan","Total payload size":"Ukuran muatan total","Engineered per-user bitrate":"bitrate per- pengguna engineered","Effective inner MTU":"MTU","Recommended TCP MSS":"Direkomendasikan TCP MSS","Actual TCP data with options":"Data TCP sebenarnya dengan opsi","Maximum UDP payload":"Muatan UDP maksimum","Physical link":"Tautan fisik","Effective inner IP":"IP dalam efektif","Base underlay MTU":"Dasar dibawah MTU","Strict VLAN deduction":"VLAN strict deduksi","Total encapsulation overhead":"Total encapsulasi overhead","Encapsulation layer":"undo-type","Bytes per layer":"Bytes per lapis","No additional encapsulation is configured.":"Tidak ada tambahan encapsulasi dikonfigurasi.","Check the input values and units.":"Periksa nilai masukan dan unit.","Invalid input. Check all fields.":"Input tidak valid. Periksa semua bidang.","Result copied":"Hasil disalin","Record saved":"Rekaman disimpan","CSV exported":"CSV diekspor","Configuration passes":"Pass konfigurasi","Review required":"Perlu Ulasan","Invalid input":"Input tidak valid","Current workflow":"Aliran kerja saat ini",
"Build an optical link from physical loss assumptions through split planning, power budget and maximum reach verification.":"Membangun link optik dari asumsi kehilangan fisik melalui perencanaan Informasi, anggaran daya dan verifikasi maksimum.","Plan multi-stage splitting and calculate total ratio, insertion loss and effective reach.":"Rencana multi- tahap pemisahan dan menghitung rasio total vow kerugian penyisipan dan jangkauan efektif.","Verify an optical link using transmit power, receiver sensitivity, optical penalty and ODN loss.":"Verifikasi sambungan optik menggunakan daya pengiriman, sensitivitas penerima, penalti optik dan kerugian ODN.","Analyze multiple events and dual wavelengths to identify splices, connectors, bends, breaks, ghosts and dead-zone effects.":"Analisa beberapa peristiwa dan dua panjang gelombang untuk mengidentifikasi splitces, konektor, tikungan, istirahat, hantu dan efek zona mati.",
"Plan IPv6 prefixes, NAT44 capacity, deterministic CGNAT blocks, NAT64 and DNS64 addressing.":"Rencana IPv6 prefix, kapasitas NAT44, deterministik CGNAT blok, NAT64 dan DNS64 pengalamatan.","Plan VLAN count, IPv4 prefix, address capacity and growth headroom.":"Rencana VLAN dihitung, awalan IPv4, kapasitas alamat dan ruang kepala pertumbuhan.","Generate, convert and validate IPv4 ACLs for Cisco IOS, Huawei VRP, H3C Comware and Juniper Junos.":"Hasilkan, konversi dan validasi IPv4 ACL untuk Cisco IOS, Huawei VRP, H3C Comware dan Juniper Junos.",
"Estimate bidirectional RF coverage, AP count, user capacity, throughput and channel reuse.":"Perkiraan cakupan Bidirectional RF, hitungan AP, kapasitas pengguna, melalui masukan dan penggunaan ulang saluran.","Size PoE switches by watts, ports, cable loss, headroom and IEEE 802.3af/at/bt device limits.":"Ukuran PoE switch oleh watts, port, kehilangan kabel, headroom dan IEEE 802.3af / at / bt batas perangkat.","Calculate rack power, current, cooling load, energy and cost.":"Hitung kekuatan rak, saat ini, beban pendingin, energi dan biaya.","Calculate telecom DC battery runtime, required Ah, parallel strings and constant-power current rise.":"Hitung telekom DC baterai waktu berjalan, dibutuhkan Ah, string paralel dan konstant-daya saat ini meningkat.","Calculate data-center sensible heat, N+1 precision cooling capacity, BTU/h, refrigeration tons and airflow from IT and facility loads.":"Hitung data pusat panas yang masuk akal, kapasitas pendinginan N+1 presisi, BTU/h, pendinginan ton dan aliran udara dari IT dan fasilitas beban.","Calculate PUE as total data-center energy divided by IT equipment energy for the same period and boundary.":"Menghitung PUE sebagai total data-pusat energi dibagi oleh IT peralatan energi untuk periode dan batas yang sama.",
"Optical Link Design Workflow":"Optical Link Design Workflow","Optical Fault Isolation Workflow":"Optical Fault Ideation Workflow","Enterprise LAN & IP Planning Workflow":"Enterprise LAN & IP Planning Workflow","Wireless Access Deployment Workflow":"Pemutusan Kerja Akses Nirkabel","Data Center Critical Power & Cooling Workflow":"Pusat Data Critical Power & Cooling Workflow","PoE & Rack Power Design Workflow":"PoE & Rack Power Design Workflow",
"PON Splitter Loss Calculator":"Kalkulator Loss PON Splitter","Optical Power Budget Calculator":"Kalkulator anggaran daya optik","Fiber Loss Calculator":"Kalkulator rugi serat","PON Maximum Distance Calculator":"Kalkulator Jarak Jarak Maksimum PON","ONU RX Power Diagnosis":"Diagnosa Power RX ONU","OTDR Event Analyzer":"OTDR Event Analyzer","IPv6 & NAT Planning Calculator":"Kalkulator Perencanaan IPv6 & NKuulangi","VLAN & IP Subnet Capacity Planner":"VLAN & IP Subnet Kapasitas Planner","IP Subnet Calculator":"Kalkulator subnet IP","PoE Power Budget Calculator":"Kalkulator Anggaran Daya PoE","Wi-Fi Coverage & Capacity Planner":"Wi-Fi Coverage & Kapacity Planner","Bandwidth & Transfer Time Calculator":"Kalkulator bandwidth dan waktu transfer","Network Rack Power & Cooling Calculator":"Percuma: Kalkulator Pendingin Daya Jaringan","Generator + UPS Transfer & Ride-Through Planner":"Generator + UPS Transfer & Ride- Through Planner","Data Center Cooling Load & Precision AC Capacity Calculator":"Kalkulator Kapasitas AC Pendingin Data Center","PUE & Data Center Energy Efficiency Analyzer":"Penganalisa Efisiensi Energi PUE & Data Center"
}));
// Exact, evidence-backed dynamic UI terms from the domain tools.
for(const [key,value] of Object.entries({
  "2 V VRLA telecom cells":"2 V VRLA sel telekom",
  "2 V vented lead-acid cells":"2 V vented lead-acid sel",
  "48 V-class LiFePO₄ module (15S reference)":"48 V-class LiFePO₄ modul (15S referensi)",
  "Custom battery bank":"Bank baterai gubahan",
  "Compact OLT / access shelf":"Kompak rak akses OLT",
  "OLT chassis":"OLT chassis",
  "BBU / baseband unit":"Unit BBU / baseband",
  "Optical transport shelf":"Rak transpor optik",
  "Core switch / router":"Saklar inti / router",
  "Environment monitoring and auxiliaries":"Pemantauan lingkungan dan audit",
  "Custom equipment":"Peralatan gubahan",
  "Base DC load power (nominal-voltage conversion)":"Daya beban Menembus DC (konversi tegangan nomAbaikan)",
  "Battery-side power":"Daya samping Battery-",
  "Average discharge voltage":"TeMeneruskan rata-rata tegangan",
  "Average current per string":"Rata-rata string",
  "Total nameplate capacity":"Kapasitas plat nama total",
  "Combined usable factor":"Faktor yang dapat dikombinasikan",
  "Peak rack load (kW)":"Karang rak puncak (kW)",
  "Growth scenario (%)":"Skenario pertumbuhan (%)",
  "Conservative uplift (%)":"Peningkatan konservatif (%)",
  "Containment closure (%)":"Penutupan penahanan (%)",
  "Row-end leakage (%)":"Row-end kebocoran (% -Mungkin tidak ada yang salah",
  "Floor delivery effectiveness (%)":"Berhati-hati pengiriman lantai (%)",
  "Require N+2 acceptance":"Perlu penerimaan N+2",
  "No material warnings":"Tidak ada peringatan material",
  "Download JSON report":"Unduh laporan JSON",
  "Download CSV check":"Unduh cek CSV",
  "Download CSV check sheet":"Unduh lembar pemeriksaan CSV",
  "Print engineering report":"Cetak laporan rekayasa",
  "UPS losses in room (kW)":"UPS rugi di kamar (kW)",
  "Engineering scenarios & environment":"Skenario rekayasa & lingkungan",
  "Peak IT load (kW)":"Peak IT load (kW)",
  "Conservative-case IT load (kW)":"Konservative- case IT load (kW)",
  "Additional scenario sensible load (kW)":"Tambahan skenario yang masuk akal (kW)",
  "Relative humidity (%)":"Kelembaban relatif (%)",
  "1 unit failed":"1 unit gagal",
  "Scenarios & plan":"Skenario & rencana",
  "Baseline and conservative-case comparison":"Perbandingan baseline dan consertive- case",
  "Healthy":"Sehat",
  "HEALTHY":"HEALTHY",
  "Low":"Rendah",
  "LOW":"LOW",
  "Medium":"Sedang",
  "MEDIUM":"MEDIUM",
  "High":"Tinggi",
  "HIGH":"HIGH",
  "WARNING":"PERINGATAN",
  "CRITICAL":"KRITIS",
  "BALANCED":"BALANCED",
  "OVER":"LEBIH",
  "North-south egress":"Utara-selatan egress",
  "Access / leaf fabric":"Kaus akses / daun",
  "Upper / core layer":"undo-type",
  "DC output":"Keluaran DC",
  "vs mean":"vs berarti",
  "No history supplied; using manual growth.":"Tidak ada riwayat yang disediakan; menggunakan pertumbuhan manual.",
  "Before status":"Sebelum status",
  "After status":"Setelah status",
  "After likelihood":"Setelah kemungkinan",
  "After impact":"Setelah benturan",
  "No abnormal item. Unverified items still cannot be declared safe.":"Tidak ada barang abnormal. Item belum diverifikasi masih tidak dapat dinyatakan aman.",
  "AC feeder":"Pengumpan AC",
  "Phase":"Tahap",
  "Single phase":"Tahap tunggal",
  "Three phase":"Tiga fase",
  "Conversion efficiency (%)":"Efisiensi konversi (%)",
  "Combined derating available (%)":"Derating gabungan tersedia (%)",
  "Load growth (%)":"Muat pertumbuhan (%)",
  "Recharge peak uplift (%)":"Mengisi ulang puncak peningkatan (%)",
  "Extra conservative reserve (percentage points)":"Ekstra cadangan konservatif (poin persentase)",
  "Ambient temperature (°C)":"Suhu Ambient (° C)",
  "Altitude (m)":"Ketinggian (m)",
  "Derating per 10°C above 25°C (%)":"Derating per 10 ° C di atas 25 ° C (%)",
  "Derating per 1000 m above sea level (%)":"Derating per 1000 m di atas permukaan laut (%)",
  "Frame maximum modules (0 = unknown)":"Frame modul maksimum (0 = tidak diketahui)",
  "Installed module slots (0 = unknown)":"Slot modul terpasang (0 = tidak diketahui)",
  "Target utilization (%)":"Penggunaan target (%)",
  "Modules used in checks":"Modul yang digunakan dalam pemeriksaan",
  "Worst-case utilization":"Utilisasi kasus-Worst-",
  "N-1 physical capacity":"Kapasitas fisik N-1",
  "N-2 physical capacity":"Kapasitas fisik N-2",
  "Worst-case operating AC power":"Keadaan-kasus daya AC operasi",
  "Worst-case operating AC current":"Kasus kasus AC saat ini",
  "All selected-policy checks passed":"Semua pilihan-pemeriksaan kebijakan berlalu",
  "Operating scenarios":"Skenario operasi",
  "Scenario":"Skenario",
  "Required A":"Perlu A",
  "Capacity A":"Kapasitas A",
  "Utilization":"Utilisasi",
  "Target reserve":"Cadangan target",
  "Baseline":"Dasar",
  "Peak":"Puncak",
  "Conservative":"Konservatif",
  "baseline": "referencia",
  "peak": "pico",
  "conservative": "conservador",
  "Load growth":"Muat pertumbuhan",
  "Recharge peak":"Puncak isi ulang",
  "Growth + recharge peak":"Pertumbuhan + isi ulang puncak",
  "Combined + conservative reserve":"Kombinasi + konservatif reserve",
  "Modules":"Modul",
  "Recharge A":"Isi ulang A",
  "N-1 margin A":"N-1 margin A",
  "N-2 margin A":"N-2 margin A",
  "Installation":"Instalasi",
  "Current / Before":"Sebelum Sekarang / Sebelum",
  "Recharge-limited adjustment":"Penyesuaian ulang -terbatas",
  "Expansion / After":"Ekspansi / Setelah",
  "Within known limits":"skeptical Dalam batas yang diketahui",
  "Expansion planning checklist":"Daftar checklist perencanaan ekspansi",
  "Report inputs":"Laporkan masukan",
  "Download CSV checks":"Unduh cek CSV",
  "Download planning checklist":"Unduh daftar pemeriksaan perencanaan",
  "Base system efficiency":"Efisiensi sistem dasar",
  "Base backup autonomy":"otonomi backup basis",
  "Allowed DOD":"Diijinkan DOD",
  "4. Supply scenario & economics":"4.",
  "Supply scenario":"Skenario Supply",
  "Electricity tariff":"Listrik tariff",
  "currency/kWh":"mata uang / kWh",
  "PV CAPEX":"PV CAPEX",
  "currency/kWp":"mata uang / kWp",
  "Generador yield":"Generador menghasilkan",
  "Net PV efficiency":"Efisiensi PV jaringan",
  "Stringing":"Stringing",
  "Existing PV gap":"Celah PV yang yang ada",
  "Generation & supply balance":"Generasi & keseimbangan persediaan",
  "Daily surplus / deficit":"Harian kelebihan / defisit",
  "Economics & emissions":"Ekonomi & emisi",
  "Annual energy saving value":"Nilai penyimpanan energi tahunan",
  "Simple payback":"Balas dendam sederhana",
  "Equivalent diesel avoided":"Ekuivalen diesel dihindari",
  "Ring model & traffic matrix":"Model cincin & matriks lalu lintas",
  "Ring nodes":"Node cincin",
  "highBypass":"HighBypass",
  "highRecirculation":"HighRecurculation",
  "endRowLeakage":"endRowLeakage",
  "lowContainmentClosure":"Penutupan Kontainer Rendah",
  "floorDeliveryLoss":"floorDeliveryLos",
  "inletTemperature":"inletTemperatur",
  "n1Fail":"n1Fail",
  "n2Fail":"N2Fail",
  "airflowDeficit":"Air FlowDefisit",
  "coolingDeficit":"pendinginan Defisit"
}))exact.set(key,value);

// Calculator copy that the shared en/zh scripts render at runtime on Spanish pages.
for(const [en,es] of Object.entries({"Enter real engineering parameters to calculate the link loss.":"Masukkan parameter rekayasa nyata untuk menghitung kehilangan link.","The splitter cascade remains within the current standard ODN budget, and the receive window for minimum/maximum transmit power meets the design margin.":"Cascade splitter tetap dalam Adik anggaran standar ODN saat ini, dan menerima jendela minimum / maksimum mengirimkan daya memenuhi margin desain.","✓ Normal":"Normal","⚠ Weak-light caution":"Weaks-light careful","✕ Critical weak light":"Cahayanya lemah","⚡ Optical overload":"Overload Optical","○ Possible no signal":"Tidak mungkin sinyal","Check inputs. Counts must be non-negative integers; attenuation must be positive; splitter loss must be supported; no-signal must be below sensitivity, and sensitivity below overload.":"Periksa masukan. Menghitung harus integer non-negatif; peserta harus positif; kerugian splitter harus didukung; no-signal harus di bawah sensitivitas, dan sensitivitas di bawah kelebihan beban.","No saved records yet.":"Belum ada catatan yang tersimpan.","Measured receive power is inside the receiver window with adequate margin. If service is still abnormal, check ONU registration, errors, optics and service configuration.":"Kekuatan yang diukur ada di dalam jendela penerima dengan batas yang memadai. Jika layanan masih tidak normal, periksa pendaftaran ONU, galat, konfigurasi optik Bayar.","Measured power remains above sensitivity, but margin is limited. Schedule proactive maintenance and inspect connectors, bending, splitter cascade and splices.":"Daya diukur tetap di atas sensitivitas, tapi margin terbatas. Jadwal pemeliharaan proaktif dan memeriksa konektor, pengendalian, splitter cascade dan splits.","Measured power is below receiver sensitivity and may cause drops, registration failure or errors. Locate excess loss or splitter design problems promptly.":"Daya terukur berada di bawah sensitivitas penerima dan dapat menyebabkan penurunan, kegagalan pendaftaran atau Pikir kesalahan. Temukan kelebihan kerugian atau masalah desain slitter segera.","Measured power exceeds the receiver overload threshold and may saturate the receiver. Verify optical class, short-reach direct links and attenuation requirements.":"Daya terukur melebihi ambang batas overload penerima dan mungkin jenuh penerima. Verifikasi kelas optik, pendek-mencapai link langsung dan kebutuhan perhatian.","The measured value reaches the possible no-signal threshold. Check fiber breaks, disconnected connectors, wrong ports, OLT laser faults, severe bending or splitter failure.":"Nilai yang diukur mencapai kemungkinan ambang sinyal no-. Periksa kerusakan serat, konektor terputus, salah port, kesalahan laser OLT, pengendalian parah atau kegagalan splitter.","Check ONU online and registration logs":"Periksa log ONU online dan pendaftaran","Check errors, packet loss and service settings":"Periksa kesalahan, kehilangan paket dan pengaturan layanan","Confirm that measured power is stable":"Konfirmasi bahwa daya yang diukur stabil","Clean SC/APC connectors and adapters":"Bersihkan konektor dan adaptor SC/APC","Inspect drop cable bending or crushing":"Inspeksi drop kabel bending atau menghancurkan","Review splitter cascade and ports":"Meninjau splitter cascade dan port","Retest splices and patch cords":"Uji ulang penyambungan dan sambungan patch","Use OTDR to locate excess loss or breaks":"Gunakan OTDR untuk menemukan kelebihan kehilangan atau kerusakan","Inspect feeder, distribution and drop sections":"Inspeksi pemakan, distribusi dan daerah drop","Verify split ratio against design":"Verifikasi rasio split terhadap desain","Check OLT transmit power and ONU threshold":"Periksa OLT Kirimkan tenaga dan ONU Ambang","Verify optical module class compatibility":"Verifikasi kompabilitas kelas optik","Avoid high-power short direct connections":"Hindari koneksi langsung kekuasaan tinggi","Add a suitable attenuator when required":"Tambahkan peserta yang cocok ketika diperlukan","Confirm measurement point and meter range":"Konfirmasi titik pengukuran dan jangkauan meter","Confirm that the OLT port is transmitting":"Konfirmasi bahwa pangkalan OLT mentransmisikan","Verify patching and port mapping":"Verifikasi pemetaan patch dan port","Inspect breaks, disconnections and severe bends":"Inspeksi istirahat, diskoneksi dan tikungan parah","Use a VFL or OTDR for sectional testing":"Gunakan VFL atau OTDR untuk pengujian seksional","✓ Design passes":"Lemparan tanda tangan lewat","⚠ Physical reach only":"Hanya jangkauan fisik","✕ Insufficient budget":"Anggaran tidak mencukupi","◇ System reach limited":"Sistem dikalahkan terbatas","Check inputs. Distances, attenuation and losses must be valid; counts must be non-negative integers, splitter loss must be supported, and sensitivity must be below overload.":"Periksa masukan. Jarak, perhatian dan kerugian harus valid; jumlah harus bilangan tidak negatif, kehilangan splitter harus didukung, dan sensitivitas harus di bawah kelebihan beban.","Limiting factor: optical power budget. Passive losses and engineering margin determine the available reach.":"Faktor pembatas: anggaran daya optik. Kehilangan pasif dan margin rekayasa menentukan jangkauan yang tersedia.","Limiting factor: system/protocol reach. The optical budget permits a longer route, but effective reach is capped by system capability.":"Faktor batas: jangkauan sistem / protokol. Anggaran optik memungkinkan rute yang lebih panjang, tapi jangkauan efektif dibatasi oleh kemampuan sistem.","Optical-budget reach and system reach are approximately equal.":"Frekuensi anggaran optimasi dan jangkauan sistem kira-kira sama.","The planned distance is within the effective maximum reach and retains the configured engineering margin.":"Jarak yang direncanakan dalam jangkauan maksimum efektif dan mempertahankan margin rekayasa yang dikonfigurasi.","The planned link is physically within the equipment budget, but the full engineering margin is not retained. Reduce distance or passive loss.":"Link yang direncanakan secara fisik dalam anggaran peralatan, tapi penuh margin rekayasa tidak dipertahankan. Kurangi jarak atau kehilangan pasif.","Physical link loss at the planned distance exceeds the maximum channel budget, so receive power falls below sensitivity.":"Kehilangan hubungan fisik pada jarak yang direncanakan melebihi anggaran saluran maksimum, sehingga menerima daya jatuh di bawah sensitivitas.","The optical budget supports the planned route, but effective reach is controlled by the configured system/protocol limit.":"Anggaran optik mendukung rute yang direncanakan, tapi jangkauan efektif dikendalikan oleh batas pengaturan sistem / protokol.","Confirm that the actual route matches the planned distance":"Konfirmasikan bahwa rute sebenarnya cocok dengan jarak yang direncanakan","Retain margin for maintenance, ageing and temperature":"Tahan margin untuk pemeliharaan, penuaan dan suhu","Verify with a power meter and OTDR after deployment":"Verifikasi dengan tenaga meter dan OTDR setelah penyebaran","Reduce splitter cascade or use lower-loss components":"Kurangi splitter cascade atau gunakan komponen lower- loss","Optimize connector and splice count":"Optimasi jumlah konektor dan splice","Increase budget or shorten the route":"Meningkatkan anggaran atau mempersingkat rute","Reduce total split ratio or cascade stages":"Kurangi total rasio split atau tahap cascade","Shorten the route or use lower-attenuation fiber":"Perpendek rute atau gunakan serat penontonnya","Verify minimum transmit power and sensitivity":"Verifikasi minimum mengirimkan daya dan sensitivitas","Review fixed-loss assumptions":"Ulasan asumsi fixed- kerugian","Verify maximum logical/ranging capability":"Verifikasi kemampuan logical / ringing maksimum","Check OLT port and profile configuration":"Periksa konfigurasi dan port OLT","Do not use optical budget as the only reach criterion":"Jangan menggunakan anggaran optik sebagai satu-satunya mencapai kriteria","Attention":"Perhatian","Abnormal":"Abnormal","Critical":"Kritis","Auto detect":"Deteksi otomatis","Splice event":"Acara Splice","Reflective connector":"Konektor Reflektif","Mechanical / reflective fault":"Kesalahan mekanisme / reflektif","Possible bend":"Kemungkinan tikungan","Fiber end / possible break":"Akhir fiber / kemungkinan istirahat","Possible ghost":"Kemungkinan hantu","Unknown event":"Peristiwa tak dikenal","Event type selected manually":"Jenis kejadian yang dipilih secara manual","Near the configured link end with high loss or strong reflection":"Dekat akhir link yang dikonfigurasi dengan kehilangan tinggi atau refleksi yang kuat","Position is close to a multiple of an earlier strong reflection and event loss is small":"Posisi dekat dengan beberapa dari refleksi kuat sebelumnya dan kerugian peristiwa kecil","Secondary-wavelength loss is significantly higher than primary-wavelength loss":"Kehilangan panjang gelombang Takkan pernah hilang","Reflective event with elevated insertion loss":"Event reflektif dengan peningkatan penyisipan","Reflective event detected":"Event reflektif terdeteksi","Low-loss non-reflective event":"Lower-loss non-reflective event","Non-reflective event above the normal splice-loss default":"Tidak-reflektif kejadian di atas normal splitce-loss baku","Record and monitor; immediate action is normally unnecessary.":"Rekam dan monitor; tindakan langsung biasanya tidak perlu.","Retest the event and review splice quality and bidirectional differences.":"Uji ulang kualitas splice acara dan ulasan dan perbedaan bidirectional.","Schedule resplicing or field retest and inspect the closure and nearby bends.":"Jadwal menjawab atau uji ulang lapangan dan memeriksa penutupan dan tikungan terdekat.","Prioritize resplicing and verify with bidirectional OTDR; replace damaged fiber if required.":"Prioritas respiring dan verifikasi dengan bidirectional OTDR; ganti serat rusak jika diperlukan.","Clean the connector and record reflectance.":"Bersihkan konektor dan refleksi rekaman.","Clean the end face and inspect the adapter and ferrule match.":"Bersihkan wajah ujungnya dan periksa adaptor dan aturan yang cocok.","Inspect contamination, damage, UPC/APC mismatch and loose connection.":"Inspeksi kontaminasi, kerusakan, UPC / APC tidak cocok dan kehilangan koneksi.","Correct the strong reflection or excessive insertion loss immediately.":"Benar refleksi yang kuat atau kerugian penyisipan berlebihan segera.","Review and document the mechanical joint.":"Ulasan dan dokumen bersama mekanis.","Inspect the joint, index-matching material and connection stability.":"Inspeksi gabungan, bahan yang cocok dan stabilitas koneksi.","Rebuild the joint or replace it with a fusion splice.":"Membangun kembali sendi atau menggantinya dengan splice fusi.","Prioritize the high-loss reflective joint and retest adjacent events.":"Prioritalisasi tinggi-kerugian reflektif bersama dan mengulang kejadian berdekatan.","Review the cable route.":"Tinjau rute kabel.","Inspect bend radius, drop cable and patch-cord routing.":"Inspeksi radius tikungan, drop kabel dan patch- cord routing.","Release bending or compression and compare 1310/1550 nm results.":"Lepaskan pengendalian atau kompresi dan bandingkan hasil 110 / 1550 nm.","Correct the severe bend or compression point before the link deteriorates further.":"Koreksi tikungan parah atau titik kompresi sebelum link memburuk lebih lanjut.","Confirm the planned link end.":"Konfirmasi link yang direncanakan berakhir.","Verify that the event is a normal end and review end reflection.":"Verifikasi bahwa acara adalah akhir yang normal dan refleksi akhir tinjauan.","Check for a break, disconnection, wrong port or end connector.":"Periksa untuk istirahat, terputus, salah port atau ujung konektor.","Perform sectional testing with a VFL, power meter and OTDR to locate the break.":"Lakukan pengujian sectional dengan VFL, daya meter dan OTDR untuk menemukan istirahat.","Reduce pulse width and retest.":"Kurangi Mereka mencermati","Inspect the strong reflector and adjust range, pulse width and averaging.":"Inspeksi reflektor kuat dan Pegang jangkauan, lebar pulse dan rata-rata.","Check whether the event moves with test settings before treating it as a real fault.":"Periksa apakah acara bergerak dengan pengaturan tes sebelum memperlakukannya sebagai kesalahan nyata.","Correct the earlier strong reflection before interpreting remote events.":"Koreksi refleksi kuat sebelumnya sebelum menafsirkan peristiwa remote.","Record the event.":"Rekam kejadiannya.","Adjust test settings and retest.":"Sesuaikan pengaturan tes dan uji ulang.","Use the trace, bidirectional testing and route records to identify the event.":"Gunakan jejak, pengujian bidirectional dan catatan rute untuk mengidentifikasi acara tersebut.","Schedule field localization and verify the physical topology.":"Jadwal bidang lokalisasi dan verifikasi topologi fisik.","Spacing from the previous event is below the attenuation-dead-zone default; measured loss may be affected by event overlap.":"Jarak dari kejadian sebelumnya berada di bawah zona mati; pengukuran kerugian mungkin terpengaruh oleh tumpang tindih peristiwa.","Spacing from the previous event is below the event-dead-zone default; reflective events may not be fully separated.":"Jarak dari kejadian sebelumnya berada di bawah keadaan zona mati; kejadian reflektif mungkin tidak sepenuhnya terpisah.","Template exported":"Template diekspor","No saved records.":"Tidak ada catatan yang tersimpan.","CSV import complete":"Impor CSV selesai Berisi","The CSV format is invalid or contains no valid events.":"Format CSV tidak valid atau berisi tidak ada kejadian yang valid.","Clear all events?":"Hapus semua peristiwa?","Add at least one valid event.":"Tambahkan paling tidak satu kejadian yang valid.","Enter parameters and calculate.":"Masukkan parameter dan hitung.","Please check the highlighted input fields.":"Silakan periksa ruas masukan yang disorot.","hours":"horas","days":"días","Target met":"Target Punya:","Target not met":"Target tidak bertemu","Estimated runtime":"Perkiraan waktu jalan","Simplified Ah/energy model":"Model Ah / energi sederhana","Peukert-adjusted estimate":"Estimasi disesuaikan Peukert-","Result copied.":"Hasil disalin.","Record saved.":"Rekaman disimpan.","History cleared.":"Sejarah dibersihkan.","No saved project records.":"Tidak ada catatan proyek yang disimpan.","Equipment":"Peralatan","Qty":"Qty","Unit current":"Unit saat ini","Total current":"Total saat ini","Remove":"Hapus","The per-string discharge rate is high. Manufacturer constant-power or constant-current discharge tables are essential.":"Tingkat debit perstring tinggi. Manufaktur daya atau konstant tabel debit saat ini sangat penting.","The discharge rate is above a light standby rate; verify the selected battery's published discharge table.":"Laju debit di atas tingkat siaga ringan; verifikasi tabel debit baterai terpilih yang diterbitkan.","The estimated runtime is shorter than the target runtime.":"Perkiraan waktu berjalan lebih pendek dari target waktu jalan.","For a constant-power load, battery current rises materially as the bus approaches cutoff voltage.":"Untuk daya yang tetap beban, baterai saat naik secara materi sebagai bus pendekatan tegangan cutoff.","Five or more parallel strings require careful current sharing, protection, cabling and maintenance design.":"Lima atau lebih string paralel memerlukan hati graph sekarang, perlindungan, kabel dan desain pemeliharaan.","The remaining-capacity factor is below 70%; replacement risk should be reviewed.":"Faktor kapasitas sisa berada di bawah 70%; resiko penggantian harus ditinjau.","The temperature factor significantly reduces available capacity.":"Faktor suhu secara signifikan mengurangi kapasitas yang tersedia.","The selected usable depth exceeds 80% for a lead-acid preset. Confirm cycle life and end-voltage requirements.":"Kedalaman yang dapat dipakai melebihi 80% untuk awal awalan daun-asam. Konfirmasikan siklus kehidupan dan persyaratan tegangan akhir.","For lithium systems, verify BMS cutoff, module parallel limits, current sharing and vendor runtime data.":"village Untuk sistem lithium, verifikasi BMS cutoff, modul batas paralel, berbagi sekarang dan data runtime vendor.","Peukert correction is an engineering estimate. Constant-power ICT loads and real discharge curves may differ.":"Koreksi Peukett adalah perkiraan teknik. Konstantin- daya ICT beban dan kurva debit nyata mungkin berbeda.","Final sizing must be checked against manufacturer discharge data at the required end voltage and temperature.":"Ukuran akhir harus diperiksa terhadap produsen data debit pada tegangan dan suhu akhir yang diperlukan.","A -48 V DC load has no AC power factor input. Use DC watts or DC amperes; path efficiency represents DC losses.":"Muatan -48 V DC tidak memiliki masukan faktor daya AC. Gunakan DC watts atau DC amperes; efisiensi jalur mewakili kerugian DC.","Base DC load current":"Baterai beban DC saat ini","Design current with margin":"Desain kini dengan marjin","Design power with margin":"Mendesain daya dengan margin","The client-to-AP uplink is the coverage bottleneck. Client transmit power often limits the practical cell edge.":"Klien- to-AP uplink adalah cakupan botol. Klien mengirimkan daya sering membatasi tepi sel praktis.","No saved results":"Tidak ada hasil yang disimpan","Required values are valid":"Nilai yang diperlukan valid","Not assessed (optional)":"Tidak dinilai (opsional)","Optical budget passes; confirm vendor coding, firmware, FEC and DOM before deployment.":"Passing anggaran optik; konfirmasi kode vendor, firmware, FEC dan DOM sebelum penyebaran.","The design meets port-count, total-budget and per-port power requirements.":"Desainnya cocok dengan rata-rata, total anggaran dan kebutuhan daya perport.","Validate DHCP, gateway HA, VRF and fault-domain assumptions before deployment.":"Validasi DHCP, Asalkan HA, VRF dan fault- domain asumsi sebelum penyebaran.","A common planning target keeps continuous load at or below 80% of the breaker or PDU rating. Verify local code and equipment documentation.":"Target perencanaan umum menjaga beban kontinyu di atau di bawah 80% dari pemutus atau peringkat PDU. Verifikasi dokumentasi kode dan peralatan lokal.","Compare baseline, growth and conservative scenarios from the current inputs, then export traceable engineering outputs.":"Bandingkan garis dasar, pertumbuhan dan skenario konservatif dari masukan saat ini, kemudian ekspor keluaran rekayasa dilacak.","Recalculate baseline, growth and conservative scenarios from the current inputs, then export traceable results.":"Menghitung ulang dasar, pertumbuhan dan skenario konservatif dari masukan saat ini, kemudian ekspor hasil dilacak.","Verify resolver policy, authoritative capacity and stale-data behavior before change.":"Verifikasi kebijakan resolver, kapasitas otoriter dan stale- data perilaku sebelum perubahan.","Local-only: configuration and findings are not sent to AI or analytics.":"Local-only: konfigurasi dan temuan tidak Hujan atau analisis.","Paste a supported ACL or build one from parameters. Processing stays in this browser.":"Tempel yang didukung ACL atau buat satu dari parameter. Proses tetap di browser ini.","No high-confidence findings matched. This is not proof that the ACL is safe or complete.":"Tak ada temuan kepercayaan yang cocok. Ini bukan bukti bahwa ACL aman atau lengkap.","This score is a deterministic screening aid, not proof of availability, security or compliance.":"Skor ini adalah bantuan pencitraan deterministik, bukan bukti ketersediaan, keamanan atau kepatuhan.","No current result — the latest input was rejected.":"Tidak ada hasil saat ini - masukan terbaru ditolak.","Example loaded — review the highlighted inputs before building a plan.":"Contoh dimuat - meninjau masukan yang disorot sebelum membangun rencana.","Two C9200L stack members each contribute one uplink to Port-channel10. VLAN 100 is added while preserving the existing native VLAN.":"Dua anggota C9200L stack masing-masing berkontribusi satu uplink ke Port- channel10. VLAN 100 ditambahkan ketika melestarikan asli yang ada VLAN.","Two aggregate members selected":"Dua anggota agregat dipilih","Review risk, forward config and rollback first; then follow the runbook and paste post-check evidence.":"Review risiko, maju config dan rollback pertama, kemudian ikuti runbook dan paste post- periksa bukti.","Expand the reasons below before approving the change.":"Perluas alasan di bawah ini sebelum menyetujui perubahan.","Extends Layer-2 reachability. Confirm the VLAN is intended and present end-to-end.":"Layer Extending-2 reachability. Konfirmasikan VLAN dimaksudkan dan menyajikan akhir untuk-akhir.","The snapshot contains unmanaged lines. Review nearby configuration before execution.":"Snapshot berisi baris yang tidak dikelola. Ulasan konfigurasi terdekat sebelum eksekusi.","Risk is below the peer-review threshold, but normal change approval still applies.":"Resiko berada di bawah ambang tinjauan peer-, tapi persetujuan perubahan normal masih berlaku.","Capture current aggregate/member state":"Tangkap keadaan kumpulan / anggota saat ini","Evidence before PASS":"Bukti sebelum PASS","Scenarios and installation limits":"Tampilan dan batas instalasi","Capacity and failure checks":"Kapasitas dan pemeriksaan kegagalan","Selected modules: installed count, or worst-case recommendation when installed = 0. Failure checks use physical environmental capacity; target reserve is a separate planning check.":"Modul yang dipilih: dihitung, atau terinstal - rekomendasi kasus ketika terpasang = 0. Kegagalan memeriksa menggunakan kapasitas lingkungan fisik; cadangan target adalah pemeriksaan perencanaan terpisah.","Worst-case required current":"Huruf-huruf buruk dibutuhkan saat ini","Additional load within target reserve":"Muatan tambahan dalam cadangan target","Before / After plan comparison":"Sebelum / Setelah perbandingan rencana","Current plan uses installed modules or baseline sizing. Recharge-limited adjustment retains those modules and limits charging for the combined growth / conservative condition. Expansion retains full peak recharge.":"Rencana saat ini menggunakan modul terinstal atau ukuran baseline. Penyesuaian ulang - batas mempertahankan modul tersebut dan batas pengisian untuk kondisi pertumbuhan / konservatif gabungan. Ekspansi mempertahankan perbaikan puncak penuh.","Target reserve met; verify controller settings and battery recovery time.":"Target bertemu reserve; verifikasi pengaturan pengontrol dan waktu Kemungkinan pemulihan baterai.","Verify compatible module model, controller licensing, AC feeder, busbar and DC distribution ratings before procurement. A failed frame limit requires a larger frame; adding slots alone does not resolve it.":"Verifikasi model modul yang kompatibel, kontrol lisensi, pengKendal AC, busbar dan DC peringkat distribusi sebelum pengadaan. Batas frame yang gagal memerlukan bingkai yang lebih besar; menambahkan slot saja tidak menyelesaikannya.","Add peak, conservative-case and site limits. Leave automatic fields blank to use the current IT load.":"Tambahkan puncak, consertive- kasus dan batas situs. Biarkan medan otomatis kosong untuk menggunakan beban IT saat ini.","Leave blank to use the current IT load":"Tinggalkan kosong untuk menggunakan beban IT saat ini","Leave blank to use the peak IT load":"Tinggalkan kosong untuk menggunakan puncak beban IT","Optional; leave blank when no extra sensible load applies":"Opsional; tinggalkan kosong ketika tidak ada beban ekstra yang masuk akal berlaku","Used for environmental risk checks":"Digunakan untuk pemeriksaan resiko lingkungan","Maximum cooling units allowed by the site":"Unit pendingin maksimum yang diijinkan oleh situs","Optional; leave blank for no unit-count limit":"Opsional; tinggalkan kosong untuk batas unit-count","Topology capacity and N-1 failure matrix updated.":"kapasitas Topologi dan N-1 gagal matriks diperbarui.","No major ring-capacity warning under the entered assumptions.":"Tidak ada peringatan kapasitas utama di bawah asumsi yang dimasukkan.","Prioritize capacity expansion on the surviving bottleneck span in the worst failure scenario.":"MemBerbeda dengan ekspansi kapasitas pada rentang botol yang masih hidup dalam skenario kegagalan terburuk.","Migrate or reroute traffic to reduce post-protection peak loading.":"Migrasi atau mengubah rute lalu lintas untuk mengurangi perbaikan pos.","Dual-uplink, channel and MSE failure-state capacity updated.":"Dual- uplink, saluran dan MSE kegagalan-negara kapasitas diperbarui.","No major capacity or common-mode failure warning under the entered assumptions.":"Tak ada peringatan kegagalan utama atau mode umum di bawah asumsi yang dimasukan.","Normal, failure and growth scenarios are within the target threshold.":"Normal, kegagalan dan skenario pertumbuhan berada dalam ambang target.","Compare designs and review Before / After and N-1 impact.":"Bandingkan desain dan ulasan sebelum / sesudah dan dampak N-1.","N-1 remains within the target threshold.":"Bersama N-1.","Normal":"Normal","Growth and recharge peaks are also tested together. Conservative reserve adds percentage points to engineering headroom. Environmental coefficients are editable planning assumptions; verify manufacturer curves, bus voltage and low AC input limits.":"Peringkat pertumbuhan dan mengisi ulang puncak juga diuji bersama. Cadangan konservatif menambahkan persentase poin ke ruang kepala rekayasa. Koefisien lingkungan adalah asumsi perencanaan yang dapat diedit; pabrik verifikasi, tegangan bus dan batas masukan AC rendah.","Recalculate baseline, growth and conservative paths while checking fragmentation, frame limits, redundancy and failure boundaries.":"Menghitung ulang dasar, pertumbuhan dan jalur konservatif ketika memeriksa perpecahan, batas bingkai, redundansi dan batas kegagalan."}))if(!exact.has(en))exact.set(en,es);

// Independently observed remaining ES field labels.
for(const [key,value]of Object.entries({
  "Source":"Sumber",
  "Destination":"Tujuan",
  "Port":"Port",
  "Remove rule":"Hapus aturan",
  "Authoritative propagation margin":"Marjin propagasi algitatif",
  "Download JSON":"Unduh JSON",
  "Download CSV":"Unduh CSV",
  "Assessment item name":"Nama butir assembly",
  "Likelihood 1–5":"Seperti1- 5",
  "Operator cap / port":"Operator cap / port",
  "Protection factor 1/2":"Faktor compromising 1 / 2",
  "Failed uplinks (N-1)":"Gagal uplinks (N-1)",
  "After-growth scenario %":"Skenario pertumbuhan setelahnya%",
  "Wi-Fi generation":"Wi-Fi generasi",
  "Manual event type":"Jenis acara manual",
  "Bend comparison":"Perbandingan bengkok",
  "History":"Riwayat",
  "Protection chain required":"Rantai perlindungan diperlukan",
  "Protection chain present":"Rantai perlindungan hadir",
  "Dual uplink required":"Perlu uplink dual"
}))exact.set(key,value);
// Reviewed human-readable report labels.
for(const [key,value] of Object.entries({
  "Model":"Model",
  "Battery bank":"Baterai bank",
  "Nominal voltage":"Tegangan Nominal",
  "Design load current":"Mendesain beban saat ini",
  "Design load power":"Mendesain daya beban",
  "Average current":"Rata-rata saat ini",
  "Estimated runtime":"Perkiraan waktu jalan",
  "Delivered usable energy":"Energi Anakmu.",
  "Target runtime":"Target waktu jalan",
  "Required total capacity":"Perlu kapasitas total",
  "Required parallel strings":"Perlu string paralel",
  "Note":"Catatan",
  "NetEngineerLab -48V Telecom Battery Runtime Calculator V1.1":"Baterai Telekom NetEngineerLab -48V Baterai Runtime Kalkulator V1.1",
  "Data Center Fabric Plan":"Rencana Fabric Pusat Data",
  "Total convergence":"Konvergensi Total",
  "Fabric utilization":"Utilisasi Fabric",
  "Network Hidden-Hazard Assessment Report":"Laporan Rangkaian Jaringan-Hazard",
  "Website":"Situs web",
  "Completion":"Pelengkapan",
  "Abnormal":"Abnormal",
  "Unverified":"Belum diverifikasi",
  "Critical":"Kritis",
  "Before/After risk":"Sebelum / Setelah risiko",
  "Risk reduction":"Pengurangan resiko",
  "Top risks":"Risiko atas",
  "Boundary":"Batas",
  "Required switch budget":"Anggaran switch yang diperlukan",
  "PD load":"Isi PD",
  "Budget utilization":"Utilisasi anggaran",
  "Maximum devices":"Perangkat maksimum",
  "NetEngineerLab PoE Power Budget Calculator":"NetEngineerLab PoE Power Budget Kalkulator threshold name",
  "Canonical IPv6":"Canonical IPv6",
  "Expanded IPv6":"IPv6 yang diperluas",
  "Parent network":"Jaringan induk",
  "Parent last":"Orangtua terakhir",
  "Child prefix count":"Jumlah awalan anak",
  "Addresses per child":"Alamat per anak",
  "Containing child":"Mengandung anak",
  "Containing index":"Indeks yang memuat",
  "Public IPv4":"IPv4 Publik",
  "Subscribers":"Subscriber",
  "Raw ports/protocol":"Port / protokol mentah",
  "Usable ports/protocol/IP":"Port / protokol / IP yang dapat digunakan",
  "Enabled protocol pools":"Kolam protokol aktif",
  "Mappings/public IPv4":"Pemetaan / publik IPv4",
  "Total mapping capacity":"Kapasitas pemetaan total",
  "Required mappings":"Pemetaan yang diperlukan",
  "Required public IPv4":"Perlu publik IPv4",
  "Maximum subscribers":"Pelanggan maksimum",
  "Sharing ratio":"Rasio berbagi",
  "Capacity usage %":"Penggunaan Kapasitas%",
  "Usable ports/IP":"Port yang dapat digunakan / IP",
  "Port block size":"Ukuran blok port",
  "Blocks/public IPv4":"Blocks / public IPv4",
  "Supported subscribers":"Pengguna yang didukung",
  "Spare subscribers":"Pelanggan cadangan",
  "Subscriber capacity %":"Kapasitas subscriber%",
  "TCP peak mappings/subscriber":"TCP puncak pemetaan / pelanggan",
  "UDP peak mappings/subscriber":"UDP puncak pemetaan / pelanggan",
  "Port block usage %":"Penggunaan blok port%",
  "Active mappings":"Pemetaan aktif",
  "Daily log events":"Peristiwa log harian",
  "Translation prefix":"Prefiks terjemahan",
  "Prefix length":"Panjang prefix",
  "Synthesized IPv6":"IPv6 Tersinkronisasi",
  "WKP":"WKP",
  "Local-use prefix":"Local- gunakan prefiks",
  "Coverage AP count":"Jumlah AP terselubung",
  "Design radius m":"Batas desain m",
  "RF radius m":"Radius RF m",
  "Downlink radius m":"Radius downlink m",
  "Uplink radius m":"Radius uplink m",
  "AP EIRP dBm":"AP EIRP dBm",
  "Client EIRP dBm":"Klien EIRP dBm",
  "Obstacle loss dB":"Gangguan kehilangan dB",
  "Effective area/AP m2":"Daerah efektif / AP m2",
  "APs/floor":"Aps / floor",
  "Capacity AP count":"Jumlah Kapasitas AP",
  "Reference PHY Mbps":"Referensi PHY Mbps",
  "Effective throughput/AP Mbps":"Effective through put / AP Mbps",
  "Total demand Mbps":"Total permintaan Mbps",
  "Throughput AP count":"Sepanjang jumlah AP",
  "Client-count AP count":"Klien - jumlah AP",
  "Associated users/AP":"Pengguna / AP terasosiasi",
  "Active users/AP":"Pengguna aktif / AP",
  "Throughput headroom %":"Sepanjang ruang kepala%",
  "Final AP count":"Jumlah AP Akhir",
  "Available 20 MHz channels":"Tersedia 20 saluran MHz",
  "Channel width MHz":"Lebar saluran MHz",
  "Reusable channel groups":"Grup kanal dapat dipakai ulang",
  "APs/channel group":"Grup APs / channel",
  "Associated users/final AP":"Associated users / final AP",
  "Active users/final AP":"Pengguna aktif / AP Akhir",
  "Demand/final AP Mbps":"Permintaan / AP terakhir Mbps",
  "Throughput utilization %":"Sepanjang utilisasi%",
  "Floor allocation":"Alokasi lantai",
  "NetEngineerLab Wi-Fi Coverage & Capacity Planner":"NetEngineerLab Wi-Fi Coverage & Kapasitas Planner",
  "Results are engineering estimates. Final AP design requires a regulatory review, vendor data and an on-site predictive/active survey.":"Hasil adalah perkiraan teknik. Desain AP Final memerlukan tinjauan regulasi, data vendor dan survei prediktif / aktif pada situs.",
  "Network Change Method of Procedure":"Metode Perubahan Jaringan dari Prosedur",
  "Device":"Perangkat",
  "Vendor":"Vendor",
  "Logical aggregate":"Logical agregate",
  "Plan status":"Status rencana",
  "Change scope":"Ubah scope",
  "Members":"Anggota",
  "Allowed VLANs":"Diijinkan VLANs",
  "Description":"Deskripsi",
  "Semantic delta":"delta semantik",
  "Members added":"Anggota ditambahkan",
  "Members removed":"Anggota dihapus",
  "VLANs added":"VLANs ditambahkan",
  "VLANs removed":"VLANs dihapus",
  "Risk reasons":"Alasan resiko",
  "Execution runbook":"Buku runbook eksekusi",
  "Change authorization":"Ubah otorisasi",
  "Standard operator approval":"Persetujuan operator standar",
  "Success criteria":"kriteria sukses",
  "Rollback triggers":"Rollback pemicu",
  "Apply minimal forward delta":"Terapkan delta minimal ke depan",
  "Rollback gate":"Rollback gerbang",
  "Rollback configuration":"Konfigurasi Rollback",
  "Minimal forward configuration":"Konfigurasi maju minimal",
  "Post-change decision":"Tombol- ubah keputusan",
  "Decision":"Keputusan",
  "Passed":"Lulus",
  "Failed":"Gagal",
  "Inconclusive":"Tidak meyakinkan",
  "Extends Layer-2 reachability. Confirm the VLAN is intended and present end-to-end.":"Layer Extending-2 reachability. Konfirmasikan VLAN dimaksudkan dan menyajikan akhir untuk-akhir.",
  "Documentation-only change with low forwarding impact.":"Dokumentasi- hanya perubahan dengan dampak penerusan rendah.",
  "The snapshot contains unmanaged lines. Review nearby configuration before execution.":"Snapshot berisi baris yang tidak dikelola. Ulasan konfigurasi terdekat sebelum eksekusi.",
  "Generated locally by NetEngineerLab. Review against the applicable vendor guide and your organization's change process before production execution.":"Dihasilkan secara lokal oleh NetEngineerLab. Ulasan terhadap panduan penjual yang berlaku dan organisasi Anda proses perubahan sebelum eksekusi produksi.",
  "Engineering Report":"Laporan Teknik",
  "Method of Procedure (MOP)":"Metode Prosedur (MOP)",
  "Engineering Review Checklist":"Checklist Rekayasa",
  "Engineering Results Register":"Register Hasil Teknik",
  "Included results":"Hasil yang disertakan",
  "Compiled from user-imported tool results. Verify inputs, sources and applicable standards before delivery or execution.":"Dikompilasi dari hasil perangkat yang diimpor. Verifikasi masukan, sumber dan standar yang dapat diterapkan sebelum pengiriman atau Matanya."
}))if(!exact.has(key))exact.set(key,value);
// Verified remaining report templates; free field values are preserved.
exact.set("Risk","Risiko");exact.set("Capture trunk state","Tangkap keadaan bagan");exact.set("Confirm target VLAN inventory","Konfirmasi target inventaris VLAN");exact.set("Target VLANs remain present","Target VLANs tetap hadir");
// Same-tool MOP source literals reviewed against actual runtime; user fields and command blocks remain protected.
for(const [english,spanish]of [["Creates a new logical aggregate. Confirm the ID is unused and both ends are coordinated.", "Membuat kumpulan logika baru. Konfirmasi ID tidak digunakan dan kedua ujungnya terkoordinasi."],["Adds physical members to the bundle. A wrong member can affect an existing uplink.", "Tambahkan anggota fisik ke bundel. Seorang anggota yang salah dapat mempengaruhi uplink yang ada."],["Removes existing members and reduces available bundle capacity during the change.", "Menghilangkan anggota yang ada dan mengurangi kapasitas bundel yang tersedia selama perubahan."],["Removes VLAN reachability from the trunk and may interrupt dependent services.", "Menghapus VLAN reachability dari bagasi dan mungkin mengganggu layanan tergantung."],["Changes untagged/PVID behavior. Mismatch across the link can create traffic leakage or loss.", "Perubahan perilaku tanpa tag / PVID. Salah cocokkan di link dapat membuat kebocoran lalu lintas atau kehilangan."],["A blocking conflict was detected. Do not execute until it is resolved.", "Konflik pemblokiran terdeteksi. Jangan jalankan sampai selesai."],["No incremental factors", "Tidak ada faktor bertahap"],["Inputs changed. Rebuild the plan.", "Input berubah. Membangun kembali rencananya."],["Cisco stack uplink: add VLAN 100", "Cisco stack uplink: tambahkan VLAN 100"],["Huawei campus uplink: expand trunk", "Huawei kampus uplink: batang memperluas"],["A dual-link S5735 uplink keeps Eth-Trunk10 and expands the allowed VLAN set with a minimal delta.", "Sebuah dual- link S5735 uplink Kehilangan Eth-Trunk10 dan memperluas yang diperbolehkan VLAN set dengan delta minimal."],["Juniper VC: ae10 trunk normalization", "Juniper VC: AE10 batang normalisasi"],["Two EX3400 Virtual Chassis members form ae10. The plan reconciles trunk membership and description without rebuilding correct state.", "Dua anggota Virtual Chassis EX3400 membentuk AE10. Rencana mendamaikan bagasi keanggotaan dan deskripsi tanpa membangun kembali keadaan yang benar."],["Arista DC uplink: controlled VLAN expansion", "Arista DC uplink: kontrol ekspansi VLAN"],["A 7050SX3 Port-Channel change demonstrates the same intent workflow on a data-center switching platform.", "Sebuah 7050SX3 Port-Channel perubahan menunjukkan aliran niat yang sama pada database-pusat switching platform."],["Running config pasted", "Menjalankan konfigurasi ditempelkan"],["Allowed VLAN set defined", "Set VLAN yang didefinisikan"],["Native/PVID is included in allowed VLANs", "Native / PVID dimasukan dalam VLANs diperbolehkan"],["Risk score", "Skor resiko"],["Current managed state already matches the desired intent.", "Keadaan yang dikelola saat ini sudah cocok dengan tujuan yang diinginkan."],["Review this risk factor before execution.", "Tinjau faktor risiko ini sebelum eksekusi."],["No incremental risk factors were added.", "Tidak ada faktor risiko bertahap ditambahkan."],["The managed running state already matches the requested intent. No configuration commands are required.", "Keadaan berjalan sudah cocok dengan tujuan yang diminta. Tak ada perintah konfigurasi yang diperlukan."],["The plan is blocked by a conflict. Resolve the conflict before generating an execution window.", "Rencana ini diblokir oleh konflik. Selesaikan konflik sebelum menghasilkan jendela eksekusi."],["Risk threshold requires peer review and a controlled maintenance window.", "Ambang resiko memerlukan tinjau peer dan jendela pemeliharaan yang dikendalikan."],["No configuration changes required.", "Tak ada perubahan konfigurasi yang diperlukan."],["No rollback configuration required.", "Tidak perlu konfigurasi rollback."],["Success", "Sukses"],["Paste the real device output for this command", "Tempelkan keluaran perangkat sebenarnya bagi perintah ini"],["Stop:", "Stop:"],["Resolve the blocking conflict before reviewing an execution runbook.", "Selesaikan konflik pemblokiran sebelum meninjau buku runbook eksekusi."],["No change required:", "Tidak ada perubahan yang diperlukan:"],["The managed state already matches the desired intent.", "Negara yang dikelola sudah cocok dengan tujuan yang diinginkan."],["Next:", "Berikutnya:"],["Fix the highlighted input or current-state conflict, then rebuild the plan.", "Perbaiki masukan yang disorot atau konflik negara, kemudian bangun kembali rencana."],["Verification decision:", "Keputusan verifikasi:"],["Review rollback triggers before the next action.", "Review rollback pemicu sebelum aksi berikutnya."],["Vendor sample loaded. Adjust the desired intent, then build the plan.", "Sampel vendor dimuat. Sesuaikan niat yang diinginkan, kemudian membangun rencana."],["Obtain peer review/change approval", "Obtain review / perubahan persetujuan peer"],["Resolve blocking conflicts before execution.", "Selesaikan pemblokiran konflik sebelum eksekusi."],["Change blocked", "Perubahan diblokir"],["No change required", "Tidak ada perubahan yang diperlukan"],["Current managed state already matches desired intent.", "Keadaan yang dikelola saat Swofford sudah cocok dengan tujuan yang diinginkan."]])if(!exact.has(english))exact.set(english,spanish);
function tr(s){if(!s)return s;const t=s.trim();if(exact.has(t))return s.replace(t,exact.get(t));if(t.includes(' · ')){const parts=t.split(' · ');const mapped=parts.map(part=>tr(part));if(mapped.some((v,i)=>v!==parts[i]))return s.replace(t,mapped.join(' · '));}let out=s;
out=out.replace(/^Step (\d+) of (\d+)$/i,'Langkah $1 dari $2');
out=out.replace(/^Warnings:\s*/i,'Peringatan: ');
out=out.replace(/^Design loss:\s*/i,'Rugi desain: ');
out=out.replace(/^Remaining:\s*/i,'Sisa: ');
out=out.replace(/^Project:\s*/i,'Proyek: ');
out=out.replace(/^Mode:\s*/i,'Mode: ');
out=out.replace(/^Environmental current per module:\s*/,'Arus lingkungan per modul: ');
out=out.replace(/^Planning current at target utilization:\s*/,'Arus perencanaan pada utilisasi target: ');
out=out.replace(/^Recharge-limited proposal:\s*/,'Usulan dengan isi ulang terbatas: ');
out=out.replace(/^Before\/After:\s*(.*?); Δ margin /,'Sebelum/sesudah: $1; Δ margin ');
out=out.replace(/^Before\/After:\s*(.*?); airflow delta /,'Sebelum/sesudah: $1; Δ aliran udara ');
out=out.replace(/^The planner will change (\d+) member binding\(s\) and (\d+) VLAN membership item\(s\)\.$/,'Perencana akan mengubah $1 ikatan anggota dan $2 item keanggotaan VLAN.');
out=out.replace(/^(\d+) of (\d+) checks have evidence\.$/,'$1 dari $2 pemeriksaan memiliki bukti.');
out=out.replace(/^(\s*)(\S+) up with (\d+) intended members(\s*)$/,'$1$2 aktif dengan $3 anggota yang direncanakan$4');
out=out.replace(/^(\s*)(\S+) operational\/up with no new errors(\s*)$/,'$1$2 operasional/aktif tanpa erro baru$3');

// These anchored templates describe rendered human-readable result strings.
out=out.replace(/^([-+]?\d[\d.,]*) (hours|days)$/,(_,amount,unit)=>amount+' '+({hours:'jam',days:'hari'}[unit]));
out=out.replace(/^Baseline (.*?) → Peak (.*?) → Conservative (.*)$/,'Baseline $1 → Puncak $2 → Konservatif $3');
out=out.replace(/^Baseline → Peak → Conservative; N-1: (.*)$/,'Baseline → Puncak → Konservatif; N-1: $1');
out=out.replace(/^Possible low-output modules: (.*)$/,'Kemungkinan modul keluaran rendah: $1');
out=out.replace(/^Overloaded modules: (.*)$/,'Modul kelebihan beban: $1');
out=out.replace(/^Risk: (low|medium|high|critical) · (.*)$/i,(_,risk,note)=>'Risiko: '+({low:'rendah',medium:'sedang',high:'tinggi',critical:'kritis'}[risk.toLowerCase()])+' · '+tr(note));
out=out.replace(/^Generator capacity: (PASS|FAIL)$/,(_,state)=>'Kapasitas generator: '+(state==='PASS'?'MEMENUHI':'TIDAK MEMENUHI'));
out=out.replace(new RegExp('^PASS / (.*)$'),'MEMENUHI / $1').replace(new RegExp('^FAIL / (.*)$'),'TIDAK MEMENUHI / $1');
out=out.replace(/^(Proposed total modules|Additional modules|Additional slots|Frame maximum|Installed slots|Generated|Language|Engine): (.*)$/,(_,label,value)=>({"Proposed total modules":"Total modul yang diusulkan","Additional modules":"Modul tambahan","Additional slots":"Slot tambahan","Frame maximum":"Maksimum rangka","Installed slots":"Slot terpasang","Generated":"Dibuat","Language":"Bahasa","Engine":"Mesin"})[label]+': '+value);
out=out.replace(/^Capture (\S+) state$/,(_,name)=>'Catat status '+name);
out=out.replace(/^Allowed VLANs (.*); native\/PVID (.*)$/,(_,vlans,native)=>'VLAN yang diizinkan '+vlans+'; native/PVID '+native);
out=out.replace(/^Design ([-+\d.,]+ kW \| [-+\d.,]+ VA \| [-+\d.,]+ A \| [-+\d.,]+ BTU\/h \| [-+\d.,]+) kWh\/month$/,(_,values)=>'Desain '+values+' kWh/bulan');
out=out.replace(/^Allowed VLANs (.*)$/,(_,vlans)=>'VLAN yang diizinkan '+vlans);
out=out.replace(/^native\/PVID (.*)$/,(_,value)=>'native/PVID '+value);
out=out.replace(/^Native\/PVID changes from (.*?) to (.*?); verify both ends of the link\.$/,(_,before,after)=>'VLAN native/PVID berubah dari '+(before==='none'?'tidak ada':before)+' ke '+(after==='none'?'tidak ada':after)+'; periksa kedua ujung tautan.');
return out;}
// Reviewed same-tool human UI labels only; never apply these phrases to reports or user values.
const uiLexicons={
  "dns-ttl-propagation-calculator": {
    "Peak/previous TTL": "TTL máximo/anterior",
    "Resolver population": "Población de resolutores",
    "Resolver growth": "Crecimiento de resolutores",
    "Stale-serve exposure": "Paparan jawaban usang"
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
    "Non-reflective events": "Peristiwa non-reflektif",
    "Reflective events": "Peristiwa reflektif"
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
// Project titles are user data, even when they equal ke translated state word.
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
 if(uiSlug==='48v-battery-runtime'&&p.closest('button[data-history]')&&t==='Load')return original.replace(t,'Muat');
 if(uiSlug==='wifi-coverage-capacity-planner'){
  if(p.closest('button[data-load]')&&t==='Load')return original.replace(t,'Muat');
  if(p.closest('button[data-delete]')&&t==='Delete')return original.replace(t,'Hapus');
  if(p.matches('.history-item > span')&&['coverage','capacity','combined','channel'].includes(t)){
   const tab=document.querySelector('[data-tab="'+t+'"]');
   if(tab)return original.replace(t,tab.textContent.trim());
  }
 }
 const prefixes={
  'onu-rx-power':[['Measured:','Daya terukur:'],['Sensitivity margin:','Margin sensitivitas:']],
  'otdr-event':[['Events ','Peristiwa '],['Abnormal ','Abnormal '],['Critical ','Kritis '],['Estimated loss ','Rugi perkiraan ']],
  'pon-distance':[['Effective max:','Maksimum efektif:'],['Planned:','Direncanakan:']],
  'pon-splitter-loss':[['Ratio:','Rasio:']]
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
function start(){document.documentElement.lang='id';walk(document.body);obs.observe(document.body,{childList:true,subtree:true,characterData:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
function translateHumanReport(value){
const source=String(value);if(/^[\s\uFEFF]*[\[{]/.test(source))return source;
const translatedValues=new Set(['Status','Design status','Risk','Risk level','Model','Mode','Note','Reason','Warning','Warnings','Recommendation','Recommendations','Acceptance','Result','Success criteria']);
const enums={healthy:'Sehat',warning:'Peringatan',failed:'Tidak memenuhi',pass:'Memenuhi',fail:'Tidak memenuhi',low:'rendah',medium:'sedang',high:'tinggi',critical:'kritis'};
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

