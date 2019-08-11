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
	Event
} from "./event";

import LibraryConfiguration from "../configuration/configuration";

export class Connection {

	private store = new Store();

	private waitingForReceiptConfirmationList: {
		requestId: string,
		handler: () => void
	}[] = [];

	constructor(
		private readonly configuration: ConnectionConfiguration
	) {
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
					let requestId = data[LibraryConfiguration.events.requestIdentifierKey];

					if (requestId) {
						/*
							Поскольку запрос имеет уникальный идентификатор,
							подтверждаем получение запроса.
						*/
						let confirmationEventData: any = {};
						confirmationEventData[LibraryConfiguration.events.requestIdentifierKey] = requestId;
						let confirmationEvent: Event = {
							name: LibraryConfiguration.events.receiptConfirmedEventName,
							data: confirmationEventData
						};
						this.send(
							confirmationEvent,
							user.id
						);
					}

					if (this.configuration.users && this.configuration.users.onEvent) {
						this.configuration.users!.onEvent(
							user,
							event,
							data
						);
					}
				}
			);
		});

		/*
			Реализуем поддержку callback'ов путем подписки на событие
			`LibraryConfiguration.events.receiptConfirmedEventName`.
		*/
		socket.on(
			LibraryConfiguration.events.receiptConfirmedEventName,
			(data) => {
				let requestIndex = this.waitingForReceiptConfirmationList
					.findIndex((request) => {
						return request.requestId === data[LibraryConfiguration.events.requestIdentifierKey];
					});

				if (requestIndex < 0 || requestIndex >= this.waitingForReceiptConfirmationList.length) {
					return;
				}

				let request = this.waitingForReceiptConfirmationList[requestIndex];
				request.handler();

				this.waitingForReceiptConfirmationList.splice(requestIndex, 1);
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
		event: Event,
		recipientId: string,
		callback?: () => void
	) {
		let recipient = this.store.getUserById(
			recipientId
		);

		if (!recipient) {
			return;
		}

		let sourceData = event.data ? event.data : {};
		let resultData = Object.assign({}, sourceData);

		if (callback) {
			/*
				Поскольку запрошен callback, генерируем уникальный идентификатор запроса.
				Идентификатор будет отправлен вместе с остальной информацией о событии.
			*/
			resultData[LibraryConfiguration.events.requestIdentifierKey] = new IdProvider().getNextId();
		}

		recipient.socket.emit(
			event.name,
			resultData
		);
	}

	public sendToEveryone(
		event: Event,
		callback?: () => void
	) {
		let sourceData = event.data ? event.data : {};
		let resultData = Object.assign({}, sourceData);

		if (callback) {
			/*
				Поскольку запрошен callback, генерируем уникальный идентификатор запроса.
				Идентификатор будет отправлен вместе с остальной информацией о событии.
			*/
			resultData[LibraryConfiguration.events.requestIdentifierKey] = new IdProvider().getNextId();
		}

		this.configuration.socketIO.emit(
			event.name,
			resultData
		);
	}
}
