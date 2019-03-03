'use strict';

var source = document.getElementById("quesiti-template").innerHTML;
var template = Handlebars.compile(source);
var context = [{
        titolo: "Area del triangolo",
        righeSpecifiche: ["<p>Si definisca una procedura che restituisce l'<strong>area</strong> del triangolo di base <em>b</em> e altezza <em>h</em>.</p>", ],
        scheletro: "var area = function (b, h) {\n\treturn ...;\n};\n",
        tests: [{
                fnc: "area",
                args: [0, 0],
                ret: 0
            },
            {
                fnc: "area",
                args: [3, 4],
                ret: 6
            },
            {
                fnc: "area",
                args: [10, 5],
                ret: 25
            }
        ],
        coefficientePunteggio: 1,
        punteggio: 0
    }, {
        titolo: "Perimetro del triangolo rettangolo",
        righeSpecifiche: ["<p>Si definisca una procedura che restituisce il <strong>perimetro</strong> del triangolo rettangolo dati i cateti c1 e c2.</p>",
            "<p>Nota: radice quadrata: Math.sqrt ( ... );</p>"
        ],
        scheletro: "var perimetro = function (c1, c2) {\n\treturn ...;\n};\n",
        tests: [{
                fnc: "perimetro",
                args: [0, 0],
                ret: 0
            },
            {
                fnc: "perimetro",
                args: [3, 4],
                ret: 12
            },
            {
                fnc: "perimetro",
                args: [5, 12],
                ret: 30
            }
        ],
        coefficientePunteggio: 1,
        punteggio: 0
    },
    {
        titolo: "Fattoriale",
        righeSpecifiche: [
            "<p>Si definisca una procedura che restituisce il <strong>fattoriale</strong> di un numero naturale <em>n</em>.</p>",
            "<p>Nota: il fattoriale di 0 è 1; il fattoriale di <em>n</em> è <em>n</em> moltiplicato per il fattoriale di <em>n - 1</em>.</p>",
            "<p>Nota: il fattoriale di <em>n</em>, se <em>n</em> è maggiore di 0, pu&ograve; essere calcolato come il prodotto di tutti i numeri tra 1 e <em>n</em>.</p>",
        ],
        scheletro: "var fattoriale = function (n) {\n\treturn ;\n};\n",
        tests: [{
                fnc: "fattoriale",
                args: [0],
                ret: 1
            },
            {
                fnc: "fattoriale",
                args: [1],
                ret: 1
            },
            {
                fnc: "fattoriale",
                args: [5],
                ret: 120
            }
        ],
        coefficientePunteggio: 1,
        punteggio: 0
    },
    {
        titolo: "Elevamento a potenza",
        righeSpecifiche: [
            "<p>Si definisca una procedura <strong>potenza</strong> che restituisce <em>b</em> elevato a <em>e</em>.</p>",
            "<p>Nota: <em>b</em> ed <em>e</em> non sono contemporaneamente nulli. L'esponente <em>e</em> è un numero naturale</p>",
        ],
        scheletro: "var potenza = function (b, e) {\n\treturn ;\n};\n",
        tests: [{
                fnc: "potenza",
                args: [1, 0],
                ret: 1
            },
            {
                fnc: "potenza",
                args: [2, 10],
                ret: 1024
            },
            {
                fnc: "potenza",
                args: [5, 1],
                ret: 5
            }
        ],
        coefficientePunteggio: 1,
        punteggio: 0
    },
    {
        titolo: "Divisione euclidea",
        righeSpecifiche: [
            "<p>Si definisca una procedura che restituisce il quoziente della <strong>divisione euclidea</strong>",
        ],
        scheletro: "var quoziente = function (n, m) {\n\treturn ;\n};\n",
        tests: [{
                fnc: "quoziente",
                args: [1, 2],
                ret: 0
            },
            {
                fnc: "quoziente",
                args: [5, 2],
                ret: 2
            },
            {
                fnc: "quoziente",
                args: [6, 3],
                ret: 2
            }
        ],
        coefficientePunteggio: 1,
        punteggio: 0
    },
    {
        titolo: "Inserimento in ordine",
        righeSpecifiche: [
            "<p>Si definisca una procedura che inserisce in ordine un valore <em>v</em> in una sequenza ordinata <em>S</em>.</p>",
        ],
        scheletro: "var inserisci = function (n, S) {\n\treturn S;\n};\n",
        tests: [{
                fnc: "inserisci",
                args: [1, []],
                ret: [1]
            },
            {
                fnc: "inserisci",
                args: [1, [-1, 0, 1]],
                ret: [-1, 0, 1, 1]
            },
            {
                fnc: "inserisci",
                args: [5, [1, 2, 3]],
                ret: [1, 2, 3, 5]
            }
        ],
        coefficientePunteggio: 1,
        punteggio: 0
    }
];
var html = template(context);
document.getElementsByTagName("body")[0].innerHTML = html;

var editors = [];

//document.body.onload = function () {
var gestoreRipristina = function (evt) {
    var numeroEsercizio = parseInt(/[0-9]+/.exec(evt.target.id)[0]);
    console.log("Ripristino il contenuto dell'editor per l'esercizio " + numeroEsercizio);
    editors[numeroEsercizio].setValue(context[numeroEsercizio].scheletro);
};
var gestoreProva = function (evt) {
    var arrayToString = function (a) {
        var ret = ""; // = "[";
        if (a.length) {
            ret += a[0];
        }
        for (var j = 1; j < a.length; j++) ret += ", " + a[j];
        //ret += "]";
        return ret;
    }
    var localEval = function (src, fnc, args, expected) {
        let patches = []
        let backJump = ";if (++__c === 1000) throw new Error(\"Loop troppo lungo\");"
        let loop = (node) => {
            if (node.body.type == "BlockStatement") {
                patches.push({
                    from: node.body.end - 1,
                    text: backJump
                })
            } else {
                patches.push({
                    from: node.body.start,
                    text: "{"
                }, {
                    from: node.body.end,
                    text: backJump + "}"
                })
            }
        }
        try {
            var ast = acorn.parse(src);
            acorn.walk.simple(ast, {
                ForStatement: loop,
                ForInStatement: loop,
                WhileStatement: loop,
                DoWhileStatement: loop
            });
        } catch (e) {
            console.log(e);
        }
        patches.sort((a, b) => a.from - b.from || (a.to || a.from) - (b.to || b.from));
        let out = "",
            pos = 0
        for (let i = 0; i < patches.length; ++i) {
            let patch = patches[i]
            out += src.slice(pos, patch.from) + patch.text
            pos = patch.to || patch.from
        }
        out += src.slice(pos, src.length)
        out += "\n";
        out = "var __c = 0;\n" + out;
        src = out;
        // non sporca l'ambiente windows
        console.log("Verifica *" + fnc + " (" + arrayToString(args) + ")**");
        var newSrc = src + "JSON.stringify(" + fnc + ".apply(null, " + JSON.stringify(args) + ")) === \"" + JSON.stringify(expected) + "\";";
        //console.log(newSrc);
        return eval(newSrc);
    };
    var numeroEsercizio = parseInt(/[0-9]+/.exec(evt.target.id)[0]);
    var src = editors[numeroEsercizio].getValue();
    var consoleEsercizio = document.querySelector("#console" + numeroEsercizio);
    consoleEsercizio.innerHTML = "";
    var punteggio = 0;

    // Provo a valuare la funzione
    context[numeroEsercizio].tests.forEach(t => {
        try {
            var ret = localEval(src, t.fnc, t.args, t.ret);
            if (ret) {
                punteggio += 1;
                consoleEsercizio.innerHTML += '<span class="verde">' + t.fnc + " (" + arrayToString(t.args) + ")" + " => OK</span><br>";
            }
        } catch (e) {
            consoleEsercizio.innerHTML += '<span class="verde">' + t.fnc + " (" + arrayToString(t.args) + ")" + " => KO</span><br>" + e;
            return 0;
        }

        salva(numeroEsercizio);
    });
    console.log("Percentuale di successo dell'esercizio " + numeroEsercizio + ": " +
        (punteggio / context[numeroEsercizio].tests.length * 100));
    return punteggio / context[numeroEsercizio].tests.length;
};
var aggiungiGestoreRispristina = function () {
    var bottoni = document.querySelectorAll("button");
    bottoni.forEach(function (bottone) {
        if (bottone.id[3] === "R") {
            bottone.addEventListener("click", gestoreRipristina);
        }
    });
};
var aggiungiGestoreProva = function () {
    var bottoni = document.querySelectorAll("button");
    bottoni.forEach(function (bottone) {
        if (bottone.id[3] === "P") {
            bottone.addEventListener("click", gestoreProva);
        }
    });
};

// aggiunge la funzionalità al bottone "ripristina"
aggiungiGestoreRispristina();
aggiungiGestoreProva();

function salva(numEsercizio) {
    localStorage.setItem("esercizioJS" + numEsercizio, editors[numEsercizio].getValue());
}

function carica(numEsercizio) {
    var src = localStorage.getItem("esercizioJS" + numEsercizio);
    if (src) {
        editors[numEsercizio].setValue(src);
    }
}

var invia = function () {
    var prova = {
        classe: document.getElementById("classe").value,
        nome: document.getElementById("nome").value,
        cognome: document.getElementById("cognome").value,
        quesiti: context,
        punteggio: context.reduce((a, q, i) => {
            var e = {};
            e.target = {};
            e.target.id = "" + i;
            return a + gestoreProva(e);
        }, 0),
        artefatto: editors.reduce((a, e, i) => {
            return a + "// Esercizio " + i + "\n\n\n" + e.getValue() + "\n\n\n";
        }, "")
    };

    var json = JSON.stringify(prova);
    document.getElementById("json").value = json;
    document.getElementById("punti").value = prova.punteggio; //10 * punteggio.punti / punteggio.scala;
    //console.log(JSON.stringify(prova, null, 4));
    document.getElementById("form").action = "https://script.google.com/a/savoiabenincasa.it/macros/s/AKfycbwCadXpofT_08X9n0O-CXqLvm08EvZ9M0BcbplgwQjimBYAwVn1/exec";
    document.getElementById("form").submit();
}

ace.require("ace/ext/language_tools");
for (var indiceQuesito = 0; indiceQuesito < context.length; indiceQuesito++) {
    var id = "editor" + indiceQuesito;
    var e = ace.edit(id);
    ace.require('ace/ext/settings_menu').init(e);
    e.setTheme("ace/theme/monokai");
    e.session.setMode("ace/mode/javascript");
    // enable autocompletion and snippets
    e.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: false
    });
    e.commands.addCommands([{
        name: "showSettingsMenu",
        bindKey: {
            win: "Ctrl-q",
            mac: "Ctrl-q"
        },
        exec: function (editor) {
            editor.showSettingsMenu();
        },
        readOnly: true
    }]);
    editors.push(e);
    // dopo averlo incluso in editors
    carica(indiceQuesito);
}
document.getElementById("invia").addEventListener('click', invia);