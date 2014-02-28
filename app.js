
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname, '/views');
app.set('view engine', 'jade');




app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://root:root@novus.modulusmongo.net:27017/qy7nyXog');
var Schema = new mongoose.Schema({
	_id : Number,
	name : String,
	reason : String
});

var user = mongoose.model('emp',Schema);
app.post('/new',function(req,res){
	new user({
		_id: req.body.empID,
		name : req.body.name,
		reason : req.body.reason
	}).save(function(err, doc){
			if(err) {
			console.log(err);
			res.end("There is some system error");
			}
			else res.redirect("https://www.google.com");
	});
});

	
	


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
