import { json } from '@sveltejs/kit';
import sql from "mssql"
import { config } from '$lib/server/db.js';

export async function PATCH({ request }) {
    const { action, categoryName, isSelfSpendingChecked, isShortTermSavingsChecked, isSavingsOthersChecked } = await request.json();

    await sql.connect(config);

    if (action === 'SELF SPENDING') {
        await sql.query`
            UPDATE Categories
            SET includedInSelfSpending = ${isSelfSpendingChecked}
            WHERE name = ${categoryName}`;
    }        
    if (action === 'SHORT TERM SAVINGS') {
        await sql.query`
            UPDATE Categories
            SET includedInShortTermSavings = ${isShortTermSavingsChecked}
            WHERE name = ${categoryName}`;
    }
    if (action === 'SAVINGS FOR OTHERS') {
        await sql.query`
            UPDATE Categories
            SET includedInSavingsOthers = ${isSavingsOthersChecked}
            WHERE name = ${categoryName}`;
    }

    return json({ success: true });
}