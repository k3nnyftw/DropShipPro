import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();

// Use Helmet security headers for production environments
if (process.env.NODE_ENV === "production") {
  // Set up production-grade security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "js.stripe.com"],
          styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
          imgSrc: ["'self'", "data:", "*.stripe.com"],
          connectSrc: ["'self'", "api.stripe.com"],
          frameSrc: ["'self'", "js.stripe.com", "hooks.stripe.com"],
          fontSrc: ["'self'", "fonts.gstatic.com"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      // Force HTTPS in production
      hsts: {
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true,
        preload: true,
      },
      // Prevent clickjacking
      frameguard: {
        action: "deny",
      },
      // Disable X-Powered-By header to hide Express
      hidePoweredBy: true,
    })
  );
} else {
  // In development, just hide the X-Powered-By header
  app.use(helmet.hidePoweredBy());
}

// Configure body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// Apply rate limiting in production
if (process.env.NODE_ENV === "production") {
  // General API rate limiter
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // 100 requests per window per IP
    standardHeaders: 'draft-7', // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { error: "Too many requests, please try again later." }
  });
  
  // Apply to all API routes
  app.use("/api/", apiLimiter);
  
  // More strict rate limiter for sensitive endpoints
  const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10, // 10 requests per window per IP
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: "Too many attempts, please try again later." }
  });
  
  // Apply stricter rate limiting to payment and sensitive routes
  app.use("/api/payments/", strictLimiter);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Centralized error handling
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    // Get appropriate status code
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    // Log error details (sanitized in production)
    if (process.env.NODE_ENV === "production") {
      // In production, log minimal information for security
      console.error(`Error ${status}: ${message} - ${req.method} ${req.path}`);
    } else {
      // In development, log more detailed error information
      console.error('API Error:', {
        status,
        message,
        method: req.method,
        path: req.path,
        query: req.query,
        body: req.body,
        stack: err.stack,
      });
    }

    // Send appropriate response
    let errorResponse = { message };
    
    // Add more details in development mode
    if (process.env.NODE_ENV !== "production") {
      errorResponse = {
        ...errorResponse,
        stack: err.stack,
        details: err.details || err.errorData || undefined
      };
    }
    
    res.status(status).json(errorResponse);
    
    // Don't throw in production - bad for performance
    if (process.env.NODE_ENV !== "production") {
      throw err;
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
