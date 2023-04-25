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
// import './styles/css/typeBox.css';
import './styles/css/typeBoxWidget.css';
import './styles/css/categoryWidget.css';
import './styles/css/sliceWidget.css';
import './styles/css/index.css';
import './styles/css/slices-by-type-box.css';

import NotFound from "./pages/NotFound";
import CustomerHomePage from "./pages/customer/index";
import SlicesByTypeBox from "./pages/slices-by-type-box/index";
import CategorySlice from "./pages/customer/categorySlice";
import SignupForm from "./pages/customer/signup";
import LoginForm from "./components/signin/LoginForm";

/**
 * 
 * @returns 
 */
const App = () => {
	/**
	 * 
	 */
	return (
    	<>    
			<BrowserRouter>
				<Routes>
				<Route path="/" element={<CustomerHomePage />} />
				<Route path="*" element={<NotFound />} />
				<Route path="/slices/:typeBoxId" element={<SlicesByTypeBox/>} />
				<Route path="/slices/:categories" element={<CategorySlice />} />
				<Route path="/signup" element={<SignupForm />} />
				<Route path="/signin" element={<LoginForm />} />
				</Routes>
			</BrowserRouter>
    	</>
	);
};

export default App;
