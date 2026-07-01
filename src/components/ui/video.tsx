/**
 * Video Player Component
 *
 * Video player based on video-react wrapper.
 * Supports custom poster, autoplay, mute, controls, and aspect ratio.
 *
 * Usage:
 * <Video
 *   src="https://example.com/video.mp4"
 *   poster="https://example.com/poster.png"
 * />
 */

import {
  Player,
  BigPlayButton,
  ControlBar,
  PlayToggle,
  CurrentTimeDisplay,
  TimeDivider,
  DurationDisplay,
  FullscreenToggle,
  VolumeMenuButton,
  ProgressControl,
} from "video-react";

import "video-react/dist/video-react.css";
import "./video.css";

import { cn } from "@/lib/utils";

interface VideoProps {
  /** Video URL */
  src: string;

  /** Poster image URL */
  poster?: string;

  /** Custom class name */
  className?: string;

  /** Autoplay */
  autoPlay?: boolean;

  /** Mute */
  muted?: boolean;

  /** Show controls */
  controls?: boolean;

  /** Aspect Ratio */
  aspectRatio?: "auto" | "16:9" | "4:3" | (string & {});
}

export default function Video({
  className,
  src,
  poster,
  autoPlay = false,
  muted = false,
  controls = true,
  aspectRatio = "auto",
}: VideoProps) {
  return (
    <div className={cn("min-w-[100px]", className)}>
      <Player
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        fluid={aspectRatio === "auto"}
        aspectRatio={aspectRatio === "auto" ? undefined : aspectRatio}
      >
        <BigPlayButton position="center" />

        {controls && (
          <ControlBar autoHide>
            <PlayToggle />
            <CurrentTimeDisplay />
            <TimeDivider />
            <DurationDisplay />
            <ProgressControl />
            <VolumeMenuButton />
            <FullscreenToggle />
          </ControlBar>
        )}
      </Player>
    </div>
  );
}