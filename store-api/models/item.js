const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please provide a name for item']
    },
    cost:{
        type:Number,
        required:[true,'Please provide a cost for item']
    },
    classification:{
        type:String,
        enum:['Appetiser','Small','Medium','Large','Drink','Dessert'],
        default:'Appetiser'
    },
    availability:{
        type:Boolean,
        required:[true,'Please provide availability']
    }
});
// can think about doing a ReviewSchema later which ref item and member
// then a reviews property with value array, containing all review instances

// name and classification have to be unique, look at mongoose docs Schema
// unique compound index which has ascending order for both name and classification
// https://www.mongodb.com/docs/manual/core/index-compound/
ItemSchema.index({"name":1,"classification":1},{"unique":true});

// attach model to default mongoose connection
module.exports = mongoose.model('Item', ItemSchema);