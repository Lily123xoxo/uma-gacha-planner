require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const app = express();
const indexRoutes = require('./app/routes/index');
const bannerRoutes = require('./app/routes/bannerRoutes');
const indexController = require('./app/controllers/indexController');
const { loadCache } = require('./app/cache/bannerCache');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app/views'));

// Serve files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Middleware
app.use(helmet());
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "script-src": ["'self'"],
      "img-src": ["'self'", "https://gametora.com", "https://yourcdn.example"],
    },
  },
}));
app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
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
    app.use('/', indexRoutes);
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
