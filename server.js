require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const app = express();

// Controllers and routes
const bannerRoutes = require('./app/routes/bannerRoutes');
const indexController = require('./app/controllers/indexController');
const { loadCache } = require('./app/cache/bannerCache');

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app/views'));

// Enable template caching in prod
if (app.get('env') === 'production') {
  app.enable('view cache');
}

// Security Headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'"],
      "script-src-attr": ["'none'"],
      // Allow Bootstrap/JSDelivr CSS; keep inline styles off (remove 'unsafe-inline' if you don't use any)
      "style-src": ["'self'", "https:"],
      // Fonts from self or CDNs; add data: if needed by icon fonts
      "font-src": ["'self'", "https:", "data:"],
      // Your current needs for images
      "img-src": ["'self'", "data:"],
      // Fetch/XHR
      "connect-src": ["'self'"],
      // Lock these down
      "object-src": ["'none'"],
      "base-uri": ["'self'"],
      "frame-ancestors": ["'none'"],
      // "upgrade-insecure-requests": [] // optional if you want strict HTTPS
    },
  },
  referrerPolicy: { policy: "no-referrer" },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-origin" },
}));
app.disable('x-powered-by');

// If behind a proxy/load balancer, uncomment:
// app.set('trust proxy', 1);

//Rate limiter (global)
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Body parsing + locals
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

// Per-route limiter for index render
const renderLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

// -----------------------------
// ASYNC SERVER BOOTSTRAP
// -----------------------------
(async () => {
  try {
    // Preload cache
    await loadCache();
    console.log('Banner cache preloaded successfully.');

    // Logger
    app.use((req, res, next) => {
      const timestamp = process.env.NODE_ENV === 'production'
        ? new Date().toISOString()
        : new Date().toLocaleString();
      console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
      next();
    });

    // Routes
    app.get('/', renderLimiter, indexController.getIndexPage);
    app.use('/banners', bannerRoutes);
    app.post('/calculate', indexController.calculatePlanner);

    // Start server
    const { PORT, HOST } = process.env;
    app.listen(PORT, HOST, () => {
      console.log(`Server running on ${HOST}:${PORT}`);
    });
  } catch (err) {
    console.error('Error preloading banner cache:', err);
    process.exit(1); // Fail fast if cache critical
  }
})();
