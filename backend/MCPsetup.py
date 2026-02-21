from google import genai
import pandas as pd
from dotenv import load_dotenv
import os

load_dotenv()  # reads .env into environment
GEMINI_API_KEY = os.getenv("GEMINI_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_KEY not set. Add it to a .env file or your environment.")

client = genai.Client(api_key=GEMINI_API_KEY)

def geminiCall():
  response = client.models.generate_content(
    model="gemini-3-flash-preview", contents= 
    '''You are an inventory assistant. I will provide store data as CSV. 
      Please generate restock suggestions in **strict JSON format**, following this schema:
`
    [ 
      {
      "sku": "<SKU>",
      "product_name": "<Product Name>",
      "restock_quantity": <integer>,
      "priority": "<low|medium|high>"
      }
    ]

    Do not include explanations, markdown, or extra characters. Only return valid JSON. If you do not see any data return an open bracket'''

  )
  return response.text

print(geminiCall())