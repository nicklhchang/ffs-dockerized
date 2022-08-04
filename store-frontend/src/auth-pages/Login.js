import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardContext } from '../app-context/dashboardContext';
import { useAlertContext } from '../app-context/alertContext';
import Alert from '../components/Alert';
import axios, { CanceledError } from 'axios';
// needed to set cookie in browser, then in dashboard needed to send cookie with axios requests
axios.defaults.withCredentials = true; // always send cookie to backend because passport wants

const Login = function () {
  /*
  story time: if the updating of state happens in useEffect or functions, the state's
  new value only kicks in after the function/useEffect runs. seems to be finnicky thing
  with react, so be careful about setting state and then immediately using that state as 
  a conditional inside useEffect and functions.

  one way to get around late state update is to not use state, just check response.data....
  instead of setIsAuthenticated(response.data....)

  OR useRef to track states in real time and combine this with states from useContext,
  then use reducer functions to dispatch updates to state; works a charm

  useEffect() runs twice intentionally in StrictMode, making two axios requests seems inevitable
  because both times useEffect() runs exactly the same; states do not change between the two renders 
  (cannot alter states to make request first time and no request second time)
  (consistency picks up any bugs during dev). in prod each component only renders once, so this not an issue.
  so in prod won't make two http get requests to check auth status
  */
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { alert, setCustomAlert } = useAlertContext();
  let navigate = useNavigate();

  const {
    // toggleSidebar,
    // clearFilterOptions,
    clearFilter,
    clearLocalCart,
    localCart,
    currentSessionCookie,
    sidebarFilterOptions,
    changesSinceLastUpload
  } = useDashboardContext();
  const lastCookie = useRef(currentSessionCookie);
  lastCookie.current = currentSessionCookie;

  // just being a bit fancy and using useCallback instead of doing axios get request in useEffect
  const fetchAuthStatusLogin = useCallback(function (controller) {
    // on first render of this route, check if already have active cookie, if so redirect straight to dashboard
    // btw, useEffect does not like async await unless run an async function inside useEffect
    if (!(document.cookie === lastCookie.current)) {
      axios.get('http://localhost:8080/api/v1/auth/login-status', { signal: controller.signal })
        .then(function (response) {
          console.log(response.data); // check if the if condition picking up
          const { alreadyAuthenticated } = response.data; // can access user property if needed too
          if (alreadyAuthenticated) {
            // won't kick in until after useEffect has run, but before useEffect finishes navigated to dashboard
            // toggleSidebar('close'); // in case open from last session and user did not refresh (reset whole app state)
            // clearFilterOptions(); // same deal as closing sidebar above
            // navigate to dashboard and pass prop
            navigate('/dashboard',
              // {
              //   // need useLocation in /dashboard then location.state.authenticatedUser
              //   state: {
              //     authenticatedUser: user
              //   }
              // }
            );
          }
        })
        .catch(function (error) {
          if (error instanceof CanceledError) {
            console.log('Aborted: no longer waiting on api req to return result')
          } else {
            console.log('api error, maybe alert user in future')
          }
        });
    } else { navigate('/dashboard'); }
  }, [navigate]);
  // try if (!(document.cookie === currentSessionCookie)) else navigate
  // if unauthenticate() (clears currentSessionCookie) to get here then ok api get req, 
  // if unauthenticate; should be undefined === null; evaluates to false
  // but if just type /auth/login while still authenticated, then prevent api call

  useEffect(() => {
    // when authenticating for a new session, previous session state must be flushed out
    // make sure there is no cslu, so make user save before navigate back to auth
    console.log(localCart, sidebarFilterOptions, changesSinceLastUpload) // from last session
    
    // clear localCart, sidebar filter, sidebar open, etc. in here
    clearLocalCart('reset');
    // what if same user visit login? clear their cart? revisit dashboard repopulates so no problem
    clearFilter();

    const controller = new AbortController();
    fetchAuthStatusLogin(controller);
    return () => { controller.abort(); }
  }, [clearLocalCart, clearFilter, fetchAuthStatusLogin]);

  const submitLoginCredentials = async function (event) {
    event.preventDefault();
    /* https://stackoverflow.com/questions/42803394/cors-credentials-mode-is-include
    https://stackoverflow.com/questions/68793536/why-cant-i-use-a-wildcard-on-access-control-allow-headers-when-allow-credenti
    lowkey going you are trying to authenticate (to some private api), so we won't allow backend access from all (*) origins. 
    browser knows you are trying to authenticate because you set withCredentials to true.
    also need to set "credentials":true in backend code cors({}). so after pre-flight requests, 
    more requests can be made with credentials*/
    try {
      const response = await axios.post('http://localhost:8080/api/v1/auth/login', {
        username: username,
        password: password
      });
      const { loginSuccess, user } = response.data;
      // use res.json loginSuccess property as a conditional to navigate
      // state values only seem to kick in after this function runs
      if (loginSuccess) {
        // navigate to dashboard and somehow pass prop like justLoggedIn:true
        navigate('/dashboard', {
          state: {
            authenticatedUser: user
          }
        });
      } else {
        setCustomAlert(true, 'please use a valid username and correct password');
      }
    } catch (error) {
      console.log(error);
      setCustomAlert(true, 'server error');
    }
    setUsername('');
    setPassword('');
  }

  return (
    <section className='section-center'>
      <form className='login-form' onSubmit={submitLoginCredentials}>
        <h3>login form</h3>
        {alert.shown && <Alert />}
        <div className='form-control'>
          <input
            type='text'
            className='login'
            placeholder='username'
            value={username}
            onChange={(event) => { setUsername(event.target.value); }}
          />
        </div>
        <br />
        <div className='form-control'>
          <input
            type='password'
            className='login'
            placeholder='password'
            value={password}
            onChange={(event) => { setPassword(event.target.value); }}
          />
        </div>
        <br />
        <button type='submit' className='submit-btn'>
          login
        </button>
      </form>
    </section>
  );
}

export default Login;
