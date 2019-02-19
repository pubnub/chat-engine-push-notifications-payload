import Plugin from '../../src/plugin';

describe('unittest::plugin', () => {
    describe('module.exports', () => {
        test('should export plugin', () => {
            expect(Plugin).toBeDefined();
        });

        test('should be function', () => {
            expect(typeof Plugin === 'function').toBeTruthy();
        });

        test('should return plugin object with single \'emit\' middleware list', () => {
            const pluginObject = new Plugin();

            expect(Object.keys(pluginObject.middleware.emit).length).toEqual(1);
            expect(Object.keys(pluginObject.middleware.emit)).toContain('$notifications.seen');
        });

        test('should return plugin object with \'emit\' middleware for each provided \'event\'', () => {
            const pluginObject = new Plugin({ events: ['$.invite', 'message'] });

            expect(Object.keys(pluginObject.middleware.emit)).toContain('$.invite');
            expect(Object.keys(pluginObject.middleware.emit)).toContain('message');
        });

        test('should return plugin object with single \'emit\' middleware when multiple \'events\' provided along with \'*\' event', () => {
            const pluginObject = new Plugin({ events: ['$.invite', 'message', '*'] });

            expect(Object.keys(pluginObject.middleware.emit)).not.toContain('$.invite');
            expect(Object.keys(pluginObject.middleware.emit)).not.toContain('message');
            expect(Object.keys(pluginObject.middleware.emit)).toContain('*');
        });
    });

    describe('formatter', () => {
        /** @type {Chat} */
        let testChat;
        let eventData;
        /** @type {ChatEngineEventPayload} */
        let eventPayload;
        let apnsPayload;
        let gcmPayload;

        beforeEach(() => {
            testChat = { channel: 'test-channel', plugins: [], plugin: () => {} };
            eventData = { text: 'Hello there!' };
            eventPayload = {
                chat: testChat,
                event: 'message',
                sender: 'tester',
                data: eventData
            };
            apnsPayload = { aps: { alert: { title: 'Test title', body: 'Test body' } } };
            gcmPayload = { data: { contentTitle: 'Test title', contentText: 'Test body', ticker: 'Testing' } };
        });

        test('should pass provided event payload to formatter callback', () => {
            let callbackCalled = false;
            const pluginObject = new Plugin({
                events: ['message'],
                formatter: (payload) => {
                    callbackCalled = true;
                    expect(payload).toEqual(eventPayload);
                }
            });

            pluginObject.middleware.emit.message(eventPayload, () => {});
            expect(callbackCalled).toBeTruthy();
        });

        test('should not change provided payload if formatter not provided', () => {
            const pluginObject = new Plugin({ events: ['message'] });

            pluginObject.middleware.emit.message(eventPayload, () => {});

            expect(eventPayload.data).toEqual(eventData);
        });

        test('should not change provided payload if formatter return unknown data', () => {
            const pluginObject = new Plugin({
                events: ['message'],
                formatter: () => ({
                    debug: 'Test message'
                })
            });

            pluginObject.middleware.emit.message(eventPayload, () => {});

            expect(eventPayload.pn_apns).not.toBeDefined();
            expect(eventPayload.pn_gcm).not.toBeDefined();
        });

        test('should not append cepayload', () => {
            const pluginObject = new Plugin({
                events: ['message'],
                formatter: () => ({
                    apns: apnsPayload,
                    gcm: gcmPayload
                })
            });

            pluginObject.middleware.emit.message(eventPayload, () => {});

            expect(eventPayload.pn_apns).toBeDefined();
            expect(eventPayload.pn_apns.cepayload).not.toBeDefined();
            expect(eventPayload.pn_gcm).toBeDefined();
            expect(eventPayload.pn_gcm.data.cepayload).not.toBeDefined();
        });

        test('should add provided APN payload when formatter specified', () => {
            const pluginObject = new Plugin({
                appendEvent: true,
                events: ['message'],
                formatter: () => ({
                    apns: apnsPayload
                })
            });

            pluginObject.middleware.emit.message(eventPayload, () => {});

            expect(eventPayload.pn_apns).toBeDefined();
            expect(eventPayload.pn_apns.cepayload).toBeDefined();
            delete eventPayload.pn_apns.cepayload;

            expect(eventPayload.pn_apns).toEqual(apnsPayload);
        });

        test('should add provided GCM / FCM payload when formatter specified', () => {
            const pluginObject = new Plugin({
                appendEvent: true,
                events: ['message'],
                formatter: () => ({
                    gcm: gcmPayload
                })
            });

            pluginObject.middleware.emit.message(eventPayload, () => {});

            expect(eventPayload.pn_gcm).toBeDefined();
            expect(eventPayload.pn_gcm.data.cepayload).toBeDefined();
            delete eventPayload.pn_gcm.data.cepayload;
            expect(eventPayload.pn_gcm).toEqual(gcmPayload);
        });

        test('should add provided GCM / FCM data property, if missing in payload', () => {
            const pluginObject = new Plugin({
                appendEvent: true,
                events: ['message'],
                formatter: () => ({
                    gcm: {}
                })
            });

            pluginObject.middleware.emit.message(eventPayload, () => {});

            expect(eventPayload.pn_gcm).toBeDefined();
            expect(eventPayload.pn_gcm.data).toBeDefined();
        });

        test('should add provided payload for both platforms when formatter specified', () => {
            const pluginObject = new Plugin({
                appendEvent: true,
                events: ['message'],
                formatter: () => ({
                    apns: apnsPayload,
                    gcm: gcmPayload
                })
            });

            pluginObject.middleware.emit.message(eventPayload, () => {});

            expect(eventPayload.pn_apns).toBeDefined();
            expect(eventPayload.pn_apns.cepayload).toBeDefined();
            delete eventPayload.pn_apns.cepayload;
            expect(eventPayload.pn_apns).toEqual(apnsPayload);
            expect(eventPayload.pn_gcm).toBeDefined();
            expect(eventPayload.pn_gcm.data.cepayload).toBeDefined();
            delete eventPayload.pn_gcm.data.cepayload;
            expect(eventPayload.pn_gcm).toEqual(gcmPayload);
        });

        test('should add category for custom event', () => {
            const eventName = 'message';
            const pluginObject = new Plugin({
                appendEvent: true,
                events: [eventName],
                formatter: () => ({
                    apns: apnsPayload
                })
            });

            pluginObject.middleware.emit[eventName](eventPayload, () => {});

            expect(eventPayload.pn_apns).toBeDefined();
            expect(eventPayload.pn_apns.aps.category).toEqual('com.pubnub.chat-engine.message');
        });

        test('should add category for system event', () => {
            const eventName = '$.invite';
            let systemEventPayload = Object.assign({}, eventPayload, { event: eventName });
            const pluginObject = new Plugin({
                appendEvent: true,
                events: [eventName],
                formatter: () => ({
                    apns: apnsPayload
                })
            });

            pluginObject.middleware.emit[eventName](systemEventPayload, () => {});

            expect(systemEventPayload.pn_apns).toBeDefined();
            expect(systemEventPayload.pn_apns.aps.category).toEqual('com.pubnub.chat-engine.invite');
        });

        test('should add category for plugin event', () => {
            const eventName = '$typingIndicator.startTyping';
            let pluginEventPayload = Object.assign({}, eventPayload, { event: eventName });
            const pluginObject = new Plugin({
                appendEvent: true,
                events: [eventName],
                formatter: () => ({
                    apns: apnsPayload
                })
            });

            pluginObject.middleware.emit[eventName](pluginEventPayload, () => {});

            expect(pluginEventPayload.pn_apns).toBeDefined();
            expect(pluginEventPayload.pn_apns.aps.category).toEqual('com.pubnub.chat-engine.typingIndicator.startTyping');
        });

        test('should use existing category if cepayload field exists', () => {
            const eventName = 'message';
            let apnsPayloadWithCEPayload = Object.assign({}, apnsPayload);
            apnsPayloadWithCEPayload.cepayload = { category: 'test-data' };
            const pluginObject = new Plugin({
                appendEvent: true,
                events: [eventName],
                formatter: () => ({
                    apns: apnsPayloadWithCEPayload
                })
            });

            pluginObject.middleware.emit[eventName](eventPayload, () => {});

            expect(eventPayload.pn_apns).toBeDefined();
            expect(eventPayload.pn_apns.cepayload.category).toEqual('test-data');
        });

        test('should use existing category from provided payload', () => {
            const eventName = 'message';
            let apnsPayloadWithCategory = Object.assign({}, apnsPayload);
            let gcmPayloadWithCategory = Object.assign({}, gcmPayload);
            apnsPayloadWithCategory.aps.category = 'test-category';
            gcmPayloadWithCategory.data.category = 'test-category';
            const pluginObject = new Plugin({
                appendEvent: true,
                events: [eventName],
                formatter: () => ({
                    apns: apnsPayloadWithCategory,
                    gcm: gcmPayloadWithCategory
                })
            });

            pluginObject.middleware.emit[eventName](eventPayload, () => {});

            expect(eventPayload.pn_apns).toBeDefined();
            expect(eventPayload.pn_apns.aps.category).toEqual('test-category');

            expect(eventPayload.pn_gcm).toBeDefined();
            expect(eventPayload.pn_gcm.data.category).toEqual('test-category');
        });
    });
});
