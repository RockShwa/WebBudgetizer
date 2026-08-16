import { queryDatabase } from "$lib/server/db";

export async function load() {
    const transactionData = await queryDatabase(
        `SELECT id, timestamp, amount, category, description, donated FROM Transactions`
    );
    const categoryData = await queryDatabase(`
        SELECT name, goal, defaultGoal, includedInSelfSpending, includedInShortTermSavings, includedInSavingsOthers FROM Categories
    `);
    const settingData = await queryDatabase(`
        SELECT startingCheckingAmount, startingSavingsAmount FROM Settings
    `);
    const percentageData = await queryDatabase(`
        SELECT category, percentage FROM IncomeCategories
    `);

    return {
        transactionData,
        categoryData,
        settingData,
        percentageData
    };
}