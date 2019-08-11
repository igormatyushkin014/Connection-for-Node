export type User = {
	readonly id: string,
	readonly socket: SocketIO.Socket,
	data?: any
};
