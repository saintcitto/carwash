import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Car, Sparkles, Save, Phone, Smartphone, CheckCircle, Clock, Calendar, History, Filter, Printer, Receipt, Hash, Wallet } from 'lucide-react';

const EMPLOYEES = [
  { name: 'Aci Evi', rateFull: 5000, rateBody: 4000 },
  { name: 'Bang Tomy', rateFull: 5000, rateBody: 4000 },
  { name: 'Usuf', rateFull: 3750, rateBody: 2500 },
  { name: 'Rio', rateFull: 3500, rateBody: 2500 },
  { name: 'Paijo', rateFull: 3500, rateBody: 2500 },
];

const App = () => {
  // --- HELPERS ---
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // --- STATE ---
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

  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [dailyExpense, setDailyExpense] = useState(0); // State untuk Pengeluaran Manual
  
  // Update form data (menghapus washer)
  const [formData, setFormData] = useState({ 
    plat: '', 
    telepon: '', 
    mobil: '', 
    warna: '', 
    tipe: 'Full', 
    status: 'pending',
  });
  
  const [receiptData, setReceiptData] = useState(null);
  const [printDailySummary, setPrintDailySummary] = useState(false);

  const HARGA_FULL = 50000;
  const HARGA_BODY = 35000;

  // --- EFFECTS ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('soniaCarWashData', JSON.stringify(laporan));
      } catch (error) {
        console.error(error);
      }
    }
  }, [laporan]);

  // --- HANDLERS ---
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
    // Reset form
    setFormData({ ...formData, plat: '', telepon: '', mobil: '', warna: '', tipe: 'Full', status: 'pending' });
    
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

  // --- LOGIC PRINTING ---
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

  // --- CALCULATIONS ---
  const filteredLaporan = showAllHistory 
    ? laporan 
    : laporan.filter(item => item.date === selectedDate);

  const totalUnit = filteredLaporan.length;
  const countFullTotal = filteredLaporan.filter(l => l.tipe === 'Full').length;
  const countBodyTotal = filteredLaporan.filter(l => l.tipe === 'Body').length;

  const totalMasuk = filteredLaporan.filter(l => l.status === 'paid').reduce((acc, curr) => acc + curr.harga, 0);
  const totalPending = filteredLaporan.filter(l => l.status === 'pending').reduce((acc, curr) => acc + curr.harga, 0);
  const totalOmzet = totalMasuk + totalPending;

  // Cek Hari Minggu (0 = Minggu)
  // const isWeekend = new Date(selectedDate).getDay() === 0 || new Date(selectedDate).getDay() === 6; // Sabtu & Minggu
  const isWeekend = new Date(selectedDate).getDay() === 0; // Hanya Minggu sesuai request user "Khusus minggu"

  // Hitung Gaji per Karyawan
  let totalGajiKaryawan = 0;
  let employeeSalaries = [];

  if (isWeekend) {
      // Logika Weekend: Omzet dibagi 2 (50% Owner, 50% Anggota)
      // Bagian Anggota dibagi rata ke 5 orang
      const memberShareTotal = totalOmzet / 2;
      const salaryPerPerson = memberShareTotal / 5;
      
      employeeSalaries = EMPLOYEES.map(emp => ({
          name: emp.name,
          salary: salaryPerPerson
      }));
      totalGajiKaryawan = memberShareTotal;
  } else {
      // Logika Hari Biasa: Berdasarkan Tarif per Mobil (Semua mobil dihitung ke semua karyawan karena sistem tim/bagi rata tugas biasanya, atau asumsi user "berdasarkan jumlah mobil" apply ke tarif masing-masing)
      // Request user: "Hitung total gaji masing-masing berdasarkan jumlah mobil."
      // Asumsi: Setiap mobil dikerjakan bersama, jadi setiap mobil generate tarif untuk setiap orang.
      
      employeeSalaries = EMPLOYEES.map(emp => {
          const salary = (countFullTotal * emp.rateFull) + (countBodyTotal * emp.rateBody);
          return { name: emp.name, salary };
      });
      totalGajiKaryawan = employeeSalaries.reduce((acc, curr) => acc.salary + curr.salary, 0);
  }
  
  // Sisa Bersih Owner
  // Weekend: Owner dapat 50% bersih (user request: "owner menerima bagiannya secara bersih") -> tapi ada pengeluaran manual.
  // Biasanya pengeluaran diambil dari total omzet dulu atau dari bagian owner?
  // Mengikuti pola umum: Net Profit = (Bagian Owner) - Pengeluaran
  const ownerGrossShare = isWeekend ? (totalOmzet / 2) : (totalOmzet - totalGajiKaryawan);
  const netProfit = ownerGrossShare - dailyExpense;

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8 flex flex-col items-center overflow-x-hidden">
      
      {/* CSS STYLES */}
      <style>{`
        @keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { 0% { transform: scale(0.9); opacity: 0; } 50% { transform: scale(1.05); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes highlightRow { 0% { background-color: #d9f99d; transform: scale(1.02); } 100% { background-color: transparent; transform: scale(1); } }
        .animate-enter { animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-pop { animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .new-row { animation: highlightRow 1s ease-out; }
        
        @media print {
          /* SETUP KERTAS THERMAL 80MM */
          @page { 
            size: 80mm auto; 
            margin: 0mm; 
          }
          
          body { 
            background: white !important; 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
            color: #000 !important; 
            margin: 0 !important;
            padding: 0 !important;
            width: 80mm;
            min-width: 80mm;
          }

          * { color: #000 !important; border-color: #000 !important; visibility: visible !important; }
          .no-print, header, .input-section, .filter-section, button { display: none !important; }
          
          /* LAYOUT STRUK (Digunakan untuk Transaksi & Laporan Harian) */
          .receipt-container { 
            display: block !important; 
            width: 100%; 
            max-width: 72mm !important; /* Margin aman */
            margin: 0 auto !important;
            padding: 5px 0 !important;
            font-family: 'Courier New', monospace; 
            color: #000 !important;
            font-weight: 600;
            line-height: 1.2;
            font-size: 12px;
          }
          .dashed-line { border-top: 1px dashed black; margin: 6px 0; width: 100%; height: 1px; }
          .receipt-container p, .receipt-container div { margin: 0; padding: 0; }
          
          /* Sembunyikan elemen A4 jika ada sisa */
          .report-container, .print-header-report, .print-summary { display: none !important; }
        }
        
        .receipt-container { display: none; }
      `}</style>

      {/* --- STRUK 1: TRANSAKSI PER MOBIL (80mm) --- */}
      {receiptData && !printDailySummary && (
        <div className="receipt-container">
          <div className="text-center mb-2">
            <p className="text-[16px] font-black uppercase mb-1">SONIA CAFE</p>
            <p className="text-[10px]">Car Wash & Auto Detailing</p>
            <p className="text-[9px] mt-1">Jl. Medan - Tebing Tinggi No. 38</p>
            <p className="text-[9px]">Kota Galuh, Perbaungan</p>
            <p className="text-[10px] font-bold mt-1">WA: 0853-6296-2929</p>
          </div>
          <div className="dashed-line"></div>
          <div className="flex justify-between text-[10px]">
            <span>{new Date().toLocaleDateString('id-ID')}</span>
            <span>{new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          <div className="dashed-line"></div>
          <div className="text-center py-1">
            <p className="text-[20px] font-black tracking-tight mb-1">{receiptData.plat}</p>
            <p className="text-[11px] uppercase font-bold">{receiptData.mobil} / {receiptData.warna}</p>
          </div>
          <div className="dashed-line"></div>
          <div className="flex justify-between text-[11px] font-bold mb-1"><span>LAYANAN</span><span>HARGA</span></div>
          <div className="flex justify-between text-[11px] uppercase">
            <span>CUCI {receiptData.tipe}</span>
            <span>{receiptData.harga.toLocaleString()}</span>
          </div>
          <div className="dashed-line"></div>
          <div className="flex justify-between text-[14px] font-black mt-1"><span>TOTAL</span><span>Rp {receiptData.harga.toLocaleString()}</span></div>
          <div className="mt-3 text-center">
            <span className="border border-black px-3 py-1 text-[12px] font-bold uppercase rounded-sm inline-block">
              {receiptData.status === 'paid' ? 'LUNAS / PAID' : 'BELUM BAYAR'}
            </span>
          </div>
          <div className="mt-4 text-center text-[10px]"><p>Terima Kasih!</p></div>
          <div className="h-6"></div>
          <div className="text-center text-[8px]">.</div>
        </div>
      )}

      {/* --- STRUK 2: LAPORAN HARIAN (80mm) --- */}
      {printDailySummary && (
        <div className="receipt-container">
          <div className="text-center mb-2">
            <p className="text-[16px] font-black uppercase mb-1">LAPORAN HARIAN</p>
            <p className="text-[12px] font-bold">SONIA CAFE</p>
            <p className="text-[10px] mt-1">{showAllHistory ? "SEMUA RIWAYAT" : formatDateDisplay(selectedDate)}</p>
          </div>

          <div className="dashed-line"></div>

          <div className="flex justify-between text-[12px] font-bold py-1">
            <span>TOTAL UNIT:</span>
            <span>{totalUnit} Mobil</span>
          </div>
          {/* Detail Jumlah Tipe Mobil (Opsional, bagus untuk cek silang gaji) */}
          {!isWeekend && (
             <div className="flex justify-between text-[10px] pb-1">
                <span>(Full: {countFullTotal} | Body: {countBodyTotal})</span>
             </div>
          )}

          <div className="dashed-line"></div>

          <div className="text-[12px] font-bold mb-2">RINGKASAN KEUANGAN:</div>
          
          <div className="flex justify-between text-[11px] mb-1">
            <span>Total Omzet:</span>
            <span>Rp {totalOmzet.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[11px] mb-1">
            <span>Belum Bayar:</span>
            <span>Rp {totalPending.toLocaleString()}</span>
          </div>
          
          <div className="dashed-line"></div>
          
          <div className="flex justify-between text-[13px] font-black mt-1">
            <span>UANG MASUK:</span>
            <span>Rp {totalMasuk.toLocaleString()}</span>
          </div>

          <div className="dashed-line"></div>

          {/* BAGIAN GAJI KARYAWAN */}
          <div className="text-[11px] font-bold mb-1 mt-2 text-center uppercase border-b border-black pb-1">
            {isWeekend ? 'BAGI HASIL (MINGGU)' : 'RINCIAN GAJI HARIAN'}
          </div>
          
          {employeeSalaries.map((emp, idx) => (
            <div key={idx} className="flex justify-between text-[10px] mb-1">
              <span>{emp.name}</span>
              <span>Rp {emp.salary.toLocaleString()}</span>
            </div>
          ))}
          
          <div className="flex justify-between text-[11px] font-bold border-t border-dashed border-black pt-1 mt-1">
            <span>TOTAL GAJI:</span>
            <span>Rp {totalGajiKaryawan.toLocaleString()}</span>
          </div>

          <div className="dashed-line"></div>

          {/* BAGIAN OWNER & PENGELUARAN */}
          <div className="text-[11px] font-bold mb-1 mt-2 text-center uppercase border-b border-black pb-1">
            PEMBAGIAN OWNER
          </div>

          <div className="flex justify-between text-[10px] mb-1">
            <span>Gross Owner:</span>
            <span>Rp {ownerGrossShare.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[10px] mb-1">
            <span>(-) Pengeluaran:</span>
            <span>Rp {dailyExpense.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between text-[13px] font-black mt-2 border-2 border-black p-1">
            <span>BERSIH OWNER:</span>
            <span>Rp {netProfit.toLocaleString()}</span>
          </div>
          
          <div className="mt-4 text-center text-[10px]">
            <p>Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
            <p className="mt-1">-- Akhir Laporan --</p>
          </div>
          
          <div className="h-6"></div>
          <div className="text-center text-[8px]">.</div>
        </div>
      )}

      {/* --- DASHBOARD WEB --- */}
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
          <div className="flex flex-wrap gap-4 w-full md:w-auto pb-2 md:pb-0">
            <div className="flex-1 min-w-[140px] bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 animate-pop opacity-0" style={{animationDelay: '0.1s'}}>
              <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><Hash size={24} /></div>
              <div><p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Unit</p><p className="text-2xl font-mono font-bold text-slate-800">{totalUnit}</p></div>
            </div>
            <div className="flex-1 min-w-[160px] bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 animate-pop opacity-0" style={{animationDelay: '0.2s'}}>
              <div className="bg-lime-100 p-3 rounded-xl text-lime-600"><CheckCircle size={24} /></div>
              <div><p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Masuk</p><p className="text-2xl font-mono font-bold text-slate-800">{totalMasuk.toLocaleString()}k</p></div>
            </div>
            <div className="flex-1 min-w-[140px] flex items-center justify-center">
               <button onClick={handlePrintDailyReport} className="bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-2xl shadow-lg flex flex-col items-center gap-2 transition-all active:scale-95 w-full h-full justify-center" title="Print Laporan Harian">
                 <Printer size={24} />
                 <span className="text-xs font-bold uppercase tracking-widest">Print Laporan</span>
               </button>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 input-section no-print">
        {/* FORM INPUT */}
        <div className="lg:col-span-4 space-y-6 animate-enter animate-enter-delay-1 opacity-0">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl sticky top-8">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 bg-lime-400 rounded-full flex items-center justify-center text-white shadow-lg shadow-lime-200 animate-pulse"><Plus size={24} strokeWidth={3} /></div>
              <h2 className="text-xl font-bold text-slate-800">Input Data Baru</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                <p className="text-xs text-blue-600 font-medium flex items-center gap-2">
                  <Calendar size={14} /> 
                  Data masuk ke: <span className="font-bold">{new Date().toLocaleDateString('id-ID')}</span>
                </p>
              </div>

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

        {/* TABEL LAPORAN */}
        <div className="lg:col-span-8 animate-enter animate-enter-delay-2 opacity-0 report-container">
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm min-h-[600px] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 filter-section">
               <div>
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><History className="text-slate-400" size={24} /> Laporan</h2>
                  <p className="text-slate-500 text-xs mt-1">{showAllHistory ? 'Semua Riwayat' : `Tanggal: ${new Date(selectedDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}`}</p>
               </div>
               
               {/* INPUT PENGELUARAN MANUAL */}
               <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
                  <div className="pl-3 text-slate-400"><Wallet size={16} /></div>
                  <input 
                    type="number" 
                    value={dailyExpense} 
                    onChange={(e) => setDailyExpense(Number(e.target.value))}
                    placeholder="Pengeluaran (Rp)..." 
                    className="w-32 text-sm py-1.5 focus:outline-none"
                  />
               </div>

               <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm w-auto">
                  <button onClick={() => setShowAllHistory(false)} className={`px-4 py-2 rounded-lg text-xs font-bold ${!showAllHistory ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>HARI INI</button>
                  <button onClick={() => setShowAllHistory(true)} className={`px-4 py-2 rounded-lg text-xs font-bold ${showAllHistory ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>SEMUA</button>
               </div>
            </div>
            
            {!showAllHistory && (
              <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-3 filter-section">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pilih Tanggal:</span>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-1.5 focus:outline-none" />
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
                        <span className="hidden print:block text-xs font-bold text-center">{item.status === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}</span>
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
