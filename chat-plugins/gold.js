const MAX_REASON_LENGTH = 300;
var fs = require('fs');
var request = require('request');
var moment = require('moment');
var closeShop = false;
var closedShop = 0;
if (typeof Gold === 'undefined') global.Gold = {};
if (typeof Gold.tells === 'undefined') global.Gold.tells = {};
var crypto = require('crypto');
var inShop = ['symbol', 'custom', 'animated', 'trainer', 'fix', 'declare', 'musicbox', 'emote', 'color'];
var ipbans = fs.createWriteStream('config/ipbans.txt', {
	'flags': 'a'
});
var badges = fs.createWriteStream('badges.txt', {
	'flags': 'a'
});
exports.commands = {
	
	restart: function(target, room, user) {
		if (!this.can('lockdown')) return false;
		try {
			var forever = require('forever');
		} catch (e) {
			return this.sendReply("/restart requires the \"forever\" module.");
		}
		if (!Rooms.global.lockdown) {
			return this.sendReply("For safety reasons, /restart can only be used during lockdown.");
		}
		if (CommandParser.updateServerLock) {
			return this.sendReply("Wait for /updateserver to finish before using /restart.");
		}
		this.logModCommand(user.name + ' used /restart');
		Rooms.global.send('|refresh|');
		forever.restart('app.js');
	},
	goldroomauth: "gra",
	gra: function(target, room, user, connection) {
		if (!room.auth) return this.sendReply("/goldroomauth - This room isn't designed for per-room moderation and therefore has no auth list.");
		var buffer = [];
		var owners = [];
		var admins = [];
		var leaders = [];
		var mods = [];
		var drivers = [];
		var voices = [];
		room.owners = '';
		room.admins = '';
		room.leaders = '';
		room.mods = '';
		room.drivers = '';
		room.voices = '';
		for (var u in room.auth) {
			if (room.auth[u] == '#') {
				room.owners = room.owners + u + ',';
			}
			if (room.auth[u] == '~') {
				room.admins = room.admins + u + ',';
			}
			if (room.auth[u] == '&') {
				room.leaders = room.leaders + u + ',';
			}
			if (room.auth[u] == '@') {
				room.mods = room.mods + u + ',';
			}
			if (room.auth[u] == '%') {
				room.drivers = room.drivers + u + ',';
			}
			if (room.auth[u] == '+') {
				room.voices = room.voices + u + ',';
			}
		}
		if (!room.founder) founder = '';
		if (room.founder) founder = room.founder;
		room.owners = room.owners.split(',');
		room.mods = room.mods.split(',');
		room.drivers = room.drivers.split(',');
		room.voices = room.voices.split(',');
		room.leaders = room.leaders.split(',');
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
		for (var u in room.leaders) {
			if (room.leaders[u] != '') leaders.push(room.leaders[u]);
		}
		if (owners.length > 0) {
			owners = owners.join(', ');
		}
		if (mods.length > 0) {
			mods = mods.join(', ');
		}
		if (leaders.length > 0) {
			leaders = leaders.join(', ');
		}
		if (drivers.length > 0) {
			drivers = drivers.join(', ');
		}
		if (voices.length > 0) {
			voices = voices.join(', ');
		}
		connection.popup('Room Auth in "' + room.title + '"\n\n**Founder**:\n' + founder + '\n**Owner(s)**:\n' + owners + '\n**Leaders(s)**:\n' + leaders + '\n**Moderator(s)**:\n' + mods + '\n**Driver(s)**: \n' + drivers + '\n**Voice(s)**: \n' + voices);
	},
	goldauthlist: 'gal',
	gal: function(target, room, user, connection) {
		fs.readFile('config/usergroups.csv', 'utf8', function(err, data) {
			var staff = {
				"admins": [],
				"leaders": [],
				"mods": [],
				"drivers": [],
				"voices": []
			};
			var row = ('' + data).split('\n');
			for (var i = row.length; i > -1; i--) {
				if (!row[i]) continue;
				var rank = row[i].split(',')[1].replace("\r", '');
				var person = row[i].split(',')[0];
				switch (rank) {
					case '~':
						staff['admins'].push(person);
						break;
					case '&':
						staff['leaders'].push(person);
						break;
					case '@':
						staff['mods'].push(person);
						break;
					case '%':
						staff['drivers'].push(person);
						break;
					case '+':
						staff['voices'].push(person);
						break;
					default:
						continue;
				}
			}
			connection.popup('Staff List \n\n**Administrator**:\n' + staff['admins'].join(', ') +
				'\n**Leaders**:\n' + staff['leaders'].join(', ') +
				'\n**Moderators**:\n' + staff['mods'].join(', ') +
				'\n**Drivers**:\n' + staff['drivers'].join(', ') +
				'\n**Voices**:\n' + staff['voices'].join(', ')
			);
		});
	},
	roomfounder: function(target, room, user) {
		if (!room.chatRoomData) {
			return this.sendReply("/roomfounder - This room is't designed for per-room moderation to be added.");
		}
		target = this.splitTarget(target, true);
		var targetUser = this.targetUser;
		if (!targetUser) return this.sendReply("User '" + this.targetUsername + "' is not online.");
		if (!this.can('pban')) return false;
		if (!room.auth) room.auth = room.chatRoomData.auth = {};
		var name = targetUser.name;
		room.auth[targetUser.userid] = '#';
		room.founder = targetUser.userid;
		this.addModCommand(name + " was appointed to Room Founder by " + user.name + ".");
		room.onUpdateIdentity(targetUser);
		room.chatRoomData.founder = room.founder;
		Rooms.global.writeChatRoomData();
	},
	tell: function(target, room, user) {
		if (!this.canTalk()) return;
		if (!target) return this.parse("/help tell");
		var commaIndex = target.indexOf(',');
		if (commaIndex < 0) return this.sendReply("You forgot the comma.");
		var targetUser = toId(target.slice(0, commaIndex));
		var message = target.slice(commaIndex + 1).trim();
		if (message.replace(/(<([^>]+)>)/ig, "").length > 600) return this.sendReply("Tells must be 600 or fewer characters, excluding HTML.");
		message = htmlfix(message);
		if (targetUser.length > 18) {
			return this.sendReply('The name of user "' + targetUser + '" is too long.');
		}
		if (!Gold.tells[targetUser]) Gold.tells[targetUser] = [];
		if (Gold.tells[targetUser].length === 8) return this.sendReply("User " + targetUser + " has too many tells queued.");
		var date = moment().format('MMMM Do YYYY, h:mm a');
		var datelbl = date.substr(-2).toUpperCase(); //AM or PM
		var messageToSend = '|raw|<u>' + date.substring(0, date.length - 2) + datelbl + "</u><br/ > <b>" + user.group + "<font color=" + Gold.hashColor(toId(user.name)) + ">" + user.name + "</b> said: " + Tools.escapeHTML(message);
		Gold.tells[targetUser].add(messageToSend);
		return this.sendReply('Message "' + message + '" sent to ' + targetUser + '.');
	},
	hide: 'hideauth',
	hideauth: function(target, room, user) {
		if (!user.can('lock')) return this.sendReply("/hideauth - access denied.");
		var tar = ' ';
		if (target) {
			target = target.trim();
			if (Config.groupsranking.indexOf(target) > -1 && target != '#') {
				if (Config.groupsranking.indexOf(target) <= Config.groupsranking.indexOf(user.group)) {
					tar = target;
				} else {
					this.sendReply('The group symbol you have tried to use is of a higher authority than you have access to. Defaulting to \' \' instead.');
				}
			} else {
				this.sendReply('You have tried to use an invalid character as your auth symbol. Defaulting to \' \' instead.');
			}
		}
		user.getIdentity = function (roomid) {
			if (this.locked) {
				return '‽' + this.name;
			}
			if (roomid) {
				var room = Rooms.rooms[roomid];
				if (room.isMuted(this)) {
					return '!' + this.name;
				}
				if (room && room.auth) {
					if (room.auth[this.userid]) {
						return room.auth[this.userid] + this.name;
					}
					if (room.isPrivate === true) return ' ' + this.name;
				}
			}
			return tar + this.name;
		}
		user.updateIdentity();
		this.sendReply('You are now hiding your auth symbol as \'' + tar + '\'.');
		this.logModCommand(user.name + ' is hiding auth symbol as \'' + tar + '\'');
	},
	show: 'showauth',
	showauth: function(target, room, user) {
		if (!user.can('lock')) return this.sendReply("/showauth - access denied.");
		delete user.getIdentity;
		user.updateIdentity();
		this.sendReply("You have now revealed your auth symbol.");
		return this.logModCommand(user.name + " has revealed their auth symbol.");
		this.sendReply("Your symbol has been reset.");
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
			return this.sendReply('User ' + this.targetUsername + ' not found.');
		}
		if (Users.checkBanned(targetUser.latestIp) && !target && !targetUser.connected) {
			var problem = " but was already banned";
			return this.privateModCommand('(' + targetUser.name + " would be banned by " + user.name + problem + '.) (' + targetUser.latestIp + ')');
		}
		targetUser.popup(user.name + " has permanently banned you.");
		this.addModCommand(targetUser.name + " was permanently banned by " + user.name + ".");
		this.add('|unlink|hide|' + this.getLastIdOf(targetUser));
		targetUser.ban();
		ipbans.write('\n' + targetUser.latestIp);
	},
	clearall: 'clearroom',
	clearroom: function (target, room, user) {
		if (!this.can('hotpatch')) return false;
		if (room.battle) return this.sendReply("You cannot clearall in battle rooms.");

		var len = room.log.length;
		var users = [];
		while (len--) {
			room.log[len] = '';
		}
		for (var u in room.users) {
			users.push(u);
			Users.get(u).leaveRoom(room, Users.get(u).connections[0]);
		}
		len = users.length;
		setTimeout(function () {
			while (len--) {
				Users.get(users[len]).joinRoom(room, Users.get(users[len]).connections[0]);
			}
		}, 1000);
	},
	tpolltest: 'tierpoll',
	tpoll: 'tierpoll',
	tierpoll: function(room, user, cmd) {
		return this.parse('/poll Next Tournament Tier:, other, ru, tier shift, [Gen 5] OU, [Gen 5] Smogon Doubles, random doubles, random triples, custom, reg1v1, lc, nu, cap, cc, mono, doubles, balanced hackmons, hackmons, ubers, random battle, ou, bc1v1, uu, anything goes, seasonal, inverse, Gold Battle, monotype random battle');
	},
	hc: function(room, user, cmd) {
		return this.parse('/hotpatch chat');
	},
	cc1v1: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox(
			'<center><button name="send" value="/challenge ponybot, challengecup1vs1" class="blackbutton" title="Challenge Cup 1vs1 Battle!"><font size="white">Click here for a CC1vs1 battle!'
		);
	},
	pbl: 'pbanlist',
	permabanlist: 'pbanlist',
	pbanlist: function(target, room, user, connection) {
		if (!this.canBroadcast() || !user.can('lock')) return this.sendReply('/pbanlist - Access Denied.');
		var pban = fs.readFileSync('config/pbanlist.txt', 'utf8');
		return user.send('|popup|' + pban);
	},
	vault: function(target, room, user, connection) {
		var money = fs.readFileSync('config/money.csv', 'utf8');
		return user.send('|popup|' + money);
	},
	bitch: 'complain',
	report: 'complain',
	complain: function(target, room, user) {
		if (!target) return this.sendReply('/report [report] - Use this command to report other users.');
		var html = ['<img ', '<a href', '<font ', '<marquee', '<blink', '<center'];
		for (var x in html) {
			if (target.indexOf(html[x]) > -1) return this.sendReply('HTML is not supported in this command.');
		}
		if (target.length > 350) return this.sendReply('This report is too long; it cannot exceed 350 characters.');
		if (!this.canTalk()) return;
		Rooms.rooms.staff.add(user.userid + ' (in ' + room.id + ') has reported: ' + target + '');
		this.sendReply('Your report "' + target + '" has been reported.');
		for (var u in Users.users)
			if ((Users.users[u].group == "~" || Users.users[u].group == "&" || Users.users[u].group == "@" || Users.users[u].group == "%") && Users.users[u].connected)
				Users.users[u].send('|pm|~Server|' + Users.users[u].getIdentity() + '|' + user.userid + ' (in ' + room.id + ') has reported: ' + target + '');
	},
	newroom: 'newroomquestions',
	newroomcommands: 'newroomquestions',
	newroomfaq: 'newroomquestions',
	newroomquestions: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('For our NEW room request system, fill out our application found <a href="http://goo.gl/forms/YHZVb6BvTb">here</a>.');
	},
	newroom2: function(target, room, user) {
		user.popup('|html|<script>this.add("hi")')
		function test1() {
			console.log('functions work?');
		}
	},
	punt: function(target, room, user) {
		if (!target) return this.sendReply('/punt needs a target.');
		return this.parse('/me punts ' + target + ' to the moon!');
	},
	crai: 'cry',
	cry: function(target, room, user) {
		return this.parse('/me starts tearbending dramatically like Katara~!');
	},
	dk: 'dropkick',
	dropkick: function(target, room, user) {
		if (!target) return this.sendReply('/dropkick needs a target.');
		return this.parse('/me dropkicks ' + target + ' across the Pokemon Stadium!');
	},
	fart: function(target, room, user) {
		if (!target) return this.sendReply('/fart needs a target.');
		return this.parse('/me farts on ' + target + '\'s face!');
	},
	poke: function(target, room, user) {
		if (!target) return this.sendReply('/poke needs a target.');
		return this.parse('/me pokes ' + target + '.');
	},
	pet: function(target, room, user) {
		if (!target) return this.sendReply('/pet needs a target.');
		return this.parse('/me pets ' + target + ' lavishly.');
	},
	setmotd: 'motd',
	motd: function(target, room, user) {
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
		motd = setInterval(function() {
			Rooms.rooms.lobby.add('|raw|<div class = "infobox"><b>Message of the Day:</b><br />' + message)
		}, time * 60 * 1000);
		isMotd = true;
		this.logModCommand(user.name + ' set the message of the day to: ' + message + ' for every ' + time + ' minutes.');
		return this.sendReply('The message of the day was set to "' + message + '" and it will be displayed every ' + time + ' minutes.');
	},
	clearmotd: 'cmotd',
	cmotd: function(target, room, user) {
		if (!this.can('pban')) return false;
		if (isMotd == false) {
			return this.sendReply('There is no motd right now.');
		}
		clearInterval(motd);
		this.logModCommand(user.name + ' cleared the message of the day.');
		return this.sendReply('You cleared the message of the day.');
	},
	/*
	newroom: function(target, room, user) {
		if (!target) return this.sendReply('/newroom [answers to /newroomquestions] - Requests a new chat room to be be created.');
		var html = ['<img ', '<a href', '<font ', '<marquee', '<blink', '<center'];
		for (var x in html) {
			if (target.indexOf(html[x]) > -1) return this.sendReply('HTML is not supported in this command.');
		}
		if (target.length > 550) return this.sendReply('This new room suggestion is too long; it cannot exceed 550 characters.');
		if (target.length < 20) return this.sendReply('This room suggestion is rather small; are you sure that you answered all of the questions from /newroomquestions?');
		if (!this.canTalk()) return;
		Rooms.rooms.staff.add('|html|<font size="4"><b>New Room Suggestion Submitted!</b></font><br><b>Suggested by:</b> ' + user.userid + '<br><b>Suggestion</b> <i>(see /newroomquestions)</i>:<br> ' + target + '');
		Rooms.rooms.room.add('|html|<font size="4"><b>New Room Suggestion Submitted!</b></font><br><b>Suggested by:</b> ' + user.userid + '<br><b>Suggestion</b> <i>(see /newroomquestions)</i>:<br> ' + target + '');
		this.sendReply('Thanks, your new room suggestion has been sent.  We\'ll review your feedback soon and get back to you. ("' + target + '")');
		for (var u in Users.users) {
			if (Users.users[u].isStaff) {
				Users.users[u].send('|pm|~Staff PM|' + Users.users[u].group + Users.users[u].name + '|Attention: "' + user.userid + '" has submitted a **new room suggestion**. Please see staff room.');
			}
		}
	},
	roomreply: function(target, room, user) {
		if (!target) return this.sendReply('/roomreply [user] - Denies a user of their recent room request.');
		if (!this.can('pban')) return false;
		target = this.splitTarget(target);
		targetUser = this.targetUser;
		if (!targetUser) {
			return this.sendReply('The user ' + this.targetUsername + ' is not online.');
		}
		Rooms.rooms.staff.add('|html|<b>' + targetUser + '</b>\'s room request has been <font color="red">denied</font> by ' + user.userid + '.');
		Rooms.rooms.room.add('|html|<b>' + targetUser + '</b>\'s room request has been <font color="red">denied</font> by ' + user.userid + '.');
		targetUser.send('|pm|~Room Request|' + targetUser + '|Hello, "' + targetUser + '".  Sorry, your recent room request has been denied by the staff.  However, you may submit another application to request a new room at any time. The reason why your room was denied was because we didn\'t see a point for it on the server.  Best of luck.  Regards, Gold Staff.');
	},
	*/
	pic: 'image',
	image: function(target, room, user) {
		if (!target) return this.sendReply('/image [url] - Shows an image using /a. Requires ~.');
		return this.parse('/a |raw|<center><img src="' + target + '">');
	},
	dk: 'dropkick',
	dropkick: function(target, room, user) {
		if (!target) return this.sendReply('/dropkick needs a target.');
		return this.parse('/me dropkicks ' + target + ' across the PokÃƒÂ©mon Stadium!');
	},
	givesymbol: 'gs',
	gs: function(target, room, user) {
		if (!target) return this.sendReply('/givesymbol [user] - Gives permission for this user to set a custom symbol.');
		return this.parse('/gi ' + target + ', symbol');
	},
	halloween: function(target, room, user) {
		if (!target) return this.sendReply('/halloween needs a target.');
		return this.parse('/me takes ' + target + '`s pumpkin and smashes it all over the PokÃƒÂ©mon Stadium!');
	},
	barn: function(target, room, user) {
		if (!target) return this.sendReply('/barn needs a target.');
		return this.parse('/me has barned ' + target + ' from the entire server!');
	},
	lick: function(target, room, user) {
		if (!target) return this.sendReply('/lick needs a target.');
		return this.parse('/me licks ' + target + ' excessively!');
	},
	def: 'define',
	define: function(target, room, user) {
		if (!target) return this.sendReply('Usage: /define <word>');
		target = toId(target);
		if (target > 50) return this.sendReply('/define <word> - word can not be longer than 50 characters.');
		if (!this.canBroadcast()) return;
		var options = {
		    url: 'http://api.wordnik.com:80/v4/word.json/'+target+'/definitions?limit=3&sourceDictionaries=all' +
		    '&useCanonical=false&includeTags=false&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5',
		};
		var self = this;
		function callback(error, response, body) {
		    if (!error && response.statusCode == 200) {
		        var page = JSON.parse(body);
		        var output = '<font color=#24678d><b>Definitions for ' + target + ':</b></font><br />';
		        if (!page[0]) {
		        	self.sendReplyBox('No results for <b>"' + target + '"</b>.');
		        	return room.update();
		        } else {
		        	var count = 1;
		        	for (var u in page) {
		        		if (count > 3) break;
		        		output += '(<b>'+count+'</b>) ' + Tools.escapeHTML(page[u]['text']) + '<br />';
		        		count++;
		        	}
		        	self.sendReplyBox(output);
		        	return room.update();
		        }
		    }
		}
		request(options, callback);
	},
	u: 'urbandefine',
    ud: 'urbandefine',
    urbandefine: function(target, room, user) {
    	if (!this.canBroadcast()) return;
    	if (!target) return this.parse('/help urbandefine');
    	if (target > 50) return this.sendReply('Phrase can not be longer than 50 characters.');
    	var self = this;
    	var options = {
    		url: 'http://www.urbandictionary.com/iphone/search/define',
    		term: target,
    		headers: {
    			'Referer': 'http://m.urbandictionary.com'
    		},
    		qs: {
    			'term': target
    		}
    	};
    	function callback(error, response, body) {
    		if (!error && response.statusCode == 200) {
    			var page = JSON.parse(body);
    			var definitions = page['list'];
    			if (page['result_type'] == 'no_results') {
    				self.sendReplyBox('No results for <b>"' + Tools.escapeHTML(target) + '"</b>.');
    				return room.update();
    			} else {
    				if (!definitions[0]['word'] || !definitions[0]['definition']) {
    					self.sendReplyBox('No results for <b>"' + Tools.escapeHTML(target) + '"</b>.');
    					return room.update();
    				}
    				var output = '<b>' + Tools.escapeHTML(definitions[0]['word']) + ':</b> ' + Tools.escapeHTML(definitions[0]['definition']).replace(/\r\n/g, '<br />').replace(/\n/g, ' ');
    				if (output.length > 400) output = output.slice(0, 400) + '...';
    				self.sendReplyBox(output);
    				return room.update();
    			}
    		}
    	}
    	request(options, callback);
    },
	gethex: 'hex',
	hex: function(target, room, user) {
		if (!this.canBroadcast()) return;
		if (!this.canTalk()) return;
		if (!target) target = toId(user.name);
		return this.sendReplyBox('<b><font color="' + Gold.hashColor('' + toId(target) + '') + '">' + target + '</font></b>.  The hexcode for this name color is: ' + Gold.hashColor('' + toId(target) + '') + '.');
	},
	rsi: 'roomshowimage',
	roomshowimage: function(target, room, user) {
		if (!this.can('ban', null, room)) return false;
		if (!target) return this.sendReply("git gud");
		var parts = target.split(',');
		if (!this.canBroadcast()) return;
		this.sendReplyBox("<img src=" + parts[0] + " width=" + parts[1] + " height=" + parts[1]);
	},
	pr: 'pollremind',
	pollremind: function(target, room, user) {
		var separacion = "&nbsp;&nbsp;";
		if (!room.question) return this.sendReply('There is currently no poll going on.');
		if ((user.locked) && !user.can('bypassall')) return this.sendReply("You cannot do this while unable to talk.");
		if (!this.canBroadcast()) return;
		var output = '';
		for (var u in room.answerList) {
			if (!room.answerList[u] || room.answerList[u].length < 1) continue;
			output += '<button name="send" value="/vote ' + room.answerList[u] + '">' + Tools.escapeHTML(room.answerList[u]) + '</button>&nbsp;';
		}
		this.sendReply('|raw|<div class="infobox"><h2>' + Tools.escapeHTML(room.question) + separacion + '<font font size=1 color = "#939393"><small>/vote OPTION</small></font></h2><hr />' + separacion + separacion + output + '</div>');
	},
	votes: function(target, room, user) {
		if (!room.answers) room.answers = new Object();
		if (!room.question) return this.sendReply('There is no poll currently going on in this room.');
		if (!this.canBroadcast()) return;
		this.sendReply('NUMBER OF VOTES: ' + Object.keys(room.answers).length);
	},
	tpolltest: 'tierpoll',
	tpoll: 'tierpoll',
	tierpoll: function(room, user, cmd) {
		return this.parse('/poll Next Tournament Tier:, other, ru, tier shift, [Gen 5] OU, [Gen 5] Ubers, [Gen 5] UU, [Gen 5] RU, [Gen 5] NU, [Gen 5] LC, [Gen 5] Smogon Doubles, [Gen 4] OU, [Gen 4] Ubers, [Gen 4] UU, [Gen 4] LC, random doubles, random triples, custom, reg1v1, lc, nu, cap, bc, monotype, doubles, balanced hackmons, hackmons, ubers, random battle, ou, cc1v1, uu, anything goes, gold battle');
	},
	survey: 'poll',
	poll: function(target, room, user) {
		if (!user.can('broadcast', null, room)) return this.sendReply('You do not have enough authority to use this command.');
		if (!this.canTalk()) return this.sendReply('You currently can not speak in this room.');
		if (room.question) return this.sendReply('There is currently a poll going on already.');
		if (!target) return false;
		if (target.length > 500) return this.sendReply('Polls can not be this long.');
		var separacion = "&nbsp;&nbsp;";
		var answers = target.split(',');
		var formats = [];
		for (var u in Tools.data.Formats) {
			if (Tools.data.Formats[u].name && Tools.data.Formats[u].challengeShow && Tools.data.Formats[u].mod != 'gen4' && Tools.data.Formats[u].mod != 'gen3' && Tools.data.Formats[u].mod != 'gen3' && Tools.data.Formats[u].mod != 'gen2' && Tools.data.Formats[u].mod != 'gen1') formats.push(Tools.data.Formats[u].name);
		}
		formats = 'Tournament,' + formats.join(',');
		if (answers[0] == 'tournament' || answers[0] == 'tour') answers = splint(formats);
		if (answers.length < 3) return this.sendReply('Correct syntax for this command is /poll question, option, option...');
		var question = answers[0];
		question = Tools.escapeHTML(question);
		answers.splice(0, 1);
		answers = answers.join(',').toLowerCase().split(',');
		room.question = question;
		room.answerList = answers;
		room.usergroup = Config.groupsranking.indexOf(user.group);
		var output = '';
		for (var u in room.answerList) {
			if (!room.answerList[u] || room.answerList[u].length < 1) continue;
			output += '<button name="send" value="/vote ' + room.answerList[u] + '">' + Tools.escapeHTML(room.answerList[u]) + '</button>&nbsp;';
		}
		this.add('|raw|<div class="infobox"><h2>' + room.question + separacion + '<font size=2 color = "#939393"><small>/vote OPTION<br /><i><font size=1>Poll started by ' + user.name + '</font size></i></small></font></h2><hr />' + separacion + separacion + output + '</div>');
	},
	vote: function(target, room, user) {
		var ips = JSON.stringify(user.ips);
		if (!room.question) return this.sendReply('There is no poll currently going on in this room.');
		if (!target) return this.parse('/help vote');
		if (room.answerList.indexOf(target.toLowerCase()) == -1) return this.sendReply('\'' + target + '\' is not an option for the current poll.');
		if (!room.answers) room.answers = new Object();
		room.answers[ips] = target.toLowerCase();
		return this.sendReply('You are now voting for ' + target + '.');
	},
	ep: 'endpoll',
	endpoll: function(target, room, user) {
		if (!user.can('broadcast', null, room)) return this.sendReply('You do not have enough authority to use this command.');
		if ((user.locked) && !user.can('bypassall')) return this.sendReply("You cannot do this while unable to talk.");
		if (!room.question) return this.sendReply('There is no poll to end in this room.');
		if (!room.answers) room.answers = new Object();
		var votes = Object.keys(room.answers).length;
		if (votes == 0) {
			room.question = undefined;
			room.answerList = new Array();
			room.answers = new Object();
			return this.add("|raw|<h3>The poll was canceled because of lack of voters.</h3>");
		}
		var options = new Object();
		var obj = Rooms.get(room);
		for (var i in obj.answerList) options[obj.answerList[i]] = 0;
		for (var i in obj.answers) options[obj.answers[i]] ++;
		var sortable = new Array();
		for (var i in options) sortable.push([i, options[i]]);
		sortable.sort(function(a, b) {
			return a[1] - b[1];
		});
		var html = "";
		for (var i = sortable.length - 1; i > -1; i--) {
			var option = sortable[i][0];
			var value = sortable[i][1];
			if (value > 0) html += "&bull; " + Tools.escapeHTML(option) + " - " + Math.floor(value / votes * 100) + "% (" + value + ")<br />";
		}
		this.add('|raw|<div class="infobox"><h2>Results to "' + Tools.escapeHTML(obj.question) + '"<br /><i><font size=1 color = "#939393">Poll ended by ' + Tools.escapeHTML(user.name) + '</font></i></h2><hr />' + html + '</div>');
		room.question = undefined;
		room.answerList = new Array();
		room.answers = new Object();
	},
	uor: 'usersofrank',
	usersofrank: function(target, room, user) {
		if (!target || !Config.groups[target]) return false;
		if (!this.canBroadcast()) return;
		var names = [];
		for (var i in Users.users) {
			if (!Users.users[i].connected) continue;
			if (Users.users[i].group === target) {
				names.push(Users.users[i].name);
			}
		}
		if (names.length < 1) return this.sendReplyBox('There are no users of the rank <font color="#24678d"><b>' + Tools.escapeHTML(Config.groups[target].name) + '</b></font> currently online.');
		return this.sendReplyBox('There ' + (names.length === 1 ? 'is' : 'are') + ' <font color="#24678d"><b>' + names.length + '</b></font> ' + (names.length === 1 ? 'user' : 'users') + ' with the rank <font color="#24678d"><b>' + Config.groups[target].name + '</b></font> currently online.<br />' + names.join(', '));
	},
	away: 'afk',
	busy: 'afk',
	sleep: 'afk',
	asleep: 'afk',
	eating: 'afk',
	gaming: 'afk',
	sleeping: 'afk',
	afk: function(target, room, user, connection, cmd) {
		if (!this.canTalk()) return;
		if (user.name.length > 18) return this.sendReply('Your username exceeds the length limit.');
		if (!user.isAway) {
			user.originalName = user.name;
			switch (cmd) {
			    case 'asleep':
                case 'sleepting':
				case 'sleep':
					awayName = user.name + ' - Ⓢⓛⓔⓔⓟ';
					break;
				case 'gaming':
					awayName = user.name + ' - ⒼⒶⓂⒾⓃⒼ';
					break;
				case 'busy':
					awayName = user.name + ' - Ⓑⓤⓢⓨ';
					break;
				case 'eating':
					awayName = user.name + ' - Ⓔⓐⓣⓘⓝⓖ';
					break;
				case 'afk':
					awayName = user.name + ' - ⒶⒻⓀ';
					break;
				default:
					awayName = user.name + ' - Ⓐⓦⓐⓨ';
			}
			//delete the user object with the new name in case it exists - if it does it can cause issues with forceRename
			delete Users.get(awayName);
			user.forceRename(awayName, undefined, true);
			user.isAway = true;
			if (!(!this.can('broadcast'))) {
				var color = Gold.hashColor('' + toId(user.originalName) + '');
				if (cmd === 'sleep') cmd = 'sleeping';
				if (cmd === 'eat') cmd = 'eating';
				this.add('|raw|<b>--</b> <button class="astext" name="parseCommand" value="/user ' + user.name + '" target="_blank"><b><font color="' + color + '">' + user.originalName + '</font></b></button> is now ' + cmd + '. ' + (target ? " (" + Tools.escapeHTML(target) + ")" : ""));
			}
		} else {
			return this.sendReply('You are already set as away, type /back if you are now back.');
		}
	},
	back: function(target, room, user, connection) {
		if (!this.canTalk()) return;
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
			user.isAway = false;
			if (!(!this.can('broadcast'))) {
				var color = Gold.hashColor('' + toId(user.name) + '');
				this.add('|raw|<b>--</b> <button class="astext" name="parseCommand" value="/user ' + user.name + '" target="_blank"><b><font color="' + color + '">' + newName + '</font></b></button> is no longer away.');
				user.originalName = '';
			}
		} else {
			return this.sendReply('You are not set as away.');
		}
		user.updateIdentity();
	},
	gdeclarered: 'gdeclare',
	gdeclaregreen: 'gdeclare',
	gdeclare: function(target, room, user, connection, cmd) {
		if (!target) return this.parse('/help gdeclare');
		if (!this.can('lockdown')) return false;
		var roomName = (room.isPrivate) ? 'a private room' : room.id;
		if (cmd === 'gdeclare') {
			for (var id in Rooms.rooms) {
				if (id !== 'global') Rooms.rooms[id].addRaw('<div class="broadcast-blue"><b><font size=1><i>Global declare from ' + roomName + '<br /></i></font size>' + target + '</b></div>');
			}
		}
		if (cmd === 'gdeclarered') {
			for (var id in Rooms.rooms) {
				if (id !== 'global') Rooms.rooms[id].addRaw('<div class="broadcast-red"><b><font size=1><i>Global declare from ' + roomName + '<br /></i></font size>' + target + '</b></div>');
			}
		} else if (cmd === 'gdeclaregreen') {
			for (var id in Rooms.rooms) {
				if (id !== 'global') Rooms.rooms[id].addRaw('<div class="broadcast-green"><b><font size=1><i>Global declare from ' + roomName + '<br /></i></font size>' + target + '</b></div>');
			}
		}
		f
		this.logEntry(user.name + ' used /gdeclare');
	},
	gdeclarered: 'gdeclare',
	gdeclaregreen: 'gdeclare',
	gdeclare: function(target, room, user, connection, cmd) {
		if (!target) return this.parse('/help gdeclare');
		if (!this.can('lockdown')) return false;
		var roomName = (room.isPrivate) ? 'a private room' : room.id;
		if (cmd === 'gdeclare') {
			for (var id in Rooms.rooms) {
				if (id !== 'global') Rooms.rooms[id].addRaw('<div class="broadcast-blue"><b><font size=1><i>Global declare from ' + roomName + '<br /></i></font size>' + target + '</b></div>');
			}
		}
		if (cmd === 'gdeclarered') {
			for (var id in Rooms.rooms) {
				if (id !== 'global') Rooms.rooms[id].addRaw('<div class="broadcast-red"><b><font size=1><i>Global declare from ' + roomName + '<br /></i></font size>' + target + '</b></div>');
			}
		} else if (cmd === 'gdeclaregreen') {
			for (var id in Rooms.rooms) {
				if (id !== 'global') Rooms.rooms[id].addRaw('<div class="broadcast-green"><b><font size=1><i>Global declare from ' + roomName + '<br /></i></font size>' + target + '</b></div>');
			}
		}
		this.logModCommand(user.name + ' globally declared ' + target);
	},
	declaregreen: 'declarered',
	declarered: function(target, room, user, connection, cmd) {
		if (!target) return this.parse('/help declare');
		if (!this.can('declare', null, room)) return false;
		if (!this.canTalk()) return;
		if (cmd === 'declarered') {
			this.add('|raw|<div class="broadcast-red"><b>' + target + '</b></div>');
		} else if (cmd === 'declaregreen') {
			this.add('|raw|<div class="broadcast-green"><b>' + target + '</b></div>');
		}
		this.logModCommand(user.name + ' declared ' + target);
	},
	golddeclare: function(target, room, user, connection, cmd) {
		if (!target) return this.parse('/help declare');
		if (!this.can('declare', null, room)) return false;
		if (!this.canTalk()) return;
		this.add('|raw|<div class="broadcast-gold"><b>' + target + '</b></div>');
		this.logModCommand(user.name + ' declared ' + target);
	},
	pdeclare: function(target, room, user, connection, cmd) {
		if (!target) return this.parse('/help declare');
		if (!this.can('declare', null, room)) return false;
		if (!this.canTalk()) return;
		if (cmd === 'pdeclare') {
			this.add('|raw|<div class="broadcast-purple"><b>' + target + '</b></div>');
		} else if (cmd === 'pdeclare') {
			this.add('|raw|<div class="broadcast-purple"><b>' + target + '</b></div>');
		}
		this.logModCommand(user.name + ' declared ' + target);
	},
	sd: 'declaremod',
	staffdeclare: 'declaremod',
	modmsg: 'declaremod',
	moddeclare: 'declaremod',
	declaremod: function(target, room, user) {
		if (!target) return this.sendReply('/declaremod [message] - Also /moddeclare and /modmsg');
		if (!this.can('declare', null, room)) return false;
		if (!this.canTalk()) return;
		this.privateModCommand('|raw|<div class="broadcast-red"><b><font size=1><i>Private Auth (Driver +) declare from ' + user.name + '<br /></i></font size>' + target + '</b></div>');
		this.logModCommand(user.name + ' mod declared ' + target);
	},
	hideuser: function(target, room, user, connection, cmd) {
		if (!target) return this.sendReply('/hideuser [user] - Makes all prior messages posted by this user "poof" and replaces it with a button to see. Requires: @, &, ~');
		if (!this.can('hotpatch')) return false;
		try {
			this.add('|unlink|hide|' + target);
			Rooms.rooms.staff.add(target + '\'s messages have been hidden by ' + user.name);
			this.logModCommand(target + '\'s messages have been hidden by ' + user.name);
			this.sendReply(target + '\'s messages have been sucessfully hidden.');
		} catch (e) {
			this.sendReply("Something went wrong! Ahhhhhh!");
		}
	},
	k: 'kick',
	kick: function(target, room, user) {
		if (!this.can('lock')) return false;
		if (!target) return this.sendReply('/help kick');
		if (!this.canTalk()) return false;
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser || !targetUser.connected) {
			return this.sendReply('User ' + this.targetUsername + ' not found.');
		}
		if (!this.can('lock', targetUser, room)) return false;
		this.addModCommand(targetUser.name + ' was kicked from the room by ' + user.name + '.');
		targetUser.popup('You were kicked from ' + room.id + ' by ' + user.name + '.');
		targetUser.leaveRoom(room.id);
	},
	flogout: 'forcelogout',
	forcelogout: function(target, room, user) {
		if (!user.can('hotpatch')) return;
		if (!this.canTalk()) return false;
		if (!target) return this.sendReply('/forcelogout [username], [reason] OR /flogout [username], [reason] - You do not have to add a reason');
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser) {
			return this.sendReply('User ' + this.targetUsername + ' not found.');
		}
		if (targetUser.can('hotpatch')) return this.sendReply('You cannot force logout another Admin - nice try. Chump.');
		this.addModCommand('' + targetUser.name + ' was forcibly logged out by ' + user.name + '.' + (target ? " (" + target + ")" : ""));
		targetUser.resetName();
	},
	goldstaff: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('The staff forums can be found <a href="https://groups.google.com/forum/#!forum/gold-staff">here</a>.');
	},
	pus: 'pmupperstaff',
	pmupperstaff: function(target, room, user) {
		if (!target) return this.sendReply('/pmupperstaff [message] - Sends a PM to every upper staff');
		if (!this.can('pban')) return false;
		for (var u in Users.users) {
			if (Users.users[u].group == '~' || Users.users[u].group == '&') {
				Users.users[u].send('|pm|~Upper Staff PM|' + Users.users[u].group + Users.users[u].name + '| ' + target + ' (PM from ' + user.name + ')');
			}
		}
	},
	events: 'activities',
	activities: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<center><font size="3" face="comic sans ms">Gold Activities:</font></center></br>' +
			'★ <b>Tournaments</b> - Here on Gold, we have a tournaments script that allows users to partake in several different tiers.  For a list of tour commands do /th.  Ask in the lobby for a voice (+) or up to start one of these if you\'re interesrted!<br>' +
			'★ <b>Hangmans</b> - We have a hangans script that allows users to  partake in a "hangmans" sort of a game.  For a list of hangmans commands, do /hh.  As a voice (+) or up in the lobby to start one of these if interested.<br>' +
			'★ <b>Leagues</b> - If you click the "join room page" to the upper right (+), it will display a list of rooms we have.  Several of these rooms are 3rd party leagues of Gold; join them to learn more about each one!<br>' +
			'★ <b>Battle</b> - By all means, invite your friends on here so that you can battle with each other!  Here on Gold, we are always up to date on our formats, so we\'re a great place to battle on!<br>' +
			'★ <b>Chat</b> - Gold is full of great people in it\'s community and we\'d love to have you be apart of it!<br>' +
			'★ <b>Learn</b> - Are you new to Pokemon?  If so, then feel FREE to ask the lobby any questions you might have!<br>' +
			'★ <b>Shop</b> - Do /shop to learn about where your Gold Bucks can go! <br>' +
			'★ <b>Plug.dj</b> - Come listen to music with us! Click <a href="http://plug.dj/gold-server/">here</a> to start!<br>' +
			'<i>--PM staff (%, @, &, ~) any questions you might have!</i>');
	},

	links: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox(
			"<div class=\"broadcast-black\">Here are some helpful server related links:<b><br />" +
			"- <a href=\"http://goldservers.info/forums/showthread.php?tid=61\"><font color=\"#FF0066\">Rules</a></font><br />" +
			"- <a href=\"http://goldservers.info/forums/index.php/\"><font color=\"#FF00\">Forums</a></font><br />" +
			"- <a href=\"http://goldserver.weebly.com\"><font color=\"#56600FF\">Website</a></font><br />" +
			"- <a href=\"http://plug.dj/gold-server/\"><font color=\"#FFFF\">Plug.dj</a></font><br />" +
			"- <a href=\"https://github.com/panpawn/Pokemon-Showdown\"><font color=\"#39FF14\">GitHub</a></font><br />" +
			"- <a href=\"http://goldserver.weebly.com/news.html\"><font color=\"#BFFF00\">News</a></font><br />" +
			"- <a href=\"http://goldserver.weebly.com/faqs.html\"><font color=\"#DA9D01\">FAQs</a></font><br />" +
			"- <a href=\"http://goldserver.weebly.com/discipline-appeals.html\"><font color=\"#12C418\">Discipline Appeals</a></font>" +
			"</b></div>"
		);
	},
	forums: function(target, room, user) {
		if (!this.canBroadcast()) return;
		return this.sendReplyBox('Gold Forums can be found <a href="http://goldservers.info/forums">here</a>.');
	},
	client: function(target, room, user) {
		if (!this.canBroadcast()) return;
		return this.sendReplyBox('Gold\'s custom client can be found <a href="http://goldservers.info">here</a>.');
	},

	pas: 'pmallstaff',
	pmallstaff: function(target, room, user) {
		if (!target) return this.sendReply('/pmallstaff [message] - Sends a PM to every user in a room.');
		if (!this.can('pban')) return false;
		for (var u in Users.users) {
			if (Users.users[u].isStaff) {
				Users.users[u].send('|pm|~Staff PM|' + Users.users[u].group + Users.users[u].name + '|' + target + ' (by: ' + user.name + ')');
			}
		}
	},
	masspm: 'pmall',
	pmall: function(target, room, user) {
		if (!target) return this.parse('/pmall [message] - Sends a PM to every user in a room.');
		if (!this.can('pban')) return false;
		var pmName = '~Gold Server [Do not reply]';
		for (var i in Users.users) {
			var message = '|pm|' + pmName + '|' + Users.users[i].getIdentity() + '|' + target;
			Users.users[i].send(message);
		}
	},
	regdate: function(target, room, user, connection) {
		if (!this.canBroadcast()) return;
		if (!target || target === "0") target = toId(user.userid);
		if (!target || target === "." || target === "," || target === "'") return this.sendReply('/regdate - Please specify a valid username.'); //temp fix for symbols that break the command
		var username = toId(target);
		target = target.replace(/\s+/g, '');
		var request = require("request");
		var self = this;
		request('http://pokemonshowdown.com/users/~' + target, function(error, response, content) {
			if (!(!error && response.statusCode == 200)) return;
			content = content + '';
			content = content.split("<em");
			if (content[1]) {
				content = content[1].split("</p>");
				if (content[0]) {
					content = content[0].split("</em>");
					if (content[1]) {
						regdate = content[1].split('</small>')[0] + '.';
						data = Tools.escapeHTML(username) + ' was registered on' + regdate;
					}
				}
			} else {
				data = Tools.escapeHTML(username) + ' is not registered.';
			}
			self.sendReplyBox(Tools.escapeHTML(data));
		});
	},
	stafffaq: function(target, room, user) {
		if (!this.canBroadcast()) return;
		return this.sendReplyBox('Click <a href="http://goldserver.weebly.com/how-do-i-get-a-rank-on-gold.html">here</a> to find out about Gold\'s ranks and promotion system.');
	},
	//Should solve the problem of users not being able to talk in chat
	unstick: function(target, room, user) {
		if (!this.can('hotpatch')) return;
		for (var uid in Users.users) {
			Users.users[uid].chatQueue = null;
			Users.users[uid].chatQueueTimeout = null;
		}
	},
	removebadge: function(target, room, user) {
		if (!this.can('hotpatch')) return false;
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!target) return this.sendReply('/removebadge [user], [badge] - Removes a badge from a user.');
		if (!targetUser) return this.sendReply('There is no user named ' + this.targetUsername + '.');
		var self = this;
		var type_of_badges = ['admin', 'bot', 'dev', 'vip', 'artist', 'mod', 'leader', 'champ', 'creator', 'comcun', 'twinner', 'goodra', 'league', 'fgs'];
		if (type_of_badges.indexOf(target) > -1 == false) return this.sendReply('The badge ' + target + ' is not a valid badge.');
		fs.readFile('badges.txt', 'utf8', function(err, data) {
			if (err) console.log(err);
			var match = false;
			var currentbadges = '';
			var row = ('' + data).split('\n');
			var line = '';
			for (var i = row.length; i > -1; i--) {
				if (!row[i]) continue;
				var split = row[i].split(':');
				if (split[0] == targetUser.userid) {
					match = true;
					currentbadges = split[1];
					line = row[i];
				}
			}
			if (match == true) {
				if (currentbadges.indexOf(target) > -1 == false) return self.sendReply(currentbadges); //'The user '+targetUser+' does not have the badge.');
				var re = new RegExp(line, 'g');
				currentbadges = currentbadges.replace(target, '');
				var newdata = data.replace(re, targetUser.userid + ':' + currentbadges);
				fs.writeFile('badges.txt', newdata, 'utf8', function(err, data) {
					if (err) console.log(err);
					return self.sendReply('You have removed the badge ' + target + ' from the user ' + targetUser + '.');
				});
			} else {
				return self.sendReply('There is no match for the user ' + targetUser + '.');
			}
		});
	},
	givebadge: function(target, room, user) {
		if (!this.can('hotpatch')) return false;
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser) return this.sendReply('There is no user named ' + this.targetUsername + '.');
		if (!target) return this.sendReply('/givebadge [user], [badge] - Gives a badge to a user. Requires: &~');
		var self = this;
		var type_of_badges = ['admin', 'bot', 'dev', 'vip', 'mod', 'artist', 'leader', 'champ', 'creator', 'comcun', 'twinner', 'league', 'fgs'];
		if (type_of_badges.indexOf(target) > -1 == false) return this.sendReply('Ther is no badge named ' + target + '.');
		fs.readFile('badges.txt', 'utf8', function(err, data) {
			if (err) console.log(err);
			var currentbadges = '';
			var line = '';
			var row = ('' + data).split('\n');
			var match = false;
			for (var i = row.length; i > -1; i--) {
				if (!row[i]) continue;
				var split = row[i].split(':');
				if (split[0] == targetUser.userid) {
					match = true;
					currentbadges = split[1];
					line = row[i];
				}
			}
			if (match == true) {
				if (currentbadges.indexOf(target) > -1) return self.sendReply('The user ' + targerUser + ' already has the badge ' + target + '.');
				var re = new RegExp(line, 'g');
				var newdata = data.replace(re, targetUser.userid + ':' + currentbadges + target);
				fs.writeFile('badges.txt', newdata, function(err, data) {
					if (err) console.log(err);
					self.sendReply('You have given the badge ' + target + ' to the user ' + targetUser + '.');
					targetUser.send('You have recieved the badge ' + target + ' from the user ' + user.userid + '.');
					room.addRaw(targetUser + ' has recieved the ' + target + ' badge from ' + user.name);
				});
			} else {
				fs.appendFile('badges.txt', '\n' + targetUser.userid + ':' + target, function(err) {
					if (err) console.log(err);
					self.sendReply('You have given the badge ' + target + ' to the user ' + targetUser + '.');
					targetUser.send('You have recieved the badge ' + target + ' from the user ' + user.userid + '.');
				});
			}
		})
	},
	badgelist: function(target, room, user) {
		if (!this.canBroadcast()) return;
		var fgs = '<img src="http://www.smogon.com/media/forums/images/badges/forummod_alum.png" title="Former Gold Staff">';
		var admin = '<img src="http://www.smogon.com/media/forums/images/badges/sop.png" title="Server Administrator">';
		var dev = '<img src="http://www.smogon.com/media/forums/images/badges/factory_foreman.png" title="Gold Developer">';
		var creator = '<img src="http://www.smogon.com/media/forums/images/badges/dragon.png" title="Server Creator">';
		var comcun = '<img src="http://www.smogon.com/media/forums/images/badges/cc.png" title="Community Contributor">';
		var leader = '<img src="http://www.smogon.com/media/forums/images/badges/aop.png" title="Server Leader">';
		var mod = '<img src="http://www.smogon.com/media/forums/images/badges/pyramid_king.png" title="Exceptional Staff Member">';
		var league = '<img src="http://www.smogon.com/media/forums/images/badges/forumsmod.png" title="Successful Room Founder">';
		var champ = '<img src="http://www.smogon.com/media/forums/images/badges/forumadmin_alum.png" title="Goodra League Champion">';
		var artist = '<img src="http://www.smogon.com/media/forums/images/badges/ladybug.png" title="Artist">';
		var twinner = '<img src="http://www.smogon.com/media/forums/images/badges/spl.png" title="Badge Tournament Winner">';
		var vip = '<img src="http://www.smogon.com/media/forums/images/badges/zeph.png" title="VIP">';
		var bot = '<img src="http://www.smogon.com/media/forums/images/badges/mind.png" title="Gold Bot Hoster">';
		return this.sendReplyBox('<b>List of Gold Badges</b>:<br>' + fgs + '  ' + admin + '    ' + dev + '  ' + creator + '   ' + comcun + '    ' + mod + '    ' + leader + '    ' + league + '    ' + champ + '    ' + artist + '    ' + twinner + '    ' + vip + '    ' + bot + ' <br>--Hover over them to see the meaning of each.<br>--Get a badge and get a FREE custom avatar!<br>--Click <a href="http://goldserver.weebly.com/badges.html">here</a> to find out more about how to get a badge.');
	},
	goldroomleader: function(target, room, user) {
		if (!room.chatRoomData) {
			return this.sendReply("/roomleader - This room is't designed for per-room moderation to be added.");
		}
		var target = this.splitTarget(target, true);
		var targetUser = this.targetUser;
		if (!targetUser) return this.sendReply("User '" + this.targetUsername + "' is not online.");
		if (!room.founder || user.userid != room.founder && !this.can('hotpatch')) return false;
		if (!room.auth) room.auth = room.chatRoomData.auth = {};
		var name = targetUser.name;
		room.auth[targetUser.userid] = '&';
		//room.founder = targetUser.userid;
		this.addModCommand('' + name + ' was appointed to Room Leader by ' + user.name + '.');
		room.onUpdateIdentity(targetUser);
		//room.chatRoomData.leaders = room.founder;
		Rooms.global.writeChatRoomData();
	},
	goldderoomleader: function(target, room, user) {
		if (!room.auth) {
			return this.sendReply("/roomdeowner - This room isn't designed for per-room moderation");
		}
		target = this.splitTarget(target, true);
		var targetUser = this.targetUser;
		var name = this.targetUsername;
		var userid = toId(name);
		if (!userid || userid === '') return this.sendReply("User '" + name + "' does not exist.");
		if (room.auth[userid] !== '&') return this.sendReply("User '" + name + "' is not a room leader.");
		if (!room.founder || user.userid != room.founder && !this.can('hotpatch')) return false;
		delete room.auth[userid];
		this.sendReply('(' + name + ' is no longer Room Leader.)');
		if (targetUser) targetUser.updateIdentity();
		if (room.chatRoomData) {
			Rooms.global.writeChatRoomData();
		}
	},
	badges: 'badge',
	badge: function(target, room, user) {
		if (!this.canBroadcast()) return;
		if (target == '') target = user.userid;
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		var matched = false;
		if (!targetUser) return false;
		var fgs = '<img src="http://www.smogon.com/media/forums/images/badges/forummod_alum.png" title="Former Gold Staff">';
		var admin = '<img src="http://www.smogon.com/media/forums/images/badges/sop.png" title="Server Administrator">';
		var dev = '<img src="http://www.smogon.com/media/forums/images/badges/factory_foreman.png" title="Gold Developer">';
		var creator = '<img src="http://www.smogon.com/media/forums/images/badges/dragon.png" title="Server Creator">';
		var comcun = '<img src="http://www.smogon.com/media/forums/images/badges/cc.png" title="Community Contributor">';
		var leader = '<img src="http://www.smogon.com/media/forums/images/badges/aop.png" title="Server Leader">';
		var mod = '<img src="http://www.smogon.com/media/forums/images/badges/pyramid_king.png" title="Exceptional Staff Member">';
		var league = '<img src="http://www.smogon.com/media/forums/images/badges/forumsmod.png" title="Successful League Owner">';
		var srf = '<img src="http://www.smogon.com/media/forums/images/badges/forumadmin_alum.png" title="Goodra League Champion">';
		var artist = '<img src="http://www.smogon.com/media/forums/images/badges/ladybug.png" title="Artist">';
		var twinner = '<img src="http://www.smogon.com/media/forums/images/badges/spl.png" title="Badge Tournament Winner">';
		var vip = '<img src="http://www.smogon.com/media/forums/images/badges/zeph.png" title="VIP">';
		var bot = '<img src="http://www.smogon.com/media/forums/images/badges/mind.png" title="Gold Bot Hoster">';
		var self = this;
		fs.readFile('badges.txt', 'utf8', function(err, data) {
			if (err) console.log(err);
			var row = ('' + data).split('\n');
			var match = false;
			var badges;
			for (var i = row.length; i > -1; i--) {
				if (!row[i]) continue;
				var split = row[i].split(':');
				if (split[0] == targetUser.userid) {
					match = true;
					currentbadges = split[1];
				}
			}
			if (match == true) {
				var badgelist = '';
				if (currentbadges.indexOf('fgs') > -1) badgelist += ' ' + fgs;
				if (currentbadges.indexOf('admin') > -1) badgelist += ' ' + admin;
				if (currentbadges.indexOf('dev') > -1) badgelist += ' ' + dev;
				if (currentbadges.indexOf('creator') > -1) badgelist += ' ' + creator;
				if (currentbadges.indexOf('comcun') > -1) badgelist += ' ' + comcun;
				if (currentbadges.indexOf('leader') > -1) badgelist += ' ' + leader;
				if (currentbadges.indexOf('mod') > -1) badgelist += ' ' + mod;
				if (currentbadges.indexOf('league') > -1) badgelist += ' ' + league;
				if (currentbadges.indexOf('champ') > -1) badgelist += ' ' + champ;
				if (currentbadges.indexOf('artist') > -1) badgelist += ' ' + artist;
				if (currentbadges.indexOf('twinner') > -1) badgelist += ' ' + twinner;
				if (currentbadges.indexOf('vip') > -1) badgelist += ' ' + vip;
				if (currentbadges.indexOf('bot') > -1) badgelist += ' ' + bot;
				self.sendReplyBox(targetUser.userid + "'s badges: " + badgelist);
				room.update();
			} else {
				self.sendReplyBox('User ' + targetUser.userid + ' has no badges.');
				room.update();
			}
		});
	},
	helixfossil: 'm8b',
	helix: 'm8b',
	magic8ball: 'm8b',
	m8b: function(target, room, user) {
		if (!this.canBroadcast()) return;
		var random = Math.floor(20 * Math.random()) + 1;
		var results = '';
		if (random == 1) {
			results = 'Signs point to yes.';
		}
		if (random == 2) {
			results = 'Yes.';
		}
		if (random == 3) {
			results = 'Reply hazy, try again.';
		}
		if (random == 4) {
			results = 'Without a doubt.';
		}
		if (random == 5) {
			results = 'My sources say no.';
		}
		if (random == 6) {
			results = 'As I see it, yes.';
		}
		if (random == 7) {
			results = 'You may rely on it.';
		}
		if (random == 8) {
			results = 'Concentrate and ask again.';
		}
		if (random == 9) {
			results = 'Outlook not so good.';
		}
		if (random == 10) {
			results = 'It is decidedly so.';
		}
		if (random == 11) {
			results = 'Better not tell you now.';
		}
		if (random == 12) {
			results = 'Very doubtful.';
		}
		if (random == 13) {
			results = 'Yes - definitely.';
		}
		if (random == 14) {
			results = 'It is certain.';
		}
		if (random == 15) {
			results = 'Cannot predict now.';
		}
		if (random == 16) {
			results = 'Most likely.';
		}
		if (random == 17) {
			results = 'Ask again later.';
		}
		if (random == 18) {
			results = 'My reply is no.';
		}
		if (random == 19) {
			results = 'Outlook good.';
		}
		if (random == 20) {
			results = 'Don\'t count on it.';
		}
		return this.sendReplyBox('' + results + '');
	},
	hue: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<center><img src="http://reactiongifs.me/wp-content/uploads/2013/08/ducks-laughing.gif">');
	},
	coins: 'coingame',
	coin: 'coingame',
	coingame: function(target, room, user) {
		if (!this.canBroadcast()) return;
		var random = Math.floor(2 * Math.random()) + 1;
		var results = '';
		if (random == 1) {
			results = '<img src="http://surviveourcollapse.com/wp-content/uploads/2013/01/zinc.png" width="15%" title="Heads!"><br>It\'s heads!';
		}
		if (random == 2) {
			results = '<img src="http://upload.wikimedia.org/wikipedia/commons/e/e5/2005_Penny_Rev_Unc_D.png" width="15%" title="Tails!"><br>It\'s tails!';
		}
		return this.sendReplyBox('<center><font size="3"><b>Coin Game!</b></font><br>' + results + '');
	},
	/*
	one: function(target, room, user) {
	    if (room.id !== '1v1') return this.sendReply("This command can only be used in 1v1.");
	    if (!this.canBroadcast()) return;
	    var messages = {
	        onevone: 'Global 1v1 bans are: Focus Sash, Sturdy (if doesnt naturally learn it), Sleep, Imposter/imprison, Parental Bond, and level 100 Pokemon only. You are only allowed to use "3 team preview" in all tiers falling under the "1v1 Elimination" tier. All other tiers must be 1 Pokemon only. No switching',
	        reg: 'This is regular 1v1, only bans are Sleep, Ubers (except mega gengar), and ditto (imposter/imprison)',
	        monogen: 'You may only use pokemon, from the gen decided by the !roll command. No ubers, and no sleep',
	        monotype: 'You may only use Pokemon from the type dictated by the !roll command. Here are the list of types. http://bulbapedia.bulbagarden.net/wiki/Type_chart No ubers, and no sleep',
	        monopoke: 'You may only use the Pokemon decided by the !roll command. No ubers, and no sleep',
	        monoletter: 'You may only use Pokemon starting with the same letter dictated by the !roll command. No ubers, and no sleep.',
	        monocolor: 'You may only use Pokemon sharing the same color dictated by the !pickrandom command.',
	        cap: '1v1 using Create-A-Pokemon! No sleep, no focus sash.',
	        megaevo: 'Only bring one Pokemon. http://pastebin.com/d9pJWpya ',
	        bstbased: 'You may only use Pokemon based off or lower than the BST decided by !roll command. ',
	        metronome: 'Only bring one Pokemon. http://pastebin.com/diff.php?i=QPZBDzKb ',
	        twovtwo: 'You may only use 2 pokemon, banlist include: no sleep, no ubers (mega gengar allowed), only one focus sash, no parental bond. ',
	        ouonevone: 'OU choice- The OU version of CC1v1. You use an OU team, and choose one  Pokemon in battle. Once that Pokemon faints, you forfeit. You must use  the same OU team throughout the tour, but you can change which Pokemon  you select to choose. No ubers, no focus sash, no sleep. ',
	        aaa: 'http://www.smogon.com/forums/threads/almost-any-ability-xy-aaa-xy-other-metagame-of-the-month-may.3495737/ You may only use a team of ONE pokemon, banlist in  this room for this tier are: Sleep, focus sash, Sturdy, Parental Bond,  Huge Power, Pure Power, Imprison, Normalize (on ghosts). ',
	        stabmons: 'http://www.smogon.com/forums/threads/3484106/ You may only use a team of ONE Pokemon. Banlist = Sleep, Focus sash, Huge Power, Pure power, Sturdy, Parental Bond, Ubers. ',
	        abccup: 'http://www.smogon.com/forums/threads/alphabet-cup-other-metagame-of-the-month-march.3498167/ You may only use a team of ONE Pokemon. Banlist = Sleep, Focus sash, Huge Power, Pure power, Sturdy, Parental Bond, Ubers. ',
	        averagemons: 'http://www.smogon.com/forums/threads/averagemons.3495527/ You may only use a team of ONE Pokemon. Banlist = Sleep, Focus sash, Huge Power, Pure power, Sturdy, Parental Bond, Sableye. ',
	        balancedhackmons: 'http://www.smogon.com/forums/threads/3463764/ You may only use a team of ONE Pokemon. Banlist =  Sleep, Focus sash, Huge Power, Pure power, Sturdy, Parental Bond,  Normalize Ghosts.',
	        retro: 'This is how 1v1 used to be played before 3 team preview. Only bring ONE Pokemon, No sleep, no ubers (except mega gengar), no ditto. ',
	        mediocremons: 'https://www.smogon.com/forums/threads/mediocre-mons-venomoth-banned.3507608/ You many only use a team of ONE Pokemon Banlist = Sleep, Focus sash, Huge Power, Pure power, Sturdy.  ',
	        eeveeonly: 'You may bring up to 3 mons that are eeveelutions. No sleep inducing moves. ',
	        tiershift: 'http://www.smogon.com/forums/threads/tier-shift-xy.3508369/ Tiershift 1v1, you may only bring ONE Pokemon. roombans are slaking, sleep, sash, sturdy, ditto ',
	        lc: 'Only use a team of ONE LC Pokemon. No sleep, no sash. ',
	        lcstarters: 'Only use a team of ONE starter Pokemon in LC form. No sleep, no sash, no pikachu, no eevee. ',
	        ubers: 'Only use a team of ONE uber pokemon. No sleep, no sash ',
	        inverse: 'https://www.smogon.com/forums/threads/the-inverse-battle-ǝɯɐƃɐʇǝɯ.3492433/ You may use ONE pokemon. No sleep, no sash, no ubers (except mega gengar). ',
	    };
	    try {
	        return this.sendReplyBox(messages[target]);
	    } catch (e) {
	        this.sendReply('There is no target named /one ' + target);
	    }
	    if (!target) {
	        this.sendReplyBox('Available commands for /one: ' + Object.keys(messages).join(', '));
	    }
	},
	*/
	color: function(target, room, user) {
		if (!this.canBroadcast()) return;
		if (target === 'list' || target === 'help' || target === 'options') {
			return this.sendReplyBox('The random colors are: <b><font color="red">Red</font>, <font color="blue">Blue</font>, <font color="orange">Orange</font>, <font color="green">Green</font>, <font color="teal">Teal</font>, <font color="brown">Brown</font>, <font color="black">Black</font>, <font color="purple">Purple</font>, <font color="pink">Pink</font>, <font color="gray">Gray</font>, <font color="tan">Tan</font>, <font color="gold">Gold</font>, <font color=#CC0000>R</font><font color=#AE1D00>a</font><font color=#913A00>i</font><font color=#745700>n</font><font color=#577400>b</font><font color=#3A9100>o</font><font color=#1DAE00>w</font>.');
		}
		var colors = ['Red', 'Blue', 'Orange', 'Green', 'Teal', 'Brown', 'Black', 'Purple', 'Pink', 'Grey', 'Tan', 'Gold'];
		var results = colors[Math.floor(Math.random() * colors.length)];
		if (results == 'Rainbow') {
			return this.sendReply('The random color is :<b><font color=#CC0000>R</font><font color=#AE1D00>a</font><font color=#913A00>i</font><font color=#745700>n</font><font color=#577400>b</font><font color=#3A9100>o</font><font color=#1DAE00>w</font></b>');
		} else {
			return this.sendReplyBox('The random color is:<b><font color=' + results + '>' + results + '</font></b>');
		}
	},
	cs: 'customsymbol',
	customsymbol: function(target, room, user) {
		if (!user.canCustomSymbol && !Gold.hasBadge(user.userid, 'vip')) return this.sendReply('You don\'t have the permission to use this command.');
		//var free = true;
		if (user.hasCustomSymbol) return this.sendReply('You currently have a custom symbol, use /resetsymbol if you would like to use this command again.');
		if (!this.canTalk()) return;
		//if (!free) return this.sendReply('Sorry, we\'re not currently giving away FREE custom symbols at the moment.');
		if (!target || target.length > 1) return this.sendReply('/customsymbol [symbol] - changes your symbol (usergroup) to the specified symbol. The symbol can only be one character');
		var bannedSymbols = /[ +<>$%‽!★@&~#卐|A-z0-9]/;
		if (target.match(bannedSymbols)) return this.sendReply('Sorry, but you cannot change your symbol to this for safety/stability reasons.');
		user.getIdentity = function() {
			if (this.muted) return '!' + this.name;
			if (this.locked) return '‽' + this.name;
			return target + this.name;
		};
		user.updateIdentity();
		user.canCustomSymbol = false;
		user.hasCustomSymbol = true;
		return this.sendReply("Your symbol has been set.");
	},
	rs: 'resetsymbol',
	resetsymbol: function(target, room, user) {
		if (!user.hasCustomSymbol) return this.sendReply('You don\'t have a custom symbol!');
		user.getIdentity = function() {
			if (this.muted) return '!' + this.name;
			if (this.locked) return '‽' + this.name;
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
	bank: 'atm',
	atm: function(target, room, user, connection, cmd) {
		if (!this.canBroadcast()) return;
		var mMatch = false;
		var money = 0;
		var total = '';
		if (!target) {
			var data = fs.readFileSync('config/money.csv', 'utf8')
			var row = ('' + data).split("\n");
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
				if (money === 1) p = 'Gold buck';
				total += user.name + ' has ' + money + ' ' + p + '.<br />';
			}
			if (mMatch === false) {
				total += 'You have no Gold bucks.<br />';
			}
			user.money = money;
		} else {
			var data = fs.readFileSync('config/money.csv', 'utf8')
			target = this.splitTarget(target);
			var targetUser = this.targetUser;
			if (!targetUser) {
				return this.sendReply('User ' + this.targetUsername + ' not found.');
			}
			var money = 0;
			var row = ('' + data).split("\n");
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
		return this.sendReplyBox('<b>Gold Wallet~</b><br>' + total + '');
	},
	awardbucks: 'givebucks',
	gb: 'givebucks',
	givebucks: function(target, room, user) {
		if (!user.can('pban')) return this.sendReply('You do not have enough authority to do this.');
		if (!target) return this.parse('/help givebucks');
		if (target.indexOf(',') != -1) {
			var parts = target.split(',');
			parts[0] = this.splitTarget(parts[0]);
			var targetUser = this.targetUser;
			if (toId(user.name) === toId(targetUser) && !user.can('hotpatch')) return this.sendReply("Only admins can do this action you are trying to perform.");
			if (!targetUser) return this.sendReply('User ' + this.targetUsername + ' not found.');
			if (isNaN(parts[1])) return this.sendReply('Very funny, now use a real number.');
			if (parts[1] < 1) return this.sendReply("You cannot give less than a buck.");
			if (parts[1] > 1000) return this.sendReply("You cannot give more than 1,000 bucks at a time.");
			var cleanedUp = parts[1].trim();
			var giveMoney = Number(cleanedUp);
			var data = fs.readFileSync('config/money.csv', 'utf8');
			var match = false;
			var money = 0;
			var line = '';
			var row = ('' + data).split("\n");
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
				var re = new RegExp(line, "g");
				fs.readFile('config/money.csv', 'utf8', function(err, data) {
					if (err) {
						return console.log(err);
					}
					var result = data.replace(re, targetUser.userid + ',' + targetUser.money);
					fs.writeFile('config/money.csv', result, 'utf8', function(err) {
						if (err) return console.log(err);
					});
				});
			} else {
				var log = fs.createWriteStream('config/money.csv', {
					'flags': 'a'
				});
				log.write("\n" + targetUser.userid + ',' + targetUser.money);
			}
			var p = 'bucks';
			if (giveMoney < 2) p = 'buck';
			this.sendReply(targetUser.name + ' was given ' + giveMoney + ' ' + p + '. This user now has ' + targetUser.money + ' bucks.');
			targetUser.send(user.name + ' has given you ' + giveMoney + ' ' + p + '.');
		} else {
			return this.parse('/help givebucks');
		}
	},

	tb: 'transferbucks',
	transferbucks: function(target, room, user) {
		if (!target) return this.sendReply('|raw|Correct Syntax: /transferbucks <i>user</i>, <i>amount</i>');
		if (target.indexOf(',') >= 0) {
			var parts = target.split(',');
			if (parts[0].toLowerCase() === user.name.toLowerCase()) {
				return this.sendReply('You can\'t transfer Bucks to yourself.');
			}
			user.money = readMoney(user.userid);
			parts[0] = this.splitTarget(parts[0]);
			var targetUser = this.targetUser;
		}
		if (!targetUser) {
			return this.sendReply('User ' + this.targetUsername + ' not found.');
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
		writeMoney('money', user, -transferMoney);
		//set time delay because of node asynchronous so it will update both users' money instead of either updating one or the other
		setTimeout(function() {
			writeMoney('money', targetUser, transferMoney);
			fs.appendFile('logs/transactions.log', '\n' + Date() + ': ' + user.name + ' has transferred ' + transferMoney + ' ' + p + ' to ' + targetUser.name + '. ' + user.name + ' now has ' + user.money + ' ' + p + ' and ' + targetUser.name + ' now has ' + targetUser.money + ' ' + p + '.');
		}, 3000);
		this.sendReply("You have transfered " + transferMoney + " " + p + " to " + targetUser + ".");
		targetUser.popup(user.name + ' has transferred ' + transferMoney + ' ' + p + ' to you.');
		this.logModCommand('(' + user.name + '  has transferred ' + transferMoney + ' ' + p + ' to ' + targetUser.name + '.)');
	},
	gamble: function(target, room, user) {
		if (!this.canBroadcast()) return;
		return this.sendReply("Command outdated.  See /gambledicehelp for the new gambling system.");
		/*
		if (!target) return this.sendReply('/gamble [amount] - Gambles the amount chosen. If you win, you win the amount * 2, else, you lose the amount.');
		var amount = readMoney(user.userid);
		if (target < 1) return this.sendReply("You cannot gamble less than 1.");
		if (target == 0 || target % 1 != 0) return this.sendReply('You can\'t gamble 0 or decimal bucks.');
		if (target > amount) return this.sendReply('You can\'t gamble more than you have.');
		if (isNaN(target)) return this.sendReply('Use a real number.');
		if (room.id != 'gamechamber') return this.sendReply('The command can only be used in the room "gamechamber".');
		var roll = Math.floor(Math.random() * 6) + 1;
		var computerroll = Math.floor(Math.random() * 6) + 1;
		if (roll > computerroll) {
			writeMoney('money', user, Number(target));
			return this.sendReply('You won the gamble!');
		} else if (roll == computerroll) {
			return this.sendReply('Tie.');
		} else if (computerroll > roll) {
			writeMoney('money', user, Number(target * -1));
			return this.sendReply('Sorry, you lost the gamble.');
		}
		*/
	},
	takebucks: 'removebucks',
	removebucks: function(target, room, user) {
		if (!user.can('pban')) return this.sendReply('You do not have enough authority to do this.');
		if (!target) return this.parse('/help removebucks');
		if (target.indexOf(',') != -1) {
			var parts = target.split(',');
			parts[0] = this.splitTarget(parts[0]);
			var targetUser = this.targetUser;
			if (toId(user.name) === toId(targetUser) && !user.can('hotpatch')) return this.sendReply("Only admins can do this action you are trying to perform.");
			if (!targetUser) return this.sendReply('User ' + this.targetUsername + ' not found.');
			if (isNaN(parts[1])) return this.sendReply('Very funny, now use a real number.');
			if (parts[1] < 1) return this.sendReply("You cannot take less than a buck.");
			if (parts [1] > 1000) return this.sendReply("You cannot take more than 1,000 bucks at a time.");
			var cleanedUp = parts[1].trim();
			var takeMoney = Number(cleanedUp);
			var data = fs.readFileSync('config/money.csv', 'utf8');
			var match = false;
			var money = 0;
			var line = '';
			var row = ('' + data).split("\n");
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
				var re = new RegExp(line, "g");
				fs.readFile('config/money.csv', 'utf8', function(err, data) {
					if (err) {
						return console.log(err);
					}
					var result = data.replace(re, targetUser.userid + ',' + targetUser.money);
					fs.writeFile('config/money.csv', result, 'utf8', function(err) {
						if (err) return console.log(err);
					});
				});
			} else {
				var log = fs.createWriteStream('config/money.csv', {
					'flags': 'a'
				});
				log.write("\n" + targetUser.userid + ',' + targetUser.money);
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
		var data = fs.readFileSync('config/money.csv', 'utf8')
		var money = readMoney(user.userid);
		user.money = money;
		var price = 0;
		if (target2 === 'symbol') {
			price = 5;
			if (price <= user.money) {
				match = true;
				user.money = user.money - price;
				economy.writeMoney('money', user, -5);
				this.sendReply('You have purchased a custom symbol. You will have this until you log off for more than an hour.');
				this.sendReply('Use /customsymbol [symbol] to change your symbol now!');
				user.canCustomSymbol = true;
				this.add(user.name + ' has purchased a custom symbol!');
				logTransaction(user.name + ' has purchased a custom symbol!');
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		if (target[0] === 'custom' || target[0] === 'avatar') {
			price = 35;
			if (Gold.hasBadge(user.userid, 'vip')) price = 0;
			if (price <= user.money) {
				match = true;
				if (!target[1]) return this.sendReply('Please specify the avatar you would like you buy. It has a maximum size of 80x80 and must be in .png format. ex: /buy custom, [url to the avatar]');
				var filename = target[1].split('.');
				filename = '.' + filename.pop();
				economy.writeMoney('money', user, -35);
				if (filename !== ".png" && filename !== '.jpg') return this.sendReply('Your avatar must be in .png OR .jpg format.');
				user.money = user.money - price;
				this.sendReply('You have purchased a custom avatar. Staff have been notified and it will be added in due time.');
				user.canCustomAvatar = true;
				Rooms.rooms.staff.add(user.name + ' has purchased a custom avatar. Image: ' + target[1]);
				logTransaction(user.name + ' has purchased a custom avatar. Image: ' + target[1]);
				for (var u in Users.users) {
					if (Users.users[u].group == "~" || Users.users[u].group == "&") {
						Users.users[u].send('|pm|~Server|' + Users.users[u].group + Users.users[u].name + '|' + user.name + ' has purchased a custom avatar. Image: ' + target[1]);
					}
				}
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		if (target[0] === 'color') {
			price = 350;
			if (price <= user.money) {
				if (!target[2]) return this.sendReply('Please specify the name of the alt you want your main account (the one you are on now) to have the color of.  Do so with /buy color, [alt name].');
				match = true;
				user.money = user.money - price;
				this.sendReply('You have purchased a custom color. Staff have been notified and it will be added in due time.');
				user.canCustomColor = true;
				economy.writeMoney('money', user, -350);
				Rooms.rooms.staff.add(user.name + ' has purchased a custom color. Color: ' + target[2]);
				logTransaction(user.name + ' has purchased a custom color. Color: ' + target[2]);
				for (var u in Users.users) {
					if (Users.users[u].group == "~") {
						Users.users[u].send('|pm|~Server|' + Users.users[u].group + Users.users[u].name + '|' + user.name + ' has purchased a custom color. Color: ' + target[2]);
					}
				}
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		if (target[0] === 'emote') {
			price = 100;
			if (price <= user.money) {
				match = true;
				if (!target[2]) return this.sendReply('Please specify the emote you would like you buy. ex: /buy emote, [emote code], [url to the emote]');
				var filename = target[2].split('.');
				filename = '.' + filename.pop();
				if (filename != ".png" && filename != ".jpg" && filename != ".gif") return this.sendReply('Your emote must be in .png, .jpg or .gif format.');
				user.money = user.money - price;
				this.sendReply('You have purchased a custom emote. Staff have been notified and it will be added in due time.');
				user.canCustomEmote = true;
				economy.writeMoney('money', user, -100);
				Rooms.rooms.staff.add(user.name + ' has purchased a custom emote. Emote "' + target[1] + '": ' + target[2]);
				logTransaction(user.name + ' has purchased a custom emote. Emote "' + target[1] + '": ' + target[2]);
				for (var u in Users.users) {
					if (Users.users[u].group == "~") {
						Users.users[u].send('|pm|~Server|' + Users.users[u].group + Users.users[u].name + '|' + user.name + ' has purchased a custom emote. Emote "' + target[1] + '": ' + target[2]);
					}
				}
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		if (target[0] === 'animated') {
			price = 45;
			if (Gold.hasBadge(user.userid, 'vip')) price = 0;
			if (price <= user.money) {
				match = true;
				if (!target[1]) return this.sendReply('Please specify the avatar you would like you buy. It has a maximum size of 80x80 and must be in .gif format. ex: /buy animated, [url to the avatar]');
				var filename = target[1].split('.');
				filename = '.' + filename.pop();
				if (filename != ".gif") return this.sendReply('Your avatar must be in .gif format.');
				user.money = user.money - price;
				this.sendReply('You have purchased a custom animated avatar. Staff have been notified and it will be added in due time.');
				user.canAnimatedAvatar = true;
				economy.writeMoney('money', user, -45);
				Rooms.rooms.staff.add(user.name + ' has purchased a custom animated avatar. Image: ' + target[1]);
				logTransaction(user.name + ' has purchased a custom animated avatar. Image: ' + target[1]);
				for (var u in Users.users) {
					if (Users.users[u].group == "~" || Users.users[u].group == "&") {
						Users.users[u].send('|pm|~Server|' + Users.users[u].group + Users.users[u].name + '|' + user.name + ' has purchased a custom animated avatar. Image: ' + target[1]);
					}
				}
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		/*
		if (target[0] === 'room') {
			price = 100;
			if (price <= user.money) {
				match = true;
				user.money = user.money - price;
				this.sendReply('You have purchased a chat room. You need to message an Admin so that the room can be made.');
				user.canChatRoom = true;
				economy.writeMoney('money', user, -100);
				this.add(user.name + ' has purchased a chat room!');
				logTransaction(user.name + ' has purchased a chat room!');
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		*/
		if (target2 === 'trainer') {
			price = 60;
			if (price <= user.money) {
				match = true;
				user.money = user.money - price;
				this.sendReply('You have purchased a trainer card. You need to message an Administrator or Leader capable of adding this.');
				user.canTrainerCard = true;
				this.add(user.name + ' has purchased a trainer card!');
				logTransaction(user.name + ' has purchased a trainer card!');
				economy.writeMoney('money', user, -60);
				Rooms.rooms.tailz.add(user.name + ' has purchased a trainer card!');
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		if (target2 === 'musicbox') {
			price = 60;
			if (price <= user.money) {
				match = true;
				user.money = user.money - price;
				this.sendReply('You have purchased a music box. You need to message an Administrator or Leader capable of adding this.');
				user.canMusicBox = true;
				this.add(user.name + ' has purchased a music box!');
				economy.writeMoney('money', user, -60);
				Rooms.rooms.staff.add(user.name + ' has purchased a music box!');
				logTransaction(user.name + ' has purchased a music box!');
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		if (target2 === 'fix') {
			price = 15;
			if (Gold.hasBadge(user.userid, 'vip')) price = 0;
			if (price <= user.money) {
				match = true;
				user.money = user.money - price;
				this.sendReply('You have purchased the ability to alter your avatar or trainer card. You need to message an Administrator or Leader capable of adding this.');
				user.canFixItem = true;
				economy.writeMoney('money', user, -15);
				this.add(user.name + ' has purchased the ability to set alter their card or avatar or music box!');
				logTransaction(user.name + ' has purchased the ability to set alter their card or avatar or music box!');
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		if (target2 === 'declare') {
			price = 25;
			if (price <= user.money) {
				match = true;
				user.money = user.money - price;
				this.sendReply('You have purchased the ability to declare (from Admin or leader). To do this message an Admin (~) or a Leader (&) with the message you want to send. Keep it sensible!');
				user.canDecAdvertise = true;
				economy.writeMoney('money', user, -25);
				this.add(user.name + ' has purchased the ability to declare from an Admin or a leader!');
				logTransaction(user.name + ' has purchased the ability to declare from an Admin or a leader!');
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
	},
	//Tis' big command
	shop: function(target, room, user) {
		if (!this.canBroadcast()) return;
		if (room.id === 'lobby' && this.broadcasting) {
			return this.sendReplyBox('<center>Click <button name="send" value="/shop" class="blackbutton" title="Enter the Shop!"><font color="white"><b>here</button></b></font> to enter our shop!');
		} else {
			return this.sendReplyBox(
				'<center><h3><b><u>Gold Bucks Shop</u></b></h3><table border="1" cellspacing ="0" cellpadding="3"><tr><th>Item</th><th>Description</th><th>Cost</th></tr>' +
				'<tr><td>Symbol</td><td>Buys a custom symbol to go infront of name and puts you at top of userlist (temporary until restart)</td><td>5</td></tr>' +
				'<tr><td>Custom</td><td>Buys a custom avatar to be applied to your name (you supply)</td><td>35</td></tr>' +
				'<tr><td>Animated</td><td>Buys an animated avatar to be applied to your name (you supply)</td><td>45</td></tr>' +
				//'<tr><td>Room</td><td>Buys a chatroom for you to own (within reason, can be refused)</td><td>100</td></tr>' +
				'<tr><td>Trainer</td><td>Buys a trainer card which shows information through a command (just make all the HTML for it in one pastebin and send that to a leader or administrator) such as /panpawn (note: third image costs 10 bucks extra, ask for more details)</td><td>60</td></tr>' +
				'<tr><td>Fix</td><td>Buys the ability to alter your current custom avatar or trainer card or music box or custom emote (don\'t buy if you have neither)!</td><td>15</td></tr>' +
				'<tr><td>Declare</td><td>You get the ability to get one declare from an Admin or Leader in the lobby. This can be used for room advertisement (not server)</td><td>25</td></tr>' +
				//'<tr><td>POTD</td><td>Buys the ability to set The Pokemon of the Day!  This Pokemon will be guaranteed to show up in random battles. </td><td>45</td></tr>' +
				'<tr><td>Musicbox</td><td><a href="http://pastebin.com/bDG185jQ">Music Box!</a>  It\'s a command that\'s similar to a trainer card, but with links to your favorite songs! You can have up to 6 songs per music box. (must be appropriate).</td><td>60</td></tr>' +
				'<tr><td>Emote</td><td>This buys you a custom chat emote, such as "Kappa", for example.  The size of this must be 30x30 and must be appropriate.</td><td>100</td></tr>' +
				'<tr><td>Color</td><td>This gives your username a custom color on our <a href="http://goldservers.info">custom client</a>.</td><td>350</td></tr>' +
				//'<tr><td>Custom Battle Song</td><td>This allows you to have a custom battle theme song (on the custom client) to play when you battle.</td><td>250</td></tr>' +
				//'<tr><td>Badge</td><td>You get a VIP badge and VIP status AND strongly recommended for global voice!  A VIP can change their avatar by PM\'ing a leader at any time (they get one for FREE as well) in addition to a FREE trainer card.</td><td>1,500</td></tr>' +
				'</table><br />To buy an item from the shop, do /buy [item].<br>Do /getbucks to learn more about how to obtain bucks. </center>'
			);
		}
		if (closeShop) return this.sendReply('|raw|<center><h3><b>The shop is currently closed and will open shortly.</b></h3></center>');
	},
	lockshop: 'closeshop',
	closeshop: function(target, room, user) {
		if (!user.can('hotpatch')) return this.sendReply('You do not have enough authority to do this.');
		if (closeShop && closedShop === 1) closedShop--;
		if (closeShop) {
			return this.sendReply('The shop is already closed. Use /openshop to open the shop to buyers.');
		} else if (!closeShop) {
			if (closedShop === 0) {
				this.sendReply('Are you sure you want to close the shop? People will not be able to buy anything. If you do, use the command again.');
				closedShop++;
			} else if (closedShop === 1) {
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
		} else if (closeShop) {
			if (closedShop === 0) {
				this.sendReply('Are you sure you want to open the shop? People will be able to buy again. If you do, use the command again.');
				closedShop++;
			} else if (closedShop === 1) {
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
		if (!user.can('pban')) return this.sendReply('You do not have enough authority to do this.');
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!target) return this.parse('/help awarditem');
		if (!targetUser) {
			return this.sendReply('User ' + this.targetUsername + ' not found.');
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
		if (isItem) {
			switch (theItem) {
				case 'symbol':
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
					break;
				case 'custom':
					if (targetUser.canCustomAvatar === true) {
						return this.sendReply('This user has already bought that item from the shop... no need for another.');
					}
					if (targetUser.canCustomAvatar === false) {
						matched = true;
						targetUser.canCustomAvatar = true;
						Rooms.rooms.lobby.add(user.name + ' has stolen a custom avatar from the shop!');
						targetUser.send(user.name + ' has given you ' + theItem + '!');
					}
					break;
				case 'emote':
					if (targetUser.canCustomEmote === true) {
						return this.sendReply('This user has already bought that item from the shop... no need for another.');
					}
					if (targetUser.canCustomEmote === false) {
						matched = true;
						targetUser.canCustomEmote = true;
						Rooms.rooms.lobby.add(user.name + ' has stolen a custom emote from the shop!');
						targetUser.send(user.name + ' has given you ' + theItem + '!');
					}
					break;
				case 'animated':
					if (targetUser.canAnimated === true) {
						return this.sendReply('This user has already bought that item from the shop... no need for another.');
					}
					if (targetUser.canCustomAvatar === false) {
						matched = true;
						targetUser.canCustomAvatar = true;
						Rooms.rooms.lobby.add(user.name + ' has stolen a custom avatar from the shop!');
						targetUser.send(user.name + ' has given you ' + theItem + '!');
					}
					break;
				case 'room':
					if (targetUser.canChatRoom === true) {
						return this.sendReply('This user has already bought that item from the shop... no need for another.');
					}
					if (targetUser.canChatRoom === false) {
						matched = true;
						targetUser.canChatRoom = true;
						Rooms.rooms.lobby.add(user.name + ' has stolen a chat room from the shop!');
						targetUser.send(user.name + ' has given you ' + theItem + '!');
					}
					break;
				case 'trainer':
					if (targetUser.canTrainerCard === true) {
						return this.sendReply('This user has already bought that item from the shop... no need for another.');
					}
					if (targetUser.canTrainerCard === false) {
						matched = true;
						targetUser.canTrainerCard = true;
						Rooms.rooms.lobby.add(user.name + ' has stolen a trainer card from the shop!');
						targetUser.send(user.name + ' has given you ' + theItem + '!');
					}
					break;
				case 'musicbox':
					if (targetUser.canMusicBox === true) {
						return this.sendReply('This user has already bought that item from the shop... no need for another.');
					}
					if (targetUser.canMusicBox === false) {
						matched = true;
						targetUser.canMusicBox = true;
						Rooms.rooms.lobby.add(user.name + ' has stolen a music box from the shop!');
						targetUser.send(user.name + ' has given you ' + theItem + '!');
					}
					break;
				case 'fix':
					if (targetUser.canFixItem === true) {
						return this.sendReply('This user has already bought that item from the shop... no need for another.');
					}
					if (targetUser.canFixItem === false) {
						matched = true;
						targetUser.canFixItem = true;
						Rooms.rooms.lobby.add(user.name + ' has stolen the ability to alter a current trainer card or avatar from the shop!');
						targetUser.send(user.name + ' has given you the ability to set ' + theItem + '!');
					}
					break;
				case 'declare':
					if (targetUser.canDecAdvertise === true) {
						return this.sendReply('This user has already bought that item from the shop... no need for another.');
					}
					if (targetUser.canDecAdvertise === false) {
						matched = true;
						targetUser.canDecAdvertise = true;
						Rooms.rooms.lobby.add(user.name + ' has stolen the ability to get a declare from the shop!');
						targetUser.send(user.name + ' has given you the ability to set ' + theItem + '!');
					}
					break;
				default:
					return this.sendReply('Maybe that item isn\'t in the shop yet.');
			}
		} else {
			return this.sendReply('Shop item could not be found, please check /shop for all items - ' + theItem);
		}
	},
	removeitem: function(target, room, user) {
		if (!target) return this.parse('/help removeitem');
		if (!user.can('hotpatch')) return this.sendReply('You do not have enough authority to do this.');
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!target) return this.parse('/help removeitem');
		if (!targetUser) {
			return this.sendReply('User ' + this.targetUsername + ' not found.');
		}
		switch (target) {
			case 'symbol':
				if (targetUser.canCustomSymbol) {
					targetUser.canCustomSymbol = false;
					this.sendReply(targetUser.name + ' no longer has a custom symbol ready to use.');
					targetUser.send(user.name + ' has removed the custom symbol from you.');
				} else {
					return this.sendReply('They do not have a custom symbol for you to remove.');
				}
				break;
			/*case 'custombattlesong':
			case 'battlesong':
			case 'cbs':
				if (targetUser.canCustomBattleSong) {
					targetUser.canCustomBattleSong = false;
					this.sendReply(targetUser.name + 'no longer has a custom battle song ready to use.');
					targetUser.send(user.name + ' has removed the custom battle song from you.');
				} else {
					return this.sendReply("They do not have a custom battle song for you to remove.");
				}
				break;*/
			case 'custom':
				if (targetUser.canCustomAvatar) {
					targetUser.canCustomAvatar = false;
					this.sendReply(targetUser.name + ' no longer has a custom avatar ready to use.');
					targetUser.send(user.name + ' has removed the custom avatar from you.');
				} else {
					return this.sendReply('They do not have a custom avatar for you to remove.');
				}
				break;
			case 'emote':
				if (targetUser.canCustomEmote) {
					targetUser.canCustomEmote = false;
					this.sendReply(targetUser.name + ' no longer has a custom emote ready to use.');
					targetUser.send(user.name + ' has removed the custom emote from you.');
				} else {
					return this.sendReply('They do not have a custom emote for you to remove.');
				}
				break;
			case 'animated':
				if (targetUser.canAnimatedAvatar) {
					targetUser.canAnimatedAvatar = false;
					this.sendReply(targetUser.name + ' no longer has a animated avatar ready to use.');
					targetUser.send(user.name + ' has removed the animated avatar from you.');
				} else {
					return this.sendReply('They do not have an animated avatar for you to remove.');
				}
				break;
			case 'room':
				if (targetUser.canChatRoom) {
					targetUser.canChatRoom = false;
					this.sendReply(targetUser.name + ' no longer has a chat room ready to use.');
					targetUser.send(user.name + ' has removed the chat room from you.');
				} else {
					return this.sendReply('They do not have a chat room for you to remove.');
				}
				break;
			case 'trainer':
				if (targetUser.canTrainerCard) {
					targetUser.canTrainerCard = false;
					this.sendReply(targetUser.name + ' no longer has a trainer card ready to use.');
					targetUser.send(user.name + ' has removed the trainer card from you.');
				} else {
					return this.sendReply('They do not have a trainer card for you to remove.');
				}
				break;
			case 'musicbox':
				if (targetUser.canMusicBox) {
					targetUser.canMusicBox = false;
					this.sendReply(targetUser.name + ' no longer has a music box ready to use.');
					targetUser.send(user.name + ' has removed the music box from you.');
				} else {
					return this.sendReply('They do not have a music box for you to remove.');
				}
				break;
			case 'fix':
				if (targetUser.canFixItem) {
					targetUser.canFixItem = false;
					this.sendReply(targetUser.name + ' no longer has the fix to use.');
					targetUser.send(user.name + ' has removed the fix from you.');
				} else {
					return this.sendReply('They do not have a trainer card for you to remove.');
				}
				break;
			case 'forcerename':
			case 'fr':
				if (targetUser.canForcerename) {
					targetUser.canForcerename = false;
					this.sendReply(targetUser.name + ' no longer has the forcerename to use.');
					targetUser.send(user.name + ' has removed forcerename from you.');
				} else {
					return this.sendReply('They do not have a forcerename for you to remove.');
				}
				break;
			case 'declare':
				if (targetUser.canDecAdvertise) {
					targetUser.canDecAdvertise = false;
					this.sendReply(targetUser.name + ' no longer has a declare ready to use.');
					targetUser.send(user.name + ' has removed the declare from you.');
				} else {
					return this.sendReply('They do not have a trainer card for you to remove.');
				}
				break;
			default:
				return this.sendReply('That isn\'t a real item you fool!');
		}
	},
	friendcodehelp: function(target, room, user) {
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
		fc = fc.slice(0, 4) + '-' + fc.slice(4, 8) + '-' + fc.slice(8, 12);
		var codes = fs.readFileSync('config/friendcodes.txt', 'utf8');
		if (codes.toLowerCase().indexOf(user.name) > -1) {
			return this.sendReply("Your friend code is already here.");
		}
		code.write('\n' + user.name + ': ' + fc);
		return this.sendReply("Your Friend Code: " + fc + " has been set.");
	},
	viewcode: 'gc',
	getcodes: 'gc',
	viewcodes: 'gc',
	vc: 'gc',
	getcode: 'gc',
	gc: function(target, room, user, connection) {
		var codes = fs.readFileSync('config/friendcodes.txt', 'utf8');
		return user.send('|popup|' + codes);
	},
	userauth: function(target, room, user, connection) {
		var targetId = toId(target) || user.userid;
		var targetUser = Users.getExact(targetId);
		var targetUsername = (targetUser ? targetUser.name : target);
		var buffer = [];
		var innerBuffer = [];
		var group = Users.usergroups[targetId];
		if (group) {
			buffer.push('Global auth: ' + group.charAt(0));
		}
		for (var i = 0; i < Rooms.global.chatRooms.length; i++) {
			var curRoom = Rooms.global.chatRooms[i];
			if (!curRoom.auth || curRoom.isPrivate) continue;
			group = curRoom.auth[targetId];
			if (!group) continue;
			innerBuffer.push(group + curRoom.id);
		}
		if (innerBuffer.length) {
			buffer.push('Room auth: ' + innerBuffer.join(', '));
		}
		if (targetId === user.userid || user.can('makeroom')) {
			innerBuffer = [];
			for (var i = 0; i < Rooms.global.chatRooms.length; i++) {
				var curRoom = Rooms.global.chatRooms[i];
				if (!curRoom.auth || !curRoom.isPrivate) continue;
				var auth = curRoom.auth[targetId];
				if (!auth) continue;
				innerBuffer.push(auth + curRoom.id);
			}
			if (innerBuffer.length) {
				buffer.push('Private room auth: ' + innerBuffer.join(', '));
			}
		}
		if (!buffer.length) {
			buffer.push("No global or room auth.");
		}
		buffer.unshift("" + targetUsername + " user auth:");
		connection.popup(buffer.join("\n\n"));
	},
	showpic: function(target, room, user) {
		if (!target) return this.sendReply('/showpic [url], [size] - Adds a picture to the room. Size of 100 is the width of the room (100%).');
		if (!room.isPrivate || !room.auth) return this.sendReply('You can only do this in unofficial private rooms.');
		target = tour.splint(target);
		var picSize = '';
		if (target[1]) {
			if (target[1] < 1 || target[1] > 100) return this.sendReply('Size must be between 1 and 100.');
			picSize = ' height=' + target[1] + '% width=' + target[1] + '%';
		}
		this.add('|raw|<div class="broadcast-blue"><img src=' + target[0] + picSize + '></div>');
		this.logModCommand(user.name + ' added the image ' + target[0]);
	},
	deletecode: function(target, room, user) {
		if (!target) {
			return this.sendReply('/deletecode [user] - Deletes the Friend Code of the User.');
		}
		t = this;
		if (!this.can('lock')) return false;
		fs.readFile('config/friendcodes.txt', 'utf8', function(err, data) {
			if (err) console.log(err);
			hi = this;
			var row = ('' + data).split('\n');
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
				var re = new RegExp(line, 'g');
				var result = data.replace(re, '');
				fs.writeFile('config/friendcodes.txt', result, 'utf8', function(err) {
					if (err) t.sendReply(err);
					t.sendReply('The Friendcode ' + line + ' has been deleted.');
				});
			} else {
				t.sendReply('There is no match.');
			}
		});
	},

	facebook: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('Gold\'s Facebook page can be found <a href="https://www.facebook.com/pages/Gold-Showdown/585196564960185">here</a>.');
	},
	radio: 'plug',
	plug: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('Gold\'s OFFICIAL Plug.dj can be found <a href="https://plug.dj/nightcore-331">here</a>.');
	},
	guesscolor: function(target, room, user) {
		if (!target) return this.sendReply('/guesscolor [color] - Guesses a random color.');
		var html = ['<img ', '<a href', '<font ', '<marquee', '<blink', '<center'];
		for (var x in html) {
			if (target.indexOf(html[x]) > -1) return this.sendReply('HTML is not supported in this command.');
		}
		if (target.length > 15) return this.sendReply('This new room suggestion is too long; it cannot exceed 15 characters.');
		if (!this.canTalk()) return;
		Rooms.rooms.room.add('|html|<font size="4"><b>New color guessed!</b></font><br><b>Guessed by:</b> ' + user.userid + '<br><b>Color:</b> ' + target + '');
		this.sendReply('Thanks, your new color guess has been sent.  We\'ll review your color soon and get back to you. ("' + target + '")');
	},
	/*****************
	 * Money commands *
	 *****************/
	whosgotthemoneyz: 'richestuser',
	richestuser: function(target, room, user) {
		if (!this.canBroadcast()) return;
		var data = fs.readFileSync('config/money.csv', 'utf8');
		var row = ('' + data).split("\n");
		var userids = {
			id: [],
			money: []
		};
		var highest = {
			id: [],
			money: []
		};
		var size = 0;
		var amounts = [];
		for (var i = row.length; i > -1; i--) {
			if (!row[i]) continue;
			var parts = row[i].split(",");
			userids.id[i] = parts[0];
			userids.money[i] = Number(parts[1]);
			size++;
			if (isNaN(parts[1]) || parts[1] === 'Infinity') userids.money[i] = 0;
		}
		for (var i = 0; i < 10; i++) {
			var tempHighest = 0;
			for (var x = 0; x < size; x++) {
				if (userids.money[x] > tempHighest) tempHighest = userids.money[x];
			}
			for (var x = 0; x < size; x++) {
				var found = false;
				if (userids.money[x] === tempHighest && !found) {
					highest.id[i] = userids.id[x];
					highest.money[i] = userids.money[x];
					userids.id[x];
					userids.money[x] = 0;
					found = true;
				}
			}
		}
		return this.sendReplyBox('<b>The richest users are:</b>' +
			'<br>1. ' + highest.id[0] + ': ' + highest.money[0] +
			'<br>2. ' + highest.id[1] + ': ' + highest.money[1] +
			'<br>3. ' + highest.id[2] + ': ' + highest.money[2] +
			'<br>4. ' + highest.id[3] + ': ' + highest.money[3] +
			'<br>5. ' + highest.id[4] + ': ' + highest.money[4] +
			'<br>6. ' + highest.id[5] + ': ' + highest.money[5] +
			'<br>7. ' + highest.id[6] + ': ' + highest.money[6] +
			'<br>8. ' + highest.id[7] + ': ' + highest.money[7] +
			'<br>9. ' + highest.id[8] + ': ' + highest.money[8] +
			'<br>10. ' + highest.id[9] + ': ' + highest.money[9]);
	},
	
	snipe: function (target, room, user, connection, cmd) {
		if (toId(user.name) !== 'tesarand' && !this.can('ban', targetUser)) return false;		
		if (!target) return this.parse('/help ban');
		if ((user.locked) && !user.can('bypassall')) return this.sendReply("You cannot do this while unable to talk.");
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser) return this.sendReply("User '" + this.targetUsername + "' does not exist.");
		if (target.length > MAX_REASON_LENGTH) {
			return this.sendReply("The reason is too long. It cannot exceed " + MAX_REASON_LENGTH + " characters.");
		}
		if (Users.checkBanned(targetUser.latestIp) && !target && !targetUser.connected) {
			var problem = " but was already banned";
			return this.privateModCommand("(" + targetUser.name + " would be banned by " + user.name + problem + ".)");
		}
		if (targetUser.confirmed) {
			var from = targetUser.deconfirm();
			ResourceMonitor.log("[CrisisMonitor] " + targetUser.name + " was banned by " + user.name + " and demoted from " + from.join(", ") + ".");
		}
		targetUser.popup("" + user.name + " has banned you." + (target ? "\n\nReason: " + target : "") + (Config.appealurl ? "\n\nIf you feel that your ban was unjustified, you can appeal:\n" + Config.appealurl : "") + "\n\nYour ban will expire in a few days.");
		this.addModCommand("" + targetUser.name + " took a headshot from " + user.name + "." + (target ? " (" + target + ")" : ""), " (" + targetUser.latestIp + ")");
		var alts = targetUser.getAlts();
		var acAccount = (targetUser.autoconfirmed !== targetUser.userid && targetUser.autoconfirmed);
		if (alts.length) {
			this.privateModCommand("(" + targetUser.name + "'s " + (acAccount ? " ac account: " + acAccount + ", " : "") + "banned alts: " + alts.join(", ") + ")");
			for (var i = 0; i < alts.length; ++i) {
				this.add('|unlink|' + toId(alts[i]));
			}
		} else if (acAccount) {
			this.privateModCommand("(" + targetUser.name + "'s ac account: " + acAccount + ")");
		}
		this.add('|unlink|hide|' + this.getLastIdOf(targetUser));
		targetUser.ban();
	},
	moneylog: function (target, room, user) {
		if (!this.can('hotpatch')) return false;
		if (!target) return this.sendReply("Usage: /moneylog [number] to view the last x lines OR /moneylog [text] to search for text.");
		if (isNaN(Number(target))) var word = true;
		var lines = fs.readFileSync('logs/transactions.log', 'utf8').split('\n').reverse();
		var output = '';
		var count = 0;
		var regex = new RegExp(target.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), "gi");
 
		if (word) {
			output += 'Displaying last 50 lines containing "' + target + '":\n';
			for (var line in lines) {
				if (count >= 50) break;
				if (!~lines[line].search(regex)) continue;
				output += lines[line] + '\n';
				count++;
			}
		} else {
			if (target > 100) target = 100;
			output = lines.slice(0, (lines.length > target ? target : lines.length));
			output.unshift("Displaying the last " + (lines.length > target ? target : lines.length) + " lines:");
			output = output.join('\n');
		}
		user.popup(output);
	},
};

function splint(target) {
	//splittyDiddles
	var cmdArr = target.split(",");
	for (var i = 0; i < cmdArr.length; i++) cmdArr[i] = cmdArr[i].trim();
	return cmdArr;
}

function readMoney(user) {
	try {
		var data = fs.readFileSync('config/money.csv', 'utf8');
	} catch (e) {
		return 0;
	}
	var rows = data.split("\n");
	var matched = false;
	for (var i = 0; i < rows.length; i++) {
		if (!rows[i]) continue;
		var parts = rows[i].split(",");
		var userid = toId(parts[0]);
		if (user === userid) {
			var matched = true;
			var amount = Number(parts[1]);
			break;
		}
	}
	if (matched === true) {
		return amount;
	} else {
		return 0;
	}
}
exports.readMoney = readMoney;

function writeMoney(filename, user, amount, callback) {
	if (!filename || !user || !amount) return false;
	fs.readFile('config/' + filename + '.csv', 'utf8', function(err, data) {
		if (err) return false;
		if (!data || data == '') return console.log('DEBUG: (' + Date() + ') ' + filename + '.csv appears to be empty...');
		var row = data.split('\n');
		var matched = false;
		var line = '';
		var userMoney = 0;
		for (var i = 0; i < row.length; i++) {
			if (!row[i]) continue;
			var parts = row[i].split(',');
			var userid = toId(parts[0]);
			if (toId(user) == userid) {
				matched = true;
				userMoney = Number(parts[1]);
				line = row[i];
				break;
			}
		}
		userMoney += amount;
		if (matched == true) {
			var re = new RegExp(line, "g");
			var result = data.replace(re, toId(user) + ',' + userMoney);
			fs.writeFile('config/' + filename + '.csv', result, 'utf8', function(err) {
				if (err) return false;
				if (callback) callback(true);
				return;
			});
		} else {
			fs.appendFile('config/' + filename + '.csv', '\n' + toId(user) + ',' + userMoney);
			if (callback) callback(true);
			return;
		}
	});
}
exports.writeMoney = writeMoney;

//here you go panpan
//~stevoduhpedo
Object.merge(Gold, {
	hasBadge: function(user, badge) {
		var data = fs.readFileSync('badges.txt', 'utf8');
		var row = data.split('\n');
		var badges = '';
		for (var i = row.length; i > -1; i--) {
			if (!row[i]) continue;
			var split = row[i].split(':');
			if (split[0] == toId(user)) {
				if (split[1].indexOf(badge) > -1) {
					return true;
				} else {
					return false;
				}
			}
		}
	}
});

function logTransaction (message) {
	if (!message) return false;
	fs.appendFile('logs/transactions.log','['+new Date().toUTCString()+'] '+message+'\n');
}

function getAvatar(user) {
	if (!user) return false;
	var user = toId(user);
	var data = fs.readFileSync('config/avatars.csv', 'utf8');
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

function htmlfix(target) {
    var fixings = ['<3', ':>', ':<'];
    for (var u in fixings) {
        while (target.indexOf(fixings[u]) != -1)
            target = target.substring(0, target.indexOf(fixings[u])) + '< ' + target.substring(target.indexOf(fixings[u]) + 1);
    }
    return target;
}
