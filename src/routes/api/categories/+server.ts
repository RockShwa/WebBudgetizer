import { json } from '@sveltejs/kit';
import sql from "mssql"
import { config } from '$lib/server/db.js';

export async function POST({request}) {
    await sql.connect(config);
    const { name } = await request.json();
    await sql.query`
        INSERT INTO Categories (name, goal, defaultGoal)
        VALUES (${name}, ${0}, ${0})
    `;
    return json({ name })
} 

export async function DELETE({ request }) {
    await sql.connect(config);
    const { name } = await request.json();
    await sql.query`
        DELETE FROM Categories WHERE name = ${name}
    `;
    return json({ success: true });
}