import { NextResponse } from 'next/server'

const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_LIST_ID = process.env.BREVO_LIST_ID

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ message: 'Invalid confirmation token' }, { status: 400 })
    }

    // Find the contact with the given confirmation token
    const searchResponse = await fetch(`https://api.brevo.com/v3/contacts?attributes={"CONFIRMATION_TOKEN":"${token}"}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'api-key': BREVO_API_KEY!
      }
    })

    if (!searchResponse.ok) {
      throw new Error('Failed to find contact')
    }

    const searchData = await searchResponse.json()
    if (searchData.contacts.length === 0) {
      return NextResponse.json({ message: 'Invalid confirmation token' }, { status: 400 })
    }

    const contact = searchData.contacts[0]

    // Update contact in Brevo to confirm and add to list
    const updateContactResponse = await fetch(`https://api.brevo.com/v3/contacts/${contact.id}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY!
      },
      body: JSON.stringify({
        attributes: { 
          DOUBLE_OPT_IN: true,
          CONFIRMATION_TOKEN: null
        },
        listIds: [parseInt(BREVO_LIST_ID!)],
        updateEnabled: true
      })
    })

    if (!updateContactResponse.ok) {
      throw new Error('Failed to update contact')
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
          name: "Mridul Thareja",
          email: "hi@mridulthareja.com"
        },
        to: [{
          email: contact.email
        }],
        subject: "Skyrocket Your Agency & SaaS Growth with Insider Strategies!",
  htmlContent: `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h1 style="color: #333;">Welcome to Innvision Tech!</h1>
        <p>Thank you for confirming your subscription to our newsletter.</p>
        <p>You’re now part of a community dedicated to mastering the art of client acquisition, outreach scripts, and audience growth strategies for agencies and SaaS businesses.</p>
        <p>Each week, we’ll share actionable tips to help you grow your business through organic tactics across platforms like LinkedIn, Reddit, and beyond.</p>
        <p>I’m Mridul Thareja, and I’m thrilled to guide you on this journey toward scaling your business with effective and organic growth strategies.</p>
        <p>Welcome aboard!</p>
        <p>Best regards,<br><strong>Mridul Thareja<br>Innvision Tech Team</strong></p>
      </body>
    </html>
        `
      })
    })

    if (!sendWelcomeResponse.ok) {
      console.error('Failed to send welcome email:', await sendWelcomeResponse.text())
    }

    // Redirect to thank you page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/thank-you`)
  } catch (error) {
    console.error('Confirmation error:', error)
    // Redirect to an error page if there's an issue
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/error`)
  }
}

