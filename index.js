//import express framework
const express = require("express");
//import mongoose for mongodb connection and database operations
const mongoose = require("mongoose");
//load environment variables from .env file
require("dotenv").config();
//create express application
const app = express();

//define server port
const PORT = 5500;

// ================================
// MIDDLEWARE
// ================================
//middleware to read json data sent from postman
app.use(express.json());

// ================================
//MONGODB Connection
//=================================
// connect to mongodb using MONGO_URI from .env file
mongoose
  .connect(process.env.MONGO_URI)
  //if mongodb connection is successful
  .then(() => console.log("MongoDB connected successfully"))
  //if mongodb connection fails
  .catch((err) =>
    console.error("MongoDB connection error:", err)
  );
  
  //===============================
  //USER SCHEMA
  //===============================
  //define the structure of user document
const userSchema = new mongoose.Schema({
  //user name
  name: {
    type: String,
    required: true
  },

  //user email
  email: {
    type: String,
    required: true,
    //email must be unique
    unique: true
  },
  //user password
  password: {
    type: String,
    required: true
  }
});

//===============================
//USER MODEL
//===============================
//create user model based on user schema
const User = mongoose.model("User", userSchema);
//===============================
//CREATE USER - POST
//===============================
//POST request to create a new user
app.post("/users", async (req, res) => {
    try {
        //Get name and email from request body
        const { name, email } = req.body;
        //check if name and email are missing
        if (!name || !email) {
            return res.status(400).json({
                 message: "Name and email are required",
                 });
        }
    }catch (error) {
        console.error("Error creating user:", error);
        //send error response
        res.status(500).json({
            message: "error message",
        });
    }
});

//===============================
//2.Read all users - GET
//===============================
//GET request to  all users
app.get("/users", async (req, res) => {
    try {
        //get all users from mongodb
        const users = await User.find();
        //send users as response
        res.status(200).json({
            
        });
    } catch (error) {
        //send error response
        console.error("Error reading users:", error);
        //send error response
        res.status(500).json({
            message: " error message",
        });
    }
});
//===============================
//3.Read one user - GET
//===============================
//GET request to get a user by id
app.get("/users/:id", async (req, res) => {
    try {
        //find user using ID from URL
        const user = await User.findById(req.params.id);
        //if user is not found, send 404 response
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        //send user as response
        res.status(200).json(user);
    } catch (error) {
        console.error("Error reading user:", error);
        res.status(500).json({
            message: "error message",
        });
    }
});
// =====================================================
// 4. UPDATE COMPLETE USER - PUT
// =====================================================

// PUT request to completely update a user
app.put("/user/:id", async (req, res) => {
  try {

    // Get name and email from request body
    const { name, email } = req.body;

    // Both fields are required for PUT
    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required for PUT",
      });
    }

    // Find user by ID and update name and email
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },

      // new: true returns updated user
      // runValidators checks schema validation
      {
        new: true,
        runValidators: true,
      }
    );

    // If user doesn't exist
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Send updated user
    res.status(200).json({
      message: "User updated successfully",
      user,
    });

  } catch (err) {

    // Send error response
    res.status(400).json({
      message: err.message,
    });
  }
});


// =====================================================
// 5. UPDATE PART OF USER - PATCH
// =====================================================

// PATCH request to update only some fields
app.patch("/user/:id", async (req, res) => {
  try {

    // Find user by ID and update only received fields
    const user = await User.findByIdAndUpdate(
      req.params.id,

      // $set updates only the provided fields
      { $set: req.body },

      // Return updated user and validate data
      {
        new: true,
        runValidators: true,
      }
    );

    // If user doesn't exist
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Send updated user
    res.status(200).json({
      message: "User partially updated successfully",
      user,
    });

  } catch (err) {

    // Send error response
    res.status(400).json({
      message: err.message,
    });
  }
});


// =====================================================
// 6. DELETE USER - DELETE
// =====================================================

// DELETE request to remove a user
app.delete("/user/:id", async (req, res) => {
  try {

    // Find user by ID and delete it
    const user = await User.findByIdAndDelete(req.params.id);

    // If user doesn't exist
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Send deleted user as response
    res.status(200).json({
      message: "User deleted successfully",
      user,
    });

  } catch (err) {

    // Invalid MongoDB ID
    res.status(400).json({
      message: "Invalid user ID",
    });
  }
});


// =====================================================
// UNKNOWN ROUTES
// =====================================================

// This runs when the requested route does not exist
app.use((req, res) => {

  // Send 404 Not Found response
  res.status(404).json({
    message: "Route not found",
  });
});


// =====================================================
// START SERVER
// =====================================================

// Start server after MongoDB connection is successfully opened
mongoose.connection.once("open", () => {

  app.listen(PORT, () => {

    // Display server URL in terminal
    console.log(`Server running at http://localhost:${PORT}`);
  });
});