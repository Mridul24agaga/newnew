import { NextResponse } from 'next/server'

const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_LIST_ID = process.env.BREVO_LIST_ID

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ message: 'Confirmation token is required' }, { status: 400 })
  }

  const decodedToken = Buffer.from(token, 'base64').toString('utf-8')
  const [email] = decodedToken.split(':')

  if (!email) {
    return NextResponse.json({ message: 'Invalid confirmation token' }, { status: 400 })
  }

  try {
    // Create contact in Brevo and add to list
    const createContactResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY!
      },
      body: JSON.stringify({
        email,
        listIds: [parseInt(BREVO_LIST_ID!)],
        updateEnabled: true
      })
    })

    if (!createContactResponse.ok) {
      const error = await createContactResponse.json()
      throw new Error(error.message || 'Failed to confirm subscription')
    }

    // Send welcome email
    const sendWelcomeResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY!
      },
      body: JSON.stringify({
        sender: {
          name: "Mridul thareja",
          email: "hi@mridulthareja.com"
        },
        to: [{
          email: email
        }],
        subject: "Welcome to Mridul Thareja Newsletter!",
  htmlContent: `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h1 style="color: #333;">Welcome</h1>
        <p>Thank you for confirming your subscription to our newsletter.</p>
        <p>You’re now part of a community dedicated to mastering the art of client acquisition, outreach scripts, and audience growth strategies for agencies and SaaS businesses.</p>
        <p>Each week, we’ll share actionable tips to help you grow your business through organic tactics across platforms like LinkedIn, Reddit, and beyond.</p>
        <p>I’m Mridul Thareja, and I’m thrilled to guide you on this journey toward scaling your business with effective and organic growth strategies.</p>
        <p>Welcome aboard!</p>
        <p>Best regards,<br><strong>Mridul Thareja<br>Innvision Agency</strong></p>
      </body>
    </html>
        `
      })
    })

    if (!sendWelcomeResponse.ok) {
      const error = await sendWelcomeResponse.json()
      throw new Error(error.message || 'Failed to send welcome email')
    }

    // Redirect to thank you page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/thank-you`)
  } catch (error) {
    console.error('Confirmation error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/error?message=${encodeURIComponent('Failed to confirm subscription. Please try again later.')}`)
  }
}

