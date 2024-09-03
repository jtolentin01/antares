const mongoose = require('mongoose');
const ckey = require('ckey');

const connectDB = async () => {
    try {
        const address = ckey.DB_ADDR_ANTARES;
        await mongoose.connect(address);
        console.log(`Connected to MongoDB`);
    } catch (error) {
        throw new Error(error);
        
    };
};

module.exports = { connectDB };