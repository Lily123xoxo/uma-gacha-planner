require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const indexRoutes = require('./app/routes/index');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app/views'));

// Serve files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});
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

// Start server
const { PORT, HOST } = process.env;
app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});