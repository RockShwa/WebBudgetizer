import sql from "mssql"

const config: sql.config = {
    server: "localhost",
    database: "WebBudgetizer",
    options: {
        trustServerCertificate: true
    }
};

export async function queryDatabase(query: string) {
  const pool = await sql.connect(config);
  const result = await pool.request().query(query);
  return result.recordset;
}