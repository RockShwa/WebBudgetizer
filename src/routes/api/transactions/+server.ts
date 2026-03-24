import { json } from '@sveltejs/kit';
import sql from 'mssql';

import { config } from '$lib/server/db';

// MAYBE DO PUT NOT TWO IN PATCH
export async function PATCH({ request }) {
    const { action, id, category, amount} = await request.json();

    await sql.connect(config);

    if (action === 'UPDATE_CATEGORY_NAME') {
        await sql.query`
            UPDATE Transactions
            SET category = ${category}
            WHERE id = ${id}`;

        return json({ success: true });
    } else if (action === 'UPDATE_CATEGORY_AMOUNT') {
        await sql.query`
            UPDATE Categories
            SET categoryTotal = ${amount}
            WHERE name = ${category}`;

        return json({ success: true });
    }   
}

export async function GET({ url }) {
    const name = url.searchParams.get('name');

    await sql.connect(config);

    const result = await sql.query`
        SELECT categoryTotal 
        FROM Categories 
        WHERE name = ${name}`;

    const total = result.recordset[0]?.categoryTotal ?? 0;
    return json(total);
}