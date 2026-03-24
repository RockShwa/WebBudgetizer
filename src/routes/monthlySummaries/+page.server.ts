import { queryDatabase } from "$lib/server/db";

export async function load() {
    const categoryData = await queryDatabase(`
        SELECT name, goal, defaultGoal, categoryTotal FROM Categories
    `);

    return {
        categoryData
    };
}