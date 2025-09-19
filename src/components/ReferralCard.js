import React, { useState, useEffect } from 'react';
import { FiUsers, FiCopy, FiShare2 } from 'react-icons/fi';

const ReferralCard = () => {
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    // Generate or retrieve referral code from localStorage
    const storedCode = localStorage.getItem('userReferralCode');
    if (storedCode) {
      setReferralCode(storedCode);
    } else {
      // Generate a new referral code if none exists
      const newCode = generateReferralCode();
      localStorage.setItem('userReferralCode', newCode);
      setReferralCode(newCode);
    }

    // Get referral count from localStorage
    const referrals = JSON.parse(localStorage.getItem('referralTracking') || '[]');
    const userCode = localStorage.getItem('userReferralCode');
    const userReferrals = referrals.filter(ref => ref.code === userCode);
    setReferralCount(userReferrals.length);
  }, []);


  // hapa shida iko 
  const generateReferralCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const copyToClipboard = () => {
    const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    const shareData = {
      title: 'Join me on RPL System',
      text: `Use my referral code ${referralCode} to sign up and get started!`,
      url: `${window.location.origin}/signup?ref=${referralCode}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support Web Share API
        copyToClipboard();
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6 border border-blue-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FiUsers className="mr-2 text-blue-600" />
          Your Referral Program
        </h3>
        <div className="flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          <span className="w-2 h-2 mr-1.5 bg-blue-600 rounded-full"></span>
          Active
        </div>
      </div>
      
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-4">
          Share your referral link with friends and earn rewards when they sign up!
        </p>
        
        <div className="mb-4">
          <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-200">
            <span className="text-sm font-mono text-gray-700 truncate pr-2">
              {referralLink}
            </span>
            <button
              onClick={copyToClipboard}
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              title="Copy to clipboard"
            >
              <FiCopy className="h-4 w-4" />
            </button>
          </div>
          {copied && (
            <p className="text-xs text-green-600 mt-1">Copied to clipboard!</p>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={copyToClipboard}
            className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
          
            <FiCopy className="mr-2 h-4 w-4" />
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        


          <button
            onClick={shareLink}
            className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiShare2 className="mr-2 h-4 w-4" />
            Share
          </button>
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Referrals</p>
            <p className="text-2xl font-bold text-gray-900">{referralCount}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-500">Your Code</p>
            <p className="text-lg font-mono font-bold text-blue-600">{referralCode}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralCard;
