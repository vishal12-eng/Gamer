import React, { useState } from 'react';
import { useAds, Ad, AdPlacement } from '../context/AdsContext';

const PLACEMENT_OPTIONS: { value: AdPlacement; label: string }[] = [
  { value: 'home_top', label: 'Home - Top (After Hero)' },
  { value: 'home_middle', label: 'Home - Middle (Between Sections)' },
  { value: 'home_after_card_3', label: 'Home - After Card 3' },
  { value: 'article_top', label: 'Article - Top' },
  { value: 'article_middle', label: 'Article - Middle' },
  { value: 'article_bottom', label: 'Article - Bottom' },
  { value: 'footer', label: 'Footer - All Pages' },
];

const AdminAdsPage: React.FC = () => {
  const { ads, addAd, updateAd, deleteAd, toggleAdStatus } = useAds();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    smartlinkUrl: '',
    imageUrl: '',
    placement: 'home_top' as AdPlacement,
    status: 'active' as 'active' | 'inactive',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      title: '',
      smartlinkUrl: '',
      imageUrl: '',
      placement: 'home_top',
      status: 'active',
    });
    setEditingAd(null);
    setIsFormOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.smartlinkUrl.trim()) {
      alert('Please fill in Title and SmartLink URL');
      return;
    }

    if (editingAd) {
      updateAd(editingAd.id, formData);
    } else {
      addAd(formData);
    }
    resetForm();
  };

  const handleEdit = (ad: Ad) => {
    setFormData({
      title: ad.title,
      smartlinkUrl: ad.smartlinkUrl,
      imageUrl: ad.imageUrl || '',
      placement: ad.placement,
      status: ad.status,
    });
    setEditingAd(ad);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteAd(id);
    setDeleteConfirm(null);
  };

  const getPlacementLabel = (placement: AdPlacement): string => {
    return PLACEMENT_OPTIONS.find(p => p.value === placement)?.label || placement;
  };

  const sortedAds = [...ads].sort((a, b) => {
    const timeA = typeof a.updatedAt === 'string' ? new Date(a.updatedAt).getTime() : a.updatedAt;
    const timeB = typeof b.updatedAt === 'string' ? new Date(b.updatedAt).getTime() : b.updatedAt;
    return timeB - timeA;
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Ads Manager</h1>
          <p className="text-gray-400 mt-1">Manage your SmartLink ads across all placements</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-purple-500 transition-all shadow-lg hover:shadow-cyan-500/25"
        >
          + Add New Ad
        </button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingAd ? 'Edit Ad' : 'Add New Ad'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Holiday Sale Banner"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  SmartLink URL *
                </label>
                <input
                  type="url"
                  value={formData.smartlinkUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, smartlinkUrl: e.target.value }))}
                  placeholder="https://www.example.com/smartlink..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://example.com/banner.jpg"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to use default styled banner</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Placement *
                </label>
                <select
                  value={formData.placement}
                  onChange={(e) => setFormData(prev => ({ ...prev, placement: e.target.value as AdPlacement }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                >
                  {PLACEMENT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === 'active'}
                      onChange={() => setFormData(prev => ({ ...prev, status: 'active' }))}
                      className="w-4 h-4 text-cyan-500 bg-gray-800 border-gray-600 focus:ring-cyan-500"
                    />
                    <span className="text-green-400">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={formData.status === 'inactive'}
                      onChange={() => setFormData(prev => ({ ...prev, status: 'inactive' }))}
                      className="w-4 h-4 text-cyan-500 bg-gray-800 border-gray-600 focus:ring-cyan-500"
                    />
                    <span className="text-gray-400">Inactive</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-purple-500 transition-all"
                >
                  {editingAd ? 'Update Ad' : 'Create Ad'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Delete Ad?</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this ad? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-6 py-3 bg-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 border border-cyan-700/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-cyan-400">{ads.length}</div>
          <div className="text-gray-400 text-sm">Total Ads</div>
        </div>
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-700/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-green-400">
            {ads.filter(a => a.status === 'active').length}
          </div>
          <div className="text-gray-400 text-sm">Active</div>
        </div>
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 border border-gray-600/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-gray-400">
            {ads.filter(a => a.status === 'inactive').length}
          </div>
          <div className="text-gray-400 text-sm">Inactive</div>
        </div>
      </div>

      {sortedAds.length === 0 ? (
        <div className="text-center py-16 bg-gray-800/30 border border-gray-700/50 rounded-2xl">
          <div className="text-6xl mb-4">📢</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Ads Yet</h3>
          <p className="text-gray-400 mb-6">Create your first ad to start monetizing your content</p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-purple-500 transition-all"
          >
            + Add Your First Ad
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedAds.map(ad => (
            <div
              key={ad.id}
              className={`bg-gray-800/50 border rounded-xl p-4 transition-all hover:border-cyan-500/50 ${
                ad.status === 'active' ? 'border-gray-700' : 'border-gray-700/50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white truncate">{ad.title}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      ad.status === 'active' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                    }`}>
                      {ad.status}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="text-gray-500">URL:</span>
                      <a 
                        href={ad.smartlinkUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline truncate max-w-md"
                      >
                        {ad.smartlinkUrl}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="text-gray-500">Placement:</span>
                      <span className="text-purple-400">{getPlacementLabel(ad.placement)}</span>
                    </div>
                    {ad.imageUrl && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <span className="text-gray-500">Image:</span>
                        <span className="text-gray-300 truncate max-w-md">{ad.imageUrl}</span>
                      </div>
                    )}
                  </div>
                </div>

                {ad.imageUrl && (
                  <div className="hidden sm:block flex-shrink-0">
                    <img 
                      src={ad.imageUrl} 
                      alt={ad.title}
                      className="w-24 h-16 object-cover rounded-lg border border-gray-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleAdStatus(ad.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      ad.status === 'active'
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/30'
                    }`}
                    title={ad.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    {ad.status === 'active' ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(ad)}
                    className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(ad.id)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-3">Placement Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {PLACEMENT_OPTIONS.map(option => (
            <div key={option.value} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
              <span className="text-gray-300">{option.label}</span>
              <span className="text-cyan-400 font-mono text-xs">{option.value}</span>
            </div>
          ))}
        </div>
        <p className="text-gray-500 text-xs mt-3">
          * Multiple ads in the same placement will rotate every 10 seconds
        </p>
      </div>
    </div>
  );
};

export default AdminAdsPage;
