/*
* FOR ALL NEW TRAINER-CARDS USE THE /TC COMMAND ON THE SERVER
*/

exports.commands = {
    jonthebastard: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><font color="1752A6" size="8">Jon The Bastard</font><br />' +
            '<img src="http://i.imgur.com/LHKlie8.jpg" width="500"><br />' +
            '<font color="1752A6">"They call me Snow cause Im one cold motherfucker</center>');
    },

    lando:  function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center target="_blank"><br />' + 
          '<marquee behavior="slide" direction="down" scrollamount="10">' +
          '<img src="http://images.cooltext.com/4239380.png" height="115" target="_blank"></marquee>' + 
          '<br target="_blank">' + 
          '<img src="http://images.cooltext.com/4239387.png" target="_blank">' + 
          '<img src="http://play.pokemonshowdown.com/sprites/xyani/landorus-therian.gif" target="_blank">' +
          '<img src="http://play.pokemonshowdown.com/sprites/xyani/landorus.gif" target="_blank">' +
          '<img src="http://images.cooltext.com/4239397.png" target="_blank">' +
          '<img src="http://play.pokemonshowdown.com/sprites/xyani/sharpedo-mega.gif" target="_blank">' +
          '<img src="http://play.pokemonshowdown.com/sprites/xyani/houndoom-mega.gif" target="_blank">' +
          '<img src="http://play.pokemonshowdown.com/sprites/xyani/sableye-mega.gif" target="_blank">' +
          '<br target="_blank"><b target="_blank">Ace:</b> Randorosu' +
          '<br target="_blank"><b target="_blank">Monotype Specialty:</b> GrounDark' +
          '<br target="_blank">"Friends are what the heart needs all the time, even if some more than others.' +
          '<button type="button">Click for leh internet hearts! :D</button></center>');
     },
   
    beno: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://fc06.deviantart.net/fs29/f/2008/092/4/c/NOT_MY_MUDKIP_by_joeywaii.jpg" width="250">' +
            '<img src="http://images.fanpop.com/images/image_uploads/Mudkip-mudkip-marshtomp-and-swampert-432906_461_421.jpg" width="250" height="240""><br />' +
            '<b>Ace: </b>That sad moment when life gave you lemons but you\'re to lazy to make the lemonade.<br />' +
            '<button name="send" value="/transferbucks elitefourbeno, 5">Donate 5 bucks for a cookie</button></center>');
    },

    sand2: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/0dwzNX7.gif"><br />' +
            '<img src="http://media.giphy.com/media/FvtOorPNV09Og/giphy.gif" width="270" height="200">' +
            '<img src="http://media.giphy.com/media/O7UKZP7lMuZm8/giphy.gif" width="270" height="200"><br />' +
            'I don\'t like it, the dark circles under my eyes will come back and I don\'t know how to deal with the dark circles</center>');
    },

    jlp: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/cmacyYX.gif" width="300">' +
            '<img src="http://i.imgur.com/J0B59PM.gif" height="200"><br />' +
            '<img src="http://i.imgur.com/u5Wd4Uf.gif"></center>');
    },

    nollid: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/0dwzNX7.gif"><br />' +
            '<img src="http://25.media.tumblr.com/f58fe4414fc7e71aa3e97b1da0d06c9b/tumblr_mf3kcgAp2k1r3ifxzo1_500.gif" width="260" height="200">' +
            '<img src="http://media.tumblr.com/50996a160cc5d34905ff35da5821d323/tumblr_inline_n5jcpzJd4p1suiunx.gif" width="260" height="200"><br />' +
            'Thumbtacks in my shoes would stick into my feet whenever I tried to walk. It would hurt. I don\'t think I could deal with that really.</center>');
    },

    tesarand: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><b><font size="6" color="purple">Tesarand</b></font><br />' +
            '<img src="http://www.bonappetit.com/wp-content/uploads/2013/03/james-deen-646.jpg" height="200" width="300"><br />' +
            '<b>Ace: Dragonite<br />' +
            '"It tastes like glitter.... Rad.”</b><br></center>');
    },

    shrew: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/0dwzNX7.gif"><br />' +
            '<img src="http://i.imgur.com/tMGx5fT.gif" width="280" height="200"><br />' +
            '<img src="http://media.giphy.com/media/BPmdagBjYS6sM/giphy.gif" width="280" height="200"><br />' +
            'I bet dead people are easier to get along with.</center>');
    },

    dildo: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/KpRmFDT.gif"><br />' +
            '<img src="http://i.imgur.com/4FwBKa4.gif" width="270">' +
            '<img src="http://i.imgur.com/JG2UXZd.gif" width="270"><br />' +
            'The doors only open one way. They open inward.</center>');
    },

    cap: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox(
            "An introduction to the Create-A-Pokemon project:<br />" +
            "- <a href=\"https://www.smogon.com/cap/\">CAP project website and description</a><br />" +
            "- <a href=\"https://www.smogon.com/forums/showthread.php?t=48782\">What Pokemon have been made?</a><br />" +
            "- <a href=\"https://www.smogon.com/forums/forums/311\">Talk about the metagame here</a><br />" +
            "- <a href=\"https://www.smogon.com/forums/threads/3512318/#post-5594694\">Sample XY CAP teams</a>"
        );
    },

    hrey: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/RSOIh2j.gif"><br />' +
            '<img src="http://i.imgur.com/EsfjH9A.gif"><br />' +
            'if we legalize pot, METH and THE MOLLYS will be legalized shortly after #420NO</center>');
    },

    shrewed: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/3scS0w5.gif"><br />' +
            '<img src="http://i.imgur.com/TS5dYjU.gif" width="270" height="160">' +
            '<img src="http://i.imgur.com/Dp5P3Bu.gif" width="270" height="160"><br />' +
            'There are stars and planets floating around me. I don\'t think I can handle astronomy right now.</center>');
    },

    fork: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/HrDUGmr.png" width="75" height="100">');
    },

    dillon: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/PNy1HEf.gif"><br />' +
            '<img src="http://media.tumblr.com/tumblr_lz1xhpgIcY1qbnaro.gif" width="270">' +
            '<img src="http://img4.wikia.nocookie.net/__cb20130826213452/powerlisting/images/3/3a/Shadow_Dragon%27s_Roar.gif" width="270"><br />' +
            'The loneliest people are the kindest. The saddest people smile the brightest. The most damaged people are the wisest. All because they don\'t wish to see anyone else suffer the way they did.</center>');
    },

    supersonic: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://img3.wikia.nocookie.net/__cb20120528125001/sonic/images/f/fc/Hyper_sonic.gif"><br />' +
            'Gotta go fast much?</center>');
    },

    terlor: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/EEcZ4J2.png" width="350"><br />' +
            '<img src="http://i.imgur.com/bjVsAsj.png"><br />' +
            '"Honor is in the heart, not the name." - Yasuo</center>');
    },

    saago: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/v3wWa5Z.jpg"><br />' +
            'Everything you\'ve ever wanted is on the other side of fear.</center>');
    },

    sexykricketune: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/VPcZ1rC.png"><br />' +
            '<img src="https://fbcdn-sphotos-h-a.akamaihd.net/hphotos-ak-xpa1/v/t34.0-12/10537833_1479515712290994_1126670309_n.jpg?oh=52eb7d293765697c3c9e0a6ee235dd7d&oe=53BD3B02&__gda__=1404931411_57a9e1bbf14ec5949be27acfae62bf5f" width="500"><br />' +
            'What, were you expecting something?</center>');
    },

    shikuthezorua: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://th01.deviantart.net/fs70/150/i/2013/147/5/1/zorua_by_andreehxd-d66umkw.png"><br />' +
            'I may be cute, but I could make you fall off a cliff without anyone seeing it.</center>');
    },

    stone: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="https://i.imgur.com/DPy0OdR.gif" width="500"><br />' +
            '<img src="http://pldh.net/media/pokemon/gen6/xy-animated-shiny/376.gif"><br />' +
            '<b><font color="gold">Ace: Metagross</b></font><br />' +
            '<font color="gold">The secret to winning is to open your heart to pokemon and connect them to show how much you love your pokemon. Forcing them to attack every single time makes them lose energy & lose trust in you. So loving your pokemon and treating it well</font></center>');
    },

    dsuc: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><b><Font color="#FF0000">D</Font><Font color="#FF6000">e</Font><Font color="#FFC000">m</Font><Font color="#FFff00">o</Font><Font color="#9Fff00">n</Font><Font color="#3Fff00">i</Font><Font color="#00ff00">c</Font> ' +
            '<Font color="#00ffC0">S</Font><Font color="#00ffff">u</Font><Font color="#00C0ff">c</Font><Font color="#0060ff">c</Font><Font color="#0000ff">u</Font><Font color="#3F00ff">b</Font><Font color="#9F00ff">u</Font><Font color="#FF00ff">s</Font></b><br />' +
            '<img src="http://fc06.deviantart.net/fs70/i/2011/139/d/1/dcp_succubus_class_by_black_cat_mew-d3gqhbi.png" width="150"><br />' +
            'Won\'t you be my pet?');
    },

    jacktr: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/X8Qshnz.gif"><br />' +
            'With my bare hands I took back my life, now I\'ll take yours');
    },

    buttofthetitantank: 'titantank',
    titantank: function(target, room, user) {
        if (!this.canBroadcast()) return;
        return this.sendReplyBox('<center><font size=5><font color="#4D177D"> buttofTheTitanTank </font></font></center>' +
            '<center><img src=http://i.imgur.com/D0z9KQo.png ></center>' +
            '<right><img src=http://i.imgur.com/2K4ZgVG.jpg width=300 height=210></right> <left> <font size=4><font color="#000000"> Ace: Cuz Sweg</font></left>');
    },
    goal: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://cdn.bulbagarden.net/upload/thumb/4/47/181Ampharos.png/250px-181Ampharos.png">' +
            '<img src="http://lucien0maverick.files.wordpress.com/2014/05/tails-prower.png" width="200"><br />' +
            'The Ultimate Team Combo</center>');
    },

    tailz: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/qO72kmo.png"><br />' +
            '<img src="http://37.media.tumblr.com/cc5c32483f12ae8866fda48d084f3861/tumblr_mww5peDTd71qkwzzdo1_400.gif"><br />' +
            '<i>Play Time Is Ogre</i>');
    },

    silver: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://img3.wikia.nocookie.net/__cb20091211143347/sonic/images/thumb/5/5d/Super_silver_final.png/150px-Super_silver_final.png"><br />' +
            '<img src="http://img1.wikia.nocookie.net/__cb20111024112339/sonic/images/thumb/3/34/Sonic_Channel_-_Silver_The_Hedgehog_2011.png/120px-Sonic_Channel_-_Silver_The_Hedgehog_2011.png"><br />' +
            'Ace: Its no use!<br />');
    },

    gene: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/NO1PFB2.png"><br />' +
            '<img src="http://static2.wikia.nocookie.net/__cb20131130005232/bleedmancomics/images/6/66/Klefki_XY.gif"><br />' +
            '<b><font color="red">Ace:</b> Monopoly</font><br />' +
            '<font color="purple"> Romanticism is the expression of man\'s urge to rise above reason and common sense, just as rationalism is the expression of his urge to rise above theology and ion. Riot\'s suck, I love noodles.</font></center>');
    },

    hag: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://fc06.deviantart.net/fs70/f/2014/243/b/f/godzilla_vs_smaug_by_rumper1-d7xeyzt.png" width=500 height=500><br />' +
            'What my battles are like</center>');
    },

    wrath: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/csloC44.gif"><br />' +
            '<img src="http://i.imgur.com/GS0kfMW.png"><br />' +
            'No being an asshat. Asshats will face the Wrath of Espurr.</center>');
    },

    windy: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/CwmuZVJ.png"><br />' +
            '<img src="http://i.imgur.com/qOMMI3O.gif"><br />' +
            'Show Your Victory!</center>');
    },

    coolasian: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/HbZN3Jm.png"><br />' +
            '<img src="http://i.imgur.com/PxPKnUs.jpg"><br />' +
            'Scavenge. Slay. Survive.</center>');
    },

    aphrodisia: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/7SAR6FI.png"><br />' +
            '<img src="http://img2.wikia.nocookie.net/__cb20140319085812/pokemon/images/7/72/Pikachu_XY.gif"><br />' +
            'Ace: Crumbster<br />' +
            '<font color=yellow> <b>If you want to find the secrets of the universe, think in terms of energy, frequency and vibration.</b></font></center>');
    },

    solox: 'solstice',
    equinox: 'solstice',
    solstice: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/Tbgfl9Y.gif">' +
            '<img src="http://i.imgur.com/5dBIhwe.png"><br />' +
            '<img src="http://i.imgur.com/6m3XOcg.png"><br />' +
            'All of us will die at some point.<br />' +
            'I just don\'t give a damn about it.</center>');
    },

    typhozzz: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://th08.deviantart.net/fs70/PRE/i/2011/111/e/5/typhlosion_by_sharkjaw-d3ehtqh.jpg" height="100" width="100">' +
            '<img src="http://i.imgur.com/eDS32pU.gif">' +
            '<img src="http://i.imgur.com/UTfUkBW.png"><br />' +
            '<b>Ace: <font color="red"> Typhlosion</font></b><br />' +
            'There ain\'t a soul or a person or thing that can stop me :]</center>');
    },

    cyllage: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/AUTOlch.png"><br />' +
            '<img src="http://i.imgur.com/Pyev2QI.jpg"><br />' +
            '<img src="http://i.imgur.com/02Y8dAA.png"><br />' +
            'Ace: Volcarona<br />' +
            'Catch phrase: Kindness is a virtue that should be expressed by everyone.</center>');
    },

    	jdsmellsfunny: 'panpawn',
	pan: 'panpawn',
	panpawn: function (target, room, user) {
		if (room.id !== 'lobby') if (!this.canBroadcast()) return;
		this.sendReplyBox('<table bgcolor="#BC13FE" width="100%"><td><center><img src="http://i.imgur.com/xzfPeaL.gif"><br />' +
			'<img src="http://i.imgur.com/PqEJXSK.png"><br />' +
			'<img src="http://frostserver.net:8000/avatars/panpawn.png?dateline=1419293614"> <br />' +
			'<font color="black"><br />Ace:</font> <font color="red">C<font color="orange">y<font color="red">n<font color="orange">d<font color="red">a<font color="orange">q<font color="red">u<font color="orange">i<font color="red">l</font><br />' +
			'"Don\'t touch me while I\'m sleeping."</table></center>'
		);	
	},

    mrbug: 'bug',
    bug: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><font size="5" color="darkgreen">Mr. Bug</font><br />' +
            '<img src="http://media.pocketmonsters.net/characters/2127.png" width="40%" align="left">' +
            '<img src="https://1-media-cdn.foolz.us/ffuuka/board/vp/thumb/1379/30/1379304844529s.jpg" width="40%" align="right"><br />' +
            '<img src="http://fc01.deviantart.net/fs70/i/2011/341/9/8/kricketot_by_nami_tsuki-d4if7lr.png" width="35%"><br />' +
            '"delelele woooooop"<br />' +
            'Ace: kriketot</center>');
    },

    comet: 'sunako',
    cometstorm: 'sunako',
    sunako: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/3uyLxHC.png"><br />' +
            '<font color="0F055C"><b><i>I came from the storm.</center>');
    },

    popcorn: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/jQwJOwk.gif"></center>');
    },

    sand: 'sandshrewed',
    sandshrewed: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/4kyR3d1.jpg" width="100%"><br />' +
            '<img src="http://i.imgur.com/lgNPrpK.png"><br />' +
            'Ace: Gengar<br />' +
            '<font color=66CCFF>Don\'t need luck, got skill</font></center>');
    },

    destiny: 'itsdestiny',
    itsdestiny: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><font size="4" color="green"><b>It$de$tiny</b></font><br />' +
            '<img src="http://www.icleiusa.org/blog/library/images-phase1-051308/landscape/blog-images-90.jpg" width="55%"><img src="http://mindmillion.com/images/money/money-background-seamless-fill-bluesky.jpg" width="35%"><br />' +
            'It ain\'t luck, it\'s destiny.</center>');
    },

    miah: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><font size="3" color="orange"><b>Miah</font></b><br />' +
            '<img src="https://i.imgur.com/2RHOuPi.gif" width="50%"><img src="https://fbcdn-sphotos-c-a.akamaihd.net/hphotos-ak-frc1/t1.0-9/1511712_629640560439158_8415184400256062344_n.jpg" width="50%"><br />' +
            'Ace: Gliscor<br>Catch phrase: Adding Euphemisms to Pokemon</center>');
    },

    drag: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><font size="5" color="red">Akely</font><br />' +
            '<img src="http://gamesloveres.com/wp-content/uploads/2014/03/cute-pokemon-charmandercharmander-by-inversidom-riot-on-deviantart-llfutuct.png" width="25%"><br />' +
            'Ace: Charizard<br />' +
            '"Real mens can cry but real mens doesn\'t give up."</center>');
    },

    kricketune: 'kriсketunе',
    kriсketunе: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/VPcZ1rC.png"><br />' +
            '<img src="http://i.imgur.com/NKGYqpn.png" width="50%"><br />' +
            'Ace: Donnatello<br />' +
            '"At day I own the streets, but at night I own the closet..."</center>');
    },

    crowt: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><div class="infobox"><img src="http://i.imgur.com/BYTR6Fj.gif  width="80" height="80" align="left">' +
            '<img src="http://i.imgur.com/czMd1X5.gif" border="6" align="center">' +
            '<img src="http://50.62.73.114:8000/avatars/crowt.png" align="right"><br clear="all" /></div>' +
            '<blink><font color="red">~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~</font></blink><br />' +
            '<div class="infobox"><b><font color="#4F86F7" size="3">Ace:</font></b> <font color="blue" size="3">G</font><font color="black" size="3">r</font><font color="blue" size="3">e</font><font color="black" size="3">n</font><font color="blue" size="3">i</font><font color="black" size="3">n</font><font color="blue" size="3">j</font><font color="black" size="3">a</font></font><br />' +
            '<font color="black">"It takes a great deal of <b>bravery</b> to <b>stand up to</b> our <b>enemies</b>, but just as much to stand up to our <b>friends</b>." - Dumbledore</font></center></div>');
    },

    ransu: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/kWaZd66.jpg" width="40%"><br />' +
            'Develop a passion for learning. If you do, you will never cease to grow.</center>');
    },

    jessie: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/420CAz0.png"><br />' +
            '<img src="http://i.imgur.com/9ERgTNi.png"><br />' +
            'Catch phrase: I\'m from Jakarta ah ah</center>');
    },

    berry: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://blog.flamingtext.com/blog/2014/04/02/flamingtext_com_1396402375_186122138.png" width="50%"><br />' +
            '<img src="http://50.62.73.114:8000/avatars/theberrymaster.gif"><br />' +
            'Cherrim-Sunshine<br />' +
            'I don\'t care what I end up being as long as I\'m a legend.</center>');
    },

    moist: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://fc04.deviantart.net/fs70/i/2010/338/6/3/moister_by_arvalis-d347xgw.jpg" width="50%"></center>');
    },

    spydreigon: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/57drGn3.jpg" width="75%"><br />' +
            '<img src="http://fc00.deviantart.net/fs70/f/2013/102/8/3/hydreigon___draco_meteor_by_ishmam-d61irtz.png" width="75%"><br />' +
            'You wish you were as badass as me</center>');
    },

    mushy: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><font size="3" color=#8E019D>Mushy</font><br />' +
            '<img src="http://www.wall321.com/thumbnails/detail/20120504/angels%20army%20diablo%20armor%20tyrael%20swords%201920x1080%20wallpaper_www.wall321.com_75.jpg" width=400 height=225><br />' +
            '"Why do people hope for things that they know are near impossible?" "Because sometimes, hope is all you have."</center>');
    },

    panic: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/sGq1qy9.gif"></center>');
    },

    furgo: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/0qJzTgP.gif" width="25%"><br />' +
            '<font color="red">Ace:</font><br />' +
            '<img src="http://amethyst.xiaotai.org:2000/avatars/furgo.gif"><br />' +
            'When I\'m sleeping, do not poke me. :I</center>');
    },

    blazingflareon: 'bf',
    bf: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/h3ZTk9u.gif"><br />' +
            '<img src="http://fc08.deviantart.net/fs71/i/2012/251/3/f/flareon_coloured_lineart_by_noel_tf-d5e166e.jpg" width="25%"><br />' +
            '<font size="3" color="red"><u><b><i>DARE TO DREAM</font></u></i></b></center>');
    },

    mikado: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/oS2jnht.gif"><br />' +
            '<img src="http://i.imgur.com/oKEA0Om.png"></center>');
    },

    dsg: 'darkshinygiratina',
    darkshinygiratina: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><font size="4" color="blue" face="arial">DarkShinyGiratina</font><br />' +
            '<img src="http://i.imgur.com/sBIqMv8.gif"><br />' +
            'I\'m gonna use Shadow Force on you!</center>');
    },

    archbisharp: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/ibC46tQ.png"><br />' +
            '<img src="http://fc07.deviantart.net/fs70/f/2012/294/f/c/bisharp_by_xdarkblaze-d5ijnsf.gif" width="350" hieght="350"><br />' +
            '<b>Ruling you with an Iron Head.</b></center>');
    },

    chimplup: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><b>Chimplup</b> - The almighty ruler of chimchars and piplups alike, also likes pie.</center>');
    },

    shephard: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><b>Shephard</b> - King Of Water and Ground types.</center>');
    },

    logic: 'psychological',
    psychological: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/c4j9EdJ.png?1">' +
            '<img src="http://i.imgur.com/tRRas7O.gif" width="200">' +
            '<img src="http://i.imgur.com/TwpGsh3.png?1"><br />' +
            '<img src="http://i.imgur.com/1MH0mJM.png" height="90">' +
            '<img src="http://i.imgur.com/TSEXdOm.gif" width="300">' +
            '<img src="http://i.imgur.com/4XlnMPZ.png" height="90"><br />' +
            'If it isn\'t logical, it\'s probably Psychological.</center>');
    },

    seed: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><b>Seed</b> - /me plant and water</center>');
    },

    auraburst: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/9guvnD7.jpg">' +
            '<font color="orange"><font size="2"><b>Aura Butt</b> - Nick Cage.</font>' +
            '<img src="http://i.imgur.com/9guvnD7.jpg"></center>');
    },

    leo: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><b>Leonardo DiCaprio</b> - Mirror mirror on the wall, who is the chillest of them all?</center>');
    },

    kupo: 'moogle',
    moogle: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><font size="7" color="#AE8119"><b>kupo</font</b><br />' +
            '<img src="http://107.191.104.240:8000/avatars/kupo.png"><br />' +
            '<img src="http://th03.deviantart.net/fs70/PRE/i/2013/193/f/1/chocobo_and_moogle_by_judeydey-d6d629x.png" width="25%"><br />' +
            'abc! O3O!</center>');
    },

    starmaster: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><b>Starmaster</b> - Well what were you expecting. Master of stars. Duh</center>');
    },

    ryun: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><b>Ryun</b> - Will fuck your shit up with his army of Gloom, Chimecho, Duosion, Dunsparce, Plusle and Mr. Mime</center>');
    },

    miikasa: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://fc06.deviantart.net/fs70/f/2010/330/2/0/cirno_neutral_special_by_generalcirno-d33ndj0.gif"><br />' +
            '<font color="purple"><font size="2"><b>Miikasa</b></font>' +
            '<font color="purple"><font size="2"> - There are no buses in Gensokyo.</center></font>');
    },

    poliii: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/GsI3Y75.jpg"><br />' +
            '<font color="blue"><font size="2"><b>Poliii</b></font>' +
            '<font color="blue"><font size="2"> -  Greninja is behind you.</font></center>');
    },

    frozengrace: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><b>FrozenGrace</b> -  The gentle wind blows as the song birds sing of her vibrant radiance. The vibrant flowers and luscious petals dance in the serenading wind, welcoming her arrival for the epitome of all things beautiful.  Bow down to her majesty for she is the Queen. Let her bestow upon you as she graces you with her elegance. FrozenGrace, eternal serenity.</center>');
    },

    awk: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><b>Awk</b> - I have nothing to say to that!</center>');
    },

    screamingmilotic: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><b>ScreamingMilotic</b> - The shiny Milotic that wants to take over the world.</center>');
    },

    aikenka: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://fc05.deviantart.net/fs70/f/2010/004/3/4/Go_MAGIKARP_use_your_Splash_by_JoshR691.gif">' +
            '<b><font size="2"><font color="blue">Aikenká</b><font size="2"></font>' +
            '<font color="blue"> - The Master of the imp.</font>' +
            '<img src="http://fc05.deviantart.net/fs70/f/2010/004/3/4/Go_MAGIKARP_use_your_Splash_by_JoshR691.gif"></center>');
    },

    ipad: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/miLUHTz.png"><br><b>iPood</b><br />' +
            'A total <font color="brown">pos</font> that panpawn will ban.<br />' +
            '<img src="http://i.imgur.com/miLUHTz.png"></center>');
    },

    rhan: 'rohansound',
    rohansound: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><font color="orange"><font size="2"><b>Rohansound</b>' +
            '<font size="orange"><font size="2"> - The master of the Snivy!</center>');
    },

    alittlepaw: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://fc00.deviantart.net/fs71/f/2013/025/5/d/wolf_dance_by_windwolf13-d5sq93d.gif"><br />' +
            '<font color="green"><font size="3"><b>ALittlePaw</b> - Fenrir would be proud.</center>');
    },

    smashbrosbrawl: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><b>SmashBrosBrawl</b> - Christian Bale</center>');
    },

    w00per: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/i3FYyoG.gif"><br />' +
            '<font size="2"><font color="brown"><b>W00per</b>' +
            '<font size="2"><font color="brown"> - "I CAME IN LIKE `EM WRECKIN` BALLZ!</center>');
    },

    empoleonxv: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/IHd5yRT.gif"><br />' +
            '<img src="http://i.imgur.com/sfQsRlH.gif"><br />' +
            '<b><font color="33FFFF"><big>Smiling and Waving can\'t make you more cute than me!</b></center>');
    },

    foe: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://s21.postimg.org/durjqji4z/aaaaa.gif"><br />' +
            '<font size="2"><b>Foe</b><font size="2"> - Not a friend.</center>');
    },

    op: 'orangepoptarts',
    orangepoptarts: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://www.jeboavatars.com/images/avatars/192809169066sunsetbeach.jpg"><br />' +
            '<b><font size="2">Orange Poptarts</b><font size="2"> - "Pop, who so you" ~ ALittlePaw</center>');
    },

    darkhanekawa: 'jackzero',
    v: 'jackzero',
    jack: 'jackzero',
    jackzero: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><font size="4" color="#1AACBC"><b>JackZero</b><br/></font>' +
            '<img src="http://i.imgur.com/wUqmPZz.gif" height="250"><br/>' +
            '<font size="2"><i>I stopped fighting my inner demons. We are on the same side now.</i></font></center>');
    },

    wd: 'windoge',
    windoge: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://i.imgur.com/qYTABJC.jpg" width="400"></center>');
    },

    party: 'dance',
    dance: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><img src="http://collegecandy.files.wordpress.com/2013/05/tumblr_inline_mhv5qyiqvk1qz4rgp1.gif" width="400"></center>');
    },

    kayo: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><font size="2"><b>Kayo</b><br />' +
            'By the Beard of Zeus that Ghost was Fat<br />' +
            '<img src="http://i.imgur.com/rPe9hBa.png"></center>');
    },

    saburo: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><font color="red" size="5"><b>Saburo</font></b><br />' +
            '<img src="http://i.imgur.com/pYUt8Hf.gif"><br>The god of dance.</center>');
    },

    scizornician: 'sciz',
    sciz: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<div class="broadcast-blue"><center><font color="#A80000" size ="3"><b>Scizornician</b></font><br />' +
            '<b>Quote:</b> "It\'s all shits and giggles until someone giggles and shits."</font><br />' +
            '<b>Quote:</b> "Light travels faster than sound, that\'s why some people appear bright before they speak."</font><br />' +
            '<img src="http://107.191.104.240:8000/avatars/sciz.gif"></center></div>');
    },

    d3adm3owth: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><font color=#0E30AA size=3>d3adm3owth</font><br />' +
            '<img src="http://img2.wikia.nocookie.net/__cb20140120230002/pokemon/images/1/1b/OI015.jpg"  width=320 height 240><br />' +
            'Ace: Meowth<br />' +
            '...in accordance with the dictates of reason.</center>');
    },


    ashbloodthief: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center><font size="5"><font color="#140391">ashbloodthief</font></font></center> <center><img src="http://107.191.104.240:8000/avatars/ashbloodthief.gif" width=100 height=100></center> <center><img src="http://fc04.deviantart.net/fs71/f/2013/259/f/f/mega_lucario_by_henshingeneration-d6mihft.jpg" width=270 height=200></center><br /> <center><font size="3"> Ace: Mega Lucario</font></center> <center><font size="3"> I\'m a being pure as energy! You can\'t stop me!</font></center>');
    },

    chaotic: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox("<center><img src=\"http://i.imgur.com/NVEZJG1.png\" title=\"Hosted by imgur.com\" width=\"400\" height=\"100\"> </a><br><img src=\"http://media0.giphy.com/media/DCp4s7Z1FizZe/giphy.gif\" width=\"250\" height=\"250\"><img src=\"http://i269.photobucket.com/albums/jj77/YandereGIFs/Durarara%20GIFs/IzayaScared.gif\" width=\"250\" height=\"250\"> <br><center><b>\"A Caterpie may change into a Butterfree, but the heart that beats inside remains the same.\"</b>");
    },

    //***********************Music Boxes***************************

    //View Music box command to reduce lobby spam
    vmb: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center>Click <button name="send" value="/' + target + '" class="blackbutton" title="View musicbox!"><font color="white"><b>here</button></b></font> to view <b>' + target + '!</b></center>');
    },
    deadbox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>d3adm3owth☭\’s Music Box</b><br />' +
            '1. <a href="https://www.youtube.com/watch?v=c00vciZIE78"><button title="Sometimes I Fail - deadmau5">Sometimes I Fail - deadmau</a></button><br />' +
            '2. <a href="https://www.youtube.com/watch?v=9-0wDHMzNnQ"><button title="Silence Bridge - Pokemon Red/Blue">Silence Bridge - Pokemon Red/Blue</a></button><br />' +
            '3. <a href="https://www.youtube.com/watch?v=9T6N5UBeFpk"><button title="40 Oz. To Freedom - Sublime">40 Oz. To Freedom - Sublime</a></button><br />' +
            '4. <a href="https://www.youtube.com/watch?v=OHsvxfD8_-o"><button title="Bloody Cape - Deftones">Bloody Cape - Deftones</a></button><br />' +
            '5. <a href="https://www.youtube.com/watch?v=c5fts7bj-so"><button title="Fuck The Police - N.W.A.">Fuck The Police - N.W.A.</a></button><br />' +
            '6. <a href="https://www.youtube.com/watch?v=5hBC7ovAn6Y"><button title="Mellow, My Man - The Roots">Mellow, My Man - The Roots</a></button>');
    },
    tailzbox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>Tailz\'s Music Box!</b><br />' +
            '1. <a href="https://www.youtube.com/watch?v=zxof7Lh1u3c"><button>Nano - Savior Of Song</a></button><br />' +
            '2. <a href="https://www.youtube.com/watch?v=3ZckiELrRLU"><button>Nano - Black Board</a></button><br />' +
            '3. <a href="https://www.youtube.com/watch?v=P829PgxKxuM"><button>A Day To Remember - If It Means A Lot To You</a></button><br />' +
            '4. <a href="https://www.youtube.com/watch?v=QgFHL2R8m6s"><button>HollyWood Undead - Lion</a></button><br />' +
            '5. <a href="https://www.youtube.com/watch?v=fBocMs7EyOg"><button>Nano - Just Be Friends</a></button><br />' +
            '6. <a href="https://www.youtube.com/watch?v=Om5uXsD-aVo"><button>Rise Against - Satellite</a></button><br />' +
            '7. <a href="https://www.youtube.com/watch?v=YDJXr-Tzbqw"><button>Sora Amamiya - Skyreach</a></button><br />' +
            '8. <a href="https://www.youtube.com/watch?v=Ypl0gPtk0tA"><button>Three Days Grace - The High Road</a></button><br />' +
            '9. <a href="https://www.youtube.com/watch?v=xZ2yP7iUDeg"><button>Crown The Empire - Millenia</a></button><br /></center>');
    },

    terbox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>Terlor\'s Music Box!</b><br />' +
            '1. <a href="https://www.youtube.com/watch?v=kKdVeWeYDT8"><button>Spag Heddy - Pink Koeks</a></button><br />' +
            '2. <a href="https://www.youtube.com/watch?v=FSI5O6sp9go"><button>Spag Heddy - Sine Time</a></button><br />' +
            '3. <a href="https://www.youtube.com/watch?v=qJYLTCfhMGw"><button>Icy Lust - Sapphire</a></button><br />' +
            '4. <a href="https://www.youtube.com/watch?v=7qDGTVbOyO8"><button>Razihel - Seeking of the Truth</a></button><br />' +
            '5. <a href="https://www.youtube.com/watch?v=pSvn0rp0kz0"><button>Rogue - Adventure Time</a></button><br />' +
            '6. <a href="https://www.youtube.com/watch?v=FtveSk1N7Uo"><button>Hellberg - The Girl</a></button><br />' +
            '7. <a href="https://www.youtube.com/watch?v=cj73hUrwM1s"><button>Tristam - Truth</a></button></center>');
    },

    silrbox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>Silver\'s Music Box!</b><br />' +
            '1. <a href="https://www.youtube.com/watch?v=GEEYhzaeNus"><button>Union J - Carry You</a></button><br />' +
            '2. <a href="https://www.youtube.com/watch?v=cmSbXsFE3l8"><button>Anna Kendrick - Cups</a></button><br />' +
            '3. <a href="https://www.youtube.com/watch?v=iKaSbac2roQ"><button>Vacation - Vitamin C</a></button><br />' +
            '4. <a href="https://www.youtube.com/watch?v=LiaYDPRedWQ"><button>Avril Lavigne - Hello Kitty</a></button><br />');
    },

    sandbox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>Sandshrewed\'s Music Box!</b><br />' +
            '1. <a href="https://www.youtube.com/watch?v=vN0I4b5YdOc"><button title="RAP Done It All - Iniquity Rhymes">RAP Done It All - Iniquity Rhymes</a></button><br />' +
            '2. <a href="https://www.youtube.com/watch?v=n3QmHNd0HWo"><button title="Metal Gear Rising: Revengeance ~ The Only Thing I Know For Real">Metal Gear Rising: Revengeance ~ The Only Thing I Know For Real</a></button><br />' +
            '3. <a href="https://www.youtube.com/watch?v=hV5sB5rRsGI"><button title="New Boyz - Colors">New Boyz - Colors</a></button><br />' +
            '4. <a href="https://www.youtube.com/watch?v=A1A0mIqlPiI"><button title="Young Cash feat. Shawn Jay (Field Mob) - Stress Free">Young Cash feat. Shawn Jay (Field Mob) - Stress Free</a></button><br />' +
            '5. <a href="https://www.youtube.com/watch?v=ULQgMntenO8"><button title="Metal Gear Rising, Monsoon\'s theme- Stains of Time">Metal Gear Rising, Monsoon\'s theme- Stains of Time</a></button><br />' +
            '6. <a href="https://www.youtube.com/watch?v=P4PgrY33-UA"><button title="Drop That NaeNae">Drop That NaeNae</a></button><br />');
    },

    ampharosbox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>AmpharosTheBeast\'s Music Box!</b><br />' +
            '1. <a href="https://www.youtube.com/watch?v=RRGSHvlu9Ss"><button title="Linkin Park - Castle of Glass">Linkin Park - Castle of Glass</a></button><br />' +
            '2. <a href="https://www.youtube.com/watch?v=ie1wU9BLGn8"><button title="Rixton - Me and My Broken Heart">Rixton - Me and My Broken Heart</a></button><br />' +
            '3. <a href="https://www.youtube.com/watch?v=psuRGfAaju4"><button title="Owl City - Fireflies">Owl City - Fireflies</a></button><br />' +
            '4. <a href="https://www.youtube.com/watch?v=hT_nvWreIhg"><button title="OneRepublic - Counting Stars">OneRepublic - Counting Stars</a></button><br />' +
            '5. <a href="https://www.youtube.com/watch?v=VDvr08sCPOc"><button title="Fort Minor - Remember The Name">Fort Minor - Remember The Name</a></button><br />' +
            '6. <a href="https://www.youtube.com/watch?v=JPCv5rubXhU"><button title="Pokemon Bank A Parody of Bad Day">Pokemon Bank A Parody of Bad Day</a></button>');
    },

    legitbox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>Legit Buttons\'s Music Box!</b><br />' +
            '1. <a href="https://www.youtube.com/watch?v=y6Sxv-sUYtM"><button title="Pharrell Williams - Happy">Pharrell Williams - Happy</a></button><br />' +
            '2. <a href="https://www.youtube.com/watch?v=hT_nvWreIhg"><button title="OneRepublic - Counting Stars">OneRepublic - Counting Stars</a></button><br />' +
            '3. <a href="https://www.youtube.com/watch?v=6Cp6mKbRTQY"><button title="Avicii - Hey Brother">Avicii - Hey Brother</a></button><br />' +
            '4. <a href="https://www.youtube.com/watch?v=hHUbLv4ThOo"><button title="Pitbull - Timber ft. Ke$ha">Pitbull - Timber ft. Ke$ha</a></button><br />');
    },

    riotbox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>Jack Skellington\'s Music Box!</b><br />' +
            '1. <a href="https://www.youtube.com/watch?v=ubiZDYU7mv0"><button title="Metal Gear Rising: Revengeance - The Only Thing I Know for Real ">Metal Gear Rising: Revengeance - The Only Thing I Know for Real </a></button><br />' +
            '2. <a href="https://www.youtube.com/watch?v=ye0XhDdbFs4"><button title="A Day to Remember - You Had Me at Hello">A Day to Remember - You Had Me at Hello</a></button><br />' +
            '3. <a href="https://www.youtube.com/watch?v=vc6vs-l5dkc"><button title="Panic! At The Disco - I Write Sins Not Tragedies">Panic! At The Disco: I Write Sins Not Tragedies</a></button><br />' +
            '4. <a href="https://www.youtube.com/watch?v=FukeNR1ydOA"><button title="Suicide Silence - Disengage">Suicide Silence - Disengage</a></button><br />' +
            '5. <a href="https://www.youtube.com/watch?v=xyW9KknfwLU"><button title="A Day to Remember - Sometimes You\'re The Hammer, Sometimes You\'re The Nail">A Day to Remember - Sometimes You\'re The Hammer, Sometimes You\'re The Nail</a></button><br />' +
            '6. <a href="https://www.youtube.com/watch?v=sA5hj7wuJLQ"><button title="Bring Me The Horizon - Empire (Let Them Sing)">Bring Me The Horizon - Empire (Let Them Sing)</a></button><br />');
    },

    berrybox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>The Berry Master\'s Music Box!</b><br />' +
            '1. <a href="https://www.youtube.com/watch?v=fJ9rUzIMcZQ"><button title="Queen - Bohemian Rhapsody">Queen - Bohemian Rhapsody</a></button><br />' +
            '2. <a href="https://www.youtube.com/watch?v=xDMNHvnIxic"><button title="Hamster on a Piano">Hamster on a Piano</a></button><br />' +
            '3. <a href="https://www.youtube.com/watch?v=BuO5Jiqn9q4"><button title="The Ink Spots - Making Believe">The Ink Spots - Making Believe</a></button><br />' +
            '4. <a href="https://www.youtube.com/watch?v=ws8X31TTB5E"><button title="Cowboy Bebop OST 3 Blue - Adieu">Cowboy Bebop OST 3 Blue - Adieu</a></button><br />' +
            '5. <a href="https://www.youtube.com/watch?v=CnDJizJsMJg"><button title="ENTER SHIKARI - MOTHERSTEP/MOTHERSHIP">ENTER SHIKARI - MOTHERSTEP/MOTHERSHIP</a></button><br />' +
            '6. <a href="https://www.youtube.com/watch?v=-osNFEyI3vw"><button title="Gungor - Crags And Clay">Gungor - Crags And Clay</a></button><br />');
    },

    sphealbox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>Super Spheal Bros\'s Music Box!</b><br />' +
            '1. <a href="https://www.youtube.com/watch?v=85XM_Nl7_oo"><button title="Mother 1 (EarthBound Zero) Music - Eight Melodies">Mother 1 (EarthBound Zero) Music - Eight Melodies</a></button><br />' +
            '2. <a href="https://www.youtube.com/watch?v=oOy7cJowbQs"><button title="Pokemon Black & White 2 OST Kanto Gym Leader Battle Music">Pokemon Black & White 2 OST Kanto Gym Leader Battle Music</a></button><br />' +
            '3. <a href="https://www.youtube.com/watch?v=XEEceynk-mg"><button title="Sonic the Hedgehog Starlight Zone Music">Sonic the Hedgehog Starlight Zone Music</a></button><br />' +
            '4. <a href="https://www.youtube.com/watch?v=jofNR_WkoCE"><button title="Ylvis - The Fox (What Does The Fox Say?)">Ylvis - The Fox (What Does The Fox Say?)</a></button><br />' +
            '5. <a href="https://www.youtube.com/watch?v=EAwWPadFsOA"><button title="Mortal Kombat Theme Song">Mortal Kombat Theme Song</a></button><br />' +
            '6. <a href="https://www.youtube.com/watch?v=QH2-TGUlwu4"><button title="Nyan Cat">Nyan Cat</a></button><br />');
    },

    boxofdestiny: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>itsdestny\'s Music Box!</b><br />' +
            '1. <a href="https://www.youtube.com/watch?v=pucnAvLsgyI"><button title="Megaman Battle Network 5 Hero Theme">Megaman Battle Network 5 Hero Theme</a></button><br />' +
            '2. <a href="https://www.youtube.com/watch?v=ckNRHPlLBcU"><button title="Gospel - Monsters University">Gospel - Monsters University</a></button><br />' +
            '3. <a href="https://www.youtube.com/watch?v=sLgyd2HHvMc"><button title="Princess Kenny Theme Song">Princess Kenny Theme Song</a></button><br />' +
            '4. <a href="https://www.youtube.com/watch?v=9bZkp7q19f0"><button title="Psy - Gangnam Style">Psy - Gangnam Style</a></button><br />' +
            '5. <a href="https://www.youtube.com/watch?v=x4JdySEXrg8"><button title="Frozen - Let It Go">Frozen - Let It Go</a></button><br />');
    },

    cbox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>Cyllage\'s Music Box!</b><br />' +
            '1. <a href="https://www.youtube.com/watch?v=SRvCvsRp5ho"><button title="Bon Jovi - Wanted Dead Or Alive">Bon Jovi - Wanted Dead Or Alive</a></button><br />' +
            '2. <a href="https://www.youtube.com/watch?v=c901NUazf3g"><button title="Muse - Exogenesis Symphony">Muse - Exogenesis Symphony</a></button><br />' +
            '3. <a href="https://www.youtube.com/watch?v=4MjLKjPc7q8"><button title="Rise Against - Audience Of One">Rise Against - Audience Of One</a></button><br />' +
            '4. <a href="https://www.youtube.com/watch?v=gxEPV4kolz0"><button title="Billy Joel - Piano Man">Billy Joel - Piano Man</a></button><br />' +
            '5. <a href="https://www.youtube.com/watch?v=IwdJYdDyKUw"><button title="Griffin Village - Spring">Griffin Village - Spring</a></button><br />');
    },

    spybox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>Spydreigon\'s Music Box!</b><br />' +
            '1. <a href="https://www.youtube.com/watch?v=gL-ZIbF6J6s"><button title="Pursuit - Cornered">Pursuit - Cornered</a></button><br />' +
            '2. <a href="https://www.youtube.com/watch?v=qgP1yc1PpoU"><button title="Mega Man 10 - Abandoned Memory">Mega Man 10 - Abandoned Memory</a></button><br />' +
            '3. <a href="https://www.youtube.com/watch?v=yW6ECMHrGcI"><button title="Super Training! 8 Bit - Pokemon X/Y">Super Training! 8 Bit - Pokemon X/Y</a></button><br />' +
            '4. <a href="https://www.youtube.com/watch?v=NWYJYcpSpCs"><button title="Mighty No. 9 Theme 8 Bit">Mighty No. 9 Theme 8 Bit</a></button><br />' +
            '5. <a href="https://www.youtube.com/watch?v=NwaCMbfHwmQ"><button title="Mega Man X5 - X vs Zero">Mega Man X5 - X vs Zero</a></button><br />');
    },

    solstereo: 'solbox',
    solbox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>The Sol Box</b><br />' +
            '1. <a href="https://www.youtube.com/watch?v=VIop055eJhU"><button title="Touhou 6 - EoSD - U.N. Owen was her?"> Touhou 6 - EoSD - U.N. Owen was her?</a></button><br />' +
            '2. <a href="https://www.youtube.com/watch?v=BwpLSiplyYc"><button title="Kirby 64: The Crystal Shards - Zero Two">Kirby 64: The Crystal Shards - Zero Two</a></button><br />' +
            '3. <a href="https://www.youtube.com/watch?v=EzCKrwOme2U"><button title="Muse - Butterflies and Hurricanes">Muse - Butterflies and Hurricanes</a></button><br />' +
            '4. <a href="https://www.youtube.com/watch?v=EqGs36oPpLQ"><button title="Last Dinosaurs - Zoom">Last Dinosaurs - Zoom</a></button><br />' +
            '5. <a href="https://www.youtube.com/watch?v=p9Y-r-rs9W8"><button title="Green Day - Welcome to Paradise">Green Day - Welcome to Paradise</a></button><br />' +
            '6. <a href="https://www.youtube.com/watch?v=aWxBrI0g1kE"><button title="Disturbed - Indestructible">Disturbed - Indestructible</a></button><br />' +
            '7. <a href="https://www.youtube.com/watch?v=Fi_GN1pHCVc"><button title="Avenged Sevenfold - Almost Easy">Avenged Sevenfold - Almost Easy</a></button><br />' +
            '8. <a href="https://www.youtube.com/watch?v=71CvlYX1Bqc"><button title="Linkin Park - Across The Line">Linkin Park - Across The Line</a></button><br />' +
            '9. <a href="https://www.youtube.com/watch?v=gMzSpvibN7A"><button title="30 Seconds To Mars - Hurricane (Nightcore)">30 Seconds To Mars - Hurricane (Nightcore)</a></button>');
    },

    vbox: 'jackbox',
    jackbox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>Jacks\'s Music Box!</b><br />' +
            '1. <a href="https://www.youtube.com/watch?v=m0DMfaCh4aA"><button title="Attack on Titan - DOA">Attack on Titan - DOA</a></button><br />' +
            '2. <a href="https://www.youtube.com/watch?v=c-M34ZRM120"><button title=" ADTR - You be Tails, I\'ll be Sonic"> ADTR - You be Tails, I\'ll be Sonic</a></button><br />' +
            '3. <a href="https://www.youtube.com/watch?v=0B-xRO-vPPo"><button title="Papercut massacre - Lose my life">Papercut massacre - Lose my life</a></button><br />' +
            '4. <a href="https://www.youtube.com/watch?v=Qg_TRaiWj4o"><button title="The Who - Behind blue eyes">The Who - Behind blue eyes</a></button><br />' +
            '5. <a href="https://www.youtube.com/watch?v=0m9QUoW5KnY"><button title="Starbomb - It\'s dangerous to go alone">Starbomb - It\'s dangerous to go alone</a></button><br />' +
            '6. <a href="https://www.youtube.com/watch?v=Tt10gb8yf88"><button title="12 Stones - Psycho">12 Stones - Psycho</a></button><br />');
    },

    panbox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>Panpawn\'s Music Box!</b><br />' +
            '1. <a href="https://www.youtube.com/watch?v=EJR5A2dttp8"><button title="Let It Go - Connie Talbot cover">Let It Go - Connie Talbot cover</a></button><br />' +
            '2. <a href="https://www.youtube.com/watch?v=Y2Ta0qCG8No"><button title="Crocodile Rock - Elton John">Crocodile Rock - Elton John</a></button><br />' +
            '3. <a href="https://www.youtube.com/watch?v=ZA3vZwxnKnE"><button title="My Angel Gabriel - Lamb">My Angel Gabriel - Lamb</a></button><br />' +
            '4. <a href="https://www.youtube.com/watch?v=y8AWFf7EAc4"><button title="Hallelujah - Jeff Buckley">Hallelujah - Jeff Buckley</a></button><br />' +
            '5. <a href="https://www.youtube.com/watch?v=aFIApXs0_Nw"><button title="Better Off Dead - Elton John">Better Off Dead - Elton John</a></button><br />' +
            '6. <a href="https://www.youtube.com/watch?v=eJLTGHEwaR8"><button title="Your Song - Carly Rose Sonenclar cover">Your Song - Carly Rose Sonenclar cover</a></button><br />' +
            '7. <a href="https://www.youtube.com/watch?v=DAJYk1jOhzk"><button title="Let It Go - Frozen - Alex Boyé">Let It Go - Frozen - Alex Boyé</a></button><br />' +
            '8. <a href="https://www.youtube.com/watch?v=8S-jdXJ0H4w"><button title="Elton John - Indian Sunset">Elton John-Indian Sunset</a></button><br />' +
            '9. <a href="https://www.youtube.com/watch?v=cnK_tfqHQnU"><button title="New York State Of Mind - Billy Joel">New York State Of Mind - Billy Joel</a></button><br />' +
            '10. <a href="https://www.youtube.com/watch?v=0KDjzP84sVA"><button title="Counting Stars - Cimorelli">Counting Stars - Cimorelli</a></button><br />' +
            '11. <a href="https://www.youtube.com/watch?v=PpntEOQLpzI"><button title="Stay - Christina Grimmie">Stay - Christina Grimmie</a></button><br />' +
            '12. <a href="https://www.youtube.com/watch?v=JiBKfl-xhI0"><button title="Carly Rose Sonenclar - Feeling Good">Carly Rose Sonenclar - Feeling Good</a></button><br />' +
            '13. <a href="https://www.youtube.com/watch?v=Gj-ntawOBw4"><button title="Shake It Out - Choral">Shake It Out - Choral</a></button><br />' +
            '14. <a href="https://www.youtube.com/watch?v=n7wQQGtM-Hc"><button title="Elton John Sixty Years On Royal Opera House">Elton John Sixty Years On Royal Opera House</a></button><br />' +
            '15. <a href="https://www.youtube.com/watch?v=Izma0gpiLBQ"><button title="Elton John - Oceans Away">Elton John - Oceans Away</a></button><br />' +
            '16. <a href="https://www.youtube.com/watch?v=hOpK1Euwu5U"><button title="JennaAnne: I\'m Coming Home">JennaAnne: I\'m Coming Home</a></button>');
    },

    cabox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>CoolAsian\'s Music Box!</b><br />' +
            '1. <a href="http://youtu.be/UU8xKUoH_lU"><button title="Parkway Drive - Wild Eyes [Lyrics] [HD]">Parkway Drive - Wild Eyes [Lyrics] [HD]</a></button><br />' +
            '2. <a href="http://youtu.be/fOLqEOK_wLc"><button title="System Of A Down - B.Y.O.B.">System Of A Down - B.Y.O.B.</a></button><br />' +
            '3. <a href="http://youtu.be/312Sb-2PovA"><button title="SUICIDE SILENCE - You Only Live Once">SUICIDE SILENCE - You Only Live Once</a></button><br />' +
            '4. <a href="http://youtu.be/pUA-4WCXn5o"><button title="Atreyu - Demonology and Heartache">Atreyu - Demonology and Heartache</a></button><br />' +
            '5. <a href="http://youtu.be/zUq8I4JTOZU"><button title="Muse - Assassin (Grand Omega Bosses Edit)">Muse - Assassin (Grand Omega Bosses Edit)</a></button><br />' +
            '6. <a href="http://youtu.be/a89Shp0YhR8"><button title="A Day to Remember - I\'m Made of Wax, Larry, What Are You Made Of?">A Day to Remember - I\'m Made of Wax, Larry, What Are You Made Of?</a></button>');
    },


    lazerbox: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<b>lazerbeam\'s Music Box!</b><br />' +
            '1. <a href="https://www.youtube.com/watch?v=fJ9rUzIMcZQ"><button title="Bohemian Rhapsody - Queen">Bohemian Rhapsody - Queen</a></button><br />' +
            '2. <a href="https://www.youtube.com/watch?v=ZNaA7fVXB28"><button title="Against the Wind - Bob Seger">Against the Wind -  Bob Seger</a></button><br />' +
            '3. <a href="https://www.youtube.com/watch?v=TuCGiV-EVjA"><button title="Livin\' on the Edge - Aerosmith">Livin\' on the Edge - Aerosmith</a></button><br />' +
            '4. <a href="https://www.youtube.com/watch?v=QZ_kYEDZVno"><button title="Rock and Roll Never Forgets - Bob Seger">Rock and Roll Never Forgets - Bob Seger</a></button><br />' +
            '5. <a href="https://www.youtube.com/watch?v=GHjKEwV2-ZM"><button title="Jaded - Aerosmith">Jaded - Aerosmith</a></button>');
    },

    //End Music Boxes.
};
