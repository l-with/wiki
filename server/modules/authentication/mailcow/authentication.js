const _ = require('lodash')

/* global WIKI */

// ------------------------------------
// mailcow Account
// ------------------------------------

const OAuth2Strategy = require('passport-oauth2').Strategy

module.exports = {
  init (passport, conf) {
    const siteURL = conf.siteURL.slice(-1) === '/' ? conf.siteURL.slice(0, -1) : conf.siteURL
    const userInfoURL = `${siteURL}/oauth/profile`
    var client = new OAuth2Strategy({
        authorizationURL: `${siteURL}/oauth/authorize`,
        tokenURL: `${siteURL}/oauth/token`,
        clientID: conf.clientId,
        clientSecret: conf.clientSecret,
        userInfoURL: userInfoURL,
        callbackURL: conf.callbackURL,
        passReqToCallback: true,
        scope: 'profile',
        state: true
      }, async (req, accessToken, refreshToken, profile, cb) => {
        try {
          const user = await WIKI.models.users.processProfile({
            providerKey: req.params.strategy,
            profile: {
              ...profile,
            }
          })
          cb(null, user)
        } catch (err) {
          cb(err, null)
        }
      })

    client.userProfile = function (accesstoken, done) {
      this._oauth2._useAuthorizationHeaderForGET = true;
      this._oauth2.get(userInfoURL, accesstoken, (err, data) => {
        if (err) {
          return done(err)
        }
        try {
          data = JSON.parse(data)
        } catch(e) {
          return done(e)
        }
        done(null, data)
      })
    }
    passport.use('mailcow', client)
  }
}

