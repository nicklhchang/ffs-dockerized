import { Dispatch } from './interface'

interface stateAuth {
    isAuthenticated: boolean,
    currentUser: object | null,
    currentSessionCookie: string | null
}

interface stateSidebar {
    isSidebarOpen: boolean,
    sidebarFilterOptions: object | {}
}

interface stateCart {
    // localCart is { property:value } => { item._id:count }
    localCart: {[key:string]:number},
    // changesSinceLastUpload is { property:value } => { item._id:count }
    changesSinceLastUpload: {[key:string]:number},
    isCartLocked: boolean
}

const authReducer = function (_state: stateAuth, action: Dispatch) {
    switch (action.type) {
        case 'authenticate':
            return {
                isAuthenticated: true,
                currentUser: action.payload.user,
                currentSessionCookie: action.payload.sessionCookie
            }
        case 'unauthenticate':
            return {
                isAuthenticated: false,
                currentUser: null,
                currentSessionCookie: null
            }
        default:
            throw new Error('oopsie no authdispatch matched');

    }
}

const sidebarReducer = function (state: stateSidebar, action: Dispatch) {
    switch (action.type) {
        case 'open':
            return {
                ...state,
                isSidebarOpen: true,
            }
        case 'close':
            return {
                ...state,
                isSidebarOpen: false
            }
        case 'filter':
            // console.log(action.payload)
            return {
                ...state,
                sidebarFilterOptions: {
                    mealTypes: action.payload.arr,
                    budgetPrice: action.payload.budget
                }
            }
        case 'clear':
            return {
                ...state,
                sidebarFilterOptions: {}
            }
        default:
            throw new Error('oopsie no sidebardispatch matched');
    }
}

const cartReducer = function (state: stateCart, action: Dispatch) {
    const { localCart, changesSinceLastUpload } = state
    // below guarantees local cart and state changes kept in sync; do both at same time
    // https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
    // need deep copy or it'll mutate original state, which causes incrementing twice instead of once
    // in react, whenever some state (of variable or function) changes, a re-render or refresh usually happens
    const nextLocalCart = JSON.parse(JSON.stringify(localCart));
    const nextCSLU = JSON.parse(JSON.stringify(changesSinceLastUpload));
    switch (action.type) {
        case 'initial-populate':
            const { items } = action.payload
            // console.log(items) // [{item:string,count:number},...]
            const cart: { [key:string]:number } = {}
            if (items) { // so won't undefined.map if user does not have a cart
                items.forEach((obj:{item:string,count:number}, _index: number) => {
                    // look at cart schema
                    cart[obj.item] = obj.count;
                });
            }
            console.log(cart) // cart = {objectid:number,objectid:number...}
            return {
                ...state,
                localCart: cart
            }
        case 'lock-changes':
            return {
                ...state,
                isCartLocked: true
            }
        case 'unlock-changes':
            return {
                ...state,
                isCartLocked: false
            }
        case 'clear-on-sync':
            return {
                ...state,
                changesSinceLastUpload: {},
                // isCartLocked: false // let unlock-changes take care of
            }
        case 'mutate-local-cart':
            const { optionM, id } = action.payload;
            // console.log('mutates')
            switch (optionM) {
                case 'add':
                    // [] notation because had item._id initially
                    localCart[id] ? nextLocalCart[id] += 1 : nextLocalCart[id] = 1;
                    changesSinceLastUpload[id] ? nextCSLU[id] += 1 : nextCSLU[id] = 1;
                    break;
                case 'remove':
                    // so no empty changesSinceLastUpload
                    changesSinceLastUpload[id] ? nextCSLU[id] -= 1 : nextCSLU[id] = -1;
                    // don't worry about localCart[id] being undefined because of where remove is called
                    // ternary condition check original (not next) because only doing operation once
                    // won't -2 in one go if there was only 1 in original (one operation)
                    localCart[id] > 1 ? nextLocalCart[id] -= 1 : delete nextLocalCart[id];
                    break;
                case 'remove-item':
                    if (nextLocalCart[id]) {
                        delete nextLocalCart[id];
                        nextCSLU[`${id}-removed`] = 1;
                    }
                    break;
                default:
                    throw new Error('oopsie no mutation operation on local cart specified');
            }
            console.log(nextLocalCart)
            return {
                ...state,
                localCart: nextLocalCart,
                changesSinceLastUpload: nextCSLU
            }
        case 'clear-local-cart':
            const { optionC } = action.payload
            // switch (optionC) {
            //     case 'reset':
            //         break;
            //     case 'functionality':
            //         // so dashboard listening to changes picks it up, 1 is true
            //         nextCSLU['cleared-all'] = 1;
            //         break;
            // }
            if (optionC === 'functionality') { nextCSLU['cleared-all'] = 1; }
            return {
                ...state,
                localCart: {},
                changesSinceLastUpload: nextCSLU
            }
        default:
            throw new Error('oopsie no cartdispatch matched');
    }
}

export {
    authReducer,
    sidebarReducer,
    cartReducer
};