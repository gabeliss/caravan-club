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