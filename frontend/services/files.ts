import { $ } from './dom';
import { api } from './api';

export function showFeedback(message: string, type = 'info') {
    const feedback = $('feedback');
    if (feedback) {
        feedback.textContent = message;
        feedback.className = `feedback ${type}`;
        setTimeout(() => {
            feedback.textContent = '';
            feedback.className = 'feedback';
        }, 5000);
    }
}

export function handleFileUpload(formId: string, fileInputId: string, url: string) {
    const form = $(formId);
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById(fileInputId) as HTMLInputElement;
        const file = fileInput?.files?.[0];

        if (!file) {
            showFeedback(`Te rugam sa selectezi un fisier.`, 'error');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api<any>(url, {
                method: 'POST',
                body: formData,
                headers: {}
            });

            if (response.message) {
                showFeedback(response.message, 'success');
                if (fileInput) fileInput.value = '';
            } else {
                showFeedback('Eroare la import.', 'error');
            }
        } catch (error) {
            const err = error as Error;
            showFeedback(err.message, 'error');
        }
    });
}
