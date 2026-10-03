import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { prepareQrImage } from './upi';
import api from '../services/api';

export function useQrUpload() {
  const { user, refreshUser } = useAuth();
  const [qrPreview, setQrPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [qrError, setQrError] = useState('');

  // The stored QR is never embedded in UserDto, so fetch it as an authenticated
  // blob once the profile says one exists.
  useEffect(() => {
    let revoked = null;
    if (!user?.hasUpiQr) return undefined;

    api.get('/payment/qr/mine', { responseType: 'blob' })
      .then((blob) => {
        if (blob instanceof Blob && blob.size > 0) {
          revoked = URL.createObjectURL(blob);
          setQrPreview(revoked);
        }
      })
      .catch(() => {});

    return () => { if (revoked) URL.revokeObjectURL(revoked); };
  }, [user?.hasUpiQr]);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setQrError('');
    setUploading(true);
    try {
      const prepared = await prepareQrImage(file);
      setQrPreview(URL.createObjectURL(prepared));

      const formData = new FormData();
      formData.append('image', prepared);
      const res = await api.post('/payment/qr', formData);
      if (!res.success) {
        setQrPreview('');
        setQrError('Could not upload that QR code');
        return;
      }
      await refreshUser();
    } catch (err) {
      setQrPreview('');
      setQrError(err.message || 'Could not upload that QR code');
    } finally {
      setUploading(false);
    }
  };

  const removeQr = async () => {
    setQrError('');
    try {
      await api.delete('/payment/qr');
      setQrPreview('');
      await refreshUser();
    } catch (err) {
      setQrError(err.message || 'Could not remove the QR code');
    }
  };

  return { qrPreview, uploading, qrError, setQrError, handleFile, removeQr };
}