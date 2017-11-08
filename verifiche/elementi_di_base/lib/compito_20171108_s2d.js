(function () {
  'use strict';

  var onChange = function (editor) {
    localStorage[window.location.href.split("#")[0]] = editor.getValue();
  };

  var addPersistence = function (editor) {
    var address = window.location.href.split("#")[0];
    var persisted = localStorage[address] || editor.getValue();
    editor.setValue(persisted);
    editor.on("change", onChange);
  }

  var codemirror = CodeMirror.fromTextArea(document.getElementById(
    "editor"), {
    value: "\n",
    mode: "asciidoc",
    lineNumbers: true,
    lineWrapping: true,
    viewportMargin: Infinity
  });

  addPersistence(codemirror);

  var tests = [];

  var aggiungiTest = function (test) {
    tests.push(test);

    var aggiungiSpecifica = function (elenco) {
      // crea la voce d'elenco come specifica
      var item = document.createElement("li");
      item.innerHTML = test.text;
      elenco.appendChild(item);
    };

    var aggiungiRigaTabellaValutazione = function (tabella) {
      // crea la nuova riga tabella
      var tr = document.createElement("tr");

      // Id della riga
      var tdId = document.createElement("td");
      tdId.innerHTML = tests.length;
      tr.append(tdId);

      // Descrizione breve
      var tdDesc = document.createElement("td");
      tdDesc.innerHTML = test.shortText;
      tr.append(tdDesc);

      // Status - inizialmente fail
      var tdStatus = document.createElement("td");
      tdStatus.innerHTML = "FAIL";
      tdStatus.setAttribute("id", ("status-row-" + tests.length));
      tdStatus.setAttribute("class", "fail");
      tr.append(tdStatus);

      // Punti conseguiti
      var tdPoints = document.createElement("td");
      tdPoints.innerHTML = 0;
      tdPoints.setAttribute("id", ("points-row-" + tests.length));
      tr.append(tdPoints);

      // Punti previsti per l'esercizio
      var tdMaxPoint = document.createElement("td");
      tdMaxPoint.innerHTML = test.points;
      tr.append(tdMaxPoint);

      // Aggiunge la riga
      tabella.append(tr);
    };

    aggiungiSpecifica(document.getElementById("tests-descr"));
    aggiungiRigaTabellaValutazione(document.getElementById("points"));
  }

  var aggiornaTabellaConSomma = function (punti, puntiTotali) {
    var tdPoints = document.getElementById("points-result");
    var tdMaxPoint = document.getElementById("total-points");
    var daAggiungere = false;
    if (!tdPoints) {
      daAggiungere = true;
      tdPoints = document.createElement("td");
      tdPoints.setAttribute("id", "points-result");
      tdMaxPoint = document.createElement("td");
      tdMaxPoint.setAttribute("id", "total-points");
    }
    tdPoints.innerHTML = punti;
    tdMaxPoint.innerHTML = puntiTotali;
    if (daAggiungere) {
      var tr = document.createElement("tr");
      tr.append(document.createElement("td"));
      tr.append(
        document.createElement("td")
        .appendChild(
          document.createTextNode("Punteggio")));
      tr.append(document.createElement("td"));
      tr.append(tdPoints);
      tr.append(tdMaxPoint);
      var table = document.getElementById("points");
      table.append(tr);
    }
  }

  var cercaPrimoBloccoPerTipo = function (doc, context) {
    if (doc.context == context) {
      return doc;
    }
    var trovato = false;
    var j;
    for (j = 0; !trovato && j < doc.blocks.length; j += 1) {
      trovato = trovato || cercaPrimoBloccoPerTipo(doc.blocks[j],
        context);
    }

    return trovato;
  };

  var creaFunzioneValutazione = function (lhs, rhs, points) {
    return function (d) {
      var l, r;
      if (typeof lhs === "function") {
        l = lhs(d);
      } else {
        l = lhs;
      }
      if (typeof rhs === "function") {
        rhs = rhs(d);
      } else {
        r = rhs;
      }
      if (typeof l === "object") {
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

  var creaTest = function (shortText, text, points, assertionLhs,
    assertionRhs) {
    var test = {
      shortText: shortText,
      text: text,
      points: points,
      passed: false
    };
    test.evaluate = creaFunzioneValutazione(assertionLhs,
      assertionRhs,
      points);
    aggiungiTest(test);
  }

  var converti_e_valuta = function () {
    var inLocale = false;
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.hostname === "")
      inLocale = true;
    if (!inLocale && (document.getElementById("nome").value === "" ||
        document.getElementById("cognome").value === "")) {
      alert("Inserisci il nome e il cognome!");
      return;
    }
    var content = codemirror.doc.getValue();
    if (content === "") {
      alert("Aggiungere del testo");
      return 0;
    }
    var converti = function () {
      var asciidoctor = Asciidoctor();
      var html2dom = function (html) {
        var template = document.createElement('template');
        template.innerHTML = html;
        return template.content.firstChild;
      };


      var doc = asciidoctor.load(content);
      var html_doc = doc.convert(content);
      var div = document.getElementById("render");
      div.innerHTML = html_doc;
      return {
        asciidoc_dom: doc,
        html_dom: div
      };
    };
    var valuta = function (doms) {
      var punti = 0,
        puntiTotali = 0,
        j, parziale, statusId, pointsId;
      for (j = 0; j < tests.length; j += 1) {
        puntiTotali += tests[j].points;
        parziale = tests[j].evaluate(doms);
        statusId = "status-row-" + (j + 1);
        pointsId = "points-row-" + (j + 1);
        if (parziale !== 0) {
          punti += parziale;
          document.getElementById(statusId).textContent = "PASS";
          document.getElementById(statusId).setAttribute("class", "pass");
          document.getElementById(pointsId).textContent = parziale;
          tests[j].passed = true;
        } else {
          document.getElementById(statusId).textContent = "FAIL";
          document.getElementById(statusId).setAttribute("class", "fail");
          document.getElementById(pointsId).textContent = 0;
          tests[j].passed = false;
        }
      }
      return {
        punti: punti,
        scala: puntiTotali
      };
    };
    var doms = converti();
    var punteggio = valuta(doms);
    aggiornaTabellaConSomma(punteggio.punti, punteggio.scala);
    return {
      tests: tests,
      punteggio: punteggio,
    };
  }

  var invia = function () {
    var risultato = converti_e_valuta();
    var prova = {
      classe: document.getElementById("classe").value,
      nome: document.getElementById("nome").value,
      cognome: document.getElementById("cognome").value,
      quesiti: risultato.tests,
      punteggio: risultato.punteggio,
      artefatto: codemirror.doc.getValue()
    };

    var json = JSON.stringify(prova);
    document.getElementById("json").value = json;
    document.getElementById("punti").value = 10 * risultato.punteggio.punti / risultato.punteggio.scala;
    document.getElementById("form").action = "https://script.google.com/a/savoiabenincasa.it/macros/s/AKfycbwCadXpofT_08X9n0O-CXqLvm08EvZ9M0BcbplgwQjimBYAwVn1/exec";
    document.getElementById("form").submit();
  }

  // 1 - Titolo
  creaTest("Titolo",
    "Inserisci il titolo: <code>Prova di <em>Nome</em> " +
    "<em>Cognome</em>.", 3,
    function (doms) {
      var d = doms.asciidoc_dom;
      if (!d.hasHeader())
        return "";
      var titolo = d.getDocumentTitle().toLowerCase().substr(0, 9);
      console.log("Titolo: " + titolo);
      return titolo;
    },
    "prova di ");
  // 2 - Autore
  creaTest("Nome autore", "Inserisci il nome dell'autore", 1,
    function (doms) {
      var d = doms.asciidoc_dom;
      if (!d.hasHeader())
        return "";
      var nome = d.getAttribute("firstname");
      console.log("Nome: " + nome);
      return nome !== undefined;
    },
    true);
  creaTest("Cognome autore",
    "Inserisci il cognome dell'autore (nel giusto ordine!)", 1,
    function (doms) {
      var d = doms.asciidoc_dom;
      if (!d.hasHeader())
        return "";
      var cognome = d.getAttribute("lastname");
      console.log("Cognome: " + cognome);
      return cognome !== undefined;
    },
    true);
  creaTest("Email autore", "Inserisci l'email dell'autore", 1,
    function (doms) {
      var d = doms.asciidoc_dom;
      if (!d.hasHeader())
        return "";
      var email = d.getAttribute("email");
      console.log("Email: " + email);
      return email !== undefined;
    },
    true);
  // 3 - Revisione
  creaTest("Data", "Inserisci la data di revisione", 1,
    function (doms) {
      var d = doms.asciidoc_dom;
      if (!d.hasHeader())
        return "";
      var revdate = d.getAttribute("revdate");
      console.log("RevDate: " + revdate);
      return revdate !== undefined;
    },
    true);
  creaTest("Numero revisione", "Inserisci il numero di revisione",
    1,
    function (doms) {
      var d = doms.asciidoc_dom;
      var revnumber = d.getAttribute("revnumber");
      if (!d.hasHeader())
        return "";
      console.log("RevNumber: " + revnumber);
      return revnumber !== undefined;
    },
    true);
  creaTest("Commento revisione", "Inserisci la nota di revisione",
    1,
    function (doms) {
      var d = doms.asciidoc_dom;
      if (!d.hasHeader())
        return "";
      var revremark = d.getAttribute("revremark");
      console.log("RevRemark: " + revremark);
      return revremark !== undefined;
    },
    true);
  // Attributo
  creaTest("Attributo", "Inserisci l'attributo <code>safe</code> con valore <code>unsafe</code>",
    1,
    function (doms) {
      var d = doms.asciidoc_dom;
      if (!d.hasHeader())
        return "";
      var safe = d.getAttribute("safe");
      console.log("Safe: " + safe);
      return safe;
    },
    "unsafe");
  // 4 - Paragrafi e sotto paragrafi
  creaTest("Paragrafo",
    "Inserisci un paragrafo dat titolo <code>Paragrafo</code>",
    1,
    function (doms) {
      var d = doms.asciidoc_dom;
      if (d.getBlocks().length < 1 || !d.getBlocks()[0]) {
        return "";
      }
      var titoloParagrafo = d.getBlocks()[0].title;
      if (typeof titoloParagrafo == "string") {
        console.log("Titolo primo paragrafo: " + titoloParagrafo);
        return titoloParagrafo.toLowerCase();
      }
      return "";
    },
    "paragrafo");
  creaTest("Sotto-Paragrafo",
    "Inserisci un sotto-paragrafo dal titolo <code>Sotto-paragrafo</code>",
    1,
    function (doms) {
      var d = doms.asciidoc_dom;
      if (!d.getBlocks()[0] || !d.getBlocks()[0].blocks[0]) {
        return "";
      }
      var titoloParagrafo = d.getBlocks()[0].blocks[0].title;
      if (typeof titoloParagrafo == "string") {
        console.log("Titolo primo sotto-paragrafo: " +
          titoloParagrafo);
        return titoloParagrafo.toLowerCase();
      }
      return "";
    },
    "sotto-paragrafo");
  creaTest("Sotto-Sotto-Paragrafo",
    "Inserisci un sotto-sotto-paragrafo dal titolo <code>Sotto-sotto-paragrafo</code>",
    1,
    function (doms) {
      var d = doms.asciidoc_dom;
      if (!d.getBlocks()[0] || !d.getBlocks()[0].blocks[0] || !d.getBlocks()[
          0].blocks[0].blocks[0]) {
        return "";
      }
      var titoloParagrafo = d.getBlocks()[0].blocks[0].blocks[0].title;
      if (typeof titoloParagrafo == "string") {
        console.log("Titolo primo sotto-sotto-paragrafo: " +
          titoloParagrafo);
        return titoloParagrafo.toLowerCase();
      }
      return "";
    },
    "sotto-sotto-paragrafo");
  // 5 - Elenchi
  creaTest("Elenco non ordinato",
    "Inserisci un elenco non ordinato con primo elemento <code>Primo</code>",
    1,
    function (doms) {
      var d = doms.asciidoc_dom;
      var ulist = cercaPrimoBloccoPerTipo(d, "ulist");
      if (!ulist) {
        return "";
      }
      var ulistFirstItem = ulist.blocks[0];
      if (ulistFirstItem) {
        return ulistFirstItem.text.toLowerCase();
      } else {
        return "";
      }
    },
    "primo");
  creaTest("Elenco ordinato",
    "Inserisci un elenco ordinato con secondo elemento <code>due</code>. Inseriscilo in una nuova sezione",
    1,
    function (doms) {
      var d = doms.asciidoc_dom;
      var olist = cercaPrimoBloccoPerTipo(d, "olist");
      if (!olist || olist.length < 2) {
        return "";
      }
      var olistSecondItem = olist.blocks[1];
      if (olistSecondItem) {
        return olistSecondItem.text.toLowerCase();
      } else {
        return "";
      }
    },
    "due");
  creaTest("Elenco descrittivo",
    "Inserisci un elenco descrittivo con il termine <code>termine</code> e descrizione <code>descrizione</code>. Inseriscilo in una nuova sezione",
    1,
    function (doms) {
      var d = doms.asciidoc_dom;
      var dlist = cercaPrimoBloccoPerTipo(d, "dlist");
      if (!dlist || dlist.length < 1) {
        return {};
      }
      var dlistItem = dlist.blocks[0];
      if (dlistItem) {
        return {
          t: dlistItem[0][0].text.toLowerCase(),
          d: dlistItem[1].text.toLowerCase()
        };
      } else {
        return {};
      }
    }, {
      t: "termine",
      d: "descrizione"
    });
  // Neretto
  creaTest("Neretto",
    "Inserisci un capoverso con la parola <code>neretto</code> in neretto",
    1,
    function (doms) {
      var d = doms.html_dom;
      // Cerca nel DOM HTML
      var testo = d.getElementsByTagName("strong");
      if (!testo || testo.length < 1) {
        return "";
      }
      return testo[0].innerText;
    },
    "neretto");
  // Corsivo
  creaTest("Corsivo",
    "Inserisci un capoverso con la parola <code>corsivo</code> in corsivo",
    1,
    function (doms) {
      var d = doms.html_dom;
      // Cerca nel DOM HTML
      var testo = d.getElementsByTagName("em");
      if (!testo || testo.length < 1) {
        return "";
      }
      return testo[0].innerText;
    },
    "corsivo");
  // Corsivo
  creaTest("Testo a spaziatura fissa",
    "Inserisci un capoverso con la frase <code>testo a spaziatura fissa</code> a spaziatura fissa",
    1,
    function (doms) {
      var d = doms.html_dom;
      // Cerca nel DOM HTML
      var testo = d.getElementsByTagName("code");
      if (!testo || testo.length < 1) {
        return "";
      }
      return testo[0].innerText;
    },
    "a spaziatura fissa");
  // A capo
  creaTest("A capo",
    "Inserisci un capoverso che va a capo",
    1,
    function (doms) {
      var d = doms.html_dom;
      // Cerca nel DOM HTML
      var testo = d.getElementsByTagName("br");
      if (!testo || testo.length < 1) {
        return false;
      }
      return true;
    },
    true);
  // Collegamento
  creaTest("Collegamento",
    "Inserisci un collegamento il cui indirizzo sia <code>http://www.gnu.org/</code> e il cui testo visualizzato sia <code>progetto GNU</code>",
    1,
    function (doms) {
      var d = doms.html_dom;
      var collegamento = d.getElementsByTagName("a")[0];
      if (!collegamento) {
        return {};
      }
      return {
        href: collegamento.href,
        innerText: collegamento.innerText.toLowerCase()
      };
    }, {
      href: "http://www.gnu.org/",
      innerText: "progetto gnu"
    });
  // Immagine
  creaTest("Immagine",
    "Inserisci un'immagine il cui indirizzo sia <code>http://www.gnu.org/graphics/gnu-head.jpg<code>",
    1,
    function (doms) {
      var d = doms.html_dom;
      var img = d.getElementsByTagName("img")[0];
      if (!img) {
        return "";
      }
      return img.src;
    },
    "http://www.gnu.org/graphics/gnu-head.jpg");
  // Tabella
  creaTest("Tabella",
    "Inserisci una tabella; sei libero di scegliere il contenuto",
    1,
    function (doms) {
      var d = doms.html_dom;
      var tabella = d.getElementsByTagName("table")[0];
      if (!tabella) {
        return false;
      }
      return true;
    },
    true);

  document.getElementById("fonts").disabled = true;
  document.getElementById("cambiafont").onclick = function() {
	var sheet = document.getElementById("fonts");
	if (sheet.disabled) {
	  sheet.disabled = false;
	} else {
	  sheet.disabled = true;
	}
  };
  document.getElementById("converti_e_valuta").addEventListener('click', converti_e_valuta);
  document.getElementById("invia").addEventListener('click', invia);

})();
