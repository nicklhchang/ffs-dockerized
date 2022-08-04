import React, { } from 'react'
import { FaMinus, FaPlus } from 'react-icons/fa';
import { useDashboardContext } from '../app-context/dashboardContext';

const CartItem = React.memo(function ({ id, count, cost }) {
    const {
        isCartLocked,
        mutateCartCheckLock
    } = useDashboardContext();
    return (
        <article className='cart-item'>
            {/* can just be renamed item-footer in index.css for both menu and cart */}
            <div className='menu-item-footer'>
                <h4>{id}</h4>
                <h4>Cost per item: {cost}</h4>
                <h4>Subtotal: {count * cost}</h4>
                <button className='submit-btn' onClick={() => { mutateCartCheckLock(isCartLocked, 'remove-item', id) }}>
                    Remove item
                </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className='count-btn' onClick={() => { mutateCartCheckLock(isCartLocked, 'add', id) }}>
                    <FaPlus />
                </button>
                <span className='count'>{count}</span>
                <button className='count-btn' onClick={() => { mutateCartCheckLock(isCartLocked, 'remove', id) }}>
                    <FaMinus />
                </button>
            </div>
        </article>
    );
});

export default CartItem