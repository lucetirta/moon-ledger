const STORE_KEYS = ['accounts', 'transactions', 'debts', 'receivables', 'categories', 'subscriptions'];
const CORE_BACKUP_KEYS = ['accounts', 'transactions', 'debts', 'receivables', 'categories'];
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
  categories: loadList('categories'),
  subscriptions: loadList('subscriptions')
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
    a.creditLimit = Number(a.creditLimit || 0);
    a.usedLimit = Number(a.usedLimit || 0);
    if(a.type === 'Credit Card') a.balance = 0;
    if(a.usedLimit < 0) a.usedLimit = 0;
    if(a.creditLimit < 0) a.creditLimit = 0;
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
    d.type = d.type || 'regular';
    d.remaining = Number(d.remaining || 0);
    d.total = Number(d.total || d.remaining || 0);
    d.creditCardId = Number(d.creditCardId || 0) || null;
    d.borrower = String(d.borrower || '').trim();
    d.receivableId = Number(d.receivableId || 0) || null;
    d.tenor = Number(d.tenor || 0);
    d.dueDay = Number(d.dueDay || 0);
    d.categoryId = Number(d.categoryId || 0) || categoryIdByName(d.category) || categoryIdByName('General') || 101;
    d.category = String(d.category || categoryById(d.categoryId)?.name || 'General').trim();
    d.paymentHistory = Array.isArray(d.paymentHistory) ? d.paymentHistory.map(h => ({
      id: Number(h.id) || nextId(),
      date: h.date || today(),
      amount: Number(h.amount || 0),
      accountId: Number(h.accountId || 0) || null,
      note: String(h.note || '').trim(),
      transactionId: Number(h.transactionId || 0) || null
    })) : [];
  });

  DB.receivables.forEach(r=>{
    r.id = Number(r.id) || nextId();
    r.name = String(r.name || '').trim() || 'Piutang';
    r.remaining = Number(r.remaining || 0);
    r.total = Number(r.total || r.remaining || 0);
    r.source = r.source || 'manual';
    r.type = ['regular','subscription_sharing'].includes(r.type) ? r.type : 'regular';
    r.subscriptionId = Number(r.subscriptionId || 0) || null;
    r.debtId = Number(r.debtId || 0) || null;
    r.collectionHistory = Array.isArray(r.collectionHistory) ? r.collectionHistory.map(h => ({
      id: Number(h.id) || nextId(),
      date: h.date || today(),
      amount: Number(h.amount || 0),
      accountId: Number(h.accountId || 0) || null,
      memberId: Number(h.memberId || 0) || null,
      note: String(h.note || '').trim(),
      transactionId: Number(h.transactionId || 0) || null
    })) : [];
  });

  DB.subscriptions = Array.isArray(DB.subscriptions) ? DB.subscriptions : [];
  DB.subscriptions.forEach(s=>{
    s.id = Number(s.id) || nextId();
    s.name = String(s.name || '').trim() || 'Subscription';
    s.categoryId = Number(s.categoryId || 0) || categoryIdByName(String(s.category || 'General')) || 101;
    s.category = String(s.category || categoryById(s.categoryId)?.name || 'General').trim();
    s.cycle = ['monthly','yearly'].includes(s.cycle) ? s.cycle : 'monthly';
    s.renewalDate = s.renewalDate || today();
    s.totalCost = Number(s.totalCost || 0);
    s.accountId = Number(s.accountId || 0) || null;
    s.note = String(s.note || '').trim();
    s.status = ['active','paused','canceled','due'].includes(s.status) ? s.status : 'active';
    s.subscriptionCategory = ['personal','sharing'].includes(s.subscriptionCategory) ? s.subscriptionCategory : 'personal';
    s.maxMembers = s.subscriptionCategory === 'sharing' ? (Number(s.maxMembers || 0) || null) : null;
    s.members = Array.isArray(s.members) ? s.members.map(m => ({
      id: Number(m.id) || nextId(),
      name: String(m.name || '').trim() || 'Member',
      shareAmount: Number(m.shareAmount || 0),
      paid: Boolean(m.paid || false),
      paymentDate: m.paymentDate || '',
      note: String(m.note || '').trim(),
      amountPaid: Number(m.amountPaid || 0)
    })) : [];
    s.receivableId = Number(s.receivableId || 0) || null;
    s.creditCardId = Number(s.creditCardId || 0) || null;
    s.paymentHistory = Array.isArray(s.paymentHistory) ? s.paymentHistory.map(h => ({
      id: Number(h.id) || nextId(),
      date: h.date || today(),
      amount: Number(h.amount || 0),
      accountId: Number(h.accountId || 0) || null,
      memberId: Number(h.memberId || 0) || null,
      note: String(h.note || '').trim(),
      transactionId: Number(h.transactionId || 0) || null
    })) : [];
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
function subscriptionById(id){ return DB.subscriptions.find(s=>s.id == id); }
function categoryIdByName(name){ return DB.categories.find(c=>c.name.toLowerCase() === String(name || '').toLowerCase())?.id || 0; }
function categoriesFor(type){ return DB.categories.filter(c=>c.type === 'all' || c.type === type); }
function cashAccounts(){ return DB.accounts.filter(a=>a.type !== 'Credit Card'); }
function creditCards(){ return DB.accounts.filter(a=>a.type === 'Credit Card'); }
function creditAvailable(card){ return Math.max(0, Number(card.creditLimit || 0) - Number(card.usedLimit || 0)); }

function adjustAccountBalance(account, delta){
  if(account.type === 'Credit Card') return false;
  const nextBalance = Number(account.balance || 0) + delta;
  if(nextBalance < 0) return false;
  account.balance = nextBalance;
  return true;
}

function adjustCreditUsed(card, delta){
  const nextUsed = Number(card.usedLimit || 0) + delta;
  if(nextUsed < 0 || nextUsed > Number(card.creditLimit || 0)) return false;
  card.usedLimit = nextUsed;
  return true;
}

function subscriptionReceivableTotal(sub){
  const memberTotal = Array.isArray(sub.members) ? sub.members.reduce((sum,m)=>sum + Number(m.shareAmount || 0),0) : 0;
  return Number(sub.totalCost || 0) || memberTotal;
}

function reserveSubscriptionCredit(sub, previousTotal = 0, previousCardId = null, previousStatus = 'active'){
  const newCardId = sub.creditCardId;
  const newTotal = Number(sub.totalCost || 0);
  const wasReserved = previousStatus === 'active' && previousCardId;
  const shouldReserve = sub.status === 'active' && newCardId;

  if(!wasReserved && !shouldReserve) return true;

  if(wasReserved && !shouldReserve){
    const oldCard = DB.accounts.find(a=>a.id == previousCardId);
    if(oldCard) adjustCreditUsed(oldCard, -previousTotal);
    return true;
  }

  if(shouldReserve && !wasReserved){
    const card = DB.accounts.find(a=>a.id == newCardId);
    if(!card) return alert('Kartu kredit subscription tidak ditemukan.');
    if(!adjustCreditUsed(card, newTotal)) return alert('Tidak dapat menahan limit kartu kredit untuk subscription.');
    return true;
  }

  if(wasReserved && shouldReserve){
    if(previousCardId !== newCardId){
      const card = DB.accounts.find(a=>a.id == newCardId);
      if(!card) return alert('Kartu kredit subscription tidak ditemukan.');
      if(!adjustCreditUsed(card, newTotal)) return alert('Tidak dapat menahan limit kartu kredit untuk subscription.');
      const oldCard = DB.accounts.find(a=>a.id == previousCardId);
      if(oldCard) adjustCreditUsed(oldCard, -previousTotal);
      return true;
    }

    const card = DB.accounts.find(a=>a.id == newCardId);
    const diff = newTotal - previousTotal;
    if(diff !== 0 && !adjustCreditUsed(card, diff)) return alert('Tidak dapat menyesuaikan limit kartu kredit untuk subscription.');
    return true;
  }

  return true;
}

function ensureSubscriptionReceivable(sub){
  const total = subscriptionReceivableTotal(sub);
  if(!Array.isArray(sub.members) || sub.members.length === 0) return;
  let recv = DB.receivables.find(r=>r.id == sub.receivableId && r.subscriptionId == sub.id && r.type === 'subscription_sharing');
  if(!recv){
    recv = {
      id: nextId(),
      type: 'subscription_sharing',
      name: sub.name,
      total,
      remaining: total,
      source: 'subscription_sharing',
      subscriptionId: sub.id,
      debtId: null,
      collectionHistory: []
    };
    DB.receivables.push(recv);
    sub.receivableId = recv.id;
    return;
  }
  recv.name = sub.name;
  recv.total = total;
  if(Number(recv.remaining || 0) === Number(recv.total || 0)){
    recv.remaining = total;
  }
  if(recv.remaining > total){
    recv.remaining = total;
  }
}

let editingAccountId = null;
let editingTransactionId = null;
let editingDebtId = null;
let editingReceivableId = null;
let editingSubscriptionId = null;

function selectedCategory(){
  const category = categoryById(txCategory.value);
  if(!category) return null;
  return {categoryId: category.id, category: category.name};
}

function selectedDebtCategory(){
  const category = categoryById(debtCategory.value);
  if(!category) return null;
  return {categoryId: category.id, category: category.name};
}

function resetTransactionForm(){
  editingTransactionId = null;
  txDate.value = today();
  txType.value = 'income';
  txCategory.value = '';
  txAmount.value = '';
  txNote.value = '';
  txFrom.value = '';
  txTo.value = '';
  document.getElementById('txDebtSelect').value = '';
  document.getElementById('txReceivableSelect').value = '';
  document.getElementById('txReceivableMember').value = '';
  saveTxBtn.textContent = 'Save Transaction';
  cancelTxBtn.classList.add('hidden');
  populateTransactionDebtSelect();
  populateTransactionReceivableSelect();
  syncTransactionForm();
}

function populateTransactionDebtSelect(){
  const select = document.getElementById('txDebtSelect');
  select.innerHTML = '<option value="">Pilih Hutang</option>' + DB.debts.map(d=>'<option value="' + d.id + '">' + esc(d.name) + ' (Rp ' + d.remaining.toLocaleString() + ')</option>').join('');
}

function populateTransactionReceivableSelect(){
  const select = document.getElementById('txReceivableSelect');
  select.innerHTML = '<option value="">Pilih Piutang</option>' + DB.receivables.map(r=>'<option value="' + r.id + '">' + esc(r.name) + ' (Rp ' + r.remaining.toLocaleString() + ')</option>').join('');
}

function syncTransactionReceivableMembers(){
  const recvId = document.getElementById('txReceivableSelect').value;
  const recv = DB.receivables.find(r=>r.id == recvId);
  const memberArea = document.getElementById('txReceivableMemberArea');
  const memberSelect = document.getElementById('txReceivableMember');
  if(recv && recv.type === 'subscription_sharing'){
    const sub = subscriptionById(recv.subscriptionId);
    if(sub && sub.members){
      memberSelect.innerHTML = '<option value="">Pilih Member</option>' + sub.members.map(m=>'<option value="' + m.id + '">' + esc(m.name) + '</option>').join('');
      memberArea.classList.remove('hidden');
      return;
    }
  }
  memberArea.classList.add('hidden');
}

function syncAccountForm(){
  const isCredit = accType.value === 'Credit Card';
  cashAccountArea.classList.toggle('hidden', isCredit);
  creditAccountArea.classList.toggle('hidden', !isCredit);
}

function syncDebtForm(){
  debtCreditArea.classList.toggle('hidden', debtType.value !== 'credit_card');
  const items = categoriesFor('expense');
  debtCategory.innerHTML = '<option value="">Pilih Kategori</option>' + items.map(c=>'<option value="' + c.id + '">' + esc(c.name) + '</option>').join('');
}

function resetAccountForm(){
  editingAccountId = null;
  accName.value = '';
  accType.value = 'Bank';
  accBalance.value = '';
  accLimit.value = '';
  accUsedLimit.value = '';
  saveAccountBtn.textContent = 'Save Account';
  cancelAccountBtn.classList.add('hidden');
  syncAccountForm();
}

function resetDebtForm(){
  editingDebtId = null;
  debtType.value = 'regular';
  debtCategory.value = '';
  debtCreditCard.value = '';
  debtBorrower.value = '';
  debtName.value = '';
  debtTotal.value = '';
  debtTenor.value = '';
  debtDueDay.value = '';
  saveDebtBtn.textContent = 'Save Debt';
  cancelDebtBtn.classList.add('hidden');
  syncDebtForm();
}

function resetReceivableForm(){
  editingReceivableId = null;
  recvType.value = 'regular';
  recvSubscription.value = '';
  recvName.value = '';
  recvTotal.value = '';
  recvMember.value = '';
  recvMemberArea.classList.add('hidden');
  recvSubscriptionArea.classList.add('hidden');
  saveRecvBtn.textContent = 'Save Receivable';
  cancelRecvBtn.classList.add('hidden');
}

function syncReceivableType(){
  const isSharing = recvType.value === 'subscription_sharing';
  recvSubscriptionArea.classList.toggle('hidden', !isSharing);
  if(!isSharing){
    recvSubscription.value = '';
    recvName.value = '';
    recvTotal.value = '';
  }
}

function syncRecvSubscription(){
  const sub = subscriptionById(recvSubscription.value);
  if(sub){
    recvName.value = sub.name;
    recvTotal.value = sub.totalCost || sub.members.reduce((sum,m)=>sum + Number(m.shareAmount || 0),0);
  }
}

function syncReceivableSelection(){
  const recv = DB.receivables.find(r=>r.id == recvSelect.value);
  const isSharing = recv?.type === 'subscription_sharing';
  recvMemberArea.classList.toggle('hidden', !isSharing);
  if(isSharing){
    const sub = subscriptionById(recv.subscriptionId);
    const members = sub ? sub.members : [];
    recvMember.innerHTML = '<option value="">Pilih Member</option>' + members.map(m=>{
      const remaining = Math.max(0, Number(m.shareAmount || 0) - Number(m.amountPaid || 0));
      return '<option value="' + m.id + '">' + esc(m.name) + ' - ' + rp(remaining) + '</option>';
    }).join('');
  } else {
    recvMember.innerHTML = '';
  }
}

function resetSubscriptionForm(){
  editingSubscriptionId = null;
  subName.value = '';
  subCategory.value = '';
  subSubscriptionCategory.value = 'personal';
  subMaxMembers.value = '';
  subCycle.value = 'monthly';
  subRenewalDate.value = today();
  subTotal.value = '';
  document.getElementById('subSharingCost').value = '';
  subAccount.value = '';
  subNote.value = '';
  subStatus.value = 'active';
  document.getElementById('subCreationMemberName').value = '';
  document.getElementById('subCreationMemberShare').value = '';
  document.getElementById('subCreationMemberNote').value = '';
  subCreationMembers = [];
  subSharingCostManuallyEdited = false;
  saveSubBtn.textContent = 'Save Subscription';
  cancelSubBtn.classList.add('hidden');
  syncSubscriptionCategory();
}

function syncSubscriptionCategory(){
  const isSharing = subSubscriptionCategory.value === 'sharing';
  subMaxMembersArea.classList.toggle('hidden', !isSharing);
  document.getElementById('subCreationMembersArea').classList.toggle('hidden', !isSharing);
  document.getElementById('subSharingCostArea').classList.toggle('hidden', !isSharing);
  if(!isSharing){
    subCreationMembers = [];
    renderSubCreationMembersList();
    subSharingCostManuallyEdited = false;
    document.getElementById('subSharingCost').value = '';
  } else {
    calculateSharingCost();
  }
}

function calculateSharingCost(){
  if(subSharingCostManuallyEdited) return;
  const totalCost = amountFrom(subTotal);
  const maxMembers = Number(subMaxMembers.value || 0);
  if(totalCost > 0 && maxMembers > 0){
    const sharingCost = Math.round(totalCost / maxMembers);
    document.getElementById('subSharingCost').value = sharingCost;
  }
}

function renderSubCreationMembersList(){
  const list = document.getElementById('subCreationMembersList');
  if(subCreationMembers.length === 0){
    list.innerHTML = '<div style="color:var(--muted-fg);font-size:12px;text-align:center;padding:12px">No members added yet</div>';
    return;
  }
  list.innerHTML = subCreationMembers.map((m, idx) => {
    let html = '<div style="display:flex;align-items:center;gap:8px;padding:10px;background:var(--bg);border:1px solid var(--border);border-radius:8px;font-size:13px">';
    html += '<div style="flex:1;min-width:0">';
    html += '<div style="font-weight:500;color:var(--text)">' + esc(m.name) + '</div>';
    html += '<div style="color:var(--muted-fg);font-size:12px">Rp ' + m.shareAmount.toLocaleString() + '</div>';
    if(m.note) html += '<div style="color:var(--muted-fg);font-size:11px;margin-top:2px">' + esc(m.note) + '</div>';
    html += '</div>';
    html += '<button onclick="removeSubCreationMember(' + idx + ')" class="btn btn-danger" style="padding:4px 8px;font-size:12px">Remove</button>';
    html += '</div>';
    return html;
  }).join('');
}

function removeSubCreationMember(idx){
  subCreationMembers.splice(idx, 1);
  renderSubCreationMembersList();
}

function resetDebtPaymentForm(){
  debtSelect.value = '';
  debtAccount.value = '';
  debtAmount.value = '';
  debtDate.value = today();
  debtNote.value = '';
}

function resetReceivablePaymentForm(){
  recvSelect.value = '';
  recvAccount.value = '';
  recvAmount.value = '';
  recvDate.value = today();
  recvNote.value = '';
  recvMember.value = '';
  recvMemberArea.classList.add('hidden');
}

function resetSubMemberForm(){
  subMemberSubscription.value = '';
  subMemberName.value = '';
  subMemberShare.value = '';
  subMemberNote.value = '';
}

function syncTransactionForm(){
  const type = txType.value;
  transferArea.classList.toggle('hidden', type !== 'transfer');
  document.getElementById('debtPaymentArea').classList.toggle('hidden', type !== 'debt_payment');
  document.getElementById('receivablePaymentArea').classList.toggle('hidden', type !== 'receivable_payment');
  txCategory.disabled = type === 'transfer' || type === 'debt_payment' || type === 'receivable_payment';
  if(type === 'transfer'){
    txCategory.innerHTML = '<option value="">Transfer</option>';
    return;
  }

  if(type === 'debt_payment' || type === 'receivable_payment'){
    txCategory.innerHTML = '<option value="">Auto-filled</option>';
    return;
  }

  const current = txCategory.value;
  const items = categoriesFor(type);
  txCategory.innerHTML = '<option value="">Pilih Kategori</option>' + items.map(c=>'<option value="' + c.id + '">' + esc(c.name) + '</option>').join('');
  if(items.some(c=>String(c.id) === current)) txCategory.value = current;
}

function activatePage(pageId){
  document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));
  const target = document.getElementById(pageId);
  if(target) target.classList.remove('hidden');
  document.querySelectorAll('.nav-link[data-page]').forEach(link=>link.classList.toggle('active', link.dataset.page === pageId));
}

document.querySelectorAll('.nav-link[data-page]').forEach(btn=>{
  btn.addEventListener('click', ()=>activatePage(btn.dataset.page));
});

let fabMenuOpen = false;
let subCreationMembers = [];
let subSharingCostManuallyEdited = false;

function toggleFabMenu(){
  const menu = document.getElementById('fabMenu');
  fabMenuOpen = !fabMenuOpen;
  if(fabMenuOpen){
    menu.classList.remove('hidden');
  } else {
    menu.classList.add('hidden');
  }
}

function closeFabMenu(){
  const menu = document.getElementById('fabMenu');
  menu.classList.add('hidden');
  fabMenuOpen = false;
}

fab?.addEventListener('click', (e)=>{
  e.stopPropagation();
  toggleFabMenu();
});

document.addEventListener('click', (e)=>{
  if(!document.getElementById('fabContainer').contains(e.target)){
    closeFabMenu();
  }
});

document.querySelectorAll('.fab-menu-item').forEach(item=>{
  item.addEventListener('click', (e)=>{
    e.stopPropagation();
    const action = item.dataset.action;
    closeFabMenu();
    
    switch(action){
      case 'transaction':
        activatePage('transactions');
        resetTransactionForm();
        openModal('transactionModal');
        break;
      case 'debt':
        activatePage('debts');
        resetDebtForm();
        openModal('debtModal');
        break;
      case 'receivable':
        activatePage('receivables');
        resetReceivableForm();
        openModal('receivableModal');
        break;
      case 'subscription':
        activatePage('dashboard');
        resetSubscriptionForm();
        openModal('subscriptionModal');
        break;
      case 'account':
        activatePage('accounts');
        resetAccountForm();
        openModal('accountModal');
        break;
    }
  });
});

document.getElementById('addMemberToCreationBtn')?.addEventListener('click', ()=>{
  const name = document.getElementById('subCreationMemberName').value.trim();
  const shareAmount = amountFrom(document.getElementById('subCreationMemberShare'));
  const note = document.getElementById('subCreationMemberNote').value.trim();
  
  if(!name) return alert('Isi nama member.');
  if(!requirePositive(shareAmount, 'Nilai share harus lebih dari 0.')) return;
  
  subCreationMembers.push({name, shareAmount, note});
  document.getElementById('subCreationMemberName').value = '';
  document.getElementById('subCreationMemberShare').value = '';
  document.getElementById('subCreationMemberNote').value = '';
  renderSubCreationMembersList();
});

txType.onchange = syncTransactionForm;
document.getElementById('txReceivableSelect').onchange = syncTransactionReceivableMembers;
accType.onchange = syncAccountForm;
debtType.onchange = syncDebtForm;

subTotal.addEventListener('input', calculateSharingCost);
subMaxMembers.addEventListener('input', calculateSharingCost);
document.getElementById('subSharingCost').addEventListener('input', ()=>{
  subSharingCostManuallyEdited = true;
});

saveAccountBtn.onclick = ()=>{
  const name = accName.value.trim();
  const type = accType.value;
  const balance = amountFrom(accBalance);
  const creditLimit = amountFrom(accLimit);
  const usedLimit = amountFrom(accUsedLimit);
  if(!name) return alert('Isi nama account.');
  if(editingAccountId){
    const account = DB.accounts.find(a=>a.id == editingAccountId);
    if(!account) return alert('Account tidak ditemukan.');
    if(account.type !== type) return alert('Tidak bisa mengubah jenis account yang sudah dipakai.');
    const hasTransactionRefs = DB.transactions.some(t => t.accountId == account.id || t.fromId == account.id || t.toId == account.id || t.creditCardId == account.id);
    const hasDebtRefs = DB.debts.some(d => d.creditCardId == account.id);
    if(type === 'Credit Card'){
      if(!requirePositive(creditLimit, 'Limit kartu kredit harus lebih dari 0.')) return;
      if(usedLimit < 0) return alert('Used limit tidak boleh negatif.');
      if(usedLimit > creditLimit) return alert('Used limit tidak boleh melebihi limit kartu.');
      if(hasTransactionRefs || hasDebtRefs){
        if(account.creditLimit !== creditLimit || account.usedLimit !== usedLimit) return alert('Tidak dapat mengubah limit account setelah digunakan di transaksi atau hutang.');
      }
      account.name = name;
      account.creditLimit = creditLimit;
      account.usedLimit = usedLimit;
    } else {
      if(balance < 0) return alert('Saldo tidak boleh negatif.');
      if(hasTransactionRefs || hasDebtRefs){
        if(account.balance !== balance) return alert('Tidak dapat mengubah saldo account setelah digunakan di transaksi atau hutang.');
      }
      account.name = name;
      account.balance = balance;
    }
    resetAccountForm();
  } else {
    if(type === 'Credit Card'){
      if(!requirePositive(creditLimit, 'Limit kartu kredit harus lebih dari 0.')) return;
      if(usedLimit < 0) return alert('Used limit tidak boleh negatif.');
      if(usedLimit > creditLimit) return alert('Used limit tidak boleh melebihi limit kartu.');
      DB.accounts.push({id: nextId(), name, type, balance: 0, creditLimit, usedLimit});
      accLimit.value = '';
      accUsedLimit.value = '';
    } else {
      if(balance < 0) return alert('Saldo awal tidak boleh negatif.');
      DB.accounts.push({id: nextId(), name, type, balance, creditLimit: 0, usedLimit: 0});
      accBalance.value = '';
    }
  }
  accName.value = '';
  save();
  closeModal('accountModal');
};

cancelAccountBtn.onclick = ()=>{ resetAccountForm(); closeModal('accountModal'); };

saveTxBtn.onclick = ()=>{
  const type = txType.value;
  const amount = amountFrom(txAmount);
  const date = txDate.value || today();
  if(!requirePositive(amount)) return;

  // Handle debt_payment type
  if(type === 'debt_payment'){
    const debt = DB.debts.find(d=>d.id == document.getElementById('txDebtSelect').value);
    const account = DB.accounts.find(a=>a.id == txFrom.value);
    if(!debt || !account) return alert('Lengkapi data.');
    if(account.type === 'Credit Card') return alert('Pembayaran hutang harus dari account kas/bank, bukan kartu kredit.');
    if(amount > debt.remaining) return alert('Pembayaran melebihi sisa hutang.');
    if(!adjustAccountBalance(account, -amount)) return alert('Saldo tidak cukup.');
    
    debt.remaining = Math.max(0, debt.remaining - amount);
    if(debt.type === 'credit_card' && debt.creditCardId){
      const card = DB.accounts.find(a=>a.id == debt.creditCardId);
      if(card) adjustCreditUsed(card, -amount);
    }
    
    const txId = nextId();
    DB.transactions.push({id: txId, date, type:'debt_payment', category: debt.name, amount, accountId: account.id, debtId: debt.id, creditCardId: debt.creditCardId || null, note: txNote.value.trim() || 'Bayar hutang'});
    debt.paymentHistory = debt.paymentHistory || [];
    debt.paymentHistory.push({id: nextId(), date, amount, accountId: account.id, note: txNote.value.trim(), transactionId: txId});
    
    resetTransactionForm();
    save();
    closeModal('transactionModal');
    return;
  }

  // Handle receivable_payment type
  if(type === 'receivable_payment'){
    const recv = DB.receivables.find(r=>r.id == document.getElementById('txReceivableSelect').value);
    const account = DB.accounts.find(a=>a.id == txFrom.value);
    if(!recv || !account) return alert('Lengkapi data.');
    if(account.type === 'Credit Card') return alert('Penerimaan piutang harus masuk account kas/bank, bukan kartu kredit.');
    if(amount > recv.remaining) return alert('Pembayaran melebihi sisa piutang.');
    
    let memberId = null;
    if(recv.type === 'subscription_sharing'){
      const member = subscriptionById(recv.subscriptionId)?.members.find(m=>m.id == document.getElementById('txReceivableMember').value);
      if(!member) return alert('Pilih member subscription.');
      const memberRemaining = Math.max(0, Number(member.shareAmount || 0) - Number(member.amountPaid || 0));
      if(amount > memberRemaining) return alert('Pembayaran melebihi sisa member.');
      member.amountPaid = Number(member.amountPaid || 0) + amount;
      member.paid = member.amountPaid >= Number(member.shareAmount || 0);
      if(member.paid){ member.paymentDate = date; }
      memberId = member.id;
    }
    
    adjustAccountBalance(account, amount);
    recv.remaining = Math.max(0, recv.remaining - amount);
    const txId = nextId();
    DB.transactions.push({
      id: txId,
      date,
      type:'receivable_payment',
      category: recv.name,
      amount,
      accountId: account.id,
      receivableId: recv.id,
      subscriptionId: recv.subscriptionId || null,
      memberId,
      debtId: recv.debtId || null,
      note: txNote.value.trim() || 'Terima piutang'
    });
    recv.collectionHistory = recv.collectionHistory || [];
    recv.collectionHistory.push({
      id: nextId(),
      date,
      amount,
      accountId: account.id,
      memberId,
      note: txNote.value.trim(),
      transactionId: txId
    });
    const sub = subscriptionById(recv.subscriptionId);
    if(sub){
      sub.paymentHistory = sub.paymentHistory || [];
      sub.paymentHistory.push({
        id: nextId(),
        date,
        amount,
        accountId: account.id,
        memberId,
        note: txNote.value.trim(),
        transactionId: txId
      });
    }
    
    resetTransactionForm();
    save();
    closeModal('transactionModal');
    return;
  }

  if(editingTransactionId){
    const tx = DB.transactions.find(t=>t.id == editingTransactionId);
    if(!tx) return alert('Transaksi tidak ditemukan.');
    if(!reverseTransaction(tx)) return;
    tx.date = date;
    tx.type = type;
    tx.note = txNote.value.trim();
    if(type === 'transfer'){
      const from = DB.accounts.find(a=>a.id == txFrom.value);
      const to = DB.accounts.find(a=>a.id == txTo.value);
      if(!from || !to) return alert('Pilih account.');
      if(from.id === to.id) return alert('Account harus berbeda.');
      if(from.type === 'Credit Card' || to.type === 'Credit Card') return alert('Transfer hanya untuk account kas/bank. Pakai Debts untuk transaksi kartu kredit.');
      if(!adjustAccountBalance(from, -amount)) return alert('Saldo tidak cukup.');
      adjustAccountBalance(to, amount);
      tx.category = 'Transfer';
      tx.categoryId = 0;
      tx.amount = amount;
      tx.fromId = from.id;
      tx.toId = to.id;
      delete tx.accountId;
      delete tx.creditCardId;
      delete tx.debtId;
      delete tx.receivableId;
    } else {
      const account = DB.accounts.find(a=>a.id == txFrom.value);
      const category = selectedCategory();
      if(!account) return alert('Pilih account.');
      if(account.type === 'Credit Card') return alert('Income/expense kas tidak memakai account kartu kredit. Pakai Debts untuk cicilan kartu kredit.');
      if(!category) return alert('Pilih kategori.');
      const delta = type === 'income' ? amount : -amount;
      if(!adjustAccountBalance(account, delta)) return alert('Saldo tidak cukup.');
      tx.category = category.category;
      tx.categoryId = category.categoryId;
      tx.amount = amount;
      tx.accountId = account.id;
      delete tx.fromId;
      delete tx.toId;
      delete tx.creditCardId;
      delete tx.debtId;
      delete tx.receivableId;
    }
    resetTransactionForm();
    save();
    closeModal('transactionModal');
    return;
  }

  if(type === 'transfer'){
    const from = DB.accounts.find(a=>a.id == txFrom.value);
    const to = DB.accounts.find(a=>a.id == txTo.value);
    if(!from || !to) return alert('Pilih account.');
    if(from.id === to.id) return alert('Account harus berbeda.');
    if(from.type === 'Credit Card' || to.type === 'Credit Card') return alert('Transfer hanya untuk account kas/bank. Pakai Debts untuk transaksi kartu kredit.');
    if(!adjustAccountBalance(from, -amount)) return alert('Saldo tidak cukup.');
    adjustAccountBalance(to, amount);
    DB.transactions.push({id: nextId(), date, type:'transfer', category:'Transfer', amount, fromId: from.id, toId: to.id, note: txNote.value.trim()});
  } else {
    const account = DB.accounts.find(a=>a.id == txFrom.value);
    const category = selectedCategory();
    if(!account) return alert('Pilih account.');
    if(account.type === 'Credit Card') return alert('Income/expense kas tidak memakai account kartu kredit. Pakai Debts untuk cicilan kartu kredit.');
    if(!category) return alert('Pilih kategori.');
    const delta = type === 'income' ? amount : -amount;
    if(!adjustAccountBalance(account, delta)) return alert('Saldo tidak cukup.');
    DB.transactions.push({id: nextId(), date, type, category: category.category, categoryId: category.categoryId, amount, accountId: account.id, note: txNote.value.trim()});
  }

  resetTransactionForm();
  save();
  closeModal('transactionModal');
};

saveDebtBtn.onclick = ()=>{
  const type = debtType.value;
  const creditCardId = type === 'credit_card' ? Number(debtCreditCard.value || 0) || null : null;
  const borrower = debtBorrower.value.trim();
  const name = debtName.value.trim();
  const total = amountFrom(debtTotal);
  const tenor = Number(debtTenor.value || 0);
  const dueDay = Number(debtDueDay.value || 0);
  const debtCategorySelected = selectedDebtCategory();
  if(!name) return alert('Isi nama hutang.');
  if(!requirePositive(total, 'Total hutang harus lebih dari 0.')) return;
  if(type === 'credit_card' && !creditCardId) return alert('Pilih kartu kredit.');
  if(!debtCategorySelected) return alert('Pilih kategori.');

  if(editingDebtId){
    const debt = DB.debts.find(d=>d.id == editingDebtId);
    if(!debt) return alert('Hutang tidak ditemukan.');
    if(debt.remaining !== debt.total && total !== debt.total) return alert('Tidak dapat mengubah total hutang setelah pembayaran dimulai.');
    if(debt.type === 'credit_card' && debt.creditCardId){
      const card = DB.accounts.find(a=>a.id == debt.creditCardId);
      const diff = total - debt.total;
      if(diff !== 0 && card && !adjustCreditUsed(card, diff)) return alert('Tidak dapat menyesuaikan limit kartu kredit.');
    }
    debt.type = type;
    debt.name = name;
    debt.categoryId = debtCategorySelected.categoryId;
    debt.category = debtCategorySelected.category;
    debt.tenor = tenor;
    debt.dueDay = dueDay;
    if(debt.remaining === debt.total){
      debt.remaining = total;
    }
    debt.total = total;
    debt.creditCardId = creditCardId;
    debt.borrower = borrower;
    if(debt.type === 'credit_card' && borrower && !debt.receivableId){
      const receivable = {id: nextId(), name: borrower + ' - ' + name, total, remaining: total, source: 'credit_card_borrower', debtId: debt.id};
      DB.receivables.push(receivable);
      debt.receivableId = receivable.id;
    }
    if(debt.type === 'credit_card' && debt.receivableId){
      const receivable = DB.receivables.find(r=>r.id == debt.receivableId);
      if(receivable){
        receivable.name = borrower ? borrower + ' - ' + name : receivable.name;
        receivable.total = total;
        receivable.remaining = total;
      }
    }
    if(type !== 'credit_card'){
      debt.receivableId = null;
    }
    resetDebtForm();
    save();
    closeModal('debtModal');
    return;
  }

  const debt = {id: nextId(), name, type, total, remaining: total, creditCardId, borrower, receivableId: null, tenor, dueDay, categoryId: debtCategorySelected.categoryId, category: debtCategorySelected.category};
  if(type === 'credit_card' && borrower){
    const receivable = {id: nextId(), name: borrower + ' - ' + name, total, remaining: total, source: 'credit_card_borrower', debtId: debt.id};
    DB.receivables.push(receivable);
    debt.receivableId = receivable.id;
  }
  DB.debts.push(debt);

  resetDebtForm();
  save();
  closeModal('debtModal');
};

cancelDebtBtn.onclick = ()=>{ resetDebtForm(); closeModal('debtModal'); };

cancelDebtPaymentBtn.onclick = ()=>{ resetDebtPaymentForm(); closeModal('debtPaymentModal'); };

payDebtBtn.onclick = ()=>{
  const account = DB.accounts.find(a=>a.id == debtAccount.value);
  const debt = DB.debts.find(d=>d.id == debtSelect.value);
  const amount = amountFrom(debtAmount);
  const date = debtDate.value || today();
  if(!account || !debt) return alert('Lengkapi data.');
  if(account.type === 'Credit Card') return alert('Pembayaran hutang harus dari account kas/bank, bukan kartu kredit.');
  if(!requirePositive(amount)) return;
  if(amount > debt.remaining) return alert('Pembayaran melebihi sisa hutang.');
  if(!adjustAccountBalance(account, -amount)) return alert('Saldo tidak cukup.');

  debt.remaining = Math.max(0, debt.remaining - amount);
  if(debt.type === 'credit_card' && debt.creditCardId){
    const card = DB.accounts.find(a=>a.id == debt.creditCardId);
    if(card) adjustCreditUsed(card, -amount);
  }

  const txId = nextId();
  DB.transactions.push({id: txId, date, type:'debt_payment', category: debt.name, amount, accountId: account.id, debtId: debt.id, creditCardId: debt.creditCardId || null, note: debtNote.value.trim() || 'Bayar hutang'});
  debt.paymentHistory = debt.paymentHistory || [];
  debt.paymentHistory.push({id: nextId(), date, amount, accountId: account.id, note: debtNote.value.trim(), transactionId: txId});
  debtAmount.value='';
  debtNote.value='';
  debtDate.value = today();
  save();
  resetDebtPaymentForm();
  closeModal('debtPaymentModal');
};

saveRecvBtn.onclick = ()=>{
  const type = recvType.value;
  const subscription = subscriptionById(recvSubscription.value);
  const name = recvName.value.trim();
  const total = amountFrom(recvTotal);
  if(type === 'subscription_sharing' && !subscription) return alert('Pilih subscription.');
  if(type === 'regular' && !name) return alert('Isi nama piutang.');
  if(!requirePositive(total, 'Total piutang harus lebih dari 0.')) return;

  if(type === 'subscription_sharing'){
    const defaultTotal = subscription.totalCost || subscription.members.reduce((sum,m)=>sum + Number(m.shareAmount || 0),0);
    if(total !== defaultTotal) return alert('Total harus sama dengan total biaya subscription.');
  }

  if(editingReceivableId){
    const recv = DB.receivables.find(r=>r.id == editingReceivableId);
    if(!recv) return alert('Piutang tidak ditemukan.');
    if(recv.remaining !== recv.total && total !== recv.total) return alert('Tidak dapat mengubah total piutang setelah pembayaran dimulai.');
    recv.type = type;
    recv.subscriptionId = type === 'subscription_sharing' ? subscription.id : null;
    recv.name = type === 'subscription_sharing' ? subscription.name : name;
    recv.total = total;
    if(recv.remaining === recv.total){
      recv.remaining = total;
    }
    resetReceivableForm();
    save();
    closeModal('receivableModal');
    return;
  }

  const recv = {
    id: nextId(),
    type,
    name: type === 'subscription_sharing' ? subscription.name : name,
    total,
    remaining: total,
    source: type === 'subscription_sharing' ? 'subscription_sharing' : 'manual',
    subscriptionId: type === 'subscription_sharing' ? subscription.id : null,
    debtId: null,
    collectionHistory: []
  };
  DB.receivables.push(recv);
  if(type === 'subscription_sharing'){
    subscription.receivableId = recv.id;
  }
  resetReceivableForm();
  save();
  closeModal('receivableModal');
};

receiveBtn.onclick = ()=>{
  const account = DB.accounts.find(a=>a.id == recvAccount.value);
  const recv = DB.receivables.find(r=>r.id == recvSelect.value);
  const amount = amountFrom(recvAmount);
  const date = recvDate.value || today();
  if(!account || !recv) return alert('Lengkapi data.');
  if(account.type === 'Credit Card') return alert('Penerimaan piutang harus masuk account kas/bank, bukan kartu kredit.');
  if(!requirePositive(amount)) return;
  if(amount > recv.remaining) return alert('Pembayaran melebihi sisa piutang.');

  let memberId = null;
  if(recv.type === 'subscription_sharing'){
    const member = subscriptionById(recv.subscriptionId)?.members.find(m=>m.id == recvMember.value);
    if(!member) return alert('Pilih member subscription.');
    const memberRemaining = Math.max(0, Number(member.shareAmount || 0) - Number(member.amountPaid || 0));
    if(amount > memberRemaining) return alert('Pembayaran melebihi sisa member.');
    member.amountPaid = Number(member.amountPaid || 0) + amount;
    member.paid = member.amountPaid >= Number(member.shareAmount || 0);
    if(member.paid){ member.paymentDate = date; }
    memberId = member.id;
  }

  adjustAccountBalance(account, amount);
  recv.remaining = Math.max(0, recv.remaining - amount);
  const txId = nextId();
  DB.transactions.push({
    id: txId,
    date,
    type:'receivable_payment',
    category: recv.name,
    amount,
    accountId: account.id,
    receivableId: recv.id,
    subscriptionId: recv.subscriptionId || null,
    memberId,
    debtId: recv.debtId || null,
    note: recvNote.value.trim() || 'Terima piutang'
  });
  recv.collectionHistory = recv.collectionHistory || [];
  recv.collectionHistory.push({
    id: nextId(),
    date,
    amount,
    accountId: account.id,
    memberId,
    note: recvNote.value.trim(),
    transactionId: txId
  });
  const sub = subscriptionById(recv.subscriptionId);
  if(sub){
    sub.paymentHistory = sub.paymentHistory || [];
    sub.paymentHistory.push({
      id: nextId(),
      date,
      amount,
      accountId: account.id,
      memberId,
      note: recvNote.value.trim(),
      transactionId: txId
    });
  }
  recvAmount.value='';
  recvNote.value='';
  recvMember.value='';
  recvDate.value = today();
  save();
  resetReceivablePaymentForm();
  closeModal('receivablePaymentModal');
};

saveSubBtn.onclick = ()=>{
  const name = subName.value.trim();
  const category = categoryById(subCategory.value);
  const subscriptionCategory = subSubscriptionCategory.value === 'sharing' ? 'sharing' : 'personal';
  const maxMembers = subscriptionCategory === 'sharing' ? Number(subMaxMembers.value || 0) : null;
  const sharingCost = subscriptionCategory === 'sharing' ? Number(document.getElementById('subSharingCost').value || 0) : null;
  const cycle = subCycle.value;
  const renewalDate = subRenewalDate.value || today();
  const totalCost = amountFrom(subTotal);
  const account = DB.accounts.find(a=>a.id == subAccount.value) || null;
  const status = ['active','paused','canceled'].includes(subStatus.value) ? subStatus.value : 'active';
  if(!name) return alert('Isi nama subscription.');
  if(!category) return alert('Pilih kategori.');
  if(!requirePositive(totalCost, 'Total biaya harus lebih dari 0.')) return;
  if(subscriptionCategory === 'sharing' && (!maxMembers || maxMembers < 1)) return alert('Isi jumlah maksimal member untuk sharing subscription.');

  if(editingSubscriptionId){
    const sub = DB.subscriptions.find(s=>s.id == editingSubscriptionId);
    if(!sub) return alert('Subscription tidak ditemukan.');
    const previousTotal = Number(sub.totalCost || 0);
    const previousCardId = sub.creditCardId;
    const previousStatus = sub.status;
    const updatedCardId = account?.type === 'Credit Card' ? account.id : null;
    const updated = {
      ...sub,
      name,
      categoryId: category.id,
      category: category.name,
      subscriptionCategory,
      maxMembers,
      sharingCost,
      cycle,
      renewalDate,
      totalCost,
      accountId: account?.id || null,
      note: subNote.value.trim(),
      status,
      creditCardId: updatedCardId
    };
    if(!reserveSubscriptionCredit(updated, previousTotal, previousCardId, previousStatus)) return;
    Object.assign(sub, updated);
    ensureSubscriptionReceivable(sub);
    resetSubscriptionForm();
    save();
    closeModal('subscriptionModal');
    return;
  }

  const newSubscription = {
    id: nextId(),
    name,
    categoryId: category.id,
    category: category.name,
    subscriptionCategory,
    maxMembers,
    sharingCost,
    cycle,
    renewalDate,
    totalCost,
    accountId: account?.id || null,
    note: subNote.value.trim(),
    status,
    members: subCreationMembers.map(m => ({id: nextId(), name: m.name, shareAmount: m.shareAmount, note: m.note, paid: false, paymentDate: '', amountPaid: 0})),
    paymentHistory: [],
    receivableId: null,
    creditCardId: account?.type === 'Credit Card' ? account.id : null
  };
  if(!reserveSubscriptionCredit(newSubscription, 0, null, 'active')) return;
  DB.subscriptions.push(newSubscription);
  ensureSubscriptionReceivable(newSubscription);
  resetSubscriptionForm();
  save();
  closeModal('subscriptionModal');
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
  if(DB.accounts.length || DB.debts.length || DB.receivables.length || DB.transactions.length || DB.subscriptions.length) return alert('Data sudah ada.');
  DB.accounts.push(
    {id:1,name:'BCA',type:'Bank',balance:5000000,creditLimit:0,usedLimit:0},
    {id:2,name:'Jenius',type:'Bank',balance:1000000,creditLimit:0,usedLimit:0},
    {id:3,name:'BCA Card',type:'Credit Card',balance:0,creditLimit:12000000,usedLimit:0}
  );
  DB.debts.push({id:1,name:'Cicilan Tablet',type:'regular',total:2500000,remaining:2500000,creditCardId:null,borrower:'',receivableId:null,tenor:0,dueDay:0,categoryId:101,category:'General'});
  DB.receivables.push({id:1,name:'Princess',total:500000,remaining:500000,source:'manual',debtId:null,collectionHistory:[]});
  DB.subscriptions.push({
    id:1,
    name:'Streaming Service',
    categoryId:101,
    category:'General',
    cycle:'monthly',
    renewalDate:today(),
    totalCost:120000,
    accountId:1,
    note:'Demo subscription',
    status:'active',
    members:[{id:nextId(),name:'Alice',shareAmount:60000,paid:false,paymentDate:'',note:'',amountPaid:0}],
    paymentHistory:[],
    receivableId:null,
    creditCardId:null
  });
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
    DB.subscriptions = Array.isArray(backup.subscriptions) ? backup.subscriptions : [];
    migrate();
    render();
    alert('Backup berhasil diimport.');
  }catch{
    alert('File backup tidak valid.');
  }finally{
    importFile.value = '';
  }
};

deleteAllBtn.onclick = ()=>{
  if(!confirm('Hapus semua data secara permanen? Tindakan ini tidak bisa dibatalkan.')) return;
  DB.accounts = [];
  DB.transactions = [];
  DB.debts = [];
  DB.receivables = [];
  DB.categories = [];
  DB.subscriptions = [];
  save();
  alert('Semua data telah dihapus.');
};

function deleteDebt(id){
  const debt = DB.debts.find(d=>d.id == id);
  if(!debt) return;
  if(debt.remaining !== debt.total) return alert('Hutang yang sudah punya pembayaran tidak bisa dihapus.');
  const linkedReceivable = debt.receivableId ? DB.receivables.find(r=>r.id == debt.receivableId) : null;
  if(linkedReceivable && linkedReceivable.remaining !== linkedReceivable.total) return alert('Hutang dengan piutang yang sudah dibayar sebagian tidak bisa dihapus.');
  if(confirm('Hapus hutang ini?')){
    if(debt.type === 'credit_card' && debt.creditCardId){
      const card = DB.accounts.find(a=>a.id == debt.creditCardId);
      if(card) adjustCreditUsed(card, -debt.total);
    }
    if(debt.receivableId) removeById(DB.receivables, debt.receivableId);
    removeById(DB.debts, id);
    save();
  }
}

function deleteReceivable(id){
  const recv = DB.receivables.find(r=>r.id == id);
  if(!recv) return;
  if(recv.remaining !== recv.total) return alert('Piutang yang sudah punya pembayaran tidak bisa dihapus.');
  if(confirm('Hapus piutang ini?')){
    if(recv.type === 'subscription_sharing' && recv.subscriptionId){
      const sub = subscriptionById(recv.subscriptionId);
      if(sub && sub.receivableId === recv.id){ sub.receivableId = null; }
    }
    removeById(DB.receivables, id);
    save();
  }
}

function reverseTransaction(tx){
  if(tx.type === 'transfer'){
    const from = DB.accounts.find(a=>a.id == tx.fromId);
    const to = DB.accounts.find(a=>a.id == tx.toId);
    if(!from || !to) return alert('Akun transfer tidak ditemukan.');
    if(Number(to.balance || 0) < tx.amount) return alert('Tidak dapat membalikkan transfer karena saldo tujuan tidak cukup.');
    if(!adjustAccountBalance(from, tx.amount)) return alert('Tidak dapat membalikkan transfer karena saldo sumber tidak valid.');
    if(!adjustAccountBalance(to, -tx.amount)){
      adjustAccountBalance(from, -tx.amount);
      return alert('Tidak dapat membalikkan transfer karena saldo tujuan tidak valid.');
    }
    return true;
  }

  if(tx.type === 'income' || tx.type === 'expense'){
    const account = DB.accounts.find(a=>a.id == tx.accountId);
    if(!account) return alert('Akun tidak ditemukan.');
    const delta = tx.type === 'income' ? -tx.amount : tx.amount;
    if(!adjustAccountBalance(account, delta)) return alert('Tidak dapat membalikkan transaksi karena saldo tidak valid.');
    return true;
  }

  if(tx.type === 'debt_payment'){
    const account = DB.accounts.find(a=>a.id == tx.accountId);
    if(!account) return alert('Akun tidak ditemukan.');
    if(tx.creditCardId){
      const card = DB.accounts.find(a=>a.id == tx.creditCardId);
      if(card && Number(card.usedLimit || 0) < tx.amount) return alert('Tidak dapat membalikkan pembayaran hutang pada kartu kredit karena used limit tidak valid.');
      if(!adjustAccountBalance(account, tx.amount)) return alert('Tidak dapat membalikkan pembayaran hutang karena saldo tidak valid.');
      if(!adjustCreditUsed(card, -tx.amount)){
        adjustAccountBalance(account, -tx.amount);
        return alert('Tidak dapat membalikkan pembayaran hutang pada kartu kredit.');
      }
      return true;
    }
    if(!adjustAccountBalance(account, tx.amount)) return alert('Tidak dapat membalikkan pembayaran hutang karena saldo tidak valid.');
    return true;
  }

  if(tx.type === 'receivable_payment'){
    const account = DB.accounts.find(a=>a.id == tx.accountId);
    const recv = DB.receivables.find(r=>r.id == tx.receivableId);
    if(!account || !recv) return alert('Akun atau piutang tidak ditemukan.');
    if(Number(account.balance || 0) < tx.amount) return alert('Tidak dapat membalikkan penerimaan piutang karena saldo account tidak cukup.');
    if(!adjustAccountBalance(account, -tx.amount)) return alert('Tidak dapat membalikkan penerimaan piutang karena saldo tidak valid.');
    recv.remaining = Math.min(recv.total, recv.remaining + tx.amount);
    return true;
  }

  return true;
}

function deleteAccount(id){
  const account = DB.accounts.find(a=>a.id == id);
  if(!account) return;
  if(DB.transactions.some(t => t.accountId == id || t.fromId == id || t.toId == id || t.creditCardId == id)) return alert('Account tidak bisa dihapus karena sudah digunakan dalam transaksi.');
  if(DB.debts.some(d => d.creditCardId == id)) return alert('Account tidak bisa dihapus karena terkait dengan hutang kartu kredit.');
  if(confirm('Hapus account ini?')){
    removeById(DB.accounts, id);
    save();
  }
}

function deleteTransaction(id){
  const tx = DB.transactions.find(t=>t.id == id);
  if(!tx) return;
  if(confirm('Hapus transaksi ini?')){
    if(!reverseTransaction(tx)) return;
    removeById(DB.transactions, id);
    save();
  }
}

function editAccount(id){
  const account = DB.accounts.find(a=>a.id == id);
  if(!account) return;
  editingAccountId = id;
  accName.value = account.name;
  accType.value = account.type;
  if(account.type === 'Credit Card'){
    accLimit.value = account.creditLimit;
    accUsedLimit.value = account.usedLimit;
  } else {
    accBalance.value = account.balance;
  }
  saveAccountBtn.textContent = 'Update Account';
  cancelAccountBtn.classList.remove('hidden');
  syncAccountForm();
  openModal('accountModal');
}

function editDebt(id){
  const debt = DB.debts.find(d=>d.id == id);
  if(!debt) return;
  editingDebtId = id;
  debtType.value = debt.type;
  debtCategory.value = debt.categoryId || '';
  debtCreditCard.value = debt.creditCardId || '';
  debtBorrower.value = debt.borrower;
  debtName.value = debt.name;
  debtTotal.value = debt.total;
  debtTenor.value = debt.tenor;
  debtDueDay.value = debt.dueDay;
  saveDebtBtn.textContent = 'Update Debt';
  cancelDebtBtn.classList.remove('hidden');
  syncDebtForm();
  openModal('debtModal');
}

function editReceivable(id){
  const recv = DB.receivables.find(r=>r.id == id);
  if(!recv) return;
  editingReceivableId = id;
  recvType.value = recv.type || 'regular';
  if(recv.type === 'subscription_sharing'){
    recvSubscription.value = recv.subscriptionId || '';
    syncReceivableType();
  } else {
    recvSubscription.value = '';
    syncReceivableType();
  }
  recvName.value = recv.name;
  recvTotal.value = recv.total;
  saveRecvBtn.textContent = 'Update Receivable';
  cancelRecvBtn.classList.remove('hidden');
  openModal('receivableModal');
}

function editSubscription(id){
  const sub = DB.subscriptions.find(s=>s.id == id);
  if(!sub) return;
  editingSubscriptionId = id;
  subName.value = sub.name;
  subCategory.value = sub.categoryId || '';
  subSubscriptionCategory.value = sub.subscriptionCategory || 'personal';
  subMaxMembers.value = sub.subscriptionCategory === 'sharing' ? (sub.maxMembers || '') : '';
  subCycle.value = sub.cycle || 'monthly';
  subRenewalDate.value = sub.renewalDate || today();
  subTotal.value = sub.totalCost || '';
  document.getElementById('subSharingCost').value = sub.subscriptionCategory === 'sharing' ? (sub.sharingCost || '') : '';
  subAccount.value = sub.accountId || '';
  subNote.value = sub.note || '';
  subStatus.value = sub.status || 'active';
  subSharingCostManuallyEdited = false;
  saveSubBtn.textContent = 'Update Subscription';
  cancelSubBtn.classList.remove('hidden');
  syncSubscriptionCategory();
  openModal('subscriptionModal');
}

function deleteSubscription(id){
  const sub = DB.subscriptions.find(s=>s.id == id);
  if(!sub) return;
  if(confirm('Hapus subscription ini?')){
    removeById(DB.subscriptions, id);
    save();
  }
}

function editTransaction(id){
  const tx = DB.transactions.find(t=>t.id == id);
  if(!tx) return;
  editingTransactionId = id;
  txDate.value = tx.date;
  txType.value = tx.type;
  txCategory.value = tx.categoryId || '';
  txAmount.value = tx.amount;
  txNote.value = tx.note || '';
  txFrom.value = tx.accountId || tx.fromId || tx.creditCardId || '';
  txTo.value = tx.toId || '';
  
  populateTransactionDebtSelect();
  populateTransactionReceivableSelect();
  
  if(tx.type === 'debt_payment'){
    document.getElementById('txDebtSelect').value = tx.debtId || '';
  }
  if(tx.type === 'receivable_payment'){
    document.getElementById('txReceivableSelect').value = tx.receivableId || '';
    syncTransactionReceivableMembers();
    if(tx.memberId){
      document.getElementById('txReceivableMember').value = tx.memberId;
    }
  }
  
  saveTxBtn.textContent = 'Update Transaction';
  cancelTxBtn.classList.remove('hidden');
  syncTransactionForm();
  openModal('transactionModal');
}

cancelRecvBtn.onclick = ()=>{ resetReceivableForm(); closeModal('receivableModal'); };

cancelRecvPaymentBtn.onclick = ()=>{ resetReceivablePaymentForm(); closeModal('receivablePaymentModal'); };

cancelSubMemberBtn.onclick = ()=>{ resetSubMemberForm(); closeModal('subMemberModal'); };

addSubMemberBtn.onclick = ()=>{
  const subscription = DB.subscriptions.find(s=>s.id == subMemberSubscription.value);
  const name = subMemberName.value.trim();
  const shareAmount = amountFrom(subMemberShare);
  const note = subMemberNote.value.trim();
  if(!subscription) return alert('Pilih subscription.');
  if(!name) return alert('Isi nama member.');
  if(!requirePositive(shareAmount, 'Nilai share harus lebih dari 0.')) return;
  subscription.members.push({id: nextId(), name, shareAmount, paid: false, paymentDate:'', note, amountPaid:0});
  ensureSubscriptionReceivable(subscription);
  subMemberName.value = '';
  subMemberShare.value = '';
  subMemberNote.value = '';
  save();
};

cancelTxBtn.onclick = ()=>{
  editingTransactionId = null;
  saveTxBtn.textContent = 'Save Transaction';
  cancelTxBtn.classList.add('hidden');
  resetTransactionForm();
  closeModal('transactionModal');
};

function deleteCategory(id){
  const category = categoryById(id);
  if(!category) return;
  if(DB.transactions.some(t=>t.categoryId == id || t.category === category.name)) return alert('Kategori yang sudah dipakai transaksi tidak bisa dihapus.');
  if(confirm('Hapus kategori ini?')){ removeById(DB.categories, id); save(); }
}

function render(){
  const cash = cashAccounts().reduce((a,b)=>a+b.balance,0);
  const debt = DB.debts.reduce((a,b)=>a+b.remaining,0);
  const recv = DB.receivables.reduce((a,b)=>a+b.remaining,0);
  const cardsCredit = creditCards();
  const creditLimit = cardsCredit.reduce((a,b)=>a+b.creditLimit,0);
  const usedLimit = cardsCredit.reduce((a,b)=>a+b.usedLimit,0);
  const availableLimit = Math.max(0, creditLimit - usedLimit);
  const netWorth = cash + recv - debt;

  // Render Dashboard - Net Worth Hero
  const netWorthEl = document.getElementById('netWorthAmount');
  if(netWorthEl) netWorthEl.textContent = rp(netWorth);
  
  // Render Dashboard - Net Worth Breakdown
  const breakdownCash = document.getElementById('breakdownCash');
  const breakdownRecv = document.getElementById('breakdownRecv');
  const breakdownDebt = document.getElementById('breakdownDebt');
  if(breakdownCash) breakdownCash.textContent = rp(cash);
  if(breakdownRecv) breakdownRecv.textContent = rp(recv);
  if(breakdownDebt) breakdownDebt.textContent = rp(debt);

  // Render Dashboard - Overview Cards
  const overviewCardsEl = document.getElementById('overviewCards');
  if(overviewCardsEl){
    overviewCardsEl.innerHTML = 
      '<div class="overview-card">' +
        '<div class="overview-card-label">Cash & Bank</div>' +
        '<div class="overview-card-value">' + rp(cash) + '</div>' +
      '</div>' +
      '<div class="overview-card">' +
        '<div class="overview-card-label">Debt</div>' +
        '<div class="overview-card-value">' + rp(debt) + '</div>' +
      '</div>' +
      '<div class="overview-card">' +
        '<div class="overview-card-label">Receivables</div>' +
        '<div class="overview-card-value">' + rp(recv) + '</div>' +
      '</div>' +
      '<div class="overview-card">' +
        '<div class="overview-card-label">Available Credit</div>' +
        '<div class="overview-card-value">' + rp(availableLimit) + '</div>' +
        '<div class="overview-card-meta">' + rp(creditLimit) + ' limit</div>' +
      '</div>';
  }

  // Render Dashboard - Need Attention Section
  const alerts = [];
  cardsCredit.forEach(card => {
    const usage = card.creditLimit > 0 ? (card.usedLimit / card.creditLimit) * 100 : 0;
    if(usage > 80){
      alerts.push({
        title: 'High Credit Card Usage',
        message: esc(card.name) + ' is ' + Math.round(usage) + '% used (' + rp(card.usedLimit) + ' / ' + rp(card.creditLimit) + ')'
      });
    }
  });
  
  DB.debts.forEach(d => {
    if(d.remaining > 0 && d.dueDay){
      const today_date = parseInt(today().split('-')[2]);
      if(d.dueDay <= today_date + 7 && d.dueDay > today_date){
        alerts.push({
          title: 'Debt Due Soon',
          message: esc(d.name) + ' is due on day ' + d.dueDay + '. Remaining: ' + rp(d.remaining)
        });
      }
    }
  });

  const needAttentionSec = document.getElementById('needAttentionSection');
  const attentionItems = document.getElementById('attentionItems');
  if(attentionItems){
    if(alerts.length > 0){
      needAttentionSec.classList.remove('hidden');
      attentionItems.innerHTML = alerts.map(a => 
        '<div class="alert-item">' +
          '<div class="alert-title">' + esc(a.title) + '</div>' +
          '<div class="alert-message">' + a.message + '</div>' +
        '</div>'
      ).join('');
    } else {
      needAttentionSec.classList.add('hidden');
    }
  }

  // Render Dashboard - Recent Transactions
  const recentTransList = document.getElementById('recentTransactionsList');
  if(recentTransList){
    const recent = DB.transactions.slice().reverse().slice(0, 5);
    if(recent.length > 0){
      recentTransList.innerHTML = recent.map(t => {
        const accountLabel = t.type === 'transfer' ? (esc(accountName(t.fromId)) + ' → ' + esc(accountName(t.toId))) : esc(accountName(t.accountId || t.creditCardId || '-'));
        const amountClass = t.type === 'income' ? 'income' : (t.type === 'expense' ? 'expense' : 'transfer');
        const sign = t.type === 'income' ? '+' : (t.type === 'transfer' ? '' : '-');
        return '<div class="transaction-item">' +
          '<div class="transaction-info">' +
            '<div class="transaction-header">' +
              '<span class="transaction-date">' + esc(t.date) + '</span>' +
            '</div>' +
            '<div class="transaction-category">' + esc(t.category || 'Transfer') + '</div>' +
            '<div class="transaction-meta">' + accountLabel + '</div>' +
          '</div>' +
          '<div class="transaction-amount ' + amountClass + '">' + sign + rp(t.amount) + '</div>' +
        '</div>';
      }).join('');
    } else {
      recentTransList.innerHTML = '<div class="transactions-empty">Belum ada transaksi</div>';
    }
  }

  const selectedFrom = txFrom.value;
  const selectedTo = txTo.value;
  const selectedDebtAccount = debtAccount.value;
  const selectedRecvAccount = recvAccount.value;
  const selectedCreditCard = debtCreditCard.value;
  const cashOptions = '<option value="">Pilih Account</option>' + cashAccounts().map(a=>'<option value="' + a.id + '">' + esc(a.name) + '</option>').join('');
  const creditOptions = '<option value="">Pilih Credit Card</option>' + cardsCredit.map(a=>'<option value="' + a.id + '">' + esc(a.name) + ' - available ' + rp(creditAvailable(a)) + '</option>').join('');
  txFrom.innerHTML = cashOptions;
  txTo.innerHTML = cashOptions;
  debtAccount.innerHTML = cashOptions;
  recvAccount.innerHTML = cashOptions;
  debtCreditCard.innerHTML = creditOptions;
  txFrom.value = selectedFrom;
  txTo.value = selectedTo;
  debtAccount.value = selectedDebtAccount;
  recvAccount.value = selectedRecvAccount;
  debtCreditCard.value = selectedCreditCard;

  syncAccountForm();
  syncDebtForm();
  syncTransactionForm();

  debtSelect.innerHTML = '<option value="">Pilih Hutang</option>' + DB.debts.filter(d=>d.remaining > 0).map(d=>'<option value="' + d.id + '">' + esc(d.name) + '</option>').join('');
  recvSelect.innerHTML = '<option value="">Pilih Piutang</option>' + DB.receivables.filter(r=>r.remaining > 0).map(r=>'<option value="' + r.id + '">' + esc(r.name) + ' (' + (r.type === 'subscription_sharing' ? 'Subscription' : 'Regular') + ')</option>').join('');
  recvSubscription.innerHTML = '<option value="">Pilih Subscription</option>' + DB.subscriptions.filter(s=>s.members.length > 0).map(s=>'<option value="' + s.id + '">' + esc(s.name) + '</option>').join('');
  subCategory.innerHTML = '<option value="">Pilih Kategori</option>' + categoriesFor('all').map(c=>'<option value="' + c.id + '">' + esc(c.name) + '</option>').join('');
  subAccount.innerHTML = '<option value="">Pilih Account</option>' + DB.accounts.map(a=>'<option value="' + a.id + '">' + esc(a.name) + ' (' + esc(a.type) + ')</option>').join('');
  subMemberSubscription.innerHTML = '<option value="">Pilih Subscription</option>' + DB.subscriptions.map(s=>'<option value="' + s.id + '">' + esc(s.name) + '</option>').join('');

  accountsList.innerHTML = DB.accounts.length === 0 
    ? '<div class="account-empty"><div class="account-empty-icon">💳</div><p class="account-empty-text">No accounts yet</p><p class="account-empty-hint">Add your first account to start tracking</p></div>'
    : DB.accounts.map(a => {
      const icon = a.type === 'Credit Card' ? '💳' : a.type === 'Bank' ? '🏦' : a.type === 'E-Wallet' ? '📱' : '💰';
      
      if (a.type === 'Credit Card') {
        const used = a.usedLimit || 0;
        const limit = a.creditLimit || 0;
        const available = creditAvailable(a);
        const usagePercent = limit > 0 ? Math.round((used / limit) * 100) : 0;
        const usageColor = usagePercent > 80 ? 'danger' : usagePercent > 50 ? 'warning' : 'success';
        
        return `<div class="account-card" data-account-id="${a.id}">
          <div class="account-header">
            <div class="account-icon">${icon}</div>
            <div style="flex:1">
              <h3 class="account-name">${esc(a.name)}</h3>
              <span class="account-type-badge">Credit Card</span>
            </div>
          </div>
          <div class="credit-card-info">
            <div class="credit-card-row">
              <span class="credit-card-label">Limit</span>
              <span class="credit-card-value">${rp(limit)}</span>
            </div>
            <div class="credit-card-row">
              <span class="credit-card-label">Used</span>
              <span class="credit-card-value">${rp(used)}</span>
            </div>
            <div style="grid-column:1/-1">
              <div class="credit-usage-bar">
                <div class="credit-usage-fill" style="width:${Math.min(usagePercent, 100)}%"></div>
              </div>
              <div class="credit-usage-label">${usagePercent}% utilization</div>
            </div>
            <div class="credit-card-row">
              <span class="credit-card-label">Available</span>
              <span class="credit-card-value">${rp(available)}</span>
            </div>
          </div>
          <div class="account-actions">
            <button class="btn btn-secondary" onclick="editAccount(${a.id})">Edit</button>
            <button class="btn btn-danger" onclick="deleteAccount(${a.id})">Delete</button>
          </div>
        </div>`;
      }
      
      return `<div class="account-card" data-account-id="${a.id}">
        <div class="account-header">
          <div class="account-icon">${icon}</div>
          <div style="flex:1">
            <h3 class="account-name">${esc(a.name)}</h3>
            <span class="account-type-badge">${esc(a.type)}</span>
          </div>
        </div>
        <div class="account-balance-section">
          <span class="account-balance-label">Current Balance</span>
          <div class="account-balance-amount">${rp(a.balance)}</div>
        </div>
        <div class="account-actions">
          <button class="btn btn-secondary" onclick="editAccount(${a.id})">Edit</button>
          <button class="btn btn-danger" onclick="deleteAccount(${a.id})">Delete</button>
        </div>
      </div>`;
    }).join('');

  debtList.innerHTML = DB.debts.length === 0 
    ? '<div class="debts-empty-state"><div class="debts-empty-icon">📭</div><div class="debts-empty-title">No Debts</div><div class="debts-empty-text">Start by adding a debt to track your liabilities.</div></div>'
    : DB.debts.map(d => {
        const paid = Math.max(0, d.total - d.remaining);
        const percentage = d.total > 0 ? (paid / d.total) * 100 : 0;
        const status = d.remaining === 0 ? 'paid' : (d.dueDay && new Date().getDate() > d.dueDay) ? 'overdue' : 'on-time';
        const statusLabel = status === 'paid' ? 'Paid Off' : status === 'overdue' ? 'Overdue' : 'On Track';
        const icon = d.type === 'credit_card' ? '💳' : '📋';
        const tenor = d.tenor ? ` • ${Math.floor(paid / (d.total / d.tenor))}/${d.tenor} paid` : '';
        const dueInfo = d.dueDay ? ` • Due: ${d.dueDay}th` : '';
        
        return `<div class="debt-card">
          <div class="debt-type-icon">${icon}</div>
          <div class="debt-header">
            <h3 class="debt-name">${esc(d.name)}</h3>
            <span class="debt-type-label">${d.type === 'credit_card' ? 'Credit Card' : d.borrower ? 'Borrowed from: ' + esc(d.borrower) : 'Regular Debt'}</span>
          </div>
          <div class="debt-progress">
            <div class="debt-progress-bar">
              <div class="debt-progress-fill" style="width:${percentage}%"></div>
            </div>
            <span class="debt-progress-text">${rp(paid)} of ${rp(d.total)}</span>
          </div>
          <div class="debt-amount-col">
            <div class="debt-amount">${rp(d.remaining)}</div>
            <span class="debt-status ${status}">${statusLabel}</span>
          </div>
          <div class="debt-actions">
            <button class="edit-btn" onclick="editDebt(${d.id})" title="Edit debt">✏️</button>
            <button class="delete-btn" onclick="deleteDebt(${d.id})" title="Delete debt">🗑️</button>
          </div>
          <div class="debt-meta">${d.type === 'credit_card' ? esc(accountName(d.creditCardId)) : 'Personal'}${tenor}${dueInfo}</div>
        </div>`;
      }).join('');

  receivableList.innerHTML = DB.receivables.length === 0 
    ? '<div class="receivables-empty-state"><div class="receivables-empty-icon">📭</div><div class="receivables-empty-title">No Receivables</div><div class="receivables-empty-text">Start by adding a receivable to track money owed to you.</div></div>'
    : DB.receivables.map(r => {
        const collected = Math.max(0, r.total - r.remaining);
        const percentage = r.total > 0 ? (collected / r.total) * 100 : 0;
        const status = r.remaining === 0 ? 'collected' : 'pending';
        const statusLabel = status === 'collected' ? 'Collected' : 'Pending';
        const icon = r.type === 'subscription_sharing' ? '🎥' : '💰';
        const subDetails = r.type === 'subscription_sharing' ? subscriptionById(r.subscriptionId)?.name || '-' : '';
        
        return `<div class="receivable-card">
          <div class="receivable-type-icon">${icon}</div>
          <div class="receivable-header">
            <h3 class="receivable-name">${esc(r.name)}</h3>
            <span class="receivable-type-label">${r.type === 'subscription_sharing' ? 'Subscription Sharing' : 'Regular Receivable'}</span>
          </div>
          <div class="receivable-progress">
            <div class="receivable-progress-bar">
              <div class="receivable-progress-fill" style="width:${percentage}%"></div>
            </div>
            <span class="receivable-progress-text">${rp(collected)} of ${rp(r.total)}</span>
          </div>
          <div class="receivable-amount-col">
            <div class="receivable-amount">${rp(r.remaining)}</div>
            <span class="receivable-status ${status}">${statusLabel}</span>
          </div>
          <div class="receivable-actions">
            <button class="edit-btn" onclick="editReceivable(${r.id})" title="Edit receivable">✏️</button>
            <button class="delete-btn" onclick="deleteReceivable(${r.id})" title="Delete receivable">🗑️</button>
          </div>
          <div class="receivable-meta">${subDetails ? 'From: ' + esc(subDetails) : 'Personal Receivable'}</div>
        </div>`;
      }).join('');

  categoriesList.innerHTML = DB.categories.length === 0
    ? '<div class="categories-empty-state"><div class="categories-empty-icon">📭</div><div class="categories-empty-title">No Categories</div><div class="categories-empty-text">Add a category to organize your transactions.</div></div>'
    : DB.categories.map(c => {
        const typeClass = c.type === 'income' ? 'income' : c.type === 'expense' ? 'expense' : 'all';
        const typeLabel = c.type === 'all' ? 'All Types' : c.type === 'income' ? 'Income' : 'Expense';
        const transactionCount = DB.transactions.filter(t => t.categoryId === c.id || t.category === c.name).length;
        
        return `<div class="category-card">
          <div class="category-info">
            <h3 class="category-name">${esc(c.name)}</h3>
            <span class="category-type ${typeClass}">${typeLabel}</span>
          </div>
          <div class="category-meta" style="font-size:12px;color:var(--muted-fg)">
            ${transactionCount} transaction${transactionCount !== 1 ? 's' : ''}
          </div>
          <div class="category-actions">
            <button class="btn btn-danger" onclick="deleteCategory(${c.id})">Delete</button>
          </div>
        </div>`;
      }).join('');

  subscriptionsList.innerHTML = DB.subscriptions.length === 0 
    ? '<div class="subscriptions-empty-state"><div class="subscriptions-empty-icon">📭</div><div class="subscriptions-empty-title">No Subscriptions</div><div class="subscriptions-empty-text">Start by adding a subscription to track recurring services.</div></div>'
    : DB.subscriptions.map(s => {
        const memberCount = s.members.length;
        const maxMembers = s.maxMembers || 0;
        const remainingSlots = maxMembers ? Math.max(0, maxMembers - memberCount) : 0;
        const totalMemberShares = s.members.reduce((sum,m)=>sum + Number(m.shareAmount || 0),0);
        const totalCost = Number(s.totalCost || 0);
        const costPerPerson = memberCount ? Math.round(totalCost / memberCount) : maxMembers ? Math.round(totalCost / maxMembers) : 0;
        const icon = s.subscriptionCategory === 'sharing' ? '👥' : '🎁';
        const typeLabel = s.subscriptionCategory === 'sharing' ? 'Sharing' : 'Personal';
        const memberInfo = s.subscriptionCategory === 'sharing' ? `${memberCount}${maxMembers ? '/' + maxMembers : ''} members` : '';
        
        return `<div class="subscription-card">
          <div class="subscription-header">
            <div class="subscription-icon">${icon}</div>
            <div class="subscription-title-section">
              <h3 class="subscription-name">${esc(s.name)}</h3>
              <div class="subscription-category">${esc(s.category)}</div>
            </div>
          </div>
          <div class="subscription-badges">
            <span class="subscription-badge status">${esc(s.status)}</span>
            <span class="subscription-badge type">${typeLabel}</span>
          </div>
          <div class="subscription-details">
            <div class="subscription-detail-item">
              <span class="subscription-detail-label">Total Cost</span>
              <span class="subscription-detail-value">${rp(totalCost)}</span>
            </div>
            <div class="subscription-detail-item">
              <span class="subscription-detail-label">Cycle</span>
              <span class="subscription-detail-value">${esc(s.cycle)}</span>
            </div>
            <div class="subscription-detail-item">
              <span class="subscription-detail-label">Next Renewal</span>
              <span class="subscription-detail-value">${esc(s.renewalDate)}</span>
            </div>
            <div class="subscription-detail-item">
              <span class="subscription-detail-label">Account</span>
              <span class="subscription-detail-value">${esc(accountName(s.accountId))}</span>
            </div>
          </div>
          ${s.subscriptionCategory === 'sharing' ? `<div class="subscription-members">
            <div>
              <div class="subscription-members-info">${memberInfo}</div>
              <div class="subscription-members-slots">Cost per person: ${rp(costPerPerson)}</div>
            </div>
            ${remainingSlots > 0 ? `<div class="subscription-members-slots">+${remainingSlots} slot${remainingSlots > 1 ? 's' : ''}</div>` : ''}
          </div>` : ''}
          <div class="subscription-actions">
            <button onclick="editSubscription(${s.id})">Edit</button>
            <button class="delete-btn" onclick="deleteSubscription(${s.id})">Delete</button>
          </div>
        </div>`;
      }).join('');

  const keyword = (searchInput?.value || '').toLowerCase();
  const filtered = DB.transactions
    .filter(t => !keyword || (t.category||'').toLowerCase().includes(keyword) || (t.note||'').toLowerCase().includes(keyword) || accountName(t.accountId || t.fromId || t.creditCardId || '').toLowerCase().includes(keyword))
    .slice().reverse();

  transactionsList.innerHTML = filtered.length === 0
    ? '<div class="transactions-empty-state"><div class="transactions-empty-icon">📭</div><p class="transactions-empty-title">No transactions</p><p class="transactions-empty-text">Start by adding your first income, expense, or transfer</p></div>'
    : filtered.map(t => {
      const icon = t.type === 'income' ? '💰' : t.type === 'expense' ? '💸' : t.type === 'transfer' ? '🔄' : '📝';
      const typeClass = t.type === 'income' ? 'income' : t.type === 'expense' ? 'expense' : 'transfer';
      const meta = transactionMeta(t);
      const category = esc(t.category || 'Uncategorized');
      
      return `<div class="transaction-card">
        <div class="transaction-type-icon ${typeClass}">${icon}</div>
        <div class="transaction-details">
          <div class="transaction-header-line">
            <span class="transaction-date">${esc(t.date)}</span>
            <span class="transaction-type-label">${esc(t.type)}</span>
          </div>
          <div class="transaction-category">${category}</div>
          <div class="transaction-meta-line">
            <span class="transaction-meta-icon">📍</span>
            <span>${meta}</span>
            ${t.note ? `<span class="transaction-meta-icon">📌</span><span>${esc(t.note)}</span>` : ''}
          </div>
        </div>
        <div class="transaction-amount-col">
          <div class="transaction-amount ${typeClass}">${rp(t.amount)}</div>
        </div>
        <div class="transaction-actions">
          <button class="edit-btn" onclick="editTransaction(${t.id})" title="Edit">✏️</button>
          <button class="delete-btn" onclick="deleteTransaction(${t.id})" title="Delete">🗑️</button>
        </div>
      </div>`;
    }).join('');
}

function categoryTypeLabel(type){
  if(type === 'income') return 'Income';
  if(type === 'expense') return 'Expense';
  return 'Semua';
}

function transactionMeta(t){
  if(t.type === 'transfer') return esc(accountName(t.fromId)) + ' -> ' + esc(accountName(t.toId));
  if(t.type === 'debt_payment' && t.creditCardId) return esc(accountName(t.accountId)) + ' -> ' + esc(accountName(t.creditCardId));
  const note = t.note ? ' - ' + esc(t.note) : '';
  return esc(accountName(t.accountId)) + note;
}

function openModal(id){
  const modal = document.getElementById(id);
  if(!modal) return;
  modal.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function closeModal(id){
  const modal = document.getElementById(id);
  if(!modal) return;
  modal.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

function closeAllModals(){
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
  document.body.classList.remove('modal-open');
}

function initModalTriggers(){
  const config = [
    {button:'openAccountModalBtn', modal:'accountModal', reset: resetAccountForm},
    {button:'openTxModalBtn', modal:'transactionModal', reset: resetTransactionForm},
    {button:'openDebtModalBtn', modal:'debtModal', reset: resetDebtForm},
    {button:'openDebtPaymentModalBtn', modal:'debtPaymentModal', reset: resetDebtPaymentForm},
    {button:'openRecvModalBtn', modal:'receivableModal', reset: resetReceivableForm},
    {button:'openRecvPaymentModalBtn', modal:'receivablePaymentModal', reset: resetReceivablePaymentForm},
    {button:'openSubModalBtn', modal:'subscriptionModal', reset: resetSubscriptionForm},
    {button:'openSubMemberModalBtn', modal:'subMemberModal', reset: resetSubMemberForm}
  ];
  config.forEach(item => {
    const button = document.getElementById(item.button);
    button?.addEventListener('click', () => {
      item.reset?.();
      openModal(item.modal);
    });
  });
  document.querySelectorAll('[data-close]').forEach(el => {
    el.addEventListener('click', () => closeModal(el.dataset.close));
  });
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape') closeAllModals();
  });
}

recvType.onchange = syncReceivableType;
recvSubscription.onchange = syncRecvSubscription;
recvSelect.onchange = syncReceivableSelection;
subSubscriptionCategory.onchange = syncSubscriptionCategory;
searchInput?.addEventListener('input', render);
txDate.value = today();
debtDate.value = today();
recvDate.value = today();
syncAccountForm();
syncDebtForm();
syncReceivableType();
initModalTriggers();

// Dashboard expand/collapse listener
const netWorthToggle = document.getElementById('netWorthToggle');
const netWorthBreakdown = document.getElementById('netWorthBreakdown');
if(netWorthToggle){
  netWorthToggle.addEventListener('click', ()=>{
    netWorthBreakdown.classList.toggle('hidden');
    netWorthToggle.setAttribute('aria-expanded', netWorthBreakdown.classList.contains('hidden') ? 'false' : 'true');
  });
}

activatePage('dashboard');
render();

