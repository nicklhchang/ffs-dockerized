import { Link } from 'react-router-dom'

const SessionOver = function () {
    // Typescript complains if return inside conditional, so move conditional
    // at least returns something
    // if (!isAuthenticated && !loading) {
    // break out early if not/no longer authenticated 
    return (
        <main>
            <h3>Session over, please authenticate again</h3>
            <Link to='/auth' className='submit-btn'>go authenticate</Link>
        </main>
    );
    // }
}

export default SessionOver