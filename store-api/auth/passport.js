const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Member = require('../models/member');

const customFields = {
    // later in fetch() or axios use username and password when make post request
    usernameField:'username',
    passwordField:'password'
}

const verifyCallback = async function(username,password,done) {
    try {
        const member = await Member.findOne({ username:username });
        if (!member) { return done(null,false); }

        const isValid = await member.validatePassword(password);
        if (isValid) { return done(null,member); }
        else { return done(null,false); }
    } catch (error) {
        // let passport handle it
        return done(error);
    }
}

const strategy = new LocalStrategy(customFields,verifyCallback);

passport.use(strategy);

passport.serializeUser(function(member,done) {
    done(null,member.id);
});

passport.deserializeUser(async function(memberId, done) {
    try {
        const member = await Member.findById(memberId);
        done(null,member);
    } catch (error) {
        done(error);
    }
});