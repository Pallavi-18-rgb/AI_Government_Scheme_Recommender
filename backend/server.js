const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const schemeRoutes = require('./routes/schemes');
const recommendationRoutes = require('./routes/recommendations');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');
const documentRoutes = require('./routes/documents');
const notificationRoutes = require('./routes/notifications');
const powerbiRoutes = require('./routes/powerbi');
const familyRoutes = require('./routes/family');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/chat', require('./middleware/auth'), chatRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/admin', require('./middleware/auth'), adminRoutes);
app.use('/api/notifications', require('./middleware/auth'), notificationRoutes);
app.use('/api/powerbi', powerbiRoutes);
app.use('/api/family', familyRoutes);

app.get('/', (req, res) => {
  res.send('Digital Welfare Assistant API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
