import {
	ConnectionConfiguration
} from "./connection-configuration";

import {
	User
} from "../data/user";

import {
	Store
} from "./store";

import {
	IdProvider
} from "./id-provider";

import {
	Request,
	isRequest
} from "../io/request";

import {
	Response,
	isResponse
} from "../io/response";

import {
	ResponseHandler
} from "../io/response-handler";

export class Connection {

	private static defaultEvent = "connection.event";

	private readonly store = new Store();

	private readonly requestIdProvider = new IdProvider();

	private readonly responseHandlers: {
		requestId: string,
		handler: ResponseHandler
	}[] = [];

	constructor(
		private readonly configuration: ConnectionConfiguration
	) {
	}

	private getEvent() {
		if (this.configuration.events && this.configuration.events.defaultEvent) {
			return this.configuration.events.defaultEvent;
		} else {
			return Connection.defaultEvent;
		}
	}

	public add(
		socket: SocketIO.Socket
	): User {
		/*
			Создаем нового пользователя и добавляем его в базу.
		*/
		let user = this.store.createUser(
			socket
		);
		
		/*
			Добавляем подписку на все необходимые события.
		*/
		socket.on(
			this.getEvent(),
			(data) => {
				if (isRequest(data)) {
					/*
						Получен запрос.
					*/
					let requestId = data.requestId;

					if (this.configuration.io && this.configuration.io.onRequest) {
						let request = {
							requestId: requestId,
							from: user,
							data: data.data
						};
						let respond = (data: any) => {
							this.response({
								to: user.id,
								requestId: requestId,
								data: data
							});
						};
						this.configuration.io.onRequest(
							request,
							respond
						);
					}
				} else if (isResponse(data)) {
					/*
						Получен ответ на запрос.
					*/
					let responseHandlerIndex = this.responseHandlers
						.findIndex((responseHandler) => {
							return responseHandler.requestId === data.requestId;
						});

					if (responseHandlerIndex < 0 || responseHandlerIndex >= this.responseHandlers.length) {
						return;
					}

					let responseHandler = this.responseHandlers[responseHandlerIndex];
					responseHandler.handler(data.data);

					this.responseHandlers.splice(responseHandlerIndex, 1);
				} else {
					/*
						Неизвестный тип сообщения.
					*/
				}
			}
		);

		/*
			Если указан обработчик добавления пользователя в базу,
			вызываем данный обработчик.
		*/
		if (this.configuration.users && this.configuration.users.onAdded) {
			this.configuration.users.onAdded(
				user
			);
		}

		return user;
	}

	public remove(
		socket: SocketIO.Socket
	) {
		let user = this.store.getUserBySocketId(
			socket.id
		);
		
		if (user) {
			this.store.removeUserById(
				user.id
			);

			if (this.configuration.users && this.configuration.users.onRemoved) {
				this.configuration.users.onRemoved(
					user
				);
			}
		}
	}

	public getUsers(): User[] {
		return this.store.getAllUsers();
	}

	public request(
		configuration: {
			to: string,
			data: any,
			callback?: ResponseHandler
		}
	) {
		let recipient = this.store.getUserById(
			configuration.to
		);

		if (!recipient) {
			return;
		}

		let event = this.getEvent();
		let requestId = this.requestIdProvider.getNextId();

		if (configuration.callback) {
			/*
				Добавляем обработчик ответа в очередь.
			*/
			this.responseHandlers.push({
				requestId: requestId,
				handler: configuration.callback
			});
		}

		let request: Request = {
			type: "request",
			requestId: requestId,
			data: configuration.data
		};

		recipient.socket.emit(
			event,
			request
		);
	}

	public response(
		configuration: {
			to: string,
			requestId: string,
			data: any
		}
	) {
		let recipient = this.store.getUserById(
			configuration.to
		);

		if (!recipient) {
			return;
		}

		let event = this.getEvent();
		let response: Response = {
			type: "response",
			requestId: configuration.requestId,
			data: configuration.data
		};

		recipient.socket.emit(
			event,
			response
		);
	}
}
