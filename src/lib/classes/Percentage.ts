export class Percentage {
    category: string = "";
    percentage: number = 0;

    constructor(init: Partial<Percentage>) {
        Object.assign(this, init)
    }

    getCategory() {
        return this.category;
    }

    getPercentage() {
        return this.percentage;
    }
}