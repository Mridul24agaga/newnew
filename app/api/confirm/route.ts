import { NextResponse } from 'next/server'

const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_LIST_ID = process.env.BREVO_LIST_ID

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({ message: 'Email is required' }, { status: 400 })
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
          name: "Innvision Tech",
          email: "info@innvision.tech"
        },
        to: [{
          email: email
        }],
        subject: "Welcome to Innvision Tech Newsletter!",
        htmlContent: `
          <html>
            <head></head>
            <body>
              <h1>Welcome to Innvision Tech!</h1>
              <p>Thank you for confirming your subscription to our newsletter.</p>
              <p>You'll now receive our latest updates on client acquisition, outreach scripts, and audience growth strategies.</p>
              <p>Best regards,<br>Innvision Tech Team</p>
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
    return NextResponse.json({ 
      message: 'Failed to confirm subscription. Please try again later.' 
    }, { status: 500 })
  }
}

