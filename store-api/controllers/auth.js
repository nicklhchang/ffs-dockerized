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
                // if using existing but mismatched username and email comes into here
                res.json({
                    requestSuccess:true,
                    loginSuccess:false,
                    user:'duplicate'
                });
            });

            // console.log(req.isAuthenticated());
            
            /** username and password fields already in req.body, should be no issue
            Member.create({ ...paramsToCreate })
            .then(function(newMember) {
                // here it is like we use req.body to create a new member
                // then we use the same req.body to log you in, after you are created as a member
                passport.authenticate('local',{
                    failureRedirect:'/api/v1/auth/login-failure',
                    successRedirect:'/api/v1/auth/login-success'
                }); // passport.authenticate() cannot be used like this; just have to stick to req.login()
            })
            .catch(function(error) {
                console.log(error); // for devs
                res.json({
                    loginSuccess:false,
                    user:null
                });
            }); */

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
