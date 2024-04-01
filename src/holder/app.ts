import express from 'express';
import {
  runHolder,
  receiveConnectionRequestHolder,
  sendMessageRequestHolder,
  restartRequestHolder
} from './HolderInquirer';

import {
  runIssuer,
  receiveConnectionRequestIssuer,
  sendMessageRequestIssuer,
  restartRequestIssuer,
  offerCredentialIssuer
} from '../issuer/IssuerInquirer';

const app = express();
const port = 3000;

runHolder();

app.get('/', (req, res) => {
  res.send('Hello Aries!');
});

app.post('/api/holder/receiveConnection', receiveConnectionRequestHolder);
app.post('/api/holder/sendMessage', sendMessageRequestHolder);
app.post('/api/holder/receiveConnection', restartRequestHolder);

app.post('/api/issuer/receiveConnection', receiveConnectionRequestIssuer);
app.post('/api/issuer/sendMessage', sendMessageRequestIssuer);
app.post('/api/issuer/receiveConnection', restartRequestIssuer);
app.post('/api/issuer/offer', offerCredentialIssuer);

app.listen(port, () => {
  return console.log(`Ready at http://localhost:${port}`);
});
