import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { full_name, email, mobile, company, service, message } = body

    // Validate request body
    if (!full_name || !email || !mobile || !company || !service || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields.' },
        { status: 400 }
      )
    }

    // Configure Nodemailer Transporter
    const host = process.env.SMTP_HOST
    const port = parseInt(process.env.SMTP_PORT || '587', 10)
    const secure = process.env.SMTP_SECURE === 'true' // true for 465, false for other ports
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const fromEmail = process.env.SMTP_FROM_EMAIL || user

    if (!host || !user || !pass) {
      console.error('SMTP configuration environment variables are missing.')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email service is not configured. Please contact administration.' 
        },
        { status: 500 }
      )
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    })

    const mailOptions = {
      from: `"${full_name}" <${fromEmail}>`,
      replyTo: email,
      to: 'info@robogeniustech.co.in',
      subject: `New Lead: ${service} - RoboGenius Tech`,
      text: `
        New Automation Assessment Request:
        ----------------------------------
        Name: ${full_name}
        Email: ${email}
        Mobile: ${mobile}
        Company: ${company}
        Service: ${service}
        
        Message:
        ${message}
      `,
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; border: 1px solid #e4e4e7; border-radius: 8px;">
          <h2 style="color: #c27a00; border-bottom: 2px solid #ffcd75; padding-bottom: 8px;">New Automation Assessment Lead</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; width: 140px;">Full Name:</td>
              <td style="padding: 6px 0;">${full_name}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Email:</td>
              <td style="padding: 6px 0;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Mobile:</td>
              <td style="padding: 6px 0;"><a href="tel:${mobile}">${mobile}</a></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Company:</td>
              <td style="padding: 6px 0;">${company}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Selected Service:</td>
              <td style="padding: 6px 0;">${service}</td>
            </tr>
          </table>
          <div style="margin-top: 20px; padding: 15px; background-color: #f4f4f5; border-radius: 6px;">
            <strong style="display: block; margin-bottom: 6px;">Message:</strong>
            <p style="margin: 0; white-space: pre-wrap; font-size: 14px; color: #3f3f46; line-height: 1.5;">${message}</p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json(
      { 
        success: true, 
        message: 'Your message has been received successfully.' 
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error sending contact email:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send contact request. Please try again later.' 
      },
      { status: 500 }
    )
  }
}
