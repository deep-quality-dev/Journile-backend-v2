/* @flow */

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

import models from '../../models';


passport.use('user', new LocalStrategy({
    usernameField: 'login',
    passwordField: 'password'
  }, 
  function (login, password, cb) {
    //this one is typically a DB call. Assume that the returned user object is pre-formatted and ready for storing in JWT
    return models.User.findByLogin(login)
      .then(user => {
        if (!user) {
          return cb(null, false, {message: 'Incorrect email or password.'});
        }
        user.validatePassword(password).then(res => {
          if (res) {
            cb(null, user, {message: 'Logged In Successfully'})
          } else {
            cb(null, false, {message: 'Incorrect email or password.'})
          }
        }).catch(err => cb(err))
      })
      .catch(err => cb(err));
  }
));

const authenticateUser = (req: any, res: any) => new Promise((resolve, reject) => {
  passport.authenticate('user', { session: false }, (err, user, info) => {
    if (err) reject(err);
    resolve({ user, info });
  })(req, res);
});

export default authenticateUser;