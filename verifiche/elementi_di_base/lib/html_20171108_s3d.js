(function () {
  'use strict';
  var preview = document.getElementById('render');
  var inputText = document.getElementById('editor').value;
  var visualizzaOutput = function () {
    preview.srcdoc = inputText;
    //styleElem.textContent = cssInput.value;
  };
  var onChange = function (editor) {
    inputText = editor.getValue();
    localStorage[window.location.href.split('#') [0]] = inputText;
    visualizzaOutput();
  };
  var addPersistence = function (editor) {
    var address = window.location.href.split('#') [0];
    var persisted = localStorage[address] || editor.getValue();
    editor.setValue(persisted);
    editor.on('change', onChange);
  };
  var mixedMode = {
    name: 'htmlmixed',
    tags: {
      style: [
        ['type',
        /^text\/(x-)?scss$/,
        'text/x-scss'],
        [
          null,
          null,
          'css'
        ]
      ]
    }
  };
  var codemirror = CodeMirror.fromTextArea(document.getElementById('editor'), {
    //value: "\n",
    mode: mixedMode,
    lineNumbers: true,
    lineWrapping: true,
    viewportMargin: Infinity,
    extraKeys: {
      'Ctrl-Space': 'autocomplete'
    },
    //parserfile: ["parsexml.js", "parsecss.js", "tokenizejavascript.js", "parsejavascript.js", "parsehtmlmixed.js"],
    stylesheet: [
      'css/xmlcolors.css',
      'css/jscolors.css',
      'css/csscolors.css'
    ],
    autoCloseTags: true
  });
  addPersistence(codemirror);
  var tests = [
  ];
  var modello = {
  };
  var punteggio = {
  };
  var invio = false;
  var converti = function () {
    console.log('\n\nCONVERTI\n\n');
    var inLocale = false;
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname === '')
    inLocale = true;
    if (!inLocale && (document.getElementById('nome').value === '' || document.getElementById('cognome').value === '')) {
      alert('Inserisci il nome e il cognome!');
      return;
    }
    var content = codemirror.doc.getValue();
    if (content === '') {
      alert('Aggiungere del testo');
      return 0;
    }
  };
  var aggiungiTest = function (test) {
    tests.push(test);
    var aggiungiSpecifica = function (elenco) {
      // crea la voce d'elenco come specifica
      var item = document.createElement('li');
      item.innerHTML = test.text;
      elenco.appendChild(item);
    };
    var aggiungiRigaTabellaValutazione = function (tabella) {
      // crea la nuova riga tabella
      var tr = document.createElement('tr');
      // Id della riga
      var tdId = document.createElement('td');
      tdId.innerHTML = tests.length;
      tr.append(tdId);
      // Descrizione breve
      var tdDesc = document.createElement('td');
      tdDesc.innerHTML = test.shortText;
      tr.append(tdDesc);
      // Status - inizialmente fail
      var tdStatus = document.createElement('td');
      tdStatus.innerHTML = 'FAIL';
      tdStatus.setAttribute('id', ('status-row-' + tests.length));
      tdStatus.setAttribute('class', 'fail');
      tr.append(tdStatus);
      // Punti conseguiti
      var tdPoints = document.createElement('td');
      tdPoints.innerHTML = 0;
      tdPoints.setAttribute('id', ('points-row-' + tests.length));
      tr.append(tdPoints);
      // Punti previsti per l'esercizio
      var tdMaxPoint = document.createElement('td');
      tdMaxPoint.innerHTML = test.points;
      tr.append(tdMaxPoint);
      // Aggiunge la riga
      tabella.append(tr);
    };
    aggiungiSpecifica(document.getElementById('tests-descr'));
    aggiungiRigaTabellaValutazione(document.getElementById('points'));
  }
  var aggiornaTabellaConSomma = function (punti, puntiTotali) {
    var tdPoints = document.getElementById('points-result');
    var tdMaxPoint = document.getElementById('total-points');
    var daAggiungere = false;
    if (!tdPoints) {
      daAggiungere = true;
      tdPoints = document.createElement('td');
      tdPoints.setAttribute('id', 'points-result');
      tdMaxPoint = document.createElement('td');
      tdMaxPoint.setAttribute('id', 'total-points');
    }
    tdPoints.innerHTML = punti;
    tdMaxPoint.innerHTML = puntiTotali;
    if (daAggiungere) {
      var tfoot = document.createElement('tfoot');
      var tr = document.createElement('tr');
      tr.append(document.createElement('td'));
      tr.append(document.createElement('td').appendChild(document.createTextNode('Punteggio')));
      tr.append(document.createElement('td'));
      tr.append(tdPoints);
      tr.append(tdMaxPoint);
      tfoot.append(tr);
      var table = document.getElementById('tab_test');
      table.append(tfoot);
    }
  }
  var cercaPrimoBloccoPerTipo = function (doc, context) {
    if (doc.context == context) {
      return doc;
    }
    var trovato = false;
    var j;
    for (j = 0; !trovato && j < doc.blocks.length; j += 1) {
      trovato = trovato || cercaPrimoBloccoPerTipo(doc.blocks[j], context);
    }
    return trovato;
  };
  var creaFunzioneValutazione = function (lhs, rhs, points) {
    return function (d) {
      var l,
      r;
      if (typeof lhs === 'function') {
        l = lhs(d);
      } else {
        l = lhs;
      }
      if (typeof rhs === 'function') {
        rhs = rhs(d);
      } else {
        r = rhs;
      }
      if (typeof l === 'object') {
        if (JSON.stringify(l) === JSON.stringify(r)) {
          return points;
        } else {
          // console.log(JSON.stringify(l), JSON.stringify(r));
          return 0;
        }
      }
      if (l === r) {
        return points;
      }
      return 0;
    };
  }
  var creaTest = function (shortText, text, points, assertionLhs, assertionRhs) {
    var test = {
      shortText: shortText,
      text: text,
      points: points,
      passed: false
    };
    test.evaluate = creaFunzioneValutazione(assertionLhs, assertionRhs, points);
    aggiungiTest(test);
  }
  var invia = function () {
    //var risultato = converti_e_valuta();
    var prova = {
      classe: document.getElementById('classe').value,
      nome: document.getElementById('nome').value,
      cognome: document.getElementById('cognome').value,
      quesiti: tests,
      punteggio: punteggio,
      artefatto: codemirror.doc.getValue()
    };
    var json = JSON.stringify(prova);
    document.getElementById('json').value = json;
    document.getElementById('punti').value = 10 * punteggio.punti / punteggio.scala;
    //console.log(JSON.stringify(prova, null, 4));
    document.getElementById('form').action = 'https://script.google.com/a/savoiabenincasa.it/macros/s/AKfycbwCadXpofT_08X9n0O-CXqLvm08EvZ9M0BcbplgwQjimBYAwVn1/exec';
    document.getElementById('form').submit();
  }
  var mostraValutazione = function () {
    var dom = document.getElementById('render');
    var punteggio = {
    };
    console.log(dom.title);
    var punti = 0,
    puntiTotali = 0,
    j,
    parziale,
    statusId,
    pointsId;
    for (j = 0; j < tests.length; j += 1) {
      puntiTotali += tests[j].points;
      parziale = tests[j].evaluate(dom);
      statusId = 'status-row-' + (j + 1);
      pointsId = 'points-row-' + (j + 1);
      if (parziale !== 0) {
        punti += parziale;
        document.getElementById(statusId).textContent = 'PASS';
        document.getElementById(statusId).setAttribute('class', 'pass');
        document.getElementById(pointsId).textContent = parziale;
        tests[j].passed = true;
      } else {
        document.getElementById(statusId).textContent = 'FAIL';
        document.getElementById(statusId).setAttribute('class', 'fail');
        document.getElementById(pointsId).textContent = 0;
        tests[j].passed = false;
      }
    }
    punteggio = {
      punti: punti,
      scala: puntiTotali
    };
    aggiornaTabellaConSomma(punteggio.punti, punteggio.scala);
  };
  var modificaSorgenteIframe = function () {
    var inLocale = false;
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname === '')
    inLocale = true;
    if (!inLocale && (document.getElementById('nome').value === '' || document.getElementById('cognome').value === '')) {
      alert('Inserisci il nome e il cognome!');
      return;
    }
    var preview = document.getElementById('render');
    var content = codemirror.doc.getValue();
    if (content === '') {
      alert('Aggiungere del testo');
      return;
    }
    preview.srcdoc = content;
    // Quando l'iframe è pronto deve essere richiamata la valutazione
  };
  // 1 - Titolo
  creaTest('Titolo', 'Inserisci il titolo: <code>Verifica di <em>Nome</em> ' +
  '<em>Cognome</em>.', 3, function (d) {
    //console.log(d);
    //var titolo = d.getElementsByTagName("title")[0];
    //console.log(titolo);
    return 'prova di ';
  }, 'prova di ');
  // 4 - Paragrafi e sotto paragrafi
  creaTest('Paragrafo', 'Inserisci un paragrafo dal titolo <code>Paragrafo</code>', 1, function (doms) {
    return '';
  }, 'paragrafo');
  creaTest('Sotto-Paragrafo', 'Inserisci un sotto-paragrafo dal titolo <code>Sotto-paragrafo</code>', 1, function (doms) {
    return '';
  }, 'sotto-paragrafo');
  creaTest('Sotto-Sotto-Paragrafo', 'Inserisci un sotto-sotto-paragrafo dal titolo <code>Sotto-sotto-paragrafo</code>', 1, function (doms) {
    return '';
  }, 'sotto-sotto-paragrafo');
  // 5 - Elenchi
  creaTest('Elenco non ordinato', 'Inserisci un elenco non ordinato con primo elemento <code>Primo</code>', 1, function (doms) {
    return '';
  }, 'primo');
  creaTest('Elenco ordinato', 'Inserisci un elenco ordinato con secondo elemento <code>due</code>. Inseriscilo in una nuova sezione', 1, function (doms) {
    return '';
  }, 'due');
  creaTest('Elenco descrittivo', 'Inserisci un elenco descrittivo con il termine <code>termine</code> e descrizione <code>descrizione</code>. Inseriscilo in una nuova sezione', 1, function (doms) {
    return {
    };
  }, {
    t: 'termine',
    d: 'descrizione'
  });
  // Neretto
  creaTest('Neretto', 'Inserisci un capoverso con la parola <code>neretto</code> in neretto', 1, function (doms) {
    return '';
  }, 'neretto');
  // Corsivo
  creaTest('Corsivo', 'Inserisci un capoverso con la parola <code>corsivo</code> in corsivo', 1, function (doms) {
    return '';
  }, 'corsivo');
  // A capo
  creaTest('A capo', 'Inserisci un capoverso che va a capo', 1, function (doms) {
    /*
      var d = doms.html_dom;
      // Cerca nel DOM HTML
      var testo = d.getElementsByTagName("br");
      if (!testo || testo.length < 1) {
        return false;
      }
	  */
    return false;
  }, true);
  // Collegamento
  creaTest('Collegamento', 'Inserisci un collegamento il cui indirizzo sia <code>http://www.gnu.org/</code> e il cui testo visualizzato sia <code>progetto GNU</code>', 1, function (doms) {
    /*
      var d = doms.html_dom;
      var collegamento = d.getElementsByTagName("a")[0];
      if (!collegamento) {
        return {};
      }
      return {
        href: collegamento.href,
        innerText: collegamento.innerText.toLowerCase()
      };
	  */
    return {
    };
  }, {
    href: 'http://www.gnu.org/',
    innerText: 'progetto gnu'
  });
  // Immagine
  creaTest('Immagine', 'Inserisci un\'immagine il cui indirizzo sia <code>http://www.gnu.org/graphics/gnu-head.jpg<code>', 1, function (doms) {
    /*
      var d = doms.html_dom;
      var img = d.getElementsByTagName("img")[0];
      if (!img) {
        return "";
      }
      return img.src;
	  */
    return '';
  }, 'http://www.gnu.org/graphics/gnu-head.jpg');
  // Tabella
  creaTest('Tabella', 'Inserisci una tabella; sei libero di scegliere il contenuto', 1, function (doms) {
    /*
      var d = doms.html_dom;
      var tabella = d.getElementsByTagName("table")[0];
      if (!tabella) {
        return false;
      }
      return true;
	  */
  }, true);
  document.getElementById('fonts').disabled = true;
  document.getElementById('cambiafont').onclick = function () {
    var sheet = document.getElementById('fonts');
    if (sheet.disabled) {
      sheet.disabled = false;
    } else {
      sheet.disabled = true;
    }
  };
  document.getElementById('converti_e_valuta').addEventListener('click', converti);
  document.getElementById('render').addEventListener('load', function () {
    console.log('\n\nVALUTA\n\n');
    modello.body = document.getElementById('render').contentDocument.body;
    console.log(modello);
    var punti = 0,
    puntiTotali = 0,
    j,
    parziale,
    statusId,
    pointsId;
    for (j = 0; j < tests.length; j += 1) {
      puntiTotali += tests[j].points;
      parziale = tests[j].evaluate(modello);
      statusId = 'status-row-' + (j + 1);
      pointsId = 'points-row-' + (j + 1);
      if (parziale !== 0) {
        punti += parziale;
        document.getElementById(statusId).textContent = 'PASS';
        document.getElementById(statusId).setAttribute('class', 'pass');
        document.getElementById(pointsId).textContent = parziale;
        tests[j].passed = true;
      } else {
        document.getElementById(statusId).textContent = 'FAIL';
        document.getElementById(statusId).setAttribute('class', 'fail');
        document.getElementById(pointsId).textContent = 0;
        tests[j].passed = false;
      }
    }
    punteggio.punti = punti;
    punteggio.scala = puntiTotali;
    console.log(punteggio);
    aggiornaTabellaConSomma(punteggio.punti, punteggio.scala);
    if (invio) {
      invio = false;
      invia();
    }
  });
  document.getElementById('invia').addEventListener('click', function () {
    invio = true;
    converti();
  });
}) ();
