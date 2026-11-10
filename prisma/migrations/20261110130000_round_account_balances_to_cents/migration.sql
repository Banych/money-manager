-- The old recompute stored unrounded income - expense (e.g. 5.55e-17 for an
-- account shown as 0.00), which DELETE /api/accounts/[id] refuses because it
-- requires balance === 0. The previous migration rounded openingBalance only;
-- round balance too so balance = openingBalance + net holds to the cent and
-- the first recompute after deploy changes no balance.
UPDATE "FinancialAccount"
SET "balance" = ROUND("balance"::numeric, 2)::double precision
WHERE "balance" <> ROUND("balance"::numeric, 2)::double precision;
