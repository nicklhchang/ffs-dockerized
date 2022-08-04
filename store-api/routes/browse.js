const express = require('express');
const router = express.Router();
const Item = require('../models/item');
const Cart = require('../models/cart');
// all routes are put behind isAuth in app.js, that is the protection needed

router.get('/menu', function (req, res, next) {
    const findParams = { availability: true }
    const { types, price } = req.query;
    if (types) { findParams.classification = { $in: types.split(',') } }
    if (price) { findParams.cost = { $lte: parseInt(price) } }
    // console.log(types, findParams)

    // mongoose queries are just model.function(); this returns Mongoose Query object
    // queries are not promises. so no mixing async/await or chaining .then()....catch()
    // if callback is passed in exec() or as last parameter.
    // read up on mongoose model api docs but idea is ^ executes query more than once
    Item.find(findParams, 'name cost classification')
        .exec(function (err, list_items) { // callback already so no need async/await
            // console.log(list_items)
            if (err) { return next(err); }
            res.json({
                alreadyAuthenticated: true,
                requestSuccess: true,
                user: req.user,
                result: list_items
            });
        });
});

// frontend get cart and item prices
router.get('/cart', async function (req, res, next) {
    /** method 1 */
    // try {
    //     const member_cart = await Cart.findOne({ member: req.user._id });
    //     const item_prices = await Item.find({ availability: true }, 'cost');
    //     res.json({
    //         alreadyAuthenticated: true,
    //         requestSuccess: true,
    //         user: req.user,
    //         result: { cart: member_cart, prices: item_prices }
    //     });
    // } catch (error) {
    //     return next(error);
    // }
    /** method 2 */
    // Cart.findOne({ member: req.user._id })
    //     .exec(function (err, member_cart) {
    //         console.log(member_cart)
    //         if (err) { return next(err); }
    //         res.json({
    //             alreadyAuthenticated: true,
    //             requestSuccess: true,
    //             user: req.user,
    //             result: member_cart
    //         });
    //     });
    /** method 3 */
    try {
        const [member_cart, item_prices] = await Promise.all([
            Cart.findOne({ member: req.user._id }),
            Item.find({ availability: true }, 'cost')
        ]);
        res.json({
            alreadyAuthenticated: true,
            requestSuccess: true,
            user: req.user,
            result: { cart: member_cart, prices: item_prices }
        });
    } catch (error) {
        return next(error);
    }
});

// frontend interval sync
router.post('/cart/sync', function (req, res, next) {
    const { cart } = req.body;
    // console.log(cart)
    // {
    //     '62d0f17ad5deda9a67cab93e': 2,
    //     '62d17c18ea58ebe464f34504': 1,
    //     '62d0f1aac51889c6d4d2ee6f': 1
    // }
    const arrCart = [];
    Object.entries(cart).forEach(([key, value]) => {
        arrCart.push({
            item: key,
            count: value
        });
    })
    // console.log(arrCart);
    Cart.findOneAndUpdate(
        { member: req.user._id },
        { items: arrCart },
        { returnOriginal: false, upsert: true, rawResult: true })
        .exec(function (err, raw_updated_cart) {
            if (err) { return next(err); }
            // raw_updated_cart example
            // {
            //     lastErrorObject: { n: 1, updatedExisting: true },
            //     value: {
            //       _id: new ObjectId("62d8245fd219bd6b7babce4a"),
            //       member: new ObjectId("62caca6dad72a02e9cad627a"),
            //       items: [
            //         [Object], [Object],
            //         [Object], [Object],
            //         [Object], [Object],
            //         [Object], [Object],
            //         [Object], [Object]
            //       ],
            //       createdAt: 2022-07-20T15:50:55.564Z,
            //       updatedAt: 2022-07-21T11:16:51.140Z,
            //       __v: 0
            //     },
            //     ok: 1
            // }
            res.json({
                alreadyAuthenticated: true,
                requestSuccess: true,
                user: req.user,
                result: raw_updated_cart.value
            })
        });
});

// not used on frontend
router.get('/cart/prices', function(req,res,next) {
    Item.find({ availability: true }, 'cost')
    .exec(function(err, costs) {
        console.log(costs)
        if (err) {return next(err);}
        res.json({
            alreadyAuthenticated: true,
            requestSuccess: true,
            user: req.user,
            result: costs
        })
    });
})

module.exports = router;