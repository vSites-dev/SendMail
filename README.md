# SendMail

## Important!!! After cloning the repo:

- To ensure both apps use the same Prisma schema, we have to create symbolic links to the `prisma` directory:

```bash
# From the root directory
cd apps/api && ln -s ../../prisma prisma
cd ../dashboard && ln -s ../../prisma prisma
```

- Running `Mailhog`:

```bash
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
```
