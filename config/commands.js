/**
 * Commands
 * Pokemon Showdown - https://pokemonshowdown.com/
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
 *
 *   allowchallenges: function (target, room, user) {
 *     user.blockChallenges = false;
 *     this.sendReply("You are available for challenges from now on.");
 *   }
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
 *   and return false if not. Otherwise, it will add the message to
 *   the room, and turn on the flag this.broadcasting, so that
 *   this.sendReply and this.sendReplyBox will broadcast to the room
 *   instead of just the user that used the command.
 *
 *   Should usually be near the top of the command, like:
 *     if (!this.canBroadcast()) return false;
 *
 * this.canBroadcast(suppressMessage)
 *   Functionally the same as this.canBroadcast(). However, it
 *   will look as if the user had written the text suppressMessage.
 *
 * this.canTalk()
 *   Checks to see if the user can speak in the room. Returns false
 *   if the user can't speak (is muted, the room has modchat on, etc),
 *   or true otherwise.
 *
 *   Should usually be near the top of the command, like:
 *     if (!this.canTalk()) return false;
 *
 * this.canTalk(message, room)
 *   Checks to see if the user can say the message in the room.
 *   If a room is not specified, it will default to the current one.
 *   If it has a falsy value, the check won't be attached to any room.
 *   In addition to running the checks from this.canTalk(), it also
 *   checks to see if the message has any banned words, is too long,
 *   or was just sent by the user. Returns the filtered message, or a
 *   falsy value if the user can't speak.
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
 * this.targetUserOrSelf(target, exactName)
 *   If target is blank, returns the user that sent the message.
 *   Otherwise, returns the user with the username in target, or
 *   a falsy value if no user with that username exists.
 *   By default, this will track users across name changes. However,
 *   if exactName is true, it will enforce exact matches.
 *
 * this.getLastIdOf(user)
 *   Returns the last userid of an specified user.
 *
 * this.splitTarget(target, exactName)
 *   Splits a target in the form "user, message" into its
 *   constituent parts. Returns message, and sets this.targetUser to
 *   the user, and this.targetUsername to the username.
 *   By default, this will track users across name changes. However,
 *   if exactName is true, it will enforce exact matches.
 *
 *   Remember to check if this.targetUser exists before going further.
 *
 * Unless otherwise specified, these functions will return undefined,
 * so you can return this.sendReply or something to send a reply and
 * stop the command there.
 *
 * @license MIT license
 */
var fs = require('fs');
var badges = fs.createWriteStream('badges.txt',{'flags':'a'});
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

		this.sendReply("|raw|User: " + targetUser.name + (!targetUser.connected ? ' <font color="gray"><em>(offline)</em></font>' : ''));
		if (user.can('alts', targetUser)) {
			var alts = targetUser.getAlts(true);
			var output = Object.keys(targetUser.prevNames).join(", ");
			if (output) this.sendReply("Previous names: " + output);

			for (var j = 0; j < alts.length; ++j) {
				var targetAlt = Users.get(alts[j]);
				if (!targetAlt.named && !targetAlt.connected) continue;
				if (targetAlt.group === '~' && user.group !== '~') continue;

				this.sendReply("|raw|Alt: " + targetAlt.name + (!targetAlt.connected ? ' <font color="gray"><em>(offline)</em></font>' : ''));
				output = Object.keys(targetAlt.prevNames).join(", ");
				if (output) this.sendReply("Previous names: " + output);
			}
			if (targetUser.locked) {
				this.sendReply("Locked under the username: " + targetUser.locked);
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
		if (user.can('ip', targetUser) || user === targetUser) {
			var ips = Object.keys(targetUser.ips);
			this.sendReply("IP" + ((ips.length > 1) ? "s" : "") + ": " + ips.join(", ") +
					(user.group !== ' ' && targetUser.latestHost ? "\nHost: " + targetUser.latestHost : ""));
		}
		if (targetUser.canCustomSymbol || targetUser.canCustomAvatar || targetUser.canAnimatedAvatar || targetUser.canChatRoom || targetUser.canTrainerCard || targetUser.canFixItem || targetUser.canDecAdvertise || targetUser.canBadge || targetUser.canPOTD || targetUser.canForcerename || targetUser.canMusicBox || targetUser.canCustomEmote) {
			var i = '';
			if (targetUser.canCustomSymbol) i += ' Custom Symbol';
			if (targetUser.canCustomAvatar) i += ' Custom Avatar';
			if (targetUser.canCustomEmote) i += ' Custom Emote'
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
			var targetRoom = Rooms.get(i);
			if (i === 'global' || targetRoom.isPrivate) continue;
			if (!first) output += " | ";
			first = false;

			output += (targetRoom.auth && targetRoom.auth[targetUser.userid] ? targetRoom.auth[targetUser.userid] : '') + '<a href="/' + i + '" room="' + i + '">' + i + '</a>';
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
			var curUser = Users.users[userid];
			if (curUser.latestIp === target) {
				this.sendReply((curUser.connected ? " + " : "-") + " " + curUser.name);
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
		var targetRoom = (target ? Rooms.search(target) : room);
		if (!targetRoom) {
			return this.sendReply("Room " + target + " not found.");
		}
		return this.parse('/msg ' + this.targetUsername + ', /invite ' + targetRoom.id);
	},

	/*********************************************************
	 * Informational commands
	 *********************************************************/

	pstats: 'data',
	stats: 'data',
	dex: 'data',
	pokedex: 'data',
	details: 'data',
	dt: 'data',
	data: function (target, room, user, connection, cmd) {
		if (!this.canBroadcast()) return;

		var buffer = '';
		var targetId = toId(target);
		if (targetId === '' + parseInt(targetId)) {
			for (var p in Tools.data.Pokedex) {
				var pokemon = Tools.getTemplate(p);
				if (pokemon.num === parseInt(target)) {
					target = pokemon.species;
					targetId = pokemon.id;
					break;
				}
			}
		}
		var newTargets = Tools.dataSearch(target);
		var showDetails = (cmd === 'dt' || cmd === 'details');
		if (newTargets && newTargets.length) {
			for (var i = 0; i < newTargets.length; ++i) {
				if (newTargets[i].id !== targetId && !Tools.data.Aliases[targetId] && !i) {
					buffer = "No Pokemon, item, move, ability or nature named '" + target + "' was found. Showing the data of '" + newTargets[0].name + "' instead.\n";
				}
				if (newTargets[i].searchType === 'nature') {
					buffer += "" + newTargets[i].name + " nature: ";
					if (newTargets[i].plus) {
						var statNames = {'atk': "Attack", 'def': "Defense", 'spa': "Special Attack", 'spd': "Special Defense", 'spe': "Speed"};
						buffer += "+10% " + statNames[newTargets[i].plus] + ", -10% " + statNames[newTargets[i].minus] + ".";
					} else {
						buffer += "No effect.";
					}
					return this.sendReply(buffer);
				} else {
					buffer += '|c|~|/data-' + newTargets[i].searchType + ' ' + newTargets[i].name + '\n';
				}
			}
		} else {
			return this.sendReply("No Pokemon, item, move, ability or nature named '" + target + "' was found. (Check your spelling?)");
		}

		if (showDetails) {
			var details;
			if (newTargets[0].searchType === 'pokemon') {
				var pokemon = Tools.getTemplate(newTargets[0].name);
				var weighthit = 20;
				if (pokemon.weightkg >= 200) {
					weighthit = 120;
				} else if (pokemon.weightkg >= 100) {
					weighthit = 100;
				} else if (pokemon.weightkg >= 50) {
					weighthit = 80;
				} else if (pokemon.weightkg >= 25) {
					weighthit = 60;
				} else if (pokemon.weightkg >= 10) {
					weighthit = 40;
				}
				details = {
					"Dex#": pokemon.num,
					"Height": pokemon.heightm + " m",
					"Weight": pokemon.weightkg + " kg <em>(" + weighthit + " BP)</em>",
					"Dex Colour": pokemon.color,
					"Egg Group(s)": pokemon.eggGroups.join(", ")
				};
				if (!pokemon.evos.length) {

					details["<font color=#585858>Does Not Evolve</font>"] = "";  // this line exists on main
				} else {
					details["Evolution"] = pokemon.evos.map(function (evo) {
						evo = Tools.getTemplate(evo);
						return evo.name + " (" + evo.evoLevel + ")";
					}).join(", ");
				}
			} else if (newTargets[0].searchType === 'move') {
				var move = Tools.getMove(newTargets[0].name);
				details = {
					"Priority": move.priority
				};

				if (move.secondary || move.secondaries) details["<font color=black>&#10003; Secondary Effect</font>"] = "";
				if (move.isContact) details["<font color=black>&#10003; Contact</font>"] = "";
				if (move.isSoundBased) details["<font color=black>&#10003; Sound</font>"] = "";
				if (move.isBullet) details["<font color=black>&#10003; Bullet</font>"] = "";
				if (move.isPulseMove) details["<font color=black>&#10003; Pulse</font>"] = "";

				details["Target"] = {
					'normal': "Adjacent Pokemon",
					'self': "Self",
					'adjacentAlly': "Single Ally",
					'allAdjacentFoes': "Adjacent Foes",
					'foeSide': "All Foes",
					'allySide': "All Allies",
					'allAdjacent': "All Adjacent Pokemon",
					'any': "Any Pokemon",
					'all': "All Pokemon"
				}[move.target] || "Unknown";
			} else if (newTargets[0].searchType === 'item') {
				var item = Tools.getItem(newTargets[0].name);
				details = {};
				if (item.fling) {
					details["Fling Base Power"] = item.fling.basePower;
					if (item.fling.status) details["Fling Effect"] = item.fling.status;
					if (item.fling.volatileStatus) details["Fling Effect"] = item.fling.volatileStatus;
					if (item.isBerry) details["Fling Effect"] = "Activates effect of berry on target.";
					if (item.id === 'whiteherb') details["Fling Effect"] = "Removes all negative stat levels on the target.";
					if (item.id === 'mentalherb') details["Fling Effect"] = "Removes the effects of infatuation, Taunt, Encore, Torment, Disable, and Cursed Body on the target.";
				}
				if (!item.fling) details["Fling"] = "This item cannot be used with Fling";
				if (item.naturalGift) {
					details["Natural Gift Type"] = item.naturalGift.type;
					details["Natural Gift BP"] = item.naturalGift.basePower;
				}
			} else {
				details = {};
			}

			buffer += '|raw|<font size="1">' + Object.keys(details).map(function (detail) {
				return '<font color=#585858>' + detail + (details[detail] !== '' ? ':</font> ' + details[detail] : '</font>');
			}).join("&nbsp;|&ThickSpace;") + '</font>';
		}
		this.sendReply(buffer);
	},

	ds: 'dexsearch',
	dsearch: 'dexsearch',
	dexsearch: function (target, room, user) {
		if (!this.canBroadcast()) return;

		if (!target) return this.parse('/help dexsearch');
		var targets = target.split(',');
		var searches = {};
		var allTiers = {'uber':1, 'ou':1, 'uu':1, 'lc':1, 'cap':1, 'bl':1, 'bl2':1, 'ru':1, 'bl3':1, 'nu':1, 'pu':1, 'nfe':1};
		var allColours = {'green':1, 'red':1, 'blue':1, 'white':1, 'brown':1, 'yellow':1, 'purple':1, 'pink':1, 'gray':1, 'black':1};
		var showAll = false;
		var megaSearch = null;
		var recoverySearch = null;
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

			if (target === 'recovery') {
				if ((recoverySearch && isNotSearch) || (recoverySearch === false && !isNotSearch)) return this.sendReplyBox('A search cannot both exclude and recovery moves.');
				if (!searches['recovery']) searches['recovery'] = {};
				recoverySearch = !isNotSearch;
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

		if (showAll && Object.size(searches) === 0 && megaSearch === null) return this.sendReplyBox("No search parameters other than 'all' were found. Try '/help dexsearch' for more information on this command.");

		var dex = {};
		for (var pokemon in Tools.data.Pokedex) {
			var template = Tools.getTemplate(pokemon);
			var megaSearchResult = (megaSearch === null || (megaSearch === true && template.isMega) || (megaSearch === false && !template.isMega));
			if (template.tier !== 'Unreleased' && template.tier !== 'Illegal' && (template.tier !== 'CAP' || (searches['tier'] && searches['tier']['cap'])) &&
				megaSearchResult) {
				dex[pokemon] = template;
			}
		}

		for (var search in {'moves':1, 'recovery':1, 'types':1, 'ability':1, 'tier':1, 'gen':1, 'color':1}) {
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
						} else if (Object.count(searches[search], true) > 0 && !searches[search][String(dex[mon][search]).toLowerCase()]) delete dex[mon];
					}
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

				case 'recovery':
					for (var mon in dex) {
						var template = Tools.getTemplate(dex[mon].id);
						if (!template.learnset) template = Tools.getTemplate(template.baseSpecies);
						if (!template.learnset) continue;
						var recoveryMoves = ["recover", "roost", "moonlight", "morningsun", "synthesis", "milkdrink", "slackoff", "softboiled", "wish", "healorder"];
						var canLearn = false;
						for (var i = 0; i < recoveryMoves.length; i++) {
							var prevoTemp = Tools.getTemplate(template.id);
							while (prevoTemp.prevo && prevoTemp.learnset && !(prevoTemp.learnset[recoveryMoves[i]])) {
								prevoTemp = Tools.getTemplate(prevoTemp.prevo);
							}
							canLearn = (prevoTemp.learnset.sketch) || prevoTemp.learnset[recoveryMoves[i]];
							if (canLearn) break;
						}
						if ((!canLearn && searches[search]) || (searches[search] === false && canLearn)) delete dex[mon];
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
				results.randomize();
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
				var prevSourceCount = 0;
				for (var i = 0, len = sources.length; i < len; ++i) {
					var source = sources[i];
					if (source.substr(0, 2) === prevSourceType) {
						if (prevSourceCount < 0) {
							buffer += ": " + source.substr(2);
						} else if (all || prevSourceCount < 3) {
							buffer += ", " + source.substr(2);
						} else if (prevSourceCount === 3) {
							buffer += ", ...";
						}
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
	resist: 'weakness',
	weakness: function (target, room, user) {
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
		var resistances = [];
		var immunities = [];
		Object.keys(Tools.data.TypeChart).forEach(function (type) {
			var notImmune = Tools.getImmunity(type, pokemon);
			if (notImmune) {
				var typeMod = Tools.getEffectiveness(type, pokemon);
				switch (typeMod) {
				case 1:
					weaknesses.push(type);
					break;
				case 2:
					weaknesses.push("<b>" + type + "</b>");
					break;
				case -1:
					resistances.push(type);
					break;
				case -2:
					resistances.push("<b>" + type + "</b>");
					break;
				}
			} else {
				immunities.push(type);
			}
		});

		var buffer = [];
		buffer.push(pokemon.exists ? "" + target + ' (ignoring abilities):' : '' + target + ':');
		buffer.push('<span class=\"message-effect-weak\">Weaknesses</span>: ' + (weaknesses.join(', ') || 'None'));
		buffer.push('<span class=\"message-effect-resist\">Resistances</span>: ' + (resistances.join(', ') || 'None'));
		buffer.push('<span class=\"message-effect-immune\">Immunities</span>: ' + (immunities.join(', ') || 'None'));
		this.sendReplyBox(buffer.join('<br>'));
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
			var method;
			for (method in searchMethods) {
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
			var totalTypeMod = 0;
			if (source.effectType !== 'Move' || source.basePower || source.basePowerCallback) {
				for (var i = 0; i < defender.types.length; i++) {
					var baseMod = Tools.getEffectiveness(source, defender.types[i]);
					var moveMod = source.onEffectiveness && source.onEffectiveness.call(Tools, baseMod, defender.types[i], source);
					totalTypeMod += typeof moveMod === 'number' ? moveMod : baseMod;
				}
			}
			factor = Math.pow(2, totalTypeMod);
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

	whosgotthemoneyz: 'richestuser',
	richestuser: function(target, room, user) {
		if (!this.canBroadcast()) return;
        var data = fs.readFileSync('config/money.csv','utf8');
        var row = (''+data).split("\n");
		var userids = {id:[],money:[]};
		var highest = {id:[],money:[]};
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
		for (var i=0; i<10;i++) {
			var tempHighest = 0;
			for (var x=0;x<size;x++) {
				if (userids.money[x] > tempHighest) tempHighest = userids.money[x];
			}
			for (var x=0;x<size;x++) {
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
	pus: 'pmupperstaff',
	pmupperstaff:  function (target, room, user) {
		if (!target) return this.sendReply('/pmupperstaff [message] - Sends a PM to every upper staff');
		if (!this.can('pban')) return false;
		for (var u in Users.users) {
			if (Users.users[u].group == '~' || Users.users[u].group == '&') {
				Users.users[u].send('|pm|~Upper Staff PM|'+Users.users[u].group+Users.users[u].name+'| '+target+' (PM from '+user.name+')');
			}
		}
	},
	staff: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox("<a href=\"https://www.smogon.com/sim/staff_list\">Pokemon Showdown Staff List</a>");
	},

	beno: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<center><img src="http://fc06.deviantart.net/fs29/f/2008/092/4/c/NOT_MY_MUDKIP_by_joeywaii.jpg" width="250">' +
			'<img src="http://images.fanpop.com/images/image_uploads/Mudkip-mudkip-marshtomp-and-swampert-432906_461_421.jpg" width="250" height="240""><br />' +
			'<b>Ace: </b>That sad moment when life gave you lemons but you\'re to lazy to make the lemonade.<br />' +
			'<button name="send" value="/transferbucks elitefourbeno, 5">Donate 5 bucks for a cookie</button></center>');
	},

	sand2: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<center><img src="http://i.imgur.com/0dwzNX7.gif"><br />' +
			'<img src="http://media.giphy.com/media/FvtOorPNV09Og/giphy.gif" width="270" height="200">' +
			'<img src="http://media.giphy.com/media/O7UKZP7lMuZm8/giphy.gif" width="270" height="200"><br />' +
			'I don\'t like it, the dark circles under my eyes will come back and I don\'t know how to deal with the dark circles</center>');
	},
	showtan: function (target, room, user) {
		if (room.id !== 'showderp') return this.sendReply("The command '/showtan' was unrecognized. To send a message starting with '/showtan', type '//showtan'.");
		if (!this.can('modchat', null, room)) return;
		target = this.splitTarget(target);
		if (!this.targetUser) return this.sendReply("User not found");
		if (!room.users[this.targetUser.userid]) return this.sendReply("Not a showderper");
		this.targetUser.avatar = '#showtan';
		room.add("" + user.name + " applied showtan to affected area of " + this.targetUser.name);
	},

	showtan: function (target, room, user) {
		if (room.id !== 'showderp') return this.sendReply("The command '/showtan' was unrecognized. To send a message starting with '/showtan', type '//showtan'.");
		if (!this.can('modchat', null, room)) return;
		target = this.splitTarget(target);
		if (!this.targetUser) return this.sendReply("User not found");
		if (!room.users[this.targetUser.userid]) return this.sendReply("Not a showderper");
		this.targetUser.avatar = '#showtan';
		room.add("" + user.name + " applied showtan to affected area of " + this.targetUser.name);
	},

	jlp: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<center><img src="http://i.imgur.com/cmacyYX.gif" width="300">' +
			'<img src="http://i.imgur.com/J0B59PM.gif" height="200"><br />' +
			'<img src="http://i.imgur.com/u5Wd4Uf.gif"></center>');
	},

	nollid: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<center><img src="http://i.imgur.com/0dwzNX7.gif"><br />' +
			'<img src="http://25.media.tumblr.com/f58fe4414fc7e71aa3e97b1da0d06c9b/tumblr_mf3kcgAp2k1r3ifxzo1_500.gif" width="260" height="200">' +
			'<img src="http://media.tumblr.com/50996a160cc5d34905ff35da5821d323/tumblr_inline_n5jcpzJd4p1suiunx.gif" width="260" height="200"><br />' +
			'Thumbtacks in my shoes would stick into my feet whenever I tried to walk. It would hurt. I don\'t think I could deal with that really.</center>');
	},

	tesarand: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<center><b><font size="6" color="purple">Tesarand</b></font><br />' +
			'<img src="http://www.bonappetit.com/wp-content/uploads/2013/03/james-deen-646.jpg" height="200" width="300"><br />' +
			'<b>Ace: Dragonite<br />' +
			'"It tastes like glitter.... Rad.”</b><br></center>');
	},
	
	shrew: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/0dwzNX7.gif"><br />' +
			'<img src="http://i.imgur.com/tMGx5fT.gif" width="280" height="200"><br />' +
			'<img src="http://media.giphy.com/media/BPmdagBjYS6sM/giphy.gif" width="280" height="200"><br />' +
			'I bet dead people are easier to get along with.</center>');
	},

	dildo: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/KpRmFDT.gif"><br />' +
            '<img src="http://i.imgur.com/4FwBKa4.gif" width="270">' +
            '<img src="http://i.imgur.com/JG2UXZd.gif" width="270"><br />' +
            'The doors only open one way. They open inward.</center>');
    },

	cap: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox(
			"An introduction to the Create-A-Pokemon project:<br />" +
			"- <a href=\"https://www.smogon.com/cap/\">CAP project website and description</a><br />" +
			"- <a href=\"https://www.smogon.com/forums/showthread.php?t=48782\">What Pokemon have been made?</a><br />" +
			"- <a href=\"https://www.smogon.com/forums/forums/311\">Talk about the metagame here</a><br />" +
			"- <a href=\"https://www.smogon.com/forums/threads/3512318/#post-5594694\">Sample XY CAP teams</a>"
		);
	},

	hrey: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/RSOIh2j.gif"><br />' +
			'<img src="http://i.imgur.com/EsfjH9A.gif"><br />' +
			'if we legalize pot, METH and THE MOLLYS will be legalized shortly after #420NO</center>');
	},

	shrewed: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/3scS0w5.gif"><br />' +
                '<img src="http://i.imgur.com/TS5dYjU.gif" width="270" height="160">' +
                '<img src="http://i.imgur.com/Dp5P3Bu.gif" width="270" height="160"><br />' +
                'There are stars and planets floating around me. I don\'t think I can handle astronomy right now.</center>');
	},

	fork: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<center><img src="http://i.imgur.com/HrDUGmr.png" width="75" height="100">');
	},

	dillon: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/PNy1HEf.gif"><br />' +
            '<img src="http://media.tumblr.com/tumblr_lz1xhpgIcY1qbnaro.gif" width="270">' +
            '<img src="http://img4.wikia.nocookie.net/__cb20130826213452/powerlisting/images/3/3a/Shadow_Dragon%27s_Roar.gif" width="270"><br />' +
            'The loneliest people are the kindest. The saddest people smile the brightest. The most damaged people are the wisest. All because they don\'t wish to see anyone else suffer the way they did.</center>');
	},

	supersonic: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://img3.wikia.nocookie.net/__cb20120528125001/sonic/images/f/fc/Hyper_sonic.gif"><br />' +
            'Gotta go fast much?</center>');
	},

	terlor: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/EEcZ4J2.png" width="350"><br />' +
        	'<img src="http://i.imgur.com/bjVsAsj.png"><br />' +
            '"Why problem make when you no problem have you dont want to make."</center>');
	},

	saago: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/v3wWa5Z.jpg"><br />' +
            'Everything you\'ve ever wanted is on the other side of fear.</center>');
	},

	sexykricketune: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/VPcZ1rC.png"><br />' +
            '<img src="https://fbcdn-sphotos-h-a.akamaihd.net/hphotos-ak-xpa1/v/t34.0-12/10537833_1479515712290994_1126670309_n.jpg?oh=52eb7d293765697c3c9e0a6ee235dd7d&oe=53BD3B02&__gda__=1404931411_57a9e1bbf14ec5949be27acfae62bf5f" width="500"><br />' +
            'What, were you expecting something?</center>');
	},

	shikuthezorua: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://th01.deviantart.net/fs70/150/i/2013/147/5/1/zorua_by_andreehxd-d66umkw.png"><br />' +
            'I may be cute, but I could make you fall off a cliff without anyone seeing it.</center>');
	},

	stone: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="https://i.imgur.com/DPy0OdR.gif" width="500"><br />' +
            '<img src="http://pldh.net/media/pokemon/gen6/xy-animated-shiny/376.gif"><br />' +
            '<b><font color="gold">Ace: Metagross</b></font><br />' +
            '<font color="gold">The secret to winning is to open your heart to pokemon and connect them to show how much you love your pokemon. Forcing them to attack every single time makes them lose energy & lose trust in you. So loving your pokemon and treating it well</font></center>');
	},

	dsuc: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><b><Font color="#FF0000">D</Font><Font color="#FF6000">e</Font><Font color="#FFC000">m</Font><Font color="#FFff00">o</Font><Font color="#9Fff00">n</Font><Font color="#3Fff00">i</Font><Font color="#00ff00">c</Font> ' +
        	'<Font color="#00ffC0">S</Font><Font color="#00ffff">u</Font><Font color="#00C0ff">c</Font><Font color="#0060ff">c</Font><Font color="#0000ff">u</Font><Font color="#3F00ff">b</Font><Font color="#9F00ff">u</Font><Font color="#FF00ff">s</Font></b><br />' +
            '<img src="http://fc06.deviantart.net/fs70/i/2011/139/d/1/dcp_succubus_class_by_black_cat_mew-d3gqhbi.png" width="150"><br />' +
            'Won\'t you be my pet?');
	},

	jacktr: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/X8Qshnz.gif"><br />' +
            'With my bare hands I took back my life, now I\'ll take yours');
	},

	goal: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://cdn.bulbagarden.net/upload/thumb/4/47/181Ampharos.png/250px-181Ampharos.png">' +
            '<img src="http://lucien0maverick.files.wordpress.com/2014/05/tails-prower.png" width="200"><br />' +
            'The Ultimate Team Combo</center>');
	},

	tailz: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/qO72kmo.png"><br />' +
            '<img src="http://37.media.tumblr.com/cc5c32483f12ae8866fda48d084f3861/tumblr_mww5peDTd71qkwzzdo1_400.gif"><br />' +
            '<i>Play Time Is Ogre</i>');
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
            '<font color="purple"> Romanticism is the expression of man\'s urge to rise above reason and common sense, just as rationalism is the expression of his urge to rise above theology and ion. Riot\'s suck, I love noodles.</font></center>');
	},

	hag: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://fc06.deviantart.net/fs70/f/2014/243/b/f/godzilla_vs_smaug_by_rumper1-d7xeyzt.png" width=500 height=500><br />' +
            'What my battles are like</center>');
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
        this.sendReplyBox('<center><img src="http://i.imgur.com/Tbgfl9Y.gif">' +
        	'<img src="http://i.imgur.com/5dBIhwe.png"><br />' +
            '<img src="http://i.imgur.com/6m3XOcg.png"><br />' +
            'All of us will die at some point.<br />' +
            'I just don\'t give a damn about it.</center>');
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
            '<img src="http://107.161.19.43:8000/avatars/panpawn.gif"><br />' +
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
        	'<font color="0F055C"><b><i>I came from the storm.</center>');
	},

    popcorn: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/jQwJOwk.gif"></center>');
	},

	sand: 'sandshrewed',
	sandshrewed: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/4kyR3d1.jpg" width="100%"><br />' +
        	'<img src="http://i.imgur.com/lgNPrpK.png"><br />' +
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
            '<img src="http://i.imgur.com/czMd1X5.gif" border="6" align="center">' +
            '<img src="http://50.62.73.114:8000/avatars/crowt.png" align="right"><br clear="all" /></div>' +
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
        this.sendReplyBox('<center><font size="3" color=#8E019D>Mushy</font><br />' +
			'<img src="http://www.wall321.com/thumbnails/detail/20120504/angels%20army%20diablo%20armor%20tyrael%20swords%201920x1080%20wallpaper_www.wall321.com_75.jpg" width=400 height=225><br />' +
			'"Why do people hope for things that they know are near impossible?" "Because sometimes, hope is all you have."</center>');
	},

	panic: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<center><img src="http://i.imgur.com/sGq1qy9.gif"></center>');
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

	darkhanekawa: 'jackzero',
	v: 'jackzero',
	jack: 'jackzero',
	jackzero: function(target, room, user) {
	    if (!this.canBroadcast()) return;
	    this.sendReplyBox('<center><font size="4" color="#1AACBC"><b>JackZero</b><br/></font>' +
	           '<img src="http://i.imgur.com/wUqmPZz.gif" height="250"><br/>' +
	           '<font size="2"><i>I stopped fighting my inner demons. We are on the same side now.</i></font></center>');
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
           '<b>Quote:</b> "It\'s all shits and giggles until someone giggles and shits."</font><br />' +
           '<b>Quote:</b> "Light travels faster than sound, that\'s why some people appear bright before they speak."<br />' +
           '<b>Quote:</b> "If you don\'t stand for something, you will fall for anything."</font><br />' +
           '<img src="http://107.191.104.240:8000/avatars/sciz.gif"></center></div>');
	},

	d3adm3owth: function(target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('<center><font color=#0E30AA size=3>d3adm3owth</font><br />' +
                        '<img src="http://img2.wikia.nocookie.net/__cb20140120230002/pokemon/images/1/1b/OI015.jpg"  width=320 height 240><br />' +
                        'Ace: Meowth<br />' +
                        '...in accordance with the dictates of reason.</center>');
        },


	ashbloodthief: function(target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('<center><font size="5"><font color="#140391">ashbloodthief</font></font></center> <center><img src="http://107.191.104.240:8000/avatars/ashbloodthief.gif" width=100 height=100></center> <center><img src="http://fc04.deviantart.net/fs71/f/2013/259/f/f/mega_lucario_by_henshingeneration-d6mihft.jpg" width=270 height=200></center><br /> <center><font size="3"> Ace: Mega Lucario</font></center> <center><font size="3"> I\'m a being pure as energy! You can\'t stop me!</font></center>');
	},
	
	chaotic: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox("<center><img src=\"http://i.imgur.com/NVEZJG1.png\" title=\"Hosted by imgur.com\" width=\"400\" height=\"100\"> </a><br><img src=\"http://media0.giphy.com/media/DCp4s7Z1FizZe/giphy.gif\" width=\"250\" height=\"250\"><img src=\"http://i269.photobucket.com/albums/jj77/YandereGIFs/Durarara%20GIFs/IzayaScared.gif\" width=\"250\" height=\"250\"> <br><center><b>\"A Caterpie may change into a Butterfree, but the heart that beats inside remains the same.\"</b>");
	},

    			//***********************Music Boxes***************************

    //View Music box command to reduce lobby spam
    vmb: function (target, room, user) {
	   if (!this.canBroadcast()) return;
	   this.sendReplyBox('<center>Click <button name="send" value="/'+ target + '" class="blackbutton" title="View musicbox!"><font color="white"><b>here</button></b></font> to view <b>' + target + '!</b></center>');
	},

	tailzbox: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<b>Tailz\'s Music Box!</b><br />' +
			'1. <a href="https://www.youtube.com/watch?v=zxof7Lh1u3c"><button>Nano - Savior Of Song</a></button><br />' +
			'2. <a href="https://www.youtube.com/watch?v=3ZckiELrRLU"><button>Nano - Black Board</a></button><br />' +
			'3. <a href="https://www.youtube.com/watch?v=P829PgxKxuM"><button>A Day To Remember - If It Means A Lot To You</a></button><br />' +
			'4. <a href="https://www.youtube.com/watch?v=QgFHL2R8m6s"><button>HollyWood Undead - Lion</a></button><br />' +
			'5. <a href="https://www.youtube.com/watch?v=fBocMs7EyOg"><button>Nano - Just Be Friends</a></button><br />' +
			'6. <a href="https://www.youtube.com/watch?v=Om5uXsD-aVo"><button>Rise Against - Satellite</a></button><br />' +
			'7. <a href="https://www.youtube.com/watch?v=YDJXr-Tzbqw"><button>Sora Amamiya - Skyreach</a></button><br />' +
			'8. <a href="https://www.youtube.com/watch?v=Ypl0gPtk0tA"><button>Three Days Grace - The High Road</a></button><br />' +
			'9. <a href="https://www.youtube.com/watch?v=xZ2yP7iUDeg"><button>Crown The Empire - Millenia</a></button><br /></center>' );
	},

	terbox: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<b>Sir Terlor\'s Music Box!</b><br />' +
			'1. <a href="https://www.youtube.com/watch?v=lL2ZwXj1tXM"><button>Three Days Grace - Never Too Late</a></button><br />' +
			'2. <a href="https://www.youtube.com/watch?v=JpDPOs-rddM"><button>Sonata Arctica - Mary Lou</a></button><br />' +
			'3. <a href="https://www.youtube.com/watch?v=IbOd8yf1ElI"><button>Hollywood Undead - The Diary</a></button><br />' +
			'4. <a href="https://www.youtube.com/watch?v=JCT5uTdPRgs"><button>Black Sabbath - N.I.B</a></button><br />' +
			'5. <a href="https://www.youtube.com/watch?v=as7p6VwnR5s"><button>Vexento - Praeclara</a></button><br />' +
			'6. <a href="https://www.youtube.com/watch?v=G5zdal1MKf0"><button>Volbeat - Doc Holiday</a></button><br />' +
			'7. <a href="https://www.youtube.com/watch?v=VRFCMM3bra8"><button>Billy Talent - Viking Death March</a></button></center>' );
	},

    silrbox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>Silver\'s Music Box!</b><br />' +
            '1. <a href="https://www.youtube.com/watch?v=GEEYhzaeNus"><button>Union J - Carry You</a></button><br />' +
            '2. <a href="https://www.youtube.com/watch?v=cmSbXsFE3l8"><button>Anna Kendrick - Cups</a></button><br />' +
			'3. <a href="https://www.youtube.com/watch?v=iKaSbac2roQ"><button>Vacation - Vitamin C</a></button><br />' +
			'4. <a href="https://www.youtube.com/watch?v=LiaYDPRedWQ"><button>Avril Lavigne - Hello Kitty</a></button><br />');
	},

    sandbox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>Sandshrewed\'s Music Box!</b><br />' +
            '1. <a href="https://www.youtube.com/watch?v=vN0I4b5YdOc"><button title="RAP Done It All - Iniquity Rhymes">RAP Done It All - Iniquity Rhymes</a></button><br />' +
            '2. <a href="https://www.youtube.com/watch?v=n3QmHNd0HWo"><button title="Metal Gear Rising: Revengeance ~ The Only Thing I Know For Real">Metal Gear Rising: Revengeance ~ The Only Thing I Know For Real</a></button><br />' +
			'3. <a href="https://www.youtube.com/watch?v=hV5sB5rRsGI"><button title="New Boyz - Colors">New Boyz - Colors</a></button><br />' +
			'4. <a href="https://www.youtube.com/watch?v=A1A0mIqlPiI"><button title="Young Cash feat. Shawn Jay (Field Mob) - Stress Free">Young Cash feat. Shawn Jay (Field Mob) - Stress Free</a></button><br />' +
			'5. <a href="https://www.youtube.com/watch?v=ULQgMntenO8"><button title="Metal Gear Rising, Monsoon\'s theme- Stains of Time">Metal Gear Rising, Monsoon\'s theme- Stains of Time</a></button><br />' +
			'6. <a href="https://www.youtube.com/watch?v=P4PgrY33-UA"><button title="Drop That NaeNae">Drop That NaeNae</a></button><br />' );
	},

    ampharosbox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>AmpharosTheBeast\'s Music Box!</b><br />' +
            '1. <a href="https://www.youtube.com/watch?v=RRGSHvlu9Ss"><button title="Linkin Park - Castle of Glass">Linkin Park - Castle of Glass</a></button><br />' +
            '2. <a href="https://www.youtube.com/watch?v=ie1wU9BLGn8"><button title="Rixton - Me and My Broken Heart">Rixton - Me and My Broken Heart</a></button><br />' +
			'3. <a href="https://www.youtube.com/watch?v=psuRGfAaju4"><button title="Owl City - Fireflies">Owl City - Fireflies</a></button><br />' +
			'4. <a href="https://www.youtube.com/watch?v=hT_nvWreIhg"><button title="OneRepublic - Counting Stars">OneRepublic - Counting Stars</a></button><br />' +
			'5. <a href="https://www.youtube.com/watch?v=VDvr08sCPOc"><button title="Fort Minor - Remember The Name">Fort Minor - Remember The Name</a></button><br />' +
			'6. <a href="https://www.youtube.com/watch?v=JPCv5rubXhU"><button title="Pokemon Bank A Parody of Bad Day">Pokemon Bank A Parody of Bad Day</a></button>');
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

   	solstereo: 'solbox',
	solbox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>The Sol Box</b><br />' +
            '1. <a href="https://www.youtube.com/watch?v=VIop055eJhU"><button title="Touhou 6 - EoSD - U.N. Owen was her?"> Touhou 6 - EoSD - U.N. Owen was her?</a></button><br />' +
            '2. <a href="https://www.youtube.com/watch?v=BwpLSiplyYc"><button title="Kirby 64: The Crystal Shards - Zero Two">Kirby 64: The Crystal Shards - Zero Two</a></button><br />' +
			'3. <a href="https://www.youtube.com/watch?v=EzCKrwOme2U"><button title="Muse - Butterflies and Hurricanes">Muse - Butterflies and Hurricanes</a></button><br />' +
			'4. <a href="https://www.youtube.com/watch?v=EqGs36oPpLQ"><button title="Last Dinosaurs - Zoom">Last Dinosaurs - Zoom</a></button><br />' +
			'5. <a href="https://www.youtube.com/watch?v=p9Y-r-rs9W8"><button title="Green Day - Welcome to Paradise">Green Day - Welcome to Paradise</a></button><br />' +
			'6. <a href="https://www.youtube.com/watch?v=aWxBrI0g1kE"><button title="Disturbed - Indestructible">Disturbed - Indestructible</a></button><br />' +
			'7. <a href="https://www.youtube.com/watch?v=Fi_GN1pHCVc"><button title="Avenged Sevenfold - Almost Easy">Avenged Sevenfold - Almost Easy</a></button><br />' +
			'8. <a href="https://www.youtube.com/watch?v=71CvlYX1Bqc"><button title="Linkin Park - Across The Line">Linkin Park - Across The Line</a></button><br />' +
			'9. <a href="https://www.youtube.com/watch?v=gMzSpvibN7A"><button title="30 Seconds To Mars - Hurricane (Nightcore)">30 Seconds To Mars - Hurricane (Nightcore)</a></button>');
	},

    vbox: 'jackbox',
	jackbox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>Jacks\'s Music Box!</b><br />' +
            '1. <a href="https://www.youtube.com/watch?v=m0DMfaCh4aA"><button title="Attack on Titan - DOA">Attack on Titan - DOA</a></button><br />' +
            '2. <a href="https://www.youtube.com/watch?v=c-M34ZRM120"><button title=" ADTR - You be Tails, I\'ll be Sonic"> ADTR - You be Tails, I\'ll be Sonic</a></button><br />' +
			'3. <a href="https://www.youtube.com/watch?v=0B-xRO-vPPo"><button title="Papercut massacre - Lose my life">Papercut massacre - Lose my life</a></button><br />' +
			'4. <a href="https://www.youtube.com/watch?v=Qg_TRaiWj4o"><button title="The Who - Behind blue eyes">The Who - Behind blue eyes</a></button><br />' +
			'5. <a href="https://www.youtube.com/watch?v=0m9QUoW5KnY"><button title="Starbomb - It\'s dangerous to go alone">Starbomb - It\'s dangerous to go alone</a></button><br />' +
			'6. <a href="https://www.youtube.com/watch?v=Tt10gb8yf88"><button title="12 Stones - Psycho">12 Stones - Psycho</a></button><br />');
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
				'★ <b>Leagues</b> - If you click the "join room page" to the upper right (+), it will display a list of rooms we have.  Several of these rooms are 3rd party leagues of Gold; join them to learn more about each one!<br>' +
				'★ <b>Battle</b> - By all means, invite your friends on here so that you can battle with each other!  Here on Gold, we are always up to date on our formats, so we\'re a great place to battle on!<br>' +
				'★ <b>Chat</b> - Gold is full of great people in it\'s community and we\'d love to have you be apart of it!<br>' +
				'★ <b>Learn</b> - Are you new to Pokemon?  If so, then feel FREE to ask the lobby any questions you might have!<br>' +
				'★ <b>Shop</b> - Do /shop to learn about where your Gold Bucks can go! <br>' +
				'★ <b>Plug.dj</b> - Come listen to music with us! Click <a href="http://plug.dj/gold-server/">here</a> to start!<br>' +
				'<i>--PM staff (%, @, &, ~) any questions you might have!</i>');
	},

	showtan: function (target, room, user) {
		if (room.id !== 'showderp') return this.sendReply("The command '/showtan' was unrecognized. To send a message starting with '/showtan', type '//showtan'.");
		if (!this.can('modchat', null, room)) return;
		target = this.splitTarget(target);
		if (!this.targetUser) return this.sendReply('user not found');
		if (!room.users[this.targetUser.userid]) return this.sendReply('not a showderper');
		this.targetUser.avatar = '#showtan';
		room.add(user.name+' applied showtan to affected area of '+this.targetUser.name);
	},

	introduction: 'intro',
	intro: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox(
			"New to competitive pokemon?<br />" +
			"- <a href=\"https://www.smogon.com/sim/ps_guide\">Beginner's Guide to Pokémon Showdown</a><br />" +
			"- <a href=\"https://www.smogon.com/dp/articles/intro_comp_pokemon\">An introduction to competitive Pokémon</a><br />" +
			"- <a href=\"https://www.smogon.com/bw/articles/bw_tiers\">What do 'OU', 'UU', etc mean?</a><br />" +
			"- <a href=\"https://www.smogon.com/xyhub/tiers\">What are the rules for each format? What is 'Sleep Clause'?</a>"
		);
	},

	support: 'donate',
	donate: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox(
			"<center>Like this server and want to keep it going?  If so, you can make a paypal donation to Gold!  You can choose the amount.<br />" +
			'<hr width="85%">' +
			"- Donations will help Gold to upgrade the VPS so we can do more and hold more users!<br />" +
			"- For donations <b>$5 or over</b>, you can get: 200 bucks, a custom avatar, a custom trainer card, a custom symbol, and a custom music box!<br />" +
			"- For donations <b>$10 and over</b>, it will get you: (the above), 600 bucks (in addition to the above 200, making 800 total) and VIP status along with a VIP badge!<br />" +
			"- Refer to the /shop command for a more detailed description of these prizes.  After donating, PM panpawn.<br />" +
			'<hr width="85%">' +
			"Click the button below to donate!<br />" +
			'<a href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=FBZBA7MJNMG7J&lc=US&item_name=Gold%20Server&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donate_LG%2egif%3aNonHosted"><img src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" title=Donate now!">'
			);
	},

	links: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox(
			"<div class=\"broadcast-black\">Here are some helpful server related links:<b><br />" +
			"- <a href=\"http://goldserver.weebly.com/rules.html\"><font color=\"#FF0066\">Rules</a></font><br />" +
			"- <a href=\"http://w11.zetaboards.com/Goldserverps/index/\"><font color=\"#FF00\">Forums</a></font><br />" +
			"- <a href=\"http://goldserver.weebly.com\"><font color=\"#56600FF\">Website</a></font><br />" +
			"- <a href=\"http://plug.dj/gold-server/\"><font color=\"#FFFF\">Plug.dj</a></font><br />" +
			"- <a href=\"https://github.com/panpawn/Pokemon-Showdown\"><font color=\"#39FF14\">GitHub</a></font><br />" +
			"- <a href=\"http://goldserver.weebly.com/news.html\"><font color=\"#BFFF00\">News</a></font><br />" +
			"- <a href=\"http://goldserver.weebly.com/faqs.html\"><font color=\"#DA9D01\">FAQs</a></font><br />" +
			"- <a href=\"http://goldserver.weebly.com/discipline-appeals.html\"><font color=\"#12C418\">Discipline Appeals</a></font>" +
			"</b></div>"
			);
	},

	mentoring: 'smogintro',
	smogonintro: 'smogintro',
	smogintro: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox(
			"Welcome to Smogon's official simulator! Here are some useful links to <a href=\"https://www.smogon.com/mentorship/\">Smogon\'s Mentorship Program</a> to help you get integrated into the community:<br />" +
			"- <a href=\"https://www.smogon.com/mentorship/primer\">Smogon Primer: A brief introduction to Smogon's subcommunities</a><br />" +
			"- <a href=\"https://www.smogon.com/mentorship/introductions\">Introduce yourself to Smogon!</a><br />" +
			"- <a href=\"https://www.smogon.com/mentorship/profiles\">Profiles of current Smogon Mentors</a><br />" +
			"- <a href=\"http://mibbit.com/#mentor@irc.synirc.net\">#mentor: the Smogon Mentorship IRC channel</a>"
		);
	},

	calculator: 'calc',
	calc: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox(
			"Pokemon Showdown! damage calculator. (Courtesy of Honko)<br />" +
			"- <a href=\"https://pokemonshowdown.com/damagecalc/\">Damage Calculator</a>"
		);
	},

	cap: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox(
			"An introduction to the Create-A-Pokemon project:<br />" +
			"- <a href=\"https://www.smogon.com/cap/\">CAP project website and description</a><br />" +
			"- <a href=\"https://www.smogon.com/forums/showthread.php?t=48782\">What Pokemon have been made?</a><br />" +
			"- <a href=\"https://www.smogon.com/forums/showthread.php?t=3464513\">Talk about the metagame here</a><br />" +
			"- <a href=\"https://www.smogon.com/forums/showthread.php?t=3466826\">Practice BW CAP teams</a>"
		);
	},

	gennext: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox(
			"NEXT (also called Gen-NEXT) is a mod that makes changes to the game:<br />" +
			"- <a href=\"https://github.com/Zarel/Pokemon-Showdown/blob/master/mods/gennext/README.md\">README: overview of NEXT</a><br />" +
			"Example replays:<br />" +
			"- <a href=\"https://replay.pokemonshowdown.com/gennextou-120689854\">Zergo vs Mr Weegle Snarf</a><br />" +
			"- <a href=\"https://replay.pokemonshowdown.com/gennextou-130756055\">NickMP vs Khalogie</a>"
		);
	},

	om: 'othermetas',
	othermetas: function (target, room, user) {
		if (!this.canBroadcast()) return;
		target = toId(target);
		var buffer = "";
		var matched = false;
		if (!target) {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/forums/206/\">Other Metagames Forum</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3505031/\">Other Metagames Index</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3507466/\">Sample teams for entering Other Metagames</a><br />";
		}
		if (target === 'smogondoublesuu' || target === 'doublesuu') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3516968/\">Doubles UU</a><br />";
		}
		if (target === 'smogontriples' || target === 'triples') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3511522/\">Smogon Triples</a><br />";
		}
		if (target === 'omofthemonth' || target === 'omotm' || target === 'month') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3481155/\">OM of the Month</a><br />";
		}
		if (target === 'balancedhackmons' || target === 'bh') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3489849/\">Balanced Hackmons</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3515725/\">Balanced Hackmons Suspect Discussion</a><br />";
		}
		if (target === '1v1') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3496773/\">1v1</a><br />";
		}
		if (target === 'monotype') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3493087/\">Monotype</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3517737/\">Monotype Viability Rankings</a><br />";
		}
		if (target === 'tiershift' || target === 'ts') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3508369/\">Tier Shift</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3514386/\">Tier Shift Viability Rankings</a><br />";
		}
		if (target === 'pu') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3513882/\">PU</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3517353/\">PU Viability Rankings</a><br />";
		}
		if (target === 'inversebattle' || target === 'inverse') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3518146/\">Inverse Battle</a><br />";
		}
		if (target === 'almostanyability' || target === 'aaa') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3517022/\">Almost Any Ability</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3508794/\">Almost Any Ability Viability Rankings</a><br />";
		}
		if (target === 'stabmons') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3493081/\">STABmons</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3512215/\">STABmons Viability Rankings</a><br />";
		}
		if (target === 'lcuu') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3516967/\">LC UU</a><br />";
		}
		if (target === '350cup') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3512945/\">350 Cup</a><br />";
		}
		if (target === 'averagemons') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3495527/\">Averagemons</a><br />";
		}
		if (target === 'hackmons' || target === 'purehackmons' || target === 'classichackmons') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3500418/\">Hackmons</a><br />";
		}
		if (target === 'hiddentype') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3516349/\">Hidden Type</a><br />";
		}
		if (target === 'middlecup' || target === 'mc') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3494887/\">Middle Cup</a><br />";
		}
		if (target === 'skybattle') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3493601/\">Sky Battle</a><br />";
		}
		if (!matched) {
			return this.sendReply("The Other Metas entry '" + target + "' was not found. Try /othermetas or /om for general help.");
		}
		this.sendReplyBox(buffer);
	},

	/*formats: 'formathelp',
	formatshelp: 'formathelp',
	formathelp: function (target, room, user) {
		if (!this.canBroadcast()) return;
		if (this.broadcasting && (room.id === 'lobby' || room.battle)) return this.sendReply("This command is too spammy to broadcast in lobby/battles");
		var buf = [];
		var showAll = (target === 'all');
		for (var id in Tools.data.Formats) {
			var format = Tools.data.Formats[id];
			if (!format) continue;
			if (format.effectType !== 'Format') continue;
			if (!format.challengeShow) continue;
			if (!showAll && !format.searchShow) continue;
			buf.push({
				name: format.name,
				gameType: format.gameType || 'singles',
				mod: format.mod,
				searchShow: format.searchShow,
				desc: format.desc || 'No description.'
			});
		}
		this.sendReplyBox(
			"Available Formats: (<strong>Bold</strong> formats are on ladder.)<br />" +
			buf.map(function (data) {
				var str = "";
				// Bold = Ladderable.
				str += (data.searchShow ? "<strong>" + data.name + "</strong>" : data.name) + ": ";
				str += "(" + (!data.mod || data.mod === 'base' ? "" : data.mod + " ") + data.gameType + " format) ";
				str += data.desc;
				return str;
			}).join("<br />")
		);
	},*/

	roomhelp: function (target, room, user) {
		if (room.id === 'lobby' || room.battle) return this.sendReply("This command is too spammy for lobby/battles.");
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
			this.sendReplyBox("Please follow the rules:<br />" +
				(room.rulesLink ? "- <a href=\"" + Tools.escapeHTML(room.rulesLink) + "\">" + Tools.escapeHTML(room.title) + " room rules</a><br />" : "") +
				"- <a href=\"http://goldserver.weebly.com/rules.html\">" + (room.rulesLink ? "Global rules" : "Rules") + "</a>");
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
			buffer += "<a href=\"https://www.smogon.com/sim/faq\">Frequently Asked Questions</a><br />";
		}
		if (target === 'deviation') {
			matched = true;
			buffer += "<a href=\"https://www.smogon.com/sim/faq#deviation\">Why did this user gain or lose so many points?</a><br />";
		}
		if (target === 'doubles' || target === 'triples' || target === 'rotation') {
			matched = true;
			buffer += "<a href=\"https://www.smogon.com/sim/faq#doubles\">Can I play doubles/triples/rotation battles here?</a><br />";
		}
		if (target === 'randomcap') {
			matched = true;
			buffer += "<a href=\"https://www.smogon.com/sim/faq#randomcap\">What is this fakemon and what is it doing in my random battle?</a><br />";
		}
		if (target === 'restarts') {
			matched = true;
			buffer += "<a href=\"https://www.smogon.com/sim/faq#restarts\">Why is the server restarting?</a><br />";
		}
		if (target === 'all' || target === 'star' || target === 'player') {
			matched = true;
			buffer += '<a href="http://www.smogon.com/sim/faq#star">Why is there this star (&starf;) in front of my username?</a><br />';
		}
		if (target === 'staff') {
			matched = true;
			buffer += '<a href="http://goldserver.weebly.com/how-do-i-get-a-rank.html">Staff FAQ</a><br />';
		}
		if (target === 'autoconfirmed' || target === 'ac') {
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
			buffer += "- <a href=\"https://www.smogon.com/tiers/\">Smogon Tiers</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/tiering-faq.3498332/\">Tiering FAQ</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/xyhub/tiers\">The banlists for each tier</a><br />";
		}
		if (target === 'overused' || target === 'ou') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3514144/\">np: OU Stage 6</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/dex/xy/tags/ou/\">OU Banlist</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3515714/\">OU Viability Rankings</a><br />";
		}
		if (target === 'ubers' || target === 'uber') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3519501/\">np: XY Ubers Shadow Tag Suspect Test</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3496305/\">Ubers Viability Rankings</a><br />";
		}
		if (target === 'underused' || target === 'uu') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3516640/\">np: UU Stage 3</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/dex/xy/tags/uu/\">UU Banlist</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3516418/\">UU Viability Rankings</a><br />";
		}
		if (target === 'rarelyused' || target === 'ru') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3515615/\">np: RU Stage 4</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/dex/xy/tags/ru/\">RU Banlist</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3516783/\">RU Viability Rankings</a><br />";
		}
		if (target === 'neverused' || target === 'nu') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3516675/\">np: NU Stage 2</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/dex/xy/tags/nu/\">NU Banlist</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3509494/\">NU Viability Rankings</a><br />";
		}
		if (target === 'littlecup' || target === 'lc') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3505710/\">Metagame Discussion Thread</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3490462/\">LC Banlist</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3496013/\">LC Viability Rankings</a><br />";
		}
		if (target === 'smogondoubles' || target === 'doubles') {
			matched = true;
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3509279/\">np: Doubles Stage 3.5</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3498688/\">Doubles Banlist</a><br />";
			buffer += "- <a href=\"https://www.smogon.com/forums/threads/3496306/\">Doubles Viability Rankings</a><br />";
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
		if (toId(targets[0]) === 'previews') return this.sendReplyBox("<a href=\"https://www.smogon.com/forums/threads/sixth-generation-pokemon-analyses-index.3494918/\">Generation 6 Analyses Index</a>, brought to you by <a href=\"https://www.smogon.com\">Smogon University</a>");
		var pokemon = Tools.getTemplate(targets[0]);
		var item = Tools.getItem(targets[0]);
		var move = Tools.getMove(targets[0]);
		var ability = Tools.getAbility(targets[0]);
		var atLeastOne = false;
		var generation = (targets[1] || 'xy').trim().toLowerCase();
		var genNumber = 6;
		// var doublesFormats = {'vgc2012':1, 'vgc2013':1, 'vgc2014':1, 'doubles':1};
		var doublesFormats = {};
		var doublesFormat = (!targets[2] && generation in doublesFormats)? generation : (targets[2] || '').trim().toLowerCase();
		var doublesText = '';
		if (generation === 'xy' || generation === 'xy' || generation === '6' || generation === 'six') {
			generation = 'xy';
		} else if (generation === 'bw' || generation === 'bw2' || generation === '5' || generation === 'five') {
			generation = 'bw';
			genNumber = 5;
		} else if (generation === 'dp' || generation === 'dpp' || generation === '4' || generation === 'four') {
			generation = 'dp';
			genNumber = 4;
		} else if (generation === 'adv' || generation === 'rse' || generation === 'rs' || generation === '3' || generation === 'three') {
			generation = 'rs';
			genNumber = 3;
		} else if (generation === 'gsc' || generation === 'gs' || generation === '2' || generation === 'two') {
			generation = 'gs';
			genNumber = 2;
		} else if (generation === 'rby' || generation === 'rb' || generation === '1' || generation === 'one') {
			generation = 'rb';
			genNumber = 1;
		} else {
			generation = 'xy';
		}
		if (doublesFormat !== '') {
			// Smogon only has doubles formats analysis from gen 5 onwards.
			if (!(generation in {'bw':1, 'xy':1}) || !(doublesFormat in doublesFormats)) {
				doublesFormat = '';
			} else {
				doublesText = {'vgc2012':"VGC 2012", 'vgc2013':"VGC 2013", 'vgc2014':"VGC 2014", 'doubles':"Doubles"}[doublesFormat];
				doublesFormat = '/' + doublesFormat;
			}
		}

		// Pokemon
		if (pokemon.exists) {
			atLeastOne = true;
			if (genNumber < pokemon.gen) {
				return this.sendReplyBox("" + pokemon.name + " did not exist in " + generation.toUpperCase() + "!");
			}
			// if (pokemon.tier === 'CAP') generation = 'cap';
			if (pokemon.tier === 'CAP') return this.sendReply("CAP is not currently supported by Smogon Strategic Pokedex.");

			var illegalStartNums = {'351':1, '421':1, '487':1, '493':1, '555':1, '647':1, '648':1, '649':1, '681':1};
			if (pokemon.isMega || pokemon.num in illegalStartNums) pokemon = Tools.getTemplate(pokemon.baseSpecies);
			var poke = pokemon.name.toLowerCase().replace(/\ /g, '_').replace(/[^a-z0-9\-\_]+/g, '');

			this.sendReplyBox("<a href=\"https://www.smogon.com/dex/" + generation + "/pokemon/" + poke + doublesFormat + "\">" + generation.toUpperCase() + " " + doublesText + " " + pokemon.name + " analysis</a>, brought to you by <a href=\"https://www.smogon.com\">Smogon University</a>");
		}

		// Item
		if (item.exists && genNumber > 1 && item.gen <= genNumber) {
			atLeastOne = true;
			var itemName = item.name.toLowerCase().replace(' ', '_');
			this.sendReplyBox("<a href=\"https://www.smogon.com/dex/" + generation + "/items/" + itemName + "\">" + generation.toUpperCase() + " " + item.name + " item analysis</a>, brought to you by <a href=\"https://www.smogon.com\">Smogon University</a>");
		}

		// Ability
		if (ability.exists && genNumber > 2 && ability.gen <= genNumber) {
			atLeastOne = true;
			var abilityName = ability.name.toLowerCase().replace(' ', '_');
			this.sendReplyBox("<a href=\"https://www.smogon.com/dex/" + generation + "/abilities/" + abilityName + "\">" + generation.toUpperCase() + " " + ability.name + " ability analysis</a>, brought to you by <a href=\"https://www.smogon.com\">Smogon University</a>");
		}

		// Move
		if (move.exists && move.gen <= genNumber) {
			atLeastOne = true;
			var moveName = move.name.toLowerCase().replace(' ', '_');
			this.sendReplyBox("<a href=\"https://www.smogon.com/dex/" + generation + "/moves/" + moveName + "\">" + generation.toUpperCase() + " " + move.name + " move analysis</a>, brought to you by <a href=\"https://www.smogon.com\">Smogon University</a>");
		}

		if (!atLeastOne) {
			return this.sendReplyBox("Pokemon, item, move, or ability not found for generation " + generation.toUpperCase() + ".");
		}

	},
	forums: function(target, room, user) {
		if (!this.canBroadcast()) return;
		return this.sendReplyBox('Gold Forums can be found <a href="http://w11.zetaboards.com/Goldserverps/index/">here</a>.');
	},
	regdate: function(target, room, user, connection) {
		if (!this.canBroadcast()) return;
		if (!target || target =="0") return this.sendReply('Lol, you can\'t do that, you nub.');
		if (!target || target == "." || target == "," || target == "'") return this.sendReply('/regdate - Please specify a valid username.'); //temp fix for symbols that break the command
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
						data = Tools.escapeHTML(username)+' was registered on'+regdate+'.';
					}
				}
			}
			else {
				data = Tools.escapeHTML(username)+' is not registered.';
			}
			self.sendReplyBox(Tools.escapeHTML(data));
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
	
	//Should solve the problem of users not being able to talk in chat
	unstick: function(target, room, user) {
		if (!this.can('hotpatch')) return;
		for (var uid in Users.users) {
			Users.users[uid].chatQueue = null;
			Users.users[uid].chatQueueTimeout = null;
		}
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
		if (d >= 0) {
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

	removebadge: function(target, room, user) {
		if (!this.can('hotpatch')) return false;
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!target) return this.sendReply('/removebadge [user], [badge] - Removes a badge from a user.');
		if (!targetUser) return this.sendReply('There is no user named '+this.targetUsername+'.');
		var self = this;
		var type_of_badges = ['admin','bot','dev','vip','artist','mod','leader','champ','creator','concun','twinner','goodra','league'];
		if (type_of_badges.indexOf(target) > -1 == false) return this.sendReply('The badge '+target+' is not a valid badge.');
		fs.readFile('badges.txt','utf8', function(err, data) {
			if (err) console.log(err);
			var match = false;
			var currentbadges = '';
			var row = (''+data).split('\n');
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
				if (currentbadges.indexOf(target) > -1 == false) return self.sendReply(currentbadges);//'The user '+targetUser+' does not have the badge.');
				var re = new RegExp(line, 'g');
				currentbadges = currentbadges.replace(target,'');
				var newdata = data.replace(re, targetUser.userid+':'+currentbadges);
				fs.writeFile('badges.txt',newdata, 'utf8', function(err, data) {
					if (err) console.log(err);
					return self.sendReply('You have removed the badge '+target+' from the user '+targetUser+'.');
				});
			} else {
				return self.sendReply('There is no match for the user '+targetUser+'.');
			}
		});
	},

	givebadge: function(target, room, user) {
		if (!this.can('hotpatch')) return false;
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser) return this.sendReply('There is no user named '+this.targetUsername+'.');
		if (!target) return this.sendReply('/givebadge [user], [badge] - Gives a badge to a user. Requires: &~');
		var self = this;
		var type_of_badges = ['admin','bot','dev','vip','mod','artist','leader','champ','creator','comcun','twinner','league'];
		if (type_of_badges.indexOf(target) > -1 == false) return this.sendReply('Ther is no badge named '+target+'.');
		fs.readFile('badges.txt', 'utf8', function(err, data) {
			if (err) console.log(err);
			var currentbadges = '';
			var line = '';
			var row = (''+data).split('\n');
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
				if (currentbadges.indexOf(target) > -1) return self.sendReply('The user '+targerUser+' already has the badge '+target+'.');
				var re = new RegExp(line, 'g');
				var newdata = data.replace(re, targetUser.userid+':'+currentbadges+target);
				fs.writeFile('badges.txt', newdata, function(err, data) {
					if (err) console.log(err);
					self.sendReply('You have given the badge '+target+' to the user '+targetUser+'.');
					targetUser.send('You have recieved the badge '+target+' from the user '+user.userid+'.');
					room.addRaw(targetUser+' has recieved the '+target+' badge from '+user.name);
				});
			} else {
				fs.appendFile('badges.txt','\n'+targetUser.userid+':'+target, function(err) {
					if (err) console.log(err);
					self.sendReply('You have given the badge '+target+' to the user '+targetUser+'.');
					targetUser.send('You have recieved the badge '+target+' from the user '+user.userid+'.');
				});
			}
		})
	},

	badgelist: function(target, room, user) {
                if (!this.canBroadcast()) return;
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
                var bot ='<img src="http://www.smogon.com/media/forums/images/badges/mind.png" title="Gold Bot Hoster">';
 				return this.sendReplyBox('<b>List of Gold Badges</b>:<br>   '+admin+'    '+dev+'  '+creator+'   '+comcun+'    '+mod+'    '+leader+'    '+league+'    '+champ+'    '+artist+'    '+twinner+'    '+vip+'    '+bot+' <br>--Hover over them to see the meaning of each.<br>--Get a badge and get a FREE custom avatar!<br>--Click <a href="http://goldserver.weebly.com/badges.html">here</a> to find out more about how to get a badge.');
	},
	badges: 'badge',
    	badge: function(target, room, user) {
            	if (!this.canBroadcast()) return;
            	if (target == '') target = user.userid;
            	target = this.splitTarget(target);
            	var targetUser = this.targetUser;
            	var matched = false;
            	if (!targetUser) return false;
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
                var bot ='<img src="http://www.smogon.com/media/forums/images/badges/mind.png" title="Gold Bot Hoster">';
                var self = this;
                fs.readFile('badges.txt', 'utf8', function(err, data) {
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
                		if (currentbadges.indexOf('bot') > -1) badgelist+=' '+bot;
                		self.sendReplyBox(targetUser.userid+"'s badges: "+badgelist);
                		room.update();
                	} else {
                		self.sendReplyBox('User '+targetUser.userid+' has no badges.');
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
		return this.sendReplyBox(''+results+'');
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
		return this.sendReplyBox('<center><font size="3"><b>Coin Game!</b></font><br>'+results+'');
	},

	p: 'panagrams',
	panagrams: function(target, room, user) {
		if(!user.can('ban')) return;
		if (room.id == 'lobby') {
			room.addRaw(
				'<div class="broadcast-black"><b><center><font size="3">Panagrams has started!</font></b>' +
				'<center>This is Gold\'s version of anagrams, but with buck prizes!  We currently have a random category and a Pokemon category!<br />' +
				'<button name="joinRoom" value="panagrams" target="_blank">Play now!</button></center></div>'
				);
		} else {
			room.addRaw(
				'<div class="broadcast-black"><center><font size="3">A panagrams session is about to begin!</font></center></div>'
				);
		}
	},

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
            		this.sendReply('There is no target named /one '+target);
            	}
            	if (!target) {
			this.sendReplyBox('Available commands for /one: ' + Object.keys(messages).join(', '));
		}
        },

	color: function(target, room, user) {
		if (!this.canBroadcast()) return;
		if (target === 'list' || target === 'help' || target === 'options') {
		return this.sendReplyBox('The random colors are: <b><font color="red">Red</font>, <font color="blue">Blue</font>, <font color="orange">Orange</font>, <font color="green">Green</font>, <font color="teal">Teal</font>, <font color="brown">Brown</font>, <font color="black">Black</font>, <font color="purple">Purple</font>, <font color="pink">Pink</font>, <font color="gray">Gray</font>, <font color="tan">Tan</font>, <font color="gold">Gold</font>, <font color=#CC0000>R</font><font color=#AE1D00>a</font><font color=#913A00>i</font><font color=#745700>n</font><font color=#577400>b</font><font color=#3A9100>o</font><font color=#1DAE00>w</font>.');
		}
		var colors = ['Red','Blue','Orange','Green','Teal','Brown','Black','Purple','Pink','Grey','Tan','Gold'];
		var results = colors[Math.floor(Math.random()*colors.length)];
		if (results == 'Rainbow') {
			return this.sendReply('The random color is :<b><font color=#CC0000>R</font><font color=#AE1D00>a</font><font color=#913A00>i</font><font color=#745700>n</font><font color=#577400>b</font><font color=#3A9100>o</font><font color=#1DAE00>w</font></b>');
		} else {
			return this.sendReplyBox('The random color is:<b><font color='+results+'>'+results+'</font></b>');
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

		var targets = target.split(',');
		if (targets.length !== 3) {
			return this.parse('/help showimage');
		}

		this.sendReply('|raw|<img src="' + Tools.escapeHTML(targets[0]) + '" alt="" width="' + toId(targets[1]) + '" height="' + toId(targets[2]) + '" />');
	},

	htmlbox: function (target, room, user) {
		if (!target) return this.parse('/help htmlbox');
		if (!this.can('declare', null, room)) return;
		if (!this.canHTML(target)) return;
		if (!this.canBroadcast('!htmlbox')) return;

		this.sendReplyBox(target);
	},

	a: function (target, room, user) {
		if (!this.canTalk()) return;
		if (!this.can('rawpacket')) return false;
		// secret sysop command
		room.add(target);
	},
	
	temote: 'temotes',
	toggleemotes: 'temotes',
	temotes: function(target, room, user) {
		if(!user.can('pban')) return;
		if (!target) return this.sendReply('Valid targets are: "on", "off" and "status".');
		if (toId(target) === 'off' || toId(target) === 'disable') {
			Core.settings.emoteStatus = false;
			room.add(Tools.escapeHTML(user.name) + ' has disabled chat emotes.');
			this.logModCommand(Tools.escapeHTML(user.name) + ' has disabled chat emotes.');
		}
		if (toId(target) === 'on' || toId(target) === 'enable') {
			Core.settings.emoteStatus = true;
			room.add(Tools.escapeHTML(user.name) + ' has enabled chat emotes.');
			this.logModCommand(Tools.escapeHTML(user.name) + ' has enabled chat emotes.');
		}
		if (toId(target) === 'status') {
			var currentEmoteStatus = '';
			if (!Core.settings.emoteStatus) { 
				currentEmoteStatus = 'disabled.';
			} else {
				currentEmoteStatus = 'enabled.';
			}
			return this.sendReply('Chat emotes are currently ' + currentEmoteStatus);
		}
	},

	emotes: 'emoticon',
	emoticons: 'emoticon',
	emoticon: function (target, room, user) {
        	if (!this.canBroadcast()) return;
		if (!Core.settings.emoteStatus) {
			return this.sendReplyBox("<b><font color=red>Sorry, chat emotes have been disabled. :(</b></font>");
		} else {
			var name = Object.keys(Core.emoticons),
			emoticons = [];
			var len = name.length;
        		while (len--) {
        			emoticons.push((Core.processEmoticons(name[(name.length-1)-len]) + '&nbsp;' + name[(name.length-1)-len]));
        		}
        		this.sendReplyBox('<b><u>List of emoticons:</b></u> <br/><br/>' + emoticons.join(' ').toString());
    		}
	},

	sca: 'customavatar',
	setcustomavatar: 'customavatar',
	setcustomavi: 'customavatar',
	giveavatar: 'customavatar',
	customavatars: 'customavatar',
	customavatar: (function () {
		const script = (function () {/*
			FILENAME=`mktemp`
			function cleanup {
				rm -f $FILENAME
			}
			trap cleanup EXIT

			set -xe

			timeout 10 wget "$1" -nv -O $FILENAME

			FRAMES=`identify $FILENAME | wc -l`
			if [ $FRAMES -gt 1 ]; then
				EXT=".gif"
			else
				EXT=".png"
			fi

			timeout 10 convert $FILENAME -layers TrimBounds -coalesce -adaptive-resize 80x80\> -background transparent -gravity center -extent 80x80 "$2$EXT"
		*/}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1];

		var pendingAdds = {};
		return function (target, room, user) {
			var parts = target.split(',');
			var cmd = parts[0].trim().toLowerCase();

			if (cmd in {'':1, show:1, view:1, display:1}) {
				var message = "";
				for (var a in Config.customavatars)
					message += "<strong>" + Tools.escapeHTML(a) + ":</strong> " + Tools.escapeHTML(Config.customavatars[a]) + "<br />";
				return this.sendReplyBox(message);
			}

			if (!this.can('giveavatar') && !user.vip) return false;

			switch (cmd) {
				case 'add':
				case 'set':
					var userid = toId(parts[1]);
					if (!this.can('giveavatar') && user.vip && userid !== user.userid) return false;
					var user = Users.getExact(userid);
					var avatar = parts.slice(2).join(',').trim();

					if (!userid) return this.sendReply("You didn't specify a user.");
					if (Config.customavatars[userid]) return this.sendReply(userid + " already has a custom avatar.");

					var hash = require('crypto').createHash('sha512').update(userid + '\u0000' + avatar).digest('hex').slice(0, 8);
					pendingAdds[hash] = {userid: userid, avatar: avatar};
					parts[1] = hash;

					if (!user) {
						this.sendReply("Warning: " + userid + " is not online.");
						this.sendReply("If you want to continue, use: /customavatar forceset, " + hash);
						return;
					}
					// Fallthrough

				case 'forceset':
					var hash = parts[1].trim();
					if (!pendingAdds[hash]) return this.sendReply("Invalid hash.");

					var userid = pendingAdds[hash].userid;
					var avatar = pendingAdds[hash].avatar;
					delete pendingAdds[hash];

					require('child_process').execFile('bash', ['-c', script, '-', avatar, './config/avatars/' + userid], (function (e, out, err) {
						if (e) {
							this.sendReply(userid + "'s custom avatar failed to be set. Script output:");
							(out + err).split('\n').forEach(this.sendReply.bind(this));
							return;
						}

						reloadCustomAvatars();
						this.sendReply(userid + "'s custom avatar has been set.");
						Rooms.rooms.staff.add(parts[1]+' has received a custom avatar from '+user.name+'.');
					}).bind(this));
					break;
				case 'rem':
				case 'remove':
				case 'del':
				case 'delete':
					var userid = toId(parts[1]);
					if (!this.can('giveavatar') && user.vip && userid !== user.userid) return false;
					if (!Config.customavatars[userid]) return this.sendReply(userid + " does not have a custom avatar.");

					if (Config.customavatars[userid].toString().split('.').slice(0, -1).join('.') !== userid)
						return this.sendReply(userid + "'s custom avatar (" + Config.customavatars[userid] + ") cannot be removed with this script.");
					require('fs').unlink('./config/avatars/' + Config.customavatars[userid], (function (e) {
						if (e) return this.sendReply(userid + "'s custom avatar (" + Config.customavatars[userid] + ") could not be removed: " + e.toString());

						delete Config.customavatars[userid];
						this.sendReply(userid + "'s custom avatar removed successfully");
					}).bind(this));
					break;

				default:
					return this.sendReply("Invalid command. Valid commands are `/customavatar set, user, avatar` and `/customavatar delete, user`.");
			}
		};
	})(),

	/*********************************************************
	 * Help commands
	 *********************************************************/


	commands: 'help',
	h: 'help',
	'?': 'help',
	help: function (target, room, user) {
		target = target.toLowerCase();
		var matched = false;
		if (target === 'msg' || target === 'pm' || target === 'whisper' || target === 'w') {
			matched = true;
			this.sendReply("/msg OR /whisper OR /w [username], [message] - Send a private message.");
		}
		if (target === 'r' || target === 'reply') {
			matched = true;
			this.sendReply("/reply OR /r [message] - Send a private message to the last person you received a message from, or sent a message to.");
		}
		if (target === 'rating' || target === 'ranking' || target === 'rank' || target === 'ladder') {
			matched = true;
			this.sendReply("/rating - Get your own rating.");
			this.sendReply("/rating [username] - Get user's rating.");
		}
		if (target === 'nick') {
			matched = true;
			this.sendReply("/nick [new username] - Change your username.");
		}
		if (target === 'avatar') {
			matched = true;
			this.sendReply("/avatar [new avatar number] - Change your trainer sprite.");
		}
		if (target === 'whois' || target === 'alts' || target === 'ip' || target === 'rooms') {
			matched = true;
			this.sendReply("/whois - Get details on yourself: alts, group, IP address, and rooms.");
			this.sendReply("/whois [username] - Get details on a username: alts (Requires: % @ & ~), group, IP address (Requires: @ & ~), and rooms.");
		}
		if (target === 'data') {
			matched = true;
			this.sendReply("/data [pokemon/item/move/ability] - Get details on this pokemon/item/move/ability/nature.");
			this.sendReply("!data [pokemon/item/move/ability] - Show everyone these details. Requires: + % @ & ~");
		}
		if (target === 'details' || target === 'dt') {
			matched = true;
			this.sendReply("/details [pokemon] - Get additional details on this pokemon/item/move/ability/nature.");
			this.sendReply("!details [pokemon] - Show everyone these details. Requires: + % @ & ~");
		}
		if (target === 'analysis') {
			matched = true;
			this.sendReply("/analysis [pokemon], [generation] - Links to the Smogon University analysis for this Pokemon in the given generation.");
			this.sendReply("!analysis [pokemon], [generation] - Shows everyone this link. Requires: + % @ & ~");
		}
		if (target === 'groups') {
			matched = true;
			this.sendReply("/groups - Explains what the + % @ & next to people's names mean.");
			this.sendReply("!groups - Show everyone that information. Requires: + % @ & ~");
		}
		if (target === 'opensource') {
			matched = true;
			this.sendReply("/opensource - Links to PS's source code repository.");
			this.sendReply("!opensource - Show everyone that information. Requires: + % @ & ~");
		}
		if (target === 'avatars') {
			matched = true;
			this.sendReply("/avatars - Explains how to change avatars.");
			this.sendReply("!avatars - Show everyone that information. Requires: + % @ & ~");
		}
		if (target === 'intro') {
			matched = true;
			this.sendReply("/intro - Provides an introduction to competitive pokemon.");
			this.sendReply("!intro - Show everyone that information. Requires: + % @ & ~");
		}
		if (target === 'cap') {
			matched = true;
			this.sendReply("/cap - Provides an introduction to the Create-A-Pokemon project.");
			this.sendReply("!cap - Show everyone that information. Requires: + % @ & ~");
		}
		if (target === 'om') {
			matched = true;
			this.sendReply("/om - Provides links to information on the Other Metagames.");
			this.sendReply("!om - Show everyone that information. Requires: + % @ & ~");
		}
		if (target === 'learn' || target === 'learnset' || target === 'learnall') {
			matched = true;
			this.sendReply("/learn [pokemon], [move, move, ...] - Displays how a Pokemon can learn the given moves, if it can at all.");
			this.sendReply("!learn [pokemon], [move, move, ...] - Show everyone that information. Requires: + % @ & ~");
		}
		if (target === 'calc' || target === 'calculator') {
			matched = true;
			this.sendReply("/calc - Provides a link to a damage calculator");
			this.sendReply("!calc - Shows everyone a link to a damage calculator. Requires: + % @ & ~");
		}
		if (target === 'blockchallenges' || target === 'away' || target === 'idle') {
			matched = true;
			this.sendReply("/away - Blocks challenges so no one can challenge you. Deactivate it with /back.");
		}
		if (target === 'allowchallenges' || target === 'back') {
			matched = true;
			this.sendReply("/back - Unlocks challenges so you can be challenged again. Deactivate it with /away.");
		}
		if (target === 'faq') {
			matched = true;
			this.sendReply("/faq [theme] - Provides a link to the FAQ. Add deviation, doubles, randomcap, restart, or staff for a link to these questions. Add all for all of them.");
			this.sendReply("!faq [theme] - Shows everyone a link to the FAQ. Add deviation, doubles, randomcap, restart, or staff for a link to these questions. Add all for all of them. Requires: + % @ & ~");
		}
		if (target === 'highlight') {
			matched = true;
			this.sendReply("Set up highlights:");
			this.sendReply("/highlight add, word - add a new word to the highlight list.");
			this.sendReply("/highlight list - list all words that currently highlight you.");
			this.sendReply("/highlight delete, word - delete a word from the highlight list.");
			this.sendReply("/highlight delete - clear the highlight list");
		}
		if (target === 'timestamps') {
			matched = true;
			this.sendReply("Set your timestamps preference:");
			this.sendReply("/timestamps [all|lobby|pms], [minutes|seconds|off]");
			this.sendReply("all - change all timestamps preferences, lobby - change only lobby chat preferences, pms - change only PM preferences");
			this.sendReply("off - set timestamps off, minutes - show timestamps of the form [hh:mm], seconds - show timestamps of the form [hh:mm:ss]");
		}
		if (target === 'effectiveness' || target === 'matchup' || target === 'eff' || target === 'type') {
			matched = true;
			this.sendReply("/effectiveness OR /matchup OR /eff OR /type [attack], [defender] - Provides the effectiveness of a move or type on another type or a Pokémon.");
			this.sendReply("!effectiveness OR !matchup OR !eff OR !type [attack], [defender] - Shows everyone the effectiveness of a move or type on another type or a Pokémon.");
		}
		if (target === 'dexsearch' || target === 'dsearch' || target === 'ds') {
			matched = true;
			this.sendReply("/dexsearch [type], [move], [move], ... - Searches for Pokemon that fulfill the selected criteria.");
			this.sendReply("Search categories are: type, tier, color, moves, ability, gen.");
			this.sendReply("Valid colors are: green, red, blue, white, brown, yellow, purple, pink, gray and black.");
			this.sendReply("Valid tiers are: Uber/OU/BL/UU/BL2/RU/BL3/NU/PU/NFE/LC/CAP.");
			this.sendReply("Types must be followed by ' type', e.g., 'dragon type'.");
			this.sendReply("Parameters can be excluded through the use of '!', e.g., '!water type' excludes all water types.");
			this.sendReply("The parameter 'mega' can be added to search for Mega Evolutions only, and the parameters 'FE' or 'NFE' can be added to search fully or not-fully evolved Pokemon only.");
			this.sendReply("The order of the parameters does not matter.");
		}
		if (target === 'dice' || target === 'roll') {
			matched = true;
			this.sendReply("/dice [optional max number] - Randomly picks a number between 1 and 6, or between 1 and the number you choose.");
			this.sendReply("/dice [number of dice]d[number of sides] - Simulates rolling a number of dice, e.g., /dice 2d4 simulates rolling two 4-sided dice.");
		}
		if (target === 'pick' || target === 'pickrandom') {
			matched = true;
			this.sendReply("/pick [option], [option], ... - Randomly selects an item from a list containing 2 or more elements.");
		}
		if (target === 'join') {
			matched = true;
			this.sendReply("/join [roomname] - Attempts to join the room [roomname].");
		}
		if (target === 'ignore') {
			matched = true;
			this.sendReply("/ignore [user] - Ignores all messages from the user [user].");
			this.sendReply("Note that staff messages cannot be ignored.");
		}
		if (target === 'invite') {
			matched = true;
			this.sendReply("/invite [username], [roomname] - Invites the player [username] to join the room [roomname].");
		}

		// driver commands
		if (target === 'lock' || target === 'l') {
			matched = true;
			this.sendReply("/lock OR /l [username], [reason] - Locks the user from talking in all chats. Requires: % @ & ~");
		}
		if (target === 'unlock') {
			matched = true;
			this.sendReply("/unlock [username] - Unlocks the user. Requires: % @ & ~");
		}
		if (target === 'redirect' || target === 'redir') {
			matched = true;
			this.sendReply("/redirect OR /redir [username], [roomname] - Attempts to redirect the user [username] to the room [roomname]. Requires: % @ & ~");
		}
		if (target === 'modnote') {
			matched = true;
			this.sendReply("/modnote [note] - Adds a moderator note that can be read through modlog. Requires: % @ & ~");
		}
		if (target === 'forcerename' || target === 'fr') {
			matched = true;
			this.sendReply("/forcerename OR /fr [username], [reason] - Forcibly change a user's name and shows them the [reason]. Requires: % @ & ~");
		}
		if (target === 'kickbattle ') {
			matched = true;
			this.sendReply("/kickbattle [username], [reason] - Kicks a user from a battle with reason. Requires: % @ & ~");
		}
		if (target === 'warn' || target === 'k') {
			matched = true;
			this.sendReply("/warn OR /k [username], [reason] - Warns a user showing them the Pokemon Showdown Rules and [reason] in an overlay. Requires: % @ & ~");
		}
		if (target === 'modlog') {
			matched = true;
			this.sendReply("/modlog [roomid|all], [n] - Roomid defaults to current room. If n is a number or omitted, display the last n lines of the moderator log. Defaults to 15. If n is not a number, search the moderator log for 'n' on room's log [roomid]. If you set [all] as [roomid], searches for 'n' on all rooms's logs. Requires: % @ & ~");
		}
		if (target === 'mute' || target === 'm') {
			matched = true;
			this.sendReply("/mute OR /m [username], [reason] - Mutes a user with reason for 7 minutes. Requires: % @ & ~");
		}
		if (target === 'hourmute' || target === 'hm') {
			matched = true;
			this.sendReply("/hourmute OR /hm [username], [reason] - Mutes a user with reason for an hour. Requires: % @ & ~");
		}
		if (target === 'unmute' || target === 'um') {
			matched = true;
			this.sendReply("/unmute [username] - Removes mute from user. Requires: % @ & ~");
		}

		// mod commands
		if (target === 'roomban' || target === 'rb') {
			matched = true;
			this.sendReply("/roomban [username] - Bans the user from the room you are in. Requires: @ & ~");
		}
		if (target === 'roomunban') {
			matched = true;
			this.sendReply("/roomunban [username] - Unbans the user from the room you are in. Requires: @ & ~");
		}
		if (target === 'ban' || target === 'b') {
			matched = true;
			this.sendReply("/ban OR /b [username], [reason] - Kick user from all rooms and ban user's IP address with reason. Requires: @ & ~");
		}
		if (target === 'unban') {
			matched = true;
			this.sendReply("/unban [username] - Unban a user. Requires: @ & ~");
		}

		// RO commands
		if (target === 'showimage') {
			matched = true;
			this.sendReply("/showimage [url], [width], [height] - Show an image. Requires: # & ~");
		}
		if (target === 'roompromote') {
			matched = true;
			this.sendReply("/roompromote [username], [group] - Promotes the user to the specified group or next ranked group. Requires: @ # & ~");
		}
		if (target === 'roomdemote') {
			matched = true;
			this.sendReply("/roomdemote [username], [group] - Demotes the user to the specified group or previous ranked group. Requires: @ # & ~");
		}

		// leader commands
		if (target === 'banip') {
			matched = true;
			this.sendReply("/banip [ip] - Kick users on this IP or IP range from all rooms and bans it. Accepts wildcards to ban ranges. Requires: & ~");
		}
		if (target === 'unbanip') {
			matched = true;
			this.sendReply("/unbanip [ip] - Kick users on this IP or IP range from all rooms and bans it. Accepts wildcards to ban ranges. Requires: & ~");
		}
		if (target === 'unbanall') {
			matched = true;
			this.sendReply("/unbanall - Unban all IP addresses. Requires: & ~");
		}
		if (target === 'promote') {
			matched = true;
			this.sendReply("/promote [username], [group] - Promotes the user to the specified group or next ranked group. Requires: & ~");
		}
		if (target === 'demote') {
			matched = true;
			this.sendReply("/demote [username], [group] - Demotes the user to the specified group or previous ranked group. Requires: & ~");
		}
		if (target === 'forcetie') {
			matched = true;
			this.sendReply("/forcetie - Forces the current match to tie. Requires: & ~");
		}
		if (target === 'declare') {
			matched = true;
			this.sendReply("/declare [message] - Anonymously announces a message. Requires: & ~");
		}

		// admin commands
		if (target === 'chatdeclare' || target === 'cdeclare') {
			matched = true;
			this.sendReply("/cdeclare [message] - Anonymously announces a message to all chatrooms on the server. Requires: ~");
		}
		if (target === 'globaldeclare' || target === 'gdeclare') {
			matched = true;
			this.sendReply("/globaldeclare [message] - Anonymously announces a message to every room on the server. Requires: ~");
		}
		if (target === 'htmlbox') {
			matched = true;
			this.sendReply("/htmlbox [message] - Displays a message, parsing HTML code contained. Requires: ~ # with global authority");
		}
		if (target === 'announce' || target === 'wall') {
			matched = true;
			this.sendReply("/announce OR /wall [message] - Makes an announcement. Requires: % @ & ~");
		}
		if (target === 'modchat') {
			matched = true;
			this.sendReply("/modchat [off/autoconfirmed/+/%/@/&/~] - Set the level of moderated chat. Requires: @ for off/autoconfirmed/+ options, & ~ for all the options");
		}
		if (target === 'hotpatch') {
			matched = true;
			this.sendReply("Hot-patching the game engine allows you to update parts of Showdown without interrupting currently-running battles. Requires: ~");
			this.sendReply("Hot-patching has greater memory requirements than restarting.");
			this.sendReply("/hotpatch chat - reload chat-commands.js");
			this.sendReply("/hotpatch battles - spawn new simulator processes");
			this.sendReply("/hotpatch formats - reload the tools.js tree, rebuild and rebroad the formats list, and also spawn new simulator processes");
		}
		if (target === 'lockdown') {
			matched = true;
			this.sendReply("/lockdown - locks down the server, which prevents new battles from starting so that the server can eventually be restarted. Requires: ~");
		}
		if (target === 'kill') {
			matched = true;
			this.sendReply("/kill - kills the server. Can't be done unless the server is in lockdown state. Requires: ~");
		}
		if (target === 'loadbanlist') {
			matched = true;
			this.sendReply("/loadbanlist - Loads the bans located at ipbans.txt. The command is executed automatically at startup. Requires: ~");
		}
		if (target === 'makechatroom') {
			matched = true;
			this.sendReply("/makechatroom [roomname] - Creates a new room named [roomname]. Requires: ~");
		}
		if (target === 'deregisterchatroom') {
			matched = true;
			this.sendReply("/deregisterchatroom [roomname] - Deletes room [roomname] after the next server restart. Requires: ~");
		}
		if (target === 'roomowner') {
			matched = true;
			this.sendReply("/roomowner [username] - Appoints [username] as a room owner. Removes official status. Requires: ~");
		}
		if (target === 'roomdeowner') {
			matched = true;
			this.sendReply("/roomdeowner [username] - Removes [username]'s status as a room owner. Requires: ~");
		}
		if (target === 'privateroom') {
			matched = true;
			this.sendReply("/privateroom [on/off] - Makes or unmakes a room private. Requires: ~");
		}

		// overall
		if (target === 'help' || target === 'h' || target === '?' || target === 'commands') {
			matched = true;
			this.sendReply("/help OR /h OR /? - Gives you help.");
		}
		if (!target) {
			this.sendReply("COMMANDS: /nick, /avatar, /rating, /whois, /msg, /reply, /ignore, /away, /back, /timestamps, /highlight");
			this.sendReply("INFORMATIONAL COMMANDS: /data, /dexsearch, /groups, /opensource, /avatars, /faq, /rules, /intro, /tiers, /othermetas, /learn, /analysis, /calc (replace / with ! to broadcast. Broadcasting requires: + % @ & ~)");
			if (user.group !== Config.groupsranking[0]) {
				this.sendReply("DRIVER COMMANDS: /warn, /mute, /unmute, /alts, /forcerename, /modlog, /lock, /unlock, /announce, /redirect");
				this.sendReply("MODERATOR COMMANDS: /ban, /unban, /ip");
				this.sendReply("LEADER COMMANDS: /declare, /forcetie, /forcewin, /promote, /demote, /banip, /unbanall");
			}
			this.sendReply("For an overview of room commands, use /roomhelp");
			this.sendReply("For details of a specific command, use something like: /help data");
		} else if (!matched) {
			this.sendReply("Help for the command '" + target + "' was not found. Try /help for general help");
		}
	}

};
