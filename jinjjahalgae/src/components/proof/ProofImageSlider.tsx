import React, { useState, useRef } from "react";

interface ProofImageSliderProps {
  images: string[];
}

const ProofImageSlider: React.FC<ProofImageSliderProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    if (sliderRef.current) {
      sliderRef.current.style.transition = "none";
    }
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const moveX = clientX - startX;
    setTranslateX(moveX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (sliderRef.current) {
      sliderRef.current.style.transition = "transform 0.3s ease-in-out";
    }
    const threshold = sliderRef.current?.clientWidth
      ? sliderRef.current.clientWidth / 4
      : 100;
    if (translateX < -threshold && currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (translateX > threshold && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
    setTranslateX(0);
  };

  const goToSlide = (index: number) => {
    if (sliderRef.current) {
      sliderRef.current.style.transition = "transform 0.3s ease-in-out";
    }
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div
        ref={sliderRef}
        className="flex"
        style={{
          transform: `translateX(calc(-${
            currentIndex * 100
          }% + ${translateX}px))`,
        }}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {images.map((imgSrc, index) => (
          <div key={index} className="flex-shrink-0 w-full">
            <img
              src={imgSrc}
              alt={`인증 사진 ${index + 1}`}
              className="w-full h-auto object-cover rounded-md select-none"
              draggable="false"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  "https://placehold.co/600x400/e5e7eb/6b7280?text=Image+Not+Found";
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-center my-3 space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentIndex === index ? "bg-[#2563eb]" : "bg-[#e5e7eb]"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProofImageSlider;
