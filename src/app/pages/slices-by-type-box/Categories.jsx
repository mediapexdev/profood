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
			<ul class="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-2 fw-bold" role="tablist">
				{
					categories.map((category) =>
						<li
							key={category.id}
							className="nav-item mt-2"
							role="presentation"
							onClick={() => {
								dispatch({ type: chooseCategory.toString(), selectedCategory:category.id});
							}}
						>
							<a class="nav-link text-gray-700 text-active-primary ms-0 me-10 py-5" data-bs-toggle="tab" href="#" aria-selected="false" tabindex="-1" role="tab">
								<span class="nav-text">{category.wording}</span>
							</a>
						</li>
					)
				}
			</ul>
		</div>
	);
};

export default Categories;
