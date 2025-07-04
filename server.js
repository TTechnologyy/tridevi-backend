const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const connectDB = require('./db/connect');
const Contact = require('./models/Contact'); // ← ADD THIS LINE

const express = require('express');

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('🎉 It works!');
});

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, website, service, budget, message } = req.body;

  console.log('🔥 Received request at /api/contact');
  console.log('📨 Request Body:', req.body);

  try {
    // Save to MongoDB
    const newContact = new Contact({ name, email, phone, website, service, budget, message });
    await newContact.save();
    console.log('✅ Contact saved to MongoDB');

    // Send Email
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
connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on http://0.0.0.0:${PORT}`));
}).catch((err) => {
  console.error('❌ Failed to connect to MongoDB:', err);
});
