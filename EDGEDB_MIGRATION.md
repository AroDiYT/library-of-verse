# EdgeDB Migration Plan for Forged Pacts

## Current Status
✅ EdgeDB client setup complete
✅ EdgeDB schema created (`dbschema/default.esdl`)
✅ Query libraries created:
  - `src/lib/edgedb.ts` - EdgeDB client
  - `src/lib/edgedb-queries.ts` - User, Session, Novel queries
  - `src/lib/edgedb-content-queries.ts` - Chapter, Character queries
  - `src/lib/edgedb-additional-queries.ts` - RegionCard, ContentSection, Suggestion queries
✅ New auth library created (`src/lib/auth-edgedb.ts`)
✅ Sample API route updated (`src/app/api/characters/route.ts`)

## Next Steps Required

### 1. Initialize EdgeDB Schema
```bash
# Install EdgeDB CLI if not already installed
npx @edgedb/create@latest

# Apply schema to your EdgeDB instance
npx edgedb migrate
```

### 2. Create Initial Data Migration Script
You'll need to create a script to migrate your existing SQLite data to EdgeDB. This includes:
- Users
- Novels  
- Chapters
- Characters
- Region Cards
- Content Sections
- Sessions

### 3. Update All API Routes
The following API routes need to be updated to use EdgeDB:

#### User/Auth Routes:
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/app/api/auth/me/route.ts`
- `src/app/api/admin/users/route.ts`
- `src/app/api/admin/users/[id]/route.ts`

#### Content Routes:
- `src/app/api/novels/route.ts`
- `src/app/api/novels/[id]/route.ts`
- `src/app/api/chapters/route.ts`
- `src/app/api/chapters/[id]/route.ts`
- `src/app/api/characters/[id]/route.ts` (partially done)
- `src/app/api/content/route.ts`
- `src/app/api/content/[id]/route.ts`
- `src/app/api/content-sections/route.ts`
- `src/app/api/content-sections/[id]/route.ts`
- `src/app/api/region-cards/route.ts`
- `src/app/api/region-cards/[id]/route.ts`

#### Admin Routes:
- `src/app/api/admin/chapters/route.ts`
- `src/app/api/admin/chapters/[id]/route.ts`
- `src/app/api/admin/characters/route.ts`
- `src/app/api/admin/characters/[id]/route.ts`
- `src/app/api/admin/analytics/route.ts`
- `src/app/api/admin/database/route.ts`
- `src/app/api/admin/suggestions/route.ts`

#### Other Routes:
- `src/app/api/suggestions/route.ts`
- `src/app/api/suggestions/[id]/vote/route.ts`
- `src/app/api/messages/route.ts`
- `src/app/api/messages/[id]/route.ts`

### 4. Update Import Statements
All files that import from `@/lib/auth` or `@/lib/database` need to be updated to use the new EdgeDB equivalents.

### 5. Update Frontend Components
Some frontend components may need updates to handle the new UUID-based IDs instead of integer IDs.

## Implementation Strategy

### Option 1: Gradual Migration
1. Run both SQLite and EdgeDB in parallel
2. Migrate API routes one by one
3. Test each route thoroughly
4. Once all routes are migrated, remove SQLite

### Option 2: Complete Migration
1. Set up EdgeDB with full schema
2. Migrate all data at once
3. Update all API routes
4. Deploy with full EdgeDB support

## Key Changes Required

### ID Types
- Change from `number` to `string` (UUID) for all entity IDs
- Update TypeScript interfaces
- Update database relationships

### Query Patterns
```typescript
// Old SQLite pattern
const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);

// New EdgeDB pattern  
const user = await userQueries.findById(id);
```

### Async/Await
All database operations are now async and return Promises.

## Files to Update

### Libraries
- ✅ `src/lib/edgedb.ts` - Done
- ✅ `src/lib/edgedb-queries.ts` - Done
- ✅ `src/lib/edgedb-content-queries.ts` - Done  
- ✅ `src/lib/edgedb-additional-queries.ts` - Done
- ✅ `src/lib/auth-edgedb.ts` - Done
- ❌ `src/lib/auth.ts` - Needs replacement with auth-edgedb.ts
- ❌ `src/lib/database.ts` - Can be deprecated

### API Routes (30+ files need updating)
- See list above

### Frontend Components
Any component that uses hardcoded integer IDs or imports auth/database libraries.

## Estimated Time
- Full migration: 8-12 hours
- Gradual migration: 2-3 hours per batch of routes

## Recommendation
I recommend starting with a gradual migration approach:
1. Test the EdgeDB connection first
2. Migrate auth routes first (critical functionality)
3. Then migrate content routes
4. Finally migrate admin routes

Would you like me to continue with specific route migrations or would you prefer to handle this migration yourself using the provided structure?
