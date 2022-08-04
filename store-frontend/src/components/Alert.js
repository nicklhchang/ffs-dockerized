import React, { useEffect } from 'react'
import { useAlertContext } from '../app-context/alertContext';

const Alert = function() {
    const { alert,alertOver } = useAlertContext();

    // useEffect(() => {
    //     let countdown = setTimeout(() => {
    //         alertOver();
    //     },2500);
    //     // cleanup whenever something in dependency array changes,
    //     // then useEffect() sets up new time out
    //     return () => {clearTimeout(countdown);}
    // },[alertOver,alert.shown]);
    
    // return (
    //     <p className='alert alert-danger'>
    //         {alert.msg}
    //     </p>
    // );

    // const { shown,msg,ao } = useAlertContext();

    useEffect(() => {
        let countdown = setTimeout(() => {
            alertOver();
        },3500);
        // cleanup whenever something in dep array changes or component unmounts,
        // then useEffect() sets up new time out
        return () => {clearTimeout(countdown);}
    },[alertOver,alert.shown]);
    
    return (
        <p className='alert alert-danger'>
            {alert.msg}
        </p>
    );
}

export default Alert