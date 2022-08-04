const connectDB = require('./connect');
const Item = require('../models/item');
const items = require('./items.json');

const conectAndPopulate = function() {
    try {
        await connectDB();
        if (!(await Item.countDocuments())) {
            await Item.create(items);
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = conectAndPopulate;