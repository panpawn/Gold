//Music box by SilverTactic (Siiilver)
'use strict';

const fs = require('fs');
const http = require('http');

const FILE = 'config/musicbox.json';
try {
	Gold.musicboxes = JSON.parse(fs.readFileSync(FILE));
} catch (err) {
	fs.writeFileSync(FILE, '{}');
	Gold.musicboxes = JSON.parse(fs.readFileSync(FILE));
}
let musicboxes = Gold.musicboxes;

Gold.createMusicBox = function (user) {
	if (typeof musicboxes[user.userid] === 'object') return;
	let box = musicboxes[user.userid] = {};
	box.songs = [];
	fs.writeFileSync(FILE, JSON.stringify(musicboxes, null, 1));
	return true;
};

function validate(link) {
	link = link.trim();
	if (!link.match(/^https?:\/\//i)) {
		link = 'https://' + link;
	} else if (link.match(/^http:\/\//i)) {
		link = link.replace(/^http:\/\//i, 'https://');
	}
	return new Promise(function (resolve, reject) {
		let options = {
			host: 'www.youtube.com',
			port: 80,
			path: '/oembed?url=' + encodeURIComponent(link) + '&format=json',
		};

		http.get(options, res => {
			let data = '';
			res.on('data', chunk => {
				data += chunk;
			}).on('end', () => {
				if (data.charAt(0) !== '{') {
					reject('The Youtube link "' + link + '" is either unavailable or doesn\'t exist. Please choose another link.');
				} else {
					resolve({'title': JSON.parse(data).title.trim(), 'link': link});
				}
			});
		});
	});
}

exports.commands = {
	mb: 'musicbox',
	musicbox: function (target, room, user, connection, cmd) {
		let cmds = {'help':1, 'add':1, 'remove':1, 'css':1, 'removeall':1, 'delete':1};
		if (target && toId(target.split(' ')[0]) in cmds) {
			if (typeof musicboxes[user.userid] !== 'object') return this.errorReply("You do not own a music box. Buy one from the shop.");
			let cmdIndex = target.indexOf(' '), command;
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
					let box = musicboxes[user.userid];
					if (box.songs.length >= 8) return this.sendReply("You currently have 8 songs in your music box. You can't add any more.");
					if (~box.songs.map(function (data) { return data.link; }).indexOf(song.link)) return this.sendReply('|html|You already have the song "<b>' + song.title + '</b>" in your music box.');

					box.songs.push(song);
					this.sendReply('|html|The song "<b>' + song.title + '</b>" has been successfully added to your music box.');
					fs.writeFileSync(FILE, JSON.stringify(musicboxes, null, 1));
				}.bind(this)).catch(function (err) {
					this.errorReply(err);
				}.bind(this));
				break;

			case 'remove':
				if (!musicboxes[user.userid].songs.length) return this.errorReply('You don\'t have any songs in your music box.');
				if (!target || !target.trim()) return this.parse("/" + cmd + " help");
				let boxx = musicboxes[user.userid];
				target = target.trim();

				let match;
				if (!isNaN(target)) {
					target = Number(target);
					if (target < 1) return this.errorReply('A song number cannot be less than 1.');
					if (target > boxx.songs.length) return this.errorReply('You can\'t delete song number ' + target + ', since that\'s more than the number of songs you have (' + boxx.songs.length + ').');
					match = boxx.songs[target - 1];
					boxx.songs.splice(target - 1, 1);
					fs.writeFileSync(FILE, JSON.stringify(musicboxes, null, 1));
					return this.sendReply('|html|The song "<b>' + match.title + '</b>" has been successfully removed from your music box.');
				}
				for (let i = 0; i < boxx.songs.length; i++) {
					if (boxx.songs[i].title === target || ~boxx.songs[i].link === target) {
						match = boxx.songs[i];
						boxx.songs.splice(i--, 1);
					}
				}
				if (!match) return this.sendReply('|html|The song "<b>' + target + '</b>" isn\'t there in your music box...');
				fs.writeFileSync(FILE, JSON.stringify(musicboxes, null, 1));
				this.sendReply('|html|The song "<b>' + match.title + '</b>" has been successfully removed from your music box.');
				break;

			case 'css':
				let box2 = musicboxes[user.userid];
				if (!target || !target.trim()) {
					if (!this.runBroadcast()) return;
					if (toId(box2.css)) return this.sendReplyBox("Your music box css: <code>" + box2.css + "</code>");
					return this.sendReplyBox("You haven't set button css for your music box yet.");
				}
				if (toId(target) in {'remove':1, 'delete':1, 'none':1, 'hidden':1}) {
					delete box2.css;
				} else {
					box2.css = Chat.escapeHTML(target.replace(/^["']/, '').replace(/["']$/, ''));
				}
				fs.writeFileSync(FILE, JSON.stringify(musicboxes, null, 1));
				this.parse('/musicbox');
				this.sendReply('Your music box\'s button CSS has been updated.');
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
				this.sendReply("You have successfully removed all songs in your music box.");
				break;

			case 'delete':
				if (!this.can('pban')) return false;
				let targetUser = Users.getExact(target) ? Users.getExact(target).name : target;
				let box3 = musicboxes[toId(targetUser)];
				if (!box3) return this.sendReply(targetUser + " doesn't have a music box...");

				delete musicboxes[toId(targetUser)];
				fs.writeFileSync(FILE, JSON.stringify(musicboxes, null, 1));
				this.sendReply("You have successfully deleted " + targetUser + "'s music box.");
				break;
			}
		} else {
			if (!this.runBroadcast()) return;
			if (target.length > 18) return this.sendReply("The username \"" + target + "\" is too long.");
			let targetUserr;
			if (!toId(target)) {
				targetUserr = user.name;
			} else {
				targetUserr = Users.getExact(target) ? Users.getExact(target).name : target;
			}
			let box4 = musicboxes[toId(targetUserr)];
			if (!box4) return this.sendReplyBox(targetUserr + " doesn't have a music box...");
			if (!box4.songs.length) return this.sendReplyBox(targetUserr + "'s music box is empty...");

			let total = [];
			box4.songs.forEach(function (song) {
				total.push('<a href = "' + song.link + '"><button style = "margin: 1px; ' + (box4.css || '') + '">' + song.title + '</button></a>');
			});
			this.sendReplyBox(targetUserr + "'s music box:<br> " + total.join('<br>'));
		}
	},
};
