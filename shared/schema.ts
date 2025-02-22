import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const wispers = pgTable("wispers", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  userId: integer("user_id").references(() => users.id),
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  wisperId: integer("wisper_id").references(() => wispers.id),
  voteType: text("vote_type").notNull(), // 'upvote' or 'downvote'
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  wisperId: integer("wisper_id").references(() => wispers.id),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(), // 'like', 'comment', 'security'
  content: text("content").notNull(),
  wisperId: integer("wisper_id").references(() => wispers.id),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertWisperSchema = createInsertSchema(wispers).pick({
  content: true,
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  content: true,
  wisperId: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  type: true,
  content: true,
  wisperId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Wisper = typeof wispers.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Vote = typeof votes.$inferSelect;
export type Notification = typeof notifications.$inferSelect;