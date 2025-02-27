const puppeteer = require('puppeteer');

date_to_pk_dict = {
    "05/01/25": "1565247905",
    "05/02/25": "1565247908",
    "05/03/25": "1565247910",
    "05/04/25": "1565247915",
    "05/05/25": "1565247918",
    "05/06/25": "1565247921",
    "05/07/25": "1565247925",
    "05/08/25": "1565247928",
    "05/09/25": "1565247930",
    "05/10/25": "1565247942",
    "05/11/25": "1565247945",
    "05/12/25": "1565247949",
    "05/13/25": "1565247954",
    "05/14/25": "1565247957",
    "05/15/25": "1565247961",
    "05/16/25": "1565247968",
    "05/17/25": "1565247972",
    "05/18/25": "1565247976",
    "05/19/25": "1565247981",
    "05/20/25": "1565247986",
    "05/21/25": "1565247989",
    "05/22/25": "1565247998",
    "05/23/25": "1565248001",
    "05/24/25": "1565248003",
    "05/25/25": "1565248004",
    "05/26/25": "1565248007",
    "05/27/25": "1565248008",
    "05/28/25": "1565248010",
    "05/29/25": "1565248013",
    "05/30/25": "1565248014",
    "05/31/25": "1565248017",
    "06/01/25": "1565248018",
    "06/02/25": "1565248020",
    "06/03/25": "1565248022",
    "06/04/25": "1565248023",
    "06/05/25": "1565248024",
    "06/06/25": "1565248025",
    "06/07/25": "1565248027",
    "06/08/25": "1565248029",
    "06/09/25": "1565248031",
    "06/10/25": "1565248032",
    "06/11/25": "1565248035",
    "06/12/25": "1565248037",
    "06/13/25": "1565248039",
    "06/14/25": "1565248040",
    "06/15/25": "1565248042",
    "06/16/25": "1565248044",
    "06/17/25": "1565248046",
    "06/18/25": "1565248047",
    "06/19/25": "1565248048",
    "06/20/25": "1565247911",
    "06/21/25": "1565247912",
    "06/22/25": "1565247913",
    "06/23/25": "1565247916",
    "06/24/25": "1565247919",
    "06/25/25": "1565247922",
    "06/26/25": "1565247923",
    "06/27/25": "1565247926",
    "06/28/25": "1565247929",
    "06/29/25": "1565247932",
    "06/30/25": "1565247933",
    "07/01/25": "1565247935",
    "07/02/25": "1565247936",
    "07/03/25": "1565247937",
    "07/04/25": "1565247938",
    "07/05/25": "1565247939",
    "07/06/25": "1565247940",
    "07/07/25": "1565247943",
    "07/08/25": "1565247946",
    "07/09/25": "1565247947",
    "07/10/25": "1565247948",
    "07/11/25": "1565247951",
    "07/12/25": "1565247952",
    "07/13/25": "1565247953",
    "07/14/25": "1565247956",
    "07/15/25": "1565247959",
    "07/16/25": "1565247960",
    "07/17/25": "1565247963",
    "07/18/25": "1565247964",
    "07/19/25": "1565247965",
    "07/20/25": "1565247966",
    "07/21/25": "1565247969",
    "07/22/25": "1565247970",
    "07/23/25": "1565247971",
    "07/24/25": "1565247974",
    "07/25/25": "1565247975",
    "07/26/25": "1565247978",
    "07/27/25": "1565247979",
    "07/28/25": "1565247982",
    "07/29/25": "1565247983",
    "07/30/25": "1565247985",
    "07/31/25": "1565247987",
    "08/01/25": "1565247990",
    "08/02/25": "1565247991",
    "08/03/25": "1565247992",
    "08/04/25": "1565247993",
    "08/05/25": "1565247994",
    "08/06/25": "1565247995",
    "08/07/25": "1565247996",
    "08/08/25": "1565247997",
    "08/09/25": "1565247904",
    "08/10/25": "1565247906",
    "08/11/25": "1565247907",
    "08/12/25": "1565247909",
    "08/13/25": "1565247914",
    "08/14/25": "1565247917",
    "08/15/25": "1565247920",
    "08/16/25": "1565247924",
    "08/17/25": "1565247927",
    "08/18/25": "1565247931",
    "08/19/25": "1565247934",
    "08/20/25": "1565247941",
    "08/21/25": "1565247944",
    "08/22/25": "1565247950",
    "08/23/25": "1565247955",
    "08/24/25": "1565247958",
    "08/25/25": "1565247962",
    "08/26/25": "1565247967",
    "08/27/25": "1565247973",
    "08/28/25": "1565247977",
    "08/29/25": "1565247980",
    "08/30/25": "1565247984",
    "08/31/25": "1565247988",
    "09/01/25": "1565247999",
    "09/02/25": "1565248000",
    "09/03/25": "1565248002",
    "09/04/25": "1565248005",
    "09/05/25": "1565248006",
    "09/06/25": "1565248009",
    "09/07/25": "1565248011",
    "09/08/25": "1565248012",
    "09/09/25": "1565248015",
    "09/10/25": "1565248016",
    "09/11/25": "1565248019",
    "09/12/25": "1565248021",
    "09/13/25": "1565248026",
    "09/14/25": "1565248028",
    "09/15/25": "1565248030",
    "09/16/25": "1565248033",
    "09/17/25": "1565248034",
    "09/18/25": "1565248036",
    "09/19/25": "1565248038",
    "09/20/25": "1565248041",
    "09/21/25": "1565248043",
    "09/22/25": "1565248045",
    "09/23/25": "1565248049",
    "09/24/25": "1565248050",
    "09/25/25": "1565248051",
    "09/26/25": "1565248124",
    "09/27/25": "1565248125",
    "09/28/25": "1565248126",
    "09/29/25": "1565248127",
    "09/30/25": "1565248131",
    "10/01/25": "1565248141",
    "10/02/25": "1565248142",
    "10/03/25": "1565248143",
    "10/04/25": "1565248144",
    "10/05/25": "1565248146"
}

async function scrapeTeePeeCampgroundTent(startDate, endDate, numAdults, numKids) {
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  const numNights = (endDateObj - startDateObj) / (1000 * 60 * 60 * 24); // Calculate nights

  if (startDateObj < new Date("2025-05-01")) {
    return { available: false, price: null, message: "Not available before May 1, 2025" };
  }

  const pk = date_to_pk_dict[startDate];
  if (!pk) {
    return { available: false, price: null, message: "Date not found in mapping" };
  }

  const url = `https://fareharbor.com/embeds/book/teepeecampground/items/74239/availability/${pk}/book/?full-items=yes&flow=35388`;
  console.log(url);

  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    console.log("Page loaded successfully");

    // First wait for the ng-book-counts div to be present
    try {
      await page.waitForSelector('div.book-anon-columns-section.with-bottom-border.book-anon', { timeout: 7000 });
      console.log("book-anon-columns-section div found");
    } catch (error) {
        try {
            const callToBookElement = await page.$('h2.sold-out', { timeout: 3000 });
            if (callToBookElement) {
                const text = await page.evaluate(el => el.textContent.trim(), callToBookElement);
                console.log('Call to book element found:', text);
                await browser.close();
                return { available: false, price: null, message: "No availability" };
            } else {
                // Check for call-to-book message div
                const callToBookMessageDiv = await page.$('div[data-test-id="call-to-book-message"]', { timeout: 3000 });
                if (callToBookMessageDiv) {
                    const text = await page.evaluate(el => {
                        const phoneSpan = el.querySelector('span');
                        return phoneSpan ? phoneSpan.textContent.trim() : '';
                    }, callToBookMessageDiv);
                    console.log('Call to book message found:', text);
                    await browser.close();
                    return { available: false, price: null, message: "No availability" };
                } else {
                    throw new Error('No availability indicators found');
                }
            }
        } catch (innerError) {
            console.log('Could not find book-anon-columns-section div or availability indicators');
            await browser.close();
            return { available: false, price: null, message: "Something went wrong" };
        }
    }

    // Then wait for price and select elements
    const priceSelector = `div[data-test-id='${numNights}-night-reservation-customer-type-rate'] span.price-wrap`;
    const selectSelector = `select[data-test-id='user-type-${numNights}-night-reservation']`;
    
    try {
        await page.waitForSelector(priceSelector, { timeout: 10000 });
        console.log("Price element found");
        await page.waitForSelector(selectSelector, { timeout: 10000 });
        console.log("Select element found");

        // Check if the select element is disabled
        const isSelectDisabled = await page.$eval(selectSelector, select => select.disabled);
        if (isSelectDisabled) {
            console.log("Select element is disabled");
            await browser.close();
            return { available: false, price: null, message: "Reservation not available for the selected dates" };
        }
    } catch (error) {
        console.log('Could not find required elements, printing all selects and buttons:');
        const selects = await page.$$eval('select', selects => selects.map(sel => ({
            id: sel.id,
            name: sel.name,
            'data-test-id': sel.getAttribute('data-test-id'),
            class: sel.className
        })));
        const buttons = await page.$$eval('button', buttons => buttons.map(btn => ({
            text: btn.textContent,
            id: btn.id,
            class: btn.className
        })));
        console.log('Selects:', selects);
        console.log('Buttons:', buttons);
        throw error;
    }

        // Add a small delay to ensure the element is fully loaded and interactive
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Select the value "1" from the dropdown
    // await page.select(selectSelector, '1');
    await page.evaluate((selector) => {
        const select = document.querySelector(selector);
        select.value = '1';
        select.dispatchEvent(new Event('change'));
    }, selectSelector);
    console.log("Selected 1 reservation");

    // Select number of people staying
    const totalPeople = numAdults + numKids;
    const peopleSelector = 'select[data-test-id="extended-options-select-action-How many people will be staying at this spot?"]';
    await page.waitForSelector(peopleSelector);
    
    // Map total people to the corresponding option value (as strings)
    let optionValue;
    switch(totalPeople) {
        case 1: optionValue = 'number:3144134'; break;
        case 2: optionValue = 'number:3144135'; break;
        case 3: optionValue = 'number:3144136'; break;
        case 4: optionValue = 'number:3144137'; break;
        case 5: optionValue = 'number:3144138'; break;
        case 6: optionValue = 'number:3144139'; break;
        default: throw new Error('Invalid number of people: must be between 1-6');
    }
    await page.select(peopleSelector, optionValue);

    const subtotalSelector = '[data-test-id="subtotal-indicator"]';
    await page.waitForSelector(subtotalSelector);
    const basePrice = await page.$eval(subtotalSelector, el => parseFloat(el.textContent.replace(/[^0-9.]/g, '')));
    const pricePerNight = basePrice / numNights;
    console.log("Price per night: ", pricePerNight);

    await browser.close();
    const responseData = {
      available: true,
      price: pricePerNight,
      message: `$${pricePerNight.toFixed(2)} per night`
    }
    console.log("Response data: ", responseData);
    return responseData;

  } catch (error) {
    console.error(`Error: ${error.message}`);
    const responseData = {
      available: false,
      price: null,
      message: `Error occurred: ${error.message}`
    }
    console.log("Response data: ", responseData);
    return responseData;
  }
}

if (require.main === module) {
  (async () => {
    const result = await scrapeTeePeeCampgroundTent("06/08/25", "06/10/25", 1, 0);
    console.log("Scrape result:", result);
  })();
}

module.exports = { scrapeTeePeeCampgroundTent };
