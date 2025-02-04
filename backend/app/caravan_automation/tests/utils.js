const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const routesConfig = require('./routes');

const generateRandomDates = () => {
  const startMin = new Date('2025-05-25');
  const startMax = new Date('2025-08-28');
  const randomStart = new Date(startMin.getTime() + Math.random() * (startMax.getTime() - startMin.getTime()));
  // const randomStart = new Date('2025-06-08T00:00:00'); // Add time to avoid timezone issues
  
  // const stayDuration = Math.random() < 0.5 ? 1 : 2; // Randomly choose 1 or 2 days
  const stayDuration = 2;
  const randomEnd = new Date(randomStart);
  randomEnd.setDate(randomStart.getDate() + stayDuration);

  return {
    startDate: randomStart.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit'
    }),
    endDate: randomEnd.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit', 
      year: '2-digit'
    }),
  };
};

const generateRandomGuests = () => {
  const maxTotal = 5;
  const numAdults = Math.floor(Math.random() * 5) + 1; // 1-5 adults
  const maxKids = Math.min(4, maxTotal - numAdults); // Ensure total doesn't exceed 6
  const numKids = maxKids > 0 ? Math.floor(Math.random() * (maxKids + 1)) : 0; // 0-5 kids, or 0 if no room
  return { numAdults, numKids };
  // return { numAdults: 2, numKids: 1 };
};

const siteConfig = {
  timberRidgeTent: { taxRate: 0, fixedFee: 3 },
  leelanauPinesTent: { taxRate: 0, fixedFee: -0.01 },
  indianRiverTent: { taxRate: 0, fixedFee: 0 },
  teePeeCampgroundTent: { taxRate: 0.12, fixedFee: 0 },
  uncleDuckysTent: { taxRate: 0.07, fixedFee: 0 },
  touristParkTent: { taxRate: 0, fixedFee: 0 },
  fortSuperiorTent: { taxRate: 0.05, fixedFee: 0 },
  whiteWaterParkTent: { taxRate: 0, fixedFee: 8 }
};

const formatTestResults = (results, type, numNights) => {
  let html = '<table border="1" style="border-collapse: collapse; width: 100%;">';
  let totalDuration = 0;
  
  // Format route name helper function
  const formatRouteName = (name) => {
    return name.split(/(?=[A-Z])/).map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (type === 'scraper') {
    html += `
      <tr>
        <th>Route</th>
        <th>Status</th>
        <th>Duration (s)</th>
        <th>Base Price Per Night</th>
        <th>Total Base Price</th>
        <th>Total Taxes/Fees</th>
        <th>Total</th>
        <th>Message</th>
      </tr>
    `;
    results.forEach((result) => {
      totalDuration += parseFloat(result.duration) || 0;
      let basePricePerNight = 'N/A';
      let basePriceTotal = 'N/A';
      let taxesTotal = 'N/A';
      let total = 'N/A';
      let errorMessage = result.error || '';

      if (result.data?.available !== false) {
        basePricePerNight = result.data?.price || 0;
        basePriceTotal = basePricePerNight * numNights;
        const siteName = result.routeName.split('_')[0];
        const { taxRate, fixedFee } = siteConfig[siteName] || { taxRate: 0, fixedFee: 0 };
        taxesTotal = (basePriceTotal * taxRate) + fixedFee;
        total = basePriceTotal + taxesTotal;
        
        basePricePerNight = `$${basePricePerNight.toFixed(2)}`;
        basePriceTotal = `$${basePriceTotal.toFixed(2)}`;
        taxesTotal = `$${taxesTotal.toFixed(2)}`;
        total = `$${total.toFixed(2)}`;
      } else if (result.data?.message) {
        errorMessage = result.data.message;
      }

      html += `
        <tr>
          <td>${formatRouteName(result.routeName)}</td>
          <td style="color: ${result.status === 'SUCCESS' ? 'green' : 'red'}">${result.status}</td>
          <td>${(parseFloat(result.duration) / 1000).toFixed(2)}</td>
          <td>${basePricePerNight}</td>
          <td>${basePriceTotal}</td>
          <td>${taxesTotal}</td>
          <td>${total}</td>
          <td style="color: red">${errorMessage}</td>
        </tr>
      `;
    });
  } else {
    html += `
      <tr>
        <th>Route</th>
        <th>Payment Status</th>
        <th>Duration (s)</th>
        <th>Base Price</th>
        <th>Tax</th>
        <th>Total</th>
        <th>Error</th>
      </tr>
    `;
    results.forEach((result) => {
      totalDuration += parseFloat(result.duration) || 0;
      const data = result.data || {};
      html += `        <tr>
          <td>${formatRouteName(result.routeName)}</td>
          <td style="color: ${data.payment_successful ? 'green' : 'red'}">${data.payment_successful ? 'Success' : 'Failed'}</td>
          <td>${result.duration ? (parseFloat(result.duration) / 1000).toFixed(2) : 'N/A'}</td>
          <td>${data.base_price ? `$${data.base_price.toFixed(2)}` : 'N/A'}</td>
          <td>${data.tax ? `$${data.tax.toFixed(2)}` : 'N/A'}</td>
          <td>${data.total ? `$${data.total.toFixed(2)}` : 'N/A'}</td>
          <td style="color: red">${result.error || ''}</td>
        </tr>
      `;
    });

    // Add rows for skipped payer tests
    const allPayerRoutes = routesConfig.payers;
    const testedRoutes = results.map(r => r.routeName);
    const skippedRoutes = allPayerRoutes.filter(route => !testedRoutes.includes(route));
    
    skippedRoutes.forEach(route => {
      html += `
        <tr>
          <td>${formatRouteName(route)}</td>
          <td style="color: gray">SKIPPED</td>
          <td>N/A</td>
          <td>N/A</td>
          <td>N/A</td>
          <td>N/A</td>
          <td style="color: gray">Skipped due to unavailable from scraper</td>
        </tr>
      `;
    });
  }
  
  html += '</table>';
  return html;
};

const sendEmailReport = async (htmlContent) => {
  const msg = {
    to: process.env.ADMIN_EMAIL,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: `Automation Test Report - ${new Date().toLocaleDateString()}`,
    html: htmlContent
  };

  try {
    await sgMail.send(msg);
    console.log('Email report sent successfully.');
  } catch (error) {
    console.error('Error sending email report:', error);
  }
};

module.exports = { formatTestResults, sendEmailReport, generateRandomDates, generateRandomGuests };
