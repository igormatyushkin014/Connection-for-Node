const uuidv4 = require("uuid/v4");

export class IdProvider {

	private lastValue: number = 0;

	constructor() {
	}

	public getNextId(): string {
		let nextValue = this.lastValue + 1;
		this.lastValue = nextValue;
		let uuid = uuidv4();
		return `${nextValue}-${uuid}`;
	}
}
