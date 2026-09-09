import { categoryImage } from '../../data/demoImages';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon,
  ShieldCheck,
  Award,
  RefreshCw,
  Edit3,
  Sliders,
  DollarSign,
  Info,
  Check,
  Layers,
  MapPin,
  Tag,
  FileText
} from 'lucide-react';
import { useSeller } from '../../context/SellerContext';
import { useTranslation } from 'react-i18next';
import VoiceInput from '../../components/VoiceInput';
import TrustBadge from '../../components/TrustBadge';
import { formatCurrency } from '../../utils/formatters';

// Sample curated authentic craft images artisans can choose from or upload
const sampleCraftUploads = [
  {
    name: 'Bengal Terracotta Pot',
    url: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=600&q=80',
    title: 'Handcrafted Bengal Terracotta Decorative Pot',
    category: 'Pottery',
    material: 'Alluvial Terracotta Clay',
    state: 'West Bengal',
    craftType: 'Bankura Panchmura Pottery',
    giTag: 'Bankura Terracotta (GI-452)',
    price: 1099,
    priceRange: '₹850 – ₹1,250',
    description: 'Elegantly sculpted by master artisan Sushila Devi using authentic alluvial clay from the riverbeds of Bankura, West Bengal. Kiln-fired at 900°C for exceptional durability and adorned with traditional tribal motifs.'
  },
  {
    name: 'Dhokra Brass Figurine',
    url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    title: 'Heritage Dhokra Lost-Wax Cast Brass Sculpture',
    category: 'Metal Craft',
    material: 'Bell Metal Brass & Beeswax Core',
    state: 'West Bengal',
    craftType: 'Bengal Dhokra Craft',
    giTag: 'Bengal Dhokra (GI-564)',
    price: 2450,
    priceRange: '₹2,200 – ₹2,800',
    description: 'Created through a 4000-year-old non-ferrous lost-wax casting technique. Each piece is unique with intricate wax-thread coiling and rustic earthen finish.'
  },
  {
    name: 'Mithila Nature Painting',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    title: 'Handmade Madhubani Tree of Life Folk Art',
    category: 'Folk Painting',
    material: 'Handmade Tussar Paper & Organic Dyes',
    state: 'Bihar',
    craftType: 'Madhubani Painting',
    giTag: 'Madhubani Painting (GI-105)',
    price: 1850,
    priceRange: '₹1,500 – ₹2,100',
    description: 'Authentic Kachni style Madhubani painting drawn with fine bamboo twigs and colored using pure vegetable pigments extracted from turmeric, leaves and soot.'
  }
];

for (const sample of sampleCraftUploads) sample.url = categoryImage(sample) || sample.url;

export default function AddProduct() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { addProduct, profile, addToast } = useSeller();

  // Wizard Step: 1 = Upload Images, 2 = Product Details, 3 = AI Processing, 4 = Review & Publish
  const [currentStep, setCurrentStep] = useState(1);

  // Uploaded images
  const [uploadedImages, setUploadedImages] = useState([sampleCraftUploads[0].url]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Form Fields
  const [formData, setFormData] = useState({
    name: 'Handcrafted Bengal Terracotta Decorative Pot',
    category: 'Pottery',
    price: 1099,
    suggestedPriceRange: '₹850 – ₹1,250',
    material: 'Alluvial Terracotta Clay',
    state: 'West Bengal',
    craftType: 'Bankura Panchmura Pottery',
    giTag: 'Bankura Terracotta (GI-452)',
    stock: 15,
    description: 'Elegantly sculpted by master artisan Sushila Devi using authentic alluvial clay from the riverbeds of Bankura, West Bengal. Kiln-fired at 900°C for exceptional durability and adorned with traditional tribal motifs.'
  });

  // AI Processing Simulation States
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [hasAICompleted, setHasAICompleted] = useState(false);

  const aiSteps = [
    'Removing background',
    'Enhancing image',
    'Improving lighting',
    'Checking image authenticity',
    'Generating product title',
    'Generating description',
    'Translating content',
    'Analysing market price',
    'Generating suggested price'
  ];

  // Start AI Processing Simulation
  const startAIWorkflow = () => {
    setCurrentStep(3);
    setIsProcessingAI(true);
    setProcessingProgress(0);
    setCompletedSteps([]);
    setHasAICompleted(false);

    let progress = 0;
    let stepIndex = 0;

    const interval = setInterval(() => {
      progress += 12;
      setProcessingProgress(Math.min(progress, 100));

      if (stepIndex < aiSteps.length) {
        setCompletedSteps((prev) => [...prev, aiSteps[stepIndex]]);
        stepIndex++;
      }

      if (progress >= 100) {
        clearInterval(interval);
        setIsProcessingAI(false);
        setHasAICompleted(true);
        addToast(t('addProduct.aiToastSuccess', '✨ AI catalog generated with authenticity confidence!'), 'success');
      }
    }, 450);
  };

  const handleVoiceTranscript = (transcript, lang) => {
    setFormData((prev) => ({
      ...prev,
      description: transcript,
      name: transcript.length > 40 ? transcript.slice(0, 40) + '...' : transcript
    }));
    addToast(t('addProduct.voiceTranscriptToast', 'Voice transcript inserted into form fields'), 'info');
  };

  const handleSelectPresetCraft = (preset) => {
    setUploadedImages([preset.url]);
    setSelectedImageIndex(0);
    setFormData({
      name: preset.title,
      category: preset.category,
      price: preset.price,
      suggestedPriceRange: preset.priceRange,
      material: preset.material,
      state: preset.state,
      craftType: preset.craftType,
      giTag: preset.giTag,
      stock: 12,
      description: preset.description
    });
    addToast(t('addProduct.selectedPresetToast', { name: preset.name, defaultValue: `Selected sample craft: ${preset.name}` }), 'info');
  };

  const handlePublish = () => {
    addProduct({
      name: formData.name,
      category: formData.category,
      price: Number(formData.price),
      originalPrice: Math.round(Number(formData.price) * 1.25),
      stock: Number(formData.stock),
      material: formData.material,
      origin: `${formData.craftType}, ${formData.state}`,
      giTag: formData.giTag,
      image: uploadedImages[selectedImageIndex] || sampleCraftUploads[0].url,
      description: formData.description,
      authenticityScore: 92
    });
    navigate('/seller/products');
  };

  const stepsList = [
    { num: 1, label: t('addProduct.step1', 'Upload Images') },
    { num: 2, label: t('addProduct.step2', 'Product Details') },
    { num: 3, label: t('addProduct.step3', 'AI Processing') },
    { num: 4, label: t('addProduct.step4', 'Review & Publish') }
  ];

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>{t('addProduct.pageTitle', 'Add New Product')}</span>
            <span className="text-xs bg-orange-100 text-orange-800 font-bold px-2.5 py-0.5 rounded-full">
              {t('addProduct.aiBadge', 'Voice & AI Powered')}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {t('addProduct.pageSubtitle', 'List your handcrafted art in minutes. Speak in your language or upload photos.')}
          </p>
        </div>

        {currentStep > 1 && (
          <button
            type="button"
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 rounded-lg transition-colors self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('addProduct.prevStep', 'Previous Step')}</span>
          </button>
        )}
      </div>

      {/* 4-Step Horizontal Progress Indicator */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/90 shadow-2xs">
        <div className="flex items-center justify-between relative">
          {/* Progress bar line behind */}
          <div className="absolute top-1/2 left-6 right-6 h-0.5 -translate-y-1/2 bg-gray-200 z-0">
            <div
              className="h-full bg-orange-600 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (stepsList.length - 1)) * 100}%` }}
            />
          </div>

          {stepsList.map((step) => {
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;

            return (
              <div
                key={step.num}
                onClick={() => {
                  if (isCompleted || step.num < currentStep) {
                    setCurrentStep(step.num);
                  }
                }}
                className={`relative z-10 flex flex-col items-center cursor-pointer group`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 ${
                    isCurrent
                      ? 'bg-orange-600 text-white ring-4 ring-orange-100 shadow-sm'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-gray-400 border-2 border-gray-300'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.num}
                </div>
                <span
                  className={`text-xs font-semibold mt-2 whitespace-nowrap ${
                    isCurrent ? 'text-orange-600' : isCompleted ? 'text-emerald-700' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================================================== */}
      {/* STEP 1: UPLOAD IMAGES */}
      {/* ==================================================== */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200/90 shadow-2xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-900">{t('addProduct.step1Title', 'Step 1 — Upload Product Images')}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {t('addProduct.step1Subtitle', 'Take photos on your phone or upload high-resolution craft images. Karigar AI enhances lighting and verifies authenticity automatically.')}
            </p>
          </div>

          {/* Large Dashed Upload Area */}
          <div className="border-2 border-dashed border-gray-300 hover:border-orange-500 bg-gray-50/50 hover:bg-orange-50/20 rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer">
            <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-gray-900">
              {t('addProduct.dragDropTitle', 'Drag & drop product images')}
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              {t('addProduct.orText', 'or')} <span className="text-orange-600 font-semibold underline">{t('addProduct.clickToBrowse', 'click to browse files')}</span> {t('addProduct.fromComputer', 'from your computer or camera')}
            </p>
            <p className="text-[11px] text-gray-400 mt-2">
              {t('addProduct.uploadFormats', 'Supports JPEG, PNG, WEBP • Multiple images allowed (up to 5 photos)')}
            </p>
          </div>

          {/* Quick Preset Selector for Easy Demo */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t('addProduct.chooseSampleCraft', 'Or choose sample authentic craft images to test:')}
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold">
                {t('addProduct.verifiedIndianCrafts', 'Verified Indian Crafts')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {sampleCraftUploads.map((sample, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectPresetCraft(sample)}
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    uploadedImages[0] === sample.url
                      ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <img
                    src={sample.url}
                    alt={sample.name}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-gray-900 truncate">{sample.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{sample.craftType}</p>
                    <span className="text-[10px] text-emerald-700 font-medium">{t('addProduct.giRegisteredBadge', 'GI Registered')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Uploaded Thumbnails Preview */}
          {uploadedImages.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-700 mb-2">{t('addProduct.selectedImagesLabel', 'Selected Product Images:')}</h4>
              <div className="flex items-center gap-3 flex-wrap">
                {uploadedImages.map((img, i) => (
                  <div
                    key={i}
                    className="relative group w-24 h-24 rounded-xl overflow-hidden border-2 border-orange-500 shadow-xs"
                  >
                    <img src={img} alt="Uploaded preview" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded font-semibold">
                      {t('addProduct.primaryBadge', 'Primary')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Button */}
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2.5 bg-[#14532D] hover:bg-[#0f3e22] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors"
            >
              <span>{t('addProduct.nextStep', 'Continue to Product Details')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* STEP 2: PRODUCT DETAILS WITH VOICE INPUT */}
      {/* ==================================================== */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200/90 shadow-2xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-900">{t('addProduct.step2Title', 'Step 2 — Product Details')}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {t('addProduct.step2Subtitle', 'Enter your craft details or speak naturally using your microphone.')}
            </p>
          </div>

          {/* Voice Input Section */}
          <VoiceInput
            onTranscriptReady={handleVoiceTranscript}
            onGenerateAI={() => startAIWorkflow()}
          />

          {/* Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {/* Product Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('addProduct.productName', 'Product Name')} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent font-medium"
                placeholder={t('addProduct.productNamePlaceholder', 'e.g. Handcrafted Bengal Terracotta Decorative Pot')}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('addProduct.category', 'Category')} *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 font-medium"
              >
                <option value="Pottery">{t('addProduct.catPottery', 'Pottery & Ceramics')}</option>
                <option value="Bamboo & Cane">{t('addProduct.catBamboo', 'Bamboo & Cane Craft')}</option>
                <option value="Woodcraft">{t('addProduct.catWoodcraft', 'Woodcraft & Carvings')}</option>
                <option value="Folk Painting">{t('addProduct.catFolkPainting', 'Folk Painting & Art')}</option>
                <option value="Metal Craft">{t('addProduct.catMetalCraft', 'Dhokra & Brass Metalwork')}</option>
                <option value="Handloom">{t('addProduct.catHandloom', 'Handloom & Textiles')}</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('addProduct.priceLabel', 'Price (₹)')} *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 font-bold"
                  placeholder="1099"
                />
              </div>
            </div>

            {/* Material Used */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('addProduct.materialLabel', 'Material Used')} *
              </label>
              <input
                type="text"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 font-medium"
                placeholder={t('addProduct.materialPlaceholder', 'e.g. Alluvial Terracotta Clay')}
              />
            </div>

            {/* State / Region */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('addProduct.stateLabel', 'State / Region')} *
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 font-medium"
                placeholder={t('addProduct.statePlaceholder', 'e.g. West Bengal')}
              />
            </div>

            {/* Craft Type */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('addProduct.craftTypeLabel', 'Craft Type')} *
              </label>
              <input
                type="text"
                value={formData.craftType}
                onChange={(e) => setFormData({ ...formData, craftType: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 font-medium"
                placeholder={t('addProduct.craftTypePlaceholder', 'e.g. Bankura Panchmura Pottery')}
              />
            </div>

            {/* GI Tag */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                <span>{t('addProduct.giTagVerification', 'GI Tag Verification')}</span>
                <span className="text-[10px] text-emerald-600 font-semibold">{t('addProduct.govCertified', 'Government Certified')}</span>
              </label>
              <select
                value={formData.giTag}
                onChange={(e) => setFormData({ ...formData, giTag: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 font-medium"
              >
                <option value="Bankura Terracotta (GI-452)">{t('addProduct.giBankura', 'Bankura Terracotta (GI-452)')}</option>
                <option value="Bengal Dhokra (GI-564)">{t('addProduct.giDhokra', 'Bengal Dhokra (GI-564)')}</option>
                <option value="Madhubani Painting (GI-105)">{t('addProduct.giMadhubani', 'Madhubani Painting (GI-105)')}</option>
                <option value="Shantiniketan Leather Goods (GI-86)">{t('addProduct.giShantiniketan', 'Shantiniketan Leather Goods (GI-86)')}</option>
                <option value="None / Other Traditional Craft">{t('addProduct.giNone', 'None / Other Traditional Craft')}</option>
              </select>
            </div>

            {/* Stock Quantity */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('addProduct.stockLabel', 'Stock Quantity')} *
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 font-medium"
                placeholder="15"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('addProduct.descLabel', 'Product Description')} *
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 font-medium"
                placeholder={t('addProduct.descPlaceholder', 'Describe your craft, inspiration, firing methods, dimensions...')}
              />
            </div>
          </div>

          {/* Action Button: Generate with AI */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-xs text-gray-500 hover:text-gray-900 font-medium"
            >
              {t('common.back', 'Back to Images')}
            </button>

            <button
              type="button"
              onClick={startAIWorkflow}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all duration-200"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('addProduct.proceedToAI', 'Generate with AI')}</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* STEP 3: AI PROCESSING EXPERIENCE & AUTHENTICITY CHECK */}
      {/* ==================================================== */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {/* AI Workflow Running or Completed */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200/90 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-600" />
                  <span>{t('addProduct.studioTitle', 'Karigar AI Catalog & Authenticity Studio')}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t('addProduct.studioSubtitle', 'Enhancing physical craft images, estimating fair artisan prices & evaluating authenticity signals.')}
                </p>
              </div>

              {hasAICompleted && (
                <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1 self-start sm:self-auto">
                  <CheckCircle2 className="w-4 h-4" />
                  {t('addProduct.allStepsComplete', 'All 9 Processing Steps Complete')}
                </span>
              )}
            </div>

            {/* Processing Progress Bar */}
            <div className="my-5">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-gray-700">
                  {isProcessingAI ? t('addProduct.aiProcessingStatus', 'AI Processing Craft Metadata...') : t('addProduct.processingCompleteStatus', 'Processing Complete')}
                </span>
                <span className="text-orange-600">{processingProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
            </div>

            {/* Checklist of the 9 AI steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-4">
              {aiSteps.map((step, idx) => {
                const isDone = completedSteps.includes(step) || hasAICompleted;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                      isDone
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                        : 'bg-gray-50 border-gray-200 text-gray-400'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5 text-gray-300 animate-spin flex-shrink-0" />
                    )}
                    <span className="truncate">{t(`addProduct.aiStep${idx + 1}`, step)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI GENERATED RESULT & IMAGE AUTHENTICITY CHECK */}
          {hasAICompleted && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in-50 duration-200">
              {/* Left 2 Cols: AI Generated Result */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200/90 shadow-2xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-600" />
                    <span>{t('addProduct.aiCatalogPreview', 'AI Generated Catalog Preview')}</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={startAIWorkflow}
                      className="text-xs text-gray-500 hover:text-gray-800 font-semibold flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> {t('addProduct.regenerate', 'Regenerate')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs text-gray-500 hover:text-gray-800 font-semibold flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> {t('addProduct.edit', 'Edit')}
                    </button>
                  </div>
                </div>

                {/* AI Title */}
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    {t('addProduct.aiGenTitle', 'AI Generated Title:')}
                  </span>
                  <p className="text-base font-bold text-gray-900 mt-0.5">
                    {formData.name}
                  </p>
                </div>

                {/* AI Description */}
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    {t('addProduct.aiGenDesc', 'AI Generated Description:')}
                  </span>
                  <p className="text-sm text-gray-700 mt-1 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-200">
                    {formData.description}
                  </p>
                </div>

                {/* Metadata Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                    <span className="text-gray-400 block text-[10px]">{t('addProduct.suggestedCat', 'Suggested Category:')}</span>
                    <strong className="text-gray-800">{formData.category}</strong>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                    <span className="text-gray-400 block text-[10px]">{t('addProduct.material', 'Material:')}</span>
                    <strong className="text-gray-800">{formData.material}</strong>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                    <span className="text-gray-400 block text-[10px]">{t('addProduct.origin', 'Origin:')}</span>
                    <strong className="text-gray-800">{formData.state}</strong>
                  </div>
                </div>

                {/* Suggested & Recommended Price Card */}
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/40 p-4 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-emerald-900 font-semibold">
                      {t('addProduct.priceRangeAnalysis', 'Market Price Range Analysis:')}
                    </span>
                    <p className="text-sm text-gray-600 font-medium mt-0.5">
                      {t('addProduct.suggestedPriceLabel', 'Suggested Price:')} <span className="font-bold text-gray-900">{formData.suggestedPriceRange}</span>
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-emerald-700 font-bold block">
                      {t('addProduct.recommendedListingPrice', 'Recommended Listing Price:')}
                    </span>
                    <span className="text-2xl font-black text-emerald-900">
                      {formatCurrency(formData.price, i18n.language)}
                    </span>
                  </div>
                </div>

                {/* Accept AI Suggestions button */}
                <div className="pt-3 border-t border-gray-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="px-6 py-2.5 bg-[#14532D] hover:bg-[#0f3e22] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors"
                  >
                    <span>{t('addProduct.acceptAISuggestions', 'Accept AI Suggestions & Review')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Col: IMAGE AUTHENTICITY CHECK CARD */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{t('addProduct.authenticityCheckTitle', 'Product Authenticity Check')}</span>
                  </h4>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    {t('addProduct.screenedBadge', 'Screened')}
                  </span>
                </div>

                {/* Authenticity Confidence Indicator */}
                <div className="text-center py-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80">
                  <div className="text-3xl font-black text-emerald-800">
                    92%
                  </div>
                  <p className="text-xs font-bold text-emerald-900 mt-0.5">
                    {t('addProduct.authenticityConfidence', 'Authenticity Confidence')}
                  </p>
                  <p className="text-xs font-semibold text-emerald-700 mt-1 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t('addProduct.statusLikelyAuthentic', 'Status: Likely Authentic ✓')}
                  </p>
                </div>

                {/* Signals breakdown */}
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-gray-600 mb-1">
                      <span>{t('addProduct.signalImageDetection', 'AI Image Detection')}</span>
                      <span className="font-bold text-gray-900">{t('addProduct.signalPassedNatural', 'Passed (Natural)')}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '96%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-gray-600 mb-1">
                      <span>{t('addProduct.signalDuplicateCheck', 'Duplicate Image Check')}</span>
                      <span className="font-bold text-gray-900">{t('addProduct.signal0MatchesOriginal', '0 Matches (Original)')}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-gray-600 mb-1">
                      <span>{t('addProduct.signalManipulationCheck', 'Image Manipulation Check')}</span>
                      <span className="font-bold text-gray-900">{t('addProduct.signalCleanNoEdits', 'Clean (No Edits)')}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-gray-600 mb-1">
                      <span>{t('addProduct.signalConsistency', 'Image/Product Consistency')}</span>
                      <span className="font-bold text-gray-900">{t('addProduct.signal94Match', '94% Match')}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94%' }} />
                    </div>
                  </div>
                </div>

                {/* Transparency Note */}
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-snug flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p>
                    {t('addProduct.transparencyNote', '“Multiple signals are used to estimate image authenticity. AI detection estimates probability based on sensor patterns and physical light scattering.”')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* STEP 4: REVIEW & PUBLISH */}
      {/* ==================================================== */}
      {currentStep === 4 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200/90 shadow-2xs space-y-6">
          <div className="pb-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-gray-900">{t('addProduct.step4Title', 'Step 4 — Review & Publish')}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {t('addProduct.step4Subtitle', 'Inspect your final marketplace listing, verified credentials, and escrow protection details.')}
              </p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
              {t('addProduct.readyForBuyers', 'Ready for Global Buyers')}
            </span>
          </div>

          {/* Final Product Preview Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200/90 rounded-2xl p-5 bg-[#FAF9F6]">
            {/* Image Preview */}
            <div className="space-y-2">
              <img
                src={categoryImage(formData) || uploadedImages[selectedImageIndex] || sampleCraftUploads[0].url}
                alt={formData.name}
                className="w-full h-64 object-cover rounded-xl border border-gray-200 shadow-xs"
              />
              <div className="p-2 bg-white rounded-lg border border-gray-200 text-center">
                <span className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  {t('addProduct.aiEnhancedLighting', 'AI Enhanced & Lighting Normalized')}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                  {formData.category} • {formData.craftType}
                </span>
                <h2 className="text-xl font-bold text-gray-900 mt-1">
                  {formData.name}
                </h2>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {profile.location}
                  </span>
                  <span>•</span>
                  <span>{t('addProduct.artisanLabel', 'Artisan:')} <strong>{profile.name}</strong></span>
                  <span>•</span>
                  <span className="font-bold text-purple-700">{t('addProduct.trustScore', 'Trust Score: 4.8 / 5')}</span>
                </div>
              </div>

              {/* Price & Stock */}
              <div className="flex items-baseline gap-3 p-3 bg-white rounded-xl border border-gray-200">
                <span className="text-3xl font-black text-gray-900">
                  {formatCurrency(formData.price, i18n.language)}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  {formatCurrency(Math.round(Number(formData.price) * 1.25), i18n.language)}
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {t('addProduct.unitsInWorkshop', '{{count}} units ready in workshop', { count: formData.stock })}
                </span>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  {t('addProduct.craftStoryLabel', 'Craft Story & Details:')}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed bg-white p-3 rounded-xl border border-gray-200">
                  {formData.description}
                </p>
              </div>

              {/* Verification Badges */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  {t('addProduct.includedBadges', 'Included Verification Badges:')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  <TrustBadge type="verified_artisan" label={t('addProduct.badgeIdentityVerified', 'Identity Verified')} size="sm" />
                  <TrustBadge type="gi_verified" label={t('addProduct.badgeGIVerified', 'GI Verified (GI-452)')} size="sm" />
                  <TrustBadge type="authentic_image" label={t('addProduct.badgeAuthenticImage', 'Authentic Image (92%)')} size="sm" />
                  <TrustBadge type="verified_cluster" label={t('addProduct.badgeClusterVerified', 'Cluster Verified')} size="sm" />
                  <TrustBadge type="process_proof" label={t('addProduct.badgeProcessProof', 'Process Proof')} size="sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons: Save as Draft & Publish Product */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="text-xs text-gray-500 hover:text-gray-900 font-medium"
            >
              {t('addProduct.backToAI', 'Back to AI Suggestions')}
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  addProduct({
                    name: formData.name,
                    category: formData.category,
                    price: Number(formData.price),
                    stock: Number(formData.stock),
                    status: 'Draft',
                    image: uploadedImages[selectedImageIndex] || sampleCraftUploads[0].url,
                    description: formData.description
                  });
                  navigate('/seller/products');
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl border border-gray-300 transition-colors"
              >
                {t('addProduct.saveDraft', 'Save as Draft')}
              </button>

              <button
                type="button"
                onClick={handlePublish}
                className="w-full sm:w-auto px-7 py-2.5 bg-[#14532D] hover:bg-[#0f3e22] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('addProduct.publishButton', 'Publish Product')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
