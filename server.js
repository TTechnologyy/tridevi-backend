require('dotenv').config();

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const connectDB = require('./db/connect');
const Contact = require('./models/Contact');

const app = express();

// ✅ CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://tridevi-frontend.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed from this origin'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ Health check
app.get('/', (req, res) => {
  console.log('🌐 Received GET /');
  res.send('<h2>🎉 Tridevi Backend is Live!</h2>');
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// ✅ Contact form route
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, website, service, budget, message } = req.body;

  try {
    const newContact = new Contact({ name, email, phone, website, service, budget, message });
    await newContact.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'tridevitechnology@gmail.com',
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"TrideviTech Lead" <tridevitechnology@gmail.com>`,
      to: 'tridevitechnology@gmail.com',
      subject: '📥 New Lead - TrideviTech Form Submission',
      text: `
New Lead Details:

👤 Name: ${name}
📧 Email: ${email}
📞 Phone: ${phone}
🌐 Website: ${website}
🛠️ Service: ${service}
💰 Budget: ${budget}
📝 Message: ${message}
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully');
    res.status(200).json({ success: true, message: 'Form submitted and email sent successfully' });

  } catch (error) {
    console.error('❌ Error in /api/contact:', error.message, error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  try {
    await connectDB();
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
  }
});
