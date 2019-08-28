<p align="center">
	<img src="images/logo.png" alt="Manifest" title="Manifest">
</p>

<p align="center">
	<a href="https://nodejs.org">
		<img src="https://img.shields.io/badge/Created for-Node.js-teal.svg?style=flat">
	</a>
	<a href="https://www.typescriptlang.org">
		<img src="https://img.shields.io/badge/Written in-TypeScript-purple.svg?style=flat">
	</a>
	<a href="https://tldrlegal.com/license/apache-license-2.0-(apache-2.0)">
		<img src="https://img.shields.io/badge/License-Apache 2.0-blue.svg?style=flat">
	</a>
</p>

## At a Glance

`Connection` is a new way of socket communication. It automatically converts sockets into client profiles and helps developer to associate personal data with each connected client. Also, `Connection` simplifies socket networking by asynchronous callbacks. The library is built on top of [socket.io](https://socket.io).

**Important note.** This is a server-side of `Connection` library. For client-side solution, take a look at [JavaScript version](https://github.com/igormatyushkin014/Connection.js).

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

### Clients

Instead of low-level sockets, `Connection` considers every client as instance of `Client` type. Every instance has:

- `id`: unique string that identifies client;
- `socket`: reference to socket object from `socket.io` library;
- `data`: optional object for storing client's data **(do whatever you want with this object)**.

The list of existing clients is accesible via:

```typescript
connection.getClients()
```

You can handle client-related events within the configuration of your `Connection` instance:

```typescript
const connection = new Connection({
	server: <HTTP or HTTPS server instance>,
	clients: {
		onConnected: (client) => {
			/*
				Handle new client.
			*/
			console.log(`Added client with ID: ${user.id}`);
		},
		onDisconnected: (client) => {
			/*
				Handle client's disconnection.
			*/
			console.log(`Removed client with ID: ${user.id}`);
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
					text: `Hello, client "${sender.id}"!`
				});
			}
		}
	}
});
```

Sending request from server to client is super simple:

```typescript
connection.send({
	to: "RECIPIENT-ID",
	data: {
		text: "Hello!"
	}
});
```

Let's assume we want to say hello to the first client on the list:

```typescript
let client = connection.getClients()[0];
connection.send({
	to: client.id,
	data: {
		text: "Hello!"
	}
});
```

If you want to get response, add `callback` to the options:

```typescript
let user = connection.getClients()[0];
connection.send({
	to: client.id,
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

Also, we can say hello to all connected clients:

```typescript
connection.everyone({
	text: "Hello"
});
```

### Conclusion

Here's an example of extended configuration for `Connection` instance:

```typescript
const connection = new Connection({
	server: <HTTP or HTTPS server instance>,
	events: {
		defaultEvent: "CustomEvent"
	},
	clients: {
		onConnected: (client) => {
			/*
				Handle new client.
			*/
			console.log(`Added client with ID: ${user.id}`);
		},
		onDisconnected: (client) => {
			/*
				Handle client's disconnection.
			*/
			console.log(`Removed client with ID: ${user.id}`);
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
					text: `Hello, client "${sender.id}"!`
				});
			}
		}
	}
});
```

Most of things presented in configuration are optional. You can combine necessary settings to get the server functioning right.

## License

`Connection` is available under the Apache 2.0 license. See the [LICENSE](./LICENSE) file for more info.
