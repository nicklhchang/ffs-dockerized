const express = require('express');
const router = express.Router();
const Item = require('../models/item');
const Cart = require('../models/cart');
// isAdmin middleware sits in front of router in app.js so not in here

router.post('/menu-item/create', function(req,res,next) {
    // can look at express-validator to validate and sanitize inputs
    let paramsToCreate = {
        name:req.body.name,
        cost:parseInt(req.body.cost),
        classification:req.body.classification,
        availability:req.body.availability
    };
    Item.findOne({'name':paramsToCreate.name,'cost':paramsToCreate.cost})
    .exec(function(err,found) {
        if (err) {
            console.log(err); // for devs
            return next(err);
        }
        // if not already exists, create
        if (!found) {
            // .create() does not return mongoose query object (look at docs)
            // so chaining .then()....catch() or using async/await in top level of function
            // is totally fine and allows us to handle result returned by .create()
            Item.create(paramsToCreate)
            .then(function(newItem) {
                res.json({
                    alreadyAuthenticated:true,
                    requestSuccess:true,
                    user:req.user,
                    result:newItem
                })
            })
            .catch(function(error) {
                console.log(error);
                return next(error);
            })
        } else {
            res.json({
                alreadyAuthenticated:true,
                requestSuccess:false,
                user:req.user,
                // if result is null need to be handled on frontend
                result:'duplicate'
            });
        }
    });
});

router.post('/member-cart/create', function(req,res,next) {
    let paramsToCreate = {
        member:req.body.member,
        items:req.body.items
    }
    Cart.findOne({'member':paramsToCreate.member})
    .exec(function(err,found) {
        if (err) {console.log(err); return next(err);}
        if (!found) {
            Cart.create(paramsToCreate)
            .then(function(newMemberCart) {
                res.json({
                    alreadyAuthenticated:true,
                    requestSuccess:true,
                    user:req.user,
                    result:newMemberCart
                })
            })
            .catch(function(error) {
                console.log(error);
                return next(error);
            })
        } else {
            res.json({
                alreadyAuthenticated:true,
                requestSuccess:false,
                user:req.user,
                // if result is null need to be handled on frontend
                result:'duplicate'
            });
        }
    });
})

module.exports = router;