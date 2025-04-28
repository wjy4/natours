const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel'); // 确保路径对！

// 注册 Google OAuth2 策略
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('[DEBUG] Google profile received:', profile);

        const existingUser = await User.findOne({
          email: profile.emails[0].value,
        });

        if (existingUser) {
          return done(null, existingUser);
        }

        const randomPassword = Math.random().toString(36).slice(-8);

        const newUser = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          photo: profile.photos[0]?.value,
          password: randomPassword,
          passwordConfirm: randomPassword,
          googleId: profile.id,
        });

        return done(null, newUser);
      } catch (err) {
        console.error('[PASSPORT ERROR]', err);
        return done(err, null);
      }
    },
  ),
);

// 保存用户到 Session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// 从 Session 里拿出用户
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

console.log('[DEBUG] Passport Google Strategy registered ✅');
