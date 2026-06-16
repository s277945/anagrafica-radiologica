# Nota Architetturale – Progetto "Anagrafica Radiologica"

## 0. Setup Ambiente e Istruzioni di Installazione

### 0.1 Prerequisiti

| Software | Versione | Note |
|----------|----------|------|
| **Java JDK** | 21 LTS | Eclipse Temurin consigliato (scaricabile da IntelliJ 2026.1.3: File → Project Structure → SDKs → + → Download JDK) |
| **Maven** | 3.9.9+ | Incluso come wrapper (`mvnw`/`mvnw.cmd`) nel progetto. Per generarlo: `mvn -N wrapper:wrapper` |
| **PostgreSQL** | 15+ | Database relazionale |
| **Node.js** | 20.x | Scaricato automaticamente dal `frontend-maven-plugin` (non serve installazione manuale) |

#### Installazione Java 21 (Windows)
1. Aprire IntelliJ IDEA 2026.1.3
2. **File → Project Structure → Platform Settings → SDKs**
3. Cliccare **"+" → Download JDK…**
4. Selezionare **Version: 21**, Vendor: **Eclipse Temurin (Adoptium)**
5. Confermare e scaricare
6. Impostare come Project SDK

#### Configurazione JAVA_HOME (se Maven non trova il JDK)
```powershell
# Verificare il path del JDK scaricato da IntelliJ
Get-ChildItem "$env:USERPROFILE\.jdks"

# Impostare JAVA_HOME (sessione corrente)
$env:JAVA_HOME = "C:\Users\<utente>\.jdks\temurin-21.0.11"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

# Renderlo permanente
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Users\<utente>\.jdks\temurin-21.0.11", "Machine")
```

#### Installazione PostgreSQL (Windows)
1. Scaricare l'installer da https://www.postgresql.org/download/windows/
2. Installare con le opzioni predefinite (porta 5432, password `postgres`)
3. **Non selezionare Stack Builder** al termine dell'installazione → deselezionare e cliccare Finish

### 0.2 Configurazione Database

```sql
-- Aprire pgAdmin o psql
CREATE DATABASE anagrafica_radiologica;
-- Le tabelle vengono create automaticamente dallo schema.sql all'avvio
```

### 0.3 Configurazione IDE (IntelliJ IDEA 2026.1.3)

#### IntelliJ Ultimate (consigliato)
Il supporto Spring Boot è integrato. Nessun plugin aggiuntivo necessario.

#### IntelliJ Community
Installare da **File → Settings → Plugins → Marketplace**:
- **Spring Boot Helper** — autocompletamento properties, icone gutter per mapping REST
- **JPA Buddy** — navigazione entità JPA, generazione DDL

#### Configurazione obbligatoria (entrambe le edizioni)
- **File → Settings → Build, Execution, Deployment → Compiler → Annotation Processors** → spuntare **"Enable annotation processing"** (necessario per Lombok)
- **File → Project Structure → Project** → impostare Project SDK su JDK 21

### 0.4 Build e Avvio

```powershell
# Posizionarsi nella root del progetto
cd H:\cyberqual\anagrafica-radiologica

# Prima volta: generare il Maven wrapper
mvn -N wrapper:wrapper

# Build completa (genera API da OpenAPI, compila backend, builda frontend, produce WAR)
.\mvnw.cmd clean package

# Avvio in locale (con Tomcat embedded)
.\mvnw.cmd spring-boot:run
```

**URL di verifica:**
| Risorsa | URL |
|---------|-----|
| Frontend | http://localhost:8080/anagrafica/ |
| Swagger UI | http://localhost:8080/anagrafica/swagger-ui.html |
| OpenAPI JSON | http://localhost:8080/anagrafica/v3/api-docs |
| API base | http://localhost:8080/anagrafica/api/ |

**Esempi di chiamata:**
```bash
# GET albero (utente USER)
curl -u user:user http://localhost:8080/anagrafica/api/organizzazioni/1/tree

# POST apparecchiatura (utente ADMIN)
curl -u admin:admin -X POST http://localhost:8080/anagrafica/api/apparecchiature \
  -H "Content-Type: application/json" \
  -d '{"nome":"TAC GE Revolution","tipologia":"TAC","numeroDiSerie":"SN-001","dataInstallazione":"2024-03-15","organizzazioneId":1}'
```

### 0.5 Esecuzione Test

```powershell
# Tutti i test (unit + integration, usa H2 in-memory)
.\mvnw.cmd test

# Solo unit test
.\mvnw.cmd test -Dtest="*ServiceTest"

# Solo integration test
.\mvnw.cmd test -Dtest="*IntegrationTest"
```

I test di integrazione usano il profilo `test` con database H2 in-memory: non richiedono PostgreSQL attivo.

### 0.6 Deploy su Tomcat 10.1+

1. Build: `.\mvnw.cmd clean package -DskipTests`
2. Copiare `target/anagrafica-radiologica.war` nella cartella `webapps/` di Tomcat
3. Avviare Tomcat → l'app sarà disponibile su `http://<host>:8080/anagrafica-radiologica/`

### 0.7 Troubleshooting

| Problema | Soluzione |
|----------|-----------|
| `mvn` non riconosciuto | Usare `.\mvnw.cmd` oppure installare Maven e aggiungere al PATH |
| `release version 21 not supported` | Impostare `JAVA_HOME` sul JDK 21 (vedi sezione 0.1) |
| `npm ci` fallisce per mancanza di `package-lock.json` | Eseguire `cd frontend && npm install` poi ripetere il build |
| Connessione DB rifiutata | Verificare che PostgreSQL sia attivo e il database `anagrafica_radiologica` esista |
| Porta 8080 occupata | Aggiungere `server.port=8081` in `application.yml` |

---

## 1. Scelte Tecnologiche

| Componente | Scelta | Motivazione |
|------------|--------|-------------|
| Linguaggio | **Java 21 LTS** | Ultima versione LTS; supporto a record, pattern matching, text blocks, virtual threads |
| Framework | **Spring Boot 3.3.2** | Standard de facto per microservizi Java enterprise; ecosistema maturo |
| API Design | **OpenAPI 3.0 + openapi-generator-maven-plugin** | Approccio API-first: il contratto YAML è la single source of truth; interfacce e DTO generati automaticamente |
| Documentazione API | **springdoc-openapi 2.6 + Swagger UI** | UI interattiva per esplorare e testare gli endpoint, generata dal contratto |
| Database | **PostgreSQL 15** | Affidabilità, supporto nativo a CTE ricorsive (`WITH RECURSIVE`), indici avanzati |
| ORM | **Spring Data JPA / Hibernate** | Produttività; mapping dichiarativo delle entità |
| Sicurezza | **Spring Security** (HTTP Basic + utenti in-memory) | Simulazione ruoli ADMIN/USER senza complessità OAuth2 |
| Build | **Maven + frontend-maven-plugin** | Build unificata backend+frontend → singolo WAR |
| Frontend | **React 18 + TypeScript + Vite** | Tipizzazione statica, build veloce, componente tree-view ricorsivo |
| Packaging | **WAR** | Compatibile con application server aziendali (Tomcat 10.1+, WildFly 27+) |
| Test | **JUnit 5 + Mockito + MockMvc + H2** | Unit test isolati + integration test con DB in-memory |

---

## 2. Approccio API-First (OpenAPI)

### Principio
Il contratto API è definito nel file `src/main/resources/openapi/api.yaml`. Da questo file vengono generate automaticamente:
- **Interfacce Java** dei controller (package `com.anagrafica.radiologica.api`)
- **DTO** di request/response (package `com.anagrafica.radiologica.api.model`)

I controller implementano le interfacce generate → **il codice è sempre allineato al contratto**.

### Vantaggi
- **Single source of truth**: il YAML definisce il contratto, non il codice
- **Validazione automatica**: le constraint definite nel YAML (required, minLength, enum) diventano annotazioni Jakarta Validation
- **Swagger UI gratuita**: springdoc-openapi espone automaticamente la documentazione interattiva
- **Condivisibilità**: il file YAML può essere condiviso con team frontend, QA, partner esterni
- **Generazione client**: dallo stesso YAML è possibile generare client TypeScript, Python, ecc.

### Flusso di build
```
api.yaml → openapi-generator-maven-plugin → Interfacce + DTO (target/generated-sources/)
                                                    ↓
                                     Controller implements Interface
```

---

## 3. Modello Dati e Gerarchia

### Strategia: Adjacency List con `parent_id`

La relazione ricorsiva dei Contenitori è gestita tramite **Adjacency List**: ogni record `contenitori` ha un campo `parent_id` nullable che punta al contenitore padre.

**Vantaggi:**
- Semplicità di inserimento/modifica
- Query ricorsive performanti con CTE PostgreSQL (`WITH RECURSIVE`)
- Nessun vincolo sulla profondità dell'albero

### Schema ER

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────────┐
│  organizzazioni │       │   contenitori   │       │   apparecchiature   │
├─────────────────┤       ├─────────────────┤       ├─────────────────────┤
│ id (PK)         │──┐    │ id (PK)         │──┐    │ id (PK)             │
│ nome            │  │    │ nome            │  │    │ nome                │
└─────────────────┘  │    │ organizzazione_id│←─┘   │ tipologia           │
                     │    │ parent_id (FK)  │←──┐   │ numero_di_serie     │
                     │    └─────────────────┘   │   │ data_installazione  │
                     │           │              │   │ organizzazione_id   │←─┐
                     │           └──────────────┘   │ contenitore_id      │  │
                     │         (self-referencing)    └─────────────────────┘  │
                     └───────────────────────────────────────────────────────┘
```

---

## 4. Sicurezza

Implementazione leggera con **Spring Security**:
- **HTTP Basic Authentication** (senza complessità JWT/OAuth2)
- **Utenti in-memory**: `admin/admin` (ADMIN), `user/user` (USER)
- **Autorizzazione**: `@PreAuthorize("hasRole('ADMIN')")` sugli endpoint POST
- **Swagger UI/OpenAPI docs**: accesso pubblico (permitAll)

---

## 5. Testing

| Tipo | Framework | Cosa testa | DB |
|------|-----------|------------|-----|
| **Unit** | JUnit 5 + Mockito | Service layer (logica di business isolata) | Nessuno (mock) |
| **Integration** | Spring Boot Test + MockMvc | Endpoint REST end-to-end, sicurezza, persistenza | H2 in-memory |

### Approccio
- **Unit test**: verificano la logica di business isolando le dipendenze con mock (repository, altri service)
- **Integration test**: verificano il flusso completo HTTP → Controller → Service → Repository → DB, inclusi i vincoli di sicurezza (ruoli ADMIN vs USER)

---

## 6. DevOps e Packaging

### Strategia: WAR unico
Il progetto produce un **singolo file WAR** (`target/anagrafica-radiologica.war`) che include:
- Backend Java compilato
- Frontend React (buildato e copiato in `static/`)
- Tutte le dipendenze (escluso il servlet container, marcato `provided`)

### Pipeline CI/CD (GitHub Actions)
```yaml
- Checkout → Setup JDK 21 → mvn clean package → Upload WAR come artefatto
- I test vengono eseguiti nella fase `test` di Maven (H2 in-memory, nessuna dipendenza esterna)
```

### Deploy
Il WAR è deployabile su qualsiasi servlet container compatibile Jakarta EE 10:
- Apache Tomcat 10.1+
- WildFly 27+
- Il `SpringBootServletInitializer` garantisce il bootstrap corretto in ambiente application server

---

## 7. Frontend

- **React 18 + TypeScript + Vite**: componente `TreeView` ricorsivo che visualizza la gerarchia
- **Espandibile/comprimibile**: ogni nodo contenitore è un toggle
- **Autenticazione**: header HTTP Basic verso il backend
- **Integrato nel WAR**: il build Vite produce `dist/` che viene copiato in `src/main/resources/static` durante il Maven build

## Frontend (React + TypeScript)

### Prerequisiti
- Node.js 18+ (consigliato 20)

### Installazione
```bash
cd frontend
npm install
```

### Generazione client API (Kubb)
Il progetto usa **Kubb** per generare client e DTO a partire dallo swagger/OpenAPI del backend.

```bash
cd frontend
npm run kubb:gen
```
Spec usata: `../src/main/resources/openapi/api.yaml`

### Avvio in sviluppo
```bash
cd frontend
npm run dev
```

### Build
```bash
cd frontend
npm run build
```

### Note
- Il facade `frontend/src/api/client.ts` è compatibile con le funzioni generate da Kubb **che ritornano direttamente i DTO** (non `{ data: ... }`).
- Per la creazione apparecchiatura viene inviato l'header `X-User-Role: ADMIN` per simulare ruolo ADMIN.


## API headers (demo/dev)

Le chiamate API generate da Kubb usano un **fetcher custom** (`frontend/src/api/fetcher.ts`) che aggiunge automaticamente:

- `Authorization: Basic admin:admin` (solo demo/dev)
- `X-User-Role: ADMIN` per le richieste di scrittura (`POST|PUT|PATCH|DELETE`)

Per rigenerare il client nel frontend:

```bash
cd frontend
npm run kubb:gen
```

> Nota: il facade `frontend/src/api/client.ts` chiama le funzioni generate con le firme "flat" (es. `getOrganizzazioneTree(orgId: number)` e `createApparecchiatura(payload)`), senza passare oggetti `{ pathParams/body/headers }`.


## Frontend – miglioramenti UI/UX (aggiornamento)

- Layout moderno a due colonne (albero + pannello controlli).
- Stati **loading/error/empty** dedicati.
- Rendering ricorsivo più leggibile con **collassa/espandi tutto**.
- Card per apparecchiature con metadati e badge tipologia.
- Form creazione apparecchiatura più curato (validazioni, reset, toast).
- CSS responsive e componenti UI riutilizzabili.

> Nota: compatibilità mantenuta con le funzioni API generate da **Kubb** tramite `src/api/client.ts`.
