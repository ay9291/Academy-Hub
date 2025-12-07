const PRELUDE_API_KEY = process.env.PRELUDE_API_KEY;
const PRELUDE_BASE_URL = 'https://api.prelude.dev/v2';

interface PreludeVerificationResponse {
  id: string;
  status: string;
}

interface PreludeCheckResponse {
  id: string;
  status: 'success' | 'failure' | 'pending';
}

export async function sendPhoneOtp(phoneNumber: string): Promise<{ success: boolean; verificationId?: string; error?: string }> {
  if (!PRELUDE_API_KEY) {
    console.warn('Prelude API not configured - skipping phone OTP');
    return { success: false, error: 'Phone OTP service not configured' };
  }

  try {
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    
    const response = await fetch(`${PRELUDE_BASE_URL}/verification/create`, {
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
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Prelude API error:', error);
      return { success: false, error: 'Failed to send OTP' };
    }

    const data: PreludeVerificationResponse = await response.json();
    return { success: true, verificationId: data.id };
  } catch (error) {
    console.error('Phone OTP service error:', error);
    return { success: false, error: 'Failed to send OTP' };
  }
}

export async function verifyPhoneOtp(verificationId: string, code: string, phoneNumber: string): Promise<{ success: boolean; error?: string }> {
  if (!PRELUDE_API_KEY) {
    return { success: false, error: 'Phone OTP service not configured' };
  }

  try {
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    
    const response = await fetch(`${PRELUDE_BASE_URL}/verification/check`, {
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
        code,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Prelude verification error:', error);
      return { success: false, error: 'Verification failed' };
    }

    const data: PreludeCheckResponse = await response.json();
    return { success: data.status === 'success' };
  } catch (error) {
    console.error('Phone OTP verification error:', error);
    return { success: false, error: 'Verification failed' };
  }
}
