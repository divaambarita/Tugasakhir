This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Minimal Requirements (untuk jalan di device/PC lain)

- **Node.js**: >= 18 (disarankan 18 LTS atau 20 LTS). Next.js 14 dan React Native project di repo ini butuh Node 18+.
- **Package manager**: `npm` (ikut Node) atau `yarn`/`pnpm`.
- **Database**: MySQL/MariaDB (Prisma memakai `DATABASE_URL` dengan driver `mysql://...`).
- **Prisma CLI**: via `npx prisma` (sudah ada di devDependencies).

Minimal run (web):

1. `npm install`
2. Buat `.env.local` (lihat contoh di bawah), pastikan DB bisa diakses.
3. Jalankan migrasi: `npx prisma migrate deploy` (atau `npx prisma db push` untuk cepat di lokal)
4. `npm run dev`

## .env

```bash
DATABASE_URL= mysql://root@localhost:3306/simbaci
SECRET_KEY_JWT=441e7d49c7135e35c577d14ea91da098
CLOUD_NAME=deqv4dv0i
API_KEY=156391374137932
API_SECRET=k8jRIMskBh8fzXl6SErnv1HXJJk
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
