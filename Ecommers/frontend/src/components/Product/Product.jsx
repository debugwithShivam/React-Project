import React, { useState } from "react";
import Hero from "./Hero";
import ProductsCard from "./Productscard";
import { useProducts } from "../../CenterProductData";

// Sub-categories for each main category
const subCategoryMap = {
  All: [],
  Books: ["All Books", "Fiction", "Non-Fiction", "Science", "Biography"],
  Clothing: ["All Clothing", "T-Shirts", "Jackets", "Hoodies", "Sportswear", "Accessories"],
  Electronics: ["All Electronics", "Mobiles", "Laptops", "Audio", "Gaming", "Accessories"],
  Footwear: ["All Footwear", "Sneakers", "Formal", "Sandals", "Sports", "Boots"],
  "Home & Kitchen": ["All Kitchen", "Cookware", "Storage", "Appliances", "Decor"],
};

const mainCategories = ["All", "Books", "Clothing", "Electronics", "Footwear", "Home & Kitchen"];

export default function Product() {
  const { data } = useProducts();
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSubCategory, setActiveSubCategory] = useState("All");

  // Handle main category click
  function handleCategoryClick(cat) {
    setActiveCategory(cat);
    setActiveSubCategory("All"); // reset sub-category on main change
  }

  // Filter products based on selected category and sub-category
  const filteredProducts = data?.filter((item) => {
    // If "All" selected, show every product
    if (activeCategory === "All") return true;

    // Main category match
    const catMatch = item.category === activeCategory;
    if (!catMatch) return false;

    // If sub-category is "All ..." or "All", show all of this category
    if (activeSubCategory === "All" || activeSubCategory.startsWith("All ")) return true;

    // Sub-category match by brand name (case-insensitive partial match)
    const brandMatch =
      item.brand?.toLowerCase().includes(activeSubCategory.toLowerCase()) ||
      item.title?.toLowerCase().includes(activeSubCategory.toLowerCase()) ||
      item.name?.toLowerCase().includes(activeSubCategory.toLowerCase());

    return brandMatch;
  });

  const subCategories = subCategoryMap[activeCategory] || [];

  return (
    <div className="relative top-16">
      {/* ── Main Category Bar ── */}
      <div className="bg-[#D75A3C] h-12 text-center sticky top-0 z-30">
        <ul className="h-full flex justify-center items-center text-white gap-6 font-medium cursor-pointer px-4">
          {mainCategories.map((cat) => (
            <li
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-3 py-1 rounded-full transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-white text-[#D75A3C] font-bold"
                  : "hover:bg-white/20"
              }`}
            >
              {cat}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Sub-Category Bar (shows only when a specific category is selected) ── */}
      {activeCategory !== "All" && subCategories.length > 0 && (
        <div className="bg-[#f5c5b8] py-2 px-4 flex gap-3 flex-wrap justify-center sticky top-12 z-20 shadow-md">
          {subCategories.map((sub) => (
            <button
              key={sub}
              onClick={() => setActiveSubCategory(sub)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all duration-200 ${
                activeSubCategory === sub
                  ? "bg-[#D75A3C] text-white border-[#D75A3C]"
                  : "bg-white text-[#D75A3C] border-[#D75A3C] hover:bg-[#D75A3C] hover:text-white"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      <Hero />

      {/* ── Products Section ── */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-[250px] shrink-0 m-2 p-3 font-bold text-[#D75A3C]">
          <ul>
            <li className="mb-3 cursor-pointer hover:underline">BEST PRODUCT</li>
            <li className="mb-3 cursor-pointer hover:underline">TOP 10 PRODUCT</li>
            <li
              className="mb-3 cursor-pointer hover:underline"
              onClick={() => handleCategoryClick("All")}
            >
              ALL CATEGORY
            </li>
            <li className="mb-3 cursor-pointer hover:underline">BUY ANY THING</li>
            <li className="mb-3 cursor-pointer hover:underline">SHOP NOW</li>
          </ul>

          {/* Active filter info */}
          <div className="mt-6 p-3 bg-[#fff3f0] rounded-xl border border-[#D75A3C]">
            <p className="text-xs text-gray-500 font-medium uppercase mb-1">Active Filter</p>
            <p className="text-sm text-[#D75A3C]">
              📁 {activeCategory}
            </p>
            {activeCategory !== "All" && (
              <p className="text-sm text-gray-600 mt-1">
                🏷️ {activeSubCategory}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              {filteredProducts?.length ?? 0} products found
            </p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 p-4">
          {filteredProducts?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <span className="text-5xl mb-4">🔍</span>
              <p className="text-xl font-semibold">No products found</p>
              <p className="text-sm mt-2">Try selecting a different category or sub-category</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filteredProducts?.map((item, i) => (
                <ProductsCard
                  key={i}
                  id={item.id}
                  brand={item.brand}
                  category={item.category}
                  color={item.color}
                  delivery={item.delivery}
                  description={item.description}
                  image={item.image}
                  name={item.name}
                  offer={item.offer}
                  price={item.price}
                  rating={item.rating}
                  size={item.size}
                  stock={item.stock}
                  title={item.title}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
