const express = require("express");
const app = express();
require("dotenv").config();

const connectDB = require("./db/db_connection");

connectDB();
