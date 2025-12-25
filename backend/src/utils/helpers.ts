/**
 * Utility functions for the church website
 */

/**
 * Calculate age from date of birth
 * @param dateOfBirth - Date of birth
 * @returns Age in years
 */
export function calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

/**
 * Mask phone number for privacy
 * Example: 9876543210 -> 987****210
 * @param phone - Phone number to mask
 * @returns Masked phone number
 */
export function maskPhone(phone: string): string {
    if (!phone || phone.length < 10) return phone;

    const cleaned = phone.replace(/\D/g, ''); // Remove non-digits
    const firstThree = cleaned.substring(0, 3);
    const lastThree = cleaned.substring(cleaned.length - 3);

    return `${firstThree}****${lastThree}`;
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns True if valid email
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number (Indian format)
 * @param phone - Phone number to validate
 * @returns True if valid phone
 */
export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleaned = phone.replace(/\D/g, '');
    return phoneRegex.test(cleaned);
}

/**
 * Format date to readable string
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Check if donor is eligible to donate blood
 * (Must be at least 3 months since last donation)
 * @param lastDonation - Last donation date
 * @returns True if eligible
 */
export function isEligibleToDonate(lastDonation?: Date): boolean {
    if (!lastDonation) return true;

    const today = new Date();
    const lastDonationDate = new Date(lastDonation);
    const monthsDiff = (today.getTime() - lastDonationDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

    return monthsDiff >= 3;
}
