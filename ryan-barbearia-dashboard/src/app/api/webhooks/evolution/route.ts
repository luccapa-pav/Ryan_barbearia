import { NextRequest, NextResponse } from 'next/server'

/**
 * Evolution API Webhook Receiver
 *
 * Forwards incoming WhatsApp messages to n8n for processing.
 * This keeps the Evolution API integration isolated to a single point,
 * making migration to Uazapi easier in the future.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate webhook secret if configured
    const secret = request.headers.get('x-webhook-secret')
    if (process.env.N8N_WEBHOOK_SECRET && secret !== process.env.N8N_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Forward to n8n
    const n8nUrl = process.env.N8N_WEBHOOK_URL
    if (!n8nUrl) {
      console.error('N8N_WEBHOOK_URL not configured')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      console.error(`n8n webhook returned ${response.status}`)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
}
