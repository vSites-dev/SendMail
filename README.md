# SendMail

## Important!!! After cloning the repo:

To ensure both apps use the same Prisma schema, we have to create symbolic links to the `prisma` directory:

```bash
# From the root directory
cd apps/api && ln -s ../../prisma prisma
cd ../dashboard && ln -s ../../prisma prisma
```

## Modifying the Prisma Schema

1. Navigate to `/prisma/prisma.schema`
2. Make your desired changes to the schema

## Generating Prisma Clients

After modifying the schema, you need to generate the Prisma clients for both the API and Dashboard apps separately:

```bash
# From the root directory
cd apps/api && npm run db:generate
cd ../dashboard && npm run db:generate
```

## Pushing Schema Changes to the Database

You can push the schema changes to the database from either the Dashboard or API app:

```bash
# From the root directory
cd apps/dashboard && npm run db:push
# OR
cd apps/api && npm run db:push
```
