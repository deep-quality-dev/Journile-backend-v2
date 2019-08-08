/* @flow */

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

import models from '../../models';


passport.use('scraper', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  }, 
  function (username, password, cb) {
    //this one is typically a DB call. Assume that the returned scraper object is pre-formatted and ready for storing in JWT
    return models.Scraper.findByUsername(username)
      .then(scraper => {
        if (!scraper) {
          return cb(null, false, {message: 'Incorrect username or password.'});
        }
        scraper.validatePassword(password).then(res => {
          if (res) {
            cb(null, scraper, {message: 'Logged In Successfully'})
          } else {
            cb(null, false, {message: 'Incorrect username or password.'})
          }
        }).catch(err => cb(err))
      })
      .catch(err => cb(err));
  }
));

const authenticatesSrapper = (req: any, res: any) => new Promise<any>((resolve, reject) => {
  passport.authenticate('scraper', { session: false }, (err, scraper, info) => {
    if (err) reject(err);
    resolve({ scraper, info });
  })(req, res);
});

export default authenticatesSrapper;