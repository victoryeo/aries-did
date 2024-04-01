import { Router } from 'express';
import passport from 'passport';

export const defaultRouter = Router();

// Initiates the Google OAuth 2.0 authentication flow
defaultRouter.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback URL for handling the OAuth 2.0 response
defaultRouter.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  // Successful authentication, redirect or handle the user as desired
  res.redirect('/');
});

// Logout route
defaultRouter.get('/logout', (req: any, res: any) => {
  req.logout();
  res.redirect('/');
});
