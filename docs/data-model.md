# QuickNotes Data Model

## Overview
We choose SQL PostgreSQL for strong consistency, relationships, ACID guarantees, and JOINs for tags. NoSQL would lose referential integrity for user data.

## Entities

### 1. users
| Column | Type | Constraints |
| id | UUID | PRIMARY KEY |
| email | VARCHAR(255) | UNIQUE NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| display_name | VARCHAR(100) | NOT NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() NOT NULL |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() NOT NULL |

### 2. notes
| Column | Type | Constraints |
| id | UUID | PRIMARY KEY |
| user_id | UUID | FK -> users.id NOT NULL |
| title | VARCHAR(100) | NOT NULL CHECK length <=100 |
| body | TEXT | NULLABLE |
| is_pinned | BOOLEAN | DEFAULT false |
| is_archived | BOOLEAN | DEFAULT false |
| deleted_at | TIMESTAMPTZ | NULL soft delete |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

### 3. tags
| Column | Type | Constraints |
| id | UUID | PRIMARY KEY |
| user_id | UUID | FK -> users.id NOT NULL |
| name | VARCHAR(50) | NOT NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| UNIQUE | (user_id, name) | Composite UNIQUE |

### 4. note_tags (junction table)
| Column | Type | Constraints |
| note_id | UUID | FK -> notes.id ON DELETE CASCADE |
| tag_id | UUID | FK -> tags.id ON DELETE CASCADE |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| PRIMARY KEY | (note_id, tag_id) | Composite PK |

## Relationships
- users 1-to-many notes: One user can have many notes, each note belongs to exactly one user. Implemented via notes.user_id FK -> users.id.
- users 1-to-many tags: One user can have many tags, each tag belongs to one user. Implemented via tags.user_id FK.
- notes many-to-many tags: One note can have many tags, one tag can be on many notes. Implemented via junction table note_tags with composite PK (note_id, tag_id) and two FKs. This avoids duplication and allows efficient filtering.

## CREATE TABLE Statements

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL CHECK (char_length(title) > 0 AND char_length(title) <= 100),
  body TEXT,
  is_pinned BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, name)
);

CREATE TABLE note_tags (
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (note_id, tag_id)
);
