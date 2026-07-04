// app/api/verify-code/route.ts
import { NextResponse } from 'next/server';

// Re-import or share the same store (in a real app you'd use a DB)
// For simplicity, we'll use a global variable (but in a module, it's fine)
//const codeStore = new Map<string, string>();
import { codeStore } from '../codeStore';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, code } = body;

  if (!email || !code) {
    return NextResponse.json(
      { message: 'Email and code are required' },
      { status: 400 }
    );
  }

  const storedCode = codeStore.get(email);
  if (!storedCode) {
    return NextResponse.json(
      { message: 'No code found for this email. Please request a new one.' },
      { status: 404 }
    );
  }

  if (storedCode !== code) {
    return NextResponse.json(
      { message: 'Invalid code. Please try again.' },
      { status: 400 }
    );
  }

  // Optionally remove the code after successful verification
  codeStore.delete(email);

  // Simulate async verification
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return NextResponse.json(
    { message: 'Code verified successfully' },
    { status: 200 }
  );
}