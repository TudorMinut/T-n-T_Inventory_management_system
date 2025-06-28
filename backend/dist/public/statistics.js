"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a, _b, _c;
function showFeedback(message, type = 'info') {
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
(_a = document.getElementById('importCsvForm')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', function (e) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        e.preventDefault();
        const fileInput = document.getElementById('csvFile');
        const file = (_a = fileInput === null || fileInput === void 0 ? void 0 : fileInput.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file) {
            showFeedback('Te rugam sa selectezi un fisier CSV.', 'error');
            return;
        }
        try {
            const text = yield file.text();
            const response = yield fetch('/api/data/import/csv', {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: text
            });
            if (response.ok) {
                showFeedback('Import CSV finalizat cu succes!', 'success');
                fileInput.value = '';
            }
            else {
                showFeedback('Eroare la importul CSV.', 'error');
            }
        }
        catch (error) {
            showFeedback('Eroare la citirea fisierului CSV.', 'error');
        }
    });
});
(_b = document.getElementById('importJsonForm')) === null || _b === void 0 ? void 0 : _b.addEventListener('submit', function (e) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        e.preventDefault();
        const fileInput = document.getElementById('jsonFile');
        const file = (_a = fileInput === null || fileInput === void 0 ? void 0 : fileInput.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file) {
            showFeedback('Te rugam sa selectezi un fisier JSON.', 'error');
            return;
        }
        try {
            const text = yield file.text();
            const response = yield fetch('/api/data/import/json', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: text
            });
            if (response.ok) {
                showFeedback('Import JSON finalizat cu succes!', 'success');
                fileInput.value = '';
            }
            else {
                showFeedback('Eroare la importul JSON.', 'error');
            }
        }
        catch (error) {
            showFeedback('Eroare la citirea fisierului JSON.', 'error');
        }
    });
});
(_c = document.getElementById('importXmlForm')) === null || _c === void 0 ? void 0 : _c.addEventListener('submit', function (e) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        e.preventDefault();
        const fileInput = document.getElementById('xmlFile');
        const file = (_a = fileInput === null || fileInput === void 0 ? void 0 : fileInput.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file) {
            showFeedback('Te rugam sa selectezi un fisier XML.', 'error');
            return;
        }
        try {
            const text = yield file.text();
            const response = yield fetch('/api/data/import/xml', {
                method: 'POST',
                headers: { 'Content-Type': 'application/xml' },
                body: text
            });
            if (response.ok) {
                showFeedback('Import XML finalizat cu succes!', 'success');
                fileInput.value = '';
            }
            else {
                showFeedback('Eroare la importul XML.', 'error');
            }
        }
        catch (error) {
            showFeedback('Eroare la citirea fisierului XML.', 'error');
        }
    });
});
