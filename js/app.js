
const DB = {
  accounts: JSON.parse(localStorage.getItem('accounts')) || [],
  transactions: JSON.parse(localStorage.getItem('transactions')) || []
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

txType.onchange = ()=>{
  transferArea.classList.toggle('hidden', txType.value !== 'transfer');
};

saveAccountBtn.onclick = ()=>{
  if(!accName.value) return alert('Isi nama account.');

  DB.accounts.push({
    id: Date.now(),
    name: accName.value,
    type: accType.value,
    balance: Number(accBalance.value || 0)
  });

  accName.value = '';
  accBalance.value = '';

  save();
};

saveTxBtn.onclick = ()=>{
  const type = txType.value;
  const amount = Number(txAmount.value || 0);
  if(!amount) return alert('Isi nominal.');

  if(type === 'transfer'){
    const from = DB.accounts.find(a=>a.id == txFrom.value);
    const to = DB.accounts.find(a=>a.id == txTo.value);

    if(!from || !to) return alert('Pilih account.');
    if(from.id === to.id) return alert('Account harus berbeda.');
    if(from.balance < amount) return alert('Saldo tidak cukup.');

    from.balance -= amount;
    to.balance += amount;

    DB.transactions.push({
      id: Date.now(),
      date: new Date().toISOString().slice(0,10),
      type,
      amount,
      fromId: from.id,
      toId: to.id,
      category: 'Transfer',
      note: txNote.value
    });
  }else{
    const account = DB.accounts.find(a=>a.id == txFrom.value);
    if(!account) return alert('Pilih account.');

    if(type === 'income'){
      account.balance += amount;
    }else{
      if(account.balance < amount) return alert('Saldo tidak cukup.');
      account.balance -= amount;
    }

    DB.transactions.push({
      id: Date.now(),
      date: new Date().toISOString().slice(0,10),
      type,
      amount,
      category: txCategory.value || 'General',
      accountId: account.id,
      note: txNote.value
    });
  }

  txAmount.value = '';
  txCategory.value = '';
  txNote.value = '';

  save();
};

function deleteAccount(id){
  if(!confirm('Hapus account?')) return;
  DB.accounts = DB.accounts.filter(a=>a.id !== id);
  save();
}

function editAccount(id){
  const a = DB.accounts.find(x=>x.id === id);
  if(!a) return;

  const name = prompt('Nama account', a.name);
  const type = prompt('Type', a.type);

  if(name) a.name = name;
  if(type) a.type = type;

  save();
}

function render(){
  const total = DB.accounts.reduce((a,b)=>a+b.balance,0);

  cards.innerHTML = `
    <div class="card"><h3>Total Cash</h3><p>${rp(total)}</p></div>
    <div class="card"><h3>Accounts</h3><p>${DB.accounts.length}</p></div>
    <div class="card"><h3>Transactions</h3><p>${DB.transactions.length}</p></div>
  `;

  const options =
    '<option value="">Pilih Account</option>' +
    DB.accounts.map(a=>`<option value="${a.id}">${a.name}</option>`).join('');

  txFrom.innerHTML = options;
  txTo.innerHTML = options;

  accountsList.innerHTML = DB.accounts.map(a=>`
    <div class="card">
      🏦 ${a.name}<br>
      ${a.type}<br>
      ${rp(a.balance)}
      <div class="actions">
        <button onclick="editAccount(${a.id})">Edit</button>
        <button onclick="deleteAccount(${a.id})">Delete</button>
      </div>
    </div>
  `).join('');

  transactionsList.innerHTML = DB.transactions.slice().reverse().map(t=>{
    let desc = `${t.type} • ${rp(t.amount)}`;
    if(t.type === 'transfer'){
      const from = DB.accounts.find(a=>a.id===t.fromId);
      const to = DB.accounts.find(a=>a.id===t.toId);
      desc += `<br>${from?.name || '-'} → ${to?.name || '-'}`;
    }
    return `<div class="card">${t.date}<br>${desc}</div>`;
  }).join('');
}

exportBtn.onclick = ()=>{
  const blob = new Blob([JSON.stringify(DB,null,2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'moon-ledger-backup.json';
  a.click();
};

render();
