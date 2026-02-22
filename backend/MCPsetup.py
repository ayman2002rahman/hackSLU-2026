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
      "inventory": [
        {
        "product_name": "<Product Name>",
        "stock": <current stock>,
        "restock_quantity": <integer>,
        "priority": "<low|medium|high>"
        }
      ]

    Do not include explanations, markdown, or extra characters. Only return valid JSON. If you do not see any data return an open {}. Enssure indentation is correct for JSON. Here is the data: '''
    + 
    '''{
	    "inventory": [
		    {
			    "sku": "Turkey",
			    "stock": 50,
			    "Past Sales in 14 Days": 60,
			    "Holiday": "Thanksgiving"
		    },
		    {
			    "sku": "Swimsuits",
			    "stock": 300,
			    "Past Sales in 14 Days": 6,
			    "Holiday": "Thanksgiving"
		    }
	    ]
    }'''


  )
  return response.text

print(geminiCall())