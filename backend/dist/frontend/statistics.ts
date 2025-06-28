
function showFeedback(message: string, type = 'info') {
    const feedback = document.getElementById('feedback');
    if (feedback) {
        feedback.textContent = message;
        feedback.className = `feedback ${type}`;
        setTimeout(() => {
            feedback.textContent = '';
            feedback.className = 'feedback';
        }, 5000);
    }
}

document.getElementById('importCsvForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const fileInput = document.getElementById('csvFile') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) {
        showFeedback('Te rugam sa selectezi un fisier CSV.', 'error');
        return;
    }
    try {
        const text = await file.text();
        const response = await fetch('/api/data/import/csv', {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: text
        });
        if (response.ok) {
            showFeedback('Import CSV finalizat cu succes!', 'success');
            fileInput.value = '';
        } else {
            showFeedback('Eroare la importul CSV.', 'error');
        }
    } catch (error) {
        showFeedback('Eroare la citirea fisierului CSV.', 'error');
    }
});


document.getElementById('importJsonForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const fileInput = document.getElementById('jsonFile') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) {
        showFeedback('Te rugam sa selectezi un fisier JSON.', 'error');
        return;
    }
    try {
        const text = await file.text();
        const response = await fetch('/api/data/import/json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: text
        });
        if (response.ok) {
            showFeedback('Import JSON finalizat cu succes!', 'success');
            fileInput.value = '';
        } else {
            showFeedback('Eroare la importul JSON.', 'error');
        }
    } catch (error) {
        showFeedback('Eroare la citirea fisierului JSON.', 'error');
    }
});

document.getElementById('importXmlForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const fileInput = document.getElementById('xmlFile') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) {
        showFeedback('Te rugam sa selectezi un fisier XML.', 'error');
        return;
    }
    try {
        const text = await file.text();
        const response = await fetch('/api/data/import/xml', {
            method: 'POST',
            headers: { 'Content-Type': 'application/xml' },
            body: text
        });
        if (response.ok) {
            showFeedback('Import XML finalizat cu succes!', 'success');
            fileInput.value = '';
        } else {
            showFeedback('Eroare la importul XML.', 'error');
        }
    } catch (error) {
        showFeedback('Eroare la citirea fisierului XML.', 'error');
    }
});
