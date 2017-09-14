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

if (!Config.twostep) return; // server does not have two-step email options set

const EMAIL_OPTIONS = Config.twostep.options;

const transporter = nodemailer.createTransport(EMAIL_OPTIONS);

Gold.TwoStepAuth = {
	codes: {},
	generateCode: function (userid) {
		let randCode = Math.floor(Math.random() * 90000) + 10000;
		this.codes[userid] = randCode;
		setTimeout(() => {
			delete this.codes[userid];
		}, (CONFIRMATION_CODE_TIMEOUT_MINUTES * 60000));
	},
	verifyEmail: function (user, verification) {
		return this.sendEmail(user.userid, verification);
	},
	verifyCode: function (userid, userObj, input, connection) {
		let userCode = this.codes[userid];
		if (!userCode) return this.failLogin(connection, "No code was given");
		if (userCode === input) {
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
		user.popup(`|modal||html|${this.generateTable(user)}`);
	},
	generateTable: function (user) {
		let buff = `<center>You are attempting to login to an account that has two-step authentication enabled. Please check your email you have on file and enter the verification pin to continue.<br />`;
		buff += `<table border="1" cellspacing ="0" cellpadding="3">`;
		buff += `<tr><td colspan=3><center>${(user.codeAttempt && user.codeAttempt.length > 0 ? user.codeAttempt.join('') : '&nbsp;')}</center></td></tr>`;
		buff += `<tr><td>${this.generateButton(1)}</td><td>${this.generateButton(2)}</td><td>${this.generateButton(3)}</td></tr>`;
		buff += `<tr><td>${this.generateButton(4)}</td><td>${this.generateButton(5)}</td><td>${this.generateButton(6)}</td></tr>`;
		buff += `<tr><td>${this.generateButton(7)}</td><td>${this.generateButton(8)}</td><td>${this.generateButton(9)}</td></tr>`;
		buff += `<tr><td> </td><td>${this.generateButton(0)}</td><td> </td></tr></table></center>`;
		return buff;
	},
	generateButton: function (value, option) {
		if (!option) return `<button class="button" name="send" value="${TWO_STEP_CMD}${value}">${value}</button>`;
	},
	checkIdentity: function (name, userObj, connection, host, pendingRename) {
		let data = Gold.userData[toId(name)];
		if (!data) return true;
		if (data.email) {
			if (userObj && (!data.ips.includes(connection.ip) || (host && host.includes('.proxy-nohost')))) {
				userObj.pendingRename = pendingRename;
				this.sendEmail(toId(name), null, connection);
				this.sendCodePrompt(userObj);
				return false;
			} else { // known IP/not a proxy
				return true;
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
			if (!target) return this.parse('/help twostep');
			if (!target.includes('@')) return this.errorReply("This is not a valid email address.");
			user.twostepEmail = {
				email: target,
				code: Math.floor(Math.random() * 90000) + 10000,
			};
			let email = `Hello, ${user.name}:\n\nTo verify this email account as a second step of authentication for your login on Gold, type this: /twostep  verify ${user.twostepEmail.code}`;
			Gold.TwoStepAuth.verifyEmail(user, {email: target, message: email});
			return this.sendReply("Check your email for verification - it will have you enter a command to verify that you own this email.");
		},
		login: function (target, room, user, connection) { // undocumented
			if (!user.pendingRename) return this.errorReply("This is a secret command.");
			if (!target) return false;
			if (target === 'restart') return Gold.TwoStepAuth.sendCodePrompt(user);
			if (isNaN(target)) return false;
			target = parseInt(target);
			if (!user.codeAttempt) user.codeAttempt = [];
			user.codeAttempt.push(target);
			if (user.codeAttempt.length >= 5) {
				Gold.TwoStepAuth.verifyCode(toId(user.pendingRename.targetName), user, Number(user.codeAttempt.join('')), connection);
				user.codeAttempt = [];
			} else {
				Gold.TwoStepAuth.sendCodePrompt(user);
			}
		},
		verify: function (target, room, user) { // undocumented
			if (!user.named) return this.errorReply("You must be logged in to use this command.");
			if (!target) return false;
			let verified = (Number(target) === user.twostepEmail.code);
			if (verified) {
				Gold.userData[user.userid].email = user.twostepEmail.email;
				Gold.saveData();
				return this.sendReply("Two-step authentication has been officially setup for your account.");
			} else {
				return this.errorReply("Unfortunately, you entered the wrong verification code.");
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
		"Two-step authentication means that if you're trying to log in from an unstrusted network, the server will have you confirm your identity in the form of confirming an emailed pin code.",
		"To set this up, do /twostep setup [email] - it will then send you an email asking you to do a command to verify you own the email.",
	],
};
