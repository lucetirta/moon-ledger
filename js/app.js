
const DB = {
 accounts: JSON.parse(localStorage.getItem('accounts')) || [],
 transactions: JSON.parse(localStorage.getItem('transactions')) || []
};

function save(){
 Object.entries(DB).forEach(([k,v]) =>
   localStorage.setItem(k, JSON.stringify(v))
 );
 render();
}

function rp(n){
 return 'Rp ' + new Intl.NumberFormat('id-ID').format(n||0);
}

function render(){
 txAccount.innerHTML =
 '<option value="">Pilih Account</option>' +
 DB.accounts.map(a =>
 `<option value="${a.id}">${a.name}</option>`
 ).join('');

 accountsList.innerHTML =
 DB.accounts.map(a =>
 `<div class="item">🏦 ${a.name} — ${rp(a.balance)}</div>`
 ).join('');

 transactionsList.innerHTML =
 DB.transactions.slice().reverse().map(t =>
 `<div class="item">
 ${t.date} • ${t.type} • ${t.category}<br>
 ${rp(t.amount)}
 <br>
 <button onclick="editTransaction(${t.id})">Edit</button>
 <button onclick="deleteTransaction(${t.id})">Delete</button>
 </div>`
 ).join('');
}

saveTxBtn.onclick = ()=>{
 const accountId = Number(txAccount.value);
 const amount = Number(txAmount.value || 0);

 if(!accountId || !amount){
   alert('Lengkapi data.');
   return;
 }

 const account = DB.accounts.find(a => a.id === accountId);

 if(txType.value === 'income'){
   account.balance += amount;
 }else{
   if(account.balance < amount){
     alert('Saldo tidak cukup.');
     return;
   }
   account.balance -= amount;
 }

 DB.transactions.push({
   id: Date.now(),
   date: new Date().toISOString().slice(0,10),
   type: txType.value,
   category: txCategory.value || 'General',
   amount,
   accountId
 });

 txCategory.value = '';
 txAmount.value = '';

 save();
};

function rollbackTransaction(t){
 const account = DB.accounts.find(a => a.id === t.accountId);
 if(!account) return;

 if(t.type === 'income'){
   account.balance -= t.amount;
 }else if(t.type === 'expense'){
   account.balance += t.amount;
 }
}

function applyTransaction(t){
 const account = DB.accounts.find(a => a.id === t.accountId);
 if(!account) return;

 if(t.type === 'income'){
   account.balance += t.amount;
 }else if(t.type === 'expense'){
   account.balance -= t.amount;
 }
}

function deleteTransaction(id){
 const t = DB.transactions.find(x => x.id === id);
 if(!t) return;

 if(!confirm('Hapus transaksi?')) return;

 rollbackTransaction(t);
 DB.transactions = DB.transactions.filter(x => x.id !== id);

 save();
}

function editTransaction(id){
 const t = DB.transactions.find(x => x.id === id);
 if(!t) return;

 rollbackTransaction(t);

 const category = prompt('Kategori', t.category);
 const amount = Number(prompt('Nominal', t.amount) || t.amount);

 t.category = category || t.category;
 t.amount = amount;

 applyTransaction(t);

 save();
}

seedBtn.onclick = ()=>{
 if(DB.accounts.length) return;

 DB.accounts.push(
   {
     id: 1,
     name: 'BCA',
     balance: 5000000
   },
   {
     id: 2,
     name: 'Jenius',
     balance: 1000000
   }
 );

 save();
};

render();
