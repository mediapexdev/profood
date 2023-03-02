import { useDispatch } from 'react-redux';
import { chooseCategory } from '../../../store';


/**
 * 
 * @param {*} param0 
 * @returns 
 */
const Categories = ({categories}) => {
	/**
	 * 
	 */
	const dispatch = useDispatch();

	/**
	 * 
	 */
	return (
		<div className='container-fluid position-relative px-0'>
			<ul className="nav d-flex flex-row flex-nowrap align-items-center justify-content-center mb-6">
				{categories.map((category) =>
					<li
						key={category.id}
						className="nav-item"
						onClick={() => {
							dispatch({ type: chooseCategory.toString(), selectedCategory:category.id});
							console.log('clicked');
						}}
					>
						<a
							href='#'
							className="nav-link nav-link-border-solid btn btn-outline btn-flex btn-active-color-primary flex-column flex-stack pt-9 pb-7 page-bg show active"
							data-bs-toggle="pill"
							style={{
								minWidth:'115px'
							}}
						>
							<div className="nav-icon mb-2">
								<img
									src="https://cdn.shopify.com/s/files/1/2530/7762/products/1212-bi-florentine-ribeye-steak-0003-color-adjustment.jpg?v=1571713007"
									className="w-50px"
									alt="category"
								/>
							</div>
							<div className="">
								<span className="text-gray-800 fw-bold fs-2 d-block">{category.wording}</span>
								<span className="text-gray-400 fw-semibold fs-7">8 Options</span>
							</div>
						</a>
					</li>
				)}
			</ul>
		</div>
	);
};

export default Categories;
