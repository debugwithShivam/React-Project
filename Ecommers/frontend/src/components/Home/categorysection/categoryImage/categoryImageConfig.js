import image1 from './categoryimg1.png'
import image2 from './categoryimg2.png'
import image3 from './categoryimg3.png'
import image4 from './categoryimg4.png'
import image5 from './categoryimg5.png'

const categoryData = [
  {
    id: 1,
    title: "Street Style",
    description:
      "Bold graphic tees and statement apparel designed to stand out in every room, with rich textures and strong color.",
    image: image1,
    className: "col-span-1 row-span-2",
    imageClass: "w-[260px]",
    layout: "vertical",
  },
  {
    id: 2,
    title: "Work Zone",
    description:
      "Sleek monitors and minimalist desks built for productive workdays, with clean lines and premium finishes.",
    image: image2,
    className: "col-span-2 row-span-1",
    imageClass: "w-[300px]",
    layout: "horizontal-left",
  },
  {
    id: 3,
    title: "Gaming Room",
    description:
      "High-performance consoles and immersive setups for long game nights.",
    image: image3,
    className: "col-span-1 row-span-1",
    imageClass: "w-[170px]",
    layout: "horizontal-left",
  },
  {
    id: 4,
    title: "Audio Space",
    description: "Premium sound experience.",
    image: image5,
    className: "col-span-1 row-span-1",
    imageClass: "w-[200px]",
    layout: "center",
  },
  {
    id: 5,
    title: "Mobile Tech",
    description:
      "Premium mobile devices and smart accessories designed for modern life.",
    image: image4,
    className: "col-span-2 row-span-1",
    imageClass: "absolute bottom-0 right-0 w-74",
    layout: "horizontal-right",
  },
];

export default categoryData;