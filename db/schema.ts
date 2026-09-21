import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from 'drizzle-orm/sqlite-core';
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  salt: text('salt').notNull(),
});
export const sessions = sqliteTable('sessions', {
  tokenHash: text('token_hash').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires').notNull(),
});
export const completed = sqliteTable(
  'completed',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    deadlineId: text('deadline_id').notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.deadlineId] })],
);
export const todos = sqliteTable(
  'todos',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    id: text('id').notNull(),
    title: text('title').notNull(),
    done: integer('done').notNull().default(0),
    created: integer('created').notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.id] })],
);
export const attempts = sqliteTable('auth_attempts', {
  key: text('key').primaryKey(),
  count: integer('count').notNull(),
  expires: integer('expires').notNull(),
});
