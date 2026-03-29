const { Client } = require('pg');

async function test(url, name) {
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log(`✅ SUCCESS on ${name}:`, res.rows[0].now);
    await client.end();
    return true;
  } catch (err) {
    console.log(`❌ FAILED on ${name}:`, err.message);
    return false;
  }
}

async function run() {
  const pass = encodeURIComponent("GN8h.Xs+pVL?2%a");
  const base = "aws-0-us-east-1.pooler.supabase.com";
  const p1 = `postgresql://postgres.shkhxztptvyoksyufwyy:${pass}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;
  const p2 = `postgresql://postgres.shkhxztptvyoksyufwyy:${pass}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`;
  const p3 = `postgresql://postgres:${pass}@db.shkhxztptvyoksyufwyy.supabase.co:5432/postgres`;
  
  console.log("Testing password:", pass);
  await test(p1, "Pooler 6543");
  await test(p2, "Pooler 5432");
  await test(p3, "Direct 5432");
}

run();
