# MiniLedger – Backend

Track money lent to friends. Node.js + TypeScript + Express + Prisma + PostgreSQL.

## Prerequisites
Node 18+, Docker (for Postgres).

## Run
```bash
cd backend
cp .env.example .env
docker compose up -d        # starts Postgres container (mapped to host port :5433)
npm install                 # also generates the Prisma client
npx prisma migrate deploy   # applies prisma/migrations to the database
npm run dev                 # http://localhost:3000
npm test                    # unit tests
```

> First time from scratch (no `prisma/migrations` folder yet): run `npx prisma migrate dev --name init`, then commit the generated folder.

Optional: `npm run studio` opens Prisma Studio to browse the data.

**Mock OTP:** call `POST /auth/request-otp`; the 6-digit code is printed in the server log as `[MOCK OTP] ...`.

## API
All `/loans*` routes need `Authorization: Bearer <token>`.

| Method | Path | Body | Description |
|---|---|---|---|
| POST | /auth/request-otp | `{ phone }` | Generates OTP, logs it to the console |
| POST | /auth/verify-otp | `{ phone, otp }` | Returns `{ token }`; creates the user on first login |
| POST | /loans | `{ friendName, amount, dueDate }` | Add a loan (`dueDate` = YYYY-MM-DD) |
| GET | /loans | – | List loans with `isOverdue` |
| PATCH | /loans/:id/repay | – | Mark as repaid (409 if already repaid) |
| GET | /loans/summary | – | `totalLent`, `totalRepaid`, `overdueAmount`, `outstanding` |
| POST | /loans/:id/receipt | multipart field `receipt` | Bonus: attach a receipt photo |

### Quick test
```bash
curl -X POST localhost:3000/auth/request-otp -H 'Content-Type: application/json' -d '{"phone":"+919876543210"}'
# read OTP from server log
curl -X POST localhost:3000/auth/verify-otp -H 'Content-Type: application/json' -d '{"phone":"+919876543210","otp":"123456"}'
curl -X POST localhost:3000/loans -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"friendName":"Rahul","amount":500,"dueDate":"2026-10-01"}'
curl localhost:3000/loans/summary -H "Authorization: Bearer $TOKEN"
```

## Design decisions
- **Money** is `NUMERIC(12,2)` and returned as strings, so there is no floating-point error.
- **Total lent** = sum of all entries; **total repaid** = sum of repaid entries; **outstanding** = lent − repaid; **overdue** = pending with due date before today (UTC).
- **OTP** is stored as an HMAC hash (never plain), expires in 5 minutes, is single use, and is locked after 5 wrong attempts.
- **Authorization:** every loan query filters by the JWT's `user_id`; other users' loans return 404.
- **Repay** is one atomic conditional `UPDATE`, so there is no check-then-set race.
- **Prisma** for type-safe queries and migrations. `amount` is `Decimal(12,2)`; sums use `aggregate`, so the database does the math.
- **OTP verify** claims the code with `updateMany({ where: { id, usedAt: null } })`, so two concurrent requests cannot both succeed.
- **Receipt upload** checks loan ownership before multer writes to disk, so there are no orphan files.
- **Validation** with zod at the edge (positive amount, real date, phone format); one central error handler.

## With more time
Rate limiting on `/request-otp`, refresh tokens, pagination, integration tests against a test DB, S3 for receipts, a migration tool (e.g. node-pg-migrate).
