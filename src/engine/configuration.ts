import {
	Client
} from "../data/client";

import {
	Request
} from "../io/request";

import http from "http";

import https from "https";

export type Configuration = {
	readonly server: http.Server | https.Server,
	readonly events?: {
		readonly defaultEvent?: string
	},
	readonly clients?: {
		readonly onConnected?: (client: Client) => void,
		readonly onDisconnected?: (client: Client) => void
	},
	readonly io?: {
		readonly onRequest?: (
			request: {
				requestId: string,
				from: Client
				data: any
			},
			respond: (data: any) => void
		) => void
	}
};
