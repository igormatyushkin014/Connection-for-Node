<p align="center">
	<img src="images/logo.png" alt="Manifest" title="Manifest">
</p>

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

`Connection` is a new way of socket communication. It automatically converts sockets into user profiles and helps developer to associate personal data with each connected user. Also, `Connection` simplifies socket networking by asynchronous callbacks. The library is built on top of [socket.io](https://socket.io).

## How to Get Started

If you use `npm`, type in Terminal:

```
npm install --save @imatyushkin/connection
```

If you prefer `yarn`, type:

```
yarn add @imatyushkin/connection
```

## Usage

### Initial setup

`Connection` requires HTTP or HTTPS server instance:

```typescript
const connection = new Connection({
	server: <HTTP or HTTPS server instance>
});
```

### Users

Instead of low-level sockets, `Connection` considers every client as a `User`. Every user has:

- `id`: unique string that identifies user;
- `socket`: reference to socket object from `socket.io` library;
- `data`: optional object for storing user's data **(do whatever you want with this object)**.

The list of existing users is accesible via:

```typescript
connection.getUsers()
```

You can handle user-related events within the configuration of your `Connection` instance:

```typescript
const connection = new Connection({
	server: <HTTP or HTTPS server instance>,
	users: {
		onConnected: (user) => {
			/*
				Handle new user.
			*/
			console.log(`Added user with ID: ${user.id}`);
		},
		onDisconnected: (user) => {
			/*
				Handle user's disconnection.
			*/
			console.log(`Removed user with ID: ${user.id}`);
		}
	}
});
```

### Request and Response

In `socket.io`, every message sent between client and server includes event name and (optionally) some data. In `Connection` library, we use a different way of communication: request and response. It's similar to regular APIs where we send data by HTTP channel and (sometimes) receive response.

Because `Connection` uses `socket.io` under the hood, it actually sends socket messages between client and server. By default, we use `connection.event` string for event name. If by some reason you want to change default event name, you still can do this via configuration object:

```typescript
const connection = new Connection({
	server: <HTTP or HTTPS server instance>,
	events: {
		defaultEvent: "DEFAULT-EVENT-NAME"
	}
});
```

To receive requests from client, set up your configuration:

```typescript
const connection = new Connection({
	server: <HTTP or HTTPS server instance>,
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
	text: "Hello"
});
```

### Conclusion

Here's an example of extended configuration for `Connection` instance:

```typescript
```typescript
const connection = new Connection({
	server: <HTTP or HTTPS server instance>,
	events: {
		defaultEvent: "CustomEvent"
	},
	users: {
		onConnected: (user) => {
			/*
				Handle new user.
			*/
			console.log(`Added user with ID: ${user.id}`);
		},
		onDisconnected: (user) => {
			/*
				Handle user's disconnection.
			*/
			console.log(`Removed user with ID: ${user.id}`);
		}
	},
	io: {
		onRequest: (request, respond) => {
			/*
				Handle request sent by client.
			*/
			let sender = request.from;
			
			if (request.data.requireGreeting) {
				/*
					We can send response to client by passing
					data to `respond` function.
				*/
				respond({
					text: `Hello, user "${sender.id}"!`
				});
			}
		}
	}
});
```

Most of things presented in configuration are optional. You can combine necessary settings to get the server functioning right.

## License

`Connection` is available under the Apache 2.0 license. See the [LICENSE](./LICENSE) file for more info.
