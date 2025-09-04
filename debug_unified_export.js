// Debug script to identify console errors in unified bidirectional export
// Run this in the browser console to identify issues

const debugUnifiedExport = async () => {
// console.log('🔧 DEBUGGING UNIFIED BIDIRECTIONAL EXPORT');
// console.log('==========================================');
  
  try {
    // Test 1: Check if module can be imported
// console.log('🧪 Test 1: Checking module import...');
    const module = await import('/client/src/utils/unifiedBidirectionalExport.ts');
// console.log('✅ Module imported successfully');
// console.log('Available exports:', Object.keys(module));
    
    // Test 2: Check if export function exists
// console.log('🧪 Test 2: Checking export function...');
    const { exportUnifiedBidirectionalWeeklyPackage } = module;
    if (typeof exportUnifiedBidirectionalWeeklyPackage === 'function') {
// console.log('✅ Export function found and is callable');
    } else {
      console.error('❌ Export function not found or not a function');
      return;
    }
    
    // Test 3: Get sample events
// console.log('🧪 Test 3: Getting sample events...');
    const response = await fetch('/api/events');
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    const events = await response.json();
// console.log(`✅ Got ${events.length} events from API`);
    
    // Test 4: Prepare date
// console.log('🧪 Test 4: Preparing week start date...');
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (today.getDay() + 6) % 7);
    monday.setHours(0, 0, 0, 0);
// console.log(`✅ Week start: ${monday.toDateString()}`);
    
    // Test 5: Try calling the function but catch errors
// console.log('🧪 Test 5: Attempting export (catching errors)...');
    try {
      const result = await exportUnifiedBidirectionalWeeklyPackage(events.slice(0, 10), monday);
// console.log('✅ Export completed successfully:', result);
    } catch (exportError) {
      console.error('❌ Export failed with error:', exportError);
      console.error('Error name:', exportError.name);
      console.error('Error message:', exportError.message);
      console.error('Error stack:', exportError.stack);
      
      // Additional debugging
      if (exportError.message.includes('jsPDF')) {
// console.log('🔍 jsPDF-related error detected');
      }
      if (exportError.message.includes('link')) {
// console.log('🔍 Link-related error detected');
      }
      if (exportError.message.includes('addPage')) {
// console.log('🔍 Page-related error detected');
      }
    }
    
  } catch (error) {
    console.error('❌ Debug test failed:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
  }
};

// Run the debug test
debugUnifiedExport();