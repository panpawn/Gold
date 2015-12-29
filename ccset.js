var fs = require('fs');
var selectors;
 
function writeIconCSS() {
        fs.appendFile('config/custom.css', selectors);
}
 
exports.commands = {
        ccset: function (target, room, user) {
		if (user.userid !== 'ashyudhajit') return this.errorReply('/ccset - PM Ashyudhajit to set your custom color.');
                var args = target.split(',');
                if (args.length < 2) return this.errorReply('/ccset [username], [color] - Sets an custom color to a user for all rooms.');
                var username = toId(args.shift());
                var image = 'color:' + args.shift().trim() + '';
                selectors = '\n\n' + '.chat.chatmessage-' + username +   '  strong';
                selectors += ' { \n' + '    ' + image +  ' !important;\n  }';
 
                this.privateModCommand("(" + user.name + " has set an custom color to " + username + ")");
                writeIconCSS();
        },
        setcchelp: ["/ccset [username], [color] - Sets an custom color to a user for all rooms."]
};
