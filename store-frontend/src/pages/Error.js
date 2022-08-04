import React, {} from 'react'
import { Link } from 'react-router-dom';

const Error = function() {
    return (
        <section className='error-page section'>
            <div className='error-container'>
                <h2>this route does not exist</h2>
                <Link to='/' className='btn btn-primary'>
                    go back to home page
                </Link>
            </div>
        </section>
    );
}

export default Error;