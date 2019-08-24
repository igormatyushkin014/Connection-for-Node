export type Request = {
	readonly type: "request",
	readonly requestId: string,
	readonly data: any
};

export const isRequest = (object: any): object is Request => {
	return object.type === "request"
		&& "requestId" in object
		&& "data" in object;
};
