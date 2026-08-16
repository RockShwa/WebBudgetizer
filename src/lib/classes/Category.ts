export class Category {
    name: string = "";
    goal: number = 0;
    defaultGoal: number = 0;
    includedInSelfSpending: number = 0;
    includedInShortTermSavings: number = 0;
    includedInSavingsOthers: number = 0;

    constructor(init: Partial<Category>) {
        Object.assign(this, init)
    }

    getName() {
        return this.name;
    }

    getMonthlyGoal() {
        return this.goal;
    }

    getDefaultGoal() {
        return this.defaultGoal;
    }
}