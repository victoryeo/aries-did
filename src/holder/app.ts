import express from 'express';
import session from 'express-session';
import { defaultRouter } from '../AuthRoute';
import passport from 'passport';
import '../Passport';

import {
  runHolder,
  receiveConnectionRequestHolder,
  sendMessageRequestHolder,
  restartRequestHolder
} from './HolderInquirer';

const app = express();
const port = 3000;

runHolder();

app.use(session({ secret: 'MY_SECRET', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use('/', defaultRouter);

app.get('/', (req, res) => {
  res.send('Hello Aries!');
});

app.post('/api/holder/receiveConnection', receiveConnectionRequestHolder);
app.post('/api/holder/sendMessage', sendMessageRequestHolder);
app.post('/api/holder/restartHolder', restartRequestHolder);

app.listen(port, () => {
  return console.log(`Ready at http://localhost:${port}`);
});
