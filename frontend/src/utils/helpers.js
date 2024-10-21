export function adjustDate(startDate, offset) {
    // Convert startDate to a Date object
    const date = new Date(startDate);
    // Add offset days to the date
    date.setDate(date.getDate() + offset);
    // Convert the adjusted date back to 'YYYY-MM-DD' format
    const adjustedDate = date.toISOString().split('T')[0];
    return adjustedDate;
}

export function convertDateFormat(dateStr) {
    const parts = dateStr.split('-'); // Split the date string into [YYYY, MM, DD]
    const year = parts[0].substring(2); // Take the last 2 digits of the year
    const month = parts[1]; // Month
    const day = parts[2]; // Day
    return `${month}/${day}/${year}`; // Format into MM/DD/YY
}

export function calculateTotalForStay(cityKey, accommodationKey, accommodationsData, numNights) {
    const accommodation = accommodationsData[cityKey]?.tent[accommodationKey];

    if (!accommodation) return { total: 0, payment: 0, disclaimer: '' };

    // Multiply the price by the total number of nights
    const priceForStay = parseFloat(accommodation.price) * numNights;

    const taxRate = accommodation.taxRate || 0;
    const totalForStay = priceForStay + (priceForStay * taxRate);

    let paymentAmount = totalForStay;
    if (accommodation.partialPayment) {
        paymentAmount = totalForStay / 2;
    }

    return {
        total: totalForStay,
        payment: paymentAmount,
        disclaimer: accommodation.disclaimer || ''
    };
}


export function formatDates(startDate, endDate) {
    const formatDate = (dateStr) => {
        const date = new Date(dateStr + 'T00:00');
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        const day = date.getDate();
        const monthIndex = date.getMonth();
        const monthName = monthNames[monthIndex];

        const getOrdinalSuffix = (day) => {
            if (day > 3 && day < 21) return 'th';
            switch (day % 10) {
                case 1: return "st";
                case 2: return "nd";
                case 3: return "rd";
                default: return "th";
            }
        };

        return `${monthName} ${day}${getOrdinalSuffix(day)}`;
    };

    const formattedStart = formatDate(startDate);
    const formattedEnd = formatDate(endDate);

    return `${formattedStart} - ${formattedEnd}`;
}