import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User, insertUserSchema } from "@shared/schema";
import { z } from "zod";

// Extend Express.User interface with our User type
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      password: string;
      name: string;
      email: string;
      phone: string;
      createdAt: Date | null;
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "rfid-fuel-payment-system-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  // Extended registration schema with validation
  const registerSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      console.log("Received registration request with body:", JSON.stringify(req.body, null, 2));
      
      // Deconstruct and validate input before using anywhere
      const { confirmPassword, ...registrationData } = req.body;
      
      // First validate the registration data
      try {
        registerSchema.parse(req.body);
        console.log("Validation successful");
      } catch (error) {
        console.error("Validation failed:", error);
        throw error;
      }
      
      const existingUser = await storage.getUserByUsername(registrationData.username);
      if (existingUser) {
        console.log("Username already exists:", registrationData.username);
        return res.status(400).send("Username already exists");
      }

      console.log("Creating user in database...");
      const user = await storage.createUser({
        username: registrationData.username,
        password: await hashPassword(registrationData.password),
        name: registrationData.name,
        email: registrationData.email,
        phone: registrationData.phone,
      });
      console.log("User created:", user.id);

      req.login(user, (err) => {
        if (err) {
          console.log("Login error:", err);
          return next(err);
        }
        // Return user data without password
        const { password, ...userWithoutPassword } = user;
        console.log("Registration complete, returning user data");
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.log("Registration error:", error);
      if (error instanceof z.ZodError) {
        console.log("Validation error:", error.errors);
        return res.status(400).json({ error: error.errors });
      }
      next(error);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    // Return user data without password
    const { password, ...userWithoutPassword } = req.user!;
    res.status(200).json(userWithoutPassword);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Return user data without password
    const { password, ...userWithoutPassword } = req.user!;
    res.json(userWithoutPassword);
  });
}
