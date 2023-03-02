import React, { useEffect, useState } from "react";

import api from "../../../api/api";

import Header from "./layout/Header";
import MainBannerWidget from "./components/widgets/MainBannerWidget";
import TypeBoxListWidget from "./components/widgets/TypesBoxListWidget";
import CategoryListWidget from "./components/widgets/CategoryListWidget";
// import MainSliderWidget from "./components/widgets/MainSliderWidget";

/**
 * 
 * @returns 
 */
const Index = () => {
	/**
	 * 
	 */
	const [typesBoxList, setTypesBoxList] = useState([]);
	const [categoriesList, setCategoriesList] = useState([]);

	useEffect(() => {
		api.get("/get-typesBox").then((res) => setTypesBoxList(res.data));
		api.get("/get-categories").then((res) => setCategoriesList(res.data));
	}, []);

	/**
	 * 
	 */
	return (
		<>
			<Header />
			<div className="position-relative">
				<div className="shape-img1">
					<svg
						width="1920"
						viewBox="0 0 1857 327"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M4.05078 189.348C86.8841 109.514 348.951 -25.2523 734.551 74.3477C1120.15 173.948 1641.22 91.181 1853.55 37.3477"
							stroke="#EA6A12"
							strokeOpacity="0.3"
						></path>
						<path
							d="M0.99839 152.331C90.9502 80.6133 364.495 -28.9952 739.062 106.31C1113.63 241.616 1640.16 208.056 1856.6 174.363"
							stroke="#EA6A12"
							strokeOpacity="0.3"
						></path>
					</svg>
				</div>
			</div>
			<main>
				<div className="container-fluid">
					{/* begin::Section main banner */}
					<section className="section-banner section-main-banner section-boxed banner main-banner">
						<div className="section-container container-fluid">
							<div className="section-body">
								<MainBannerWidget />
							</div>
						</div>
					</section>
					{/* end::Section main banner */}
					{/* begin::Section types box */}
					<section id="sectionTypesBox" className="section-typesBox section-boxed">
						<div
							className="section-container container-fluid mx-auto"
						>
							<div className="section-body">
								<TypeBoxListWidget typesBoxList={typesBoxList} />
							</div>
						</div>
					</section>
					{/* end::Section types box */}
					{/* begin::Section categories */}
					<section id="sectionCategories" className="section-categories section-boxed">
						<div className="section-container container-fluid">
							<div className="section-heading">
								<h3 className="section-title font-xxl">
									{/* <div className="separator separator-content"> */}
										<span className="title-text">Catégories</span>
									{/* </div> */}
								</h3>
							</div>
							<div className="section-body">
								<CategoryListWidget categoriesList={categoriesList} />
							</div>
						</div>
					</section>
					{/* end::Section categories */}
				</div>
			</main>
			<footer></footer>
		</>
	);
};

export default Index;
