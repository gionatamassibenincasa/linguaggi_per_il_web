'use strict';

var source = document.getElementById("quesiti-template").innerHTML;
var template = Handlebars.compile(source);
var context = [{
        titolo: "Produttoria - Costrutto WHILE",
        righeSpecifiche: ["<p>Si definisca una procedura che restituisce il<strong>prodotto</strong> di tutti i numeri naturali compresi tra <em>m</em> e <em>n</em>, estremi inclusi.<br>Si usi il costrutto <strong>WHILE</strong></p>", ],
        scheletro: "var prodotto = function (m, n) {\n\treturn ...;\n};\n",
        tests: [{
                type: "syntax",
                args: "WhileStatement"
            }, {
                type: "functional",
                fnc: "prodotto",
                args: [0, 10],
                ret: 0
            },
            {
                type: "functional",
                fnc: "prodotto",
                args: [3, 4],
                ret: 12
            },
            {
                type: "functional",
                fnc: "prodotto",
                args: [1, 5],
                ret: 120
            },
            {
                type: "functional",
                fnc: "prodotto",
                args: [5, 5],
                ret: 5
            }
        ],
        coefficientePunteggio: 1,
        punteggio: 0
    }, {
        titolo: "Produttoria - Costrutto DO_WHILE",
        righeSpecifiche: ["<p>Si definisca una procedura che restituisce il<strong>prodotto</strong> di tutti i numeri naturali compresi tra <em>m</em> e <em>n</em>, estremi inclusi.<br>Si usi il costrutto <strong>DO_WHILE</strong></p>", ],
        scheletro: "var prodotto = function (m, n) {\n\treturn ...;\n};\n",
        tests: [{
                type: "syntax",
                args: "DoWhileStatement"
            }, {
                type: "functional",
                fnc: "prodotto",
                args: [0, 10],
                ret: 0
            },
            {
                type: "functional",
                fnc: "prodotto",
                args: [3, 4],
                ret: 12
            },
            {
                type: "functional",
                fnc: "prodotto",
                args: [1, 5],
                ret: 120
            },
            {
                type: "functional",
                fnc: "prodotto",
                args: [5, 6],
                ret: 30
            }
        ],
        coefficientePunteggio: 1,
        punteggio: 0
    },
    {
        titolo: "Produttoria - Costrutto FOR",
        righeSpecifiche: ["<p>Si definisca una procedura che restituisce il<strong>prodotto</strong> di tutti i numeri naturali compresi tra <em>m</em> e <em>n</em>, estremi inclusi.<br>Si usi il costrutto <strong>FOR</strong></p>", ],
        scheletro: "var prodotto = function (m, n) {\n\treturn ...;\n};\n",
        tests: [{
                type: "syntax",
                args: "ForStatement"
            }, {
                type: "functional",
                fnc: "prodotto",
                args: [0, 10],
                ret: 0
            },
            {
                type: "functional",
                fnc: "prodotto",
                args: [3, 4],
                ret: 12
            },
            {
                type: "functional",
                fnc: "prodotto",
                args: [1, 5],
                ret: 120
            },
            {
                type: "functional",
                fnc: "prodotto",
                args: [5, 5],
                ret: 5
            }
        ],
        coefficientePunteggio: 1,
        punteggio: 0
    },
    {
        titolo: "Produttoria - Costrutto RICORSIVO",
        righeSpecifiche: ["<p>Si definisca una procedura che restituisce il<strong>prodotto</strong> di tutti i numeri naturali compresi tra <em>m</em> e <em>n</em>, estremi inclusi.<br>Si usi il costrutto <strong>RICORSIVO</strong></p>", ],
        scheletro: "var prodotto = function (m, n) {\n\treturn ...;\n};\n",
        tests: [{
                type: "syntax",
                args: "CallExpression",
                fnc: "prodotto"
            }, {
                type: "functional",
                fnc: "prodotto",
                args: [0, 10],
                ret: 0
            },
            {
                type: "functional",
                fnc: "prodotto",
                args: [3, 4],
                ret: 12
            },
            {
                type: "functional",
                fnc: "prodotto",
                args: [1, 5],
                ret: 120
            },
            {
                type: "functional",
                fnc: "prodotto",
                args: [5, 5],
                ret: 5
            }
        ],
        coefficientePunteggio: 2,
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
        if (typeof a === "string") return a;
        var ret = ""; // = "[";
        if (a && a.length) {
            ret += a[0];
        }
        for (var j = 1; a && j < a.length; j++) ret += ", " + a[j];
        //ret += "]";
        return ret;
    }
    var localEval = function (src, type, fnc, args, expected) {
        console.log("Verifica **" + ((type === "syntax") ? "sintattica" : fnc) + " (" + arrayToString(args) + ")**");
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
            if (type === "syntax") {
                let a = 0;
                switch (args) {
                    case "ForStatement":
                        acorn.walk.simple(ast, {
                            ForStatement: (node) => {
                                a = a + 1;
                            }
                        });
                        return a;
                    case "WhileStatement":
                        // console.log("Controllo WhileStatement");
                        acorn.walk.simple(ast, {
                            WhileStatement: (node) => {
                                a = a + 1;
                            }
                        });
                        return a;
                    case "DoWhileStatement":
                        acorn.walk.simple(ast, {
                            DoWhileStatement: (node) => {
                                a = a + 1;
                            }
                        });
                        return a;
                    case "CallExpression":
                        acorn.walk.simple(ast, {
                            CallExpression: (node) => {
                                if (node.callee.type == "Identifier" && node.callee.name == fnc)
                                    a = a + 1;
                            }
                        });
                        return a;
                }
            }
            acorn.walk.simple(ast, {
                ForStatement: loop,
                // ForInStatement: loop,
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
    for (var j = 0; j < context[numeroEsercizio].tests.length; j++) {
        var t = context[numeroEsercizio].tests[j];
        try {
            var ret = localEval(src, t.type, t.fnc, t.args, t.ret);
            if (t.type == "syntax" && ret === 0) {
                console.log("Sintassi non rispettata");
                break;
            }
            if (ret) {
                punteggio += 1;
                consoleEsercizio.innerHTML += '<span class="verde">' + t.fnc + " (" + arrayToString(t.args) + ")" + " => OK</span><br>";
            }
        } catch (e) {
            consoleEsercizio.innerHTML += '<span class="verde">' + t.fnc + " (" + arrayToString(t.args) + ")" + " => KO</span><br>" + e;
            return 0;
        }

        salva(numeroEsercizio);
    };
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