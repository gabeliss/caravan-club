if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: './backend/.env.local' }); // Adjust path if needed
}

const { runManualTest, formatTestResults, sendEmailReport } = require('./test_payment_routes');

(async () => {
  const parallel = true; // Set to false for sequential execution
  try {
    console.log('Running local tests...');
    
    // Run the manual test
    const { results, totalDuration } = await runManualTest(parallel);
    console.log('Test Results:', results);
    console.log('Total Duration:', totalDuration);

    // Format the results into an HTML report
    const htmlReport = formatTestResults(results, totalDuration);

    // Send the email report
    await sendEmailReport(htmlReport);

    console.log('Local test completed and email sent.');
  } catch (error) {
    console.error('Error during local test execution:', error);
  }
})();
