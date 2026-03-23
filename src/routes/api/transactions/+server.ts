import { json } from '@sveltejs/kit';
import sql from 'mssql';

import { config } from '$lib/server/db';

// MAYBE DO PUT NOT TWO IN PATCH
export async function PATCH({ request }) {
    const { action, id, category, amount} = await request.json();

    sql.connect(config);

    if (action === 'UPDATE_CATEGORY_NAME') {
        await sql.query`
            UPDATE Transactions
            SET category = ${category}
            WHERE id = ${id}`;

        return json({ success: true });
    } else if (action === 'UPDATE_CATEGORY_AMOUNT') {
        await sql.query`
            UPDATE Transactions
            SET amount = ${amount}
            WHERE name = ${category}`;

        return json({ success: true });
    }   
}