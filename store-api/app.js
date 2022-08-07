require('dotenv').config();
const express = require('express');
const app = express();

const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');

const { connectSessionStore, connectAndPopulate } = require('./db/connect');

const helmet = require('helmet');
const cors = require('cors');
const xssClean = require('xss-clean');
const rateLimit = require('express-rate-limit');

const browseRouter = require('./routes/browse');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');

const { isAuth, isAdmin } = require('./middleware/auth');
const errorHandlerMiddleware = require('./middleware/error-handler');
const notFoundMiddleware = require('./middleware/not-found');

app.set('trust proxy', 1);
app.use(rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 200
}));
// parse incoming Request object if it is string, array, object or any type
app.use(express.urlencoded({ extended: true }));
// parse incoming object as JSON
app.use(express.json());
// sets http headers to secure express app 
app.use(helmet());
app.use(cors({
    "origin": ["http://localhost:3000"],
    "methods": ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    "credentials": true
}));
app.use(xssClean());

const clientPromise = connectSessionStore();
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        clientPromise // have to call it clientPromise this is finnicky
        // don't need db name because specified in process.env.MONGO_URI
    }),
    cookie: {
        secure: false, // set to true for prod, testing uses http not https
        maxAge: 1000 * 60 * 1.5, // 1.5 minutes then, authenticate new session,
        httpOnly: false
    }
}));
app.use(passport.initialize());
app.use(passport.session());
require('./auth/passport');

app.get('/test', function (req, res) {
    res.json({ hello: "world" });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/browse', isAuth, browseRouter);
app.use('/api/v1/admin', isAdmin, adminRouter);

app.use(errorHandlerMiddleware);
app.use(notFoundMiddleware);

const port = process.env.PORT || 8000;
const serverStart = function () {
    connectAndPopulate();
    app.listen(port, "0.0.0.0", function () {
        console.log(`Backend is listening on docker container ${port}`);
    });
}

serverStart();