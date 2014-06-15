/**
 * Commands
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * These are commands. For instance, you can define the command 'whois'
 * here, then use it by typing /whois into Pokemon Showdown.
 *
 * A command can be in the form:
 *   ip: 'whois',
 * This is called an alias: it makes it so /ip does the same thing as
 * /whois.
 *
 * But to actually define a command, it's a function:
 *   birkal: function (target, room, user) {
 *     this.sendReply("It's not funny anymore.");
 *   },
 *
 * Commands are actually passed five parameters:
 *   function (target, room, user, connection, cmd, message)
 * Most of the time, you only need the first three, though.
 *
 * target = the part of the message after the command
 * room = the room object the message was sent to
 *   The room name is room.id
 * user = the user object that sent the message
 *   The user's name is user.name
 * connection = the connection that the message was sent from
 * cmd = the name of the command
 * message = the entire message sent by the user
 *
 * If a user types in "/msg zarel, hello"
 *   target = "zarel, hello"
 *   cmd = "msg"
 *   message = "/msg zarel, hello"
 *
 * Commands return the message the user should say. If they don't
 * return anything or return something falsy, the user won't say
 * anything.
 *
 * Commands have access to the following functions:
 *
 * this.sendReply(message)
 *   Sends a message back to the room the user typed the command into.
 *
 * this.sendReplyBox(html)
 *   Same as sendReply, but shows it in a box, and you can put HTML in
 *   it.
 *
 * this.popupReply(message)
 *   Shows a popup in the window the user typed the command into.
 *
 * this.add(message)
 *   Adds a message to the room so that everyone can see it.
 *   This is like this.sendReply, except everyone in the room gets it,
 *   instead of just the user that typed the command.
 *
 * this.send(message)
 *   Sends a message to the room so that everyone can see it.
 *   This is like this.add, except it's not logged, and users who join
 *   the room later won't see it in the log, and if it's a battle, it
 *   won't show up in saved replays.
 *   You USUALLY want to use this.add instead.
 *
 * this.logEntry(message)
 *   Log a message to the room's log without sending it to anyone. This
 *   is like this.add, except no one will see it.
 *
 * this.addModCommand(message)
 *   Like this.add, but also logs the message to the moderator log
 *   which can be seen with /modlog.
 *
 * this.logModCommand(message)
 *   Like this.addModCommand, except users in the room won't see it.
 *
 * this.can(permission)
 * this.can(permission, targetUser)
 *   Checks if the user has the permission to do something, or if a
 *   targetUser is passed, check if the user has permission to do
 *   it to that user. Will automatically give the user an "Access
 *   denied" message if the user doesn't have permission: use
 *   user.can() if you don't want that message.
 *
 *   Should usually be near the top of the command, like:
 *     if (!this.can('potd')) return false;
 *
 * this.canBroadcast()
 *   Signifies that a message can be broadcast, as long as the user
 *   has permission to. This will check to see if the user used
 *   "!command" instead of "/command". If so, it will check to see
 *   if the user has permission to broadcast (by default, voice+ can),
 *   and return false if not. Otherwise, it will set it up so that
 *   this.sendReply and this.sendReplyBox will broadcast to the room
 *   instead of just the user that used the command.
 *
 *   Should usually be near the top of the command, like:
 *     if (!this.canBroadcast()) return false;
 *
 * this.canTalk()
 *   Checks to see if the user can speak in the room. Returns false
 *   if the user can't speak (is muted, the room has modchat on, etc),
 *   or true otherwise.
 *
 *   Should usually be near the top of the command, like:
 *     if (!this.canTalk()) return false;
 *
 * this.canTalk(message)
 *   Checks to see if the user can say the message. In addition to
 *   running the checks from this.canTalk(), it also checks to see if
 *   the message has any banned words or is too long. Returns the
 *   filtered message, or a falsy value if the user can't speak.
 *
 *   Should usually be near the top of the command, like:
 *     target = this.canTalk(target);
 *     if (!target) return false;
 *
 * this.parse(message)
 *   Runs the message as if the user had typed it in.
 *
 *   Mostly useful for giving help messages, like for commands that
 *   require a target:
 *     if (!target) return this.parse('/help msg');
 *
 *   After 10 levels of recursion (calling this.parse from a command
 *   called by this.parse from a command called by this.parse etc)
 *   we will assume it's a bug in your command and error out.
 *
 * this.targetUserOrSelf(target)
 *   If target is blank, returns the user that sent the message.
 *   Otherwise, returns the user with the username in target, or
 *   a falsy value if no user with that username exists.
 *
 * this.splitTarget(target)
 *   Splits a target in the form "user, message" into its
 *   constituent parts. Returns message, and sets this.targetUser to
 *   the user, and this.targetUsername to the username.
 *
 *   Remember to check if this.targetUser exists before going further.
 *
 * Unless otherwise specified, these functions will return undefined,
 * so you can return this.sendReply or something to send a reply and
 * stop the command there.
 *
 * @license MIT license
 */
var commands = exports.commands = {

	ip: 'whois',
	rooms: 'whois',
	alt: 'whois',
	alts: 'whois',
	whois: function (target, room, user) {
		var targetUser = this.targetUserOrSelf(target, user.group === ' ');
		if (!targetUser) {
			return this.sendReply("User " + this.targetUsername + " not found.");
		}
		this.sendReply("User: " + targetUser.name);
		if (user.can('alts', targetUser)) {
			var alts = targetUser.getAlts();
			var output = Object.keys(targetUser.prevNames).join(", ");
			if (output) this.sendReply("Previous names: " + output);

			for (var j = 0; j < alts.length; ++j) {
				var targetAlt = Users.get(alts[j]);
				if (!targetAlt.named && !targetAlt.connected) continue;
				if (targetAlt.group === '~' && user.group !== '~') continue;

				this.sendReply("Alt: " + targetAlt.name);
				output = Object.keys(targetAlt.prevNames).join(", ");
				if (output) this.sendReply("Previous names: " + output);
			}
		}
		if (Config.groups[targetUser.group] && Config.groups[targetUser.group].name) {
			this.sendReply("Group: " + Config.groups[targetUser.group].name + " (" + targetUser.group + ")");
		}
		if (targetUser.goldDev) {
			this.sendReply('(Gold Development Staff)');
		}
		if (targetUser.goldVip) {
			this.sendReply('|html|(<font color="gold">VIP</font> User)');
		}
		if (targetUser.isSysop) {
			this.sendReply("(Pok\xE9mon Showdown System Operator)");
		}
		if (!targetUser.authenticated) {
			this.sendReply("(Unregistered)");
		}
		if (!this.broadcasting && (user.can('ip', targetUser) || user === targetUser)) {
			var ips = Object.keys(targetUser.ips);
			this.sendReply("IP" + ((ips.length > 1) ? "s" : "") + ": " + ips.join(", "));
		}
		if (targetUser.canCustomSymbol || targetUser.canCustomAvatar || targetUser.canAnimatedAvatar || targetUser.canChatRoom || targetUser.canTrainerCard || targetUser.canFixItem || targetUser.canDecAdvertise || targetUser.canBadge || targetUser.canPOTD || targetUser.canForcerename || targetUser.canMusicBox) {
			var i = '';
			if (targetUser.canCustomSymbol) i += ' Custom Symbol';
			if (targetUser.canCustomAvatar) i += ' Custom Avatar';
			if (targetUser.canAnimatedAvatar) i += ' Animated Avatar';
			if (targetUser.canChatRoom) i += ' Chat Room';
			if (targetUser.canTrainerCard) i += ' Trainer Card';
			if (targetUser.canFixItem) i += ' Alter card/avatar/music box';
			if (targetUser.canDecAdvertise) i += ' Declare Advertise';
			if (targetUser.canBadge) i += ' VIP Badge / Global Voice';
			if (targetUser.canMusicBox) i += ' Music Box';
			if (targetUser.canPOTD) i += ' POTD';
			if (targetUser.canForcerename) i += ' Forcerename'
			this.sendReply('Eligible for: ' + i);
		}
		var output = "In rooms: ";
		var first = true;
		for (var i in targetUser.roomCount) {
			if (i === 'global' || Rooms.get(i).isPrivate) continue;
			if (!first) output += " | ";
			first = false;

			output += '<a href="/' + i + '" room="' + i + '">' + i + '</a>';
		}
		if (!targetUser.connected || targetUser.isAway) {
			this.sendReply('|raw|This user is ' + ((!targetUser.connected) ? '<font color = "red">offline</font>.' : '<font color = "orange">away</font>.'));
		}
		this.sendReply('|raw|' + output);
	},
	
	aip: 'inprivaterooms',
	awhois: 'inprivaterooms',
	allrooms: 'inprivaterooms',
	prooms: 'inprivaterooms',
	adminwhois: 'inprivaterooms',
	inprivaterooms: function(target, room, user) {
	if (!this.can('seeprivaterooms')) return false;
		var targetUser = this.targetUserOrSelf(target);
		if (!targetUser) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}

		this.sendReply('User: '+targetUser.name);
		if (user.can('seeprivaterooms',targetUser)) {
			var alts = targetUser.getAlts();
			var output = '';
			for (var i in targetUser.prevNames) {
				if (output) output += ", ";
				output += targetUser.prevNames[i];
			}
			if (output) this.sendReply('Previous names: '+output);

			for (var j=0; j<alts.length; j++) {
				var targetAlt = Users.get(alts[j]);
				if (!targetAlt.named && !targetAlt.connected) continue;


				this.sendReply('Alt: '+targetAlt.name);
				output = '';
				for (var i in targetAlt.prevNames) {
					if (output) output += ", ";
					output += targetAlt.prevNames[i];
				}
				if (output) this.sendReply('Previous names: '+output);
			}
		}
		if (config.groups[targetUser.group] && config.groups[targetUser.group].name) {
			this.sendReply('Group: ' + config.groups[targetUser.group].name + ' (' + targetUser.group + ')');
		}
		if (targetUser.isSysop) {
			this.sendReply('(Pok\xE9mon Showdown System Operator)');
		}
		if (targetUser.goldDev) {
			this.sendReply('(Gold Development Staff)');
		}
		if (!targetUser.authenticated) {
			this.sendReply('(Unregistered)');
		}
		if (!this.broadcasting && (user.can('ip', targetUser) || user === targetUser)) {
			var ips = Object.keys(targetUser.ips);
			this.sendReply('IP' + ((ips.length > 1) ? 's' : '') + ': ' + ips.join(', '));
		}
		var output = 'In all rooms: ';
		var first = false;
		for (var i in targetUser.roomCount) {
			if (i === 'global' || Rooms.get(i).isPublic) continue;
			if (!first) output += ' | ';
			first = false;

			output += '<a href="/'+i+'" room="'+i+'">'+i+'</a>';
		}
		this.sendReply('|raw|'+output);
	},
	
	tiertest: function(target, room, user) {
        	if (!this.canBroadcast()) return;
        	var targetId = toId(target);
        	var newTargets = Tools.dataSearch(target);
        	if (newTargets && newTargets.length) {
                	for (var i = 0; i < newTargets.length; i++) {
                        	var template = Tools.getTemplate(newTargets[i].species);
                        	return this.sendReplyBox("" + template.name + " is in the " + template.tier + " tier.");
                        	}
        	} else {
                	return this.sendReplyBox("No Pokemon named '" + target + "' was found.");
        	}
	},

	fork: function(target, room, user) {
		if (!this.canBroadcast()) return;
		if (!this.canTalk()) return;
			this.sendReplyBox('<center><img src="http://i.imgur.com/HrDUGmr.png" width=75 height= 100>');
	},
	
	aotdtest: function (target, room, user) {
        			if (room.id !== 'thestudio') return this.sendReply("This command can only be used in The Studio.");
				if (!target) {
                			if (!this.canBroadcast()) return;
                			this.sendReplyBox("The current Artist of the Day is: <b>" + Tools.escapeHTML(room.aotd) + "</b>");
                			return;
        			}
        			if (!this.canTalk()) return;
        			if (target.length > 25) {
                			return this.sendReply("This Artist\'s name is too long; it cannot exceed 25 characters.");
        			}
        			if (!this.can('ban', null, room)) return;
        			room.aotd = target;
        			Rooms.rooms.thestudio.addRaw(
        				'<div class=\"broadcast-green\"><font size="2"><b>The Artist of the Day is now </font><b><font color="black" size="2">' + Tools.escapeHTML(target) + '</font></b><br />' +
        				'(Set by ' + Tools.escapeHTML(user.name) + '.)<br />' +
        				'This Artist will be posted on our <a href="http://thepsstudioroom.weebly.com/artist-of-the-day.html">Artist of the Day page</a>.</div>'
        			);
        			room.aotdOn = false;
        			this.logModCommand("The Artist of the Day was changed to " + Tools.escapeHTML(target) + " by " + Tools.escapeHTML(user.name) + ".");
			},
            	

	
	ipsearch: function (target, room, user) {
		if (!this.can('rangeban')) return;
		var atLeastOne = false;
		this.sendReply("Users with IP " + target + ":");
		for (var userid in Users.users) {
			var user = Users.users[userid];
			if (user.latestIp === target) {
				this.sendReply((user.connected ? " + " : "-") + " " + user.name);
				atLeastOne = true;
			}
		}
		if (!atLeastOne) this.sendReply("No results found.");
		
	},

	gdeclarered: 'gdeclare',
	gdeclaregreen: 'gdeclare',
	gdeclare: function(target, room, user, connection, cmd) {
		if (!target) return this.parse('/help gdeclare');
		if (!this.can('lockdown')) return false;

		var roomName = (room.isPrivate)? 'a private room' : room.id;

		if (cmd === 'gdeclare'){
			for (var id in Rooms.rooms) {
				if (id !== 'global') Rooms.rooms[id].addRaw('<div class="broadcast-blue"><b><font size=1><i>Global declare from '+roomName+'<br /></i></font size>'+target+'</b></div>');
			}
		}
		if (cmd === 'gdeclarered'){
			for (var id in Rooms.rooms) {
				if (id !== 'global') Rooms.rooms[id].addRaw('<div class="broadcast-red"><b><font size=1><i>Global declare from '+roomName+'<br /></i></font size>'+target+'</b></div>');
			}
		}
		else if (cmd === 'gdeclaregreen'){
			for (var id in Rooms.rooms) {
				if (id !== 'global') Rooms.rooms[id].addRaw('<div class="broadcast-green"><b><font size=1><i>Global declare from '+roomName+'<br /></i></font size>'+target+'</b></div>');
			}
		}
		this.logEntry(user.name + ' used /gdeclare');

	},

	declaregreen: 'declarered',
	declarered: function(target, room, user, connection, cmd) {
		if (!target) return this.parse('/help declare');
		if (!this.can('declare', null, room)) return false;

		if (!this.canTalk()) return;

		if (cmd === 'declarered'){
			this.add('|raw|<div class="broadcast-red"><b>'+target+'</b></div>');
		}
		else if (cmd === 'declaregreen'){
			this.add('|raw|<div class="broadcast-green"><b>'+target+'</b></div>');
		}
		this.logModCommand(user.name+' declared '+target);
	},
	declaregreen: 'declarered',
	declarered: function(target, room, user, connection, cmd) {
		if (!target) return this.parse('/help declare');
		if (!this.can('declare', null, room)) return false;

		if (!this.canTalk()) return;

		if (cmd === 'declarered'){
			this.add('|raw|<div class="broadcast-red"><b>'+target+'</b></div>');
		}
		else if (cmd === 'declaregreen'){
			this.add('|raw|<div class="broadcast-green"><b>'+target+'</b></div>');
		}
		this.logModCommand(user.name+' declared '+target);
	},

	
	pdeclare: function(target, room, user, connection, cmd) {
		if (!target) return this.parse('/help declare');
		if (!this.can('declare', null, room)) return false;

		if (!this.canTalk()) return;

		if (cmd === 'pdeclare'){
			this.add('|raw|<div class="broadcast-purple"><b>'+target+'</b></div>');
		}
		else if (cmd === 'pdeclare'){
			this.add('|raw|<div class="broadcast-purple"><b>'+target+'</b></div>');
		}
		this.logModCommand(user.name+' declared '+target);
	},
	
	k: 'kick',
	aura: 'kick',
	kick: function(target, room, user){
		if (!this.can('lock')) return false;
		if (!target) return this.sendReply('/help kick');
		if (!this.canTalk()) return false;

		target = this.splitTarget(target);
		var targetUser = this.targetUser;

		if (!targetUser || !targetUser.connected) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}

		if (!this.can('lock', targetUser, room)) return false;

		this.addModCommand(targetUser.name+' was kicked from the room by '+user.name+'.');

		targetUser.popup('You were kicked from '+room.id+' by '+user.name+'.');

		targetUser.leaveRoom(room.id);
	},

	dm: 'daymute',
	daymute: function(target, room, user) {
		if (!target) return this.parse('/help daymute');
		if (!this.canTalk()) return false;

		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}
		if (!this.can('mute', targetUser, room)) return false;

		if (((targetUser.mutedRooms[room.id] && (targetUser.muteDuration[room.id]||0) >= 50*60*1000) || targetUser.locked) && !target) {
			var problem = ' but was already '+(!targetUser.connected ? 'offline' : targetUser.locked ? 'locked' : 'muted');
			return this.privateModCommand('('+targetUser.name+' would be muted by '+user.name+problem+'.)');
		}

		targetUser.popup(user.name+' has muted you for 24 hours. '+target);
		this.addModCommand(''+targetUser.name+' was muted by '+user.name+' for 24 hours.' + (target ? " (" + target + ")" : ""));
		var alts = targetUser.getAlts();
		if (alts.length) this.addModCommand(""+targetUser.name+"'s alts were also muted: "+alts.join(", "));

		targetUser.mute(room.id, 24*60*60*1000, true);
	},

	flogout: 'forcelogout',
	forcelogout: function(target, room, user) {
		if(!user.can('hotpatch')) return;
		if (!this.canTalk()) return false;

		if (!target) return this.sendReply('/forcelogout [username], [reason] OR /flogout [username], [reason] - You do not have to add a reason');

		target = this.splitTarget(target);
		var targetUser = this.targetUser;

		if (!targetUser) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}

		if (targetUser.can('hotpatch')) return this.sendReply('You cannot force logout another Admin - nice try. Chump.');

		this.addModCommand(''+targetUser.name+' was forcibly logged out by '+user.name+'.' + (target ? " (" + target + ")" : ""));

		targetUser.resetName();
	},
	
	declaregreen: 'declarered',
	declarered: function(target, room, user, connection, cmd) {
		if (!target) return this.parse('/help declare');
		if (!this.can('declare', null, room)) return false;

		if (!this.canTalk()) return;

		if (cmd === 'declarered'){
			this.add('|raw|<div class="broadcast-red"><b>'+target+'</b></div>');
		}
		else if (cmd === 'declaregreen'){
			this.add('|raw|<div class="broadcast-green"><b>'+target+'</b></div>');
		}
		this.logModCommand(user.name+' declared '+target);
	},

	gdeclarered: 'gdeclare',
	gdeclaregreen: 'gdeclare',
	gdeclare: function(target, room, user, connection, cmd) {
		if (!target) return this.parse('/help gdeclare');
		if (!this.can('lockdown')) return false;

		var roomName = (room.isPrivate)? 'a private room' : room.id;

		if (cmd === 'gdeclare'){
			for (var id in Rooms.rooms) {
				if (id !== 'global') Rooms.rooms[id].addRaw('<div class="broadcast-blue"><b><font size=1><i>Global declare from '+roomName+'<br /></i></font size>'+target+'</b></div>');
			}
		}
		if (cmd === 'gdeclarered'){
			for (var id in Rooms.rooms) {
				if (id !== 'global') Rooms.rooms[id].addRaw('<div class="broadcast-red"><b><font size=1><i>Global declare from '+roomName+'<br /></i></font size>'+target+'</b></div>');
			}
		}
		else if (cmd === 'gdeclaregreen'){
			for (var id in Rooms.rooms) {
				if (id !== 'global') Rooms.rooms[id].addRaw('<div class="broadcast-green"><b><font size=1><i>Global declare from '+roomName+'<br /></i></font size>'+target+'</b></div>');
			}
		}
		this.logModCommand(user.name+' globally declared '+target);
	},
	sd: 'declaremod',
	staffdeclare: 'declaremod',
	modmsg: 'declaremod',
	moddeclare: 'declaremod',
	declaremod: function(target, room, user) {
		if (!target) return this.sendReply('/declaremod [message] - Also /moddeclare and /modmsg');
		if (!this.can('declare', null, room)) return false;

		if (!this.canTalk()) return;

		this.privateModCommand('|raw|<div class="broadcast-red"><b><font size=1><i>Private Auth (Driver +) declare from '+user.name+'<br /></i></font size>'+target+'</b></div>');

		this.logModCommand(user.name+' mod declared '+target);
	},

	/*********************************************************
	 * Shortcuts
	 *********************************************************/

	invite: function (target, room, user) {
		target = this.splitTarget(target);
		if (!this.targetUser) {
			return this.sendReply("User " + this.targetUsername + " not found.");
		}
		var roomid = (target || room.id);
		if (!Rooms.get(roomid)) {
			return this.sendReply("Room " + roomid + " not found.");
		}
		return this.parse('/msg ' + this.targetUsername + ', /invite ' + roomid);
	},

	/*********************************************************
	 * Informational commands
	 *********************************************************/

	stats: 'data',
	dex: 'data',
	pokedex: 'data',
	data: function (target, room, user) {
		if (!this.canBroadcast()) return;

		var data = '';
		var targetId = toId(target);
		var newTargets = Tools.dataSearch(target);
		if (newTargets && newTargets.length) {
			for (var i = 0; i < newTargets.length; ++i) {
				if (newTargets[i].id !== targetId && !Tools.data.Aliases[targetId] && !i) {
					data = "No Pokemon, item, move or ability named '" + target + "' was found. Showing the data of '" + newTargets[0].name + "' instead.\n";
				}
				data += '|c|~|/data-' + newTargets[i].searchType + ' ' + newTargets[i].name + '\n';
			        if (newTargets[i].searchType === 'pokemon') {
					var template = Tools.getTemplate(newTargets[i].species);
					data += '|html|Tier: <b>' + template.tier + '</b>';
			        }
			}        
		} else {
			data = "No Pokemon, item, move or ability named '" + target + "' was found. (Check your spelling?)";
		}

		this.sendReply(data);
	},

	ds: 'dexsearch',
	dsearch: 'dexsearch',
	dexsearch: function (target, room, user) {
		if (!this.canBroadcast()) return;

		if (!target) return this.parse('/help dexsearch');
		var targets = target.split(',');
		var searches = {};
		var allTiers = {'uber':1, 'ou':1, 'uu':1, 'lc':1, 'cap':1, 'bl':1, 'bl2':1, 'ru':1, 'bl3':1, 'nu':1};
		var allColours = {'green':1, 'red':1, 'blue':1, 'white':1, 'brown':1, 'yellow':1, 'purple':1, 'pink':1, 'gray':1, 'black':1};
		var showAll = false;
		var megaSearch = null;
		var feSearch = null; // search for fully evolved pokemon only
		var output = 10;

		for (var i in targets) {
			var isNotSearch = false;
			target = targets[i].trim().toLowerCase();
			if (target.slice(0, 1) === '!') {
				isNotSearch = true;
				target = target.slice(1);
			}

			var targetAbility = Tools.getAbility(targets[i]);
			if (targetAbility.exists) {
				if (!searches['ability']) searches['ability'] = {};
				if (Object.count(searches['ability'], true) === 1 && !isNotSearch) return this.sendReplyBox("Specify only one ability.");
				if ((searches['ability'][targetAbility.name] && isNotSearch) || (searches['ability'][targetAbility.name] === false && !isNotSearch)) return this.sendReplyBox("A search cannot both exclude and include an ability.");
				searches['ability'][targetAbility.name] = !isNotSearch;
				continue;
			}

			if (target in allTiers) {
				if (!searches['tier']) searches['tier'] = {};
				if ((searches['tier'][target] && isNotSearch) || (searches['tier'][target] === false && !isNotSearch)) return this.sendReplyBox('A search cannot both exclude and include a tier.');
				searches['tier'][target] = !isNotSearch;
				continue;
			}

			if (target in allColours) {
				if (!searches['color']) searches['color'] = {};
				if ((searches['color'][target] && isNotSearch) || (searches['color'][target] === false && !isNotSearch)) return this.sendReplyBox('A search cannot both exclude and include a color.');
				searches['color'][target] = !isNotSearch;
				continue;
			}

			var targetInt = parseInt(target);
			if (0 < targetInt && targetInt < 7) {
				if (!searches['gen']) searches['gen'] = {};
				if ((searches['gen'][target] && isNotSearch) || (searches['gen'][target] === false && !isNotSearch)) return this.sendReplyBox('A search cannot both exclude and include a generation.');
				searches['gen'][target] = !isNotSearch;
				continue;
			}

			if (target === 'all') {
				if (this.broadcasting) {
					return this.sendReplyBox("A search with the parameter 'all' cannot be broadcast.");
				}
				showAll = true;
				continue;
			}

			if (target === 'megas' || target === 'mega') {
				if ((megaSearch && isNotSearch) || (megaSearch === false && !isNotSearch)) return this.sendReplyBox('A search cannot both exclude and include Mega Evolutions.');
				megaSearch = !isNotSearch;
				continue;
			}

			if (target === 'fe' || target === 'fullyevolved' || target === 'nfe' || target === 'notfullyevolved') {
				if (target === 'nfe' || target === 'notfullyevolved') isNotSearch = !isNotSearch;
				if ((feSearch && isNotSearch) || (feSearch === false && !isNotSearch)) return this.sendReplyBox('A search cannot both exclude and include fully evolved Pokémon.');
				feSearch = !isNotSearch;
				continue;
			}

			var targetMove = Tools.getMove(target);
			if (targetMove.exists) {
				if (!searches['moves']) searches['moves'] = {};
				if (Object.count(searches['moves'], true) === 4 && !isNotSearch) return this.sendReplyBox("Specify a maximum of 4 moves.");
				if ((searches['moves'][targetMove.name] && isNotSearch) || (searches['moves'][targetMove.name] === false && !isNotSearch)) return this.sendReplyBox("A search cannot both exclude and include a move.");
				searches['moves'][targetMove.name] = !isNotSearch;
				continue;
			}

			if (target.indexOf(' type') > -1) {
				target = target.charAt(0).toUpperCase() + target.slice(1, target.indexOf(' type'));
				if (target in Tools.data.TypeChart) {
					if (!searches['types']) searches['types'] = {};
					if (Object.count(searches['types'], true) === 2 && !isNotSearch) return this.sendReplyBox("Specify a maximum of two types.");
					if ((searches['types'][target] && isNotSearch) || (searches['types'][target] === false && !isNotSearch)) return this.sendReplyBox("A search cannot both exclude and include a type.");
					searches['types'][target] = !isNotSearch;
					continue;
				}
			}
			return this.sendReplyBox("'" + Tools.escapeHTML(target) + "' could not be found in any of the search categories.");
		}

		if (showAll && Object.size(searches) === 0 && megaSearch === null && feSearch === null) return this.sendReplyBox("No search parameters other than 'all' were found. Try '/help dexsearch' for more information on this command.");

		var dex = {};
		for (var pokemon in Tools.data.Pokedex) {
			var template = Tools.getTemplate(pokemon);
			var megaSearchResult = (megaSearch === null || (megaSearch === true && template.isMega) || (megaSearch === false && !template.isMega));
			var feSearchResult = (feSearch === null || (feSearch === true && !template.evos.length) || (feSearch === false && template.evos.length))
			if (template.tier !== 'Unreleased' && template.tier !== 'Illegal' && (template.tier !== 'CAP' || (searches['tier'] && searches['tier']['cap'])) &&
				megaSearchResult && feSearchResult) {
				dex[pokemon] = template;
			}
		}

		for (var search in {'moves':1, 'types':1, 'ability':1, 'tier':1, 'gen':1, 'color':1}) {
			if (!searches[search]) continue;
			switch (search) {
				case 'types':
					for (var mon in dex) {
						if (Object.count(searches[search], true) === 2) {
							if (!(searches[search][dex[mon].types[0]]) || !(searches[search][dex[mon].types[1]])) delete dex[mon];
						} else {
							if (searches[search][dex[mon].types[0]] === false || searches[search][dex[mon].types[1]] === false || (Object.count(searches[search], true) > 0 &&
								(!(searches[search][dex[mon].types[0]]) && !(searches[search][dex[mon].types[1]])))) delete dex[mon];
						}
					}
					break;

				case 'tier':
					for (var mon in dex) {
						if ('lc' in searches[search]) {
							// some LC legal Pokemon are stored in other tiers (Ferroseed/Murkrow etc)
							// this checks for LC legality using the going criteria, instead of dex[mon].tier
							var isLC = (dex[mon].evos && dex[mon].evos.length > 0) && !dex[mon].prevo && Tools.data.Formats['lc'].banlist.indexOf(dex[mon].species) === -1;
							if ((searches[search]['lc'] && !isLC) || (!searches[search]['lc'] && isLC)) {
								delete dex[mon];
								continue;
							}
						}
						if (searches[search][String(dex[mon][search]).toLowerCase()] === false) {
							delete dex[mon];
						} else if (Object.count(searches[search], true) > 0 && !searches[search][String(dex[mon][search]).toLowerCase()]) delete dex[mon];
					}
					break;

				case 'gen':
				case 'color':
					for (var mon in dex) {
						if (searches[search][String(dex[mon][search]).toLowerCase()] === false) {
							delete dex[mon];
						} else if (Object.count(searches[search], true) > 0 && !searches[search][String(dex[mon][search]).toLowerCase()]) delete dex[mon];					}
					break;

				case 'ability':
					for (var mon in dex) {
						for (var ability in searches[search]) {
							var needsAbility = searches[search][ability];
							var hasAbility = Object.count(dex[mon].abilities, ability) > 0;
							if (hasAbility !== needsAbility) {
								delete dex[mon];
								break;
							}
						}
					}
					break;

				case 'moves':
					for (var mon in dex) {
						var template = Tools.getTemplate(dex[mon].id);
						if (!template.learnset) template = Tools.getTemplate(template.baseSpecies);
						if (!template.learnset) continue;
						for (var i in searches[search]) {
							var move = Tools.getMove(i);
							if (!move.exists) return this.sendReplyBox("'" + move + "' is not a known move.");
							var prevoTemp = Tools.getTemplate(template.id);
							while (prevoTemp.prevo && prevoTemp.learnset && !(prevoTemp.learnset[move.id])) {
								prevoTemp = Tools.getTemplate(prevoTemp.prevo);
							}
							var canLearn = (prevoTemp.learnset.sketch && !(move.id in {'chatter':1, 'struggle':1, 'magikarpsrevenge':1})) || prevoTemp.learnset[move.id];
							if ((!canLearn && searches[search][i]) || (searches[search][i] === false && canLearn)) delete dex[mon];
						}
					}
					break;

				default:
					return this.sendReplyBox("Something broke! PM TalkTakesTime here or on the Smogon forums with the command you tried.");
			}
		}

		var results = Object.keys(dex).map(function (speciesid) {return dex[speciesid].species;});
		results = results.filter(function (species) {
			var template = Tools.getTemplate(species);
			return !(species !== template.baseSpecies && results.indexOf(template.baseSpecies) > -1);
		});
		var resultsStr = "";
		if (results.length > 0) {
			if (showAll || results.length <= output) {
				results.sort();
				resultsStr = results.join(", ");
			} else {
				results.randomize()
				resultsStr = results.slice(0, 10).join(", ") + ", and " + string(results.length - output) + " more. Redo the search with 'all' as a search parameter to show all results.";
			}
		} else {
			resultsStr = "No Pokémon found.";
		}
		return this.sendReplyBox(resultsStr);
	},

	learnset: 'learn',
	learnall: 'learn',
	learn5: 'learn',
	g6learn: 'learn',
	learn: function (target, room, user, connection, cmd) {
		if (!target) return this.parse('/help learn');

		if (!this.canBroadcast()) return;

		var lsetData = {set:{}};
		var targets = target.split(',');
		var template = Tools.getTemplate(targets[0]);
		var move = {};
		var problem;
		var all = (cmd === 'learnall');
		if (cmd === 'learn5') lsetData.set.level = 5;
		if (cmd === 'g6learn') lsetData.format = {noPokebank: true};

		if (!template.exists) {
			return this.sendReply("Pokemon '" + template.id + "' not found.");
		}

		if (targets.length < 2) {
			return this.sendReply("You must specify at least one move.");
		}
		for (var i = 1, len = targets.length; i < len; ++i) {
			move = Tools.getMove(targets[i]);
			if (!move.exists) {
				return this.sendReply("Move '" + move.id + "' not found.");
			}
			problem = TeamValidator.checkLearnsetSync(null, move, template, lsetData);
			if (problem) break;
		}
		var buffer = template.name + (problem ? " <span class=\"message-learn-cannotlearn\">can't</span> learn " : " <span class=\"message-learn-canlearn\">can</span> learn ") + (targets.length > 2 ? "these moves" : move.name);
		if (!problem) {
			var sourceNames = {E:"egg", S:"event", D:"dream world"};
			if (lsetData.sources || lsetData.sourcesBefore) buffer += " only when obtained from:<ul class=\"message-learn-list\">";
			if (lsetData.sources) {
				var sources = lsetData.sources.sort();
				var prevSource;
				var prevSourceType;
				for (var i = 0, len = sources.length; i < len; ++i) {
					var source = sources[i];
					if (source.substr(0, 2) === prevSourceType) {
						if (prevSourceCount < 0) buffer += ": " + source.substr(2);
						else if (all || prevSourceCount < 3) buffer += ", " + source.substr(2);
						else if (prevSourceCount === 3) buffer += ", ...";
						++prevSourceCount;
						continue;
					}
					prevSourceType = source.substr(0, 2);
					prevSourceCount = source.substr(2) ? 0 : -1;
					buffer += "<li>gen " + source.substr(0, 1) + " " + sourceNames[source.substr(1, 1)];
					if (prevSourceType === '5E' && template.maleOnlyHidden) buffer += " (cannot have hidden ability)";
					if (source.substr(2)) buffer += ": " + source.substr(2);
				}
			}
			if (lsetData.sourcesBefore) buffer += "<li>any generation before " + (lsetData.sourcesBefore + 1);
			buffer += "</ul>";
		}
		this.sendReplyBox(buffer);
	},

	weak: 'weakness',
	weakness: function (target, room, user){
		if (!this.canBroadcast()) return;
		var targets = target.split(/[ ,\/]/);

		var pokemon = Tools.getTemplate(target);
		var type1 = Tools.getType(targets[0]);
		var type2 = Tools.getType(targets[1]);

		if (pokemon.exists) {
			target = pokemon.species;
		} else if (type1.exists && type2.exists) {
			pokemon = {types: [type1.id, type2.id]};
			target = type1.id + "/" + type2.id;
		} else if (type1.exists) {
			pokemon = {types: [type1.id]};
			target = type1.id;
		} else {
			return this.sendReplyBox("" + Tools.escapeHTML(target) + " isn't a recognized type or pokemon.");
		}

		var weaknesses = [];
		Object.keys(Tools.data.TypeChart).forEach(function (type) {
			var notImmune = Tools.getImmunity(type, pokemon);
			if (notImmune) {
				var typeMod = Tools.getEffectiveness(type, pokemon);
				if (typeMod === 1) weaknesses.push(type);
				if (typeMod === 2) weaknesses.push("<b>" + type + "</b>");
			}
		});

		if (!weaknesses.length) {
			this.sendReplyBox("" + target + " has no weaknesses.");
		} else {
			this.sendReplyBox("" + target + " is weak to: " + weaknesses.join(", ") + " (not counting abilities).");
		}
	},

	eff: 'effectiveness',
	type: 'effectiveness',
	matchup: 'effectiveness',
	effectiveness: function (target, room, user) {
		var targets = target.split(/[,/]/).slice(0, 2);
		if (targets.length !== 2) return this.sendReply("Attacker and defender must be separated with a comma.");

		var searchMethods = {'getType':1, 'getMove':1, 'getTemplate':1};
		var sourceMethods = {'getType':1, 'getMove':1};
		var targetMethods = {'getType':1, 'getTemplate':1};
		var source;
		var defender;
		var foundData;
		var atkName;
		var defName;
		for (var i = 0; i < 2; ++i) {
			for (var method in searchMethods) {
				foundData = Tools[method](targets[i]);
				if (foundData.exists) break;
			}
			if (!foundData.exists) return this.parse('/help effectiveness');
			if (!source && method in sourceMethods) {
				if (foundData.type) {
					source = foundData;
					atkName = foundData.name;
				} else {
					source = foundData.id;
					atkName = foundData.id;
				}
				searchMethods = targetMethods;
			} else if (!defender && method in targetMethods) {
				if (foundData.types) {
					defender = foundData;
					defName = foundData.species + " (not counting abilities)";
				} else {
					defender = {types: [foundData.id]};
					defName = foundData.id;
				}
				searchMethods = sourceMethods;
			}
		}

		if (!this.canBroadcast()) return;

		var factor = 0;
		if (Tools.getImmunity(source.type || source, defender)) {
			if (source.effectType !== 'Move' || source.basePower || source.basePowerCallback) {
				factor = Math.pow(2, Tools.getEffectiveness(source, defender));
			} else {
				factor = 1;
			}
		}

		this.sendReplyBox("" + atkName + " is " + factor + "x effective against " + defName + ".");
	},

	uptime: (function(){
		function formatUptime(uptime) {
			if (uptime > 24*60*60) {
				var uptimeText = "";
				var uptimeDays = Math.floor(uptime/(24*60*60));
				uptimeText = uptimeDays + " " + (uptimeDays == 1 ? "day" : "days");
				var uptimeHours = Math.floor(uptime/(60*60)) - uptimeDays*24;
				if (uptimeHours) uptimeText += ", " + uptimeHours + " " + (uptimeHours == 1 ? "hour" : "hours");
				return uptimeText;
			} else {
				return uptime.seconds().duration();
			}
		}

		return function(target, room, user) {
			if (!this.canBroadcast()) return;
			var uptime = process.uptime();
			this.sendReplyBox("Uptime: <b>" + formatUptime(uptime) + "</b>" +
				(global.uptimeRecord ? "<br /><font color=\"green\">Record: <b>" + formatUptime(global.uptimeRecord) + "</b></font>" : ""));
		};
	})(),

	groups: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox(
			"+ <b>Voice</b> - They can use ! commands like !groups, and talk during moderated chat<br />" +
			"% <b>Driver</b> - The above, and they can mute. Global % can also lock users and check for alts<br />" +
			"@ <b>Moderator</b> - The above, and they can ban users<br />" +
			"&amp; <b>Leader</b> - The above, and they can promote to moderator and force ties<br />" +
			"# <b>Room Owner</b> - They are leaders of the room and can almost totally control it<br />" +
			"~ <b>Administrator</b> - They can do anything, like change what this message says"
		);
	},
	
	staff: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('The staff forums can be found <a href="https://groups.google.com/forum/#!forum/gold-staff">here</a>.');
	},
	
	//Trainer Cards.
	
	tailz: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/UQJceOG.png"><br />' +
                '<img src="http://i.imgur.com/1IrQzrV.jpg"><br />' +
                'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz');
	},
	
	silver: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://img3.wikia.nocookie.net/__cb20091211143347/sonic/images/thumb/5/5d/Super_silver_final.png/150px-Super_silver_final.png"><br />' +
                '<img src="http://img1.wikia.nocookie.net/__cb20111024112339/sonic/images/thumb/3/34/Sonic_Channel_-_Silver_The_Hedgehog_2011.png/120px-Sonic_Channel_-_Silver_The_Hedgehog_2011.png"><br />' +
                'Ace: Its no use!<br />');
	},
	
	gene: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/NO1PFB2.png"><br />' +
                '<img src="http://static2.wikia.nocookie.net/__cb20131130005232/bleedmancomics/images/6/66/Klefki_XY.gif"><br />' +
                '<b><font color="red">Ace:</b> Monopoly</font><br />' +
                '<font color="purple"> Romanticism is the expression of man\'s urge to rise above reason and common sense, just as rationalism is the expression of his urge to rise above theology and emotion. Riot\'s suck, I love noodles.</font></center>');
	},
	
	hagrus: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/CeYqID8.jpg"><br />' +
                'Get used to being second nubs</center>');
	},
	
	wrath: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/csloC44.gif"><br />' +
                '<img src="http://i.imgur.com/GS0kfMW.png"><br />' +
                'No being an asshat. Asshats will face the Wrath of Espurr.</center>');
	},
	
	windy: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/CwmuZVJ.png"><br />' +
                '<img src="http://i.imgur.com/qOMMI3O.gif"><br />' +
                'Show Your Victory!</center>');
	},
	
	coolasian: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/HbZN3Jm.png"><br />' +
                '<img src="http://i.imgur.com/PxPKnUs.jpg"><br />' +
                'Scavenge. Slay. Survive.</center>');
	},
	
	aphrodisia: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/7SAR6FI.png"><br />' +
                '<img src="http://img2.wikia.nocookie.net/__cb20140319085812/pokemon/images/7/72/Pikachu_XY.gif"><br />' +
                'Ace: Crumbster<br />' +
                '<font color=yellow> <b>If you want to find the secrets of the universe, think in terms of energy, frequency and vibration.</b></font></center>');
	},
	
	solox: 'solstice',
	equinox: 'solstice',
	solstice: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/l4Jidxb.png"><br />' +
                '<img src="http://i.imgur.com/UA4rXv7.gif" width="360"><br />' +
                'Sometimes I don\'t know why we\'d rather live than die,<br />' +
                'We look up towards the skies for answers to our lives.');
	},
	
	typhozzz: function(target, room, user) {
	if (!this.canBroadcast()) return;
	this.sendReplyBox('<center><img src="http://th08.deviantart.net/fs70/PRE/i/2011/111/e/5/typhlosion_by_sharkjaw-d3ehtqh.jpg" height="100" width="100">' +
		'<img src="http://i.imgur.com/eDS32pU.gif">' +
		'<img src="http://i.imgur.com/UTfUkBW.png"><br />' +
		'<b>Ace: <font color="red"> Typhlosion</font></b><br />' +
		'There ain\'t a soul or a person or thing that can stop me :]</center>');
	},
	
	cyllage: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/AUTOlch.png"><br />' +
                '<img src="http://i.imgur.com/Pyev2QI.jpg"><br />' +
                '<img src="http://i.imgur.com/02Y8dAA.png"><br />' +
                'Ace: Volcarona<br />' +
                'Catch phrase: Kindness is a virtue that should be expressed by everyone.</center>');
	},
	
	pan: 'panpawn',
	panpawn: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/BYTR6Fj.gif  width="80" height="80">' +
                '<img src="http://i.imgur.com/xzfPeaL.gif">' +
                '<img src="http://i.imgur.com/qzflcXa.gif"><br />' +
                '<b><font color="#4F86F7">Ace:</font></b> <font color="red">C<font color="orange">y<font color="red">n<font color="orange">d<font color="red">a<font color="orange">q<font color="red">u<font color="orange">i<font color="red">l</font><br />' +
                '<font color="black">"Don\'t touch me when I\'m sleeping."</font></center>');
    	},
    	
    	mrbug: 'bug',
	bug: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><font size="5" color="darkgreen">Mr. Bug</font><br />' +
		'<img src="http://media.pocketmonsters.net/characters/2127.png" width="40%" align="left">'+ 
		'<img src="https://1-media-cdn.foolz.us/ffuuka/board/vp/thumb/1379/30/1379304844529s.jpg" width="40%" align="right"><br />' +
		'<img src="http://fc01.deviantart.net/fs70/i/2011/341/9/8/kricketot_by_nami_tsuki-d4if7lr.png" width="35%"><br />' +
		'"delelele woooooop"<br />' +
		'Ace: kriketot</center>');
    	},
    	
    	comet: 'sunako',
	cometstorm: 'sunako',
	sunako: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/3uyLxHC.png"><br />' +
        	'<font color = "0F055C"><b><i>I came from the storm.</center>');
	},
    	
    	popcorn: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://www.allgeekthings.co.uk/wp-content/uploads/Popcorn.gif"></center>');
	},
	
	sand: 'sandshrewed',
	sandshrewed: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/M5vKJeP.png" width="100%"><br />' +
        	'<img src="http://i.imgur.com/AMkFFwe.jpg" width="30%"><br />' +
                'Ace: Gengar<br />' +
                '<font color=66CCFF>Don\'t need luck, got skill</font></center>');
	},
    	
    	destiny: 'itsdestiny',
	itsdestiny: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><font size="4" color="green"><b>It$de$tiny</b></font><br />' +
		'<img src="http://www.icleiusa.org/blog/library/images-phase1-051308/landscape/blog-images-90.jpg" width="55%"><img src="http://mindmillion.com/images/money/money-background-seamless-fill-bluesky.jpg" width="35%"><br />' +
		'It ain\'t luck, it\'s destiny.</center>');
	},
    	
    	miah: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><font size="3" color="orange"><b>Miah</font></b><br />' +
		'<img src="https://i.imgur.com/2RHOuPi.gif" width="50%"><img src="https://fbcdn-sphotos-c-a.akamaihd.net/hphotos-ak-frc1/t1.0-9/1511712_629640560439158_8415184400256062344_n.jpg" width="50%"><br />' +
		'Ace: Gliscor<br>Catch phrase: Adding Euphemisms to Pokemon</center>');
	},
	
	drag: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><font size="5" color="red">Akely</font><br />' +
		'<img src="http://gamesloveres.com/wp-content/uploads/2014/03/cute-pokemon-charmandercharmander-by-inversidom-riot-on-deviantart-llfutuct.png" width="25%"><br />' +
		'Ace: Charizard<br />' +
		'"Real mens can cry but real mens doesn\'t give up."</center>');
	},
    	
    	kricketune: 'kriсketunе',
	kriсketunе: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/VPcZ1rC.png"><br />' +
		'<img src="http://i.imgur.com/NKGYqpn.png" width="50%"><br />' +
		'Ace: Donnatello<br />' +
		'"At day I own the streets, but at night I own the closet..."</center>');
	},
	
	crowt: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><div class="infobox"><img src="http://i.imgur.com/BYTR6Fj.gif  width="80" height="80" align="left">' +
                '    <img src="http://i.imgur.com/czMd1X5.gif" border="6" align="center">' +
                '    <img src="http://50.62.73.114:8000/avatars/crowt.png" align="right"><br clear="all" /></div>' +
                '<blink><font color="red">~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~</font></blink><br />' +
                '<div class="infobox"><b><font color="#4F86F7" size="3">Ace:</font></b> <font color="blue" size="3">G</font><font color="black" size="3">r</font><font color="blue" size="3">e</font><font color="black" size="3">n</font><font color="blue" size="3">i</font><font color="black" size="3">n</font><font color="blue" size="3">j</font><font color="black" size="3">a</font></font><br />' +
                '<font color="black">"It takes a great deal of <b>bravery</b> to <b>stand up to</b> our <b>enemies</b>, but just as much to stand up to our <b>friends</b>." - Dumbledore</font></center></div>');
	},                     
    	
    	ransu: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/kWaZd66.jpg" width="40%"><br />' +
        	'Develop a passion for learning. If you do, you will never cease to grow.</center>');
    	},
    	
    	jessie: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/420CAz0.png"><br />' +
                '<img src="http://i.imgur.com/9ERgTNi.png"><br />' +
                'Catch phrase: I\'m from Jakarta ah ah</center>');
	},
    	
    	berry: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://blog.flamingtext.com/blog/2014/04/02/flamingtext_com_1396402375_186122138.png" width="50%"><br />' +
                '<img src="http://50.62.73.114:8000/avatars/theberrymaster.gif"><br />' +
                'Cherrim-Sunshine<br />' +
                'I don\'t care what I end up being as long as I\'m a legend.</center>');
    	},
    	
    	moist: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://fc04.deviantart.net/fs70/i/2010/338/6/3/moister_by_arvalis-d347xgw.jpg" width="50%"></center>');
	},
    	
    	spydreigon: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/57drGn3.jpg" width="75%"><br />' +
                '<img src="http://fc00.deviantart.net/fs70/f/2013/102/8/3/hydreigon___draco_meteor_by_ishmam-d61irtz.png" width="75%"><br />' +
                'You wish you were as badass as me</center>');
	},
    	
    	mushy: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><font size="3" color="purple">Mushy</font><br />' +
		'<img src="http://i.imgur.com/yK6aCZH.png"><br />' +
		'Life often causes us pain, so I try to fill it up with pleasure instead. Do you want a taste? ;)</center>');
	},
	
	furgo: function(target, room, user) {
	if (!this.canBroadcast()) return;
	this.sendReplyBox('<center><img src="http://i.imgur.com/0qJzTgP.gif" width="25%"><br />' +
		'<font color="red">Ace:</font><br />' +
		'<img src="http://amethyst.xiaotai.org:2000/avatars/furgo.gif"><br />' +
		'When I\'m sleeping, do not poke me. :I</center>');
	},
	
	blazingflareon: 'bf',
	bf: function(target, room, user) {
	if (!this.canBroadcast()) return;
	this.sendReplyBox('<center><img src="http://i.imgur.com/h3ZTk9u.gif"><br />' +
		'<img src="http://fc08.deviantart.net/fs71/i/2012/251/3/f/flareon_coloured_lineart_by_noel_tf-d5e166e.jpg" width="25%"><br />' +
		'<font size="3" color="red"><u><b><i>DARE TO DREAM</font></u></i></b></center>');
	},
	
	mikado: function(target, room, user) {
	if (!this.canBroadcast()) return;
	this.sendReplyBox('<center><img src="http://i.imgur.com/oS2jnht.gif"><br />' +
		'<img src="http://i.imgur.com/oKEA0Om.png"></center>');
	},
	
	dsg:'darkshinygiratina',
	darkshinygiratina: function(target, room, user) {
	if (!this.canBroadcast()) return;
	this.sendReplyBox('<center><font size="4" color="blue" face="arial">DarkShinyGiratina</font><br />' +
		'<img src="http://i.imgur.com/sBIqMv8.gif"><br />' +
		'I\'m gonna use Shadow Force on you!</center>');
	},
	
	archbisharp: function(target, room, user) {
	if (!this.canBroadcast()) return;
	this.sendReplyBox('<center><img src="http://i.imgur.com/ibC46tQ.png"><br />' +
		'<img src="http://fc07.deviantart.net/fs70/f/2012/294/f/c/bisharp_by_xdarkblaze-d5ijnsf.gif" width="350" hieght="350"><br />' +
		'<b>Ruling you with an Iron Head.</b></center>');
	},
	
	chimplup: function(target, room, user) {
	if (!this.canBroadcast()) return;
	this.sendReplyBox('<center><b>Chimplup</b> - The almighty ruler of chimchars and piplups alike, also likes pie.</center>');
	},

	shephard: function(target, room, user) {
	if (!this.canBroadcast()) return;
	this.sendReplyBox('<center><b>Shephard</b> - King Of Water and Ground types.</center>');
	},

	logic: 'psychological',
        psychological: function(target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('<center><img src="http://i.imgur.com/c4j9EdJ.png?1">' +
                '<img src="http://i.imgur.com/tRRas7O.gif" width="200">' +  
                '<img src="http://i.imgur.com/TwpGsh3.png?1"><br />' +      
                '<img src="http://i.imgur.com/1MH0mJM.png" height="90">' +
                '<img src="http://i.imgur.com/TSEXdOm.gif" width="300">' +
                '<img src="http://i.imgur.com/4XlnMPZ.png" height="90"><br />' +
                'If it isn\'t logical, it\'s probably Psychological.</center>');
        },

	seed: function(target, room, user) {
	if (!this.canBroadcast()) return;
	this.sendReplyBox('<center><b>Seed</b> - /me plant and water</center>');
	},

	auraburst: function(target, room, user) {
	if (!this.canBroadcast()) return;
	this.sendReplyBox('<center><img src="http://i.imgur.com/9guvnD7.jpg">' +
		'<font color="orange"><font size="2"><b>Aura Butt</b> - Nick Cage.</font>' +   
		'<img src="http://i.imgur.com/9guvnD7.jpg"></center>');
	},

	leo: function(target, room, user) {
	if (!this.canBroadcast()) return;
	this.sendReplyBox('<center><b>Leonardo DiCaprio</b> - Mirror mirror on the wall, who is the chillest of them all?</center>');
	},
	
	kupo: 'moogle',
	moogle: function(target, room, user) {
	if (!this.canBroadcast()) return;
	this.sendReplyBox('<center><font size="7" color="#AE8119"><b>kupo</font</b><br />' +
		'<img src="http://107.191.104.240:8000/avatars/kupo.png"><br />' +
		'<img src="http://th03.deviantart.net/fs70/PRE/i/2013/193/f/1/chocobo_and_moogle_by_judeydey-d6d629x.png" width="25%"><br />' +
		'abc! O3O!</center>');
	},

	starmaster: function(target, room, user) {
	if (!this.canBroadcast()) return;
	this.sendReplyBox('<center><b>Starmaster</b> - Well what were you expecting. Master of stars. Duh</center>');
	},

	ryun: function(target, room, user) {
	if (!this.canBroadcast()) return;
	this.sendReplyBox('<center><b>Ryun</b> - Will fuck your shit up with his army of Gloom, Chimecho, Duosion, Dunsparce, Plusle and Mr. Mime</center>');
	},
	
	miikasa: function(target, room, user) {
	if (!this.canBroadcast()) return;
	this.sendReplyBox('<center><img src="http://fc06.deviantart.net/fs70/f/2010/330/2/0/cirno_neutral_special_by_generalcirno-d33ndj0.gif"><br />' +
		'<font color="purple"><font size="2"><b>Miikasa</b></font>' +
		'<font color="purple"><font size="2"> - There are no buses in Gensokyo.</center></font>');
	},
	
	poliii: function(target, room, user) {
	if (!this.canBroadcast()) return;
	this.sendReplyBox('<center><img src="http://i.imgur.com/GsI3Y75.jpg"><br />' +
		'<font color="blue"><font size="2"><b>Poliii</b></font>' +
		'<font color="blue"><font size="2"> -  Greninja is behind you.</font></center>');
	},
	
	frozengrace: function(target, room, user) {
	if (!this.canBroadcast()) return;
	this.sendReplyBox('<center><b>FrozenGrace</b> -  The gentle wind blows as the song birds sing of her vibrant radiance. The vibrant flowers and luscious petals dance in the serenading wind, welcoming her arrival for the epitome of all things beautiful.  Bow down to her majesty for she is the Queen. Let her bestow upon you as she graces you with her elegance. FrozenGrace, eternal serenity.</center>');
	},
	
	awk: function(target, room, user) {
	if (!this.canBroadcast()) return;
	this.sendReplyBox('<center><b>Awk</b> - I have nothing to say to that!</center>');
	},
	
	screamingmilotic: function(target, room, user) {
	if (!this.canBroadcast()) return;
	this.sendReplyBox('<center><b>ScreamingMilotic</b> - The shiny Milotic that wants to take over the world.</center>');
	},
	
	aikenka: function(target, room, user) {
	if (!this.canBroadcast()) return;
	this.sendReplyBox('<center><img src="http://fc05.deviantart.net/fs70/f/2010/004/3/4/Go_MAGIKARP_use_your_Splash_by_JoshR691.gif">' +
		'<b><font size="2"><font color="blue">Aikenká</b><font size="2"></font>' +
		'<font color="blue"> - The Master of the imp.</font>' +
		'<img src="http://fc05.deviantart.net/fs70/f/2010/004/3/4/Go_MAGIKARP_use_your_Splash_by_JoshR691.gif"></center>');
	},
	
	ipad: function(target, room, user) {
	if (!this.canBroadcast()) return;
	this.sendReplyBox('<center><img src="http://i.imgur.com/miLUHTz.png"><br><b>iPood</b><br />' +
		'A total <font color="brown">pos</font> that panpawn will ban.<br />' +
		'<img src="http://i.imgur.com/miLUHTz.png"></center>');
	},
	
	rhan: 'rohansound',
	rohansound: function(target, room, user) {
	if (!this.canBroadcast()) return;
	this.sendReplyBox('<center><font color="orange"><font size="2"><b>Rohansound</b>' +
		'<font size="orange"><font size="2"> - The master of the Snivy!</center>');
	},
	
	alittlepaw: function(target, room, user) {
	if (!this.canBroadcast()) return;
	this.sendReplyBox('<center><img src="http://fc00.deviantart.net/fs71/f/2013/025/5/d/wolf_dance_by_windwolf13-d5sq93d.gif"><br />' +
		'<font color="green"><font size="3"><b>ALittlePaw</b> - Fenrir would be proud.</center>');
	},
	
	smashbrosbrawl: function(target, room, user) {
	if (!this.canBroadcast()) return;
	this.sendReplyBox('<center><b>SmashBrosBrawl</b> - Christian Bale</center>');
	},
	
	w00per: function(target, room, user) {
	if (!this.canBroadcast()) return;
	this.sendReplyBox('<center><img src="http://i.imgur.com/i3FYyoG.gif"><br />' +
		'<font size="2"><font color="brown"><b>W00per</b>' +
		'<font size="2"><font color="brown"> - "I CAME IN LIKE `EM WRECKIN` BALLZ!</center>');
	},
	
	empoleonxv: function(target, room, user) {
	if (!this.canBroadcast()) return;
	this.sendReplyBox('<center><img src="http://i.imgur.com/IHd5yRT.gif"><br />' +
		'<img src="http://i.imgur.com/sfQsRlH.gif"><br />' +
		'<b><font color="33FFFF"><big>Smiling and Waving can\'t make you more cute than me!</b></center>');
	},
	
	foe: function(target, room, user) {
	if (!this.canBroadcast()) return;
	this.sendReplyBox('<center><img src="http://s21.postimg.org/durjqji4z/aaaaa.gif"><br />' +
		'<font size="2"><b>Foe</b><font size="2"> - Not a friend.</center>');
	},
	
	op: 'orangepoptarts',
	orangepoptarts: function(target, room, user) {
	if (!this.canBroadcast()) return;
	this.sendReplyBox('<center><img src="http://www.jeboavatars.com/images/avatars/192809169066sunsetbeach.jpg"><br />' +
		'<b><font size="2">Orange Poptarts</b><font size="2"> - "Pop, who so you" ~ ALittlePaw</center>');
	},
	
	v: 'jackzero',
	jack: 'jackzero',
        jackzero: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><font size="4" color="aqua">JackZero<br /></font>' +
        	'<img src="http://i.imgur.com/cE6LTKm.png"><br />' +
        	'I prefer the freedom of being hated to the shackles of expectational love.</center>');
        },
	
	wd: 'windoge',
	windoge: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<center><img src="http://i.imgur.com/qYTABJC.jpg" width="400"></center>');
	},
	
	party: 'dance',
	dance: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<center><img src="http://collegecandy.files.wordpress.com/2013/05/tumblr_inline_mhv5qyiqvk1qz4rgp1.gif" width="400"></center>');
	},
	
	kayo: function(target, room, user) {
	if (!this.canBroadcast()) return;
	this.sendReplyBox('<center><font size="2"><b>Kayo</b><br />' +
		'By the Beard of Zeus that Ghost was Fat<br />' +
		'<img src="http://i.imgur.com/rPe9hBa.png"></center>');
	},
	
	saburo: function(target, room, user) {
	if (!this.canBroadcast()) return;		
	this.sendReplyBox('<center><font color="red" size="5"><b>Saburo</font></b><br />' +
		'<img src="http://i.imgur.com/pYUt8Hf.gif"><br>The god of dance.</center>');
	},
	
	gara: 'garazan',
	nub: 'garazan',
	garazan: function(target, room, user) {
	if (!this.canBroadcast()) return;
	this.sendReplyBox('<center><font size="6" face="comic sans ms"><font color="red">G<font color="orange">a<font color="yellow">r<font color="tan">a<font color="violet">z<font color="purple">a<font color="blue">n</font><br />' +
		'<img src="http://www.quickmeme.com/img/3b/3b2ef0437a963f22d89b81bf7a8ef9d46f8770414ec98f3d25db4badbbe5f19c.jpg" width="150" height="150"></center>');
	},
	
	scizornician: 'sciz',
	sciz: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<div class="broadcast-blue"><center><font color="#A80000" size ="3"><b>Scizornician</b></font><br />' +
                  '<b>Rank:</b> Driver<br />' +
                  '<b>Quote:</b> It\'s all shits and giggles until someone giggles and shits.</font><br />' +
                  '<img src="https://i.imgur.com/aQc7ny4.gif"></center></div>');
	},
    	
    			//Music Boxes
    	
    	sandbox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>Sandshrewed\'s Music Box!</b><br />' +
                '1. <a href="https://www.youtube.com/watch?v=vN0I4b5YdOc"><button title="RAP Done It All - Iniquity Rhymes">RAP Done It All - Iniquity Rhymes</a></button><br />' +
                '2. <a href="https://www.youtube.com/watch?v=JHBnadmTReg"><button title="T.I. ft. Young Thug - About The Money">T.I. ft. Young Thug - About The Money</a></button><br />' +
		'3. <a href="https://www.youtube.com/watch?v=hV5sB5rRsGI"><button title="New Boyz - Colors">New Boyz - Colors</a></button><br />' +
		'4. <a href="https://www.youtube.com/watch?v=A1A0mIqlPiI"><button title="Young Cash feat. Shawn Jay (Field Mob) - Stress Free">Young Cash feat. Shawn Jay (Field Mob) - Stress Free</a></button><br />' +
		'5. <a href="https://www.youtube.com/watch?v=rqzVTNHxp7w"><button title="Young Cash - My Knob Broke">Young Cash - My Knob Broke</a></button><br />' +
		'6. <a href="https://www.youtube.com/watch?v=P4PgrY33-UA"><button title="Drop That NaeNae">Drop That NaeNae</a></button><br />' );
	},
    	
    	ampharosbox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>AmpharosTheBeast\'s Music Box!</b><br />' +
                '1. <a href="https://www.youtube.com/watch?v=RRGSHvlu9Ss"><button title="Linkin Park - Castle of Glass">Linkin Park - Castle of Glass</a></button><br />' +
                '2. <a href="https://www.youtube.com/watch?v=ie1wU9BLGn8"><button title="Rixton - Me and My Broken Heart">Rixton - Me and My Broken Heart</a></button><br />' +
		'3. <a href="https://www.youtube.com/watch?v=psuRGfAaju4"><button title="Owl City - Fireflies">Owl City - Fireflies</a></button><br />' +
		'4. <a href="https://www.youtube.com/watch?v=hT_nvWreIhg"><button title="OneRepublic - Counting Stars">OneRepublic - Counting Stars</a></button><br />');
	},
    	
    	legitbox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>Legit Buttons\'s Music Box!</b><br />' +
                '1. <a href="https://www.youtube.com/watch?v=y6Sxv-sUYtM"><button title="Pharrell Williams - Happy">Pharrell Williams - Happy</a></button><br />' +
                '2. <a href="https://www.youtube.com/watch?v=hT_nvWreIhg"><button title="OneRepublic - Counting Stars">OneRepublic - Counting Stars</a></button><br />' +
		'3. <a href="https://www.youtube.com/watch?v=6Cp6mKbRTQY"><button title="Avicii - Hey Brother">Avicii - Hey Brother</a></button><br />' +
		'4. <a href="https://www.youtube.com/watch?v=hHUbLv4ThOo"><button title="Pitbull - Timber ft. Ke$ha">Pitbull - Timber ft. Ke$ha</a></button><br />' );
	},
    	
    	riotbox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>Jack Skellington\'s Music Box!</b><br />' +
                '1. <a href="https://www.youtube.com/watch?v=ubiZDYU7mv0"><button title="Metal Gear Rising: Revengeance - The Only Thing I Know for Real ">Metal Gear Rising: Revengeance - The Only Thing I Know for Real </a></button><br />' +
                '2. <a href="https://www.youtube.com/watch?v=ye0XhDdbFs4"><button title="A Day to Remember - You Had Me at Hello">A Day to Remember - You Had Me at Hello</a></button><br />' +
		'3. <a href="https://www.youtube.com/watch?v=vc6vs-l5dkc"><button title="Panic! At The Disco - I Write Sins Not Tragedies">Panic! At The Disco: I Write Sins Not Tragedies</a></button><br />' +
		'4. <a href="https://www.youtube.com/watch?v=FukeNR1ydOA"><button title="Suicide Silence - Disengage">Suicide Silence - Disengage</a></button><br />' +
		'5. <a href="https://www.youtube.com/watch?v=xyW9KknfwLU"><button title="A Day to Remember - Sometimes You\'re The Hammer, Sometimes You\'re The Nail">A Day to Remember - Sometimes You\'re The Hammer, Sometimes You\'re The Nail</a></button><br />' +
		'6. <a href="https://www.youtube.com/watch?v=sA5hj7wuJLQ"><button title="Bring Me The Horizon - Empire (Let Them Sing)">Bring Me The Horizon - Empire (Let Them Sing)</a></button><br />' );
	},
    	
    	berrybox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>The Berry Master\'s Music Box!</b><br />' +
                '1. <a href="https://www.youtube.com/watch?v=fJ9rUzIMcZQ"><button title="Queen - Bohemian Rhapsody">Queen - Bohemian Rhapsody</a></button><br />' +
                '2. <a href="https://www.youtube.com/watch?v=xDMNHvnIxic"><button title="Hamster on a Piano">Hamster on a Piano</a></button><br />' +
		'3. <a href="https://www.youtube.com/watch?v=BuO5Jiqn9q4"><button title="The Ink Spots - Making Believe">The Ink Spots - Making Believe</a></button><br />' +
		'4. <a href="https://www.youtube.com/watch?v=ws8X31TTB5E"><button title="Cowboy Bebop OST 3 Blue - Adieu">Cowboy Bebop OST 3 Blue - Adieu</a></button><br />' +
		'5. <a href="https://www.youtube.com/watch?v=CnDJizJsMJg"><button title="ENTER SHIKARI - MOTHERSTEP/MOTHERSHIP">ENTER SHIKARI - MOTHERSTEP/MOTHERSHIP</a></button><br />' +
		'6. <a href="https://www.youtube.com/watch?v=-osNFEyI3vw"><button title="Gungor - Crags And Clay">Gungor - Crags And Clay</a></button><br />' );
	},
    	
    	sphealbox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>Super Spheal Bros\'s Music Box!</b><br />' +
                '1. <a href="https://www.youtube.com/watch?v=85XM_Nl7_oo"><button title="Mother 1 (EarthBound Zero) Music - Eight Melodies">Mother 1 (EarthBound Zero) Music - Eight Melodies</a></button><br />' +
                '2. <a href="https://www.youtube.com/watch?v=oOy7cJowbQs"><button title="Pokemon Black & White 2 OST Kanto Gym Leader Battle Music">Pokemon Black & White 2 OST Kanto Gym Leader Battle Music</a></button><br />' +
		'3. <a href="https://www.youtube.com/watch?v=XEEceynk-mg"><button title="Sonic the Hedgehog Starlight Zone Music">Sonic the Hedgehog Starlight Zone Music</a></button><br />' +
		'4. <a href="https://www.youtube.com/watch?v=jofNR_WkoCE"><button title="Ylvis - The Fox (What Does The Fox Say?)">Ylvis - The Fox (What Does The Fox Say?)</a></button><br />' +
		'5. <a href="https://www.youtube.com/watch?v=EAwWPadFsOA"><button title="Mortal Kombat Theme Song">Mortal Kombat Theme Song</a></button><br />' +
		'6. <a href="https://www.youtube.com/watch?v=QH2-TGUlwu4"><button title="Nyan Cat">Nyan Cat</a></button><br />');
	},
    	
    	boxofdestiny: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>itsdestny\'s Music Box!</b><br />' +
                '1. <a href="https://www.youtube.com/watch?v=pucnAvLsgyI"><button title="Megaman Battle Network 5 Hero Theme">Megaman Battle Network 5 Hero Theme</a></button><br />' +
                '2. <a href="https://www.youtube.com/watch?v=ckNRHPlLBcU"><button title="Gospel - Monsters University">Gospel - Monsters University</a></button><br />' +
		'3. <a href="https://www.youtube.com/watch?v=sLgyd2HHvMc"><button title="Princess Kenny Theme Song">Princess Kenny Theme Song</a></button><br />' +
		'4. <a href="https://www.youtube.com/watch?v=9bZkp7q19f0"><button title="Psy - Gangnam Style">Psy - Gangnam Style</a></button><br />' +
		'5. <a href="https://www.youtube.com/watch?v=x4JdySEXrg8"><button title="Frozen - Let It Go">Frozen - Let It Go</a></button><br />');
	},
    	
    	cbox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>Cyllage\'s Music Box!</b><br />' +
                '1. <a href="https://www.youtube.com/watch?v=SRvCvsRp5ho"><button title="Bon Jovi - Wanted Dead Or Alive">Bon Jovi - Wanted Dead Or Alive</a></button><br />' +
                '2. <a href="https://www.youtube.com/watch?v=c901NUazf3g"><button title="Muse - Exogenesis Symphony">Muse - Exogenesis Symphony</a></button><br />' +
		'3. <a href="https://www.youtube.com/watch?v=4MjLKjPc7q8"><button title="Rise Against - Audience Of One">Rise Against - Audience Of One</a></button><br />' +
		'4. <a href="https://www.youtube.com/watch?v=gxEPV4kolz0"><button title="Billy Joel - Piano Man">Billy Joel - Piano Man</a></button><br />' +
		'5. <a href="https://www.youtube.com/watch?v=IwdJYdDyKUw"><button title="Griffin Village - Spring">Griffin Village - Spring</a></button><br />');
	},
    	
    	spybox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>Spydreigon\'s Music Box!</b><br />' +
                '1. <a href="https://www.youtube.com/watch?v=gL-ZIbF6J6s"><button title="Pursuit - Cornered">Pursuit - Cornered</a></button><br />' +
                '2. <a href="https://www.youtube.com/watch?v=qgP1yc1PpoU"><button title="Mega Man 10 - Abandoned Memory">Mega Man 10 - Abandoned Memory</a></button><br />' +
		'3. <a href="https://www.youtube.com/watch?v=yW6ECMHrGcI"><button title="Super Training! 8 Bit - Pokemon X/Y">Super Training! 8 Bit - Pokemon X/Y</a></button><br />' +
		'4. <a href="https://www.youtube.com/watch?v=NWYJYcpSpCs"><button title="Mighty No. 9 Theme 8 Bit">Mighty No. 9 Theme 8 Bit</a></button><br />' +
		'5. <a href="https://www.youtube.com/watch?v=NwaCMbfHwmQ"><button title="Mega Man X5 - X vs Zero">Mega Man X5 - X vs Zero</a></button><br />');
	},
    	
    	solstereo: 'skybox',
    	equitrax: 'skybox',
	skybox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>Sky\'s Sound Track!</b><br />' +
                '1. <a href="https://www.youtube.com/watch?v=MTe9G2m0Rmg&feature=youtu.be"><button title="Linkin Park - Faint">Linkin Park - Faint</a></button><br />' +
                '2. <a href="https://www.youtube.com/watch?v=oOFK5VMHQ4o&feature=youtu.be"><button title="Muse - Butterflies And Hurricanes">Muse - Butterflies And Hurricanes</a></button><br />' +
		'3. <a href="https://www.youtube.com/watch?v=Exsu5a-rvz0&feature=youtu.be"><button title="Eric Calderone - Requiem for a Dream Meets Metal">Eric Calderone - Requiem for a Dream Meets Meta</a></button><br />' +
		'4. <a href="https://www.youtube.com/watch?v=szn4xlykFhQ&feature=youtu.be"><button title="Avenged Sevenfold - Bat Country (Nightcore)">Avenged Sevenfold - Bat Country (Nightcore)</a></button><br />' +
		'5. <a href="https://www.youtube.com/watch?v=LxQagftrJLI&feature=youtu.be"><button title="Halcyonic Falcon X - Those Of Us Who Fight">Halcyonic Falcon X - Those Of Us Who Fight</a></button><br />' +
		'6. <a href="https://www.youtube.com/watch?v=3EqCxFpanVQ&feature=youtu.be"><button title="Breaking Benjamin - Had Enough">Breaking Benjamin - Had Enough</a></button>');
	},
    	
    	vbox: 'jackbox',
	jackbox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>Usernamehere\'s Music Box!</b><br />' +
                '1. <a href="https://www.youtube.com/watch?v=a89Shp0YhR8"><button title="I\'m Made of Wax, Larry, What Are You Made Of? - Adtr">I\'m Made of Wax, Larry, What Are You Made Of? - Adtr</a></button><br />' +
                '2. <a href="https://www.youtube.com/watch?v=ZcpGIVbPYrI"><button title="Metal Gear Rising OST - It Has to Be This Way">Metal Gear Rising OST - It Has to Be This Way</a></button><br />' +
		'3. <a href="https://www.youtube.com/watch?v=wzS5-AjJ71E"><button title="The Ghost Inside - "Engine 45"">The Ghost Inside - "Engine 45"</a></button><br />' +
		'4. <a href="https://www.youtube.com/watch?v=AiBG6vuLrzY"><button title="Breaking Benjamin - Diary Of Jane">Breaking Benjamin - Diary Of Jane</a></button><br />' +
		'5. <a href="https://www.youtube.com/watch?v=Qt83YS_yay8"><button title="billy talent - fallen leaves">billy talent - fallen leaves</a></button><br />' +
		'6. <a href="https://www.youtube.com/watch?v=3IgSvQsKkOo"><button title="Deadman\'s Gun - Red Dead Redemption">Deadman\'s Gun - Red Dead Redemption</a></button><br />' );
	},
    	
    	panbox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>Panpawn\'s Music Box!</b><br />' +
		'1. <a href="https://www.youtube.com/watch?v=EJR5A2dttp8"><button title="Let It Go - Connie Talbot cover">Let It Go - Connie Talbot cover</a></button><br />' +
		'2. <a href="https://www.youtube.com/watch?v=Y2Ta0qCG8No"><button title="Crocodile Rock - Elton John">Crocodile Rock - Elton John</a></button><br />' +
		'3. <a href="https://www.youtube.com/watch?v=ZA3vZwxnKnE"><button title="My Angel Gabriel - Lamb">My Angel Gabriel - Lamb</a></button><br />' +
		'4. <a href="https://www.youtube.com/watch?v=y8AWFf7EAc4"><button title="Hallelujah - Jeff Buckley">Hallelujah - Jeff Buckley</a></button><br />' +
		'5. <a href="https://www.youtube.com/watch?v=aFIApXs0_Nw"><button title="Better Off Dead - Elton John">Better Off Dead - Elton John</a></button><br />' +
		'6. <a href="https://www.youtube.com/watch?v=eJLTGHEwaR8"><button title="Your Song - Carly Rose Sonenclar cover">Your Song - Carly Rose Sonenclar cover</a></button><br />' +
		'7. <a href="https://www.youtube.com/watch?v=DAJYk1jOhzk"><button title="Let It Go - Frozen - Alex Boyé">Let It Go - Frozen - Alex Boyé</a></button><br />' +
		'8. <a href="https://www.youtube.com/watch?v=8S-jdXJ0H4w"><button title="Elton John - Indian Sunset">Elton John-Indian Sunset</a></button><br />' +
		'9. <a href="https://www.youtube.com/watch?v=cnK_tfqHQnU"><button title="New York State Of Mind - Billy Joel">New York State Of Mind - Billy Joel</a></button><br />' +
	        '10. <a href="https://www.youtube.com/watch?v=0KDjzP84sVA"><button title="Counting Stars - Cimorelli">Counting Stars - Cimorelli</a></button><br />' +
		'11. <a href="https://www.youtube.com/watch?v=PpntEOQLpzI"><button title="Stay - Christina Grimmie">Stay - Christina Grimmie</a></button><br />' +
		'12. <a href="https://www.youtube.com/watch?v=JiBKfl-xhI0"><button title="Carly Rose Sonenclar - Feeling Good">Carly Rose Sonenclar - Feeling Good</a></button><br />' +
		'13. <a href="https://www.youtube.com/watch?v=Gj-ntawOBw4"><button title="Shake It Out - Choral">Shake It Out - Choral</a></button><br />' +
		'14. <a href="https://www.youtube.com/watch?v=n7wQQGtM-Hc"><button title="Elton John Sixty Years On Royal Opera House">Elton John Sixty Years On Royal Opera House</a></button><br />' +
		'15. <a href="https://www.youtube.com/watch?v=Izma0gpiLBQ"><button title="Elton John - Oceans Away">Elton John - Oceans Away</a></button><br />' +
		'16. <a href="https://www.youtube.com/watch?v=hOpK1Euwu5U"><button title="JennaAnne: I\'m Coming Home">JennaAnne: I\'m Coming Home</a></button>');
	},
	
	cabox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>CoolAsian\'s Music Box!</b><br />' +
                '1. <a href="http://youtu.be/UU8xKUoH_lU"><button title="Parkway Drive - Wild Eyes [Lyrics] [HD]">Parkway Drive - Wild Eyes [Lyrics] [HD]</a></button><br />' +
                '2. <a href="http://youtu.be/fOLqEOK_wLc"><button title="System Of A Down - B.Y.O.B.">System Of A Down - B.Y.O.B.</a></button><br />' +
		'3. <a href="http://youtu.be/312Sb-2PovA"><button title="SUICIDE SILENCE - You Only Live Once">SUICIDE SILENCE - You Only Live Once</a></button><br />' +
		'4. <a href="http://youtu.be/pUA-4WCXn5o"><button title="Atreyu - Demonology and Heartache">Atreyu - Demonology and Heartache</a></button><br />' +
		'5. <a href="http://youtu.be/zUq8I4JTOZU"><button title="Muse - Assassin (Grand Omega Bosses Edit)">Muse - Assassin (Grand Omega Bosses Edit)</a></button><br />' +
		'6. <a href="http://youtu.be/a89Shp0YhR8"><button title="A Day to Remember - I\'m Made of Wax, Larry, What Are You Made Of?">A Day to Remember - I\'m Made of Wax, Larry, What Are You Made Of?</a></button>');
	},
	
	
	lazerbox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>lazerbeam\'s Music Box!</b><br />' +
                '1. <a href="https://www.youtube.com/watch?v=fJ9rUzIMcZQ"><button title="Bohemian Rhapsody - Queen">Bohemian Rhapsody - Queen</a></button><br />' +
                '2. <a href="https://www.youtube.com/watch?v=ZNaA7fVXB28"><button title="Against the Wind - Bob Seger">Against the Wind -  Bob Seger</a></button><br />' +
                '3. <a href="https://www.youtube.com/watch?v=TuCGiV-EVjA"><button title="Livin\' on the Edge - Aerosmith">Livin\' on the Edge - Aerosmith</a></button><br />' +
                '4. <a href="https://www.youtube.com/watch?v=QZ_kYEDZVno"><button title="Rock and Roll Never Forgets - Bob Seger">Rock and Roll Never Forgets - Bob Seger</a></button><br />' +
                '5. <a href="https://www.youtube.com/watch?v=GHjKEwV2-ZM"><button title="Jaded - Aerosmith">Jaded - Aerosmith</a></button>');
	},
    	
    	        
    
		//End Music Boxes.
	
	
	avatars: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox("Your avatar can be changed using the Options menu (it looks like a gear) in the upper right of Pokemon Showdown. Custom avatars are only obtainable by staff.");
	},
	
	git: 'opensource',
	opensource: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('Pokemon Showdown is open source:<br />- Language: JavaScript (Node.js)<br />'+
				'- <a href="https://github.com/Zarel/Pokemon-Showdown" target="_blank">Pokemon Showdown Source Code / How to create a PS server</a><br />'+
				'- <a href="https://github.com/Zarel/Pokemon-Showdown-Client" target="_blank">Client Source Code</a><br />'+
				'- <a href="https://github.com/panpawn/Pokemon-Showdown">Gold Source Code</a>');
	},
	events: 'activities',
	activities: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<center><font size="3" face="comic sans ms">Gold Activities:</font></center></br>' +
				'★ <b>Tournaments</b> - Here on Gold, we have a tournaments script that allows users to partake in several different tiers.  For a list of tour commands do /th.  Ask in the lobby for a voice (+) or up to start one of these if you\'re interesrted!<br>' +
				'★ <b>Hangmans</b> - We have a hangans script that allows users to  partake in a "hangmans" sort of a game.  For a list of hangmans commands, do /hh.  As a voice (+) or up in the lobby to start one of these if interested.<br>' +
				'★ <b>Scavengers</b> - We have a whole set of scavenger commands that can be done in the <button name="joinRoom" value="scavengers" target="_blank">Scavengers Room</button>.<br>' +
				'★ <b>Leagues</b> - If you click the "join room page" to the upper right (+), it will display a list of rooms we have.  Several of these rooms are 3rd party leagues of Gold; join them to learn more about each one!<br>' +
				'★ <b>Battle</b> - By all means, invite your friends on here so that you can battle with each other!  Here on Gold, we are always up to date on our formats, so we\'re a great place to battle on!<br>' +
				'★ <b>Chat</b> - Gold is full of great people in it\'s community and we\'d love to have you be apart of it!<br>' +
				'★ <b>Learn</b> - Are you new to Pokemon?  If so, then feel FREE to ask the lobby any questions you might have!<br>' +
				'★ <b>Shop</b> - Do /shop to learn about where your Gold Bucks can go! <br>' +
				'★ <b>Plug.dj</b> - Come listen to music with us! Click <a href="http://plug.dj/gold-server/">here</a> to start!<br>' +
				'<i>--PM staff (%, @, &, ~) any questions you might have!</i>');
	},
	introduction: 'intro',
	intro: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox(
			"New to competitive pokemon?<br />" +
			"- <a href=\"http://www.smogon.com/sim/ps_guide\">Beginner's Guide to Pokémon Showdown</a><br />" +
			"- <a href=\"http://www.smogon.com/dp/articles/intro_comp_pokemon\">An introduction to competitive Pokémon</a><br />" +
			"- <a href=\"http://www.smogon.com/bw/articles/bw_tiers\">What do 'OU', 'UU', etc mean?</a><br />" +
			"- <a href=\"http://www.smogon.com/xyhub/tiers\">What are the rules for each format? What is 'Sleep Clause'?</a>"
		);
	},

	mentoring: 'smogintro',
	smogonintro: 'smogintro',
	smogintro: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox(
			"Welcome to Smogon's official simulator! Here are some useful links to <a href=\"http://www.smogon.com/mentorship/\">Smogon\'s Mentorship Program</a> to help you get integrated into the community:<br />" +
			"- <a href=\"http://www.smogon.com/mentorship/primer\">Smogon Primer: A brief introduction to Smogon's subcommunities</a><br />" +
			"- <a href=\"http://www.smogon.com/mentorship/introductions\">Introduce yourself to Smogon!</a><br />" +
			"- <a href=\"http://www.smogon.com/mentorship/profiles\">Profiles of current Smogon Mentors</a><br />" +
			"- <a href=\"http://mibbit.com/#mentor@irc.synirc.net\">#mentor: the Smogon Mentorship IRC channel</a>"
		);
	},

	calculator: 'calc',
	calc: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox(
			"Pokemon Showdown! damage calculator. (Courtesy of Honko)<br />" +
			"- <a href=\"http://pokemonshowdown.com/damagecalc/\">Damage Calculator</a>"
		);
	},

	cap: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox(
			"An introduction to the Create-A-Pokemon project:<br />" +
			"- <a href=\"http://www.smogon.com/cap/\">CAP project website and description</a><br />" +
			"- <a href=\"http://www.smogon.com/forums/showthread.php?t=48782\">What Pokemon have been made?</a><br />" +
			"- <a href=\"http://www.smogon.com/forums/showthread.php?t=3464513\">Talk about the metagame here</a><br />" +
			"- <a href=\"http://www.smogon.com/forums/showthread.php?t=3466826\">Practice BW CAP teams</a>"
		);
	},

	gennext: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox(
			"NEXT (also called Gen-NEXT) is a mod that makes changes to the game:<br />" +
			"- <a href=\"https://github.com/Zarel/Pokemon-Showdown/blob/master/mods/gennext/README.md\">README: overview of NEXT</a><br />" +
			"Example replays:<br />" +
			"- <a href=\"http://replay.pokemonshowdown.com/gennextou-37815908\">roseyraid vs Zarel</a><br />" +
			"- <a href=\"http://replay.pokemonshowdown.com/gennextou-37900768\">QwietQwilfish vs pickdenis</a>"
		);
	},

	om: 'othermetas',
	othermetas: function (target, room, user) {
		if (!this.canBroadcast()) return;
		target = toId(target);
		var buffer = "";
		var matched = false;
		if (!target || target === 'all') {
			matched = true;
			buffer += "- <a href=\"http://www.smogon.com/forums/forums/206/\">Information on the Other Metagames</a><br />";
		}
		if (target === 'all' || target === 'hackmons') {
			matched = true;
			buffer += "- <a href=\"http://www.smogon.com/forums/threads/3475624/\">Hackmons</a><br />";
		}
		if (target === 'all' || target === 'balancedhackmons' || target === 'bh') {
			matched = true;
			buffer += "- <a href=\"http://www.smogon.com/forums/threads/3463764/\">Balanced Hackmons</a><br />";
			if (target !== 'all') {
				buffer += "- <a href=\"http://www.smogon.com/forums/threads/3499973/\">Balanced Hackmons Mentoring Program</a><br />";
			}
		}
		if (target === 'all' || target === 'glitchmons') {
			matched = true;
			buffer += "- <a href=\"http://www.smogon.com/forums/threads/3467120/\">Glitchmons</a><br />";
		}
		if (target === 'all' || target === 'tiershift' || target === 'ts') {
			matched = true;
			buffer += "- <a href=\"http://www.smogon.com/forums/threads/3479358/\">Tier Shift</a><br />";
		}
		if (target === 'all' || target === 'stabmons') {
			matched = true;
			buffer += "- <a href=\"http://www.smogon.com/forums/threads/3484106/\">STABmons</a><br />";
		}
		if (target === 'all' || target === 'omotm' || target === 'omofthemonth' || target === 'month') {
			matched = true;
			buffer += "- <a href=\"http://www.smogon.com/forums/threads/3481155/\">OM of the Month</a><br />";
		}
		if (target === 'all' || target === 'skybattles') {
			matched = true;
			buffer += "- <a href=\"http://www.smogon.com/forums/threads/3493601/\">Sky Battles</a><br />";
		}
		if (target === 'all' || target === 'inversebattle' || target === 'inverse') {
			matched = true;
			buffer += "- <a href=\"http://www.smogon.com/forums/threads/3492433/\">Inverse Battle</a><br />";
		}
		if (target === 'all' || target === 'middlecup' || target === 'mc') {
			matched = true;
			buffer += "- <a href=\"http://www.smogon.com/forums/threads/3494887/\">Middle Cup</a><br />";
		}
		if (target === 'all' || target === 'outheorymon' || target === 'theorymon') {
			matched = true;
			buffer += "- <a href=\"http://www.smogon.com/forums/threads/3499219/\">OU Theorymon</a><br />";
		}
		if (target === 'all' || target === 'index') {
			matched = true;
			buffer += "- <a href=\"http://www.smogon.com/forums/threads/other-metagames-index.3472405/\">OM Index</a><br />";
		}
		if (!matched) {
			return this.sendReply("The Other Metas entry '" + target + "' was not found. Try /othermetas or /om for general help.");
		}
		this.sendReplyBox(buffer);
	},

	roomhelp: function (target, room, user) {
		if (room.id === 'lobby') return this.sendReply("This command is too spammy for lobby.");
		if (!this.canBroadcast()) return;
		this.sendReplyBox('Room drivers (%) can use:<br />' +
			'- /warn OR /k <em>username</em>: warn a user and show the Pokemon Showdown rules<br />' +
			'- /mute OR /m <em>username</em>: 7 minute mute<br />' +
			'- /hourmute OR /hm <em>username</em>: 60 minute mute<br />' +
			'- /unmute <em>username</em>: unmute<br />' +
			'- /announce OR /wall <em>message</em>: make an announcement<br />' +
			'- /modlog <em>username</em>: search the moderator log of the room<br />' +
			'<br />' +
			'Room moderators (@) can also use:<br />' +
			'- /roomban OR /rb <em>username</em>: bans user from the room<br />' +
			'- /roomunban <em>username</em>: unbans user from the room<br />' +
			'- /roomvoice <em>username</em>: appoint a room voice<br />' +
			'- /roomdevoice <em>username</em>: remove a room voice<br />' +
			'- /modchat <em>[off/autoconfirmed/+]</em>: set modchat level<br />' +
			'<br />' +
			'Room owners (#) can also use:<br />' +
			'- /roomdesc <em>description</em>: set the room description on the room join page<br />' +
			'- /rules <em>rules link</em>: set the room rules link seen when using /rules<br />' +
			'- /roommod, /roomdriver <em>username</em>: appoint a room moderator/driver<br />' +
			'- /roomdemod, /roomdedriver <em>username</em>: remove a room moderator/driver<br />' +
			'- /modchat <em>[%/@/#]</em>: set modchat level<br />' +
			'- /declare <em>message</em>: make a room declaration<br /><br>' +
			'The room founder can also use:<br />' +
			'- /roomowner <em>username</em><br />' +
			'- /roomdeowner <em>username</em><br />' +
			'</div>');
	},

	restarthelp: function (target, room, user) {
		if (room.id === 'lobby' && !this.can('lockdown')) return false;
		if (!this.canBroadcast()) return;
		this.sendReplyBox('The server is restarting. Things to know:<br />' +
			'- We wait a few minutes before restarting so people can finish up their battles<br />' +
			'- The restart itself will take a few seconds<br />' +
			'- Your ladder ranking and teams will not change<br />' +
			'- We are restarting to update Gold to a newer version' +
			'</div>');
	},

	
	tc: 'tourhelp',
	th: 'tourhelp',
	tourhelp: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<b><font size="4"><font color="green">Tournament Commands List:</font></b><br>' +
				'<b>/tpoll</b> - Starts a poll asking what tier users want. Requires: +, %, @, &, ~. <br>' +
				'<b>/tour [tier], [number of people or xminutes]</b> Requires: +, %, @, &, ~.<br>' +
				'<b>/endtour</b> - Ends the current tournement. Requires: +, %, @, &, ~.<br>' +
				'<b>/replace [replacee], [replacement]</b> Requires: +, %, @, &, ~.<br>' +
				'<b>/dq [username]</b> - Disqualifies a user from the tournement. Requires: +, %, @, &, ~.<br>' +
				'<b>/fj [user]</b> - Forcibily joins a user into the tournement in the sign up phase. Requires: +, %, @, &, ~.<br>' +
				'<b>/fl [username]</b> - Forcibily makes a user leave the tournement in the sign up phase. Requires: +, %, @, &, ~.<br>' +
				'<b>/vr</b> - Views the current round in the tournement of whose won and whose lost and who hasn\'t started yet.<br>' +
				'<b>/toursize [number]</b> - Changes the tour size if you started it with a number instead of a time limit during the sign up phase.<br>' +
				'<b>/tourtime [xminutes]</b> - Changes the tour time if you started it with a time limit instead of a number during the sign up phase.<br>' +
				'<b><font size="2"><font color="green">Polls Commands List:</b></font><br>' +
				'<b>/poll [title], [option],[option], exc...</b> - Starts a poll. Requires: +, %, @, &, ~.<br>' +
				'<b>/pr</b> - Reminds you of what the current poll is.<br>' +
				'<b>/endpoll</b> - Ends the current poll. Requires: +, %, @, &, ~.<br>' +
				'<b>/vote [opinion]</b> - votes for an option of the current poll.<br><br>' +
				'<i>--Just ask in the lobby if you\'d like a voice or up to start a tourney!</i>');
	},

	rule: 'rules',
	rules: function (target, room, user) {
		if (!target) {
			if (!this.canBroadcast()) return;
			this.sendReplyBox('Please follow the rules:<br />' +
			(room.rulesLink ? '- <a href="' + sanitize(room.rulesLink) + '">' + sanitize(room.title) + ' room rules</a><br />' : '') +
			'- <a href="http://goldserver.weebly.com/rules.html">'+(room.rulesLink?'Global rules':'Rules')+'</a><br />' +
			'</div>');
			return;
		}
		if (!this.can('roommod', null, room)) return;
		if (target.length > 80) {
			return this.sendReply("Error: Room rules link is too long (must be under 80 characters). You can use a URL shortener to shorten the link.");
		}

		room.rulesLink = target.trim();
		this.sendReply("(The room rules link is now: " + target + ")");

		if (room.chatRoomData) {
			room.chatRoomData.rulesLink = room.rulesLink;
			Rooms.global.writeChatRoomData();
		}
	},

	faq: function (target, room, user) {
		if (!this.canBroadcast()) return;
		target = target.toLowerCase();
		var buffer = "";
		var matched = false;
		if (!target || target === 'all') {
			matched = true;
			buffer += "<a href=\"http://www.smogon.com/sim/faq\">Frequently Asked Questions</a><br />";
		}
		if (target === 'all' || target === 'deviation') {
			matched = true;
			buffer += "<a href=\"http://www.smogon.com/sim/faq#deviation\">Why did this user gain or lose so many points?</a><br />";
		}
		if (target === 'all' || target === 'doubles' || target === 'triples' || target === 'rotation') {
			matched = true;
			buffer += "<a href=\"http://www.smogon.com/sim/faq#doubles\">Can I play doubles/triples/rotation battles here?</a><br />";
		}
		if (target === 'all' || target === 'randomcap') {
			matched = true;
			buffer += "<a href=\"http://www.smogon.com/sim/faq#randomcap\">What is this fakemon and what is it doing in my random battle?</a><br />";
		}
		if (target === 'all' || target === 'restarts') {
			matched = true;
			buffer += "<a href=\"http://www.smogon.com/sim/faq#restarts\">Why is the server restarting?</a><br />";
		}
		if (target === 'all' || target === 'staff') {
			matched = true;
			buffer += '<a href="http://goldserver.weebly.com/how-do-i-get-a-rank.html">Staff FAQ</a><br />';
		}
		if (target === 'all' || target === 'autoconfirmed' || target === 'ac') {
			matched = true;
			buffer += "A user is autoconfirmed when they have won at least one rated battle and have been registered for a week or longer.<br />";
		}
		if (target === 'all' || target === 'customsymbol' || target === 'cs') {
			matched = true;
			buffer += 'A custom symbol will bring your name up to the top of the userlist with a custom symbol next to it.  These reset after the server restarts.<br />';
		}
		if (target === 'all' || target === 'league') {
			matched = true;
			buffer += 'Welcome to Gold!  So, you\'re interested in making or moving a league here?  If so, read <a href="http://goldserver.weebly.com/making-a-league.html">this</a> and write down your answers on a <a href="http://pastebin.com">Pastebin</a> and PM it to an admin.  Good luck!<br />';
		}
		if (!matched) {
			return this.sendReply("The FAQ entry '" + target + "' was not found. Try /faq for general help.");
		}
		this.sendReplyBox(buffer);
	},

	banlists: 'tiers',
	tier: 'tiers',
	tiers: function (target, room, user) {
		if (!this.canBroadcast()) return;
		target = toId(target);
		var buffer = "";
		var matched = false;
		if (!target || target === 'all') {
			matched = true;
			buffer += "- <a href=\"http://www.smogon.com/tiers/\">Smogon Tiers</a><br />";
			buffer += "- <a href=\"http://www.smogon.com/forums/threads/tiering-faq.3498332/\">Tiering FAQ</a><br />";
			buffer += "- <a href=\"http://www.smogon.com/xyhub/tiers\">The banlists for each tier</a><br />";
		}
		if (target === 'all' || target === 'ubers' || target === 'uber') {
			matched = true;
			buffer += "- <a href=\"http://www.smogon.com/bw/tiers/uber\">Uber Pokemon</a><br />";
		}
		if (target === 'all' || target === 'overused' || target === 'ou') {
			matched = true;
			buffer += "- <a href=\"http://www.smogon.com/bw/tiers/ou\">Overused Pokemon</a><br />";
		}
		if (target === 'all' || target === 'underused' || target === 'uu') {
			matched = true;
			buffer += "- <a href=\"http://www.smogon.com/bw/tiers/uu\">Underused Pokemon</a><br />";
		}
		if (target === 'all' || target === 'rarelyused' || target === 'ru') {
			matched = true;
			buffer += "- <a href=\"http://www.smogon.com/bw/tiers/ru\">Rarelyused Pokemon</a><br />";
		}
		if (target === 'all' || target === 'neverused' || target === 'nu') {
			matched = true;
			buffer += "- <a href=\"http://www.smogon.com/bw/tiers/nu\">Neverused Pokemon</a><br />";
		}
		if (target === 'all' || target === 'littlecup' || target === 'lc') {
			matched = true;
			buffer += "- <a href=\"http://www.smogon.com/bw/tiers/lc\">Little Cup Pokemon</a><br />";
		}
		if (target === 'all' || target === 'doubles') {
			matched = true;
			buffer += "- <a href=\"http://www.smogon.com/bw/metagames/doubles\">Doubles</a><br />";
		}
		if (!matched) {
			return this.sendReply("The Tiers entry '" + target + "' was not found. Try /tiers for general help.");
		}
		this.sendReplyBox(buffer);
	},

	analysis: 'smogdex',
	strategy: 'smogdex',
	smogdex: function (target, room, user) {
		if (!this.canBroadcast()) return;

		var targets = target.split(',');
		if (toId(targets[0]) === 'previews') return this.sendReplyBox("<a href=\"http://www.smogon.com/forums/threads/sixth-generation-pokemon-analyses-index.3494918/\">Generation 6 Analyses Index</a>, brought to you by <a href=\"http://www.smogon.com\">Smogon University</a>");
		var pokemon = Tools.getTemplate(targets[0]);
		var item = Tools.getItem(targets[0]);
		var move = Tools.getMove(targets[0]);
		var ability = Tools.getAbility(targets[0]);
		var atLeastOne = false;
		var generation = (targets[1] || 'bw').trim().toLowerCase();
		var genNumber = 5;
		var doublesFormats = {'vgc2012':1, 'vgc2013':1, 'doubles':1};
		var doublesFormat = (!targets[2] && generation in doublesFormats)? generation : (targets[2] || '').trim().toLowerCase();
		var doublesText = '';
		if (generation === 'bw' || generation === 'bw2' || generation === '5' || generation === 'five') {
			generation = 'bw';
		} else if (generation === 'dp' || generation === 'dpp' || generation === '4' || generation === 'four') {
			generation = 'dp';
			genNumber = 4;
		} else if (generation === 'adv' || generation === 'rse' || generation === 'rs' || generation === '3' || generation === 'three') {
			generation = 'rs';
			genNumber = 3;
		} else if (generation === 'gsc' || generation === 'gs' || generation === '2' || generation === 'two') {
			generation = 'gs';
			genNumber = 2;
		} else if(generation === 'rby' || generation === 'rb' || generation === '1' || generation === 'one') {
			generation = 'rb';
			genNumber = 1;
		} else {
			generation = 'bw';
		}
		if (doublesFormat !== '') {
			// Smogon only has doubles formats analysis from gen 5 onwards.
			if (!(generation in {'bw':1, 'xy':1}) || !(doublesFormat in doublesFormats)) {
				doublesFormat = '';
			} else {
				doublesText = {'vgc2012':"VGC 2012", 'vgc2013':"VGC 2013", 'doubles':"Doubles"}[doublesFormat];
				doublesFormat = '/' + doublesFormat;
			}
		}

		// Pokemon
		if (pokemon.exists) {
			atLeastOne = true;
			if (genNumber < pokemon.gen) {
				return this.sendReplyBox("" + pokemon.name + " did not exist in " + generation.toUpperCase() + "!");
			}
			if (pokemon.tier === 'G4CAP' || pokemon.tier === 'G5CAP') {
				generation = 'cap';
			}

			var poke = pokemon.name.toLowerCase();
			if (poke === 'nidoranm') poke = 'nidoran-m';
			if (poke === 'nidoranf') poke = 'nidoran-f';
			if (poke === 'farfetch\'d') poke = 'farfetchd';
			if (poke === 'mr. mime') poke = 'mr_mime';
			if (poke === 'mime jr.') poke = 'mime_jr';
			if (poke === 'deoxys-attack' || poke === 'deoxys-defense' || poke === 'deoxys-speed' || poke === 'kyurem-black' || poke === 'kyurem-white') poke = poke.substr(0, 8);
			if (poke === 'wormadam-trash') poke = 'wormadam-s';
			if (poke === 'wormadam-sandy') poke = 'wormadam-g';
			if (poke === 'rotom-wash' || poke === 'rotom-frost' || poke === 'rotom-heat') poke = poke.substr(0, 7);
			if (poke === 'rotom-mow') poke = 'rotom-c';
			if (poke === 'rotom-fan') poke = 'rotom-s';
			if (poke === 'giratina-origin' || poke === 'tornadus-therian' || poke === 'landorus-therian') poke = poke.substr(0, 10);
			if (poke === 'shaymin-sky') poke = 'shaymin-s';
			if (poke === 'arceus') poke = 'arceus-normal';
			if (poke === 'thundurus-therian') poke = 'thundurus-t';

			this.sendReplyBox("<a href=\"http://www.smogon.com/" + generation + "/pokemon/" + poke + doublesFormat + "\">" + generation.toUpperCase() + " " + doublesText + " " + pokemon.name + " analysis</a>, brought to you by <a href=\"http://www.smogon.com\">Smogon University</a>");
		}

		// Item
		if (item.exists && genNumber > 1 && item.gen <= genNumber) {
			atLeastOne = true;
			var itemName = item.name.toLowerCase().replace(' ', '_');
			this.sendReplyBox("<a href=\"http://www.smogon.com/" + generation + "/items/" + itemName + "\">" + generation.toUpperCase() + " " + item.name + " item analysis</a>, brought to you by <a href=\"http://www.smogon.com\">Smogon University</a>");
		}

		// Ability
		if (ability.exists && genNumber > 2 && ability.gen <= genNumber) {
			atLeastOne = true;
			var abilityName = ability.name.toLowerCase().replace(' ', '_');
			this.sendReplyBox("<a href=\"http://www.smogon.com/" + generation + "/abilities/" + abilityName + "\">" + generation.toUpperCase() + " " + ability.name + " ability analysis</a>, brought to you by <a href=\"http://www.smogon.com\">Smogon University</a>");
		}

		// Move
		if (move.exists && move.gen <= genNumber) {
			atLeastOne = true;
			var moveName = move.name.toLowerCase().replace(' ', '_');
			this.sendReplyBox("<a href=\"http://www.smogon.com/" + generation + "/moves/" + moveName + "\">" + generation.toUpperCase() + " " + move.name + " move analysis</a>, brought to you by <a href=\"http://www.smogon.com\">Smogon University</a>");
		}

		if (!atLeastOne) {
			return this.sendReplyBox("Pokemon, item, move, or ability not found for generation " + generation.toUpperCase() + ".");
		}
		
	},

	forums: function(target, room, user) {
		if (!this.canBroadcast()) return;
		return this.sendReplyBox('Gold Forums can be found <a href="http://gold.lefora.com/" >here</a>.');
	},
	regdate: function(target, room, user, connection) { 
		if (!this.canBroadcast()) return;
		if (!target || target =="0") return this.sendReply('Lol, you can\'t do that, you nub.');
		if (!target || target == "." || target == "," || target == "'") return this.sendReply('/regdate - Please specify a valid username.'); //temp fix for symbols that break the command
		var html = ['<img ','<a href','<font ','<marquee','<blink','<center', '<button'];
        	for (var x in html) {
        	if (target.indexOf(html[x]) > -1) return this.sendReply('HTML is not supported in this command.');
        	}
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
						data = username+' was registered on'+regdate+'.';
					}
				}
			}
			else {
				data = username+' is not registered.';
			}
			self.sendReplyBox(data);
		    });
		});
		req.end();
	},
	
	league: function(target, room, user) {
		if (!this.canBroadcast()) return;
		return this.sendReplyBox('<font size="2"><b><center>Goodra League</font></b></center>' +
					 '★The league consists of 3 Gym Leaders<br /> ' +
					 '★Currently the Champion position is empty.<br/>' + 
					 '★Be the first to complete the league, and the spot is yours!<br />' +
					 '★The champion gets a FREE trainer card, custom avatar and global voice!<br />' +
					 '★The Goodra League information can be found <a href="http://goldserver.weebly.com/league.html" >here</a>.<br />' +
					 '★Click <button name=\"joinRoom\" value=\"goodraleague\">here</button> to enter our League\'s room!');
	},

	stafffaq: function (target, room, user) {
		if (!this.canBroadcast()) return;
		return this.sendReplyBox('Click <a href="http://goldserver.weebly.com/how-do-i-get-a-rank-on-gold.html">here</a> to find out about Gold\'s ranks and promotion system.');
	},

	/*********************************************************
	 * Miscellaneous commands
	 *********************************************************/

	//kupo: function(target, room, user){
		//if(!this.canBroadcast()|| !user.can('broadcast')) return this.sendReply('/kupo - Access Denied.');
		//if(!target) return this.sendReply('Insufficent Parameters.');
		//room.add('|c|~kupo|/me '+ target);
		//this.logModCommand(user.name + ' used /kupo to say ' + target);
	//},

	birkal: function(target, room, user) {
		this.sendReply("It's not funny anymore.");
	},

	potd: function(target, room, user) {
		if (!this.can('potd')) return false;

		Config.potd = target;
		Simulator.SimulatorProcess.eval('Config.potd = \'' + toId(target) + '\'');
		if (target) {
			if (Rooms.lobby) Rooms.lobby.addRaw("<div class=\"broadcast-blue\"><b>The Pokemon of the Day is now " + target + "!</b><br />This Pokemon will be guaranteed to show up in random battles.</div>");
			this.logModCommand("The Pokemon of the Day was changed to " + target + " by " + user.name + ".");
		} else {
			if (Rooms.lobby) Rooms.lobby.addRaw("<div class=\"broadcast-blue\"><b>The Pokemon of the Day was removed!</b><br />No pokemon will be guaranteed in random battles.</div>");
			this.logModCommand("The Pokemon of the Day was removed by " + user.name + ".");
		}
	},

	
	 nstaffmemberoftheday: 'smotd',
	 nsmotd: function(target, room, user){
	 if (room.id !== 'lobby') return this.sendReply("This command can only be used in Lobby.");
	//Users cannot do HTML tags with this command.
			if (target.indexOf('<img ') > -1) {
			return this.sendReply('HTML is not supported in this command.')
			}
			if (target.indexOf('<a href') > -1) {
			return this.sendReply('HTML is not supported in this command.')
			}
			if (target.indexOf('<font ') > -1) {
			return this.sendReply('HTML is not supported in this command.')
			}
			if (target.indexOf('<marquee') > -1) {
			return this.sendReply('HTML is not supported in this command.')
			}
			if (target.indexOf('<blink') > -1) {
			return this.sendReply('HTML is not supported in this command.')
			}
			if (target.indexOf('<center') > -1) {
			return this.sendReply('HTML is not supported in this command.')
			}
			if(!target) return this.sendReply('/nsmotd needs an Staff Member.');
	//Users who are muted cannot use this command.
			if (target.length > 25) {
			return this.sendReply('This Staff Member\'s name is too long; it cannot exceed 25 characters.');
			}
			if (!this.canTalk()) return;
            room.addRaw(''+user.name+'\'s nomination  for Staff Member of the Day is: <b><i>' + target +'</i></b>');
    	},

	staffmemberoftheday: 'smotd',
	smotd: function(target, room, user) {
			if (room.id !== 'lobby') return this.sendReply("This command can only be used in Lobby.");
	//User use HTML with this command.
			if (target.indexOf('<img ') > -1) {
			return this.sendReply('HTML is not supported in this command.')
			}
			if (target.indexOf('<a href') > -1) {
			return this.sendReply('HTML is not supported in this command.')
			}
			if (target.indexOf('<font ') > -1) {
			return this.sendReply('HTML is not supported in this command.')
			}
			if (target.indexOf('<marquee') > -1) {
			return this.sendReply('HTML is not supported in this command.')
			}
			if (target.indexOf('<blink') > -1) {
			return this.sendReply('HTML is not supported in this command.')
			}
			if (target.indexOf('<center') > -1) {
			return this.sendReply('HTML is not supported in this command.')
			}
			if (!target) {
	//allows user to do /smotd to view who is the Staff Member of the day if people forget.
			return this.sendReply('The current Staff Member of the Day is: '+room.smotd);
			}
	//Users who are muted cannot use this command.
			if (!this.canTalk()) return;
	//Only room drivers and up may use this command.
			if (target.length > 25) {
			return this.sendReply('This Staff Member\'s name is too long; it cannot exceed 25 characters.');
			}
			if (!this.can('mute', null, room)) return;
				room.smotd = target;
			if (target) {
	//if a user does /smotd (Staff Member name here), then we will display the Staff Member of the Day.
			room.addRaw('<div class="broadcast-red"><font size="2"><b>The Staff Member of the Day is now <font color="black">'+target+'!</font color></font size></b> <font size="1">(Set by '+user.name+'.)<br />This Staff Member is now the honorary Staff Member of the Day!</div>');
			this.logModCommand('The Staff Member of the Day was changed to '+target+' by '+user.name+'.');
		} else {
	//If there is no target, then it will remove the Staff Member of the Day.
			room.addRaw('<div class="broadcast-green"><b>The Staff Member of the Day was removed!</b><br />There is no longer an Staff Member of the day today!</div>');
			this.logModCommand('The Staff Member of the Day was removed by '+user.name+'.');
		}
	},
	
	roll: 'dice',
	dice: function (target, room, user) {
		if (!target) return this.parse('/help dice');
		if (!this.canBroadcast()) return;
		var d = target.indexOf("d");
		if (d != -1) {
			var num = parseInt(target.substring(0, d));
			var faces;
			if (target.length > d) faces = parseInt(target.substring(d + 1));
			if (isNaN(num)) num = 1;
			if (isNaN(faces)) return this.sendReply("The number of faces must be a valid integer.");
			if (faces < 1 || faces > 1000) return this.sendReply("The number of faces must be between 1 and 1000");
			if (num < 1 || num > 20) return this.sendReply("The number of dice must be between 1 and 20");
			var rolls = [];
			var total = 0;
			for (var i = 0; i < num; ++i) {
				rolls[i] = (Math.floor(faces * Math.random()) + 1);
				total += rolls[i];
			}
			return this.sendReplyBox("Random number " + num + "x(1 - " + faces + "): " + rolls.join(", ") + "<br />Total: " + total);
		}
		if (target && isNaN(target) || target.length > 21) return this.sendReply("The max roll must be a number under 21 digits.");
		var maxRoll = (target)? target : 6;
		var rand = Math.floor(maxRoll * Math.random()) + 1;
		return this.sendReplyBox("Random number (1 - " + maxRoll + "): " + rand);
	},
/*/	
	rollgame: 'dicegame',
	dicegame: function(target, room, user) {
		if (!this.canBroadcast()) return;
		if (Users.get(''+user.name+'').money < target) {
			return this.sendReply('You cannot wager more than you have, nub.');
		}
		if(!target) return this.sendReply('/dicegame [amount of bucks agreed to wager].');
		if (isNaN(target)) {
			return this.sendReply('Very funny, now use a real number.');
		}
		if (String(target).indexOf('.') >= 0) {
			return this.sendReply('You cannot wager numbers with decimals.');
		}
		if (target < 0) {
			return this.sendReply('Number cannot be negative.');
		}
		if (target > 100) {
			return this.sendReply('Error: You cannot wager over 100 bucks.');
		}
		if (target == 0) {
			return this.sendReply('Number cannot be 0.');
		}
		var player1 = Math.floor(6 * Math.random()) + 1;
		var player2 = Math.floor(6 * Math.random()) + 1;
		var winner = '';
		var loser= '';
		if (player1 > player2) {
		winner = 'The <b>winner</b> is <font color="green">'+user.name+'</font>!';
		loser = 'Better luck next time, computer!';
		return this.add('|c|~crowt|.custom /tb '+user.name+','+target+'');
		}
		if (player1 < player2) {
		winner = 'The <b>winner</b> is <font color="green">Opponent</font>!';
		loser = 'Better luck next time, '+user.name+'!';
		return this.add('|c|~crowt|.custom /removebucks '+user.name+','+target+'');
		}
		if (player1 === player2) {
		winner = 'It\'s a <b>tie</b>!';
		loser = 'Try again!';
		}
		return this.sendReplyBox('<center><font size="4"><b><img border="5" title="Dice Game!"></b></font></center><br />' +
				'<font color="red">This game is worth '+target+' buck(s).</font><br />' +
				'Loser: Tranfer bucks to the winner using /tb [winner], '+target+' <br />' +
				'<hr>' +
				''+user.name+' roll (1-6): 	'+player1+'<br />' + 
				'Opponent roll (1-6): 	'+player2+'<br />' +
				'<hr>' +
				'Winner: '+winner+'<br />' +
				''+loser+'');
	},
	*/
	
	
	freebuck: function(target, room, user) {
		if (!this.canBroadcast()) return;
	  	if (!this.canTalk()) return;
	  	this.sendReplyBox('This command has been removed.');
	  	/*/
	  	if (room.id !== 'casino') return this.sendReplyBox('This command can only be used in <button name="send" value="/join casino" target="_blank">The Casino</button>.');
		if (Users.get(''+user.name+'').money === 0) {
			return this.add('|c|~GoldBucks|.custom /tb '+user.name+',1');		}
		if (Users.get(''+user.name+'').money >= 1) {
			return this.sendReply('You can only get a buck if you don\'t have any, ya nub.');
		}
		if (Users.get(''+user.name+'').money <= -1) {
			return this.sendReply('I\'m sorry, I cannot help you if you have negitive bucks. :I');
		}
		*/
	},
	
	gamble: 'dicegame',
	wager: 'dicegame',
	rollgame: 'dicegame',
	dicegame: function(target, room, user) {
		if (!this.canBroadcast()) return;
	  	if (!this.canTalk()) return;
	  	if (room.id !== 'casino') return this.sendReplyBox('This command can only be used in <button name="send" value="/join casino" target="_blank">The Casino</button>.');
		this.sendReplyBox('This command has been removed.');
		/*/if (Users.get(''+user.name+'').money < target) {
			return this.sendReply('You cant\'t wager more than you have, nub.');
		}
		if(!target) return this.sendReply('/wager [amount of bucks agreed to wager].');
		if (isNaN(target)) {
			return this.sendReply('Very funny, now use a real number.');
		}
		if (String(target).indexOf('.') >= 0) {
			return this.sendReply('You cannot wager numbers with decimals.');
		}
		if (target < 0) {
			return this.sendReply('Number cannot be negative.');
		}
		if (target > 500) {
			return this.sendReply('Error: You cannot wager over 500 bucks.');
		}
		if (target == 0) {
			return this.sendReply('Number cannot be 0.');
		}
		
                var results = '';
		var rand = Math.floor(200 * Math.random()) + 1;
		if (rand <= 100) {
		results = this.add('|c|'+user.name+'|I\'m gambling!');
		results = this.add('|c|~GoldBucks|.custom /tb '+user.name+','+target+'');
		}
		if (rand >= 101) {
		results = this.add('|c|'+user.name+'|I\'m gambling!');	
		results = this.add('|c|~GoldBucks|.custom /removebucks '+user.name+','+target+'');
		}
		if (rand == 200) {
                var jackpot = (target * 20);
                results = this.add('|c|'+user.name+'|I\'m gambling!');
		results = this.add('|c|~GoldBucks|**'+user.name+' has hit the jackpot!  That means they have won 20 times their wager! ('+jackpot+')**'); 
		results = this.add('|c|~GoldBucks|.custom /tb '+user.name+', '+jackpot+'');
		} 
                return (results);
                */
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
		return this.sendReplyBox(''+results+'');
	},
	
	quoteoftheday: 'qotd',
	qotd: function(target, room, user) {
		if (room.id !== 'thehappyplace') return this.sendReply("This command can only be used in The Happy Place.");
		if (!this.canTalk()) return;
		if (!target) {
			if (!room.quoteOn) {
				room.quote = "... This has not been set yet.";
			}
                	if (!this.canBroadcast()) return;
                	this.sendReplyBox("The current <b>\"Insiprational Quote of the Day\"</b> is: <br /> " + Tools.escapeHTML(room.quote) + "");
               		return;
      		}
      		if (!target && !room.quoteOn) {
      			return this.sendReply("The quote of the day has been disabled.");
      		}
      		if (target === 'off' || target === 'disable' || target === 'reset') {
      			this.logModCommand(Tools.escapeHTML(user.name) + " has reset the Quote of the Day.");
      			room.addRaw("The Quote of the Day was reset by " + Tools.escapeHTML(user.name) + ".");
      			room.quoteOn = false;
      			return;
      		}
		if (target.length > 500) {
                	return this.sendReply("This quote is too long; it cannot exceed 500 characters.");
        	}
        	if (!this.can('declare', null, room)) return;
		room.quote = target;
		room.addRaw(
			'<div class=\"broadcast-green\"><b>The "Inspirational Quote of the Day" has been updated by ' + Tools.escapeHTML(user.name) + '.</b><br />' +
			'Quote: ' +  Tools.escapeHTML(target) + '</div>'
		);
		room.quoteOn = true;
		this.logModCommand(Tools.escapeHTML(user.name) + " has updated the quote of the day to: " + Tools.escapeHTML(target) + "");
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
		return this.sendReplyBox('<center><font size="3"><b>Coin Game!</b></font><br>'+results+'');
	},
	
	color: function(target, room, user) {
		if (!this.canBroadcast()) return;
		if (target === 'list' || target === 'help' || target === 'options') {
		return this.sendReplyBox('The random colors are: <b><font color="red">Red</font>, <font color="blue">Blue</font>, <font color="orange">Orange</font>, <font color="green">Green</font>, <font color="teal">Teal</font>, <font color="brown">Brown</font>, <font color="black">Black</font>, <font color="purple">Purple</font>, <font color="pink">Pink</font>, <font color="gray">Gray</font>, <font color="tan">Tan</font>, <font color="gold">Gold</font>, <font color=#CC0000>R</font><font color=#AE1D00>a</font><font color=#913A00>i</font><font color=#745700>n</font><font color=#577400>b</font><font color=#3A9100>o</font><font color=#1DAE00>w</font>.');
		}
		if (target == '') {
		var random = Math.floor(13 * Math.random()) + 1;
		var results = '';
		if (random == 1) {
		results = '<font color="red">Red</font>';
		}
		if (random == 2) {
		results = '<font color="blue">Blue</font>';
		}
		if (random == 3) {
		results = '<font color="orange">Orange</font>';
		}
		if (random == 4) {
		results = '<font color="green">Green</font>';
		}
		if (random == 5) {
		results = '<font color="teal">Teal</font>';
		}
		if (random == 6) {
		results = '<font color="brown">Brown</font>';
		}	
		if (random == 7) {
		results = '<font color="black">Black</font>';
		}
		if (random == 8) {
		results = '<font color="purple">Purple</font>';
		}	
		if (random == 9) {
		results = '<font color="pink">Pink</font>';
		}
		if (random == 10) {
		results = '<font color="gray">Gray</font>';
		}	
		if (random == 11) {
		results = '<font color="tan">Tan</font>';
		}	
		if (random == 12) {
		results = '<font color="gold">Gold</font>';
		}
		if (random == 13) {
		results = '<font color=#CC0000>R</font><font color=#AE1D00>a</font><font color=#913A00>i</font><font color=#745700>n</font><font color=#577400>b</font><font color=#3A9100>o</font><font color=#1DAE00>w</font>';
		}						
		return this.sendReplyBox('The random color is:<b> '+results+'</b>');
		}
	},
	
	guesscolor: function(target, room, user){
        if (!target) return this.sendReply('/guesscolor [color] - Guesses a random color.');
        var html = ['<img ','<a href','<font ','<marquee','<blink','<center'];
        for (var x in html) {
        	if (target.indexOf(html[x]) > -1) return this.sendReply('HTML is not supported in this command.');
        }
        if (target.length > 15) return this.sendReply('This new room suggestion is too long; it cannot exceed 15 characters.');
        if (!this.canTalk()) return;
        Rooms.rooms.room.add('|html|<font size="4"><b>New color guessed!</b></font><br><b>Guessed by:</b> '+user.userid+'<br><b>Color:</b> '+target+'');
        this.sendReply('Thanks, your new color guess has been sent.  We\'ll review your color soon and get back to you. ("'+target+'")');
	},

	pick: 'pickrandom',
	pickrandom: function (target, room, user) {
		var options = target.split(',');
		if (options.length < 2) return this.parse('/help pick');
		if (!this.canBroadcast()) return false;
		return this.sendReplyBox('<em>We randomly picked:</em> ' + Tools.escapeHTML(options.sample().trim()));
	},

	register: function () {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('You will be prompted to register upon winning a rated battle. Alternatively, there is a register button in the <button name="openOptions"><i class="icon-cog"></i> Options</button> menu in the upper right.');
	},

	lobbychat: function (target, room, user, connection) {
		if (!Rooms.lobby) return this.popupReply("This server doesn't have a lobby.");
		target = toId(target);
		if (target === 'off') {
			user.leaveRoom(Rooms.lobby, connection.socket);
			connection.send('|users|');
			this.sendReply("You are now blocking lobby chat.");
		} else {
			user.joinRoom(Rooms.lobby, connection);
			this.sendReply("You are now receiving lobby chat.");
		}
	},

	showimage: function (target, room, user) {
		if (!target) return this.parse('/help showimage');
		if (!this.can('declare', null, room)) return false;
		if (!this.canBroadcast()) return;

		targets = target.split(',');
		if (targets.length != 3) {
			return this.parse('/help showimage');
		}

		this.sendReply('|raw|<img src="' + Tools.escapeHTML(targets[0]) + '" alt="" width="' + toId(targets[1]) + '" height="' + toId(targets[2]) + '" />');
	},

	htmlbox: function (target, room, user) {
		if (!target) return this.parse('/help htmlbox');
		if (!user.can('gdeclare', null, room) && (!user.can('declare', null, room) || !user.can('announce'))) {
			return this.sendReply("/htmlbox - Access denied.");
		}
		if (!this.canBroadcast('!htmlbox')) return;

		this.sendReplyBox(target);
	},

	a: function (target, room, user) {
		if (!this.can('rawpacket')) return false;
		// secret sysop command
		room.add(target);
	},
	
	tnoff: function (target, room, user) {
		this.parse('/ignore Tournament Notification')
	}
	
	tnon: function (target, room, user) {
		this.parse('/unignore Tournament Notification')
	}

	/*********************************************************
	 * Help commands
	 *********************************************************/

	commands: 'help',
	h: 'help',
	'?': 'help',
	help: function (target, room, user) {
		target = target.toLowerCase();
		var matched = false;
		if (target === 'all' || target === 'msg' || target === 'pm' || target === 'whisper' || target === 'w') {
			matched = true;
			this.sendReply("/msg OR /whisper OR /w [username], [message] - Send a private message.");
		}
		if (target === 'all' || target === 'r' || target === 'reply') {
			matched = true;
			this.sendReply("/reply OR /r [message] - Send a private message to the last person you received a message from, or sent a message to.");
		}
		if (target === 'all' || target === 'rating' || target === 'ranking' || target === 'rank' || target === 'ladder') {
			matched = true;
			this.sendReply("/rating - Get your own rating.");
			this.sendReply("/rating [username] - Get user's rating.");
		}
		if (target === 'all' || target === 'nick') {
			matched = true;
			this.sendReply("/nick [new username] - Change your username.");
		}
		if (target === 'all' || target === 'avatar') {
			matched = true;
			this.sendReply("/avatar [new avatar number] - Change your trainer sprite.");
		}
		if (target === 'all' || target === 'unlink') {
			matched = true;
			this.sendReply('/unlink [user] - Makes all prior links posted by this user unclickable. Requires: %, @, &, ~');
		}
		if (target === 'all' || target === 'rooms') {
			matched = true;
			this.sendReply("/whois - Get details on yourself: alts, group, IP address, and rooms.");
			this.sendReply("/whois [username] - Get details on a username: alts (Requires: % @ & ~), group, IP address (Requires: @ & ~), and rooms.");
		}
		if (target === 'all' || target === 'data') {
			matched = true;
			this.sendReply("/data [pokemon/item/move/ability] - Get details on this pokemon/item/move/ability.");
			this.sendReply("!data [pokemon/item/move/ability] - Show everyone these details. Requires: + % @ & ~");
		}
		if (target === 'all' || target === 'analysis') {
			matched = true;
			this.sendReply("/analysis [pokemon], [generation] - Links to the Smogon University analysis for this Pokemon in the given generation.");
			this.sendReply("!analysis [pokemon], [generation] - Shows everyone this link. Requires: + % @ & ~");
		}
		if (target === 'all' || target === 'groups') {
			matched = true;
			this.sendReply("/groups - Explains what the + % @ & next to people's names mean.");
			this.sendReply("!groups - Show everyone that information. Requires: + % @ & ~");
		}
		if (target === 'all' || target === 'opensource') {
			matched = true;
			this.sendReply("/opensource - Links to PS's source code repository.");
			this.sendReply("!opensource - Show everyone that information. Requires: + % @ & ~");
		}
		if (target === 'all' || target === 'avatars') {
			matched = true;
			this.sendReply("/avatars - Explains how to change avatars.");
			this.sendReply("!avatars - Show everyone that information. Requires: + % @ & ~");
		}
		if (target === 'all' || target === 'intro') {
			matched = true;
			this.sendReply("/intro - Provides an introduction to competitive pokemon.");
			this.sendReply("!intro - Show everyone that information. Requires: + % @ & ~");
		}
		if (target === 'all' || target === 'cap') {
			matched = true;
			this.sendReply("/cap - Provides an introduction to the Create-A-Pokemon project.");
			this.sendReply("!cap - Show everyone that information. Requires: + % @ & ~");
		}
		if (target === 'all' || target === 'om') {
			matched = true;
			this.sendReply("/om - Provides links to information on the Other Metagames.");
			this.sendReply("!om - Show everyone that information. Requires: + % @ & ~");
		}
		if (target === 'all' || target === 'learn' || target === 'learnset' || target === 'learnall') {
			matched = true;
			this.sendReply("/learn [pokemon], [move, move, ...] - Displays how a Pokemon can learn the given moves, if it can at all.");
			this.sendReply("!learn [pokemon], [move, move, ...] - Show everyone that information. Requires: + % @ & ~");
		}
		if (target === 'all' || target === 'calc' || target === 'calculator') {
			matched = true;
			this.sendReply("/calc - Provides a link to a damage calculator");
			this.sendReply("!calc - Shows everyone a link to a damage calculator. Requires: + % @ & ~");
		}
		if (target === 'all' || target === 'blockchallenges' || target === 'away' || target === 'idle') {
			matched = true;
			this.sendReply("/away - Blocks challenges so no one can challenge you. Deactivate it with /back.");
		}
		if (target === 'all' || target === 'allowchallenges' || target === 'back') {
			matched = true;
			this.sendReply("/back - Unlocks challenges so you can be challenged again. Deactivate it with /away.");
		}
		if (target === 'all' || target === 'faq') {
			matched = true;
			this.sendReply("/faq [theme] - Provides a link to the FAQ. Add deviation, doubles, randomcap, restart, or staff for a link to these questions. Add all for all of them.");
			this.sendReply("!faq [theme] - Shows everyone a link to the FAQ. Add deviation, doubles, randomcap, restart, or staff for a link to these questions. Add all for all of them. Requires: + % @ & ~");
		}
		if (target === 'all' || target === 'highlight') {
			matched = true;
			this.sendReply("Set up highlights:");
			this.sendReply("/highlight add, word - add a new word to the highlight list.");
			this.sendReply("/highlight list - list all words that currently highlight you.");
			this.sendReply("/highlight delete, word - delete a word from the highlight list.");
			this.sendReply("/highlight delete - clear the highlight list");
		}
		if (target === 'all' || target === 'timestamps') {
			matched = true;
			this.sendReply("Set your timestamps preference:");
			this.sendReply("/timestamps [all|lobby|pms], [minutes|seconds|off]");
			this.sendReply("all - change all timestamps preferences, lobby - change only lobby chat preferences, pms - change only PM preferences");
			this.sendReply("off - set timestamps off, minutes - show timestamps of the form [hh:mm], seconds - show timestamps of the form [hh:mm:ss]");
		}
		if (target === 'all' || target === 'effectiveness' || target === 'matchup' || target === 'eff' || target === 'type') {
			matched = true;
			this.sendReply("/effectiveness OR /matchup OR /eff OR /type [attack], [defender] - Provides the effectiveness of a move or type on another type or a Pokémon.");
			this.sendReply("!effectiveness OR /matchup OR !eff OR !type [attack], [defender] - Shows everyone the effectiveness of a move or type on another type or a Pokémon.");
		}
		if (target === 'all' || target === 'pollson') {
			matched = true;
			this.sendReply('/pollson [none/room/all] - enables polls in the specified rooms. Requires @ & ~');
			this.sendReply('/pollson - enables polls in the current room.');
			this.sendReply('/pollson [room] - enables polls in the specified room.');
			this.sendReply('/pollson all - enables polls in all rooms. Requires & ~');
		}
		if (target === 'all' || target === 'pollsoff') {
			matched = true;
			this.sendReply('/pollsoff [none/room/all] - disables polls in the specified rooms. Requires @ & ~');
			this.sendReply('/pollsoff - disables polls in the current room.');
			this.sendReply('/pollsoff [room] - disables polls in the specified room.');
			this.sendReply('/pollsoff all - disables polls in all rooms. Requires & ~');
		}
		if (target === 'all' || target === 'dexsearch' || target === 'dsearch') {
			matched = true;
			this.sendReply("/dexsearch [type], [move], [move], ... - Searches for Pokemon that fulfill the selected criteria.");
			this.sendReply("Search categories are: type, tier, color, moves, ability, gen.");
			this.sendReply("Valid colors are: green, red, blue, white, brown, yellow, purple, pink, gray and black.");
			this.sendReply("Valid tiers are: Uber/OU/BL/UU/BL2/RU/BL3/NU/LC/CAP.");
			this.sendReply("Types must be followed by ' type', e.g., 'dragon type'.");
			this.sendReply("Parameters can be excluded through the use of '!', e.g., '!water type' excludes all water types.");
			this.sendReply("The parameter 'mega' can be added to search for Mega Evolutions only, and the parameters 'FE' or 'NFE' can be added to search fully or not-fully evolved Pokemon only.");
			this.sendReply("The order of the parameters does not matter.");
		}
		if (target === 'all' || target === 'dice' || target === 'roll') {
			matched = true;
			this.sendReply("/dice [optional max number] - Randomly picks a number between 1 and 6, or between 1 and the number you choose.");
			this.sendReply("/dice [number of dice]d[number of sides] - Simulates rolling a number of dice, e.g., /dice 2d4 simulates rolling two 4-sided dice.");
		}
		if (target === 'all' || target === 'pick' || target === 'pickrandom') {
			matched = true;
			this.sendReply("/pick [option], [option], ... - Randomly selects an item from a list containing 2 or more elements.");
		}
		if (target === 'all' || target === 'join') {
			matched = true;
			this.sendReply("/join [roomname] - Attempts to join the room [roomname].");
		}
		if (target === 'all' || target === 'ignore') {
			matched = true;
			this.sendReply("/ignore [user] - Ignores all messages from the user [user].");
			this.sendReply("Note that staff messages cannot be ignored.");
		}
		if (target === 'all' || target === 'invite') {
			matched = true;
			this.sendReply("/invite [username], [roomname] - Invites the player [username] to join the room [roomname].");
		}
		if (target === '%' || target === 'lock' || target === 'l') {
			matched = true;
			this.sendReply("/lock OR /l [username], [reason] - Locks the user from talking in all chats. Requires: % @ & ~");
		}
		if (target === '%' || target === 'unlock') {
			matched = true;
			this.sendReply("/unlock [username] - Unlocks the user. Requires: % @ & ~");
		}
		if (target === '%' || target === 'redirect' || target === 'redir') {
			matched = true;
			this.sendReply("/redirect OR /redir [username], [roomname] - Attempts to redirect the user [username] to the room [roomname]. Requires: % @ & ~");
		}
		if (target === '%' || target === 'modnote') {
			matched = true;
			this.sendReply("/modnote [note] - Adds a moderator note that can be read through modlog. Requires: % @ & ~");
		}
		if (target === '%' || target === 'forcerename' || target === 'fr') {
			matched = true;
			this.sendReply("/forcerename OR /fr [username], [reason] - Forcibly change a user's name and shows them the [reason]. Requires: % @ & ~");
		}
		if (target === '@' || target === 'roomban' || target === 'rb') {
			matched = true;
			this.sendReply("/roomban [username] - Bans the user from the room you are in. Requires: @ & ~");
		}
		if (target === '@' || target === 'roomunban') {
			matched = true;
			this.sendReply("/roomunban [username] - Unbans the user from the room you are in. Requires: @ & ~");
		}
		if (target === '@' || target === 'ban' || target === 'b') {
			matched = true;
			this.sendReply("/ban OR /b [username], [reason] - Kick user from all rooms and ban user's IP address with reason. Requires: @ & ~");
		}
		if (target === '@' || target === '#' || target === 'roompromote') {
			matched = true;
			this.sendReply("/roompromote [username], [group] - Promotes the user to the specified group or next ranked group. Requires: @ # & ~");
		}
		if (target === '@' || target === '#' || target === 'roomdemote') {
			matched = true;
			this.sendReply("/roomdemote [username], [group] - Demotes the user to the specified group or previous ranked group. Requires: @ # & ~");
		}
		if (target === '&' || target === 'banip') {
			matched = true;
			this.sendReply("/banip [ip] - Kick users on this IP or IP range from all rooms and bans it. Accepts wildcards to ban ranges. Requires: & ~");
		}
		if (target === '&' || target === 'unbanip') {
			matched = true;
			this.sendReply("/unbanip [ip] - Kick users on this IP or IP range from all rooms and bans it. Accepts wildcards to ban ranges. Requires: & ~");
		}
		if (target === '@' || target === 'unban') {
			matched = true;
			this.sendReply("/unban [username] - Unban a user. Requires: @ & ~");
		}
		if (target === '&' || target === 'unbanall') {
			matched = true;
			this.sendReply("/unbanall - Unban all IP addresses. Requires: & ~");
		}
		if (target === '%' || target === 'modlog') {
			matched = true;
			this.sendReply("/modlog [roomid|all], [n] - Roomid defaults to current room. If n is a number or omitted, display the last n lines of the moderator log. Defaults to 15. If n is not a number, search the moderator log for 'n' on room's log [roomid]. If you set [all] as [roomid], searches for 'n' on all rooms's logs. Requires: % @ & ~");
		}
		if (target === "%" || target === 'kickbattle ') {
			matched = true;
			this.sendReply("/kickbattle [username], [reason] - Kicks an user from a battle with reason. Requires: % @ & ~");
		}
		if (target === "%" || target === 'warn' || target === 'k') {
			matched = true;
			this.sendReply("/warn OR /k [username], [reason] - Warns a user showing them the Pokemon Showdown Rules and [reason] in an overlay. Requires: % @ & ~");
		}
		if (target === '%' || target === 'mute' || target === 'm') {
			matched = true;
			this.sendReply("/mute OR /m [username], [reason] - Mutes a user with reason for 7 minutes. Requires: % @ & ~");
		}
		if (target === '%' || target === 'hourmute' || target === 'hm') {
			matched = true;
			this.sendReply("/hourmute OR /hm [username], [reason] - Mutes a user with reason for an hour. Requires: % @ & ~");
		}
		if (target === '%' || target === 'unmute' || target === 'um') {
			matched = true;
			this.sendReply("/unmute [username] - Removes mute from user. Requires: % @ & ~");
		}
		if (target === '&' || target === 'promote') {
			matched = true;
			this.sendReply("/promote [username], [group] - Promotes the user to the specified group or next ranked group. Requires: & ~");
		}
		if (target === '&' || target === 'demote') {
			matched = true;
			this.sendReply("/demote [username], [group] - Demotes the user to the specified group or previous ranked group. Requires: & ~");
		}
		if (target === '&' || target === 'forcetie') {
			matched = true;
			this.sendReply("/forcetie - Forces the current match to tie. Requires: & ~");
		}
		if (target === '&' || target === 'showimage') {
			matched = true;
			this.sendReply("/showimage [url], [width], [height] - Show an image. Requires: & ~");
		}
		if (target === '&' || target === 'declare') {
			matched = true;
			this.sendReply("/declare [message] - Anonymously announces a message. Requires: & ~");
		}
		if (target === '~' || target === 'chatdeclare' || target === 'cdeclare') {
			matched = true;
			this.sendReply("/cdeclare [message] - Anonymously announces a message to all chatrooms on the server. Requires: ~");
		}
		if (target === '~' || target === 'globaldeclare' || target === 'gdeclare') {
			matched = true;
			this.sendReply("/globaldeclare [message] - Anonymously announces a message to every room on the server. Requires: ~");
		}
		if (target === '~' || target === 'htmlbox') {
			matched = true;
			this.sendReply("/htmlbox [message] - Displays a message, parsing HTML code contained. Requires: ~ # with global authority");
		}
		if (target === '%' || target === 'announce' || target === 'wall') {
			matched = true;
			this.sendReply("/announce OR /wall [message] - Makes an announcement. Requires: % @ & ~");
		}
		if (target === '@' || target === 'modchat') {
			matched = true;
			this.sendReply("/modchat [off/autoconfirmed/+/%/@/&/~] - Set the level of moderated chat. Requires: @ for off/autoconfirmed/+ options, & ~ for all the options");
		}
		if (target === '~' || target === 'hotpatch') {
			matched = true;
			this.sendReply("Hot-patching the game engine allows you to update parts of Showdown without interrupting currently-running battles. Requires: ~");
			this.sendReply("Hot-patching has greater memory requirements than restarting.");
			this.sendReply("/hotpatch chat - reload chat-commands.js");
			this.sendReply("/hotpatch battles - spawn new simulator processes");
			this.sendReply("/hotpatch formats - reload the tools.js tree, rebuild and rebroad the formats list, and also spawn new simulator processes");
		}
		if (target === '~' || target === 'lockdown') {
			matched = true;
			this.sendReply("/lockdown - locks down the server, which prevents new battles from starting so that the server can eventually be restarted. Requires: ~");
		}
		if (target === '~' || target === 'kill') {
			matched = true;
			this.sendReply("/kill - kills the server. Can't be done unless the server is in lockdown state. Requires: ~");
		}
		if (target === 'all' || target === 'kick' || target === '%') {
			matched = true;
			this.sendReply('/kick [user], [reason] - kicks the user from the current room. Requires %, @, &, or ~.');
			this.sendReply('Requires & or ~ if used in a battle room.');
		}
		if (target === 'all' || target === 'dexsearch') {
			matched = true;
			this.sendReply('/dexsearch [type], [move], [move], ... - Searches for Pokemon that fulfill the selected criteria.');
			this.sendReply('Search categories are: type, tier, color, moves, ability, gen.');
			this.sendReply('Valid colors are: green, red, blue, white, brown, yellow, purple, pink, gray and black.');
			this.sendReply('Valid tiers are: Uber/OU/BL/UU/BL2/RU/NU/NFE/LC/CAP/Illegal.');
			this.sendReply('Types must be followed by " type", e.g., "dragon type".');
			this.sendReply('The order of the parameters does not matter.');
		}
		if (target === 'all' || target === 'reminder' || target === 'reminders') {
			matched = true;
			this.sendReply('Set up and view reminders:');
			this.sendReply('/reminder view - Show the reminders for the current room.');
			this.sendReply('/reminder add, [message] - Adds a reminder to the current room. Most HTML is supported. Requires: # & ~');
			this.sendReply('/reminder delete, [number/message] - Deletes a reminder from the current room. The number of the reminder or its message both work. Requires: # & ~');
			this.sendReply('/reminder clear - Clears all reminders from the current room. Requires: # & ~');
		}
		if (target === 'all' || target === 'tell') {
			matched = true;
			this.sendReply('/tell [user], [message] - Leaves a message for the specified user that will be received when they next talk.');
		}
		if (target === 'all' || target === 'help' || target === 'h' || target === '?' || target === 'commands') {
			matched = true;
			this.sendReply("/help OR /h OR /? - Gives you help.");
		}
		if (!target) {
			this.sendReply("COMMANDS: /nick, /avatar, /rating, /whois, /msg, /reply, /ignore, /away, /back, /timestamps, /highlight");
			this.sendReply("INFORMATIONAL COMMANDS: /data, /dexsearch, /groups, /opensource, /avatars, /faq, /rules, /intro, /tiers, /othermetas, /learn, /analysis, /calc (replace / with ! to broadcast. (Requires: + % @ & ~))");
			this.sendReply("For details on all room commands, use /roomhelp");
			this.sendReply("For details on all commands, use /help all");
			if (user.group !== Config.groupsranking[0]) {
				this.sendReply("DRIVER COMMANDS: /warn, /mute, /unmute, /alts, /forcerename, /modlog, /lock, /unlock, /announce, /redirect");
				this.sendReply("MODERATOR COMMANDS: /ban, /unban, /ip");
				this.sendReply("LEADER COMMANDS: /declare, /forcetie, /forcewin, /promote, /demote, /banip, /unbanall");
				this.sendReply("For details on all moderator commands, use /help @");
			}
			this.sendReply("For details of a specific command, use something like: /help data");
		} else if (!matched) {
			this.sendReply("The command '" + target + "' was not found. Try /help for general help");
		}
	},

};
