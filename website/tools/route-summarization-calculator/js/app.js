(function () {
  var lang = (document.documentElement.lang || 'en').toLowerCase();
  var locale = lang.indexOf('zh') === 0 ? 'zh' : lang.indexOf('es') === 0 ? 'es' : (lang === 'id' || lang.indexOf('id-') === 0) ? 'id' : (lang === 'pt-br' || lang.indexOf('pt') === 0) ? 'pt' : 'en';
  var copy = {
    zh: {
      empty: '没有可汇总的前缀', invalid: '输入无效',
      one: '收成 1 条汇总路由',
      stayOne: '结果是 1 条路由',
      many: '不能收成一条，收成 {n} 条',
      stay: '不能收成一条，仍是 {n} 条',
      covered: '已被更大前缀覆盖或重复',
      rec: {
        'Remove duplicate or already-covered prefixes before publishing a route summary.': '发布汇总路由前，先去掉重复或已被覆盖的前缀。',
        'The listed prefixes can be advertised as a smaller set of aggregate routes.': '这些前缀可以收成更少的汇总路由再通告。',
        'Verify the aggregate does not include unintended address space and confirm longer-prefix exceptions.': '核对汇总是否盖住了不该通告的地址，并确认更长前缀的例外。'
      },
      err: {
        ipv4_address_invalid: 'IPv4 地址无效',
        ipv6_address_invalid: 'IPv6 地址无效',
        prefix_format_invalid: '前缀要写成 地址/长度',
        prefix_length_invalid: '前缀长度超出该地址族',
        prefix_type_invalid: '前缀必须是文本',
        min_prefix_invalid: '最短前缀长度必须是 0 到 128 的整数',
        input_type_invalid: '输入无效',
        prefixes_type_invalid: '前缀列表无效'
      }
    },
    en: {
      empty: 'No prefixes to summarize', invalid: 'Invalid input',
      one: 'Summarized to 1 route',
      stayOne: 'The result is 1 route',
      many: 'Not one route. Summarized to {n} routes',
      stay: 'Not one route. {n} routes remain',
      covered: 'Duplicate or already covered',
      rec: {},
      err: {
        ipv4_address_invalid: 'Invalid IPv4 address',
        ipv6_address_invalid: 'Invalid IPv6 address',
        prefix_format_invalid: 'Write each prefix as address/length',
        prefix_length_invalid: 'Prefix length is outside this address family',
        prefix_type_invalid: 'Each prefix must be text',
        min_prefix_invalid: 'The shortest prefix must be an integer from 0 to 128',
        input_type_invalid: 'Invalid input',
        prefixes_type_invalid: 'The prefix list is invalid'
      }
    },
    es: {
      empty: 'No hay prefijos que resumir', invalid: 'Entrada no válida',
      one: 'Resumido en 1 ruta',
      stayOne: 'El resultado es 1 ruta',
      many: 'No queda una sola. Resumen en {n} rutas',
      stay: 'No queda una sola. Siguen {n} rutas',
      covered: 'Duplicado o ya cubierto',
      rec: {
        'Remove duplicate or already-covered prefixes before publishing a route summary.': 'Quite los prefijos duplicados o ya cubiertos antes de publicar el resumen.',
        'The listed prefixes can be advertised as a smaller set of aggregate routes.': 'Estos prefijos pueden anunciarse como un conjunto más pequeño de agregados.',
        'Verify the aggregate does not include unintended address space and confirm longer-prefix exceptions.': 'Compruebe que el agregado no cubre espacio no deseado y confirme las excepciones de prefijo más largo.'
      },
      err: {
        ipv4_address_invalid: 'Dirección IPv4 no válida',
        ipv6_address_invalid: 'Dirección IPv6 no válida',
        prefix_format_invalid: 'Escriba cada prefijo como dirección/longitud',
        prefix_length_invalid: 'La longitud queda fuera de esta familia',
        prefix_type_invalid: 'Cada prefijo debe ser texto',
        min_prefix_invalid: 'La longitud mínima debe ser un entero de 0 a 128',
        input_type_invalid: 'Entrada no válida',
        prefixes_type_invalid: 'La lista de prefijos no es válida'
      }
    },
    id: {
      empty: 'Tidak ada prefiks untuk diringkas', invalid: 'Masukan tidak valid',
      one: 'Diringkas menjadi 1 rute',
      stayOne: 'Hasilnya tetap 1 rute',
      many: 'Bukan satu rute. Diringkas menjadi {n} rute',
      stay: 'Bukan satu rute. Masih {n} rute',
      covered: 'Duplikat atau sudah tercakup',
      rec: {
        'Remove duplicate or already-covered prefixes before publishing a route summary.': 'Hapus prefiks yang duplikat atau sudah tercakup sebelum menayangkan ringkasan rute.',
        'The listed prefixes can be advertised as a smaller set of aggregate routes.': 'Prefiks ini dapat ditayangkan sebagai himpunan rute agregat yang lebih kecil.',
        'Verify the aggregate does not include unintended address space and confirm longer-prefix exceptions.': 'Pastikan agregat tidak mencakup ruang alamat yang tidak dimaksud, dan konfirmasi pengecualian prefiks yang lebih panjang.'
      },
      err: {
        ipv4_address_invalid: 'Alamat IPv4 tidak valid',
        ipv6_address_invalid: 'Alamat IPv6 tidak valid',
        prefix_format_invalid: 'Tulis setiap prefiks sebagai alamat/panjang',
        prefix_length_invalid: 'Panjang prefiks di luar keluarga alamat ini',
        prefix_type_invalid: 'Setiap prefiks harus berupa teks',
        min_prefix_invalid: 'Prefiks terpendek harus bilangan bulat dari 0 sampai 128',
        input_type_invalid: 'Masukan tidak valid',
        prefixes_type_invalid: 'Daftar prefiks tidak valid'
      }
    },
    pt: {
      empty: 'Não há prefixos para resumir', invalid: 'Entrada inválida',
      one: 'Resumido em 1 rota',
      stayOne: 'O resultado continua sendo 1 rota',
      many: 'Não ficou uma rota só. Resumo em {n} rotas',
      stay: 'Não ficou uma rota só. Continuam {n} rotas',
      covered: 'Duplicado ou já coberto',
      rec: {
        'Remove duplicate or already-covered prefixes before publishing a route summary.': 'Remova prefixos duplicados ou já cobertos antes de publicar o resumo de rotas.',
        'The listed prefixes can be advertised as a smaller set of aggregate routes.': 'Estes prefixos podem ser anunciados como um conjunto menor de rotas agregadas.',
        'Verify the aggregate does not include unintended address space and confirm longer-prefix exceptions.': 'Confirme que o agregado não cobre espaço de endereço indesejado e confirme as exceções de prefixo mais longo.'
      },
      err: {
        ipv4_address_invalid: 'Endereço IPv4 inválido',
        ipv6_address_invalid: 'Endereço IPv6 inválido',
        prefix_format_invalid: 'Escreva cada prefixo como endereço/comprimento',
        prefix_length_invalid: 'O comprimento fica fora desta família de endereços',
        prefix_type_invalid: 'Cada prefixo deve ser texto',
        min_prefix_invalid: 'O prefixo mais curto deve ser um inteiro de 0 a 128',
        input_type_invalid: 'Entrada inválida',
        prefixes_type_invalid: 'A lista de prefixos é inválida'
      }
    }
  }[locale];

  function textOf(code) {
    var m = /^prefix_(\d+)_(.+)$/.exec(code);
    if (m) return (locale === 'zh' ? '第 ' + m[1] + ' 行：' : locale === 'es' ? 'Línea ' + m[1] + ': ' : locale === 'id' ? 'Baris ' + m[1] + ': ' : locale === 'pt' ? 'Linha ' + m[1] + ': ' : 'Line ' + m[1] + ': ') + (copy.err[m[2]] || m[2]);
    return copy.err[code] || code;
  }

  function fill(sample) {
    document.getElementById('prefixes').value = sample;
    document.getElementById('minPrefix').value = '';
    run();
  }

  function run() {
    var lines = document.getElementById('prefixes').value.split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean);
    var rawMin = document.getElementById('minPrefix').value.trim();
    var options = {};
    if (rawMin !== '') options.minPrefixLength = Number(rawMin);
    var result = window.RouteSummarizationEngine.calculate({ prefixes: lines }, options);
    var count = result.summaries.length;
    var reduced = (result.reduction || 0) > 0;
    var status = copy.invalid;
    if (result.status === 'empty') status = copy.empty;
    else if (result.status === 'ready') {
      status = count === 1
        ? (reduced ? copy.one : copy.stayOne)
        : (reduced ? copy.many : copy.stay).replace('{n}', String(count));
    }
    document.getElementById('status').textContent = status;
    document.getElementById('sumCount').textContent = String(count);
    document.getElementById('reduction').textContent = String(result.reduction || 0);
    document.getElementById('summaryList').innerHTML = result.summaries.map(function (p) { return '<li>' + p + '</li>'; }).join('');
    document.getElementById('redundantList').innerHTML = result.redundant.map(function (p) { return '<li>' + p + '</li>'; }).join('');
    var notes = (result.recommendations || []).filter(function (p) {
      return reduced || p !== 'Verify the aggregate does not include unintended address space and confirm longer-prefix exceptions.';
    });
    document.getElementById('notes').innerHTML = notes.map(function (p) { return '<li>' + (copy.rec[p] || p) + '</li>'; }).join('');
    document.getElementById('notesTitle').hidden = notes.length === 0;
    document.getElementById('errors').textContent = (result.errors || []).map(textOf).join(' ');
  }

  document.getElementById('run').addEventListener('click', run);
  document.getElementById('sample').addEventListener('click', function () {
    fill('10.0.0.0/24\n10.0.1.0/24\n10.0.0.0/25');
  });
  var copyButton = document.getElementById('copy');
  if (copyButton) copyButton.addEventListener('click', function () {
    var lines = [];
    var status = document.getElementById('status');
    if (status && status.textContent.trim()) lines.push(status.textContent.trim());
    document.querySelectorAll('.metric').forEach(function (node) {
      var name = node.querySelector('span');
      var value = node.querySelector('b');
      if (name && value) lines.push(name.textContent.trim() + ': ' + value.textContent.trim());
    });
    ['summaryList', 'redundantList'].forEach(function (id) {
      var list = document.getElementById(id);
      if (!list) return;
      var items = Array.prototype.map.call(list.querySelectorAll('li'), function (item) { return item.textContent.trim(); }).filter(Boolean);
      if (items.length) lines.push(items.join(', '));
    });
    if (navigator.clipboard) navigator.clipboard.writeText(lines.join('\n'));
  });
  fill('10.0.0.0/24\n10.0.1.0/24\n10.0.0.0/25');
})();
