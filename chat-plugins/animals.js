'use strict';

const http = require('http');
exports.commands = {
    animal: 'animals',
    animals: function(target, room, user) {
        let tarId = toId(target)
        let validTargets = {
            'cat': 'cat',
            'otter': 'otter',
            'dog': 'dog',
            'bunny': 'bunny',
            'pokemon': 'pokemon',
            'kitten': 'kitten',
            'puppy': 'puppy'
            
        };
        let validTarget = validTargets[tarId];
        if (room.id === 'lobby' && validTarget) return this.errorReply("This command cannot be broadcasted in the Lobby.");
        if (!validTarget || tarId === 'help') return this.parse('/help animals');
        let self = this;
        let reqOpt = {
            hostname: 'api.giphy.com',
            path: '/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=' + tarId,
            method: 'GET',
            
        };
        let req = http.request(reqOpt, function(res) {
            res.on('data', function(chunk) {
                try {
                    let data = JSON.parse(chunk);
                    let output = '<center><img src="' + data.data["image_url"] + '" width="400"></center>';
                    if (!self.runBroadcast()) return;
                    if (data.data["image_url"] === undefined) {
                        self.errorReply("ERROR: Command has crashed [No Images found]");
                        return room.update();
                        
                    } else {
                        self.sendReplyBox(output);
                        return room.update();
                        
                    }
                    
                } catch (e) {
                    self.errorReply("ERROR: Command has crashed [Memory Overloaded!]");
                    return room.update();
                    
                }
                
            });
            
        });
        req.end();
        
    },
    animalshelp: ['Animals Plugin by DarkNightSkies & Kyv.n(♥)' +
    '/animals cat - Displays a cat.' +
    '/animals kitten - Displays a kitten.' +
    '/animals dog - Displays a dog.' +
    '/animals puppy - Displays a puppy.' +
    '/animals bunny - Displays a bunny.' +
    '/animals otter - Displays an otter.' +
    '/animals pokemon - Displays a pokemon.' + 
    '/animals help - Displays this help box.'
    ],
    
};
