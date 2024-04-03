import express from 'express';
import session from 'express-session';
import { defaultRouter } from '../AuthRoute';
import passport from 'passport';
import '../Passport';

import {
  runIssuer,
  receiveConnectionRequestIssuer,
  sendMessageRequestIssuer,
  restartRequestIssuer,
  offerCredentialIssuer
} from './IssuerInquirer';

const app = express();
const port = 3001;

runIssuer();

app.use(session({ secret: 'MY_SECRET', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use('/', defaultRouter);

app.get('/', (req, res) => {
  res.send('Hello Aries!');
});

app.post('/api/issuer/receiveConnection', receiveConnectionRequestIssuer);
app.post('/api/issuer/sendMessage', sendMessageRequestIssuer);
app.post('/api/issuer/restartIssuer', restartRequestIssuer);
app.post('/api/issuer/offer', offerCredentialIssuer);

app.listen(port, () => {
  return console.log(`Ready at http://localhost:${port}`);
});
