/**
 * @file {@link ChatEngine} plugin which allow to modify emitted event payload to include
 * information which should be passed through APNS and/or GCM/FCM to device as remote notification
 * data.
 *
 * @module chat-engine-push-notifications-payload
 * @requires {@link ChatEngine}
 *
 * @author Serhii Mamontov <sergey@pubnub.com>
 */

const uuidv4 = require('uuid/v4');

/**
 * @function
 * @param {Object} [configuration] - Plugin configuration object.
 * @param {!String[]} [configuration.events] - List of events for which plugin should request
 *     payloads through provided callback function.
 * @param {String[]} [configuration.platforms=['ios', 'android']] - List of platforms for which
 *     'seen' notification payload should be created, if required.
 * @param {Boolean} [configuration.appendEvent=false] - Whether original event should be appended to
 *     notification payload under 'cepayload' key, so data can be used when notification received by
 *     device.
 * @param {function(payload:Object):Object} [configuration.formatter] - Called each time when
 *     {@link ChatEngine} is about to send one of tracked `events` make layout formatting for
 *     notification.
 *
 * @example
 * // Providing configuration, which will append ChatEngine
 * // events payload to notifications' payload and call
 * // formatter only for two type of events.
 * let configuration = {
 *     events: ['message', 'ping'],
 *     appendEvent: true,
 *     formatter: (eventPayload) => ({
 *         apns: { aps: { alert: { title: 'Test title', body: 'Test body' } } },
 *         gcm: { data: { contentTitle: 'Test title', contentText: 'Test body', ticker: 'Testing' } }
 *     })
 * };
 *
 * chat.plugin(ChatEngineCore.plugin['chat-engine-push-notifications-payload'](configuration));
 *
 * // Mark specific notification for event as seen.
 * chat.on('message', (payload) => {
 *     chat.notificationsPayload.markNotificationAsSeen(payload);
 * });
 *
 * // Mark all notifications for event as seen.
 * chat.notificationsPayload.markAllNotificationAsSeen();
 *
 * // Listen for notification for event 'seen' event.
 * chat.on('$notifications.seen', (payload) => {
 *     console.log(payload.data.eid, ' has been seen from another ChatEngine instance');
 * });
 *
 * @return {Object} Configured push notification payload plugin object.
 */
module.exports = (configuration = {}) => {
    configuration.events = configuration.events || [];
    configuration.formatter = configuration.formatter || (() => {});
    if (configuration.appendEvent === undefined) {
        configuration.appendEvent = false;
    }

    if (configuration.platforms === undefined) {
        configuration.platforms = ['ios', 'android'];
    }

    if (configuration.events.indexOf('$notifications.seen') === -1) {
        configuration.events.push('$notifications.seen');
    }

    let emitMiddleware = {};

    /**
     * Event category name composition from name of emitted event.
     *
     * @param {String} event - Object which has been emitted by user.
     *
     * @return {string} ChatEngine notification category name.
     */
    const categoryForEvent = (event) => {
        let cleanEventName = event.indexOf('$') === 0 ? event.slice(event.indexOf('.') === 1 ? 2 : 1) : event;

        return `com.pubnub.chat-engine.${cleanEventName}`;
    };

    /**
     * Normalize keys for `notification` and add information about original ChatEngine event into
     * payload.
     *
     * @param {Event} eventPayload - Object which has been emitted by user.
     * @param {Object} pushPayload - Object with notification keys for required platforms.
     */
    const payloadNormalize = (eventPayload, pushPayload) => {
        const normalizedPayload = Object.assign({}, pushPayload);
        let category = categoryForEvent(eventPayload.event);
        eventPayload.eid = eventPayload.eid || uuidv4();
        const shouldAppend = configuration.appendEvent || eventPayload.event === '$notifications.seen';
        let chatEnginePayload = {
            sender: eventPayload.sender,
            chat: eventPayload.chat.channel,
            event: eventPayload.event,
            data: eventPayload.data,
            eid: eventPayload.eid,
            category
        };

        Object.keys(normalizedPayload).forEach((key) => {
            if (key === 'apns' || key === 'gcm') {
                const notificationPayload = Object.assign({}, normalizedPayload[key]);
                let notificationCEPayload = notificationPayload.cepayload || (notificationPayload.data || {}).cepayload;

                if (notificationCEPayload === undefined) {
                    notificationCEPayload = {};
                }
                let cepayload = Object.assign({}, chatEnginePayload);
                cepayload.data = Object.assign({}, chatEnginePayload.data, notificationCEPayload.data || {});
                cepayload.category = notificationCEPayload.category || cepayload.category;


                if (shouldAppend && key === 'apns') {
                    if (notificationPayload.aps.category !== undefined) {
                        cepayload.category = notificationPayload.aps.category;
                    }

                    notificationPayload.aps.category = cepayload.category;
                    notificationPayload.cepayload = cepayload;
                } else if (shouldAppend) {
                    if (notificationPayload.data === null || notificationPayload.data === undefined) {
                        notificationPayload.data = {};
                    }

                    if (notificationPayload.data.category !== undefined) {
                        cepayload.category = notificationPayload.data.category;
                    }

                    notificationPayload.data = Object.assign({}, notificationPayload.data, { cepayload });
                }

                delete normalizedPayload[key];
                normalizedPayload[`pn_${key}`] = notificationPayload;
            }
        });

        Object.assign(eventPayload, normalizedPayload);

        return eventPayload;
    };

    /**
     * Construct payload of notification which is used to notify other user devices what particular
     * notification already seen.
     *
     * @param {Event} eventPayload - Payload which has been received with 'chat.on' and contain push
     *     notification payload.
     * @param {String[]} platforms - Name of platforms for which push notifications should be
     *     created.
     */
    const seenNotification = (eventPayload, platforms) => {
        const cepayload = Object.assign({}, { data: eventPayload.data });
        const notification = {};

        platforms.forEach((platform) => {
            if (platform === 'ios') {
                notification.apns = { aps: { 'content-available': 1, sound: '' }, cepayload };
            } else {
                notification.gcm = { data: { cepayload } };
            }
        });

        return notification;
    };

    /**
     * Wrapper around user-provided formatter callback.
     *
     * @param {ChatEngineEventPayload} payload - Emitted {@link Event} payload.
     * @param {function(reject, data: Object)} next - Middleware queue processing completion handler.
     */
    const formatter = (payload, next) => {
        let pushPayload = {};

        if (payload.event === '$notifications.seen') {
            pushPayload = seenNotification(payload, configuration.platforms);
        } else {
            pushPayload = configuration.formatter(payload) || {};
        }

        next(null, payloadNormalize(payload, pushPayload));
    };

    /**
     * Assign event payload formatter for each `event` from `configuration`.
     */
    if (configuration.events.indexOf('*') !== -1) {
        emitMiddleware['*'] = formatter;
    } else {
        configuration.events.forEach((event) => {
            emitMiddleware[event] = formatter;
        });
    }

    class extension {
        /**
         * Mark particular event payload with push notification payloads as seen.
         *
         * @param {Event} eventPayload - Object which has been emitted by remote user.
         */
        markNotificationAsSeen(eventPayload) {
            if (eventPayload.pn_apns === undefined && eventPayload.pn_gcm === undefined
                && eventPayload.event !== '$notifications.seen' && eventPayload.eid !== undefined) {
                return;
            }

            this.ChatEngine.me.direct.emit('$notifications.seen', { eid: eventPayload.eid });
        }

        /**
         * Mark all notifications as seen.
         */
        markAllNotificationAsSeen() {
            this.ChatEngine.me.direct.emit('$notifications.seen', { eid: 'all' });
        }
    }

    return {
        namespace: 'notificationsPayload',
        extends: {
            Chat: extension
        },
        middleware: { emit: emitMiddleware }
    };
};
