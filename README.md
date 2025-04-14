# SendMail

Made by: Várnai Dávid, Várszegi Barnabás

## Important!!! After cloning the repo:

- To ensure both apps use the same Prisma schema, create symbolic links to the `prisma` directory:

```bash
# From the root directory
cd apps/api && ln -s ../../prisma prisma
cd ../dashboard && ln -s ../../prisma prisma
```

- Running `Mailhog`:

```bash
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

- Running the `Postgres` database (if .env is correctly defined):

```bash
# From the root directory
cd apps/dashboard && ./start-database.sh
```

- Running the `Backend`:

```bash
# From the root directory
cd apps/api && npm run dev
```

- Running the `Frontend`:

```bash
# From the root directory
cd apps/dashboard && npm run build && npm run start
```
