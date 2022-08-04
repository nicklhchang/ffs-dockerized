// this here must go before controller in routes to protect; the protecting middleware
const isAuth = function(req,res,next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        // if do .status(401) axios requests will show Unauthorized error
        res.json({ 
            alreadyAuthenticated:false,
            requestSuccess:false,
            user:null,
            result:null
        });
    }
}

const isAdmin = function(req,res,next) {
    // for now no functionality because just need /create route and 
    // mongoose's .create() to initialise collection in mongodb
    next();
}

module.exports = { isAuth,isAdmin };