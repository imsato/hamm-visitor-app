const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let serviceAccount;
try {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT が設定されていません');
  serviceAccount = JSON.parse(raw);
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }
  console.log(`プロジェクトID: ${serviceAccount.project_id}`);
} catch (err) {
  console.error('サービスアカウントのパースに失敗:', err.message);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const exportDir = path.join(__dirname, 'export');
if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir);

function toCSV(headers, rows) {
  const escape = v => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}`
      : s;
  };
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map(h => escape(row[h])).join(','));
  }
  return lines.join('\n');
}

async function exportDestinations() {
  const snap = await db.collection('destinations').orderBy('order').get();
  const rows = snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
  const csv = toCSV(['firestoreId', 'name', 'order'], rows);
  fs.writeFileSync(path.join(exportDir, 'destinations.csv'), '﻿' + csv, 'utf8');
  console.log(`destinations: ${rows.length}件 → export/destinations.csv`);
}

async function exportDepartments() {
  const snap = await db.collection('departments').orderBy('order').get();
  const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  const csv = toCSV(['id', 'depname', 'order'], rows);
  fs.writeFileSync(path.join(exportDir, 'departments.csv'), '﻿' + csv, 'utf8');
  console.log(`departments: ${rows.length}件 → export/departments.csv`);
}

async function exportStaff() {
  const snap = await db.collection('staff').orderBy('order').get();
  const rows = snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
  const csv = toCSV(['firestoreId', 'staffID', 'staname', 'statitle', 'departmentId', 'order'], rows);
  fs.writeFileSync(path.join(exportDir, 'staff.csv'), '﻿' + csv, 'utf8');
  console.log(`staff: ${rows.length}件 → export/staff.csv`);
}

async function main() {
  console.log('=== エクスポート開始 ===');
  await exportDestinations();
  await exportDepartments();
  await exportStaff();
  console.log('=== エクスポート完了 ===');
  process.exit(0);
}

main().catch(err => {
  console.error('エクスポートに失敗しました:', err);
  process.exit(1);
});
