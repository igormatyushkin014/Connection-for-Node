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

	private static event = "connection.event";

	private readonly store: Store;

	private readonly idProvider: IdProvider;

	private readonly responseHandlers: {
		requestId: string,
		handler: io_raw.ResponseHandler
	}[];

	private socketIO?: SocketIO.Server;

	constructor(
		private readonly configuration: Configuration
	) {
		this.store = new Store();
		this.idProvider = new IdProvider();
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
				let client = this.add(
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
								client
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
						client
					);
				}
			}
		);
	}

	private getEvent() {
		return Connection.event;
	}

	private subscribeClientToEvents(
		client: Client
	) {
		client.socket.on(
			this.getEvent(),
			(data) => {
				if (io_raw.isRequest(data)) {
					this.handleIncomingRawRequest(
						data,
						client
					);
				} else if (io_raw.isResponse(data)) {
					this.handleIncomingRawResponse(
						data,
						client
					);
				} else if (io_rest.isRequest(data)) {
					this.handleIncomingRestRequest(
						data,
						client
					);
				} else {
					/*
						Неизвестный тип сообщения.
					*/
				}
			}
		);
	}

	private handleIncomingRawRequest(
		request: io_raw.Request,
		sender: Client
	) {
		let recipientId = request.recipientId;

		if (recipientId) {
			/*
				Поскольку сервер не является конечным получателем,
				перенаправляем запрос указанному получателю
				и завершаем обработку на стороне сервера.
			*/
			this.sendRequest({
				to: recipientId,
				data: request.data,
				callback: undefined
			});
			return;
		}

		let requestId = request.requestId;

		if (this.configuration.io && this.configuration.io.onRequest) {
			let handlerRequest = {
				from: sender,
				event: request.event,
				data: request.data
			};
			let handlerRespond = (data: any) => {
				this.sendResponse({
					to: sender.id,
					requestId: requestId,
					data: data
				});
			};
			this.configuration.io.onRequest(
				handlerRequest,
				handlerRespond
			);
		}
	}

	private handleIncomingRawResponse(
		response: io_raw.Response,
		sender: Client
	) {
		let responseHandler = this.getResponseHandler(
			response.requestId
		);

		if (responseHandler) {
			responseHandler(
				response.data
			);
			this.unregisterResponseHandler(
				response.requestId
			);
		}
	}

	private handleIncomingRestRequest(
		request: io_rest.Request,
		sender: Client
	) {
		let requestId = request.requestId;

		if (this.configuration.rest && this.configuration.rest.onRequest) {
			let handlerRequest = {
				from: sender,
				path: request.path,
				method: request.method,
				headers: request.headers,
				data: request.data
			};
			let handlerRespond = (data: any) => {
			};
			this.configuration.rest.onRequest(
				handlerRequest,
				handlerRespond
			);
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
		this.subscribeClientToEvents(
			client
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

	private registerResponseHandler(
		requestId: string,
		handler: io_raw.ResponseHandler
	) {
		this.responseHandlers.push({
			requestId: requestId,
			handler: handler
		});
	}

	private getResponseHandler(
		requestId: string
	): io_raw.ResponseHandler | undefined {
		let responseHandler = this.responseHandlers
			.find((responseHandler) => {
				return responseHandler.requestId === requestId;
			});
		return responseHandler ? responseHandler.handler : undefined;
	}

	private unregisterResponseHandler(
		requestId: string
	) {
		let handlerIndex = this.responseHandlers
			.findIndex((responseHandler) => {
				return responseHandler.requestId === requestId;
			});

		if (0 <= handlerIndex && handlerIndex < this.responseHandlers.length) {
			this.responseHandlers.splice(handlerIndex, 1);
		}
	}

	public getClients(): Client[] {
		return this.store.getAllClients();
	}

	private sendRequest(
		configuration: {
			to: string,
			event?: string,
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

		let requestId = this.idProvider.getNextId();

		if (configuration.callback) {
			/*
				Добавляем обработчик ответа в очередь.
			*/
			this.registerResponseHandler(
				requestId,
				configuration.callback
			);
		}

		let request: io_raw.Request = {
			type: "raw.request",
			requestId: requestId,
			event: configuration.event,
			data: configuration.data
		};

		recipient.socket.emit(
			this.getEvent(),
			request
		);
	}

	private sendResponse(
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

		let response: io_raw.Response = {
			type: "raw.response",
			requestId: configuration.requestId,
			data: configuration.data
		};

		recipient.socket.emit(
			this.getEvent(),
			response
		);
	}

	public send(
		configuration: {
			to: string,
			event?: string,
			data: any,
			callback?: io_raw.ResponseHandler
		}
	) {
		this.sendRequest(
			configuration
		);
	}

	public everyone(
		configuration: {
			event?: string,
			data: any
		}
	) {
		this.store.getAllClients()
			.forEach((client) => {
				this.sendRequest({
					to: client.id,
					event: configuration.event,
					data: configuration.data
				});
			});
	}
}
