import { parse } from 'csv-parse/sync';
import { json } from '@sveltejs/kit';
import { config } from '$lib/server/db.js';
import sql from "mssql"

await sql.connect(config);

export type TransactionRow = {
    Date: string;
    Amount: string; // CSV parser returns strings by default
    Category: string;
    Description: string;
};

function parseDate(dateStr: string) {
  const [month, day, year] = dateStr.split('/');
  return `${year}-${month}-${day}`; // YYYY-MM-DD
}

export async function POST({request}) {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const text = await file.text();

    // Start at actual transactions not summary
    const startI = text.indexOf('Date,Description,Amount');

    const slicedCSV = text.slice(startI);

    const records = (parse(slicedCSV, {
        columns: true,
        relax_quotes: true,
        skip_empty_lines: true
    }) as TransactionRow[])
    .filter(row => !row.Description.includes("Beginning balance as"));

    for (const row of records) {
        await sql.query`
            INSERT INTO Transactions (timestamp, amount, description, category)
            VALUES (${parseDate(row.Date)}, ${parseFloat(row.Amount.replace(/,/g, ''))}, ${row.Description}, ${"Unselected"})
        `;
    }

    return json({success: true});   
}