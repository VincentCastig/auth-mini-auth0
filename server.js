const express = require('express');
const session = require('express-session');
const passport = require('passport');
const Auth0strategy = require('passport-auth0');
const config = require('./config');

const port = 3000;

const app = express();

app.use(session({
  resave: true,
  saveUnitialized: true,
  secret: config.secret
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new Auth0Strategy({
  domain: config.domain,
  clientID: config.clientID,
  clientSecret: config.clientSecret,
  callbackURL: config.callbackURL
}, function(accessToken, refreshToken, extraParams, profile, done) {
  return done(null, profile);
}));

passport.serializeUser(function(user, done) {//take res from auth0 strategy will attach it to our session
  done(null, user);
});

passport.deserializeUser(function(obj, done) {//unhatch from our session so we can send it to our client
  done(null, obj);
});

app.get('/auth', passport.authenticate('auth0')); //returns profile to serializeduser

app.get('/auth/callback',
  passport.authenticate('auth0', {successRedirect: '/me'}), (req, res) => {
    res.status(200).send(req.user);
});

app.get('/me', (req, res, next) => {
  if(req.user) res.json(req.user);
  else res.json ({message: 'Failure'})
})

app.listen(port, () => {
  console.log(`Dude, I'm listening on port: ${port}`);
})
