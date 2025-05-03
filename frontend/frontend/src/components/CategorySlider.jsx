import React, { useRef, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axiosInstance from "../lib/axios";
import "swiper/css";
import "swiper/css/navigation";

const CategorySlider = () => {
  const [categories, setCategories] = useState([]);
  const swiperRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get(
          "/product/getcategorieswithpicture"
        );
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Utility to chunk array
  const chunkArray = (arr, size) => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    );
  };

  // Determine group size per slide based on screen width
  const getGroupSize = () => {
    if (typeof window !== "undefined") {
      const width = window.innerWidth;
      if (width < 640) return 1; // mobile
      if (width < 1024) return 2; // tablet
    }
    return 3; // desktop
  };

  const [groupSize, setGroupSize] = useState(getGroupSize());

  useEffect(() => {
    const handleResize = () => setGroupSize(getGroupSize());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const chunkedCategories = chunkArray(categories, groupSize);

  return (
    <div className="bg-black h-[500px] flex items-center justify-center shadow-lg text-white relative">
      <div className="w-full max-w-6xl px-4 relative">
        {/* Navigation Buttons */}
        <button
          onClick={() => swiperRef.current?.slidePrev()}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 bg-white text-black p-3 rounded-full shadow-lg z-10 hover:bg-gray-200 transition"
        >
          <ChevronLeft size={28} />
        </button>
        <button
          onClick={() => swiperRef.current?.slideNext()}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 bg-white text-black p-3 rounded-full shadow-lg z-10 hover:bg-gray-200 transition"
        >
          <ChevronRight size={28} />
        </button>

        {/* Swiper */}
        <Swiper
          slidesPerView={1}
          spaceBetween={30}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          modules={[Navigation]}
          className="px-6"
        >
          {chunkedCategories.map((group, index) => (
            <SwiperSlide key={index}>
              <div className="flex justify-center gap-6 flex-wrap md:flex-nowrap">
                {group.map((category, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-4 shadow-xl hover:scale-105 hover:shadow-2xl transition duration-300 w-full sm:w-[140px] md:w-auto mx-10"
                  >
                    <img
                      src={category.cloudinary_url}
                      alt={category.name}
                      className="w-32 h-32 md:w-28 md:h-28 rounded-full object-cover shadow-md"
                    />
                    <p className="text-md mt-4 font-semibold text-center">
                      {category.name}
                    </p>
                  </div>
                ))}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default CategorySlider;
