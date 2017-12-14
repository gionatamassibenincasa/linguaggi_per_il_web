// jshint esversion: 6
(function () {
  'use strict';

  /**
    * Prestare attenzione alla dislessia.
    *
    * Permetti la scelta del font con un sottoinsieme da http://dyslexiahelp.umich.edu/sites/default/files/good_fonts_for_dyslexia_study.pdf
    */
  // Aggiungi un event listener quando cambia la scelta del carattere
  document.getElementById("scelta-font").addEventListener("change", function() {
    var ff = document.getElementById("scelta-font").value;
    var odf = document.querySelector('#opendyslexic-fonts');
    if (ff == "opendyslexic") {
      odf && (odf.disabled = false);
    } else {
      odf && (odf.disabled = true);
    }

    var ss = document.styleSheets;
    if (ss.length === 0) {
        return;
    }
    var css = ss[0];
    var rules = css.cssRules;
    var ss = document.styleSheets;
    for (var j = 0; j < rules.length; j++) {
      if (rules[j].selectorText === '*') {
       rules[j].style["font-family"] = ff;
      }
    }
  });
  // Disabilita OpenDyslexic (default per link stylesheet)
  var odf = document.querySelector('#opendyslexic-fonts');
  odf && (odf.disabled = true);
  // Setta i font di default
  document.querySelector("#scelta-font") && (document.querySelector("#scelta-font").value = "");

  /**
   * Ripristino del codice sorgente, se salvato nel local storage
   */
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
   * Imposta il codice HTML per la visualizzazione dell'output
   */
  var visualizzaOutput = function (inputText) {
    document.getElementById('render').srcdoc = inputText;
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
   *
   * I dati del local storage devono essere caricati precedentemente in #editor
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

  var valuta = function (event) {
console.log(event);
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
  }
  /**
   * Sottomette la prova
   */
  var sottometti = function () {
    if (invio) {
      invio = false;
    } else {
      return;
    }
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

  document.getElementById('render').addEventListener('load', valuta);
  document.getElementById('invia').addEventListener('click', function () {
    valuta();
    invio = true;
    sottometti();
  });

  /** SPERIMENTALE **/
  var selPropValCSS = function (ss, selettore, proprieta, valore) {
    if (ss.length === 0) {
      return false;
    }
    var css = ss[0];
    var rules = css.cssRules;
    for (var j = 0; j < rules.length; j++) {
      if (rules[j].selectorText === selettore) {
        var ret = rules[j].style[proprieta];
        if (ret[0] === "\"") {
          ret = ret.substr(1, ret.length - 2);
        }
        console.log(rules[j].selectorText, "{" +
          proprieta + ": " + ret + "}");
        return ret === valore;
      }
    }
  };

  var selPropValHTML = function (d, selettore, valore, fn_modifica_testo) {
    // Caso base - stringa
    if (typeof valore === "string") {
      var e = d.querySelector(selettore);
      if (!e) return false;
    
      var valore_attuale = e.innerText.toLowerCase();
      if (fn_modifica_testo) {
        valore_attuale = fn_modifica_testo(valore_attuale);
      }
      var ret = valore_attuale === valore.toLowerCase();
      console.log(selettore + " : " + e.innerText + " // atteso: " + valore + " // test " + (ret?"PASSATO":"FALLITO"));
      return ret;
    }
    // Caso base - oggetto con proprieta dell'elemento DOM
    if (typeof valore === "object" && !Array.isArray(valore)) {
      for (const prop in valore) {
        if (!prop in e || e.prop.toLowerCase() != valore.prop.toLowerCase())
          return false;
        console.log(selettore + " : " + e[prop] + " // atteso: " + valore[prop] + " // test PASSATO");
      }
      return true;
    }
    // Caso ricorsivo - Array di selettori
    if (Array.isArray(selettore) && Array.isArray(valore) && selettore.length === valore.length) {
      for (var s = 0; s < selettore.length; s++) {
        if (!selPropValHTML(d, selettore[s], valore[s])) {
          return false;
        }
      }
      return true;
    }
  };

  var cercaRegExp = function (testo, regExp, estraiTesto) {
    if (estraiTesto) {
      testo = estraiTesto(testo);
    }
    if (regExp.test(testo)) {
      console.log(regExp + " : " + testo);
      return true;
    }
    return false;
  };

  var quesiti = [
    { // <!DOCTYPE html>
      descrBreve: "Tipo di documento",
      descrizione: "Dichiara il <strong>tipo di documento</strong> in modo che il browser lo riconosca come <code>HTML</code>.",
      punti: 1,
      fn_valutazione: function (d) {
        var unparsedText = document.querySelector("#render").getAttribute("srcdoc");
        cercaRegExp(unparsedText, /<!DOCTYPE\s+html>/, function (testo) {
         return testo.slice(0, testo.indexOf("\n"));
        })
      }
    },
    { // Titolo della pagina web
      descrBreve: "Titolo",
      descrizione: "Inserisci il <strong>titolo</strong>: <code>Verifica di <em>Nome Cognome</em></code>.",
      punti: 1,
      fn_valutazione: function (d) {
        return selPropValHTML(d, "html > head > title", "Verifica di ", function(str) { return str.slice(0, 12); });
      }
    },
    { // Annidare correttamente div p span
      descrBreve: "body div > p > span",
      descrizione: "Crea un elemento <code>div</code> con annidato un elemento <code>p</code> con annidato un element <code>span</code>. Il contenuto dell'ultimo elemento è <code>span dentro p dentro div</code>",
      punti: 3,
      fn_valutazione: function (d) {
        return selPropValHTML(d, "body div > p > span", "span dentro p dentro div");
      }
    },
    { // Creare una tabella con intestazione e almeno una riga con una cella
      descrBreve: "Tabella",
      descrizione: "Inserisci una <strong>tabella</strong> composta di un'<strong>intestazione</strong> e di un <strong>corpo</strong>; l'intestazione contiente una <strong>cella d'intestazione</strong> con testo <code>colonna 1</code>; il corpo contiene una <strong>cella</strong> con testo <code>dato 1</code>",
      punti: 3,
      fn_valutazione: function (d) {
        //console.log(new Error().stack);
        return selPropValHTML(d, ["table > thead > tr > th", "table > tbody > tr > td"], ['colonna 1', 'dato 1']);
      }
    }
  ];

  for (let j = 0; j < quesiti.length; j++) {
    let q = quesiti[j];
    let test = {
      shortText: q.descrBreve,
      text: q.descrizione,
      points: q.punti,
      passed: false,
      index: j,
      evaluate: function (d) {
       'use strict';
       var pass = q.fn_valutazione(d);
       return pass?q.punti:0;
      }
    };
    aggiungiTest(test);
  }

/*
  // 1 - Titolo
  creaTest('Titolo', 'Inserisci il <strong>titolo</strong>: <code>Verifica di <em>Nome</em> ' + '<em>Cognome</em></code>.', 1, function (d) {
    if (d.title)
      console.log(d.title);
    return d.title.substr(0, 12).toLowerCase();
  }, 'verifica di ');
*/
  // 2 - Charset
  creaTest('charset', 'Dichiara la <strong>codifica dei caratteri</strong>: <code>utf-8</code>.', 1, function (d) {
    var metas = d.getElementsByTagName('meta');
    for (var j = 0; j < metas.length; j++) {
      var attributes = metas[j].attributes;
      for (var i = 0; i < attributes.length; i++) {
        if (attributes[i].name == 'charset') {
          console.log(attributes[i].nodeValue);
          return attributes[i].nodeValue.toUpperCase();
        }
      }
    }
    return 'errore';
  }, 'UTF-8');
  // 3 - Intestazioni
  creaTest('Intestazione livello 1', 'Inserisci nel corpo della pagina un\'<strong>intestazione di livello 1</strong> dal con contenuto <code>Intestazione di primo livello</code>', 1, function (d) {
    if (d.body.getElementsByTagName("h1").length) {
      console.log(d.body.getElementsByTagName("h1")[0].innerText.toLowerCase());
      return d.body.getElementsByTagName("h1")[0].innerText.toLowerCase();
    }
    return '';
  }, 'intestazione di primo livello');
  creaTest('Intestazione livello 2', 'Inserisci nel corpo della pagina un\'<strong>intestazione di livello 2</strong> dal con contenuto <code>Intestazione di secondo livello</code>', 1, function (d) {
    if (d.body.getElementsByTagName("h2").length) {
      console.log(d.body.getElementsByTagName("h2")[0].innerText.toLowerCase());
      return d.body.getElementsByTagName("h2")[0].innerText.toLowerCase();
    }
    return '';
  }, 'intestazione di secondo livello');
  creaTest('Intestazione livello 3', 'Inserisci nel corpo della pagina un\'<strong>intestazione di livello 3</strong> dal con contenuto <code>Intestazione di terzo livello</code>', 1, function (d) {
    if (d.body.getElementsByTagName("h3").length) {
      console.log(d.body.getElementsByTagName("h3")[0].innerText.toLowerCase());
      return d.body.getElementsByTagName("h3")[0].innerText.toLowerCase();
    }
    return '';
  }, 'intestazione di terzo livello');

  // 4 - Capoverso con id "capoverso_1"
  creaTest('Capoverso #capoverso_1', 'Inserisci nel corpo della pagina un  <strong>capoverso</strong> con id <code>capoverso_1</code>', 1, function (d) {
    if (d.getElementById("capoverso_1")) {
      console.log(d.getElementById("capoverso_1").tagName);
      return d.getElementById("capoverso_1").tagName.toLowerCase();
    }
    return '';
  }, 'p');

  // 5 - Elenchi
  creaTest('Elenco non ordinato', 'Inserisci un  <strong>elenco non ordinato</strong> con primo <strong>elemento</strong> <code>Cerchio</code>', 1, function (d) {
    if (!d.body.getElementsByTagName("ul").length) {
      return '';
    }
    var elenco = d.body.getElementsByTagName("ul")[0];
    if (!elenco.getElementsByTagName("li").length) {
      return '';
    }
    console.log(elenco.getElementsByTagName("li")[0].innerText.toLowerCase());
    return elenco.getElementsByTagName("li")[0].innerText.toLowerCase();
  }, 'cerchio');
  creaTest('Elenco ordinato', 'Inserisci un <strong>elenco ordinato</strong> con <em>secondo<em> <strong>elemento</strong> <code>due</code>', 1, function (d) {
    if (!d.body.getElementsByTagName("ol").length) {
      return '';
    }
    var elenco = d.body.getElementsByTagName("ol")[0];
    if (elenco.getElementsByTagName("li").length < 2) {
      return '';
    }
    console.log(elenco.getElementsByTagName("li")[1].innerText.toLowerCase());
    return elenco.getElementsByTagName("li")[1].innerText.toLowerCase();
  }, 'due');
  creaTest('Elenco descrittivo', 'Inserisci un <strong>elenco descrittivo</strong> ' + 'che descrive il <strong>termine</strong> <code>termine</code> ' + 'descritto dalla <strong>descrizione</strong> <code>descrizione</code>', 1, function (d) {
    var ret = {};
    if (!d.body.getElementsByTagName("dl").length) {
      return ret;
    }
    var elenco = d.body.getElementsByTagName("dl")[0];
    if (elenco.getElementsByTagName("dt").length === 0) {
      return ret;
    }
    ret.t = elenco.getElementsByTagName("dt")[0].innerText.toLowerCase();
    if (elenco.getElementsByTagName("dd").length === 0) {
      return ret;
    }
    ret.d = elenco.getElementsByTagName("dd")[0].innerText.toLowerCase();
    console.log("Elenco descrittivo", ret);
    return ret;
  }, {
    t: 'termine',
    d: 'descrizione'
  });
  // Neretto
  creaTest('Neretto', 'Inserisci in capoverso un elemento <strong>strong</strong> con la parola <code>neretto</code>', 1, function (d) {
    if (d.body.getElementsByTagName("strong").length === 0) {
      return '';
    }
    var ret = d.body.getElementsByTagName("strong")[0].innerText.toLowerCase();
    console.log(ret);
    return ret;
  }, 'neretto');
  // Corsivo
  creaTest('Corsivo', 'Inserisci in un capoverso un elemento <strong>em</strong> con la parola <code>corsivo</code>', 1, function (d) {
    if (d.body.getElementsByTagName("em").length === 0) {
      return '';
    }
    var ret = d.body.getElementsByTagName("em")[0].innerText.toLowerCase();
    console.log(ret);
    return ret;
  }, 'corsivo');
  // Corsivo
  creaTest('Spaziatura fissa', 'Inserisci in un capoverso un elemento <strong>code</strong> con il testo <code>a spaziatura fissa</code>', 1, function (d) {
    if (d.body.getElementsByTagName("code").length === 0) {
      return '';
    }
    var ret = d.body.getElementsByTagName("code")[0].innerText.toLowerCase();
    console.log(ret);
    return ret;
  }, 'a spaziatura fissa');
  // A capo
  creaTest('A capo', 'Inserisci in un capoverso del testo su due o più righe usando il tag per <strong>andare a capo</strong>', 1, function (d) {
    if (d.body.getElementsByTagName("br").length > 0) {
      console.log("a capo");
      return true;
    }
    return false;
  }, true);
  // Collegamento
  creaTest('Collegamento', 'Inserisci un <stong>collegamento</strong> il cui indirizzo sia <code>http://www.gnu.org/</code> e il cui testo sia <code>progetto GNU</code>', 1, function (d) {
    var ret = {};
    if (d.body.getElementsByTagName("a").length === 0) {
      return ret;
    }
    var collegamento = d.body.getElementsByTagName("a")[0];
    ret.href = collegamento.href;
    ret.innerText = collegamento.innerText.toLowerCase();
    console.log("Collegamento: ", ret);
    return ret;
  }, {
    href: 'http://www.gnu.org/',
    innerText: 'progetto gnu'
  });
  // Immagine
  creaTest('Immagine', 'Inserisci un\'<strong>immagine</strong> il cui <em>indirizzo</em> sia <code>http://www.gnu.org/graphics/gnu-head.jpg</code> e il <em>testo alternativo</em> sia <code>la testa di uno gnu</code>', 1, function (d) {
    var ret = {};
    var tag = "img";
    var attrs = ["src", "alt"];
    if (d.body.getElementsByTagName(tag).length === 0) {
      return ret;
    }
    var elem = d.body.getElementsByTagName(tag)[0];
    for (var j = 0; j < attrs.length; j++) {
      ret[attrs[j]] = elem[attrs[j]];
    }
    console.log("Immagine: ", ret);
    return ret;
  }, {
    src: 'http://www.gnu.org/graphics/gnu-head.jpg',
    alt: 'la testa di uno gnu'
  });
  // Tabella
  creaTest('Tabella', 'Inserisci una <strong>tabella</strong> composta di un\'' + '<strong>intestazione</strong> e di un <strong>corpo</strong>; ' + 'l\'intestazione contiente una <strong>cella d\'intestazione</strong> con ' + 'testo <code>colonna 1</code>; il corpo contiene una <strong>cella</strong> ' + 'con testo <code>dato 1</code>', 1, function (d) {
    var ret = {};
    if (d.querySelector("table thead th")) {
      ret["th"] = d.querySelector("table thead th").innerText.toLowerCase();
      if (d.querySelector("table tbody td")) {
        ret["td"] = d.querySelector("table tbody td").innerText.toLowerCase();
        console.log("Tabella: ", ret);
      }
    }
    return ret;
  }, {
    th: 'colonna 1',
    td: 'dato 1'
  });

  codemirror.refresh();
  codemirror.save();
  aggiorna(codemirror);

})();
