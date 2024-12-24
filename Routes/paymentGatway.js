const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');

router.post('/orders', async (req, res) => {
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET 
    });

    const options = {
        amount: req.body.amount,
        currency: req.body.currency,
        receipt: 'receipt#1',
        payment_capture: 1
    };

    try {
        const response = await razorpay.orders.create(options);
        res.json({
            order_id: response.id,
            currency: response.currency,
            amount: response.amount
        });
    } catch (error) {
        console.error('Error creating order:', error); // Log the error for debugging
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Route to fetch payment details
router.get('/payment/:paymentId', async (req, res) => {
    const { paymentId } = req.params;

    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET 
    });

    try {
        const payment = await razorpay.payments.fetch(paymentId);

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        res.json({
            status: payment.status,
            method: payment.method,
            amount: payment.amount,
            currency: payment.currency
        });
    } catch (error) {
        console.error('Error fetching payment:', error); // Log the error for debugging
        res.status(500).json({ message: 'Failed to fetch payment', error: error.message });
    }
});

module.exports = router;