
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var flash    = require('connect-flash');
var users = {};
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server,{log: false });

server.listen(process.env.PORT || 5000);

// all environments
//app.set('port', process.env.PORT || 3000);
app.set('views', __dirname, '/views');
app.set('view engine', 'ejs');






app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(app.router);
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://heroku:97aa100aa71b190805c41b70bed0e20b@troup.mongohq.com:10097/app22192444');
//mongoose.connect('mongodb://root:root@novus.modulusmongo.net:27017/qy7nyXog');


var Schema = new mongoose.Schema({
	
	id     : Number,
	name   : String,
	from   : Date,
	to     : Date,
	reason : String,
	mc     : Number
	
});
var User = mongoose.model('reservation',Schema);

io.sockets.on('connection', function(socket){
	socket.on('new user', function(mcNumber, fromDate, toDate, callback){
	
		User.find({to: {"$gte":fromDate},from: {"$lte":toDate},mc: mcNumber},function(err,docs){
			if(err) console.log(err);
			if(!docs){
				callback(false);
			}
			else {
				callback(true);
				docs.forEach( function(doc){
					
					socket.emit('usernames',{timeFrom: doc.from.toString(), timeTo: doc.to.toString()});
				});
			}
			
			
		
		});
	});
});


	
	


app.post('/new',function(req,res){
	
	//User.findOne({to: {"$gt":req.body.from},from: {"$lt":req.body.to},id: req.body.id},function(err,docs){
	User.findOne({to: {"$gt":req.body.from},from: {"$lt":req.body.to},id: req.body.empID},function(err,docs){
		//console.log(req.body.empID);
		if(err){
			console.log(err);
			res.end("There is some DB system error");
		}
		if(docs){
			console.log(docs);
			console.log("already have a machine");
			res.render("./views/reservationPageDuplicate",{R:docs});
		}
		else {
			//console.log(docs);
			User.findOne({to: {"$gt":req.body.from},from: {"$lt":req.body.to},mc: req.body.mc},function(err,user){
			if (err) {
				console.log(err);
				res.end("There is some DB system error");
			}
			if(user) {
				console.log(user);
				res.render("./views/reservationPage",{R:user});
			}
			else{
				
			
				new User({
							
							id   : req.body.empID,
							name : req.body.name,
							from : req.body.from,
							to   : req.body.to,
							reason : req.body.reason,
							mc     : req.body.mc
						}).save(function(err, doc){
							if(err) {
							console.log(err);
								res.end("There is some system error");
							}
								else res.render("./views/index",{R: doc});
						});
				}
			});
			
		}

	});
});


var feedSchema = new mongoose.Schema({
	id       : Number,
	name     : String,
	feedback : String,
	postedON : Date
	
	
});



var feedBack = mongoose.model('feedBack',feedSchema);

app.post('/feedback',function(req,res){
	
	new feedBack({
		id : req.body.empID,
		name : req.body.name,
		feedback : req.body.feedback,
		postedON : new Date()
		
	}).save(function(err,doc){
		if(err) console.log(err);
		else
			res.render("./views/Thanks");
	});
});

	


app.get('/dateError1',function(req,res){
	res.render('login.ejs');
});


app.get('/reserveBack',function(req,res){
	
	res.render('./views/index');
});
	

/*
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
*/