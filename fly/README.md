# Fly.io deployment

Postiz runs as four Fly apps in the `pixel-house-682` org, all in `syd`:

| App | Config | Role |
| --- | --- | --- |
| `pixelhouse-postiz` | `../fly.toml` | Postiz itself, public at https://pixelhouse-postiz.fly.dev |
| `pixelhouse-postiz-db` | `postgres/fly.toml` | Postgres 17 for Postiz and Temporal (private) |
| `pixelhouse-postiz-redis` | `redis/fly.toml` | Redis (private) |
| `pixelhouse-postiz-temporal` | `temporal/fly.toml` | Temporal server (private) |

## Secrets

| App | Secrets |
| --- | --- |
| `pixelhouse-postiz-db` | `POSTGRES_PASSWORD`, `POSTIZ_DB_PASSWORD`, `TEMPORAL_DB_PASSWORD` |
| `pixelhouse-postiz-redis` | `REDIS_PASSWORD` |
| `pixelhouse-postiz-temporal` | `POSTGRES_PWD` (same value as `TEMPORAL_DB_PASSWORD`) |
| `pixelhouse-postiz` | `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, plus any social provider keys |

`fly/postgres/init.sh` only runs when the database volume is first created, so
changing the database passwords later means changing them in Postgres too.

## Deploying

Run each from its config's directory, in this order the first time:

```sh
(cd fly/postgres && fly deploy --ha=false)
(cd fly/redis && fly deploy --ha=false)
(cd fly/temporal && fly deploy --ha=false)
fly deploy --ha=false
```

After that, app changes only need `fly deploy` from the repo root.
