/* Room shop system (economy)
 * This plugin gives each room that is allowed,
 * a custom shop for their room.  Room founders
 * can customize what items they want to be in
 * their shops.  Only certain rooms can have
 * their own shops.
 * by: panpawn and Siiilver
 */

// OBJECT STRUCTURE:
// { 'roomid': { 'item1id': ['item1name', 'item1desc', 'item1price'], 'item2id': ['item2name', 'item2desc', 'item2price'] } }

'use strict';

const fs = require('fs');

const ITEM_CAP = 8; // maximum items a room shop can have
const PATH = 'config/roomshops.json';
const RoomShop = require('../' + PATH);

function saveShop() {
	fs.writeFileSync(PATH, JSON.stringify(RoomShop));
}

function getName(user) {
	return '<font color="' + Gold.hashColor(user) + '">' + Chat.escapeHTML(user) + '</font>';
}

function getRoomShop(room) {
	let output = "<center><b><u>" + Chat.escapeHTML(room.title) + " Room Shop</u></b><br />" +
	'<table border="1" cellspacing ="0" cellpadding="3">' +
	'<tr><th>Item</th><th>Description</th><th>Price</th></tr>';
	for (let i in RoomShop[room.id]) {
		let item = RoomShop[room.id][i];
		let name = item[0], desc = item[1], price = item[2];
		output += '<tr><td><button name="send" value="/roomshop buy, ' + Chat.escapeHTML(name) + '">' + Chat.escapeHTML(name) + '</button></td><td>' +
		Chat.escapeHTML(desc) + '</td><td>' + price + '</td></tr>';
	}
	return output + '</table><font size=1>Note: As per server rules, global staff are not responsible for scams via a room shop.  However, if severe enough, report it to a global staff and if there was a rule broken, action will be taken.</font></center>';
}

exports.commands = {
	roomshop: function (target, room, user, connection, cmd, message) {
		if (!room.founder) return this.errorReply("This room is not designed to have a room shop.");
		if (!room.isOfficial && !Users.usergroups[room.founder]) return this.errorReply("This room does not qualify to have a room shop.");
		if (!target || !target.trim()) {
			if (!RoomShop[room.id] || Object.keys(RoomShop[room.id]).length < 1) return this.errorReply("This room does not have any items in it's room shop at this time.");
			if (!this.runBroadcast()) return;
			return this.sendReplyBox(getRoomShop(room));
		}

		target = target.split(',');
		for (let u in target) target[u] = target[u].trim();
		if (!RoomShop[room.id]) RoomShop[room.id] = {};
		let RS = RoomShop[room.id];
		let item, desc, price, itemName;
		switch (toId(target[0])) {
		case 'add':
			if (user.userid !== room.founder && !this.can('declare') && room.isPrivate) return false;
			if (RS.length > ITEM_CAP) return this.errorReply("You have reached the item cap of " + ITEM_CAP + " and cannot add any more items.");
			item = target[1];
			desc = target[2];
			price = target[3];
			if (!item || !desc || !price) return this.sendReply("Usage: /roomshop add, [item], [description], [price] - Adds an item to the roomshop.");
			if (item.lenth > 15) return this.errorReply("Item names cannot exceed 15 characters.");
			if (desc.length > 200) return this.errorReply("Item descriptions cannot exceed 200 characters.");
			if (isNaN(price) || price < 1 || ~price.indexOf('.') || price > 1000) return this.errorReply("The item's price must be a positive integer, and cannot exceed 1000.");
			RS[toId(item)] = [item, desc, Number(price)];
			saveShop();
			this.sendReply("You have successfully added the item '" + item + "' to your room shop.");
			break;
		case 'remove':
			if ((user.userid !== room.founder) && !this.can('declare')) return false;
			if (!target[1]) return this.sendReply("Usage: /roomshop remove, [item] - Removes an item from the roomshop.");
			item = toId(target[1]);
			if (!RS[item]) return this.errorReply("'" + target[1] + "' is not an item in the room shop. Check spelling?");
			itemName = RS[item][0];
			delete RoomShop[room.id][item];
			saveShop();
			this.sendReply("You have successfully removed the item '" + itemName + "' from the room's shop.");
			break;
		case 'buy':
			if (room.founder === user.userid) return this.errorReply("You can't buy from your own room shop.");
			item = toId(target[1]);
			if (!item) return this.errorReply("Usage: /roomshop buy, [item] - Buys an item from the room's room shop.");
			if (!RS[item]) return this.errorReply("This item is not in the room shop. Check spelling?");
			item = RS[item][0];
			price = RS[toId(item)][2];
			if (Gold.readMoney(user.userid) < price) return this.errorReply("You do not have enough bucks to buy " + item + ". You need " + (price - Gold.readMoney(user.userid)) + " more bucks to buy this item.");
			this.parse('/tb ' + room.founder + ', ' + price);
			room.add("|raw|<b><u>Room Shop</u>: " + getName(user.name) + "</b> has bought a(n) <u>" + Chat.escapeHTML(item) + "</u> from the room shop for " + price + " buck" + (price > 1 ? "s" : "") + ".").update();
			this.privateModCommand("(" + user.name + " has bought a(n) " + item + " from the room shop.)");
			break;
		case 'help':
			this.parse('/help roomshop');
			break;
		default:
			let check = /add|remove|buy/, correction = '';
			if (check.test(toId(target[0]))) {
				let test = toId(target[0]).match(check);
				correction = '\n(Did you mean: "' + message.replace(test, test + ',') + '")';
			}
			this.sendReply("'" + target[0] + "' is not a valid roomshop command. Valid roomshop commands include: add, remove, buy" + correction);
		}
	},
	roomshophelp: ["This plugin allows certain rooms to have their own room shop.  Commands include...",
		"/roomshop add, [item], [description], [price] - Adds an item to the roomshop.  Requires Room Founder.",
		"/roomshop remove, [item] - Removes an item from the roomshop. Requires Room Founder.",
		"/roomshop buy, [item] - Buys an item from the shop.",
		"/roomshop - Displays a room's room shop.",
	],
};
