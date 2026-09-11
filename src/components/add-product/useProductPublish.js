import { useRef, useState } from 'react';
import { publishProduct } from '../../utils/productApi.js';
export default function useProductPublish(draft,token) {
  const [state,setState]=useState({status:'idle'}),pending=useRef(false),attempt=useRef(null);
  async function publish(){
    if(pending.current||state.status==='success')return;
    pending.current=true;setState({status:'publishing'});
    if(attempt.current?.draft!==draft)attempt.current={draft,key:crypto.randomUUID()};
    try {
      const result=await publishProduct(draft,attempt.current.key,token);
      if(!result?.product?.id)throw new Error('The server did not confirm publication. Please retry.');
      setState({status:'success',product:result.product});
    }catch(error){console.error('[KARIGAR publish]',error);setState({status:'error',error:error.message});}
    finally{pending.current=false;}
  }
  return {...state,publish};
}
