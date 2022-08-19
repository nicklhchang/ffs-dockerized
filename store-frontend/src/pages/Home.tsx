import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const App = function() {
    return (
        <main>
            <h3>Home for now, go authenticate to use this website</h3>
            <div>
                <Link to='/auth' className='section-center'>go to auth</Link>
            </div>
            <Outlet />
        </main>
    );
}

export default App;