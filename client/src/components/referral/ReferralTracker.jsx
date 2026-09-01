import { useState, useEffect } from 'react';
import { trackReferral } from '../../api';

export default function ReferralTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      trackReferral({ referralCode: ref }).catch(() => {});
      localStorage.setItem('ritaReferral', ref);
    }
  }, []);

  return null;
}
