import os
from google import genai
from google.genai import types
from .models import Message

SYSTEM_PROMPT = "You are a helpful assistant. Answer clearly and concisely."

def get_ai_response(conversation) -> str:
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise RuntimeError('GEMINI_API_KEY is not configured')

    client = genai.Client(api_key=api_key)
    messages = Message.objects.filter(conversation=conversation).values('role', 'content')

    history =[
        types.Content(
            role = 'user' if m['role'] == 'user' else 'model',
            parts = [types.Part(text=m['content'])]
        )
        for m in messages
    ]

    response = client.models.generate_content(
        model=os.getenv('GEMINI_MODEL', 'gemini-2.5-flash'),
        config=types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT),
        contents=history,
    )
    if not response.text:
        raise RuntimeError('Gemini returned an empty response')

    return response.text
