'use strict';
/* Chat filter plugin
 * By: jd, panpawn
 * Caps/stretching moderating from: https://github.com/Ecuacion/Pokemon-Showdown-Node-Bot/blob/master/features/moderation/index.js
 */

const fs = require('fs');

let adWhitelist = (Config.adWhitelist ? Config.adWhitelist : []);
let bannedMessages = (Config.bannedMessages ? Config.bannedMessages : []);
let adRegex = new RegExp("(play.pokemonshowdown.com\\/~~)(?!(" + adWhitelist.join('|') + "))", "g");
let MIN_CAPS_LENGTH = 18;
let MIN_CAPS_PROPORTION = 0.8;
let MAX_STRETCH = 7;
let MAX_REPEAT = 4;

Config.chatfilter = function (message, user, room, connection) {
	user.lastActive = Date.now();
	let capsMatch = message.replace(/[^A-Za-z]/g, '').match(/[A-Z]/g);
	capsMatch = capsMatch && toId(message).length > MIN_CAPS_LENGTH && (capsMatch.length >= Math.floor(toId(message).length * MIN_CAPS_PROPORTION));
	let stretchRegExp = new RegExp('(.)\\1{' + MAX_STRETCH.toString() + ',}', 'g');
	let repeatRegExp = new RegExp('(..+)\\1{' + MAX_REPEAT.toString() + ',}', 'g');
	let stretchMatch = message.toLowerCase().match(stretchRegExp);
	let formatError = capsMatch ? "too many capital letters" : "too much stretching";
	if (capsMatch && stretchMatch) formatError = "too many capital letters and too much streching";
	if (!user.can('mute', null, room) && room && room.id === 'lobby') {
		if (capsMatch || stretchMatch) {
			this.privateModCommand("(" + user.name + "'s message was not sent because it contained: " + formatError + ".  Message: " + message + ")");
			return this.errorReply("Your message was not sent because it contained " + formatError + ".");
			return false;
		}
	}
	for (let x in bannedMessages) {
		if (message.toLowerCase().indexOf(bannedMessages[x]) > -1 && bannedMessages[x] !== '' && message.substr(0, 1) !== '/') {
			if (user.locked) return false;
			Punishments.lock(user, Date.now() + 7 * 24 * 60 * 60 * 1000, "Said a banned word: " + bannedMessages[x]);
			user.popup('You have been automatically locked for sending a message containing a banned word.');
			Rooms('staff').add('[PornMonitor] ' + (room ? '(' + room + ') ' : '') + Tools.escapeHTML(user.name) +
			' was automatically locked for trying to say "' + message + '"').update();
			fs.appendFile('logs/modlog/modlog_staff.txt', '[' + (new Date().toJSON()) + '] (staff) ' + user.name + ' was locked from talking by the Server (' +
			bannedMessages[x] + ') (' + connection.ip + ')\n');
			Gold.pmUpperStaff(user.name + ' has been automatically locked for sending a message containing a banned word' +
			(room ? ". **Room:**" + room.id : " in a private message.") + ' **Message:** ' + message, '~Server');
			return false;
		}
	}
	let pre_matches = (message.match(/psim|psim.us|psim us|psm.us|psm us/g) || []).length;
	let final_check = (pre_matches >= 1 ? adWhitelist.filter(server => { return ~message.indexOf(server); }).length : 0);

	if (!user.can('hotpatch') && (pre_matches >= 1 && final_check === 0 || pre_matches >= 2 && final_check >= 1 || message.match(adRegex))) {
		if (user.locked) return false;
		if (!user.advWarns) user.advWarns = 0;
		user.advWarns++;
		if (user.advWarns > 1) {
			Punishments.lock(user, Date.now() + 7 * 24 * 60 * 60 * 1000, "Advertising");
			fs.appendFile('logs/modlog/modlog_staff.txt', '[' + (new Date().toJSON()) + '] (staff) ' + user.name +
				' was locked from talking by the Server. (Advertising) (' + connection.ip + ')\n');
			connection.sendTo(room, '|raw|<strong class="message-throttle-notice">You have been locked for attempting to advertise.</strong>');
			Gold.pmUpperStaff(user.name + " has been locked for attempting to advertise" + (room ? ". **Room:**" + room.id : " in a private message.") + " **Message:** " + message, "~Server");
			Rooms('staff').add('|raw|' + Gold.nameColor(user.name, false) + " has been locked for attempting to advertise" + (room ? ". <b>Room:</b> " + room.id : " in a private message.") + " <b>Message:</b> " + message).update();
			return false;
		}
		Gold.pmUpperStaff(user.name + " has attempted to advertise" + (room ? ". **Room:** " + room.id : " in a private message.") + " **Message:** " + message, "~Server");
		Rooms('staff').add('|raw|' + Gold.nameColor(user.name, false) + " has attempted to advertise" + (room ? ". <b>Room:</b> " + room.id : " in a private message.") + " <b>Message:</b> " + message).update();
		connection.sendTo(room, '|raw|<strong class="message-throttle-notice">Advertising detected, your message has not been sent and upper staff has been notified.' +
			'<br />Further attempts to advertise will result in being locked</strong>');
		connection.user.popup("Advertising detected, your message has not been sent and upper staff has been notified.\n" +
			"Further attempts to advertise will result in being locked");
		return false;
	}
	return message;
};
