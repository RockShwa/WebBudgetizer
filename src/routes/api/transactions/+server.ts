import { json } from '@sveltejs/kit';
import sql from 'mssql';

import { config } from '$lib/server/db';

export async function PATCH({ request }) {
    const { id, category } = await request.json();

    sql.connect(config);

    await sql.query`
        UPDATE Transactions
        SET category = ${category}
        WHERE id = ${id}`;

    return json({ success: true });
}