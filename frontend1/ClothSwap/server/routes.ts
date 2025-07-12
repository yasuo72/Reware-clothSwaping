import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertItemSchema, insertSwapSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    // Add CORS headers for file serving
    res.header('Access-Control-Allow-Origin', '*');
    next();
  }, express.static('uploads'));

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Item routes
  app.get('/api/items', async (req, res) => {
    try {
      const { category, status = 'approved' } = req.query;
      const items = await storage.getItems({
        category: category as string,
        status: status as string,
      });
      res.json(items);
    } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  app.get('/api/items/featured', async (req, res) => {
    try {
      const items = await storage.getFeaturedItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching featured items:", error);
      res.status(500).json({ message: "Failed to fetch featured items" });
    }
  });

  app.get('/api/items/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getItem(id);
      
      if (!item) {
        // return placeholder so that the product page can still render in empty DB
        return res.json({
          id,
          name: "Placeholder Item",
          description: "This is a demo item shown because the database is empty.",
          category: "unknown",
          pointValue: 0,
          images: [],
        });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching item:", error);
      res.status(500).json({ message: "Failed to fetch item" });
    }
  });

  app.post('/api/items', isAuthenticated, upload.array('images', 5), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const files = req.files as Express.Multer.File[];
      
      // Validate item data
      const itemData = insertItemSchema.parse({
        ...req.body,
        pointValue: parseInt(req.body.pointValue),
        tags: req.body.tags ? req.body.tags.split(',').map((tag: string) => tag.trim()) : [],
      });

      // Process uploaded images
      const imageUrls: string[] = [];
      if (files && files.length > 0) {
        for (const file of files) {
          const filename = `${Date.now()}-${file.originalname}`;
          const filepath = path.join('uploads', filename);
          fs.renameSync(file.path, filepath);
          imageUrls.push(`/uploads/${filename}`);
        }
      }

      const item = await storage.createItem({
        ...itemData,
        ownerId: userId,
        imageUrls,
      });

      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating item:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create item" });
    }
  });

  app.get('/api/my-items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const items = await storage.getItems({ ownerId: userId });
      res.json(items);
    } catch (error) {
      console.error("Error fetching user items:", error);
      res.status(500).json({ message: "Failed to fetch user items" });
    }
  });

  // Swap routes
  app.get('/api/swaps', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const swaps = await storage.getSwaps({ requesterId: userId });
      res.json(swaps);
    } catch (error) {
      console.error("Error fetching swaps:", error);
      res.status(500).json({ message: "Failed to fetch swaps" });
    }
  });

  app.post('/api/swaps', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const swapData = insertSwapSchema.parse({
        ...req.body,
        requesterId: userId,
      });

      // Check if user has enough points for redemption
      if (swapData.type === 'redeem') {
        const user = await storage.getUser(userId);
        const item = await storage.getItem(swapData.itemId);
        
        if (!user || !item) {
          return res.status(404).json({ message: "User or item not found" });
        }
        
        if (user.points < item.pointValue) {
          return res.status(400).json({ message: "Insufficient points" });
        }
      }

      const swap = await storage.createSwap(swapData);
      res.status(201).json(swap);
    } catch (error) {
      console.error("Error creating swap:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create swap" });
    }
  });

  app.patch('/api/swaps/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const swap = await storage.updateSwap(id, updates);
      
      // Handle point transactions for completed swaps
      if (updates.status === 'completed') {
        const swapData = await storage.getSwap(id);
        const item = await storage.getItem(swapData!.itemId);
        
        if (swapData?.type === 'redeem' && item) {
          // Deduct points from requester
          await storage.createPointTransaction({
            userId: swapData.requesterId,
            amount: -item.pointValue,
            type: 'spent',
            description: `Redeemed ${item.title}`,
            relatedItemId: item.id,
            relatedSwapId: id,
          });
          
          // Award points to item owner
          await storage.createPointTransaction({
            userId: item.ownerId,
            amount: item.pointValue,
            type: 'earned',
            description: `Item redeemed: ${item.title}`,
            relatedItemId: item.id,
            relatedSwapId: id,
          });
          
          // Mark item as swapped
          await storage.updateItem(item.id, { status: 'swapped' });
        }
      }
      
      res.json(swap);
    } catch (error) {
      console.error("Error updating swap:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to update swap" });
    }
  });

  // Point transaction routes
  app.get('/api/point-transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getPointTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching point transactions:", error);
      res.status(500).json({ message: "Failed to fetch point transactions" });
    }
  });

  // Cart routes
  app.get('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post('/api/cart/add', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { itemId, quantity } = req.body;
      
      if (!itemId || !quantity || quantity < 1) {
        return res.status(400).json({ message: "Invalid item or quantity" });
      }

      const cartItem = await storage.addToCart(userId, itemId, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  app.put('/api/cart/update', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { itemId, quantity } = req.body;
      
      if (!itemId || quantity < 1) {
        return res.status(400).json({ message: "Invalid item or quantity" });
      }

      const cartItem = await storage.updateCartItem(userId, itemId, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete('/api/cart/remove/:itemId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemId = parseInt(req.params.itemId);
      
      if (!itemId) {
        return res.status(400).json({ message: "Invalid item ID" });
      }

      await storage.removeFromCart(userId, itemId);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });

  // Checkout routes
  app.post('/api/checkout/points', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { cartItems: orderItems } = req.body;
      
      const totalPoints = orderItems.reduce((sum: number, item: any) => 
        sum + (item.pointsPerItem * item.quantity), 0
      );

      const user = await storage.getUser(userId);
      if (!user || user.points < totalPoints) {
        return res.status(400).json({ message: "Insufficient points" });
      }

      const order = await storage.createOrder({
        userId,
        totalPoints
      });

      for (const item of orderItems) {
        await storage.addOrderItem({
          orderId: order.id,
          itemId: item.itemId,
          quantity: item.quantity,
          pointsPerItem: item.pointsPerItem
        });
      }

      await storage.updateUserPoints(userId, -totalPoints);
      await storage.clearCart(userId);

      res.json({ orderId: order.id, message: "Order placed successfully" });
    } catch (error) {
      console.error("Error processing points payment:", error);
      res.status(500).json({ message: "Failed to process payment" });
    }
  });

  app.post("/api/create-payment-intent", isAuthenticated, async (req: any, res) => {
    try {
      const { amount } = req.body;
      const clientSecret = `pi_mock_${Date.now()}_secret_mock`;
      res.json({ clientSecret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Order routes
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get('/api/admin/pending-items', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const items = await storage.getPendingItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching pending items:", error);
      res.status(500).json({ message: "Failed to fetch pending items" });
    }
  });

  app.patch('/api/admin/items/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const item = await storage.updateItem(id, { status });
      
      // Award points for approved items
      if (status === 'approved') {
        await storage.createPointTransaction({
          userId: item.ownerId,
          amount: 10,
          type: 'bonus',
          description: `Bonus for approved item: ${item.title}`,
          relatedItemId: item.id,
        });
      }
      
      res.json(item);
    } catch (error) {
      console.error("Error updating item status:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to update item status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
