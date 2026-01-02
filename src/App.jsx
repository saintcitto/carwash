import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Car, Sparkles, Save, Phone, Smartphone, CheckCircle, Clock, Calendar, History, Filter, Printer, Receipt, Hash, Wallet, X } from 'lucide-react';

const SERVICE_RATES = {
  'Aci Evi':   { Full: 5000, Body: 5000 },
  'Bang Tomy': { Full: 5000, Body: 4000 },
  'Usuf':      { Full: 3750, Body: 2500 },
  'Rio':       { Full: 2500, Body: 2500 },
  'Paijo':     { Full: 2500, Body: 2500 },
};

const EMPLOYEES_LIST = Object.keys(SERVICE_RATES);

const App = () => {
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [laporan, setLaporan] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedData = localStorage.getItem('soniaCarWashData');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (error) {
        console.error(error);
      }
    }
    return [];
  });

  const [expenses, setExpenses] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedData = localStorage.getItem('soniaCarWashExpenses');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (error) {
        console.error(error);
      }
    }
    return [];
  });

  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [showAllHistory, setShowAllHistory] = useState(false);
  
  const [formData, setFormData] = useState({ 
    plat: '', 
    telepon: '', 
    mobil: '', 
    warna: '', 
    tipe: 'Full', 
    status: 'pending'
  });
  
  const [receiptData, setReceiptData] = useState(null);
  const [printDailySummary, setPrintDailySummary] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ name: '', amount: '', note: '' });

  const HARGA_FULL = 50000;
  const HARGA_BODY = 35000;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('soniaCarWashData', JSON.stringify(laporan));
      } catch (error) {
        console.error(error);
      }
    }
  }, [laporan]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('soniaCarWashExpenses', JSON.stringify(expenses));
      } catch (error) {
        console.error(error);
      }
    }
  }, [expenses]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'telepon' && !/^\d*$/.test(value)) return;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.plat || !formData.mobil) return;

    const harga = formData.tipe === 'Full' ? HARGA_FULL : HARGA_BODY;
    const newItem = {
      id: Date.now(),
      date: getTodayString(),
      plat: formData.plat.toUpperCase(),
      telepon: formData.telepon,
      mobil: formData.mobil,
      warna: formData.warna,
      harga: harga,
      tipe: formData.tipe,
      status: formData.status,
      isNew: true
    };

    setLaporan([newItem, ...laporan]);
    setFormData({ plat: '', telepon: '', mobil: '', warna: '', tipe: 'Full', status: 'pending' });
    
    setTimeout(() => setLaporan(prev => prev.map(item => item.id === newItem.id ? { ...item, isNew: false } : item)), 1000);
  };

  const handleDelete = (id) => {
    if (window.confirm('Yakin hapus data ini?')) {
      setLaporan(laporan.filter(item => item.id !== id));
    }
  };

  const toggleStatus = (id) => {
    setLaporan(laporan.map(item => item.id === id ? { ...item, status: item.status === 'paid' ? 'pending' : 'paid' } : item));
  };

  const handlePrintReceipt = (item) => {
    setReceiptData(item);
    setPrintDailySummary(false);
    setTimeout(() => {
        window.print();
        setTimeout(() => setReceiptData(null), 500); 
    }, 200);
  };

  const handlePrintDailyReport = () => {
    setReceiptData(null);
    setPrintDailySummary(true);
    setTimeout(() => {
        window.print();
        setTimeout(() => setPrintDailySummary(false), 500); 
    }, 200);
  };

  const handleExpenseChange = (e) => {
    const { name, value } = e.target;
    if (name === 'amount') {
        const numValue = value.replace(/[^0-9]/g, '');
        setExpenseForm({ ...expenseForm, amount: numValue });
    } else {
        setExpenseForm({ ...expenseForm, [name]: value });
    }
  };

  const handleSaveExpense = () => {
    if (!expenseForm.name || !expenseForm.amount) return;
    
    const newExpense = {
        id: Date.now(),
        date: selectedDate, // Simpan sesuai tanggal yang dipilih/hari ini
        name: expenseForm.name,
        amount: Number(expenseForm.amount),
        note: expenseForm.note
    };
    
    setExpenses([...expenses, newExpense]);
    setExpenseForm({ name: '', amount: '', note: '' });
    // setShowExpenseModal(false); // Jangan tutup modal, biar user bisa lihat list
  };

  const handleDeleteExpense = (id) => {
    if (window.confirm('Hapus pengeluaran ini?')) {
      setExpenses(expenses.filter(item => item.id !== id));
    }
  };

  const filteredLaporan = showAllHistory 
    ? laporan 
    : laporan.filter(item => item.date === selectedDate);

  const filteredExpenses = showAllHistory
    ? expenses
    : expenses.filter(item => item.date === selectedDate);
    
  // Filter expenses khusus untuk tampilan di modal (selalu per hari ini/tanggal terpilih)
  const modalExpenses = expenses.filter(item => item.date === selectedDate);

  const totalUnit = filteredLaporan.length || 0;
  
  const countFull = filteredLaporan.filter(l => l.tipe === 'Full').length || 0;
  const countBody = filteredLaporan.filter(l => l.tipe === 'Body').length || 0;

  const totalMasuk = filteredLaporan
    .filter(l => l.status === 'paid')
    .reduce((acc, curr) => acc + (Number(curr.harga) || 0), 0);
    
  const totalPending = filteredLaporan
    .filter(l => l.status === 'pending')
    .reduce((acc, curr) => acc + (Number(curr.harga) || 0), 0);
  
  const totalOmzet = (totalMasuk + totalPending) || 0;
  const totalExpense = filteredExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const memberShares = EMPLOYEES_LIST.map(name => {
    const rates = SERVICE_RATES[name];
    const shareFromFull = countFull * rates.Full;
    const shareFromBody = countBody * rates.Body;
    const totalShare = shareFromFull + shareFromBody;
    
    return { name, amount: totalShare };
  });

  const totalPembagianAnggota = memberShares.reduce((acc, curr) => acc + curr.amount, 0);
  const pendapatanOwnerGross = (totalOmzet - totalPembagianAnggota) || 0;
  const pendapatanOwnerNet = (pendapatanOwnerGross - totalExpense) || 0;

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8 flex flex-col items-center overflow-x-hidden">
      
      <style>{`
        @keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { 0% { transform: scale(0.9); opacity: 0; } 50% { transform: scale(1.05); } 100% { transform: scale(1); opacity: 1; } }
        .animate-enter { animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-pop { animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        
        @media print {
          @page { size: 80mm auto; margin: 0mm; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; width: 80mm; min-width: 80mm; color: #000 !important; }
          .no-print, header, .input-section, .filter-section, button { display: none !important; }
          * { visibility: visible !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          
          .receipt-container { 
            display: block !important; 
            width: 100%; 
            max-width: 72mm !important;
            margin: 0 auto !important;
            padding: 5px 0 20px 0 !important;
            font-family: 'Courier New', monospace; 
            font-weight: 600;
            line-height: 1.3;
            font-size: 11px;
            color: #000 !important;
          }
          
          .receipt-table { width: 100%; border-collapse: collapse; margin-top: 5px; }
          .receipt-table th { text-align: left; border-bottom: 1px dashed black; padding: 2px 0; }
          .receipt-table td { text-align: left; padding: 2px 0; vertical-align: top; }
          .text-right { text-align: right !important; }
          .text-center { text-align: center !important; }
          
          .dashed-line { border-top: 1px dashed black; margin: 5px 0; width: 100%; height: 1px; }
          .bold { font-weight: 800; }
          .text-lg { font-size: 14px; }
          .text-xl { font-size: 16px; }
        }
        .receipt-container { display: none; }

        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 50;
        }
        .modal-content {
            background: white;
            padding: 24px;
            border-radius: 16px;
            width: 90%;
            max-width: 400px;
            max-height: 90vh; /* Agar bisa scroll jika list panjang */
            overflow-y: auto;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      {showExpenseModal && (
        <div className="modal-overlay no-print">
            <div className="modal-content animate-pop">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-lg font-bold text-slate-800">Pengeluaran</h3>
                    <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                </div>
                
                {/* Form Input */}
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nama Barang / Keperluan</label>
                        <input 
                            type="text" 
                            name="name"
                            value={expenseForm.name}
                            onChange={handleExpenseChange}
                            placeholder="Contoh: Sabun, Listrik..."
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2 focus:outline-none focus:border-slate-400"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Harga Barang (Rp)</label>
                        <input 
                            type="text" 
                            name="amount"
                            value={expenseForm.amount}
                            onChange={handleExpenseChange}
                            placeholder="0"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2 focus:outline-none focus:border-slate-400"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Catatan Pengeluaran</label>
                        <input 
                            type="text" 
                            name="note"
                            value={expenseForm.note}
                            onChange={handleExpenseChange}
                            placeholder="Keterangan tambahan (opsional)"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2 focus:outline-none focus:border-slate-400"
                        />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button onClick={handleSaveExpense} className="w-full py-2 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800">Simpan</button>
                    </div>
                </div>

                {/* List Pengeluaran Hari Ini */}
                <div className="border-t pt-4">
                    <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase">Daftar Pengeluaran ({formatDateDisplay(selectedDate)})</h4>
                    {modalExpenses.length === 0 ? (
                        <p className="text-center text-slate-400 text-xs italic py-4">Belum ada pengeluaran tercatat.</p>
                    ) : (
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {modalExpenses.map((item) => (
                                <div key={item.id} className="flex justify-between items-start bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{item.name}</p>
                                        <p className="text-xs text-slate-500">Rp {item.amount.toLocaleString()}</p>
                                        {item.note && <p className="text-[10px] text-slate-400 italic">"{item.note}"</p>}
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteExpense(item.id)} 
                                        className="text-red-400 hover:text-red-600 p-1"
                                        title="Hapus Pengeluaran"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {receiptData && !printDailySummary && (
        <div className="receipt-container">
          <div className="text-center mb-2">
            <div className="text-xl bold">SONIA CAFE</div>
            <div>Car Wash & Auto Detailing</div>
            <div style={{fontSize: '9px'}}>Jl. Medan - Tebing Tinggi No. 38</div>
            <div style={{fontSize: '9px'}}>Kota Galuh, Perbaungan</div>
            <div style={{fontSize: '10px'}} className="bold mt-1">WA: 0853-6296-2929</div>
          </div>
          
          <div className="dashed-line"></div>
          
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '10px'}}>
            <span>{new Date().toLocaleDateString('id-ID')}</span>
            <span>{new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          
          <div className="dashed-line"></div>

          <div className="text-center py-1">
            <div className="text-xl bold">{receiptData.plat}</div>
            <div className="bold">{receiptData.mobil}</div>
            <div style={{fontSize: '10px'}}>{receiptData.warna}</div>
          </div>

          <div className="dashed-line"></div>

          <div style={{display: 'flex', justifyContent: 'space-between'}} className="bold">
            <span>LAYANAN</span>
            <span>HARGA</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span>CUCI {receiptData.tipe}</span>
            <span>{receiptData.harga.toLocaleString()}</span>
          </div>

          <div className="dashed-line"></div>

          <div style={{display: 'flex', justifyContent: 'space-between'}} className="text-lg bold">
            <span>TOTAL</span>
            <span>Rp {receiptData.harga.toLocaleString()}</span>
          </div>
          
          <div className="mt-2 text-center">
            <span style={{border: '1px solid black', padding: '2px 8px'}} className="bold">
              {receiptData.status === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}
            </span>
          </div>

          <div className="mt-4 text-center" style={{fontSize: '10px'}}>
            <p>Terima Kasih!</p>
          </div>
        </div>
      )}

      {printDailySummary && (
        <div className="receipt-container">
          <div className="text-center mb-2">
            <div className="text-xl bold">LAPORAN HARIAN</div>
            <div className="bold">SONIA CAFE</div>
            <div style={{fontSize: '10px'}}>{showAllHistory ? "SEMUA RIWAYAT" : formatDateDisplay(selectedDate)}</div>
          </div>

          <div className="dashed-line"></div>

          <div style={{display: 'flex', justifyContent: 'space-between'}} className="bold">
            <span>TOTAL UNIT:</span>
            <span>{totalUnit} Mobil</span>
          </div>

          <div className="dashed-line"></div>

          <div className="text-lg bold" style={{textAlign: 'center', marginBottom: '4px'}}>TOTAL OMSET</div>
          <div className="text-xl bold" style={{textAlign: 'center'}}>Rp {totalOmzet.toLocaleString()}</div>
          
          <div className="dashed-line"></div>

          <div className="text-center bold" style={{marginBottom: '4px'}}>
            -- PEMBAGIAN ANGGOTA --
          </div>
          
          <table className="receipt-table">
            <tbody>
              {memberShares.map((emp, idx) => (
                <tr key={idx}>
                  <td>{emp.name}</td>
                  <td className="text-right">Rp {emp.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{borderTop: '1px solid black', marginTop: '5px', paddingTop: '2px', display: 'flex', justifyContent: 'space-between'}} className="bold">
            <span>TOTAL PEMBAGIAN:</span>
            <span>Rp {totalPembagianAnggota.toLocaleString()}</span>
          </div>

          {filteredExpenses.length > 0 && (
            <>
              <div className="dashed-line"></div>
              <div className="text-center bold" style={{marginBottom: '4px'}}>-- PENGELUARAN --</div>
              {filteredExpenses.map((exp, idx) => (
                <div key={idx} style={{marginBottom: '2px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '10px'}}>
                    <span>{exp.name}</span>
                    <span>Rp {exp.amount.toLocaleString()}</span>
                  </div>
                  {exp.note && <div style={{fontSize: '9px', fontStyle: 'italic', color: '#333'}}>- {exp.note}</div>}
                </div>
              ))}
              <div style={{borderTop: '1px solid black', marginTop: '2px', paddingTop: '2px', display: 'flex', justifyContent: 'space-between', fontSize: '10px'}} className="bold">
                <span>TOTAL KELUAR:</span>
                <span>Rp {totalExpense.toLocaleString()}</span>
              </div>
            </>
          )}

          <div className="dashed-line"></div>

          <div className="text-center bold" style={{marginTop: '5px', marginBottom: '4px'}}>
            -- PENDAPATAN OWNER --
          </div>
          
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '10px'}}>
            <span>Total Omzet:</span>
            <span>Rp {totalOmzet.toLocaleString()}</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '10px'}}>
            <span>(-) Pembagian:</span>
            <span>Rp {totalPembagianAnggota.toLocaleString()}</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '10px'}}>
            <span>(-) Pengeluaran:</span>
            <span>Rp {totalExpense.toLocaleString()}</span>
          </div>
          
          <div style={{borderTop: '2px solid black', marginTop: '5px', paddingTop: '5px', display: 'flex', justifyContent: 'space-between'}} className="text-lg bold">
            <span>SISA BERSIH:</span>
            <span>Rp {pendapatanOwnerNet.toLocaleString()}</span>
          </div>

          <div className="mt-4 text-center" style={{fontSize: '9px'}}>
            <p>Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
          </div>
          
          <div className="h-6"></div>
          <div className="text-center text-[8px]">.</div>
        </div>
      )}

      <header className="w-full max-w-7xl mb-10 border-b border-slate-200 pb-8 animate-enter opacity-0 no-print">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 group cursor-default">
              SONIA<span className="text-lime-500 inline-block group-hover:animate-bounce">.</span>CAFE
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-bold tracking-widest uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse"></span>
              Car Wash Management System
            </p>
          </div>
          <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <div className="flex-1 md:flex-none min-w-[180px] bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 animate-pop opacity-0" style={{animationDelay: '0.2s'}}>
              <div className="bg-lime-100 p-3 rounded-xl text-lime-600"><CheckCircle size={24} /></div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{showAllHistory ? 'Total Masuk' : 'Masuk Hari Ini'}</p>
                <p className="text-2xl font-mono font-bold text-slate-800">{totalMasuk.toLocaleString()}k</p>
              </div>
            </div>
            <div className="flex-1 md:flex-none min-w-[180px] bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 animate-pop opacity-0" style={{animationDelay: '0.3s'}}>
              <div className="bg-red-100 p-3 rounded-xl text-red-500"><Clock size={24} /></div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{showAllHistory ? 'Total Pending' : 'Pending Hari Ini'}</p>
                <p className="text-2xl font-mono font-bold text-slate-800">{totalPending.toLocaleString()}k</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 input-section">
        <div className="lg:col-span-4 space-y-6 animate-enter animate-enter-delay-1 opacity-0 no-print">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl sticky top-8">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 bg-lime-400 rounded-full flex items-center justify-center text-white shadow-lg shadow-lime-200 animate-pulse"><Plus size={24} strokeWidth={3} /></div>
              <h2 className="text-xl font-bold text-slate-800">Input Data Baru</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="group">
                  <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block uppercase tracking-wider">Nomor Plat</label>
                  <input type="text" name="plat" value={formData.plat} onChange={handleChange} placeholder="B 1234 XYZ" className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:border-lime-500 font-bold uppercase font-mono" autoComplete="off" />
              </div>
              <div className="group">
                <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block uppercase tracking-wider">No. WhatsApp</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input type="tel" name="telepon" value={formData.telepon} onChange={handleChange} placeholder="0812..." className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-lime-500 font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="group">
                  <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block uppercase tracking-wider">Mobil</label>
                  <input type="text" name="mobil" value={formData.mobil} onChange={handleChange} placeholder="Jazz" className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500" />
                </div>
                <div className="group">
                  <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block uppercase tracking-wider">Warna</label>
                  <input type="text" name="warna" value={formData.warna} onChange={handleChange} placeholder="Merah" className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block uppercase tracking-wider">Layanan & Status</label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button type="button" onClick={() => setFormData({...formData, tipe: 'Full'})} className={`p-3 rounded-lg border text-sm font-bold flex flex-col items-center gap-1 ${formData.tipe === 'Full' ? 'bg-lime-50 border-lime-500 text-lime-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}><Sparkles size={16} /> Full</button>
                  <button type="button" onClick={() => setFormData({...formData, tipe: 'Body'})} className={`p-3 rounded-lg border text-sm font-bold flex flex-col items-center gap-1 ${formData.tipe === 'Body' ? 'bg-cyan-50 border-cyan-500 text-cyan-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}><Car size={16} /> Body</button>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button type="button" onClick={() => setFormData({...formData, status: 'pending'})} className={`flex-1 py-2 text-xs font-bold rounded-md ${formData.status === 'pending' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-400'}`}>Belum Bayar</button>
                  <button type="button" onClick={() => setFormData({...formData, status: 'paid'})} className={`flex-1 py-2 text-xs font-bold rounded-md ${formData.status === 'paid' ? 'bg-white text-lime-600 shadow-sm' : 'text-slate-400'}`}>Lunas</button>
                </div>
              </div>
              <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-xl mt-2 shadow-lg hover:shadow-xl uppercase tracking-widest flex items-center justify-center gap-2 group"><Save className="w-5 h-5 group-hover:rotate-12 transition-transform" /> Simpan Data</button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-8 animate-enter animate-enter-delay-2 opacity-0 report-container">
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm min-h-[600px] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 filter-section">
               <div>
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><History className="text-slate-400" size={24} /> Laporan</h2>
                  <p className="text-slate-500 text-xs mt-1">{showAllHistory ? 'Semua Riwayat' : `Tanggal: ${new Date(selectedDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}`}</p>
               </div>
               
               <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-xl shadow-sm cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setShowExpenseModal(true)}>
                  <div className="pl-3 text-slate-400"><Wallet size={16} /></div>
                  <div className="text-sm text-slate-500 px-2 py-1.5 font-medium">Catat Pengeluaran</div>
               </div>

               <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm w-auto">
                  <button onClick={() => setShowAllHistory(false)} className={`px-4 py-2 rounded-lg text-xs font-bold ${!showAllHistory ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>HARI INI</button>
                  <button onClick={() => setShowAllHistory(true)} className={`px-4 py-2 rounded-lg text-xs font-bold ${showAllHistory ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>SEMUA</button>
                  <button onClick={handlePrintDailyReport} className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 border-l border-slate-100 ml-1 pl-3 flex items-center gap-2" title="Print Laporan Harian (Thermal 80mm)"><Printer size={16} /> LAPORAN</button>
               </div>
            </div>
            {!showAllHistory && (
              <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-3 filter-section">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pilih Tanggal:</span>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-lime-500 transition-colors font-mono" />
              </div>
            )}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse print-table">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] md:text-xs uppercase tracking-widest border-b border-slate-100">
                    <th className="p-4 pl-6 w-12 text-center">No</th>
                    <th className="p-4">Info Kendaraan</th>
                    {showAllHistory && <th className="p-4">Tanggal</th>}
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Harga</th>
                    <th className="p-4 text-center w-24">Layanan</th>
                    <th className="p-4 text-center w-24 no-print">Act</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLaporan.map((item, index) => (
                    <tr key={item.id} className={`hover:bg-slate-50 transition-all duration-300 group ${item.isNew ? 'new-row' : ''}`}>
                      <td className="p-4 pl-6 text-slate-400 font-mono text-sm text-center">{index + 1}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800 font-mono text-lg">{item.plat}</div>
                        <div className="text-slate-500 text-xs flex flex-wrap items-center gap-2 mt-1">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium border border-slate-200">{item.mobil}</span>
                          <span className="text-slate-500">{item.warna}</span>
                        </div>
                      </td>
                      {showAllHistory && <td className="p-4 text-xs font-mono text-slate-500">{formatDateDisplay(item.date)}</td>}
                      <td className="p-4 text-center">
                        <button onClick={() => toggleStatus(item.id)} className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1 mx-auto shadow-sm no-print ${item.status === 'paid' ? 'bg-lime-100 text-lime-700 border-lime-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                          {item.status === 'paid' ? 'LUNAS' : 'PENDING'}
                        </button>
                        <span className="print-only hidden text-xs font-bold text-center">{item.status === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}</span>
                      </td>
                      <td className="p-4 text-right"><div className="font-mono text-slate-700 font-bold">{item.harga.toLocaleString()}</div></td>
                      <td className="p-4 text-center">
                          {item.tipe === 'Full' ? <span className="text-[10px] font-extrabold text-lime-700 bg-lime-100 border border-lime-200 px-2 py-1 rounded-md inline-block">FULL</span> : <span className="text-[10px] font-extrabold text-cyan-700 bg-cyan-100 border border-cyan-200 px-2 py-1 rounded-md inline-block">BODY</span>}
                      </td>
                      <td className="p-4 text-center no-print flex items-center justify-center gap-2">
                        <button onClick={() => handlePrintReceipt(item)} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg" title="Print Struk"><Receipt size={18} /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Hapus"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-center text-xs text-slate-400 font-mono no-print">Data tersimpan otomatis di browser (Anti-Hilang).</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
