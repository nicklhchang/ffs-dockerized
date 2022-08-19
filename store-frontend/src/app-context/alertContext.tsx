import React, { useState, useContext, useCallback, useReducer } from 'react'
import { PropsAD, Dispatch } from './interface'

interface AlertState {
    shown: boolean
    msg: string
    numAlerts: number
}

// const AlertContext = React.createContext({} as any);
/**
 * seems as if in React.createContext(defaultValue), the defaultValue is used
 * when there is no AlertContext.Provider value={...}
 * so ideally need to define type of value={...} (should be {[key:string]:any}) 
 * and pass that into below,
 * but always a value={...} so never uses null (the default) anyways
 * https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/context/
 */
const customCreateContext = function <T extends {} | null>() {
    const alertCtx = React.createContext<T | undefined>(undefined);
    // do useAlertContext() below in here
    const useCtx = function () {
        const context = useContext(alertCtx);
        if (context === undefined) {
            throw new Error("oopsies looks like the application won't even load properly");
        }
        return context;
    }
    return [useCtx, alertCtx] as const
}
const [useAC, AlertContext] = customCreateContext<any>();

const stateAlert = {
    shown: false,
    msg: '',
    numAlerts: 0
};

const alertReducer = function (state: AlertState, action: Dispatch) {
    switch (action.type) {
        case 'sca':
            return {
                shown: action.payload.shown,
                msg: action.payload.msg,
                numAlerts: 0
            }
        case 'ao':
            return {
                ...state,
                shown: false,
                msg: ''
            }
        default:
            throw new Error('oops no match on alertDispatch')
    }
}

const AlertProvider = function (props: PropsAD) {
    const [alertState, alertDispatch] = useReducer(alertReducer, stateAlert);
    const [alert, setAlert] = useState({
        shown: false,
        msg: '',
        numAlerts: 0
    });

    const sca = useCallback(function (shown: boolean, msg: string) {
        alertDispatch({ type: 'sca', payload: { shown, msg } });
    }, [])

    const ao = useCallback(function () {
        alertDispatch({ type: 'ao', payload: {} });
    }, [])

    const setCustomAlert = useCallback(function (shown: boolean, msg: string) {
        setAlert((alert) => {
            let newNumAlerts = alert.numAlerts + 1
            console.log(newNumAlerts)
            return { shown: shown, msg: msg, numAlerts: newNumAlerts }
        });
        // setAlert({ shown,msg }); // ES6 shorthand
    }, [])

    const alertOver = useCallback(function () {
        setAlert((alert) => {
            return { shown: false, msg: '', numAlerts: alert.numAlerts }
        });
    }, [])

    return <AlertContext.Provider
        value={
            {
                alert,
                setAlert,
                setCustomAlert,
                alertOver,
                ...alertState,
                sca,
                ao
            }}>
        {props.children}
    </AlertContext.Provider>
}

const useAlertContext = function () {
    return useContext(AlertContext);
}

export { 
    AlertContext, 
    AlertProvider, 
    useAlertContext, 
    useAC 
}