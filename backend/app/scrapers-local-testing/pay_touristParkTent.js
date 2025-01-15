const puppeteer = require('puppeteer');

const STATE_MAPPING = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
    'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
};

async function payTouristParkTent(startDate, endDate, numAdults, numKids, paymentInfo) {
  const responseData = {
    base_price: 0,
    tax: 0,
    total: 0,
    payment_successful: false,
  };

  // Format dates
  const startDateFormatted = new Date(startDate).toISOString().split('T')[0];
  const endDateFormatted = new Date(endDate).toISOString().split('T')[0];
  
  const url = `https://www.campspot.com/book/munisingtouristparkcampground/search/${startDateFormatted}/${endDateFormatted}/guests${numKids},${numAdults},0/list?campsiteCategory=Tent%20Sites`;

  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'sec-ch-ua': '"Chromium";v="125", "Not.A/Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
    });

    await page.goto(url, { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Page loaded successfully");

    // Handle cookie popup
    try {
      const acceptCookieButton = await page.waitForSelector('button.osano-cm-accept', { timeout: 5000 });
      if (acceptCookieButton) {
        console.log("Cookie popup found, clicking...");
        await acceptCookieButton.click();
        console.log("Cookie popup clicked");
      }
    } catch (error) {
      // Cookie popup might not appear, continue with the flow
      console.log("Cookie popup not found or already handled");
    }

    await page.waitForSelector('div.search-results', { timeout: 10000 });
    console.log("Search results found");

    const noAvailabilityDiv = await page.$('div.search-results-none');
    if (noAvailabilityDiv) {
      console.log("No availability found, investigate further.");
      await browser.close();
      return responseData;
    }

    const placeContainers = await page.$$('ul.search-results-list li');
    if (!placeContainers.length) {
      console.log("No place containers found");
      await browser.close();
      return responseData;
    }

    console.log("Place containers found");
    let targetContainer = null;
    
    // First try to find Waterfront Rustic Tent Site
    for (const container of placeContainers) {
      const isAd = await container.evaluate(el => el.className.includes('search-results-ad'));
      if (isAd) continue;
      
      const siteTitle = await container.$eval('.search-results-site-title', el => el.innerText.trim());
      if (siteTitle === 'Waterfront Rustic Tent Site') {
        targetContainer = container;
        break;
      }
    }

    // If not found, try to find Rustic Tent Site
    if (!targetContainer) {
      for (const container of placeContainers) {
        const isAd = await container.evaluate(el => el.className.includes('search-results-ad'));
        if (isAd) continue;
        
        const siteTitle = await container.$eval('.search-results-site-title', el => el.innerText.trim());
        if (siteTitle === 'Rustic Tent Site') {
          targetContainer = container;
          break;
        }
      }
    }

    if (!targetContainer) {
      console.log("No suitable tent site found");
      await browser.close();
      return responseData;
    }

    // Modified click handling for the selected container
    await page.evaluate((el) => el.scrollIntoView(), targetContainer);
    await new Promise(resolve => setTimeout(resolve, 500));
    await targetContainer.click({ delay: 100 });
    console.log("Target container clicked");

    await page.waitForSelector("section.site-content", { visible: true, timeout: 5000 });
    console.log("Site content found");
    
    // Modified select button handling
    await page.waitForSelector("table.site-locations-table > tr.site-locations-table-site", { visible: true, timeout: 5000 });
    const firstSelectButton = await page.waitForSelector(
      "table.site-locations-table > tr.site-locations-table-site .site-locations-table-site-select-button",
      { visible: true, timeout: 5000 }
    );
    
    // Ensure button is in view and wait for it to be ready
    await page.evaluate((el) => el.scrollIntoView(), firstSelectButton);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Click with retry logic
    try {
      await firstSelectButton.evaluate(b => b.click());
      console.log("First select button clicked");
    } catch (error) {
      console.log("First click attempt failed, trying alternative method");
      await page.evaluate((button) => button.click(), firstSelectButton);
    }
    
    // Verify the click worked by waiting for the next element
    try {
        await page.waitForSelector('.app-add-to-cart-button', { visible: true, timeout: 10000 });
    } catch (error) {
        console.log("Add to Cart button not found. Printing all button texts...");
        // Get all buttons and their text content
        const buttons = await page.$$eval('button', (btns) => btns.map(btn => btn.innerText.trim()).filter(text => text));
        console.log("Button Texts on the Page:", buttons);
        
        const inputs = await page.$$eval('input', (inputs) => inputs.map(input => ({
            type: input.type,
            id: input.id,
            class: input.className
        })));
        console.log("Input Elements on the Page:", inputs);
        return responseData;
    }

    const addToCartButton = await page.$('.app-add-to-cart-button');
    await page.evaluate((el) => el.scrollIntoView(), addToCartButton);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const boundingBox = await addToCartButton.boundingBox();
    if (boundingBox) {
    await addToCartButton.click({ delay: 100 });
    console.log("Add to cart button clicked");
    } else {
    console.error("Add to cart button not clickable");
    }

    // Add to cart button 2
    await page.waitForSelector("input.site-booking-form-submit.app-add-to-cart-button", { visible: true });
    const addToCartButton2 = await page.$("input.site-booking-form-submit.app-add-to-cart-button");
    await page.evaluate((el) => el.scrollIntoView(), addToCartButton2);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const boundingBox2 = await addToCartButton2.boundingBox();
    if (boundingBox2) {
    await addToCartButton2.click({ delay: 100 });
    console.log("Add to cart button 2 clicked");
    } else {
    console.error("Add to cart button 2 not clickable");
    }

    await page.waitForSelector("section.cart-confirmation");
    console.log("Cart confirmation found");
    const reviewCartButton = await page.waitForSelector("a.cart-confirmation-item-actions-button.app-view-cart-button", { visible: true, timeout: 10000 });
    await reviewCartButton.click();
    console.log("Review cart button clicked");

    const proceedToCheckoutButton = await page.waitForSelector("a.cart-summary-checkout-button.app-cart-checkout-button");
    await proceedToCheckoutButton.click();
    console.log("Proceed to checkout button clicked");
    // Fill out guest information
    await page.waitForSelector("input#guest-full-name-input", { timeout: 10000 });
    await page.type("input#guest-full-name-input", `${paymentInfo.first_name} ${paymentInfo.last_name}`);
    await page.type("input#guest-address-line-1", paymentInfo.street_address);
    await page.type("input#guest-postal-code-input", paymentInfo.zip_code);
    await page.type("input#guest-city-input", paymentInfo.city);
    console.log("Guest information filled out");
    // Select state from dropdown
    const stateSelect = await page.$("select#guest-state-select");
    await stateSelect.select(STATE_MAPPING[paymentInfo.state] || paymentInfo.state);
    console.log("State selected");
    await page.type("input#guest-email-input", paymentInfo.email);
    await page.type("input#guest-phone-number-input", paymentInfo.phone_number);
    console.log("Email and phone number filled out");
    // Continue to payment
    const continueToPaymentButton = await page.waitForSelector("button.checkout-form-submit-button.app-checkout-continue-to-payment-amount-button", { visible: true, timeout: 10000 });
    await continueToPaymentButton.click();
    console.log("Continue to payment button clicked");
    const continueToPaymentMethodButton = await page.waitForSelector("button.checkout-form-submit-button.app-checkout-continue-to-payment-info-button", { visible: true, timeout: 10000 });
    await continueToPaymentMethodButton.click();
    console.log("Continue to payment method button clicked");
    // Handle payment information
    // Wait for iframe to be present
    const ccFrame = await page.waitForSelector("iframe#tokenFrame", { visible: true, timeout: 10000 });
    console.log("Iframe found");

    // Switch to the iframe content
    const frame = await ccFrame.contentFrame();
    if (!frame) {
    throw new Error("Failed to get iframe content");
    }
    console.log("Switched to iframe");

    // Wait for the credit card input field inside the iframe
    await frame.waitForSelector("input#ccnumfield", { visible: true, timeout: 5000 });
    await frame.type("input#ccnumfield", paymentInfo.card_number);
    console.log("Card number filled out");

    await page.type("input#month", paymentInfo.expiry_date.split('/')[0]);
    await page.type("input#year", paymentInfo.expiry_date.split('/')[1].slice(-2));
    await page.type("input#payment-security-code-input", paymentInfo.cvc);
    console.log("CVC filled out");

    const termsCheckbox = await page.waitForSelector("input#terms-and-conditions-accept");
    await termsCheckbox.click();
    console.log("Terms and conditions checkbox clicked");
    // Get total price
    const totalPriceElement = await page.$("td.checkout-summary-totals-amount.app-checkout-total");
    if (totalPriceElement) {
      const priceText = await totalPriceElement.evaluate(el => el.textContent);
      responseData.base_price = parseFloat(priceText.replace('$', '').trim());
      responseData.total = responseData.base_price;
    }
    console.log("Total price found");
    // Uncomment to actually place the order
    // const placeOrderButton = await page.waitForSelector("button.checkout-form-submit-button.mod-place-order.app-checkout-submit");
    // await placeOrderButton.click();

    responseData.payment_successful = true;
    await browser.close();
    console.log("Browser closed");
    console.log("Response data:", responseData);
    return responseData;

  } catch (error) {
    console.error(`Error during payment: ${error.message}`);
    return responseData;
  }
}

if (require.main === module) {
    (async () => {
        const paymentInfo = {
            first_name: "Lebron",
            last_name: "James",
            email: "lebronjames@gmail.com",
            phone_number: "3134321234",
            street_address: "1234 Rocky Rd",
            city: "San Francisco",
            state: "CA",
            zip_code: "45445",
            country: "USA",
            cardholder_name: "Lebron James",
            card_number: "2342943844322224",
            card_type: "Visa",
            expiry_date: "01/30",
            cvc: "1234"
        }
        const result = await payTouristParkTent("06/08/25", "06/10/25", 2, 1, paymentInfo);
        console.log("Scrape result:", result);
    })();
}

module.exports = { payTouristParkTent };