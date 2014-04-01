
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');

var users = {};
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server,{log: false });

var sendgrid  = require('sendgrid')( 
  'app23366879@heroku.com',
  '3zkgvrqk'
); 
server.listen(process.env.PORT || 5000);

//
var Client = require('node-rest-client').Client;

var client = new Client();




app.set('views', __dirname, '/views');
app.set('view engine', 'ejs');
app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(app.router);

app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://heroku:97aa100aa71b190805c41b70bed0e20b@troup.mongohq.com:10097/app22192444');



var Schema = new mongoose.Schema({
	
	id     	: Number,
	name   	: String,
	from   	: Date,
	to     	: Date,
	reason 	: String,
	mc     	: Number,
	resDate : Date
	
});
var User = mongoose.model('reservation',Schema);


var Schema = new mongoose.Schema({
	
	id     : Number,
	
});
var likeDB = mongoose.model('like',Schema);



io.sockets.on('connection', function(socket){
	socket.on('new user', function(mcNumber, fromDate, toDate, callback){
				
		User.find({to: {"$gte":fromDate},from: {"$lte":toDate},mc: mcNumber}).sort({from:1}).exec(function(err,docs){
			if(err) {
				console.log("Error from MongoDB: socket new user " + err);
				callback(false);
				socket.emit('errorM',{errorMessage : 'Database Error, please try later. Please report via feedback'});
			}
			if(!docs){
				callback(false);
			}
			else {
				
				callback(true);
				socket.emit('usernames',{R: docs });
				docs.forEach( function(doc){
					
					//socket.emit('usernames',{empID: id.toString(), fName: name, timeFrom: doc.from.toString(), timeTo: doc.to.toString()});
					//socket.emit('usernames',{doc: });
				});
			}
			
			
		
		});
	});
	



	
	socket.on('feedback', function(name, empID, feedback1, callback){
		
		new feedBack({
			id : empID,
			name : name,
			feedback : feedback1,
			postedON : new Date()
			
		}).save(function(err,doc){
			if(err) {
				console.log("Error from MongoDB: socket feedback " + err);
				callback(false);
				socket.emit('errorM',{errorMessage : 'Database Error, please try later. Please report via feedback'});
			}
			else {
				callback(true);
				socket.emit('thanks',{message: "Your feedback is successfully recorded"});
				sendgrid.send({ 
						  to: 'somenath.ghosh84@gmail.com', 
						  from: 'NoReply_TCSCharlottelab@tcs.com', 
						  subject: 'FeedBack', 
						  text:  'From:' + name + ' and Text : ' + feedback1
				}, function(err, json) { 
						if (err) { 
								console.log("Error with Sending Email to somenath.ghosh84@gmail.com "); 
								 
								console.error(err); 
						} 
						console.log(json); 
						 
				});
				
				
			}
		});
	});
	
	socket.on('like', function(callback){
		likeDB.findOne(function(err,doc){
			if(err) console.log(err);
			if(!doc) {
				new likeDB({
					id : 1
					
				}).save(function(err,doc){
					if(err) {
						console.log("Error from MongoDB: socket like " + err);
						callback(false);
						socket.emit('errorM',{errorMessage : 'Database Error, please try later. Please report via feedback'});
					}
					else {
						callback(true);
						socket.emit('thankYou',{message: "Thank You"});
					}
				});
			
			}
			if(doc){
				var updatedLikeCount = doc.id + 1;
				
				
				likeDB.update({id: doc.id},{$set: {id: updatedLikeCount}},function(err){
						
					if(err) {
						console.log("Error from MongoDB: socket like " + err);
						callback(false);
						socket.emit('errorM',{errorMessage : 'Database Error, please try later. Please report via feedback'});
					}
					else{
						callback(true);
						socket.emit('thankYou',{message: "Thank You"});
					}
				});
				
			}
		
		});
	});
	
	socket.on('reservation', function(emp,name,fromDate, toDate,mc,reason, callback){
		
		
		
		User.findOne({to: {"$gt":fromDate},from: {"$lt":toDate},id: emp},function(err,docs){
		
		if(err){
			console.log("Error from MongoDB: socket reservation search " + err);
			callback(false);
			socket.emit('errorM',{errorMessage : 'Database Error, please try later. Please report via feedback'});
		}
		if(docs){
			var msg = "You already have mc# " + docs.mc + " booked around same time";
			callback(true);
			socket.emit('message',{message: msg });
			
			
		}
		else {
			
			User.findOne({to: {"$gt":fromDate},from: {"$lt":toDate},mc: mc},function(err,user){
			if (err) {
				console.log("Error from MongoDB: socket reservation search with mc# " + err);
				callback(false);
				socket.emit('errorM',{errorMessage : 'Database Error, please try later. Please report via feedback'});
				
			}
			if(user) {
				
				var msg = "The selected slot is not available";
				callback(true);
				socket.emit('message',{message: msg });
				
			}
			else{

				new User({
							
							id   	: emp,
							name 	: name,
							from 	: fromDate,
							to   	: toDate,
							reason 	: reason,
							mc     	: mc,
							resDate : new Date()
							
						}).save(function(err, doc){
							
							if(err) {
								console.log("Error from MongoDB: socket reservation search with mc# " + err);
								callback(false);
								socket.emit('errorM',{errorMessage : 'Database Error, please try later. Please report via feedback'});
							}
								
							else {
							
								//console.log(doc.from);
								var empID = (emp).toString();
								htmlBody = "Dear "+ name+ ",\nYour reservation has been confirmed.\n\n M/C# " + mc + "\n " + "FROM : " + new Date(fromDate) + "\n TO : " + new Date(toDate) +".";
								htmlBody = htmlBody + "\n\nThanks,\nTCS Charlotte Lab Team.\n\nP.S. This is a system-generated email. Please do not reply."; 
								CLTlab.findOne({employeeID : empID },function(err,docs){
									if(err) {
										console.log("Error from MongoDB: socket reservation CLTLab" + err);
										callback(false);
										socket.emit('errorM',{errorMessage : 'Database Error, please try later. Please report via feedback'});
									
									}
									
									if(docs) {
										
							
										
										if (docs.EmailID) {
											//var EmailText= "Dear "+ employee.FullName + ",\n\n Your Password is " + employee.password + "\n\n**This is an Un-monitored Email Box** \n\n (c) TATA Consultancy Services Ltd"; 
											
											var args = {
											  data: {"EmailID": docs.EmailID, "EmailText": htmlBody},
											  headers:{"Content-Type": "application/json"} 
											};


											client.put("http://intense-ravine-4499.herokuapp.com/sendEmailforReservation/" + docs.EmailID, args, function(data,response) {
												  // parsed response body as js object
												console.log(data);
												// raw response
												console.log(response.statusCode);
											});
											
										}
									}

										
								});
								
								var msg = "Your reservation is successful at MC: " + mc;
								callback(true);
								socket.emit('message',{message: msg });
								
									
							}
						});
					}
				});
			
			}

		});
	
	});
	
	
	
});

var Schema = new mongoose.Schema({
	
	EmployeeID : String,
	password   : String,
	EmailID   	: String,
	FullName    : String

	
},{ collection : 'charlottelabauthentication' });
	
var CLTlab = mongoose.model('charlottelabauthentication',Schema);



var feedSchema = new mongoose.Schema({
	id       : Number,
	name     : String,
	feedback : String,
	postedON : Date
	
	
});



var feedBack = mongoose.model('feedBack',feedSchema);



app.get('/',function(req,res){
	res.render('./views/index',{message:""});
});


var aboutDate = new Date(2014,02,28,23,59,00,00);

app.get('/about',function(req,res){
	var newDate = new Date();
	res.render('./views/about',{msg: aboutDate.toString()}) ;
});


app.post('/feedback', function(req, res){
	var obj = {};
	console.log('body: ' + JSON.stringify(req.body));
	new feedBack({
			id : parseInt(req.body.id),
			name : req.body.name,
			feedback : req.body.feedback,
			postedON : new Date()
			
	}).save(function(err,doc){
		if(err) {
			console.log("Error from MongoDB: socket feedback " + err);
			res.send({msg:'Database Error. Please try later.'});
		}
		else {
			
			res.send({msg:'You Feedback has been successfully recorded'});
			sendgrid.send({ 
					  to: 'somenath.ghosh84@gmail.com', 
					  from: 'NoReply_TCSCharlottelab@tcs.com', 
					  subject: 'FeedBack', 
					  text:  'From:' + req.body.name + ' and Text : ' + req.body.feedback
			}, function(err, json) { 
					if (err) { 
						console.log("Error with Sending Email to somenath.ghosh84@gmail.com "); 
						console.error(err); 
					} 
					console.log(json); 
			});
			
			
		}
	});
	

});



app.post('/getReservation', function(req, res){
	var obj = {};
	console.log('body: ' + JSON.stringify(req.body));
	User.find({to: {"$gte": req.body.from},from: {"$lte":req.body.to},mc: req.body.mc}).sort({from:1}).exec(function(err,docs){
		if(err) {
			console.log("Error from MongoDB:" + err);
			res.send({msg:'Database Error'});
		}
		if(!docs){
			res.send({msg:'No reservation found'});
		}
		else {
			res.send({msg:'',R: docs });
			
		}
			
			
		
	});
	

});



app.post('/doReservation', function(req, res){
	var obj = {};
	console.log('body: ' + JSON.stringify(req.body));
	
	
	User.findOne({to: {"$gt": req.body.from},from: {"$lt":req.body.to},id: parseInt(req.body.emp)},function(err,docs){
		
		if(err){
			console.log("Error from MongoDB-1:" + err);
			res.send({message:'Database Error'});
			
		}
		if(docs){
			var msg = "You already have mc# " + docs.mc + " booked around same time";
			res.send({message: msg});
			
			
		}
		else {
			
			User.findOne({to: {"$gt":req.body.from},from: {"$lt":req.body.to},mc: parseInt(req.body.mc)},function(err,user){
			if (err) {
				console.log("Error from MongoDB-2" + err);
				res.send({message:'Database Error'});
				
			}
			if(user) {
				
				var msg = "The selected slot is not available";
				res.send({message:msg});
				
			}
			else{

				new User({
							
							id   	: parseInt(req.body.emp),
							name 	: req.body.name,
							from 	: req.body.from,
							to   	: req.body.to,
							reason 	: req.body.reason,
							mc     	: parseInt(req.body.mc),
							resDate : new Date()
							
						}).save(function(err, doc){
							
							if(err) {
								console.log("Error from MongoDB-3:" + err);
								res.send({message:'Database Error'});
							}
								
							else {

								var empID = (req.body.emp).toString();
								htmlBody = "Dear "+ req.body.name+ ",\nYour reservation has been confirmed.\n\n M/C# " + req.body.mc + "\n " + "FROM : " + new Date(req.body.from) + "\n TO : " + new Date(req.body.to) +".";
								htmlBody = htmlBody + "\n\nThanks,\nTCS Charlotte Lab Team.\n\nP.S. This is a system-generated email. Please do not reply."; 
								CLTlab.findOne({employeeID : empID },function(err,docs){
									if(err) {
										console.log("Error from MongoDB: socket reservation CLTLab" + err);
										
									}
									
									if(docs) {
										
							
										
										if (docs.EmailID) {
											
											var args = {
											  data: {"EmailID": docs.EmailID, "EmailText": htmlBody},
											  headers:{"Content-Type": "application/json"} 
											};


											client.put("http://intense-ravine-4499.herokuapp.com/sendEmailforReservation/" + docs.EmailID, args, function(data,response) {
												  // parsed response body as js object
												console.log(data);
												// raw response
												console.log(response.statusCode);
											});
											
										}
									}

										
								});
								
								var msg = "Your reservation is successful at MC: " + req.body.mc;
								res.send({message: msg });

							}
						});
					}
				});
			
			}

		});
	

});



