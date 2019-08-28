export type Response = {
	readonly type: "rest.response",
	readonly status: number,
	readonly data?: any
};

export const isResponse = (object: any): object is Response => {
	return object.type === "rest.response"
		&& "status" in object;
};
