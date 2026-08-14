import { json } from '@sveltejs/kit';
import sql from "mssql"
import { config } from '$lib/server/db.js';

export async function PATCH({ request }) {
    const { action, incomeCategory, percentage, startingChecking, startingSavings, transactionID, isDonated } = await request.json();

    await sql.connect(config);

    if (action === 'UPDATE_PERCENTAGES') {
        await sql.query`
            UPDATE IncomeCategories
            SET percentage = ${percentage}
            WHERE category = ${incomeCategory}`;
    }        
    if (action === 'UPDATE_STARTING_CHECKING') {
        await sql.query`
            UPDATE Settings
            SET startingChecking = ${startingChecking}
            WHERE id = 1`;
    }
    if (action === 'UPDATE_STARTING_SAVINGS') {
        await sql.query`
            UPDATE Settings
            SET startingSavings = ${startingSavings}
            WHERE id = 1`;
    }   
    if (action === 'UPDATE_DONATION') {
        await sql.query`
            UPDATE Transactions
            SET donated = ${isDonated}
            WHERE id = ${transactionID}`;
    }           

    return json({ success: true });
}