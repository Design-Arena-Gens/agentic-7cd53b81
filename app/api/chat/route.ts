import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      )
    }

    const systemPrompt = `You are a helpful and empathetic customer support agent. Your role is to:
- Assist customers with their questions and concerns
- Provide clear, accurate, and friendly responses
- Show empathy and understanding
- Offer solutions and troubleshooting steps when needed
- Escalate complex issues when appropriate
- Be professional yet personable

Always aim to resolve customer issues efficiently while maintaining a positive, supportive tone.`

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((msg: Message) => ({
        role: msg.role,
        content: msg.content,
      })),
    })

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : 'I apologize, but I encountered an error processing your request.'

    return NextResponse.json({
      message: assistantMessage,
    })
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
