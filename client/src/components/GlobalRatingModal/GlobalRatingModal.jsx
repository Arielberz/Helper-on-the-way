import React from 'react';
import { useRating } from '../../context/RatingContext';
import RatingModal from '../RatingModal/RatingModal';

const GlobalRatingModal = () => {
  const { showRatingModal, requestToRate, closeRatingModal } = useRating();

  const handleSuccess = () => {
    closeRatingModal();
    // Optionally show a success message
    alert('✅ תודה על הדירוג!');
    // Refresh to update profile data
    window.location.reload();
  };

  if (!showRatingModal || !requestToRate) {
    return null;
  }

  return (
    <RatingModal
      requestId={requestToRate._id}
      helperName={requestToRate.helper?.username || requestToRate.helper?.name || 'Helper'}
      onClose={closeRatingModal}
      onSubmitSuccess={handleSuccess}
    />
  );
};

export default GlobalRatingModal;
