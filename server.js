require('dotenv').config();

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const connectDB = require('./db/connect');
const Contact = require('./models/Contact');

const app = express();

// ✅ Allow only specific frontend domain
const corsOptions = {
  origin: ['https://tridevi-frontend.vercel.app/'], // ✅ replace with your actual frontend domain
  methods: ['GET', 'POST'],
  credentials: true,
};

app.use(cors({
  origin: ['https://your-vercel-domain.vercel.app'],
  methods: ['GET', 'POST'],
}));
app.use(express.json());

// ✅ Health Check
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
    console.error('❌ Error in /api/contact:', error);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

// ✅ Proper binding for Railway
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  connectDB()
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch((err) => console.error('❌ MongoDB connection failed:', err));
});
