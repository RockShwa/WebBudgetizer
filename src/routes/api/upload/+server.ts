import { queryDatabase } from '$lib/server/db.js';
import { parse } from 'csv-parse/sync';
import { json } from '@sveltejs/kit';

type TransactionRow = {
    timestamp: string;
    amount: string; // CSV parser returns strings by default
    category: string;
    description: string;
};

export async function POST({ request}) {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const text = await file.text();
    const records: TransactionRow[] = parse(text, {
        columns: true,
        skip_empty_lines: true
    });

    for (const row of records) {
        await queryDatabase(`INSERT INTO Transactions (timestamp, amount, category, description) 
            VALUES (
            '${row.timestamp}',
            '${row.amount}',
            '${row.category}',
            '${row.description}',
            )
        `);
    }

    return json({success: true});
}