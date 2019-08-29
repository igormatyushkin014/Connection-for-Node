import {
	Response
} from "./response";

import {
	Header
} from "./header";

export type Request = {
	readonly type: "rest.request",
	readonly requestId: string,
	readonly path: string,
	readonly method: string,
	readonly headers: Header[],
	readonly data?: {[id: string]: any}
};

export const isRequest = (object: any): object is Request => {
	return object.type === "rest.request"
		&& "path" in object
		&& "method" in object
		&& "headers" in object;
};
