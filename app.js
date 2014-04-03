
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

app.use(express.cookieParser());
app.use(express.session({secret: '8hdfv89823rnbvd09032eu233nvdfv'}));

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




app.get('/about',function(req,res){
	
	res.render('./views/about') ;
});


app.post('/feedback', function(req, res){
	var obj = {};
	//console.log('body: ' + JSON.stringify(req.body));
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
	//console.log('body: ' + JSON.stringify(req.body));
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
	//console.log('body: ' + JSON.stringify(req.body));
	
	
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



app.post('/DelReservation', function(req, res){
	var obj = {};
	
	if(req.session.empID){
		User.findOne({to: req.body.to,from: req.body.from, id: req.session.empID},function(err,doc){
			if(err) {
				console.log("Error from MongoDB:" + err);
				res.send({msg:'Database Error'});
			}
			
			if(doc) {
			
				User.remove({to: req.body.to,from: req.body.from, id: req.session.empID},function(err){
					if(err) {
						console.log("Error from MongoDB:" + err);
						res.send({msg:'Database Error'});
					}
					
					else {
						res.send({msg:''});
						
					}
						
						
					
				});
			}
			
			if(!doc){
				res.send({msg:'NoUser'});
			}
		});
		
	}
	else{
		//console.log(req.session);
		res.send({msg:'NoUser'});
	}

});



app.post('/LoginReservation', function(req, res){
	
	var empID = (req.body.emp).toString();
	
	//console.log(req.body.pass);
	//console.log(req.body.emp);
	
	CLTlab.findOne({employeeID : empID, password: req.body.pass},function(err,doc){
		if(err) {
		
			console.log("Error from MongoDB:" + err);
			res.send({msg:'Database Error'});
		}
		
		if(doc){
			req.session.empID = req.body.emp;
			//console.log(doc.employeeID);
			res.send({msg:' ', emp:empID, name:doc.FullName});
		}
		if(!doc) {
			res.send({msg:'Wrong'});
			
		}
			
			
		
	});
	

});


app.post('/LogoutReservation', function(req, res){
	
	//console.log('In Logout');
	req.session.destroy();
	res.send({msg:'LogOut'});

});



