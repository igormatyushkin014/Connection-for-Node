import {
	User
} from "../data/user";

import {
	Request
} from "../io/request";

export type ConnectionConfiguration = {
	readonly socketIO: SocketIO.Server,
	readonly events?: {
		readonly defaultEvent?: string
	},
	readonly users?: {
		readonly onAdded?: (user: User) => void,
		readonly onRemoved?: (user: User) => void
	},
	readonly io?: {
		readonly onRequest?: (
			request: {
				requestId: string,
				from: User
				data: any
			},
			respond: (data: any) => void
		) => void
	}
};
