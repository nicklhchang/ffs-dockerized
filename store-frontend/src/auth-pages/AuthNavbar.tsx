import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const AuthNavbar = function () {
    return (
        <section>
            <nav>
                <div className='nav-center'>
                    <div className='nav-header'>
                        <h3 className='section'>base for logging in and registering</h3>
                    </div>
                    <div className='links-auth-container'>
                        <section className='links'>
                            <Link to='/auth/login'>go to login</Link>
                            <Link to='/auth/register'>go register</Link>
                        </section>
                    </div>
                </div>
            </nav>
            <Outlet />
        </section>
    );
}

export default AuthNavbar;