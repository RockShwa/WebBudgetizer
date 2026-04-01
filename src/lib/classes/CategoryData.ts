export class Category {
    name: string = "";
    goal: number = 0;
    defaultGoal: number = 0;

    constructor(init: Partial<Category>) {
        Object.assign(this, init)
    }
}