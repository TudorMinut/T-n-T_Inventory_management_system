# T-n-T

Aplicație Web pentru gestionarea stocurilor de articole esențiale, consumabile și piese de schimb dintr-o gospodărie, organizație sau întreprindere.

Proiectul urmărește cerința de a centraliza produse precum becuri, lemne pentru foc, condimente, toner, cosmetice, pahare de unică folosință, pioneze, medicamente de uz general sau piese de schimb pentru diverse echipamente, cu accent pe:

- organizare pe categorii;
- urmărirea cantităților disponibile;
- notificări la stoc redus;
- notificări vizibile în interfață și, opțional, prin email;
- import și export de date în formatele CSV, JSON și XML;
- generare de statistici în HTML și PDF.

## Arhitectură

![Diagrama arhitecturii](./Diagrama_C3_Web.png)

## Tehnologii folosite

### Frontend

- HTML
- CSS
- JavaScript livrat static din server

### Backend

- Node.js
- TypeScript
- server HTTP construit peste modulul nativ `http`
- PostgreSQL

### Alte biblioteci

- `pg` pentru acces la baza de date
- `bcrypt` pentru parole
- `nodemailer` pentru email
- `papaparse` pentru CSV
- `xml-js` pentru XML
- `pdfkit` pentru export PDF

### Infrastructură

- Docker
- Docker Compose

## Ce implementează proiectul în prezent

- autentificare de bază prin înregistrare și login;
- gestionare categorii;
- gestionare articole cu prag de notificare;
- generare automată de notificări atunci când `quantity <= notification_threshold`;
- trimitere email pentru notificările de stoc redus dacă SMTP este configurat;
- export date în CSV, JSON și XML;
- import date din CSV, JSON și XML;
- statistici simple despre articole în format HTML și PDF;
- interfață Web statică pentru login și dashboard.

## Observații importante

- Backend-ul nu folosește Express, deși README-ul vechi spunea asta.
- Serverul pornește un job periodic care verifică stocurile la fiecare `STOCK_CHECK_INTERVAL_MS`.
- Emailurile sunt trimise numai dacă variabilele SMTP sunt configurate. Altfel, notificările rămân doar în aplicație.
- Statistica exportată este una tabelară, bazată pe articolele și categoriile existente în baza de date.
- Importul se face din body-ul request-ului, nu prin upload multipart.

## Structura proiectului

```text
T-n-T/
|-- frontend/
|   |-- index.html
|   |-- login.html
|   |-- dashboard.html
|   `-- public/
|       `-- css/
|
|-- backend/
|   |-- data/
|   |   |-- database.sql
|   |   `-- database.json
|   |-- public/
|   |   `-- js/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- utils/
|   |   `-- server.ts
|   |-- Dockerfile
|   |-- package.json
|   `-- tsconfig.json
|
|-- docker-compose.yaml
|-- package.json
`-- README.md
```

## Model de date

Schema SQL inițială definește următoarele tabele:

- `users`
  - `id`
  - `username`
  - `password`
  - `email`
  - `created_at`
- `categories`
  - `id`
  - `name`
  - `description`
- `items`
  - `id`
  - `name`
  - `category_id`
  - `quantity`
  - `notification_threshold`
  - `created_at`
- `notifications`
  - `id`
  - `item_id`
  - `message`
  - `is_read`
  - `created_at`

## Configurare

Backend-ul citește următoarele variabile de mediu:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tnt_db
DB_USER=postgres
DB_PASSWORD=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=no-reply@example.com
STOCK_CHECK_INTERVAL_MS=30000
```

## Rulare cu Docker

Comanda principală:

```bash
docker compose up --build
```

Serviciile definite:

- `db` - PostgreSQL 16, inițializat cu `backend/data/database.sql`
- `backend` - serverul Node.js pe portul `3000`

După pornire:

- aplicația este disponibilă la `http://localhost:3000`
- pagina de login este servită la `/` sau `/login.html`
- dashboard-ul este servit la `/dashboard` sau `/dashboard.html`

## Rulare locală

1. Instalează dependențele:

```bash
npm install
cd backend
npm install
```

2. Pornește o instanță PostgreSQL și creează baza de date `tnt_db`.

3. Rulează scriptul SQL din `backend/data/database.sql`.

4. Configurează variabilele de mediu pentru backend.

5. Pornește serverul:

```bash
cd backend
npm run dev
```

## Funcționarea notificărilor

La pornirea serverului este creat un interval periodic. La fiecare execuție:

1. se caută articolele cu `quantity <= notification_threshold`;
2. se evită duplicarea aceleiași notificări pentru același articol în interval de 24 de ore;
3. se inserează notificarea în tabela `notifications`;
4. se trimite email către toți utilizatorii care au adresă de email, dacă SMTP este configurat.

## API endpoints

Mai jos este lista endpoint-urilor implementate efectiv în cod.

### Autentificare utilizatori

#### `POST /api/users/register`
Alias: `POST /users/register`

Body:

```json
{
  "username": "demo",
  "email": "demo@example.com",
  "password": "parola123"
}
```

Reguli:

- `username` obligatoriu
- `email` obligatoriu
- `password` obligatorie, minim 8 caractere

Răspuns `201`:

```json
{
  "id": 1,
  "username": "demo",
  "email": "demo@example.com"
}
```

#### `POST /api/users/login`
Alias: `POST /users/login`

Body:

```json
{
  "email": "demo@example.com",
  "password": "parola123"
}
```

Răspuns `200`:

```json
{
  "message": "Autentificare cu succes",
  "userId": 1
}
```

### Categorii

#### `GET /api/categories`

Returnează toate categoriile ordonate alfabetic.

Răspuns `200`:

```json
[
  {
    "id": 1,
    "name": "Electronice",
    "description": null
  }
]
```

#### `POST /api/categories`

Body:

```json
{
  "name": "Consumabile",
  "description": "Articole de uz curent"
}
```

#### `PUT /api/categories/:id`

Body:

```json
{
  "name": "Consumabile birou",
  "description": "Toner, hartie, pixuri"
}
```

#### `DELETE /api/categories/:id`

Răspuns `204` la ștergere reușită.

### Articole

#### `GET /api/items`

Returnează toate articolele ordonate descrescător după creare.

Răspuns `200`:

```json
[
  {
    "id": 1,
    "name": "Toner imprimanta",
    "category_id": 2,
    "quantity": 3,
    "notification_threshold": 5,
    "created_at": "2026-06-15T10:00:00.000Z"
  }
]
```

#### `POST /api/items`

Body:

```json
{
  "name": "Toner imprimanta",
  "category_id": 2,
  "quantity": 3,
  "notification_threshold": 5
}
```

Reguli:

- `name` obligatoriu
- `quantity` trebuie să fie număr `>= 0`
- `notification_threshold` trebuie să fie număr `>= 0`
- `category_id` poate lipsi sau poate fi `null`

#### `PUT /api/items/:id`

Body:

```json
{
  "name": "Toner imprimanta color",
  "category_id": 2,
  "quantity": 2,
  "notification_threshold": 4
}
```

#### `DELETE /api/items/:id`

Răspuns `204` la ștergere reușită.

### Notificări

#### `GET /api/notifications`

Returnează notificările împreună cu numele articolului.

Răspuns `200`:

```json
[
  {
    "id": 1,
    "message": "Stoc redus pentru articolul: Toner imprimanta. Cantitate ramasa: 3.",
    "created_at": "2026-06-15T10:00:00.000Z",
    "is_read": false,
    "item_name": "Toner imprimanta"
  }
]
```

#### `PUT /api/notifications/:id/read`

Marchează notificarea ca citită.

#### `DELETE /api/notifications/:id`

Șterge notificarea.

### Export date

#### `GET /api/data/export/csv`

Descarcă fișierul `items.csv`.

#### `GET /api/data/export/json`

Descarcă fișierul `items.json`.

#### `GET /api/data/export/xml`

Descarcă fișierul `items.xml`.

Datele exportate includ:

- `name`
- `category`
- `quantity`
- `notification_threshold`
- `created_at`

### Import date

#### `POST /api/data/import/json`

Body exemplu:

```json
[
  {
    "name": "Bec LED",
    "category": "Electronice",
    "quantity": 10,
    "notification_threshold": 3
  }
]
```

#### `POST /api/data/import/csv`

Body exemplu:

```csv
name,category,quantity,notification_threshold
Bec LED,Electronice,10,3
Pahare,Consumabile,50,10
```

#### `POST /api/data/import/xml`

Body exemplu:

```xml
<items>
  <item>
    <name>Bec LED</name>
    <category>Electronice</category>
    <quantity>10</quantity>
    <notification_threshold>3</notification_threshold>
  </item>
</items>
```

Comportament la import:

- dacă categoria nu există, este creată automat;
- dacă `notification_threshold` lipsește, se folosește valoarea implicită `5`.

### Statistici

#### `GET /api/stats/html`

Generează un document HTML cu tabel de articole.

#### `GET /api/stats/pdf`

Generează și descarcă un PDF numit `statistici.pdf`.

#### `GET /api/statistics/html`

Rută suplimentară expusă din modulul de date, cu același scop: raport HTML.

#### `GET /api/statistics/pdf`

Rută suplimentară expusă din modulul de date, cu același scop: raport PDF.

## Resurse frontend servite de backend

- `GET /` -> `frontend/login.html`
- `GET /login.html` -> `frontend/login.html`
- `GET /dashboard` -> `frontend/dashboard.html`
- `GET /dashboard.html` -> `frontend/dashboard.html`
- `GET /public/*` -> fișiere statice din `frontend/public`

## Limitări curente

- Nu există token-uri, sesiuni sau JWT; login-ul doar validează credențialele și întoarce `userId`.
- Nu există roluri sau permisiuni pentru grupuri de utilizatori.
- Nu există endpoint dedicat pentru programarea notificărilor la date fixe; în prezent este implementată verificarea periodică a stocului redus.
- Importul nu folosește `multipart/form-data`.
- Documentele statistice sunt minimaliste și nu includ grafice.
- Nu există suită de teste automată în proiect.

## Posibile extinderi

- autentificare cu sesiuni sau JWT;
- roluri pentru utilizatori și notificări pe grupuri;
- reguli de mentenanță pentru echipamente, nu doar praguri de stoc;
- dashboard cu grafice reale;
- validare mai strictă pentru importuri;
- filtre și căutare pentru articole și notificări.
