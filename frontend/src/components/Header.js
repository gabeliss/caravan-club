import React from 'react';
import { Link } from "react-router-dom";

function Header() {
  return (
    <header>
       <div>Caravan Club</div>
       <div>
          <Link to="/">
            <button>Home</button>
          </Link>
        </div>
    </header>
  );
}

export default Header;