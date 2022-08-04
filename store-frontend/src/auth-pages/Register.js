import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAlertContext } from '../app-context/alertContext';
import Alert from '../components/Alert';
import { useDashboardContext } from '../app-context/dashboardContext';
// needed to set cookie in browser, then in dashboard needed to send cookie with axios requests
axios.defaults.withCredentials = true; // always send cookie to backend because passport wants

const Login = function () {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pwdVerify, setPwdVerify] = useState('');
  const [email, setEmail] = useState('');

  const {
    clearLocalCart,
    // toggleSidebar,
    clearFilter
  } = useDashboardContext();
  const { alert, setCustomAlert } = useAlertContext();
  let navigate = useNavigate();

  useEffect(() => {
    clearLocalCart('reset');
    // what if same user visit? clear their cart? revisit dashboard repopulates so no problem
    clearFilter();
  }, [clearLocalCart, clearFilter])

  const submitRegisterCredentials = async function (event) {
    event.preventDefault();
    if (pwdVerify !== password) {
      setCustomAlert(true, 'passwords don\'t match');
    } else {
      // https://stackoverflow.com/questions/42803394/cors-credentials-mode-is-include
      // https://stackoverflow.com/questions/68793536/why-cant-i-use-a-wildcard-on-access-control-allow-headers-when-allow-credenti
      // lowkey going you are trying to authenticate to private api, so we won't allow access from all (*) origins. 
      // browser knows you are trying to authenticate because you set withCredentials to true.
      // also need to set "credentials":true in backend code cors({}). so allows requests after pre-flight requests
      // to be made with credentials
      try {
        const response = await axios.post('http://localhost:8080/api/v1/auth/register', {
          username: username,
          email: email,
          password: password
        });
        // console.log(response);
        const { requestSuccess } = response.data;
        if (!requestSuccess) {
          setCustomAlert(true, 'server error');
        } else {
          // these properties only exist if requestSuccess
          const { loginSuccess, user } = response.data;
          if (loginSuccess) {
            navigate('/dashboard',
              // {
              //   // need useLocation in /dashboard so location.state.authenticatedUser
              //   state: {
              //     authenticatedUser: user
              //   }
              // }
            );
          } else if (user === 'duplicate') {
            setCustomAlert(true, 'use email and username which have not been taken');
          }
        }
      } catch (error) {
        console.log(error);
        setCustomAlert(true, 'server error');
      }
      setUsername('');
      setEmail('');
      setPassword('');
      setPwdVerify('');
    }
  }

  return (
    <section className='section-center'>
      <form className='login-form' onSubmit={submitRegisterCredentials}>
        <h3>register form</h3>
        <h4>*please do not re-use another one of your passwords for this</h4>
        {/* any form of alert like unauthenticated please authenticate again will show */}
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
            type='text'
            className='login'
            placeholder='email'
            value={email}
            onChange={(event) => { setEmail(event.target.value); }}
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
        <div className='form-control'>
          <input
            type='password'
            className='login'
            placeholder='confirm password'
            value={pwdVerify}
            onChange={(event) => { setPwdVerify(event.target.value); }}
          />
        </div>
        <br />
        <button type='submit' className='submit-btn'>
          register
        </button>
      </form>
    </section>
  );
}

export default Login;
