import os
import google.generativeai as genai

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-3.5-flash")
response = model.generate_content("Say hello")
print(response.text)
