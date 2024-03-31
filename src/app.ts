import express from 'express';
import { runAlice, 
  receiveConnectionRequest,
  sendMessageRequest,
  restartRequest } from './AliceInquirer';


import {
  runIssuer,
  receiveConnectionRequestIssuer,
  sendMessageRequestIssuer,
  restartRequestIssuer
} from './IssuerInquirer';

const app = express();
const port = 3000;

runAlice();
runIssuer();

app.get('/', (req, res) => {
  res.send('Hello Aries!');
});

app.post('/api/alice/receiveConnection', receiveConnectionRequest);
app.post('/api/alice/sendMessage', sendMessageRequest);
app.post('/api/alice/receiveConnection', restartRequest);
app.post('/api/issuer/receiveConnection', receiveConnectionRequestIssuer);
app.post('/api/issuer/sendMessage', sendMessageRequestIssuer);
app.post('/api/issuer/receiveConnection', restartRequestIssuer);

app.listen(port, () => {
  return console.log(`Ready at http://localhost:${port}`);
});
