export class CategoryData {
    name: string = "";
    goal: number = 0;
    defaultGoal: number = 0;

    constructor(init: Partial<CategoryData>) {
        Object.assign(this, init)
    }
}