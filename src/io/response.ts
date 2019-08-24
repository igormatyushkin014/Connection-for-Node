export type Response = {
	readonly type: "response",
	readonly requestId: string,
	readonly data?: any
};

export const isResponse = (object: any): object is Response => {
	return object.type === "response"
		&& "requestId" in object;
};
