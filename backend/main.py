# DIRECTIONS TO RUN:
# you will need to start a python venv to run the modules 
# Google how to create one if you haven't, and each time run:
# source .venv/bin/activate
# note: sometimes have to run . .venv/bin/activate Unsure why?
# once in the venv install dependencies listed in requirements.txt 
# python3 main.py (or python main.py)

#operational imports
import os
import tempfile
from dotenv import load_dotenv
load_dotenv()

#FASTAPI imports
import uvicorn
from fastapi import FastAPI, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse


#gemini/jupyter imports
import pathlib
import textwrap

import google.generativeai as genai

from IPython.display import display
from IPython.display import Markdown

# image processing imports
from PIL import Image
import io


#FASTAPI setup
app = FastAPI()

origins = ["*"]

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



#API routes

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/submit/{input}")
def gen_response(input:str):
    print(input)
    processedInp = "Answer with 50 words max: " + input 
    return {"generated": generateValue(processedInp.replace("_"," "))}

@app.post("/upload")
async def receive_file(file: UploadFile = File(...), extension: str = Form(...)):
    try:
        file_extension = extension.lower()
        if file_extension not in ['png', 'jpg', 'jpeg']:
            return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"message": "Unsupported file extension"})

        # Save the uploaded file to a temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_extension}") as temp_file:
            contents = await file.read()
            temp_file.write(contents)
            temp_file_path = pathlib.Path(temp_file.name)

        # Generate output from the saved image and delete the temporary file
        out = generateImageGuess(temp_file_path)
        temp_file_path.unlink()
        return {"generated": out}

    except Exception as e:
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"message": str(e)})




#gemini/jupyter setup
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')


genai.configure(api_key=GOOGLE_API_KEY, )
model = genai.GenerativeModel('gemini-1.5-flash')

#function needed to format gemini output provided by their documentation -- DONT DELETE
def to_markdown(text):
  text = text.replace('•', '  *')
  return textwrap.indent(text, '> ', predicate=lambda _: True)

# text input -> text output using Gemini API
def generateValue(input):
    response = model.generate_content(input)
    return to_markdown(response.text)

# image & premade prompt -> Gemini text output
def generateImageGuess(img_path):
    prompt_parts = [
        genai.upload_file(img_path),
        "Input: Guess what this given image is supposed to be:",
        "Output (Answer with 50 words max): ",
    ]
    response = model.generate_content(prompt_parts)
    #genai.delete_file(img_path)
    return to_markdown(response.text)


#Uvicorn routing setup
if __name__ == "__main__":
    uvicorn.run("main:app", port=5000, reload=True)