import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  points: integer("points").default(100).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("5.0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(),
  size: varchar("size").notNull(),
  condition: varchar("condition").notNull(),
  brand: varchar("brand"),
  pointValue: integer("point_value").notNull(),
  tags: text("tags").array(),
  imageUrls: text("image_urls").array(),
  status: varchar("status").default("pending").notNull(), // pending, approved, rejected, swapped
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const swaps = pgTable("swaps", {
  id: serial("id").primaryKey(),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  itemId: integer("item_id").notNull().references(() => items.id),
  offeredItemId: integer("offered_item_id").references(() => items.id), // null for point redemption
  type: varchar("type").notNull(), // swap or redeem
  status: varchar("status").default("pending").notNull(), // pending, accepted, rejected, completed
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pointTransactions = pgTable("point_transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(), // positive for earning, negative for spending
  type: varchar("type").notNull(), // earned, spent, bonus
  description: text("description").notNull(),
  relatedItemId: integer("related_item_id").references(() => items.id),
  relatedSwapId: integer("related_swap_id").references(() => swaps.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cart items table for shopping cart functionality
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  itemId: integer("item_id").notNull().references(() => items.id),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders table for purchase history
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  totalPoints: integer("total_points").notNull(),
  status: varchar("status").notNull().default("pending"), // 'pending', 'completed', 'cancelled'
  paymentIntentId: varchar("payment_intent_id"), // For Stripe integration
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order items table to track what was purchased
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  itemId: integer("item_id").notNull().references(() => items.id),
  quantity: integer("quantity").notNull().default(1),
  pointsPerItem: integer("points_per_item").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  items: many(items),
  swapsRequested: many(swaps, { relationName: "requester" }),
  pointTransactions: many(pointTransactions),
  cartItems: many(cartItems),
  orders: many(orders),
}));

export const itemsRelations = relations(items, ({ one, many }) => ({
  owner: one(users, {
    fields: [items.ownerId],
    references: [users.id],
  }),
  swaps: many(swaps),
  pointTransactions: many(pointTransactions),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));

export const swapsRelations = relations(swaps, ({ one }) => ({
  requester: one(users, {
    fields: [swaps.requesterId],
    references: [users.id],
    relationName: "requester",
  }),
  item: one(items, {
    fields: [swaps.itemId],
    references: [items.id],
  }),
  offeredItem: one(items, {
    fields: [swaps.offeredItemId],
    references: [items.id],
  }),
}));

export const pointTransactionsRelations = relations(pointTransactions, ({ one }) => ({
  user: one(users, {
    fields: [pointTransactions.userId],
    references: [users.id],
  }),
  relatedItem: one(items, {
    fields: [pointTransactions.relatedItemId],
    references: [items.id],
  }),
  relatedSwap: one(swaps, {
    fields: [pointTransactions.relatedSwapId],
    references: [swaps.id],
  }),
}));

// Cart relations
export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  item: one(items, {
    fields: [cartItems.itemId],
    references: [items.id],
  }),
}));

// Order relations
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  item: one(items, {
    fields: [orderItems.itemId],
    references: [items.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
  status: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSwapSchema = createInsertSchema(swaps).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPointTransactionSchema = createInsertSchema(pointTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type Item = typeof items.$inferSelect;
export type InsertSwap = z.infer<typeof insertSwapSchema>;
export type Swap = typeof swaps.$inferSelect;
export type InsertPointTransaction = z.infer<typeof insertPointTransactionSchema>;
export type PointTransaction = typeof pointTransactions.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
