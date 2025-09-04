// Direct click test for bidirectional export
// console.log('🎯 Direct click test for bidirectional export...');

// Navigate to weekly view first if needed
const viewTitle = document.querySelector('h2')?.textContent;
if (viewTitle && viewTitle.includes('Tuesday')) {
// console.log('📅 Currently in daily view, switching to weekly...');
  const weeklyBtn = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent.includes('Weekly Overview')
  );
  if (weeklyBtn) {
    weeklyBtn.click();
// console.log('✅ Clicked Weekly Overview button');
    // Wait for navigation
    setTimeout(findAndClickBidirectional, 1000);
  } else {
    findAndClickBidirectional();
  }
} else {
  findAndClickBidirectional();
}

function findAndClickBidirectional() {
// console.log('\n🔍 Looking for Bidirectional Weekly Package button...');
  
  // Find all buttons with the specific text
  const allButtons = Array.from(document.querySelectorAll('button'));
  const bidirectionalButton = allButtons.find(btn => 
    btn.textContent.includes('Bidirectional Weekly Package')
  );
  
  if (bidirectionalButton) {
// console.log('✅ Found button:', bidirectionalButton.textContent.trim());
// console.log('📍 Button classes:', bidirectionalButton.className);
    
    // Add event listeners to track what happens
    window.addEventListener('error', (e) => {
      console.error('❌ Window error during export:', e.message, e);
    });
    
    window.addEventListener('unhandledrejection', (e) => {
      console.error('❌ Unhandled rejection during export:', e.reason);
    });
    
    // Override console methods to capture all logs
// const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
// console.log = function(...args) {
      originalLog.apply(console, args);
      const msg = args.join(' ');
      if (msg.includes('UNIFIED') || msg.includes('EXACT') || msg.includes('export') || msg.includes('PDF')) {
        originalLog('📌 EXPORT LOG:', msg);
      }
    };
    
    console.error = function(...args) {
      originalError.apply(console, args);
      originalError('📌 EXPORT ERROR:', args.join(' '));
    };
    
    console.warn = function(...args) {
      originalWarn.apply(console, args);
      originalWarn('📌 EXPORT WARNING:', args.join(' '));
    };
    
// console.log('🖱️ Clicking button NOW...');
    bidirectionalButton.click();
// console.log('✅ Button clicked!');
    
    // Monitor for 5 seconds
    setTimeout(() => {
// console.log('\n📊 Export monitoring complete');
// console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    }, 5000);
    
  } else {
// console.log('❌ Could not find Bidirectional Weekly Package button');
// console.log('Available buttons:');
    allButtons.forEach((btn, i) => {
      if (btn.textContent.trim() && btn.textContent.includes('export')) {
// console.log(`  ${i}. "${btn.textContent.trim()}"`);
      }
    });
  }
}