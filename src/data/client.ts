export type Client = {
	readonly id: string,
	readonly socket: SocketIO.Socket,
	data?: any
};
