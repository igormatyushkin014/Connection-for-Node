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
	socketIO: <Your SocketIO instance>,
	users: {
		onAdded: (user) => {
			// Handle new user
		},
		onEvent: (user, event, data) => {
			// Handle event from user
		},
		onRemoved: (user) => {
			// Handle user's removal
		}
	}
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

### Events

Documentation for events will be added soon.

## License

`Connection` is available under the Apache 2.0 license. See the [LICENSE](./LICENSE) file for more info.
