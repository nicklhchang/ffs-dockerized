import React, { useState, useContext, useCallback, useReducer } from 'react'
import { authReducer, sidebarReducer, cartReducer } from './dashboardReducer';
import { useAlertContext } from './alertContext';
import { PropsAD } from './interface'

import axios, { CanceledError, CancelTokenSource } from 'axios'
axios.defaults.withCredentials = true; // always send cookie to backend because passport wants

// const DashboardContext = React.createContext({} as any);
// https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/context/
const customCreateContext = function <T extends {} | null>() {
  const dashboardCtx = React.createContext<T | undefined>(undefined);
  const useCtx = function () {
    // do useDashboardContext below in here
    const check = useContext(dashboardCtx)
    if (check === undefined) {
      throw new Error("oopsies looks like the application won't even load properly")
    }
    return dashboardCtx
  }
  return [useCtx, dashboardCtx] as const
}
const [useDC, DashboardContext] = customCreateContext<any>();

const stateAuthUser = {
  isAuthenticated: false,
  currentUser: null,
  currentSessionCookie: null
  // could always document.cookie === currentSessionCookie instead of having isAuthenticated field
}

const stateSidebar = {
  isSidebarOpen: false,
  sidebarFilterOptions: {
    // empty by default; important for useEffect()
    // mealTypes:[],
    // budgetPrice:0
  }
}

const stateCart = {
  // localCart is { property:value } => { item._id:count }
  localCart: {},
  // changesSinceLastUpload is { property:value } => { item._id:count }
  changesSinceLastUpload: {},
  isCartLocked: false
}

const DashboardProvider = function (props: PropsAD) {
  // no useRef's because want re renders whenever these states change
  const [loading, setLoading] = useState(true);
  const [wholeMenu, setWholeMenu] = useState([]);
  const [itemPrices, setItemPrices] = useState({});
  // checkedOptions and maxPrice should be states not reducers because on change must re render
  const [checkedOptions, setCheckedOptions] = useState(
    new Array(6).fill(false) // hard-coded for now
  );
  const [maxPrice, setMaxPrice] = useState(30);

  // wrapped dashboard provider inside alert provider
  const { setCustomAlert } = useAlertContext();

  const [authState, authDispatch] = useReducer(authReducer, stateAuthUser);
  const [sidebarState, sidebarDispatch] = useReducer(sidebarReducer, stateSidebar);
  const [cartState, cartDispatch] = useReducer(cartReducer, stateCart);

  // all the useCallback's prevent infinite loop when placing these functions in dep arr
  // something like a new reference created for function whenever called, so 'change' cause re-render

  // authentication related
  const authenticate = useCallback(function (user: { [key: string]: string}, sessionCookie: string) {
    authDispatch({ type: 'authenticate', payload: { user, sessionCookie } });
  }, [])

  const unauthenticate = useCallback(function () {
    authDispatch({ type: 'unauthenticate', payload: {} });
  }, [])

  // sidebar state
  const toggleSidebar = useCallback(function (action: string) {
    sidebarDispatch({ type: action, payload: {} });
  }, [])

  const setFilterOptions = useCallback(function (arr: Array<string>, budget: number) {
    // console.log(arr) // ES6 shorthand {arr:arr,budget:budget}
    sidebarDispatch({ type: 'filter', payload: { arr, budget } });
  }, [])

  const clearFilterOptions = useCallback(function () {
    sidebarDispatch({ type: 'clear', payload: {} });
  }, [])

  const clearFilter = useCallback(function () {
    clearFilterOptions();
    // visually must change
    setCheckedOptions(new Array(6).fill(false)); // hard-coded for now
    setMaxPrice(30);
    toggleSidebar('close');
  }, [clearFilterOptions, setCheckedOptions, setMaxPrice, toggleSidebar])

  // cart state
  const populateCartInitial = useCallback(function (items: Array<{[key:string]: string | number}>) {
    // items is an array of objects
    cartDispatch({ type: 'initial-populate', payload: { items } });
  }, [])

  const lockCart = useCallback(function () {
    cartDispatch({ type: 'lock-changes', payload: {} })
  }, [])

  const unlockCart = useCallback(function () {
    cartDispatch({ type: 'unlock-changes', payload: {} })
  }, [])

  const clearChangesOnSync = useCallback(function () {
    cartDispatch({ type: 'clear-on-sync', payload: {} })
  }, [])

  const mutateLocalCart = useCallback(function (optionM: string, id: string) {
    cartDispatch({ type: 'mutate-local-cart', payload: { optionM, id } })
  }, [])

  const clearLocalCart = useCallback(function (optionC: string) {
    cartDispatch({ type: 'clear-local-cart', payload: { optionC } })
  }, [])

  const loadCart = useCallback(function (cart: { [key: string]: number }, controller: AbortController) {
    axios.get('http://localhost:8080/api/v1/browse/cart', { signal: controller.signal })
      .then(function (response) {
        console.log(response.data)
        const { alreadyAuthenticated, user, result } = response.data;
        if (alreadyAuthenticated) {
          authenticate(user, document.cookie)
          // if empty localCart or new user need to populate; get request on Welcome and Cart fixes
          if (!Object.keys(cart).length) {
            populateCartInitial(result.cart?.items) // but if they have no cart in database, then nothing (hence .cart?)
          }
          let prices: { [key: string]: number } = {};
          // didn't like
          // type IDCost = { _id:string, cost:number }
          // result.prices.forEach((id_cost: {[key:string]: IDCost[keyof IDCost]}) => {
          // didn't like
          // result.prices.forEach((id_cost: {[key:string]: string | number}) => {
          result.prices.forEach((id_cost: { _id:string, cost:number }) => {
            prices[id_cost._id] = id_cost.cost;
          });
          // console.log(prices)
          setItemPrices(prices);
        } else {
          unauthenticate();
          // display session over
        }
        setLoading(false);
      })
      .catch(function (error) {
        if (error instanceof CanceledError) {
          console.log('Aborted: no longer waiting on api req to return result')
        } else {
          console.log('api error, maybe alert user in future')
          setCustomAlert(true, 'error loading your cart, please retry')
        }
      });
  },
    // setCustomAlert not wrapped in a useCallback
    [authenticate, populateCartInitial, setCustomAlert, unauthenticate])

  const mutateCartCheckLock = useCallback(function (lockStatus: boolean, mutation: string, id: string, cookie: string) {
    if (document.cookie === cookie) {
      lockStatus
        ? setCustomAlert(true, 'please wait a moment for your changes to sync')
        : mutateLocalCart(mutation, id);
    } else {
      unauthenticate();
    }
  }, [unauthenticate, mutateLocalCart, setCustomAlert])

  const uploadLocalCart = useCallback(function (source: CancelTokenSource, cslu: {[key:string]:number}, cart: {[key:string]:number}) {
    const notChanged = Object.values(cslu)
      .every((change) => { return change === 0; });
    /** .every() returns true by default if array empty; empty means notChanged true
     *  all comparisons must be true for .every() to return true; only takes one falsy to ruin it
     *  notChanged easier than changed:
     *  so if did changed (change !== 0) takes one value of 0 (e.g. +1 -1) to set to false (incorrect
     *  because what if other item id's have non-zero value; a change did happen)
     *  if do notChanged (change === 0) takes one non-zero value (e.g. +1) to set to false (correct)
     *  need double negation below as a result */
    console.log(cslu, Object.values(cslu), notChanged)
    if (!notChanged) {
      lockCart();
      axios.post('http://localhost:8080/api/v1/browse/cart/sync', {
        cart: cart
      }, {
        cancelToken: source.token
      }).then(function (response) {
        /** 
         * could be an issue if before promise resolves with response from backend,
         * changesSinceLastUpload is mutated, and hence any new changes to cart 
         * between making post request and receiving response will be cleared in this .then(). 
         * and unless another change is made later, runs risk of front and backend carts not in sync.
         * potential workaround is 'reconcile' local cart to backend upon session over.
         * even then, there will be interval of time when back and frontend carts out of sync
         * this interval of time depends on when next change (after the missed changes) is made.
         * 
         * have thought about locking the changesSinceLastUpload and localCart until sync resolves
         * but using a state for that, new state only kick in after the useEffect runs; never.
         * maybe useReducer will fix ? seems to; dispatch updates state (using useReducer) 
         * by the end of if loop, .then() resolves after if loop runs ?
        */
        const { requestSuccess } = response.data;
        if (requestSuccess) { clearChangesOnSync(); unlockCart(); }
      }).catch(function (error) {
        console.log(error)
        setCustomAlert(true, 'error saving your cart')
        unlockCart();
      });
    }
  }, [lockCart, clearChangesOnSync, unlockCart, setCustomAlert])

  return <DashboardContext.Provider value={{
    loading,
    setLoading,
    itemPrices,
    setItemPrices,
    wholeMenu,
    setWholeMenu,
    checkedOptions,
    setCheckedOptions,
    maxPrice,
    setMaxPrice,
    ...authState,
    authenticate,
    unauthenticate,
    ...sidebarState,
    toggleSidebar,
    setFilterOptions,
    clearFilterOptions,
    clearFilter,
    ...cartState,
    populateCartInitial,
    lockCart,
    unlockCart,
    clearChangesOnSync,
    mutateLocalCart,
    clearLocalCart,
    loadCart,
    mutateCartCheckLock,
    uploadLocalCart
  }}>
    {props.children}
  </DashboardContext.Provider>
}

const useDashboardContext = function () {
  return useContext(DashboardContext);
}

export { 
  useDashboardContext, 
  DashboardProvider, 
  useDC 
}