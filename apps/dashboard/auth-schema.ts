import {
 pgTable,
 text,
 integer,
 timestamp,
 boolean,
 varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
 id: varchar("id", { length: 36 }).primaryKey(),
 name: text("name").notNull(),
 email: text("email").notNull().unique(),
 emailVerified: boolean("emailVerified").notNull(),
 image: text("image"),
 createdAt: timestamp("createdAt").notNull(),
 updatedAt: timestamp("updatedAt").notNull(),
});

export const session = pgTable("session", {
 id: varchar("id", { length: 36 }).primaryKey(),
 expiresAt: timestamp("expiresAt").notNull(),
 token: text("token").notNull().unique(),
 createdAt: timestamp("createdAt").notNull(),
 updatedAt: timestamp("updatedAt").notNull(),
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
 createdAt: timestamp("createdAt").notNull(),
 updatedAt: timestamp("updatedAt").notNull(),
});

export const verification = pgTable("verification", {
 id: varchar("id", { length: 36 }).primaryKey(),
 identifier: text("identifier").notNull(),
 value: text("value").notNull(),
 expiresAt: timestamp("expiresAt").notNull(),
 createdAt: timestamp("createdAt"),
 updatedAt: timestamp("updatedAt"),
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
 createdAt: timestamp("createdAt").notNull(),
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
