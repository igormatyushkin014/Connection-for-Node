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
	Message
} from "./message";

import {
	ResponseHandler
} from "./response-handler";

import LibraryConfiguration from "../configuration/configuration";

export class Connection {

	private readonly store = new Store();

	private readonly requestIdProvider = new IdProvider();

	private readonly responseWaitingList: {
		requestId: string,
		handler: ResponseHandler
	}[] = [];

	constructor(
		private readonly configuration: ConnectionConfiguration
	) {
	}

	private getEventName(
		sourceEventName?: string
	) {
		if (sourceEventName) {
			return sourceEventName;
		} else if (this.configuration.messages) {
			return this.configuration.messages.defaultEvent;
		} else {
			return "";
		}
	}

	public add(
		socket: SocketIO.Socket,
		events: string[]
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
		events.forEach((event) => {
			socket.on(
				event,
				(data) => {
					let incomingMessage: Message = {
						event: event,
						data: data
					};
					let requestId = data[LibraryConfiguration.messages.requestIdentifierKey];

					if (requestId) {
						/*
							Поскольку запрос имеет уникальный идентификатор,
							подтверждаем получение запроса.
						*/
						let responseData: any = {};
						responseData[LibraryConfiguration.messages.requestIdentifierKey] = requestId;
						let responseMessage: Message = {
							event: LibraryConfiguration.messages.responseEvent,
							data: responseData
						};
						this.send(
							responseMessage,
							user.id
						);
					}

					if (this.configuration.users && this.configuration.users.onReceived) {
						this.configuration.users!.onReceived(
							incomingMessage,
							user
						);
					}
				}
			);
		});

		/*
			Реализуем поддержку callback'ов путем подписки на событие
			`LibraryConfiguration.messages.responseEvent`.
		*/
		socket.on(
			LibraryConfiguration.messages.responseEvent,
			(data) => {
				let requestIndex = this.responseWaitingList
					.findIndex((request) => {
						return request.requestId === data[LibraryConfiguration.messages.requestIdentifierKey];
					});

				if (requestIndex < 0 || requestIndex >= this.responseWaitingList.length) {
					return;
				}

				let request = this.responseWaitingList[requestIndex];
				request.handler();

				this.responseWaitingList.splice(requestIndex, 1);
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

	public send(
		message: Message,
		recipientId: string,
		callback?: ResponseHandler
	) {
		let recipient = this.store.getUserById(
			recipientId
		);

		if (!recipient) {
			return;
		}

		let event = this.getEventName(
			message.event
		);

		let requestId = ((): string | undefined => {
			if (callback) {
				/*
					Поскольку запрошен callback, генерируем уникальный идентификатор запроса.
				*/
				return this.requestIdProvider.getNextId();
			} else {
				return undefined;
			}
		})();
		
		let data = ((): any => {
			let sourceData = message.data ? message.data : {};
			let resultData = Object.assign({}, sourceData);

			if (requestId) {
				/*
					Идентификатор запроса будет отправлен вместе с остальной информацией о событии.
				*/
				resultData[LibraryConfiguration.messages.requestIdentifierKey] = requestId;
			}

			return resultData;
		})();

		if (requestId && callback) {
			/*
				Добавляем обработчик ответа в очередь.
			*/
			this.responseWaitingList.push({
				requestId: requestId,
				handler: callback
			});
		}

		recipient.socket.emit(
			event,
			data
		);

		if (this.configuration.users && this.configuration.users.onSent) {
			this.configuration.users.onSent(
				message,
				recipient
			);
		}
	}

	public sendToEveryone(
		message: Message
	) {
		let event = this.getEventName(
			message.event
		);
		let data = message.data;
		let onSent = this.configuration.users && this.configuration.users.onSent;

		this.store.getAllUsers()
			.forEach((user) => {
				user.socket.emit(
					event,
					data
				);

				if (onSent) {
					onSent(
						message,
						user
					);
				}
			});
	}
}
