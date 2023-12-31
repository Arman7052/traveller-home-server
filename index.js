const express = require('express');
const morgan = require('morgan')
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
app.use(morgan('dev'))



// ---------------MongoDB DATABASE-----------------------------------//


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
            // console.log(result);
            res.send(result);
        });

        // Get user from DB
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await usersCollection.findOne(query);
            // console.log(result);
            res.send(result);
        });


        // Save a room in database
        app.post('/rooms', async (req, res) => {
            const room = req.body;
            // console.log(room);
            const result = await roomsCollection.insertOne(room);
            res.send(result);
        });

        // Get all rooms
        app.get('/rooms', async (req, res) => {
            const result = await roomsCollection.find().toArray();
            res.send(result);
        });


        // Get a single room by email
        app.get('/rooms/:email', async (req, res) => {
            const email = req.params.email;
            const query = { 'host.email': email };
            const result = await roomsCollection.find(query).toArray();

            // console.log(result);
            res.send(result);
        })

        // Get a single room
        app.get('/room/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await roomsCollection.findOne(query);
            // console.log(result);
            res.send(result);
        });


        // Delete room
        app.delete('/rooms/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await roomsCollection.deleteOne(query);
            res.send(result);
        })

        // Save a booking in database
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            // console.log(booking);
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        });


        // Get bookings for guest
        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            if (!email) {
                res.send([])
            }
            const query = { 'guest.email': email };
            const result = await bookingsCollection.find(query).toArray();
            res.send(result);
        });

        // Get bookings for host 

        app.get('/bookings/host', async (req,res) => {
            const email = req.query.email
            if (!email) {
                res.send([]);
            }
            const query = {host: email};
            const result = await bookingsCollection.find(query).toArray();
            res.send(result);
        })
        

        // Update room booking status
        app.patch('/rooms/status/:id', async (req, res) => {
            const id = req.params.id;
            const status = req.body.status;
            const query = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    booked: status,
                },
            };
            const update = await roomsCollection.updateOne(query, updateDoc);
            res.send(update);
        });


        // Delete or cancel booking

        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bookingsCollection.deleteOne(query);
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