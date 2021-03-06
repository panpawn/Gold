'use strict';

const ROOM_NAME = "Shadow Ban Room";
let room = Rooms.get(toID(ROOM_NAME));

if (!room) {
	Rooms.global.addChatRoom(ROOM_NAME);
	room = Rooms.get(toID(ROOM_NAME));

	room.isPrivate = true;
	room.staffRoom = true;
	room.staffAutojoin = true;
	room.addedUsers = {};

	if (room.chatRoomData) {
		room.chatRoomData.isPrivate = true;
		room.chatRoomData.staffRoom = true;
		room.chatRoomData.staffAutojoin = true;
		room.chatRoomData.addedUsers = room.addedUsers;

		Rooms.global.writeChatRoomData();
	}
}
if (Object.keys(room.addedUsers).length > 0) {
	setImmediate(function () {
		room.add("||Loaded user list: " + Object.keys(room.addedUsers).sort().join(", "));
		room.update();
	});
}
exports.room = room;

function getAllAlts(user) {
	let targets = {};
	if (typeof user === 'string') {
		targets[toID(user)] = 1;
	} else {
		user.getAlts().concat(user.name).forEach(function (altName) {
			let alt = Users.get(altName);
			if (!alt.named) return;

			targets[toID(alt)] = 1;
			Object.keys(alt.prevNames).forEach(function (name) {
				targets[toID(name)] = 1;
			});
		});
	}
	return targets;
}

function intersectAndExclude(a, b) {
	let intersection = [];
	let exclusionA = [];
	let exclusionB = [];

	let ai = 0;
	let bi = 0;
	while (ai < a.length && bi < b.length) {
		let difference = a[ai].localeCompare(b[bi]);
		if (difference < 0) {
			exclusionA.push(a[ai]);
			++ai;
		} else if (difference > 0) {
			exclusionB.push(b[bi]);
			++bi;
		} else {
			intersection.push(a[ai]);
			++ai;
			++bi;
		}
	}

	Array.prototype.push.apply(exclusionA, a.slice(ai));
	Array.prototype.push.apply(exclusionB, b.slice(bi));
	return {intersection: intersection, exclusionA: exclusionA, exclusionB: exclusionB};
}

let checkBannedCache = {};
exports.checkBanned = function (user) {
	let userId = toID(user);
	if (userId in checkBannedCache) return checkBannedCache[userId];
	//console.log("Shadow ban cache miss:", userId);

	let targets = Object.keys(getAllAlts(user)).sort();
	let bannedUsers = Object.keys(room.addedUsers).sort();

	let matches = intersectAndExclude(targets, bannedUsers);
	let isBanned = matches.intersection.length !== 0;
	for (let t = 0; t < targets.length; ++t) {
		if (isBanned) room.addedUsers[targets[t]] = 1;
		checkBannedCache[targets[t]] = isBanned;
	}
	if (!isBanned) return false;

	if (matches.exclusionA.length > 0) {
		Rooms.global.writeChatRoomData();
		room.add("||Alts of " + matches.intersection[0] + " automatically added: " + matches.exclusionA.join(", "));
	}

	return true;
};

let addUser = exports.addUser = function (user, force) {
	if (force) {
		const u = toID(user);
		if (room.addedUsers[u]) return false;
		room.addedUsers[u] = 1;
		room.add(`||Added user: ${u}`).update();
		Rooms.global.writeChatRoomData();
	}

	let targets = getAllAlts(user);
	for (let u in targets) {
		if (room.addedUsers[u]) {
			delete targets[u];
		} else {
			room.addedUsers[u] = 1;
		}
		checkBannedCache[u] = true;
	}
	targets = Object.keys(targets).sort();

	if (targets.length > 0) {
		Rooms.global.writeChatRoomData();
		room.add("||Added users: " + targets.join(", ")).update();
	}

	return targets;
};
let removeUser = exports.removeUser = function (user) {
	let targets = getAllAlts(user);
	for (let u in targets) {
		if (!room.addedUsers[u]) {
			delete targets[u];
		} else {
			delete room.addedUsers[u];
		}
		checkBannedCache[u] = false;
	}
	targets = Object.keys(targets).sort();

	if (targets.length > 0) {
		Rooms.global.writeChatRoomData();
		room.add("||Removed users: " + targets.join(", "));
		room.update();
	}

	return targets;
};

exports.addMessage = function (user, tag, message) {
	room.add('|c|' + user.getIdentity() + '|__(' + tag + ')__ ' + message);
	room.update();
};
exports.addEmoticonMessage = function (user, message) {
	room.add(message);
	room.update();
};

exports.commands = {
	spam: 'shadowban',
	sban: 'shadowban',
	shadowban: function (target, room, user) {
		if (!target) return this.sendReply("/shadowban OR /sban [username], [secondary command], [reason] - Sends all the user's messages to the shadow ban room.");

		let params = this.splitTarget(target).split(',');
		let reason = params.slice(1).join(',').trim();

		if (!this.targetUser) return this.sendReply("User '" + this.targetUsername + "' not found.");
		if (!this.can('lock', this.targetUser)) return;

		let targets = addUser(this.targetUser);
		if (targets.length === 0) {
			return this.sendReply('||' + this.targetUsername + " is already shadow banned or isn't named.");
		}
		this.privateModCommand("(" + user.name + " has shadow banned: " + targets.join(", ") + (reason ? " (" + reason + ")" : "") + ")");
	},

	unspam: 'unshadowban',
	unsban: 'unshadowban',
	unshadowban: function (target, room, user) {
		if (!target) return this.sendReply("/unshadowban OR /unsban [username] - Undoes /shadowban (except the secondary command).");
		this.splitTarget(target);

		if (!this.can('lock')) return;

		let targets = removeUser(this.targetUser || this.targetUsername);
		if (targets.length === 0) {
			return this.sendReply('||' + this.targetUsername + " is not shadow banned.");
		}
		this.privateModCommand("(" + user.name + " has shadow unbanned: " + targets.join(", ") + ")");
	},

	sbanlist: function (target, room, user) {
		if (!this.can('lock')) return false;
		if ((user.locked || room.isMuted(user)) && !user.can('bypassall')) return this.sendReply("You cannot do this while unable to talk.");
		let keys = Object.keys(Rooms('shadowbanroom').addedUsers);
		if (keys.length < 1) return this.errorReply("There are currently no shadow banned users at this time.");

		Users.get(toID(user.name)).send('|popup||wide| Here is a list of sbanned users: \n' + keys.join(', '));
	},
};

Users.ShadowBan = exports;
