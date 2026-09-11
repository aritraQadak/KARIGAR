import { artisanPortrait } from '../../data/demoImages';
import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  User as UserIcon,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit3,
  Camera,
  Briefcase,
  Layers,
  Award,
  Users,
  ShieldCheck,
  Check,
  X,
  Clock,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSeller } from '../../context/SellerContext';
import { formatDate, getInitials } from '../../utils/formatters';

export default function Profile() {
  const { t, i18n } = useTranslation();
  const { user, updateUserProfile, uploadAvatar } = useAuth();
  const { addToast } = useSeller();

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state initialized from current authenticated user
  const [editForm, setEditForm] = useState({
    fullName: user?.fullName || '',
    mobile: user?.mobile || '',
    state: user?.state || '',
    district: user?.district || '',
    businessName: user?.businessName || '',
    craftType: user?.craftType || '',
    yearsOfExperience: user?.yearsOfExperience ?? '',
    giTagNumber: user?.giTagNumber || '',
    clusterName: user?.clusterName || ''
  });

  const openEditModal = () => {
    setEditForm({
      fullName: user?.fullName || '',
      mobile: user?.mobile || '',
      state: user?.state || '',
      district: user?.district || '',
      businessName: user?.businessName || '',
      craftType: user?.craftType || '',
      yearsOfExperience: user?.yearsOfExperience ?? '',
      giTagNumber: user?.giTagNumber || '',
      clusterName: user?.clusterName || ''
    });
    setIsEditModalOpen(true);
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input value so same file can be re-selected if needed
    e.target.value = '';

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      addToast(t('profile.uploadFormatError', 'Please select a valid image file (JPEG, PNG, or WEBP).'), 'error');
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_SIZE) {
      addToast(t('profile.uploadSizeError', 'Image size must be less than 5 MB.'), 'error');
      return;
    }

    try {
      setIsUploading(true);
      await uploadAvatar(file);
      addToast(t('profile.uploadSuccess', 'Profile picture updated successfully.'), 'success');
    } catch (err) {
      console.error('Avatar upload error:', err);
      addToast(err.message || t('profile.uploadError', 'Failed to upload profile picture.'), 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editForm.fullName.trim()) {
      addToast(t('profile.nameRequired', 'Full Name is required.'), 'error');
      return;
    }

    try {
      setIsSaving(true);
      await updateUserProfile({
        fullName: editForm.fullName.trim(),
        mobile: editForm.mobile ? editForm.mobile.trim() : null,
        state: editForm.state ? editForm.state.trim() : null,
        district: editForm.district ? editForm.district.trim() : null,
        businessName: editForm.businessName ? editForm.businessName.trim() : null,
        craftType: editForm.craftType ? editForm.craftType.trim() : null,
        yearsOfExperience: editForm.yearsOfExperience !== '' ? parseInt(editForm.yearsOfExperience, 10) || 0 : null,
        giTagNumber: editForm.giTagNumber ? editForm.giTagNumber.trim() : null,
        clusterName: editForm.clusterName ? editForm.clusterName.trim() : null
      });

      setIsEditModalOpen(false);
      addToast(t('profile.saveProfileSuccess', 'Profile updated successfully.'), 'success');
    } catch (err) {
      console.error('Profile update error:', err);
      addToast(err.message || t('profile.saveProfileError', 'Failed to save profile changes.'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const notProvided = t('profile.notProvided', 'Not provided');
  const userInitials = getInitials(user?.fullName);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900 dark:text-white">
            {t('profile.pageTitle', 'My Profile')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {t('profile.pageSubtitle', 'Manage your verified artisan credentials, trade presence, and listings.')}
          </p>
        </div>

        <button
          type="button"
          onClick={openEditModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-seller-accent hover:bg-[#0f3f22] text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Edit3 className="w-4 h-4" />
          <span>{t('profile.editProfile', 'Edit Profile')}</span>
        </button>
      </div>

      {/* TOP ARTISAN CARD */}
      <div className="bg-seller-card  rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-gray-700/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Profile Picture with Change Photo option */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative flex-shrink-0">
              {artisanPortrait(user) ? (
                <img
                  src={artisanPortrait(user)}
                  alt={user.fullName || 'Artisan'}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-emerald-50 dark:ring-emerald-950/60 shadow-md"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-seller-accent text-white font-bold text-3xl flex items-center justify-center ring-4 ring-emerald-50 dark:ring-emerald-950/60 shadow-md select-none">
                  {userInitials}
                </div>
              )}

              {user?.isVerified && (
                <span
                  className="absolute -bottom-1 -right-1 p-1 bg-seller-accent rounded-full text-white ring-2 ring-white dark:ring-[#1F2937] shadow-xs"
                  title={t('common.verified', 'Verified')}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              )}
            </div>

            {/* Hidden File Picker Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoSelect}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />

            {/* Change Photo Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-seller-muted dark:bg-[#2A374A] hover:bg-gray-200 dark:hover:bg-[#34445B] text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <Camera className="w-3.5 h-3.5 text-seller-accent-ink" />
              <span>{isUploading ? t('common.loading', 'Loading...') : t('profile.changePhoto', 'Change Photo')}</span>
            </button>
          </div>

          {/* Core Info */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {user?.fullName || notProvided}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{t('profile.roleArtisan', 'Artisan / Weaver')}</span>
              </span>
            </div>

            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              {user?.businessName || user?.craftType || t('profile.roleArtisan', 'Artisan / Weaver')}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-gray-600 dark:text-gray-300">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span>{user?.email || notProvided}</span>
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span>{user?.mobile ? `+91 ${user.mobile}` : notProvided}</span>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>{[user?.district, user?.state].filter(Boolean).join(', ') || notProvided}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED ARTISAN CREDENTIALS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Craft Details */}
        <div className="bg-seller-card  p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>{t('profile.craftDetails', 'Craft & Experience')}</span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-gray-500 dark:text-gray-400 block">{t('profile.craftType', 'Craft Type')}</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {user?.craftType || notProvided}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 block">{t('profile.yearsOfExperience', 'Years of Experience')}</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {user?.yearsOfExperience !== null && user?.yearsOfExperience !== undefined
                  ? `${user.yearsOfExperience} ${t('profile.years', 'years')}`
                  : notProvided}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 block">{t('profile.businessName', 'Business / Studio Name')}</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {user?.businessName || notProvided}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Provenance & GI Details */}
        <div className="bg-seller-card  p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>{t('profile.giAndCluster', 'GI Tag & Cluster')}</span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-gray-500 dark:text-gray-400 block">{t('profile.giTagNumber', 'GI Tag Number')}</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {user?.giTagNumber || notProvided}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 block">{t('profile.cluster', 'Cluster / Cooperative')}</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {user?.clusterName || notProvided}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 block">{t('profile.state', 'State')} / {t('profile.district', 'District')}</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {[user?.district, user?.state].filter(Boolean).join(', ') || notProvided}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Account Verification & Status */}
        <div className="bg-seller-card  p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>{t('profile.accountStatusHeader', 'Account & Verification')}</span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-gray-500 dark:text-gray-400 block">{t('profile.verificationStatus', 'Verification Status')}</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 text-sm">
                <CheckCircle className="w-3.5 h-3.5" />
                {user?.isVerified ? t('common.verified', 'Verified') : t('common.unverified', 'Not Verified')}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 block">{t('profile.accountStatus', 'Account Status')}</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {user?.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 block">{t('profile.memberSince', 'Member Since')}</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {user?.createdAt ? formatDate(user.createdAt, i18n.language) : notProvided}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-seller-card  rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {t('profile.editProfile', 'Edit Profile')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {t('profile.editModalSub', 'Update your personal details and craft credentials.')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-seller-muted dark:hover:bg-[#2A374A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {t('profile.fullName', 'Full Name')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-seller-card  text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {t('profile.mobile', 'Mobile Number')}
                  </label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={editForm.mobile}
                    onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-seller-card  text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {t('profile.businessName', 'Business / Studio Name')}
                  </label>
                  <input
                    type="text"
                    value={editForm.businessName}
                    onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-seller-card  text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {t('profile.craftType', 'Craft Type')}
                  </label>
                  <input
                    type="text"
                    value={editForm.craftType}
                    onChange={(e) => setEditForm({ ...editForm, craftType: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-seller-card  text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {t('profile.yearsOfExperience', 'Years of Experience')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.yearsOfExperience}
                    onChange={(e) => setEditForm({ ...editForm, yearsOfExperience: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-seller-card  text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {t('profile.giTagNumber', 'GI Tag Number')}
                  </label>
                  <input
                    type="text"
                    value={editForm.giTagNumber}
                    onChange={(e) => setEditForm({ ...editForm, giTagNumber: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-seller-card  text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {t('profile.cluster', 'Cluster / Cooperative')}
                  </label>
                  <input
                    type="text"
                    value={editForm.clusterName}
                    onChange={(e) => setEditForm({ ...editForm, clusterName: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-seller-card  text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {t('profile.district', 'District')}
                  </label>
                  <input
                    type="text"
                    value={editForm.district}
                    onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-seller-card  text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {t('profile.state', 'State')}
                  </label>
                  <input
                    type="text"
                    value={editForm.state}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-seller-card  text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-seller-muted dark:hover:bg-[#2A374A] rounded-xl transition-colors cursor-pointer"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-seller-accent hover:bg-[#0f3f22] rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? t('common.loading', 'Loading...') : t('common.save', 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
