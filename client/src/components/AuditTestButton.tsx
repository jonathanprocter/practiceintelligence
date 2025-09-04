import React from 'react';
import { Button } from '@/components/ui/Button';
import { CalendarEvent } from '../types/calendar';

interface AuditTestButtonProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onTestComplete: (results: unknown) => void;
}

export default function AuditTestButton({ events, selectedDate, onTestComplete }: AuditTestButtonProps) {
  
  const runAuditTest = async () => {
    console.log('🔍 STARTING COMPREHENSIVE PIXEL-PERFECT AUDIT TEST');
    console.log('='.repeat(80));
    
    try {
      // Import the audit system
      const { runPixelPerfectAudit, logExportAudit } = await import('../utils/exportAudit');
      
      // Filter events for the selected date
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.startTime);
        return eventDate.toDateString() === selectedDate.toDateString();
      });
      
      console.log(`📅 TESTING DATE: ${selectedDate.toDateString()}`);
      console.log(`📊 DASHBOARD EVENTS: ${events.length} total, ${dayEvents.length} for selected date`);
      
      // Run the comprehensive audit
      const auditResults = runPixelPerfectAudit(
        events,
        dayEvents,
        selectedDate,
        'daily'
      );
      
      // Log the detailed results
      logExportAudit(auditResults.auditReport, 'DAILY TEST EXPORT');
      
      // Show comprehensive analysis
      console.log('🎯 COMPREHENSIVE PIXEL-PERFECT ANALYSIS:');
      console.log(`   📊 Overall Score: ${auditResults.pixelPerfectScore}/100`);
      console.log(`   🔍 Data Integrity: ${auditResults.auditReport.dataIntegrityScore.toFixed(1)}%`);
      console.log(`   📐 Grid Alignment: ${auditResults.gridValidation.isValid ? 'VALID ✅' : 'INVALID ❌'}`);
      console.log(`   🎯 Event Count Match: ${auditResults.auditReport.missingEvents.length === 0 ? 'PERFECT ✅' : 'MISMATCH ❌'}`);
      
      // Show unified event data details
      console.log('\n📋 UNIFIED EVENT DATA ANALYSIS:');
      auditResults.unifiedData.forEach((eventData, index) => {
        console.log(`   Event ${index + 1}: "${eventData.displayTitle}"`);
        console.log(`     - Source: ${eventData.sourceType}`);
        console.log(`     - Grid Position: Slot ${eventData.gridPosition.startSlot} → ${eventData.gridPosition.endSlot}`);
        console.log(`     - Duration: ${eventData.gridPosition.duration} slots`);
        console.log(`     - Has Notes: ${eventData.hasNotes ? 'YES' : 'NO'}`);
        console.log(`     - Has Action Items: ${eventData.hasActionItems ? 'YES' : 'NO'}`);
        console.log(`     - Background Color: ${eventData.styling.backgroundColor}`);
        console.log(`     - Border: ${eventData.styling.borderStyle} ${eventData.styling.borderColor}`);
      });
      
      // Show export configuration
      console.log('\n⚙️ EXPORT CONFIGURATION:');
      console.log(`   📄 Layout: ${auditResults.exportConfig.layout.pageOrientation} ${auditResults.exportConfig.layout.pageSize}`);
      console.log(`   📏 Time Slot Height: ${auditResults.exportConfig.gridConfig.timeSlotHeight}px`);
      console.log(`   📐 Time Column Width: ${auditResults.exportConfig.gridConfig.timeColumnWidth}px`);
      console.log(`   🎨 3-Column Layout: ${auditResults.exportConfig.layout.use3ColumnLayout ? 'YES' : 'NO'}`);
      console.log(`   🔤 Font Sizes: Title ${auditResults.exportConfig.styling.fontSize.title}pt, Events ${auditResults.exportConfig.styling.fontSize.eventTitle}pt`);
      
      // Grid validation details
      if (auditResults.gridValidation.issues.length > 0) {
        console.log('\n⚠️ GRID ALIGNMENT ISSUES:');
        auditResults.gridValidation.issues.forEach(issue => {
          console.log(`   - ${issue}`);
        });
      }
      
      // Final assessment
      console.log('\n🏆 FINAL ASSESSMENT:');
      if (auditResults.pixelPerfectScore >= 95) {
        console.log('✅ PIXEL-PERFECT MATCH ACHIEVED');
        console.log('   PDF export will match dashboard exactly');
      } else if (auditResults.pixelPerfectScore >= 85) {
        console.log('⚠️ GOOD MATCH WITH MINOR DIFFERENCES');
        console.log('   PDF export will closely match dashboard');
      } else {
        console.log('❌ SIGNIFICANT ISSUES DETECTED');
        console.log('   PDF export may not match dashboard accurately');
      }
      
      console.log('='.repeat(80));
      console.log('🔍 PIXEL-PERFECT AUDIT TEST COMPLETE');
      
      onTestComplete(auditResults);
      
    } catch (error) {
      console.error('❌ Audit test failed:', error);
    }
  };
  
  return (
    <Button 
      onClick={runAuditTest}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
    >
      🔍 Test Pixel-Perfect Audit
    </Button>
  );
}