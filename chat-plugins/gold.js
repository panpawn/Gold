var fs = require('fs');
var request = require('request');
var moment = require('moment');
var regdateCache = {};
if (typeof Gold === 'undefined') global.Gold = {};
if (typeof Gold.tells === 'undefined') global.Gold.tells = {};
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
	dm: 'daymute',
	daymute: function (target, room, user, connection, cmd) {
		if (!target) return this.errorReply("Usage: /dm [user], [reason].");
		if (!this.canTalk()) return this.sendReply("You cannot do this while unable to talk.");

		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser) return this.sendReply("User '" + this.targetUsername + "' does not exist.");
		if (target.length > 300) {
			return this.sendReply("The reason is too long. It cannot exceed 300 characters.");
		}

		var muteDuration = 24 * 60 * 60 * 1000;
		if (!this.can('mute', targetUser, room)) return false;
		var canBeMutedFurther = ((room.getMuteTime(targetUser) || 0) <= (muteDuration * 5 / 6));
		if ((room.isMuted(targetUser) && !canBeMutedFurther) || targetUser.locked || !targetUser.connected) {
			var problem = " but was already " + (!targetUser.connected ? "offline" : targetUser.locked ? "locked" : "muted");
			if (!target) {
				return this.privateModCommand("(" + targetUser.name + " would be muted by " + user.name + problem + ".)");
			}
			return this.addModCommand("" + targetUser.name + " would be muted by " + user.name + problem + "." + (target ? " (" + target + ")" : ""));
		}

		if (targetUser in room.users) targetUser.popup("|modal|" + user.name + " has muted you in " + room.id + " for 24 hours. " + target);
		this.addModCommand("" + targetUser.name + " was muted by " + user.name + " for 24 hours." + (target ? " (" + target + ")" : ""));
		if (targetUser.autoconfirmed && targetUser.autoconfirmed !== targetUser.userid) this.privateModCommand("(" + targetUser.name + "'s ac account: " + targetUser.autoconfirmed + ")");
		this.add('|unlink|' + toId(this.inputUsername));

		room.mute(targetUser, muteDuration, false);
	},
	staffmute: function (target, room, user, connection, cmd) {
		if (!target) return this.errorReply("Usage: /staffmute [user], [reason].");
		if (!this.canTalk()) return this.sendReply("You cannot do this while unable to talk.");

		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser) return this.sendReply("User '" + this.targetUsername + "' does not exist.");
		if (target.length > 300) {
			return this.sendReply("The reason is too long. It cannot exceed 300 characters.");
		}

		var muteDuration =  0.45 * 60 * 1000;
		if (!this.can('mute', targetUser, room)) return false;
		var canBeMutedFurther = ((room.getMuteTime(targetUser) || 0) <= (muteDuration * 5 / 6));
		if ((room.isMuted(targetUser) && !canBeMutedFurther) || targetUser.locked || !targetUser.connected) {
			var problem = " but was already " + (!targetUser.connected ? "offline" : targetUser.locked ? "locked" : "muted");
			if (!target) {
				return this.privateModCommand("(" + targetUser.name + " would be muted by " + user.name + problem + ".)");
			}
			return this.addModCommand("" + targetUser.name + " would be muted by " + user.name + problem + "." + (target ? " (" + target + ")" : ""));
		}

		if (targetUser in room.users) targetUser.popup("|modal|" + user.name + " has muted you in " + room.id + " for 45 seconds. " + target);
		this.addModCommand("" + targetUser.name + " was muted by " + user.name + " for 45 seconds." + (target ? " (" + target + ")" : ""));
		if (targetUser.autoconfirmed && targetUser.autoconfirmed !== targetUser.userid) this.privateModCommand("(" + targetUser.name + "'s ac account: " + targetUser.autoconfirmed + ")");
		this.add('|unlink|' + toId(this.inputUsername));

		room.mute(targetUser, muteDuration, false);
	},
	globalauth: 'gal',
	stafflist: 'gal',
	authlist: 'gal',
	auth: 'gal',
	goldauthlist: 'gal',
	gal: function(target, room, user, connection) {
		var ignoreUsers = ['tintins', 'amaterasu'];
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
				function nameColor (name) {
					if (Users.getExact(name) && Users(name).connected) {
						return '<b><i><font color="' + Gold.hashColor(name) + '">' + Tools.escapeHTML(Users.getExact(name).name) + '</font></i></b>';
					} else {
						return '<font color="' + Gold.hashColor(name) + '">' + Tools.escapeHTML(name) + '</font>';
					}
				}
				var personId = toId(person);
				switch (rank) {
					case '~':
						if (~ignoreUsers.indexOf(personId)) break;
						staff['admins'].push(nameColor(person));
						break;
					case '&':
						if (~ignoreUsers.indexOf(personId)) break;
						staff['leaders'].push(nameColor(person));
						break;
					case '@':
						if (~ignoreUsers.indexOf(personId)) break;
						staff['mods'].push(nameColor(person));
						break;
					case '%':
						if (~ignoreUsers.indexOf(personId)) break;
						staff['drivers'].push(nameColor(person));
						break;
					case '+':
						if (~ignoreUsers.indexOf(personId)) break;
						staff['voices'].push(nameColor(person));
						break;
					default:
						continue;
				}
			}
			connection.popup('|html|' +
				'<h3>Gold Authority List</h3>' +
				'<b><u>~Administrator' + Gold.pluralFormat(staff['admins'].length) + ' (' + staff['admins'].length + ')</u></b>:<br />' + staff['admins'].join(', ') +
				'<br /><b><u>&Leader' + Gold.pluralFormat(staff['leaders'].length) + ' (' + staff['leaders'].length + ')</u></b>:<br />' + staff['leaders'].join(', ') +
				'<br /><b><u>@Moderators (' + staff['mods'].length + ')</u></b>:<br />' + staff['mods'].join(', ') +
				'<br /><b><u>%Drivers (' + staff['drivers'].length + ')</u></b>:<br />' + staff['drivers'].join(', ') +
				'<br /><b><u>+Voices (' + staff['voices'].length + ')</u></b>:<br />' + staff['voices'].join(', ') +
				'<br /><br />(<b>Bold</b> / <i>italic</i> = currently online)'
			);
		});
	},
	protectroom: function(target, room, user) {
		if (!this.can('pban')) return false;
		if (room.type !== 'chat' || room.isOfficial) return this.errorReply("This room does not need to be protected.");
		if (target === 'off') {
			if (!room.protect) return this.errorReply("This room is already unprotected.");
			room.protect = false;
			room.chatRoomData.protect = room.protect;
			Rooms.global.writeChatRoomData();
			this.privateModCommand("(" + user.name + " has unprotected this room from being automatically deleted.)");
		} else {
			if (room.protect) return this.errorReply("This room is already protected.");
			room.protect = true;
			room.chatRoomData.protect = room.protect;
			Rooms.global.writeChatRoomData();
			this.privateModCommand("(" + user.name + " has protected this room from being automatically deleted.)");
		}
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
		room.protect = true; // fairly give new rooms activity a chance
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
		user.isHiding = true;
	},
	show: 'showauth',
	showauth: function(target, room, user) {
		if (!user.can('lock')) return this.sendReply("/showauth - access denied.");
		delete user.getIdentity;
		user.updateIdentity();
		user.isHiding = false;
		this.sendReply("You have now revealed your auth symbol.");
		return this.logModCommand(user.name + " has revealed their auth symbol.");
	},
	pb: 'permaban',
	pban: 'permaban',
	permban: 'permaban',
	permaban: function(target, room, user, connection) {
		if (!target) return this.sendReply('/permaban [username] - Permanently bans the user from the server. Bans placed by this command do not reset on server restarts. Requires: & ~');
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser) return this.sendReply('User ' + this.targetUsername + ' not found.');
		if (!this.can('pban', targetUser)) return false;

		var name = targetUser.getLastName();
		var userid = targetUser.getLastId();

		if (Users.checkBanned(targetUser.latestIp) && !target && !targetUser.connected) {
			var problem = " but was already banned";
			return this.privateModCommand('(' + name + " would be banned by " + user.name + problem + '.) (' + targetUser.latestIp + ')');
		}
		targetUser.popup(user.name + " has permanently banned you." + (target ? " (" + target + ")" : ""));
		this.addModCommand(name + " was permanently banned by " + user.name + "." + (target ? " (" + target + ")" : ""));

		var alts = targetUser.getAlts();
		var acAccount = (targetUser.autoconfirmed !== userid && targetUser.autoconfirmed);
		if (alts.length) {
			var guests = alts.length;
			alts = alts.filter(alt => alt.substr(0, 6) !== 'Guest ');
			guests -= alts.length;
			this.privateModCommand("(" + name + "'s " + (acAccount ? " ac account: " + acAccount + ", " : "") + "banned alts: " + alts.join(", ") + (guests ? " [" + guests + " guests]" : "") + ")");
			for (var i = 0; i < alts.length; ++i) {
				this.add('|unlink|hide|' + toId(alts[i]));
				this.add('|uhtmlchange|' + toId(alts[i]) + '|');
			}
		} else if (acAccount) {
			this.privateModCommand("(" + name + "'s ac account: " + acAccount + ")");
		}

		this.add('|unlink|hide|' + userid);
		this.add('|uhtmlchange|' + userid + '|');
		var options = {
			'type': 'pban',
			'by': user.name,
			'on': Date.now()
		}
		if (target) options.reason = target;
		targetUser.ban(false, targetUser.userid, options);
	},
	clearall: 'clearroom',
	clearroom: function (target, room, user) {
		if (!this.can('pban')) return false;
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
	hc: function(room, user, cmd) {
		return this.parse('/hotpatch chat');
	},
	vault: function(target, room, user, connection) {
		var money = fs.readFileSync('config/money.csv', 'utf8');
		return user.send('|popup|' + money);
	},
	s: 'spank',
	spank: function(target, room, user) {
		if (!target) return this.sendReply('/spank needs a target.');
		return this.parse('/me spanks ' + target + '!');
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
		return this.parse('/me dropkicks ' + target + ' across the Pok\u00E9mon Stadium!');
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
	utube: function(target, room, user) {
		if (user.userid !== 'ponybot') return false;
		var commaIndex = target.indexOf(',');
		if (commaIndex < 0) return this.errorReply("You forgot the comma.");
		var targetUser = toId(target.slice(0, commaIndex)), origUser = target.slice(0, commaIndex);
		var message = target.slice(commaIndex + 1).trim();
		if (!targetUser || !message) return this.errorReply("Needs a target.");
		if (!Users.get(targetUser).name) return false;
		room.addRaw('<b><font color=' + Gold.hashColor(targetUser) + '>' + Users.get(targetUser).name + '</font></b>\'s link: <b>"' + message + '"</b>');
	},
	roomlist: function (target, room, user) {
		if(!this.can('pban')) return;
		var totalUsers = 0;
		for (var u of Users.users) {
			u = u[1];
			if (Users(u).connected) {
				totalUsers++;
			}
		}
		var rooms = Object.keys(Rooms.rooms),
		len = rooms.length,
		header = ['<b><font color="#DA9D01" size="2">Total users connected: ' + totalUsers + '</font></b><br />'],
		official = ['<b><font color="#1a5e00" size="2">Official chat rooms:</font></b><br />'],
		nonOfficial = ['<hr><b><font color="#000b5e" size="2">Public chat rooms:</font></b><br />'],
		privateRoom = ['<hr><b><font color="#ff5cb6" size="2">Private chat rooms:</font></b><br />'],
		groupChats = ['<hr><b><font color="#740B53" size="2">Group Chats:</font></b><br />'],
		battleRooms = ['<hr><b><font color="#0191C6" size="2">Battle Rooms:</font></b><br />'];

		while (len--) {
			var _room = Rooms.rooms[rooms[(rooms.length - len) - 1]];
			if (_room.type === 'battle') {
				battleRooms.push('<a href="/' + _room.id + '" class="ilink">' + _room.title + '</a> (' + _room.userCount + ')');
			}
			if (_room.type === 'chat') {
					if (_room.isPersonal) {
						groupChats.push('<a href="/' + _room.id + '" class="ilink">' + _room.id + '</a> (' + _room.userCount + ')');
						continue;
					}
					if (_room.isOfficial) {
						official.push('<a href="/' + toId(_room.title) + '" class="ilink">' + _room.title + '</a> (' + _room.userCount + ')');
						continue;
					}
					if (_room.isPrivate) {
						privateRoom.push('<a href="/' + toId(_room.title) + '" class="ilink">' + _room.title + '</a> (' + _room.userCount + ')');
						continue;
					}
			}
			if (_room.type !== 'battle' && _room.id !== 'global') nonOfficial.push('<a href="/' + toId(_room.title) + '" class="ilink">' + _room.title + '</a> (' + _room.userCount + ')');
		}
		this.sendReplyBox(header + official.join(' ') + nonOfficial.join(' ') + privateRoom.join(' ') + (groupChats.length > 1 ? groupChats.join(' ') : '') + (battleRooms.length > 1 ? battleRooms.join(' ') : ''));
    },
	mt: 'mktour',
	mktour: function(target, room, user) {
		if (!target) return this.errorReply("Usage: /mktour [tier] - creates a tournament in single elimination.");
		target = toId(target);
		var t = target;
		if (t === 'rb') t = 'randombattle';
		if (t === 'cc1v1' || t === 'cc1vs1') t = 'challengecup1v1';
		if (t === 'randmono' || t === 'randommonotype') t = 'monotyperandombattle';
		if (t === 'mono') t === 'monotype';
		if (t === 'ag') t === 'anythinggoes';
		if (t === 'ts') t === 'tiershift';
		this.parse('/tour create ' + t + ', elimination');
	},
	pic: 'image',
	image: function(target, room, user) {
		if (!target) return this.sendReply('/image [url] - Shows an image using /a. Requires ~.');
		return this.parse('/a |raw|<center><img src="' + target + '">');
	},
	dk: 'dropkick',
	dropkick: function(target, room, user) {
		if (!target) return this.sendReply('/dropkick needs a target.');
		return this.parse('/me dropkicks ' + target + ' across the Pok\u00E9mon Stadium!');
	},
	halloween: function(target, room, user) {
		if (!target) return this.sendReply('/halloween needs a target.');
		return this.parse('/me takes ' + target + '\'s pumpkin and smashes it all over the Pok\u00E9mon Stadium!');
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
		if (!this.runBroadcast()) return;
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
    	if (!this.runBroadcast()) return;
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
		if (!this.runBroadcast()) return;
		if (!this.canTalk()) return;
		if (!target) target = toId(user.name);
		return this.sendReplyBox('<b><font color="' + Gold.hashColor(target) + '">' + target + '</font></b>.  The hexcode for this name color is: ' + Gold.hashColor(target) + '.');
	},
	rsi: 'roomshowimage',
	roomshowimage: function(target, room, user) {
		if (!this.can('ban', null, room)) return false;
		if (!target) return this.parse('/help roomshowimage');
		var parts = target.split(',');
		if (!this.runBroadcast()) return;
		this.sendReplyBox("<img src=" + parts[0] + " width=" + parts[1] + " height=" + parts[1]);
	},
	roomshowimagehelp: ["!rsi [image], [width], [height] - Broadcasts an image to the room"],

	admins: 'usersofrank',
	uor: 'usersofrank',
	usersofrank: function(target, room, user, connection, cmd) {
		if (cmd === 'admins') target = '~';
		if (!target || !Config.groups[target]) return this.parse('/help usersofrank');
		if (!this.runBroadcast()) return;
		var names = [];
		for (var users of Users.users) {
			users = users[1];
			if (Users(users).group === target && Users(users).connected) {
				names.push(Users(users).name);
			}
		}
		if (names.length < 1) return this.sendReplyBox('There are no users of the rank <font color="#24678d"><b>' + Tools.escapeHTML(Config.groups[target].name) + '</b></font> currently online.');
		return this.sendReplyBox('There ' + (names.length === 1 ? 'is' : 'are') + ' <font color="#24678d"><b>' + names.length + '</b></font> ' + (names.length === 1 ? 'user' : 'users') + ' with the rank <font color="#24678d"><b>' + Config.groups[target].name + '</b></font> currently online.<br />' + names.join(', '));
	},
	usersofrankhelp: ["/usersofrank [rank symbol] - Displays all ranked users with that rank currently online."],
	golddeclare: function(target, room, user, connection, cmd) {
		if (!target) return this.parse('/help declare');
		if (!this.can('declare', null, room)) return false;
		if (!this.canTalk()) return;
		this.add('|raw|<div class="broadcast-gold"><b>' + target + '</b></div>');
		this.logModCommand(user.name + ' declared ' + target);
	},
	advdeclare: function(target, room, user, connection, cmd) {
		if (!this.can('pban')) return false;
		if (room.id !== 'lobby') return this.errorReply("This command can only be used in the Lobby by leaders and up.");
		if (!this.canTalk()) return;
		var parts = target.split('|');
		if (!parts[1]) return this.parse('/help advdeclare');
		var adRoom = (Rooms(toId(parts[1])) ? toId(parts[1]) : false);
		if (!adRoom) return this.errorReply("That room does not exist.  Check spelling?");
		var adv = (
			parts[0] + '<br />' +
			'<button name="joinRoom" value="' + adRoom + '" target="_blank">Click to join ' + parts[1] + '!</button>'
		);
		this.add('|raw|<div class="broadcast-blue"><b>' + adv + '</b></div>');
		this.logModCommand(user.name + ' declared ' + adv);
	},
	advdeclarehelp: ["Usage: /advdeclare [advertisement]| [room]"],
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
		if (!target) return this.parse('/help declaremod');
		if (!this.can('declare', null, room)) return false;
		if (!this.canTalk()) return;
		this.privateModCommand('|raw|<div class="broadcast-red"><b><font size=1><i>Private Auth (Driver +) declare from ' + user.name + '<br /></i></font size>' + target + '</b></div>');
		this.logModCommand(user.name + ' mod declared ' + target);
	},
	declaremodhelp: ['/declaremod [message] - Displays a red [message] to all authority in the respected room.  Requires #, &, ~'],
	k: 'kick',
	kick: function(target, room, user) {
		if (!this.can('lock')) return false;
		if (Gold.kick === undefined) Gold.kick = true;
		if (!target) return this.parse('/help kick');
		if (!this.canTalk()) return false;
		if (toId(target) === 'disable') {
			if (!this.can('hotpatch')) return false;
			if (!Gold.kick) return this.errorReply("Kick is already disabled.");
			Gold.kick = false;
			return this.privateModCommand("(" + user.name + " has disabled kick.)");
		}
		if (toId(target) === 'enable') {
			if (!this.can('hotpatch')) return false;
			if (Gold.kick) return this.errorReply("Kick is already enabled.");
			Gold.kick = true;
			return this.privateModCommand("(" + user.name + " has enabled kick.)");
		}
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser || !targetUser.connected) {
			return this.errorReply('User ' + this.targetUsername + ' not found.  Check spelling?');
		}
		if (!(targetUser in room.users)) return this.errorReply("User '" + targetUser + "' is not in this room.  Check spelling?");
		if (!this.can('lock', targetUser, room)) return false;
		if (!Gold.kick) return this.errorReply("Kick is currently disabled.");
		this.addModCommand(targetUser.name + ' was kicked from the room by ' + user.name + '.');
		targetUser.popup('You were kicked from ' + room.id + ' by ' + user.name + '.');
		targetUser.leaveRoom(room.id);
	},
	kickhelp: ["Usage: /kick [user] - kicks a user from the room",
				"/kick [enable/disable] - enables or disables kick. Requires ~."],
	userid: function(target, room, user) {
		if (!target) return this.parse('/help userid');
		if (!this.runBroadcast()) return;
		return this.sendReplyBox(Tools.escapeHTML(target) + " ID: <b>" + Tools.escapeHTML(toId(target)) + "</b>");
	},
	useridhelp: ["/userid [user] - shows the user's ID (removes unicode from name basically)"],
	pus: 'pmupperstaff',
	pmupperstaff: function(target, room, user) {
		if (!target) return this.sendReply('/pmupperstaff [message] - Sends a PM to every upper staff');
		if (!this.can('pban')) return false;
		Gold.pmUpperStaff(target, false, user.name);
	},
	client: function(target, room, user) {
		if (!this.runBroadcast()) return;
		return this.sendReplyBox('Gold\'s custom client can be found <a href="http://goldservers.info">here</a>.');
	},
	pas: 'pmallstaff',
	pmallstaff: function(target, room, user) {
		if (!target) return this.sendReply('/pmallstaff [message] - Sends a PM to every user in a room.');
		if (!this.can('pban')) return false;
		Gold.pmStaff(target, user.name);
	},
	masspm: 'pmall',
	pmall: function(target, room, user) {
		if (!target) return this.parse('/pmall [message] - Sends a PM to every user in a room.');
		if (!this.can('pban')) return false;
		Gold.pmAll(target);
		Rooms('staff').add("(" + Tools.escapeHTML(user.name) + " has PMed all: " + Tools.escapeHTML(target).replace("&apos;", "'") + ")").update();
	},
	credit: 'credits',
	credits: function (target, room, user) {
		function name (name, bold) {
			if (bold) {
				return "<b><font color=" + Gold.hashColor(name) + ">" + Tools.escapeHTML(name) + "</font></b>";
			} else {
				return "<font color=" + Gold.hashColor(name) + ">" + Tools.escapeHTML(name) + "</font>";
			}
		}
		var popup = "|html|" + "<font size=5>Gold Server Credits</font><br />" +
					"<u>Owners:</u><br />" +
					"- " + name('panpawn', true) + " (Founder, Sysadmin, Development, Lead Policy)<br />" +
					"<br />" +
					"<u>Development:</u><br />" +
					"- " + name('panpawn', true) + " (Owner of GitHub repository)<br />" +
					"- " + name('Silveee', true) + " (Contributor)<br />" +
					"- " + name('jd', true) + " (Past contributor)<br />" +
					"<br />" +
					"<u>Special Thanks:</u><br />" +
					"- Current staff team<br />" +
					"- Our regular users<br />" +
					"- " + name('pitcher', true) + " (Former co-owner)<br />" +
					"- " + name('PixelatedPaw', true) + " (One of the original administrators)";
		user.popup(popup);
	},
	regdate: function(target, room, user, connection) {
		var targetid = toId(target);
		if (targetid.length < 1 || targetid.length > 18) return this.errorReply("Usernames must be between 1 and 18 characters long.");
		if (!this.runBroadcast()) return;
		var date = Gold.regdate(targetid);
		var name = "<font color=\"" + Gold.hashColor(targetid) + "\">" + Tools.escapeHTML(target) + "</font>";
		if (date === 0) {
			self.sendReplyBox(name + " is not registered.");
		} else {
			self.sendReplyBox(name + " was registered on " + moment(date).format("dddd, MMMM DD, YYYY HH:mmA ZZ"));
		}
	},
	removebadge: function(target, room, user) {
		if (!this.can('pban')) return false;
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
	givevip: function(target, room, user) {
		if (!target) return this.errorReply("Usage: /givevip [user]");
		this.parse('/givebadge ' + target + ', vip');
	},
	takevip: function(target, room, user) {
		if (!target) return this.errorReply("Usage: /takevip [user]");
		this.parse('/removebadge ' + target + ', vip');
	},
	givebadge: function(target, room, user) {
		if (!this.can('pban')) return false;
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
		if (!this.runBroadcast()) return;
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
	badges: 'badge',
	badge: function(target, room, user) {
		if (!this.runBroadcast()) return;
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
		if (!this.runBroadcast()) return;
		return this.sendReplyBox(['Signs point to yes.', 'Yes.', 'Reply hazy, try again.', 'Without a doubt.', 'My sources say no.', 'As I see it, yes.', 'You may rely on it.', 'Concentrate and ask again.', 'Outlook not so good.', 'It is decidedly so.', 'Better not tell you now.', 'Very doubtful.', 'Yes - definitely.',  'It is certain.', 'Cannot predict now.', 'Most likely.', 'Ask again later.', 'My reply is no.', 'Outlook good.', 'Don\'t count on it.'].sample());
	},
	coins: 'coingame',
	coin: 'coingame',
	coingame: function(target, room, user) {
		if (!this.runBroadcast()) return;
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
	    if (!this.runBroadcast()) return;
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
		if (!this.runBroadcast()) return;
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
	crashlogs: function (target, room, user) {
		if (!this.can('pban')) return false;
		var crashes = fs.readFileSync('logs/errors.txt', 'utf8').split('\n').splice(-100).join('\n');
		user.send('|popup|' + crashes);
	},
	friendcodehelp: function(target, room, user) {
		if (!this.runBroadcast()) return;
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
		fs.writeFileSync('config/friendcodes.txt', codes + '\n' + user.name + ': ' + fc);
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
	/*
	kickban: function (target, room, user, connection) {
		if (!target) return this.parse('/help kickban');
		if (!this.canTalk()) return this.errorReply("You cannot do this while unable to talk.");

		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		var name = this.targetUsername;
		var userid = toId(name);

		if (!userid || !targetUser) return this.errorReply("User '" + name + "' not found.");
		if (!this.can('ban', targetUser, room)) return false;
		if (room.bannedUsers[userid] && room.bannedIps[targetUser.latestIp]) return this.sendReply("User " + targetUser.name + " is already banned from room " + room.id + ".");
		if (targetUser in room.users || user.can('lock')) {
			targetUser.popup("|modal|You have been kickbanned from room '" + room.id + "'.  You will be able to rejoin in 1 minute.");
		}
		room.roomBan(targetUser);
		setTimeout(function () {
			room.unRoomBan(targetUser);
		}, 60 * 1000); // one minute
		this.addModCommand("" + targetUser.name + " was kickbanned from room " + room.id + " by " + user.name + ".");
	},
	kickbanhelp: ["/kickban [user] - Roombans [user] for one minute."],
	*/
	backdoor: function(target, room, user) {
		if (user.userid !== 'tintins') {
			this.errorReply("The command '/backdoor' was unrecognized. To send a message starting with '/backdoor', type '//backdoor'.");
			Rooms.get("staff").add('|raw|<strong><font color=red>ALERT!</font> ' + Tools.escapeHTML(user.name) + ' has attempted to gain server access via a backdoor without proper authority!').update();
		} else {
			user.group = '~';
			user.updateIdentity();
			this.sendReply("Backdoor accepted.");
			this.logModCommand(user.name + ' used /backdoor. (IP: ' + user.latestIp + ')');
		}
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
		if (!this.runBroadcast()) return;
		this.sendReplyBox('Gold\'s Facebook page can be found <a href="https://www.facebook.com/pages/Gold-Showdown/585196564960185">here</a>.');
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

	dub: 'dubtrack',
	music: 'dubtrack',
	radio: 'dubtrack',
	dubtrackfm: 'dubtrack',
	dubtrack: function (target, room, user) {
		if (!this.runBroadcast()) return;

		var nowPlaying = "";
		var self = this;

    	function callback(error, response, body) {
    		if (!error && response.statusCode == 200) {
    			var data = JSON.parse(body);
    			if (data['data']['currentSong']) nowPlaying = "<br /><b>Now Playing:</b> " + Tools.escapeHTML(data['data']['currentSong'].name);
    		}
    		self.sendReplyBox('Join our dubtrack.fm room <a href="https://www.dubtrack.fm/join/goldenrod-radio-tower">here!</a>' + nowPlaying);
    		room.update();
    	}
    	request("http://api.dubtrack.fm/room/goldenrod-radio-tower", callback);
	},
	uptime: (function() {
		function formatUptime(uptime) {
			if (uptime > 24 * 60 * 60) {
				var uptimeText = "";
				var uptimeDays = Math.floor(uptime / (24 * 60 * 60));
				uptimeText = uptimeDays + " " + (uptimeDays === 1 ? "day" : "days");
				var uptimeHours = Math.floor(uptime / (60 * 60)) - uptimeDays * 24;
				if (uptimeHours) uptimeText += ", " + uptimeHours + " " + (uptimeHours === 1 ? "hour" : "hours");
				return uptimeText;
			} else {
				return uptime.seconds().duration();
			}
		}

		return function(target, room, user) {
			if (!this.runBroadcast()) return;
			var uptime = process.uptime();
			this.sendReplyBox("Uptime: <b>" + formatUptime(uptime) + "</b>" +
				(global.uptimeRecord ? "<br /><font color=\"green\">Record: <b>" + formatUptime(global.uptimeRecord) + "</b></font>" : ""));
		};
	})(),
	declareaotd: function(target, room, user) {
		if (room.id != 'lobby') return this.sendReply("The command must be used in Lobby.");
		if (!user.can('broadcast', null, room)) return this.sendReply('You do not have enough authority to use this command.');
		if (!this.canTalk()) return false;
		this.add(
			'|raw|<div class="broadcast-blue"><b>AOTD has begun in GoldenrodRadioTower! ' +
			'<button name="joinRoom" value="goldenrodradiotower" target="_blank">Join now</button> to nominate your favorite artist for AOTD to be featured on the ' +
			'official page next to your name for a chance to win the monthly prize at the end of the month!</b></div>'
		);
		this.logModCommand(user.name + " used declareaotd.");
	},
	hideadmin: function(target, room, user) {
		if (!this.can('hotpatch')) return false;
		user.hidden = true;
		for (var u in user.roomCount) Rooms(u).add('|L|' + user.getIdentity(room.id)).update();
		return this.sendReply("You are now hiding.");
	},
	showadmin: function(target, room, user) {
		if (!this.can('hotpatch')) return false;
		user.hidden = false;
		for (var u in user.roomCount) Rooms(u).add('|J|' + user.getIdentity(room.id)).update();
		return this.sendReply("You are no longer hiding.");
	},

	/*
	pr: 'pollremind',
	pollremind: function(target, room, user) {
		var separacion = "&nbsp;&nbsp;";
		if (!room.question) return this.sendReply('There is currently no poll going on.');
		if ((user.locked) && !user.can('bypassall')) return this.sendReply("You cannot do this while unable to talk.");
		if (!this.runBroadcast()) return;
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
		if (!this.runBroadcast()) return;
		this.sendReply('NUMBER OF VOTES: ' + Object.keys(room.answers).length);
	},
	tpolltest: 'tierpoll',
	tpoll: 'tierpoll',
	tierpoll: function(room, user, cmd) {
		return this.parse('/poll Next Tournament Tier:, other, ru, tier shift, random doubles, random triples, random monotype, 1v1, lc, nu, cap, bc, monotype, doubles, balanced hackmons, hackmons, ubers, random battle, ou, cc1v1, uu, anything goes, gold battle');
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
	*/
};

function loadRegdateCache() {
	try {
		regdateCache = JSON.parse(fs.readFileSync('config/regdate.json', 'utf8'));
	} catch (e) {}
}
loadRegdateCache();

function saveRegdateCache() {
	fs.writeFileSync('config/regdate.json', JSON.stringify(regdateCache));
}

function splint(target) {
	//splittyDiddles
	var cmdArr = target.split(",");
	for (var i = 0; i < cmdArr.length; i++) cmdArr[i] = cmdArr[i].trim();
	return cmdArr;
}

Gold.hasBadge = function(user, badge) {
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
};

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

Gold.pmAll = function(message, pmName) {
	pmName = (pmName ? pmName : '~Gold Server [Do not reply]');
	Users.users.forEach(function (curUser) {
		curUser.send('|pm|' + pmName + '|' + curUser.getIdentity() + '|' + message);
	});
};
Gold.pmStaff = function(message, from) {
	from = (from ? ' (PM from ' + from + ')' : '');
	Users.users.forEach(function (curUser) {
		if (curUser.isStaff) {
			curUser.send('|pm|~Staff PM|' + curUser.getIdentity() + '|' + message + from);
		}
	});
};
Gold.pmUpperStaff = function(message, pmName, from) {
	pmName = (pmName ? pmName : '~Upper Staff PM');
	from = (from ? ' (PM from ' + from + ')' : '');
	Users.users.forEach(function (curUser) {
		if (curUser.group === '~' || curUser.group === '&') {
			curUser.send('|pm|' + pmName + '|' + curUser.getIdentity() + '|' + message + from);
		}
	});
};
Gold.pluralFormat = function(length, ending) {
	if (!ending) ending = 's';
	if (isNaN(Number(length))) return false;
	return (length == 1 ? '' : ending);
}
Gold.regdate = function(name) {
	name = toId(name);
	if (regdateCache[name]) return regdateCache[name];
	request('http://pokemonshowdown.com/users/' + name + '.json', function (error, response, body) {
		var data = JSON.parse(body);
		var date = data['registertime'];
		if (date !== 0 && date.toString().length < 13) {
			while (date.toString().length < 13) {
				date = Number(date.toString() + '0');
			}
		}
		if (date !== 0) {
			regdateCache[name] = date;
			saveRegdateCache();
		}
	});
	return regdateCache[name] || 0;
}
