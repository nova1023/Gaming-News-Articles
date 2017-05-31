const REQUEST = require('request');
const CHEERIO = require("cheerio");
const Article = require("../models/Article.js");
const Comment = require("../models/Comment.js");


module.exports = function(app){

	app.get('/', function(req, res){
		
		Article.find()
		.populate("comments")
		.exec(function(err, docs){

			var hbsObject ={
				article: docs,
			};

			res.render("index", hbsObject);
		})
		
	});

	//Scrape articles from web and stores them in mongodb
	app.get("/api/scrape", function(req, res) {
	
	  // First, we grab the body of the html with request
	  REQUEST("http://www.kotaku.com/", function(error, response, html) {
	    // Then, we load that into cheerio and save it to $ for a shorthand selector
	    var $ = CHEERIO.load(html);
	    // Now, we grab every h2 within an article tag, and do the following:
	    $('article h1').each(function(i, element){

	    	//Save an empty result object
	    	var result ={};

	    	// Add the title and href of every link, and save them as properties of the result object
      		result.title = $(this).children("a").text();
      		result.link = $(this).children("a").attr("href");
    	
	      	// Using our Article model, create a new entry
	      	// This effectively passes the result object to the entry (and the title and link)
	      	var entry = new Article(result);

	      	// Now, save that entry to the db
	      	entry.save(function(err, doc) {
	        	// Log any errors
	        	if (err) {
	          		console.log(err);
	          		
	        	}
	        	// Or log the doc
	        	else {	        	
	          		console.log(doc);
	        	}
	      	});
	    });	   
	  });
	  // Tell the browser that we finished scraping the text
	 	  setTimeout(function() {res.redirect("/")}, 2000);
	});


	// This will get all articles we scraped from the mongoDB
	app.get("/api/article", function(req, res) {
	  // Grab every doc in the Articles array
	  Article.find({}, function(error, doc) {
	    // Log any errors
	    if (error) {
	      console.log(error);
	    }
	    // Or send the doc to the browser as a json object
	    else {
	      res.json(doc);
	    }
	  });
	});

	// Gets a single article and populates it with it's comments
	app.get("api/article/:id", function(req, res) {
	  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
	  Article.findOne({ "_id": req.params.id })
	  // ..and populate all of the notes associated with it
	  .populate("comments")
	  // now, execute our query
	  .exec(function(error, doc) {
	    // Log any errors
	    if (error) {
	      console.log(error);
	    }
	    // Otherwise, send the doc to the browser as a json object
	    else {
	      res.json(doc);
	    }
	  });
	});


	// Create a new Comment
	app.post("/api/article/:id", function(req, res) {
	 	
	  // Create a new note and pass the req.body to the entry
	  var newComment = new Comment(req.body);

	  // And save the new note the db
	  newComment.save(function(error, doc) {
	    // Log any errors
	    if (error) {
	      console.log(error);
	    }
	    // Otherwise
	    else {     		
	      // Use the article id to find and update it's note
	      Article.findOneAndUpdate({ "_id": req.params.id }, {$push:{ "comments": doc._id }},  { new: true })
	      // Execute the above query
	      .exec(function(err, doc) {
	        // Log any errors
	        if (err) {
	          console.log(err);
	        }
	        else {
	          // Or send the document to the browser
	          res.redirect('/');
	        }
	      });
	    }
	  });
	});

	
	// removes a comment from 'Comments' and 'Article' collections.
	app.post("/api/delete-comment", function(req, res){

		var commentID = req.body.commentID;
		var	articleID = req.body.articleID;
		
		Comment.remove({"_id": commentID}, function(error, doc) {
	    // Log any errors
	    if (error) 
	    {
	      console.log(error);
	    }
	    // Otherwise
	    else 
	    {     		
	      // Use the article id to find and update it's note
	      Article.findOneAndUpdate({ "_id": articleID }, {$pull:{ "comments": commentID }},  { new: true })
	      // Execute the above query
	      .exec(function(err, doc) {
	        // Log any errors
	        if (err) {
	          console.log(err);
	        }
	        else {
	          // Or send the document to the browser
	          res.json({complete:true});
	        }
	      });
	    }
	  });
	});

}//END module.exports