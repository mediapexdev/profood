import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../../api/api";
import CategoryWidget from "../../components/CategoryWidget";
import Categories from "../../components/CategoySlice/categories";
import { Elements } from "../../components/CategoySlice/elements";
import SlicesList from "../../components/CategoySlice/slices";


const CategorySlice = () => {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    api.get("get-slices-by-category").then((res) => {
      setCategories(res.data);
    });
   },[]);
  const selectedCategoryId = useSelector(
    (state) => state.slice.selectedCategory
  );
  const selectedCategory = categories.filter(
    (category) => category.id === selectedCategoryId
  );
  return (
    <div className="container-fluid">
      <section id="sectionSlices" className="section-slices section-boxed">
        <div className="section-container container-fluid mx-auto">            
          <div className="row">
            <div className="col-3 position-relative">
              <div className="row"><Categories categories={categories} /></div>
              <div className="row"><Elements/> </div>
            </div>            
            <div className="col-9">
            <div className="row w-100 m-3">
              <CategoryWidget category={selectedCategory} />
            </div>
            <div className="row w-100 ms-0">
              <SlicesList selectedCategory={selectedCategory} />
            </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CategorySlice;
