// jshint esversion: 6
(function () {
  'use strict';
  document.getElementById("editor").innerHTML =
    localStorage[window.location.href.split('#')[0]] || "";

  /**
   * Il salvataggio del codice sorgente
   */
  var localSave = function (editor) {
    // Salva il sorgente nel browser, per eventuali ripristini
    localStorage[window.location.href.split("#")[0]] = editor.getValue();
  };
  /**
   *  Callback per salvare le modifiche del codice sorgente ad ogni modifica
   */
  var addPersistence = function (editor) {
    var address = window.location.href.split('#')[0];
    var persisted = localStorage[address] || editor.getValue();
    editor.setValue(persisted);
    editor.on('change', localSave);
  };
  /**
   * Aggiorna la visualizzazione dell'output
   */
  var visualizzaOutput = function (inputText) {
    var d = document.getElementById('render').contentDocument;
    var styleElem = d.querySelector('style');
    if (!styleElem) {
      console.log("ERRORE");
      return;
    }
    styleElem.textContent = inputText;
    onrenderupdate();
  };
  /**
   * Aggiorna la visualizzazione dell'output
   */
  var aggiorna = function (editor) {
    // Aggiorna il codice sorgente
    visualizzaOutput(editor.getValue());
  };
  /**
   * Callback per l'aggiornamento dell'output ad ogni modifica del file sorgente
   */
  var addPreview = function (editor) {
    //editor.setValue(preview);
    editor.on('change', aggiorna);
  };
  /**
   * Modalità e opzioni di CodeMirror
   */
  var mixedMode = {
    name: 'htmlmixed',
    tags: {
      style: [
        ['type', /^text\/(x-)?scss$/, 'text/x-scss'],
        [null, null, 'css']
      ]
    }
  };
  /**
   * Istanziazione dell'editor
   */
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
    stylesheet: ['css/xmlcolors.css', 'css/jscolors.css', 'css/csscolors.css'],
    autoCloseTags: true
  });
  /**
   * Aggiunta delle callback all'editor
   */
  addPersistence(codemirror);
  addPreview(codemirror);
  /**
   * Variabili globali
   */
  var tests = [];
  var modello = {};
  var punteggio = {};
  var invio = false;
  /**
   * Aggiunge la visualizzazione di una specifica di test.
   * Il test ha una specifica come voce d'elenco,
   * una riga di visualizzazione del risultato,
   */
  var aggiungiTest = function (test) {
    // Aggiorna la variabile globale tests
    tests.push(test);
    // Aggiorna la visualizzazione delle specifiche
    var aggiungiSpecifica = function (elenco) {
      // crea la voce d'elenco come specifica
      var item = document.createElement('li');
      item.innerHTML = test.text;
      elenco.appendChild(item);
    };
    // Aggiorna la tabella con la valutazione
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
  };
  // Aggiorna la tabella di valutazione dopo una modifica
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
  };
  /**
   * Genera la funzione di valutazione per la specifica
   */
  var creaFunzioneValutazione = function (lhs, rhs, points) {
    return function (d) {
      var l, r;
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
  };
  /**
   * Aggiunge una specifica
   */
  var creaTest = function (shortText, text, points, assertionLhs, assertionRhs) {
    var test = {
      shortText: shortText,
      text: text,
      points: points,
      passed: false
    };
    test.evaluate = creaFunzioneValutazione(assertionLhs, assertionRhs, points);
    aggiungiTest(test);
  };
  /**
   * Sottomette la prova
   */
  var sottometti = function () {
    var inLocale = false;
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.hostname === "") {
      inLocale = true;
    }
    if (!inLocale && (document.getElementById("nome").value === "" || document.getElementById("cognome").value === "")) {
      alert("Inserisci il nome e il cognome!");
      return;
    }
    var content = codemirror.doc.getValue();
    if (content === "") {
      alert("Aggiungere del testo");
      return 0;
    }
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
    if (inLocale) {
      document.getElementById('form').action = 'http://localhost:8080';
    } else {
      document.getElementById('form').action = 'https://script.google.com/a/savoiabenincasa.it/macros/s/AKfycbwCadXpofT_08X9n0O-CXqLvm08EvZ9M0BcbplgwQjimBYAwVn1/exec';
    }
    document.getElementById('form').submit();
  };

  // 1 - Selettore universale e font
  creaTest('Font per tutti', '<strong>Tutti i tag</strong> presentano il contenuto con il font della famiglia: <code>Garamond</code>.', 1, function (d) {
      var ret = "";
      if (!d.styleSheets.length) {
        return ret;
      }
      var ss = d.styleSheets[0];
      var rules = ss.cssRules;
      for (var j = 0; j < rules.length; j++) {
        if (rules[j].selectorText === "*") {
          console.log(rules[j]);
          ret = rules[j].style.fontFamily;
          return ret;
        }
      }
      return ret;
    },
    "Garamond");
  // 2 - p colore blue
  creaTest('Capoversi colore blue', 'Tutti i <strong>capoversi</strong> devono avere colore <code>blue</code>.', 1, function (d) {
      var ret = "";
      if (!d.styleSheets.length) {
        return ret;
      }
      var ss = d.styleSheets[0];
      var rules = ss.cssRules;
      for (var j = 0; j < rules.length; j++) {
        if (rules[j].selectorText === "p") {
          console.log(rules[j]);
          ret = rules[j].style.color;
          return ret;
        }
      }
      return ret;
    },
    "blue"
  );
  // 3 - p colore di sfondo grey
  creaTest('Capoversi con sfondo grey', 'Tutti i <strong>capoversi</strong> devono avere colore di sfondo <code>grey</code>.', 1, function (d) {
      var ret = "";
      if (!d.styleSheets.length) {
        return ret;
      }
      var ss = d.styleSheets[0];
      var rules = ss.cssRules;
      for (var j = 0; j < rules.length; j++) {
        if (rules[j].selectorText === "p") {
          console.log(rules[j]);
          ret = rules[j].style.backgroundColor;
          return ret;
        }
      }
      return ret;
    },
    "grey"
  );

  document.getElementById('fonts').disabled = true;
  document.getElementById('cambiafont').onclick = function () {
    var sheet = document.getElementById('fonts');
    if (sheet.disabled) {
      sheet.disabled = false;
    } else {
      sheet.disabled = true;
    }
  };

  function onrenderupdate() {
    modello = document.getElementById('render').contentDocument;
    var punti = 0,
      puntiTotali = 0,
      j, parziale, statusId, pointsId;
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
    //console.log(punteggio);
    aggiornaTabellaConSomma(punteggio.punti, punteggio.scala);
    if (invio) {
      invio = false;
      sottometti();
    }
  }
  document.getElementById('render').addEventListener('load', onrenderupdate);
  document.getElementById('invia').addEventListener('click', function () {
    invio = true;
    sottometti();
  });
  codemirror.refresh();
  codemirror.save();
  aggiorna(codemirror);
  /**
   * L'elemento che mostra l'output
   */
  var preview = document.getElementById('render');
  preview.srcdoc = document.getElementById('code').childNodes[0].data;
})();