//Nightclub by SilverTactic (Siiilver) and panpawn
'use strict';

if (!global.nightclubs) global.nightclubs = {};
let nightclubs = global.nightclubs;

function getColor() {
	let color = '#';
	for (let i = 0; i < 6; i++) {
		color += 'ABCDE'[Math.floor(Math.random() * 5)];
	}
	return color;
}

function colorify(message) {
	let total = '';
	for (let i = 0; i < message.length; i++) {
		if (message[i] === ' ') {
			total += ' ';
			continue;
		}
		total += '<span style = "color: ' + getColor() + '">' + message[i] + '</span>';
	}
	return total;
}

function formatHTML(message) {
	let escapes = ['&amp;', '&lt;', '&gt;', '&gt;', '&quot;', '&apos;', '&#x2f;'];
	if (!message) return '';
	let total = '';
	for (let i = 0; i < message.length; i++) {
		if (message[i] === '&') {
			let sub = message.substr(i);
			let part = sub.substr(0, sub.indexOf(';') + 1);
			if (escapes.indexOf(part) > -1) {
				i += part.length - 1;
				total += '<span style = "color: ' + getColor() + '">' + part + '</span>';
				continue;
			}
		}
		if (message[i] === '<') {
			let sub = message.substr(i).match(/<(span|b|a|i|code|s)[^]+<\/(span|b|a|i|code|s)>/);
			if (sub) {
				if (/<(a|b|i|s)>/.test(sub[0].substr(0, 3))) {
					total += sub[0].substr(0, 3) + colorify(sub[0].substr(3, sub[0].length - 7)) + sub[0].substr(sub[0].length - 4);
				} else {
					total += sub[0];
				}
				i += sub[0].length - 1;
				continue;
			}
		}
		total += '<span style = "color: ' + getColor() + '">' + Chat.escapeHTML(message[i]) + '</span>';
	}
	return total;
}

function formatMessage(message) {
	message = message.replace(/\_\_([^ ](?:[^]*?[^ ])?)\_\_(?![^]*?<\/a)/g, '<i>$1</i>') //italics
		.replace(/\*\*([^ ](?:[^]*?[^ ])?)\*\*/g, '<b>$1</b>') //bold
		.replace(/\~\~([^ ](?:[^]*?[^ ])?)\~\~/g, '<s>$1</s>') //strikethrough
		.replace(/\`\`([^ ](?:[^]*?[^ ])?)\`\`/g, '<code>$1</code>') //code
		//urls
		.replace(/(https?\:\/\/[a-z0-9-.]+(\/([^\s]*[^\s?.,])?)?|[a-z0-9]([a-z0-9-\.]*[a-z0-9])?\.(com|org|net|edu|tk|us)((\/([^\s]*[^\s?.,])?)?|\b))/ig, '<a href="$1" target="_blank">$1</a>')
		.replace(/<a href="([a-z]*[^a-z:])/g, '<a href="http://$1')
		.replace(/(\bgoogle ?\[([^\]<]+)\])/ig, '<a href="http://www.google.com/search?ie=UTF-8&q=$2" target="_blank">$1</a>')
		.replace(/(\bgl ?\[([^\]<]+)\])/ig, '<a href="http://www.google.com/search?ie=UTF-8&btnI&q=$2" target="_blank">$1</a>')
		.replace(/(\bwiki ?\[([^\]<]+)\])/ig, '<a href="http://en.wikipedia.org/w/index.php?title=Special:Search&search=$2" target="_blank">$1</a>')
		.replace(/\[\[([^< ]([^<`]*?[^< ])?)\]\]/ig, '<a href="http://www.google.com/search?ie=UTF-8&btnI&q=$1" target="_blank">$1</a>')
		.replace(/spoiler:([^]+)/i, 'spoiler: <span class = "spoiler" style = "text-shadow: none;">$1</span>');
	return formatHTML(message);
}

function nightclubify(message) {
	let rank = '', rankIndex = (toId(message[0]) ? 0 : 1);
	if (rankIndex) rank = message[0];
	let user = message.substring(rankIndex, (~message.indexOf('|') ? message.indexOf('|') : message.length));
	if (!toId(user)) return '|c:|' + (~~(Date.now() / 1000)) + '|' + message;
	message = (~message.indexOf('|') ? message.substring(message.indexOf('|') + 1) : '');
	return '|raw|<div style = "font-size: 11pt; margin: -3px; padding: 1px; background: black; color: white; text-shadow: 0px 0px 10px, 0px 0px 10px, 0px 0px 10px;">' +
		'<small style = "color: white">' + rank + '</small>' +
		'<button name = "parseCommand" value = "/user ' + user + '" style = "outline: none; cursor: pointer; font-size: inherit; text-shadow: inherit; font-family: inherit; background: none; padding: 0px; border: none; display: inline-block; color: ' + Gold.hashColor(toId(user)) + ';"><b>' + user + ':</b></button>' +
		'<span style = "text-shadow: 0px 0px 10px, 0px 0px 10px;"> ' + formatMessage(Chat.escapeHTML(message)) + '</span></div>';
}

Rooms.Room.prototype.add = function (message) {
	if (typeof message !== 'string') throw new Error("Deprecated message type");
	this.logEntry(message);
	if (this.logTimes && message.substr(0, 3) === '|c|') {
		if (nightclubs[this.id]) {
			message = nightclubify(message.substr(3));
		} else {
			message = '|c:|' + (~~(Date.now() / 1000)) + '|' + message.substr(3);
		}
	} else if (nightclubs[this.id]) {
		let style = '|raw|<div style = "color: white; text-shadow: 0px 0px 6px, 0px 0px 6px; background: black; padding: 2px; margin: -3px,">';
		if (message.match(/^\|html\||^\|raw\|/m) && !message.match(/\|\~\|/m)) {
			message = style + message.replace(/^\|html\||^\|raw\|/m, '') + '</div>';
		} else if (!message.match(/^\|[a-z]+\|/) && !message.match(/^\|\|/)) {
			message = style + message + '</div>';
		}
	}
	this.log.push(message);
	return this;
};

Users.Connection.prototype.sendTo = function (roomid, data) {
	if (roomid && nightclubs[roomid.id]) {
		let style = '|html|<div style = "color: white; text-shadow: 0px 0px 6px, 0px 0px 6px; background: black; padding: 2px; margin: -3px">';
		if (data.match(/^\|html\||^\|raw\|/m) && !data.match(/\|\~\|/m)) {
			if (data.split('\n').length > 1) {
				style = '|html|<div style = "border: 5px solid black; margin: -3px">';
				let parts = data.split('\n');
				if (parts[parts.length - 1].match(/^\|html\||^\|raw\|/m)) parts[parts.length - 1] = style + parts[parts.length - 1].replace(/^\|html\||^\|raw\|/m, '') + '</div>';
				data = parts.join('\n');
			} else {
				data = style + data.replace(/^\|html\||^\|raw\|/m, '') + '</div>';
			}
		} else if (!data.match(/^\|[a-z]+\|/) && !data.match(/^\|\|/)) {
			data = style + data + '</div>';
		}
	}
	if (roomid && roomid.id) roomid = roomid.id;
	if (roomid && roomid !== 'lobby') data = '>' + roomid + '\n' + data;
	Sockets.socketSend(this.worker, this.socketid, data);
	Monitor.countNetworkUse(data.length);
};
let cmds = {
	'': function (target, room, user) {
		if (nightclubs[room.id]) return this.parse('/nightclub off');
		this.parse('/nightclub on');
	},
	on: function (target, room, user) {
		if (!this.can('declare', null, room)) return this.sendReply('You must be ranked % or higher to toggle this room\'s nightclub mode.');
		if (nightclubs[room.id]) return this.sendReply('This room\'s already in nightclub mode!');

		this.privateModCommand("(" + user.name + " has turned nightclub mode on in this room.)");
		nightclubs[room.id] = true;
		room.add('<center><b><span style = "font-size: 40px; text-shadow: 0px 0px 5px, 0px 0px 10px, 0px 0px 15px;">' + colorify('LET\'S GET FITZY! NIGHTCLUB MODE: ON!') + '</span></b></center>');
	},
	off: function (target, room, user) {
		if (!this.can('declare', null, room)) return this.sendReply('You must be ranked % or higher to toggle this room\'s nightclub mode.');
		if (!nightclubs[room.id]) return this.sendReply('This room isn\'t in nightclub mode yet...');

		this.privateModCommand("(" + user.name + " has turned nightclub mode off in this room.)");
		room.add('<center><b><span style = "font-size: 40px; text-shadow: 0px 0px 5px, 0px 0px 10px, 0px 0px 15px;">' + colorify('Sizzle down now... Nightclub mode: OFF!') + '</span></b></center>');
		delete nightclubs[room.id];
	},
};
exports.commands = {
	nc: 'nightclub',
	nightclub: cmds,
	dayclub: cmds.off,
};
