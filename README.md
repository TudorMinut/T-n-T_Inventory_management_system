"# T-n-T - Sistem de Gestionare Stocuri

## Descriere
Aplicație web pentru gestionarea articolelor, consumabilelor și pieselor de schimb cu funcționalități complete de administrare, notificări, import/export și statistici.

## Tehnologii Utilizate
- **Backend**: TypeScript cu modulul HTTP nativ (fără framework-uri)
- **Frontend**: HTML, CSS, JavaScript vanilla
- **Baza de Date**: PostgreSQL
- **Autentificare**: bcrypt pentru hashing-ul parolelor

## Caracteristici de Securitate

### Prevenirea SQL Injection
- Toate query-urile folosesc **parametri pregătiți** ($1, $2, etc.)
- Validarea tipurilor de date pentru toate input-urile
- Sanitizarea și validarea tuturor datelor de intrare

### Prevenirea Cross-Site Scripting (XSS)
- Sanitizarea automată a tuturor output-urilor HTML
- Folosirea `textContent` în loc de `innerHTML` în frontend
- Implementarea funcției `sanitizeHtml()` pentru toate datele afișate

### Alte Măsuri de Securitate
- **Hashing-ul parolelor** cu bcrypt și salt
- **Validarea comprehensive** a email-urilor, parolelor și datelor
- **Headers de securitate**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
- **CORS configurabil** pentru producție vs dezvoltare
- **Validarea lungimii** input-urilor pentru a preveni overflow-urile

## Funcționalități
- Autentificare și autorizare utilizatori
- Gestionare categorii și articole (CRUD)
- Sistem de notificări pentru stocuri reduse
- Import/Export date (CSV, JSON, XML)
- Generare statistici (HTML, PDF)
- Panou de administrare pentru managementul utilizatorilor
- Măsuri de securitate împotriva atacurilor comune

## Utilizarea Aplicației
1. Pornirea serverului: `npm run dev` în directorul backend
2. Accesarea aplicației: `http://localhost:3000`
3. Crearea contului de admin: `node createAdmin.js`

## Securitate și Conformitate
Această aplicație implementează măsuri robuste de securitate conforme cu standardele industriei pentru prevenirea vulnerabilităților web comune (OWASP Top 10)." 
