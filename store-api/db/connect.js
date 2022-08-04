const mongoose = require('mongoose');
require('dotenv').config();
const Item = require('../models/item');
const items = require('./items.json');

const connectSessionStore = async function () {
    try {
        const connection = await mongoose.createConnection(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).asPromise();
        // console.log(connection);
        return connection.getClient();
    } catch (error) {
        console.error(error);
    }
}

const connectDB = async function () {
    try {
        // for docker use 'mongodb://storeadmin:versionone@mongodb:27017/apistore'
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        // if use mongoose.createConnection() need to manually attach models to connection
        if (!(await Item.countDocuments())) {
            await Item.create(items);
        }
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    connectSessionStore,
    connectDB
};