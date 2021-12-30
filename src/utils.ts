function getZoomBoxSize(image, zoomWindow, zoomedImage) {
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

export { getZoomBoxSize, isWithinImage, getZoomBoxOffset, toDocumentBounds };
