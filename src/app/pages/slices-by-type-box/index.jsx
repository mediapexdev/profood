import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import api from "../../../api/api";

import Header from "../customer/layout/Header";
import TypeBox from "./TypeBox";
import Categories from "./Categories";
import SlicesListWidget from "../../components/slices/SlicesListWidget";
import { Controls } from "./Controls";
import { useParams } from "react-router-dom";

/**
 * 
 * @returns 
 */
const SlicesByTypeBox = () => {
	const {typeBoxId}=useParams();
	/**
	 * 
	 */
	const [typeBox, setTypeBox] = useState([]);
	const [categories, setCategories] = useState([]);
	// const selectedTypeBoxId = useSelector(
    // 	(state) => state.slice.selectedBox
  	// );

	/**
	 * 
	 */
	useEffect(() => {
		api.get("get-slices-by-Box/"+typeBoxId).then((res) => {
			setTypeBox(res.data["typeBox"]);
			setCategories(res.data["categories"]);
			console.log(res)
		});
	}, []);
	console.log(typeBox.slices_number);

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
					<section id="sectionSlices" className="section-slices section-boxed container-fluid pt-10 px-0">
						<div className="section-container container-fluid px-0">
							<div className="row">
								{/* <div className="col-12">
									<TypeBoxWidget typeBox={typeBox} />
								</div> */}
								<div className="col-12">
									<div className="heading card mb-5 mb-xl-10">
            							<div className="card-body pt-9 pb-0">
											<TypeBox type_box={typeBox} />
											<Controls selectedBox={typeBox}/>
											<Categories categories={categories} />
										</div>
									</div>
								</div>
								<div className="col-12">
									<SlicesListWidget selectedCategory={selectedCategory} slices_number={typeBox.slices_number}/>
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
