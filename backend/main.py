# DIRECTIONS TO RUN:
# you will need to start a python venv to run the modules 
# Google how to create one if you haven't, and each time run:
# source .venv/bin/activate
# once in the venv install dependencies listed in requirements.txt 
# python3 main.py (or python main.py)

#FASTAPI imports
import uvicorn
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware


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

@app.get("/")
def read_root():
    return {"Hello": "World"}


#gemini/jupyter imports
import pathlib
import textwrap

import google.generativeai as genai

from IPython.display import display
from IPython.display import Markdown

from google.colab import userdata

#gemini/jupyter setup

def to_markdown(text):
  text = text.replace('•', '  *')
  return Markdown(textwrap.indent(text, '> ', predicate=lambda _: True))

genai.configure(api_key="AIzaSyCeR6Cm1tcR-FymIe5NB7k1kv69_xmI59Q")

if __name__ == "__main__":
    uvicorn.run("main:app", port=5000, reload=True)