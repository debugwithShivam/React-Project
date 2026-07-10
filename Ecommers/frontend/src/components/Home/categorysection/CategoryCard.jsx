export default function CategoryCard({
  title,
  description,
  image,
  className,
  imageClass,
  layout,
}) {
  const baseStyle = `
    group
    relative
    overflow-hidden
    rounded-3xl
    border border-white/10
    bg-gradient-to-br from-[#09061a] to-[#131b52]
    backdrop-blur-xl
    transition-all duration-500
    hover:-translate-y-2
  `;

  return (
    <div className={`${baseStyle} ${className}`}>
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

      {layout === "vertical" && (
        <div className="flex h-full flex-col justify-between p-6">
          <div className="flex justify-center">
            <img
              src={image}
              alt={title}
              className={`${imageClass} transition duration-500 group-hover:scale-110`}
            />
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">{title}</h2>
            <p className="mt-4 text-gray-300 leading-7">{description}</p>
          </div>
        </div>
      )}

      {layout === "horizontal-left" && (
        <div className="flex h-full items-center justify-between p-6">
          <img
            src={image}
            alt={title}
            className={`${imageClass} transition duration-500 group-hover:scale-110`}
          />

          <div className="max-w-[260px]">
            <h2 className="text-3xl font-bold text-white">{title}</h2>
            <p className="mt-3 text-gray-300 leading-7">{description}</p>
          </div>
        </div>
      )}

      {layout === "horizontal-right" && (
        <div className="flex h-full items-center justify-between p-6">
          <div className="max-w-[260px]">
            <h2 className="text-3xl font-bold text-white">{title}</h2>
            <p className="mt-3 text-gray-300 leading-7">{description}</p>
          </div>

          <img
            src={image}
            alt={title}
            className={`${imageClass} transition duration-500 group-hover:scale-110`}
          />
        </div>
      )}

      {/* Center Layout */}
      {layout === "center" && (
        <div className="flex h-full flex-col items-center justify-center p-6">
          <h2 className="text-3xl font-bold text-white">{title}</h2>

          <img
            src={image}
            alt={title}
            className={`${imageClass} mt-6 transition duration-500 group-hover:scale-110`}
          />
        </div>
      )}
    </div>
  );
}