
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
app.set('view engine', 'ejs');




app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(app.router);
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://heroku:97aa100aa71b190805c41b70bed0e20b@troup.mongohq.com:10097/app22192444');

var Schema = new mongoose.Schema({
	id     : Number,
	name   : String,
	from   : Date,
	to     : Date,
	reason : String,
	mc     : Number
	
});
var User = mongoose.model('reservation',Schema);







app.post('/new',function(req,res){

	
		User.findOne({to: {"$gt":req.body.from},from: {"$lt":req.body.to},mc: 5},function(err,user){
			if (err) console.log(err);
		
			if(user) {
				console.log(user);
				flag=true;
				User.findOne({to: {"$gt":req.body.from},from: {"$lt":req.body.to}, mc: 6},function(err,user){
					if (err) console.log(err);
			
					if(user) {
						console.log(user);
						flag = true;
						User.findOne({to: {"$gt":req.body.from},from: {"$lt":req.body.to},mc: 7},function(err,user){
							if (err) console.log(err);
					
							if(user) {
								console.log(user);
								flag= true;
								User.findOne({to: {"$gt":req.body.from},from: {"$lt":req.body.to},mc: 8},function(err,user){
									if (err) console.log(err);
							
									if(user) {
										console.log(user);
										flag=true;
										User.findOne({to: {"$gt":req.body.from},from: {"$lt":req.body.to},mc: 9},function(err,user){
											if (err) console.log(err);
									
											if(user) {
												console.log(user);
												flag = true;
												User.findOne({to: {"$gt":req.body.from},from: {"$lt":req.body.to},mc: 10},function(err,user){
													if (err) console.log(err);
											
													if(user) {
														console.log(user);
														flag = true;
														User.findOne({to: {"$gt":req.body.from},from: {"$lt":req.body.to},mc:11},function(err,user){
															if (err) console.log(err);
													
															if(user) {
																console.log(user);
																flag = true;
																User.findOne({to: {"$gt":req.body.from},from: {"$lt":req.body.to},mc: 12},function(err,user){
																	if (err) console.log(err);
															
																	if(user) {
																		console.log(user);
																		flag = true;
																		User.findOne({to: {"$gt":req.body.from},from: {"$lt":req.body.to},mc: 13},function(err,user){
																			if (err) console.log(err);
																	
																			if(user) {
																				console.log(user);
																				User.findOne({to: {"$gt":req.body.from},from: {"$lt":req.body.to},mc: 14},function(err,user){
																					if (err) console.log(err);
																			
																					if(user) {
																						console.log(user);
																						res.render("./views/reservationPage",{R:user});
																					}
																					else {
																						
																						flag=false;
																						new User({
																							id   : req.body.empID,
																							name : req.body.name,
																							from : req.body.from,
																							to   : req.body.to,
																							reason : req.body.reason,
																							mc     : 14
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
																			else {
																				
																				flag=false;
																				new User({
																					id   : req.body.empID,
																					name : req.body.name,
																					from : req.body.from,
																					to   : req.body.to,
																					reason : req.body.reason,
																					mc     : 13
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
																	else {
																		
																		flag = false;
																		new User({
																			id   : req.body.empID,
																			name : req.body.name,
																			from : req.body.from,
																			to   : req.body.to,
																			reason : req.body.reason,
																			mc     : 12
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
															else {
																
																flag= false;
																new User({
																	id   : req.body.empID,
																	name : req.body.name,
																	from : req.body.from,
																	to   : req.body.to,
																	reason : req.body.reason,
																	mc     : 11
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
													else {
														
														flag = false;
														new User({
															id   : req.body.empID,
															name : req.body.name,
															from : req.body.from,
															to   : req.body.to,
															reason : req.body.reason,
															mc     : 10
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
											else {
												
												flag = false;
												new User({
													id   : req.body.empID,
													name : req.body.name,
													from : req.body.from,
													to   : req.body.to,
													reason : req.body.reason,
													mc     : 9
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
									else {
										
										flag = false;
										new User({
											id   : req.body.empID,
											name : req.body.name,
											from : req.body.from,
											to   : req.body.to,
											reason : req.body.reason,
											mc     : 8
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
							else {
								
								flag = false;
								new User({
									id   : req.body.empID,
									name : req.body.name,
									from : req.body.from,
									to   : req.body.to,
									reason : req.body.reason,
									mc     : 7
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
						
					else {
						
						flag = false;
						new User({
							id   : req.body.empID,
							name : req.body.name,
							from : req.body.from,
							to   : req.body.to,
							reason : req.body.reason,
							mc     : 6
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
			else {
					
				flag = false;
				new User({
					id   : req.body.empID,
					name : req.body.name,
					from : req.body.from,
					to   : req.body.to,
					reason : req.body.reason,
					mc     : 5
				}).save(function(err, doc){
					if(err) {
					console.log(err);
						res.end("There is some system error");
					}
						else res.render("./views/index",{R: doc});
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
	


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
