const express = require('express'); // Import express
const passport = require('passport'); // Import passport
const session = require('express-session'); // Import express-session
const { request } = require('express');

const app = express(); // Create express app

app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true })); // Configure express-session

passport.use(new OneLoginStrategy({ 
  issuer : process.env.BaseURL,
  clientID: process.env.OIDC_CLIENT_ID,
  clientSecret: process.env.OIDC_CLIENT_SECRET,
  authorizationURL: `${OIDC_BASE_URI}/auth`,
  userInfoURL: `${OIDC_BASE_URI}/me`,
  tokenURL: `${OIDC_BASE_URI}/token`,
  callbackURL: process.env.OIDC_REDIRECT_URI,
  passReqToCallback: true


},
  function(req, iss, sub, profile, accessToken, refreshToken, params, done){
    console.log('issuer:' , issuer);
    console.log('userId:', userId);
    console.log('accessToken:', accessToken);
    console.log('refreshToken:', refreshToken);
    console.log('params:', params);
    
    req.session.accessToken = accessToken;

    return cb(null, profile);

  }));

  app.get('/login', passport.authenticate('oneidconnect', {
    successReturnToOrRedirect : '/',
    failureRedirect : '/login',
    scope : 'profile'
  }));

  app.get('/oauth/callback', passport.authenticate('oneidconnect',{
    callback : true,
    successReturnToOrRedirect : '/users',
    failureRedirect : '/login'
  }));

  app.get('/users', function(req, res){
    request.post('https://api.onelogin.com/v2/users/me', {
      'form': {
        /* 'access_token': req.session.accessToken */
        'client_id': process.env.OIDC_CLIENT_ID,
        'client_secret': process.env.OIDC_CLIENT_SECRET,
        'grant_type': 'client_credentials'



      }
    })

  });

  app.get('/logout', function(req, res){
    request.post('https://openid-connect.onelogin.com/oidc/token/revocation',{
      'form': {
        'client_id': process.env.OIDC_CLIENT_ID,
        'client_secret': process.env.OIDC_CLIENT_SECRET,
        'token': req.session.accessToken,
        'token_type_hint': 'access_token'
      },function(err, httpResponse, body){
        console.log('err:', err);
        res.redirect('/login');
      }
    });

  });
