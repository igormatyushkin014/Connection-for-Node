export type Response = {
	readonly type: "rest.response",
	readonly requestId: string,
	readonly status: number,
	readonly headers?: {[id: string]: string}[],
	readonly data?: any
};

export const isResponse = (object: any): object is Response => {
	return object.type === "rest.response"
		&& "requestId" in object
		&& "status" in object;
};
