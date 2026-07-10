import React ,{useEffect} from 'react'
import { useProducts } from '../../CenterProductData';
import ProductsCard from '../Product/Productscard';
const ChooseCard = React.memo(function childe() {
      let { data } = useProducts();
      const randomProducts = data
        ?.sort(() => Math.random() - 0.5)
        .slice(0, 8);
    

  return (
  <div className="grid grid-cols-4">
        {randomProducts?.map((item, i) => (
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
  )
})

export default ChooseCard