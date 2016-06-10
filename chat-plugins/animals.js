'use strict';

/**********************************
 *********Animals Plugin***********
 **********************************
 *********Coding by Kyvn***********
 ********Assistance by DNS*********
 **********************************
 ****Gives you a random animal*****
 ***Based on your input I guess****
 *********************************/


const http = require('http');

exports.commands = {
    animal: 'animals',
    animals: function(target, room, user) {
        if (!target) this.parse('/help animals')
        let tarId = toId(target);
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
        if (room.id === 'lobby' && this.broadcasting) return this.errorReply("This command cannot be broadcasted in the Lobby.");
        if (!validTarget || tarId === 'help') return this.parse('/help animals');
        let self = this;
        let reqOpt = {
            hostname: 'api.giphy.com', // Do not change this
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
                        self.errorReply("ERROR CODE 404: No images found!");
                        return room.update();
                        
                    } else {
                        self.sendReplyBox(output);
                        return room.update();
                        
                    }
                    
                } catch (e) {
                    self.errorReply("ERROR CODE 503: Giphy is unavaliable right now. Try again later.");
                    return room.update();
                    
                }
                
            });
            
        });
        req.end();
        
    },
    animalshelp: ['|raw|<div class="infobox"><strong>Animals Plugin by DarkNightSkies & Kyv.n(♥)</strong><br><br>' +
    '/animals cat - Displays a cat.<br>' +
    '/animals kitten - Displays a kitten.<br>' +
    '/animals dog - Displays a dog.<br>' +
    '/animals puppy - Displays a puppy.<br>' +
    '/animals bunny - Displays a bunny.<br>' +
    '/animals otter - Displays an otter.<br>' +
    '/animals pokemon - Displays a pokemon.<br>' +
    '/animals help - Displays this help box.</div>'
    ],
    
};
