const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Log environment variables for debugging
console.log('Server running on PORT:', process.env.PORT);
console.log('Email Service:', process.env.EMAIL_SERVICE);
console.log('Email Port:', process.env.EMAIL_PORT);
console.log('Email User:', process.env.EMAIL_USER);

// Nodemailer Transporter Configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVICE,
  port: process.env.EMAIL_PORT,
  secure: false, // true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// API Endpoint for Sending Confirmation Email
app.post('/send-confirmation', async (req, res) => {
  try {
    const { clientEmail, clientName, bookingDetails } = req.body;

    // Validate request body
    if (!clientEmail || !clientName || !bookingDetails) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const { roomType, arrivalDate, leaveDate, totalPrice } = bookingDetails;

    // Email Content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: clientEmail,
      subject: 'Booking Confirmation',
      html: `
        <h1>Booking Confirmation</h1>
        <p>Dear ${clientName},</p>
        <p>Thank you for booking with us! Here are your booking details:</p>
        <ul>
          <li><strong>Room Type:</strong> ${roomType}</li>
          <li><strong>Check-in:</strong> ${arrivalDate}</li>
          <li><strong>Check-out:</strong> ${leaveDate}</li>
          <li><strong>Total Price:</strong> $${totalPrice}</li>
        </ul>
        <p>We look forward to hosting you!</p>
        <p>Best regards,<br>Your Hotel Team</p>
      `,
    };

    // Send Email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Confirmation email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email', error });
  }
});

// Default Route for Invalid Paths
app.use((req, res) => {
  res.status(404).send('Endpoint not found');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
