require("dotenv").config();

const express = require("express");

const app =require("./app")
const connectDB = require("./db/db_connection");
const Port = process.env.PORT;


connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("ERROR :", error);
      throw error;
    });

    app.listen(Port || 8000, () => {
      console.log(`Server is listening at ${Port}`);
    });
  })
  .catch((err) => {
    console.log("MONGODB connection failed !!", err);
  });
