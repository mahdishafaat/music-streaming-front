// app/api/forgot-password/route.ts
import { NextResponse } from 'next/server';

// In-memory store for testing (code expires, but fine for demo)
//const codeStore = new Map<string, string>();
import { codeStore } from '../codeStore';

export async function POST(request: Request) {
  const body = await request.json();
  const { email } = body;

  if (!email || !email.includes('@')) {
    return NextResponse.json(
      { message: 'Invalid email address' },
      { status: 400 }
    );
  }

  // Generate a random 4-digit code
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  // Store it with the email as key (for verification)
  codeStore.set(email, code);

  // Simulate async delay (e.g., sending an email)
  await new Promise((resolve) => setTimeout(resolve, 1500));

  console.log(`📧 [MOCK] Code for ${email}: ${code}`); // Useful for testing

  return NextResponse.json(
    { message: 'Verification code sent successfully' },
    { status: 200 }
  );
}