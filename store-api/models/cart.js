const mongoose = require('mongoose');

const CartItemsSchema = new mongoose.Schema(
    {
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item'
        },
        count: {
            type: Number
        }
    },
    {
        _id: false
    }
);

const CartSchema = new mongoose.Schema(
    {
        member: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Member',
            required: [true, 'Please link a member to this cart']
        },
        items: {
            type: [CartItemsSchema],
            required: [false]
        }
    },
    {
        timestamps: true
    }
);

// attach model to default mongoose connection
module.exports = mongoose.model('Cart', CartSchema);