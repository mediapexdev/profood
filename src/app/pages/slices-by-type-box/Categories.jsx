import { useDispatch } from 'react-redux';
import { chooseCategory } from '../../../store';
import CategoryWidget from '../../components/categories/CategoryWidget';


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
			<ul class="nav nav-stretch nav-line-tabs nav-line-tabs-2x rk-nav-tabs border-transparent fs-3 fw-bold fw-medium-on-dark" role="tablist">
				{
					categories.map((category) =>
						<li
							key={category.id}
							className="nav-item mt-2"
							role="presentation"
							onClick={() => {
								dispatch({ type: chooseCategory.toString(), selectedCategory:category.id});
								// console.log('clicked');
							}}
						>
							<a class="nav-link text-gray-700 text-active-primary ms-0 me-10 py-5" data-bs-toggle="tab" href="#" aria-selected="false" tabindex="-1" role="tab">
								<span class="nav-text">{category.wording}</span>
							</a>
						</li>
					)
				}
			</ul>
			{/* <ul className="nav d-flex flex-row flex-nowrap align-items-center justify-content-between mb-6">
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
							<CategoryWidget category={category} />
						</a>
					</li>
				)}
			</ul> */}

			{/* <div className="category-list-widget">
				<div className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 gy-10">
					{
						categories.map((category) => (
							<div
								key={category.id}
								className="col"
								onClick={() => {
									dispatch({ type: chooseCategory.toString(), selectedCategory:category.id});
									// console.log('clicked');
								}}
							>
								<CategoryWidget category={category} />
							</div>
						))
					}
				</div>
        	</div> */}
		</div>
	);
};

export default Categories;
