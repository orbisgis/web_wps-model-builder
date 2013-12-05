/**
 * Wrapper
 */
define([
	'popup/confirm',
	'popup/input',
	'popup/notification'
], function(confirm, input, notification) {
	return {
		confirm: confirm,
		input: input,
		notification: notification 
	}
});