const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const users = require("./routes/users");
const news = require("./routes/news");
const notification = require("./routes/notification.js");
const location = require("./routes/location.js");
const category = require("./routes/category.js");
const geo = require("./routes/geo.js");




//express
var app = express();


// Bodyparser Middleware

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

app.use(cors());

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to Mongo
mongoose
  .connect(db, { useNewUrlParser: true, useFindAndModify: false }) // Adding new mongo url parser
  .then(() => console.log("MongoDB Connected..."))
  .catch(err => console.log(err));
app.use("/geo", geo);

app.use("/users", users);
app.use("/news", news);
app.use("/notification", notification);
app.use("/location", location);
app.use("/category", category);




const port = process.env.PORT || 4000;

app.listen(port, () => console.log(`Server started on port ${port}`));

