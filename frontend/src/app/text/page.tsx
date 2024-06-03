"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const router = useRouter();

  // React hooks for temp input prompt
  let [response, setResponse] = useState("");
  let [input, setInput] = useState("");

  let loading = false;

  // processing and calling our backend api
  async function handleSubmission(event: KeyboardEvent) {
    if (event.keyCode === 13 && loading == false) {
      loading = true;
      event.preventDefault();
      let filteredInp = input.split(" ").join("_");
      console.log("http://127.0.0.1:5000/submit/" + filteredInp);

      // make backend call, get JSON & display prompt result
      fetch("http://127.0.0.1:5000/submit/" + filteredInp)
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          setResponse(data["generated"]);
        });
      setInput("");
      loading = false;
    }
  }
  return (
    <main className="flex h-screen flex-col items-center justify-between p-24">
      <div className="h-full z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex-col space-y-16">
        <div className="text-3xl">Gemini Project - Abhi and Kyle</div>
        {/* This code chunk is for the ai response to be displayed and flexes on overflow*/}
        <div className="flex-col-reverse text-2xl h-3/5 overflow-y-scroll">
          <ReactMarkdown>{response}</ReactMarkdown>
        </div>

        {/* This code chunk is for the user input*/}
        <div className="rounded-xl h-1/5 pt">
          <textarea
            id="message"
            className=" h-full block p-2.5 w-full text-lg text-stone-700 rounded-lg bg-gray-200 border-2 border-xl border-gray-500 focus:border-stone-700 focus:text-stone-700 placeholder:focus:text-stone-700"
            placeholder="Write your thoughts here..."
            // ignore this error message below. It is due to typescript incompatability, but wont cause any bugs
            // @ts-expect-error
            onKeyDown={(e) => handleSubmission(e)}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }}
          ></textarea>
        </div>
      </div>
    </main>
  );
}
