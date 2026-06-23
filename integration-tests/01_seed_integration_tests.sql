-- Seed dati per integration tests (PostgreSQL)
-- Viene eseguito automaticamente da postgres all'avvio su DB "pulito" tramite /docker-entrypoint-initdb.d/
-- Nota: gli ID sono stringhe nello schema JPA (id VARCHAR/TEXT)

-- Organizzazione minima richiesta dagli smoke test
INSERT INTO organizzazioni (id, nome)
VALUES ('1', 'Organizzazione Seed IT')
ON CONFLICT (id) DO NOTHING;

-- Contenitore minimo (opzionale ma utile per avere un albero non vuoto)
INSERT INTO contenitori (id, nome, organizzazione_id, parent_id)
VALUES ('c1', 'Contenitore Root', '1', NULL)
ON CONFLICT (id) DO NOTHING;
