# NOTA_ARCHITETTURALE.md

# Nota Architetturale - Anagrafica Radiologica PoC

## 1. Introduzione

Il progetto **Anagrafica Radiologica** è una **Proof of Concept** finalizzata alla realizzazione di un’applicazione full-stack per la gestione di un’anagrafica radiologica.

La soluzione consente di:

- rappresentare una gerarchia organizzativa composta da **Organizzazioni** e **Contenitori** annidati;
- consultare l’albero organizzativo tramite API e interfaccia frontend;
- creare e gestire **Apparecchiature radiologiche**;
- applicare validazioni di business quali:
  - seriale univoco;
  - data non futura;
  - coerenza tra organizzazione e contenitore.

La nota architetturale descrive le scelte tecniche e progettuali della PoC, le motivazioni principali, il modello dati, le API, il modello di sicurezza, la strategia di test, la containerizzazione e le linee guida DevOps.

---

## 2. Fonti e contesto

Le informazioni sono derivate dal repository pubblico GitHub:

- `s277945/anagrafica-radiologica`

Elementi rilevanti estratti:

| Area | Informazioni rilevanti |
|---|---|
| Backend | Spring Boot, Java 21, Spring Web, Spring Data JPA/Hibernate, Spring Security Basic Auth, springdoc-openapi/Swagger UI |
| Packaging backend | WAR |
| Frontend | React 18, Vite 5, TypeScript 5, TanStack Query v5 |
| API client | Generato con Kubb a partire da specifica OpenAPI YAML |
| Persistenza | PostgreSQL, con PostgreSQL `16-alpine` in Docker Compose |
| Sviluppo | Possibile H2 console in sviluppo, ma configurazione principale basata su PostgreSQL |
| API | Endpoint REST sotto `/api/**` |
| Context path backend | `server.servlet.context-path=/anagrafica` |
| Runtime API | `/anagrafica/api/**` |
| Gerarchia dati | Organizzazione → Contenitori → Contenitori annidati |
| Strategia gerarchica | Adjacency List con `parent_id` |
| Entità principali | Organizzazione, Contenitore, Apparecchiatura |
| Validazioni | Seriale univoco, data non futura, coerenza organizzazione/contenitore |
| DevOps | Docker Compose, GitHub Actions, WAR, Docker images |
| Test full-stack | Docker, PostgreSQL, backend, frontend, seed, smoke test, Playwright |
| Branch strategy | `feature/*` → `snapshot` → `stable` → `main` |
| Ambienti | `dev`, `uat`, `prod` |

---

## 3. Obiettivo della PoC

L’obiettivo della PoC è validare un’architettura applicativa completa per la gestione di un’anagrafica radiologica, con particolare attenzione a:

1. **Modellazione gerarchica dei dati**
  - rappresentazione di organizzazioni e contenitori annidati;
  - recupero efficiente dell’albero organizzativo;
  - associazione coerente delle apparecchiature ai nodi corretti.

2. **API REST documentate**
  - esposizione di endpoint REST sotto `/api/**`;
  - produzione di documentazione OpenAPI;
  - generazione del client frontend a partire dal contratto API.

3. **Validazione business lato backend**
  - seriale apparecchiatura univoco;
  - data non futura;
  - coerenza tra organizzazione selezionata e contenitore associato.

4. **Esperienza frontend moderna**
  - interfaccia React/TypeScript;
  - integrazione API tipizzata;
  - gestione stato asincrono tramite TanStack Query.

5. **Eseguibilità e testabilità end-to-end**
  - ambiente Docker Compose;
  - database PostgreSQL containerizzato;
  - test backend, frontend e full-stack;
  - predisposizione a pipeline CI/CD.

---

## 4. Perimetro della PoC

## 4.1 Incluso

La PoC include:

- backend Java/Spring Boot;
- frontend React/TypeScript/Vite;
- persistenza PostgreSQL;
- modello dati concettuale per:
  - Organizzazioni;
  - Contenitori;
  - Apparecchiature;
- gerarchia ricorsiva tramite `parent_id`;
- endpoint REST principali:
  - `POST /api/apparecchiature`;
  - `GET /api/organizzazioni/{id}/tree`;
- sicurezza tramite Basic Auth;
- profilo autorizzativo amministrativo `ADMIN`;
- validazione dati e gestione errori;
- documentazione OpenAPI;
- client API generato con Kubb;
- test unitari e di integrazione;
- containerizzazione Docker/Docker Compose;
- impostazione CI/CD con GitHub Actions;
- strategia di branch e ambienti.

## 4.2 Escluso o non consolidato nella PoC

La PoC non intende coprire in modo definitivo:

- gestione completa del ciclo di vita utente;
- autenticazione enterprise tramite Identity Provider esterno;
- autorizzazioni granulari per ruolo, struttura o organizzazione;
- audit trail completo;
- versionamento storico delle apparecchiature;
- workflow approvativi;
- gestione documentale;
- osservabilità avanzata;
- hardening completo per produzione.

> Le aree non coperte sono considerate possibili evoluzioni future e non limiti bloccanti per la validazione architetturale iniziale.

---

## 5. Sintesi della soluzione

La soluzione è composta da tre macro-componenti:

1. **Backend**
  - applicazione Spring Boot in Java 21;
  - espone API REST;
  - implementa logica di dominio e validazioni;
  - accede a PostgreSQL tramite Spring Data JPA/Hibernate;
  - produce documentazione OpenAPI;
  - utilizza Basic Auth per la protezione degli endpoint.

2. **Frontend**
  - applicazione React 18;
  - build tool Vite 5;
  - TypeScript 5;
  - TanStack Query v5 per chiamate asincrone e cache;
  - client API generato tramite Kubb da specifica OpenAPI.

3. **Database**
  - PostgreSQL;
  - modello relazionale per organizzazioni, contenitori e apparecchiature;
  - gerarchia ricorsiva dei contenitori tramite adjacency list.

---

## 6. Architettura logica

```text
+-------------------------+
|       Browser           |
|  React / TypeScript     |
|  Vite / TanStack Query  |
+-----------+-------------+
            |
            | HTTP REST
            | /anagrafica/api/**
            v
+-----------+-------------+
|        Backend          |
|  Spring Boot / Java 21  |
|  REST API / Security    |
|  Validation / JPA       |
+-----------+-------------+
            |
            | JDBC / JPA
            v
+-----------+-------------+
|       PostgreSQL        |
|  Organizzazioni         |
|  Contenitori            |
|  Apparecchiature        |
+-------------------------+
```

## 6.1 Motivazioni architetturali

| Scelta | Motivazione |
|---|---|
| Architettura full-stack separata | Consente indipendenza tra evoluzione frontend e backend, pur mantenendo un contratto API condiviso. |
| REST API | Approccio semplice, interoperabile e adatto a una PoC gestionale. |
| OpenAPI-first | Riduce ambiguità tra frontend e backend e consente generazione automatica del client. |
| PostgreSQL | Database relazionale robusto, adatto a vincoli di integrità, relazioni e query gerarchiche semplici. |
| JPA/Hibernate | Riduce boilerplate di persistenza e consente una modellazione aderente al dominio. |
| React/TypeScript | Migliora manutenibilità frontend tramite tipizzazione statica e componentizzazione. |
| Docker Compose | Garantisce un ambiente riproducibile per sviluppo, test e validazione full-stack. |

---

## 7. Backend Java/Spring Boot

## 7.1 Stack backend

| Tecnologia | Versione / indicazione | Ruolo |
|---|---:|---|
| Java | 21 | Linguaggio backend |
| Spring Boot | Presente nel progetto | Framework applicativo |
| Spring Web | Presente | Esposizione API REST |
| Spring Data JPA | Presente | Accesso ai dati |
| Hibernate | Presente | ORM |
| PostgreSQL | Database principale | Persistenza |
| Spring Security | Presente | Autenticazione e autorizzazione |
| Basic Auth | Presente | Meccanismo di autenticazione PoC |
| springdoc-openapi | Presente | Documentazione API e Swagger UI |
| WAR | Packaging | Artifact deployabile |

## 7.2 Responsabilità del backend

Il backend ha le seguenti responsabilità:

- esporre API REST sotto `/api/**`;
- applicare il context path `/anagrafica`;
- gestire la logica di dominio;
- validare i dati in ingresso;
- garantire la coerenza tra organizzazione, contenitore e apparecchiatura;
- orchestrare il recupero dell’albero organizzativo;
- persistere i dati su PostgreSQL;
- produrre la specifica OpenAPI;
- applicare sicurezza tramite Basic Auth.

## 7.3 Context path e routing runtime

Il backend espone gli endpoint applicativi sotto:

```text
/api/**
```

Poiché è configurato:

```properties
server.servlet.context-path=/anagrafica
```

il percorso runtime effettivo diventa:

```text
/anagrafica/api/**
```

Esempi:

| Endpoint logico | Endpoint runtime |
|---|---|
| `POST /api/apparecchiature` | `POST /anagrafica/api/apparecchiature` |
| `GET /api/organizzazioni/{id}/tree` | `GET /anagrafica/api/organizzazioni/{id}/tree` |

## 7.4 Motivazioni della scelta Spring Boot

Spring Boot è una scelta adeguata alla PoC perché:

- consente bootstrap rapido dell’applicazione;
- integra in modo maturo web, security, validazione, JPA e documentazione API;
- supporta packaging WAR;
- è adatto a contesti enterprise;
- facilita l’integrazione con PostgreSQL;
- permette una progressiva evoluzione verso scenari più complessi.

---

## 8. Frontend React/TypeScript/Vite

## 8.1 Stack frontend

| Tecnologia | Versione / indicazione | Ruolo |
|---|---:|---|
| React | 18 | Libreria UI |
| Vite | 5 | Build tool e dev server |
| TypeScript | 5 | Tipizzazione statica |
| TanStack Query | v5 | Data fetching, cache e stato server |
| Kubb | Presente | Generazione client API |
| Vitest | Presente | Test frontend |
| Testing Library | Linea guida / test UI | Test dei componenti dal punto di vista utente |

## 8.2 Responsabilità del frontend

Il frontend ha le seguenti responsabilità:

- visualizzare l’albero organizzativo;
- consentire la consultazione di organizzazioni e contenitori;
- supportare la creazione o gestione delle apparecchiature;
- invocare le API backend tramite client generato;
- gestire stati di caricamento, errore e successo;
- mantenere coerenza tipizzata con il contratto OpenAPI.

## 8.3 Motivazioni della scelta React, TypeScript e Vite

| Scelta | Motivazione |
|---|---|
| React | Ecosistema maturo, componentizzazione, ampia disponibilità di librerie e pattern consolidati. |
| TypeScript | Riduce errori runtime, migliora refactoring e contratti tra componenti e API. |
| Vite | Build veloce, esperienza di sviluppo moderna, configurazione snella. |
| TanStack Query | Gestione standardizzata di chiamate API, caching, invalidazione e stati asincroni. |
| Kubb | Generazione client coerente con OpenAPI, riducendo codice manuale e disallineamenti. |

---

## 9. Database e modello dati

## 9.1 Principi di modellazione

Il modello dati della PoC è centrato su tre concetti principali:

1. **Organizzazione**
  - radice logica dell’albero;
  - rappresenta l’ente, struttura o dominio organizzativo di riferimento.

2. **Contenitore**
  - nodo gerarchico interno all’organizzazione;
  - può contenere altri contenitori;
  - può essere associato ad apparecchiature;
  - supporta nidificazione ricorsiva tramite `parent_id`.

3. **Apparecchiatura**
  - elemento anagrafico radiologico;
  - associato a una organizzazione;
  - associabile a un contenitore coerente con la stessa organizzazione;
  - soggetto a vincoli di business.

## 9.2 Tabelle concettuali

La seguente tabella descrive la scelta architetturale delle tabelle principali.

> I nomi e gli attributi sono descritti a livello concettuale, coerentemente con le informazioni estratte dal progetto. Il naming fisico effettivo può seguire le convenzioni adottate nel codice sorgente.

| Tabella concettuale | Responsabilità | Relazioni principali |
|---|---|---|
| `organizzazioni` | Memorizza le organizzazioni radice dell’anagrafica. | Una organizzazione possiede molti contenitori e molte apparecchiature. |
| `contenitori` | Memorizza nodi gerarchici annidabili. | Ogni contenitore appartiene a una organizzazione e può avere un `parent_id`. |
| `apparecchiature` | Memorizza le apparecchiature radiologiche. | Ogni apparecchiatura appartiene a una organizzazione ed è associabile a un contenitore. |

## 9.3 Organizzazioni

La tabella concettuale `organizzazioni` rappresenta il livello radice della gerarchia.

### Responsabilità

- identificare il contesto organizzativo;
- fungere da radice dell’albero;
- delimitare il perimetro di validità dei contenitori;
- delimitare il perimetro di appartenenza delle apparecchiature.

### Campi concettuali

| Campo concettuale | Descrizione | Nota |
|---|---|---|
| `id` | Identificativo univoco dell’organizzazione. | Chiave primaria concettuale. |
| `nome` / descrizione equivalente | Denominazione dell’organizzazione. | Naming fisico non vincolato in questa nota. |
| altri attributi descrittivi | Eventuali metadati organizzativi. | Linea guida, non dettaglio vincolante. |

### Motivazione

La separazione esplicita dell’entità Organizzazione consente di:

- gestire più alberi organizzativi distinti;
- applicare vincoli di coerenza tra contenitori e apparecchiature;
- evitare che nodi di organizzazioni diverse vengano collegati impropriamente;
- predisporre future evoluzioni multi-organizzazione.

---

## 9.4 Contenitori

La tabella concettuale `contenitori` rappresenta i nodi della gerarchia organizzativa sotto una specifica organizzazione.

### Responsabilità

- modellare strutture annidate;
- rappresentare reparti, aree, stanze, gruppi o altri contenitori logici;
- supportare una struttura ad albero;
- consentire il collegamento delle apparecchiature a un nodo della gerarchia.

### Campi concettuali

| Campo concettuale | Descrizione | Vincolo / nota |
|---|---|---|
| `id` | Identificativo univoco del contenitore. | Chiave primaria concettuale. |
| `organizzazione_id` | Organizzazione di appartenenza. | Deve riferire una organizzazione esistente. |
| `parent_id` | Contenitore padre. | Nullable per contenitori di primo livello. |
| `nome` / descrizione equivalente | Denominazione del contenitore. | Naming fisico non vincolato. |
| altri attributi descrittivi | Metadati del contenitore. | Linea guida. |

## 9.5 Gerarchia ricorsiva con Adjacency List

La PoC adotta una strategia **Adjacency List**, in cui ogni contenitore può riferire il proprio contenitore padre tramite `parent_id`.

Esempio concettuale:

```text
Organizzazione
└── Contenitore A
    ├── Contenitore A.1
    │   └── Contenitore A.1.1
    └── Contenitore A.2
```

Rappresentazione relazionale concettuale:

| id contenitore | organizzazione_id | parent_id | nome |
|---:|---:|---:|---|
| 10 | 1 | `NULL` | Contenitore A |
| 11 | 1 | 10 | Contenitore A.1 |
| 12 | 1 | 11 | Contenitore A.1.1 |
| 13 | 1 | 10 | Contenitore A.2 |

### Motivazioni della scelta Adjacency List

La strategia Adjacency List è adatta alla PoC perché:

- è semplice da modellare con JPA/Hibernate;
- richiede una sola tabella per rappresentare la ricorsione;
- consente relazioni padre-figlio esplicite;
- è facilmente comprensibile e manutenibile;
- si adatta bene a strutture gerarchiche di profondità moderata;
- è sufficiente per validare il caso d’uso principale della PoC.

### Limiti della scelta

La Adjacency List può diventare meno efficiente se:

- la profondità dell’albero cresce molto;
- sono frequenti query su interi sottoalberi molto grandi;
- sono richieste operazioni intensive di calcolo di antenati e discendenti.

In tali scenari, una futura evoluzione potrebbe valutare:

- closure table;
- materialized path;
- recursive CTE ottimizzate in PostgreSQL;
- caching applicativo dell’albero.

---

## 9.6 Apparecchiature

La tabella concettuale `apparecchiature` rappresenta le apparecchiature radiologiche gestite dall’anagrafica.

### Responsabilità

- memorizzare i dati identificativi dell’apparecchiatura;
- associare l’apparecchiatura a una organizzazione;
- associare l’apparecchiatura a un contenitore coerente;
- garantire vincoli di business quali seriale univoco e data non futura.

### Campi concettuali

| Campo concettuale | Descrizione | Vincolo / nota |
|---|---|---|
| `id` | Identificativo univoco dell’apparecchiatura. | Chiave primaria concettuale. |
| `organizzazione_id` | Organizzazione di appartenenza. | Obbligatoria secondo il modello concettuale. |
| `contenitore_id` | Contenitore associato. | Deve appartenere alla stessa organizzazione. |
| `seriale` | Seriale dell’apparecchiatura. | Deve essere univoco. |
| campo data | Data soggetta a controllo business. | Non deve essere futura. |
| altri attributi descrittivi | Dati anagrafici dell’apparecchiatura. | Linea guida. |

## 9.7 Vincoli concettuali

## 9.7.1 Seriale univoco

Il seriale dell’apparecchiatura deve essere univoco.

### Motivazione

Il seriale rappresenta un identificativo naturale importante per evitare duplicazioni anagrafiche. Il vincolo consente di:

- impedire registrazioni duplicate;
- migliorare la qualità del dato;
- supportare ricerche affidabili;
- prevenire ambiguità operative.

### Linea guida architetturale

Il vincolo dovrebbe essere garantito su due livelli:

1. **Database**
  - vincolo univoco sul campo concettuale `seriale`.

2. **Applicazione**
  - controllo preventivo in fase di creazione;
  - messaggio di errore chiaro in caso di duplicazione.

## 9.7.2 Data non futura

La data associata all’apparecchiatura non deve essere futura.

### Motivazione

Il vincolo evita l’inserimento di informazioni temporalmente incoerenti e protegge la qualità dei dati anagrafici.

### Linea guida architetturale

Il controllo deve essere applicato lato backend tramite validazione business.

In caso di violazione:

- la richiesta deve essere rifiutata;
- deve essere restituito un errore applicativo comprensibile;
- il frontend deve presentare il messaggio all’utente.

## 9.7.3 Coerenza organizzazione/contenitore

Un’apparecchiatura associata a una determinata organizzazione può essere collegata solo a un contenitore appartenente alla stessa organizzazione.

### Esempio valido

| Apparecchiatura | Organizzazione apparecchiatura | Contenitore | Organizzazione contenitore | Esito |
|---|---:|---|---:|---|
| RX-001 | 1 | Sala RX | 1 | Valido |

### Esempio non valido

| Apparecchiatura | Organizzazione apparecchiatura | Contenitore | Organizzazione contenitore | Esito |
|---|---:|---|---:|---|
| RX-002 | 1 | Sala TC | 2 | Non valido |

### Motivazione

Questo vincolo impedisce collegamenti incoerenti tra entità appartenenti a contesti organizzativi differenti.

### Linea guida architetturale

Il controllo deve essere effettuato nel servizio applicativo backend prima della persistenza dell’apparecchiatura.

## 9.7.4 Coerenza parent/child dei contenitori

Ogni contenitore figlio deve appartenere alla stessa organizzazione del contenitore padre.

### Motivazione

La gerarchia deve rimanere internamente coerente. Senza questo vincolo, un contenitore potrebbe essere visualizzato sotto un ramo appartenente a un’organizzazione diversa.

### Linea guida architetturale

Quando viene creato o aggiornato un contenitore con `parent_id`, il backend dovrebbe verificare che:

- il padre esista;
- il padre appartenga alla stessa organizzazione;
- non vengano introdotti cicli nella gerarchia.

> La prevenzione dei cicli è indicata come linea guida architetturale. Il dettaglio implementativo non è specificato nelle informazioni estratte.

---

## 9.8 DTO Tree

L’endpoint:

```http
GET /api/organizzazioni/{id}/tree
```

restituisce la rappresentazione ad albero dell’organizzazione.

### Obiettivo del DTO Tree

Il DTO Tree serve a:

- evitare che il frontend debba ricostruire autonomamente la gerarchia;
- esporre una struttura già coerente con il modello di dominio;
- separare il modello di persistenza dal contratto API;
- controllare quali campi vengono esposti;
- ridurre accoppiamento tra entità JPA e interfaccia utente.

### Struttura concettuale

```text
OrganizzazioneTreeDTO
├── id
├── nome
└── contenitori[]
    ├── id
    ├── nome
    ├── parentId
    └── children[]
        ├── id
        ├── nome
        ├── parentId
        └── children[]
```

### Linea guida per l’inclusione delle apparecchiature

Poiché le apparecchiature sono associate a organizzazione/contenitore, una possibile evoluzione del DTO Tree può prevedere l’inclusione delle apparecchiature nei nodi contenitore.

Questa scelta deve essere valutata in base a:

- dimensione dell’albero;
- numero medio di apparecchiature;
- necessità della schermata frontend;
- impatto sulle performance;
- separazione tra navigazione gerarchica e gestione anagrafica.

---

## 10. API REST

## 10.1 Endpoint principali

| Metodo | Endpoint logico | Endpoint runtime | Descrizione |
|---|---|---|---|
| `POST` | `/api/apparecchiature` | `/anagrafica/api/apparecchiature` | Crea una apparecchiatura radiologica. |
| `GET` | `/api/organizzazioni/{id}/tree` | `/anagrafica/api/organizzazioni/{id}/tree` | Recupera l’albero organizzativo. |

## 10.2 POST /api/apparecchiature

### Responsabilità

L’endpoint consente la creazione di una nuova apparecchiatura radiologica.

### Validazioni attese

- presenza dei dati obbligatori;
- seriale univoco;
- data non futura;
- organizzazione esistente;
- contenitore esistente, se valorizzato;
- coerenza tra organizzazione e contenitore.

### Esiti attesi

| Caso | Esito |
|---|---|
| Richiesta valida | Creazione dell’apparecchiatura |
| Seriale duplicato | Errore di validazione o conflitto |
| Data futura | Errore di validazione |
| Contenitore non coerente | Errore di business |
| Utente non autenticato | Errore di autenticazione |
| Utente non autorizzato | Errore di autorizzazione |

## 10.3 GET /api/organizzazioni/{id}/tree

### Responsabilità

L’endpoint restituisce l’albero organizzativo di una specifica organizzazione.

### Comportamento atteso

- recupera l’organizzazione indicata;
- recupera i contenitori associati;
- costruisce la gerarchia ricorsiva tramite `parent_id`;
- restituisce un DTO tree.

### Esiti attesi

| Caso | Esito |
|---|---|
| Organizzazione esistente | Restituzione dell’albero |
| Organizzazione non trovata | Errore di risorsa non trovata |
| Utente non autenticato | Errore di autenticazione |
| Utente non autorizzato | Errore di autorizzazione |

---

## 11. Sicurezza

## 11.1 Meccanismo adottato

La PoC utilizza:

- Spring Security;
- Basic Auth;
- utenti in-memory;
- ruolo/profilo amministrativo `ADMIN`.

## 11.2 Motivazione della scelta Basic Auth

Basic Auth è adeguata per una PoC perché:

- è semplice da configurare;
- consente di validare rapidamente la protezione degli endpoint;
- non introduce complessità infrastrutturale;
- è compatibile con strumenti di test e automazione;
- permette di concentrare l’attenzione sul dominio applicativo.

## 11.3 Limiti consapevoli

Basic Auth con utenti in-memory non è una soluzione definitiva per ambienti produttivi complessi.

Limiti principali:

- gestione credenziali non centralizzata;
- assenza di federazione identità;
- rotazione credenziali non evoluta;
- autorizzazioni granulari limitate;
- audit e tracciamento accessi non completi.

## 11.4 Evoluzione suggerita

Per scenari successivi si potrà valutare:

- OAuth2/OIDC;
- integrazione con Identity Provider aziendale;
- JWT;
- gestione ruoli granulari;
- autorizzazioni per organizzazione o struttura;
- audit trail degli accessi e delle modifiche.

---

## 12. Validazione e gestione errori

## 12.1 Validazione

La validazione deve essere applicata principalmente lato backend, in quanto il backend rappresenta il punto di controllo autorevole del dominio.

### Tipologie di validazione

| Tipo | Esempi |
|---|---|
| Sintattica | Campi obbligatori, formato dati, lunghezza valori |
| Business | Seriale univoco, data non futura, coerenza organizzazione/contenitore |
| Referenziale | Organizzazione esistente, contenitore esistente |
| Sicurezza | Utente autenticato e autorizzato |

## 12.2 Gestione errori

La gestione errori dovrebbe essere centralizzata nel backend.

### Linea guida architetturale

Gli errori dovrebbero essere restituiti con:

- codice HTTP appropriato;
- messaggio leggibile;
- eventuale codice applicativo;
- dettagli dei campi non validi, se disponibili;
- tracciabilità tecnica nei log backend.

## 12.3 Categorie di errore

| Categoria | Esempio | Codice HTTP indicativo |
|---|---|---:|
| Errore di validazione | Data futura | `400` |
| Risorsa non trovata | Organizzazione inesistente | `404` |
| Conflitto | Seriale duplicato | `409` |
| Non autenticato | Credenziali assenti o errate | `401` |
| Non autorizzato | Utente senza ruolo richiesto | `403` |
| Errore interno | Eccezione non gestita | `500` |

> I codici HTTP sono indicati come linea guida architetturale. Il comportamento effettivo deve essere verificato rispetto all’implementazione.

---

## 13. OpenAPI e Kubb

## 13.1 Approccio API-first/OpenAPI

Il progetto adotta un approccio basato su OpenAPI.

La specifica OpenAPI consente di:

- documentare gli endpoint;
- descrivere request e response;
- esplicitare contratti e modelli DTO;
- alimentare Swagger UI;
- generare il client frontend.

## 13.2 Client generato con Kubb

Il frontend utilizza un client API generato con Kubb a partire dal file YAML OpenAPI del backend.

### Motivazioni

Questa scelta consente di:

- ridurre il codice manuale per le chiamate HTTP;
- mantenere allineamento tra backend e frontend;
- migliorare la tipizzazione lato TypeScript;
- intercettare breaking change in modo più rapido;
- favorire una disciplina contrattuale tra team o componenti.

## 13.3 Linee guida operative

- La specifica OpenAPI deve essere aggiornata quando cambia il contratto REST.
- Il client frontend deve essere rigenerato dopo modifiche rilevanti alle API.
- La pipeline CI dovrebbe verificare che il client generato sia coerente con la specifica.
- Le modifiche incompatibili devono essere tracciate e comunicate.

---

## 14. Test

## 14.1 Strategia complessiva

La PoC prevede una strategia di test multilivello:

| Livello | Scopo |
|---|---|
| Test backend unitari | Verificare logica di servizio e validazioni business |
| Test backend integration | Verificare integrazione backend/database |
| Test frontend | Verificare componenti e interazioni UI |
| Test full-stack | Verificare il sistema integrato con Docker Compose |
| Smoke test | Verificare avvio e disponibilità minima dei servizi |
| Playwright | Verificare scenari end-to-end via browser |

## 14.2 Test backend unitari

I test unitari backend devono coprire:

- validazione seriale univoco;
- validazione data non futura;
- coerenza organizzazione/contenitore;
- costruzione del DTO tree;
- gestione di casi non trovati;
- comportamento dei servizi applicativi.

### Motivazione

I test unitari sono rapidi e permettono di isolare la logica di dominio senza dipendere dall’infrastruttura.

## 14.3 Test backend/database di integrazione

I test di integrazione backend/database devono verificare:

- mapping JPA/Hibernate;
- vincoli su PostgreSQL;
- persistenza delle entità principali;
- query di recupero organizzazioni e contenitori;
- comportamento con dati reali o seed;
- coerenza delle transazioni.

### Motivazione

Poiché la PoC dipende da PostgreSQL, è importante validare il comportamento sul database reale o su un ambiente il più possibile aderente.

## 14.4 Test frontend con Vitest e Testing Library

I test frontend devono coprire:

- rendering dei componenti principali;
- stati di caricamento;
- stati di errore;
- visualizzazione dell’albero;
- invocazione del client API;
- interazioni utente principali.

### Motivazione

Vitest si integra bene con Vite e consente test rapidi. Testing Library favorisce test orientati al comportamento utente, riducendo l’accoppiamento con dettagli implementativi.

## 14.5 Test full-stack con Docker Compose

I test full-stack devono avviare l’intero sistema:

- PostgreSQL;
- backend;
- frontend;
- dati seed;
- smoke test;
- scenari Playwright.

### Flusso indicativo

```text
1. Avvio PostgreSQL
2. Applicazione seed dati
3. Avvio backend
4. Avvio frontend
5. Verifica health/smoke minima
6. Esecuzione test Playwright
7. Raccolta log e artifact
8. Spegnimento ambiente
```

### Motivazione

Il test full-stack consente di validare:

- configurazione Docker;
- connettività tra servizi;
- compatibilità runtime tra frontend e backend;
- endpoint reali;
- autenticazione;
- comportamento utente in browser.

---

## 15. Containerizzazione Docker e Docker Compose

## 15.1 Componenti containerizzati

| Servizio | Tecnologia | Ruolo |
|---|---|---|
| `postgres` | PostgreSQL `16-alpine` | Database |
| `backend` | Spring Boot WAR / immagine Docker | API REST |
| `frontend` | React/Vite / immagine Docker | Interfaccia utente |
| test runner | Linea guida | Smoke test e Playwright |

## 15.2 Motivazioni

Docker Compose è utile perché:

- riduce differenze tra ambienti locali e CI;
- rende riproducibile l’esecuzione;
- facilita test full-stack;
- consente seed database controllato;
- permette di validare rapidamente integrazione tra componenti.

## 15.3 Linee guida

- Le credenziali non devono essere hardcoded per ambienti reali.
- Le configurazioni devono essere parametrizzabili tramite variabili d’ambiente.
- Il seed deve essere deterministico per i test automatici.
- I log dei container devono essere raccolti in caso di fallimento CI.
- Le immagini Docker devono essere versionate in modo coerente con branch e release.

---

## 16. CI/CD con GitHub Actions

## 16.1 Obiettivi della pipeline

La pipeline GitHub Actions deve supportare:

- build backend;
- test backend;
- build frontend;
- test frontend;
- generazione o verifica client OpenAPI/Kubb;
- packaging WAR;
- build Docker images;
- test di integrazione full-stack;
- pubblicazione artifact;
- promozione tra ambienti.

## 16.2 Branch strategy

La strategia discussa prevede:

```text
feature/* → snapshot → stable → main
```

| Branch | Finalità | Ambiente associato |
|---|---|---|
| `feature/*` | Sviluppo funzionalità | Locale / CI di verifica |
| `snapshot` | Integrazione continua | `dev` |
| `stable` | Stabilizzazione e validazione | `uat` |
| `main` | Versione consolidata | `prod` |

## 16.3 Artifact

Gli artifact principali sono:

- WAR backend;
- Docker image backend;
- Docker image frontend;
- report test;
- report coverage;
- log dei test full-stack;
- eventuali artifact Playwright.

## 16.4 Ambienti

| Ambiente | Scopo |
|---|---|
| `dev` | Validazione continua delle modifiche integrate |
| `uat` | Collaudo funzionale e tecnico |
| `prod` | Ambiente produttivo o produzione simulata |

## 16.5 Linee guida di promozione

- Le feature vengono sviluppate su `feature/*`.
- Le modifiche integrate confluiscono in `snapshot`.
- Le versioni candidate vengono promosse su `stable`.
- Le versioni approvate confluiscono in `main`.
- La promozione deve essere subordinata al superamento dei test previsti.
- Gli artifact devono essere tracciabili rispetto al commit sorgente.

---

## 17. Limiti consapevoli della PoC

La PoC presenta alcuni limiti noti e accettati:

| Area | Limite |
|---|---|
| Sicurezza | Basic Auth e utenti in-memory non rappresentano una soluzione enterprise definitiva. |
| Autorizzazioni | Modello `ADMIN` semplice, senza granularità avanzata. |
| Modello dati | Gerarchia Adjacency List adeguata alla PoC, ma da rivalutare su alberi molto grandi. |
| Performance | Non sono indicati meccanismi avanzati di caching o ottimizzazione query. |
| Audit | Non è specificata una gestione completa dello storico modifiche. |
| Osservabilità | Non sono descritti logging strutturato, metriche o tracing distribuito. |
| Deploy | La pipeline è descritta come impostazione architetturale, da consolidare secondo esigenze reali. |
| Frontend | La PoC valida l’integrazione, non necessariamente un design system definitivo. |

---

## 18. Possibili evoluzioni future

## 18.1 Sicurezza e identità

Possibili evoluzioni:

- OAuth2/OIDC;
- integrazione con provider aziendale;
- JWT;
- ruoli granulari;
- autorizzazioni per organizzazione;
- audit trail degli accessi.

## 18.2 Modello dati

Possibili evoluzioni:

- gestione storico apparecchiature;
- versionamento dei dati anagrafici;
- soft delete;
- vincoli fisici più estesi;
- indici ottimizzati;
- closure table o materialized path per gerarchie complesse;
- validazione esplicita anti-ciclo per i contenitori.

## 18.3 API

Possibili evoluzioni:

- versionamento API;
- paginazione e filtri avanzati;
- endpoint dedicati per ricerca apparecchiature;
- endpoint separati per gestione contenitori;
- standardizzazione payload errori;
- contract testing automatico.

## 18.4 Frontend

Possibili evoluzioni:

- gestione avanzata dell’albero;
- lazy loading dei nodi;
- ricerca e filtro apparecchiature;
- form più evoluti;
- validazione client-side coerente con backend;
- gestione permessi lato UI;
- design system.

## 18.5 DevOps e runtime

Possibili evoluzioni:

- registry immagini Docker;
- deploy automatico per ambiente;
- gestione segreti;
- quality gate;
- scansione vulnerabilità;
- osservabilità applicativa;
- metriche, logging strutturato e tracing.

---

## 19. Decisioni architetturali sintetiche

| Decisione | Stato | Motivazione |
|---|---|---|
| Backend Spring Boot Java 21 | Adottata | Stack maturo, enterprise-ready, integrabile con JPA, Security e OpenAPI. |
| Frontend React/TypeScript/Vite | Adottata | UI moderna, tipizzata, veloce in sviluppo. |
| PostgreSQL | Adottata | Database relazionale robusto, adatto a vincoli e relazioni. |
| Gerarchia con Adjacency List | Adottata per PoC | Semplice, leggibile, compatibile con JPA. |
| OpenAPI + Kubb | Adottata | Allineamento contratto API e client frontend. |
| Basic Auth con ADMIN | Adottata per PoC | Semplice e sufficiente per validazione iniziale. |
| Docker Compose | Adottata | Ambiente riproducibile e test full-stack. |
| GitHub Actions | Linea guida / impostazione CI/CD | Automazione build, test e artifact. |
| WAR backend | Adottata | Packaging indicato dal progetto. |
| Docker images | Linea guida DevOps | Distribuzione riproducibile dei componenti. |

---