const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const email = 'admin@agriconnect.com';
        const password = 'admin123';
        
        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            console.log('⚠️ Admin user already exists');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        await User.create({
            name: 'System Admin',
            email: email,
            password: hashedPassword,
            role: 'admin',
            phone: '9999999999',
            location: 'Chennai'
        });

        console.log('🚀 Admin user created successfully!');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error creating admin:', err.message);
        process.exit(1);
    }
};

createAdmin();
