export class Transaction {
    id: number = 0;
    timestamp: number = 0;
    amount: number = 0;
    category: string = "";
    description: string = "";
    donated: number = 0

    constructor(init: Partial<Transaction>) {
        Object.assign(this, init)
    }

    getID() {
        return this.id;
    }

    getTimestamp() {
        return this.timestamp;
    }

    getAmount() {
        return this.amount;
    }

    getCategory() {
        return this.category;
    }

    getDescription() {
        return this.description;
    }
}