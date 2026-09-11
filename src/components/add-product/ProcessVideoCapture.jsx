import React from 'react';
import ProductVideoUpload from './ProductVideoUpload.jsx';
// CameraCapture uses the existing Stage 13 LiveCapture controller in provenance mode.
export default function ProcessVideoCapture(props) { return <ProductVideoUpload {...props} process />; }
