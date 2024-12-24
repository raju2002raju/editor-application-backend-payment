const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../Models/user');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'myscretkey';


// In-memory storage for OTPs and user data
let otpStorage = {};

// Configure nodemailer with updated SSL options
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'user Email',
    pass: process.env.EMAIL_PASS || 'user Password',
  },
  tls: {
    rejectUnauthorized: false,  
    minVersion: "TLSv1.2"       
  },
  debug: true,                  
  logger: true                  
});

// Enhanced verify transporter connection with better error handling
async function verifyTransporter() {
  try {
    await transporter.verify();
    console.log('SMTP server is ready to take messages');
    return true;
  } catch (error) {
    console.error('SMTP connection error:', {
      message: error.message,
      code: error.code,
      command: error.command,
      stack: error.stack
    });
    return false;
  }
}

// Call verify on startup
verifyTransporter();  

router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Verify SMTP connection before sending
    const isSmtpReady = await verifyTransporter();
    if (!isSmtpReady) {
      throw new Error('SMTP server is not ready');
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    otpStorage[email] = {
      otp,
      expiry: Date.now() + 10 * 60 * 1000,
    };

    console.log(`Generated OTP for ${email}:`, otp);

    const mailOptions = {
      from: process.env.EMAIL_USER || 'royr55601@gmail.com',
      to: email,
      subject: 'Your OTP for Court Craft Verification',
      text: `Your One-Time Password (OTP) for CourtCraft is: ${otp}

This OTP is valid for the next 10 minutes. Please do not share this OTP with anyone for your security.

If you did not request this, please ignore this message or contact our support team immediately.

Thank you,
Court Craft Support Team`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'OTP sent to your email' });

  } catch (error) {
    console.error('Error in send-otp:', {
      message: error.message,
      code: error.code,
      command: error.command,
      stack: error.stack
    });
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP',
      error: process.env.NODE_ENV === 'development' ? 
        `${error.message} (Code: ${error.code})` : 
        'Email service temporarily unavailable'
    });
  }
});

router.post('/send-access', async (req, res) => {
  try {
    const { plan, email, usageCount } = req.body;

    // Check if email is provided
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if plan is provided
    if (!plan) {
      return res.status(400).json({ message: 'Plan is required' });
    }

    // Check if usageCount is provided
    if (usageCount === undefined) {
      return res.status(400).json({ message: 'Usage count is required' });
    }

    // Find user by email
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's plan
    user.plan = plan;

    // If the user already has tokens, add the new usageCount to the existing one
    if (user.usageCount && user.usageCount > 0) {
      user.usageCount += usageCount; // Add to existing count
    } else {
      user.usageCount = usageCount; // Assign exactly what comes from the frontend
    }

    await user.save(); // Save the updated user in the database

    console.log('User updated with new plan and usage count:', user);

    // Send response
    res.status(200).json({ message: 'User plan and usage count updated successfully', user });

  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
      
        message: 'Email and OTP are required',
      });
    }

    console.log('Verifying OTP:', { email, otp });
    console.log('OTP Storage:', otpStorage);

    if (!otpStorage[email]) {
      return res.status(400).json({
        
        message: 'No OTP found for this email',
      });
    }

    const storedOTP = otpStorage[email].otp;
    const expiryTime = otpStorage[email].expiry;

    if (storedOTP === otp && expiryTime > Date.now()) {
      // OTP is valid, create or find user
      let user = await User.findOne({ email });
      if (!user) {
        user = new User({ email });
        await user.save();
        console.log('New user created:', user);
      }

      // Clear the OTP after successful verification
      
      // Create JWT token
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          plan: user.plan
        },
        JWT_SECRET,
        { expiresIn: '1h' } // Token valid for 1 hour
      );
      
      res.json({
        statuscode:200,
        message: 'OTP verified successfully',
        user: {
          id: user._id,
          email: user.email,
          plan: user.plan
        },
        token,
      });
      delete otpStorage[email];
    } else if (expiryTime <= Date.now()) {
      delete otpStorage[email];
      res.status(400).json({ success: false, message: 'OTP has expired' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
  } catch (error) {
    console.error('Error in verify-otp:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router; 
