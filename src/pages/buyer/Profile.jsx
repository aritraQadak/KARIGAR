import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User as UserIcon,
  BadgeCheck,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit3,
  Camera,
  ShieldCheck,
  Check,
  X,
  Package,
  Award,
  Bookmark,
  Wallet,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatDate, getInitials, toLocaleDigits } from '../../utils/formatters';
import { translatePersonName, translateState, translateDistrict } from '../../utils/localizedDisplay';

export default function PatronProfile() {
  const { t, i18n } = useTranslation();
  const { user, updateUserProfile, uploadAvatar } = useAuth();

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Edit form state
  const [editForm, setEditForm] = useState({
    fullName: user?.fullName || '',
    mobile: user?.mobile || '',
    state: user?.state || '',
    district: user?.district || ''
  });

  const openEditModal = () => {
    setEditForm({
      fullName: user?.fullName || '',
      mobile: user?.mobile || '',
      state: user?.state || '',
      district: user?.district || ''
    });
    setIsEditModalOpen(true);
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showNotification(t('profile.uploadFormatError', 'Please select a valid image file (JPEG, PNG, or WEBP).'), 'error');
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_SIZE) {
      showNotification(t('profile.uploadSizeError', 'Image size must be less than 5 MB.'), 'error');
      return;
    }

    try {
      setIsUploading(true);
      await uploadAvatar(file);
      showNotification(t('profile.uploadSuccess', 'Profile picture updated successfully.'), 'success');
    } catch (err) {
      console.error('Avatar upload error:', err);
      showNotification(err.message || t('profile.uploadError', 'Failed to upload profile picture.'), 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editForm.fullName.trim()) {
      showNotification(t('profile.nameRequired', 'Full Name is required.'), 'error');
      return;
    }

    try {
      setIsSaving(true);
      await updateUserProfile({
        fullName: editForm.fullName.trim(),
        mobile: editForm.mobile ? editForm.mobile.trim() : null,
        state: editForm.state ? editForm.state.trim() : null,
        district: editForm.district ? editForm.district.trim() : null
      });

      setIsEditModalOpen(false);
      showNotification(t('profile.saveProfileSuccess', 'Profile updated successfully.'), 'success');
    } catch (err) {
      console.error('Profile update error:', err);
      showNotification(err.message || t('profile.saveProfileError', 'Failed to save profile changes.'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const notProvided = t('profile.notProvided', 'Not provided');
  const userInitials = getInitials(user?.fullName);

  return (
    <div className="flex flex-col w-full bg-surface text-on-surface min-h-[calc(100vh-5rem)]">
      {/* Toast alert banner if active */}
      {toastMessage && (
        <div className={`fixed top-24 right-6 z-50 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150 ${
          toastMessage.type === 'error' ? 'bg-red-600 text-white' : 'bg-secondary text-on-secondary'
        }`}>
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-[1440px] mx-auto px-space-md sm:px-space-xl py-space-xl w-full space-y-space-xl">
        {/* Page Title & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
          <div>
            <div className="flex items-center gap-1.5 font-label-sm text-xs uppercase tracking-wider text-[#14532D] dark:text-emerald-400 font-bold mb-1">
              <BadgeCheck className="w-4 h-4" />
              <span>{t('buyer.user.verifiedPatron', 'Verified Patron')}</span>
            </div>
            <h1 className="font-garamond text-3xl sm:text-4xl text-stone-900 dark:text-stone-100 font-bold">
              {t('profile.pageTitle', 'My Profile')}
            </h1>
            <p className="font-body-sm text-xs text-stone-600 dark:text-stone-400 mt-0.5">
              {t('buyer.user.profileSubtitle', 'Manage your patron account, personal details, and provenance records.')}
            </p>
          </div>

          <button
            type="button"
            onClick={openEditModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#14532D] hover:bg-[#0E3D20] text-white font-label-sm text-xs uppercase tracking-wider font-semibold rounded-xl shadow-xs hover:shadow-md transition-all self-start sm:self-auto cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>{t('profile.editProfile', 'Edit Profile')}</span>
          </button>
        </div>

        {/* PROFILE HEADER CARD */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 shadow-xs border border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 text-center sm:text-left transition-all">
          {/* Circular Profile Image with upload */}
          <div className="flex flex-col items-center gap-2.5">
            <div className="relative flex-shrink-0">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName || 'Patron'}
                  className="w-28 h-28 rounded-full object-cover ring-4 ring-[#14532D]/20 shadow-md"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#14532D] to-[#0E3D20] text-white font-bold text-3xl flex items-center justify-center ring-4 ring-[#14532D]/20 shadow-md select-none">
                  {userInitials}
                </div>
              )}

              <span
                className="absolute bottom-1 right-1 p-1.5 bg-[#14532D] text-white rounded-full ring-2 ring-white dark:ring-stone-900 shadow-xs"
                title={t('common.verified', 'Verified')}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoSelect}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-label-sm text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 border border-stone-300 dark:border-stone-700"
            >
              <Camera className="w-3.5 h-3.5 text-[#14532D] dark:text-emerald-400" />
              <span>{isUploading ? t('common.loading', 'Loading...') : t('profile.changePhoto', 'Change Photo')}</span>
            </button>
          </div>

          {/* User Details */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="font-garamond text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 font-bold">
                {user?.fullName ? translatePersonName(user.fullName, i18n.language) : notProvided}
              </h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-[#14532D] dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 uppercase tracking-wider">
                <BadgeCheck className="w-3.5 h-3.5" />
                <span>{t('profile.rolePatron', 'Patron / Collector')}</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 pt-1 font-body-sm text-xs text-stone-600 dark:text-stone-400">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-stone-400" />
                <span>{user?.email || notProvided}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-stone-400" />
                <span>{user?.mobile ? toLocaleDigits(`+91 ${user.mobile}`, i18n.language) : notProvided}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-stone-400" />
                <span>
                  {[
                    user?.district ? translateDistrict(user.district, i18n.language) : null,
                    user?.state ? translateState(user.state, i18n.language) : null
                  ].filter(Boolean).join(', ') || notProvided}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-stone-400" />
                <span>
                  {t('profile.memberSince', 'Member Since')}: {user?.createdAt ? formatDate(user.createdAt, i18n.language) : notProvided}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* PATRON ACCOUNT DETAILS & SHORTCUTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Shortcut 1: Orders & Consignments */}
          <Link
            to="/buyer/orders"
            className="group bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all border border-stone-200/80 dark:border-stone-800 flex flex-col justify-between gap-4 hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-[#14532D] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                <Package className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#14532D] dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h3 className="font-garamond text-lg text-stone-900 dark:text-stone-100 font-bold">
                {t('buyer.user.myCollection', 'My Collection & Orders')}
              </h3>
              <p className="font-body-sm text-xs text-stone-500 dark:text-stone-400 mt-1">
                {t('buyer.user.myCollectionSub', 'Track active consignments & escrow')}
              </p>
            </div>
          </Link>

          {/* Shortcut 2: GI Certificates */}
          <Link
            to="/buyer/certificates"
            className="group bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all border border-stone-200/80 dark:border-stone-800 flex flex-col justify-between gap-4 hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-[#14532D] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                <Award className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#14532D] dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h3 className="font-garamond text-lg text-stone-900 dark:text-stone-100 font-bold">
                {t('buyer.user.giCertificates', 'GI Certificates & Dossiers')}
              </h3>
              <p className="font-body-sm text-xs text-stone-500 dark:text-stone-400 mt-1">
                {t('buyer.user.giCertificatesSub', 'Verified blockchain origin records')}
              </p>
            </div>
          </Link>

          {/* Shortcut 3: Saved Crafts */}
          <Link
            to="/buyer/saved"
            className="group bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all border border-stone-200/80 dark:border-stone-800 flex flex-col justify-between gap-4 hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-[#14532D] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                <Bookmark className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#14532D] dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h3 className="font-garamond text-lg text-stone-900 dark:text-stone-100 font-bold">
                {t('buyer.user.savedCrafts', 'Saved Crafts & Artisans')}
              </h3>
              <p className="font-body-sm text-xs text-stone-500 dark:text-stone-400 mt-1">
                {t('buyer.user.savedCraftsSub', 'Bookmarked masterworks')}
              </p>
            </div>
          </Link>

          {/* Shortcut 4: Escrow Wallet */}
          <Link
            to="/buyer/wallet"
            className="group bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all border border-stone-200/80 dark:border-stone-800 flex flex-col justify-between gap-4 hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-[#14532D] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                <Wallet className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#14532D] dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h3 className="font-garamond text-lg text-stone-900 dark:text-stone-100 font-bold">
                {t('buyer.user.escrowWallet', 'Sovereign Escrow & Wallet')}
              </h3>
              <p className="font-body-sm text-xs text-stone-500 dark:text-stone-400 mt-1">
                {t('buyer.user.escrowWalletSub', 'Protected escrow balance')}
              </p>
            </div>
          </Link>
        </div>

        {/* ACCOUNT STATUS & VERIFICATION INFO */}
        <div className="bg-[#FCFAF6] dark:bg-stone-850 rounded-2xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="font-label-sm text-[11px] uppercase tracking-wider text-[#14532D] dark:text-emerald-400 font-bold">
              {t('profile.accountStatusHeader', 'Account & Verification')}
            </span>
            <h4 className="font-garamond text-2xl text-stone-900 dark:text-stone-100 font-bold">
              {t('buyer.user.trustPledge', 'Sovereign Patron Trust Pledge')}
            </h4>
            <p className="font-body-sm text-xs text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed">
              {t('buyer.user.trustPledgeDesc', 'Your patron profile is linked to direct fair-wage escrow accounts with our verified artisanal clusters across India. All transactions carry cryptographically verified authenticity records.')}
            </p>
          </div>

          <div className="flex items-center gap-6 flex-shrink-0">
            <div className="text-right">
              <span className="font-label-sm text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 block font-medium">
                {t('profile.accountStatus', 'Account Status')}
              </span>
              <span className="font-bold text-sm text-[#14532D] dark:text-emerald-400">
                {user?.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
              </span>
            </div>
            <div className="h-8 w-[1px] bg-stone-300 dark:bg-stone-700" />
            <div className="text-right">
              <span className="font-label-sm text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 block font-medium">
                {t('profile.verificationStatus', 'Verification Status')}
              </span>
              <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                {t('common.verified', 'Verified')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200/80 dark:border-stone-800">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200/60 dark:border-stone-800">
              <div>
                <h3 className="font-garamond text-2xl text-stone-900 dark:text-stone-100 font-bold">
                  {t('profile.editProfile', 'Edit Profile')}
                </h3>
                <p className="font-body-sm text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  {t('profile.editPatronSub', 'Update your personal details.')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
              <div>
                <label className="block font-label-sm text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                  {t('profile.fullName', 'Full Name')} *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#14532D] dark:focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-label-sm text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                  {t('profile.mobile', 'Mobile Number')}
                </label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={editForm.mobile}
                  onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#14532D] dark:focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-sm text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                    {t('profile.district', 'City / District')}
                  </label>
                  <input
                    type="text"
                    value={editForm.district}
                    onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#14532D] dark:focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-label-sm text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                    {t('profile.state', 'State')}
                  </label>
                  <input
                    type="text"
                    value={editForm.state}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#14532D] dark:focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200/60 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 font-label-sm text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 uppercase tracking-wider cursor-pointer"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 font-label-sm text-xs font-bold text-white bg-[#14532D] hover:bg-[#0E3D20] rounded-xl uppercase tracking-wider transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50"
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
