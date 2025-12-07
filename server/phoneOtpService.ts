import Prelude from '@prelude.so/sdk';

const PRELUDE_API_KEY = process.env.PRELUDE_API_KEY;

const client = PRELUDE_API_KEY ? new Prelude({ apiToken: PRELUDE_API_KEY }) : null;

export async function sendPhoneOtp(phoneNumber: string): Promise<{ success: boolean; verificationId?: string; error?: string }> {
  if (!client) {
    console.warn('Prelude API not configured - skipping phone OTP');
    return { success: false, error: 'Phone OTP service not configured' };
  }

  try {
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    
    const verification = await client.verification.create({
      target: {
        type: 'phone_number',
        value: formattedPhone,
      },
    });

    return { success: true, verificationId: verification.id };
  } catch (error: any) {
    console.error('Phone OTP service error:', error.message || error);
    return { success: false, error: error.message || 'Failed to send OTP' };
  }
}

export async function verifyPhoneOtp(verificationId: string, code: string, phoneNumber: string): Promise<{ success: boolean; error?: string }> {
  if (!client) {
    return { success: false, error: 'Phone OTP service not configured' };
  }

  try {
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    
    const check = await client.verification.check({
      target: {
        type: 'phone_number',
        value: formattedPhone,
      },
      code,
    });

    return { success: check.status === 'success' };
  } catch (error: any) {
    console.error('Phone OTP verification error:', error.message || error);
    return { success: false, error: error.message || 'Verification failed' };
  }
}
