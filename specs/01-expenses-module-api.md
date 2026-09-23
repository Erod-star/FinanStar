# SPEC 01 — Per-user expenses module (API)

> **Status:** Implemented
> **Depends on:** none (builds on the existing `auth/` module)
> **Date:** 2026-09-22
> **Objective:** Replace the `expenses` scaffold in `apps/api` with a real CRUD where every expense belongs to the authenticated user and no user can see or touch another user's expenses.

## Why this spec exists

`apps/api/src/expenses/` was generated with `nest g resource` and is still a stub: numeric ids, empty entity and DTOs, string responses, and a legacy `src/...` import.
`@Auth()` already protects the controller, but nothing exposes the authenticated user to handlers, so ownership cannot be enforced yet.

## Scope

**In:**

- Mongoose `Expense` schema in the `expenses` collection, with `userId`, `date`, `description`, `amount`, `necessityType`, optional `category`, optional `source`, soft delete and timestamps.
- Computed `weekNumber` returned in every expense response (not persisted).
- `@GetUser()` param decorator in `auth/decorators/` returning the user attached by `JwtStrategy`.
- Endpoints `POST /expenses`, `GET /expenses?month=&year=`, `GET /expenses/:id`, `PATCH /expenses/:id`, `DELETE /expenses/:id`, all behind `@Auth()`.
- Ownership enforced in every query: filter always includes `userId` and `deletedAt: null`.
- DTOs with class-validator for create, update and list query, plus `dto/index.ts` barrel.
- Responses wrapped with `formatToApiResponse`.
- Cleanup of the scaffold: relative imports, string ObjectId params, no `console.log`.

**Out of scope (for future specs):**

- Mobile screens, hooks or API client for expenses.
- Per-user custom categories (a separate collection).
- Multi-currency.
- Pagination and arbitrary `from`/`to` date ranges.
- Restoring soft-deleted expenses or listing them.
- Aggregations / reports (totals per category, per week, per necessity type).
- Jest unit tests for `ExpensesService` with a mocked Mongoose model. All the unit tests will be handled in a dedicated spec.
- e2e tests (`test/jest-e2e.json` does not exist yet).

## Data model

```ts
// apps/api/src/expenses/entities/expense.entity.ts
export enum NecessityType {
  ESSENTIAL = 'ESSENTIAL',
  NOT_ESSENTIAL = 'NOT_ESSENTIAL',
}

export enum ExpenseCategory {
  RENT = 'RENT',
  FOOD = 'FOOD',
  OUTINGS = 'OUTINGS',
  TRANSPORT = 'TRANSPORT',
  SERVICES = 'SERVICES',
  HEALTH = 'HEALTH',
  SUBSCRIPTIONS = 'SUBSCRIPTIONS',
  OTHER = 'OTHER',
}

@Schema({
  collection: 'expenses',
  timestamps: true,
  toJSON: { virtuals: true, versionKey: false, transform: (_doc, ret) => (delete ret._id, ret) },
})
export class Expense {
  userId: Types.ObjectId; // ref: User.name, required, indexed
  date: Date; // required, always UTC 00:00 of the given day
  description: string; // required, trimmed
  amount: number; // required, integer cents, > 0 (1250 = 12.50)
  necessityType: NecessityType; // required
  category?: ExpenseCategory; // optional
  source?: string; // optional, free text, trimmed, max 50 chars
  deletedAt: Date | null; // default null; soft delete marker
  createdAt: Date; // Mongoose timestamps
  updatedAt: Date; // Mongoose timestamps
}
// Virtual: weekNumber = Math.ceil(date.getUTCDate() / 7) → 1..5
// Compound index: { userId: 1, date: -1 }
// Responses expose `id` (string, no `_id`) and omit `__v`
```

DTOs (`apps/api/src/expenses/dto/`):

| DTO                    | Fields                                                                                                                                                                                                                                                                                                      |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CreateExpenseDto`     | `date` (`@IsDateString({ strict: true }) @Matches(/^\d{4}-\d{2}-\d{2}$/)`, format `YYYY-MM-DD`), `description` (`@IsString @IsNotEmpty @MaxLength(200)`), `amount` (`@IsInt @Min(1)`), `necessityType` (`@IsEnum`), `category?` (`@IsOptional @IsEnum`), `source?` (`@IsOptional @IsString @MaxLength(50)`) |
| `UpdateExpenseDto`     | `PartialType(CreateExpenseDto)`                                                                                                                                                                                                                                                                             |
| `ListExpensesQueryDto` | `month?` (`@Type(() => Number) @IsInt @Min(1) @Max(12)`), `year?` (`@Type(() => Number) @IsInt @Min(2000) @Max(2100)`)                                                                                                                                                                                      |

Conventions:

- `userId` is never accepted from the request body. It always comes from `@GetUser()`. Sending it returns 400 (`forbidNonWhitelisted`).
- `date` input `'2026-09-22'` is stored as `2026-09-22T00:00:00.000Z`. Month filtering and `weekNumber` use UTC getters only.
- Month filter: `date >= Date.UTC(year, month - 1, 1)` and `date < Date.UTC(year, month, 1)`. Missing `month` and/or `year` default to the current UTC month/year.
- List order: `date` desc, then `createdAt` desc.
- `DELETE` sets `deletedAt = new Date()`. Soft-deleted expenses behave as non-existent (404) for every endpoint.
- Invalid ObjectId in `:id` → 400 via `ParseObjectIdPipe` from `@nestjs/mongoose`.
- Expense of another user, or soft-deleted → 404 `Expense not found`.

## Implementation plan

1. **Schema.** Implement `expense.entity.ts` (enums, `@Schema`, `SchemaFactory`, `weekNumber` virtual, compound index). Register it in `expenses.module.ts` with `MongooseModule.forFeature`. Change the `src/auth/auth.module` import to a relative one. App boots.
2. **`@GetUser()` decorator.** Add `apps/api/src/auth/decorators/get-user.decorator.ts` (`createParamDecorator` returning `request.user`, typed as `UserDocument`). Throw `InternalServerErrorException` if no user is on the request (route missing `@Auth()`).
3. **DTOs.** Implement `create-expense.dto.ts`, `update-expense.dto.ts`, new `list-expenses-query.dto.ts` and `dto/index.ts` barrel.
4. **Service: create + list.** `ExpensesService` injects `@InjectModel(Expense.name)`. `create(dto, userId)` normalizes `date` to UTC midnight. `findAll(query, userId)` applies month filter, ownership, `deletedAt: null`, sort; returns `{ expenses, total }`.
5. **Service: findOne + update + remove.** All use `findOne`/`findOneAndUpdate` with `{ _id, userId, deletedAt: null }`, throw `NotFoundException` when null. `update` re-normalizes `date` if present and returns the updated doc (`new: true`). `remove` sets `deletedAt`.
6. **Controller.** Rewrite `expenses.controller.ts`: `@GetUser()` in every handler, `ParseObjectIdPipe` on `:id`, `@Query() ListExpensesQueryDto` on list, wrap results with `formatToApiResponse` (`status: HttpStatus.CREATED` on POST, `total` on list). Remove stub strings and `console.log`.

## Acceptance criteria

- [x] `pnpm --filter @finanstar/api typecheck`, `lint` and `test` pass.
- [x] No `src/...` imports remain under `apps/api/src/expenses/`.
- [x] All `/expenses` endpoints return 401 without a valid Bearer token.
- [x] `POST /expenses` with a valid body returns 201, `status_code: 201`, and `data` contains `id` (no `_id`, no `__v`), `userId` equal to the token's user, `weekNumber`, `createdAt`, `updatedAt`.
- [x] `POST /expenses` with `amount: 12.5`, `amount: 0`, missing `necessityType`, `category: 'CAR'`, `date: '22/09/2026'` or an extra `userId` field returns 400.
- [x] `POST` with `date: '2026-09-22'` stores `2026-09-22T00:00:00.000Z` and returns `weekNumber: 4`. `date: '2026-09-29'` returns `weekNumber: 5`. `date: '2026-09-07'` returns `weekNumber: 1`.
- [x] `GET /expenses?month=9&year=2026` returns only the caller's non-deleted expenses dated in September 2026 UTC, ordered by `date` desc, with `total` equal to the array length (when > 0).
- [x] `GET /expenses` with no params returns the current UTC month.
- [x] `GET /expenses?month=13` returns 400.
- [x] User B calling `GET`, `PATCH` or `DELETE /expenses/:id` on user A's expense gets 404, and A's expense is unchanged.
- [x] `GET /expenses/not-an-id` returns 400.
- [x] `PATCH /expenses/:id` with `{ amount: 900 }` updates only `amount` and bumps `updatedAt`.
- [x] `DELETE /expenses/:id` returns 200. The document still exists in MongoDB with `deletedAt` set. Subsequent `GET`/`PATCH`/`DELETE` on it return 404, and it no longer appears in the list.

## Decisions

- **Yes:** API only. Mobile goes in its own spec.
- **Yes:** `amount` as integer cents. Avoids float rounding in sums.
- **No:** decimal `number` or `Decimal128`. Rounding risk / awkward serialization.
- **Yes:** 404 for other users' expenses, by filtering on `{ _id, userId }`. Does not leak existence.
- **No:** 403 after comparing owner. Reveals that the id exists.
- **Yes:** `category` as a fixed enum. Enables grouping without normalizing free text.
- **No:** free-text category or per-user category collection. Inconsistent data / too big for this spec.
- **Yes:** `source` as optional free text (max 50). Examples (`bla_bla_car`, `unexpected`) are arbitrary.
- **Yes:** `necessityType` values `ESSENTIAL` / `NOT_ESSENTIAL` (underscore) for consistency with the other enum. User originally wrote `NOT-ESSENTIAL`.
- **Yes:** `weekNumber = ceil(dayOfMonth / 7)` as a Mongoose virtual. Simple, not stored, independent of weekday.
- **No:** calendar weeks starting Monday. More complex, not needed now.
- **Yes:** `date` as `YYYY-MM-DD`, stored at UTC midnight. No timezone drift between server and client.
- **No:** full ISO datetime. Would require the user's timezone for month filtering.
- **Yes:** list filtered by `month`/`year`, optional, default current UTC month, no pagination. Monthly volume is small.
- **No:** `from`/`to` range + pagination. Deferred.
- **Yes:** soft delete via `deletedAt`. Allows a future undo/restore.
- **No:** restore endpoint in this spec.
- **Yes:** `ParseObjectIdPipe` from `@nestjs/mongoose` (present in the installed v11). Malformed id is a client error → 400.
- **Yes:** field name `userId` (as requested), not `user`.
- **Yes:** responses expose `id` (Mongoose virtual) and hide `_id` and `__v` via `toJSON`. Queries still filter on `_id`.
- **No:** unit tests of the service with a mocked model. e2e setup does not exist yet as well.

## Risks

| Risk                                                                             | Mitigation                                                                                                                |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| A new query forgets `userId` or `deletedAt: null` and leaks/returns deleted data | Unit tests assert the filter shape for every service method.                                                              |
| Client sends a local date and the user expects local-month grouping              | Contract is date-only `YYYY-MM-DD`; the client sends the user's local calendar day, so no conversion happens server-side. |
| `formatToApiResponse` omits `total` when it is `0` (`if (total)`)                | Accepted: empty list is still detectable via `data.length`. Changing the helper is out of scope.                          |
| `@GetUser()` used on a route without `@Auth()`                                   | Decorator throws 500 with an explicit message instead of returning `undefined`.                                           |

## What is **not** in this spec

- Mobile UI / client integration.
- Custom per-user categories.
- Multi-currency.
- Pagination, date ranges.
- Restore / list of deleted expenses.
- Reports and aggregations.
- Unit tests.
- e2e tests.

Each one of those, if it lands, goes in its own spec.
