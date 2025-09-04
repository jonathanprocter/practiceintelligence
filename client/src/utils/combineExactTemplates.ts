import { CalendarEvent } from '../types/calendar';
import { exportCurrentWeeklyView } from './currentWeeklyExport';
import { exportBrowserReplicaPDF } from './browserReplicaPDF';

/**
 * COMBINE EXACT TEMPLATES INTO SINGLE PDF
 * This function calls the EXACT existing template functions as-is
 * NOTE: The original functions save PDFs directly to the user's downloads
 */
export const combineExactTemplatesIntoBidirectionalPDF = async (
  events: CalendarEvent[],
  weekStart: Date
): Promise<string> => {
// console.log('🎯 CALLING EXACT TEMPLATES - GENERATING 8 SEPARATE PDFs...');
// console.log('⚠️ NOTE: The EXACT templates save individual PDFs directly');
// console.log('📄 You will get 8 separate PDF files that can be manually combined');
  
  try {
    // Setup week dates
    const normalizedWeekStart = new Date(weekStart);
    normalizedWeekStart.setHours(0, 0, 0, 0);
    const normalizedWeekEnd = new Date(weekStart);
    normalizedWeekEnd.setDate(weekStart.getDate() + 6);
    normalizedWeekEnd.setHours(23, 59, 59, 999);

// console.log('📄 Step 1: Calling EXACT exportCurrentWeeklyView function...');
    await exportCurrentWeeklyView(normalizedWeekStart, normalizedWeekEnd, events);
// console.log('✅ Weekly PDF saved to downloads');

// console.log('📄 Step 2: Calling EXACT exportBrowserReplicaPDF for each day...');
    const currentDate = new Date(normalizedWeekStart);
    
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
// console.log(`📄 Calling EXACT exportBrowserReplicaPDF for ${dayName}...`);
      
      await exportBrowserReplicaPDF(currentDate, events);
// console.log(`✅ ${dayName} PDF saved to downloads`);
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

// console.log('✅ EXACT TEMPLATES CALLED - 8 PDFs generated');
// console.log('📄 Check your downloads folder for:');
// console.log('   - 1 weekly overview PDF (landscape)');
// console.log('   - 7 daily planner PDFs (portrait)');
// console.log('📝 These can be manually combined using a PDF editor');
    
    return `8 PDFs generated using EXACT templates`;
  } catch (error) {
    console.error('❌ Error calling EXACT templates:', error);
    throw error;
  }
};