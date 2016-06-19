/*
 * Chat log viewer plugin by jd
 */
'use strict';

const fs = require('fs');
const Autolinker = require('autolinker');
const MAX_LINES = 1000;

exports.commands = {
	viewlogs: function (target, room, user) {
		if (target) {
			let targets = target.split(',');
			for (let u in targets) targets[u] = targets[u].trim();
			if (!targets[1]) return this.errorReply("Please use /viewlogs with no target.");
			switch (toId(targets[0])) {
			case 'month':
				if (!targets[1]) return this.errorReply("Please use /viewlogs with no target.");
				if (!permissionCheck(user, targets[1])) return this.errorReply("/viewlogs - Access denied.");
				let months = fs.readdirSync('logs/chat/' + targets[1]);
				user.send("|popup||html|Choose a month:" + generateTable(months, "/viewlogs date," + targets[1] + ","));
				return;
			case 'date':
				if (!targets[2]) return this.errorReply("Please use /viewlogs with no target.");
				if (!permissionCheck(user, targets[1])) return this.errorReply("/viewlogs - Access denied.");
				let days = fs.readdirSync('logs/chat/' + targets[1] + '/' + targets[2]);
				user.send("|popup||html|Choose a date:" + generateTable(days, "/viewlogspopup " + targets[1] + ","));
				return;
			default:
				this.errorReply("/viewlogs - Command not recognized.");
				break;
			}
		}

		let rooms = fs.readdirSync('logs/chat');
		let roomList = [];

		for (let u in rooms) {
			if (!rooms[u]) continue;
			if (rooms[u] === 'README.md') continue;
			if (!permissionCheck(user, rooms[u])) continue;
			roomList.push(rooms[u]);
		}
		if (roomList.length < 1) return this.errorReply("You don't have access to view the logs of any rooms.");

		let output = "Choose a room to view the logs:";
		output += generateTable(roomList, "/viewlogs month,");
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

		fs.readFile('logs/chat/' + toId(targetRoom) + '/' + splitDate[0] + '-' + splitDate[1] + '/' + date + '.txt', 'utf8', (err, data) => {
			if (err && err.code === "ENOENT") return this.errorReply("No logs found.");
			if (err) return this.errorReply("/viewlogs - Error: " + err);
			fs.appendFile('logs/viewlogs.log', '[' + new Date().toUTCString() + '] ' + user.name + " viewed the logs of " + toId(targetRoom) + ". Date: " + date + '\n');
			let filename = require('crypto').randomBytes(4).toString('hex');

			if (!user.can('warn', null, Rooms(targetRoom))) {
				let lines = data.split('\n');
				for (let line in lines) {
					if (lines[line].substr(9).trim().charAt(0) === '(') lines.slice(line, 1);
				}
				data = lines.join('\n');
			}

			if (cmd === 'viewlogspopup') {
				let output = 'Displaying room logs of room "' + Tools.escapeHTML(targetRoom) + '" on ' + Tools.escapeHTML(date) + '<br />';
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
				console.log("/searchlogs error: " + error);
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
				output += '<font color="#970097">' + Tools.escapeHTML(file) + '</font><font color="#00AAAA">:</font><font color="#008700">' + lineNumber +
					'</font><font color="#00AAAA">:</font>' + message + '<br />';
			}
			user.send('|popup||wide||html|Displaying last ' + MAX_LINES + ' lines containing "' + Tools.escapeHTML(pattern) + '"' +
				(toId(targets[0]) === 'all' ? '' : ' in "' + Tools.escapeHTML(targets[0]) + '"') + ':<br /><br />' + output);
		});
	},
	searchlogshelp: ["/searchlogs [room / all], [phrase] - Phrase may contain * wildcards."],
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
	return true;
}

function generateTable(array, command) {
	let output = "<table>";
	let count = 0;
	for (let u in array) {
		if (array[u] === 'today.txt') continue;
		if (count === 0) output += "<tr>";
		output += '<td><button style="width: 100%" name="send" value="' + command + Tools.escapeHTML(array[u]) + '">' + Tools.escapeHTML(array[u]) + '</button></td>';
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

	switch (lineSplit[1]) {
	case 'c':
		let name = lineSplit[2];
		if (name === '~') break;
		let highlight = new RegExp("\\b" + toId(user) + "\\b", 'gi');
		let div = "chat";
		if (lineSplit.slice(3).join('|').match(highlight)) div = "chat highlighted";
		message = '<span class="' + div + '"><small>[' + timestamp + ']</small> ' + '<small>' + name.substr(0, 1) +
		'</small><b><font color="' + Gold.hashColor(name.substr(1)) + '">' + name.substr(1, name.length) + ':</font></b><em>' +
		parseFormatting(lineSplit.slice(3).join('|')) + '</em></span>';
		break;
	case 'uhtml':
		message = '<span class="notice">' + lineSplit.slice(3).join('|').trim() + '</span>';
		break;
	case 'raw':
	case 'html':
		message = '<span class="notice">' + lineSplit.slice(2).join('|').trim() + '</span>';
		break;
	case '':
		message = '<span class="notice">' + Tools.escapeHTML(lineSplit.slice(1).join('|')) + '</span>';
		break;
	case 'j':
	case 'J':
	case 'l':
	case 'L':
	case 'N':
	case 'unlink':
	case 'userstats':
	case 'tournament':
	case 'uhtmlchange':
		message = "";
		break;
	default:
		message = '<span class="notice">' + Tools.escapeHTML(message) + '</span>';
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
	message = Tools.escapeHTML(message).replace(/&#x2f;/g, '/');
	message = message.replace(/\_\_([^< ](?:[^<]*?[^< ])?)\_\_(?![^<]*?<\/a)/g, '<i>$1</i>'); // italics
	message = message.replace(/\*\*([^< ](?:[^<]*?[^< ])?)\*\*/g, '<b>$1</b>'); // bold
	message = message.replace(/\~\~([^< ](?:[^<]*?[^< ])?)\~\~/g, '<strike>$1</strike>'); // strikethrough
	message = message.replace(/&lt;&lt;([a-z0-9-]+)&gt;&gt;/g, '&laquo;<a href="/$1" target="_blank">$1</a>&raquo;'); // <<roomid>>
	message = Autolinker.link(message, {stripPrefix: false, phone: false, twitter: false});
	return message;
}
