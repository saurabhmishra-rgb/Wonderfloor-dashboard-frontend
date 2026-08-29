// Settings.jsx
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import LeadDownloadsModal from '../components/LeadDownloadsModal';

// Sirf wahi icons jo IS file mein use ho rahe hain
// (sidebar ke apne icons ab Sidebar.jsx ke andar hain)
const Icon = {
  menu: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,
  leads: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="9" cy="10" r="2" />
    <path d="M15 9h3M15 13h3M6.5 16c.5-1.5 1.7-2.3 2.5-2.3s2 .8 2.5 2.3" />
  </svg>,
  search: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
};

//  Backend URL — apne dashboard backend ke saath match honi chahiye
const NODE_BACKEND_URL = 'https://wonderfloor-dashboard.vercel.app';

export default function Settings() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Leads state
  const [leads, setLeads] = useState([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);
  const [leadsError, setLeadsError] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null); // { phone, name }
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  // Date filter
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  // for pagination 
  const [currentPage, setCurrentPage] = useState(1);
  const LEADS_PER_PAGE = 100;

  // Single lead delete
  const handleDeleteLead = async (leadId, leadName) => {
    if (!window.confirm(`Delete lead "${leadName}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${NODE_BACKEND_URL}/leads/${leadId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setLeads(prev => prev.filter(l => l._id !== leadId));
      } else {
        alert('Failed to delete lead.');
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Could not connect to server.');
    }
  };

  // Delete all leads
  const handleDeleteAll = async () => {
    if (!window.confirm(`Delete ALL ${leads.length} leads? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${NODE_BACKEND_URL}/leads`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setLeads([]);
      } else {
        alert('Failed to delete leads.');
      }
    } catch (err) {
      console.error('Delete all failed:', err);
      alert('Could not connect to server.');
    }
  };
  // Fetch leads jab page load ho
  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await fetch(`${NODE_BACKEND_URL}/leads`);
        const data = await res.json();
        if (data.success) {
          setLeads(data.leads);
        } else {
          setLeadsError('Failed to load leads.');
        }
      } catch (err) {
        console.error('Failed to fetch leads:', err);
        setLeadsError('Could not connect to server.');
      } finally {
        setIsLoadingLeads(false);
      }
    }
    fetchLeads();
  }, []);

  // Filtered leads based on search term + date range
  const filteredLeads = leads.filter(lead => {
    const term = searchTerm.toLowerCase().trim();

    const matchesSearch = !term || (
      lead.name?.toLowerCase().includes(term) ||
      lead.phone?.toLowerCase().includes(term) ||
      lead.email?.toLowerCase().includes(term) ||
      lead.message?.toLowerCase().includes(term) ||
      lead.productName?.toLowerCase().includes(term) ||
      lead.downloadCount?.toString().includes(term)
    );
    const leadDate = new Date(lead.lastSeenAt || lead.createdAt);
    const matchesFrom = !dateFrom || leadDate >= new Date(dateFrom);
    const matchesTo = !dateTo || leadDate <= new Date(dateTo + 'T23:59:59');

    return matchesSearch && matchesFrom && matchesTo;
  });

  // Paginattion calculation 
  const totalPages = Math.ceil(filteredLeads.length / LEADS_PER_PAGE);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * LEADS_PER_PAGE,
    currentPage * LEADS_PER_PAGE
  );
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFrom, dateTo]);
  // Download CSV
  const downloadCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'Message', 'Product', 'Downloads', 'Last Seen'];
    const rows = filteredLeads.map(lead => [
      lead.name,
      lead.phone,
      lead.email || '',
      (lead.message || '').replace(/,/g, ';'),
      lead.productName || '',
      lead.downloadCount || 1,
      new Date(lead.lastSeenAt || lead.createdAt).toLocaleString('en-IN'),
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `leads_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen w-full font-sans bg-[#f4f4f5] text-[#111111] overflow-hidden">

      {/* ── MOBILE OVERLAY ── */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── SHARED SIDEBAR ── */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">

        {/* Top bar */}
        <header className="border-b border-[#e8e8e8] shrink-0 bg-white">
          {/* Title row */}
          <div className="h-[58px] flex items-center justify-between px-4 md:px-7 gap-3">
            <div className="flex items-center gap-3 shrink-0">
              <button
                className="md:hidden text-[#111111] p-1 -ml-1 rounded-md hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                {Icon.menu}
              </button>
              <h1 className="text-base font-medium text-[#111111] m-0">Leads</h1>
            </div>

            {/* Filter bar — DESKTOP ONLY, same row as title */}
            {!isLoadingLeads && !leadsError && leads.length > 0 && (
              <div className="hidden md:flex items-center gap-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-9 px-2 rounded-lg border border-[#e0e0e0] text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#0b9e7a]/30"
                />
                <span className="text-xs text-[#aaaaaa]">to</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9 px-2 rounded-lg border border-[#e0e0e0] text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#0b9e7a]/30"
                />
                <div className="relative w-[220px]">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaaaaa]">{Icon.search}</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search leads..."
                    className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#e0e0e0] text-sm text-[#111111] placeholder-[#aaaaaa] focus:outline-none focus:ring-2 focus:ring-[#0b9e7a]/30"
                  />
                </div>
                <button
                  onClick={downloadCSV}
                  className="h-9 px-3 rounded-lg bg-[#0b9e7a] text-white text-xs font-semibold hover:bg-[#098c6c] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Download CSV
                </button>
                <button
                  onClick={handleDeleteAll}
                  className="h-9 px-3 rounded-lg bg-white border border-red-300 text-red-500 text-xs font-semibold hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Delete All
                </button>
              </div>
            )}
          </div>

          {/* Filter bar — MOBILE ONLY, apni alag row, wrap hoti hui */}
          {!isLoadingLeads && !leadsError && leads.length > 0 && (
            <div className="md:hidden flex flex-wrap items-center gap-2 px-4 py-3 border-t border-[#e8e8e8]">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 px-2 rounded-lg border border-[#e0e0e0] text-xs text-[#111111] flex-1 min-w-[110px] focus:outline-none focus:ring-2 focus:ring-[#0b9e7a]/30"
              />
              <span className="text-xs text-[#aaaaaa]">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 px-2 rounded-lg border border-[#e0e0e0] text-xs text-[#111111] flex-1 min-w-[110px] focus:outline-none focus:ring-2 focus:ring-[#0b9e7a]/30"
              />
              <div className="relative w-full order-3">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaaaaa]">{Icon.search}</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search leads..."
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#e0e0e0] text-sm text-[#111111] placeholder-[#aaaaaa] focus:outline-none focus:ring-2 focus:ring-[#0b9e7a]/30"
                />
              </div>
              <button
                onClick={downloadCSV}
                className="h-9 px-3 rounded-lg bg-[#0b9e7a] text-white text-xs font-semibold hover:bg-[#098c6c] transition-colors cursor-pointer whitespace-nowrap ml-auto"
              >
                Download CSV
              </button>
            </div>
          )}
        </header>

        {/* Leads Table / Empty / Loading / No-results states */}
        <div className="flex-1 overflow-auto p-4 md:p-6 md:px-7">

          {isLoadingLeads ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-[#aaaaaa]">Loading leads…</p>
            </div>
          ) : leadsError ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-red-500">{leadsError}</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-sm py-16 px-6 border-2 border-dashed border-[#e0e0e0] rounded-2xl bg-white shadow-sm">
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4 text-[#aaaaaa]">
                  {Icon.leads}
                </div>
                <p className="text-sm font-semibold text-[#333333]">No leads yet</p>
                <p className="text-xs text-[#aaaaaa] mt-1 leading-relaxed">
                  Leads will appear here once someone<br />downloads a design from the AR visualizer.
                </p>
              </div>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-[#aaaaaa]">No leads match "{searchTerm}"</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#e8e8e8] overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[700px]">
                <thead className="bg-[#f9fafb] text-[#888888] text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Message</th>
                    <th className="px-4 py-3">Recent Download</th>
                    <th className="px-4 py-3">Total Downloads</th>
                    <th className="px-4 py-3">Last Seen</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLeads.map(lead => (
                    <tr key={lead._id} className="border-t border-[#f0f0f0] hover:bg-[#fafafa]">
                      <td
                        className="px-4 py-3 font-medium text-[#111111] cursor-pointer hover:text-[#0b9e7a] hover:underline"
                        onClick={() => setSelectedLead({ phone: lead.phone, name: lead.name })}
                      >
                        {lead.name}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`tel:${lead.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#111111] hover:text-[#0b9e7a] hover:underline"
                        >
                          {lead.phone}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-[#0b9e7a]">
                        {lead.email ? (
                          <a href={`mailto:${lead.email}`} onClick={(e) => e.stopPropagation()} className="hover:underline">
                            {lead.email}
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td
                        className="px-4 py-3 hover:underline text-[#666666] max-w-[220px] truncate"
                        title={lead.message || ''}
                      >
                        {lead.message || '—'}
                      </td>
                      <td className="px-4 py-3">{lead.productName || '—'}</td>
                      <td className="px-4 py-3">{lead.downloadCount || 1}</td>
                      <td className="px-4 py-3">
                        <div>
                          {new Date(lead.lastSeenAt || lead.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-[#aaaaaa]">
                          {new Date(lead.lastSeenAt || lead.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit', minute: '2-digit', hour12: true
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteLead(lead._id, lead.name)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                          title="Delete lead"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-[#e8e8e8] bg-[#f9fafb]">
                  <span className="text-xs text-[#888888]">
                    Showing {(currentPage - 1) * LEADS_PER_PAGE + 1}–{Math.min(currentPage * LEADS_PER_PAGE, filteredLeads.length)} of {filteredLeads.length}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg border border-[#e0e0e0] text-xs font-medium text-[#555] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
                    >
                      Previous
                    </button>

                    {/* Numbered page buttons with ellipsis */}
                    {(() => {
                      const pages = [];
                      const delta = 1; // current page ke kitne aage-peeche numbers dikhane hain

                      for (let i = 1; i <= totalPages; i++) {
                        if (
                          i === 1 ||
                          i === totalPages ||
                          (i >= currentPage - delta && i <= currentPage + delta)
                        ) {
                          pages.push(i);
                        } else if (pages[pages.length - 1] !== '...') {
                          pages.push('...');
                        }
                      }

                      return pages.map((page, idx) =>
                        page === '...' ? (
                          <span key={`ellipsis-${idx}`} className="px-2 text-xs text-[#aaaaaa]">…</span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${page === currentPage
                              ? 'bg-[#0b9e7a] text-white'
                              : 'border border-[#e0e0e0] text-[#555] hover:bg-white'
                              }`}
                          >
                            {page}
                          </button>
                        )
                      );
                    })()}

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-lg border border-[#e0e0e0] text-xs font-medium text-[#555] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {selectedLead && (
        <LeadDownloadsModal
          phone={selectedLead.phone}
          name={selectedLead.name}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}
