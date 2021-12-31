import { useEffect, useRef, useState } from "react";
import "./styles.css";
import { getZoomBoxSize, getZoomBoxOffset, toDocumentBounds } from "./utils";

const ZoomImage = () => {
  const [hovered, setHovered] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const zoomBoxRef = useRef<HTMLDivElement>(null);
  const zoomedImageRef = useRef<HTMLImageElement>(null);
  const zoomWindowRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const imageBoundsRef = useRef(null);
  const zoomBoxBoundsRef = useRef(null);

  useEffect(() => {
    if (!loaded) return;
    (function setZoomBoxSize() {
      const { width, height } = getZoomBoxSize(
        imageRef.current,
        zoomWindowRef.current,
        zoomedImageRef.current
      );

      zoomBoxRef.current.style.width = width;
      zoomBoxRef.current.style.height = height;
    })();
  }, [loaded]);

  useEffect(() => {
    if (!loaded) return;
    imageBoundsRef.current = toDocumentBounds(
      imageRef.current.getBoundingClientRect()
    );
    zoomBoxBoundsRef.current = toDocumentBounds(
      zoomBoxRef.current.getBoundingClientRect()
    );
  }, [loaded]);

  function moveZoomedImage(xBoxOffset, yBoxOffset) {
    const xPercent = xBoxOffset / imageBoundsRef.current.width;
    const yPercent = yBoxOffset / imageBoundsRef.current.height;
    let xOffset =
      Math.round(zoomedImageRef.current.clientWidth * xPercent) * -1;
    let yOffset =
      Math.round(zoomedImageRef.current.clientHeight * yPercent) * -1;
    zoomedImageRef.current.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
  }

  function updateUI(mouseX, mouseY) {
    let { x: xOffset, y: yOffset } = getZoomBoxOffset(
      mouseX,
      mouseY,
      zoomBoxBoundsRef.current,
      imageBoundsRef.current
    );

    zoomBoxRef.current.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
    moveZoomedImage(xOffset, yOffset);
  }

  function handleMouseMove(event) {
    window.requestAnimationFrame(() => {
      updateUI(event.pageX, event.pageY);
    });
  }

  const isActive = hovered ? "active" : "";

  return (
    <div className="image-zoomer-demo">
      <div className="zoom-container">
        <img
          src="https://s3-us-west-1.amazonaws.com/willhastings.me/images/posts/building-vanilla-js-image-zoomer/original.jpg"
          alt="Spiral Galaxy"
          ref={imageRef}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onMouseMove={handleMouseMove}
          onLoad={() => setLoaded(true)}
        />
        <div
          className={"zoom-box " + isActive}
          ref={zoomBoxRef}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onMouseMove={handleMouseMove}
        />
      </div>
      <div className={"zoom-window " + isActive} ref={zoomWindowRef}>
        <img
          src="https://s3-us-west-1.amazonaws.com/willhastings.me/images/posts/building-vanilla-js-image-zoomer/original.jpg"
          alt="Spiral Galaxy"
          ref={zoomedImageRef}
        />
      </div>
    </div>
  );
};

export default function App() {
  return <ZoomImage />;
}
