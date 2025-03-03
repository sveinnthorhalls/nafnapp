# Firebase Database Schema for Name Swiper App (Optimized)

This document outlines the optimized structure of our Firebase Firestore database.

## Collections and Documents

### Collection: `users`
- **Document ID**: `{userId}` (auto-generated Firebase Auth UID)
- **Fields**:
  - `userId`: string (same as document ID)
  - `coupleId`: string (reference to the couple this user belongs to)
  - `email`: string
  - `role`: string ('partner1' or 'partner2')
  - `createdAt`: timestamp

### Collection: `couples`
- **Document ID**: `{coupleId}` (generated with expo-crypto randomUUID)
- **Fields**:
  - `coupleId`: string (same as document ID)
  - `nickname`: string (e.g., "John & Sarah")
  - `partner1`: string (userId of first partner)
  - `partner2`: string (userId of second partner, can be null initially)
  - `createdAt`: timestamp
  - `preferredGender`: string (optional, 'female' | 'male' | 'both')

### Collection: `masterNames`
- **Document ID**: `{nameId}` (unique ID for each name)
- **Fields**:
  - `id`: string (same as document ID)
  - `name`: string
  - `gender`: string ('female' | 'male' | 'unisex')
  - `meaning`: string (optional)
  - `origin`: string (optional)
  - `popularity`: number (optional)
  - `createdAt`: timestamp

### Collection: `nameLikes`
- **Document ID**: auto-generated
- **Fields**:
  - `nameId`: string (reference to a name in masterNames)
  - `coupleId`: string (reference to the couple)
  - `partner1Like`: boolean | null
  - `partner2Like`: boolean | null
  - `createdAt`: timestamp
  - `updatedAt`: timestamp

## Advantages of this Structure

1. **Reduced Data Duplication**: Names are stored once in `masterNames` regardless of how many couples use the app
2. **Easier Updates**: Adding new names or updating name information only needs to be done in one place
3. **Better Performance**: Smaller documents in `nameLikes` collection
4. **Usage Analytics**: Can easily track which names are most popular across all couples

## Relationships

1. Each `user` belongs to one `couple` (referenced by `coupleId`)
2. Each `couple` has two `users` (referenced by `partner1` and `partner2`)
3. Many `nameLikes` reference one `couple` (via `coupleId`)
4. Many `nameLikes` reference one `masterName` (via `nameId`)

## Access Patterns

1. When a new couple is created, no `nameLike` records exist yet
2. When they start swiping, create `nameLike` records on demand
3. To get names to swipe, query for names in `masterNames` that don't have a corresponding `nameLike` record for the current couple
4. To get matched names, query for `nameLike` records where both partners liked the name