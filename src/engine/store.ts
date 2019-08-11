import {
	IdProvider
} from "./id-provider";

import {
	User
} from "../data/user";

export class Store {

	private users = new Array<User>();

	private idProvider = new IdProvider();

	constructor() {
	}

	public getAllUsers(): User[] {
		return this.users.slice();
	}

	public getUserById(id: string): User | undefined {
		return this.users
			.find((user) => {
				return user.id === id;
			});
	}

	public getUserBySocketId(id: string): User | undefined {
		return this.users
			.find((user) => {
				return user.socket.id === id;
			});
	}

	public createUser(
		socket: SocketIO.Socket
	): User {
		let user: User = {
			id: this.idProvider.getNextId(),
			socket: socket,
			data: undefined
		};
		this.users.push(
			user
		);
		return user;
	}

	public removeUserById(
		id: string
	) {
		let index = this.users
			.findIndex((user) => {
				return user.id === id;
			});

		if (index >= 0 && index < this.users.length) {
			this.users.splice(index, 1);
		}
	}

	public removeUserBySocketId(
		id: string
	) {
		let index = this.users
			.findIndex((user) => {
				return user.socket.id === id;
			});

		if (index >= 0 && index < this.users.length) {
			this.users.splice(index, 1);
		}
	}
}
