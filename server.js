require('dotenv').config();

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const connectDB = require('./db/connect');
const Contact = require('./models/Contact');

const app = express();

// ✅ CORRECT CORS SETUP
const allowedOrigins = [
  'http://localhost:3000',
  'https://tridevi-frontend.vercel.app',
  'https://www.tridevitech.com', 
  'https://tridevitech.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ Blocked CORS from:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));

app.use(express.json());

// ✅ Health check
app.get('/', (req, res) => {
  console.log('🌐 Received GET /');
  res.send('<h2>🎉 Tridevi Backend is Live!</h2>');
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// ✅ Contact form handler
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
    console.log('✅ Email sent');
    res.status(200).json({ success: true, message: 'Form submitted and email sent successfully' });

  } catch (error) {
    console.error('❌ Submission Error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  try {
    await connectDB();
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ DB connection failed:', err);
  }
});
