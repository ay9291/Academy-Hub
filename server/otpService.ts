const PRELUDE_API_KEY = process.env.PRELUDE_API_KEY;
const PRELUDE_API_URL = 'https://api.prelude.dev/v2';

interface PreludeVerificationResponse {
  id: string;
  status: string;
}

interface PreludeCheckResponse {
  id: string;
  status: 'approved' | 'pending' | 'expired' | 'failed';
}

export async function sendOtpViaSms(
  phoneNumber: string,
  registrationNumber: string
): Promise<{ success: boolean; verificationId?: string; error?: string }> {
  try {
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    
    const response = await fetch(`${PRELUDE_API_URL}/verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PRELUDE_API_KEY}`,
      },
      body: JSON.stringify({
        target: {
          type: 'phone_number',
          value: formattedPhone,
        },
        signals: {
          app_version: '1.0.0',
          device_id: registrationNumber,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Prelude API error:', errorData);
      return { success: false, error: 'Failed to send OTP' };
    }

    const data: PreludeVerificationResponse = await response.json();
    return { success: true, verificationId: data.id };
  } catch (error) {
    console.error('OTP service error:', error);
    return { success: false, error: 'OTP service unavailable' };
  }
}

export async function verifyOtp(
  verificationId: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${PRELUDE_API_URL}/verification/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PRELUDE_API_KEY}`,
      },
      body: JSON.stringify({
        id: verificationId,
        code: code,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Prelude verify error:', errorData);
      return { success: false, error: 'Invalid or expired OTP' };
    }

    const data: PreludeCheckResponse = await response.json();
    
    if (data.status === 'approved') {
      return { success: true };
    } else {
      return { success: false, error: 'Invalid or expired OTP' };
    }
  } catch (error) {
    console.error('OTP verification error:', error);
    return { success: false, error: 'Verification service unavailable' };
  }
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function isValidPhoneNumber(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length === 10 || (cleanPhone.length === 12 && cleanPhone.startsWith('91'));
}
