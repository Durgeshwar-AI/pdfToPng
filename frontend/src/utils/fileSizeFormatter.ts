// File size formatting utility
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  if (!bytes) return 'N/A';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Calculate percentage saved
export const calculateSavedPercentage = (originalBytes, convertedBytes) => {
  if (!originalBytes || !convertedBytes || originalBytes === 0) return 0;
  const saved = originalBytes - convertedBytes;
  return (saved / originalBytes) * 100;
};
