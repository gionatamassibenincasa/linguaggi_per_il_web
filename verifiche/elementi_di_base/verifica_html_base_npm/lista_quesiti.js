export const classe = 'E-3A';
export const lista_quesiti = [
	{
		// <!DOCTYPE html>
		quesito: {
			descrizione_breve: 'Dichiarazione di tipo',
			descrizione: 'Dichiarare il tipo di documento affinché il browser lo interpreti come <code>HTML</code>',
			competenza: '',
			punteggio: 1,
		},
		specifica: {
			struttura_per_valutazione: {
				modello: 'PLAINTEXT', // 'PLAINTEXT', 'DOM', 'CSSDOM', 'ASCIIDOC'
				schema: /<!DOCTYPE\s+html>/i,
				callback: function(d) {
					return d.slice(0, d.indexOf('\n'));
				},
			},
		},
	},
	{
		// Codifica dei caratteri
		quesito: {
			descrizione_breve: 'Codifica dei caratteri',
			descrizione: 'Dichiarare la <strong>codifica dei caratteri</strong> &egrave; <code>utf-8</code>',
			competenza: '',
			punteggio: 1,
		},
		specifica: {
			struttura_per_valutazione: {
				modello: 'DOM', // 'PLAINTEXT', 'DOM', 'CSSDOM', 'ASCIIDOC'
				analisi: 'Attributo',
				selettore: 'html > head > meta',
				coppieChiaveValore: [ 'charset', /^utf-8$/i ],
				callback: null,
			},
		},
	},
	{
		// Titolo
		quesito: {
			descrizione_breve: 'Titolo della pagina',
			descrizione:
				'Inserire l\'elemento del <strong>titolo della pagina</strong> rispettando la <span class="tooltip">grammatica HTML<span class="tooltiptext">in paricolare regole di annidamento degli elementi</span></span>. Il contenuto dell\'elemento titolo deve essere: <code>Verifica di <span class="tooltip"><em>Cognome&nbsp;&nbsp;Nome</em><span class="tooltiptext">Il tuo cognome seguito dal tuo nome</span></span></code>',
			competenza: '',
			punteggio: 1,
		},
		specifica: {
			struttura_per_valutazione: {
				modello: 'DOM', // 'PLAINTEXT', 'DOM', 'CSSDOM', 'ASCIIDOC'
				analisi: 'Contenuto',
				selettore: 'html > head > title',
				contenuto: /Verifica\s+di\s+/i,
				callback: null,
			},
		},
	},
	{
		// Titoletti h1
		//'Intestazione livello 1', 'Inserisci nel corpo della pagina un\'<strong>intestazione di livello 1</strong> dal con contenuto <code>Intestazione di primo livello</code>'
		quesito: {
			descrizione_breve: 'Titoletto livello 1',
			descrizione:
				"Inserire <strong>l'intestazione di livello di sezionamento 1</strong> il contenuto dell'elemento titolo deve essere: <code>Titoletto sezione 1</code>",
			competenza: '',
			punteggio: 1,
		},
		specifica: {
			struttura_per_valutazione: {
				modello: 'DOM', // 'PLAINTEXT', 'DOM', 'CSSDOM', 'ASCIIDOC'
				analisi: 'Contenuto',
				selettore: 'html > body > h1',
				contenuto: /Titoletto\s+sezione\s+1/i,
				callback: null,
			},
		},
	},
	{
		// Titoletti h2
		//'Intestazione livello 1', 'Inserisci nel corpo della pagina un\'<strong>intestazione di livello 1</strong> dal con contenuto <code>Intestazione di primo livello</code>'
		quesito: {
			descrizione_breve: 'Titoletto livello 2',
			descrizione:
				"Inserire <strong>l'intestazione di livello di sezionamento 2</strong> il contenuto dell'elemento titolo deve essere: <code>Titoletto sezione 1.1</code>",
			competenza: '',
			punteggio: 1,
		},
		specifica: {
			struttura_per_valutazione: {
				modello: 'DOM', // 'PLAINTEXT', 'DOM', 'CSSDOM', 'ASCIIDOC'
				analisi: 'Contenuto',
				selettore: 'html > body > h2',
				contenuto: /Titoletto\s+sezione\s+1\.1/i,
				callback: null,
			},
		},
	},
	{
		// Titoletti h3
		quesito: {
			descrizione_breve: 'Titoletto livello 3',
			descrizione:
				"Inserire <strong>l'intestazione di livello di sezionamento 3</strong> il contenuto dell'elemento titolo deve essere: <code>Titoletto sezione 1.1.1</code>",
			competenza: '',
			punteggio: 1,
		},
		specifica: {
			struttura_per_valutazione: {
				modello: 'DOM', // 'PLAINTEXT', 'DOM', 'CSSDOM', 'ASCIIDOC'
				analisi: 'Contenuto',
				selettore: 'html > body > h3',
				contenuto: /Titoletto\s+sezione\s+1\.1\.1/i,
				callback: null,
			},
		},
	},
	{
		// Capoverso con id
		quesito: {
			descrizione_breve: 'Capoverso con id',
			descrizione:
				'Inserire un elemento <strong>capoverso</strong> <em>identificato</em> da <code>primocapoverso</code>  il contenuto  deve essere: <code>Il primo capoverso.</code>',
			competenza: '',
			punteggio: 1,
		},
		specifica: {
			struttura_per_valutazione: {
				modello: 'DOM', // 'PLAINTEXT', 'DOM', 'CSSDOM', 'ASCIIDOC'
				analisi: 'Contenuto',
				selettore: 'html > body > p#primocapoverso',
				contenuto: /Il\s+primo\s+capoverso/i,
				callback: null,
			},
		},
	},
	{
		// Elenchi non ordinati
		quesito: {
			descrizione_breve: 'Elenco non ordinato',
			descrizione:
				"Inserire un <strong>elenco non ordinato</strong> il cui <em>primo</em> <strong>elemento dell'elenco</strong> sia <code>Cerchio</code>",
			competenza: '',
			punteggio: 1,
		},
		specifica: {
			struttura_per_valutazione: {
				modello: 'DOM', // 'PLAINTEXT', 'DOM', 'CSSDOM', 'ASCIIDOC'
				analisi: 'Contenuto',
				selettore: 'html > body ul > li',
				contenuto: /cerchio/i,
				callback: null,
			},
		},
	},
	{
		// Elenchi ordinati
		quesito: {
			descrizione_breve: 'Elenco ordinato',
			descrizione:
				"Inserire un <strong>elenco ordinato</strong> il <em>terzo</em> <strong>elemento dell'elenco</strong> sia <code>terzo</code>",
			competenza: '',
			punteggio: 1,
		},
		specifica: {
			struttura_per_valutazione: {
				modello: 'DOM', // 'PLAINTEXT', 'DOM', 'CSSDOM', 'ASCIIDOC'
				analisi: 'Contenuto',
				selettore: 'html > body ol > li:nth-of-type(3)',
				contenuto: /terzo/i,
				callback: null,
			},
		},
	},
	{
		// Elenchi descrittivi
		quesito: {
			descrizione_breve: 'Elenco descrittivo',
			descrizione:
				'Inserire un <strong>elenco descrittivo</strong> con la definizione del <strong>termine</stong> <code>zero</code> con <strong>definizione</strong> <code>il primo numero naturale</code> ',
			competenza: '',
			punteggio: 1,
		},
		specifica: {
			struttura_per_valutazione: {
				modello: 'DOM', // 'PLAINTEXT', 'DOM', 'CSSDOM', 'ASCIIDOC'
				analisi: 'Contenuto',
				selettore: [ 'html > body dl > dt:nth-of-type(1)', 'html > body dl > dd:nth-of-type(1)' ],
				contenuto: [ /^\s*zero\s*$/i, /^\s*il\s+primo\s+numero\s+naturale/ ],
				callback: null,
			},
		},
	},
	{
		// Modifica del carattere tipografico
		quesito: {
			descrizione_breve: 'Enfasi',
			descrizione:
				'Inserire in un <strong>capoverso</strong> avente <em>classe</em> <code>enfasi</code> i blocchi di testo: <code>carattere in neretto</code>, <code>carattere in corsivo</code> e <code>carattere a spaziatura fissa</code>. I blocchi devono essere annotati per apparire nei rispettivi caratteri tipografici. Sono ammessi solo marcatori semantici',
			competenza: '',
			punteggio: 2,
		},
		specifica: {
			struttura_per_valutazione: {
				modello: 'DOM', // 'PLAINTEXT', 'DOM', 'CSSDOM', 'ASCIIDOC'
				analisi: 'Contenuto',
				selettore: [
					'html > body p.enfasi > strong',
					'html > body p.enfasi > em',
					'html > body p.enfasi > code',
				],
				contenuto: [
					/^\s*carattere in neretto\s*$/i,
					/^\s*carattere in corsivo\s*$/i,
					/\s*carattere a spaziatura fissa\s*/i,
				],
				callback: null,
			},
		},
	},
	{
		// Andare a capo
		quesito: {
			descrizione_breve: 'Andare a capo',
			descrizione:
				"Inserire in un <strong>capoverso</strong> avente <em>id</em> <code>soldati</code> i due blocchi di testo: <code>Si sta come</code>, e <code>d'autunno</code> separati da un elemento per andare <code>a capo</code>",
			competenza: '',
			punteggio: 1,
		},
		specifica: {
			struttura_per_valutazione: {
				modello: 'DOM', // 'PLAINTEXT', 'DOM', 'CSSDOM', 'ASCIIDOC'
				analisi: 'Contenuto',
				selettore: 'html > body p#soldati',
				contenuto: /Si sta come\s*(<br>|<br \/>(\s|\n)*d.*autunno)/i,
				callback: null,
			},
		},
	},
	{
		// Collegamento
		quesito: {
			descrizione_breve: 'Collegamento',
			descrizione:
				"Inserire un <stong>collegamento</strong> che punti all'indirizzo <code>http://www.gnu.org/</code> e che mostri il  testo <code>il progetto GNU</code>",
			competenza: '',
			punteggio: 1,
		},
		specifica: {
			struttura_per_valutazione: {
				modello: 'DOM', // 'PLAINTEXT', 'DOM', 'CSSDOM', 'ASCIIDOC'
				analisi: 'AttributoContenuto',
				selettore: 'html > body a',
				contenuto: /il progetto GNU/i,
				coppieChiaveValore: [ 'href', /http:\/\/www.gnu.org\// ],
			},
		},
	},
	{
		// Immagine
		quesito: {
			descrizione_breve: 'Immagine',
			descrizione:
				"Inserire un'<strong>immagine</strong> il cui <em>id</em> sia <code>gnu</code> <em>indirizzo</em> sia <code>http://www.gnu.org/graphics/gnu-head.jpg</code> e il <em>testo alternativo</em> sia <code>la testa di uno gnu</code>",
			competenza: '',
			punteggio: 3,
		},
		specifica: {
			struttura_per_valutazione: {
				modello: 'DOM', // 'PLAINTEXT', 'DOM', 'CSSDOM', 'ASCIIDOC'
				analisi: 'Attributo',
				selettore: 'html > body img#gnu',
				coppieChiaveValore: [
					[ 'src', 'alt' ],
					[ /http:\/\/www.gnu.org\/graphics\/gnu-head.jpg/, /la testa di uno gnu/i ],
				],
			},
		},
	},
	{
		// Tabella
		quesito: {
			descrizione_breve: 'Tabella',
			descrizione:
				"Inserire  una <strong>tabella</strong> composta di un'<strong>intestazione</strong> e di un <strong>corpo</strong>; l'intestazione contiene una riga con la <strong>cella d'intestazione</strong> dal testo <code>colonna 1</code>; il corpo contiene nella prima riga una <strong>cella</strong> con testo <code>dato 1</code>",
			competenza: '',
			punteggio: 3,
		},
		specifica: {
			struttura_per_valutazione: {
				modello: 'DOM', // 'PLAINTEXT', 'DOM', 'CSSDOM', 'ASCIIDOC'
				analisi: 'Contenuto',
				selettore: [
					'html > body table > thead > tr > th:first-child',
					'html > body table > tbody > tr > td:first-child',
				],
				contenuto: [ /^\s*colonna 1\s*$/i, /^\s*dato 1\s*$/i ],
				callback: null,
			},
		},
	},
	{
		// Figura
		quesito: {
			descrizione_breve: 'Figura',
			descrizione: `Inserire  una <strong>Figura</strong> composta di una <strong>didascalia</strong>
				e di una <strong>div</strong>;
				la didascalia contiene il testo <code>Figura 1</code>;
				la <code>div</code> ha come contenuto la parola <code>Listato</code>`,
			competenza: '',
			punteggio: 3,
		},
		specifica: {
			struttura_per_valutazione: {
				modello: 'DOM', // 'PLAINTEXT', 'DOM', 'CSSDOM', 'ASCIIDOC'
				analisi: 'Contenuto',
				selettore: [ 'html > body figure > figcaption', 'html > body figure > div' ],
				contenuto: [ /^\s*Figura 1\s*$/i, /^\s*Listato\s*$/i ],
				callback: null,
			},
		},
	},
	{
		// Annidamento
		quesito: {
			descrizione_breve: 'Annidamento',
			descrizione:
				"Creare un elemento <code>div</code> con annidato un elemento <code>p</code> con annidato un elemento <code>span</code>. Il contenuto dell'ultimo elemento &egrave; <code>span dentro p dentro div</code>",
			competenza: '',
			punteggio: 2,
		},
		specifica: {
			struttura_per_valutazione: {
				modello: 'DOM', // 'PLAINTEXT', 'DOM', 'CSSDOM', 'ASCIIDOC'
				analisi: 'Contenuto',
				selettore: 'html > body div > p > span',
				contenuto: /span\s* dentro\s* p\s* dentro\s* div/i,
				callback: null,
			},
		},
	},
];
// document.verbose = true;
