
// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
const EXPHBS = require("express-handlebars");

// Requiring our Note and Article models
var Comment = require("./models/Comment.js");
var Article = require("./models/Article.js");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

const PORT = process.env.PORT || 3000;

// Initialize Express
const APP = express();

// Use body parser
APP.use(bodyParser.urlencoded({extended: false}));

// Make public a static dir
APP.use(express.static("public"));

// Set Handlebars.
APP.engine("handlebars", EXPHBS({ defaultLayout: "main" }));
APP.set("view engine", "handlebars");


// Database configuration with mongoose
if(process.env.MONGODB_URI)
{
	mongoose.connect(process.env.MONGODB_URI);
}
else
{
	mongoose.connect("mongodb://localhost/kotakuarticles");
}	

var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// Routes
// ======
require("./controllers/routes.js")(APP);

// Listen on port 3000
APP.listen(PORT, function() {
  console.log("App running on port", PORT);
});
