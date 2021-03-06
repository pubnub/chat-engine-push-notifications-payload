/**
 * @file File contain only @typedefs for ChatEngine module, so there is no need to import it.
 *
 * @author Serhii Mamontov <sergey@pubnub.com>
 */

/**
 * Chat engine core module.
 *
 * @typedef {Object} ChatEngine
 * @property {Me} me - Reference on currently active user which use this {@link ChatEngine} instance.
 * @property {Object.<string, Chat>} chats - List of chats which is known for {@link ChatEngine}.
 */

/**
 * Current chat engine user model.
 *
 * @typedef {Object} Me
 * @extends {User}
 * @property {Chat} direct - Reference on chat which can be used to send direct messages and events
 *     to current {@link ChatEngine} user.
 */

/**
 * Chat engine remote user.
 *
 * @typedef {Object} User
 * @property {String} uuid - Reference on identifier which has been provided by remote user during
 *     authorization process.
 * @property {ChatEngine} chatEngine - ChatEngine instance which created user instance.
 * @property {function(plugin: Object)} plugin - Plugin registration function.
 */

/**
 * @typedef {Object} Chat
 * @property {String} channel - Name of channel which is used for real-time communication using
 *     PubNub service.
 * @property {Array<Object>} plugins - List of plugins which has been registered on chat.
 * @property {function(plugin: Object)} plugin - Plugin registration function.
 */

/**
 * Emitted {@link Event} payload.
 *
 * @typedef {Object} ChatEngineEventPayload
 * @property {String} event - Name of emitted event.
 * @property {Chat} chat - {@link Chat} instance for which event has been emitted.
 * @property {String} sender - {@link Event} sender identifier (user which asked to
 *     emit this {@link Event})
 * @property {?Object} data - Data which has been sent along with emitted {@link Event}.
 */
