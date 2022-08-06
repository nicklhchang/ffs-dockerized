import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useDashboardContext } from '../app-context/dashboardContext';
import { useAlertContext } from '../app-context/alertContext';
import { FaBars } from 'react-icons/fa'
import axios from 'axios';
axios.defaults.withCredentials = true; // always send cookie to backend because passport wants

/**
 * problem is that location.state does not persist changes between page refreshes, the logic without else delete
 * assumes that location.state persist changes and hence can make more efficient checks with backend
 * but change not persisting means this logic is broken, and must add else delete on top of inefficient checks.
 * no persistence of changes maybe because location.state passed like props to Dashboard
 * 
 * workaround is not pass state like justAuthenticated, and just make backend request every time
 * this route/page is visited, regardless of if you just came from login/register page or not.
 * because in prod useEffect() no longer runs twice, so changing props (state passed) for second render
 * will not hold up. interesting note is that useState values do not change between useEffect renders,
 * but changes to props will reflect in second render for useEffect()
 * 
 * dashboard route has index element of welcome so by default Welcome component checks if still auth or not
 */

const Dashboard = function () {
  const {
    currentUser,
    localCart,
    changesSinceLastUpload,
    isCartLocked,
    lockCart,
    unlockCart,
    uploadLocalCart
  } = useDashboardContext();
  const {
    setCustomAlert
  } = useAlertContext();
  /** useRef powerful when dealing with stale data 
   *  (make it point to the variable, hence track variable's value in real time), 
   *  but if need some state change to trigger re-render don't use
   *  useRef combined with using dispatch from useReducer in context is powerful way 
   *  to update state without triggering re-render (as opposed to useState from same component
   *  and putting state in dep array). also good to keep track of changing/updated state, 
   *  without needing useEffect to finish */
  const cslu = useRef(changesSinceLastUpload); cslu.current = changesSinceLastUpload;
  const cart = useRef(localCart); cart.current = localCart;
  const lock = useRef(isCartLocked); lock.current = isCartLocked;

  // for expanding and closing navbar
  const [showLinks, setShowLinks] = useState(false);
  // note that ref={} in JSX CANNOT be conditionally rendered
  const linksContainerRef = useRef(null);
  const linksRef = useRef(null);
  useEffect(() => {
    console.log('renders dashboard')
    const linksHeight = linksRef.current.getBoundingClientRect().height;
    if (showLinks) {
      linksContainerRef.current.style.height = `${linksHeight}px`;
    } else {
      linksContainerRef.current.style.height = '0px';
    }
  }, [showLinks]);

  useEffect(() => {
    // in other components like Welcome and Menu and Cart do not clear changesSinceLastUpload
    // whenever the user is unauthenticated, it is like log out user but sync their last few changes
    const source = axios.CancelToken.source();
    let regularUpload = setInterval(() => {
      // interval not timeout, runs at interval instead of once when timeout
      // console.log('regular upload', cslu.current, lock.current);
      // look at onMouseLeave to trigger save cart message
      uploadLocalCart(source, cslu.current, cart.current);
    }, 15000);
    return () => {
      // cleans up only when unmounting, this useEffect does not run over and over, 
      // only initial render; empty dep array. no api call cancelled unless leave dashboard
      // while ref in setInterval allows current values to be read at regular intervals
      source.cancel();
      clearInterval(regularUpload);
    }
  },
    // useRef and .current avoid placing states in dep array; prevent re-renders
    // to keep track of changing state (in real time) and updating state, useReducer dispatches
    [uploadLocalCart]);

  useEffect(() => {
    unlockCart();
    const sessionEvent = new EventSource('http://localhost:8080/api/v1/auth/timeout', {
      withCredentials: true
    });
    const source = axios.CancelToken.source();

    // notify users they now unauthenticated, their next action will unauthenticate them on frontend
    // true backend unauthenticated happens 1.5 seconds later, should be enough time for final save to go through
    // but there is that small 1.5 second gap, if user make change to cart, won't sync
    // not a big deal, could implement lockCart() below but then would need to unlockCart() at some other point
    sessionEvent.addEventListener('unauthenticated', (event) => {
      lockCart();
      // data must be in .write() to actually pick up unauthenticated event
      console.log('backend telling frontend to close', event.data)
      // not sure about this, depends if rendering alert even if not authenticated
      setCustomAlert(true, 'session over now, you will need to authenticate again')
      sessionEvent.close();
      // in future, maybe let this event save cart. 1.5 seconds for final save to go through
      uploadLocalCart(source, cslu.current, cart.current);
    });

    // notify users of however much time left is in their session
    sessionEvent.addEventListener("almost-timeout", (event) => {
      console.log(event.data);
      // server side; res.write(`event:session-timeout\ndata:{"time-left":${var}}\n\n`)
      const parsed = JSON.parse(event.data);
      // console.log(parsed, parsed["time-left"])
      setCustomAlert(true, `${parsed["time-left"]} seconds left. No rush :). Just using server-sent events.`)
    });
    
    // oopsies close sse stream on server error
    sessionEvent.addEventListener("error", (event) => {
      console.log(`gracefully handled`, event);
      sessionEvent.close();
    })
    // cleanup when unmounting
    return () => { sessionEvent.close(); source.cancel(); }
  }, [setCustomAlert, uploadLocalCart]);

  return (
    <section>
      <nav>
        <section className='nav-center'>
          {/* {alert.shown && <Alert />} */}
          <div className='nav-header'>
            <h4>{`Dashboard for: ${currentUser ? currentUser.username : 'unauthenticated'}`}</h4>
            <button className='nav-toggle' onClick={() => {
              setShowLinks(
                (showLinks) => { return !showLinks; }
              )
            }}>
              <FaBars />
            </button>
          </div>
          <div className='links-dashboard-container' ref={linksContainerRef}>
            <section className='links' ref={linksRef}>
              {/* Welcome checks whether auth or not upon visiting /dashboard; index element (App.js) */}
              <Link to='/dashboard'>welcome</Link>
              <Link to='/dashboard/menu'>menu</Link>
              <Link to='/dashboard/cart'>cart</Link>
            </section>
          </div>
        </section>
      </nav>
      <Outlet />
    </section>
  );
}

export default Dashboard;