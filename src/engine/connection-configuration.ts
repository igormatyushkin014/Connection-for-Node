import {
	User
} from "../data/user";

import {
	Message
} from "./message";

export type ConnectionConfiguration = {
	readonly socketIO: SocketIO.Server,
	readonly users?: {
		onAdded?: (user: User) => void,
		onReceived?: (message: Message, sender: User) => void,
		onSent?: (message: Message, recipient: User) => void,
		onRemoved?: (user: User) => void
	},
	readonly messages?: {
		readonly defaultEvent: string
	}
};
