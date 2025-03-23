import express, { Router, type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertMedicationSchema, 
  insertSupplierSchema, 
  insertCustomerSchema, 
  insertOrderSchema, 
  insertOrderItemSchema,
  insertSupplyOrderSchema,
  insertSupplyOrderItemSchema,
  insertUserSchema
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = Router();
  
  // Middleware to handle validation errors
  const validateRequest = (schema: z.ZodSchema<any>) => (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      return res.status(500).json({ message: "Internal server error during validation" });
    }
  };

  // Dashboard
  apiRouter.get("/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  // Medications
  apiRouter.get("/medications", async (req, res) => {
    try {
      const medications = await storage.getMedications();
      res.json(medications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medications" });
    }
  });

  apiRouter.get("/medications/low-stock", async (req, res) => {
    try {
      const medications = await storage.getLowStockMedications();
      res.json(medications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch low stock medications" });
    }
  });

  apiRouter.get("/medications/search", async (req, res) => {
    try {
      const query = req.query.q as string || "";
      const medications = await storage.searchMedications(query);
      res.json(medications);
    } catch (error) {
      res.status(500).json({ message: "Failed to search medications" });
    }
  });

  apiRouter.get("/medications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const medication = await storage.getMedication(id);
      if (!medication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      res.json(medication);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medication" });
    }
  });

  apiRouter.post("/medications", validateRequest(insertMedicationSchema), async (req, res) => {
    try {
      const medication = await storage.createMedication(req.body);
      res.status(201).json(medication);
    } catch (error) {
      res.status(500).json({ message: "Failed to create medication" });
    }
  });

  apiRouter.put("/medications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const medication = await storage.updateMedication(id, req.body);
      if (!medication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      res.json(medication);
    } catch (error) {
      res.status(500).json({ message: "Failed to update medication" });
    }
  });

  apiRouter.delete("/medications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMedication(id);
      if (!success) {
        return res.status(404).json({ message: "Medication not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete medication" });
    }
  });

  // Suppliers
  apiRouter.get("/suppliers", async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  apiRouter.get("/suppliers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const supplier = await storage.getSupplier(id);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supplier" });
    }
  });

  apiRouter.post("/suppliers", validateRequest(insertSupplierSchema), async (req, res) => {
    try {
      const supplier = await storage.createSupplier(req.body);
      res.status(201).json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Failed to create supplier" });
    }
  });

  apiRouter.put("/suppliers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const supplier = await storage.updateSupplier(id, req.body);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Failed to update supplier" });
    }
  });

  apiRouter.delete("/suppliers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSupplier(id);
      if (!success) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });

  // Customers
  apiRouter.get("/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  apiRouter.get("/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  apiRouter.post("/customers", validateRequest(insertCustomerSchema), async (req, res) => {
    try {
      const customer = await storage.createCustomer(req.body);
      res.status(201).json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  apiRouter.put("/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.updateCustomer(id, req.body);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  apiRouter.delete("/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCustomer(id);
      if (!success) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Orders
  apiRouter.get("/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  apiRouter.get("/orders/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string || "5");
      const orders = await storage.getRecentOrders(limit);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent orders" });
    }
  });

  apiRouter.get("/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const orderWithItems = await storage.getOrderWithItems(id);
      if (!orderWithItems) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(orderWithItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  apiRouter.post("/orders", async (req, res) => {
    try {
      const { order, items } = req.body;
      const validatedOrder = insertOrderSchema.parse(order);
      const validatedItems = items.map((item: any) => insertOrderItemSchema.parse(item));
      
      const newOrder = await storage.createOrder(validatedOrder, validatedItems);
      res.status(201).json(newOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  apiRouter.patch("/orders/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const status = req.body.status;
      
      if (!['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const order = await storage.updateOrderStatus(id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  apiRouter.delete("/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteOrder(id);
      if (!success) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete order" });
    }
  });

  // Supply Orders
  apiRouter.get("/supply-orders", async (req, res) => {
    try {
      const orders = await storage.getSupplyOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supply orders" });
    }
  });

  apiRouter.get("/supply-orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const orderWithItems = await storage.getSupplyOrderWithItems(id);
      if (!orderWithItems) {
        return res.status(404).json({ message: "Supply order not found" });
      }
      res.json(orderWithItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supply order" });
    }
  });

  apiRouter.post("/supply-orders", async (req, res) => {
    try {
      const { order, items } = req.body;
      const validatedOrder = insertSupplyOrderSchema.parse(order);
      const validatedItems = items.map((item: any) => insertSupplyOrderItemSchema.parse(item));
      
      const newOrder = await storage.createSupplyOrder(validatedOrder, validatedItems);
      res.status(201).json(newOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create supply order" });
    }
  });

  apiRouter.patch("/supply-orders/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const status = req.body.status;
      
      if (!['pending', 'ordered', 'received', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const order = await storage.updateSupplyOrderStatus(id, status);
      if (!order) {
        return res.status(404).json({ message: "Supply order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update supply order status" });
    }
  });

  apiRouter.delete("/supply-orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSupplyOrder(id);
      if (!success) {
        return res.status(404).json({ message: "Supply order not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete supply order" });
    }
  });

  // Users - Basic auth and user management
  apiRouter.get("/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users.map(user => {
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  apiRouter.post("/users", validateRequest(insertUserSchema), async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  apiRouter.post("/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);

      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Register API routes
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
