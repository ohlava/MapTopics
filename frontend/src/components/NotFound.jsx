import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="notfound-container">
      <h1>404</h1>
      <p>We couldn't find that page.</p>
      <Link className="notfound-link" to="/">Go back home</Link>
    </div>
  );
};

export default NotFound;
