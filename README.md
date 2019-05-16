This repository is a part of the [ChatEngine Framework](https://github.com/pubnub/chat-engine).
For more information on building chat applications with PubNub, see our
[Chat Resource Center](http://www.pubnub.com/developers/chat-resource-center/).

# Push Notifications Payload Plugin

Adds the ability to add to modify event payload with data, which is used to trigger remote push 
notifications.

### Quick Start

0. Have ChatEngine instantiated and connected, and have a chat you want to enable for push 
notification payload addition
```js
const ChatEngine = ChatEngineCore.create({
    publishKey: 'pub-key-here',
    subscribeKey: 'sub-key-here',
});

ChatEngine.connect('uuid');
ChatEngine.on('$.ready', () => { ... });
```

1. Attach this plugin to the chat you want, in this case global
```js
let configuration = {
    events: ['message', 'ping'],
    formatter: (eventPayload) => ({
        apns: { aps: { alert: { title: 'Test title', body: 'Test body' } } },
        gcm: { data: { contentTitle: 'Test title', contentText: 'Test body', ticker: 'Testing' } } 
    })
};

/**
 * Call to 'plugin()' function on chat will register plugin only for that chat. 
 * 'global' is pre-defined chat, but can be any user-made chat.
 */
ChatEngine.global.plugin(ChatEngineCore.plugin['chat-engine-push-notifications-payload'](configuration));

/**
 * to register plugin for all created chats, place this line along with
 * configuration object before calling 'ChatEngine.connect()'.
 */
ChatEngine.proto('Chat', ChatEngineCore.plugin['chat-engine-push-notifications-payload'](configuration));
```

2. If it is required to mark notifications for event as `seen`, following methods can be used
```js
// Mark specific notification / event as seen.
ChatEngine.global.on('message', (payload) => {
    ChatEngine.global.notificationsPayload.markNotificationAsSeen(payload);
});
```
```js
// Mark all notifications / event as seen.
ChatEngine.global.notificationsPayload.markAllNotificationAsSeen();
```

3. Listen for the `$notifications.seen` events (on local user `direct` chat) to know, when this user 
seen notification for event on another device. 
```js
ChatEngine.me.direct.on('$notifications.seen', (payload) => {
    console.log(payload.data.eid, ' has been seen from another ChatEngine instance');
});
```

## Support

- If you **need help**, have a **general question**, have a **feature request** or to file a **bug**, contact <support@pubnub.com>.
