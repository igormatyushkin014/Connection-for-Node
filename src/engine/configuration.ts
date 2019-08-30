import {
	Client
} from "../data/client";

import * as io_rest from "../io/rest";

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
				from: Client,
				event?: string,
				data: any
			},
			respond: (data: any) => void
		) => void
	},
	readonly rest?: {
		readonly onRequest?: (
			request: {
				from: Client,
				path: string,
				method: string,
				headers?: {[id: string]: string}[],
				data?: {[id: string]: any},
			},
			respond: (response: io_rest.Response) => void
		) => void
	}
};
