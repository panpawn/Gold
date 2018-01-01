/**
 * Room Log Viewer
 * Gold Server - http://gold.psim.us/
 *
 * Allows for staff and ROs to view logs of chat rooms.
 * Credits: jd
 *
 * @license MIT license
 */
'use strict';

const fs = require('fs');
const moment = require('moment');
const Autolinker = require('autolinker');
const MAX_LINES = 1000;

exports.commands = {
	viewlogs: function (target, room, user) {
		if (target) {
			let targets = target.split(',');
			for (let u in targets) targets[u] = targets[u].trim();
			if (!targets[1]) return this.errorReply("Please use /viewlogs with no target.");
			let back = '';
			switch (toId(targets[0])) {
			case 'month':
				if (!targets[1]) return this.errorReply("Please use /viewlogs with no target.");
				if (!permissionCheck(user, targets[1])) return this.errorReply("/viewlogs - Access denied.");
				let months = fs.readdirSync('logs/chat/' + targets[1]);
				back = '<button class="button" name="send" value="/viewlogs">Back</button> | ';
				user.send("|popup||html|" + back + "Choose a month:" + generateTable(months, "/viewlogs date," + targets[1] + ","));
				return;
			case 'date':
				if (!targets[2]) return this.errorReply("Please use /viewlogs with no target.");
				if (!permissionCheck(user, targets[1])) return this.errorReply("/viewlogs - Access denied.");
				let days = fs.readdirSync('logs/chat/' + targets[1] + '/' + targets[2]);
				back = '<button class="button" name="send" value="/viewlogs month,' + targets[1] + '">Back</button> | ';
				user.send("|popup||html|" + back + "Choose a date:" + generateTable(days, "/viewlogspopup " + targets[1] + ","));
				return;
			default:
				this.errorReply("/viewlogs - Command not recognized.");
				break;
			}
		}

		let rooms = fs.readdirSync('logs/chat');
		let roomList = [], groupChats = [], chatRooms = [];

		for (let u in rooms) {
			if (!rooms[u]) continue;
			if (rooms[u] === 'README.md') continue;
			if (!permissionCheck(user, rooms[u])) continue;
			if (rooms[u].substr(0, 9) === 'groupchat') {
				groupChats.push(rooms[u]);
			} else if (Rooms(rooms[u])) {
				chatRooms.push(rooms[u]);
			} else {
				roomList.push(rooms[u]);
			}
		}
		if (roomList.length + groupChats.length + chatRooms.length < 1) return this.errorReply("You don't have access to view the logs of any rooms.");

		let output = "Choose a room to view the logs:<br />";
		let official = [];
		let unofficial = [];
		let hidden = [];
		let secret = [];
		chatRooms.forEach(roomid => {
			let tarRoom = Rooms(roomid);
			if (!tarRoom) return;
			if (tarRoom.isOfficial) {
				official.push(tarRoom.title);
			} else if (tarRoom.isPrivate && tarRoom.isPrivate === 'hidden') {
				if (user.can('pban')) hidden.push(tarRoom.title);
			} else if (tarRoom.isPrivate === true) {
				if (user.can('pban')) secret.push(tarRoom.title);
			} else {
				unofficial.push(tarRoom.title);
			}
		});
		if (official.length >= 1) output += roomHeader('Official Chatrooms:') + generateTable(official, '/viewlogs month,', true);
		if (unofficial.length >= 1) output += roomHeader('Unofficial Chatrooms:') + generateTable(unofficial, '/viewlogs month,', true);
		if (hidden.length >= 1) output += roomHeader('Hidden Chatrooms:') + generateTable(hidden, '/viewlogs month,', true);
		if (secret.length >= 1) output += roomHeader('Secret Chatrooms:') + generateTable(secret, '/viewlogs month,', true);
		if (roomList.length >= 1) output += '<details><summary>' + roomHeader('Rooms formerly on the server:') + '</summary>' + generateTable(roomList, '/viewlogs month,', true) + '</details>';
		if (groupChats.length >= 1) output += '<details><summary>' + roomHeader('All Group chats:') + '</summary>' + generateTable(groupChats, '/viewlogs month,') + '</details>';
		user.send("|popup||wide||html|" + output);
	},

	viewlogspopup: 'viewlogs2',
	viewlogs2: function (target, room, user, connection, cmd) {
		if (!target) return this.sendReply("Usage: /viewlogs [room], [year-month-day / 2014-12-08] - Provides you with a temporary link to view the target rooms chat logs.");
		let targetSplit = target.split(',');
		if (!targetSplit[1]) return this.sendReply("Usage: /viewlogs [room], [year-month-day / 2014-12-08] -Provides you with a temporary link to view the target rooms chat logs.");
		for (let u in targetSplit) targetSplit[u] = targetSplit[u].trim();
		let targetRoom = targetSplit[0];
		if (!permissionCheck(user, targetRoom)) return this.errorReply("/viewlogs - Access denied.");
		let date;
		if (toId(targetSplit[1]) === 'today' || toId(targetSplit[1]) === 'yesterday') {
			date = new Date();
			if (toId(targetSplit[1]) === 'yesterday') date.setDate(date.getDate() - 1);
			targetSplit[1] = date.format('{yyyy}-{MM}-{dd}');
		}
		date = targetSplit[1].replace(/\.txt/, '');
		let splitDate = date.split('-');
		if (splitDate.length < 3) return this.sendReply("Usage: /viewlogs [room], [year-month-day / 2014-12-08] -Provides you with a temporary link to view the target rooms chat logs.");

		fs.readFile('logs/chat/' + targetRoom.toLowerCase() + '/' + splitDate[0] + '-' + splitDate[1] + '/' + date + '.txt', 'utf8', (err, data) => {
			if (err && err.code === "ENOENT") return user.send("|popup||html|<font color=\"red\">No logs found.</font>");
			if (err) return this.errorReply("/viewlogs - Error: " + err);
			fs.appendFileSync('logs/viewlogs.log', '[' + new Date().toUTCString() + '] ' + user.name + " viewed the logs of " + toId(targetRoom) + ". Date: " + date + '\n');
			let filename = require('crypto').randomBytes(4).toString('hex');

			if (!user.can('warn', null, Rooms(targetRoom))) {
				let lines = data.split('\n');
				for (let line in lines) {
					if (lines[line].substr(9).trim().charAt(0) === '(') lines.slice(line, 1);
				}
				data = lines.join('\n');
			}

			if (cmd === 'viewlogspopup') {
				let back = '<button class="button" name="send" value="/viewlogs date,' + targetRoom + ',' + date.substr(0, 7) + '">Back</button> | ';
				let output = back + 'Displaying room logs of room "' + Chat.escapeHTML(targetRoom) + '" on ' + Chat.escapeHTML(date) + '<br />';
				data = data.split('\n');
				for (let u in data) {
					if (data[u].length < 1) continue;
					let message = parseMessage(data[u], user.userid);
					if (message.length < 1) continue;
					output += message + '<br />';
				}
				return user.send("|popup||wide||html|" + output);
			}

			data = targetRoom + "|" + date + "|" + fs.readFileSync('config/customcolors.json', 'utf8') + "\n" + data;

			fs.writeFile('static/logs/' + filename, data, err => {
				if (err) return this.errorReply("/viewlogs - " + err);
				this.sendReply(
					"|raw|You can view the logs at <a href=\"http://goldservers.info:" + Config.port +
					"/logs/logviewer.html?file=" + filename + "\">http://goldservers.info:" + Config.port +
					"/logs/logviewer.html?file=" + filename + "</a>"
				);
				setTimeout(function () {
					fs.unlink('static/logs/' + filename);
				}, 1 * 1000 * 60);
			});
		});
	},

	logsearch: 'searchlogs',
	searchlogs: function (target, room, user) {
		if (!target) return this.parse('/help searchlogs');
		let targets = target.split(',');
		for (let u in targets) targets[u] = targets[u].trim();
		if (!targets[1]) return this.errorReply("Please specify a phrase to search.");

		if (toId(targets[0]) === 'all' && !this.can('hotpatch')) return false;
		if (!Rooms(targets[0]) && !this.can('hotpatch') || !this.can('mute', null, Rooms(targets[0]))) return false;

		let pattern = escapeRegExp(targets[1]).replace(/\\\*/g, '.*');
		let command = 'grep -Rnw \'./logs/chat/' + (toId(targets[0]) === 'all' ? '' : toId(targets[0])) + '\' -e "' + pattern + '"';

		require('child_process').exec(command, function (error, stdout, stderr) {
			if (error && stderr) {
				user.popup("/searchlogs doesn't support Windows.");
				return false;
			}
			if (!stdout) return user.popup('Could not find any logs containing "' + pattern + '".');
			let output = '';
			stdout = stdout.split('\n');
			for (let i = 0; i < stdout.length; i++) {
				if (stdout[i].length < 1 || i > MAX_LINES) continue;
				let file = stdout[i].substr(0, stdout[i].indexOf(':'));
				let lineNumber = stdout[i].split(':')[1];
				let line = stdout[i].split(':');
				line.splice(0, 2);
				line = line.join(':');
				let message = parseMessage(line, user.userid);
				if (message.length < 1) continue;
				output += '<font color="#970097">' + Chat.escapeHTML(file) + '</font><font color="#00AAAA">:</font><font color="#008700">' + lineNumber +
					'</font><font color="#00AAAA">:</font>' + message + '<br />';
			}
			user.send('|popup||wide||html|Displaying last ' + MAX_LINES + ' lines containing "' + Chat.escapeHTML(pattern) + '"' +
				(toId(targets[0]) === 'all' ? '' : ' in "' + Chat.escapeHTML(targets[0]) + '"') + ':<br /><br />' + output);
		});
	},
	searchlogshelp: ["/searchlogs [room / all], [phrase] - Phrase may contain * wildcards."],

	roomlog: 'roomlogs',
	roomlogs: function (target, room, user) {
		if (!this.can('lock')) return false;
		if (!room || room.id === 'global') return this.errorReply("You must be in a room to use this command.");
		if (room.battle) return this.errorReply("This room's logs are not saved.");
		let tarRoom = room;
		if (target) {
			if (Rooms.search(target)) {
				tarRoom = Rooms.search(target);
			} else {
				return this.errorReply(`Room "${target}" not found - check spelling?`);
			}
		}
		const today = `<button class="button" name="send" value="/viewlogspopup ${tarRoom.id},${moment().format('YYYY-MM-DD')}.txt">${tarRoom} roomlog for today</button>`;
		const past = `<button class="button" name="send" value="/viewlogs month,${(tarRoom.isPrimal ? tarRoom.title : tarRoom)}">past</button>`;
		return this.sendReplyBox(`${today} | ${past}`);
	},
	roomlogshelp: ["/roomlogs [room] - Shows buttons to view the chatroom logs of [room]."],
};

function permissionCheck(user, room) {
	if (!Rooms(room) && !user.can('seniorstaff')) {
		return false;
	}
	if (!user.can('lock') && !user.can('warn', null, Rooms(room))) {
		return false;
	}
	if (Rooms(room) && Rooms(room).isPrivate && (!user.can('seniorstaff') && !user.can('warn', null, Rooms(room)))) {
		return false;
	}
	if (Rooms(room) && Rooms(room).isPersonal && (!user.can('seniorstaff') && !user.can('warn', null, Rooms(room)))) {
		return false;
	}
	return true;
}
Gold.viewlogsPermissionCheck = permissionCheck;

function generateTable(array, command, isRoom) {
	let output = '';
	output += "<table>";
	let count = 0;
	for (let u in array) {
		if (array[u] === 'today.txt') continue;
		if (count === 0) output += "<tr>";
		let cmdText = array[u];
		if (isRoom) cmdText = toId(array[u]);
		output += '<td><button class="button" style="width:100%" name="send" value="' + command + Chat.escapeHTML(cmdText) + '">' + Chat.escapeHTML(array[u].replace('.txt', '')) + '</button></td>';
		count++;
		if (count > 3) {
			output += '<tr />';
			count = 0;
		}
	}
	output += '</table>';
	return output;
}

function escapeRegExp(s) {
	return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function parseMessage(message, user) {
	let timestamp = message.substr(0, 9).trim();
	message = message.substr(9).trim();
	let lineSplit = message.split('|');
	let highlight = new RegExp("\\b" + toId(user) + "\\b", 'gi');
	let div = "chat", name = '';

	switch (lineSplit[1]) {
	case 'c':
		name = lineSplit[2];
		if (name === '~') break;
		if (lineSplit.slice(3).join('|').startsWith('/log ')) {
			message = '<span class="notice">' + lineSplit.slice(3).join('|').trim().replace('/log ', '') + '</span>';
			break;
		}
		if (lineSplit.slice(3).join('|').match(highlight)) div = "chat highlighted";
		message = '<span class="' + div + '"><small>[' + timestamp + ']</small> ' + '<small>' + name.substr(0, 1) +
		'</small><strong class="username" style="color:' + Gold.hashColor(name.substr(1)) + '">' + name.substr(1, name.length) + ':</strong> <em>' +
		parseFormatting(lineSplit.slice(3).join('|')) + '</em></span>';
		break;
	case 'c:':
		name = lineSplit[3];
		if (name === '~') break;
		if (lineSplit.slice(4).join('|').match(highlight)) div = "chat highlighted";
		message = '<span class="' + div + '"><small>[' + timestamp + ']</small> ' + '<small>' + name.substr(0, 1) +
		'</small><strong class="username" style="color:' + Gold.hashColor(name.substr(1)) + '">' + name.substr(1, name.length) + ':</strong> <em>' +
		parseFormatting(lineSplit.slice(4).join('|')) + '</em></span>';
		break;
	case 'uhtml':
		message = '<span class="notice">' + lineSplit.slice(3).join('|').trim() + '</span>';
		break;
	case 'raw':
	case 'html':
		message = '<span class="notice">' + lineSplit.slice(2).join('|').trim() + '</span>';
		break;
	case '':
		message = '<span class="notice">' + Chat.escapeHTML(lineSplit.slice(1).join('|')) + '</span>';
		break;
	case 'j':
	case 'J':
	case 'l':
	case 'L':
	case 'n':
	case 'N':
	case 'unlink':
	case 'userstats':
	case 'tournament':
	case 'uhtmlchange':
		message = "";
		break;
	default:
		message = '<span class="notice">' + Chat.escapeHTML(message) + '</span>';
		break;
	}
	return message;
}

function parseFormatting(message) {
	if (message.substr(0, 5) === "/html") {
		message = message.substr(5);
		message = message.replace(/\_\_([^< ](?:[^<]*?[^< ])?)\_\_(?![^<]*?<\/a)/g, '<i>$1</i>'); // italics
		message = message.replace(/\*\*([^< ](?:[^<]*?[^< ])?)\*\*/g, '<b>$1</b>'); // bold
		message = message.replace(/\~\~([^< ](?:[^<]*?[^< ])?)\~\~/g, '<strike>$1</strike>'); // strikethrough
		message = message.replace(/&lt;&lt;([a-z0-9-]+)&gt;&gt;/g, '&laquo;<a href="/$1" target="_blank">$1</a>&raquo;'); // <<roomid>>
		message = Autolinker.link(message.replace(/&#x2f;/g, '/'), {stripPrefix: false, phone: false, twitter: false});
		return message;
	}
	message = Chat.escapeHTML(message).replace(/&#x2f;/g, '/');
	message = message.replace(/\_\_([^< ](?:[^<]*?[^< ])?)\_\_(?![^<]*?<\/a)/g, '<i>$1</i>'); // italics
	message = message.replace(/\*\*([^< ](?:[^<]*?[^< ])?)\*\*/g, '<b>$1</b>'); // bold
	message = message.replace(/\~\~([^< ](?:[^<]*?[^< ])?)\~\~/g, '<strike>$1</strike>'); // strikethrough
	message = message.replace(/&lt;&lt;([a-z0-9-]+)&gt;&gt;/g, '&laquo;<a href="/$1" target="_blank">$1</a>&raquo;'); // <<roomid>>
	message = Autolinker.link(message, {stripPrefix: false, phone: false, twitter: false});
	return message;
}

function roomHeader(message) {
	return `<strong><u>${message}</u></strong><br />`;
}
