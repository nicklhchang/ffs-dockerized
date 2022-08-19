const express = require('express');
const router = express.Router();
const passport = require('passport');

const { register } = require('../controllers/auth');

router.route('/register').post(register);

router.get('/login-status', function (req, res) {
    res.json({
        alreadyAuthenticated: req.isAuthenticated(),
        // ? means if req property exists, then access its user property
        user: req?.user
    });
})

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/api/v1/auth/login-failure',
    successRedirect: '/api/v1/auth/login-success'
}));

router.get('/login-success', function (req, res) {
    console.log(req.user, req.session);
    // sessionID: '4zBMIyid4nQiIECaMZ3jjY_C7oRX42X4',
    // session: Session {
    //     cookie: {
    //       path: '/',
    //       _expires: 2022-07-24T08:47:55.273Z,
    //       originalMaxAge: 300000,
    //       httpOnly: false,
    //       secure: false
    //     },
    //     passport: { user: '62c833473f55336f8ac5cea7' }
    //   }
    res.json({
        loginSuccess: true,
        // userID:req.session.passport.user,
        user: {
            _id: req.user._id,
            username: req.user.username,
            email: req.user.email
        }
    });
})

router.get('/login-failure', function (req, res, next) {
    res.json({
        loginSuccess: false,
        user: null
    });
})

router.get('/timeout', function (req, res) {
    res.writeHead(200, {
        'Connection': 'keep-alive',
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache-control',
        'Access-Control-Allow-Origin': 'http://localhost:3000'
    });

    let warnTimeout, unauthTimeout;
    if (!req.isAuthenticated()) {
        /** this route, as soon as frontend requests but is unauthenticated, just
         * replies by saying close this event-stream connection */
        // res.end(); // res.send() does not work (wrong format; not event-stream)
        res.write('event:unauthenticated\ndata:{"session-unauthenticated":"true"}\n\n');
    } else {
        // get in nice forms to find difference
        // e.g. Thu Jul 28 2022 23:21:19 GMT+1000 (Australian Eastern Standard Time)
        const expiryDateTime = new Date(req.session.cookie._expires);
        const datetimeNow = new Date(Date.now());
        // divide 60e3 is /(60 * 10^3) to get from ms to mins, or 1e3 get seconds
        const timeUntilExpiry = (expiryDateTime - datetimeNow) / 1e3;
        console.log(timeUntilExpiry)
        if (timeUntilExpiry < 60) {
            res.write(`event:almost-timeout\ndata:{"time-left":"${timeUntilExpiry}"}\n\n`)
        } else {
            console.log('warnTimeout is set')
            // wait until 1 minute mark then notify frontend
            warnTimeout = setTimeout(() => {
                res.write('event:almost-timeout\ndata:{"time-left":"60"}\n\n')
            }, ((timeUntilExpiry - 60) * 1000));
        }
        // gives 1.5 seconds for frontend to close and display alert message
        // but that means frontend syncs, then after final sync no more
        // like telling user they're unauthenticated earlier than they actually are; just to be safe
        unauthTimeout = setTimeout(() => {
            console.log('unauth timeout set');
            res.write(`event:unauthenticated\ndata:{"session-unauthenticated":"true"}\n\n`);
        }, ((timeUntilExpiry - 1.5) * 1000)); 
    }

    // frontend closes
    res.on('close', () => {
        if (warnTimeout) { clearTimeout(warnTimeout); } 
        if (unauthTimeout) { clearTimeout(unauthTimeout); } // safer to clear timeouts
        res.end();
    })
})

module.exports = router;