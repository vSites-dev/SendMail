import {
  integer,
  timestamp,
  varchar,
  text,
  boolean,
  pgTable,
  uuid,
  smallint,
  serial,
  jsonb,
  pgTableCreator,
  primaryKey,
  unique,
  index,
  foreignKey,
  vector,
  pgEnum,
  customType,
} from "drizzle-orm/pg-core";
import { relations, SQL, sql } from "drizzle-orm";

// -----------------------------------------------------------------------------
// TABLES FOR THE AUTHENTICATION
// -----------------------------------------------------------------------------

// User - registered users
// Session - one user -> many sessions (storing every sessions' active chatbot - for SSR)
// Account - one user -> many accounts (e.g. google, credentials)
// Verification - for sending out verification emails
// Organization - one user -> many organizations (aka. chatbots/companies)
// Member - one organization -> many members (users)
// Invitation - invitations to join an organization

// ***

export const user = pgTable("user", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});
export const session = pgTable("session", {
  id: varchar("id", { length: 36 }).primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  activeOrganizationId: text("activeOrganizationId").references(
    () => organization.id,
  ),
});
export const account = pgTable("account", {
  id: varchar("id", { length: 36 }).primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});
export const verification = pgTable("verification", {
  id: varchar("id", { length: 36 }).primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});
export const organization = pgTable("organization", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  logo: text("logo"),
  createdAt: timestamp("createdAt").notNull(),
  metadata: text("metadata"),
});
export const member = pgTable("member", {
  id: varchar("id", { length: 36 }).primaryKey(),
  organizationId: text("organizationId")
    .notNull()
    .references(() => organization.id),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  role: text("role").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});
export const invitation = pgTable("invitation", {
  id: varchar("id", { length: 36 }).primaryKey(),
  organizationId: text("organizationId")
    .notNull()
    .references(() => organization.id),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  inviterId: text("inviterId")
    .notNull()
    .references(() => user.id),
});

// ***
