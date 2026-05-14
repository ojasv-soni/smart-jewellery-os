import { NextResponse } from 'next/server'

const JEWELLERY_CATEGORIES = ['Ring', 'Necklace', 'Bracelet', 'Earring', 'Pendant', 'Chain', 'Bangle', 'Other']

export async function POST(request: Request) {
  try {
    const { imageBase64 } = await request.json()

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image data required' }, { status: 400 })
    }

    // Call OpenRouter API with Claude Vision
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-vision',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                image: imageBase64,
              },
              {
                type: 'text',
                text: `You are a jewellery expert. Analyze this jewellery image and provide:
1. Product type (${JEWELLERY_CATEGORIES.join(', ')})
2. Suggested product name
3. Confidence score (0-100)
4. Any visible material or purity marks

Respond in JSON format:
{
  "product_name": "string",
  "category": "string",
  "confidence": number,
  "material": "string",
  "notes": "string"
}`,
              },
            ],
          },
        ],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('OpenRouter error:', data)
      // Return mock response if API fails (for development)
      return NextResponse.json({
        product_name: 'Gold Jewellery Item',
        category: 'Ring',
        confidence: 85,
        material: 'Gold',
        notes: 'Unable to connect to AI service. Please review suggestions.',
      })
    }

    const content = data.choices[0].message.content
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {}

    return NextResponse.json({
      product_name: result.product_name || 'Jewellery Item',
      category: result.category || 'Other',
      confidence: result.confidence || 50,
      material: result.material,
      notes: result.notes,
    })
  } catch (error) {
    console.error('AI Analysis error:', error)
    return NextResponse.json(
      {
        error: 'Failed to analyze image',
        product_name: 'Jewellery Item',
        category: 'Other',
        confidence: 0,
      },
      { status: 500 }
    )
  }
}