export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { url, clientId } = req.body

    if (!url || !clientId) {
      return res.status(400).json({ 
        success: false, 
        message: 'URL and clientId are required' 
      })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid URL format' 
      })
    }

    const webhookUrl = process.env.WEBHOOK_URL
    
    if (!webhookUrl) {
      console.error('WEBHOOK_URL environment variable is not set')
      return res.status(500).json({ 
        success: false, 
        message: 'Webhook configuration error' 
      })
    }

    // Send request to webhook
    const webhookPayload = {
      url: url.trim(),
      clientId,
      timestamp: new Date().toISOString(),
      action: 'create_schema'
    }

    console.log('Sending to webhook:', webhookUrl)
    console.log('Payload:', webhookPayload)

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Schema-Review-App/1.0'
      },
      body: JSON.stringify(webhookPayload)
    })

    if (!webhookResponse.ok) {
      console.error('Webhook response error:', webhookResponse.status, webhookResponse.statusText)
      const errorText = await webhookResponse.text()
      console.error('Webhook error details:', errorText)
      
      return res.status(500).json({ 
        success: false, 
        message: `Webhook failed with status ${webhookResponse.status}: ${errorText}`,
        webhook_url: webhookUrl,
        webhook_status: webhookResponse.status
      })
    }

    const webhookResult = await webhookResponse.json().catch(() => ({}))
    console.log('Webhook response:', webhookResult)

    res.status(200).json({ 
      success: true, 
      message: 'Schema creation process started successfully',
      webhook_response: webhookResult
    })

  } catch (error) {
    console.error('Error in create-schema API:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    })
  }
}
