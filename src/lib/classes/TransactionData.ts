export class TransactionData {
    id: number = 0;
    timestamp: number = 0;
    amount: number = 0;
    category: string = "";
    description: string = "";

    constructor(init: Partial<TransactionData>) {
        Object.assign(this, init)
    }
}