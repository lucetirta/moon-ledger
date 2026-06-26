
const STORE_KEYS = ['accounts', 'transactions', 'debts', 'receivables', 'categories'];
const CORE_BACKUP_KEYS = ['accounts', 'transactions', 'debts', 'receivables'];
const DEFAULT_CATEGORIES = [
  {id: 101, name: 'General', type: 'all'},
  {id: 102, name: 'Gaji', type: 'income'},
  {id: 103, name: 'Bonus', type: 'income'},
  {id: 104, name: 'Makanan', type: 'expense'},
  {id: 105, name: 'Transport', type: 'expense'},
  {id: 106, name: 'Belanja', type: 'expense'}
];

let DB = {
  accounts: loadList('accounts'),
  transactions: loadList('transactions'),
  debts: loadList('debts'),
  receivables: loadList('receivables'),
  categories: loadList('categories')
};

migrate();

function loadList(key){
  try{
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  }catch{
    return [];
  }
}

function migrate(){
  DB.categories = DB.categories
    .map(c=>({
      id: Number(c.id) || nextId(),
      name: String(c.name || '').trim(),
      type: ['all','income','expense'].includes(c.type) ? c.type : 'all'
    }))
    .filter(c=>c.name);
  if(!DB.categories.length){
    DB.categories.push(...DEFAULT_CATEGORIES.map(c=>({...c})));
  }
  DB.accounts.forEach(a=>{
    a.id = Number(a.id) || nextId();
    a.name = String(a.name || '').trim() || 'Account';
    a.type = a.type || 'Bank';
    a.balance = Number(a.balance || 0);
  });
  DB.transactions.forEach(t=>{
    t.id = Number(t.id) || nextId();
    t.date = t.date || today();
    t.amount = Number(t.amount || 0);
    t.category = String(t.category || 'General').trim() || 'General';
    t.categoryId = Number(t.categoryId || 0) || categoryIdByName(t.category);
  });
  DB.debts.forEach(d=>{
    d.id = Number(d.id) || nextId();
    d.name = String(d.name || '').trim() || 'Hutang';
    d.remaining = Number(d.remaining || 0);
    d.total = Number(d.total || d.remaining || 0);
  });
  DB.receivables.forEach(r=>{
    r.id = Number(r.id) || nextId();
    r.name = String(r.name || '').trim() || 'Piutang';
    r.remaining = Number(r.remaining || 0);
    r.total = Number(r.total || r.remaining || 0);
  });
  persist();
}

function persist(){
  Object.entries(DB).forEach(([k,v])=>localStorage.setItem(k, JSON.stringify(v)));
}

function save(){
  persist();
  render();
}

function nextId(){ return Date.now() + Math.floor(Math.random() * 1000); }
function today(){ return new Date().toISOString().slice(0,10); }
function amountFrom(input){ const n = Number(input.value || 0); return Number.isFinite(n) ? n : 0; }
function rp(n){ return 'Rp ' + new Intl.NumberFormat('id-ID').format(n || 0); }

function requirePositive(amount, message){
  if(amount <= 0){ alert(message || 'Nominal harus lebih dari 0.'); return false; }
  return true;
}

function esc(value){
  return String(value ?? '').replace(/[&<>'"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function accountName(id){ return DB.accounts.find(a=>a.id == id)?.name || '-'; }
function removeById(list, id){ const i = list.findIndex(item=>item.id == id); if(i >= 0) list.splice(i, 1); }
function categoryById(id){ return DB.categories.find(c=>c.id == id); }
function categoryIdByName(name){ return DB.categories.find(c=>c.name.toLowerCase() === String(name || '').toLowerCase())?.id || 0; }
function categoriesFor(type){ return DB.categories.filter(c=>c.type === 'all' || c.type === type); }

function adjustAccountBalance(account, delta){
  const nextBalance = Number(account.balance || 0) + delta;
  if(nextBalance < 0) return false;
  account.balance = nextBalance;
  return true;
}

function selectedCategory(){
  const category = categoryById(txCategory.value);
  if(!category) return null;
  return {categoryId: category.id, category: category.name};
}

function resetTransactionForm(){
  txDate.value = today();
  txAmount.value = '';
  txNote.value = '';
  syncTransactionForm();
}

function syncTransactionForm(){
  const type = txType.value;
  transferArea.classList.toggle('hidden', type !== 'transfer');
  txCategory.disabled = type === 'transfer';
  if(type === 'transfer'){
    txCategory.innerHTML = '<option value="">Transfer</option>';
    return;
  }

  const current = txCategory.value;
  const items = categoriesFor(type);
  txCategory.innerHTML = '<option value="">Pilih Kategori</option>' + items.map(c=>'<option value="' + c.id + '">' + esc(c.name) + '</option>').join('');
  if(items.some(c=>String(c.id) === current)) txCategory.value = current;
}

document.querySelectorAll('.sidebar button[data-page]').forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));
    document.getElementById(btn.dataset.page).classList.remove('hidden');
  };
});

txType.onchange = syncTransactionForm;

saveAccountBtn.onclick = ()=>{
  const name = accName.value.trim();
  const balance = amountFrom(accBalance);
  if(!name) return alert('Isi nama account.');
  if(balance < 0) return alert('Saldo awal tidak boleh negatif.');
  DB.accounts.push({id: nextId(), name, type: accType.value, balance});
  accName.value = '';
  accBalance.value = '';
  save();
};

saveTxBtn.onclick = ()=>{
  const type = txType.value;
  const amount = amountFrom(txAmount);
  const date = txDate.value || today();
  if(!requirePositive(amount)) return;

  if(type === 'transfer'){
    const from = DB.accounts.find(a=>a.id == txFrom.value);
    const to = DB.accounts.find(a=>a.id == txTo.value);
    if(!from || !to) return alert('Pilih account.');
    if(from.id === to.id) return alert('Account harus berbeda.');
    if(!adjustAccountBalance(from, -amount)) return alert('Saldo tidak cukup.');
    adjustAccountBalance(to, amount);
    DB.transactions.push({id: nextId(), date, type:'transfer', category:'Transfer', amount, fromId: from.id, toId: to.id, note: txNote.value.trim()});
  } else {
    const account = DB.accounts.find(a=>a.id == txFrom.value);
    const category = selectedCategory();
    if(!account) return alert('Pilih account.');
    if(!category) return alert('Pilih kategori.');
    const delta = type === 'income' ? amount : -amount;
    if(!adjustAccountBalance(account, delta)) return alert('Saldo tidak cukup.');
    DB.transactions.push({id: nextId(), date, type, category: category.category, categoryId: category.categoryId, amount, accountId: account.id, note: txNote.value.trim()});
  }

  resetTransactionForm();
  save();
};

saveDebtBtn.onclick = ()=>{
  const name = debtName.value.trim();
  const total = amountFrom(debtTotal);
  if(!name) return alert('Isi nama hutang.');
  if(!requirePositive(total, 'Total hutang harus lebih dari 0.')) return;
  DB.debts.push({id: nextId(), name, total, remaining: total});
  debtName.value = '';
  debtTotal.value = '';
  save();
};

payDebtBtn.onclick = ()=>{
  const account = DB.accounts.find(a=>a.id == debtAccount.value);
  const debt = DB.debts.find(d=>d.id == debtSelect.value);
  const amount = amountFrom(debtAmount);
  const date = debtDate.value || today();
  if(!account || !debt) return alert('Lengkapi data.');
  if(!requirePositive(amount)) return;
  if(amount > debt.remaining) return alert('Pembayaran melebihi sisa hutang.');
  if(!adjustAccountBalance(account, -amount)) return alert('Saldo tidak cukup.');
  debt.remaining = Math.max(0, debt.remaining - amount);
  DB.transactions.push({id: nextId(), date, type:'debt_payment', category: debt.name, amount, accountId: account.id, debtId: debt.id, note: 'Bayar hutang'});
  debtAmount.value='';
  debtDate.value = today();
  save();
};

saveRecvBtn.onclick = ()=>{
  const name = recvName.value.trim();
  const total = amountFrom(recvTotal);
  if(!name) return alert('Isi nama piutang.');
  if(!requirePositive(total, 'Total piutang harus lebih dari 0.')) return;
  DB.receivables.push({id: nextId(), name, total, remaining: total});
  recvName.value = '';
  recvTotal.value = '';
  save();
};

receiveBtn.onclick = ()=>{
  const account = DB.accounts.find(a=>a.id == recvAccount.value);
  const recv = DB.receivables.find(r=>r.id == recvSelect.value);
  const amount = amountFrom(recvAmount);
  const date = recvDate.value || today();
  if(!account || !recv) return alert('Lengkapi data.');
  if(!requirePositive(amount)) return;
  if(amount > recv.remaining) return alert('Pembayaran melebihi sisa piutang.');
  adjustAccountBalance(account, amount);
  recv.remaining = Math.max(0, recv.remaining - amount);
  DB.transactions.push({id: nextId(), date, type:'receivable_payment', category: recv.name, amount, accountId: account.id, receivableId: recv.id, note: 'Terima piutang'});
  recvAmount.value='';
  recvDate.value = today();
  save();
};

saveCategoryBtn.onclick = ()=>{
  const name = categoryName.value.trim();
  const type = categoryType.value;
  if(!name) return alert('Isi nama kategori.');
  if(DB.categories.some(c=>c.name.toLowerCase() === name.toLowerCase())) return alert('Kategori sudah ada.');
  DB.categories.push({id: nextId(), name, type});
  categoryName.value = '';
  categoryType.value = 'all';
  save();
};

seedBtn.onclick = ()=>{
  if(DB.accounts.length || DB.debts.length || DB.receivables.length || DB.transactions.length) return alert('Data sudah ada.');
  DB.accounts.push({id:1,name:'BCA',type:'Bank',balance:5000000},{id:2,name:'Jenius',type:'Bank',balance:1000000});
  DB.debts.push({id:1,name:'Cicilan Tablet',total:2500000,remaining:2500000});
  DB.receivables.push({id:1,name:'Princess',total:500000,remaining:500000});
  save();
};

exportBtn.onclick = ()=>{
  const blob = new Blob([JSON.stringify(DB,null,2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'moon-ledger-backup.json';
  a.click();
  URL.revokeObjectURL(a.href);
};

importBtn.onclick = ()=> importFile.click();
importFile.onchange = async ()=>{
  const file = importFile.files?.[0];
  if(!file) return;
  try{
    const backup = JSON.parse(await file.text());
    if(!CORE_BACKUP_KEYS.every(key=>Array.isArray(backup[key]))) throw new Error('Invalid backup');
    if(!confirm('Import backup akan mengganti data saat ini. Lanjutkan?')) return;
    CORE_BACKUP_KEYS.forEach(key=>DB[key] = backup[key]);
    DB.categories = Array.isArray(backup.categories) ? backup.categories : [];
    migrate();
    render();
    alert('Backup berhasil diimport.');
  }catch{
    alert('File backup tidak valid.');
  }finally{
    importFile.value = '';
  }
};

function deleteDebt(id){
  const debt = DB.debts.find(d=>d.id == id);
  if(!debt) return;
  if(debt.remaining !== debt.total) return alert('Hutang yang sudah punya pembayaran tidak bisa dihapus.');
  if(confirm('Hapus hutang ini?')){ removeById(DB.debts, id); save(); }
}

function deleteReceivable(id){
  const recv = DB.receivables.find(r=>r.id == id);
  if(!recv) return;
  if(recv.remaining !== recv.total) return alert('Piutang yang sudah punya pembayaran tidak bisa dihapus.');
  if(confirm('Hapus piutang ini?')){ removeById(DB.receivables, id); save(); }
}

function deleteCategory(id){
  const category = categoryById(id);
  if(!category) return;
  if(DB.transactions.some(t=>t.categoryId == id || t.category === category.name)) return alert('Kategori yang sudah dipakai transaksi tidak bisa dihapus.');
  if(confirm('Hapus kategori ini?')){ removeById(DB.categories, id); save(); }
}

function render(){
  const cash = DB.accounts.reduce((a,b)=>a+b.balance,0);
  const debt = DB.debts.reduce((a,b)=>a+b.remaining,0);
  const recv = DB.receivables.reduce((a,b)=>a+b.remaining,0);

  cards.innerHTML = '<div class="card"><h3>Net Worth</h3><p class="amount">' + rp(cash + recv - debt) + '</p></div>' +
    '<div class="card"><h3>Cash & Bank</h3><p class="amount">' + rp(cash) + '</p></div>' +
    '<div class="card"><h3>Debt</h3><p class="amount">' + rp(debt) + '</p></div>' +
    '<div class="card"><h3>Receivables</h3><p class="amount">' + rp(recv) + '</p></div>';

  const selectedFrom = txFrom.value;
  const selectedTo = txTo.value;
  const selectedDebtAccount = debtAccount.value;
  const selectedRecvAccount = recvAccount.value;
  const options = '<option value="">Pilih Account</option>' + DB.accounts.map(a=>'<option value="' + a.id + '">' + esc(a.name) + '</option>').join('');
  txFrom.innerHTML = options;
  txTo.innerHTML = options;
  debtAccount.innerHTML = options;
  recvAccount.innerHTML = options;
  txFrom.value = selectedFrom;
  txTo.value = selectedTo;
  debtAccount.value = selectedDebtAccount;
  recvAccount.value = selectedRecvAccount;

  syncTransactionForm();

  debtSelect.innerHTML = '<option value="">Pilih Hutang</option>' + DB.debts.filter(d=>d.remaining > 0).map(d=>'<option value="' + d.id + '">' + esc(d.name) + '</option>').join('');
  recvSelect.innerHTML = '<option value="">Pilih Piutang</option>' + DB.receivables.filter(r=>r.remaining > 0).map(r=>'<option value="' + r.id + '">' + esc(r.name) + '</option>').join('');

  accountsList.innerHTML = DB.accounts.map(a=>'<div class="card"><strong>' + esc(a.name) + '</strong><br><span class="meta">' + esc(a.type) + '</span><br><span class="amount">' + rp(a.balance) + '</span></div>').join('') || '<div class="card meta">Belum ada account.</div>';

  debtList.innerHTML = DB.debts.map(d=>'<div class="card"><strong>' + esc(d.name) + '</strong><br><span class="meta">Total: ' + rp(d.total) + ' - Sisa: ' + rp(d.remaining) + '</span><div class="actions"><button class="danger" onclick="deleteDebt(' + d.id + ')">Hapus</button></div></div>').join('') || '<div class="card meta">Belum ada hutang.</div>';

  receivableList.innerHTML = DB.receivables.map(r=>'<div class="card"><strong>' + esc(r.name) + '</strong><br><span class="meta">Total: ' + rp(r.total) + ' - Sisa: ' + rp(r.remaining) + '</span><div class="actions"><button class="danger" onclick="deleteReceivable(' + r.id + ')">Hapus</button></div></div>').join('') || '<div class="card meta">Belum ada piutang.</div>';

  categoriesList.innerHTML = DB.categories.map(c=>'<div class="card"><strong>' + esc(c.name) + '</strong><br><span class="badge">' + categoryTypeLabel(c.type) + '</span><div class="actions"><button class="danger" onclick="deleteCategory(' + c.id + ')">Hapus</button></div></div>').join('') || '<div class="card meta">Belum ada kategori.</div>';

  const keyword = (searchInput?.value || '').toLowerCase();
  transactionsList.innerHTML = DB.transactions
    .filter(t => !keyword || (t.category||'').toLowerCase().includes(keyword) || (t.note||'').toLowerCase().includes(keyword) || accountName(t.accountId || t.fromId || '').toLowerCase().includes(keyword))
    .slice().reverse()
    .map(t=>'<div class="card"><strong>' + esc(t.date) + '</strong><br><span class="meta">' + esc(t.type) + '</span><br>' + esc(t.category || '-') + '<br><span class="amount">' + rp(t.amount) + '</span><br><span class="meta">' + transactionMeta(t) + '</span></div>')
    .join('') || '<div class="card meta">Belum ada transaksi.</div>';
}

function categoryTypeLabel(type){
  if(type === 'income') return 'Income';
  if(type === 'expense') return 'Expense';
  return 'Semua';
}

function transactionMeta(t){
  if(t.type === 'transfer') return esc(accountName(t.fromId)) + ' -> ' + esc(accountName(t.toId));
  const note = t.note ? ' - ' + esc(t.note) : '';
  return esc(accountName(t.accountId)) + note;
}

searchInput?.addEventListener('input', render);
txDate.value = today();
debtDate.value = today();
recvDate.value = today();
render();
