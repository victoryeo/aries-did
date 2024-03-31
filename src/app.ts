import express from 'express';
import { runAlice, 
  receiveConnectionRequest,
  sendMessageRequest,
  restartRequest } from './AliceInquirer';

const app = express();
const port = 3000;

runAlice();

app.get('/', (req, res) => {
  res.send('Hello Aries!');
});

app.post('/api/alice/receiveConnection', receiveConnectionRequest);
app.post('/api/alice/sendMessage', sendMessageRequest);
app.post('/api/alice/receiveConnection', restartRequest);

app.listen(port, () => {
  return console.log(`Ready at http://localhost:${port}`);
});
