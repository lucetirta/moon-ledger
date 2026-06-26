
const DB = {
  accounts: JSON.parse(localStorage.getItem('accounts')) || [],
  transactions: JSON.parse(localStorage.getItem('transactions')) || [],
  debts: JSON.parse(localStorage.getItem('debts')) || [],
  receivables: JSON.parse(localStorage.getItem('receivables')) || []
};

function save(){
  Object.entries(DB).forEach(([k,v])=>localStorage.setItem(k, JSON.stringify(v)));
  render();
}

function rp(n){
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(n||0);
}

document.querySelectorAll('.sidebar button[data-page]').forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));
    document.getElementById(btn.dataset.page).classList.remove('hidden');
  };
});

function render(){
  const cash = DB.accounts.reduce((a,b)=>a+b.balance,0);
  const debt = DB.debts.reduce((a,b)=>a+b.remaining,0);
  const recv = DB.receivables.reduce((a,b)=>a+b.remaining,0);

  cards.innerHTML = `
  <div class="card"><h3>🌙 Net Worth</h3><p>${rp(cash + recv - debt)}</p></div>
  <div class="card"><h3>🏦 Cash & Bank</h3><p>${rp(cash)}</p></div>
  <div class="card"><h3>💳 Debt</h3><p>${rp(debt)}</p></div>
  <div class="card"><h3>🧾 Receivables</h3><p>${rp(recv)}</p></div>`;

  const options =
  '<option value="">Pilih Account</option>' +
  DB.accounts.map(a=>`<option value="${a.id}">${a.name}</option>`).join('');

  debtAccount.innerHTML = options;
  recvAccount.innerHTML = options;

  debtSelect.innerHTML =
  '<option value="">Pilih Hutang</option>' +
  DB.debts.map(d=>`<option value="${d.id}">${d.name}</option>`).join('');

  recvSelect.innerHTML =
  '<option value="">Pilih Piutang</option>' +
  DB.receivables.map(r=>`<option value="${r.id}">${r.name}</option>`).join('');

  debtList.innerHTML = DB.debts.map(d =>
    `<div class="card">💳 ${d.name}<br>Sisa: ${rp(d.remaining)}</div>`
  ).join('');

  receivableList.innerHTML = DB.receivables.map(r =>
    `<div class="card">🧾 ${r.name}<br>Sisa: ${rp(r.remaining)}</div>`
  ).join('');

  const keyword = (searchInput?.value || '').toLowerCase();

  transactionsList.innerHTML = DB.transactions
    .filter(t =>
      !keyword ||
      (t.category || '').toLowerCase().includes(keyword) ||
      (t.note || '').toLowerCase().includes(keyword)
    )
    .slice().reverse()
    .map(t =>
      `<div class="card">
      ${t.date}<br>
      ${t.type}<br>
      ${t.category || '-'}<br>
      ${rp(t.amount)}
      </div>`
    ).join('');
}

searchInput?.addEventListener('input', render);

payDebtBtn.onclick = ()=>{
  const account = DB.accounts.find(a=>a.id == debtAccount.value);
  const debt = DB.debts.find(d=>d.id == debtSelect.value);
  const amount = Number(debtAmount.value || 0);

  if(!account || !debt || !amount) return alert('Lengkapi data.');
  if(account.balance < amount) return alert('Saldo tidak cukup.');

  account.balance -= amount;
  debt.remaining = Math.max(0, debt.remaining - amount);

  DB.transactions.push({
    id: Date.now(),
    date: new Date().toISOString().slice(0,10),
    type:'debt_payment',
    category: debt.name,
    amount
  });

  debtAmount.value = '';
  save();
};

receiveBtn.onclick = ()=>{
  const account = DB.accounts.find(a=>a.id == recvAccount.value);
  const recv = DB.receivables.find(r=>r.id == recvSelect.value);
  const amount = Number(recvAmount.value || 0);

  if(!account || !recv || !amount) return alert('Lengkapi data.');

  account.balance += amount;
  recv.remaining = Math.max(0, recv.remaining - amount);

  DB.transactions.push({
    id: Date.now(),
    date: new Date().toISOString().slice(0,10),
    type:'receivable_payment',
    category: recv.name,
    amount
  });

  recvAmount.value = '';
  save();
};

seedBtn.onclick = ()=>{
  if(DB.accounts.length) return alert('Data sudah ada.');

  DB.accounts.push(
    {id:1,name:'BCA',balance:5000000},
    {id:2,name:'Jenius',balance:1000000}
  );

  DB.debts.push(
    {id:1,name:'Cicilan Tablet',remaining:2500000}
  );

  DB.receivables.push(
    {id:1,name:'Princess',remaining:500000}
  );

  save();
};

exportBtn.onclick = ()=>{
  const blob = new Blob([JSON.stringify(DB,null,2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'moon-ledger-backup.json';
  a.click();
};

render();
