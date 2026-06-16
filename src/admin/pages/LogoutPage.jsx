import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LogoutPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleConfirmLogout = () => {
    setLoading(true);
    
    // Slight delay for a smooth UI transition
    setTimeout(() => {
      localStorage.removeItem('wonderfloor_admin_token');
      navigate('/admin/login', { replace: true });
    }, 500);
  };

  const handleCancel = () => {
    navigate(-1); // Goes back to the previous page they were on
  };

  return (
    <div className="min-h-screen bg-[#f4f4f5] flex items-center justify-center p-4 font-sans text-[#111111]">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-[#e8e8e8] p-8 text-center">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Ready to leave?</h2>
          <p className="text-[14px] text-[#aaaaaa] mt-2">
            Are you sure you want to log out of the Admin Portal?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-8">
          <button
            onClick={handleConfirmLogout}
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center"
          >
            {loading ? 'Logging out...' : 'Yes, Log Out'}
          </button>
          
          <button
            onClick={handleCancel}
            disabled={loading}
            className="w-full bg-[#f4f4f5] hover:bg-[#ebebeb] text-[#555555] font-medium py-2.5 rounded-lg transition-colors border border-[#e0e0e0]"
          >
            Cancel, stay logged in
          </button>
        </div>

      </div>
    </div>
  );
}