export type Request = {
	readonly type: "raw.request",
	readonly requestId: string,
	readonly recipientId?: string,
	readonly event?: string,
	readonly data: any
};

export const isRequest = (object: any): object is Request => {
	return object.type === "raw.request"
		&& "requestId" in object
		&& "data" in object;
};
