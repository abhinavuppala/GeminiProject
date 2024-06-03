'use client'
import Image from "next/image";
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown';

export default function Draw() {
    const router = useRouter()
  
    // React hooks for temp input prompt
    let [response, setResponse] = useState("");
    let [image, setImage] = useState<File | null>(null);
    const GUESS_PROMPT = "Guess what this given image is supposed to be:";
  
    let loading = false;
    
    // processing and calling our backend api
    async function handleSubmission(event: MouseEvent)
    {
      if (loading == false && image != null)
        {
          loading=true;
          event.preventDefault();

          // body of POST request to send image
          const formData = new FormData();
          formData.append("file", image, image.name);
          formData.append("extension", image.name.split(".").pop()||"");
          console.log(image.name)
          
          // make post request, and display prompt result
          const requestOptions = {
            method: "POST",
            body: formData
          };
          fetch("http://127.0.0.1:5000/upload/", requestOptions).then(res=>res.json()).then(data=>
          {
            console.log(data);
            setResponse(data["generated"]);
          });
          loading = false;
      }
    }

    return (
      <main className="flex h-screen flex-col items-center justify-between p-24">
        <div className="h-full z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex-col space-y-16">
          <div className = "text-3xl">
            Draw Guessing
          </div>

            {/* File upload for image input */}
            <input
                type="file"
                name="myImage"
                accept=".jpeg, .png, .jpg"
                // Event handler to capture file selection and update the state
                onChange={(e) =>
                  {
                    // @ts-expect-error
                    console.log(e.target.files[0]); // Log the selected file
                    // @ts-expect-error
                    setImage(e.target.files[0]); // Update the state with the selected file
                }}
            />

            {/* Submit button */}
            <button onClick={(e)=> {
              // @ts-expect-error
              console.log("Submitted image "+image.name); handleSubmission(e);
            }}>
                SUBMIT
            </button>

            {/* image preview (only renders if image != null) */}
            {image && (<img src={URL.createObjectURL(image)} alt="No Image Selected" />)}
  
          {/* This code chunk is for the ai response to be displayed and flexes on overflow*/ }
          <div className="flex-col-reverse text-2xl h-3/5 overflow-y-scroll">
            <ReactMarkdown>
              {response}
            </ReactMarkdown>
          </div>

  
        </div>
      </main>
    );
  }
  