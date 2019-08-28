import {
	Response
} from "./response";

export type Request = {
	readonly type: "rest.request",
	readonly path: string,
	readonly method: string,
	readonly headers?: {[id: string]: string}[],
	readonly data?: {[id: string]: any}[],
	readonly callback?: (response: Response) => void,
	readonly onSuccess?: (data: any, status: number) => void,
	readonly onError?: (data: any, status: number) => void
};

export const isRequest = (object: any): object is Request => {
	return object.type === "rest.request"
		&& "path" in object
		&& "method" in object;
};
