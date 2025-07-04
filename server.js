const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const connectDB = require('./db/connect');
const Contact = require('./models/Contact');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// ✅ Root route to confirm backend is live
app.get('/', (req, res) => {
  console.log('🌐 Received GET /');
  res.send('<h2>🎉 Tridevi Backend is Live!</h2>');
});

// ✅ Contact form POST route
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, website, service, budget, message } = req.body;

  console.log('🔥 Received request at /api/contact');
  console.log('📨 Request Body:', req.body);

  try {
    const newContact = new Contact({ name, email, phone, website, service, budget, message });
    await newContact.save();
    console.log('✅ Contact saved to MongoDB');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'tridevitechnology@gmail.com',
        pass: 'atjcdijdfwoyzkxl',
      },
    });

    const mailOptions = {
      from: email,
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
    console.error('❌ Error in contact submission:', error);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
});

const PORT = process.env.PORT || 5050;

// ✅ Start Express first, then connect Mongo
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  connectDB()
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err) => console.error('❌ MongoDB connection failed:', err));
});
