const puppeteer = require('puppeteer');

const stateMapping = {
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

async function payLeelanauPinesTent(startDate, endDate, numAdults, numKids, paymentInfo, executePayment = false) {
  console.log("Params:", startDate, endDate, numAdults, numKids, executePayment);
  const responseData = {
    base_price: 0,
    tax: 0,
    total: 0,
    payment_successful: false,
  };

  const startDateFormatted = new Date(startDate).toISOString().split('T')[0]; // YYYY-MM-DD
  const endDateFormatted = new Date(endDate).toISOString().split('T')[0]; // YYYY-MM-DD

  const url = `https://leelanaupinescampresort.com/stay/search?start=${startDateFormatted}&end=${endDateFormatted}`;

  try {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({
        headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();
    console.log("Created new page");
    
    console.log("Navigating to URL:", url);
    await page.goto(url, { waitUntil: 'networkidle2' });
    console.log("Page loaded");
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Waited 1 second");

    console.log("Looking for Sort & Filter button...");
    const buttons = await page.$$('span.mantine-Button-label');
    console.log(`Found ${buttons.length} buttons with class mantine-Button-label`);
    
    for (const button of buttons) {
        const text = await page.evaluate(el => el.innerText, button);
        console.log("Button text:", text);
        if (text.includes('Sort & Filter')) {
            console.log("Found Sort & Filter button, clicking with eval method...");
            await button.evaluate(b => b.click());
            console.log("Clicked Sort & Filter button");
            break;
        }
    }

    await page.waitForSelector('div.mantine-Modal-body', { timeout: 30000 });
    console.log('Modal loaded');

    // **Click "Price (Low - High)"**
    const sortOptions = (await page.$$('div.flex.w-full.cursor-pointer')).slice(12); // Get sorting options
    const sortText = await Promise.all(sortOptions.map(async el => await page.evaluate(e => e.innerText, el)));

    let clickedPriceLowHigh = false;
    for (const option of sortOptions) { 
      const text = await page.evaluate(el => el.innerText, option);
      if (text.includes('Price (Low - High)')) {
        await option.click();
        console.log('Clicked "Price (Low - High)"');
        clickedPriceLowHigh = true;
        break;
      }
    }
    if (!clickedPriceLowHigh) throw new Error('"Price (Low - High)" option not found.');

    let clickedTentSites = false;
    for (const option of sortOptions) {
      const text = await page.evaluate(el => el.innerText, option);
      if (text.includes('Tent Sites')) {
        await option.click(); // Click "Tent Sites"
        console.log('Clicked "Tent Sites"');
        clickedTentSites = true;
        break;
      }
    }
    if (!clickedTentSites) throw new Error('"Tent Sites" option not found.');

    // **Click "Show X Results" Button**
    await page.waitForSelector('button.mantine-Button-root', { timeout: 30000 }); // Wait for "Show Results" buttons to load
    const showResultsButtons = await page.$$('button.mantine-Button-root');
    let showResultsButton = null;
    for (const button of showResultsButtons) {
      const text = await page.evaluate(el => el.innerText, button);
      if (text.includes('RESULTS')) {
        showResultsButton = button;
        break;
      }
    }
    if (showResultsButton) {
      await showResultsButton.click();
      console.log('Clicked "Show X Results" button');
    } else {
      throw new Error('"Show X Results" button not found.');
    }

    await page.waitForSelector('div.flex.w-full.items-center.justify-between.gap-1\\.5[aria-haspopup="dialog"]', { visible: true, timeout: 10000 });
    
    const guestSelectorButton = await page.$('div.flex.w-full.items-center.justify-between.gap-1\\.5[aria-haspopup="dialog"]');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await guestSelectorButton.click();

    await page.waitForSelector('div.mantine-Popover-dropdown', { timeout: 10000 });

    // Get all the sections for "Toddlers", "Children", "Adults", and "Pets"
    const sections = await page.$$('div.flex.select-none.justify-between.px-4.py-3');
    
    for (const section of sections) {
      const sectionText = await page.evaluate(el => el.innerText, section);
    
      if (sectionText.includes('Children')) {
        console.log('Found "Children" section.');
        const plusButton = await section.$('button.mantine-ActionIcon-root svg[data-icon="plus"]');
        for (let i = 0; i < numKids; i++) {
          await plusButton.click();
        }
      }
    
      if (sectionText.includes('Adults')) {
        console.log('Found "Adults" section.');
        const plusButton = await section.$('button.mantine-ActionIcon-root svg[data-icon="plus"]');
        const minusButton = await section.$('button.mantine-ActionIcon-root svg[data-icon="minus"]');
        const currentAdults = 2
    
        if (numAdults !== currentAdults) {
          for (let i = 0; i < Math.abs(numAdults - currentAdults); i++) {
            if (numAdults > currentAdults) {
              await plusButton.click(); // Add adults
            } else {
              await minusButton.click(); // Remove adults
            }
          }
        }
      }
    }
    
    console.log('Successfully adjusted number of guests.');

    await page.waitForSelector('span.mantine-Button-label', { visible: true, timeout: 10000 });
    const searchButtons = await page.$$('span.mantine-Button-label');

    let clicked = false;
    for (const button of searchButtons) {
    const text = await page.evaluate(el => el.innerText.trim(), button);
    if (text === 'SEARCH') {
        await button.click();
        console.log('Clicked "Search" button');
        clicked = true;
        break;
    }
    }

    const noResults = await page.$('div.flex.flex-col.items-center.justify-center.gap-8.rounded-lg.border');
    if (noResults) {
      console.log("No availability for the selected dates.");
      await browser.close();
      return responseData;
    }

    const options = await page.$$('div[class*="min-h-"]');
    let selectedOption = null;
    let lakefrontFound = false;

    // Look through options for Lakefront Basic RV
    for (const option of options) {
      const titleElement = await option.$('div.wp-title-2');
      if (titleElement) {
        const title = await titleElement.evaluate(el => el.innerText);
        if (title === 'LAKEFRONT BASIC RV') {
          console.log("Found Lakefront Basic RV option");
          selectedOption = option;
          lakefrontFound = true;
          break;
        }
      }
    }

    // If no lakefront found, use first option
    if (!lakefrontFound) {
      selectedOption = options.length > 0 ? options[0] : null;
      console.log("No Lakefront Basic RV option found, using first option");
    }

    if (!selectedOption) {
        console.log("No site options available.");
        await browser.close();
        console.log("Response data:", responseData);
        return responseData;
    }

    const priceElement = await selectedOption.$('div.text-xl.font-bold.text-primary');
    if (!priceElement) {
        console.log("Price element not found.");
        await browser.close();
        console.log("Response data:", responseData);
        return responseData;
    }

    console.log("Price element found, clicking...");
    await priceElement.click(); 
    console.log("Clicked price element");

    await page.waitForSelector('div.font-title.text-2xl.uppercase.tracking-wide', { visible: true, timeout: 10000 });
    const siteInput = await page.$('div.mb-1.space-y-3.p-6 input[readonly]');

    if (!siteInput) {
        console.log("Site selection input not found.");
        await browser.close();
        console.log("Response data:", responseData);
        return responseData;
    }

    console.log("Site input field found, clicking...");
    await siteInput.click();
    console.log('Clicked the site input field.');

    await page.waitForSelector('.mantine-Select-dropdown .mantine-Select-item', { visible: true, timeout: 5000 });
    const siteOptions = await page.$$('.mantine-Select-dropdown .mantine-Select-item');

    for (const siteOption of siteOptions) {
        console.log("Trying next available site...");
        await siteOption.click();
        console.log('Selected a site.');

        await page.waitForSelector('button.mantine-Button-root', { visible: true, timeout: 10000 });
        console.log("Add to cart button found, clicking...");
        const addToCartButtons = await page.$$('button.mantine-Button-root');
        let addToCartButton = null;
        for (const button of addToCartButtons) {
            const text = await page.evaluate(el => el.innerText.trim(), button);
            if (text === 'ADD TO CART') {
                addToCartButton = button;
                break;
            }
        }

        if (!addToCartButton) {
            console.log('"Add To Cart" button not found.');
            continue;
        }

        console.log('"Add To Cart" button found, clicking...');
        await addToCartButton.click();
        console.log('Clicked "Add To Cart" button.');

        await page.waitForSelector('.mantine-Modal-body', { visible: true, timeout: 10000 });

        const modalButtons = await page.$$('.mantine-Modal-body button');
        let noThanksButton = null;
        for (const button of modalButtons) {
            const text = await page.evaluate(el => el.innerText.trim(), button);
            console.log("No Thanks button text:", text);
            if (text === 'NO THANKS') {
                noThanksButton = button;
                break;
            }
        }

        if (noThanksButton) {
            console.log('"No Thanks" button found, clicking...');
            await noThanksButton.evaluate(b => b.click());
            console.log('Clicked "No Thanks" button.');
            await page.evaluate(() => new Promise(r => setTimeout(r, 1000)));
        } else {
            console.log('"No Thanks" button not found.');
        }

        // Check for error message
        const errorElement = await page.$('div.input-error-text.mt-2');
        if (errorElement) {
            const errorText = await page.evaluate(el => el.textContent, errorElement);
            if (errorText.includes('site is no longer available')) {
                console.log('Site no longer available, trying next option...');
                continue;
            }
        }

        // Find and click "Go To Shopping Cart" button
        await page.waitForSelector('.mantine-Modal-body', { visible: true, timeout: 10000 });

        const cartButtons = await page.$$('.mantine-Modal-body button');
        let cartButton = null;
        for (const button of cartButtons) {
            const buttonText = await page.evaluate(el => {
                const label = el.querySelector('.mantine-Button-label');
                return label ? label.textContent.trim() : '';
            }, button);
            console.log("Go To Shopping Cart button text:", buttonText);
            if (buttonText.includes('Go To Shopping Cart')) {
                cartButton = button;
                break;
            }
        }

        if (cartButton) {
            console.log('"Go To Shopping Cart" button found, clicking...');
            await cartButton.evaluate(b => b.click());
            console.log('Clicked "Go To Shopping Cart" button');
            break; // Successfully found an available site
        } else {
            console.log('"Go To Shopping Cart" button not found, trying next site...');
        }
    }
    // Wait for the cart page to load and collect price information
    try {
        await page.waitForSelector('.flex.items-center.justify-between.gap-6', { visible: true, timeout: 10000 });
    } catch (error) {
        console.log('Could not find price elements, printing all buttons:');
        const allButtons = await page.$$('button');
        for (const button of allButtons) {
            const buttonText = await page.evaluate(el => {
                const label = el.querySelector('.mantine-Button-label');
                return label ? label.textContent.trim() : el.textContent.trim();
            }, button);
            console.log('Button text:', buttonText);
        }
        throw error;
    }
    
    // Extract price information using selectors
    const priceElements = await page.$$('div.flex.items-center.justify-between.gap-6');
    let basePrice = 0;
    let fees = 0;
    let taxes = 0;
    let total = 0;

    console.log("Extracting price information...");
    for (const element of priceElements) {
        const text = await page.evaluate(el => el.firstElementChild?.textContent || '', element);
        const priceText = await page.evaluate(el => el.lastElementChild?.textContent || '', element);
        const price = parseFloat(priceText.replace('$', ''));

        if (text.includes('Night')) {
            basePrice = price;
        } else if (text.includes('Fees')) {
            fees = price;
        } else if (text === 'Taxes') {
            taxes = price;
        } else if (text === 'Total') {
            total = price;
        }
    }

    // Update responseData
    responseData.base_price = basePrice;
    responseData.tax = fees + taxes;
    responseData.total = total;

    console.log('Price information collected:', {
        basePrice,
        fees,
        taxes,
        total
    });

    // Find and click "Proceed to Checkout" button
    const checkoutButtons = await page.$$('button.mantine-Button-root');
    let checkoutButton = null;
    for (const button of checkoutButtons) {
        const buttonText = await page.evaluate(el => {
            const label = el.querySelector('.mantine-Button-label');
            return label ? label.textContent.trim() : '';
        }, button);
        if (buttonText === 'Proceed to Checkout') {
            console.log('"Proceed to Checkout" button found, clicking...');
            checkoutButton = button;
            break;
        }
    }

    if (checkoutButton) {
        await checkoutButton.click();
        console.log('Clicked "Proceed to Checkout" button');
    } else {
        throw new Error('"Proceed to Checkout" button not found');
    }

    // Fill guest information
    await page.waitForSelector('input[id^="mantine-"][type="text"]', { visible: true });
    
    // Find all input fields
    const inputs = await page.$$('input[id^="mantine-"][type="text"]');
    
    // Fill out each field by checking its label
    console.log("Filling out input fields...");
    for (const input of inputs) {
        const labelId = await input.evaluate(el => el.id + '-label');
        const labelText = await page.$eval(`label[id="${labelId}"]`, label => label.textContent);
        
        if (labelText.includes('Full Name')) {
            await input.type(`${paymentInfo.first_name} ${paymentInfo.last_name}`);
        } else if (labelText.includes('Address - Line 1')) {
            await input.type(paymentInfo.street_address);
        } else if (labelText.includes('City')) {
            await input.type(paymentInfo.city);
        } else if (labelText.includes('Postal Code')) {
            await input.type(paymentInfo.zip_code);
        } else if (labelText.includes('Email Address')) {
            await input.type(paymentInfo.email);
        } else if (labelText.includes('Phone Number')) {
            await input.type(paymentInfo.phone_number);
        }
    }

    // Handle Country and State selection
    await page.waitForSelector('input[type="search"]');
    const locationInputs = await page.$$('input[type="search"]');
    
    for (const input of locationInputs) {
        console.log("Handling country and state selection");
        const labelId = await input.evaluate(el => el.id + '-label');
        const labelElement = await page.$(`label[id="${labelId}"]`);
        if (labelElement) {
            const labelText = await labelElement.evaluate(el => el.textContent);
            
            if (labelText.includes('Country')) {
                try {
                    const wrapper = await input.evaluateHandle(el => el.closest('.mantine-Select-wrapper'));
                    const svgChevron = await wrapper.$('div.mantine-Select-rightSection svg[data-chevron="true"]');
                    await svgChevron.click({ delay: 100 });
                    console.log("Clicked chevron");
                    // Wait for dropdown options and find United States
                    const options = await page.$$('div[role="option"]');
                    for (const option of options) {
                        const text = await page.evaluate(el => el.textContent, option);
                        if (text.includes('United States')) {
                            await option.click();
                            await page.evaluate(() => new Promise(r => setTimeout(r, 1000)));
                            console.log("Clicked United States");
                            break;
                        }
                    }
                } catch (error) {
                    console.error('Error selecting country:', error);
                }
            } else if (labelText.includes('State')) {
                try {
                    const wrapper = await input.evaluateHandle(el => el.closest('.mantine-Select-wrapper'));
                    const svgChevron = await wrapper.$('div.mantine-Select-rightSection svg[data-chevron="true"]');
                    await svgChevron.click({ delay: 100 });
                    
                    const fullStateName = stateMapping[paymentInfo.state] || paymentInfo.state;
                    const options = await page.$$('div[role="option"]');
                    for (const option of options) {
                        const text = await page.evaluate(el => el.textContent, option);
                        if (text.includes(fullStateName)) {
                            await option.click();
                            await page.evaluate(() => new Promise(r => setTimeout(r, 1000)));
                            console.log("Clicked state");
                            break;
                        }
                    }
                } catch (error) {
                    console.error('Error selecting state:', error);
                }
            }
        }
    }

    // Select "Pay Total Balance" radio button
    await page.waitForSelector('input[type="radio"][value="total"]');
    const totalBalanceRadio = await page.$('input[type="radio"][value="total"]');
    if (totalBalanceRadio) {
        console.log("Total balance radio button found, clicking...");
        await totalBalanceRadio.click();
        console.log("Clicked total balance radio button");
    }

    // Handle card number iframe
    const cardNumberFrame = await page.$('#tokenFrame');
    if (cardNumberFrame) {
        console.log("Card number iframe found, waiting for 1 second...");
        await page.evaluate(() => new Promise(r => setTimeout(r, 1000)));
        console.log("Card number iframe found, typing card number...");
        await cardNumberFrame.contentFrame().then(async frame => {
            await frame.type('input', paymentInfo.card_number);
        });
    }

    // Handle card expiry and CVV
    const expiryInput = await page.$('input[placeholder="MM/YY"]');
    if (expiryInput) {
        console.log("Card expiry input found, typing expiry date...");
        await expiryInput.type(paymentInfo.expiry_date);
        console.log("Typed expiry date");
    }

    const cvvInput = await page.$('input[placeholder="***"]');
    if (cvvInput) {
        console.log("CVV input found, typing CVV...");
        await cvvInput.type(paymentInfo.cvc);
        console.log("Typed CVV");
    }

    // Ensure "Billing information is same as guest" checkbox is checked
    const billingCheckbox = await page.$('input[type="checkbox"] + svg');
    if (billingCheckbox) {
        const isChecked = await page.$eval('input[type="checkbox"]', checkbox => checkbox.checked);
        if (!isChecked) {
            console.log("Billing information is not the same as guest, clicking checkbox...");
            await billingCheckbox.click();
            console.log("Clicked billing information checkbox");
        }
    }

    // Find and click "Place Order" button (commented out for testing)
    const placeOrderButtons = await page.$$('button.mantine-Button-root');
    let placeOrderButton = null;
    for (const button of placeOrderButtons) {
        const buttonText = await page.evaluate(el => {
            const label = el.querySelector('.mantine-Button-label');
            return label ? label.textContent.trim() : '';
        }, button);
        if (buttonText === 'Place Order') {
            console.log('"Place Order" button found, clicking...');
            placeOrderButton = button;
            break;
        }
    }

    if (placeOrderButton) {
        if (executePayment) {
            console.log('Executing payment...');
            await placeOrderButton.click();
            await page.waitForNavigation({ waitUntil: 'networkidle0' });
            console.log('Payment submitted successfully');
        } else {
            console.log('Test mode: Payment execution skipped');
        }
    } else {
        console.log('"Place Order" button not found');
    }

    responseData.payment_successful = true;

    await browser.close();
    console.log("Response data:", responseData);
    return responseData;

  } catch (error) {
    console.error(`Error during payment: ${error.message}`);
    console.log("Response data:", responseData);
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
        const result = await payLeelanauPinesTent("06/24/25", "06/26/25", 5, 0, paymentInfo);
        console.log("Pay result:", result);
    })();
}

module.exports = { payLeelanauPinesTent };
