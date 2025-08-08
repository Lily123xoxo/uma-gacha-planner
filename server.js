require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Controllers & routes
const bannerRoutes = require('./app/routes/bannerRoutes');
const indexController = require('./app/controllers/indexController');
const { loadCache } = require('./app/cache/bannerCache');

// If behind a proxy/load balancer (Heroku/Render/Nginx/Cloudflare), uncomment:
// app.set('trust proxy', 1);

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app/views'));

// Enable template caching in prod
if (app.get('env') === 'production') {
  app.enable('view cache');
}

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'"],
      "script-src-attr": ["'none'"],
      "style-src": ["'self'", "https://cdn.jsdelivr.net"],
      "font-src": ["'self'", "https://cdn.jsdelivr.net", "data:"],
      "img-src": ["'self'", "data:"],
      "connect-src": ["'self'"],
      "frame-ancestors": ["'none'"],
      "form-action": ["'self'"],
      "object-src": ["'none'"],
      "base-uri": ["'self'"],
      // "upgrade-insecure-requests": [] // enable in HTTPS-only prod if we desire
    },
  },
  referrerPolicy: { policy: "no-referrer" },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-origin" },
}));
app.use(helmet.noSniff());

// HSTS only in production (and only when serving over HTTPS)
if (app.get('env') === 'production') {
  app.use(helmet.hsts({
    maxAge: 15552000, // 180 days
    includeSubDomains: true,
    preload: false
  }));
}

// Hide Express
app.disable('x-powered-by');

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));

// Body parsing + locals
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

// --- Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Per-route limiters
const renderLimiter = rateLimit({ windowMs: 60_000, max: 30, standardHeaders: true, legacyHeaders: false });
const calcLimiter   = rateLimit({ windowMs: 60_000, max: 30, standardHeaders: true, legacyHeaders: false });
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
    
    // ---- Routes ----
    app.get('/',
      renderLimiter,
      indexController.getIndexPage);

    // Explicitly reject GET /calculate
    app.get('/calculate', (req, res) => {
      res.set('Allow', 'POST');
      return res.sendStatus(405);
    });

    // POST /calculate 
    app.post(
      '/calculate',
      calcLimiter,
      (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); },
      indexController.calculatePlanner
    );

    app.use('/banners', bannerRoutes);

    // 404 Handler
    app.use((req, res) => {
      res.status(404).render('pages/404');
    });

    // 500 Handler
    app.use((err, req, res, next) => {
      console.error(err);
      res.status(500).render('pages/500');
    });

    // Start server
    const PORT = process.env.PORT || 3000;
    const HOST = process.env.HOST || '0.0.0.0';
    app.listen(PORT, HOST, () => {
      console.log(`Server running on ${HOST}:${PORT}`);
    });
  } catch (err) {
    console.error('Error preloading banner cache:', err);
    process.exit(1); // Fail fast if cache critical
  }
})();
