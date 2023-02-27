import { useDispatch } from 'react-redux';
import { chooseCategory } from '../../../store';


const Categories = ({categories}) => {
    const dispatch = useDispatch()
  return (
    <div className='container-fluid position-relative'>
      <ul className="nav d-flex flex-column align-items-center justify-content-between gap-3 gap-lg-6 mb-6">
      {categories.map((category)=>
       <li className="nav-item mb-3 me-0" key={category.id} onClick={()=>{
        dispatch({ type: chooseCategory.toString(),selectedCategory:category.id});
        console.log('clicked')
      }} >
       <a
        href='#'
         className="nav-link nav-link-border-solid btn btn-outline btn-flex btn-active-color-primary flex-column flex-stack pt-9 pb-7 page-bg show active"
         data-bs-toggle="pill"
         style={{
             width:'138px',
             height:'180px'
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
