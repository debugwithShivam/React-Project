import React from 'react'
import OrderProduct from "./Orderproductdata";
export default function OrderProductList() {
    let { data } = OrderProduct();
  let sum = 0;

  let totalPrice = data?.reduce((sum, item) => {
    return sum + item.total_price * item.quantity;
  }, 0);

  const discount = totalPrice * 0.05;
  const tax = totalPrice * 0.02;
  const total = totalPrice - discount + tax;
  return (
    <aside className="flex w-full max-w-sm shrink-0 flex-col border-l border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 px-5 py-4">
        <p className="text-sm text-neutral-400">Order</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {data?.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="h-12 w-12 shrink-0 rounded-lg bg-neutral-100">
              <img
                src={item.image}
                className="w-full h-full object-contain"
                alt=""
              />
            </div>
            <div className="flex-1 text-sm">
              <p className="font-medium text-neutral-900">
                {item.product_name}
              </p>
              <p className="text-xs text-neutral-400">
                quantity {item.size} {item.quantity}
              </p>
            </div>
            <p className="text-sm font-semibold text-neutral-900">
              ${item.total_price}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-1.5 border-t border-neutral-200 px-5 py-4 text-sm">
        {data?.map((item) => (
          <div
            key={item.order_id}
            className="flex justify-between text-neutral-500"
          >
            <span>
              {item.product_name} ({item.quantity}x)
            </span>
            <span className="text-neutral-900">
              ${(item.product_price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}

        <div className="flex justify-between pt-1 text-base font-semibold text-neutral-900">
          <span>Total Amount</span>
          <span>${totalPrice}</span>
        </div>
      </div>
    </aside>
  );
}


