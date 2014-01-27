/**
 * Wrapper
 */
define([
	'popup/confirm',
	'popup/input',
	'popup/notification'
], function(alertify, confirm, input, notification) {
	return {
		confirm: confirm,
		input: input,
		notification: notification 
	}
});