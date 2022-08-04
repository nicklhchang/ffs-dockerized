import React, { useRef, useEffect } from 'react'
import { useDashboardContext } from '../app-context/dashboardContext';
import { useAlertContext } from '../app-context/alertContext';
import Alert from '../components/Alert';
import SessionOver from '../components/SessionOver';
import CartItem from '../components/CartItem';

import axios, { } from 'axios';
axios.defaults.withCredentials = true;

const Cart = function () {
  const {
    setLoading,
    itemPrices,
    isAuthenticated,
    localCart,
    loadCart
  } = useDashboardContext();
  const { alert } = useAlertContext();
  const cart = useRef(localCart); cart.current = localCart;

  useEffect(() => {
    // need to grab cart and prices in case user decides to refresh /dashboard/cart route
    console.log('cart loaded')
    setLoading(true);
    const controller = new AbortController();
    loadCart(cart.current, controller); // loading set to false on response
    return () => { controller.abort(); }
  },
    // any state being set inside loadCart cannot be in dep array; infinite loop e.g. itemPrices
    [loadCart, setLoading])

  return (
    <section>
      {alert.shown && <Alert />}
      <SessionOver />
      {isAuthenticated && <section>
        {!Object.keys(localCart).length &&
          <section>
            <p>Please go to menu and start addding to cart.</p>
          </section>}
        {/* boolean cast below prevent render 0 */}
        {!!Object.keys(localCart).length &&
          <section className='cart'>
            <div>
              {Object.entries(localCart).map((id_count, index) => {
                let prop = {
                  id: id_count[0],
                  count: id_count[1],
                  cost: itemPrices[id_count[0]]
                };
                return <CartItem key={id_count[0]} {...prop} />;
              })}
            </div>
          </section>}
      </section>}
    </section>
  );
}

export default Cart