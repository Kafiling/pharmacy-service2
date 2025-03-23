import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertMedicationSchema, 
  insertCustomerSchema, 
  insertSupplierSchema, 
  insertOrderSchema,
  insertOrderItemSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes - all prefixed with /api
  
  // Dashboard stats
  app.get('/api/dashboard/stats', async (req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
  });
  
  // Medication routes
  app.get('/api/medications', async (req: Request, res: Response) => {
    try {
      const medications = await storage.getMedications();
      res.json(medications);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch medications' });
    }
  });
  
  app.get('/api/medications/low-stock', async (req: Request, res: Response) => {
    try {
      const lowStockMedications = await storage.getLowStockMedications();
      res.json(lowStockMedications);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch low stock medications' });
    }
  });
  
  app.get('/api/medications/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const medication = await storage.getMedication(id);
      
      if (!medication) {
        return res.status(404).json({ message: 'Medication not found' });
      }
      
      res.json(medication);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch medication' });
    }
  });
  
  app.post('/api/medications', async (req: Request, res: Response) => {
    try {
      const validatedData = insertMedicationSchema.parse(req.body);
      const newMedication = await storage.createMedication(validatedData);
      res.status(201).json(newMedication);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid medication data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create medication' });
    }
  });
  
  app.put('/api/medications/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertMedicationSchema.partial().parse(req.body);
      
      const updatedMedication = await storage.updateMedication(id, validatedData);
      
      if (!updatedMedication) {
        return res.status(404).json({ message: 'Medication not found' });
      }
      
      res.json(updatedMedication);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid medication data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update medication' });
    }
  });
  
  app.delete('/api/medications/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMedication(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Medication not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete medication' });
    }
  });
  
  // Customer routes
  app.get('/api/customers', async (req: Request, res: Response) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch customers' });
    }
  });
  
  app.get('/api/customers/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch customer' });
    }
  });
  
  app.post('/api/customers', async (req: Request, res: Response) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const newCustomer = await storage.createCustomer(validatedData);
      res.status(201).json(newCustomer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid customer data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create customer' });
    }
  });
  
  app.put('/api/customers/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCustomerSchema.partial().parse(req.body);
      
      const updatedCustomer = await storage.updateCustomer(id, validatedData);
      
      if (!updatedCustomer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      
      res.json(updatedCustomer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid customer data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update customer' });
    }
  });
  
  app.delete('/api/customers/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCustomer(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete customer' });
    }
  });
  
  // Supplier routes
  app.get('/api/suppliers', async (req: Request, res: Response) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch suppliers' });
    }
  });
  
  app.get('/api/suppliers/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const supplier = await storage.getSupplier(id);
      
      if (!supplier) {
        return res.status(404).json({ message: 'Supplier not found' });
      }
      
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch supplier' });
    }
  });
  
  app.post('/api/suppliers', async (req: Request, res: Response) => {
    try {
      const validatedData = insertSupplierSchema.parse(req.body);
      const newSupplier = await storage.createSupplier(validatedData);
      res.status(201).json(newSupplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid supplier data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create supplier' });
    }
  });
  
  app.put('/api/suppliers/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSupplierSchema.partial().parse(req.body);
      
      const updatedSupplier = await storage.updateSupplier(id, validatedData);
      
      if (!updatedSupplier) {
        return res.status(404).json({ message: 'Supplier not found' });
      }
      
      res.json(updatedSupplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid supplier data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update supplier' });
    }
  });
  
  app.delete('/api/suppliers/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSupplier(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Supplier not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete supplier' });
    }
  });
  
  // Order routes
  app.get('/api/orders', async (req: Request, res: Response) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch orders' });
    }
  });
  
  app.get('/api/orders/recent', async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const recentOrders = await storage.getRecentOrders(limit);
      res.json(recentOrders);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch recent orders' });
    }
  });
  
  app.get('/api/orders/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrderWithItems(id);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch order' });
    }
  });
  
  app.post('/api/orders', async (req: Request, res: Response) => {
    try {
      const orderSchema = insertOrderSchema.parse(req.body.order);
      const orderItemsSchema = z.array(insertOrderItemSchema).parse(req.body.orderItems);
      
      const newOrder = await storage.createOrder(orderSchema, orderItemsSchema);
      res.status(201).json(newOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid order data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create order' });
    }
  });
  
  app.put('/api/orders/:id/status', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const statusSchema = z.object({ status: z.string() });
      const { status } = statusSchema.parse(req.body);
      
      const updatedOrder = await storage.updateOrderStatus(id, status);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      res.json(updatedOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid status data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update order status' });
    }
  });
  
  app.get('/api/orders/customer/:id', async (req: Request, res: Response) => {
    try {
      const customerId = parseInt(req.params.id);
      const orders = await storage.getOrdersByCustomer(customerId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch customer orders' });
    }
  });
  
  app.delete('/api/orders/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteOrder(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete order' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
