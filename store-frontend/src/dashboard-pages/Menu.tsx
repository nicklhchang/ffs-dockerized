import React, { useState, useEffect, useCallback } from 'react'
import MenuItem from '../components/MenuItem';
import { useDashboardContext } from '../app-context/dashboardContext';
import { useAlertContext } from '../app-context/alertContext';
import Alert from '../components/Alert';
import SessionOver from '../components/SessionOver';
import Loading from '../components/Loading';
import { FaBars } from 'react-icons/fa';

import axios, { AxiosResponse, CanceledError } from 'axios'
import MenuSidebar from './MenuSidebar';
axios.defaults.withCredentials = true; // always send cookie to backend because passport wants

/**
 * if visit /dashboard/menu from non-/dasboard/... route renders both Dashboard and Menu
 */
const Menu = function () {
    const axiosReqLink = 'http://localhost:8080/api/v1/browse/menu';
    const [pageLessOne, setPageLessOne] = useState(0);
    // often times come up to useState to set desired types
    const [menuPage, setMenuPage] = useState<Array<{ [key: string]: (string | number) }>>([]);
    const [emptyMenu, setEmptyMenu] = useState(false);
    // constantly changing but need re-renders for new part of menu when switch pages
    // const pageLessOne = useRef(0);
    // const menuPage = useRef([]);
    const {
        loading,
        setLoading,
        wholeMenu,
        setWholeMenu,
        isAuthenticated,
        currentSessionCookie,
        authenticate,
        unauthenticate,
        isSidebarOpen,
        sidebarFilterOptions,
        toggleSidebar
    } = useDashboardContext();
    const { alert, setCustomAlert } = useAlertContext();
    // const sidebarOpen = useRef(isSidebarOpen); sidebarOpen.current = isSidebarOpen;
    // ^ context and useReducer helps to fix if don't want whole page re-render

    const logOutUser = useCallback(function () {
        unauthenticate();
        // causing problems if combine two useEffects, workaround is clearing on Dashboard index; Welcome
        // clearFilterOptions();
        setWholeMenu([]);
        // probably don't need to set to empty array because next render of this route will 
        setMenuPage([]);
        // ok without because loads next user's cart on Dashboard index; Welcome
        // clearLocalCart();
        // menuPage.current = [];
    }, [setWholeMenu, unauthenticate]) // setMenuPage from this component

    const bucket = function (arr: Array<{ [key: string]: (string | number) }>) { // for setMenuPage(paginated[num])
        const itemsPerBucket = 5;
        const numBuckets = Math.ceil(arr.length / itemsPerBucket);
        const bucketedArr = Array.from({ length: numBuckets }, (_, i) => {
            const indexArr = i * itemsPerBucket;
            return arr.slice(indexArr, indexArr + itemsPerBucket);
        });
        return bucketedArr
    }

    const handleAxiosGetThen = useCallback(function (response: AxiosResponse) { // get on this later
        console.log(response.data);
        const { alreadyAuthenticated, user, result } = response.data;
        if (alreadyAuthenticated) {
            authenticate(user, document.cookie);
            if (result.length) {
                console.log('authenticated and not empty menu')
                // stores menu as 2d array
                const paginated = bucket(result);
                setWholeMenu(paginated);
                // use paginated instead of wholeMenu because state update kicks in after useEffect
                // by default start at page zero to prevent bug if on page e.g. 3 but only load 2 pages
                setMenuPage(paginated[0]);
                // menuPage.current = paginated[0];
                setEmptyMenu(false); // in case set to true before
            } else {
                setWholeMenu([]);
                setMenuPage([]);
                setEmptyMenu(true);
            }
        } else {
            // must set all states because visiting this route, on first render its first job
            // is to check whether or not still authenticated.
            logOutUser();
        }
    }, [authenticate, logOutUser, setWholeMenu])

    useEffect(() => {
        /**
         * really should do this, writes less code but most importantly because 
         * if separate initial and whenever sidebarFilterOptions changes,
         * the two useEffect's both run initially.
         * and the order in which promises resolve (two axios get's) is random.
         * therefore the menu could be set differently.
         * 
         * however, this creates inifinite loop if logging out user and 
         * clearing filter options on logout. but if filter options isn't cleared on logout,
         * it will need to be cleared when user logs in again.
         */
        console.log(sidebarFilterOptions)
        setLoading(true);
        toggleSidebar('close');
        const controller = new AbortController();
        // set to default; must have or breaks if on page 3 and filter returns 2 pages
        setPageLessOne(0);
        // pageLessOne.current = 0;
        let getReqStr = axiosReqLink;
        if (Object.keys(sidebarFilterOptions).length) {
            // axios str construction
            const { mealTypes, budgetPrice } = sidebarFilterOptions
            console.log(mealTypes, budgetPrice)
            if (mealTypes && budgetPrice) {
                getReqStr += `?price=${budgetPrice}`;
                if (mealTypes.length) {
                    const mealsStr = mealTypes.join()
                    getReqStr += ('&types=' + mealsStr);
                }
            }
        }
        axios.get(getReqStr, { signal: controller.signal })
            .then(function (response) {
                console.log('being handled custom menu')
                handleAxiosGetThen(response);
                // clearing filter options bad idea, because even if prevent infinite loop
                // clearing is changing so this useEffect runs again and grabs whole menu
                // // must have; prevent infinite loop on logout and when server responds with filtered menu
                // if (Object.keys(sidebarFilterOptions).length) {
                //     clearFilterOptions();
                // }
                setLoading(false);
            })
            .catch(function (error) {
                // console.log(error) // because Axios becomes CanceledError not AbortError (fetch api)
                if (error instanceof CanceledError) {
                    // note: second render will run cleanup function 
                    // (clean up from first render before running useEffect again),
                    // and hence second render (second request) is aborted and logs this to console
                    // cleanup function also run when component unmounted e.g switch from menu to welcome
                    console.log('Aborted: no longer waiting on api req to return result')
                } else {
                    console.log('api error, maybe alert user in future')
                    setCustomAlert(true, 'failed to get menu, please retry')
                }
            });
        return () => {
            /**
             * cancels request before component unmounts (unmounts; no longer need result of api fetch.
             * no need to run useEffect() anymore, so need to 'cancel' the request before response received
             * and .then() taken. else if api sends result, the not needed result leads to 'memory leak'.)
             * React throws hissy fit when this happens, so need this cleanup return function.
             * cleanup aborts the api request so no results come back and hang there to piss off React.
             * needed if user switch too quickly between menu and e.g. welcome; faster than time taken to receive response
            */
            setLoading(false);
            controller.abort();
        }
    },
        [sidebarFilterOptions, // runs whenever sidebarFilterOptions changes
            handleAxiosGetThen,
            setCustomAlert,
            setLoading,
            toggleSidebar
        ])

    const calcWholeMenu = function () {
        // reduce does not work because pass previous element to next (which is an array, not number)
        // number is needed because Array.prototype.length returns a number
        let sum = 0;
        wholeMenu.forEach((arr: Array<{ [key: string]: (string | number) }>, _index: number) => {
            sum += arr.length;
        });
        return sum;
    }

    interface paginateInputTypes {
        type: string
        pageNum: number | null
    }

    const handlePaginateButtons = function (params: paginateInputTypes) {
        const { type, pageNum } = params;
        // console.log(currentSessionCookie,document.cookie)
        // document.cookie is not an array because only one cookie for now
        // if array grab using document.cookie['connect.sid']
        if (document.cookie === currentSessionCookie) {
            switch (type) {
                case 'prev':
                    setPageLessOne((pageLessOne) => { return (pageLessOne - 1); });
                    // pageLessOne state kicks in after function runs, so it'll be updated
                    // next time prev/next/goToPage is called
                    // need to use old pageLessOne below
                    setMenuPage(wholeMenu[pageLessOne - 1]);
                    break;
                case 'next':
                    setPageLessOne((pageLessOne) => { return (pageLessOne + 1); });
                    setMenuPage(wholeMenu[pageLessOne + 1]);
                    break;
                case 'custom':
                    if (!isNaN(Number(pageNum))) {
                        setPageLessOne(Number(pageNum));
                        setMenuPage(wholeMenu[Number(pageNum)]);
                    }
                    break;
                default:
                    throw new Error('no type matched');
            }
        } else {
            logOutUser();
        }
    }

    return (
        <section>
            {alert.shown && <Alert />}
            {!isAuthenticated && !loading && <SessionOver />}
            {!!loading && <Loading />}
            {!!isAuthenticated && !loading && <section>
                {isSidebarOpen && <MenuSidebar />}
                {!isSidebarOpen &&
                    <button className='sidebar-toggle' onClick={() => { toggleSidebar('open') }}>
                        <FaBars />
                    </button>}
                {!emptyMenu && <section>
                    <h2 className='section-title'>menu items</h2>
                    <h3>{`Total: ${calcWholeMenu()}`}</h3>
                    <div className='menu-center'>
                        {/* do not ever use array index as key */}
                        {menuPage.map((item) => {
                            // necessary for Typescript
                            let prop = {
                                _id: item._id,
                                name: item.name,
                                cost: item.cost,
                                classification: item.classification
                            }
                            return (
                                <MenuItem key={item._id} {...prop} />
                            );
                        })}
                    </div>
                    {wholeMenu.length && <div className='btn-container'>
                        {(pageLessOne > 0) &&
                            <button
                                className='prev-btn'
                                onClick={() => { handlePaginateButtons({ type: 'prev', pageNum: null }) }}>
                                prev
                            </button>}
                        {wholeMenu.map((arr: Array<{ [key: string]: (string | number) }>, menuIndex: number) => {
                            // in paginating with 2d array, using array index as key no problem; order no matter
                            return (
                                <button className={(menuIndex === pageLessOne) ? 'active-btn' : ''}
                                    key={arr[0]._id}
                                    onClick={() => { handlePaginateButtons({ type: 'custom', pageNum: menuIndex }) }}>
                                    {menuIndex + 1}
                                </button>
                            );
                        })}
                        {(pageLessOne < wholeMenu.length - 1) &&
                            <button
                                className='next-btn'
                                onClick={() => { handlePaginateButtons({ type: 'next', pageNum: null }) }}>
                                next
                            </button>}
                    </div>}
                </section>}
                {!!emptyMenu && <section>
                    <p>Oops, no menu items match your filter options</p>
                </section>}
            </section>}
        </section>
    );
}

export default Menu