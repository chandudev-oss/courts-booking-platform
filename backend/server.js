const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', require('./routes/auth'));
const courtsRoutes = require('./routes/courts');
app.use('/courts', courtsRoutes.public);
app.use('/admin/courts', courtsRoutes.admin);

const coachesRoutes = require('./routes/coaches');
app.use('/coaches', coachesRoutes.public);
app.use('/admin/coaches', coachesRoutes.admin);

const equipmentRoutes = require('./routes/equipment');
app.use('/equipment', equipmentRoutes.public);
app.use('/admin/equipment', equipmentRoutes.admin);

const pricingRulesRoutes = require('./routes/pricingRules');
app.use('/pricing-rules', pricingRulesRoutes.public);
app.use('/admin/pricing-rules', pricingRulesRoutes.admin);

app.use('/bookings', require('./routes/bookings'));
app.use('/pricing', require('./routes/pricing'));
app.use('/admin/stats', require('./routes/stats'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('Connected to MongoDB');
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

module.exports = app;

