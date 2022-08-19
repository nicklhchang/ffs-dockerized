import React, { } from 'react'
import { useDashboardContext } from '../app-context/dashboardContext';

interface menuItemProps {
    key: string | number
    _id: string | number
    name: string | number
    cost: number | string
    classification: string | number
}

const Item = React.memo(function (props: menuItemProps) {
    const { _id, name, cost, classification } = props;
    const {
        currentSessionCookie,
        isCartLocked,
        mutateCartCheckLock
    } = useDashboardContext();
    return (
        <article className='menu-item'>
            <div className='menu-item-footer'>
                <h4>{_id}</h4>
                <h4>{name}</h4>
                <h4>{cost.toString()}</h4>
                <h4>{classification}</h4>
                <button onClick={() => { mutateCartCheckLock(isCartLocked, 'add', _id, currentSessionCookie) }}>
                    Add to cart
                </button>
            </div>
        </article>
    );
});

export default Item