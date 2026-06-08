const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const prisma = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const profileRoutes = require('./routes/profile');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/profile', profileRoutes);

// Global error handler
app.use((err, req, res, next) => {
    res.status(500).json({ error: 'Internal server error' });
});

// Global 404 Handler for API routes
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

app.get('/', (req, res) => {
    res.json({ message: 'SMASH Badminton API', status: 'running' });
});

const server = app.listen(PORT, () => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Server running on port ${PORT}`);
    }
});

process.on('SIGTERM', () => {
    server.close(() => {
        prisma.$disconnect();
    });
});
