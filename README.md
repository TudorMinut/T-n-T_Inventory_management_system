"# T-n-T - Sistem de Gestionare Stocuri

## Descriere
Aplicatie web pentru gestionarea articolelor, consumabilelor si pieselor de schimb cu functionalitati complete de administrare, notificari, import/export si statistici.

## Tehnologii Utilizate
- **Backend**: TypeScript cu modulul HTTP nativ (fara framework-uri)
- **Frontend**: HTML, CSS, JavaScript vanilla
- **Baza de Date**: PostgreSQL
- **Autentificare**: bcrypt pentru hashing-ul parolelor

## Caracteristici de Securitate

### Prevenirea SQL Injection
- Toate query-urile folosesc **parametri pregatiti** ($1, $2, etc.)
- Validarea tipurilor de date pentru toate input-urile
- Sanitizarea si validarea tuturor datelor de intrare

### Prevenirea Cross-Site Scripting (XSS)
- Sanitizarea automata a tuturor output-urilor HTML
- Folosirea `textContent` in loc de `innerHTML` in frontend
- Implementarea functiei `sanitizeHtml()` pentru toate datele afisate

### Alte Masuri de Securitate
- **Hashing-ul parolelor** cu bcrypt si salt
- **Validarea comprehensive** a email-urilor, parolelor si datelor
- **Headers de securitate**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
- **CORS configurabil** pentru productie vs dezvoltare
- **Validarea lungimii** input-urilor pentru a preveni overflow-urile

## Functionalitati
- Autentificare si autorizare utilizatori
- Gestionare categorii si articole (CRUD)
- Sistem de notificari pentru stocuri reduse
- Import/Export date (CSV, JSON, XML)
- Generare statistici (HTML, PDF)
- Panou de administrare pentru managementul utilizatorilor
- Masuri de securitate impotriva atacurilor comune

## Utilizarea Aplicatiei
1. Pornirea serverului: `npm run dev` in directorul backend
2. Accesarea aplicatiei: `http://localhost:3000`
3. Crearea contului de admin: `node createAdmin.js`

## Securitate si Conformitate
Aceasta aplicatie implementeaza masuri robuste de securitate conforme cu standardele industriei pentru prevenirea vulnerabilitatilor web comune (OWASP Top 10)."
