import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { navigateByRole } from '../utils/navigation';
import logo from '../assets/logo.jpg';
import loginBackground from '../assets/LoginBackground.jpg';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  ShieldCheck,
  Award,
  Sparkles,
  ShoppingBag,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  X,
  Languages,
  ArrowRight
} from 'lucide-react';

const INDIAN_STATES = [
  'West Bengal',
  'Uttar Pradesh',
  'Rajasthan',
  'Gujarat',
  'Odisha',
  'Jammu & Kashmir',
  'Madhya Pradesh',
  'Karnataka',
  'Tamil Nadu',
  'Assam',
  'Bihar',
  'Maharashtra',
  'Telangana',
  'Andhra Pradesh',
  'Kerala',
  'Punjab',
  'Haryana',
  'Himachal Pradesh',
  'Uttarakhand'
];

const CRAFT_TYPES = [
  'Handloom Weaving',
  'Madhubani / Mithila Painting',
  'Blue Pottery',
  'Dhokra Metal Casting',
  'Pashmina & Cashmere Shawls',
  'Brass & Copper Handicrafts',
  'Bidriware Inlay Craft',
  'Wood Carving & Marquetry',
  'Channapatna Wooden Toys',
  'Zardozi & Chikankari Embroidery',
  'Terracotta & Pottery',
  'Leather Mojari & Crafts',
  'Kalamkari Art',
  'Tanjore Painting',
  'Other Traditional Craft'
];

export default function Login() {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Fresh site visits strictly display the Login page first without auto-bypassing

  // Active main tab: 'login' | 'signup'
  const [activeTab, setActiveTab] = useState('login');

  // Role in login tab: initially null (user MUST select intentionally)
  const [selectedRole, setSelectedRole] = useState(null);
  // Role in signup tab: initially null
  const [signupRole, setSignupRole] = useState(null);

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading & error feedback
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Demo option notice modal/toast
  const [demoNotice, setDemoNotice] = useState(null);

  // Login Form State
  const [loginForm, setLoginForm] = useState({
    identifier: '',
    password: ''
  });

  // Sign Up Form State
  const [signupForm, setSignupForm] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    craftType: '',
    state: '',
    district: '',
    yearsOfExperience: '',
    businessName: '',
    giTagNumber: '',
    clusterName: '',
    agreeTerms: false
  });

  // Validation errors
  const [fieldErrors, setFieldErrors] = useState({});

  // Language switcher handler
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    try {
      localStorage.setItem('karigar-language', lng);
    } catch (_e) {}
  };

  // Switch tabs with role retention
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setErrorMessage('');
    setSuccessMessage('');
    setFieldErrors({});
    if (newTab === 'signup') {
      if (selectedRole && !signupRole) {
        setSignupRole(selectedRole);
      }
    } else if (newTab === 'login') {
      if (signupRole && !selectedRole) {
        setSelectedRole(signupRole);
      }
    }
  };

  // Helper: Enforce mandatory role selection
  const requireRoleSelection = () => {
    if (!selectedRole) {
      setErrorMessage(
        t('auth.pleaseSelectRole', 'Please select Artisan / Weaver or Patron / Collector before continuing.')
      );
      return false;
    }
    return true;
  };

  // -------------------------------------------------------------
  // Handle Login Submit
  // -------------------------------------------------------------
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setFieldErrors({});

    if (!requireRoleSelection()) {
      return;
    }

    const errors = {};
    if (!loginForm.identifier.trim()) {
      errors.identifier = t('auth.errors.identifierRequired', 'Please enter your email or mobile number');
    }
    if (!loginForm.password) {
      errors.password = t('auth.errors.passwordRequired', 'Password is required');
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(loginForm.identifier.trim(), loginForm.password, selectedRole);
      setSuccessMessage(t('common.success', 'Login successful! Redirecting...'));

      // Redirect based strictly on authenticated role from Prisma
      setTimeout(() => {
        navigateByRole(navigate, loggedUser, location.state?.from);
      }, 500);
    } catch (err) {
      const rawMsg = err.message || '';
      if (rawMsg.includes('registered as Artisan / Weaver')) {
        setErrorMessage(t('auth.roleMismatchArtisan', 'This account is registered as Artisan / Weaver. Please select Artisan / Weaver to continue.'));
      } else if (rawMsg.includes('registered as Patron / Collector')) {
        setErrorMessage(t('auth.roleMismatchPatron', 'This account is registered as Patron / Collector. Please select Patron / Collector to continue.'));
      } else if (rawMsg.includes('select your account type')) {
        setErrorMessage(t('auth.pleaseSelectAccountType', 'Please select your account type first.'));
      } else {
        setErrorMessage(rawMsg || 'Login failed. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Handle Google OAuth Sign-In
  // -------------------------------------------------------------
  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!requireRoleSelection()) {
      return;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID' || clientId.includes('your-google-client-id')) {
      setErrorMessage(
        t(
          'auth.googleNotConfigured',
          'Google Sign-In is not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file.'
        )
      );
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      setErrorMessage(
        t(
          'auth.googleLoading',
          'Google authentication service is still initializing. Please wait a moment and try again.'
        )
      );
      return;
    }

    setGoogleLoading(true);

    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        callback: async (response) => {
          if (response.error) {
            setGoogleLoading(false);
            if (response.error === 'popup_closed_by_user' || response.error_subtype === 'popup_closed') {
              setErrorMessage(t('auth.googleCancelled', 'Google sign-in was cancelled.'));
            } else {
              setErrorMessage(t('auth.googleFailed', 'Unable to sign in with Google. Please try again.'));
            }
            return;
          }

          try {
            const authUser = await loginWithGoogle(response.access_token, selectedRole);
            setSuccessMessage(t('common.success', 'Login successful! Redirecting...'));
            setTimeout(() => {
              navigateByRole(navigate, authUser, location.state?.from);
            }, 500);
          } catch (err) {
            const rawMsg = err.message || '';
            if (rawMsg.includes('registered as Artisan / Weaver')) {
              setErrorMessage(t('auth.roleMismatchArtisan', 'This account is registered as Artisan / Weaver. Please select Artisan / Weaver to continue.'));
            } else if (rawMsg.includes('registered as Patron / Collector')) {
              setErrorMessage(t('auth.roleMismatchPatron', 'This account is registered as Patron / Collector. Please select Patron / Collector to continue.'));
            } else if (rawMsg.includes('select your account type')) {
              setErrorMessage(t('auth.pleaseSelectAccountType', 'Please select your account type first.'));
            } else {
              setErrorMessage(rawMsg || t('auth.googleFailed', 'Unable to sign in with Google. Please try again.'));
            }
          } finally {
            setGoogleLoading(false);
          }
        },
        error_callback: (err) => {
          setGoogleLoading(false);
          if (err?.type === 'popup_closed' || err?.error === 'popup_closed_by_user') {
            setErrorMessage(t('auth.googleCancelled', 'Google sign-in was cancelled.'));
          } else {
            setErrorMessage(t('auth.googleFailed', 'Unable to sign in with Google. Please try again.'));
          }
        }
      });

      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      setGoogleLoading(false);
      setErrorMessage(err.message || t('auth.googleFailed', 'Unable to sign in with Google. Please try again.'));
    }
  };

  // -------------------------------------------------------------
  // Handle Sign Up Submit
  // -------------------------------------------------------------
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setFieldErrors({});

    const errors = {};
    const isPatronSignup = signupRole === 'PATRON';

    if (!signupForm.fullName.trim()) {
      errors.fullName = t('auth.errors.nameRequired', 'Full Name is required');
    }

    if (!signupForm.email.trim()) {
      errors.email = t('auth.errors.emailRequired', 'Valid Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupForm.email.trim())) {
      errors.email = t('auth.errors.emailInvalid', 'Please enter a valid email address');
    }

    if (!signupForm.mobile.trim()) {
      errors.mobile = t('auth.errors.mobileInvalid', 'Please enter a valid 10-digit mobile number');
    } else if (!/^[6-9]\d{9}$/.test(signupForm.mobile.trim())) {
      errors.mobile = t('auth.errors.mobileInvalid', 'Please enter a valid 10-digit mobile number (e.g. 9876543210)');
    }

    if (!signupForm.password) {
      errors.password = t('auth.errors.passwordRequired', 'Password is required');
    } else if (signupForm.password.length < 6) {
      errors.password = t('auth.errors.passwordShort', 'Password must be at least 6 characters');
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      errors.confirmPassword = t('auth.errors.passwordMismatch', 'Passwords do not match');
    }

    if (!isPatronSignup) {
      if (!signupForm.craftType.trim()) {
        errors.craftType = t('auth.errors.craftRequired', 'Craft Type is required');
      }

      if (!signupForm.state.trim()) {
        errors.state = t('auth.errors.stateRequired', 'State is required');
      }
    }

    if (!signupForm.agreeTerms) {
      errors.agreeTerms = t('auth.errors.termsRequired', 'You must agree to the Terms & Conditions');
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const createdUser = await signup({
        fullName: signupForm.fullName.trim(),
        email: signupForm.email.trim(),
        mobile: signupForm.mobile.trim(),
        password: signupForm.password,
        confirmPassword: signupForm.confirmPassword,
        role: isPatronSignup ? 'PATRON' : 'ARTISAN',
        craftType: isPatronSignup ? '' : signupForm.craftType.trim(),
        state: isPatronSignup ? '' : signupForm.state.trim(),
        district: isPatronSignup ? '' : signupForm.district.trim(),
        yearsOfExperience: (!isPatronSignup && signupForm.yearsOfExperience) ? parseInt(signupForm.yearsOfExperience, 10) : 0,
        businessName: isPatronSignup ? '' : signupForm.businessName.trim(),
        giTagNumber: isPatronSignup ? '' : signupForm.giTagNumber.trim(),
        clusterName: isPatronSignup ? '' : signupForm.clusterName.trim(),
        agreeTerms: true
      });

      setSuccessMessage(`${isPatronSignup ? 'Patron' : 'Artisan'} account created successfully! Opening portal...`);

      // Auto-navigate to home or seller dashboard based on authenticated role
      setTimeout(() => {
        navigateByRole(navigate, createdUser);
      }, 700);
    } catch (err) {
      const rawMsg = err.message || '';
      if (rawMsg.includes('already exists with this email')) {
        setErrorMessage(t('auth.errors.emailAlreadyExists', 'An account already exists with this email. Please log in using the registered account type.'));
      } else if (rawMsg.includes('already exists with this mobile number')) {
        setErrorMessage(t('auth.errors.mobileAlreadyExists', 'An account already exists with this mobile number. Please log in using the registered account type.'));
      } else {
        setErrorMessage(rawMsg || 'Signup failed. Please check your inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Handle Forgot Password Request
  // -------------------------------------------------------------
  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) return;
    setForgotSubmitted(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSubmitted(false);
      setForgotIdentifier('');
      setSuccessMessage(
        t(
          'auth.recoverySubmitted',
          'Password recovery request submitted. Please check your messages.'
        )
      );
    }, 1200);
  };

  const handleDemoProviderClick = (providerName) => {
    setDemoNotice(
      `${providerName} integration is enabled for demo. Please use Email/Mobile password authentication for full Prisma-verified access.`
    );
    setTimeout(() => setDemoNotice(null), 4000);
  };

  return (
    <div
      className="min-h-screen w-full relative flex flex-col justify-between items-center py-6 sm:py-8 px-4 sm:px-6 select-none"
      style={{
        backgroundImage: `url(${loginBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Light transparent cream overlay allowing the heritage background artwork to remain clearly visible */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundColor: 'rgba(255, 250, 242, 0.22)' }}
      />

      {/* Top Header Controls (Govt Badge + Language Switcher ONLY - NO Theme Toggle) */}
      <header className="relative z-10 w-full max-w-5xl flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-900/10 text-stone-800 text-xs font-semibold tracking-wide backdrop-blur-md border border-amber-900/20">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            GOVT. OF INDIA PORTAL INTEGRATED
          </span>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center bg-white/85 backdrop-blur-md rounded-xl p-1 border border-stone-300/80 shadow-xs text-xs font-medium">
          <button
            type="button"
            onClick={() => changeLanguage('en')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              i18n.language === 'en'
                ? 'bg-[#14532D] text-white font-bold shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => changeLanguage('hi')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              i18n.language === 'hi'
                ? 'bg-[#14532D] text-white font-bold shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            हिन्दी
          </button>
          <button
            type="button"
            onClick={() => changeLanguage('bn')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              i18n.language === 'bn'
                ? 'bg-[#14532D] text-white font-bold shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            বাংলা
          </button>
        </div>
      </header>

      {/* Main Authentication Section */}
      <main className="relative z-10 w-full flex flex-col items-center max-w-4xl">
        {/* Brand Logo & National Gateway Headline - Prominent Logo Size */}
        <div className="flex flex-col items-center text-center mb-5 sm:mb-6">
          {/* Logo directly over background with prominent responsive sizing - NO background box/border/shadow */}
          <img
            src={logo}
            alt="Karigar"
            className="h-[72px] sm:h-[84px] md:h-[92px] lg:h-[100px] xl:h-[105px] w-auto object-contain mb-2.5 sm:mb-3"
          />

          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-stone-900 tracking-wider uppercase font-serif leading-[1.15]">
            {t('auth.bridgingArtisans', 'BRIDGING ARTISANS TO THE WORLD')}
          </h1>
          <p className="text-xs sm:text-sm text-stone-800 font-medium max-w-xl mt-1.5 leading-[1.35]">
            {t(
              'auth.nationalGateway',
              'National Digital Gateway for Indigenous Master Craftsmen & Connoisseurs'
            )}
          </p>
        </div>

        {/* Floating Demo Alert Toast */}
        {demoNotice && (
          <div className="mb-4 w-full max-w-md bg-amber-500/95 text-stone-950 px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 backdrop-blur-md animate-fade-in">
            <HelpCircle className="w-4 h-4 flex-shrink-0" />
            <span>{demoNotice}</span>
          </div>
        )}

        {/* Centered Cream Artisan Card with balanced, professional spacing */}
        <div
          className={`w-full ${
            activeTab === 'signup' ? 'max-w-xl' : 'max-w-[460px]'
          } bg-[#FCFAF6] rounded-2xl shadow-lg border border-[#E7DECB] border-t-4 border-t-[#14532D] px-5 py-6 sm:px-8 sm:py-7 transition-all duration-200`}
        >
          {/* Card Tabs: Login | Sign Up (16px – 20px below tabs, underline close to selected tab) */}
          <div className="flex border-b border-[#E7DECB] mb-4 sm:mb-5">
            <button
              type="button"
              onClick={() => handleTabChange('login')}
              className={`flex-1 pb-2.5 text-sm sm:text-base font-semibold transition-all relative ${
                activeTab === 'login'
                  ? 'text-[#C2410C] border-b-2 border-[#C2410C] font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {t('auth.loginTab', 'Login')}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('signup')}
              className={`flex-1 pb-2.5 text-sm sm:text-base font-semibold transition-all relative ${
                activeTab === 'signup'
                  ? 'text-[#C2410C] border-b-2 border-[#C2410C] font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {t('auth.signupTab', 'Sign Up')}
            </button>
          </div>

          {/* Feedback Banners */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 1: LOGIN VIEW */}
          {/* ========================================================= */}
          {activeTab === 'login' && (
            <div>
              {/* Segmented Role Selector: 22px – 26px spacing after role selector */}
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#F3EFE6] rounded-xl border border-[#E5D7C2]">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('ARTISAN');
                      setErrorMessage('');
                    }}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                      selectedRole === 'ARTISAN'
                        ? 'bg-[#FCFAF6] border border-[#C2410C]/30 text-[#C2410C] font-bold shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-[#C2410C]" />
                    <span>{t('auth.artisanWeaver', 'Artisan / Weaver')}</span>
                    {selectedRole === 'ARTISAN' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#14532D]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('PATRON');
                      setErrorMessage('');
                    }}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                      selectedRole === 'PATRON'
                        ? 'bg-[#FCFAF6] border border-[#C2410C]/30 text-[#C2410C] font-bold shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-stone-500" />
                    <span>{t('auth.patronCollector', 'Patron / Collector')}</span>
                    {selectedRole === 'PATRON' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#14532D]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Welcome Section */}
              <div className="text-center mb-5 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mb-1.5 leading-[1.15]">
                  Welcome Back!
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 leading-[1.35]">
                  {selectedRole === 'PATRON'
                    ? t('auth.loginSubtitlePatron', 'Login to continue to Karigar Patron & Collector Marketplace')
                    : t('auth.loginSubtitleArtisan', 'Login to continue to Karigar Handloom & Handicraft Portal')}
                </p>
              </div>

              {/* Login Form (Available for both Artisan & Patron) */}
              <form onSubmit={handleLoginSubmit}>
                {/* Email or Mobile Number Input: 6–8px label gap, 18–20px field gap */}
                <div className="mb-4 sm:mb-[18px]">
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5 leading-none">
                    {t('auth.identifierLabel', 'Email or Mobile Number')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={loginForm.identifier}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, identifier: e.target.value })
                      }
                      placeholder={
                        selectedRole === 'PATRON'
                          ? t('auth.identifierPlaceholderPatron', 'patron@collector.in or 9876543210')
                          : t('auth.identifierPlaceholder', 'artisan@craftguild.in or 9876543210')
                      }
                      className={`w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl text-sm bg-white border ${
                        fieldErrors.identifier
                          ? 'border-red-400 focus:ring-red-400'
                          : 'border-[#D5C9B3] focus:border-[#14532D] focus:ring-[#14532D]/20'
                      } text-stone-900 placeholder-stone-400 transition-colors focus:outline-none focus:ring-2`}
                    />
                  </div>
                  {fieldErrors.identifier && (
                    <p className="mt-1 text-xs text-red-600 font-medium leading-tight">
                      {fieldErrors.identifier}
                    </p>
                  )}
                </div>

                {/* Password Input: vertically aligned forgot password, 6–8px label gap */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 leading-none">
                    <label className="text-xs font-semibold text-stone-700">
                      {t('auth.passwordLabel', 'Password')} <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs font-semibold text-[#C2410C] hover:underline"
                    >
                      {t('auth.forgotPassword', 'Forgot Password?')}
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, password: e.target.value })
                      }
                      placeholder={t('auth.passwordPlaceholder', 'Enter your security password')}
                      className={`w-full pl-10 pr-11 py-2.5 sm:py-3 rounded-xl text-sm bg-white border ${
                        fieldErrors.password
                          ? 'border-red-400 focus:ring-red-400'
                          : 'border-[#D5C9B3] focus:border-[#14532D] focus:ring-[#14532D]/20'
                      } text-stone-900 placeholder-stone-400 transition-colors focus:outline-none focus:ring-2`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="mt-1 text-xs text-red-600 font-medium leading-tight">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                {/* Primary Dark Green Button: 20px–24px after password, height 48px–52px */}
                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full mt-5 sm:mt-6 h-[48px] sm:h-[50px] px-4 rounded-xl bg-[#14532D] hover:bg-[#0E3D20] text-white font-bold text-sm shadow-md transition-all duration-200 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t('auth.loggingIn', 'Logging in...')}</span>
                    </>
                  ) : (
                    <span>{t('auth.loginBtn', 'Login to Karigar')}</span>
                  )}
                </button>

                {/* "OR" Divider: 18px–22px after login, 16px–18px before alternative options */}
                <div className="relative flex items-center justify-center mt-5 mb-4">
                  <div className="border-t border-[#D5C9B3] w-full" />
                  <span className="bg-[#FCFAF6] px-3 text-xs font-bold text-stone-500 uppercase leading-none">
                    {t('auth.or', 'OR')}
                  </span>
                  <div className="border-t border-[#D5C9B3] w-full" />
                </div>

                {/* Alternative Login Options: 10px–12px vertical gap, consistent heights */}
                <div className="space-y-2.5 sm:space-y-3">
                  {/* Google */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading || googleLoading}
                    className="w-full h-10 sm:h-11 px-4 rounded-xl border border-[#D5C9B3] bg-white text-stone-700 text-xs sm:text-sm font-semibold hover:bg-stone-50 transition-colors flex items-center justify-center gap-2.5 disabled:opacity-60"
                  >
                    {googleLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#14532D] border-t-transparent rounded-full animate-spin" />
                        <span>{t('auth.signingInGoogle', 'Signing in with Google...')}</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        <span>{t('auth.continueGoogle', 'Continue with Google')}</span>
                      </>
                    )}
                  </button>

                  {/* Phone OTP */}
                  <button
                    type="button"
                    onClick={() => handleDemoProviderClick('Phone OTP')}
                    className="w-full h-10 sm:h-11 px-4 rounded-xl border border-[#D5C9B3] bg-white text-stone-700 text-xs sm:text-sm font-semibold hover:bg-stone-50 transition-colors flex items-center justify-center gap-2.5"
                  >
                    <Phone className="w-4 h-4 text-emerald-700" />
                    <span>{t('auth.continuePhoneOtp', 'Continue with Phone OTP')}</span>
                  </button>

                  {/* Jan Parichay / Pehchan Card */}
                  <button
                    type="button"
                    onClick={() => handleDemoProviderClick('Jan Parichay')}
                    className="w-full h-10 sm:h-11 px-4 rounded-xl border border-[#D5C9B3] bg-white text-stone-700 text-xs sm:text-sm font-semibold hover:bg-stone-50 transition-colors flex items-center justify-center gap-2.5"
                  >
                    <Award className="w-4 h-4 text-[#C2410C]" />
                    <span>{t('auth.signInJanParichay', 'Sign in with Jan Parichay / Pehchan Card')}</span>
                  </button>
                </div>

                {/* Switch to Sign Up link: 20px–24px after last button, 4px–8px bottom breathing space */}
                <div className="mt-5 sm:mt-6 mb-1 text-center text-xs sm:text-sm text-stone-600 leading-none">
                  <span>Don't have an account? </span>
                  <button
                    type="button"
                    onClick={() => handleTabChange('signup')}
                    className="font-bold text-[#C2410C] hover:underline ml-1"
                  >
                    {t('auth.signupTab', 'Sign Up')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: SIGN UP VIEW */}
          {/* ========================================================= */}
          {activeTab === 'signup' && (
            <div>
              {/* Sign Up Header */}
              <div className="text-center mb-5 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mb-1.5 leading-[1.15]">
                  {signupRole === 'PATRON'
                    ? t('auth.createPatronTitle', 'Join as a Patron & Connoisseur')
                    : t('auth.createAccountTitle', 'Join Karigar Artisan Collective')}
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 leading-[1.35]">
                  {signupRole === 'PATRON'
                    ? t(
                        'auth.createPatronSubtitle',
                        'Discover authentic heritage crafts with escrow protection and GI certification'
                      )
                    : t(
                        'auth.createAccountSubtitle',
                        'Register your craft practice and start selling directly to global patrons'
                      )}
                </p>
              </div>

              {/* Sign Up Role Selector */}
              <div className="mb-5">
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#F3EFE6] rounded-xl border border-[#E5D7C2]">
                  <button
                    type="button"
                    onClick={() => {
                      setSignupRole('ARTISAN');
                      setErrorMessage('');
                      setFieldErrors({});
                    }}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                      signupRole === 'ARTISAN'
                        ? 'bg-[#FCFAF6] border border-[#C2410C]/30 text-[#C2410C] font-bold shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-[#C2410C]" />
                    <span>{t('auth.artisanWeaver', 'Artisan / Weaver')}</span>
                    {signupRole === 'ARTISAN' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#14532D]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSignupRole('PATRON');
                      setErrorMessage('');
                      setFieldErrors({});
                    }}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                      signupRole === 'PATRON'
                        ? 'bg-[#FCFAF6] border border-[#C2410C]/30 text-[#C2410C] font-bold shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-stone-500" />
                    <span>{t('auth.patronCollector', 'Patron / Collector')}</span>
                    {signupRole === 'PATRON' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#14532D]" />
                    )}
                  </button>
                </div>
              </div>

              <form onSubmit={handleSignupSubmit}>

                {/* 2-column fields on desktop/tablet with consistent 16px–20px field gaps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 sm:gap-y-[18px]">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5 leading-none">
                      {t('auth.fullNameLabel', 'Full Name')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={signupForm.fullName}
                      onChange={(e) =>
                        setSignupForm({ ...signupForm, fullName: e.target.value })
                      }
                      placeholder={t('auth.fullNamePlaceholder', 'e.g. Ramesh Chandra Verma')}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-white border ${
                        fieldErrors.fullName
                          ? 'border-red-400'
                          : 'border-[#D5C9B3] focus:border-[#14532D]'
                      } text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#14532D]/20`}
                    />
                    {fieldErrors.fullName && (
                      <p className="mt-1 text-xs text-red-600 font-medium leading-tight">
                        {fieldErrors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5 leading-none">
                      {t('auth.mobileLabel', 'Mobile Number')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={signupForm.mobile}
                      onChange={(e) =>
                        setSignupForm({ ...signupForm, mobile: e.target.value })
                      }
                      placeholder={t('auth.mobilePlaceholder', '9876543210')}
                      maxLength={10}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-white border ${
                        fieldErrors.mobile
                          ? 'border-red-400'
                          : 'border-[#D5C9B3] focus:border-[#14532D]'
                      } text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#14532D]/20`}
                    />
                    {fieldErrors.mobile && (
                      <p className="mt-1 text-xs text-red-600 font-medium leading-tight">
                        {fieldErrors.mobile}
                      </p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5 leading-none">
                      {t('auth.emailLabel', 'Email Address')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={signupForm.email}
                      onChange={(e) =>
                        setSignupForm({ ...signupForm, email: e.target.value })
                      }
                      placeholder={
                        signupRole === 'PATRON'
                          ? t('auth.emailPlaceholderPatron', 'patron@collector.in')
                          : t('auth.emailPlaceholder', 'artisan@craftguild.in')
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-white border ${
                        fieldErrors.email
                          ? 'border-red-400'
                          : 'border-[#D5C9B3] focus:border-[#14532D]'
                      } text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#14532D]/20`}
                    />
                    {fieldErrors.email && (
                      <p className="mt-1 text-xs text-red-600 font-medium leading-tight">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  {/* State (Required for Artisan, Optional for Patron) */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5 leading-none">
                      {t('auth.stateLabel', 'State')} {signupRole === 'ARTISAN' ? <span className="text-red-500">*</span> : <span className="text-stone-400 font-normal">({t('common.optional', 'Optional')})</span>}
                    </label>
                    <select
                      value={signupForm.state}
                      onChange={(e) =>
                        setSignupForm({ ...signupForm, state: e.target.value })
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-white border ${
                        fieldErrors.state
                          ? 'border-red-400'
                          : 'border-[#D5C9B3] focus:border-[#14532D]'
                      } text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#14532D]/20`}
                    >
                      <option value="">{t('auth.statePlaceholder', 'Select State')}</option>
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.state && (
                      <p className="mt-1 text-xs text-red-600 font-medium leading-tight">
                        {fieldErrors.state}
                      </p>
                    )}
                  </div>

                  {/* District / City (Optional for both) */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5 leading-none">
                      {signupRole === 'PATRON' ? t('auth.cityLabel', 'City / District') : t('auth.districtLabel', 'District')} <span className="text-stone-400 font-normal">({t('common.optional', 'Optional')})</span>
                    </label>
                    <input
                      type="text"
                      value={signupForm.district}
                      onChange={(e) =>
                        setSignupForm({ ...signupForm, district: e.target.value })
                      }
                      placeholder={signupRole === 'PATRON' ? t('auth.cityPlaceholder', 'e.g. Kolkata, Bengaluru') : t('auth.districtPlaceholder', 'e.g. Varanasi, Nadia')}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white border border-[#D5C9B3] text-stone-900 focus:border-[#14532D] focus:outline-none focus:ring-2 focus:ring-[#14532D]/20"
                    />
                  </div>

                  {/* Artisan-Only Craft Fields */}
                  {signupRole === 'ARTISAN' && (
                    <>
                      {/* Craft Type */}
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1.5 leading-none">
                          {t('auth.craftTypeLabel', 'Craft Type')} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={signupForm.craftType}
                          onChange={(e) =>
                            setSignupForm({ ...signupForm, craftType: e.target.value })
                          }
                          className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-white border ${
                            fieldErrors.craftType
                              ? 'border-red-400'
                              : 'border-[#D5C9B3] focus:border-[#14532D]'
                          } text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#14532D]/20`}
                        >
                          <option value="">{t('auth.craftTypePlaceholder', 'Select or enter your craft')}</option>
                          {CRAFT_TYPES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        {fieldErrors.craftType && (
                          <p className="mt-1 text-xs text-red-600 font-medium leading-tight">
                            {fieldErrors.craftType}
                          </p>
                        )}
                      </div>

                      {/* Years of Experience */}
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1.5 leading-none">
                          {t('auth.yearsExpLabel', 'Years of Experience')}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="70"
                          value={signupForm.yearsOfExperience}
                          onChange={(e) =>
                            setSignupForm({ ...signupForm, yearsOfExperience: e.target.value })
                          }
                          placeholder={t('auth.yearsExpPlaceholder', 'e.g. 15')}
                          className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white border border-[#D5C9B3] text-stone-900 focus:border-[#14532D] focus:outline-none focus:ring-2 focus:ring-[#14532D]/20"
                        />
                      </div>

                      {/* Business Name */}
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1.5 leading-none">
                          {t('auth.businessNameLabel', 'Artisan / Business Name')}
                        </label>
                        <input
                          type="text"
                          value={signupForm.businessName}
                          onChange={(e) =>
                            setSignupForm({ ...signupForm, businessName: e.target.value })
                          }
                          placeholder={t('auth.businessNamePlaceholder', 'e.g. Nadia Handloom Guild')}
                          className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white border border-[#D5C9B3] text-stone-900 focus:border-[#14532D] focus:outline-none focus:ring-2 focus:ring-[#14532D]/20"
                        />
                      </div>

                      {/* GI Tag Number */}
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1.5 leading-none">
                          {t('auth.giTagLabel', 'GI Tag Number (Optional)')}
                        </label>
                        <input
                          type="text"
                          value={signupForm.giTagNumber}
                          onChange={(e) =>
                            setSignupForm({ ...signupForm, giTagNumber: e.target.value })
                          }
                          placeholder={t('auth.giTagPlaceholder', 'e.g. GI-WB-0452')}
                          className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white border border-[#D5C9B3] text-stone-900 focus:border-[#14532D] focus:outline-none focus:ring-2 focus:ring-[#14532D]/20"
                        />
                      </div>

                      {/* Cluster Name */}
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1.5 leading-none">
                          {t('auth.clusterNameLabel', 'Cluster / Cooperative (Optional)')}
                        </label>
                        <input
                          type="text"
                          value={signupForm.clusterName}
                          onChange={(e) =>
                            setSignupForm({ ...signupForm, clusterName: e.target.value })
                          }
                          placeholder={t('auth.clusterNamePlaceholder', 'e.g. Shantipur Weavers Co-op')}
                          className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white border border-[#D5C9B3] text-stone-900 focus:border-[#14532D] focus:outline-none focus:ring-2 focus:ring-[#14532D]/20"
                        />
                      </div>
                    </>
                  )}

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5 leading-none">
                      {t('auth.passwordLabel', 'Password')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={signupForm.password}
                        onChange={(e) =>
                          setSignupForm({ ...signupForm, password: e.target.value })
                        }
                        placeholder={t('auth.passwordPlaceholder', 'Min 6 characters')}
                        className={`w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm bg-white border ${
                          fieldErrors.password
                            ? 'border-red-400'
                            : 'border-[#D5C9B3] focus:border-[#14532D]'
                        } text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#14532D]/20`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="mt-1 text-xs text-red-600 font-medium leading-tight">
                        {fieldErrors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5 leading-none">
                      {t('auth.confirmPasswordLabel', 'Confirm Password')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={signupForm.confirmPassword}
                        onChange={(e) =>
                          setSignupForm({ ...signupForm, confirmPassword: e.target.value })
                        }
                        placeholder={t('auth.confirmPasswordPlaceholder', 'Re-enter password')}
                        className={`w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm bg-white border ${
                          fieldErrors.confirmPassword
                            ? 'border-red-400'
                            : 'border-[#D5C9B3] focus:border-[#14532D]'
                        } text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#14532D]/20`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600 font-medium leading-tight">
                        {fieldErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Terms & Conditions Checkbox: 20px–24px section separation */}
                <div className="mt-5">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={signupForm.agreeTerms}
                      onChange={(e) =>
                        setSignupForm({ ...signupForm, agreeTerms: e.target.checked })
                      }
                      className="mt-0.5 w-4 h-4 rounded text-[#14532D] focus:ring-[#14532D] border-[#D5C9B3]"
                    />
                    <span className="text-xs text-stone-700 leading-normal">
                      {signupRole === 'PATRON'
                        ? t(
                            'auth.agreeTermsPatron',
                            'I agree to the Terms & Conditions and Buyer Policy'
                          )
                        : t(
                            'auth.agreeTerms',
                            'I agree to the Terms & Conditions and Artisan Code of Conduct'
                          )} <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {fieldErrors.agreeTerms && (
                    <p className="mt-1 text-xs text-red-600 font-medium leading-tight">
                      {fieldErrors.agreeTerms}
                    </p>
                  )}
                </div>

                {/* Submit Account Button: 20px–24px before button, height 48px–52px */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-5 sm:mt-6 h-[48px] sm:h-[50px] px-4 rounded-xl bg-[#14532D] hover:bg-[#0E3D20] text-white font-bold text-sm shadow-md transition-all duration-200 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t('auth.creatingAccount', 'Creating Account...')}</span>
                    </>
                  ) : (
                    <span>{signupRole === 'PATRON' ? t('auth.createPatronAccount', 'Create Patron Account') : t('auth.createArtisanAccount', 'Create Artisan Account')}</span>
                  )}
                </button>

                {/* Switch to Login link: 20px–24px after button, 4px–8px bottom breathing space */}
                <div className="mt-5 sm:mt-6 mb-1 text-center text-xs sm:text-sm text-stone-600 leading-none">
                  <span>Already registered as Karigar? </span>
                  <button
                    type="button"
                    onClick={() => handleTabChange('login')}
                    className="font-bold text-[#C2410C] hover:underline ml-1"
                  >
                    {t('auth.loginTab', 'Login')}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Feature Section (Secure / Simple / Empowering) with balanced spacing */}
        <div className="w-full max-w-2xl mt-7 sm:mt-8 mb-4 sm:mb-5 text-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-5">
            {/* Secure */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-amber-100/90 border border-amber-300/60 flex items-center justify-center mb-2 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-[#C2410C]" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider leading-none">
                {t('auth.secureFeatureTitle', 'Secure')}
              </h4>
              <p className="text-xs text-stone-700 mt-1 leading-[1.35]">
                {t('auth.secureFeatureDesc', 'Direct RBI Escrow Protected')}
              </p>
            </div>

            {/* Simple */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-amber-100/90 border border-amber-300/60 flex items-center justify-center mb-2 shadow-xs">
                <Languages className="w-5 h-5 text-[#C2410C]" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider leading-none">
                {t('auth.simpleFeatureTitle', 'Simple')}
              </h4>
              <p className="text-xs text-stone-700 mt-1 leading-[1.35]">
                {t('auth.simpleFeatureDesc', 'Voice & 12 Indic Dialects')}
              </p>
            </div>

            {/* Empowering */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-amber-100/90 border border-amber-300/60 flex items-center justify-center mb-2 shadow-xs">
                <Award className="w-5 h-5 text-[#C2410C]" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider leading-none">
                {t('auth.empoweringFeatureTitle', 'Empowering')}
              </h4>
              <p className="text-xs text-stone-700 mt-1 leading-[1.35]">
                {t('auth.empoweringFeatureDesc', 'Zero Commission to Artisans')}
              </p>
            </div>
          </div>

          {/* Bottom Heritage Quote with ornament */}
          <div className="flex flex-col items-center">
            <p className="text-sm sm:text-base font-serif italic text-stone-800 tracking-wide leading-snug">
              {t('auth.bottomHeritageQuote', '“Crafting a stronger, more inclusive India”')}
            </p>
            <div className="w-16 h-0.5 bg-[#C2410C]/40 rounded-full mt-2" />
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-[#FCFAF6] rounded-2xl p-6 sm:p-7 shadow-2xl border border-[#E7DECB] relative">
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-serif font-bold text-stone-900 mb-1 leading-[1.15]">
              {t('auth.resetPasswordTitle', 'Reset Password')}
            </h3>
            <p className="text-xs text-stone-600 mb-4 leading-[1.35]">
              {t(
                'auth.resetPasswordDesc',
                'Enter your registered email or 10-digit mobile number to receive a secure recovery code.'
              )}
            </p>

            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 leading-none">
                  {t('auth.identifierLabel', 'Email or Mobile Number')}
                </label>
                <input
                  type="text"
                  required
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  placeholder={t('auth.identifierPlaceholder', 'artisan@craftguild.in or 9876543210')}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white border border-[#D5C9B3] text-stone-900 focus:border-[#14532D] focus:outline-none focus:ring-2 focus:ring-[#14532D]/20"
                />
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-[#D5C9B3] text-stone-700 text-xs font-semibold hover:bg-stone-100 transition-colors"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={forgotSubmitted}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#14532D] text-white text-xs font-bold hover:bg-[#0E3D20] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {forgotSubmitted ? t('auth.sending', 'Sending...') : t('auth.sendResetLink', 'Send Reset Link / OTP')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
