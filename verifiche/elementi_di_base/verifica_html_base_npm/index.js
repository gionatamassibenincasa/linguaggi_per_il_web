class Alunno {
    constructor(nome, cognome) {
        this.nome = nome;
        this.cognome = cognome;
    }

    toString() {
        return this.cognome + ' ' + this.nome;
    }
}

class Quesito {
    constructor(descrizione_breve, descrizione, competenza, punteggio) {
        this.descrizione_breve = descrizione_breve;
        this.descrizione = descrizione;
        this.competenza = competenza;
        this.punteggio = punteggio;
    }
}

class Specifica {
    /*const Struttura = Object.freeze({
        PLAINTEXT: Symbol('plaintext'),
        DOM: Symbol('dom'),
        CSSDOM: Symbol('cssdom'),
        ASCIIDOC: Symbol('asciidoc')
    });*/
    constructor(indice, quesito, struttura_per_valutazione) {
        this.indice = indice;
        this.quesito = quesito;
        this.struttura_per_valutazione = struttura_per_valutazione;
    }
}

class Verifica {

}

class Editor {
    constructor(configurazione, callback) {
        let address = window.location.href.split('#')[0];
        /**
         * Il salvataggio del codice sorgente
         */
        let localSave = function (editor) {
            // Salva il sorgente nel browser, per eventuali ripristini
            localStorage[address] = editor.getValue();
        };
        /**
         *  Callback per salvare le modifiche del codice sorgente ad ogni modifica
         */
        let addPersistence = function (editor) {
            var persisted = localStorage[address] || editor.getValue();
            editor.setValue(persisted);
            editor.on('change', localSave);
        };
        /**
         * Istanziazione dell'editor
         *
         * I dati del local storage devono essere caricati precedentemente in #editor
         */
        this.codemirror = CodeMirror.fromTextArea(document.getElementById('editor'), configurazione);
        addPersistence(this.codemirror);
        callback(this.codemirror);
    }

    get value() {
        return this.codemirror.getValue();
    }

}

class Pagina {
    constructor() {
        const abilitaModificaCaratteriTipografi = function () {
            const selettoreCSSFontFace = '#opendyslexic-fonts',
                selettoreInputFont = '#font-scelto',
                fontDislessia = 'opendyslexic',
                fontPredefinito = '',
                idStileInterno = 'stile_interno';
            /**
             * Prestare attenzione alla dislessia.
             *
             * Permetti la scelta del font con un sottoinsieme da http://dyslexiahelp.umich.edu/sites/default/files/good_fonts_for_dyslexia_study.pdf
             */
            document.querySelector(selettoreCSSFontFace).disabled = true;
            document.querySelector(selettoreInputFont).value = '';
            document.querySelector(selettoreInputFont).addEventListener('change', function (evento_o_font) {

                const abilitaOpenDyslexic = function () {
                    const link = document.querySelector(selettoreCSSFontFace);
                    if (link === null) {
                        return;
                    }
                    link.disabled = false;
                };

                const disabilitaOpenDyslexic = function () {
                    const link = document.querySelector(selettoreCSSFontFace);
                    if (link === null) {
                        return;
                    }
                    link.disabled = true;
                };

                const ff = (evento_o_font instanceof Event ? evento_o_font.target.value : evento_o_font);
                const odf = document.querySelector(selettoreCSSFontFace);
                switch (ff) {
                    case fontDislessia:
                        abilitaOpenDyslexic();
                        break;
                    default:
                        disabilitaOpenDyslexic();
                }
                //console.log('Nuovo font: ', ff);
                let trovato = false;
                let css = undefined;
                const ss = document.styleSheets;
                for (let j = 0; j < ss.length; j++) {
                    css = ss[j];
                    if (css.ownerNode && css.ownerNode.getAttribute('id') && css.ownerNode.getAttribute('id') === idStileInterno) {
                        trovato = true;
                        //console.log(css);
                        break;
                    }
                }
                //console.log('CSS#' + idStileInterno, trovato);
                if (trovato) {
                    const rules = css.cssRules;
                    //console.log(rules);
                    for (let j = 0; j < rules.length; j++) {
                        let rule = rules[j];
                        //if (rule.selectorText[0] === ':') {
                        rule.style['font-family'] = ff;
                        document.querySelectorAll('.CodeMirror')[0].CodeMirror.refresh();
                        return;
                        //}
                    }
                }
            });
        }

        abilitaModificaCaratteriTipografi();
    }

    aggiungiSpecifiche(specifiche) {
        let elenco = document.querySelector('#descr-specs');
        specifiche.forEach(function (spec) {
            let item = document.createElement('li');
            item.setAttribute('id', 'descr-spec-' + spec.indice);
            item.innerHTML = spec.quesito.descrizione;
            elenco.appendChild(item);
        });
    }

    aggiungiValutazioni(specifiche) {
        let tbody = document.querySelector('#descr-stats');
        specifiche.forEach(function (spec) {
            let tr = document.createElement('tr');
            // Id della riga
            let tdId = document.createElement('td');
            tdId.innerHTML = (spec.indice + 1);
            tr.append(tdId);
            // Descrizione breve
            let tdDesc = document.createElement('td');
            tdDesc.innerHTML = spec.quesito.descrizione_breve;
            tr.append(tdDesc);
            // Status - inizialmente fail
            let tdStatus = document.createElement('td');
            tdStatus.innerHTML = 'FAIL';
            tdStatus.setAttribute('id', ('descr-stats-risultato-' + spec.indice));
            tdStatus.setAttribute('class', 'fail');
            tr.append(tdStatus);
            // Punti conseguiti
            let tdPoints = document.createElement('td');
            tdPoints.innerHTML = 0;
            tdPoints.setAttribute('id', ('descr-stats-punti-' + spec.indice));
            tr.append(tdPoints);
            // Punti previsti per l'esercizio
            let tdMaxPoint = document.createElement('td');
            tdMaxPoint.innerHTML = spec.quesito.punteggio;
            tr.append(tdMaxPoint);
            // Aggiunge la riga
            tbody.append(tr);
        });
    }

    aggiornaPunteggioMassimo(valore) {
        document.querySelector('#descr-stats-punteggio-massimo').textContent = '/' + valore;
    }

    aggiornaPunteggio(punteggi) {
        try {
            punteggi.forEach(function (p, i) {
                let status = document.querySelector('#descr-stats-risultato-' + i);
                let points = document.querySelector('#descr-stats-punti-' + i);
                let specim = document.querySelector('#descr-spec-' + i);
                if (p > 0) {
                    status.textContent = 'PASS';
                    status.setAttribute('class', 'pass');
                    points.textContent = p;
                    specim.setAttribute('class', 'pass');
                } else {
                    status.textContent = 'FAIL';
                    status.setAttribute('class', 'fail');
                    points.textContent = p;
                    specim.setAttribute('class', 'fail');
                }
            });
        } catch (e) {
            console.log(e.message);
        }
    }

    get elementoVisualizzazioneOutput() {
        return document.querySelector('#render');
    }

    get plainText() {
        return document.querySelector('#render').srcdoc;
    }

    get DOM() {
        return document.querySelector('#render').contentDocument;
        //return function () {
        //    return document.querySelector('#render').contentDocument;
        //};
    }

}


class Correttore {
    constructor(specifiche, pagina) {
        this.specifiche = specifiche;
        this.pagina = pagina;
        this.punteggio_grezzo = 0;
        let punteggio_massimo = 0;

        specifiche.forEach(function (spec) {
            punteggio_massimo += spec.quesito.punteggio;
        });
        pagina.aggiornaPunteggioMassimo(punteggio_massimo);
        this.punteggio_massimo = punteggio_massimo;
    }


    abilita() {
        let registro = '';

        let analizza = function (specifica, pagina) {
            let analizzatoreLessicale = function (schema, testo, preElaborazione) {
                if (arguments.length < 2) {
                    throw new Error('Passami almeno 2 parametri!');
                }
                if (!schema instanceof RegExp) {
                    throw new Error('Passami una RegExp!');
                }
                if (preElaborazione) {
                    testo = preElaborazione(testo);
                }
                registro += schema + " : " + testo;
                if (schema.test(testo)) {
                    return true;
                }
                return false;
            };
            let analizzatoreDOMContenuto = function (schema, radice, selettore, preElaborazione) {
                // Accetta qualsiasi elemento con quel contenuto, indipendentemente da ripetizioni
                if (arguments.length < 2) {
                    throw new Error('Passami almeno 2 parametri!');
                }

                if (schema instanceof RegExp) {
                    // Caso base
                    let elts = radice.querySelectorAll(selettore);
                    for (let j = 0; j < elts.length; j++) {
                        let elt = elts[j];
                        let testo = elt.innerText;
                        if (preElaborazione) {
                            testo = preElaborazione(testo);
                        }
                        if (schema.test(testo)) {
                            registro += schema + " : " + testo;
                            return true;
                        }
                    }
                    return false;
                } else if (Array.isArray(schema)) {
                    // Caso ricorsivo - array di verifiche, restituire AND
                    for (let j = 0; j < schema.length; j++) {
                        if (!analizzatoreDOMContenuto(schema[j], radice, selettore[j], preElaborazione)) {
                            return false;
                        }
                    }
                    return true;
                } else {
                    throw new Error('Passami una RegExp! O un vettore di RegExp!');
                }
            };

            let analizzatoreDOMAttributo = function (coppieChiaveValore, radice, selettore, preElaborazione) {
                // Assumo che l'attributo possa essere presente in più elementi identificati dal selettore
                // L'unico che conta è l'ultimo
                let chiave = coppieChiaveValore[0];
                let valore = coppieChiaveValore[1];
                let elts = radice.querySelectorAll(selettore);
                //console.log(elts);
                if (typeof chiave === "string") {
                    // Caso base - chiave di tipo stringa
                    for (let j = elts.length - 1; j > -1; j++) {
                        let elt = elts[j];
                        //console.log(elt);

                        // console.log('Caso base');
                        let valore_attuale = elt.getAttribute(chiave);
                        if (preElaborazione) {
                            valore_attuale = preElaborazione(valore_attuale);
                        }
                        //console.log(chiave, valore, valore_attuale);
                        if (valore.test(valore_attuale)) {
                            registro += valore + " : " + valore_attuale;
                            return true;
                        }
                    }
                    return false;
                } else { // Caso ricorsivo - array di attributi
                    if (Array.isArray(chiave)) {
                        for (let j = 0; j < chiave.length; j++) {
                            let nuovaCoppiaChiaveValore = [coppieChiaveValore[0][j], coppieChiaveValore[1][j]];
                            if (!analizzatoreDOMAttributo(nuovaCoppiaChiaveValore, radice, selettore, preElaborazione)) {
                                return false;
                            }
                        }
                        return true;
                    }
                }
                /*
                // Caso base - oggetto con proprieta dell'elemento DOM
                if (typeof valore === "object" && !Array.isArray(valore)) {
                    for (const prop in valore) {
                        if (!prop in e || e.prop.toLowerCase() != valore.prop.toLowerCase())
                            return false;
                        console.log(selettore + " : " + e[prop] + " // atteso: " + valore[prop] + " // test PASSATO");
                    }
                    return true;
                }
                */
            };

            let soddisfatta = false;
            if (!specifica.struttura_per_valutazione.hasOwnProperty('modello')) {
                throw new Error('Passami il tipo di modello di analisi (PLAINTEXT, DOM, CSSDOM, ASCIIDOC...)');
            }
            try {
                switch (specifica.struttura_per_valutazione.modello) {
                    case 'PLAINTEXT':
                        let testo = pagina.plainText;
                        soddisfatta = analizzatoreLessicale(specifica.struttura_per_valutazione.schema, testo, specifica.struttura_per_valutazione.callback)
                        break;
                    case 'DOM':
                        let radice = pagina.DOM;
                        if (specifica.struttura_per_valutazione.analisi === 'Contenuto') {
                            soddisfatta = analizzatoreDOMContenuto(specifica.struttura_per_valutazione.contenuto, radice, specifica.struttura_per_valutazione.selettore, specifica.struttura_per_valutazione.callback);
                        } else if (specifica.struttura_per_valutazione.analisi === 'Attributo') {
                            soddisfatta = analizzatoreDOMAttributo(specifica.struttura_per_valutazione.coppieChiaveValore, radice, specifica.struttura_per_valutazione.selettore, specifica.struttura_per_valutazione.callback);
                        }
                        break;
                    default:
                        throw new Error('Modello di analisi non riconosciuto');
                }
            } catch (e) {
                console.log(e);
            } finally {
                // aggiorna visualizzazione
                if (soddisfatta) {
                    registro += ' > SODDISFATTA :)';
                    return specifica.quesito.punteggio;
                } else {
                    registro += ' > NON SODDISFATTA :(';
                    return 0;
                }
                soddisfatta = false;
            }
        };

        pagina.elementoVisualizzazioneOutput.addEventListener('load', function () {
            // Attenzione, questa funzione non è un metodo di classe!
            // Le variabili membro possono essere ridefinite come locali sopra
            let punteggio_parziale = 0;
            let punteggi = [];
            specifiche.forEach(function (spec) {
                registro = 'Spec. ' + (spec.indice + 1) + '. - ' + spec.quesito.descrizione_breve + ' > ';
                let punti_risposta = analizza(spec, pagina);
                punteggio_parziale += punti;
                console.log(registro + ' > ' + punteggio_parziale);
                punteggi.push(punti_risposta);
            });
            pagina.aggiornaPunteggio(punteggi);
        });
    }
}

class Consegna {

}

class CertificatoCompetenze {

}

//
// MAIN
//

let pagina = new Pagina();
let generaListaSpecifiche = function (lista) {
    let specifiche = [];
    lista.forEach(function (elem, indice) {
        const quesito = new Quesito(elem.quesito.descrizione_breve, elem.quesito.descrizione, elem.quesito.competenza, elem.quesito.punteggio);
        const specifica = new Specifica(indice, quesito, elem.specifica.struttura_per_valutazione)
        specifiche.push(specifica);
    });
    return specifiche;
};

let lista_elementi_specifiche = [
    { // <!DOCTYPE html>
        quesito: {
            descrizione_breve: 'Dichiarazione di tipo',
            descrizione: 'Dichiarare il tipo di documento affinché il browser lo interpreti come <code>HTML</code>',
            competenza: '',
            punteggio: 1
        },
        specifica: {
            struttura_per_valutazione: {
                modello: 'PLAINTEXT', // 'PLAINTEXT', 'DOM', 'CSSDOM', 'ASCIIDOC'
                schema: /<!DOCTYPE\s+html>/i,
                callback: function (d) {
                    return d.slice(0, d.indexOf('\n'));
                }
            }
        }
    },
    {
        // Codifica dei caratteri
        quesito: {
            descrizione_breve: 'Codifica dei caratteri',
            descrizione: 'Dichiarare la <strong>codifica dei caratteri</strong> &egrave; <code>utf-8</code>',
            competenza: '',
            punteggio: 1
        },
        specifica: {
            struttura_per_valutazione: {
                modello: 'DOM', // 'PLAINTEXT', 'DOM', 'CSSDOM', 'ASCIIDOC'
                analisi: 'Attributo',
                selettore: 'html > head > meta',
                coppieChiaveValore: ['charset', /^utf-8$/i],
                callback: null
            }
        }
    },
    {
        // Titolo
        quesito: {
            descrizione_breve: 'Titolo della pagina',
            descrizione: 'Inserire l\'elemento del <strong>titolo della pagina</strong> rispettando la <span class="tooltip">grammatica HTML<span class="tooltiptext">in paricolare regole di annidamento degli elementi</span></span>. Il contenuto dell\'elemento titolo deve essere: <code>Verifica di <span class="tooltip"><em>Cognome&nbsp;&nbsp;Nome</em><span class="tooltiptext">Il tuo cognome seguito dal tuo nome</span></span></code>',
            competenza: '',
            punteggio: 1
        },
        specifica: {
            struttura_per_valutazione: {
                modello: 'DOM', // 'PLAINTEXT', 'DOM', 'CSSDOM', 'ASCIIDOC'
                analisi: 'Contenuto',
                selettore: 'html > head > title',
                contenuto: /Verifica\s+di\s+/i,
                callback: null
            }
        }
    },
    { // Titoletti h1
        //'Intestazione livello 1', 'Inserisci nel corpo della pagina un\'<strong>intestazione di livello 1</strong> dal con contenuto <code>Intestazione di primo livello</code>'
        quesito: {
            descrizione_breve: 'Titoletto livello 1',
            descrizione: 'Inserire <strong>l\'intestazione di livello di sezionamento 1</strong> il contenuto dell\'elemento titolo deve essere: <code>Titoletto sezione 1</code>',
            competenza: '',
            punteggio: 1
        },
        specifica: {
            struttura_per_valutazione: {
                modello: 'DOM', // 'PLAINTEXT', 'DOM', 'CSSDOM', 'ASCIIDOC'
                analisi: 'Contenuto',
                selettore: 'html > body > h1',
                contenuto: /Titoletto\s+sezione\s+1/i,
                callback: null
            }
        }
    },
    { // Titoletti h2
        //'Intestazione livello 1', 'Inserisci nel corpo della pagina un\'<strong>intestazione di livello 1</strong> dal con contenuto <code>Intestazione di primo livello</code>'
        quesito: {
            descrizione_breve: 'Titoletto livello 2',
            descrizione: 'Inserire <strong>l\'intestazione di livello di sezionamento 2</strong> il contenuto dell\'elemento titolo deve essere: <code>Titoletto sezione 1.1</code>',
            competenza: '',
            punteggio: 1
        },
        specifica: {
            struttura_per_valutazione: {
                modello: 'DOM', // 'PLAINTEXT', 'DOM', 'CSSDOM', 'ASCIIDOC'
                analisi: 'Contenuto',
                selettore: 'html > body > h2',
                contenuto: /Titoletto\s+sezione\s+1\.1/i,
                callback: null
            }
        }
    },
    { // Titoletti h3
        quesito: {
            descrizione_breve: 'Titoletto livello 3',
            descrizione: 'Inserire <strong>l\'intestazione di livello di sezionamento 3</strong> il contenuto dell\'elemento titolo deve essere: <code>Titoletto sezione 1.1.1</code>',
            competenza: '',
            punteggio: 1
        },
        specifica: {
            struttura_per_valutazione: {
                modello: 'DOM', // 'PLAINTEXT', 'DOM', 'CSSDOM', 'ASCIIDOC'
                analisi: 'Contenuto',
                selettore: 'html > body > h3',
                contenuto: /Titoletto\s+sezione\s+1\.1\.1/i,
                callback: null
            }
        }
    },
    { // Capoverso con id
        quesito: {
            descrizione_breve: 'Capoverso con id',
            descrizione: 'Inserire un elemento <strong>capoverso</strong> <em>identificato</em> da <code>primocapoverso</code>  il contenuto  deve essere: <code>Il primo capoverso.</code>',
            competenza: '',
            punteggio: 1
        },
        specifica: {
            struttura_per_valutazione: {
                modello: 'DOM', // 'PLAINTEXT', 'DOM', 'CSSDOM', 'ASCIIDOC'
                analisi: 'Contenuto',
                selettore: 'html > body > p#primocapoverso',
                contenuto: /Il\s+primo\s+capoverso/i,
                callback: null
            }
        }
    },
    { // Elenchi non ordinati
        quesito: {
            descrizione_breve: 'Elenco non ordinato',
            descrizione: 'Inserire un <strong>elenco non ordinato</strong> il cui <em>primo</em> <strong>elemento dell\'elenco</strong> sia <code>Cerchio</code>',
            competenza: '',
            punteggio: 1
        },
        specifica: {
            struttura_per_valutazione: {
                modello: 'DOM', // 'PLAINTEXT', 'DOM', 'CSSDOM', 'ASCIIDOC'
                analisi: 'Contenuto',
                selettore: 'html > body ul > li',
                contenuto: /cerchio/i,
                callback: null
            }
        }
    },
    { // Elenchi ordinati
        quesito: {
            descrizione_breve: 'Elenco ordinato',
            descrizione: 'Inserire un <strong>elenco ordinato</strong> il <em>terzo</em> <strong>elemento dell\'elenco</strong> sia <code>terzo</code>',
            competenza: '',
            punteggio: 1
        },
        specifica: {
            struttura_per_valutazione: {
                modello: 'DOM', // 'PLAINTEXT', 'DOM', 'CSSDOM', 'ASCIIDOC'
                analisi: 'Contenuto',
                selettore: 'html > body ol > li:nth-of-type(3)',
                contenuto: /terzo/i,
                callback: null
            }
        }
    },
    { // Elenchi descrittivi
        quesito: {
            descrizione_breve: 'Elenco descrittivo',
            descrizione: 'Inserire un <strong>elenco descrittivo</strong> con la definizione del <strong>termine</stong> <code>zero</code> con <strong>definizione</strong> <code>il primo numero naturale</code> ',
            competenza: '',
            punteggio: 1
        },
        specifica: {
            struttura_per_valutazione: {
                modello: 'DOM', // 'PLAINTEXT', 'DOM', 'CSSDOM', 'ASCIIDOC'
                analisi: 'Contenuto',
                selettore: ['html > body dl > dt:nth-of-type(1)', 'html > body dl > dd:nth-of-type(1)'],
                contenuto: [/^zero$/i, /^il\s+primo\s+numero\s+naturale/],
                callback: null
            }
        }
    },
    { // Modifica del carattere tipografico
        quesito: {
            descrizione_breve: 'Enfasi',
            descrizione: 'Inserire in un <strong>capoverso</strong> avente <em>classe</em> <code>enfasi</code> i blocchi di testo: <code>carattere in neretto</code>, <code>carattere in corsivo</code> e <code>carattere a spaziatura fissa</code>. I blocchi devono essere annotati per apparire nei rispettivi caratteri tipografici. Sono ammessi solo marcatori semantici',
            competenza: '',
            punteggio: 1
        },
        specifica: {
            struttura_per_valutazione: {
                modello: 'DOM', // 'PLAINTEXT', 'DOM', 'CSSDOM', 'ASCIIDOC'
                analisi: 'Contenuto',
                selettore: ['html > body p.enfasi > strong', 'html > body p.enfasi > em', 'html > body p.enfasi > code'],
                contenuto: [/^carattere in neretto$/i, /^carattere in corsivo$/i, /carattere a spaziatura fissa/i],
                callback: null
            }
        }
    },
].slice(0, 100);
let specifiche = generaListaSpecifiche(lista_elementi_specifiche);
pagina.aggiungiSpecifiche(specifiche);
pagina.aggiungiValutazioni(specifiche);
let configurazioneEditor = {
    //value: "\n",
    mode: {
        name: 'htmlmixed',
        tags: {
            style: [
        ['type', /^text\/(x-)?scss$/, 'text/x-scss'],
        [null, null, 'css']
      ]
        }
    },
    lineNumbers: true,
    lineWrapping: true,
    viewportMargin: 10, //Infinity,
    extraKeys: {
        'Ctrl-Space': 'autocomplete'
    },
    //parserfile: ["parsexml.js", "parsecss.js", "tokenizejavascript.js", "parsejavascript.js", "parsehtmlmixed.js"],
    stylesheet: ['css/xmlcolors.css', 'css/jscolors.css', 'css/csscolors.css'],
    autoCloseTags: true,
    scrollbarStyle: 'simple'
};
/**
 * Callback per l'aggiornamento dell'output ad ogni modifica del file sorgente
 */
var addPreview = function (editor) {
    // Solo la prima volta
    document.getElementById('render').srcdoc = editor.getValue();
    editor.on('change', function () {
        document.getElementById('render').srcdoc = editor.getValue();
    });
};
var editor = new Editor(configurazioneEditor, addPreview);
// Sistema il cursore
editor.codemirror.refresh();
/*
let observer = new MutationObserver(function (mutations) {
    //console.log('mutations:', mutations);
    editor.codemirror.refresh();
});
observer.observe(document.querySelector('.sorgente'), {
    attributes: true
});
*/
var correttore = new Correttore(specifiche, pagina, editor);
correttore.abilita();
