import categoryData from "./categoryImage/categoryImageConfig";
import CategoryCard from "./CategoryCard";
export default function Category() {
  return (
    <section className="min-h-screen  px-6 py-12">
      <div className="mx-auto max-w-[1600px]">
        <h1 className="mb-10 text-center text-5xl font-bold text-black">
          Top Categories
        </h1>

        <div className="grid h-[700px] m-10 grid-cols-4 grid-rows-2 gap-5">
          {categoryData.map((item) => (
            <CategoryCard key={item.id} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}