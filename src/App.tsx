import { useEffect, useRef } from "react";
import "./styles.css";

function getZoomBoxSize(zoomBox, image, zoomWindow, zoomedImage) {
  let widthPercentage = zoomWindow.clientWidth / zoomedImage.clientWidth;
  let heightPercentage = zoomWindow.clientHeight / zoomedImage.clientHeight;
  return {
    width: Math.round(image.clientWidth * widthPercentage) + "px",
    height: Math.round(image.clientHeight * heightPercentage) + "px"
  };
}

function isWithinImage(imageBounds, event) {
  let { bottom, left, right, top } = imageBounds;
  let { pageX, pageY } = event;

  return pageX > left && pageX < right && pageY > top && pageY < bottom;
}

function containNum(num, lowerBound, upperBound) {
  if (num < lowerBound) {
    return lowerBound;
  }
  if (num > upperBound) {
    return upperBound;
  }
  return num;
}

function getZoomBoxOffset(mouseX, mouseY, zoomBoxBounds, imageBounds) {
  let x = mouseX - zoomBoxBounds.width / 2;
  let y = mouseY - zoomBoxBounds.height / 2;

  x = containNum(x, imageBounds.left, imageBounds.right - zoomBoxBounds.width);
  y = containNum(y, imageBounds.top, imageBounds.bottom - zoomBoxBounds.height);

  x -= zoomBoxBounds.left;
  y -= zoomBoxBounds.top;

  return { x: Math.round(x), y: Math.round(y) };
}

function toDocumentBounds(bounds) {
  let { scrollX, scrollY } = window;
  let { bottom, height, left, right, top, width } = bounds;

  return {
    bottom: bottom + scrollY,
    height,
    left: left + scrollX,
    right: right + scrollX,
    top: top + scrollY,
    width
  };
}

const ZoomImage = () => {
  const zoomBoxRef = useRef<HTMLDivElement>(null);
  const zoomedImageRef = useRef<HTMLImageElement>(null);
  const zoomWindowRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const moveScheduledRef = useRef(false);
  const imageBoundsRef = useRef(null);
  const zoomBoxBoundsRef = useRef(null);

  useEffect(() => {
    const { width, height } = getZoomBoxSize(
      zoomBoxRef.current,
      imageRef.current,
      zoomWindowRef.current,
      zoomedImageRef.current
    );
    zoomBoxRef.current.style.width = width;
    zoomBoxRef.current.style.height = height;

    listenForMouseEnter();

    imageBoundsRef.current = toDocumentBounds(
      imageRef.current?.getBoundingClientRect()
    );
    zoomBoxBoundsRef.current = toDocumentBounds(
      zoomBoxRef.current?.getBoundingClientRect()
    );
  }, []);

  function handleMouseMove(event) {
    if (moveScheduledRef.current) {
      return;
    }
    window.requestAnimationFrame(() => {
      if (isWithinImage(imageBoundsRef.current, event)) {
        updateUI(event.pageX, event.pageY);
      } else {
        deactivate();
      }
      moveScheduledRef.current = false;
    });
    moveScheduledRef.current = true;
  }

  function activate() {
    zoomBoxRef.current.classList.add("active");
    zoomWindowRef.current.classList.add("active");
    listenForMouseMove();
  }

  function deactivate() {
    zoomBoxRef.current.classList.remove("active");
    zoomWindowRef.current.classList.remove("active");
    listenForMouseEnter();
  }

  function listenForMouseEnter() {
    document.body.removeEventListener("mousemove", handleMouseMove);
    imageRef.current.addEventListener("mouseenter", activate);
    zoomBoxRef.current.addEventListener("mouseenter", activate);
  }

  function listenForMouseMove() {
    imageRef.current.removeEventListener("mouseenter", activate);
    zoomBoxRef.current.removeEventListener("mouseenter", activate);
    document.body.addEventListener("mousemove", handleMouseMove);
  }

  function moveZoomedImage(xPercent, yPercent) {
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
    moveZoomedImage(
      xOffset / imageBoundsRef.current.width,
      yOffset / imageBoundsRef.current.height
    );
  }

  return (
    <div className="image-zoomer-demo">
      <div className="zoom-container">
        <img
          src="https://s3-us-west-1.amazonaws.com/willhastings.me/images/posts/building-vanilla-js-image-zoomer/original.jpg"
          alt="Spiral Galaxy"
          ref={imageRef}
        />
        <div className="zoom-box" ref={zoomBoxRef} />
      </div>
      <div className="zoom-window" ref={zoomWindowRef}>
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
