import { useCallback, useEffect, useState } from 'react';
import { listProducts,productMediaUrl } from '../utils/productApi.js';
import { normalizeCraftCategory } from '../constants/craftCategories.js';
export default function useSellerProducts(token) {
  const [loaded,setLoaded]=useState({token:null,products:[],error:''});
  const [revision,setRevision]=useState(0);
  const refreshProducts=useCallback(()=>setRevision(value=>value+1),[]);
  useEffect(()=>{window.addEventListener('karigar-products-changed',refreshProducts);return()=>window.removeEventListener('karigar-products-changed',refreshProducts);},[refreshProducts]);
  useEffect(()=>{
    if(!token)return;
    let active=true;
    listProducts(token).then(data=>{if(active)setLoaded({token,error:'',products:data.products.map(p=>({...p,
      name:p.title,category:normalizeCraftCategory(p.category),origin:p.region,persisted:true,
      status:p.stock?'Active':'Out of Stock',image:productMediaUrl(p.media.images[p.media.primaryImageIndex])}))});})
      .catch(()=>{if(active)setLoaded({token,products:[],error:'Could not load your products. Refresh to try again.'});});
    return()=>{active=false;};
  },[token,revision]);
  return {products:token&&loaded.token===token?loaded.products:[],productsLoading:!!token&&loaded.token!==token,
    productsError:loaded.token===token?loaded.error:'',refreshProducts};
}
