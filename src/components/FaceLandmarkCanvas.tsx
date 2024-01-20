"use client";

import { useEffect, useRef, useState } from "react";
import DrawLandmarkCanvas from "./DrawLandmarkCanvas";
import AvatarCanvas from "./AvatarCanvas";
import FaceLandmarkManager from "@/class/FaceLandmarkManager";
import ReadyPlayerCreator from "./ReadyPlayerCreator";
import * as faceapi from '@vladmandic/face-api'

const MODEL_PATH = '/models'

const FaceLandmarkCanvas = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastVideoTimeRef = useRef(-1);
  const requestRef = useRef(0);
  const [avatarView, setAvatarView] = useState(true);
  const [showAvatarCreator, setShowAvatarCreator] = useState(false);
  const [modelUrl, setModelUrl] = useState(
    "https://models.readyplayer.me/6581791b2409a9414a9f3f76.glb?morphTargets=ARKit"
  );
  const [videoSize, setVideoSize] = useState<{
    width: number;
    height: number;
  }>();



  const toggleAvatarView = () => setAvatarView((prev) => !prev);
  const toggleAvatarCreatorView = () => setShowAvatarCreator((prev) => {
    const emoji = document.getElementById("emoji");
    if (!prev) {
      emoji!.className = "emoji hidden"
    } else {
      emoji!.className = "emoji z-40"
    }
    return !prev
  });
  const handleAvatarCreationComplete = (url: string) => {
    setModelUrl(url);
    toggleAvatarCreatorView();
  };

  const setupTensorFlow = async () => {
    // @ts-ignore
    await faceapi.tf.setBackend('webgl');
    // @ts-ignore
    await faceapi.tf.enableProdMode();
    // @ts-ignore
    await faceapi.tf.ENV.set('DEBUG', false);
    // @ts-ignore
    await faceapi.tf.ready();
  }

  const setUpModel = async () => {
    await faceapi.nets.tinyFaceDetector.load(MODEL_PATH)
    await faceapi.nets.faceLandmark68Net.load(MODEL_PATH)
    await faceapi.nets.faceRecognitionNet.load(MODEL_PATH)
    await faceapi.nets.faceExpressionNet.load(MODEL_PATH)
  }

  const animate = () => {
    if (
      videoRef.current &&
      videoRef.current.currentTime !== lastVideoTimeRef.current
    ) {
      lastVideoTimeRef.current = videoRef.current.currentTime;
      try {
        const faceLandmarkManager = FaceLandmarkManager.getInstance();
        faceLandmarkManager.detectLandmarks(videoRef.current, Date.now());
      } catch (e) {
        console.log(e);
      }
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect( () => {
    const getUserCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setVideoSize({
              width: videoRef.current!.offsetWidth,
              height: videoRef.current!.offsetHeight,
            });
            videoRef.current!.play();

            // Start animation once video is loaded
            requestRef.current = requestAnimationFrame(animate);
          };
        }
      } catch (e) {
        console.log(e);
        alert("Failed to load webcam!");
      }
    };

    const setup = async () => {
      await setupTensorFlow()
      await setUpModel()
      await getUserCamera()
    }

    setup()
    if (videoRef.current) {
      const video = videoRef.current;
      video.addEventListener("play", videoEvent)
      return () => {
        cancelAnimationFrame(requestRef.current);
        video.removeEventListener("play", videoEvent);
      }
    } else {
      return () => {
        cancelAnimationFrame(requestRef.current);
      }
    }
  }, []);

  const videoEvent = () => {
    const video = videoRef.current as HTMLVideoElement
    const canvas = faceapi.createCanvasFromMedia(video);
    canvas.id = "emoji"
    canvas.className = "emoji z-40"
    const parent = document.getElementById("video")?.parentNode;
    parent?.appendChild(canvas)
    const displaySize = { width: video.offsetWidth, height: video.offsetHeight }
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      resizedDetections.forEach((detection: faceapi.WithFaceExpressions<faceapi.WithFaceLandmarks<{
        detection: faceapi.FaceDetection;
    }, faceapi.FaceLandmarks68>>) => {
        const emotions: faceapi.FaceExpressions = detection.expressions;
        const dominantEmotion: string = getDominantEmotion(emotions);
        const emoji = getEmojiFromEmotion(dominantEmotion);

        drawEmoji(canvas, emoji);
      })
    })
  }


  const getDominantEmotion = (expressions: faceapi.FaceExpressions): string => {
    let maxEmotion = ""
    let maxProbability = 0;

    Object.entries(expressions).forEach(([emotion, probability]) => {
      if (probability > maxProbability) {
        maxEmotion = emotion;
        maxProbability = probability;
      }
    });
    return maxEmotion;
  }

  const getEmojiFromEmotion = (emotion: string): string => {
    switch (emotion) {
      case "happy":
        return "😄";
      case "sad":
        return "😢";
      case "angry":
        return "😡";
      case "surprised":
        return "😳";
      case "fearful":
        return "😱";
      case "disgusted":
        return "😩";
      case "neutral":
        return "😐";
      default:
        return "😐";
    }
  }

  const drawEmoji = (canvas: HTMLCanvasElement, emoji: string) => {
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    const fontSize = 150;
    const margin = 20;

    context.font = `${fontSize}px Arial`
    context.fillStyle = "white";

    const position = { x: canvas.width - fontSize, y: fontSize + 50 };
    context.fillText(emoji, position.x - margin, position.y + margin);
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-center gap-10 mt-5 mb-10">
        <button
          className="self-end bg-purple-700 hover:bg-purple-600 transition text-white px-2 py-1 rounded mb-2 shadow-md text-sm sm:text-base"
          onClick={toggleAvatarCreatorView}
        >
          {"アバターを作成する"}
        </button>
      </div>
      <div id="relative" className="flex justify-center">
        <video
          id="video"
          className="w-9/12 h-auto absolute"
          ref={videoRef}
          loop={true}
          muted={true}
          autoPlay={true}
          playsInline={true}
        ></video>
        {videoSize && (
          <>
            {showAvatarCreator && (
              <ReadyPlayerCreator
                width={videoSize.width}
                height={videoSize.height}
                handleComplete={handleAvatarCreationComplete}
              />
            )}
            {avatarView ? (
              <>
                <AvatarCanvas
                  width={videoSize.width}
                  height={videoSize.height}
                  url={modelUrl}
                />
              </>
            ) : (
              <DrawLandmarkCanvas
                width={videoSize.width}
                height={videoSize.height}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FaceLandmarkCanvas;
