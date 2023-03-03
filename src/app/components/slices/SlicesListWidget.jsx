
import SliceWidget from "./SliceWidget";


/**
 * 
 * @param {*} param0 
 * @returns 
 */
const SlicesWidgetList = ({ selectedCategory }) => {
	/**
	 * 
	 */
	if(selectedCategory.length > 0) {
		return (
    		<div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-4 row-cols-xl-4 gx-6 gx-xl-8 gx-xxl-8 gy-10">
      			{selectedCategory[0].b_slices.map((slice) => (
					<div
						key={slice.id}
						className="">
						<SliceWidget slice={slice} />
					</div>
      			))}
    		</div>
  		);
  	}
	else {
		return(
			<div className="pt-50">
				<center>Entrain de charger</center>
			</div>
		);
  	}
};

export default SlicesWidgetList;
