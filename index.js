const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ah9aw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // create database
    const serviceCollection = client.db("ServiceDB").collection("service");
    const bookingCollection = client
      .db("ServiceDB")
      .collection("booking_requests");

    // create a service and store db
    app.post("/add-service", async (req, res) => {
      const serviceData = req.body;
      const result = await serviceCollection.insertOne(serviceData);
      res.send(result);
    });

    // get all service from db
    app.get("/services", async (req, res) => {
      const result = await serviceCollection.find().toArray();
      res.send(result);
    });

    // get one service by id
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await serviceCollection.findOne(query);
      res.send(result);
    });

    // create a booking request api and store db
    app.post("/booking-request", async (req, res) => {
      const bookingData = req.body;
      const result = await bookingCollection.insertOne(bookingData);
      res.send(result);
    });

    // get create service by email to specific user
    app.get("/my-service/:email", async (req, res) => {
      const email = req.params.email;
      const query = { "provider.email": email };
      const result = await serviceCollection.find(query).toArray();
      res.send(result);
    });

    // delete my created service
    app.post("/delete-service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await serviceCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from Service Server....");
});

app.listen(port, () => console.log(`Server running on port ${port}`));
