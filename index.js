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


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pf5eojy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const usersCollection = client.db('travellerDb').collection('users');
        const roomsCollection = client.db('travellerDb').collection('rooms');
        const bookingsCollection = client.db('travellerDb').collection('bookings');

        // Save user email and role in MongoDB
        app.put('/users/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const query = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await usersCollection.updateOne(query, updateDoc, options);
            console.log(result);
            res.send(result);
        });

        // Get user from DB
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await usersCollection.findOne(query);
            console.log(result);
            res.send(result);
        });

        // Get all rooms
        app.get('/rooms', async (req, res) => {
            const result = await roomsCollection.find().toArray()
            res.send(result)
        });

        // Save a room in database
        app.post('/rooms', async (req, res) => {
            const room = req.body;
            console.log(room);
            const result = await roomsCollection.insertOne(room);
            res.send(result);
        });


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



// ------------------------------------------------------------- //

app.get('/', (req, res) => {
    res.send('Traveller Home Server is running..')
})

app.listen(port, () => {
    console.log(`Traveller Home is running on port ${port}`)
})