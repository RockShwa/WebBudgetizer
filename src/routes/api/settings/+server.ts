import { json } from '@sveltejs/kit';
import sql from "mssql"
import { config } from '$lib/server/db.js';

export async function PATCH({ request }) {
    const { action, categoryName, isCheckingChecked, isSavingsChecked } = await request.json();

    await sql.connect(config);

    if (action === 'CHECKING') {
        await sql.query`
            UPDATE Categories
            SET includedInChecking = ${isCheckingChecked}
            WHERE name = ${categoryName}`;
    }        
    if (action === 'SAVINGS') {
        await sql.query`
            UPDATE Categories
            SET includedInSavings = ${isSavingsChecked}
            WHERE name = ${categoryName}`;
    }

    return json({ success: true });
}