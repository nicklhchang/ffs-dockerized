const passport = require('passport');
const Member = require('../models/member');

const register = async function(req,res,next) {
    /**
     * attempt to find existing user, if existing, frontend handles user:'duplicate'
     * if not an existing user, create the user and res.json() appropriately
     * if at any point some database operation fails next() passes to error-handler
     */
    const paramsToCreate = {
        username:req.body.username,
        email:req.body.email,
        password:req.body.password
    };
    Member.findOne({ 'username':paramsToCreate.username,'email':paramsToCreate.email })
    .exec(function(err,found) {
        if (err) {return next(err);}
        if (!found) {
            Member.create({ ...paramsToCreate })
            .then(function(newMember) {
                // immediately log in; however only adds user property (req.user is logged in user)
                // .login() won't add logged in user to req.session Object.passport.user
                req.login(newMember,function(err) {
                    if (err) {return next(err);}
                    return res.json({ 
                        requestSuccess:true,
                        loginSuccess:true,
                        user:newMember 
                    });
                });
            })
            .catch(function(error) {
                error.errors?.email 
                // if email invalid (mongoose checks and throws err if so)
                ? res.json({
                    requestSuccess:true,
                    loginSuccess:false,
                    user:'invalid email'
                })
                // if using existing but mismatched username and email use here
                : res.json({
                    requestSuccess:true,
                    loginSuccess:false,
                    user:'duplicate'
                });
            });
            // console.log(req.isAuthenticated());
        } else {
            res.json({
                requestSuccess:true,
                loginSuccess:false,
                user:'duplicate'
            });
        }
    });
}

module.exports = { register }
