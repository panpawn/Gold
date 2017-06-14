/**
 * Two Step Authentication
 * Gold Server - http://gold.psim.us/
 *
 * This provides a more secure means of authenticating a
 * login, as another layer of security
 *
 * Credits: panpawn, jd
 *
 * @license MIT license
 */

'use strict';

const CONFIRMATION_CODE_TIMEOUT_MINUTES = 3;
const TWO_STEP_CMD = '/twostep login ';
const nodemailer = require('nodemailer');
const twoFactor = require('node-2fa');
const EMAIL_OPTIONS = Config.twostep.options;

const transporter = nodemailer.createTransport(EMAIL_OPTIONS);

Gold.TwoStepAuth = {
	codes: {},
	generateCode: function (userid) {
		let randCode = Math.floor(Math.random() * 90000) + 100000;
		this.codes[userid] = randCode;
		setTimeout(() => {
			delete this.codes[userid];
		}, (CONFIRMATION_CODE_TIMEOUT_MINUTES * 60000));
	},
	verifyEmail: function (user, verification) {
		return this.sendEmail(user.userid, verification);
	},
	verifyCode: function (userid, userObj, input, connection) {
		if (Gold.userData[userid] && Gold.userData[userid].twostepauth) {
			if (Gold.userData[userid].twostepauth.emergencyCodes.includes(input)) {
				delete Gold.userData[userid].twostepauth;
				this.passLogin(userObj, connection);
				userObj.popup("|modal||html|You have logged in with an emergency code. Two-step authentication has been removed from your account.");
				return Gold.saveData();
			}
			let status = twoFactor.verifyToken(Gold.userData[userid].twostepauth.secret, input);
			if (status && status.delta === 0) {
				return this.passLogin(userObj, connection);
			} else {
				return this.failLogin(connection, `You entered the wrong authentication code. <br /><button class="button" name="send" value="${TWO_STEP_CMD}restart">Try again</button>`);
			}
		}
		let userCode = this.codes[userid];
		if (!userCode) return this.failLogin(connection, "No code was given");
		if (userCode.toString() === input) {
			this.passLogin(userObj, connection);
		} else {
			this.failLogin(connection, `You entered the wrong verification pin. <br /><button class="button" name="send" value="${TWO_STEP_CMD}restart">Try again</button>`);
		}
	},
	sendEmail: function (userid, verification, connection) {
		this.generateCode(userid);
		let data = Gold.userData[userid];
		let sendTo = (verification ? verification.email : data.email);
		if (!sendTo && connection) return this.failLogin(connection, "Your account does not have an email associated with it. (Weird?)");
		let userCode = this.codes[userid];
		if (!userCode && connection) return this.failLogin(connection, "Your passcode has expired.");
		let description = (verification ? verification.message :
		`Hello, ${userid}:\n\nYour two-step authentication code to login to Gold is: ${userCode}\n\nReminder that this code will expire in ${CONFIRMATION_CODE_TIMEOUT_MINUTES} minutes from the moment this email sent... Did you not attempt to login to Gold a few minutes ago? A user with the IP of ${connection.ip} tried to access your account with your username and password.\n\nThanks for using Gold's two step authentication,\n— Gold Administration`);
		transporter.sendMail({
			from: EMAIL_OPTIONS.from,
			to: sendTo,
			subject: "Gold 2-Step Authentication",
			text: description,
		}, err => {
			if (err) console.error(`Error sending email: ${err}`);
		});
	},
	sendCodePrompt: function (user) {
		user.popup(`|modal||html|${this.generateTable(user, user.twoStepApp)}`);
	},
	generateTable: function (user, authenticator) {
		let buff = `<center>You are attempting to login to an account that has two-step authentication enabled. `;
		if (!authenticator) buff += `Please check your email you have on file and enter the verification pin to continue.<br />`;
		if (authenticator) buff += `Please enter the verification code from your authenticator application.<br />`;
		buff += `<table border="1" cellspacing ="0" cellpadding="3">`;
		buff += `<tr><td colspan=3><center>${(user.codeAttempt && user.codeAttempt.length > 0 ? user.codeAttempt.join('') : '&nbsp;')}</center></td></tr>`;
		buff += `<tr><td>${this.generateButton(1)}</td><td>${this.generateButton(2)}</td><td>${this.generateButton(3)}</td></tr>`;
		buff += `<tr><td>${this.generateButton(4)}</td><td>${this.generateButton(5)}</td><td>${this.generateButton(6)}</td></tr>`;
		buff += `<tr><td>${this.generateButton(7)}</td><td>${this.generateButton(8)}</td><td>${this.generateButton(9)}</td></tr>`;
		buff += `<tr><td>${this.generateButton('&lt;-')}</td><td>${this.generateButton(0)}</td><td>${this.generateButton('R')}</td></tr></table></center>`;
		return buff;
	},
	generateButton: function (value, option) {
		if (!option) return `<button class="button" name="send" value="${TWO_STEP_CMD}${value}">${value}</button>`;
	},
	checkIdentity: function (name, userObj, connection, host, pendingRename) {
		let data = Gold.userData[toId(name)];
		if (!data) return true;
		if (userObj && (!data.ips.includes(connection.ip) || (host && host.includes('.proxy-nohost')))) {
			if (data.email) {
				userObj.pendingRename = pendingRename;
				this.sendEmail(toId(name), null, connection);
				this.sendCodePrompt(userObj);
				return false;
			} else if (data.twostepauth) {
				userObj.pendingRename = pendingRename;
				userObj.twoStepApp = true;
				this.sendCodePrompt(userObj);
				return false;
			}
		}
		return true;
	},
	passLogin: function (user, connection) {
		user.rename(user.pendingRename.targetName, user.pendingRename.targetToken, user.pendingRename.targetRegistered, connection);
		user.popup("You have been successfully logged in.");
		delete user.pendingRename;
	},
	failLogin: function (connection, message) {
		if (connection) {
			connection.send('|popup||wide||modal||html|' +
				'<div class="message-error">' +
				'Unfortunately, the server has denied your login request: ' + message +
				'</div>'
			);
		}
	},
};

exports.commands = {
	'2step': 'twostep',
	twostep: {
		setup: function (target, room, user) {
			if (!user.named) return this.errorReply("You must be logged in to use this command.");
			if (!user.registered) return this.errorReply("You cannot setup two-step authentication on an account that isn't registered.");
			if (Gold.userData[user.userid] && (Gold.userData[user.userid].email || Gold.userData[user.userid].twostepauth)) return this.errorReply("This account already has two-step authentication enabled.");
			if (!target) return this.parse('/help twostep');
			let targets = target.split(',');
			targets[0] = toId(targets[0]);
			if (targets[0] !== 'email' && targets[0] !== 'authenticator' || (targets[0] === 'email' && !targets[1])) return this.parse('/help twostep');

			if (targets[0] === 'email') {
				if (!targets[1].includes('@')) return this.errorReply("This is not a valid email address.");
				user.twostepEmail = {
					email: targets[1],
					code: Math.floor(Math.random() * 90000) + 10000,
				};
				let email = `Hello, ${user.name}:\n\nTo verify this email account as a second step of authentication for your login on Gold, type this: /twostep  verify ${user.twostepEmail.code}`;
				Gold.TwoStepAuth.verifyEmail(user, {email: targets[1], message: email});
				return this.sendReply("Check your email for verification - it will have you enter a command to verify that you own this email.");
			} else if (targets[0] === 'authenticator') {
				let twoAuthData = twoFactor.generateSecret({name: 'Gold PS', account: user.userid});
				user.tempTwoAuth = twoAuthData.secret;
				let uri = "otpauth://totp/Gold-PS:" + user.userid + "?secret=" + twoAuthData.secret + "&issuer=Gold-PS";
				let qrImg = "https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=" + uri;
				let reply = "|modal||html|Please enter the following code into your authenticator application or scan the QR code.<br />";
				reply += "Key: " + twoAuthData.secret + "<br />";
				reply += "<img src=\"" + qrImg + "\" height=\"166\" width=\"166\"><br />";
				reply += "Once you have added the key to your authenticator, please verify it by running ";
				reply += "the following command:<br />";
				reply += "<code>/twostep verify [code from your authenticator]</code>";
				return user.popup(reply);
			}
		},
		login: function (target, room, user, connection) { // undocumented
			if (!user.pendingRename) return this.errorReply("This is a secret command.");
			if (!target) return false;
			if (target === 'restart') return Gold.TwoStepAuth.sendCodePrompt(user);
			if (isNaN(target) && target !== 'R' && target !== '<-') return false;
			if (!user.codeAttempt) user.codeAttempt = [];
			if (target === '<-') {
				user.codeAttempt.splice(-1);
				return Gold.TwoStepAuth.sendCodePrompt(user);
			}
			user.codeAttempt.push(target);
			if (user.codeAttempt.length >= 6) {
				Gold.TwoStepAuth.verifyCode(toId(user.pendingRename.targetName), user, user.codeAttempt.join(''), connection);
				user.codeAttempt = [];
			} else {
				Gold.TwoStepAuth.sendCodePrompt(user);
			}
		},
		verify: function (target, room, user) { // undocumented
			if (!user.named) return this.errorReply("You must be logged in to use this command.");
			if (user.twostepEmail) {
				if (!target) return false;
				let verified = (Number(target) === user.twostepEmail.code);
				if (verified) {
					Gold.userData[user.userid].email = user.twostepEmail.email;
					Gold.saveData();
					return this.sendReply("Two-step authentication has been officially setup for your account.");
				} else {
					return this.errorReply("Unfortunately, you entered the wrong verification code.");
				}
			} else if (user.tempTwoAuth) {
				if (!user.tempTwoAuth) return false;
				if (!target) return this.errorReply("Usage: /twostep confirm [code from your authenticator]");

				let status = twoFactor.verifyToken(user.tempTwoAuth, target);
				if (status && status.delta === 0) {
					Gold.userData[user.userid].twostepauth = {
						secret: user.tempTwoAuth,
						emergencyCodes: [],
					};
					for (let i = 0; i < 5; i++) Gold.userData[user.userid].twostepauth.emergencyCodes.push('R' + Math.floor(Math.random() * 90000) + 10000);

					Gold.saveData();
					delete user.tempTwoAuth;

					let reply = "|modal||html|Two-step authentication has been enabled on this account.<br />";
					reply += "If you ever lose access to your authenticator application, logging in with one of the following ";
					reply += "codes will remove two-step authentication from your account.<br />";
					reply += "Save these codes in a safe place:<br /><br />";
					reply += Gold.userData[user.userid].twostepauth.emergencyCodes.join('<br />');

					return user.popup(reply);
				} else {
					return this.errorReply("Invalid authenticator code.");
				}
			}
		},
		reset: function (target, room, user) { // resets a user's 2-step email to nothing
			if (!this.can('hotpatch')) return false;
			if (!target) return this.errorReply("Usage: /twostep reset [username]");
			if (!Gold.userData[toId(target)]) return this.errorReply("This user has not visted the server before, and therefore does not have two-step enabled to reset.");
			if (!Gold.userData[toId(target)].email) return this.errorReply("This user does not currently have two-step authentication enabled.");
			delete Gold.userData[toId(target)].email;
			Gold.saveData();
			return this.privateModCommand(`(${user.name} has forcibly reset ${target}'s two-step authentication email address.)`);
		},
		check: function (target, room, user) { // checks if an account has 2-step enabled
			if (!this.can('hotpatch')) return false;
			if (!target) return this.errorReply("Usage: /twostep check [username]");
			let hasTwoStep = (Gold.userData[toId(target)] && Gold.userData[toId(target)].email ? "has two-step" : "does NOT have two-step");
			return this.sendReply(`${target} ${hasTwoStep} authentication enabled.`);
		},
		'': 'help',
		help: function (target, room, user) {
			return this.parse('/help twostep');
		},
	},
	twostephelp: [
		"Two-step authentication means that if you're trying to log in from an unstrusted network, the server will have you confirm your identity in the form of confirming either an emailed pin code, or a code from an authenticator app like Google Authenticator.",
		"To set this up, do /twostep setup [email / authenticator] - it will then send you an email asking you to do a command to verify this is your email, or display information to add your account to an authenticator, depending on which you selected.",
	],
};
