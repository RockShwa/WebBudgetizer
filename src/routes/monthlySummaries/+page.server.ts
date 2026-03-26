import { queryDatabase } from "$lib/server/db";

export async function load() {
    const transactionData = await queryDatabase(
        `SELECT id, timestamp, amount, category, description FROM Transactions`
    );
    const categoryData = await queryDatabase(`
        SELECT name, goal, defaultGoal, categoryTotal FROM Categories
    `);

    return {
        transactionData,
        categoryData
    };
}