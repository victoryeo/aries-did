import express from 'express';
import { 
  runAlice, 
  receiveConnectionRequest,
  sendMessageRequest,
  restartRequest 
} from './AliceInquirer';

import {
  runIssuer,
  receiveConnectionRequestIssuer,
  sendMessageRequestIssuer,
  restartRequestIssuer,
  offerCredentialIssuer
} from './IssuerInquirer';

import {
  runVerifier,
  receiveConnectionRequestVerifier,
  sendMessageRequestVerifier,
  restartRequestVerifier,
  requestProofVerifier
} from './VerifierInquirer';

const app = express();
const port = 3000;

runAlice();
runIssuer();
runVerifier();

app.get('/', (req, res) => {
  res.send('Hello Aries!');
});

app.post('/api/alice/receiveConnection', receiveConnectionRequest);
app.post('/api/alice/sendMessage', sendMessageRequest);
app.post('/api/alice/receiveConnection', restartRequest);

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
