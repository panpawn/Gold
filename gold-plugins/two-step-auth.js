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

const CONFIRMATION_CODE_TIMEOUT_MINUTES = 2;
const TWO_STEP_CMD = '/twostep login ';
const nodemailer = require('nodemailer');
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
		if (!userCode) return this.failLogin(userid, "No code was given");
		if (userCode === input) {
			this.passLogin(userObj, connection);
		} else {
			this.failLogin(userid, `You entered the wrong verification pin. <br /><button class="button" name="send" value="${TWO_STEP_CMD}restart">Try again</button>`);
		}
	},
	sendEmail: function (userid, verification) {
		this.generateCode(userid);
		let data = Gold.userData[userid];
		if (!data) return this.failLogin(userid, "You do not have a data object.");
		let sendTo = (verification ? verification.email : data.email);
		if (!sendTo) return this.failLogin(userid, "Your account does not have an email associated with it. (Weird?)");
		let userCode = this.codes[userid];
		if (!userCode) return this.failLogin(userid, "Your passcode has expired.");
		let description = (verification ? verification.message :
		`Hello, ${userid}:\n\nYour two-step authentication code to login to Gold is: ${userCode}\n\nReminder that this code will expire in ${CONFIRMATION_CODE_TIMEOUT_MINUTES} minutes from the moment this email sent.\n\nThanks for using Gold's two step authentication,\n— Gold Administration`);
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
	checkIdentity: function (name, userObj, connection, host) {
		let data = Gold.userData[toId(name)];
		if (!data) return true;
		if (data.email) {
			if (userObj && (!data.ips.includes(connection.ip) || (host && host.includes('.proxy-nohost')))) {
				this.sendEmail(toId(name));
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
	},
	failLogin: function (userid, message) {
		let userObj = Users(userid);
		if (userObj) userObj.popup('|wide||modal||html|' +
			'<div class="message-error">' +
				'Unfortunately, the server has denied your login request: ' + message +
			'</div>'
		);
	},
};

exports.commands = {
	twostep: {
		setup: function (target, room, user) {
			if (!user.named) return this.errorReply("You must be logged in to use this command.");
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
			if (user.named) return this.errorReply("This is a secret command.");
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
		'': 'help',
		help: function (target, room, user) {
			return this.parse('/help twostep');
		},
	},
	twostephelp: [
		"Two-step authentication means that if you're trying to log in from an unstrusted network, the server will have you confirm your identity in the form of confirming an emailed pin code.",
		"To set this up, do /twostep setup [email] - it will then send you an email asking you to do a command to verify this is your email.",
	],
};
