import {
	Configuration
} from "./configuration";

import {
	Client
} from "../data/client";

import {
	Store
} from "./store";

import {
	IdProvider
} from "./id-provider";

import * as io_raw from "../io/raw";

import * as io_rest from "../io/rest";

import * as SocketIO from "socket.io";

export class Connection {

	private static defaultEvent = "connection.event";

	private readonly store: Store;

	private readonly requestIdProvider: IdProvider;

	private readonly responseHandlers: {
		requestId: string,
		handler: io_raw.ResponseHandler
	}[];

	private socketIO?: SocketIO.Server;

	constructor(
		private readonly configuration: Configuration
	) {
		this.store = new Store();
		this.requestIdProvider = new IdProvider();
		this.responseHandlers = [];
		this.setupSocketIO();
	}

	private setupSocketIO() {
		this.socketIO = require("socket.io")(
			this.configuration.server
		);
		this.socketIO!.on(
			"connection",
			(socket: SocketIO.Socket) => {
				let user = this.add(
					socket
				);

				socket.on(
					"disconnect",
					() => {
						this.store.removeUserBySocketId(
							socket.id
						);

						/*
							Если указан обработчик отключения пользователя,
							вызываем данный обработчик.
						*/
						if (this.configuration.clients && this.configuration.clients.onDisconnected) {
							this.configuration.clients.onDisconnected(
								user
							);
						}
					}
				);

				/*
					Если указан обработчик подключения нового пользователя,
					вызываем данный обработчик.
				*/
				if (this.configuration.clients && this.configuration.clients.onConnected) {
					this.configuration.clients.onConnected(
						user
					);
				}
			}
		);
	}

	private getEvent() {
		if (this.configuration.events && this.configuration.events.defaultEvent) {
			return this.configuration.events.defaultEvent;
		} else {
			return Connection.defaultEvent;
		}
	}

	private add(
		socket: SocketIO.Socket
	): Client {
		/*
			Создаем нового клиента и добавляем его в базу.
		*/
		let client = this.store.createClient(
			socket
		);
		
		/*
			Добавляем подписку на все необходимые события.
		*/
		socket.on(
			this.getEvent(),
			(data) => {
				if (io_raw.isRequest(data)) {
					/*
						Получен запрос.
					*/
					let recipientId = data.recipientId;

					if (recipientId) {
						/*
							Перенаправляем запрос получателю и завершаем обработку
							на стороне сервера.
						*/
						this.request({
							to: recipientId,
							data: data.data,
							callback: undefined
						});
						return;
					}

					let requestId = data.requestId;

					if (this.configuration.io && this.configuration.io.onRequest) {
						let request = {
							requestId: requestId,
							from: client,
							data: data.data
						};
						let respond = (data: any) => {
							this.response({
								to: client.id,
								requestId: requestId,
								data: data
							});
						};
						this.configuration.io.onRequest(
							request,
							respond
						);
					}
				} else if (io_raw.isResponse(data)) {
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

		return client;
	}

	private remove(
		socket: SocketIO.Socket
	) {
		let user = this.store.getClientBySocketId(
			socket.id
		);
		
		if (user) {
			this.store.removeClientById(
				user.id
			);
		}
	}

	public getClients(): Client[] {
		return this.store.getAllClients();
	}

	public request(
		configuration: {
			to: string,
			data: any,
			callback?: io_raw.ResponseHandler
		}
	) {
		let recipient = this.store.getClientById(
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

		let request: io_raw.Request = {
			type: "request",
			requestId: requestId,
			data: configuration.data
		};

		recipient.socket.emit(
			event,
			request
		);
	}

	public everyone(
		data: any
	) {
		this.store.getAllClients()
			.forEach((client) => {
				this.request({
					to: client.id,
					data: data
				});
			});
	}

	private response(
		configuration: {
			to: string,
			requestId: string,
			data: any
		}
	) {
		let recipient = this.store.getClientById(
			configuration.to
		);

		if (!recipient) {
			return;
		}

		let event = this.getEvent();
		let response: io_raw.Response = {
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
