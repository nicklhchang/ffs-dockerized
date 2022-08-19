import React, { } from 'react'
import { FaMinus, FaPlus } from 'react-icons/fa';
import { useDashboardContext } from '../app-context/dashboardContext';

interface cartItemProps {
    // because in Cart maps over array which has elements [string, number]
    // Typescript means must do string | number instead of just string
    key: string | number
    id: string | number
    count: string | number
    cost: string | number
}

const CartItem = React.memo(function (props: cartItemProps) {
    const { id, count, cost } = props;
    const {
        currentSessionCookie,
        isCartLocked,
        mutateCartCheckLock
    } = useDashboardContext();
    return (
        <article className='cart-item'>
            {/* can just be renamed item-footer in index.css for both menu and cart */}
            <div className='menu-item-footer'>
                <h4>{id}</h4>
                <h4>Cost per item: {cost}</h4>
                {/* workaround because Typescript enforces string | number on all fields in cartItemProps */}
                {!isNaN(Number(count)) && !isNaN(Number(cost)) &&
                    <h4>Subtotal: {Number(count) * Number(cost)}</h4>}
                <button className='submit-btn' onClick={() => { mutateCartCheckLock(isCartLocked, 'remove-item', id, currentSessionCookie) }}>
                    Remove item
                </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className='count-btn' onClick={() => { mutateCartCheckLock(isCartLocked, 'add', id, currentSessionCookie) }}>
                    <FaPlus />
                </button>
                <span className='count'>{count}</span>
                <button className='count-btn' onClick={() => { mutateCartCheckLock(isCartLocked, 'remove', id, currentSessionCookie) }}>
                    <FaMinus />
                </button>
            </div>
        </article>
    );
});

export default CartItem