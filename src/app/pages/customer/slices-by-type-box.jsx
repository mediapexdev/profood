import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import api from "../../../api/api";

import Header from "./layout/Header";
import TypeBoxWidget from "../../components/TypeBoxWidget";
import Categories from "../../components/categories/Categories";
import SlicesListWidget from "../../components/slices/SlicesListWidget";
import { Elements } from "../../components/slices/elements";

/**
 * 
 * @returns 
 */
const SlicesByTypeBox = () => {
	/**
	 * 
	 */
	const [typeBox, setTypeBox] = useState([]);
	const [categories, setCategories] = useState([]);

	/**
	 * 
	 */
	useEffect(() => {
		api.get("get-slices-by-Box/1").then((res) => {
			setTypeBox(res.data["typeBox"]);
			setCategories(res.data["categories"]);
		});
	}, []);

	/**
	 * 
	 */
	const selectedCategoryId = useSelector(
    	(state) => state.slice.selectedCategory
  	);

	/**
	 * 
	 */
  	const selectedCategory = categories.filter(
    	(category) => category.id === selectedCategoryId
  	);
  	// console.log(selectedCategory);

	/**
	 * 
	 */
	return (
		<>
			<Header />
			<main>
				<div className="container-fluid">
					<section id="sectionSlices" className="section-slices section-boxed container-fluid px-0">
						<div className="section-container container-fluid px-0">
							<div className="row">
								<div className="col-12">
									<TypeBoxWidget typeBox={typeBox} />
								</div>
								<div className="col-12">
									<div className="row align-items-center justify-content-between">
										<div className="col">
											<Categories categories={categories} />
										</div>
										<div className="col">
											<Elements />
										</div>
									</div>
								</div>
								{/* <div className="col-12">
									<Elements />
								</div> */}
								<div className="col-12">
									<SlicesListWidget selectedCategory={selectedCategory} />
								</div>
							</div>
						</div>
					</section>
				</div>
			</main>
		</>
  	);
};

export default SlicesByTypeBox;
