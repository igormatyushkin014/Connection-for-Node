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
			/*
				Handle new user.
			*/
			console.log(`Added user with ID: ${user.id}`);
		},
		onRemoved: (user) => {
			/*
				Handle user's removal.
			*/
			console.log(`Removed user with ID: ${user.id}`);
		}
	}
});
```

### Request and Response

In `socket.io`, every message sent between client and server includes event name and (optionally) some data. In `Connection` library, we use a different way of communication: request and response. It's similar to regular APIs where we send some data by HTTP channel and (sometimes) receive response.

Because `Connection` uses `socket.io` under the hood, it actually sends socket messages between client and server. By default, we use `connection.event` string for event name. If by some reason you want to change default event name, you still can do this via configuration object:

```typescript
const connection = new Connection({
	socketIO: <Your SocketIO instance>,
	events: {
		defaultEvent: "PUT-DEFAULT-EVENT-NAME-HERE"
	}
});
```

To receive requests from client, set up your configuration:

```typescript
const connection = new Connection({
	socketIO: <Your SocketIO instance>,
	io: {
		onRequest: (request, respond) => {
			/*
				Handle request sent by client.
			*/
			let sender = request.from;
			
			if (request.data.requireGreeting) {
				/*
					We can send response to client by passing data to `respond` function.
				*/
				respond({
					text: `Hello, user "${sender.id}"!`
				});
			}
		}
	}
});
```

Sending request from server to user is super simple:

```typescript
connection.send({
	to: "RECIPIENT-ID",
	data: {
		text: "Hello!"
	}
});
```

Let's assume we want to say hello to the first user on the list:

```typescript
let user = connection.getUsers()[0];
connection.send({
	to: user.id,
	data: {
		text: "Hello!"
	}
});
```

If you want to get response, add `callback` to the options:

```typescript
let user = connection.getUsers()[0];
connection.send({
	to: user.id,
	data: {
		text: "Hello!"
	},
	callback: (data) => {
		/*
			Handle response from client.
		*/
	}
});
```

Also, we can say hello to all users:

```typescript
connection.everyone({
	data: {
		text: "Hello"
	}
});
```

## License

`Connection` is available under the Apache 2.0 license. See the [LICENSE](./LICENSE) file for more info.
