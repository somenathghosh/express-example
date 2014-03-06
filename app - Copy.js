
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var flash    = require('connect-flash');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname, '/views');
app.set('view engine', 'jade');




app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(app.router);
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://heroku:97aa100aa71b190805c41b70bed0e20b@troup.mongohq.com:10097/app22192444');

var Schema = new mongoose.Schema({
	id : Number,
	name : String,
	from : Date,
	to   : Date,
	mc   : Number
	
});

var user = mongoose.model('reservation',Schema);
app.post('/new',function(req,res){

			
			new user({
				id   : req.body.empID,
				name : req.body.name,
				from : req.body.from,
				to   : req.body.to,
				mc   : req.body.mc
			}).save(function(err, doc){
					if(err) {
					console.log(err);
					res.end("There is some system error");
					}
					else res.redirect("https://www.google.com");
			});
});


app.get('/dateError1',function(req,res){
	res.render('login.ejs');
});

	
	


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
