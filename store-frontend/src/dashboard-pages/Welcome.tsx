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
    loading,
    setLoading,
    isAuthenticated,
    localCart,
    loadCart
  } = useDashboardContext();
  const { alert } = useAlertContext();
  const cart = useRef<{ [key: string]: number }>(localCart); cart.current = localCart;

  useEffect(() => {
    // fetch user cart and prices or bug when going straight to Menu and adding without visiting Cart
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
      {!isAuthenticated && !loading && <SessionOver />}
      {/* {console.log(isAuthenticated)} */}
      {isAuthenticated &&
        <div>
          <p>
            squish the window sideways (horizontally) ;{`)`}. just keep squishing.

            this project uses code splitting (for prod) and memoization as optimizations
          </p>
          <p>
            uses server-sent events (sse) to push notifications about session invalidation.
            websockets a little too heavy duty, would need to upgrade backend from http server to websockets server.
            this demo app does just fine using a client request response architecture with sse.
          </p>
          <p>
            api requests using axios are also cleaned up inside useEffect() to prevent memory leaks.
          </p>
        </div>}
    </section>
  );
}

export default Welcome