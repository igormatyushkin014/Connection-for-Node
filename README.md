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

`Recognizer` identifies users connected to your server with socket. The library is built on top of [Socket.IO](https://socket.io).

## How to Get Started

If you use `npm`, type in Terminal:

```
npm install --save @imatyushkin/recognizer socket.io
npm install --save-dev @types/socket.io
```

If you prefer `yarn`, type:

```
yarn add @imatyushkin/recognizer socket.io
yarn add @types/socket.io --dev
```

## Usage

`Recognizer` requires SocketIO server instance:

```typescript
const recognizer = new Recognizer({
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

To add new user, simply send socket to recognizer:

```typescript
recognizer.add(socket);
```

To remove the user, write this:

```typescript
recognizer.remove(socket);
```

## License

`Recognizer` is available under the Apache 2.0 license. See the [LICENSE](./LICENSE) file for more info.
