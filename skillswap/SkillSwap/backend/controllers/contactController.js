const Contact = require('../models/Contact');

exports.submitContactForm = async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const newContact = await Contact.create({ name, email, message });
        return res.status(201).json({ message: 'Contact form submitted successfully', contact: newContact });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};