import express from 'express';
import { 
  runHolder, 
  receiveConnectionRequestHolder,
  sendMessageRequestHolder,
  restartRequestHolder 
} from '../holder/HolderInquirer';

import {
  runIssuer,
  receiveConnectionRequestIssuer,
  sendMessageRequestIssuer,
  restartRequestIssuer,
  offerCredentialIssuer
} from '../issuer/IssuerInquirer';

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

app.post('/api/verifier/receiveConnection', receiveConnectionRequestVerifier);
app.post('/api/verifier/sendMessage', sendMessageRequestVerifier);
app.post('/api/verifier/receiveConnection', restartRequestVerifier);
app.post('/api/verifier/requestProof', requestProofVerifier);

app.listen(port, () => {
  return console.log(`Ready at http://localhost:${port}`);
});
