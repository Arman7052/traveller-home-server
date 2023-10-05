const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 7052;

// middleware
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());



// ------------------------------------------------------------//




// ------------------------------------------------------------- //

app.get('/', (req, res) => {
    res.send('Traveller Home Server is running..')
  })
  
  app.listen(port, () => {
    console.log(`Traveller Home is running on port ${port}`)
  })