"use client";

import Head from "next/head";
import dynamic from "next/dynamic";

// Use dynamic loading to fix document undefined error
const FaceLandmarkCanvas = dynamic(
  () => {
    return import("../components/FaceLandmarkCanvas");
  },
  { ssr: false }
);

export default function Home() {
  return (
    <div className="flex flex-col items-center px-2 pt-10 bg-gradient-to-r from-purple-300 to-blue-500 min-h-screen text-white">
      <Head>
        <title>VisuEmoLink</title>
      </Head>
      <h1 className="text-xl md:text-4xl font-bold mb-2 text-shadow text-center">
        VisuEmoLink
      </h1>
      <div className="flex justify-center w-full">
        <FaceLandmarkCanvas />
      </div>
    </div>
  );
}
