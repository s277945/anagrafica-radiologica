# Anagrafica Radiologica

Applicazione **full‑stack** per la gestione di un’anagrafica radiologica con:

- **albero organizzativo** (Organizzazione → Contenitori → …) consultabile via API e frontend;
- **creazione/gestione Apparecchiature** radiologiche con validazioni di business (es. seriale univoco, data non futura, coerenza con organizzazione/contenitore).

## Indice

1. [Panoramica e architettura](#panoramica-e-architettura)
2. [Scelte tecnologiche](#scelte-tecnologiche)
3. [Prerequisiti](#prerequisiti)
   - [Windows](#windows)
   - [IntelliJ IDEA](#intellij-idea)
4. [Setup ambiente](#setup-ambiente)
5. [Database](#database)
6. [Build e avvio (locale)](#build-e-avvio-locale)
7. [Docker Compose](#docker-compose)
8. [API-first e OpenAPI](#api-first-e-openapi)
9. [Modello dati e gerarchia](#modello-dati-e-gerarchia)
10. [Sicurezza](#sicurezza)
11. [Frontend (React/Vite/TypeScript)](#frontend-reactvitetypescript)
12. [Configurazione e variabili d’ambiente](#configurazione-e-variabili-dambiente)
13. [Test](#test)
14. [Troubleshooting](#troubleshooting)
15. [DevOps / Packaging WAR](#devops--packaging-war)
16. [Gitignore](#gitignore)
17. [Licenza](#licenza)

---

## Panoramica e architettura

Il progetto è composto da:

- **Backend**: Spring Boot (Java 21) + JPA/Hibernate + PostgreSQL, API documentate con OpenAPI/Swagger.
- **Frontend**: React + Vite + TypeScript, data-fetching con **TanStack Query**, client API generato da **Kubb** a partire dallo YAML OpenAPI del backend.

### Runtime e routing

- Il backend (Java/Spring Boot) espone endpoint REST sotto `/api/**` (con `server.servlet.context-path=/anagrafica`, quindi a runtime: `/anagrafica/api/**`).
- Il frontend (Vite/React) consuma le API tramite client generato (Kubb) e gestisce cache/invalidation con TanStack Query.
- Persistenza su PostgreSQL. In sviluppo è prevista anche la possibilità di H2 console (abilitata nelle regole di sicurezza), ma la configurazione principale è PostgreSQL.

---

## Scelte tecnologiche

### Backend

- Java **21**
- Spring Boot **3.3.2**
- Spring Web, Spring Data JPA (Hibernate)
- Spring Security (Basic Auth, utenti **in-memory**)
- `springdoc-openapi` / Swagger UI
- Database: PostgreSQL (docker-compose: `postgres:16-alpine`)
- Packaging: **WAR** (vedi `pom.xml`)

### Frontend

- React **18**
- Vite **5**
- TypeScript **5**
- **@tanstack/react-query** (TanStack Query v5)
- Client API generato con **Kubb**
- Test: **Vitest** (script `npm run test`, `npm run coverage`)

---

## Prerequisiti

### Windows

- **Git**
- **JDK 21** (consigliato Temurin/Adoptium)
- **Maven** (opzionale: è incluso Maven Wrapper `mvnw.cmd`)
- **Node.js** (consigliato LTS) + npm
- **Docker Desktop** (per database e/o stack completo via Compose)

### IntelliJ IDEA

Impostazioni consigliate:

- SDK progetto: **JDK 21**
- Import Maven: abilitato (il progetto backend è Maven)
- Plugin consigliati:
  - Spring Boot
  - Lombok (se presente/necessario)
  - Docker (opzionale)
  - Node.js (per gestire il frontend)

---

## Setup ambiente

Clona il repository e posizionati nella root del progetto:

```bash
git clone <URL_REPO>
cd anagrafica-radiologica
```

---

## Database

In sviluppo si utilizza PostgreSQL. Valori di default (vedi `docker-compose.yml`):

| Parametro | Valore |
|---|---|
| DB | `anagrafica_radiologica` |
| User | `postgres` |
| Password | `postgres` |
| Host/Port | `localhost:5432` |

Avvio del DB con Docker:

```bash
docker compose up -d db
```

---

## Build e avvio (locale)

### Backend

Build (crea la WAR in `target/`):

```bash
./mvnw clean package
```

Avvio:

```bash
./mvnw spring-boot:run
```

L’applicazione sarà raggiungibile su:

- API: `http://localhost:8080/anagrafica/api/`
- Swagger UI: `http://localhost:8080/anagrafica/swagger-ui/index.html`

> Nota: se lanci il backend senza Docker, assicurati che PostgreSQL sia raggiungibile e che le proprietà datasource siano coerenti.

### Frontend

Da `frontend/`:

```bash
npm install
npm run dev
```

Build produzione:

```bash
npm run build
npm run preview
```

---

## Docker Compose

Per avviare **database + applicazione** (backend containerizzato):

```bash
docker compose up --build
```

Servizi:

- `db`: PostgreSQL 16
- `app`: immagine costruita da `Dockerfile` (esegue la WAR con `java -jar`)

Variabili usate dal servizio `app` (vedi `docker-compose.yml`):

- `SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/anagrafica_radiologica`
- `SPRING_DATASOURCE_USERNAME=postgres`
- `SPRING_DATASOURCE_PASSWORD=postgres`

---

## API-first e OpenAPI

L’approccio è **API-first**:

- il backend pubblica la specifica OpenAPI (Swagger);
- il frontend genera il client tipizzato a partire dalla specifica usando **Kubb**.

Comandi utili (frontend):

```bash
npm run kubb:gen
```

Percorsi utili:

- Specifica/OpenAPI e Swagger UI: vedi sezione [Build e avvio (locale)](#build-e-avvio-locale).

---

## Modello dati e gerarchia

Concetti principali:

- **Organizzazione**: nodo radice dell’albero.
- **Contenitori** (o unità organizzative/strutturali): nodi gerarchici associati all’organizzazione.
- **Apparecchiature**: entità “foglia” associata a un nodo (organizzazione/contenitore) e soggetta a regole di business.

La gerarchia è esposta via API e rappresentata anche a frontend.

> Se nel progetto sono presenti migrazioni/schema o entità JPA, fare riferimento al package `src/main/java` e alle classi `@Entity` per i dettagli puntuali.

---

## Sicurezza

- Autenticazione: **HTTP Basic Auth**
- Utenti: **in-memory** (configurazione lato backend)
- Swagger UI e (se abilitata) H2 console sono gestite secondo le regole definite in Spring Security.

Suggerimento: per ambienti non di sviluppo, prevedere un provider utenti esterno e secret management (es. variabili d’ambiente/ Vault).

---

## Frontend (React/Vite/TypeScript)

Caratteristiche:

- **React + TypeScript** per UI e typing forte
- **TanStack Query** per cache, refetch, invalidation e gestione stato server
- **Kubb** per generare un client API tipizzato a partire da OpenAPI (riduce boilerplate e drift tra backend e frontend)

Struttura e configurazioni specifiche sono nella cartella `frontend/`.

---

## Configurazione e variabili d’ambiente

### Backend

Le proprietà principali possono essere impostate via:

- `application.properties` / `application.yml`
- variabili d’ambiente Spring Boot (es. `SPRING_DATASOURCE_*`)

Esempio (usato in Docker Compose):

```bash
export SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/anagrafica_radiologica"
export SPRING_DATASOURCE_USERNAME="postgres"
export SPRING_DATASOURCE_PASSWORD="postgres"
```

### Frontend

Vite supporta `.env`, `.env.local`, ecc. (vedi sezione [Gitignore](#gitignore)).

Esempio tipico (se previsto dal progetto) è una variabile tipo:

- `VITE_API_BASE_URL=...`

> Nota: verifica i nomi effettivi delle variabili leggendo `frontend/` (es. `src/config` o file equivalenti) se presenti.

---

## Test

### Backend

```bash
./mvnw test
```

### Frontend

Da `frontend/`:

```bash
npm run test
npm run coverage
```

---

## Troubleshooting

### Porta 8080/5432 occupata

- Cambia la porta nel `docker-compose.yml` o chiudi il processo che la sta usando.
- Per PostgreSQL, puoi mappare ad esempio `5433:5432`.

### Errore di connessione al DB

- Se sei in locale: verifica host/porta e credenziali.
- Se sei in Docker: usa `db` come hostname (come da Compose) e attendi l’healthcheck.

### Swagger UI non raggiungibile

- Verifica il `context-path` `/anagrafica`.
- URL atteso: `http://localhost:8080/anagrafica/swagger-ui/index.html`

### Client API non aggiornato (frontend)

- Rigenera il client con:

```bash
npm run kubb:gen
```

---

## DevOps / Packaging WAR

Il progetto backend è configurato con packaging **WAR** (`<packaging>war</packaging>` in `pom.xml`).

Comandi:

```bash
./mvnw clean package
```

Artefatto risultante:

- `target/anagrafica-radiologica-0.0.1-SNAPSHOT.war`

Il `Dockerfile` esegue la WAR tramite:

```bash
java -jar app.war
```

---

## Gitignore

Il progetto ignora (tra gli altri):

- `node_modules/`, `dist/`
- `target/` (build Maven)
- file `.env*` locali
- log e cache tooling
- report di coverage

Vedi `.gitignore` per la lista completa.

---

## Licenza

Questo progetto è rilasciato sotto licenza **MIT**. Vedi il file [`LICENSE`](LICENSE).
