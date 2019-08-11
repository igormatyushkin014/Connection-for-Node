<p align="center">
    <a href="https://http://www.android.com">
        <img src="https://img.shields.io/badge/Created for-Node.js-teal.svg?style=flat">
    </a>
    <a href="https://http://www.android.com">
        <img src="https://img.shields.io/badge/Written in-TypeScript-purple.svg?style=flat">
    </a>
    <a href="https://tldrlegal.com/license/apache-license-2.0-(apache-2.0)">
        <img src="https://img.shields.io/badge/License-Apache 2.0-blue.svg?style=flat">
    </a>
</p>

## At a Glance

`Connection` identifies users connected to your server by [socket.io](https://socket.io).

## How to Get Started

If you use `npm`, type in Terminal:

```
npm install --save @imatyushkin/connection socket.io
npm install --save-dev @types/socket.io
```

If you prefer `yarn`, type:

```
yarn add @imatyushkin/connection socket.io
yarn add @types/socket.io --dev
```

## Usage

### Initial setup

`Connection` requires `SocketIO` server instance:

```typescript
const connection = new Connection({
	socketIO: <Your SocketIO instance>
});
```

### Users

Instead of low-level sockets, `Connection` considers every client as a `User`. Every user has:

- `id`: unique string that identifies user;
- `socket`: reference to socket object from `socket.io` library;
- `data`: optional object for storing user's data **(do whatever you want with this object)**.

To add new user, simply send socket to `Connection` instance:

```typescript
connection.add(socket);
```

To remove the user, write this:

```typescript
connection.remove(socket);
```

The list of existing users is accesible via:

```typescript
connection.getUsers()
```

You can handle user-related events within the configuration of your `Connection` instance:

```typescript
const connection = new Connection({
	socketIO: <Your SocketIO instance>,
	users: {
		onAdded: (user) => {
			// Handle new user
		},
		onReceived: (message, sender) => {
			// Handle incoming message
		},
		onSent: (message, sender) => {
			// Handle outgoing message
		},
		onRemoved: (user) => {
			// Handle user's removal
		}
	}
});
```

### Messages

In `socket.io`, every message sent between client and server includes event name and (optionally) some data. In `Connection`, event name is optional. You can set default event name that will be used when no event was specified in particular message:

```typescript
const connection = new Connection({
	socketIO: <Your SocketIO instance>,
	messages: {
		defaultEvent: "PUT-DEFAULT-EVENT-NAME-HERE"
	}
});
```

Sending message from server to user is extremely simple:

```typescript
connection.send(
	{
		event: "Greeting",
		data: {
			text: "Hello"
		}
	},
	"RECIPIENT-ID"
);
```

If you want to use default event, then write:

```typescript
connection.send(
	{
		data: {
			text: "Hello"
		}
	},
	"RECIPIENT-ID"
);
```

Let's assume we want to say hello to the first user on the list:

```typescript
let user = connection.getUsers()[0];
connection.send(
	{
		data: {
			text: "Hello"
		}
	},
	user.id
);
```

## License

`Connection` is available under the Apache 2.0 license. See the [LICENSE](./LICENSE) file for more info.
