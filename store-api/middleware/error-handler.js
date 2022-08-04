const { StatusCodes } = require('http-status-codes');

const errorHandlerMiddleware = function(err,req,res,next) {
    let customError = {
        error:true,
        requestSuccess:false,
        statusCode:err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        msg:err.message || 'Something went wrong try again'
    }
    return res.json(customError);
}

module.exports = errorHandlerMiddleware;