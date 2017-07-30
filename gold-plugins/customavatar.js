/**
 * Custom Avatar Script
 * Gold Server - http://gold.psim.us/
 *
 * Deals with the handling of custom avatars.
 * Credits: kota, panpawn
 *
 * @license MIT license
 */
'use strict';

const fs = require('fs');

function reloadCustomAvatars() {
	let path = require('path');
	let newCustomAvatars = {};
	fs.readdirSync('./config/avatars').forEach(function (file) {
		let ext = path.extname(file);
		if (ext !== '.png' && ext !== '.gif') return;

		let user = toId(path.basename(file, ext));
		newCustomAvatars[user] = file;
		delete Config.customavatars[user];
	});

	// Make sure the manually entered avatars exist
	for (let a in Config.customavatars) {
		if (typeof Config.customavatars[a] === 'number') {
			newCustomAvatars[a] = Config.customavatars[a];
		} else {
			fs.exists('./config/avatars/' + Config.customavatars[a], function (user, file, isExists) {
				if (isExists) Config.customavatars[user] = file;
			}.bind(null, a, Config.customavatars[a]));
		}
	}

	Config.customavatars = newCustomAvatars;
}
reloadCustomAvatars();
Gold.readAvatars = reloadCustomAvatars;

if (Config.watchConfig) {
	fs.watchFile('./config/config.js', function (curr, prev) {
		if (curr.mtime <= prev.mtime) return;
		reloadCustomAvatars();
	});
}

const script = function () {
/*
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
*/
}.toString().match(/[^]*\/\*([^]*)\*\//)[1];

let pendingAdds = {};

exports.commands = {
	sca: 'customavatar',
	customavatars: 'customavatar',
	customavatar: function (target, room, user) {
		let globalUpper = user.can('pban');
		let vipUser = function (targetUser) {
			if (!targetUser) targetUser = user.userid;
			if (Gold.hasVip(user.userid) && targetUser === user.userid) {
				return true;
			}
			return false;
		};

		let parts = target.split(',');
		let cmd = parts[0].trim().toLowerCase();

		if (cmd in {'':1, show:1, view:1, display:1}) {
			let message = "";
			for (let a in Config.customavatars) {
				message += "<strong>" + Chat.escapeHTML(a) + ":</strong> " + Chat.escapeHTML(Config.customavatars[a]) + "<br />";
			}
			return this.sendReplyBox(message);
		}

		switch (cmd) {
		case 'set':
			let userid = toId(parts[1]);
			let targetUser = Users.getExact(userid);

			let avatar = parts.slice(2).join(',').trim();
			if (!globalUpper && !vipUser(userid)) return false;

			if (!userid) return this.sendReply("You didn't specify a user.");
			if (Config.customavatars[userid]) return this.errorReply(userid + " already has a custom avatar.");

			let hash2 = require('crypto').createHash('sha512').update(userid + '\u0000' + avatar).digest('hex').slice(0, 8);
			pendingAdds[hash2] = {userid: userid, avatar: avatar};
			parts[1] = hash2;

			if (!targetUser) {
				this.errorReply("Warning: " + userid + " is not online.");
				this.errorReply("If you want to continue, use: /customavatar forceset, " + hash2);
				return;
			}

		case 'forceset': // eslint-disable-line no-fallthrough
			if (user.avatarCooldown && !globalUpper) {
				let milliseconds = (Date.now() - user.avatarCooldown);
				let seconds = ((milliseconds / 1000) % 60);
				let remainingTime = Math.round(seconds - (5 * 60));
				if (((Date.now() - user.avatarCooldown) <= 5 * 60 * 1000)) return this.sendReply("You must wait " + (remainingTime - remainingTime * 2) + " seconds before setting another avatar.");
			}
			user.avatarCooldown = Date.now();

			let hash = parts[1].trim();
			if (!pendingAdds[hash]) return this.sendReply("Invalid hash.");

			let userid2 = pendingAdds[hash].userid;
			let avatar2 = pendingAdds[hash].avatar;
			delete pendingAdds[hash];

			require('child_process').execFile('bash', ['-c', script, '-', avatar2, './config/avatars/' + userid2], function (e, out, err) {
				if (e) {
					this.sendReply(userid2 + "'s custom avatar failed to be set. Script output:");
					(out + err).split('\n').forEach(this.sendReply.bind(this));
					return;
				}

				reloadCustomAvatars();

				let targetUser = Users.getExact(userid2);
				if (targetUser) targetUser.avatar = Config.customavatars[userid2];

				this.sendReply(userid2 + "'s custom avatar has been set.");

				const staff = Rooms('staff');
				if (staff) staff.add('|raw|' + Gold.nameColor(userid2, true) + ' has received a custom avatar from ' + Gold.nameColor(user.name, true)).update();
				if (Users(userid2)) Users(userid2).popup('|modal||html|<font color="red"><strong>ATTENTION!</strong></font><br /> You have received a custom avatar from <b><font color="' + Gold.hashColor(user.userid) + '">' + Chat.escapeHTML(user.name) + '</font></b>: <img src="' + avatar2 + '" width="80" height="80">');
			}.bind(this));
			break;

		case 'remove':
		case 'delete':
			let targetUserid = toId(parts[1]);
			if (!globalUpper && !vipUser(targetUserid)) return false;
			if (!Config.customavatars[targetUserid]) return this.errorReply(targetUserid + " does not have a custom avatar.");

			if (Config.customavatars[targetUserid].toString().split('.').slice(0, -1).join('.') !== targetUserid) {
				return this.errorReply(targetUserid + "'s custom avatar (" + Config.customavatars[targetUserid] + ") cannot be removed with this script.");
			}

			if (Users.getExact(targetUserid)) Users.getExact(targetUserid).avatar = 1;

			fs.unlink('./config/avatars/' + Config.customavatars[targetUserid], function (e) {
				if (e) return this.errorReply(targetUserid + "'s custom avatar (" + Config.customavatars[targetUserid] + ") could not be removed: " + e.toString());

				delete Config.customavatars[targetUserid];
				this.sendReply(targetUserid + "'s custom avatar removed successfully");
			}.bind(this));
			break;

		case 'reload':
			if (!globalUpper) return false;
			reloadCustomAvatars();
			for (let leUsers of Users.users) {
				leUsers = leUsers[1];
				if (Config.customavatars[leUsers]) Users(leUsers).avatar = Config.customavatars[leUsers];
			}
			this.privateModCommand("(" + user.name + " has reloaded all custom avatars.)");
			break;

		default:
			return this.parse("/help customavatar");
		}
	},
	customavatarhelp: ["/customavatar [set/delete], [user], [link] - Sets or deletes a users custom avatar.  Requires VIP, &, ~",
		"/customavatar reload - Reloads all current set custom avatars on the server. Requires ~"],
};
