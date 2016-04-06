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

var fs = require('fs');

const ITEM_CAP = 8; // maximum items a room shop can have
var PATH = 'config/roomshops.json';
var RoomShop = require('../' + PATH);

function saveShop() {
	fs.writeFileSync(PATH, JSON.stringify(RoomShop));
}

function getName(user) {
	return '<font color="' + Gold.hashColor(user) + '">' + Tools.escapeHTML(user) + '</font>';
}

function getRoomShop (room) {
	var output = "<center><b><u>" + room.title + " Room Shop</u></b><br />" +
	    '<table border="1" cellspacing ="0" cellpadding="3">' +
	    '<tr><th>Item</th><th>Description</th><th>Price</th></tr>';
	for (var i in RoomShop[room.id]) {
	    var item = RoomShop[room.id][i];
	    var name = item[0], desc = item[1], price = item[2];
		output += '<tr><td><button name="send" value="/roomshop buy, ' + name + '">' + name + '</button></td><td>' + desc + '</td><td>' + price + '</td></tr>';
	}
	return output + '</table><font size=1>Note: As per server rules, global staff are not responsible for scams via a room shop.  However, if severe enough, report it to a global staff and if there was a rule broken, action will be taken.</font></center>';
}

exports.commands = {
	roomshop: function(target, room, user, connection, cmd, message) {
		if (!room.founder || room.isOfficial) return this.errorReply("This room is not designed to have a room shop.");
		if (!target || !target.trim()) {
			if (!RoomShop[room.id] || Object.keys(RoomShop[room.id]).length < 1) return this.errorReply("This room does not have any items in it's room shop at this time.");
			if (!this.runBroadcast()) return;
			return this.sendReplyBox(getRoomShop(room));
		}

		target = target.split(',');
		for (var u in target) target[u] = target[u].trim();
		if (!RoomShop[room.id]) RoomShop[room.id] = {};
		var RS = RoomShop[room.id];
		switch (toId(target[0])) {
			case 'add':
				if ((user.userid !== room.founder) && !this.can('declare')) return false;
				if (RS.length > ITEM_CAP) return this.errorReply("You have reached the item cap of " + ITEM_CAP + " and cannot add any more items.");
				var item = target[1], desc = target[2], price = target[3];
				if (!item || !desc || !price) return this.sendReply("Usage: /roomshop add, [item], [description], [price] - Adds an item to the roomshop.");
				if (item.lenth > 15) return this.errorReply("Item names cannot exceed 15 characters.");
				if (desc.length > 200) return this.errorReply("Item descriptions cannot exceed 200 characters.");
				if (isNaN(price) || price < 1 || ~price.indexOf('.') || price > 1000) return this.errorReply("The item's price must be a positive integer, and cannot exceed 1000.");
				RS[toId(item)] = [item, desc, Number(price)];
				saveShop();
				return this.sendReply("You have successfully added the item '" + item + "' to your room shop.");
				break;
			case 'remove':
				if ((user.userid !== room.founder) && !this.can('declare')) return false;
				if (!target[1]) return this.sendReply("Usage: /roomshop remove, [item] - Removes an item from the roomshop.");
				var item = toId(target[1]);
				if (!RS[item]) return this.errorReply("'" + target[1] + "' is not an item in the room shop. Check spelling?");
				var itemName = RS[item][0];
				delete RoomShop[room.id][item];
				saveShop();
				return this.sendReply("You have successfully removed the item '" + itemName + "' from the room's shop.");
				break;
			case 'buy':
				var item = toId(target[1]);
				if (!item) return this.errorReply("Usage: /roomshop buy, [item] - Buys an item from the room's room shop.");
				if (!RS[item]) return this.errorReply("This item is not in the room shop. Check spelling?");
				item = RS[item][0];
				var price = RS[item][2];
				if (economy.readMoney(user.userid) < price) return this.errorReply("You do not have enough bucks to buy " + item + ". You need " + (price - economy.readMoney(user.userid)) + " more bucks to buy this item.");
				this.parse('/tb ' + room.founder + ', ' + price);
				room.add("|raw|<b><u>Room Shop</u>: " + getName(user.name) + "</b> has bought a(n) <u>" + Tools.escapeHTML(item) + "</u> from the room shop for " + price + " buck" + (price > 1 ? "s" : "") + ".").update();
				this.privateModCommand("(" + user.name + " has bought a(n) " + item + " from the room shop.)");
				break;
			case 'help':
				this.parse('/help roomshop');
				break;
			default: 
				var check = /add|remove|buy/, correction = '';
				if (check.test(toId(target[0]))) {
					var test = toId(target[0]).match(check);
					correction = '\n(Did you mean: "' + message.replace(test, test + ',') + '")';
				}
				this.sendReply("'" + target[0] + "' is not a valid roomshop command. Valid roomshop commands include: add, remove, buy" + correction)
		}
	},
	roomshophelp: ["This plugin allows certain rooms to have their own room shop.  Commands include...",
		"/roomshop add, [item], [description], [price] - Adds an item to the roomshop.  Requires Room Founder.",
		"/roomshop remove, [item] - Removes an item from the roomshop. Requires Room Founder.",
		"/roomshop buy, [item] - Buys an item from the shop.",
		"/roomshop - Displays a room's room shop."
	]
};
