import React, { useState, useContext, useCallback, useReducer } from 'react'

const AlertContext = React.createContext();

const stateAlert = {
    shown: false,
    msg: ''
};

const alertReducer = function (state, action) {
    switch (action.type) {
        case 'sca':
            return {
                shown: action.payload.shown,
                msg: action.payload.msg
            }
        case 'ao':
            return {
                shown: false,
                msg: ''
            }
        default:
            throw new Error('oops no match on alertDispatch')
    }
}

const AlertProvider = function ({ children }) {
    const [alert, setAlert] = useState({
        shown: false,
        msg: ''
    });

    const [alertState, alertDispatch] = useReducer(alertReducer, stateAlert);

    const sca = useCallback(function (shown, msg) {
        alertDispatch({ type: 'sca', payload: { shown, msg } });
    }, [])

    const ao = useCallback(function () {
        alertDispatch({ type:'ao' });
    }, [])

    const setCustomAlert = useCallback(function (shown, msg) {
        setAlert({ shown: shown, msg: msg });
        // setAlert({ shown,msg }); // ES6 shorthand
    }, [])

    const alertOver = useCallback(function () {
        setAlert({ shown: false, msg: '' });
    }, [])

    return <AlertContext.Provider
        value={{
            alert,
            setAlert,
            setCustomAlert,
            alertOver,
            ...alertState,
            sca,
            ao
        }}>
        {children}
    </AlertContext.Provider>
}

export const useAlertContext = function () {
    return useContext(AlertContext);
}

export { AlertContext, AlertProvider }