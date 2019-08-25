import {
	User
} from "../data/user";

import {
	Request
} from "../io/request";

import http from "http";

import https from "https";

export type ConnectionConfiguration = {
	readonly server: http.Server | https.Server,
	readonly events?: {
		readonly defaultEvent?: string
	},
	readonly users?: {
		readonly onConnected?: (user: User) => void,
		readonly onDisconnected?: (user: User) => void
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
