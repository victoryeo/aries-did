import express from 'express';
import session from 'express-session';
import { defaultRouter } from '../AuthRoute';
import passport from 'passport';
import '../Passport';

import {
  runVerifier,
  receiveConnectionRequestVerifier,
  sendMessageRequestVerifier,
  restartRequestVerifier,
  requestProofVerifier
} from './VerifierInquirer';

const app = express();
const port = 3002;

runVerifier();

app.use(session({ secret: 'MY_SECRET', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use('/', defaultRouter);

app.get('/', (req, res) => {
  res.send('Hello Aries!');
});

app.post('/api/verifier/receiveConnection', receiveConnectionRequestVerifier);
app.post('/api/verifier/sendMessage', sendMessageRequestVerifier);
app.post('/api/verifier/receiveConnection', restartRequestVerifier);
app.post('/api/verifier/requestProof', requestProofVerifier);

app.listen(port, () => {
  return console.log(`Ready at http://localhost:${port}`);
});
