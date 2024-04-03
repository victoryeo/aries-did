This is a Hyperledger Aries demo app 

Agents can perform the simple workflow:  
(1) Issuer issues credentials  
(2) Holder accepts and stores the credentials  
(3) Verifier sends proof request and verifies the credentials  

On the command line:   
run "npm install"  
run "npm run holder"  
run "npm run issuer"  
run "npm run verifier"  

The RestAPIs are available.  
Example:  
To issue Verifiable Credential:  
curl -X POST http://127.0.0.1:3001/api/issuer/offer
