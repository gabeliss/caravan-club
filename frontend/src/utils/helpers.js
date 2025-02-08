import { getAllTrips } from '../api/adminApi';
import { generateConfirmationNumber } from '../api/northernMichiganApi';

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

export function calculateTotalForStay(cityKey, selected_accommodation, accommodationsData, numNights) {
    const accommodation = accommodationsData[cityKey]?.tent[selected_accommodation];

    if (!accommodation) return { total: 0, payment: 0, disclaimer: '' };

    // Multiply the price by the total number of nights
    const priceForStay = parseFloat(accommodation.price) * numNights;

    const taxRate = accommodation.taxRate || 0;
    const totalForStay = priceForStay + (priceForStay * taxRate);

    console.log('accommodation', accommodation);
    const fixedFee = accommodation.fixedFee || 0;
    const totalForStayWithFee = totalForStay + fixedFee;
    console.log('totalForStayWithFee', totalForStayWithFee);
    let paymentAmount = totalForStayWithFee;
    if (accommodation.partialPayment) {
        paymentAmount = totalForStayWithFee / 2;
    }

    return {
        total: totalForStayWithFee,
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

export const generateOrderNumber = async () => {
    try {
        const response = await generateConfirmationNumber();
        return response.data.confirmation_number;
    } catch (error) {
        console.error('Failed to generate confirmation number:', error);
        // Fallback to generate a number locally if the API fails
        const digits = Math.floor(1000000 + Math.random() * 9000000).toString();
        return `C${digits}`;
    }
};