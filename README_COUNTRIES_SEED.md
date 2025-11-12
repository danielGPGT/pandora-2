# Countries Table Seed

## Overview
The `venues` table (and other tables) have a foreign key constraint on `country_code` that references the `countries` table. To use country codes in venues, you need to populate the `countries` table first.

## How to Seed

### Option 1: Using Supabase SQL Editor
1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `database/seed_countries.sql`
4. Run the query

### Option 2: Using psql
```bash
psql -h your-db-host -U postgres -d your-database -f database/seed_countries.sql
```

### Option 3: Using Supabase CLI
```bash
supabase db execute -f database/seed_countries.sql
```

## What Gets Seeded
The script inserts 60+ common countries with:
- ISO 3166-1 alpha-2 country codes (2-letter codes like 'GB', 'US', 'FR')
- Country names
- ISO 3166-1 alpha-3 codes (3-letter codes like 'GBR', 'USA', 'FRA')
- Region classification

## Safe to Run Multiple Times
The script uses `ON CONFLICT (code) DO NOTHING`, so it's safe to run multiple times. It won't create duplicates.

## Adding More Countries
If you need additional countries, simply add more rows to the `INSERT` statement in `database/seed_countries.sql` following the same format:
```sql
('XX', 'Country Name', 'XXX', 'Region'),
```

## Verification
After running the seed, you can verify it worked by checking:
```sql
SELECT COUNT(*) FROM countries;
-- Should return the number of countries inserted
```

