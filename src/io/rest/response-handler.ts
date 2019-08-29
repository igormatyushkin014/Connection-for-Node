import {
	Header
} from "./header";


export type ResponseHandler = {
	onSuccess: (
		response: {
			headers: Header[],
			data?: any
		}
	) => void,
	onError: (
		response: {
			headers: Header[],
			data?: any
		}
	) => void
};
