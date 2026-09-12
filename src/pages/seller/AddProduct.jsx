import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import useProductPublish from '../../components/add-product/useProductPublish.js';
import { publishIssues } from '../../utils/productApi.js';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import useProductDraft from '../../components/add-product/useProductDraft.js';
import ProductMediaStep from '../../components/add-product/ProductMediaStep.jsx';
import ProductDetailsStep from '../../components/add-product/ProductDetailsStep.jsx';
import VerificationStep from '../../components/add-product/VerificationStep.jsx';
import ReviewPublishStep from '../../components/add-product/ReviewPublishStep.jsx';
import { currentAnalysis } from '../../utils/craftVerification.js';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../utils/formatters.js';
import { STEPS, verificationInputs } from '../../utils/productDraft.js';

export default function AddProduct() {
  const { t, i18n } = useTranslation();
  const model=useProductDraft();
  const [step,setStep]=useState(0),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const auth=useAuth();
  const publishing=useProductPublish(model.draft,auth?.token);
  const locked=publishing.status==='publishing'||busy||model.draft.verification?.status==='running';
  function next() {
    if(!model.draft.media.productImages.length){setError(t('addProduct.addAtLeastPhoto'));return;}
    const {price,stock}=model.draft.details;
    if(step===1&&((price!==''&&(!Number.isFinite(Number(price))||Number(price)<=0))||(stock!==''&&(!Number.isInteger(Number(stock))||Number(stock)<0)))){
      setError(t('addProduct.priceStockError'));return;
    }
    setError('');setStep(s=>Math.min(3,s+1));
  }
  if(publishing.status==='success')return (
    <section className="rounded-2xl bg-seller-card border p-6 space-y-4">
      <h1 className="text-2xl font-bold">{t('addProduct.publishedSuccess')}</h1>
      <p>{t('addProduct.listingAvailable')}</p>
      <a href="/seller/products" className="inline-block rounded-xl bg-seller-accent text-white px-5 py-3">
        {t('addProduct.goToProducts')}
      </a>
    </section>
  );
  return (
    <div className="space-y-6 min-w-0 text-gray-900 dark:text-gray-100">
      <header className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-seller-card p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-seller-accent-ink">{t('addProduct.craftYourStory')}</p>
        <h1 className="mt-1 text-2xl font-bold">{t('addProduct.addProduct')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('addProduct.prepareSteps')}</p>
      </header>
      <nav aria-label={t('addProduct.addProduct')} className="grid grid-cols-2 md:grid-cols-4 gap-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-seller-card p-3 sm:p-4">
        {STEPS.map((label,index)=>(
          <button key={label} type="button" disabled={locked||index>step} aria-current={index===step?'step':undefined}
            onClick={()=>{setError('');setStep(index);}}
            className={`min-h-16 flex items-center gap-2 rounded-xl p-3 text-left text-xs sm:text-sm font-semibold ${index===step?'bg-seller-accent-soft text-seller-accent-ink':index<step?'text-emerald-800 dark:text-emerald-400':'text-gray-400'}`}>
            <span className={`shrink-0 rounded-full w-7 h-7 flex items-center justify-center ${index===step?'bg-seller-accent text-white':'bg-seller-muted'}`}>
              {formatNumber(index+1, i18n.language)}
            </span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
      {step===0&&<ProductMediaStep model={model} busy={busy} onBusy={setBusy}/>}
      {step===1&&<ProductDetailsStep details={model.draft.details} voice={model.draft.voice} onGenerated={model.applyVoice} onBusy={setBusy} onChange={model.details}/>}
      {step===2&&<VerificationStep draft={model.draft} onRun={model.analyze} onEditMedia={()=>setStep(0)} onEditDetails={()=>setStep(1)}/>}
      {step===3&&<ReviewPublishStep draft={model.draft} inputs={verificationInputs(model.draft)} onEdit={setStep} busy={locked}/>}
      {error&&<p role="alert" className="text-sm text-red-700 dark:text-red-400 rounded-xl bg-red-50 dark:bg-red-950/40 p-3">{error}</p>}
      {publishing.status==='error'&&<p role="alert" className="rounded-xl bg-seller-accent-soft p-4">{publishing.error} {t('addProduct.publishError')}</p>}
      <footer className="flex flex-col sm:flex-row sm:justify-between gap-3 pb-6">
        <button type="button" disabled={step===0||locked} onClick={()=>{setError('');setStep(s=>s-1);}} className="min-h-11 inline-flex items-center gap-2 rounded-xl border border-gray-300 dark:border-gray-600 px-5 py-3 text-sm font-semibold disabled:opacity-40">
          <ArrowLeft size={16}/>{t('common.back', 'Back')}
        </button>
        {step<2&&<button type="button" disabled={busy} onClick={next} className="min-h-11 inline-flex items-center gap-2 rounded-xl bg-seller-accent text-white px-5 py-3 text-sm font-semibold disabled:opacity-50">
          {t('common.next', 'Continue')}<ArrowRight size={16}/>
        </button>}
        {step===2&&<button type="button" disabled={locked||!currentAnalysis(model.draft)} onClick={()=>setStep(3)} className="min-h-11 inline-flex justify-center items-center gap-2 rounded-xl bg-seller-accent text-white px-5 py-3 font-semibold disabled:opacity-50">
          {t('addProduct.continueReview', 'Continue to Review')}<ArrowRight size={16}/>
        </button>}
        {step===3&&<button type="button" disabled={locked||publishIssues(model.draft).length>0} onClick={publishing.publish} className="min-h-11 rounded-xl bg-seller-accent text-white px-5 py-3 font-semibold disabled:opacity-50">
          {publishing.status==='publishing'?t('addProduct.publishing', 'Publishing product...'):t('addProduct.publishButton', 'Publish Product')}
        </button>}
      </footer>
    </div>
  );
}

