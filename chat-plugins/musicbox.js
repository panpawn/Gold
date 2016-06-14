//Music box by SilverTactic (Siiilver)
const fs = require('fs');
const request = require('request');

const FILE = 'config/musicbox.json';
try {
	Gold.musicboxes = JSON.parse(fs.readFileSync(FILE));
} catch (err) {
	fs.writeFileSync(FILE, '{}');
	Gold.musicboxes = JSON.parse(fs.readFileSync(FILE));
}
var musicboxes = Gold.musicboxes;

Gold.createMusicBox = function (user) {
	if (typeof musicboxes[user.userid] === 'object') return;
	var box = musicboxes[user.userid] = {};
	box.songs = [];
	fs.writeFileSync(FILE, JSON.stringify(musicboxes, null, 1));
	return true;
}

function validate (link) {
	link = link.trim();
	var data = 'http://www.youtube.com/oembed?url=' + link + '&format=json';
	if (!link.match(/^https?:\/\//i)) link = 'https://' + link;
	else if (link.match(/^http:\/\//i)) link = link.replace(/^http:\/\//i, 'https://');
	return new Promise (function (resolve, reject) {
		request(data, function (err, response, details) {
			if (err || response.statusCode !== 200) reject('The Youtube link "' + link + '" is either unavailable or doesn\'t exist. Please choose another link.');
			else resolve({'title': JSON.parse(details).title.trim(), 'link': link});
		});
	});
}

exports.commands = {
	mb: 'musicbox',
	musicbox: function (target, room, user, connection, cmd) {
		var cmds = {'help':1, 'add':1, 'remove':1, 'css':1, 'removeall':1, 'delete':1};
		if (target && toId(target.split(' ')[0]) in cmds) {
			if (typeof musicboxes[user.userid] !== 'object') return this.errorReply("You do not own a music box. Buy one from the shop.");
			var cmdIndex = target.indexOf(' '), command;
			if (cmdIndex > -1) {
				command = target.substr(0, cmdIndex);
				target = target.substr(cmdIndex + 1);
			} else {
				command = target;
				target = '';
			}

			switch (toId(command)) {
				case 'help':
					if (!this.runBroadcast()) return;
					this.sendReplyBox('<b>Music Box Commands:</b><br><br><ul>' +
						'<li>/' + cmd + ' <em>User</em> - View\'s a user\'s music box.<br>' +
						'<li>/' + cmd + ' add <em>Youtube link</em> - Adds a song into your music box.<br>' +
						'<li>/' + cmd + ' remove <em>Youtube link/Song title/Song list number</em> - Removes a song from your music box.<br>' +
						'<li>/' + cmd + ' removeall - Removes all songs from your music box.<br>' +
						'<li>/' + cmd + ' css <em>CSS code</em> - Edits the CSS of your music box\'s buttons.<br>' +
						'<li>/' + cmd + ' delete <em>User</em> - Deletes a user\'s music box. Requires ~.</ul>'
					);
					break;

				case 'add':
					if (!target || !target.trim()) return this.parse('/' + cmd + ' help');
					validate(target).then(function (song) {
						if (typeof musicboxes[user.userid] !== 'object') return this.errorReply("You do not own a music box. Buy one from the shop.");
						var box = musicboxes[user.userid];
						if (box.songs.length >= 8) return this.sendReply("You currently have 8 songs in your music box. You can't add any more.");
						if (~box.songs.map(function (data) { return data.link }).indexOf(song.link)) return this.sendReply('|html|You already have the song "<b>' + song.title + '</b>" in your music box.');

						box.songs.push(song);
						this.sendReply('|html|The song "<b>' + song.title + '</b>" has been successfully added to your music box.');
						fs.writeFileSync(FILE, JSON.stringify(musicboxes, null, 1));
					}.bind(this)).catch (function (err) {
						this.errorReply(Tools.escapeHTML(err));
					}.bind(this));
					break;

				case 'remove':
					if (!musicboxes[user.userid].songs.length) return this.errorReply('You don\'t have any songs in your music box.');
					if (!target || !target.trim()) return this.parse("/" + cmd + " help");
					var box = musicboxes[user.userid];
					target = target.trim();

					var match;
					if (!isNaN(target)) {
						target = Number(target);
						if (target < 1) return this.errorReply('A song number cannot be less than 1.');
						if (target > box.songs.length) return this.errorReply('You can\'t delete song number ' + target + ', since that\'s more than the number of songs you have (' + box.songs.length + ').');
						match = box.songs[target - 1];
						box.songs.splice(target - 1, 1);
						fs.writeFileSync(FILE, JSON.stringify(musicboxes, null, 1));
						return this.sendReply('|html|The song "<b>' + match.title + '</b>" has been successfully removed from your music box.');
					}
					for (var i = 0; i < box.songs.length; i++) {
						if (box.songs[i].title === target || ~box.songs[i].link === target) {
							match = box.songs[i];
							box.songs.splice(i--, 1);
						}
					}
					if (!match) return this.sendReply('|html|The song "<b>' + target + '</b>" isn\'t there in your music box...');
					fs.writeFileSync(FILE, JSON.stringify(musicboxes, null, 1));
					return this.sendReply('|html|The song "<b>' + match.title + '</b>" has been successfully removed from your music box.');
					break;

				case 'css':
					var box = musicboxes[user.userid];
					if (!target || !target.trim()) {
						if (!this.runBroadcast()) return;
						if (toId(box.css)) return this.sendReplyBox("Your music box css: <code>" + box.css + "</code>");
						return this.sendReplyBox("You haven't set button css for your music box yet.");
					}
					if (toId(target) in {'remove':1, 'delete':1, 'none':1, 'hidden':1}) delete box.css;
					else box.css = Tools.escapeHTML(target.replace(/^["']/, '').replace(/["']$/, ''));
					fs.writeFileSync(FILE, JSON.stringify(musicboxes, null, 1));
					this.parse('/musicbox');
					return this.sendReply('Your music box\'s button CSS has been updated.');
					break;

				case 'removeall':
					if (!musicboxes[user.userid].songs.length) return this.sendReply("You don't have any songs in your music box.");
					if (!user.confirm) {
						user.confirm = true;
						return this.sendReply("WARNING: You are about to remove all of the songs in your music box. Use this command again if you're sure you want to do this.");
					}
					delete user.confirm;
					musicboxes[user.userid].songs = [];
					fs.writeFileSync(FILE, JSON.stringify(musicboxes, null, 1));
					return this.sendReply("You have successfully removed all songs in your music box.");
					break;

				case 'delete':
					if (!this.can('pban')) return false;
					var targetUser = Users.getExact(target) ? Users.getExact(target).name : target;
					var box = musicboxes[toId(targetUser)];
					if (!box) return this.sendReply(targetUser + " doesn't have a music box...");

					delete musicboxes[toId(targetUser)];
					fs.writeFileSync(FILE, JSON.stringify(musicboxes, null, 1));
					return this.sendReply("You have successfully deleted " + targetUser + "'s music box.");
					break;
			}
		} else {
			if (!this.runBroadcast()) return;
			if (target.length > 18) return this.sendReply("The username \"" + target + "\" is too long.");
			var targetUser;
			if (!toId(target)) targetUser = user.name;
			else targetUser = Users.getExact(target) ? Users.getExact(target).name : target;
			var box = musicboxes[toId(targetUser)];
			if (!box) return this.sendReplyBox(targetUser + " doesn't have a music box...");
			if (!box.songs.length) return this.sendReplyBox(targetUser + "'s music box is empty...");

			var total = [];
			box.songs.forEach(function (song) {
				total.push('<a href = "' + song.link + '"><button style = "margin: 1px; ' + (box.css || '') + '">' + song.title + '</button></a>');
			});
			this.sendReplyBox(targetUser + "'s music box:<br> " + total.join('<br>'));
		}
	}
}
