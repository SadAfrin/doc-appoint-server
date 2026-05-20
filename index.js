const dns = require('node:dns'); 
dns.setServers(["8.8.8.8", "8.8.4.4"]);
//---------------------------------------

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware configuration
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGODB_URI;

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
        await client.connect();
        const db = client.db("doc-appoint-project-db");

        // testing the dtaabase connection and insertion
        const testCollection = db.collection("test");
        const appointmentsCollection = db.collection("appointments");

        app.post('/api/bookings', async (req, res) => {
        try {
                const bookingData = req.body;
                const result = await appointmentsCollection.insertOne(bookingData);
                
                console.log("New Appointment Saved to MongoDB:", result);
                res.status(201).json({ 
                success: true, 
                message: "Appointment booked successfully!", 
                result 
                });
            } catch (error) {
                console.error("MongoDB Insertion Error:", error);
                res.status(500).json({ 
                success: false, 
                message: "Failed to book appointment", 
                error: error.message 
                });
            }
        });

        app.get('/api/bookings', async (req, res) => {
        try {
            const { email } = req.query; // email fetching 

            let query = {};
            if (email) {
            query = { userEmail: email }; // email diye only shei dataset collect kora
            }

            const result = await appointmentsCollection.find(query).toArray();
            res.status(200).json({ success: true, result });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
        });

        app.patch('/api/bookings/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { ObjectId } = require('mongodb');
            const updatedData = req.body;

            const query = { _id: new ObjectId(id) };
            const updateDoc = {
            $set: {
                patientName: updatedData.patientName,
                gender: updatedData.gender,
                phone: updatedData.phone,
                appointmentDate: updatedData.appointmentDate,
                appointmentTime: updatedData.appointmentTime
            }
            };

            const result = await appointmentsCollection.updateOne(query, updateDoc);
            res.status(200).json({ success: true, message: "Appointment updated successfully!", result });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
        });

    
        app.delete('/api/bookings/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { ObjectId } = require('mongodb'); // ObjectId import
            
            const result = await appointmentsCollection.deleteOne({ _id: new ObjectId(id) });
            
            if (result.deletedCount === 1) {
            res.status(200).json({ success: true, message: "Appointment deleted successfully!" });
            } else {
            res.status(404).json({ success: false, message: "Appointment not found" });
            }
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
        });

        
        

        // A sample POST route to test data insertion into the test collection
        // app.post('/api/test-insert', async (req, res) => {
        // try {
        //     const testData = req.body;
            
        //     // Check if the collection reference is perfectly accessible
        //     const result = await testCollection.insertOne(testData);
            
        //     console.log("Successfully inserted to DB:", result);
        //     res.status(201).json({ success: true, message: "Data inserted successfully!", result });
        // } catch (error) {
        //     // This will print the actual hidden error in your VS Code terminal
        //     console.error("ACTUAL DATABASE ERROR:", error); 
        //     res.status(500).json({ success: false, message: "Insertion failed", error: error.message });
        // }
        // });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



// Root route to verify server status
app.get('/', (req, res) => {
  res.send('Server is Running Smoothly!');
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});