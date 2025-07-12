import {
  users,
  items,
  swaps,
  pointTransactions,
  cartItems,
  orders,
  orderItems,
  type User,
  type UpsertUser,
  type Item,
  type InsertItem,
  type Swap,
  type InsertSwap,
  type PointTransaction,
  type InsertPointTransaction,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Item operations
  getItems(filters?: { category?: string; status?: string; ownerId?: string }): Promise<Item[]>;
  getItem(id: number): Promise<Item | undefined>;
  createItem(item: InsertItem & { ownerId: string }): Promise<Item>;
  updateItem(id: number, updates: Partial<Item>): Promise<Item>;
  deleteItem(id: number): Promise<void>;
  getFeaturedItems(): Promise<Item[]>;
  getPendingItems(): Promise<Item[]>;
  
  // Swap operations
  getSwaps(filters?: { requesterId?: string; itemId?: number; status?: string }): Promise<Swap[]>;
  getSwap(id: number): Promise<Swap | undefined>;
  createSwap(swap: InsertSwap): Promise<Swap>;
  updateSwap(id: number, updates: Partial<Swap>): Promise<Swap>;
  
  // Point operations
  getPointTransactions(userId: string): Promise<PointTransaction[]>;
  createPointTransaction(transaction: InsertPointTransaction): Promise<PointTransaction>;
  updateUserPoints(userId: string, pointChange: number): Promise<User>;
  
  // Cart operations
  getCartItems(userId: string): Promise<(CartItem & { item: Item })[]>;
  addToCart(userId: string, itemId: number, quantity: number): Promise<CartItem>;
  updateCartItem(userId: string, itemId: number, quantity: number): Promise<CartItem>;
  removeFromCart(userId: string, itemId: number): Promise<void>;
  clearCart(userId: string): Promise<void>;
  
  // Order operations
  getOrders(userId?: string): Promise<(Order & { orderItems: (OrderItem & { item: Item })[] })[]>;
  getOrder(id: number): Promise<(Order & { orderItems: (OrderItem & { item: Item })[] }) | undefined>;
  createOrder(orderData: InsertOrder): Promise<Order>;
  addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Admin operations
  getAdminStats(): Promise<{
    pendingReviews: number;
    approvedToday: number;
    rejectedToday: number;
    totalItems: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Item operations
  async getItems(filters?: { category?: string; status?: string; ownerId?: string }): Promise<Item[]> {
    const conditions = [] as ReturnType<typeof eq>[];

    if (filters?.category) {
      conditions.push(eq(items.category, filters.category));
    }
    if (filters?.status) {
      conditions.push(eq(items.status, filters.status));
    }
    if (filters?.ownerId) {
      conditions.push(eq(items.ownerId, filters.ownerId));
    }

    // Build the query once to avoid type–narrowing issues when conditionally calling `.where()`
    const baseQuery = db.select().from(items);
    const finalQuery = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

    return await finalQuery.orderBy(desc(items.createdAt)).execute();
  }

  async getItem(id: number): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item;
  }

  async createItem(itemData: InsertItem & { ownerId: string }): Promise<Item> {
    const [item] = await db
      .insert(items)
      .values(itemData)
      .returning();
    return item;
  }

  async updateItem(id: number, updates: Partial<Item>): Promise<Item> {
    const [item] = await db
      .update(items)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(items.id, id))
      .returning();
    return item;
  }

  async deleteItem(id: number): Promise<void> {
    await db.delete(items).where(eq(items.id, id));
  }

  async getFeaturedItems(): Promise<Item[]> {
    return db
      .select()
      .from(items)
      .where(eq(items.status, 'approved'))
      .orderBy(desc(items.createdAt))
      .limit(8);
  }

  async getPendingItems(): Promise<Item[]> {
    return db
      .select()
      .from(items)
      .where(eq(items.status, 'pending'))
      .orderBy(desc(items.createdAt));
  }

  // Swap operations
  async getSwaps(filters?: { requesterId?: string; itemId?: number; status?: string }): Promise<Swap[]> {
    const conditions = [] as ReturnType<typeof eq>[];

    if (filters?.requesterId) {
      conditions.push(eq(swaps.requesterId, filters.requesterId));
    }
    if (filters?.itemId) {
      conditions.push(eq(swaps.itemId, filters.itemId));
    }
    if (filters?.status) {
      conditions.push(eq(swaps.status, filters.status));
    }

    // Build the query once and conditionally apply the where clause to avoid type–narrowing issues
    const baseQuery = db.select().from(swaps);
    const finalQuery = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

    return await finalQuery.orderBy(desc(swaps.createdAt)).execute();
  }

  async getSwap(id: number): Promise<Swap | undefined> {
    const [swap] = await db.select().from(swaps).where(eq(swaps.id, id));
    return swap;
  }

  async createSwap(swapData: InsertSwap): Promise<Swap> {
    const [swap] = await db
      .insert(swaps)
      .values(swapData)
      .returning();
    return swap;
  }

  async updateSwap(id: number, updates: Partial<Swap>): Promise<Swap> {
    const [swap] = await db
      .update(swaps)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(swaps.id, id))
      .returning();
    return swap;
  }

  // Point operations
  async getPointTransactions(userId: string): Promise<PointTransaction[]> {
    return db
      .select()
      .from(pointTransactions)
      .where(eq(pointTransactions.userId, userId))
      .orderBy(desc(pointTransactions.createdAt));
  }

  async createPointTransaction(transactionData: InsertPointTransaction): Promise<PointTransaction> {
    const [transaction] = await db
      .insert(pointTransactions)
      .values(transactionData)
      .returning();
    
    // Update user points
    await this.updateUserPoints(transactionData.userId, transactionData.amount);
    
    return transaction;
  }

  async updateUserPoints(userId: string, pointChange: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        points: sql`${users.points} + ${pointChange}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Cart operations
  async getCartItems(userId: string): Promise<(CartItem & { item: Item })[]> {
    const result = await db
      .select({
        id: cartItems.id,
        userId: cartItems.userId,
        itemId: cartItems.itemId,
        quantity: cartItems.quantity,
        createdAt: cartItems.createdAt,
        updatedAt: cartItems.updatedAt,
        item: items,
      })
      .from(cartItems)
      .innerJoin(items, eq(cartItems.itemId, items.id))
      .where(eq(cartItems.userId, userId))
      .orderBy(desc(cartItems.createdAt));

    return result;
  }

  async addToCart(userId: string, itemId: number, quantity: number): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.itemId, itemId)));

    if (existingItem) {
      // Update quantity if item already in cart
      const [updatedItem] = await db
        .update(cartItems)
        .set({
          quantity: existingItem.quantity + quantity,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Add new item to cart
      const [newItem] = await db
        .insert(cartItems)
        .values({ userId, itemId, quantity })
        .returning();
      return newItem;
    }
  }

  async updateCartItem(userId: string, itemId: number, quantity: number): Promise<CartItem> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({
        quantity,
        updatedAt: new Date(),
      })
      .where(and(eq(cartItems.userId, userId), eq(cartItems.itemId, itemId)))
      .returning();
    return updatedItem;
  }

  async removeFromCart(userId: string, itemId: number): Promise<void> {
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.itemId, itemId)));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Order operations
  async getOrders(userId?: string): Promise<(Order & { orderItems: (OrderItem & { item: Item })[] })[]> {
    const baseQuery = db.select().from(orders);
    const finalQuery = userId ? baseQuery.where(eq(orders.userId, userId)) : baseQuery;

    const ordersResult = await finalQuery.orderBy(desc(orders.createdAt)).execute();
    
    // Get order items for each order
    const ordersWithItems = await Promise.all(
      ordersResult.map(async (order) => {
        const orderItemsResult = await db
          .select({
            id: orderItems.id,
            orderId: orderItems.orderId,
            itemId: orderItems.itemId,
            quantity: orderItems.quantity,
            pointsPerItem: orderItems.pointsPerItem,
            createdAt: orderItems.createdAt,
            item: items,
          })
          .from(orderItems)
          .innerJoin(items, eq(orderItems.itemId, items.id))
          .where(eq(orderItems.orderId, order.id));

        return {
          ...order,
          orderItems: orderItemsResult,
        };
      })
    );

    return ordersWithItems;
  }

  async getOrder(id: number): Promise<(Order & { orderItems: (OrderItem & { item: Item })[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    
    if (!order) return undefined;

    const orderItemsResult = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        itemId: orderItems.itemId,
        quantity: orderItems.quantity,
        pointsPerItem: orderItems.pointsPerItem,
        createdAt: orderItems.createdAt,
        item: items,
      })
      .from(orderItems)
      .innerJoin(items, eq(orderItems.itemId, items.id))
      .where(eq(orderItems.orderId, order.id));

    return {
      ...order,
      orderItems: orderItemsResult,
    };
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(orderData)
      .returning();
    return order;
  }

  async addOrderItem(orderItemData: InsertOrderItem): Promise<OrderItem> {
    const [orderItem] = await db
      .insert(orderItems)
      .values(orderItemData)
      .returning();
    return orderItem;
  }

  // Admin operations
  async getAdminStats(): Promise<{
    pendingReviews: number;
    approvedToday: number;
    rejectedToday: number;
    totalItems: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [pendingCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(items)
      .where(eq(items.status, 'pending'));
    
    const [approvedTodayCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(items)
      .where(and(
        eq(items.status, 'approved'),
        sql`${items.updatedAt} >= ${today}`
      ));
    
    const [rejectedTodayCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(items)
      .where(and(
        eq(items.status, 'rejected'),
        sql`${items.updatedAt} >= ${today}`
      ));
    
    const [totalCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(items);
    
    return {
      pendingReviews: pendingCount.count,
      approvedToday: approvedTodayCount.count,
      rejectedToday: rejectedTodayCount.count,
      totalItems: totalCount.count,
    };
  }
}

export const storage = new DatabaseStorage();
