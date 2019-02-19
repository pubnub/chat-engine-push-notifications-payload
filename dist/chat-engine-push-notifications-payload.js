(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function() {

    const pkg = require('../package.json');
    window.ChatEngineCore.plugin[pkg.name] = require('../src/plugin.js');

})();

},{"../package.json":5,"../src/plugin.js":6}],2:[function(require,module,exports){
/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
  return ([bth[buf[i++]], bth[buf[i++]], 
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]],
	bth[buf[i++]], bth[buf[i++]],
	bth[buf[i++]], bth[buf[i++]]]).join('');
}

module.exports = bytesToUuid;

},{}],3:[function(require,module,exports){
// Unique ID creation requires a high quality random # generator.  In the
// browser this is a little complicated due to unknown quality of Math.random()
// and inconsistent support for the `crypto` API.  We do the best we can via
// feature-detection

// getRandomValues needs to be invoked in a context where "this" is a Crypto
// implementation. Also, find the complete implementation of crypto on IE11.
var getRandomValues = (typeof(crypto) != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||
                      (typeof(msCrypto) != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto));

if (getRandomValues) {
  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
  var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

  module.exports = function whatwgRNG() {
    getRandomValues(rnds8);
    return rnds8;
  };
} else {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var rnds = new Array(16);

  module.exports = function mathRNG() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return rnds;
  };
}

},{}],4:[function(require,module,exports){
var rng = require('./lib/rng');
var bytesToUuid = require('./lib/bytesToUuid');

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options === 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || bytesToUuid(rnds);
}

module.exports = v4;

},{"./lib/bytesToUuid":2,"./lib/rng":3}],5:[function(require,module,exports){
module.exports={
  "name": "chat-engine-push-notifications-payload",
  "description": "ChatEngine APN an GCM / FCM notification payload generation plugin. ",
  "homepage": "https://github.com/pubnub/chat-engine-push-notifications-payload#readme",
  "version": "0.0.1",
  "license": "MIT",
  "author": {
    "name": "Serhii Mamontov <sergey@pubnub.com>"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/pubnub/chat-engine-push-notifications-payload.git"
  },
  "bugs": {
    "url": "https://github.com/pubnub/chat-engine-push-notifications-payload/issues"
  },
  "main": "src/plugin.js",
  "scripts": {
    "test": "jest --ci --forceExit",
    "unit_test": "jest --ci --forceExit --config=test/unit/jest-config.json --testPathPattern=test/unit/",
    "integration_test": "jest --ci --forceExit --config=test/integration/jest-config.json --testPathPattern=test/integration/"
  },
  "dependencies": {
    "uuid": "^3.3.2"
  },
  "devDependencies": {
    "@babel/core": "^7.2.2",
    "@babel/plugin-proposal-class-properties": "^7.3.0",
    "@babel/preset-env": "^7.3.1",
    "@babel/register": "^7.0.0",
    "babel-jest": "^24.0.0",
    "babel-plugin-add-module-exports": "^1.0.0",
    "babel-plugin-transform-builtin-extend": "^1.1.2",
    "eslint": "^5.13.0",
    "eslint-config-airbnb": "^17.1.0",
    "eslint-plugin-import": "^2.16.0",
    "eslint-plugin-jsx-a11y": "^6.2.0",
    "eslint-plugin-react": "^7.12.4",
    "gulp": "3.x.x",
    "gulp-eslint": "^5.0.0",
    "gulp-shell": "^0.6.5",
    "jest": "^24.0.0",
    "jest-cli": "^24.0.0",
    "metro-react-native-babel-preset": "^0.51.1"
  },
  "peerDependencies": {
    "chat-engine": "0.9.x"
  },
  "jest": {
    "collectCoverage": true,
    "coverageDirectory": "./coverage",
    "coverageReporters": [
      "json",
      "text",
      "lcov",
      "clover"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 95,
        "functions": 95,
        "lines": 95,
        "statements": 95
      }
    },
    "coveragePathIgnorePatterns": [
      "<rootDir>/test/",
      "<rootDir>/demo/",
      "<rootDir>/node_modules/"
    ],
    "modulePathIgnorePatterns": [
      "<rootDir>/demo/",
      "<rootDir>/node_modules/(?!react|fbjs|react-native|react-transform-hmr|core-js|promise)/",
      "<rootDir>/node_modules/react-native/Libraries/react-native/"
    ],
    "testPathIgnorePatterns": [
      "<rootDir>/.idea",
      "<rootDir>/Libraries/",
      "<rootDir>/coverage/",
      "<rootDir>/docs/",
      "<rootDir>/demo/",
      "<rootDir>/node_modules/",
      "/node_modules/"
    ],
    "notify": true,
    "preset": "react-native"
  },
  "keywords": [
    "chatengine",
    "chat",
    "sdk",
    "realtime",
    "pubnub",
    "notifications"
  ]
}

},{}],6:[function(require,module,exports){
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

},{"uuid/v4":4}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2NoYXQtZW5naW5lLXBsdWdpbi9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiLnRtcC93cmFwLmpzIiwibm9kZV9tb2R1bGVzL3V1aWQvbGliL2J5dGVzVG9VdWlkLmpzIiwibm9kZV9tb2R1bGVzL3V1aWQvbGliL3JuZy1icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3V1aWQvdjQuanMiLCJwYWNrYWdlLmpzb24iLCJzcmMvcGx1Z2luLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiKGZ1bmN0aW9uKCkge1xuXG4gICAgY29uc3QgcGtnID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJyk7XG4gICAgd2luZG93LkNoYXRFbmdpbmVDb3JlLnBsdWdpbltwa2cubmFtZV0gPSByZXF1aXJlKCcuLi9zcmMvcGx1Z2luLmpzJyk7XG5cbn0pKCk7XG4iLCIvKipcbiAqIENvbnZlcnQgYXJyYXkgb2YgMTYgYnl0ZSB2YWx1ZXMgdG8gVVVJRCBzdHJpbmcgZm9ybWF0IG9mIHRoZSBmb3JtOlxuICogWFhYWFhYWFgtWFhYWC1YWFhYLVhYWFgtWFhYWFhYWFhYWFhYXG4gKi9cbnZhciBieXRlVG9IZXggPSBbXTtcbmZvciAodmFyIGkgPSAwOyBpIDwgMjU2OyArK2kpIHtcbiAgYnl0ZVRvSGV4W2ldID0gKGkgKyAweDEwMCkudG9TdHJpbmcoMTYpLnN1YnN0cigxKTtcbn1cblxuZnVuY3Rpb24gYnl0ZXNUb1V1aWQoYnVmLCBvZmZzZXQpIHtcbiAgdmFyIGkgPSBvZmZzZXQgfHwgMDtcbiAgdmFyIGJ0aCA9IGJ5dGVUb0hleDtcbiAgLy8gam9pbiB1c2VkIHRvIGZpeCBtZW1vcnkgaXNzdWUgY2F1c2VkIGJ5IGNvbmNhdGVuYXRpb246IGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTMxNzUjYzRcbiAgcmV0dXJuIChbYnRoW2J1ZltpKytdXSwgYnRoW2J1ZltpKytdXSwgXG5cdGJ0aFtidWZbaSsrXV0sIGJ0aFtidWZbaSsrXV0sICctJyxcblx0YnRoW2J1ZltpKytdXSwgYnRoW2J1ZltpKytdXSwgJy0nLFxuXHRidGhbYnVmW2krK11dLCBidGhbYnVmW2krK11dLCAnLScsXG5cdGJ0aFtidWZbaSsrXV0sIGJ0aFtidWZbaSsrXV0sICctJyxcblx0YnRoW2J1ZltpKytdXSwgYnRoW2J1ZltpKytdXSxcblx0YnRoW2J1ZltpKytdXSwgYnRoW2J1ZltpKytdXSxcblx0YnRoW2J1ZltpKytdXSwgYnRoW2J1ZltpKytdXV0pLmpvaW4oJycpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJ5dGVzVG9VdWlkO1xuIiwiLy8gVW5pcXVlIElEIGNyZWF0aW9uIHJlcXVpcmVzIGEgaGlnaCBxdWFsaXR5IHJhbmRvbSAjIGdlbmVyYXRvci4gIEluIHRoZVxuLy8gYnJvd3NlciB0aGlzIGlzIGEgbGl0dGxlIGNvbXBsaWNhdGVkIGR1ZSB0byB1bmtub3duIHF1YWxpdHkgb2YgTWF0aC5yYW5kb20oKVxuLy8gYW5kIGluY29uc2lzdGVudCBzdXBwb3J0IGZvciB0aGUgYGNyeXB0b2AgQVBJLiAgV2UgZG8gdGhlIGJlc3Qgd2UgY2FuIHZpYVxuLy8gZmVhdHVyZS1kZXRlY3Rpb25cblxuLy8gZ2V0UmFuZG9tVmFsdWVzIG5lZWRzIHRvIGJlIGludm9rZWQgaW4gYSBjb250ZXh0IHdoZXJlIFwidGhpc1wiIGlzIGEgQ3J5cHRvXG4vLyBpbXBsZW1lbnRhdGlvbi4gQWxzbywgZmluZCB0aGUgY29tcGxldGUgaW1wbGVtZW50YXRpb24gb2YgY3J5cHRvIG9uIElFMTEuXG52YXIgZ2V0UmFuZG9tVmFsdWVzID0gKHR5cGVvZihjcnlwdG8pICE9ICd1bmRlZmluZWQnICYmIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMgJiYgY3J5cHRvLmdldFJhbmRvbVZhbHVlcy5iaW5kKGNyeXB0bykpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgKHR5cGVvZihtc0NyeXB0bykgIT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHdpbmRvdy5tc0NyeXB0by5nZXRSYW5kb21WYWx1ZXMgPT0gJ2Z1bmN0aW9uJyAmJiBtc0NyeXB0by5nZXRSYW5kb21WYWx1ZXMuYmluZChtc0NyeXB0bykpO1xuXG5pZiAoZ2V0UmFuZG9tVmFsdWVzKSB7XG4gIC8vIFdIQVRXRyBjcnlwdG8gUk5HIC0gaHR0cDovL3dpa2kud2hhdHdnLm9yZy93aWtpL0NyeXB0b1xuICB2YXIgcm5kczggPSBuZXcgVWludDhBcnJheSgxNik7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWZcblxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHdoYXR3Z1JORygpIHtcbiAgICBnZXRSYW5kb21WYWx1ZXMocm5kczgpO1xuICAgIHJldHVybiBybmRzODtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIE1hdGgucmFuZG9tKCktYmFzZWQgKFJORylcbiAgLy9cbiAgLy8gSWYgYWxsIGVsc2UgZmFpbHMsIHVzZSBNYXRoLnJhbmRvbSgpLiAgSXQncyBmYXN0LCBidXQgaXMgb2YgdW5zcGVjaWZpZWRcbiAgLy8gcXVhbGl0eS5cbiAgdmFyIHJuZHMgPSBuZXcgQXJyYXkoMTYpO1xuXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWF0aFJORygpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgcjsgaSA8IDE2OyBpKyspIHtcbiAgICAgIGlmICgoaSAmIDB4MDMpID09PSAwKSByID0gTWF0aC5yYW5kb20oKSAqIDB4MTAwMDAwMDAwO1xuICAgICAgcm5kc1tpXSA9IHIgPj4+ICgoaSAmIDB4MDMpIDw8IDMpICYgMHhmZjtcbiAgICB9XG5cbiAgICByZXR1cm4gcm5kcztcbiAgfTtcbn1cbiIsInZhciBybmcgPSByZXF1aXJlKCcuL2xpYi9ybmcnKTtcbnZhciBieXRlc1RvVXVpZCA9IHJlcXVpcmUoJy4vbGliL2J5dGVzVG9VdWlkJyk7XG5cbmZ1bmN0aW9uIHY0KG9wdGlvbnMsIGJ1Ziwgb2Zmc2V0KSB7XG4gIHZhciBpID0gYnVmICYmIG9mZnNldCB8fCAwO1xuXG4gIGlmICh0eXBlb2Yob3B0aW9ucykgPT0gJ3N0cmluZycpIHtcbiAgICBidWYgPSBvcHRpb25zID09PSAnYmluYXJ5JyA/IG5ldyBBcnJheSgxNikgOiBudWxsO1xuICAgIG9wdGlvbnMgPSBudWxsO1xuICB9XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIHZhciBybmRzID0gb3B0aW9ucy5yYW5kb20gfHwgKG9wdGlvbnMucm5nIHx8IHJuZykoKTtcblxuICAvLyBQZXIgNC40LCBzZXQgYml0cyBmb3IgdmVyc2lvbiBhbmQgYGNsb2NrX3NlcV9oaV9hbmRfcmVzZXJ2ZWRgXG4gIHJuZHNbNl0gPSAocm5kc1s2XSAmIDB4MGYpIHwgMHg0MDtcbiAgcm5kc1s4XSA9IChybmRzWzhdICYgMHgzZikgfCAweDgwO1xuXG4gIC8vIENvcHkgYnl0ZXMgdG8gYnVmZmVyLCBpZiBwcm92aWRlZFxuICBpZiAoYnVmKSB7XG4gICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IDE2OyArK2lpKSB7XG4gICAgICBidWZbaSArIGlpXSA9IHJuZHNbaWldO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBidWYgfHwgYnl0ZXNUb1V1aWQocm5kcyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdjQ7XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwibmFtZVwiOiBcImNoYXQtZW5naW5lLXB1c2gtbm90aWZpY2F0aW9ucy1wYXlsb2FkXCIsXG4gIFwiZGVzY3JpcHRpb25cIjogXCJDaGF0RW5naW5lIEFQTiBhbiBHQ00gLyBGQ00gbm90aWZpY2F0aW9uIHBheWxvYWQgZ2VuZXJhdGlvbiBwbHVnaW4uIFwiLFxuICBcImhvbWVwYWdlXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL3B1Ym51Yi9jaGF0LWVuZ2luZS1wdXNoLW5vdGlmaWNhdGlvbnMtcGF5bG9hZCNyZWFkbWVcIixcbiAgXCJ2ZXJzaW9uXCI6IFwiMC4wLjFcIixcbiAgXCJsaWNlbnNlXCI6IFwiTUlUXCIsXG4gIFwiYXV0aG9yXCI6IHtcbiAgICBcIm5hbWVcIjogXCJTZXJoaWkgTWFtb250b3YgPHNlcmdleUBwdWJudWIuY29tPlwiXG4gIH0sXG4gIFwicmVwb3NpdG9yeVwiOiB7XG4gICAgXCJ0eXBlXCI6IFwiZ2l0XCIsXG4gICAgXCJ1cmxcIjogXCJnaXQraHR0cHM6Ly9naXRodWIuY29tL3B1Ym51Yi9jaGF0LWVuZ2luZS1wdXNoLW5vdGlmaWNhdGlvbnMtcGF5bG9hZC5naXRcIlxuICB9LFxuICBcImJ1Z3NcIjoge1xuICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL3B1Ym51Yi9jaGF0LWVuZ2luZS1wdXNoLW5vdGlmaWNhdGlvbnMtcGF5bG9hZC9pc3N1ZXNcIlxuICB9LFxuICBcIm1haW5cIjogXCJzcmMvcGx1Z2luLmpzXCIsXG4gIFwic2NyaXB0c1wiOiB7XG4gICAgXCJ0ZXN0XCI6IFwiamVzdCAtLWNpIC0tZm9yY2VFeGl0XCIsXG4gICAgXCJ1bml0X3Rlc3RcIjogXCJqZXN0IC0tY2kgLS1mb3JjZUV4aXQgLS1jb25maWc9dGVzdC91bml0L2plc3QtY29uZmlnLmpzb24gLS10ZXN0UGF0aFBhdHRlcm49dGVzdC91bml0L1wiLFxuICAgIFwiaW50ZWdyYXRpb25fdGVzdFwiOiBcImplc3QgLS1jaSAtLWZvcmNlRXhpdCAtLWNvbmZpZz10ZXN0L2ludGVncmF0aW9uL2plc3QtY29uZmlnLmpzb24gLS10ZXN0UGF0aFBhdHRlcm49dGVzdC9pbnRlZ3JhdGlvbi9cIlxuICB9LFxuICBcImRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJ1dWlkXCI6IFwiXjMuMy4yXCJcbiAgfSxcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQGJhYmVsL2NvcmVcIjogXCJeNy4yLjJcIixcbiAgICBcIkBiYWJlbC9wbHVnaW4tcHJvcG9zYWwtY2xhc3MtcHJvcGVydGllc1wiOiBcIl43LjMuMFwiLFxuICAgIFwiQGJhYmVsL3ByZXNldC1lbnZcIjogXCJeNy4zLjFcIixcbiAgICBcIkBiYWJlbC9yZWdpc3RlclwiOiBcIl43LjAuMFwiLFxuICAgIFwiYmFiZWwtamVzdFwiOiBcIl4yNC4wLjBcIixcbiAgICBcImJhYmVsLXBsdWdpbi1hZGQtbW9kdWxlLWV4cG9ydHNcIjogXCJeMS4wLjBcIixcbiAgICBcImJhYmVsLXBsdWdpbi10cmFuc2Zvcm0tYnVpbHRpbi1leHRlbmRcIjogXCJeMS4xLjJcIixcbiAgICBcImVzbGludFwiOiBcIl41LjEzLjBcIixcbiAgICBcImVzbGludC1jb25maWctYWlyYm5iXCI6IFwiXjE3LjEuMFwiLFxuICAgIFwiZXNsaW50LXBsdWdpbi1pbXBvcnRcIjogXCJeMi4xNi4wXCIsXG4gICAgXCJlc2xpbnQtcGx1Z2luLWpzeC1hMTF5XCI6IFwiXjYuMi4wXCIsXG4gICAgXCJlc2xpbnQtcGx1Z2luLXJlYWN0XCI6IFwiXjcuMTIuNFwiLFxuICAgIFwiZ3VscFwiOiBcIjMueC54XCIsXG4gICAgXCJndWxwLWVzbGludFwiOiBcIl41LjAuMFwiLFxuICAgIFwiZ3VscC1zaGVsbFwiOiBcIl4wLjYuNVwiLFxuICAgIFwiamVzdFwiOiBcIl4yNC4wLjBcIixcbiAgICBcImplc3QtY2xpXCI6IFwiXjI0LjAuMFwiLFxuICAgIFwibWV0cm8tcmVhY3QtbmF0aXZlLWJhYmVsLXByZXNldFwiOiBcIl4wLjUxLjFcIlxuICB9LFxuICBcInBlZXJEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiY2hhdC1lbmdpbmVcIjogXCIwLjkueFwiXG4gIH0sXG4gIFwiamVzdFwiOiB7XG4gICAgXCJjb2xsZWN0Q292ZXJhZ2VcIjogdHJ1ZSxcbiAgICBcImNvdmVyYWdlRGlyZWN0b3J5XCI6IFwiLi9jb3ZlcmFnZVwiLFxuICAgIFwiY292ZXJhZ2VSZXBvcnRlcnNcIjogW1xuICAgICAgXCJqc29uXCIsXG4gICAgICBcInRleHRcIixcbiAgICAgIFwibGNvdlwiLFxuICAgICAgXCJjbG92ZXJcIlxuICAgIF0sXG4gICAgXCJjb3ZlcmFnZVRocmVzaG9sZFwiOiB7XG4gICAgICBcImdsb2JhbFwiOiB7XG4gICAgICAgIFwiYnJhbmNoZXNcIjogOTUsXG4gICAgICAgIFwiZnVuY3Rpb25zXCI6IDk1LFxuICAgICAgICBcImxpbmVzXCI6IDk1LFxuICAgICAgICBcInN0YXRlbWVudHNcIjogOTVcbiAgICAgIH1cbiAgICB9LFxuICAgIFwiY292ZXJhZ2VQYXRoSWdub3JlUGF0dGVybnNcIjogW1xuICAgICAgXCI8cm9vdERpcj4vdGVzdC9cIixcbiAgICAgIFwiPHJvb3REaXI+L2RlbW8vXCIsXG4gICAgICBcIjxyb290RGlyPi9ub2RlX21vZHVsZXMvXCJcbiAgICBdLFxuICAgIFwibW9kdWxlUGF0aElnbm9yZVBhdHRlcm5zXCI6IFtcbiAgICAgIFwiPHJvb3REaXI+L2RlbW8vXCIsXG4gICAgICBcIjxyb290RGlyPi9ub2RlX21vZHVsZXMvKD8hcmVhY3R8ZmJqc3xyZWFjdC1uYXRpdmV8cmVhY3QtdHJhbnNmb3JtLWhtcnxjb3JlLWpzfHByb21pc2UpL1wiLFxuICAgICAgXCI8cm9vdERpcj4vbm9kZV9tb2R1bGVzL3JlYWN0LW5hdGl2ZS9MaWJyYXJpZXMvcmVhY3QtbmF0aXZlL1wiXG4gICAgXSxcbiAgICBcInRlc3RQYXRoSWdub3JlUGF0dGVybnNcIjogW1xuICAgICAgXCI8cm9vdERpcj4vLmlkZWFcIixcbiAgICAgIFwiPHJvb3REaXI+L0xpYnJhcmllcy9cIixcbiAgICAgIFwiPHJvb3REaXI+L2NvdmVyYWdlL1wiLFxuICAgICAgXCI8cm9vdERpcj4vZG9jcy9cIixcbiAgICAgIFwiPHJvb3REaXI+L2RlbW8vXCIsXG4gICAgICBcIjxyb290RGlyPi9ub2RlX21vZHVsZXMvXCIsXG4gICAgICBcIi9ub2RlX21vZHVsZXMvXCJcbiAgICBdLFxuICAgIFwibm90aWZ5XCI6IHRydWUsXG4gICAgXCJwcmVzZXRcIjogXCJyZWFjdC1uYXRpdmVcIlxuICB9LFxuICBcImtleXdvcmRzXCI6IFtcbiAgICBcImNoYXRlbmdpbmVcIixcbiAgICBcImNoYXRcIixcbiAgICBcInNka1wiLFxuICAgIFwicmVhbHRpbWVcIixcbiAgICBcInB1Ym51YlwiLFxuICAgIFwibm90aWZpY2F0aW9uc1wiXG4gIF1cbn1cbiIsIi8qKlxuICogQGZpbGUge0BsaW5rIENoYXRFbmdpbmV9IHBsdWdpbiB3aGljaCBhbGxvdyB0byBtb2RpZnkgZW1pdHRlZCBldmVudCBwYXlsb2FkIHRvIGluY2x1ZGVcbiAqIGluZm9ybWF0aW9uIHdoaWNoIHNob3VsZCBiZSBwYXNzZWQgdGhyb3VnaCBBUE5TIGFuZC9vciBHQ00vRkNNIHRvIGRldmljZSBhcyByZW1vdGUgbm90aWZpY2F0aW9uXG4gKiBkYXRhLlxuICpcbiAqIEBtb2R1bGUgY2hhdC1lbmdpbmUtcHVzaC1ub3RpZmljYXRpb25zLXBheWxvYWRcbiAqIEByZXF1aXJlcyB7QGxpbmsgQ2hhdEVuZ2luZX1cbiAqXG4gKiBAYXV0aG9yIFNlcmhpaSBNYW1vbnRvdiA8c2VyZ2V5QHB1Ym51Yi5jb20+XG4gKi9cblxuY29uc3QgdXVpZHY0ID0gcmVxdWlyZSgndXVpZC92NCcpO1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtPYmplY3R9IFtjb25maWd1cmF0aW9uXSAtIFBsdWdpbiBjb25maWd1cmF0aW9uIG9iamVjdC5cbiAqIEBwYXJhbSB7IVN0cmluZ1tdfSBbY29uZmlndXJhdGlvbi5ldmVudHNdIC0gTGlzdCBvZiBldmVudHMgZm9yIHdoaWNoIHBsdWdpbiBzaG91bGQgcmVxdWVzdFxuICogICAgIHBheWxvYWRzIHRocm91Z2ggcHJvdmlkZWQgY2FsbGJhY2sgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge1N0cmluZ1tdfSBbY29uZmlndXJhdGlvbi5wbGF0Zm9ybXM9Wydpb3MnLCAnYW5kcm9pZCddXSAtIExpc3Qgb2YgcGxhdGZvcm1zIGZvciB3aGljaFxuICogICAgICdzZWVuJyBub3RpZmljYXRpb24gcGF5bG9hZCBzaG91bGQgYmUgY3JlYXRlZCwgaWYgcmVxdWlyZWQuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtjb25maWd1cmF0aW9uLmFwcGVuZEV2ZW50PWZhbHNlXSAtIFdoZXRoZXIgb3JpZ2luYWwgZXZlbnQgc2hvdWxkIGJlIGFwcGVuZGVkIHRvXG4gKiAgICAgbm90aWZpY2F0aW9uIHBheWxvYWQgdW5kZXIgJ2NlcGF5bG9hZCcga2V5LCBzbyBkYXRhIGNhbiBiZSB1c2VkIHdoZW4gbm90aWZpY2F0aW9uIHJlY2VpdmVkIGJ5XG4gKiAgICAgZGV2aWNlLlxuICogQHBhcmFtIHtmdW5jdGlvbihwYXlsb2FkOk9iamVjdCk6T2JqZWN0fSBbY29uZmlndXJhdGlvbi5mb3JtYXR0ZXJdIC0gQ2FsbGVkIGVhY2ggdGltZSB3aGVuXG4gKiAgICAge0BsaW5rIENoYXRFbmdpbmV9IGlzIGFib3V0IHRvIHNlbmQgb25lIG9mIHRyYWNrZWQgYGV2ZW50c2AgbWFrZSBsYXlvdXQgZm9ybWF0dGluZyBmb3JcbiAqICAgICBub3RpZmljYXRpb24uXG4gKlxuICogQGV4YW1wbGVcbiAqIC8vIFByb3ZpZGluZyBjb25maWd1cmF0aW9uLCB3aGljaCB3aWxsIGFwcGVuZCBDaGF0RW5naW5lXG4gKiAvLyBldmVudHMgcGF5bG9hZCB0byBub3RpZmljYXRpb25zJyBwYXlsb2FkIGFuZCBjYWxsXG4gKiAvLyBmb3JtYXR0ZXIgb25seSBmb3IgdHdvIHR5cGUgb2YgZXZlbnRzLlxuICogbGV0IGNvbmZpZ3VyYXRpb24gPSB7XG4gKiAgICAgZXZlbnRzOiBbJ21lc3NhZ2UnLCAncGluZyddLFxuICogICAgIGFwcGVuZEV2ZW50OiB0cnVlLFxuICogICAgIGZvcm1hdHRlcjogKGV2ZW50UGF5bG9hZCkgPT4gKHtcbiAqICAgICAgICAgYXBuczogeyBhcHM6IHsgYWxlcnQ6IHsgdGl0bGU6ICdUZXN0IHRpdGxlJywgYm9keTogJ1Rlc3QgYm9keScgfSB9IH0sXG4gKiAgICAgICAgIGdjbTogeyBkYXRhOiB7IGNvbnRlbnRUaXRsZTogJ1Rlc3QgdGl0bGUnLCBjb250ZW50VGV4dDogJ1Rlc3QgYm9keScsIHRpY2tlcjogJ1Rlc3RpbmcnIH0gfVxuICogICAgIH0pXG4gKiB9O1xuICpcbiAqIGNoYXQucGx1Z2luKENoYXRFbmdpbmVDb3JlLnBsdWdpblsnY2hhdC1lbmdpbmUtcHVzaC1ub3RpZmljYXRpb25zLXBheWxvYWQnXShjb25maWd1cmF0aW9uKSk7XG4gKlxuICogLy8gTWFyayBzcGVjaWZpYyBub3RpZmljYXRpb24gZm9yIGV2ZW50IGFzIHNlZW4uXG4gKiBjaGF0Lm9uKCdtZXNzYWdlJywgKHBheWxvYWQpID0+IHtcbiAqICAgICBjaGF0Lm5vdGlmaWNhdGlvbnNQYXlsb2FkLm1hcmtOb3RpZmljYXRpb25Bc1NlZW4ocGF5bG9hZCk7XG4gKiB9KTtcbiAqXG4gKiAvLyBNYXJrIGFsbCBub3RpZmljYXRpb25zIGZvciBldmVudCBhcyBzZWVuLlxuICogY2hhdC5ub3RpZmljYXRpb25zUGF5bG9hZC5tYXJrQWxsTm90aWZpY2F0aW9uQXNTZWVuKCk7XG4gKlxuICogLy8gTGlzdGVuIGZvciBub3RpZmljYXRpb24gZm9yIGV2ZW50ICdzZWVuJyBldmVudC5cbiAqIGNoYXQub24oJyRub3RpZmljYXRpb25zLnNlZW4nLCAocGF5bG9hZCkgPT4ge1xuICogICAgIGNvbnNvbGUubG9nKHBheWxvYWQuZGF0YS5laWQsICcgaGFzIGJlZW4gc2VlbiBmcm9tIGFub3RoZXIgQ2hhdEVuZ2luZSBpbnN0YW5jZScpO1xuICogfSk7XG4gKlxuICogQHJldHVybiB7T2JqZWN0fSBDb25maWd1cmVkIHB1c2ggbm90aWZpY2F0aW9uIHBheWxvYWQgcGx1Z2luIG9iamVjdC5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSAoY29uZmlndXJhdGlvbiA9IHt9KSA9PiB7XG4gICAgY29uZmlndXJhdGlvbi5ldmVudHMgPSBjb25maWd1cmF0aW9uLmV2ZW50cyB8fCBbXTtcbiAgICBjb25maWd1cmF0aW9uLmZvcm1hdHRlciA9IGNvbmZpZ3VyYXRpb24uZm9ybWF0dGVyIHx8ICgoKSA9PiB7fSk7XG4gICAgaWYgKGNvbmZpZ3VyYXRpb24uYXBwZW5kRXZlbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25maWd1cmF0aW9uLmFwcGVuZEV2ZW50ID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZ3VyYXRpb24ucGxhdGZvcm1zID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uZmlndXJhdGlvbi5wbGF0Zm9ybXMgPSBbJ2lvcycsICdhbmRyb2lkJ107XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZ3VyYXRpb24uZXZlbnRzLmluZGV4T2YoJyRub3RpZmljYXRpb25zLnNlZW4nKSA9PT0gLTEpIHtcbiAgICAgICAgY29uZmlndXJhdGlvbi5ldmVudHMucHVzaCgnJG5vdGlmaWNhdGlvbnMuc2VlbicpO1xuICAgIH1cblxuICAgIGxldCBlbWl0TWlkZGxld2FyZSA9IHt9O1xuXG4gICAgLyoqXG4gICAgICogRXZlbnQgY2F0ZWdvcnkgbmFtZSBjb21wb3NpdGlvbiBmcm9tIG5hbWUgb2YgZW1pdHRlZCBldmVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCAtIE9iamVjdCB3aGljaCBoYXMgYmVlbiBlbWl0dGVkIGJ5IHVzZXIuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IENoYXRFbmdpbmUgbm90aWZpY2F0aW9uIGNhdGVnb3J5IG5hbWUuXG4gICAgICovXG4gICAgY29uc3QgY2F0ZWdvcnlGb3JFdmVudCA9IChldmVudCkgPT4ge1xuICAgICAgICBsZXQgY2xlYW5FdmVudE5hbWUgPSBldmVudC5pbmRleE9mKCckJykgPT09IDAgPyBldmVudC5zbGljZShldmVudC5pbmRleE9mKCcuJykgPT09IDEgPyAyIDogMSkgOiBldmVudDtcblxuICAgICAgICByZXR1cm4gYGNvbS5wdWJudWIuY2hhdC1lbmdpbmUuJHtjbGVhbkV2ZW50TmFtZX1gO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBOb3JtYWxpemUga2V5cyBmb3IgYG5vdGlmaWNhdGlvbmAgYW5kIGFkZCBpbmZvcm1hdGlvbiBhYm91dCBvcmlnaW5hbCBDaGF0RW5naW5lIGV2ZW50IGludG9cbiAgICAgKiBwYXlsb2FkLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnRQYXlsb2FkIC0gT2JqZWN0IHdoaWNoIGhhcyBiZWVuIGVtaXR0ZWQgYnkgdXNlci5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcHVzaFBheWxvYWQgLSBPYmplY3Qgd2l0aCBub3RpZmljYXRpb24ga2V5cyBmb3IgcmVxdWlyZWQgcGxhdGZvcm1zLlxuICAgICAqL1xuICAgIGNvbnN0IHBheWxvYWROb3JtYWxpemUgPSAoZXZlbnRQYXlsb2FkLCBwdXNoUGF5bG9hZCkgPT4ge1xuICAgICAgICBjb25zdCBub3JtYWxpemVkUGF5bG9hZCA9IE9iamVjdC5hc3NpZ24oe30sIHB1c2hQYXlsb2FkKTtcbiAgICAgICAgbGV0IGNhdGVnb3J5ID0gY2F0ZWdvcnlGb3JFdmVudChldmVudFBheWxvYWQuZXZlbnQpO1xuICAgICAgICBldmVudFBheWxvYWQuZWlkID0gZXZlbnRQYXlsb2FkLmVpZCB8fCB1dWlkdjQoKTtcbiAgICAgICAgY29uc3Qgc2hvdWxkQXBwZW5kID0gY29uZmlndXJhdGlvbi5hcHBlbmRFdmVudCB8fCBldmVudFBheWxvYWQuZXZlbnQgPT09ICckbm90aWZpY2F0aW9ucy5zZWVuJztcbiAgICAgICAgbGV0IGNoYXRFbmdpbmVQYXlsb2FkID0ge1xuICAgICAgICAgICAgc2VuZGVyOiBldmVudFBheWxvYWQuc2VuZGVyLFxuICAgICAgICAgICAgY2hhdDogZXZlbnRQYXlsb2FkLmNoYXQuY2hhbm5lbCxcbiAgICAgICAgICAgIGV2ZW50OiBldmVudFBheWxvYWQuZXZlbnQsXG4gICAgICAgICAgICBkYXRhOiBldmVudFBheWxvYWQuZGF0YSxcbiAgICAgICAgICAgIGVpZDogZXZlbnRQYXlsb2FkLmVpZCxcbiAgICAgICAgICAgIGNhdGVnb3J5XG4gICAgICAgIH07XG5cbiAgICAgICAgT2JqZWN0LmtleXMobm9ybWFsaXplZFBheWxvYWQpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ2FwbnMnIHx8IGtleSA9PT0gJ2djbScpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBub3RpZmljYXRpb25QYXlsb2FkID0gT2JqZWN0LmFzc2lnbih7fSwgbm9ybWFsaXplZFBheWxvYWRba2V5XSk7XG4gICAgICAgICAgICAgICAgbGV0IG5vdGlmaWNhdGlvbkNFUGF5bG9hZCA9IG5vdGlmaWNhdGlvblBheWxvYWQuY2VwYXlsb2FkIHx8IChub3RpZmljYXRpb25QYXlsb2FkLmRhdGEgfHwge30pLmNlcGF5bG9hZDtcblxuICAgICAgICAgICAgICAgIGlmIChub3RpZmljYXRpb25DRVBheWxvYWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb25DRVBheWxvYWQgPSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGV0IGNlcGF5bG9hZCA9IE9iamVjdC5hc3NpZ24oe30sIGNoYXRFbmdpbmVQYXlsb2FkKTtcbiAgICAgICAgICAgICAgICBjZXBheWxvYWQuZGF0YSA9IE9iamVjdC5hc3NpZ24oe30sIGNoYXRFbmdpbmVQYXlsb2FkLmRhdGEsIG5vdGlmaWNhdGlvbkNFUGF5bG9hZC5kYXRhIHx8IHt9KTtcbiAgICAgICAgICAgICAgICBjZXBheWxvYWQuY2F0ZWdvcnkgPSBub3RpZmljYXRpb25DRVBheWxvYWQuY2F0ZWdvcnkgfHwgY2VwYXlsb2FkLmNhdGVnb3J5O1xuXG5cbiAgICAgICAgICAgICAgICBpZiAoc2hvdWxkQXBwZW5kICYmIGtleSA9PT0gJ2FwbnMnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChub3RpZmljYXRpb25QYXlsb2FkLmFwcy5jYXRlZ29yeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjZXBheWxvYWQuY2F0ZWdvcnkgPSBub3RpZmljYXRpb25QYXlsb2FkLmFwcy5jYXRlZ29yeTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvblBheWxvYWQuYXBzLmNhdGVnb3J5ID0gY2VwYXlsb2FkLmNhdGVnb3J5O1xuICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb25QYXlsb2FkLmNlcGF5bG9hZCA9IGNlcGF5bG9hZDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNob3VsZEFwcGVuZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobm90aWZpY2F0aW9uUGF5bG9hZC5kYXRhID09PSBudWxsIHx8IG5vdGlmaWNhdGlvblBheWxvYWQuZGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb25QYXlsb2FkLmRhdGEgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChub3RpZmljYXRpb25QYXlsb2FkLmRhdGEuY2F0ZWdvcnkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2VwYXlsb2FkLmNhdGVnb3J5ID0gbm90aWZpY2F0aW9uUGF5bG9hZC5kYXRhLmNhdGVnb3J5O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uUGF5bG9hZC5kYXRhID0gT2JqZWN0LmFzc2lnbih7fSwgbm90aWZpY2F0aW9uUGF5bG9hZC5kYXRhLCB7IGNlcGF5bG9hZCB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBkZWxldGUgbm9ybWFsaXplZFBheWxvYWRba2V5XTtcbiAgICAgICAgICAgICAgICBub3JtYWxpemVkUGF5bG9hZFtgcG5fJHtrZXl9YF0gPSBub3RpZmljYXRpb25QYXlsb2FkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBPYmplY3QuYXNzaWduKGV2ZW50UGF5bG9hZCwgbm9ybWFsaXplZFBheWxvYWQpO1xuXG4gICAgICAgIHJldHVybiBldmVudFBheWxvYWQ7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdCBwYXlsb2FkIG9mIG5vdGlmaWNhdGlvbiB3aGljaCBpcyB1c2VkIHRvIG5vdGlmeSBvdGhlciB1c2VyIGRldmljZXMgd2hhdCBwYXJ0aWN1bGFyXG4gICAgICogbm90aWZpY2F0aW9uIGFscmVhZHkgc2Vlbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50UGF5bG9hZCAtIFBheWxvYWQgd2hpY2ggaGFzIGJlZW4gcmVjZWl2ZWQgd2l0aCAnY2hhdC5vbicgYW5kIGNvbnRhaW4gcHVzaFxuICAgICAqICAgICBub3RpZmljYXRpb24gcGF5bG9hZC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ1tdfSBwbGF0Zm9ybXMgLSBOYW1lIG9mIHBsYXRmb3JtcyBmb3Igd2hpY2ggcHVzaCBub3RpZmljYXRpb25zIHNob3VsZCBiZVxuICAgICAqICAgICBjcmVhdGVkLlxuICAgICAqL1xuICAgIGNvbnN0IHNlZW5Ob3RpZmljYXRpb24gPSAoZXZlbnRQYXlsb2FkLCBwbGF0Zm9ybXMpID0+IHtcbiAgICAgICAgY29uc3QgY2VwYXlsb2FkID0gT2JqZWN0LmFzc2lnbih7fSwgeyBkYXRhOiBldmVudFBheWxvYWQuZGF0YSB9KTtcbiAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uID0ge307XG5cbiAgICAgICAgcGxhdGZvcm1zLmZvckVhY2goKHBsYXRmb3JtKSA9PiB7XG4gICAgICAgICAgICBpZiAocGxhdGZvcm0gPT09ICdpb3MnKSB7XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uLmFwbnMgPSB7IGFwczogeyAnY29udGVudC1hdmFpbGFibGUnOiAxLCBzb3VuZDogJycgfSwgY2VwYXlsb2FkIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5nY20gPSB7IGRhdGE6IHsgY2VwYXlsb2FkIH0gfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIG5vdGlmaWNhdGlvbjtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogV3JhcHBlciBhcm91bmQgdXNlci1wcm92aWRlZCBmb3JtYXR0ZXIgY2FsbGJhY2suXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0NoYXRFbmdpbmVFdmVudFBheWxvYWR9IHBheWxvYWQgLSBFbWl0dGVkIHtAbGluayBFdmVudH0gcGF5bG9hZC5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKHJlamVjdCwgZGF0YTogT2JqZWN0KX0gbmV4dCAtIE1pZGRsZXdhcmUgcXVldWUgcHJvY2Vzc2luZyBjb21wbGV0aW9uIGhhbmRsZXIuXG4gICAgICovXG4gICAgY29uc3QgZm9ybWF0dGVyID0gKHBheWxvYWQsIG5leHQpID0+IHtcbiAgICAgICAgbGV0IHB1c2hQYXlsb2FkID0ge307XG5cbiAgICAgICAgaWYgKHBheWxvYWQuZXZlbnQgPT09ICckbm90aWZpY2F0aW9ucy5zZWVuJykge1xuICAgICAgICAgICAgcHVzaFBheWxvYWQgPSBzZWVuTm90aWZpY2F0aW9uKHBheWxvYWQsIGNvbmZpZ3VyYXRpb24ucGxhdGZvcm1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHB1c2hQYXlsb2FkID0gY29uZmlndXJhdGlvbi5mb3JtYXR0ZXIocGF5bG9hZCkgfHwge307XG4gICAgICAgIH1cblxuICAgICAgICBuZXh0KG51bGwsIHBheWxvYWROb3JtYWxpemUocGF5bG9hZCwgcHVzaFBheWxvYWQpKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQXNzaWduIGV2ZW50IHBheWxvYWQgZm9ybWF0dGVyIGZvciBlYWNoIGBldmVudGAgZnJvbSBgY29uZmlndXJhdGlvbmAuXG4gICAgICovXG4gICAgaWYgKGNvbmZpZ3VyYXRpb24uZXZlbnRzLmluZGV4T2YoJyonKSAhPT0gLTEpIHtcbiAgICAgICAgZW1pdE1pZGRsZXdhcmVbJyonXSA9IGZvcm1hdHRlcjtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25maWd1cmF0aW9uLmV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgICAgICAgZW1pdE1pZGRsZXdhcmVbZXZlbnRdID0gZm9ybWF0dGVyO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjbGFzcyBleHRlbnNpb24ge1xuICAgICAgICAvKipcbiAgICAgICAgICogTWFyayBwYXJ0aWN1bGFyIGV2ZW50IHBheWxvYWQgd2l0aCBwdXNoIG5vdGlmaWNhdGlvbiBwYXlsb2FkcyBhcyBzZWVuLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudFBheWxvYWQgLSBPYmplY3Qgd2hpY2ggaGFzIGJlZW4gZW1pdHRlZCBieSByZW1vdGUgdXNlci5cbiAgICAgICAgICovXG4gICAgICAgIG1hcmtOb3RpZmljYXRpb25Bc1NlZW4oZXZlbnRQYXlsb2FkKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnRQYXlsb2FkLnBuX2FwbnMgPT09IHVuZGVmaW5lZCAmJiBldmVudFBheWxvYWQucG5fZ2NtID09PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAmJiBldmVudFBheWxvYWQuZXZlbnQgIT09ICckbm90aWZpY2F0aW9ucy5zZWVuJyAmJiBldmVudFBheWxvYWQuZWlkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuQ2hhdEVuZ2luZS5tZS5kaXJlY3QuZW1pdCgnJG5vdGlmaWNhdGlvbnMuc2VlbicsIHsgZWlkOiBldmVudFBheWxvYWQuZWlkIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIE1hcmsgYWxsIG5vdGlmaWNhdGlvbnMgYXMgc2Vlbi5cbiAgICAgICAgICovXG4gICAgICAgIG1hcmtBbGxOb3RpZmljYXRpb25Bc1NlZW4oKSB7XG4gICAgICAgICAgICB0aGlzLkNoYXRFbmdpbmUubWUuZGlyZWN0LmVtaXQoJyRub3RpZmljYXRpb25zLnNlZW4nLCB7IGVpZDogJ2FsbCcgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBuYW1lc3BhY2U6ICdub3RpZmljYXRpb25zUGF5bG9hZCcsXG4gICAgICAgIGV4dGVuZHM6IHtcbiAgICAgICAgICAgIENoYXQ6IGV4dGVuc2lvblxuICAgICAgICB9LFxuICAgICAgICBtaWRkbGV3YXJlOiB7IGVtaXQ6IGVtaXRNaWRkbGV3YXJlIH1cbiAgICB9O1xufTtcbiJdfQ==
