import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import {
  insertVehicleSchema,
  insertRfidTagSchema,
  insertPaymentMethodSchema,
  insertTransactionSchema,
} from "@shared/schema";
import { z } from "zod";
import { WebSocketServer, WebSocket } from 'ws';

// Store connected clients with their user IDs for selective messaging
const clients = new Map<string, WebSocket>();

// Helper function to broadcast messages to all connected clients
function broadcastMessage(type: string, payload: any) {
  const message = JSON.stringify({ type, payload });
  
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Helper function to send message to a specific user
function sendToUser(userId: number, type: string, payload: any) {
  const message = JSON.stringify({ type, payload });
  
  clients.forEach((client, id) => {
    // Format can be "user-123" where 123 is the user ID
    if (id === `user-${userId}` && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Helper function to send message to a specific station
function sendToStation(stationId: number, type: string, payload: any) {
  const message = JSON.stringify({ type, payload });
  
  clients.forEach((client, id) => {
    // Format can be "station-123" where 123 is the station ID
    if (id === `station-${stationId}` && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Vehicle routes
  app.get("/api/vehicles", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const userId = req.user!.id;
    const vehicles = await storage.getVehiclesByUser(userId);
    
    // Get RFID tags for each vehicle
    const vehiclesWithTags = await Promise.all(
      vehicles.map(async (vehicle) => {
        const tags = await storage.getRfidTagsByVehicle(vehicle.id);
        return { ...vehicle, rfidTag: tags.length > 0 ? tags[0] : null };
      })
    );
    
    res.json(vehiclesWithTags);
  });

  app.post("/api/vehicles", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = req.user!.id;
      const validatedData = insertVehicleSchema.parse({ ...req.body, userId });
      const vehicle = await storage.createVehicle(validatedData);
      res.status(201).json(vehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create vehicle" });
    }
  });

  app.get("/api/vehicles/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const vehicleId = parseInt(req.params.id);
    const vehicle = await storage.getVehicle(vehicleId);
    
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    
    if (vehicle.userId !== req.user!.id) {
      return res.status(403).json({ error: "Not authorized to access this vehicle" });
    }
    
    const tags = await storage.getRfidTagsByVehicle(vehicleId);
    res.json({ ...vehicle, rfidTag: tags.length > 0 ? tags[0] : null });
  });

  // RFID tag routes
  app.post("/api/vehicles/:id/rfid-tag", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const vehicleId = parseInt(req.params.id);
    const vehicle = await storage.getVehicle(vehicleId);
    
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    
    if (vehicle.userId !== req.user!.id) {
      return res.status(403).json({ error: "Not authorized to access this vehicle" });
    }
    
    try {
      // Generate a random tag number
      const tagNumber = `FT${Math.floor(Math.random() * 10000000)}`;
      
      const validatedData = insertRfidTagSchema.parse({
        vehicleId,
        tagNumber,
        status: "active",
      });
      
      const tag = await storage.createRfidTag(validatedData);
      res.status(201).json(tag);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create RFID tag" });
    }
  });

  // Fuel station routes
  app.get("/api/stations", async (req: Request, res: Response) => {
    const stations = await storage.getAllFuelStations();
    
    // Get fuel prices for each station
    const stationsWithPrices = await Promise.all(
      stations.map(async (station) => {
        const prices = await storage.getFuelPricesByStation(station.id);
        return { ...station, fuelPrices: prices };
      })
    );
    
    res.json(stationsWithPrices);
  });

  app.get("/api/stations/nearby", async (req: Request, res: Response) => {
    const lat = parseFloat(req.query.lat as string) || 19.0760;
    const lng = parseFloat(req.query.lng as string) || 72.8777;
    const radius = parseFloat(req.query.radius as string) || 10;
    
    const stations = await storage.getNearbyFuelStations(lat, lng, radius);
    
    // Get fuel prices for each station
    const stationsWithPrices = await Promise.all(
      stations.map(async (station) => {
        const prices = await storage.getFuelPricesByStation(station.id);
        return { ...station, fuelPrices: prices };
      })
    );
    
    res.json(stationsWithPrices);
  });

  // Payment methods routes
  app.get("/api/payment-methods", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const userId = req.user!.id;
    const methods = await storage.getPaymentMethodsByUser(userId);
    res.json(methods);
  });

  app.post("/api/payment-methods", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = req.user!.id;
      const validatedData = insertPaymentMethodSchema.parse({ ...req.body, userId });
      const method = await storage.createPaymentMethod(validatedData);
      res.status(201).json(method);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create payment method" });
    }
  });

  // Wallet routes
  app.get("/api/wallet", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const userId = req.user!.id;
    const wallet = await storage.getWalletByUser(userId);
    
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }
    
    res.json(wallet);
  });

  app.post("/api/wallet/topup", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const userId = req.user!.id;
    
    // Log the request body to help with debugging
    console.log("Top-up request received:", req.body);
    
    // Handle amount as either string or number
    const amount = typeof req.body.amount === 'string' 
      ? parseFloat(req.body.amount) 
      : req.body.amount;
    
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    
    // Convert paymentMethodId to number if it's a string
    const paymentMethodId = typeof req.body.paymentMethodId === 'string'
      ? parseInt(req.body.paymentMethodId, 10)
      : req.body.paymentMethodId;
      
    if (isNaN(paymentMethodId)) {
      return res.status(400).json({ error: "Invalid payment method" });
    }
    
    const wallet = await storage.getWalletByUser(userId);
    
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }
    
    try {
      const updatedWallet = await storage.addToWalletBalance(userId, amount);
      
      // Create a transaction for the top-up
      const transaction = await storage.createTransaction({
        transactionId: `TOP-${Date.now()}`,
        userId,
        vehicleId: null,
        stationId: null,
        fuelType: "N/A",
        quantity: "0",
        pricePerUnit: "0",
        totalAmount: amount.toString(),
        paymentMethodId: paymentMethodId,
        paymentType: "topup",
        status: "completed",
      });
      
      console.log("Wallet topped up successfully:", updatedWallet);
      
      // Send real-time notification to user about wallet top-up
      sendToUser(userId, 'wallet_updated', { 
        wallet: updatedWallet,
        transaction,
        message: `Your wallet has been topped up with ₹${amount.toFixed(2)}`
      });
      
      res.json(updatedWallet);
    } catch (error) {
      console.error("Error during top-up:", error);
      res.status(500).json({ error: "Failed to top up wallet" });
    }
  });

  app.put("/api/wallet/settings", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const userId = req.user!.id;
    const wallet = await storage.getWalletByUser(userId);
    
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }
    
    const { autoReloadEnabled, autoReloadThreshold, autoReloadAmount, autoReloadPaymentMethodId } = req.body;
    
    const updatedWallet = await storage.updateWallet(wallet.id, {
      autoReloadEnabled,
      autoReloadThreshold,
      autoReloadAmount,
      autoReloadPaymentMethodId,
    });
    
    res.json(updatedWallet);
  });

  // Transaction routes
  app.get("/api/transactions", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const userId = req.user!.id;
    const transactions = await storage.getTransactionsByUser(userId);
    
    res.json(transactions);
  });

  app.post("/api/transactions", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = req.user!.id;
      const validatedData = insertTransactionSchema.parse({ ...req.body, userId });
      
      // For RFID payments, check wallet balance
      if (validatedData.paymentType === "rfid") {
        const wallet = await storage.getWalletByUser(userId);
        
        if (!wallet) {
          return res.status(404).json({ error: "Wallet not found" });
        }
        
        if (Number(wallet.balance) < Number(validatedData.totalAmount)) {
          return res.status(400).json({ error: "Insufficient wallet balance" });
        }
        
        // Deduct from wallet
        await storage.addToWalletBalance(userId, -Number(validatedData.totalAmount));
      }
      
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create transaction" });
    }
  });

  // Station transaction routes (for station terminal)
  app.get("/api/station/:id/transactions", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const stationId = parseInt(req.params.id);
    const transactions = await storage.getTransactionsByStation(stationId);
    
    res.json(transactions);
  });

  app.post("/api/station/rfid-scan", async (req: Request, res: Response) => {
    // This would be a mock endpoint that simulates an RFID scan at the station
    // In a real system, this would communicate with RFID hardware
    const { tagNumber, stationId } = req.body;
    
    if (!tagNumber || !stationId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const tag = await storage.getRfidTagByNumber(tagNumber);
    
    if (!tag) {
      return res.status(404).json({ error: "RFID tag not found" });
    }
    
    if (tag.status !== "active") {
      return res.status(400).json({ error: "RFID tag is not active" });
    }
    
    const vehicle = await storage.getVehicle(tag.vehicleId!);
    
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    
    const user = await storage.getUser(vehicle.userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const wallet = await storage.getWalletByUser(user.id);
    
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }
    
    // Return vehicle and user information for the station terminal
    res.json({
      tag,
      vehicle,
      user: {
        id: user.id,
        name: user.name,
        walletBalance: wallet.balance,
      }
    });
  });

  app.post("/api/station/complete-transaction", async (req: Request, res: Response) => {
    // This would finalize a transaction at the station terminal
    const { userId, vehicleId, stationId, fuelType, quantity, pricePerUnit, paymentType } = req.body;
    
    if (!userId || !vehicleId || !stationId || !fuelType || !quantity || !pricePerUnit || !paymentType) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const totalAmount = Number(quantity) * Number(pricePerUnit);
    
    try {
      // If paying by RFID wallet, ensure sufficient balance
      if (paymentType === "rfid") {
        const wallet = await storage.getWalletByUser(userId);
        
        if (!wallet) {
          return res.status(404).json({ error: "Wallet not found" });
        }
        
        if (Number(wallet.balance) < totalAmount) {
          return res.status(400).json({ error: "Insufficient wallet balance" });
        }
        
        // Deduct from wallet
        await storage.addToWalletBalance(userId, -totalAmount);
      }
      
      // Create the transaction
      const transaction = await storage.createTransaction({
        transactionId: `FT-${Date.now()}`,
        userId,
        vehicleId,
        stationId,
        fuelType,
        quantity,
        pricePerUnit,
        totalAmount: totalAmount.toString(),
        paymentMethodId: req.body.paymentMethodId || null,
        paymentType,
        status: "completed",
      });
      
      // Get station details for notification
      const station = await storage.getFuelStation(stationId);
      
      // Send real-time notification to user about transaction
      sendToUser(userId, 'transaction_completed', {
        transaction,
        stationName: station?.name || 'Fuel Station',
        message: `Your payment of ₹${totalAmount.toFixed(2)} for ${quantity} L of ${fuelType} fuel has been processed.`
      });
      
      // Send real-time notification to station about transaction
      sendToStation(stationId, 'transaction_completed', {
        transaction,
        message: `Fuel transaction completed for ${quantity} L of ${fuelType}.`
      });
      
      res.status(201).json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to complete transaction" });
    }
  });

  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws, req) => {
    console.log('WebSocket client connected');
    
    // Extract client type and ID from URL query params
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const clientType = url.searchParams.get('clientType') || 'anonymous';
    const clientId = url.searchParams.get('clientId') || 'unknown';
    const clientKey = `${clientType}-${clientId}`;
    
    // Store the client connection with its identifier
    clients.set(clientKey, ws);
    
    // Send a welcome message to the client
    ws.send(JSON.stringify({
      type: 'connection_established',
      payload: {
        message: 'Connected to RFID Payment System WebSocket server',
        clientType,
        clientId
      }
    }));
    
    // Handle incoming messages from clients
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('WebSocket message received:', data);
        
        // Handle different message types
        switch (data.type) {
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong', payload: { timestamp: Date.now() } }));
            break;
            
          case 'station_status_update':
            // Broadcast station status updates to all connected clients
            broadcastMessage('station_status_update', data.payload);
            break;
            
          case 'rfid_scan':
            // When a station scans an RFID tag, process it
            const { stationId, tagNumber } = data.payload;
            if (stationId && tagNumber) {
              // This would trigger the RFID scan API in a real implementation
              console.log(`RFID tag ${tagNumber} scanned at station ${stationId}`);
            }
            break;
            
          default:
            console.log(`Unhandled message type: ${data.type}`);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    // Handle client disconnect
    ws.on('close', () => {
      console.log(`WebSocket client ${clientKey} disconnected`);
      clients.delete(clientKey);
    });
  });
  
  return httpServer;
}
