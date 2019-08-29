import {
	IdProvider
} from "./id-provider";

import {
	Client
} from "../data/client";

export class Store {

	private clients = new Array<Client>();

	private idProvider = new IdProvider();

	constructor() {
	}

	public getAllClients(): Client[] {
		return this.clients.slice();
	}

	public getClientById(id: string): Client | undefined {
		return this.clients
			.find((client) => {
				return client.id === id;
			});
	}

	public getClientBySocketId(id: string): Client | undefined {
		return this.clients
			.find((client) => {
				return client.socket.id === id;
			});
	}

	public clientExistsWithId(id: string): Boolean {
		return this.clients
			.find((client) => {
				return client.id === id;
			}) != null;
	}

	public createClient(
		socket: SocketIO.Socket
	): Client {
		let client: Client = {
			id: this.idProvider.getNextId(),
			socket: socket,
			data: undefined
		};
		this.clients.push(
			client
		);
		return client;
	}

	public removeClientById(
		id: string
	) {
		let index = this.clients
			.findIndex((client) => {
				return client.id === id;
			});

		if (index >= 0 && index < this.clients.length) {
			this.clients.splice(index, 1);
		}
	}

	public removeUserBySocketId(
		id: string
	) {
		let index = this.clients
			.findIndex((client) => {
				return client.socket.id === id;
			});

		if (index >= 0 && index < this.clients.length) {
			this.clients.splice(index, 1);
		}
	}
}
