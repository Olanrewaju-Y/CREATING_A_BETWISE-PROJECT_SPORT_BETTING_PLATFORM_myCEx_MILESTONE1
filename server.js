// Importing all dependencies

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("./userModel");
const Event = require("./eventModel");
const Bet = require("./betModel");
const Payment = require("./paymentModel");

// middle ware / body parser
app.use(express.json());

// setting up PORT
const PORT = process.env.PORT || 8000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    // CONNECT TO MONGODB
    console.log("Connected to MongoDB");

    // CONNECT TO SERVER
    app.listen(PORT, () => {
      console.log(`Server listening on PORT ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB", error);
    process.exit(1);
  });

// SETTING APIs

// Sign - up API AND ENDPOINT

app.post("/signup", async (req, res) => {
      const {
      userName,
      password,
      above18,
      walletBalance,
      nickName,
      role,
      gender,
      country,
      interests,
    } = req.body;
 
  try {
    if (!userName || !password) {
      res.status(400).json({
        message: "All fields are required",
      });
      return console.log("Empty field Error Request was recieved");
    }
    const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!emailFormat.test(userName)) {
      res.status(400).json({
        message: "Invalid email format",
      });
      return console.log("Invalid email format request was recieved");
    }

       if(!passwordFormat.test(password)){
       res.status(400).json({
            message: "Invalid password format"
        })
        return console.log("Invalid password format request was recieved");
    }

    if (above18 !== true) {
      res.status(400).json({
        message: "User must be 18 or above to register",
      });
      return console.log("User < 18 Error request was recieved");
    }
    
    const existingUser = await User.findOne({ userName });

    if (existingUser) {
      res.status(400).json({
        message: "UserName already exists, try login",
      });
      return console.log("UserName already exists error request was recieved");
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      userName,
      password: hashedPassword,
      above18,
      walletBalance,
      nickName,
      role,
      gender,
      country,
      interests,
    });

    await newUser.save();

    res.status(200).json({
      message: "User created successfully",
      user: {
        userName: newUser.userName,
        above18: newUser.above18,
        walletBalance: newUser.walletBalance,
        nickName: newUser.nickName,
        role: newUser.role,
        gender: newUser.gender,
        country: newUser.country,
        interests: newUser.interests,
      },
    });
    return console.log("User created successfully");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});






// USE LOGIN API AND ENDPOINT

app.post("/login", async (req, res) => {
    const { userName, password } = req.body;

   try{
      // First stage validation on inputs

    if(!userName || !password){
        res.status(400).json({
            message: "All fields are required"
        })
      return console.log("Empty field Error Request was recieved");
    }

    const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if(!emailFormat.test(userName)){
       res.status(400).json({
            message: "Incorrect email format"
        })
        return console.log("Incorrect email format request was recieved");
    }

    if(!passwordFormat.test(password)){
         res.status(400).json({
            message: "Incorrect password format"
        })
        return console.log("Incorrect password format request was recieved");
    } 

    // second stage validation with database
    const existingUser = await User.findOne({ userName })

    if (!existingUser) {
       res.status(400).json({
            message: "Incorrect username or password"
        })
        return console.log("Incorrect username or password request was recieved");
    }

    const passwordMatch = await bcrypt.compare(password, existingUser?.password)
    if(!passwordMatch){
        return res.status(400).json({
            message: "Incorrect password or username"
        })
        return console.log("Incorrect password or username request was recieved");
    }

    // Generate tokens for geniue users
    const ACCESS_TOKEN = process.env.ACCESS_TOKEN
    const REFRESH_TOKEN = process.env.REFRESH_TOKEN

    const accessToken = jwt.sign(
      {id: existingUser?._id}, 
      ACCESS_TOKEN, 
      {expiresIn: "5m"}
    )

    const refreshToken = jwt.sign(
      {id: existingUser?._id}, 
      REFRESH_TOKEN, 
      {expiresIn: "7d"}

    )

    res.status(200).json({
        message: "User logged in successfully",
        user: {
            userName: existingUser?.userName,
            above18: existingUser?.above18,
            walletBalance: existingUser?.walletBalance,
            nickName: existingUser?.nickName,
            role: existingUser?.role,
            gender: existingUser?.gender,
            country: existingUser?.country,
            interests: existingUser?.interests
        },
        accessToken
    })
    return console.log("User logged in successfully");

   }
   catch(error){
    res.status(500).json({ message: error.message });
   }
})
    