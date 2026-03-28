import { NavLink } from "react-router-dom";

const NotFound = () => {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>

      <NavLink to="/">
        Go Home
      </NavLink>
    </div>
  );
};

export default NotFound;