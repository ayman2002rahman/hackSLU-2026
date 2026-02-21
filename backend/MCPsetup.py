from google import genai
import pandas as pd

client = genai.Client(api_key="AIzaSyBpIFjuK6KXObx-tRplqSDWEWjkKwt3anY")

response = client.models.generate_content(
    model="gemini-3-flash-preview", contents= 
    '''You are an inventory assistant. I will provide store data as CSV. 
Please generate restock suggestions in **strict JSON format**, following this schema:

[
  {
    "sku": "<SKU>",
    "product_name": "<Product Name>",
    "restock_quantity": <integer>,
    "priority": "<low|medium|high>"
  }
]

Do not include explanations, markdown, or extra characters. Only return valid JSON.'''
)

print(response.text)