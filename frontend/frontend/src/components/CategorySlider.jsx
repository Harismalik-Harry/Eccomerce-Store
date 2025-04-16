import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";

const categories = [
  { name: "Electronics", img: "/images/electronics.jpg" },
  { name: "Fashion", img: "/images/fashion.jpg" },
  { name: "Home", img: "/images/home.jpg" },
  { name: "Beauty", img: "/images/beauty.jpg" },
  { name: "Sports", img: "/images/sports.jpg" },
  { name: "Toys", img: "/images/toys.jpg" },
  { name: "Automobile", img: "/images/automobile.jpg" },
  { name: "Books", img: "/images/books.jpg" },
  { name: "Health", img: "/images/health.jpg" },
  { name: "Groceries", img: "/images/groceries.jpg" },
  { name: "Gaming", img: "/images/gaming.jpg" },
  { name: "Music", img: "/images/music.jpg" },
];

const CategorySlider = () => {
  const swiperRef = useRef(null);

  return (
    <div className="bg-black py-6 shadow-md relative text-white">
      <div className="container mx-auto px-6">
        <button
          onClick={() => swiperRef.current?.slidePrev()}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-300 p-3 rounded-full shadow-md z-10 hover:bg-gray-400"
        >
          <ChevronLeft size={32} />
        </button>
        <button
          onClick={() => swiperRef.current?.slideNext()}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-300 p-3 rounded-full shadow-md z-10 hover:bg-gray-400"
        >
          <ChevronRight size={32} />
        </button>
        <Swiper
          slidesPerView={1}
          spaceBetween={15}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          modules={[Navigation]}
          className="px-10"
        >
          {Array.from(
            { length: Math.ceil(categories.length / 9) },
            (_, index) => (
              <SwiperSlide key={index}>
                <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-3">
                  {categories
                    .slice(
                      index * 9,
                      index * 9 + (window.innerWidth < 768 ? 6 : 9)
                    )
                    .map((category, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <img
                          src={category.img}
                          alt={category.name}
                          className="w-32 h-32 md:w-28 md:h-28 rounded-full object-cover shadow-md"
                        />
                        <p className="text-md mt-3 font-semibold">
                          {category.name}
                        </p>
                      </div>
                    ))}
                </div>
              </SwiperSlide>
            )
          )}
        </Swiper>
      </div>
    </div>
  );
};

export default CategorySlider;
