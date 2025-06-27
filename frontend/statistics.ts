import { $ } from "./services/dom";
import { logout } from "./services/auth";
import { handleFileUpload } from "./services/files";

// Verificare autentificare
if (!localStorage.getItem('userId')) {
    window.location.href = '/login.html';
}

// Atasare evenimente
$('logoutBtn')?.addEventListener('click', logout);

// Navigare
$('dashboardBtn')?.addEventListener('click', () => window.location.href = '/dashboard.html');
$('docsBtn')?.addEventListener('click', () => window.location.href = '/documentation');

// Statistici
$('viewStatsHtmlBtn')?.addEventListener('click', () => window.open('/api/statistics/html', '_blank'));
$('downloadStatsPdfBtn')?.addEventListener('click', () => window.open('/api/statistics/pdf', '_blank'));

// Export
$('exportCsvBtn')?.addEventListener('click', () => window.location.href = '/api/data/export/csv');
$('exportJsonBtn')?.addEventListener('click', () => window.location.href = '/api/data/export/json');
$('exportXmlBtn')?.addEventListener('click', () => window.location.href = '/api/data/export/xml');


// Import
handleFileUpload('importCsvForm', 'csvFile', '/api/data/import/csv');
handleFileUpload('importJsonForm', 'jsonFile', '/api/data/import/json');
handleFileUpload('importXmlForm', 'xmlFile', '/api/data/import/xml');
