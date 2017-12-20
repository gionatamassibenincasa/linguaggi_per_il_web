import * as compito from './lista_quesiti';

class Alunno {
    constructor(nome, cognome) {
        this.nome = nome;
        this.cognome = cognome;
    }

    static capitalizza(nome) {
        var nomi = nome.split(' ');
        return nomi.forEach(nome => {
            return nome.charAt(0).toUpperCase() + nome.substring(1).toLocaleLowerCase();
        }).join();
    }

    toString() {
        return Alunno.capitalizza(this.cognome) + ' ' + Alunno.capitalizza(this.nome);
    }

    vuoto() {
        return this.cognome === '' || this.nome === '';
    }

    nome() {
        return Alunno.capitalizza(this.nome);
    }

    cognome() {
        return Alunno.capitalizza(this.cognome);
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
    constructor(classe, alunno, quesiti, punteggio, artefatto) {
        this.classe = '';
        this.alunno = '';
        this.quesiti = quesiti;
        this.punteggio = punteggio;
        this.punti = 0;
    }
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
                let trovato = false;
                let css = undefined;
                const ss = document.styleSheets;
                for (let j = 0; j < ss.length; j++) {
                    css = ss[j];
                    if (css.ownerNode && css.ownerNode.getAttribute('id') && css.ownerNode.getAttribute('id') === idStileInterno) {
                        trovato = true;
                        break;
                    }
                }
                if (trovato) {
                    const rules = css.cssRules;
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
        this.scala = valore;
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
            let pg = punteggi.reduce((v, s) => v + s);
            document.querySelector('#descr-stats-punteggio-grezzo').textContent = pg;
            document.querySelector('#voto').textContent = 10 * pg / this.scala;

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
        this.punteggio_decimi = 0;
        let punteggio_massimo = 0;
        this.punteggi = [];


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
                registro += schema + ' : ' + testo;
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
                        let testo = elt.innerHTML; // Preserva tag HTML
                        if (preElaborazione) {
                            testo = preElaborazione(testo);
                        }
                        if (schema.test(testo)) {
                            registro += schema + ' : ' + testo;
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
                if (elts.length === 0) return false;
                if (typeof chiave === 'string') {
                    // Caso base - chiave di tipo stringa
                    for (let j = elts.length - 1; j > -1; j++) {
                        let elt = elts[j];

                        // console.log('Caso base');
                        if (elt == null) return false;
                        let valore_attuale = elt.getAttribute(chiave);
                        if (preElaborazione) {
                            valore_attuale = preElaborazione(valore_attuale);
                        }
                        //console.log(chiave, valore, valore_attuale);
                        if (valore.test(valore_attuale)) {
                            registro += valore + ' : ' + valore_attuale;
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
            };

            let analizzatoreDOMAttributoContenuto = function (attributo, contenuto, radice, selettore) {
                'use strict';
                let verificaAttributi = function (elt) {
                    let chiave = attributo[0];
                    if (typeof chiave === 'string') {
                        // Caso base - chiave di tipo stringa
                        let valore_atteso = attributo[1];
                        let valore_attuale = elt.getAttribute(chiave);
                        return valore_atteso.test(valore_attuale);
                    } else { // Caso ricorsivo - array di attributi
                        /*
                        if (Array.isArray(chiave)) {
                            for (let j = 0; j < chiave.length; j++) {
                                console.log('caso base');
                                if (!((attributo[0][j]).test(attributo[1][j])))
                                    return false;
                            }
                            return true;
                        } else {
                            throw new Error('Atteso array');;
                        }
                        */
                        return false;
                    }
                };

                let elts = radice.querySelectorAll(selettore);
                // cerca l'elemento con contenuto dato
                for (let j = elts.length - 1; j > -1; j--) {
                    let elt = elts[j];
                    if (contenuto.test(elt.textContent)) {
                        return verificaAttributi(elt);
                    }
                }
                return false;
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
                        switch (specifica.struttura_per_valutazione.analisi) {
                            case 'Contenuto':
                                soddisfatta = analizzatoreDOMContenuto(specifica.struttura_per_valutazione.contenuto, radice, specifica.struttura_per_valutazione.selettore, specifica.struttura_per_valutazione.callback);
                                break;
                            case 'Attributo':
                                soddisfatta = analizzatoreDOMAttributo(specifica.struttura_per_valutazione.coppieChiaveValore, radice, specifica.struttura_per_valutazione.selettore, specifica.struttura_per_valutazione.callback);
                                break;
                            case 'AttributoContenuto':
                                soddisfatta =
                                    analizzatoreDOMAttributoContenuto(specifica.struttura_per_valutazione.coppieChiaveValore, specifica.struttura_per_valutazione.contenuto, radice, specifica.struttura_per_valutazione.selettore);
                                break;
                            default:
                                throw new Error('Funzione di analisi non riconosciuta ' + specifica.struttura_per_valutazione.analisi);
                        }
                        break;
                    default:
                        throw new Error('Modello di analisi non riconosciuto ' + specifica.struttura_per_valutazione.modello);
                }
            } catch (e) {
                console.log(e);
            } finally {
                // aggiorna visualizzazione
                if (soddisfatta) {
                    registro += ' || SODDISFATTA :)';
                    return specifica.quesito.punteggio;
                } else {
                    registro += ' || NON SODDISFATTA :(';
                    return 0;
                }
                soddisfatta = false;
            }
        };

        this.pagina.elementoVisualizzazioneOutput.addEventListener('load', () => {
            // Usando le funzioni a freccia this conserva il valore del costruttore
            //
            // Attenzione, questa funzione non è un metodo di classe!
            // Le variabili membro possono essere ridefinite come locali
            let punteggio_parziale = 0;
            let punteggi = [];
            specifiche.forEach(function (spec) {
                registro = 'Spec. ' + (spec.indice + 1) + '. - ' + spec.quesito.descrizione_breve + ' || ';
                let punti_risposta = Number(analizza(spec, pagina));
                punteggio_parziale += Number(punti_risposta);
                if (document.verbose) {
                    console.log(registro + ' || ' + punteggio_parziale);
                }
                punteggi.push(punti_risposta);
            });
            pagina.aggiornaPunteggio(punteggi);
            this.punteggi = punteggi;
            this.punteggio_grezzo = Number(punteggio_parziale);
            this.punteggio_decimi = 10 * this.punteggio_grezzo / this.punteggio_massimo;
        });
    }
}

class Consegna {
    constructor(classe, alunno, artefatto, correttore) {
        this.classe = classe;
        this.alunno = alunno;
        this.artefatto = artefatto;
        this.correttore = correttore;
    }

    invia() {
        ///*
        let form = document.createElement('form');

        let classe = document.createElement('input');
        classe.value = this.classe;
        classe.name = 'classe';
        form.appendChild(classe);

        let nome = document.createElement('input');
        nome.value = this.alunno.nome;
        nome.name = 'nome';
        form.appendChild(nome);

        let cognome = document.createElement('input');
        cognome.value = this.alunno.cognome;
        cognome.name = 'cognome';
        form.appendChild(cognome);

        let artefatto = document.createElement('textarea');
        artefatto.value = this.artefatto;
        artefatto.name = 'artefatto';
        form.appendChild(artefatto);

        let json = document.createElement('textarea');
        json.value = JSON.stringify({
            classe: this.classe,
            alunno: this.alunno,
            artefatto: this.artefatto,
            correzione: this.correttore
        });
        json.name = 'json';
        form.appendChild(json);

        let punti = document.createElement('input');
        punti.value = this.correttore.punteggio_decimi;
        punti.name = 'punti';
        form.appendChild(punti);

        form.method = 'POST';
        form.action = 'https://script.google.com/a/savoiabenincasa.it/macros/s/AKfycbwCadXpofT_08X9n0O-CXqLvm08EvZ9M0BcbplgwQjimBYAwVn1/exec';

        document.body.appendChild(form);
        form.submit();
        //*/
    }
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

let specifiche = generaListaSpecifiche(compito.lista_quesiti);
pagina.aggiungiSpecifiche(specifiche);
pagina.aggiungiValutazioni(specifiche);
let configurazioneEditor = {
    //value: '\n',
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
    //parserfile: ['parsexml.js', 'parsecss.js', 'tokenizejavascript.js', 'parsejavascript.js', 'parsehtmlmixed.js'],
    stylesheet: ['css/xmlcolors.css', 'css/jscolors.css', 'css/csscolors.css'],
    autoCloseTags: true,
    scrollbarStyle: 'simple'
};
/**
 * Callback per l'aggiornamento dell'output ad ogni modifica del file sorgente
 */
let addPreview = function (editor) {
    // Solo la prima volta
    document.getElementById('render').srcdoc = editor.getValue();
    editor.on('change', function () {
        document.getElementById('render').srcdoc = editor.getValue();
    });
};
let editor = new Editor(configurazioneEditor, addPreview);
// Sistema il cursore
editor.codemirror.refresh();
let correttore = new Correttore(specifiche, pagina, editor);
correttore.abilita();
let ridimensionaEditor = function () {
    let editor = document.querySelectorAll('.CodeMirror')[0].CodeMirror;
    let height = document.getElementById('descr-specs').clientHeight;
    // set width & height
    editor.setSize('100%', height);
    editor.refresh();
}
window.addEventListener('resize', ridimensionaEditor);
window.addEventListener('load', ridimensionaEditor);
let invia = function () {
    let classe = compito.classe;
    let alunno = new Alunno(document.querySelector('#alunno-nome').value, document.querySelector('#alunno-cognome').value);
    if (alunno.vuoto()) {
        alert('Per continuare devi immettere il nome e il cognome nelle caselle in alto a destra.');
        return;
    }
    let editor = document.querySelectorAll('.CodeMirror')[0].CodeMirror;
    let artefatto = editor.getValue();
    if (artefatto === '') {
        alert('Per continuare devi immettere del testo.');
        return;
    }

    let consegna = new Consegna(classe, alunno, artefatto, correttore);
    consegna.invia();
};
document.querySelector('#invia').addEventListener('click', invia);
