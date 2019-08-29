export type Response = {
	readonly type: "raw.response",
	readonly requestId: string,
	readonly data?: any
};

export const isResponse = (object: any): object is Response => {
	return object.type === "raw.response"
		&& "requestId" in object;
};
