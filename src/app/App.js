import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// import './styles/css/style.bundle.css';
// import './assets/plugins/global/plugins.bundle.css';
import './styles/css/utilities.css';
import './styles/css/typography.css';
import './styles/css/animations.css';
import './styles/css/global.css';
import './styles/css/header.css';
import './styles/css/bannerWidget.css';
import './styles/css/typeBox.css';
import './styles/css/typeBoxWidget.css';
import './styles/css/categoryWidget.css';
import './styles/css/index.css';

import CustomerHomePage from "./pages/customer/index";
import Slices from "./pages/customer/slices";
import NotFound from "./pages/NotFound";
import CategorySlice from "./pages/customer/categorySlice";


const App = () => {
  return (
    <>    
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CustomerHomePage />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/slices" element={<Slices />} />
          <Route path="/slices/categories" element={<CategorySlice />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
