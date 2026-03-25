import { json } from '@sveltejs/kit';
import sql from 'mssql';

import { config } from '$lib/server/db';

export async function GET( {url} ) {
    const name = url.searchParams.get('name');

    await sql.connect(config);

    const result = await sql.query`
        SELECT timestamp, amount 
        FROM Transactions
        WHERE category = ${name}`;

    return json(result.recordset);
}