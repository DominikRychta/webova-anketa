const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const RESPONSES_FILE = path.join(__dirname, 'responses.json');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

function ensureResponsesFile() {
    if (!fs.existsSync(RESPONSES_FILE)) {
        fs.writeFileSync(RESPONSES_FILE, '[]', 'utf8');
    }
}

function readResponses() {
    ensureResponsesFile();
    try {
        const raw = fs.readFileSync(RESPONSES_FILE, 'utf8').trim();
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        return [];
    }
}

function writeResponses(responses) {
    fs.writeFileSync(RESPONSES_FILE, JSON.stringify(responses, null, 2), 'utf8');
}

function loadPoll() {
    delete require.cache[require.resolve('./survey')];
    return require('./survey');
}

function getTotalResponses(poll) {
    return readResponses().filter((response) => response.surveyId === poll.id).length;
}

function buildResults(poll, responses) {
    const surveyResponses = responses.filter((response) => response.surveyId === poll.id);
    const total = surveyResponses.length;
    const results = {};
    const chartData = {};

    poll.questions.forEach((question) => {
        if (Array.isArray(question.options) && question.options.length > 0) {
            const counts = question.options.map((option) => {
                const count = surveyResponses.reduce((sum, response) => {
                    return sum + (response.answers[question.id] === option ? 1 : 0);
                }, 0);

                return {
                    label: option,
                    count,
                    percent: total > 0 ? Math.round((count / total) * 100) : 0,
                };
            });

            results[question.id] = counts;
            chartData[question.id] = {
                labels: counts.map((item) => item.label),
                values: counts.map((item) => item.count),
            };
        } else {
            results[question.id] = surveyResponses
                .map((response) => response.answers[question.id])
                .filter(Boolean);
        }
    });

    return { results, chartData, total };
}

app.get('/', (req, res) => {
    const poll = loadPoll();
    res.render('index', {
        poll,
        totalResponses: getTotalResponses(poll),
        error: null,
    });
});

app.post('/submit', (req, res) => {
    const poll = loadPoll();
    const respondentName = String(req.body.respondentName || '').trim();
    const answers = {};
    const validationErrors = [];

    if (respondentName.length < 2) {
        validationErrors.push('Jméno musí mít alespoň 2 znaky.');
    }

    poll.questions.forEach((question) => {
        const rawAnswer = String(req.body[`q_${question.id}`] || '').trim();

        if (rawAnswer.length === 0) {
            validationErrors.push(`Otázka "${question.text}" je povinná.`);
            return;
        }

        if (Array.isArray(question.options) && !question.options.includes(rawAnswer)) {
            validationErrors.push(`Neplatná odpověď pro otázku "${question.text}".`);
            return;
        }

        answers[question.id] = rawAnswer;
    });

    if (validationErrors.length > 0) {
        return res.status(400).render('index', {
            poll,
            totalResponses: getTotalResponses(poll),
            error: validationErrors[0],
        });
    }

    const responses = readResponses();
    responses.push({
        surveyId: poll.id,
        respondentName,
        answers,
        submittedAt: new Date().toISOString(),
    });
    writeResponses(responses);

    res.redirect('/results');
});

app.get('/results', (req, res) => {
    const poll = loadPoll();
    const allResponses = readResponses();
    const { results, chartData, total } = buildResults(poll, allResponses);

    res.render('results', {
        poll,
        results,
        chartData,
        totalResponses: total,
    });
});

app.listen(PORT, () => {
    console.log(`Server běží na portu ${PORT}`);
});