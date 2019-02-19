/* eslint-disable no-unused-expressions,no-new,no-new-wrappers,no-new-object,no-array-constructor,import/named */
/* global test, expect, jasmine */
import ChatEngineCore from 'chat-engine';
import plugin from '../../src/plugin';

describe('integration::ChatEngineCore', () => {
    let chatEngine;

    beforeEach(() => {
        chatEngine = ChatEngineCore.create({ publishKey: process.env.PUBLISH_KEY, subscribeKey: process.env.SUBSCRIBE_KEY });
    });

    test('should provide interface for proto plugins', () => {
        expect(chatEngine.proto).toBeDefined();
    });

    test('should register proto plugin', () => {
        chatEngine.proto('Chat', plugin({ events: ['$.invite', 'message'], platforms: { ios: true, android: true } }));
        expect(chatEngine.protoPlugins.Chat.length).toBeGreaterThan(0);
    });
});

describe('integration::formatter', () => {
    const apnsPayload = { aps: { alert: { title: 'Test title', body: 'Test body' } } };
    const gcmPayload = { data: { contentTitle: 'Test title', contentText: 'Test body', ticker: 'Testing' } };
    let chatEngine;

    beforeEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
        chatEngine = ChatEngineCore.create({ publishKey: process.env.PUBLISH_KEY, subscribeKey: process.env.SUBSCRIBE_KEY });
        chatEngine.on('$.error.*', (error) => {
            console.log('ERROR:', error);
        });
    });

    afterEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 7000;
    });

    test('should use user-provided formatter with no notification appending ({} returned from formatter)', (done) => {
        const formatter = () => ({});
        let messageReceived = false;
        chatEngine.proto('Chat', plugin({ events: ['message'], formatter }));

        chatEngine.on('$.ready', () => {
            const messageHandler = (message) => {
                messageReceived = true;
                chatEngine.me.direct.off('message', messageHandler);
                expect(message.pn_apns).not.toBeDefined();
                expect(message.pn_gcm).not.toBeDefined();
                jest.clearAllTimers();
                done();
            };

            const connectionHandler = () => {
                chatEngine.me.direct.off('$.connected', connectionHandler);

                chatEngine.me.direct.on('message', messageHandler);
                chatEngine.me.direct.emit('message', { message: 'For chat' });
                let retryInterval = setInterval(() => {
                    if (!messageReceived) {
                        chatEngine.me.direct.emit('message', { message: 'For chat' });
                    } else {
                        clearInterval(retryInterval);
                    }
                }, 100);
            };

            if (!chatEngine.me.direct.connected) {
                chatEngine.me.direct.on('$.connected', connectionHandler);
            } else {
                connectionHandler();
            }
        });

        chatEngine.connect('pubnub', { works: true }, 'pubnub-secret');
    });

    test('should use user-provided formatter to append push notification to published message', (done) => {
        const formatter = () => ({ apns: apnsPayload, gcm: gcmPayload });
        let messageReceived = false;
        chatEngine.proto('Chat', plugin({ appendEvent: true, events: ['message'], formatter }));

        chatEngine.on('$.ready', () => {
            const messageHandler = (message) => {
                messageReceived = true;
                chatEngine.me.direct.off('message', messageHandler);
                expect(message.pn_apns).toBeDefined();
                expect(message.pn_apns.cepayload).toBeDefined();
                delete message.pn_apns.cepayload;
                expect(message.pn_apns).toEqual(apnsPayload);
                expect(message.pn_gcm).toBeDefined();
                expect(message.pn_gcm.data.cepayload).toBeDefined();
                delete message.pn_gcm.data.cepayload;
                expect(message.pn_gcm).toEqual(gcmPayload);
                jest.clearAllTimers();
                done();
            };

            const connectionHandler = () => {
                chatEngine.me.direct.off('$.connected', connectionHandler);

                chatEngine.me.direct.on('message', messageHandler);
                chatEngine.me.direct.emit('message', { message: 'For chat' });
                let retryInterval = setInterval(() => {
                    if (!messageReceived) {
                        chatEngine.me.direct.emit('message', { message: 'For chat' });
                    } else {
                        clearInterval(retryInterval);
                    }
                }, 500);
            };
            if (!chatEngine.me.direct.connected) {
                chatEngine.me.direct.on('$.connected', connectionHandler);
            } else {
                connectionHandler();
            }
        });

        chatEngine.connect('pubnub', { works: true }, 'pubnub-secret');
    });
});

describe('integration::seen', () => {
    const apnsPayload = { aps: { alert: { title: 'Test title', body: 'Test body' } } };
    const gcmPayload = { data: { contentTitle: 'Test title', contentText: 'Test body', ticker: 'Testing' } };
    let chatEngine;

    beforeEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
        chatEngine = ChatEngineCore.create({ publishKey: process.env.PUBLISH_KEY, subscribeKey: process.env.SUBSCRIBE_KEY });
        chatEngine.on('$.error.*', (error) => {
            console.log('ERROR:', error);
        });
    });

    afterEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 7000;
    });

    test('should emit \'$notifications.seen\' for \'all\'', (done) => {
        const formatter = () => ({ apns: apnsPayload, gcm: gcmPayload });
        let messageReceived = false;
        chatEngine.proto('Chat', plugin({ events: ['message', '$notifications.seen'], formatter }));

        chatEngine.on('$.ready', () => {
            const seenHandler = (seenEvent) => {
                chatEngine.me.direct.off('$notifications.seen', seenHandler);

                messageReceived = true;
                expect(seenEvent.pn_apns).toBeDefined();
                expect(seenEvent.pn_gcm).toBeDefined();
                expect(seenEvent.pn_apns.cepayload.data.eid).toEqual('all');
                expect(seenEvent.pn_gcm.data.cepayload.data.eid).toEqual('all');
                expect(seenEvent.data.eid).toEqual('all');
                jest.clearAllTimers();
                done();
            };

            const messageHandler = () => {
                chatEngine.me.direct.off('message', messageHandler);
                chatEngine.me.direct.on('$notifications.seen', seenHandler);
                chatEngine.me.direct.notificationsPayload.markAllNotificationAsSeen();
            };

            const connectionHandler = () => {
                chatEngine.me.direct.off('$.connected', connectionHandler);

                chatEngine.me.direct.on('message', messageHandler);
                chatEngine.me.direct.emit('message', { message: 'For chat' });
                let retryInterval = setInterval(() => {
                    if (!messageReceived) {
                        chatEngine.me.direct.emit('message', { message: 'For chat' });
                    } else {
                        clearInterval(retryInterval);
                    }
                }, 100);
            };

            if (!chatEngine.me.direct.connected) {
                chatEngine.me.direct.on('$.connected', connectionHandler);
            } else {
                connectionHandler();
            }
        });

        chatEngine.connect('pubnub', { works: true }, 'pubnub-secret');
    });

    test('should emit \'$notifications.seen\' for particular event', (done) => {
        const formatter = () => ({ apns: apnsPayload, gcm: gcmPayload });
        let messageReceived = false;
        let messageIdentifier;
        chatEngine.proto('Chat', plugin({
            events: ['message', '$notifications.seen'],
            platforms: ['ios'],
            formatter
        }));

        chatEngine.on('$.ready', () => {
            const seenHandler = (seenEvent) => {
                chatEngine.me.direct.off('$notifications.seen', seenHandler);

                messageReceived = true;
                expect(seenEvent.pn_apns).toBeDefined();
                expect(seenEvent.pn_apns.cepayload.data.eid).toEqual(messageIdentifier);
                expect(seenEvent.data.eid).toEqual(messageIdentifier);
                jest.clearAllTimers();
                done();
            };

            const messageHandler = (message) => {
                messageIdentifier = message.eid;
                chatEngine.me.direct.off('message', messageHandler);
                chatEngine.me.direct.on('$notifications.seen', seenHandler);
                chatEngine.me.direct.notificationsPayload.markNotificationAsSeen(message);
            };

            const connectionHandler = () => {
                chatEngine.me.direct.off('$.connected', connectionHandler);

                chatEngine.me.direct.on('message', messageHandler);
                chatEngine.me.direct.emit('message', { message: 'For chat' });
                let retryInterval = setInterval(() => {
                    if (!messageReceived) {
                        chatEngine.me.direct.emit('message', { message: 'For chat' });
                    } else {
                        clearInterval(retryInterval);
                    }
                }, 100);
            };

            if (!chatEngine.me.direct.connected) {
                chatEngine.me.direct.on('$.connected', connectionHandler);
            } else {
                connectionHandler();
            }
        });

        chatEngine.connect('pubnub', { works: true }, 'pubnub-secret');
    });

    test('should not emit \'$notifications.seen\' for event w/o notification payloads', (done) => {
        let messageReceived = false;
        chatEngine.proto('Chat', plugin({
            events: ['message', '$notifications.seen'],
            platforms: ['ios']
        }));

        chatEngine.on('$.ready', () => {
            const seenHandler = () => {
                chatEngine.me.direct.off('$notifications.seen', seenHandler);
                messageReceived = true;
            };

            const messageHandler = (message) => {
                chatEngine.me.direct.off('message', messageHandler);
                chatEngine.me.direct.on('$notifications.seen', seenHandler);
                chatEngine.me.direct.notificationsPayload.markNotificationAsSeen(message);

                let seenWaitInterval = setInterval(() => {
                    expect(messageReceived).toBeFalsy();
                    clearInterval(seenWaitInterval);
                    jest.clearAllTimers();
                    done();
                }, 2000);
            };

            const connectionHandler = () => {
                chatEngine.me.direct.off('$.connected', connectionHandler);

                chatEngine.me.direct.on('message', messageHandler);
                chatEngine.me.direct.emit('message', { message: 'For chat' });
                let retryInterval = setInterval(() => {
                    if (!messageReceived) {
                        chatEngine.me.direct.emit('message', { message: 'For chat' });
                    } else {
                        clearInterval(retryInterval);
                    }
                }, 100);
            };

            if (!chatEngine.me.direct.connected) {
                chatEngine.me.direct.on('$.connected', connectionHandler);
            } else {
                connectionHandler();
            }
        });

        chatEngine.connect('pubnub', { works: true }, 'pubnub-secret');
    });
});
