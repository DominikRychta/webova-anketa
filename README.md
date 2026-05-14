# Webová anketa v Node.js (Express + EJS)

Školní projekt serverové webové aplikace v Node.js. Aplikace zobrazuje formulář ankety, ukládá odpovědi do JSON souboru a na samostatné stránce vykresluje výsledky včetně statistik a grafů.

Aktuální verze projektu je tematicky zaměřena na **hudbu**.

## Použité technologie

- Node.js
- Express
- EJS
- body-parser
- fs (vestavěný modul Node.js)
- Chart.js (na stránce výsledků přes CDN)

## Funkce aplikace

- Dynamické načtení definice ankety ze souboru `survey.js`
- Vykreslení formuláře v EJS (`views/index.ejs`)
- Serverová validace vstupních dat (povinné odpovědi, kontrola možností)
- Ukládání odpovědí do `responses.json`
- Zobrazení výsledků (`views/results.ejs`):
	- uzavřené otázky: počet + procenta
	- otevřené otázky: seznam textových odpovědí
- Grafické zobrazení uzavřených odpovědí pomocí doughnut grafů (Chart.js)
- Responsivní vzhled (`public/css/style.css`)

## Struktura projektu

```
node-anketa/
├── index.js
├── survey.js
├── responses.json
├── package.json
├── README.md
├── public/
│   └── css/
│       └── style.css
└── views/
		├── index.ejs
		└── results.ejs
```

## Instalace a spuštění

1. Instalace závislostí:

```bash
npm install
```

2. Spuštění aplikace:

```bash
npm start
```

3. Otevři v prohlížeči:

```text
http://localhost:3000
```

## Dostupné routy

- `GET /` – formulář ankety
- `POST /submit` – zpracování a uložení odpovědí
- `GET /results` – stránka výsledků a grafů

## Datový model odpovědi

Každá uložená odpověď v `responses.json` má strukturu:

```json
{
	"surveyId": "music-survey-1",
	"respondentName": "Jméno respondenta",
	"answers": {
		"question_id": "odpověď"
	},
	"submittedAt": "2026-05-14T18:39:49.307Z"
}
```

## Poznámky k implementaci

- Pokud `responses.json` neexistuje, aplikace ho vytvoří automaticky jako prázdné pole `[]`.
- Definice ankety je oddělená v `survey.js`, takže lze snadno měnit otázky bez úprav hlavní logiky serveru.
- Výpočty statistik probíhají na serveru v `index.js`.

## NPM skripty

- `npm start` – spustí server (`node index.js`)
