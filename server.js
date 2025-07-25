require('dotenv').config();

console.log('🔐 CONTACT_EMAIL_PASS loaded:', process.env.CONTACT_EMAIL_PASS ? '✅ Exists' : '❌ Missing');

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const connectDB = require('./db/connect');
const Contact = require('./models/Contact');

const app = express();

// ✅ CORS Configuration
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

// ✅ Health Check Routes
app.get('/', (req, res) => {
  console.log('🌐 Received GET /');
  res.send('<h2>🎉 Tridevi Backend is Live!</h2>');
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// ✅ Contact Form Handler
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, website, service, budget, message } = req.body;

  try {
    // Save lead to MongoDB
    const newContact = new Contact({ name, email, phone, website, service, budget, message });
    await newContact.save();

    // ✅ Nodemailer with Zoho SMTP (for professional sending from contact@)
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: 'sonu@tridevitech.com',
        pass: process.env.CONTACT_EMAIL_PASS, // Use Zoho app-specific password
      },
    });

    // ✅ Email configuration
    const mailOptions = {
      from: `"TrideviTech Lead" <contact@tridevitech.com>`,
      to: 'contact@tridevitech.com',
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

    // ✅ Send the email
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent to contact@tridevitech.com');

    res.status(200).json({ success: true, message: 'Form submitted and email sent successfully' });

  } catch (error) {
    console.error('❌ Submission Error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});

// ✅ Start Server
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
