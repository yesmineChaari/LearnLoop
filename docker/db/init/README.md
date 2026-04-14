# Database init scripts

The PostgreSQL container runs files from this folder only when the data volume is created for the first time.

Included files:

- 01_schema.sql
- 02_seed.sql

If you want to use your own schema or seed content, replace these files.

After changing init scripts, recreate the database volume to apply them again:

```bash
docker compose down -v
docker compose up --build
```
