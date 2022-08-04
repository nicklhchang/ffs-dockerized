import React, { useRef, useEffect } from 'react'
import { useDashboardContext } from '../app-context/dashboardContext';
import { useAlertContext } from '../app-context/alertContext';
import SessionOver from '../components/SessionOver';

import axios, { } from 'axios';
import Alert from '../components/Alert';
axios.defaults.withCredentials = true; // always send cookie to backend because passport wants

/**
 * index element for /dashboard, so renders whenever visit /dashboard route
 * therefore checking auth status can be done just in here without repeating
 * in both Dashboard and Welcome
 */
const Welcome = function () {
  const {
    setLoading,
    isAuthenticated,
    localCart,
    loadCart
  } = useDashboardContext();
  const { alert } = useAlertContext();
  const cart = useRef(localCart); cart.current = localCart;

  useEffect(() => {
    // fetch user cart and prices or bug when going straight to Menu and adding without visiting Cart
    console.log('cart loaded')
    setLoading(true);
    const controller = new AbortController();
    loadCart(cart.current, controller); // loading set to false on response
    return () => { controller.abort(); }
  },
    [setLoading, loadCart])
  // eslint-disable-next-line react-hooks/exhaustive-deps

  return (
    <section>
      {alert.shown && <Alert />}
      <SessionOver />
      {isAuthenticated &&
        <div>
          <p>fill this with info on how to use the website</p>
          <p>if no menu type is selected for search filter in menu, all menu types are searched</p>
        </div>}
    </section>
  );
}

export default Welcome